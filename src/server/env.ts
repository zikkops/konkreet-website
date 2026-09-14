// Only server code reads these. None are NEXT_PUBLIC_, so they never reach the
// browser on their own; the public key is handed out deliberately, per upload.

export const databaseUrl = process.env.DATABASE_URL ?? "";

/** False until DATABASE_URL is set; the site then renders src/data/content.ts. */
export const isDatabaseConfigured = databaseUrl !== "";

export function imagekitConfig() {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error(
      "ImageKit isn't configured: set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT.",
    );
  }
  return { publicKey, privateKey, urlEndpoint };
}
