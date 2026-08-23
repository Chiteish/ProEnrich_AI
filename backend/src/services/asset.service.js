const path = require("path");
const fs = require("fs");
const axios = require("axios");

/**
 * Sanitizes MPN for safe directory names
 */
const sanitizeMpn = (mpn) => {
  if (!mpn) return "unknown";
  return mpn.replace(/[^a-zA-Z0-9_-]/g, "");
};

/**
 * Maps Content-Type or URL extension to asset file extension
 */
const getExtension = (contentType, url) => {
  const mimeMap = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf"
  };
  const mime = (contentType || "").split(";")[0].trim().toLowerCase();
  if (mimeMap[mime]) {
    return mimeMap[mime];
  }
  const extMatch = url.split(/[?#]/)[0].match(/\.([a-zA-Z0-9]+)$/);
  if (extMatch) {
    const ext = extMatch[1].toLowerCase();
    if (["jpg", "jpeg", "png", "webp", "pdf"].includes(ext)) {
      return ext === "jpeg" ? "jpg" : ext;
    }
  }
  return "jpg"; // Default fallback
};

/**
 * Validates protocol to only allow http and https
 */
const isHttpUrl = (urlString) => {
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (e) {
    return false;
  }
};

/**
 * Downloads a single remote asset and saves it in the product folder
 */
const downloadAsset = async (url, targetDir, baseName) => {
  if (!isHttpUrl(url)) {
    return {
      available: false,
      source: "remote",
      url: null,
      external_url: url,
      error: "INVALID_PROTOCOL"
    };
  }

  const tempPath = path.join(targetDir, `${baseName}.tmp`);
  let writer;

  try {
    const response = await axios({
      method: "get",
      url,
      responseType: "stream",
      timeout: 5000
    });

    const contentType = response.headers["content-type"];
    const contentLength = parseInt(response.headers["content-length"], 10);
    const ext = getExtension(contentType, url);
    const finalFilename = `${baseName}.${ext}`;
    const finalPath = path.join(targetDir, finalFilename);

    if (contentLength && contentLength > 5 * 1024 * 1024) {
      response.data.destroy();
      return {
        available: false,
        source: "remote",
        url: null,
        external_url: url,
        error: "FILE_TOO_LARGE"
      };
    }

    writer = fs.createWriteStream(tempPath);
    let downloadedBytes = 0;

    await new Promise((resolve, reject) => {
      response.data.on("data", (chunk) => {
        downloadedBytes += chunk.length;
        if (downloadedBytes > 5 * 1024 * 1024) {
          response.data.destroy();
          writer.destroy();
          reject(new Error("FILE_TOO_LARGE"));
        }
      });

      response.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // Rename temp file to final file
    if (fs.existsSync(tempPath)) {
      fs.renameSync(tempPath, finalPath);
    }

    return {
      available: true,
      source: "remote",
      url: `/api/ai/assets/${path.basename(targetDir)}/${finalFilename}`,
      external_url: null,
      error: null
    };

  } catch (error) {
    if (fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
      } catch (e) {}
    }

    const errCode = error.message === "FILE_TOO_LARGE" ? "FILE_TOO_LARGE" : "DOWNLOAD_FAILED";

    return {
      available: false,
      source: "remote",
      url: null,
      external_url: url,
      error: errCode
    };
  }
};

const getTrustedLocalAssetDirs = () => {
  const dirs = [];
  if (process.env.LOCAL_ASSET_DIRS) {
    const envDirs = process.env.LOCAL_ASSET_DIRS.split(",").map(d => path.resolve(d.trim()));
    dirs.push(...envDirs);
  }
  const defaultDir = path.resolve(__dirname, "../../data/assets");
  if (!dirs.some(d => d === defaultDir)) {
    dirs.push(defaultDir);
  }
  return dirs;
};

/**
 * Safe local filename resolution and copy
 */
const resolveAndCopyLocalAsset = (filename, sanitizedMpn, baseName) => {
  if (typeof filename !== "string" || !filename) {
    return null;
  }

  // Reject traversal, absolute path features, drive letters, and UNC paths
  if (
    filename.includes("../") ||
    filename.includes("..\\") ||
    filename.includes("/") ||
    filename.includes("\\") ||
    filename.includes(":") ||
    filename.startsWith("//") ||
    filename.startsWith("\\\\")
  ) {
    return null;
  }

  const safeFilename = path.basename(filename);
  const trustedDirs = getTrustedLocalAssetDirs();

  for (const trustedDir of trustedDirs) {
    const sourcePath = path.join(trustedDir, safeFilename);
    const resolvedSourcePath = path.resolve(sourcePath);

    // Containment check
    if (!resolvedSourcePath.startsWith(trustedDir)) {
      continue;
    }

    if (fs.existsSync(resolvedSourcePath) && fs.statSync(resolvedSourcePath).isFile()) {
      const extMatch = safeFilename.match(/\.([a-zA-Z0-9]+)$/);
      const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
      const finalFilename = `${baseName}.${ext}`;
      
      const destDir = path.resolve(__dirname, "../../data/assets", sanitizedMpn);
      fs.mkdirSync(destDir, { recursive: true });
      
      const destPath = path.join(destDir, finalFilename);
      fs.copyFileSync(resolvedSourcePath, destPath);

      return {
        available: true,
        source: "local",
        filename: safeFilename,
        url: `/api/ai/assets/${sanitizedMpn}/${finalFilename}`,
        external_url: null,
        error: null
      };
    }
  }
  return null;
};

/**
 * Main asset processing service
 */
const processAssets = async (mpn, webDiscovery) => {
  const sanitized = sanitizeMpn(mpn);
  const targetDir = path.resolve(__dirname, "../../data/assets", sanitized);
  
  // Ensure product folder exists
  fs.mkdirSync(targetDir, { recursive: true });

  const manifest = {
    product_image: null,
    alternate_images: [],
    specification_sheet: null,
    manual: null
  };

  if (!webDiscovery) return manifest;

  // 1. Process main product image
  if (webDiscovery.product_image) {
    const local = resolveAndCopyLocalAsset(webDiscovery.product_image, sanitized, "product");
    if (local) {
      manifest.product_image = local;
    } else {
      manifest.product_image = await downloadAsset(webDiscovery.product_image, targetDir, "product");
    }
  } else {
    manifest.product_image = {
      available: false,
      source: "remote",
      url: null,
      external_url: null,
      error: null
    };
  }

  // 2. Process alternate images
  if (Array.isArray(webDiscovery.alternate_images)) {
    for (let i = 0; i < webDiscovery.alternate_images.length; i++) {
      const img = webDiscovery.alternate_images[i];
      if (img) {
        const local = resolveAndCopyLocalAsset(img, sanitized, `alternate-${i + 1}`);
        if (local) {
          manifest.alternate_images.push(local);
        } else {
          const res = await downloadAsset(img, targetDir, `alternate-${i + 1}`);
          manifest.alternate_images.push(res);
        }
      }
    }
  }

  // 3. Process specification sheet
  if (webDiscovery.specification_sheet) {
    const local = resolveAndCopyLocalAsset(webDiscovery.specification_sheet, sanitized, "specification-sheet");
    if (local) {
      manifest.specification_sheet = local;
    } else {
      manifest.specification_sheet = await downloadAsset(webDiscovery.specification_sheet, targetDir, "specification-sheet");
    }
  } else {
    manifest.specification_sheet = {
      available: false,
      source: "remote",
      url: null,
      external_url: null,
      error: null
    };
  }

  // 4. Process user manual
  if (webDiscovery.manual) {
    const local = resolveAndCopyLocalAsset(webDiscovery.manual, sanitized, "manual");
    if (local) {
      manifest.manual = local;
    } else {
      manifest.manual = await downloadAsset(webDiscovery.manual, targetDir, "manual");
    }
  } else {
    manifest.manual = {
      available: false,
      source: "remote",
      url: null,
      external_url: null,
      error: null
    };
  }

  return manifest;
};

module.exports = {
  processAssets,
  sanitizeMpn
};
