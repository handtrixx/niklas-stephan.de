import { writeFileSync, mkdirSync } from "fs";
import * as logger from "./logger.mjs";

const API_URL = (process.env.OUTLINE_API_URL ?? "").replace(/\/$/, "");
const API_TOKEN = process.env.OUTLINE_API_TOKEN ?? "";

logger.message("Fetching documents index...");

const indexRepsonse = await fetch(API_URL + "/collections.list", {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Bearer " + API_TOKEN,
  },
  body: JSON.stringify({
    offset: 0,
    limit: 100,
    sort: "updatedAt",
    direction: "DESC",
    query: "",
  }),
});

const indexBody = await indexRepsonse.json();
const indexData = indexBody.data;

const index = indexData
  .filter((item) => item.permission === "read")
  .map((item) => ({
    id: item.id,
    url: item.url,
    urlId: item.urlId,
    name: item.name,
    updatedAt: item.updatedAt,
  }));

function buildTree(items, parentId = null) {
  return items
    .filter((item) => item.parentDocumentId === parentId)
    .map((item) => ({
      ...item,
      children: buildTree(items, item.id),
    }));
}

const hierarchy = [];

for (const collection of index) {
  const collectionRepsonse = await fetch(API_URL + "/documents.list", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + API_TOKEN,
    },
    body: JSON.stringify({
      collectionId: collection.id,
    }),
  });
  const collectionBody = await collectionRepsonse.json();
  const collectionData = collectionBody.data;

  const allDocs = collectionData.map((item) => ({
    id: item.id,
    url: item.url,
    urlId: item.urlId,
    title: item.title,
    language: item.language,
    updatedAt: item.updatedAt,
    collectionId: item.collectionId,
    parentDocumentId: item.parentDocumentId,
  }));

  hierarchy.push({
    ...collection,
    documents: buildTree(allDocs),
  });
}

mkdirSync("/json", { recursive: true });
writeFileSync("/json/index.json", JSON.stringify(hierarchy, null, 2), "utf-8");

logger.success("Written to /json/index.json");
