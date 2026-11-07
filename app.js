/* StarSteps Learning — app logic */
'use strict';
const C = window.CONTENT;
const YEARS = C.YEARS;
const yearName = y => y === 'R' ? 'Reception' : 'Year ' + y;
const SUBJ = { maths: { name: 'Maths', icon: '🔢', color: '#6C4CF1' }, english: { name: 'English', icon: '📚', color: '#FF8A3D' } };
const AVATARS = ['🦁', '🐯', '🐼', '🦊', '🐸', '🐵', '🦄', '🐙', '🐨', '🐰', '🐶', '🐱', '🦖', '🐧', '🦉', '🐝'];
const PETS = [{ id: 'dragon', e: '🐉', n: 'Dragon' }, { id: 'unicorn', e: '🦄', n: 'Unicorn' }, { id: 'fox', e: '🦊', n: 'Fox' }, { id: 'panda', e: '🐼', n: 'Panda' }, { id: 'penguin', e: '🐧', n: 'Penguin' }, { id: 'turtle', e: '🐢', n: 'Turtle' }];
const STAGES = [{ n: 'Egg', xp: 0, size: 54 }, { n: 'Baby', xp: 60, size: 58 }, { n: 'Explorer', xp: 200, size: 68 }, { n: 'Hero', xp: 450, size: 78 }, { n: 'Legend', xp: 900, size: 90 }];
const STICKERS = [
  ...'🍩 🍕 🎈 🌈 🍦 🐠 🌻 🍉 🧁 🎨 ⚽ 🚀 🍪 🐞 🌟 🦕 🍭 🎃'.split(' ').map(e => ({ e, r: 'common' })),
  ...'🦋 🐬 🎸 🦜 🏰 🎡 🛸 🌋 🦩 🐳'.split(' ').map(e => ({ e, r: 'rare' })),
  ...'🐲 🧞 🦚 🪐 🧜 🏆'.split(' ').map(e => ({ e, r: 'epic' })),
  ...'💎 👑 🔮'.split(' ').map(e => ({ e, r: 'legendary' }))
].map((s, i) => ({ ...s, id: 's' + i }));
const RARITY = { common: 62, rare: 28, epic: 8, legendary: 2 };
const EGG_COST = 25, TREAT_COST = 10;
const BADGES = [
  { id: 'first', e: '🎯', n: 'First Steps', d: 'Finish your first activity' },
  { id: 's3', e: '🔥', n: 'On Fire', d: '3-day streak' },
  { id: 's7', e: '🌟', n: 'Super Week', d: '7-day streak' },
  { id: 's14', e: '🚀', n: 'Rocket Learner', d: '14-day streak' },
  { id: 's30', e: '👑', n: 'Streak Royalty', d: '30-day streak' },
  { id: 'perfect', e: '💯', n: 'Perfect!', d: 'Score 10/10 in a daily test' },
  { id: 'weekly', e: '🏆', n: 'Week Winner', d: 'Finish a weekly test' },
  { id: 'combo10', e: '⚡', n: 'Lightning', d: 'Get 10 right in a row' },
  { id: 'master1', e: '🎓', n: 'Topic Master', d: 'Master your first topic' },
  { id: 'master5', e: '🧠', n: 'Big Brain', d: 'Master 5 topics' },
  { id: 'master15', e: '🦸', n: 'Super Scholar', d: 'Master 15 topics' },
  { id: 'fix10', e: '🔧', n: 'Mistake Fixer', d: 'Fix 10 tricky questions' },
  { id: 'stick10', e: '📒', n: 'Collector', d: 'Collect 10 different stickers' },
  { id: 'stick25', e: '💎', n: 'Super Collector', d: 'Collect 25 different stickers' },
  { id: 'pethero', e: '🐾', n: 'Pet Hero', d: 'Grow your pet to Hero' }
];
const PRAISE = ['Brilliant!', 'Super!', 'Amazing!', 'You got it!', 'Fantastic!', 'Star work!', 'Nailed it!', 'Awesome!', 'Wow!', 'Spot on!'];
const MASTERY = 9; // out of 10 in daily test to level up

/* ---------- small helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const clone = o => JSON.parse(JSON.stringify(o));
function dayKey(d = new Date()) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function addDays(k, n) { const [y, m, d] = k.split('-').map(Number); return dayKey(new Date(y, m - 1, d + n)); }
function weekKey(d = new Date()) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return dayKey(x); }
function niceDate(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }); }
const ls = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }, del(k) { try { localStorage.removeItem(k); } catch (e) { } } };
function toast(msg, ms = 2600) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), ms); }
function popText(txt) { const p = document.createElement('div'); p.className = 'pop'; p.textContent = txt; document.body.appendChild(p); setTimeout(() => p.remove(), 950); }
function confetti(n = 90) { const box = document.createElement('div'); box.className = 'confetti'; const cs = ['#6C4CF1', '#FF8A3D', '#22C55E', '#FF5FA2', '#FFC93C', '#0EA5E9']; for (let i = 0; i < n; i++) { const s = document.createElement('i'); s.style.left = Math.random() * 100 + '%'; s.style.background = pick(cs); s.style.animationDelay = Math.random() * .7 + 's'; s.style.animationDuration = 1.8 + Math.random() * 1.6 + 's'; box.appendChild(s); } document.body.appendChild(box); setTimeout(() => box.remove(), 4500); }
let AC;
function sound(type) {
  const k = kid(); if (k && k.sound === false) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const N = { good: [660, 880], bad: [260, 200], win: [523, 659, 784, 1047], click: [520], coin: [988, 1319] }[type] || [440];
    N.forEach((f, i) => { const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + i * .11; o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.18, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .26); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + .3); });
  } catch (e) { }
}
function speak(text) {
  try { const s = window.speechSynthesis; if (!s) return toast('Reading aloud is not available on this device'); s.cancel(); const u = new SpeechSynthesisUtterance(String(text).replace(/__+/g, ' blank ').replace(/\?(?=\/)/g, ' what ')); u.lang = 'en-GB'; u.rate = .9; const v = s.getVoices().find(v => v.lang === 'en-GB'); if (v) u.voice = v; s.speak(u); } catch (e) { toast('Reading aloud is not available here'); }
}
async function sha(text) {
  try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
  catch (e) { let h = 5381; for (const c of text) h = (h * 33 ^ c.charCodeAt(0)) >>> 0; return 'x' + h.toString(16); }
}
const normCode = c => String(c || '').trim().toLowerCase().replace(/\s+/g, '');
const codeOK = c => /^[a-z0-9_-]{4,30}$/.test(c);
const normRec = r => String(r || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
function makeRecovery() { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 12; i++) { s += A[Math.floor(Math.random() * A.length)]; if (i === 3 || i === 7) s += '-'; } return s; }

/* ---------- storage: cloud (Cloudflare KV via /api) with a this-device fallback ---------- */
const Local = {
  mem: null,
  db() { if (this.mem) return this.mem; this.mem = ls.get('starsteps_local_v1') || { fams: {}, kids: {}, toks: {} }; return this.mem; },
  save() { ls.set('starsteps_local_v1', this.mem); },
  async call(a, b) {
    const d = this.db();
    if (a === 'admin' || a === 'adminDelete') throw new Error('The admin page only works on your live Cloudflare site.');
    if (a === 'create' || a === 'login' || a === 'recover') {
      const code = normCode(b.code); if (!codeOK(code)) throw new Error('Family code must be 4–30 letters or numbers (no spaces).');
      if (!b.password || String(b.password).length < 4) throw new Error('Password must be at least 4 characters.');
      const f = d.fams[code]; let recovery;
      if (a === 'create') { if (f) throw new Error('That family code is already used on this device — sign in instead.'); const salt = uid(); d.fams[code] = { salt, hash: await sha(salt + ':' + b.password), family: { kids: [], created: Date.now() } }; recovery = await this.setRec(d.fams[code]); }
      else if (a === 'recover') { if (!f || !f.rhash || await sha(f.rsalt + ':' + normRec(b.recovery)) !== f.rhash) throw new Error('Family code or recovery code is not right.'); f.salt = uid(); f.hash = await sha(f.salt + ':' + b.password); recovery = await this.setRec(f); }
      else if (!f || await sha(f.salt + ':' + b.password) !== f.hash) throw new Error('Family code or password is not right.');
      const token = 'l_' + uid(); d.toks[token] = code; this.save();
      return { token, code, family: d.fams[code].family, kids: this.kidsOf(code), recovery, hasRecovery: !!d.fams[code].rhash };
    }
    const code = d.toks[b.token]; if (!code || !d.fams[code]) { const e = new Error('Please sign in again.'); e.relogin = true; throw e; }
    const F = d.fams[code];
    switch (a) {
      case 'load': return { code, family: F.family, kids: this.kidsOf(code), hasRecovery: !!F.rhash };
      case 'newRecovery': if (await sha(F.salt + ':' + b.password) !== F.hash) throw new Error('That password is not right.'); { const recovery = await this.setRec(F); this.save(); return { recovery }; }
      case 'deleteFamily': if (await sha(F.salt + ':' + b.password) !== F.hash) throw new Error('That password is not right.'); for (const id of F.family.kids) delete d.kids[code + ':' + id]; delete d.fams[code]; delete d.toks[b.token]; this.save(); return { ok: true };
      case 'getKid': return { kid: d.kids[code + ':' + b.id] || null };
      case 'saveKid': d.kids[code + ':' + b.kid.id] = b.kid; if (!F.family.kids.includes(b.kid.id)) F.family.kids.push(b.kid.id); this.save(); return { ok: true };
      case 'deleteKid': delete d.kids[code + ':' + b.id]; F.family.kids = F.family.kids.filter(x => x !== b.id); this.save(); return { ok: true };
      case 'verify': if (await sha(F.salt + ':' + b.password) !== F.hash) throw new Error('That password is not right.'); return { ok: true };
      case 'password': if (await sha(F.salt + ':' + b.old) !== F.hash) throw new Error('Current password is not right.'); if (String(b.password).length < 4) throw new Error('New password must be at least 4 characters.'); F.salt = uid(); F.hash = await sha(F.salt + ':' + b.password); this.save(); return { ok: true };
      case 'logout': delete d.toks[b.token]; this.save(); return { ok: true };
    }
    throw new Error('Unknown action');
  },
  async setRec(f) { const rc = makeRecovery(); f.rsalt = uid(); f.rhash = await sha(f.rsalt + ':' + normRec(rc)); return rc; },
  kidsOf(code) { const d = this.db(), o = {}; for (const id of d.fams[code].family.kids) if (d.kids[code + ':' + id]) o[id] = d.kids[code + ':' + id]; return o; }
};
const Backend = {
  mode: null, // 'cloud' | 'local'
  async call(action, body = {}) {
    if (this.mode === 'local') return Local.call(action, body);
    let r, txt;
    try { r = await fetch('/api', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action, ...body }) }); txt = await r.text(); }
    catch (e) { if (this.mode === 'cloud') throw new Error('No internet connection — try again in a moment.'); this.mode = 'local'; return Local.call(action, body); }
    let j = null; try { j = JSON.parse(txt); } catch (e) { }
    if (!j || typeof j !== 'object' || !r.headers.get('x-starsteps')) { if (this.mode === 'cloud') throw new Error('Could not reach the StarSteps server.'); this.mode = 'local'; return Local.call(action, body); }
    this.mode = 'cloud';
    if (!r.ok) { const e = new Error(j.error || 'Something went wrong.'); e.relogin = j.relogin; throw e; }
    return j;
  }
};

