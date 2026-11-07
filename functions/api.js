// StarSteps — Cloudflare Pages Function at /api
// Needs a KV namespace binding called STUDY (Pages project → Settings → Bindings → KV namespace).
// For the admin page, add a secret called ADMIN_KEY (Settings → Variables and Secrets).
// Keys:  fam:<code>       → { salt, hash, rsalt, rhash, family:{kids:[ids], created} }
//        kid:<code>:<id>  → child's progress
//        tok:<token>      → <code>   (sign-in tokens, expire after 1 year)
//        fail:<code>      → wrong-password count (expires after 15 minutes)

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-starsteps': '1' } });
const norm = c => { c = String(c || '').trim().toLowerCase().replace(/\s+/g, ''); return /^[a-z0-9_-]{4,30}$/.test(c) ? c : null; };
const safeId = id => /^[a-z0-9]{6,24}$/.test(String(id || '')) ? String(id) : null;
const rand = n => [...crypto.getRandomValues(new Uint8Array(n))].map(b => b.toString(16).padStart(2, '0')).join('');
async function sha(t) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
async function newToken(KV, code) { const t = rand(24); await KV.put('tok:' + t, code, { expirationTtl: 60 * 60 * 24 * 365 }); return t; }
const MAX_TRIES = 5, LOCK_SECS = 15 * 60;
function recoveryCode() { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', b = crypto.getRandomValues(new Uint8Array(12)); let s = ''; for (let i = 0; i < 12; i++) { s += A[b[i] % A.length]; if (i === 3 || i === 7) s += '-'; } return s; }
const normRec = r => String(r || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
async function setRecovery(fam) { const rc = recoveryCode(); fam.rsalt = rand(16); fam.rhash = await sha(fam.rsalt + ':' + normRec(rc)); return rc; }

async function locked(KV, code) { return Number(await KV.get('fail:' + code) || 0) >= MAX_TRIES; }
async function failed(KV, code) { const n = Number(await KV.get('fail:' + code) || 0) + 1; await KV.put('fail:' + code, String(n), { expirationTtl: LOCK_SECS }); return MAX_TRIES - n; }
async function cleared(KV, code) { if (await KV.get('fail:' + code)) await KV.delete('fail:' + code); }
const lockMsg = () => json({ error: 'Too many wrong tries. Please wait 15 minutes and try again.' }, 429);
const wrongMsg = (left, base = 'Family code or password is not right.') => json({ error: left > 0 ? `${base} ${left} ${left === 1 ? 'try' : 'tries'} left.` : 'Too many wrong tries. Please wait 15 minutes and try again.' }, left > 0 ? 401 : 429);

async function loadKids(KV, code, family) {
  const out = {};
  await Promise.all((family.kids || []).map(async id => { const k = await KV.get(`kid:${code}:${id}`, 'json'); if (k) out[id] = k; }));
  return out;
}
async function listAll(KV, prefix) { let cursor, keys = []; do { const r = await KV.list({ prefix, cursor }); keys = keys.concat(r.keys); cursor = r.list_complete ? null : r.cursor; } while (cursor); return keys; }
async function deleteFamily(KV, code, fam) { await Promise.all((fam.family.kids || []).map(id => KV.delete(`kid:${code}:${id}`))); await KV.delete('fam:' + code); }
const dayKey = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });

