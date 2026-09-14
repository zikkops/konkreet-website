import { upload } from "@imagekit/next";
import { getUploadSignature } from "../actions";

/** Uploads one photo from the browser straight to ImageKit and returns its URL. */
export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} isn't an image.`);

  // One-time credentials from our server; the private key never leaves it.
  const auth = await getUploadSignature();
  const response = await upload({
    file,
    fileName: file.name,
    folder: auth.folder,
    publicKey: auth.publicKey,
    token: auth.token,
    expire: auth.expire,
    signature: auth.signature,
    useUniqueFileName: true,
  });

  if (!response.url) throw new Error(`ImageKit didn't return a URL for ${file.name}.`);
  return response.url;
}