/* ---------- state ---------- */
const S = { hasRecovery: true, session: null, family: null, kids: {}, kidId: null, parentOK: 0, parentKid: null, quiz: null, pending: new Set() };
const kid = () => S.kids[S.kidId];
const today = () => dayKey();

function newKid(name, year, subjects, avatar) {
  const k = { id: uid(), name, year, subjects, avatar, created: Date.now(), level: {}, mastered: { maths: [], english: [] }, review: [], history: [], days: {}, streak: { count: 0, best: 0, last: null }, coins: 20, xp: 0, stars: 0, stickers: {}, badges: [], pet: null, weekly: {}, daily: {}, fixed: 0, bestCombo: 0, freeEggs: 1, sound: true };
  return fixKid(k);
}
function fixKid(k) {
  k.level = k.level || {}; k.mastered = k.mastered || { maths: [], english: [] };
  for (const s of ['maths', 'english']) { k.mastered[s] = k.mastered[s] || []; if (!k.level[s]) k.level[s] = { year: k.year, idx: 0 }; }
  for (const f of ['review', 'history', 'badges']) k[f] = k[f] || [];
  for (const f of ['days', 'stickers', 'weekly', 'daily']) k[f] = k[f] || {};
  k.streak = k.streak || { count: 0, best: 0, last: null };
  return k;
}
function topicsFor(subj, year) { return C[subj][year]; }
function curTopic(k, subj) { const L = k.level[subj], T = topicsFor(subj, L.year); return T[Math.min(L.idx, T.length - 1)]; }
function liveStreak(k) { const t = today(); return (k.streak.last === t || k.streak.last === addDays(t, -1)) ? k.streak.count : 0; }
function stageOf(xp) { let s = 0; STAGES.forEach((x, i) => { if (xp >= x.xp) s = i; }); return s; }
function masteredCount(k) { return k.mastered.maths.length + k.mastered.english.length; }

async function saveKid(k = kid()) {
  if (!k) return;
  k.updated = Date.now();
  try { await Backend.call('saveKid', { token: S.session.token, kid: k }); S.pending.delete(k.id); }
  catch (e) { S.pending.add(k.id); if (e.relogin) return signOut(true); toast('⚠️ Not saved yet — will retry: ' + e.message); }
}
window.addEventListener('online', () => { for (const id of S.pending) if (S.kids[id]) saveKid(S.kids[id]); });

/* ---------- router ---------- */
function show(html) { $('#app').innerHTML = html; window.scrollTo(0, 0); }
function modal(html) { closeModal(); const m = document.createElement('div'); m.className = 'modal'; m.id = 'modal'; m.innerHTML = `<div class="card">${html}</div>`; m.addEventListener('click', e => { if (e.target === m) closeModal(); }); document.body.appendChild(m); }
function closeModal() { const m = $('#modal'); if (m) m.remove(); }
const modeBanner = () => Backend.mode === 'local' ? `<div class="banner">📱 <b>This-device mode:</b> progress is saved on this device only. When the app runs on your Cloudflare site, the family code works on every device.</div>` : '';

/* ================= WELCOME / SIGN IN ================= */
let authTab = 'login';
function renderWelcome(msg = '') {
  show(`
  <div class="logo">⭐ Star<span>Steps</span></div>
  <p class="center muted" style="margin-top:-4px">Little steps every day. Big stars for life.</p>
  <div class="card">
    <div class="tabs"><button class="${authTab === 'login' ? 'on' : ''}" onclick="authTab='login';renderWelcome()">Sign in</button><button class="${authTab === 'create' ? 'on' : ''}" onclick="authTab='create';renderWelcome()">New family</button></div>
    ${authTab === 'recover' ? recoverForm() : `<form onsubmit="event.preventDefault();doAuth()">
      <label>Family code</label><input id="fcode" autocomplete="username" autocapitalize="none" placeholder="e.g. husain-family" value="${esc(ls.get('starsteps_lastcode') || '')}">
      <label>Password</label><input id="fpass" type="password" autocomplete="${authTab === 'create' ? 'new-password' : 'current-password'}" placeholder="At least 4 characters">
      ${authTab === 'create' ? '<label>Password again</label><input id="fpass2" type="password" autocomplete="new-password">' : ''}
      <div id="amsg">${msg}</div>
      <button class="btn block ${authTab === 'create' ? 'org' : ''}" style="margin-top:14px" id="abtn">${authTab === 'create' ? '✨ Create our family' : '🚀 Sign in'}</button>
    </form>`}
    ${authTab === 'login' ? `<p class="center" style="margin:12px 0 0"><button class="speak" onclick="authTab='recover';renderWelcome()">🔑 Forgot password?</button></p>` : ''}
  </div>
  <div class="card small muted">
    <b style="color:var(--ink)">How it works</b><br>
    👪 One family code for all your children, on any phone or tablet.<br>
    📖 Each day: a short lesson, a game, then a 10-question daily test.<br>
    🔁 Wrong answers come back until they're mastered.<br>
    🏆 Weekly test, streaks, stickers and a pet to grow. Parents see every result.
  </div>
  <div class="card small muted"><b style="color:var(--ink)">🔒 Privacy</b><br>StarSteps stores only your family code, a scrambled (hashed) password, each child's first name, school year and learning progress. Nothing is shared or sold, and there are no adverts. You can delete your whole family at any time in Parent area → ⚙️ Family.</div>`);
}
function recoverForm() {
  return `<form onsubmit="event.preventDefault();doRecover()">
    <h3 style="margin-top:12px">🔑 Reset your password</h3>
    <p class="small muted">Use the recovery code you saved when you made your family.</p>
    <label>Family code</label><input id="rcode" autocapitalize="none" value="${esc(ls.get('starsteps_lastcode') || '')}">
    <label>Recovery code</label><input id="rrec" autocapitalize="characters" placeholder="XXXX-XXXX-XXXX">
    <label>New password</label><input id="rpass" type="password" autocomplete="new-password">
    <label>New password again</label><input id="rpass2" type="password" autocomplete="new-password">
    <div id="amsg"></div>
    <button class="btn block org" style="margin-top:14px" id="abtn">Reset password</button>
    <p class="center" style="margin:12px 0 0"><button type="button" class="speak" onclick="authTab='login';renderWelcome()">← Back to sign in</button></p>
  </form>`;
}
async function doRecover() {
  const code = normCode($('#rcode').value), rec = $('#rrec').value, pw = $('#rpass').value;
  const fail = m => { $('#amsg').innerHTML = `<div class="err">${esc(m)}</div>`; $('#abtn').disabled = false; };
  if (!codeOK(code)) return fail('Please enter your family code.');
  if (normRec(rec).length !== 12) return fail('The recovery code has 12 letters and numbers, like ABCD-EFGH-JK23.');
  if (pw.length < 4) return fail('New password must be at least 4 characters.');
  if (pw !== $('#rpass2').value) return fail('The two passwords don\'t match.');
  $('#abtn').disabled = true;
  try { const r = await Backend.call('recover', { code, password: pw, recovery: rec }); startSession(r); renderWho(); showRecovery(r.recovery, 'Password changed ✓ Your old recovery code no longer works — here is your new one.'); }
  catch (e) { fail(e.message); }
}
function startSession(r) {
  S.session = { token: r.token, code: r.code, mode: Backend.mode }; ls.set('starsteps_session', S.session); ls.set('starsteps_lastcode', r.code);
  S.family = r.family; S.kids = {}; for (const [id, k] of Object.entries(r.kids || {})) S.kids[id] = fixKid(k);
  S.hasRecovery = r.hasRecovery !== false;
}
function showRecovery(rc, intro) {
  S.hasRecovery = true;
  modal(`<div class="center" style="font-size:48px">🔑</div><h2 class="center">Your recovery code</h2>
  <p class="small">${esc(intro || 'If you ever forget your password, this code lets you reset it.')} <b>Write it down or screenshot it now</b> — it won't be shown again.</p>
  <div style="font-size:28px;font-weight:700;letter-spacing:2px;text-align:center;background:#FFF4CC;border:2px dashed #F3C64B;border-radius:14px;padding:14px;margin:10px 0;user-select:all">${esc(rc)}</div>
  <button class="btn ghost block" onclick="copyText('${esc(rc)}')">📋 Copy code</button>
  <div class="checks"><label><input type="checkbox" onchange="$('#rcdone').disabled=!this.checked"> I've saved my recovery code</label></div>
  <button class="btn block" id="rcdone" disabled onclick="closeModal()">Done</button>`);
}
async function copyText(t) { try { await navigator.clipboard.writeText(t); toast('Copied ✓'); } catch (e) { toast('Press and hold the code to copy it'); } }
async function doAuth() {
  const code = normCode($('#fcode').value), pw = $('#fpass').value;
  const fail = m => { $('#amsg').innerHTML = `<div class="err">${esc(m)}</div>`; $('#abtn').disabled = false; };
  if (!codeOK(code)) return fail('Family code must be 4–30 letters, numbers, - or _ (no spaces).');
  if (pw.length < 4) return fail('Password must be at least 4 characters.');
  if (authTab === 'create' && pw !== $('#fpass2').value) return fail('The two passwords don\'t match.');
  $('#abtn').disabled = true;
  try {
    const r = await Backend.call(authTab, { code, password: pw });
    startSession(r);
    if (authTab === 'create') { S.parentOK = Date.now(); renderParent(); showRecovery(r.recovery, 'Family created! 🎉 Next, add your first child. But first: if you ever forget your password, this code lets you reset it.'); }
    else renderWho();
  } catch (e) { fail(e.message); }
}
async function signOut(expired) {
  try { if (!expired) await Backend.call('logout', { token: S.session.token }); } catch (e) { }
  ls.del('starsteps_session'); Object.assign(S, { session: null, family: null, kids: {}, kidId: null, parentOK: 0 }); Backend.mode = null; authTab = 'login';
  renderWelcome(expired ? '<div class="err">Please sign in again.</div>' : '');
}

