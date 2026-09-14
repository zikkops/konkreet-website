import ImageKit from "@imagekit/nodejs";
import { imagekitFilePath } from "../lib/imageUrl";
import { imagekitConfig } from "./env";

// Plain Node only: the setup script imports this file, so nothing here may
// depend on Next.js. Upload signing lives in imagekitAuth.ts for that reason.

/** Every photo the site uploads lands in this ImageKit folder. */
export const UPLOAD_FOLDER = "/konkreet";

const PAGE_SIZE = 100;

type UploadFile = Parameters<InstanceType<typeof ImageKit>["files"]["upload"]>[0]["file"];

let client: InstanceType<typeof ImageKit> | null = null;

function api() {
  const { privateKey } = imagekitConfig();
  client ??= new ImageKit({ privateKey });
  return client;
}

/** Server-side upload, used by the setup script. */
export async function uploadImage(file: UploadFile, fileName: string): Promise<string> {
  const response = await api().files.upload({
    file,
    fileName,
    folder: UPLOAD_FOLDER,
    // Re-running setup replaces the same photo instead of piling up copies.
    useUniqueFileName: false,
    overwriteFile: true,
  });
  if (!response.url) throw new Error(`ImageKit didn't return a URL for ${fileName}.`);
  return response.url;
}

/**
 * ImageKit's own id for each of `paths`, found by walking the folder.
 *
 * Its search API is the obvious way to do this, but it rejects `filePath` and
 * returns nothing at all for `name = "…"`, so listing is what actually works.
 */
async function fileIdsFor(paths: Set<string>) {
  const ids = new Map<string, string>();

  for (let skip = 0; ids.size < paths.size; skip += PAGE_SIZE) {
    const batch = await api().assets.list({
      path: UPLOAD_FOLDER,
      type: "file",
      limit: PAGE_SIZE,
      skip,
    });
    for (const file of batch) {
      if (!("filePath" in file) || !file.fileId) continue;
      const path = String(file.filePath);
      if (paths.has(path)) ids.set(path, String(file.fileId));
    }
    if (batch.length < PAGE_SIZE) break;
  }

  return ids;
}

/** Deletes photos from ImageKit. Best effort: a failure leaves an unused file behind, nothing worse. */
export async function deleteImages(urls: string[]) {
  const paths = new Set(
    urls.map(imagekitFilePath).filter((path): path is string => path !== null),
  );
  if (paths.size === 0) return;

  try {
    const ids = await fileIdsFor(paths);
    await Promise.all(
      [...ids].map(async ([path, fileId]) => {
        try {
          await api().files.delete(fileId);
        } catch (error) {
          console.error(`ImageKit couldn't delete ${path}:`, error);
        }
      }),
    );

    const missing = [...paths].filter((path) => !ids.has(path));
    if (missing.length > 0) console.error("Not found on ImageKit, left alone:", missing.join(", "));
  } catch (error) {
    console.error("Couldn't reach ImageKit to delete unused photos:", error);
  }
}
