/**
 * gta6-clipper-01 — entry program.
 *
 * The grader copies this repository to /bot and runs `node main.ts` with
 * MAKEFUN_OUTPUT_DIR pointing at /output. The only contract is simple:
 * VIDEO.json from the repository root must end up at /output/VIDEO.json,
 * byte for byte. The video itself — a vertical GTA 6 Short whose hook is the
 * green supercar moment and whose tail pitches make.fun — is scored by the
 * house reading YouTube, not by anything this program computes.
 *
 * No network calls, no wall clock, no files outside the repository: both
 * runs of the entry write identical bytes.
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const VIDEO_FILE = 'VIDEO.json';
const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function abort(reason: string): never {
  console.error('[gta6-clipper-01] ' + reason);
  process.exit(1);
}

const source = join(BOT_DIR, VIDEO_FILE);
const target = join(OUTPUT_DIR, VIDEO_FILE);

if (!existsSync(source)) {
  abort('missing ' + VIDEO_FILE + ' in ' + BOT_DIR);
}

let raw = '';
try {
  raw = readFileSync(source, 'utf8');
} catch (err) {
  abort('cannot read ' + source + ': ' + (err as Error).message);
}

let payload: { url?: string };
try {
  payload = JSON.parse(raw) as { url?: string };
} catch (err) {
  abort(VIDEO_FILE + ' is not valid JSON: ' + (err as Error).message);
}

// Revised: accept only a real YouTube watch/shorts URL, not just any http(s) string.
if (typeof payload.url !== 'string' || !/^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)/.test(payload.url)) {
  abort(VIDEO_FILE + ' does not hold a YouTube video address');
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(source, target);
} catch (err) {
  abort('cannot write ' + target + ': ' + (err as Error).message);
}

console.log('[gta6-clipper-01] copied ' + source + ' -> ' + target);
