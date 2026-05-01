import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "fs";
import { join } from "path";
import * as logger from "./logger.mjs";

const API_URL = (process.env.OUTLINE_API_URL ?? "").replace(/\/$/, "");
const API_TOKEN = process.env.OUTLINE_API_TOKEN ?? "";
const OUTPUT_DIR = "/json/documents";

const force = process.argv.includes("--force");

if (force) {
  logger.message(`--force flag detected, clearing ${OUTPUT_DIR}`);
  rmSync(OUTPUT_DIR, { recursive: true, force: true });
  logger.success(`Successfully cleared ${OUTPUT_DIR}`);
}

logger.message("Fetching outdated or not existing documents...");

const index = JSON.parse(readFileSync("/json/index.json", "utf-8"));

function slugFromUrl(url, urlId) {
  const withoutPrefix = url.replace(/^\/(collection|doc)\//, "");
  return withoutPrefix.replace(new RegExp(`-${urlId}$`), "");
}

async function fetchDocument(id) {
  const response = await fetch(API_URL + "/documents.info", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + API_TOKEN,
    },
    body: JSON.stringify({ id }),
  });
  const body = await response.json();
  return body.data;
}

function isCached(docDir, updatedAt) {
  const indexPath = join(docDir, "index.json");
  if (!existsSync(indexPath)) return false;

  const cached = JSON.parse(readFileSync(indexPath, "utf-8"));
  return cached.updatedAt === updatedAt;
}

async function processDocument(doc, dirPath) {
  const slug = slugFromUrl(doc.url, doc.urlId);
  const docDir = join(dirPath, slug);
  mkdirSync(docDir, { recursive: true });

  if (isCached(docDir, doc.updatedAt)) {
    //console.log(`Skipping (up to date): ${doc.title}`);
  } else {
    logger.message(`Fetching: ${doc.title} → ${docDir}/index.json`);
    const data = await fetchDocument(doc.id);
    writeFileSync(
      join(docDir, "index.json"),
      JSON.stringify(data, null, 2),
      "utf-8",
    );
  }

  for (const child of doc.children) {
    await processDocument(child, docDir);
  }
}

for (const collection of index) {
  const collectionSlug = slugFromUrl(collection.url, collection.urlId);
  const collectionDir = join(OUTPUT_DIR, collectionSlug);
  mkdirSync(collectionDir, { recursive: true });

  for (const doc of collection.documents) {
    await processDocument(doc, collectionDir);
  }
}

logger.success("All documents are up to date.");
