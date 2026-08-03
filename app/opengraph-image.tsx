import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site"

/**
 * Dynamic 1200x630 Open Graph image, applied site-wide via the file convention.
 *
 * We compose the branded square artwork onto a landscape canvas at the exact
 * 1.91:1 ratio that Facebook, X, iMessage, and Google expect, so we get a
 * correctly-sized share image without adding an image-processing dependency.
 */
export const runtime = "nodejs"
export const alt = `${SITE_NAME} - ${SITE_TAGLINE}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage() {
  const artwork = await readFile(join(process.cwd(), "public/images/og-image.png"))
  const src = `data:image/png;base64,${artwork.toString("base64")}`

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#18181b",
      }}
    >
      {/* Square art scaled to the canvas height; dark matte fills the sides. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} width={630} height={630} alt="" style={{ objectFit: "cover" }} />
    </div>,
    { ...size },
  )
}