export async function onRequestPost({ request, env }) {
  const KV = env.STUDY;
  if (!KV) return json({ error: 'Storage is not connected. Add a KV binding called STUDY to this Pages project, then redeploy.' }, 500);
  let b; try { b = await request.json(); } catch { return json({ error: 'Bad request' }, 400); }
  const a = b.action;

  /* ---- admin (needs ADMIN_KEY secret) ---- */
  if (a === 'admin' || a === 'adminDelete') {
    if (!env.ADMIN_KEY) return json({ error: 'Admin is not set up. Add a secret called ADMIN_KEY in Cloudflare, then redeploy.' }, 500);
    if (await locked(KV, '_admin')) return lockMsg();
    if (String(b.key || '') !== env.ADMIN_KEY) { const left = await failed(KV, '_admin'); return wrongMsg(left, 'Wrong admin key.'); }
    await cleared(KV, '_admin');
    if (a === 'adminDelete') { const code = norm(b.code), fam = code && await KV.get('fam:' + code, 'json'); if (!fam) return json({ error: 'Family not found' }, 404); await deleteFamily(KV, code, fam); return json({ ok: true }); }
    const famKeys = await listAll(KV, 'fam:'), today = dayKey(), families = [];
    let kids = 0, activeToday = 0, savesToday = 0, questionsToday = 0;
    for (const fk of famKeys) {
      const code = fk.name.slice(4), fam = await KV.get(fk.name, 'json'); if (!fam) continue;
      const ks = Object.values(await loadKids(KV, code, fam.family)); let last = null, fToday = 0;
      for (const k of ks) {
        kids++; const h = k.history || []; if (h[0] && (!last || h[0].d > last)) last = h[0].d;
        const t = h.filter(x => x.d === today); fToday += t.length; if (t.length) activeToday++;
        questionsToday += (k.days && k.days[today] && k.days[today].q) || 0;
      }
      savesToday += fToday;
      families.push({ code, kids: ks.length, names: ks.map(k => k.name), created: fam.family.created || null, last, today: fToday, recovery: !!fam.rhash });
    }
    families.sort((x, y) => String(y.last || '').localeCompare(String(x.last || '')));
    return json({ today, families, totals: { families: families.length, kids, activeToday, savesToday, questionsToday } });
  }

  /* ---- sign up / sign in / recover ---- */
  if (a === 'create' || a === 'login' || a === 'recover') {
    const code = norm(b.code);
    if (!code) return json({ error: 'Family code must be 4–30 letters, numbers, - or _ (no spaces).' }, 400);
    const pw = String(b.password || '');
    if (pw.length < 4) return json({ error: (a === 'recover' ? 'New password' : 'Password') + ' must be at least 4 characters.' }, 400);
    const key = 'fam:' + code, fam = await KV.get(key, 'json');
    if (a === 'create') {
      if (fam) return json({ error: 'That family code is already taken — choose another, or sign in.' }, 409);
      const salt = rand(16), rec = { salt, hash: await sha(salt + ':' + pw), family: { kids: [], created: Date.now() } };
      const recovery = await setRecovery(rec);
      await KV.put(key, JSON.stringify(rec));
      return json({ token: await newToken(KV, code), code, family: rec.family, kids: {}, recovery });
    }
    if (a === 'recover') { // separate counter, so a parent locked out by wrong passwords can still recover
      if (await locked(KV, 'r:' + code)) return lockMsg();
      if (!fam || !fam.rhash || await sha(fam.rsalt + ':' + normRec(b.recovery)) !== fam.rhash) return wrongMsg(await failed(KV, 'r:' + code), 'Family code or recovery code is not right.');
      await cleared(KV, 'r:' + code);
      fam.salt = rand(16); fam.hash = await sha(fam.salt + ':' + pw);
      const recovery = await setRecovery(fam); // old recovery code stops working
      await KV.put(key, JSON.stringify(fam)); await cleared(KV, code);
      return json({ token: await newToken(KV, code), code, family: fam.family, kids: await loadKids(KV, code, fam.family), recovery });
    }
    if (await locked(KV, code)) return lockMsg();
    if (!fam || await sha(fam.salt + ':' + pw) !== fam.hash) return wrongMsg(await failed(KV, code));
    await cleared(KV, code);
    return json({ token: await newToken(KV, code), code, family: fam.family, kids: await loadKids(KV, code, fam.family), hasRecovery: !!fam.rhash });
  }

  /* ---- signed-in actions ---- */
  const code = b.token ? await KV.get('tok:' + String(b.token).slice(0, 64)) : null;
  if (!code) return json({ error: 'Please sign in again.', relogin: true }, 401);
  const key = 'fam:' + code, fam = await KV.get(key, 'json');
  if (!fam) return json({ error: 'Please sign in again.', relogin: true }, 401);
  const checkPw = async p => { if (await locked(KV, code)) return lockMsg(); if (await sha(fam.salt + ':' + String(p || '')) !== fam.hash) return wrongMsg(await failed(KV, code), 'That password is not right.'); await cleared(KV, code); return null; };

  switch (a) {
    case 'load': return json({ code, family: fam.family, kids: await loadKids(KV, code, fam.family), hasRecovery: !!fam.rhash });
    case 'getKid': { const id = safeId(b.id); return json({ kid: id ? await KV.get(`kid:${code}:${id}`, 'json') : null }); }
    case 'saveKid': {
      const k = b.kid, id = safeId(k && k.id); if (!id) return json({ error: 'Bad data' }, 400);
      const s = JSON.stringify(k); if (s.length > 2_000_000) return json({ error: 'Progress data too large' }, 413);
      await KV.put(`kid:${code}:${id}`, s);
      if (!fam.family.kids.includes(id)) { fam.family.kids.push(id); await KV.put(key, JSON.stringify(fam)); }
      return json({ ok: true });
    }
    case 'deleteKid': {
      const id = safeId(b.id); if (!id) return json({ error: 'Bad data' }, 400);
      await KV.delete(`kid:${code}:${id}`); fam.family.kids = fam.family.kids.filter(x => x !== id); await KV.put(key, JSON.stringify(fam));
      return json({ ok: true });
    }
    case 'verify': { const e = await checkPw(b.password); return e || json({ ok: true }); }
    case 'password': {
      const e = await checkPw(b.old); if (e) return e;
      const pw = String(b.password || ''); if (pw.length < 4) return json({ error: 'New password must be at least 4 characters.' }, 400);
      fam.salt = rand(16); fam.hash = await sha(fam.salt + ':' + pw); await KV.put(key, JSON.stringify(fam));
      return json({ ok: true });
    }
    case 'newRecovery': { const e = await checkPw(b.password); if (e) return e; const recovery = await setRecovery(fam); await KV.put(key, JSON.stringify(fam)); return json({ recovery }); }
    case 'deleteFamily': { const e = await checkPw(b.password); if (e) return e; await deleteFamily(KV, code, fam); await KV.delete('tok:' + b.token); return json({ ok: true }); }
    case 'logout': await KV.delete('tok:' + b.token); return json({ ok: true });
  }
  return json({ error: 'Unknown action' }, 400);
}

export const onRequestGet = () => json({ ok: true, app: 'StarSteps' });
