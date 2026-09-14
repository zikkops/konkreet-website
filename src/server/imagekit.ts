import ImageKit from "@imagekit/nodejs";
import { imagekitFilePath } from "../lib/imageUrl";
import { imagekitConfig } from "./env";

// Plain Node only: the setup script imports this file, so nothing here may
// depend on Next.js. Upload signing lives in imagekitAuth.ts for that reason.

/** Every photo the site uploads lands in this ImageKit folder. */
export const UPLOAD_FOLDER = "/konkreet";

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

/** Deletes photos from ImageKit. Best effort: a failure leaves an unused file behind, nothing worse. */
export async function deleteImages(urls: string[]) {
  const paths = urls
    .map(imagekitFilePath)
    .filter((path): path is string => path !== null && !path.includes('"'));
  if (paths.length === 0) return;

  await Promise.all(
    paths.map(async (filePath) => {
      try {
        // The database stores URLs, so look each file up by its path to get ImageKit's own id.
        const [match] = await api().assets.list({
          searchQuery: `filePath = "${filePath}"`,
          limit: 1,
        });
        const fileId = match && "fileId" in match ? match.fileId : undefined;
        if (fileId) await api().files.delete(fileId);
      } catch (error) {
        console.error(`ImageKit couldn't delete ${filePath}:`, error);
      }
    }),
  );
}
