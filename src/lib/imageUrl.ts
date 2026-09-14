// Shared by the site, the admin panel and the server: no secrets here.

const IMAGEKIT_URL = /^https:\/\/ik\.imagekit\.io\/[^/]+\//;

export const isImageKitUrl = (src: string) => IMAGEKIT_URL.test(src);

/**
 * Asks ImageKit for the photo at `width`, in the best format the browser
 * accepts. Built by hand rather than with URLSearchParams, which would
 * percent-encode the commas ImageKit expects between the parameters.
 */
export function imagekitSized(src: string, width: number, quality?: number) {
  const [base] = src.split("?");
  // c-at_max keeps the photo's proportions and never enlarges it past its original size.
  return `${base}?tr=w-${width},c-at_max,q-${quality ?? "auto"},f-auto`;
}

/** "https://ik.imagekit.io/<account>/konkreet/photo.jpg" → "/konkreet/photo.jpg" */
export function imagekitFilePath(src: string): string | null {
  if (!isImageKitUrl(src)) return null;
  // The pathname is /<account>/<folder>/<file>; the file path drops the account.
  const path = new URL(src).pathname.replace(/^\/[^/]+/, "");
  return path.length > 1 ? decodeURIComponent(path) : null;
}
