"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";
import { imagekitSized, isImageKitUrl } from "@/lib/imageUrl";

// ImageKit resizes and re-encodes on the fly, so its photos skip the Next.js
// optimizer (and the host's image quota) and are requested from ImageKit at
// the width next/image picked.
const imagekitLoader: ImageLoader = ({ src, width, quality }) => imagekitSized(src, width, quality);

/** next/image that sends ImageKit-hosted photos through ImageKit's CDN. */
export function CmsImage({ alt, ...props }: ImageProps) {
  const fromImageKit = typeof props.src === "string" && isImageKitUrl(props.src);

  return <Image alt={alt} {...props} loader={fromImageKit ? imagekitLoader : undefined} />;
}
