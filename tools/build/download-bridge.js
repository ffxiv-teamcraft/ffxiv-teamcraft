/**
 * Downloads deucalion-bridge.exe and Deucalion's Wine dependency into
 * tools/build so electron-builder can bundle them.
 *
 * Usage: node tools/build/download-bridge.js
 *
 * Set BRIDGE_REPO=owner/repo to override the default bridge repository.
 * Set BRIDGE_VERSION=vX.Y.Z to pin a specific bridge release tag instead of latest.
 * Set DEUCALION_REPO=owner/repo to override the default Deucalion repository.
 * Set DEUCALION_VERSION=X.Y.Z to pin a specific Deucalion release tag instead of latest.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BRIDGE_REPO = process.env.BRIDGE_REPO || 'birkholz/deucalion-bridge';
const BRIDGE_VERSION = process.env.BRIDGE_VERSION || null;
const DEUCALION_REPO = process.env.DEUCALION_REPO || 'ff14wed/deucalion';
const DEUCALION_VERSION = process.env.DEUCALION_VERSION || null;

const BRIDGE_OUT = path.join(__dirname, 'deucalion-bridge.exe');
const BCRYPT_OUT = path.join(__dirname, 'bcryptprimitives.dll');

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

async function getRelease(repo, version) {
  const apiUrl = version
    ? `https://api.github.com/repos/${repo}/releases/tags/${version}`
    : `https://api.github.com/repos/${repo}/releases/latest`;

  console.log(`[download-bridge] Fetching release info from ${apiUrl} …`);
  const body = await get(apiUrl);
  return JSON.parse(body.toString());
}

function findAsset(release, assetName) {
  const asset = release.assets?.find((a) => a.name === assetName);
  if (!asset) {
    throw new Error(`No ${assetName} asset found in release ${release.tag_name}`);
  }
  return asset;
}

async function main() {
  const bridgeRelease = await getRelease(BRIDGE_REPO, BRIDGE_VERSION);
  const bridgeAsset = findAsset(bridgeRelease, 'deucalion-bridge.exe');

  console.log(`[download-bridge] Downloading ${bridgeRelease.tag_name}/deucalion-bridge.exe …`);
  await download(bridgeAsset.browser_download_url, BRIDGE_OUT);
  console.log(`[download-bridge] Saved to ${BRIDGE_OUT}`);

  const deucalionRelease = await getRelease(DEUCALION_REPO, DEUCALION_VERSION);
  const bcryptAsset = findAsset(deucalionRelease, 'bcryptprimitives.dll');

  console.log(`[download-bridge] Downloading ${deucalionRelease.tag_name}/bcryptprimitives.dll …`);
  await download(bcryptAsset.browser_download_url, BCRYPT_OUT);
  console.log(`[download-bridge] Saved to ${BCRYPT_OUT}`);
}

main().catch((e) => {
  console.error('[download-bridge] ERROR:', e.message);
  process.exit(1);
});
