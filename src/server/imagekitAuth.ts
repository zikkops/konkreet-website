import { getUploadAuthParams } from "@imagekit/next/server";
import { imagekitConfig } from "./env";
import { UPLOAD_FOLDER } from "./imagekit";

// Kept apart from imagekit.ts because @imagekit/next only resolves inside
// Next.js, while imagekit.ts is also imported by the plain Node scripts.

/**
 * One-time credentials that let the browser upload a photo straight to
 * ImageKit, so big files never pass through our own server. The private key
 * stays here; only this short-lived signature is handed out.
 */
export function uploadSignature() {
  const { publicKey, privateKey } = imagekitConfig();
  const { token, expire, signature } = getUploadAuthParams({ publicKey, privateKey });
  return { publicKey, folder: UPLOAD_FOLDER, token, expire, signature };
}
