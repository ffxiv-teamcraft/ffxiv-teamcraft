/**
 * Downloads Deucalion's bcryptprimitives.dll dependency into deucalion-bridge
 * so electron-builder can bundle it for macOS/XIV-on-Mac bridge support.
 *
 * Usage:
 *   node tools/build/download-bcryptprimitives.js
 *
 * Set DEUCALION_REPO=owner/repo to override the default Deucalion repository.
 * Set DEUCALION_VERSION=X.Y.Z to pin a specific Deucalion release tag.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DEUCALION_REPO = process.env.DEUCALION_REPO || 'ff14wed/deucalion';
const DEUCALION_VERSION = process.env.DEUCALION_VERSION || '1.5.0';

const OUT_DIR = path.join(__dirname, '..', '..', 'deucalion-bridge');
const BCRYPT_OUT = path.join(OUT_DIR, 'bcryptprimitives.dll');

function get(url) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url);

    https
      .get(
        {
          hostname: opts.hostname,
          path: opts.pathname + opts.search,
          headers: { 'User-Agent': 'ffxiv-teamcraft-build' },
        },
        (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            return resolve(get(res.headers.location));
          }

          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          }

          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        }
      )
      .on('error', reject);
  });
}

async function getRelease(repo, version) {
  const apiUrl = `https://api.github.com/repos/${repo}/releases/tags/${version}`;

  console.log(`[download-bcryptprimitives] Fetching release info from ${apiUrl} …`);
  const body = await get(apiUrl);
  return JSON.parse(body.toString());
}

function findAsset(release, assetName) {
  const asset = release.assets?.find((item) => item.name === assetName);

  if (!asset) {
    throw new Error(`No ${assetName} asset found in release ${release.tag_name}`);
  }

  return asset;
}

async function download(url, dest) {
  const buffer = await get(url);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buffer);
}

async function main() {
  const release = await getRelease(DEUCALION_REPO, DEUCALION_VERSION);
  const asset = findAsset(release, 'bcryptprimitives.dll');

  console.log(`[download-bcryptprimitives] Downloading ${release.tag_name}/bcryptprimitives.dll …`);
  await download(asset.browser_download_url, BCRYPT_OUT);
  console.log(`[download-bcryptprimitives] Saved to ${BCRYPT_OUT}`);
}

main().catch((error) => {
  console.error('[download-bcryptprimitives] ERROR:', error.message);
  process.exit(1);
});
