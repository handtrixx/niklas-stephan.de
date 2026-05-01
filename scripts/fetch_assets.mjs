import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  rmSync,
} from "fs";
import { join } from "path";
import * as logger from "./logger.mjs";

const API_URL = (process.env.OUTLINE_API_URL ?? "").replace(/\/$/, "");
const API_TOKEN = process.env.OUTLINE_API_TOKEN ?? "";
const DOCUMENTS_DIR = "/json/documents";
const ATTACHMENTS_DIR = "/json/attachments";

const force = process.argv.includes("--force");

if (force) {
  logger.message(`--force flag detected, clearing ${ATTACHMENTS_DIR}`);
  rmSync(ATTACHMENTS_DIR, { recursive: true, force: true });
  logger.success(`Successfully cleared ${ATTACHMENTS_DIR}`);
}

logger.message(`Downloading attachment files missing on local host`);

const HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: "Bearer " + API_TOKEN,
};

function findAttachmentIds(text) {
  return [
    ...text.matchAll(/(?<=\/api\/attachments\.redirect\?id=)[a-f0-9-]+/g),
  ].map((m) => m[0]);
}

function contentTypeToExt(contentType) {
  const map = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "application/pdf": "pdf",
  };
  const base = contentType.split(";")[0].trim();
  return map[base] ?? "bin";
}

async function downloadAttachment(attachmentId) {
  mkdirSync(ATTACHMENTS_DIR, { recursive: true });

  const existing = readdirSync(ATTACHMENTS_DIR).find((f) =>
    f.startsWith(`${attachmentId}.`),
  );
  if (existing) {
    return;
  }

  logger.message(`Downloading attachment: ${attachmentId}`);

  // Step 1: get redirect URL
  let redirectUrl;
  try {
    const res = await fetch(`${API_URL}/attachments.redirect`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ id: attachmentId }),
      redirect: "manual",
    });
    redirectUrl = res.headers.get("location");
    if (!redirectUrl) {
      logger.error(`No redirect URL for attachment: ${attachmentId}`);
      return;
    }
  } catch (err) {
    logger.error(`Failed redirect lookup for ${attachmentId}: ${err.message}`);
    return;
  }

  // Step 2: download actual file
  try {
    const res = await fetch(redirectUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get("content-type") ?? "";
    const ext = contentTypeToExt(contentType);
    const finalPath = join(ATTACHMENTS_DIR, `${attachmentId}.${ext}`);
    writeFileSync(finalPath, Buffer.from(await res.arrayBuffer()));
    logger.success(`Downloaded: ${attachmentId}.${ext}`);
  } catch (err) {
    logger.error(`Failed to download ${attachmentId}: ${err.message}`);
  }
}

function walkJson(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkJson(full));
    else if (entry.name === "index.json") results.push(full);
  }
  return results;
}

for (const jsonFile of walkJson(DOCUMENTS_DIR)) {
  let doc;
  try {
    doc = JSON.parse(readFileSync(jsonFile, "utf-8"));
  } catch {
    continue;
  }

  const text = doc.text ?? "";
  const attachmentIds = findAttachmentIds(text);
  if (!attachmentIds.length) continue;

  for (const attId of attachmentIds) {
    await downloadAttachment(attId);
  }
}

logger.success("Attachment files in sync.");
