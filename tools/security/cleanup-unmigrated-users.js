/**
 * One-off cleanup for users who never signed in with a client that moves their private data (#3309).
 * Run it after the cut-off date.
 *
 * For every users/{uid} document still holding private data:
 *  - Patreon/Tipeee tokens are deleted: they were publicly readable, users re-link if they come back;
 *  - the other private fields and character ContentIDs move to users/{uid}/private/profile;
 *  - the Kickstarter email is reserved in ks-emails/{sha256(lowercased email)} so it can't be claimed twice;
 *  - supporter is set to false when tokens were removed and no patreonBenefitsUntil / supporterUntil is running.
 * Documents whose private fields only hold empty defaults are skipped: the client drops those keys on its next save.
 *
 * Dry run by default. Mirrors apps/client/src/app/model/user/user-private-data.ts.
 *
 * Usage:
 *   gcloud auth application-default login   (or set GOOGLE_APPLICATION_CREDENTIALS)
 *   node tools/security/cleanup-unmigrated-users.js [--project=ffxivteamcraft] [--page-size=500] [--apply]
 */
const crypto = require('crypto');
const colors = require('colors/safe');

const PRIVATE_USER_FIELDS = ['patreonToken', 'patreonRefreshToken', 'lastPatreonRefresh', 'tipeeeToken', 'tipeeeRefreshToken',
  'lastTipeeeRefresh', 'ksEmail', 'contacts', 'favorites', 'itemTags', 'defaultConsumables', 'cid', 'currentFcId', 'world'];

const TOKEN_FIELDS = ['patreonToken', 'patreonRefreshToken', 'lastPatreonRefresh', 'tipeeeToken', 'tipeeeRefreshToken', 'lastTipeeeRefresh'];

const ARRAY_FIELDS = ['contacts', 'itemTags'];

const BATCH_LIMIT = 450;

function parseArgs(argv) {
  const args = { project: 'ffxivteamcraft', pageSize: 500, apply: false };
  argv.forEach(arg => {
    const [key, value] = arg.split('=');
    switch (key) {
      case '--project':
        args.project = value;
        break;
      case '--page-size':
        args.pageSize = +value;
        break;
      case '--apply':
        args.apply = true;
        break;
      default:
        throw new Error(`Unknown argument ${arg}`);
    }
  });
  return args;
}

function isEmptyValue(value) {
  if (value === undefined || value === null || value === '') {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'object') {
    return Object.values(value).every(isEmptyValue);
  }
  return false;
}

