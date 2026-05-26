/**
 * Generates the Apple client_secret JWT required by Supabase.
 * Run once: node scripts/gen-apple-secret.mjs
 * The output expires in 6 months — regenerate before it does.
 */
import crypto from 'crypto';

const TEAM_ID   = '787GCXLSTM';
const KEY_ID    = '562R6X7228';
const CLIENT_ID = 'app.kartochka.signin';
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgWSDGzSO0eqPca1bx
AoJD5Jb565cDA3ewRUTTF+xNdfigCgYIKoZIzj0DAQehRANCAARvO+jYZRc+oCee
AnOC2NjHRrvgkskzFcV0z4M3HEj+q0uVpSopDpD/55Olc9Tfij9KHCTIQ4BgnwhU
u9dI00py
-----END PRIVATE KEY-----`;

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