/* ================= WHO'S LEARNING ================= */
function kidList() { return (S.family?.kids || []).map(id => S.kids[id]).filter(Boolean); }
function renderWho() {
  S.kidId = null; S.quiz = null;
  const ks = kidList();
  show(`
  <div class="row between"><div class="logo" style="font-size:28px;margin:0">⭐ Star<span>Steps</span></div><span class="chip">👪 ${esc(S.session.code)}</span></div>
  ${modeBanner()}
  <h1 class="center" style="margin-top:18px">Who's learning today?</h1>
  ${ks.length ? `<div class="grid2">${ks.map(k => `<div class="card kid" onclick="openKid('${k.id}')"><div class="avatar">${k.avatar}</div><b style="font-size:21px">${esc(k.name)}</b><span class="small muted">${yearName(k.year)} · 🔥 ${liveStreak(k)}</span>${k.subjects.every(s => k.daily[s] === today()) ? '<span class="small done">✓ Done today</span>' : ''}</div>`).join('')}</div>`
      : `<div class="card center"><div style="font-size:50px">🌱</div><p>No learners yet. A grown-up needs to add a child first.</p></div>`}
  <button class="btn ghost block" style="margin-top:12px" onclick="parentGate()">👪 Parent area</button>
  `);
}
async function openKid(id) {
  S.kidId = id; renderKid();
  try { const r = await Backend.call('getKid', { token: S.session.token, id }); if (r.kid && (r.kid.updated || 0) > (S.kids[id].updated || 0) && !S.pending.has(id)) { S.kids[id] = fixKid(r.kid); if (S.kidId === id && !S.quiz) renderKid(); } } catch (e) { }
}

/* ================= KID HOME ================= */
function renderKid() {
  const k = kid(); if (!k) return renderWho();
  const st = liveStreak(k), rv = k.review.length, wk = weekKey();
  const pet = k.pet ? PETS.find(p => p.id === k.pet.type) : null, sg = stageOf(k.xp), nx = STAGES[sg + 1];
  show(`
  <div class="row between">
    <div class="row"><div class="avatar">${k.avatar}</div><div><h2 style="margin:0">Hi ${esc(k.name)}!</h2><span class="small muted">${yearName(k.year)}</span></div></div>
    <button class="x" onclick="renderWho()" title="Switch learner">⇄</button>
  </div>
  <div class="row wrap" style="margin-top:10px"><span class="chip"><span class="${st ? 'flame' : ''}">🔥</span> ${st} day${st === 1 ? '' : 's'}</span><span class="chip">🪙 ${k.coins}</span><span class="chip">⭐ ${k.stars}</span><span class="chip">🏅 ${k.badges.length}</span></div>
  ${modeBanner()}
  <div class="card row" onclick="renderRewards('pet')" style="cursor:pointer">
    ${pet ? `<div class="pet" style="font-size:${STAGES[sg].size}px">${sg === 0 ? '🥚' : pet.e}${sg === 4 ? '👑' : ''}</div><div class="grow"><b>${esc(k.pet.name)}</b> <span class="small muted">· ${STAGES[sg].n}</span><div class="bar" style="margin:6px 0"><i style="width:${nx ? Math.round((k.xp - STAGES[sg].xp) / (nx.xp - STAGES[sg].xp) * 100) : 100}%"></i></div><span class="small muted">${nx ? `${nx.xp - k.xp} ⭐ until ${nx.n}` : 'Fully grown legend!'}</span></div>`
      : `<div class="pet">🥚</div><div class="grow"><b>Choose your pet buddy!</b><br><span class="small muted">Every star you earn helps it grow.</span></div>`}
  </div>
  ${k.subjects.map(s => {
    const L = k.level[s], T = topicsFor(s, L.year), t = curTopic(k, s), dd = k.daily[s] === today(), wd = k.weekly[s + ':' + wk];
    return `<div class="card subj" style="border-left-color:${SUBJ[s].color}">
      <div class="row between"><h3 style="margin:0">${SUBJ[s].icon} ${SUBJ[s].name}</h3><span class="small muted">${yearName(L.year)} · ${Math.min(L.idx + 1, T.length)}/${T.length}</span></div>
      <p style="margin:6px 0 10px"><span style="font-size:22px">${t.icon}</span> <b>${esc(t.t)}</b></p>
      <div class="grid3">
        <button class="btn sm" onclick="renderLearn('${s}','${t.id}')">📖 Learn &amp; play</button>
        <button class="btn sm ${dd ? 'ghost' : 'grn'}" onclick="preTest('daily','${s}')">${dd ? '✓ Daily' : '📝 Daily test'}</button>
        <button class="btn sm ${wd ? 'ghost' : 'org'}" onclick="preTest('weekly','${s}')">${wd ? `🏆 ${wd.score}/${wd.total}` : '🏆 Weekly'}</button>
      </div></div>`;
  }).join('')}
  ${rv ? `<button class="btn pink block" onclick="startQuiz('review')">🔁 Fix my tricky questions (${rv})</button>` : ''}
  <div class="grid3" style="margin-top:12px">
    <button class="btn ghost sm" onclick="renderRewards('stickers')">🥚 Stickers${k.freeEggs ? ` <span class="pill a">${k.freeEggs}</span>` : ''}</button>
    <button class="btn ghost sm" onclick="renderRewards('badges')">🏅 Badges</button>
    <button class="btn ghost sm" onclick="renderMap()">🗺️ My map</button>
  </div>
  <p class="center small muted" style="margin-top:16px"><button class="speak" onclick="kid().sound=kid().sound===false;saveKid();renderKid()">${k.sound === false ? '🔇 Sound off' : '🔊 Sound on'}</button></p>`);
}

/* ================= LEARN ================= */
function renderLearn(subj, topicId) {
  const t = C.byId[topicId].topic, ex = t.gen();
  const L = t.learn;
  show(`
  <div class="qtop"><button class="x" onclick="renderKid()">✕</button><b class="grow">${SUBJ[subj].icon} Today's lesson</b></div>
  <div class="card">
    <div class="center" style="font-size:56px">${t.icon}</div>
    <h2 class="center">${esc(t.t)}</h2>
    <p style="font-size:19px">${esc(L.say)}</p>
    <div class="learn-eg">👀 ${esc(L.eg)}</div>
    <div class="tip">💡 <b>Top tip:</b> ${esc(L.tip)}</div>
    <p class="center" style="margin-top:10px"><button class="speak" onclick="speak(${esc(JSON.stringify(L.say + '. For example: ' + L.eg + '. Top tip: ' + L.tip))})">🔊 Read it to me</button></p>
  </div>
  <div class="card">
    <b>Try one together:</b>
    ${ex.passage ? `<div class="passage" style="margin-top:8px">${esc(ex.passage)}</div>` : ''}
    ${ex.html ? `<div class="center">${ex.html}</div>` : ''}${ex.visual ? `<div class="vis center">${esc(ex.visual)}</div>` : ''}
    <p style="font-size:20px;white-space:pre-line">${esc(ex.text)}</p>
    <details><summary class="btn ghost sm">👉 Show me the answer</summary><div class="ok" style="font-size:19px">Answer: <b>${esc(ex.answer)}</b>${ex.why ? `<br><span class="small">${esc(ex.why)}</span>` : ''}</div></details>
  </div>
  <button class="btn org block" onclick="startQuiz('play','${subj}','${topicId}')">🎮 Let's play! (10 questions)</button>
  `);
}

/* ================= MAP ================= */
function renderMap() {
  const k = kid();
  show(`<div class="qtop"><button class="x" onclick="renderKid()">✕</button><b class="grow">🗺️ My learning map</b></div>
  ${k.subjects.map(s => { const L = k.level[s]; return `<div class="card"><h3>${SUBJ[s].icon} ${SUBJ[s].name} — ${yearName(L.year)}</h3>${topicsFor(s, L.year).map((t, i) => { const m = k.mastered[s].includes(t.id), cur = i === L.idx, lock = !m && !cur && i > L.idx; return `<div class="topic ${lock ? 'lock' : ''}" ${lock ? '' : `onclick="renderLearn('${s}','${t.id}')" style="cursor:pointer"`}><span class="ic">${t.icon}</span><span class="grow">${esc(t.t)}</span>${m ? '<span class="done">✓</span>' : cur ? '<span class="pill a">Now</span>' : lock ? '🔒' : ''}</div>`; }).join('')}</div>`; }).join('')}
  <p class="center small muted">Score ${MASTERY}/10 in a daily test to unlock the next topic.</p>`);
}

