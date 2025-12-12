// scripts/updateVersion.js
import fs from "fs";
import { execSync } from "child_process";

const versionFile = "./version.json";
const versionData = JSON.parse(fs.readFileSync(versionFile, "utf8"));

// Get bump type from CLI args: major | minor | patch
const bumpType = process.argv[2] || "patch";

let [major, minor, patch] = versionData.version.split(".").map(Number);

switch (bumpType) {
  case "major":
    major += 1;
    minor = 0;
    patch = 0;
    break;
  case "minor":
    minor += 1;
    patch = 0;
    break;
  default: // patch
    patch += 1;
}

versionData.version = `${major}.${minor}.${patch}`;
versionData.date = new Date().toLocaleDateString("en-US");

fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2) + "\n");

// Run Prettier on the file
try {
  execSync(`pnpm prettier --write ${versionFile}`, { stdio: "inherit" });
} catch (error) {
  console.warn("Prettier formatting failed, continuing anyway...");
}

console.log(
  `Updated to version ${versionData.version} released ${versionData.date}`,
);
