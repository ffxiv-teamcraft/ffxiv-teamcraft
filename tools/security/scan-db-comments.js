/**
 * Scans the db-comments collection for messages that look like HTML/script injection attempts.
 *
 * Read-only by default: prints a summary and writes a JSON report with every flagged comment.
 *
 * Usage:
 *   gcloud auth application-default login   (or set GOOGLE_APPLICATION_CREDENTIALS to a service account key)
 *   node tools/security/scan-db-comments.js [--project=ffxivteamcraft] [--out=report.json] [--page-size=1000]
 *
 * Options:
 *   --mark-deleted  Soft-delete (deleted: true, same as the in-app delete) every high severity hit
 *                   that isn't deleted yet. Review the report from a read-only run first.
 */
const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');

const SEVERITIES = ['high', 'medium', 'low'];

const DANGEROUS_TAGS = ['script', 'iframe', 'frame', 'frameset', 'object', 'embed', 'svg', 'math', 'img', 'image', 'video', 'audio',
  'source', 'track', 'link', 'meta', 'style', 'base', 'form', 'input', 'button', 'select', 'textarea', 'body', 'details',
  'marquee', 'template', 'noscript', 'isindex'];

const EVENT_HANDLERS = ['error', 'load', 'click', 'dblclick', 'mouse\\w*', 'pointer\\w*', 'focus\\w*', 'blur', 'key\\w*',
  'animation\\w*', 'transition\\w*', 'toggle', 'begin', 'end', 'input', 'change', 'submit', 'wheel', 'touch\\w*', 'drag\\w*',
  'drop', 'copy', 'paste', 'cut', 'scroll', 'resize', 'show', 'auxclick', 'contextmenu', 'beforeinput'];

// FFXIV macro placeholders people paste in comments, e.g. /ac "Innovation" <wait.2> or <t>.
const MACRO_PLACEHOLDERS = /^(t|tt|me|mo|f|c|r|pet|pos|flag|lockon|attack\d|bind\d|stop\d|square|circle|cross|triangle|ignore\d|\d)$/i;

const RULES = [
  {
    id: 'dangerous-tag',
    severity: 'high',
    test: message => new RegExp(`<\\s*/?\\s*(${DANGEROUS_TAGS.join('|')})\\b`, 'i').test(message)
  },
  {
    id: 'event-handler-attribute',
    severity: 'high',
    test: message => new RegExp(`[\\s"'/;]on(${EVENT_HANDLERS.join('|')})\\s*=`, 'i').test(message)
  },
  {
    id: 'dangerous-url-scheme',
    severity: 'high',
    test: message => /\b(javascript|vbscript)\s*:|data\s*:\s*text\/html/i.test(message)
  },
  {
    id: 'html-tag',
    severity: 'medium',
    test: message => [...message.matchAll(/<\s*\/?\s*([a-z][a-z0-9-]*)[\s/>]/gi)]
      .some(([, tag]) => !MACRO_PLACEHOLDERS.test(tag))
  },
  {
    // A quote or angle bracket inside a URL used to break out of the generated href attribute.
    id: 'link-attribute-breakout',
    severity: 'medium',
    test: message => /(?:^|\s)https?:\/\/\S*(['"]\S*=|[<>])/i.test(message)
  },
  {
    id: 'html-entity',
    severity: 'low',
    test: message => /&#x?[0-9a-f]+;?/i.test(message)
  },
  {
    id: 'script-keyword',
    severity: 'low',
    test: message => /(window\.ipc|ipc\.send|document\.cookie|localStorage|sessionStorage|\beval\s*\(|\batob\s*\(|fromCharCode|\bfetch\s*\(|XMLHttpRequest|new\s+Image\b)/i.test(message)
  }
];

/**
 * Returns the rules a message matches and its highest severity (null when nothing matches).
 */
function scanMessage(message) {
  if (typeof message !== 'string' || message.length === 0) {
    return { rules: [], severity: null };
  }
  const matched = RULES.filter(rule => rule.test(message));
  const severity = SEVERITIES.find(level => matched.some(rule => rule.severity === level)) || null;
  return { rules: matched.map(rule => rule.id), severity };
}

function parseArgs(argv) {
  const args = { project: 'ffxivteamcraft', out: null, pageSize: 1000, markDeleted: false };
  argv.forEach(arg => {
    const [key, value] = arg.split('=');
    switch (key) {
      case '--project':
        args.project = value;
        break;
      case '--out':
        args.out = value;
        break;
      case '--page-size':
        args.pageSize = +value;
        break;
      case '--mark-deleted':
        args.markDeleted = true;
        break;
      default:
        throw new Error(`Unknown argument ${arg}`);
    }
  });
  args.out = args.out || `db-comments-scan-${new Date().toISOString().slice(0, 10)}.json`;
  return args;
}

async function* allComments(firestore, FieldPath, pageSize) {
  let last = null;
  while (true) {
    let query = firestore.collection('db-comments').orderBy(FieldPath.documentId()).limit(pageSize);
    if (last) {
      query = query.startAfter(last);
    }
    const snap = await query.get();
    if (snap.empty) {
      return;
    }
    yield* snap.docs;
    last = snap.docs[snap.docs.length - 1];
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { initializeApp, applicationDefault } = require('firebase-admin/app');
  const { getFirestore, FieldPath } = require('firebase-admin/firestore');
  initializeApp({ credential: applicationDefault(), projectId: args.project });
  const firestore = getFirestore();

  console.log(colors.cyan(`Scanning db-comments in ${colors.yellow(args.project)} (read-only${args.markDeleted ? ', then soft-delete high severity hits' : ''})`));

  const hits = [];
  let scanned = 0;
  for await (const doc of allComments(firestore, FieldPath, args.pageSize)) {
    scanned++;
    const data = doc.data();
    const { rules, severity } = scanMessage(data.message);
    if (severity) {
      hits.push({
        id: doc.id,
        severity,
        rules,
        deleted: data.deleted === true,
        author: data.author || null,
        resourceId: data.resourceId || null,
        date: data.date ? new Date(data.date).toISOString() : null,
        message: data.message
      });
    }
    if (scanned % 5000 === 0) {
      console.log(colors.grey(`  ${scanned} comments scanned, ${hits.length} flagged`));
    }
  }

  hits.sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity));
  fs.writeFileSync(path.resolve(args.out), JSON.stringify({ project: args.project, scannedAt: new Date().toISOString(), scanned, hits }, null, 2));

  console.log(colors.green(`\n${scanned} comments scanned`));
  SEVERITIES.forEach(level => {
    const count = hits.filter(hit => hit.severity === level).length;
    const notDeleted = hits.filter(hit => hit.severity === level && !hit.deleted).length;
    console.log(`  ${level.padEnd(6)} ${count} flagged (${notDeleted} still visible)`);
  });
  console.log(colors.green(`Report written to ${colors.yellow(path.resolve(args.out))}`));

  if (args.markDeleted) {
    const toMark = hits.filter(hit => hit.severity === 'high' && !hit.deleted);
    for (let i = 0; i < toMark.length; i += 400) {
      const batch = firestore.batch();
      toMark.slice(i, i + 400).forEach(hit => batch.update(firestore.collection('db-comments').doc(hit.id), { deleted: true }));
      await batch.commit();
    }
    console.log(colors.yellow(`Soft-deleted ${toMark.length} high severity comments`));
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(colors.red(error.stack || error));
    process.exit(1);
  });
}

module.exports = { scanMessage, RULES };