/* ================= QUIZ ENGINE ================= */
function genUnique(topic, n, seen) {
  const out = []; let g = 0;
  while (out.length < n && g++ < n * 25) { const q = topic.gen(); const key = q.text + '|' + (q.visual || '') + '|' + q.answer + '|' + (q.passage || '').slice(0, 20); if (seen.has(key)) continue; seen.add(key); out.push({ q, topicId: topic.id }); }
  while (out.length < n) out.push({ q: topic.gen(), topicId: topic.id });
  return out;
}
function buildItems(mode, subj, topicId) {
  const k = kid(), seen = new Set();
  if (mode === 'play') return genUnique(C.byId[topicId].topic, 10, seen);
  if (mode === 'review') return shuffle(k.review).slice(0, 10).map(r => ({ q: r.q, topicId: r.topicId, rid: r.id, subj: r.subj }));
  const n = mode === 'daily' ? 10 : 20;
  const rv = k.review.filter(r => r.subj === subj).slice(0, mode === 'daily' ? 3 : 6).map(r => ({ q: r.q, topicId: r.topicId, rid: r.id }));
  const cur = curTopic(k, subj), past = k.mastered[subj].filter(id => C.byId[id] && id !== cur.id).map(id => C.byId[id].topic);
  let items = [...rv];
  if (mode === 'daily') {
    const fromPast = past.length ? Math.min(2, n - items.length - 5) : 0;
    for (let i = 0; i < fromPast; i++) items.push(...genUnique(pick(past), 1, seen));
    items.push(...genUnique(cur, n - items.length, seen));
  } else {
    const pool = [...past.slice(-8), cur]; let i = 0;
    while (items.length < n) { items.push(...genUnique(pool[i % pool.length], 1, seen)); i++; }
  }
  return shuffle(items).slice(0, n);
}
function preTest(mode, subj) {
  const k = kid(), t = curTopic(k, subj), wk = k.weekly[subj + ':' + weekKey()], rv = k.review.filter(r => r.subj === subj).length;
  modal(`<div class="center" style="font-size:54px">${mode === 'daily' ? '📝' : '🏆'}</div>
  <h2 class="center">${mode === 'daily' ? 'Daily test' : 'Weekly test'} · ${SUBJ[subj].name}</h2>
  ${mode === 'daily' ? `<p>Today's topic: <b>${t.icon} ${esc(t.t)}</b></p><p>10 questions${rv ? `, including ${Math.min(3, rv)} tricky ones to fix` : ''}. Score <b>${MASTERY} or more</b> to level up! ${k.daily[subj] === today() ? '<br><span class="small muted">You already did today\'s test — this one is extra practice.</span>' : ''}</p>`
      : `<p>20 questions mixing everything you've learnt so far${rv ? ' plus your tricky ones' : ''}.</p>${wk ? `<p class="small muted">You scored ${wk.score}/${wk.total} this week. Your best score is kept.</p>` : '<p class="small muted">Do it once a week — the weekend is perfect!</p>'}`}
  <p class="small muted">Take your time. Paper and pencil are allowed!</p>
  <div class="grid2"><button class="btn ghost" onclick="closeModal()">Not now</button><button class="btn grn" onclick="closeModal();startQuiz('${mode}','${subj}')">Start!</button></div>`);
}
function startQuiz(mode, subj, topicId) {
  const items = buildItems(mode, subj, topicId);
  if (!items.length) return toast('Nothing to fix — great job!');
  S.quiz = { mode, subj, topicId, items, i: 0, results: [], combo: 0, best: 0, typed: '', locked: false, started: Date.now() };
  renderQ();
}
function quitQuiz() { modal(`<h2 class="center">Stop now?</h2><p class="center">Your answers in this round won't be counted.</p><div class="grid2"><button class="btn ghost" onclick="closeModal()">Keep going</button><button class="btn red" onclick="closeModal();S.quiz=null;renderKid()">Stop</button></div>`); }
function renderQ() {
  const Q = S.quiz, it = Q.items[Q.i], q = it.q, n = Q.items.length, play = Q.mode === 'play';
  const emojiChoices = q.choices && q.choices.every(c => /^\p{Extended_Pictographic}/u.test(c));
  const longChoices = q.choices && q.choices.some(c => c.length > 16);
  const top = play
    ? `<div class="track"><i style="width:${Q.i / n * 100}%"></i><span class="rocket" style="left:${Q.i / n * 100}%">🚀</span><span style="position:absolute;right:-6px;top:-12px;font-size:26px">🪐</span></div><span class="combo">${Q.combo > 1 ? '🔥×' + Q.combo : ''}</span>`
    : `<div class="dots">${Q.items.map((_, j) => `<i class="${j < Q.i ? (Q.results[j].ok ? 'c' : 'w') : j === Q.i ? 'n' : ''}"></i>`).join('')}</div><b>${Q.i + 1}/${n}</b>`;
  const label = { play: '🎮 Rocket race', daily: '📝 Daily test', weekly: '🏆 Weekly test', review: '🔁 Fix my tricky questions' }[Q.mode];
  show(`
  <div class="qtop"><button class="x" onclick="quitQuiz()">✕</button>${top}</div>
  <div class="small muted">${label}${it.rid ? ' · <b style="color:var(--pink)">Tricky one!</b>' : ''}</div>
  <div class="card qcard ${play ? 'play' : ''}">
    ${q.passage ? `<div class="passage">${esc(q.passage)}</div>` : ''}
    ${q.html ? `<div>${q.html}</div>` : ''}${q.visual ? `<div class="vis ${q.visual.length <= 3 ? 'big' : ''}">${esc(q.visual)}</div>` : ''}
    <div class="qtext">${esc(q.text)}</div>
    <div style="margin-top:8px"><button class="speak" onclick="speakQ()">🔊 Read</button>${play && (q.hint || C.byId[it.topicId]) ? ` <button class="speak" onclick="hint()">💡 Hint</button>` : ''}</div>
    <div id="hint"></div>
    ${q.choices
      ? `<div class="choices ${longChoices || q.choices.length === 2 && longChoices ? 'one' : ''}">${q.choices.map((c, j) => `<button class="choice ${emojiChoices ? 'emoji' : ''}" data-i="${j}" onclick="choose(${j})">${esc(c)}</button>`).join('')}</div>`
      : `<div class="typed" id="typed">${esc(Q.typed) || '<span class="muted">?</span>'}</div>
         <div class="pad">${['7', '8', '9', '⌫', '4', '5', '6', 'GO', '1', '2', '3', '0', '−', '.'].map(x => x === 'GO' ? `<button class="go" onclick="submitTyped()">✓</button>` : `<button onclick="key('${x}')">${x}</button>`).join('')}</div>`}
    <div id="fb"></div>
  </div>`);
}
function speakQ() { const q = S.quiz.items[S.quiz.i].q; speak((q.passage ? q.passage + '. ' : '') + (q.speak && !q.choices?.includes(q.speak) ? q.speak + '. ' : '') + q.text + (q.choices && q.choices.every(c => /\w/.test(c)) ? '. ' + q.choices.join(', or ') : '')); }
function hint() { const it = S.quiz.items[S.quiz.i]; $('#hint').innerHTML = `<div class="tip" style="margin-top:8px;text-align:left">💡 ${esc(it.q.hint || C.byId[it.topicId].topic.learn.tip)}</div>`; }
function key(x) {
  const Q = S.quiz; if (!Q || Q.locked) return;
  if (x === '⌫') Q.typed = Q.typed.slice(0, -1);
  else if (x === '−') Q.typed = Q.typed.startsWith('-') ? Q.typed.slice(1) : '-' + Q.typed;
  else if (x === '.') { if (!Q.typed.includes('.')) Q.typed += Q.typed ? '.' : '0.'; }
  else if (Q.typed.length < 9) Q.typed += x;
  const t = $('#typed'); if (t) t.innerHTML = esc(Q.typed.replace('-', '−')) || '<span class="muted">?</span>';
}
document.addEventListener('keydown', e => {
  const Q = S.quiz; if (!Q || $('#modal') || document.activeElement?.tagName === 'INPUT') return;
  const q = Q.items[Q.i]?.q; if (!q) return;
  if (Q.locked) { if (e.key === 'Enter' && $('#nextbtn')) $('#nextbtn').click(); return; }
  if (q.choices) { const n = parseInt(e.key); if (n >= 1 && n <= q.choices.length) choose(n - 1); return; }
  if (/^[0-9]$/.test(e.key)) key(e.key); else if (e.key === 'Backspace') key('⌫'); else if (e.key === '-') key('−'); else if (e.key === '.') key('.'); else if (e.key === 'Enter') submitTyped();
});
function choose(j) { const Q = S.quiz; if (Q.locked) return; const q = Q.items[Q.i].q; answer(q.choices[j], j); }
function submitTyped() { const Q = S.quiz; if (Q.locked) return; if (!Q.typed || Q.typed === '-' || Q.typed === '0.') return toast('Type your answer first 🙂'); answer(Q.typed); }
function isRight(q, given) { if (q.choices) return given === q.answer; const a = Number(q.answer), g = Number(String(given).replace('−', '-')); return isFinite(g) && Math.abs(a - g) < 1e-9; }
function answer(given, j) {
  const Q = S.quiz, it = Q.items[Q.i], q = it.q, ok = isRight(q, given), play = Q.mode === 'play' || Q.mode === 'review';
  Q.locked = true; Q.results.push({ ok, given, it });
  if (ok) { Q.combo++; Q.best = Math.max(Q.best, Q.combo); sound('good'); popText(Q.mode === 'play' ? '+1 ⭐' : pick(PRAISE)); } else { Q.combo = 0; sound('bad'); }
  // mark the answer
  if (q.choices) document.querySelectorAll('.choice').forEach((b, x) => { b.disabled = true; const c = q.choices[x]; if (c === q.answer && (ok || play)) b.classList.add('right'); if (x === j && !ok) b.classList.add('wrong'); if (x === j && ok) b.classList.add('right'); });
  else { const t = $('#typed'); t.classList.add(ok ? 'right' : 'wrong'); }
  if (!play) { setTimeout(nextQ, ok ? 650 : 900); return; } // tests: corrections shown at the end
  if (ok) { $('#fb').innerHTML = `<div class="fb good">🎉 <b>${pick(PRAISE)}</b>${Q.combo >= 3 ? ` ${Q.combo} in a row!` : ''}</div>`; setTimeout(nextQ, 900); }
  else $('#fb').innerHTML = `<div class="fb bad">The answer is <b>${esc(q.answer)}</b>.${q.why ? `<br><span class="small">${esc(q.why)}</span>` : ''}<br><span class="small muted">Don't worry — this one will come back so you can get it next time!</span><button class="btn block" id="nextbtn" style="margin-top:10px" onclick="nextQ()">Got it 👍</button></div>`;
}
function nextQ() { const Q = S.quiz; if (!Q) return; Q.i++; Q.typed = ''; Q.locked = false; if (Q.i >= Q.items.length) finishQuiz(); else renderQ(); }

/* ---------- results, rewards, streaks, mastery ---------- */
function addReview(k, subj, q, topicId) {
  const ex = k.review.find(r => r.q.text === q.text && r.q.answer === q.answer && (r.q.passage || '') === (q.passage || ''));
  if (ex) { ex.right = 0; return; }
  k.review.push({ id: uid(), subj, topicId, q, right: 0, added: Date.now() });
  if (k.review.length > 60) k.review.shift();
}
function finishQuiz() {
  const Q = S.quiz, k = kid(), t = today(), score = Q.results.filter(r => r.ok).length, total = Q.results.length;
  const subjOf = it => it.subj || Q.subj || (C.byId[it.topicId] || {}).subj;
  const rewards = [];
  // review queue
  for (const r of Q.results) {
    if (r.it.rid) { const item = k.review.find(x => x.id === r.it.rid); if (item) { if (r.ok) { item.right++; if (item.right >= 2) { k.review = k.review.filter(x => x !== item); k.fixed++; } } else item.right = 0; } }
    else if (!r.ok) addReview(k, subjOf(r.it), r.it.q, r.it.topicId);
  }
  // stars, coins, xp
  const perQ = Q.mode === 'play' || Q.mode === 'review' ? 1 : 2;
  let coins = score * perQ + (Q.mode === 'daily' ? 5 : Q.mode === 'weekly' ? 15 : 0);
  if (score === total && total >= 10) { coins += 10; rewards.push(['💯', 'Perfect score bonus: +10 🪙']); }
  const oldStage = stageOf(k.xp);
  k.stars += score; k.xp += score; k.coins += coins; k.bestCombo = Math.max(k.bestCombo || 0, Q.best);
  // activity
  const d = k.days[t] = k.days[t] || { q: 0, c: 0 }; d.q += total; d.c += score;
  for (const key of Object.keys(k.days)) if (key < addDays(t, -70)) delete k.days[key];
  let levelUp = null, streakMsg = null;
  const curName = Q.subj && Q.mode === 'daily' ? curTopic(k, Q.subj).t : '';
  if (Q.mode === 'daily') {
    const first = k.daily[Q.subj] !== t; k.daily[Q.subj] = t; d.dt = true;
    if (k.streak.last !== t) { k.streak.count = k.streak.last === addDays(t, -1) ? k.streak.count + 1 : 1; k.streak.last = t; k.streak.best = Math.max(k.streak.best, k.streak.count); const s = k.streak.count; streakMsg = s; const M = { 3: 20, 7: 50, 14: 100, 30: 200, 50: 300, 100: 500 }; if (M[s]) { k.coins += M[s]; k.freeEggs = (k.freeEggs || 0) + 1; rewards.push(['🎁', `${s}-day streak chest: +${M[s]} 🪙 and a free sticker egg!`]); } }
    if (score >= MASTERY) {
      const L = k.level[Q.subj], T = topicsFor(Q.subj, L.year), cur = T[Math.min(L.idx, T.length - 1)];
      if (!k.mastered[Q.subj].includes(cur.id)) k.mastered[Q.subj].push(cur.id);
      if (L.idx < T.length - 1) { L.idx++; levelUp = `Next topic unlocked: ${T[L.idx].icon} ${T[L.idx].t}`; }
      else { const yi = YEARS.indexOf(L.year); if (yi < YEARS.length - 1) { L.year = YEARS[yi + 1]; L.idx = 0; levelUp = `You finished ${yearName(YEARS[yi])}! Welcome to ${yearName(L.year)} 🎓`; } else levelUp = 'You have mastered every topic! You are a StarSteps Champion 🏆'; }
      k.coins += 10; rewards.push(['🎓', 'Topic mastered: +10 🪙']);
    }
    if (!first) streakMsg = null;
  }
  if (Q.mode === 'weekly') { const wk = Q.subj + ':' + weekKey(), prev = k.weekly[wk]; if (!prev || score > prev.score) k.weekly[wk] = { score, total, at: t }; }
  // history (for parents)
  k.history.unshift({ at: Date.now(), d: t, mode: Q.mode, subj: Q.subj || 'mixed', topic: Q.mode === 'play' ? C.byId[Q.topicId].topic.t : Q.mode === 'daily' ? curName : Q.mode === 'weekly' ? 'Weekly mix' : 'Tricky questions', score, total, secs: Math.round((Date.now() - Q.started) / 1000), wrong: Q.results.filter(r => !r.ok).map(r => ({ t: r.it.q.text, a: r.it.q.answer, g: r.given })).slice(0, 20) });
  k.history = k.history.slice(0, 250);
  const newStage = stageOf(k.xp);
  if (k.pet && newStage > oldStage) rewards.push([PETS.find(p => p.id === k.pet.type).e, `${k.pet.name} grew into a ${STAGES[newStage].n}!`]);
  const badges = checkBadges(k);
  saveKid(k);
  renderResults({ score, total, coins, levelUp, streakMsg, rewards, badges });
}
function checkBadges(k) {
  const have = new Set(k.badges), nSt = Object.keys(k.stickers).length, mc = masteredCount(k);
  const cond = { first: k.history.length > 0, s3: k.streak.best >= 3, s7: k.streak.best >= 7, s14: k.streak.best >= 14, s30: k.streak.best >= 30, perfect: k.history.some(h => h.mode === 'daily' && h.score === h.total && h.total >= 10), weekly: k.history.some(h => h.mode === 'weekly'), combo10: (k.bestCombo || 0) >= 10, master1: mc >= 1, master5: mc >= 5, master15: mc >= 15, fix10: k.fixed >= 10, stick10: nSt >= 10, stick25: nSt >= 25, pethero: !!k.pet && stageOf(k.xp) >= 3 };
  const out = []; for (const b of BADGES) if (!have.has(b.id) && cond[b.id]) { k.badges.push(b.id); out.push(b); }
  return out;
}
function renderResults(R) {
  const Q = S.quiz, pct = R.score / R.total, starsN = pct >= .9 ? 3 : pct >= .6 ? 2 : pct > 0 ? 1 : 0;
  const wrong = Q.results.filter(r => !r.ok);
  const title = pct === 1 ? 'PERFECT!' : pct >= .9 ? 'Superstar!' : pct >= .6 ? 'Great effort!' : 'Good try — keep going!';
  S.quiz = null;
  show(`
  <div class="card center" style="margin-top:18px">
    <div class="stars">${'⭐'.repeat(starsN)}${'☆'.repeat(3 - starsN)}</div>
    <h1>${title}</h1>
    <div class="big-score">${R.score}/${R.total}</div>
    <p class="muted">${{ play: 'Rocket race', daily: 'Daily test', weekly: 'Weekly test', review: 'Tricky questions' }[Q.mode]}${Q.best >= 3 ? ` · Best combo 🔥${Q.best}` : ''}</p>
  </div>
  <div class="reward"><b>🪙</b><span>+${R.coins} coins · +${R.score} ⭐</span></div>
  ${R.streakMsg ? `<div class="reward"><b class="flame">🔥</b><span>${R.streakMsg}-day streak! Come back tomorrow to keep it going.</span></div>` : ''}
  ${R.levelUp ? `<div class="reward" style="background:#E9E3FF"><b>🚀</b><span>LEVEL UP! ${esc(R.levelUp)}</span></div>` : Q.mode === 'daily' ? `<div class="reward" style="background:#F1EADC"><b>🎯</b><span>Score ${MASTERY}/10 to unlock the next topic. You can do it!</span></div>` : ''}
  ${R.rewards.map(([e, t]) => `<div class="reward"><b>${e}</b><span>${esc(t)}</span></div>`).join('')}
  ${R.badges.map(b => `<div class="reward" style="background:#DCFCE7"><b>${b.e}</b><span>New badge: ${esc(b.n)}!</span></div>`).join('')}
  ${wrong.length && Q.mode !== 'play' && Q.mode !== 'review' ? `<div class="card"><h3>🔧 Let's fix these</h3>${wrong.map(r => `<div style="padding:8px 0;border-bottom:1px dashed var(--line)"><div style="white-space:pre-line">${esc(r.it.q.text)}</div><span class="small">You said <b style="color:var(--red)">${esc(String(r.given).replace('-', '−'))}</b> · Answer <b style="color:var(--grn)">${esc(r.it.q.answer)}</b></span>${r.it.q.why ? `<div class="small muted">${esc(r.it.q.why)}</div>` : ''}</div>`).join('')}<p class="small muted">These will come back in your next tests until you get them right twice.</p></div>` : ''}
  <div class="grid2" style="margin-top:12px">
    ${Q.mode === 'play' ? `<button class="btn org" onclick="startQuiz('play','${Q.subj}','${Q.topicId}')">🔁 Play again</button><button class="btn grn" onclick="preTest('daily','${Q.subj}')">📝 Daily test</button>` : `<button class="btn ghost" onclick="renderRewards('stickers')">🥚 Spend coins</button><button class="btn" onclick="renderKid()">🏠 Home</button>`}
  </div>
  ${Q.mode === 'play' ? `<button class="btn ghost block" style="margin-top:10px" onclick="renderKid()">🏠 Home</button>` : ''}`);
  if (starsN >= 2) { confetti(starsN === 3 ? 140 : 70); sound('win'); }
}

/* ================= REWARDS ================= */
function renderRewards(tab = 'stickers') {
  const k = kid(), have = Object.keys(k.stickers).length;
  const pet = k.pet ? PETS.find(p => p.id === k.pet.type) : null, sg = stageOf(k.xp);
  show(`
  <div class="qtop"><button class="x" onclick="renderKid()">✕</button><b class="grow">🎁 My rewards</b><span class="chip">🪙 ${k.coins}</span></div>
  <div class="tabs">${[['stickers', '🥚 Stickers'], ['pet', '🐾 Pet'], ['badges', '🏅 Badges']].map(([id, n]) => `<button class="${tab === id ? 'on' : ''}" onclick="renderRewards('${id}')">${n}</button>`).join('')}</div>
  ${tab === 'stickers' ? `
    <div class="card center"><div style="font-size:70px">🥚</div><p><b>Mystery sticker egg</b><br><span class="small muted">Could be common, rare, epic… or LEGENDARY!</span></p>
      ${k.freeEggs ? `<button class="btn pink block" onclick="openEgg(true)">🎁 Open free egg (${k.freeEggs})</button>` : ''}
      <button class="btn org block" style="margin-top:8px" ${k.coins < EGG_COST ? 'disabled' : ''} onclick="openEgg(false)">Open egg · ${EGG_COST} 🪙</button>
      ${k.coins < EGG_COST && !k.freeEggs ? `<p class="small muted">Earn ${EGG_COST - k.coins} more coins by learning!</p>` : ''}
    </div>
    <div class="card"><div class="row between"><h3 style="margin:0">Sticker album</h3><span class="small muted">${have}/${STICKERS.length}</span></div><div class="album" style="margin-top:10px">${STICKERS.map(s => k.stickers[s.id] ? `<div class="stk have ${s.r}">${s.e}${k.stickers[s.id] > 1 ? `<small>×${k.stickers[s.id]}</small>` : ''}</div>` : `<div class="stk ${s.r === 'legendary' ? 'legendary' : ''}" style="opacity:.5">❔</div>`).join('')}</div><p class="small muted">Blue = rare · Purple = epic · Gold = legendary</p></div>` : ''}
  ${tab === 'pet' ? (pet ? `
    <div class="card center"><div class="pet" style="font-size:${STAGES[sg].size + 20}px">${sg === 0 ? '🥚' : pet.e}${sg === 4 ? '👑' : ''}</div><h2>${esc(k.pet.name)}</h2><p class="muted">${STAGES[sg].n} ${pet.n} · ${k.xp} ⭐</p>
      <div class="row" style="justify-content:center;gap:6px">${STAGES.map((s, i) => `<span class="pill ${i <= sg ? 'g' : ''}" style="${i > sg ? 'background:#F1EADC;color:#9a93b0' : ''}">${s.n}</span>`).join('')}</div>
      ${STAGES[sg + 1] ? `<p class="small muted">${STAGES[sg + 1].xp - k.xp} more ⭐ to become a ${STAGES[sg + 1].n}</p>` : '<p>Your pet is a LEGEND! 👑</p>'}
      <button class="btn org block" ${k.coins < TREAT_COST ? 'disabled' : ''} onclick="feedPet()">🍪 Give a treat · ${TREAT_COST} 🪙 (+25 ⭐ growth)</button>
    </div>` : `<div class="card"><h3 class="center">Choose your pet buddy</h3><div class="grid3">${PETS.map(p => `<button class="btn ghost" style="font-size:40px;flex-direction:column;padding:10px" onclick="choosePet('${p.id}')">${p.e}<span style="font-size:14px">${p.n}</span></button>`).join('')}</div><p class="small muted center">Your pet starts as an egg and grows with every star you earn!</p></div>`) : ''}
  ${tab === 'badges' ? `<div class="card">${BADGES.map(b => `<div class="badge ${k.badges.includes(b.id) ? '' : 'lock'}"><span class="e">${b.e}</span><div><b>${esc(b.n)}</b><br><span class="small muted">${esc(b.d)}</span></div></div>`).join('')}</div>` : ''}`);
}
function rollSticker() { let r = Math.random() * 100, rar = 'common'; for (const [k, w] of Object.entries(RARITY)) { if (r < w) { rar = k; break; } r -= w; } return pick(STICKERS.filter(s => s.r === rar)); }
function openEgg(free) {
  const k = kid();
  if (free) { if (!k.freeEggs) return; k.freeEggs--; } else { if (k.coins < EGG_COST) return; k.coins -= EGG_COST; }
  const s = rollSticker(), isNew = !k.stickers[s.id]; k.stickers[s.id] = (k.stickers[s.id] || 0) + 1;
  const badges = checkBadges(k); saveKid(k); sound('click');
  modal(`<div class="egg">🥚</div><p class="center muted">Crack… crack…</p>`);
  setTimeout(() => {
    sound(s.r === 'common' ? 'coin' : 'win'); if (s.r !== 'common') confetti(s.r === 'legendary' ? 200 : 100);
    modal(`<div class="reveal">${s.e}</div><h2 class="center" style="text-transform:capitalize">${s.r}${s.r === 'legendary' ? '!!!' : s.r === 'epic' ? '!!' : '!'}</h2><p class="center">${isNew ? 'A brand-new sticker for your album!' : 'You already have this one — now you have ' + k.stickers[s.id] + '!'}</p>${badges.map(b => `<div class="reward" style="background:#DCFCE7"><b>${b.e}</b><span>New badge: ${esc(b.n)}!</span></div>`).join('')}<button class="btn block" onclick="closeModal();renderRewards('stickers')">Yay! 🎉</button>`);
  }, 1300);
}
function choosePet(type) {
  const p = PETS.find(x => x.id === type);
  modal(`<div class="center" style="font-size:70px">${p.e}</div><h2 class="center">Name your ${p.n}</h2><form onsubmit="event.preventDefault();namePet('${type}')"><input id="petname" maxlength="16" placeholder="e.g. Sparkle" autofocus><button class="btn block" style="margin-top:12px">Hatch my pet! 🥚</button></form>`);
}
function namePet(type) { const k = kid(), n = ($('#petname').value || '').trim() || PETS.find(x => x.id === type).n; k.pet = { type, name: n.slice(0, 16) }; saveKid(k); closeModal(); confetti(60); sound('win'); renderRewards('pet'); }
function feedPet() { const k = kid(); if (k.coins < TREAT_COST) return; const o = stageOf(k.xp); k.coins -= TREAT_COST; k.xp += 25; sound('coin'); popText('😋 +25'); const n = stageOf(k.xp); if (n > o) { confetti(120); sound('win'); toast(`${k.pet.name} grew into a ${STAGES[n].n}!`); } checkBadges(k); saveKid(k); renderRewards('pet'); }

/* ================= PARENT AREA ================= */
function parentGate() {
  if (Date.now() - S.parentOK < 15 * 60 * 1000) return renderParent();
  modal(`<h2 class="center">👪 Parents only</h2><p class="center small muted">Enter your family password.</p><form onsubmit="event.preventDefault();checkParent()"><input id="ppass" type="password" autocomplete="current-password" autofocus><div id="pmsg"></div><div class="grid2" style="margin-top:12px"><button type="button" class="btn ghost" onclick="closeModal()">Cancel</button><button class="btn">Open</button></div></form>`);
}
async function checkParent() {
  try { await Backend.call('verify', { token: S.session.token, password: $('#ppass').value }); S.parentOK = Date.now(); closeModal(); renderParent(); }
  catch (e) { if (e.relogin) { closeModal(); return signOut(true); } $('#pmsg').innerHTML = `<div class="err">${esc(e.message)}</div>`; }
}
function pct(s, t) { return t ? Math.round(s / t * 100) : 0; }
function pillFor(p) { return `<span class="pill ${p >= 90 ? 'g' : p >= 60 ? 'a' : 'r'}">${p}%</span>`; }
function renderParent(tab) {
  S.parentOK = Date.now();
  const ks = kidList(); if (tab) S.parentKid = tab; if (S.parentKid !== 'add' && S.parentKid !== 'family' && !ks.find(k => k.id === S.parentKid)) S.parentKid = ks[0]?.id || 'add';
  const sel = S.parentKid;
  show(`
  <div class="row between"><h1 style="margin:0">👪 Parent area</h1><button class="btn sm" onclick="S.parentOK=0;renderWho()">🧒 Kids mode</button></div>
  ${modeBanner()}
  <div class="kidtabs" style="margin-top:12px">${ks.map(k => `<button class="${sel === k.id ? 'on' : ''}" onclick="renderParent('${k.id}')">${k.avatar} ${esc(k.name)}</button>`).join('')}<button class="${sel === 'add' ? 'on' : ''}" onclick="renderParent('add')">➕ Add child</button><button class="${sel === 'family' ? 'on' : ''}" onclick="renderParent('family')">⚙️ Family</button></div>
  ${sel === 'add' ? childForm() : sel === 'family' ? familyPanel() : kidReport(S.kids[sel])}`);
}
function childForm(k) {
  const av = k?.avatar || pick(AVATARS);
  return `<div class="card"><h2>${k ? 'Edit ' + esc(k.name) : 'Add a child'}</h2>
  <form onsubmit="event.preventDefault();saveChildForm(${k ? `'${k.id}'` : ''})">
    <label>Name</label><input id="cname" maxlength="20" value="${esc(k?.name || '')}" placeholder="First name" required>
    <label>School year</label><select id="cyear">${YEARS.map(y => `<option value="${y}" ${(k?.year || '3') === y ? 'selected' : ''}>${yearName(y)}</option>`).join('')}</select>
    ${k ? `<div class="checks"><label><input type="checkbox" id="cmove"> Also restart lessons at this year</label></div>` : ''}
    <label>Subjects</label><div class="checks">${Object.entries(SUBJ).map(([s, v]) => `<label><input type="checkbox" class="csub" value="${s}" ${!k || k.subjects.includes(s) ? 'checked' : ''}> ${v.icon} ${v.name}</label>`).join('')}</div>
    <label>Avatar</label><input type="hidden" id="cav" value="${av}"><div class="avpick">${AVATARS.map(a => `<button type="button" class="${a === av ? 'on' : ''}" onclick="document.querySelectorAll('.avpick button').forEach(b=>b.classList.remove('on'));this.classList.add('on');$('#cav').value='${a}'">${a}</button>`).join('')}</div>
    <div id="cmsg"></div>
    <button class="btn grn block" style="margin-top:14px">${k ? 'Save changes' : '✨ Add child'}</button>
  </form></div>`;
}
async function saveChildForm(id) {
  const name = $('#cname').value.trim(), year = $('#cyear').value, subjects = [...document.querySelectorAll('.csub:checked')].map(x => x.value), avatar = $('#cav').value;
  if (!name) return ($('#cmsg').innerHTML = '<div class="err">Please enter a name.</div>');
  if (!subjects.length) return ($('#cmsg').innerHTML = '<div class="err">Pick at least one subject.</div>');
  let k;
  if (id) { k = S.kids[id]; const move = $('#cmove')?.checked; Object.assign(k, { name, year, subjects, avatar }); fixKid(k); if (move) for (const s of subjects) k.level[s] = { year, idx: 0 }; }
  else { k = newKid(name, year, subjects, avatar); S.kids[k.id] = k; if (!S.family.kids.includes(k.id)) S.family.kids.push(k.id); }
  await saveKid(k); toast(id ? 'Saved ✓' : `${name} added! 🎉`); renderParent(k.id);
}
function kidReport(k) {
  const t = today(), days = Array.from({ length: 14 }, (_, i) => addDays(t, i - 13)), mx = Math.max(10, ...days.map(d => k.days[d]?.q || 0));
  const w7 = days.slice(7).map(d => k.days[d] || { q: 0, c: 0 }), wq = w7.reduce((s, d) => s + d.q, 0), wc = w7.reduce((s, d) => s + d.c, 0), active = w7.filter(d => d.q).length;
  const wk = weekKey(), byTopic = {};
  for (const r of k.review) { const nm = C.byId[r.topicId]?.topic.t || r.topicId; (byTopic[nm] = byTopic[nm] || []).push(r); }
  return `
  <div class="card"><div class="row"><div class="avatar">${k.avatar}</div><div class="grow"><h2 style="margin:0">${esc(k.name)}</h2><span class="muted small">${yearName(k.year)} · ${k.subjects.map(s => SUBJ[s].name).join(' & ')}</span></div></div>
    <div class="grid3" style="margin-top:12px;text-align:center">
      <div><div style="font-size:26px;font-weight:700">🔥 ${liveStreak(k)}</div><span class="small muted">streak (best ${k.streak.best})</span></div>
      <div><div style="font-size:26px;font-weight:700">${pct(wc, wq)}%</div><span class="small muted">correct this week</span></div>
      <div><div style="font-size:26px;font-weight:700">${active}/7</div><span class="small muted">days active</span></div>
    </div>
    <div class="chart" style="margin-top:12px">${days.map(d => `<div><i class="${k.days[d]?.dt ? 'd' : ''}" style="height:${(k.days[d]?.q || 0) / mx * 85}%"></i>${'MTWTFSS'[(new Date(...d.split('-').map((x, i) => i === 1 ? x - 1 : +x)).getDay() + 6) % 7]}</div>`).join('')}</div>
    <p class="small muted">Questions answered per day, last 14 days. <span style="color:var(--grn);font-weight:700">Green</span> = daily test done.</p>
    <button class="btn ghost sm block" onclick="copyReport('${k.id}')">📋 Copy weekly report (for WhatsApp / email)</button>
  </div>
  ${k.subjects.map(s => { const L = k.level[s], T = topicsFor(s, L.year), c = curTopic(k, s), w = k.weekly[s + ':' + wk], last = k.history.find(h => h.mode === 'daily' && h.subj === s); return `<div class="card subj" style="border-left-color:${SUBJ[s].color}"><h3>${SUBJ[s].icon} ${SUBJ[s].name}</h3>
    <p>Working on <b>${yearName(L.year)}</b> · topic ${Math.min(L.idx + 1, T.length)} of ${T.length}: <b>${c.icon} ${esc(c.t)}</b></p>
    <div class="bar"><i style="width:${Math.round(T.filter(x => k.mastered[s].includes(x.id)).length / T.length * 100)}%"></i></div>
    <p class="small muted">${k.mastered[s].length} topic${k.mastered[s].length === 1 ? "" : "s"} mastered in total · Daily test today: ${k.daily[s] === t ? '<span class="done">done ✓</span>' : 'not yet'} · Weekly test: ${w ? `<b>${w.score}/${w.total}</b>` : 'not yet'}${last ? ` · Last daily: ${last.score}/${last.total}` : ''}</p></div>`; }).join('')}
  <div class="card"><h3>📊 Recent results</h3>${k.history.length ? `<table><tr><th>Date</th><th>Activity</th><th>Score</th></tr>${k.history.slice(0, 20).map((h, i) => `<tr onclick="showWrong('${k.id}',${i})" style="cursor:pointer"><td class="small">${niceDate(h.d)}</td><td>${{ play: '🎮', daily: '📝', weekly: '🏆', review: '🔁' }[h.mode]} ${esc(h.subj === 'mixed' ? 'Mixed' : SUBJ[h.subj]?.name || '')}<br><span class="small muted">${esc(h.topic)}</span></td><td>${h.score}/${h.total} ${pillFor(pct(h.score, h.total))}</td></tr>`).join('')}</table><p class="small muted">Tap a row to see the questions they got wrong.</p>` : '<p class="muted">No activity yet.</p>'}</div>
  <div class="card"><h3>🔁 Tricky questions (${k.review.length})</h3>${k.review.length ? Object.entries(byTopic).map(([nm, rs]) => `<details style="margin:6px 0"><summary>${esc(nm)} <span class="pill a">${rs.length}</span></summary>${rs.map(r => `<div class="small" style="padding:6px 0;border-bottom:1px dashed var(--line);white-space:pre-line">${esc(r.q.text)} → <b>${esc(r.q.answer)}</b></div>`).join('')}</details>`).join('') + '<p class="small muted">Each one must be answered right twice before it leaves the list.</p>' : '<p class="muted">Nothing to fix right now 🎉</p>'}</div>
  <details class="card"><summary>⚙️ Settings for ${esc(k.name)}</summary>
    ${childForm(k)}
    <div class="card"><h3>Set the starting point</h3><p class="small muted">Move ${esc(k.name)} to a different year or topic (like a Kumon level check).</p>
      ${k.subjects.map(s => `<label>${SUBJ[s].icon} ${SUBJ[s].name}</label><div class="grid2"><select id="ly-${s}" onchange="fillTopics('${s}')">${YEARS.map(y => `<option value="${y}" ${k.level[s].year === y ? 'selected' : ''}>${yearName(y)}</option>`).join('')}</select><select id="lt-${s}">${topicsFor(s, k.level[s].year).map((t, i) => `<option value="${i}" ${k.level[s].idx === i ? 'selected' : ''}>${i + 1}. ${esc(t.t)}</option>`).join('')}</select></div>`).join('')}
      <button class="btn block" style="margin-top:12px" onclick="setLevel('${k.id}')">Save starting point</button></div>
    <div class="grid2"><button class="btn ghost" onclick="resetKid('${k.id}')">↺ Reset progress</button><button class="btn red" onclick="delKid('${k.id}')">🗑 Remove</button></div>
  </details>`;
}
function fillTopics(s) { const y = $('#ly-' + s).value; $('#lt-' + s).innerHTML = topicsFor(s, y).map((t, i) => `<option value="${i}">${i + 1}. ${esc(t.t)}</option>`).join(''); }
async function setLevel(id) { const k = S.kids[id]; for (const s of k.subjects) k.level[s] = { year: $('#ly-' + s).value, idx: Number($('#lt-' + s).value) }; await saveKid(k); toast('Starting point saved ✓'); renderParent(id); }
function showWrong(id, i) { const h = S.kids[id].history[i]; modal(`<h3>${{ play: '🎮 Practice', daily: '📝 Daily test', weekly: '🏆 Weekly test', review: '🔁 Tricky questions' }[h.mode]} · ${h.score}/${h.total}</h3><p class="small muted">${niceDate(h.d)} · ${esc(h.topic)} · ${Math.floor((h.secs || 0) / 60)}m ${(h.secs || 0) % 60}s</p>${h.wrong.length ? h.wrong.map(w => `<div style="padding:8px 0;border-bottom:1px dashed var(--line)"><div style="white-space:pre-line">${esc(w.t)}</div><span class="small">Answered <b style="color:var(--red)">${esc(String(w.g).replace('-', '−'))}</b> · Correct <b style="color:var(--grn)">${esc(w.a)}</b></span></div>`).join('') : '<p>All correct! 🌟</p>'}<button class="btn block" style="margin-top:12px" onclick="closeModal()">Close</button>`); }
function resetKid(id) { const k = S.kids[id]; modal(`<h2>Reset ${esc(k.name)}?</h2><p>This clears lessons, results, streak and rewards. It can't be undone.</p><div class="grid2"><button class="btn ghost" onclick="closeModal()">Cancel</button><button class="btn red" onclick="doReset('${id}')">Reset</button></div>`); }
async function doReset(id) { const o = S.kids[id], k = newKid(o.name, o.year, o.subjects, o.avatar); k.id = id; k.created = o.created; S.kids[id] = k; closeModal(); await saveKid(k); toast('Progress reset'); renderParent(id); }
function delKid(id) { const k = S.kids[id]; modal(`<h2>Remove ${esc(k.name)}?</h2><p>All of ${esc(k.name)}'s progress will be deleted.</p><div class="grid2"><button class="btn ghost" onclick="closeModal()">Cancel</button><button class="btn red" onclick="doDel('${id}')">Remove</button></div>`); }
async function doDel(id) { try { await Backend.call('deleteKid', { token: S.session.token, id }); delete S.kids[id]; S.family.kids = S.family.kids.filter(x => x !== id); closeModal(); renderParent(); } catch (e) { toast(e.message); } }
function familyPanel() {
  return `${S.hasRecovery ? '' : `<div class="banner">🔑 <b>No recovery code yet.</b> Make one below so you can reset your password if you forget it.</div>`}
  <div class="card"><h2>⚙️ Family settings</h2><p>Family code: <b>${esc(S.session.code)}</b><br><span class="small muted">Use this code and your password to sign in on any device. Children choose their own name after that.</span></p>
  <h3>Change password</h3><form onsubmit="event.preventDefault();changePw()"><label>Current password</label><input type="password" id="op" autocomplete="current-password"><label>New password</label><input type="password" id="np" autocomplete="new-password"><div id="pwmsg"></div><button class="btn block" style="margin-top:12px">Change password</button></form></div>
  <div class="card"><h3>🔑 Recovery code</h3><p class="small muted">Lets you reset your password from the sign-in screen. Making a new one cancels the old one.</p>
    <form onsubmit="event.preventDefault();newRecovery()"><label>Family password</label><input type="password" id="rcp" autocomplete="current-password"><div id="rcmsg"></div><button class="btn org block" style="margin-top:12px">${S.hasRecovery ? 'Make a new recovery code' : 'Create my recovery code'}</button></form></div>
  <button class="btn ghost block" onclick="signOut()">🚪 Sign out on this device</button>
  <div class="card" style="margin-top:18px;border-color:#FECACA"><h3>🗑 Delete our family</h3><p class="small muted">Permanently deletes your family code, every child and all their progress. This can't be undone.</p>
    <form onsubmit="event.preventDefault();deleteFamily()"><label>Family password</label><input type="password" id="dfp" autocomplete="current-password"><label>Type DELETE to confirm</label><input id="dfc" autocapitalize="characters"><div id="dfmsg"></div><button class="btn red block" style="margin-top:12px">Delete everything</button></form></div>`;
}
async function newRecovery() { try { const r = await Backend.call('newRecovery', { token: S.session.token, password: $('#rcp').value }); renderParent('family'); showRecovery(r.recovery); } catch (e) { if (e.relogin) return signOut(true); $('#rcmsg').innerHTML = `<div class="err">${esc(e.message)}</div>`; } }
async function deleteFamily() {
  if ($('#dfc').value.trim().toUpperCase() !== 'DELETE') return ($('#dfmsg').innerHTML = '<div class="err">Type DELETE to confirm.</div>');
  try { await Backend.call('deleteFamily', { token: S.session.token, password: $('#dfp').value }); ls.del('starsteps_session'); ls.del('starsteps_lastcode'); Object.assign(S, { session: null, family: null, kids: {}, kidId: null, parentOK: 0 }); Backend.mode = null; authTab = 'login'; renderWelcome('<div class="ok">Your family and all its data have been deleted.</div>'); }
  catch (e) { if (e.relogin) return signOut(true); $('#dfmsg').innerHTML = `<div class="err">${esc(e.message)}</div>`; }
}

/* ================= ADMIN (open yoursite/#admin) ================= */
let ADMIN_KEY = '';
async function renderAdmin(msg = '') {
  if (!ADMIN_KEY) return show(`<div class="logo" style="font-size:30px">⭐ Star<span>Steps</span> admin</div><div class="card"><form onsubmit="event.preventDefault();ADMIN_KEY=$('#akey').value;renderAdmin()"><label>Admin key</label><input id="akey" type="password" autocomplete="off"><div>${msg}</div><button class="btn block" style="margin-top:12px">Open</button></form></div><p class="center"><a class="speak" href="#" onclick="location.hash='';location.reload()">← Back to the app</a></p>`);
  show('<p class="center muted" style="margin-top:30vh">Loading admin…</p>');
  let r; try { r = await Backend.call('admin', { key: ADMIN_KEY }); } catch (e) { ADMIN_KEY = ''; return renderAdmin(`<div class="err">${esc(e.message)}</div>`); }
  const T = r.totals, left = Math.max(0, 1000 - T.savesToday);
  show(`<div class="row between"><h1 style="margin:0">🛠 Admin</h1><button class="btn sm ghost" onclick="renderAdmin()">↻ Refresh</button></div>
  <div class="grid3" style="margin-top:12px;text-align:center">
    <div class="card" style="margin:0"><div style="font-size:28px;font-weight:700">${T.families}</div><span class="small muted">families</span></div>
    <div class="card" style="margin:0"><div style="font-size:28px;font-weight:700">${T.kids}</div><span class="small muted">children</span></div>
    <div class="card" style="margin:0"><div style="font-size:28px;font-weight:700">${T.activeToday}</div><span class="small muted">active today</span></div>
  </div>
  <div class="card"><h3>💾 Saves today (${esc(r.today)})</h3><div class="bar" style="height:16px"><i style="width:${Math.min(100, T.savesToday / 10)}%;${T.savesToday > 800 ? 'background:var(--red)' : ''}"></i></div>
    <p><b>≈ ${T.savesToday}</b> of 1,000 free daily saves used · <b>≈ ${left}</b> left · ${T.questionsToday} questions answered today</p>
    <p class="small muted">Estimated from today's finished activities (one save each), plus a few for rewards and settings. The limit is shared with your other Cloudflare apps and resets at midnight UTC. Exact figures: Cloudflare → Storage &amp; databases → KV → starsteps → Metrics.</p></div>
  <div class="card"><h3>👪 Families</h3>${r.families.length ? `<table><tr><th>Code</th><th>Children</th><th>Last active</th><th></th></tr>${r.families.map(f => `<tr><td><b>${esc(f.code)}</b>${f.recovery ? '' : ' <span class="pill a" title="No recovery code">no 🔑</span>'}<br><span class="small muted">${f.created ? 'since ' + new Date(f.created).toLocaleDateString('en-GB') : ''}</span></td><td>${f.kids}<br><span class="small muted">${esc(f.names.join(', '))}</span></td><td class="small">${f.last ? niceDate(f.last) : '—'}${f.today ? `<br><span class="pill g">${f.today} today</span>` : ''}</td><td><button class="btn red sm" onclick="adminDelete('${esc(f.code)}')">🗑</button></td></tr>`).join('')}</table>` : '<p class="muted">No families yet.</p>'}
    <p class="small muted">To help a family that's locked out with no recovery code: delete their family here, and they can make it again with the same code.</p></div>
  <p class="center"><a class="speak" href="#" onclick="ADMIN_KEY='';location.hash='';location.reload()">← Leave admin</a></p>`);
}
function adminDelete(code) { modal(`<h2>Delete "${esc(code)}"?</h2><p>This removes the family and all of its children's progress. It can't be undone.</p><div class="grid2"><button class="btn ghost" onclick="closeModal()">Cancel</button><button class="btn red" onclick="doAdminDelete('${esc(code)}')">Delete</button></div>`); }
async function doAdminDelete(code) { try { await Backend.call('adminDelete', { key: ADMIN_KEY, code }); closeModal(); toast('Deleted ' + code); renderAdmin(); } catch (e) { toast(e.message); } }
async function changePw() { try { await Backend.call('password', { token: S.session.token, old: $('#op').value, password: $('#np').value }); $('#pwmsg').innerHTML = '<div class="ok">Password changed ✓</div>'; } catch (e) { $('#pwmsg').innerHTML = `<div class="err">${esc(e.message)}</div>`; } }
function reportText(k) {
  const t = today(), w = Array.from({ length: 7 }, (_, i) => k.days[addDays(t, i - 6)] || { q: 0, c: 0 }), q = w.reduce((s, d) => s + d.q, 0), c = w.reduce((s, d) => s + d.c, 0), wk = weekKey();
  const lines = [`⭐ StarSteps report — ${k.name} (${yearName(k.year)})`, `Week to ${niceDate(t)}`, '', `🔥 Streak: ${liveStreak(k)} days (best ${k.streak.best})`, `📅 Days active: ${w.filter(d => d.q).length}/7`, `✏️ Questions: ${q} · Correct: ${c} (${pct(c, q)}%)`];
  for (const s of k.subjects) { const L = k.level[s], cur = curTopic(k, s), wt = k.weekly[s + ':' + wk]; lines.push('', `${SUBJ[s].icon} ${SUBJ[s].name}: ${yearName(L.year)} — ${cur.t}`, `   Topics mastered: ${k.mastered[s].length} · Weekly test: ${wt ? wt.score + '/' + wt.total : 'not done'}`); }
  lines.push('', `🔁 Tricky questions still to fix: ${k.review.length}`, `🏅 Badges: ${k.badges.length} · 🎨 Stickers: ${Object.keys(k.stickers).length}`);
  return lines.join('\n');
}
async function copyReport(id) {
  const txt = reportText(S.kids[id]);
  try { await navigator.clipboard.writeText(txt); toast('Report copied ✓ — paste it into WhatsApp or email'); }
  catch (e) { modal(`<h3>Weekly report</h3><textarea style="width:100%;height:260px;font:inherit;font-size:14px;border-radius:12px;padding:10px">${esc(txt)}</textarea><button class="btn block" onclick="closeModal()">Close</button>`); }
}

/* ================= START ================= */
(async function boot() {
  const sess = ls.get('starsteps_session');
  if (location.hash === '#admin') return renderAdmin();
  if (!sess) return renderWelcome();
  S.session = sess; Backend.mode = sess.mode || null;
  show('<div class="logo" style="margin-top:30vh">⭐ Star<span>Steps</span></div><p class="center muted">Loading…</p>');
  try { const r = await Backend.call('load', { token: sess.token }); S.hasRecovery = r.hasRecovery !== false; S.family = r.family; S.kids = {}; for (const [id, k] of Object.entries(r.kids || {})) S.kids[id] = fixKid(k); renderWho(); }
  catch (e) { if (e.relogin) return signOut(true); show(`<div class="card center" style="margin-top:20vh"><div style="font-size:50px">📡</div><p>${esc(e.message)}</p><button class="btn" onclick="location.reload()">Try again</button></div>`); }
})();
window.addEventListener('hashchange', () => { if (location.hash === '#admin') renderAdmin(); });
