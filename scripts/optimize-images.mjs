// One-off image optimizer: resizes + recompresses oversized source assets in place.
// Keeps the same filenames/formats so no code references need to change.
// Run with: node scripts/optimize-images.mjs
import sharp from "sharp"
import { readFile, writeFile, stat } from "node:fs/promises"
import { join } from "node:path"

const IMAGES_DIR = join(process.cwd(), "public", "images")

// maxWidth is the largest width the asset is ever displayed at (with some retina headroom).
const TARGETS = [
  // Hero + full-width banners
  { file: "brewery-exterior-sunset.jpg", maxWidth: 1920 },
  { file: "brewery-bg-new.jpg", maxWidth: 1920 },
  { file: "big-game-promo-bg.jpg", maxWidth: 1600 },
  { file: "available-cans.png", maxWidth: 1600 },

  // Event promo carousel (displayed at 960x540)
  { file: "promo-wing-tuesday.png", maxWidth: 1200 },
  { file: "promo-burger-bingo.png", maxWidth: 1200 },
  { file: "promo-trivia-thursday.png", maxWidth: 1200 },
  { file: "promo-live-music-adam.png", maxWidth: 1200 },
  { file: "promo-groove-ksq.png", maxWidth: 1200 },
  { file: "promo-bonfire-acoustic.png", maxWidth: 1200 },
  { file: "promo-sinatra-brunch.png", maxWidth: 1200 },

  // Product can shots (displayed at ~100px)
  { file: "can-counting-sheep.png", maxWidth: 500 },
  { file: "can-goat-lager.png", maxWidth: 500 },
  { file: "can-headbutt.png", maxWidth: 500 },
  { file: "can-la-cabra-loca.png", maxWidth: 500 },

  // Misc photos
  { file: "sam-mousley.png", maxWidth: 480 },
  { file: "og-image.png", maxWidth: 1200 },

  // Logos / marks (keep more colors so text/edges stay crisp)
  { file: "full-logo.png", maxWidth: 600, logo: true },
]

const fmtKB = (b) => `${(b / 1024).toFixed(0)} KB`

async function run() {
  let totalBefore = 0
  let totalAfter = 0

  for (const { file, maxWidth, logo } of TARGETS) {
    const path = join(IMAGES_DIR, file)
    let input
    try {
      input = await readFile(path)
    } catch {
      console.log(`[skip] ${file} (not found)`)
      continue
    }

    const beforeSize = (await stat(path)).size
    const image = sharp(input)
    const meta = await image.metadata()
    const hasAlpha = meta.hasAlpha
    const ext = file.split(".").pop().toLowerCase()

    let pipeline = sharp(input).rotate()
    if (meta.width && meta.width > maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true })
    }

    let output
    if (ext === "jpg" || ext === "jpeg") {
      output = await pipeline.jpeg({ quality: 80, mozjpeg: true }).toBuffer()
    } else {
      // PNGs (transparent cans/logos and opaque banners): keep real PNG format,
      // quantize to a palette for big savings while preserving any alpha.
      output = await pipeline
        .png({ compressionLevel: 9, palette: true, quality: logo ? 90 : 82, effort: 8 })
        .toBuffer()
    }

    // Only write if we actually saved bytes.
    if (output.length < beforeSize) {
      await writeFile(path, output)
    }
    const afterSize = (await stat(path)).size

    totalBefore += beforeSize
    totalAfter += afterSize
    console.log(
      `${file.padEnd(28)} ${fmtKB(beforeSize).padStart(9)} -> ${fmtKB(afterSize).padStart(9)}  (${Math.round(
        (1 - afterSize / beforeSize) * 100,
      )}% smaller)`,
    )
  }

  console.log("-".repeat(60))
  console.log(`TOTAL ${fmtKB(totalBefore)} -> ${fmtKB(totalAfter)} (${Math.round((1 - totalAfter / totalBefore) * 100)}% smaller)`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
