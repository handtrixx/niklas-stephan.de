import { mkdirSync, readdirSync, existsSync, rmSync } from "fs";
import { join, extname, basename } from "path";
import * as logger from "./logger.mjs";
import sharp from "sharp";

const ATTACHMENTS_DIR = "/json/attachments";
const HUGO_IMAGES_DIR = "/hugo/static/images";

const force = process.argv.includes("--force");

const RASTER_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);
const SKIP_EXTS = new Set([".pdf", ".bin"]);

if (force) {
  logger.message(`--force flag detected, clearing ${HUGO_IMAGES_DIR}`);
  rmSync(HUGO_IMAGES_DIR, { recursive: true, force: true });
  logger.success(`Successfully cleared ${HUGO_IMAGES_DIR}`);
}

logger.message("Transforming assets and copying to " + HUGO_IMAGES_DIR + "...");

mkdirSync(HUGO_IMAGES_DIR, { recursive: true });

const files = readdirSync(ATTACHMENTS_DIR);

for (const file of files) {
  const ext = extname(file).toLowerCase();

  if (SKIP_EXTS.has(ext)) {
    continue;
  }

  const sourcePath = join(ATTACHMENTS_DIR, file);
  const targetFilename = basename(file, ext) + ".webp";
  const targetPath = join(HUGO_IMAGES_DIR, targetFilename);

  if (existsSync(targetPath)) {
    continue;
  }

  if (ext === ".svg") {
    // Copy SVGs as-is
    const { copyFileSync } = await import("fs");
    const svgTarget = join(HUGO_IMAGES_DIR, file);
    if (!existsSync(svgTarget)) {
      copyFileSync(sourcePath, svgTarget);
      logger.message(`Copied SVG: ${file}`);
    }
    continue;
  }

  if (RASTER_EXTS.has(ext)) {
    try {
      await sharp(sourcePath).webp({ quality: 85 }).toFile(targetPath);
      logger.message(`Converted: ${file} → ${targetFilename}`);
    } catch (err) {
      logger.error(`Failed to convert ${file}: ${err.message}`);
    }
  }
}

logger.success("All assets processed successfully!");
