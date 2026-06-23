import sharp from "sharp";
import { readFileSync } from "fs";

const source = readFileSync("/home/z/my-project/public/pbr.png");

// Generate 192x192 icon
await sharp(source)
  .resize(192, 192, { fit: "contain", background: { r: 248, g: 250, b: 252, alpha: 1 } })
  .png()
  .toFile("/home/z/my-project/public/icon-192.png");
console.log("Generated icon-192.png");

// Generate 512x512 icon
await sharp(source)
  .resize(512, 512, { fit: "contain", background: { r: 248, g: 250, b: 252, alpha: 1 } })
  .png()
  .toFile("/home/z/my-project/public/icon-512.png");
console.log("Generated icon-512.png");

// Generate apple-touch-icon (180x180)
await sharp(source)
  .resize(180, 180, { fit: "contain", background: { r: 248, g: 250, b: 252, alpha: 1 } })
  .png()
  .toFile("/home/z/my-project/public/apple-touch-icon.png");
console.log("Generated apple-touch-icon.png");

// Generate favicon (32x32)
await sharp(source)
  .resize(32, 32, { fit: "contain", background: { r: 248, g: 250, b: 252, alpha: 1 } })
  .png()
  .toFile("/home/z/my-project/public/favicon.png");
console.log("Generated favicon.png");
