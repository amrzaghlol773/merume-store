import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureCloudinaryConfig() {
  if (configured) {
    return;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are missing");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  configured = true;
}

export function isBase64Image(value: string) {
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(String(value || "").trim());
}

export async function uploadImageToCloudinary(dataUri: string, folder: string) {
  ensureCloudinaryConfig();

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
  });

  return result.secure_url || result.url;
}

export async function uploadLocalFileToCloudinary(filePath: string, folder: string) {
  ensureCloudinaryConfig();

  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: "image",
  });

  return result.secure_url || result.url;
}

export function extractCloudinaryPublicId(rawUrl: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    return "";
  }

  try {
    const parsed = new URL(rawUrl);
    if (!/cloudinary\.com$/i.test(parsed.hostname)) {
      return "";
    }

    const uploadMarker = "/upload/";
    const markerIndex = parsed.pathname.indexOf(uploadMarker);
    if (markerIndex < 0) {
      return "";
    }

    const pathWithoutPrefix = parsed.pathname.slice(markerIndex + uploadMarker.length);
    const parts = pathWithoutPrefix.split("/").filter(Boolean);
    if (!parts.length) {
      return "";
    }

    const withoutVersion = /^v\d+$/.test(parts[0]) ? parts.slice(1) : parts;
    if (!withoutVersion.length) {
      return "";
    }

    const publicPath = withoutVersion.join("/");
    return publicPath.replace(/\.[a-zA-Z0-9]+$/, "");
  } catch {
    return "";
  }
}

export async function deleteCloudinaryImageByUrl(rawUrl: string) {
  const publicId = extractCloudinaryPublicId(rawUrl);
  if (!publicId) {
    return false;
  }

  ensureCloudinaryConfig();
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  return true;
}

export async function deleteCloudinaryImagesByUrls(urls: string[]) {
  const uniqueUrls = Array.from(new Set((urls || []).filter(Boolean)));
  await Promise.all(
    uniqueUrls.map(async (url) => {
      try {
        await deleteCloudinaryImageByUrl(url);
      } catch {
        // Best-effort cleanup.
      }
    }),
  );
}
