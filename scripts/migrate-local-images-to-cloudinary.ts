import path from "node:path";
import { access } from "node:fs/promises";

import { prisma } from "@/lib/prisma";
import { uploadLocalFileToCloudinary } from "@/lib/server/cloudinary";

function isExternalUrl(value: string) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function toRelativePublicPath(rawUrl: string) {
  return String(rawUrl || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^\.\//, "");
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function migrateProductImages() {
  const images = await prisma.productImage.findMany({
    select: { id: true, url: true },
    orderBy: { id: "asc" },
  });

  const migratedByPath = new Map<string, string>();
  let migratedCount = 0;

  for (const image of images) {
    if (isExternalUrl(image.url)) {
      continue;
    }

    const relativePath = toRelativePublicPath(image.url);
    if (!relativePath) {
      continue;
    }

    const absolutePath = path.join(process.cwd(), "public", relativePath);
    let cloudUrl = migratedByPath.get(relativePath);

    if (!cloudUrl) {
      const exists = await fileExists(absolutePath);
      if (!exists) {
        console.warn(`[products] File not found for image #${image.id}: ${absolutePath}`);
        continue;
      }

      cloudUrl = await uploadLocalFileToCloudinary(absolutePath, "merume/products/migrated");
      migratedByPath.set(relativePath, cloudUrl);
    }

    await prisma.productImage.update({
      where: { id: image.id },
      data: { url: cloudUrl },
    });

    migratedCount += 1;
    console.log(`[products] migrated image #${image.id}`);
  }

  return migratedCount;
}

async function migrateReviewImages() {
  const images = await prisma.reviewImage.findMany({
    select: { id: true, url: true },
    orderBy: { id: "asc" },
  });

  const migratedByPath = new Map<string, string>();
  let migratedCount = 0;

  for (const image of images) {
    if (isExternalUrl(image.url)) {
      continue;
    }

    const relativePath = toRelativePublicPath(image.url);
    if (!relativePath) {
      continue;
    }

    const absolutePath = path.join(process.cwd(), "public", relativePath);
    let cloudUrl = migratedByPath.get(relativePath);

    if (!cloudUrl) {
      const exists = await fileExists(absolutePath);
      if (!exists) {
        console.warn(`[reviews] File not found for image #${image.id}: ${absolutePath}`);
        continue;
      }

      cloudUrl = await uploadLocalFileToCloudinary(absolutePath, "merume/reviews/migrated");
      migratedByPath.set(relativePath, cloudUrl);
    }

    await prisma.reviewImage.update({
      where: { id: image.id },
      data: { url: cloudUrl },
    });

    migratedCount += 1;
    console.log(`[reviews] migrated image #${image.id}`);
  }

  return migratedCount;
}

async function main() {
  console.log("Starting local image migration to Cloudinary...");

  const [productMigrated, reviewMigrated] = await Promise.all([
    migrateProductImages(),
    migrateReviewImages(),
  ]);

  console.log("Migration complete.");
  console.log(`Product images migrated: ${productMigrated}`);
  console.log(`Review images migrated: ${reviewMigrated}`);
}

main()
  .catch((error) => {
    console.error("Migration failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