function union(a, b) {
  const seen = new Set();
  return [...(a || []), ...(b || [])].filter(value => {
    const key = JSON.stringify(value);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function mergeField(field, current, legacy) {
  if (current === undefined) {
    return legacy;
  }
  if (ARRAY_FIELDS.includes(field)) {
    return union(current, legacy);
  }
  if (field === 'favorites') {
    const keys = new Set([...Object.keys(current || {}), ...Object.keys(legacy || {})]);
    return [...keys].reduce((favorites, key) => {
      favorites[key] = union(current && current[key], legacy && legacy[key]);
      return favorites;
    }, {});
  }
  return legacy;
}

function collectContentIds(data) {
  const contentIds = {};
  (Array.isArray(data.lodestoneIds) ? data.lodestoneIds : []).forEach(entry => {
    if (entry && entry.id !== undefined && entry.contentId) {
      contentIds[entry.id] = entry.contentId;
    }
  });
  (Array.isArray(data.customCharacters) ? data.customCharacters : []).forEach(character => {
    if (character && character.ID !== undefined && character.contentId) {
      contentIds[character.ID] = character.contentId;
    }
  });
  return contentIds;
}

function stripContentIds(entries) {
  return entries.map(entry => {
    if (!entry || !('contentId' in entry)) {
      return entry;
    }
    const { contentId, ...rest } = entry;
    return rest;
  });
}

function toMillis(value) {
  if (!value) {
    return 0;
  }
  if (typeof value.toMillis === 'function') {
    return value.toMillis();
  }
  return (value.seconds || 0) * 1000;
}

/**
 * Computes the writes for one user document, or null when there's nothing worth moving.
 */
function planUserCleanup(data, existingProfile, FieldValue) {
  const legacyFields = PRIVATE_USER_FIELDS.filter(field => field in data);
  const contentIds = collectContentIds(data);
  const hasContentIds = Object.keys(contentIds).length > 0;
  const hasData = hasContentIds || legacyFields.some(field => !isEmptyValue(data[field]));
  if (!hasData) {
    return null;
  }

  const profile = { ...(existingProfile || {}) };
  legacyFields
    .filter(field => !TOKEN_FIELDS.includes(field) && !isEmptyValue(data[field]))
    .forEach(field => {
      profile[field] = mergeField(field, profile[field], data[field]);
    });
  if (hasContentIds) {
    profile.contentIds = { ...(profile.contentIds || {}), ...contentIds };
  }

  const publicUpdate = {};
  legacyFields.forEach(field => {
    publicUpdate[field] = FieldValue.delete();
  });
  if (Array.isArray(data.lodestoneIds)) {
    publicUpdate.lodestoneIds = stripContentIds(data.lodestoneIds);
  }
  if (Array.isArray(data.customCharacters)) {
    publicUpdate.customCharacters = stripContentIds(data.customCharacters);
  }
  const removedTokens = TOKEN_FIELDS.some(field => !isEmptyValue(data[field]));
  const now = Date.now();
  if (removedTokens && toMillis(data.patreonBenefitsUntil) < now && !(data.supporterUntil > now)) {
    publicUpdate.supporter = false;
  }

  return {
    profile,
    publicUpdate,
    removedTokens,
    ksEmail: typeof data.ksEmail === 'string' && data.ksEmail ? data.ksEmail : null
  };
}

function hashEmail(email) {
  return crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { initializeApp, applicationDefault } = require('firebase-admin/app');
  const { getFirestore, FieldPath, FieldValue } = require('firebase-admin/firestore');
  initializeApp({ credential: applicationDefault(), projectId: args.project });
  const firestore = getFirestore();

  console.log(colors.cyan(`Cleaning up unmigrated users in ${colors.yellow(args.project)} (${args.apply ? colors.red('APPLY') : 'dry run'})`));

  const stats = { scanned: 0, cleaned: 0, tokensRemoved: 0, ksClaimed: 0, ksConflicts: 0 };
  const claimedHashes = new Map();
  let batch = firestore.batch();
  let pendingWrites = 0;

  const flush = async () => {
    if (args.apply && pendingWrites > 0) {
      await batch.commit();
    }
    batch = firestore.batch();
    pendingWrites = 0;
  };

  let last = null;
  while (true) {
    let page = firestore.collection('users').orderBy(FieldPath.documentId()).limit(args.pageSize);
    if (last) {
      page = page.startAfter(last);
    }
    const snap = await page.get();
    if (snap.empty) {
      break;
    }
    for (const userDoc of snap.docs) {
      stats.scanned++;
      const data = userDoc.data();
      if (!PRIVATE_USER_FIELDS.some(field => field in data) && Object.keys(collectContentIds(data)).length === 0) {
        continue;
      }
      const profileRef = userDoc.ref.collection('private').doc('profile');
      const existingProfile = (await profileRef.get()).data();
      const plan = planUserCleanup(data, existingProfile, FieldValue);
      if (!plan) {
        continue;
      }
      stats.cleaned++;
      if (plan.removedTokens) {
        stats.tokensRemoved++;
      }
      batch.set(profileRef, plan.profile);
      batch.update(userDoc.ref, plan.publicUpdate);
      pendingWrites += 2;

      if (plan.ksEmail) {
        const hash = hashEmail(plan.ksEmail);
        const claimRef = firestore.collection('ks-emails').doc(hash);
        const claim = claimedHashes.has(hash) ? { uid: claimedHashes.get(hash) } : (await claimRef.get()).data();
        if (!claim) {
          batch.set(claimRef, { uid: userDoc.id });
          claimedHashes.set(hash, userDoc.id);
          pendingWrites++;
          stats.ksClaimed++;
        } else if (claim.uid !== userDoc.id) {
          stats.ksConflicts++;
          console.log(colors.yellow(`  Kickstarter email of ${userDoc.id} is already claimed by ${claim.uid}`));
        }
      }

      if (pendingWrites >= BATCH_LIMIT) {
        await flush();
      }
    }
    last = snap.docs[snap.docs.length - 1];
    console.log(colors.grey(`  ${stats.scanned} users scanned, ${stats.cleaned} to clean`));
  }
  await flush();

  console.log(colors.green(`\n${stats.scanned} users scanned`));
  console.log(`  ${stats.cleaned} documents ${args.apply ? 'cleaned' : 'would be cleaned'}`);
  console.log(`  ${stats.tokensRemoved} with Patreon/Tipeee tokens removed`);
  console.log(`  ${stats.ksClaimed} Kickstarter emails reserved, ${stats.ksConflicts} conflicts`);
  if (!args.apply) {
    console.log(colors.yellow('Dry run: nothing was written. Re-run with --apply.'));
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(colors.red(error.stack || error));
    process.exit(1);
  });
}

module.exports = { planUserCleanup, hashEmail };
