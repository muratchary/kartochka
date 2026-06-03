/**
 * Generates the Apple client_secret JWT required by Supabase (Sign in with Apple).
 *
 * The private key (.p8) is NEVER stored in this repo — it lives in the
 * gitignored .secrets/ folder. Run:
 *
 *   node scripts/gen-apple-secret.mjs
 *
 * Override the key path if needed:
 *   APPLE_KEY_PATH=/path/to/AuthKey_XXXX.p8 node scripts/gen-apple-secret.mjs
 *
 * Paste the output into Supabase → Authentication → Providers → Apple → Secret Key.
 * The JWT expires in 6 months — regenerate before it does.
 *
 * Note: TEAM_ID / KEY_ID / CLIENT_ID are identifiers, not secrets — only the
 * .p8 private key is sensitive, which is why it is read from disk, not committed.
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const TEAM_ID   = '787GCXLSTM';
const KEY_ID    = 'LND4MJSSRQ';            // Apple Key ID for the Sign in with Apple key
const CLIENT_ID = 'app.kartochka.signin';  // Services ID

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KEY_PATH =
  process.env.APPLE_KEY_PATH ||
  path.join(__dirname, '..', '.secrets', `AuthKey_${KEY_ID}.p8`);

let PRIVATE_KEY;
try {
  PRIVATE_KEY = fs.readFileSync(KEY_PATH, 'utf8');
} catch {
  console.error(`\n✖ Could not read the Apple key at:\n  ${KEY_PATH}\n` +
    `Place the .p8 there (it is gitignored) or set APPLE_KEY_PATH.\n`);
  process.exit(1);
}

const b64url = (obj) =>
  Buffer.from(typeof obj === 'string' ? obj : JSON.stringify(obj))
    .toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

const now = Math.floor(Date.now() / 1000);
const header  = b64url({ alg: 'ES256', kid: KEY_ID });
const payload = b64url({
  iss: TEAM_ID,
  iat: now,
  exp: now + 15_552_000, // 6 months
  aud: 'https://appleid.apple.com',
  sub: CLIENT_ID,
});

const input = `${header}.${payload}`;
const signer = crypto.createSign('SHA256');
signer.update(input);
const sig = signer.sign({ key: PRIVATE_KEY, dsaEncoding: 'ieee-p1363' }).toString('base64')
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

console.log('\n── Apple client_secret JWT (paste into Supabase → Apple → Secret Key) ──\n');
console.log(`${input}.${sig}`);
console.log('\n── Expires ──\n');
console.log(new Date((now + 15_552_000) * 1000).toDateString());
console.log('');
