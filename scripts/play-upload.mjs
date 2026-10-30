// AAB 하나를 Google Play 내부 테스트 트랙에 올린다. upload-play.sh가 부른다.
// 사용: node play-upload.mjs <aab 경로> <versionCode>
// 환경: PLAY_SERVICE_ACCOUNT(서비스 계정 JSON 경로), PLAY_RELEASE_STATUS(기본 completed)
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';

const PACKAGE = 'nanal.mengle.zen';
const TRACK = 'internal';
const API = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE}`;
const UPLOAD = `https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications/${PACKAGE}`;

const [aabPath, versionCode] = process.argv.slice(2);
if (!aabPath || !versionCode) throw new Error('사용: node play-upload.mjs <aab> <versionCode>');
const status = process.env.PLAY_RELEASE_STATUS || 'completed';
const account = JSON.parse(readFileSync(process.env.PLAY_SERVICE_ACCOUNT, 'utf8'));

// 서비스 계정 키로 서명한 JWT를 액세스 토큰으로 바꾼다.
async function accessToken() {
  const b64 = (v) => Buffer.from(JSON.stringify(v)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: account.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: account.token_uri,
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(account.private_key, 'base64url');
  const res = await fetch(account.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }),
  });
  return (await json(res, '토큰 받기')).access_token;
}

async function json(res, step) {
  const body = await res.text();
  if (!res.ok) throw new Error(`${step} 실패 (${res.status}): ${body}`);
  return body ? JSON.parse(body) : {};
}

const token = await accessToken();
const auth = { Authorization: `Bearer ${token}` };
const call = (url, step, init = {}) =>
  fetch(url, { ...init, headers: { ...auth, 'Content-Type': 'application/json', ...init.headers } }).then((r) => json(r, step));

// 편집(edit)을 열고 → AAB 올리고 → 트랙에 릴리스를 잡고 → 확정한다. 확정 전에 실패하면 Play에는 아무것도 바뀌지 않는다.
const edit = await call(`${API}/edits`, '편집 열기', { method: 'POST', body: '{}' });
const bundle = await call(`${UPLOAD}/edits/${edit.id}/bundles?uploadType=media`, 'AAB 올리기', {
  method: 'POST',
  headers: { 'Content-Type': 'application/octet-stream' },
  body: readFileSync(aabPath),
});
if (String(bundle.versionCode) !== String(versionCode)) {
  throw new Error(`올린 AAB의 versionCode(${bundle.versionCode})가 app.json(${versionCode})과 달라요`);
}
await call(`${API}/edits/${edit.id}/tracks/${TRACK}`, '트랙 지정', {
  method: 'PUT',
  body: JSON.stringify({ track: TRACK, releases: [{ versionCodes: [String(versionCode)], status }] }),
});
await call(`${API}/edits/${edit.id}:commit`, '확정', { method: 'POST' });
console.log(`versionCode ${versionCode} → ${TRACK} 트랙(${status})`);
