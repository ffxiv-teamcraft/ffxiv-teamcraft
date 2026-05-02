/**
 * Downloads the latest deucalion-bridge.exe from GitHub Releases into
 * tools/build/deucalion-bridge.exe so electron-builder can bundle it.
 *
 * Usage: node tools/build/download-bridge.js
 *
 * Set BRIDGE_REPO=owner/repo to override the default repository.
 * Set BRIDGE_VERSION=vX.Y.Z to pin a specific release tag instead of latest.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const REPO = process.env.BRIDGE_REPO || 'birkholz/deucalion-bridge';
const VERSION = process.env.BRIDGE_VERSION || null;
const OUT = path.join(__dirname, 'deucalion-bridge.exe');

function get(url) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url);
    https.get(
      { hostname: opts.hostname, path: opts.pathname + opts.search, headers: { 'User-Agent': 'ffxiv-teamcraft-build' } },
      (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return resolve(get(res.headers.location));
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }
    ).on('error', reject);
  });
}

async function download(url, dest) {
  const buffer = await get(url);
  fs.writeFileSync(dest, buffer);
}

async function main() {
  const apiUrl = VERSION
    ? `https://api.github.com/repos/${REPO}/releases/tags/${VERSION}`
    : `https://api.github.com/repos/${REPO}/releases/latest`;

  console.log(`[download-bridge] Fetching release info from ${apiUrl} …`);
  const body = await get(apiUrl);
  const release = JSON.parse(body.toString());
  const tag = release.tag_name;

  const asset = release.assets?.find((a) => a.name === 'deucalion-bridge.exe');
  if (!asset) {
    throw new Error(`No deucalion-bridge.exe asset found in release ${tag}`);
  }

  console.log(`[download-bridge] Downloading ${tag}/deucalion-bridge.exe …`);
  await download(asset.browser_download_url, OUT);
  console.log(`[download-bridge] Saved to ${OUT}`);
}

main().catch((e) => {
  console.error('[download-bridge] ERROR:', e.message);
  process.exit(1);
});
