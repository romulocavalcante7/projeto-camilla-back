/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const path = require("path");

const sourceDir = path.join(__dirname, "src", "mails");
const targetDir = path.join(__dirname, "build", "src", "mails");

function copyFiles(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyFiles(srcPath, destPath);
    } else if (entry.isFile() && path.extname(entry.name) === ".ejs") {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyFiles(sourceDir, targetDir);
console.log("EJS files copied successfully.");
