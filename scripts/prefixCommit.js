import fs from 'fs';

const versionFile = './version.json';
const versionData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
const commitMsgFile = process.argv[2];

// Read existing commit message
let msg = fs.readFileSync(commitMsgFile, 'utf8');

// If it’s already prefixed, don’t double‑prefix
if (!msg.startsWith(`v${versionData.version}:`)) {
  msg = `v${versionData.version}: ${msg}`;
}

// Write back
fs.writeFileSync(commitMsgFile, msg);
console.log(`Commit message prefixed with v${versionData.version}`);
