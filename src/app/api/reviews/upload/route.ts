import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

function extensionFromMime(mime: string) {
  if (mime === "image/png") {
    return "png";
  }

  if (mime === "image/webp") {
    return "webp";
  }

  return "jpg";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!ALLOWED_MIME.has(image.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, or WEBP images are allowed" }, { status: 400 });
    }

    if (image.size <= 0 || image.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image size must be less than 3MB" }, { status: 400 });
    }

    const extension = extensionFromMime(image.type);
    const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
    const relativeDir = path.join("uploads", "reviews");
    const outputDir = path.join(process.cwd(), "public", relativeDir);
    const outputPath = path.join(outputDir, fileName);

    await mkdir(outputDir, { recursive: true });

    const arrayBuffer = await image.arrayBuffer();
    await writeFile(outputPath, Buffer.from(arrayBuffer));

    return NextResponse.json({
      url: `/${relativeDir.replace(/\\/g, "/")}/${fileName}`,
    });
  } catch (error) {
    console.error("POST /api/reviews/upload failed", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
