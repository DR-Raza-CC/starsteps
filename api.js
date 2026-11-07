// StarSteps — Cloudflare Pages Function at /api
// Needs a KV namespace binding called STUDY (Pages project → Settings → Bindings → KV namespace).
// Keys:  fam:<code>  → { salt, hash, family:{kids:[ids]} }
//        kid:<code>:<id> → child's progress
//        tok:<token> → <code>   (sign-in tokens, expire after 1 year)

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-starsteps': '1' } });
const norm = c => { c = String(c || '').trim().toLowerCase().replace(/\s+/g, ''); return /^[a-z0-9_-]{4,30}$/.test(c) ? c : null; };
const safeId = id => /^[a-z0-9]{6,24}$/.test(String(id || '')) ? String(id) : null;
const rand = n => [...crypto.getRandomValues(new Uint8Array(n))].map(b => b.toString(16).padStart(2, '0')).join('');
async function sha(t) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
async function newToken(KV, code) { const t = rand(24); await KV.put('tok:' + t, code, { expirationTtl: 60 * 60 * 24 * 365 }); return t; }
async function loadKids(KV, code, family) {
  const out = {};
  await Promise.all((family.kids || []).map(async id => { const k = await KV.get(`kid:${code}:${id}`, 'json'); if (k) out[id] = k; }));
  return out;
}

export async function onRequestPost({ request, env }) {
  const KV = env.STUDY;
  if (!KV) return json({ error: 'Storage is not connected. Add a KV binding called STUDY to this Pages project, then redeploy.' }, 500);
  let b; try { b = await request.json(); } catch { return json({ error: 'Bad request' }, 400); }
  const a = b.action;

  if (a === 'create' || a === 'login') {
    const code = norm(b.code);
    if (!code) return json({ error: 'Family code must be 4–30 letters, numbers, - or _ (no spaces).' }, 400);
    const pw = String(b.password || '');
    if (pw.length < 4) return json({ error: 'Password must be at least 4 characters.' }, 400);
    const key = 'fam:' + code, fam = await KV.get(key, 'json');
    if (a === 'create') {
      if (fam) return json({ error: 'That family code is already taken — choose another, or sign in.' }, 409);
      const salt = rand(16), rec = { salt, hash: await sha(salt + ':' + pw), family: { kids: [], created: Date.now() } };
      await KV.put(key, JSON.stringify(rec));
      return json({ token: await newToken(KV, code), code, family: rec.family, kids: {} });
    }
    if (!fam || await sha(fam.salt + ':' + pw) !== fam.hash) return json({ error: 'Family code or password is not right.' }, 401);
    return json({ token: await newToken(KV, code), code, family: fam.family, kids: await loadKids(KV, code, fam.family) });
  }

  const code = b.token ? await KV.get('tok:' + String(b.token).slice(0, 64)) : null;
  if (!code) return json({ error: 'Please sign in again.', relogin: true }, 401);
  const key = 'fam:' + code, fam = await KV.get(key, 'json');
  if (!fam) return json({ error: 'Family not found.', relogin: true }, 401);

  switch (a) {
    case 'load': return json({ code, family: fam.family, kids: await loadKids(KV, code, fam.family) });
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
    case 'verify':
      if (await sha(fam.salt + ':' + String(b.password || '')) !== fam.hash) return json({ error: 'That password is not right.' }, 403);
      return json({ ok: true });
    case 'password': {
      if (await sha(fam.salt + ':' + String(b.old || '')) !== fam.hash) return json({ error: 'Current password is not right.' }, 403);
      const pw = String(b.password || ''); if (pw.length < 4) return json({ error: 'New password must be at least 4 characters.' }, 400);
      fam.salt = rand(16); fam.hash = await sha(fam.salt + ':' + pw); await KV.put(key, JSON.stringify(fam));
      return json({ ok: true });
    }
    case 'logout': await KV.delete('tok:' + b.token); return json({ ok: true });
  }
  return json({ error: 'Unknown action' }, 400);
}

export const onRequestGet = () => json({ ok: true, app: 'StarSteps' });
