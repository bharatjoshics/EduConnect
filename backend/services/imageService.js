import sharp from "sharp";
import fetch from "node-fetch";

export const prepareImageForAI = async (imageUrl) => {
  const response = await fetch(imageUrl);
  const buffer = Buffer.from(await response.arrayBuffer());

  const image = sharp(buffer);
  const metadata = await image.metadata();

  const size = buffer.byteLength;

  const needOptimize =
    metadata.width > 1600 || size > 500 * 1024;

  if (!needOptimize) {
    console.log("✅ Skipping optimization");
    return buffer;
  }

  console.log("⚡ Optimizing image...");

  const optimized = await image
    .resize({ width: 1400 })
    .jpeg({ quality: 75 })
    .toBuffer();

  return optimized;
};