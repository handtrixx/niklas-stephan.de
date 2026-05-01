import {
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  rmSync,
  copyFileSync,
} from "fs";
import { join, relative, dirname, basename } from "path";
import * as logger from "./logger.mjs";

const DOCUMENTS_DIR = "/json/documents";
const TEMPLATES_DIR = "/hugo/content";
const HUGO_CONTENT_DIR = "/content";

const force = process.argv.includes("--force");

if (force) {
  logger.message(`--force flag detected, clearing ${HUGO_CONTENT_DIR}`);
  rmSync(HUGO_CONTENT_DIR, { recursive: true, force: true });
  logger.success(`Successfully cleared ${HUGO_CONTENT_DIR}`);
}

function slugFromUrl(url, urlId) {
  return url
    .replace(/^\/(collection|doc)\//, "")
    .replace(new RegExp(`-${urlId}$`), "");
}

function rewriteAttachmentUrls(text) {
  return text.replaceAll(
    /\/api\/attachments\.redirect\?id=([a-f0-9-]+)/g,
    (_, id) => `/images/${id}.webp`,
  );
}

function rewriteCollapsibles(text) {
  return text.replace(
    /\+\+\+\+\+\n([^\n]+)\n([\s\S]*?)\n\+\+\+\+\+/g,
    (_, title, content) => {
      const isCode = title.trim().match(/^`(.+)`$/);
      const summaryContent = isCode
        ? `<code>${isCode[1]}</code>`
        : title.trim();
      return `<details>\n<summary>${summaryContent}</summary>\n\n${content.trim()}\n\n</details>`;
    },
  );
}

function toMarkdown(doc) {
  const slug = slugFromUrl(doc.url, doc.urlId);
  const frontmatter = [
    "---",
    `title: "${doc.title?.replace(/"/g, '\\"') ?? ""}"`,
    `slug: "${slug}"`,
    `date: "${doc.createdAt ?? ""}"`,
    `lastmod: "${doc.updatedAt ?? ""}"`,
    doc.language ? `language: "${doc.language}"` : null,
    doc.collectionId ? `collectionId: "${doc.collectionId}"` : null,
    doc.parentDocumentId ? `parentDocumentId: "${doc.parentDocumentId}"` : null,
    "---",
  ]
    .filter(Boolean)
    .join("\n");

  const text = rewriteCollapsibles(
    rewriteAttachmentUrls(doc.text ?? ""),
  ).replaceAll("\\n", "\n");

  return `${frontmatter}\n\n${text}`;
}

function walkDir(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkDir(full));
    else if (entry.name === "index.json") results.push(full);
  }
  return results;
}

function walkDirAll(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkDirAll(full));
    else results.push(full);
  }
  return results;
}

function copyTemplates() {
  const templateFiles = walkDirAll(TEMPLATES_DIR);
  for (const templateFile of templateFiles) {
    const relativePath = relative(TEMPLATES_DIR, templateFile);
    const targetPath = join(HUGO_CONTENT_DIR, relativePath);
    const targetDir = dirname(targetPath);
    mkdirSync(targetDir, { recursive: true });
    copyFileSync(templateFile, targetPath);
    logger.message(`Copied template: ${relativePath}`);
  }
}

logger.message("Copying templates...");
copyTemplates();
logger.success("Templates copied.");

const allJsonFiles = walkDir(DOCUMENTS_DIR);

// Collect all directory paths that contain index.json files,
// then find which of those dirs are also parents of other such dirs.
const allDirs = new Set(allJsonFiles.map((f) => dirname(f)));

for (const jsonFile of allJsonFiles) {
  let doc;
  try {
    doc = JSON.parse(readFileSync(jsonFile, "utf-8"));
  } catch {
    continue;
  }

  const relativeDir = relative(DOCUMENTS_DIR, dirname(jsonFile));
  const relativePath = join(relativeDir, "_index.md");
  const targetDir = join(HUGO_CONTENT_DIR, relativeDir);
  const targetPath = join(HUGO_CONTENT_DIR, relativePath);

  // Skip if up to date
  if (existsSync(targetPath)) {
    const existing = readFileSync(targetPath, "utf-8");
    if (existing.includes(`lastmod: "${doc.updatedAt}"`)) {
      continue;
    }
  }

  mkdirSync(targetDir, { recursive: true });
  writeFileSync(targetPath, toMarkdown(doc), "utf-8");
  logger.message(`Generated: ${relativePath}`);
}

logger.success("JSON has been converted to Markdown.");
