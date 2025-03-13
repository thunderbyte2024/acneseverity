import fs from "fs-extra";

const srcDir = "public/models";
const destDir = "dist/models";

// Ensure destination exists
fs.ensureDirSync(destDir);

// Copy files
fs.copySync(srcDir, destDir);

console.log("✅ Models directory copied successfully!");
