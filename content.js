/* StarSteps — year-by-year learning content (UK National Curriculum, Reception to Year 6).
   Every topic has: id, t (title), icon, learn {say, eg, tip}, gen() -> question.
   Question: {text, answer, input:'number'} or {text, answer, choices:[...]}, plus optional visual, html, passage, hint, why. */
(function () {
  const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const simp = (n, d) => { const g = gcd(n, d); n /= g; d /= g; return d === 1 ? String(n) : n + '/' + d; };
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

  const num = (text, answer, o = {}) => ({ text, answer: String(answer), input: 'number', ...o });
  function ch(text, answer, wrongs, o = {}) {
    const set = [String(answer)];
    for (const w of shuffle(wrongs.map(String))) { if (set.length >= 4) break; if (!set.includes(w)) set.push(w); }
    return { text, answer: String(answer), choices: shuffle(set), ...o };
  }
  function numWrongs(ans, spread, min = 0) {
    const s = new Set(); let g = 0;
    while (s.size < 3 && g++ < 200) { const d = R(-spread, spread); const v = ans + d; if (d !== 0 && v >= min) s.add(v); }
    let k = 1; while (s.size < 3) s.add(ans + spread + k++);
    return [...s];
  }
  function rows(e, n) { let s = ''; for (let i = 0; i < n; i++) { s += e; if ((i + 1) % 5 === 0 && i < n - 1) s += '\n'; } return s; }

  /* ---------- pictures ---------- */
  const COLS = ['#6C4CF1', '#FF8A3D', '#22C55E', '#FF5FA2', '#0EA5E9', '#F59E0B'];
  function shapeSVG(name) {
    const P = {
      circle: '<circle cx="60" cy="60" r="45"/>',
      square: '<rect x="18" y="18" width="84" height="84" rx="4"/>',
      rectangle: '<rect x="5" y="32" width="110" height="56" rx="4"/>',
      triangle: '<polygon points="60,12 110,105 10,105"/>',
      star: '<polygon points="60,8 73,44 112,44 81,67 92,105 60,82 28,105 39,67 8,44 47,44"/>',
      oval: '<ellipse cx="60" cy="60" rx="54" ry="34"/>',
      pentagon: '<polygon points="60,10 110,47 91,105 29,105 10,47"/>',
      hexagon: '<polygon points="35,12 85,12 112,60 85,108 35,108 8,60"/>'
    };
    return `<svg viewBox="0 0 120 120" width="130" height="130" fill="${pick(COLS)}" stroke="#1f1442" stroke-width="3" stroke-linejoin="round">${P[name]}</svg>`;
  }
  function clockSVG(h, m) {
    const ha = ((h % 12) + m / 60) * 30, ma = m * 6; let t = '';
    for (let i = 1; i <= 12; i++) { const a = (i * 30 - 90) * Math.PI / 180; t += `<text x="${(60 + 41 * Math.cos(a)).toFixed(1)}" y="${(64 + 41 * Math.sin(a)).toFixed(1)}" font-size="11" text-anchor="middle" fill="#1f1442" font-family="sans-serif" font-weight="700">${i}</text>`; }
    return `<svg viewBox="0 0 120 120" width="170" height="170"><circle cx="60" cy="60" r="55" fill="#fff" stroke="#6C4CF1" stroke-width="5"/>${t}<line x1="60" y1="60" x2="60" y2="34" stroke="#1f1442" stroke-width="5" stroke-linecap="round" transform="rotate(${ha} 60 60)"/><line x1="60" y1="60" x2="60" y2="17" stroke="#FF8A3D" stroke-width="3.5" stroke-linecap="round" transform="rotate(${ma} 60 60)"/><circle cx="60" cy="60" r="4" fill="#1f1442"/></svg>`;
  }
  function rectSVG(l, w, u = 'cm') {
    const W = Math.min(190, 50 + l * 9), H = Math.min(110, 30 + w * 8);
    return `<svg viewBox="0 0 ${W + 70} ${H + 45}" width="${W + 70}" height="${H + 45}" font-family="sans-serif"><rect x="20" y="10" width="${W}" height="${H}" fill="#E9E3FF" stroke="#6C4CF1" stroke-width="3" rx="3"/><text x="${20 + W / 2}" y="${H + 34}" text-anchor="middle" font-size="15" font-weight="700" fill="#1f1442">${l} ${u}</text><text x="${W + 26}" y="${10 + H / 2 + 5}" font-size="15" font-weight="700" fill="#1f1442">${w} ${u}</text></svg>`;
  }
  function gridSVG(l, w) {
    const s = 20; let r = '';
    for (let y = 0; y < w; y++) for (let x = 0; x < l; x++) r += `<rect x="${x * s + 2}" y="${y * s + 2}" width="${s}" height="${s}" fill="#FFE7D6" stroke="#FF8A3D" stroke-width="1.5"/>`;
    return `<svg viewBox="0 0 ${l * s + 4} ${w * s + 4}" width="${Math.min(290, l * s + 4)}">${r}</svg>`;
  }
  function triSVG(b, h) {
    return `<svg viewBox="-10 0 240 150" width="240" height="150" font-family="sans-serif"><polygon points="20,120 205,120 80,18" fill="#DCFCE7" stroke="#22C55E" stroke-width="3" stroke-linejoin="round"/><line x1="80" y1="18" x2="80" y2="120" stroke="#1f1442" stroke-dasharray="5 4" stroke-width="2"/><text x="112" y="142" text-anchor="middle" font-size="15" font-weight="700" fill="#1f1442">base ${b} cm</text><text x="58" y="78" text-anchor="end" font-size="15" font-weight="700" fill="#1f1442">${h} cm</text></svg>`;
  }
  const coinsHTML = list => '<div class="coins">' + list.map(c => `<span class="coin c${c}">${c}p</span>`).join('') + '</div>';
  function roman(n) { const m = [[100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let s = ''; for (const [v, r] of m) while (n >= v) { s += r; n -= v; } return s; }

  /* ---------- spelling helpers ---------- */
  const REAL = new Set('wore ware wire here hare hire where there three their thee them then than come came some same sum son sun one won once ones put pot pit pat pet pull pill poll full fill fell fall hose horse our are ore oar has his hiss was is as us said sad says love live move your you yours they the school friend fiend ask house push posh today could cold would should old gold hold told find fund fond kind mind mend wild mild child climb most mast must mist both bath great grate break brake steak stake pretty after fast fist last list lost past post pest father class grass pass plant planet path hour sure sore eye who whole hole any many money water again half hall door poor pour floor flour even oven every busy people because behind children clothes sugar prove improve beautiful everybody bear bare heart hart heard herd weight wait eight earth learn lean group guide guard height history island length often though through thought tough minute ladder later latter breath breathe dairy diary desert dessert quiet quite'.split(' '));
  const VOW = 'aeiou';
  function misspell(word, n = 3) {
    const w = word.toLowerCase(), out = new Set();
    const T = [
      s => s.replace(/([bcdfglmnprstz])\1/, '$1'),
      s => { const idx = []; for (let i = 1; i < s.length; i++) if (/[bcdfglmnprst]/.test(s[i]) && s[i + 1] !== s[i] && s[i - 1] !== s[i]) idx.push(i); if (!idx.length) return s; const i = pick(idx); return s.slice(0, i + 1) + s[i] + s.slice(i + 1); },
      s => s.includes('ie') ? s.replace('ie', 'ei') : s.includes('ei') ? s.replace('ei', 'ie') : s,
      s => { const idx = []; for (let i = 0; i < s.length; i++) if (VOW.includes(s[i])) idx.push(i); if (!idx.length) return s; const i = pick(idx); return s.slice(0, i) + pick(VOW.replace(s[i], '').split('')) + s.slice(i + 1); },
      s => s.replace(/^kn/, 'n').replace(/^wr/, 'r').replace(/mb$/, 'm').replace(/gh/, 'g'),
      s => { if (s.length < 4) return s; const i = R(1, s.length - 2); return s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2); },
      s => { if (s.length < 4) return s; const i = R(1, s.length - 1); return s.slice(0, i) + s.slice(i + 1); },
      s => s.replace(/tion$/, 'shun').replace(/ous$/, 'us').replace(/le$/, 'el').replace(/ture$/, 'cher').replace(/cious$/, 'shus'),
      s => s.replace(/c(?=[ei])/, 's'),
      s => s.replace(/y$/, 'ey').replace(/ey$/, 'y')
    ];
    let g = 0;
    while (out.size < n && g++ < 400) { const v = pick(T)(w); if (v !== w && v.length > 1 && !REAL.has(v)) out.add(v); }
    let k = 1; while (out.size < n) out.add(w + 'e'.repeat(k++));
    return [...out];
  }
  const spellQ = list => () => { const w = pick(list); return ch('Which word is spelt correctly?', w, misspell(w), { hint: 'Say the word slowly and picture each letter.', speak: w }); };

  /* ---------- reading passages (original) ---------- */
  const PASSAGES = {
    ks1: [
      { p: "Ben has a red kite. He takes it to the hill. The wind is strong. Up, up goes the kite! Ben's dog, Pip, barks at it. Then the kite gets stuck in a tree. Dad helps Ben get it down.",
        q: [['What colour is Ben\'s kite?', 'red', ['blue', 'green', 'yellow']], ['Where does Ben take his kite?', 'to the hill', ['to school', 'to the beach', 'to the shop']], ['What is the dog called?', 'Pip', ['Ben', 'Max', 'Dad']], ['Who helps Ben?', 'Dad', ['Pip', 'Mum', 'a bird']]] },
      { p: 'Maya planted a tiny seed in a pot. Every morning she gave it some water and put it by the window. After a week, a small green shoot popped up. Maya was so excited that she ran to tell her grandma.',
        q: [['What did Maya plant?', 'a seed', ['a tree', 'a carrot', 'a cake']], ['Where did she put the pot?', 'by the window', ['in the bath', 'under the bed', 'in the car']], ['How long did it take for the shoot to come up?', 'a week', ['a day', 'a year', 'an hour']], ['How did Maya feel?', 'excited', ['sad', 'angry', 'sleepy']]] },
      { p: 'It was the school sports day. Leo was in the sack race. He jumped as fast as he could, but he fell over! Leo got up and kept going. He came third and got a shiny sticker. "I never gave up," said Leo with a big smile.',
        q: [['Which race was Leo in?', 'the sack race', ['the egg and spoon race', 'the swimming race', 'the car race']], ['What happened to Leo in the race?', 'He fell over.', ['He lost his shoe.', 'He went to sleep.', 'He flew away.']], ['What did Leo get?', 'a shiny sticker', ['a gold cup', 'an ice cream', 'a new sack']], ['What did Leo do after he fell?', 'He got up and kept going.', ['He went home.', 'He cried all day.', 'He sat down.']]] }
    ],
    lks2: [
      { p: 'The library was silent except for the ticking of the old clock. Amir crept between the tall shelves, searching for the book his teacher had mentioned. Suddenly, a gust of wind blew through an open window and a single page fluttered to the floor. On it was a map, drawn in faded brown ink, with a large X marked beside the school pond.',
        q: [['Which word tells us the library was very quiet?', 'silent', ['ticking', 'tall', 'faded']], ['Why was Amir in the library?', 'He was looking for a book.', ['He was hiding.', 'He was lost.', 'He was tidying up.']], ['What made the page fall to the floor?', 'a gust of wind', ['Amir dropped it', 'the clock', 'a cat']], ['Where was the X on the map?', 'beside the school pond', ['in the library', 'under a tree', 'by the gate']]] },
      { p: 'Hedgehogs are small mammals covered in about 5,000 sharp spines. When they feel scared, they roll into a tight ball so the spines protect them. Hedgehogs are nocturnal, which means they sleep during the day and search for food at night. They eat beetles, worms and caterpillars. In winter, when food is hard to find, they hibernate.',
        q: [['What do hedgehogs do when they are scared?', 'roll into a tight ball', ['run up a tree', 'dig a hole', 'jump into water']], ["What does 'nocturnal' mean?", 'active at night', ['asleep at night', 'lives in water', 'only eats plants']], ['Which of these do hedgehogs eat?', 'worms', ['leaves', 'pebbles', 'seaweed']], ['Why do hedgehogs hibernate?', 'Food is hard to find in winter.', ['They are bored.', 'It is too hot.', 'To grow new spines.']]] },
      { p: "Priya had practised her piano piece for weeks, but when she walked onto the stage her hands began to tremble. The hall was packed. She took a deep breath, looked at her music and began to play. By the final note, her nerves had vanished, and the audience burst into applause.",
        q: [['How did Priya feel when she walked onto the stage?', 'nervous', ['bored', 'angry', 'sleepy']], ["Which word tells us Priya's hands were shaking?", 'tremble', ['packed', 'vanished', 'final']], ["What does 'the hall was packed' mean?", 'It was full of people.', ['It was full of boxes.', 'It was empty.', 'It was locked.']], ['How did the audience react at the end?', 'They clapped loudly.', ['They left quietly.', 'They laughed at her.', 'They fell asleep.']]] }
    ],
    uks2: [
      { p: 'Nobody in the village of Thornby believed Elsie when she said the lighthouse had been lit. It had stood abandoned for forty years, its windows thick with salt and its door rusted shut. Yet on the night of the storm, she was certain she had seen a beam sweep across the waves, steady and deliberate, guiding a small fishing boat safely into the harbour. The next morning, the fishermen said nothing, but they would not meet her eyes.',
        q: [['How long had the lighthouse been abandoned?', 'forty years', ['four years', 'a hundred years', 'since last winter']], ["What does 'deliberate' suggest about the beam?", 'It moved on purpose.', ['It flickered randomly.', 'It was very dim.', 'It changed colour.']], ["What does the fishermen's behaviour suggest?", "They knew something they weren't saying.", ['They were angry with Elsie.', "They hadn't been at sea.", 'They were too tired to talk.']], ['Which phrase shows the lighthouse was neglected?', 'its door rusted shut', ['guiding a small fishing boat', 'on the night of the storm', 'steady and deliberate']]] },
      { p: 'Plastic pollution is one of the biggest threats facing our oceans. Every year, millions of tonnes of plastic enter the sea, where it can take hundreds of years to break down. Sea turtles often mistake plastic bags for jellyfish, one of their favourite foods. However, there is hope: many countries now charge for plastic bags, and beach clean-ups organised by volunteers remove tonnes of rubbish each year.',
        q: [['Why do sea turtles eat plastic bags?', 'They mistake them for jellyfish.', ['They like the taste.', 'They use them for nests.', 'They are very hungry.']], ['Which word introduces a contrasting idea?', 'However', ['Every', 'often', 'many']], ['What is the main purpose of this text?', 'to inform readers about plastic pollution', ['to tell a funny story', 'to sell plastic bags', 'to give a recipe']], ['How long can plastic take to break down?', 'hundreds of years', ['a few days', 'one year', 'ten weeks']]] },
      { p: "Ada Lovelace was born in London in 1815. Her mother insisted she study mathematics, hoping it would keep her imagination in check. Instead, it fed it. Working with the inventor Charles Babbage, Ada wrote what many consider the first computer program — more than a century before modern computers were built. Today, Ada Lovelace Day celebrates women in science and technology.",
        q: [['When was Ada Lovelace born?', '1815', ['1915', '1851', '2015']], ['What did her mother hope mathematics would do?', 'keep her imagination in check', ['make her rich', 'help her invent machines', 'make her famous']], ["What does 'Instead, it fed it' mean?", 'Maths made her imagination grow.', ['Maths made her hungry.', 'Maths stopped her imagining.', 'She gave up maths.']], ['Why is Ada Lovelace remembered?', 'She wrote an early computer program.', ['She built the first car.', 'She discovered electricity.', 'She was a famous singer.']]] }
    ]
  };
  const readQ = band => () => { const P = pick(PASSAGES[band]); const [q, a, w] = pick(P.q); return ch(q, a, w, { passage: P.p, hint: 'Look back at the story — the answer is in there!' }); };
  const readLearn = { say: 'Good readers are detectives! We read carefully, then look back at the text to find clues and answers.', eg: 'Question: "Where did Ben go?" → find the word "where" clue → "He takes it to the hill." So the answer is: to the hill.', tip: 'Read the question first, then read the text and hunt for the answer.' };

  /* ---------- word banks ---------- */
  const FIRST = [['apple', '🍎'], ['ball', '⚽'], ['cat', '🐱'], ['dog', '🐶'], ['egg', '🥚'], ['fish', '🐟'], ['goat', '🐐'], ['hat', '🎩'], ['kite', '🪁'], ['lion', '🦁'], ['moon', '🌙'], ['nut', '🥜'], ['octopus', '🐙'], ['pig', '🐷'], ['rabbit', '🐰'], ['sun', '☀️'], ['tree', '🌳'], ['umbrella', '☂️'], ['van', '🚐'], ['web', '🕸️'], ['zebra', '🦓']];
  const CVC = [['cat', '🐱'], ['dog', '🐶'], ['sun', '☀️'], ['pig', '🐷'], ['hat', '🎩'], ['bus', '🚌'], ['fox', '🦊'], ['bed', '🛏️'], ['hen', '🐔'], ['nut', '🥜'], ['van', '🚐'], ['web', '🕸️'], ['bat', '🦇'], ['cup', '🥤'], ['map', '🗺️'], ['bug', '🐛']];
  const RHYME = [['cat', 'hat', 'mat', 'bat', 'rat'], ['dog', 'log', 'frog', 'fog'], ['sun', 'bun', 'fun', 'run'], ['pig', 'big', 'dig', 'wig'], ['bed', 'red', 'fed', 'shed'], ['hen', 'pen', 'ten', 'men'], ['top', 'hop', 'mop', 'shop'], ['bug', 'hug', 'mug', 'rug'], ['cake', 'lake', 'snake', 'bake']];
  const DIGRAPH = [['ship', 'sh', '🚢'], ['fish', 'sh', '🐟'], ['shell', 'sh', '🐚'], ['chick', 'ch', '🐥'], ['cheese', 'ch', '🧀'], ['chair', 'ch', '🪑'], ['bath', 'th', '🛁'], ['three', 'th', '3️⃣'], ['thumb', 'th', '👍'], ['ring', 'ng', '💍'], ['king', 'ng', '🤴'], ['sock', 'ck', '🧦'], ['duck', 'ck', '🦆'], ['clock', 'ck', '🕰️'], ['queen', 'qu', '👸'], ['moon', 'oo', '🌙'], ['rain', 'ai', '🌧️'], ['boat', 'oa', '⛵'], ['star', 'ar', '⭐']];
  const Y1W = 'the said says are were was his has you your they here there where love come some one once ask friend school put push pull full house our today'.split(' ');
  const Y2W = 'door floor poor because find kind mind behind child children wild climb most only both old cold gold hold told every everybody even great break steak pretty beautiful after fast last past father class grass pass plant path bath hour move prove improve sure sugar eye could should would who whole any many clothes busy people water again half money parents'.split(' ');
  const Y34W = 'accident actually address answer appear arrive believe bicycle breath breathe build busy business calendar caught centre century certain circle complete consider continue decide describe different difficult disappear early earth eight eighth enough exercise experience experiment extreme famous favourite february forward fruit grammar group guard guide heard heart height history imagine increase important interest island knowledge learn length library material medicine mention minute natural naughty notice occasion often opposite ordinary particular peculiar perhaps popular position possess possession possible potatoes pressure probably promise purpose quarter question recent regular reign remember sentence separate special straight strange strength suppose surprise therefore though although thought through various weight woman women'.split(' ');
  const Y3W = Y34W.slice(0, Y34W.indexOf('mention') + 1), Y4W = Y34W.slice(Y34W.indexOf('mention') + 1);
  const Y56W = 'accommodate accompany according achieve aggressive amateur ancient apparent appreciate attached available average awkward bargain bruise category cemetery committee communicate community competition conscience conscious controversy convenience correspond criticise curiosity definite desperate determined develop dictionary disastrous embarrass environment equipped equipment especially exaggerate excellent existence explanation familiar foreign forty frequently government guarantee harass hindrance identity immediately individual interfere interrupt language leisure lightning marvellous mischievous muscle necessary neighbour nuisance occupy occur opportunity parliament persuade physical prejudice privilege profession programme pronunciation queue recognise recommend relevant restaurant rhyme rhythm sacrifice secretary shoulder signature sincere sincerely soldier stomach sufficient suggest symbol system temperature thorough twelfth variety vegetable vehicle yacht'.split(' ');
  const Y5W = Y56W.slice(0, Y56W.indexOf('familiar')), Y6W = Y56W.slice(Y56W.indexOf('familiar'));

  /* ================= MATHS ================= */
  const maths = {
    R: [
      { id: 'm-r-count', t: 'Counting to 10', icon: '🍎',
        learn: { say: 'Counting tells us how many things there are. Touch each thing once and say the next number.', eg: '🍎🍎🍎 → 1, 2, 3. There are 3 apples!', tip: "Don't skip any, and don't count one twice!" },
        gen() { const n = R(1, 10), e = pick(['🍎', '🍌', '🍓', '⭐', '🐟', '🚗', '🎈', '🐞', '🌸', '⚽']); return num(`How many ${e} can you count?`, n, { visual: rows(e, n), hint: 'Point to each one as you count.' }); } },
      { id: 'm-r-more', t: 'One more, one less', icon: '➕',
        learn: { say: '"One more" means the next number when we count up. "One less" means the number just before.', eg: 'One more than 5 is 6. One less than 5 is 4.', tip: 'Count on one for "more", count back one for "less".' },
        gen() { const n = R(1, 19); return Math.random() < .5 ? num(`What is one more than ${n}?`, n + 1, { hint: `Count on from ${n}.` }) : num(`What is one less than ${n}?`, n - 1, { hint: `Count back from ${n}.` }); } },
      { id: 'm-r-add', t: 'Adding up to 10', icon: '🍓',
        learn: { say: 'Adding means putting groups together to find how many altogether.', eg: '🍓🍓 + 🍓🍓🍓 = 5 strawberries. So 2 + 3 = 5.', tip: 'Start with the bigger number and count on.' },
        gen() { const a = R(1, 6), b = R(1, 10 - a), e = pick(['🍓', '🐥', '⭐', '🍪', '🚀']); return num(`${a} + ${b} = ?`, a + b, { visual: rows(e, a) + '\n➕\n' + rows(e, b), hint: 'Count all of them together.' }); } },
      { id: 'm-r-take', t: 'Taking away', icon: '🎈',
        learn: { say: 'Taking away means some go away. We count what is left.', eg: '5 balloons, 2 fly away → 🎈🎈🎈 are left. 5 − 2 = 3.', tip: 'Cover the ones that go away with your finger, then count the rest.' },
        gen() { const a = R(3, 10), b = R(1, a - 1), e = pick(['🎈', '🍪', '🐸', '🦆']); return num(`There are ${a} ${e}. ${b} go away. How many are left?`, a - b, { visual: rows(e, a), hint: 'Count back.' }); } },
      { id: 'm-r-shapes', t: 'Shapes', icon: '🔺',
        learn: { say: 'Shapes have names. We look at their sides and corners.', eg: 'A triangle has 3 sides. A square has 4 sides all the same length. A circle is round with no corners.', tip: 'Count the sides to help you!' },
        gen() { const s = pick(['circle', 'square', 'triangle', 'rectangle', 'star', 'oval']); return ch('What shape is this?', s, ['circle', 'square', 'triangle', 'rectangle', 'star', 'oval'].filter(x => x !== s), { html: shapeSVG(s) }); } },
      { id: 'm-r-compare', t: 'Bigger and smaller', icon: '🐘',
        learn: { say: 'Numbers that come later when we count are bigger.', eg: '8 is bigger than 3, because we say 8 after 3.', tip: 'Think of a number line — bigger numbers are further along.' },
        gen() { let a = R(0, 20), b = R(0, 20); while (b === a) b = R(0, 20); const big = Math.random() < .5; return { text: `Which number is ${big ? 'bigger' : 'smaller'}?`, answer: String(big ? Math.max(a, b) : Math.min(a, b)), choices: [String(a), String(b)] }; } }
    ],
    1: [
      { id: 'm-1-bonds', t: 'Number bonds to 10 and 20', icon: '🔟',
        learn: { say: 'Number bonds are pairs of numbers that make a total.', eg: '7 + 3 = 10, so 7 and 3 are a number bond to 10. And 17 + 3 = 20!', tip: 'Learn your bonds to 10 by heart — then bonds to 20 are easy.' },
        gen() { const T = pick([10, 10, 20]), a = R(0, T); return num(`${a} + ? = ${T}`, T - a, { hint: `What do you add to ${a} to make ${T}?` }); } },
      { id: 'm-1-add', t: 'Adding within 20', icon: '➕',
        learn: { say: 'To add, start with the bigger number and count on.', eg: '8 + 5 → start at 8, count on 5: 9, 10, 11, 12, 13. So 8 + 5 = 13.', tip: 'Make 10 first: 8 + 2 = 10, then 3 more = 13.' },
        gen() { const a = R(2, 15), b = R(1, 20 - a); return num(`${a} + ${b} = ?`, a + b); } },
      { id: 'm-1-sub', t: 'Subtracting within 20', icon: '➖',
        learn: { say: 'Subtracting means taking away. We count back.', eg: '15 − 4 → start at 15, count back 4: 14, 13, 12, 11. So 15 − 4 = 11.', tip: 'You can also count up from the small number to the big one.' },
        gen() { const a = R(5, 20), b = R(1, a); return num(`${a} − ${b} = ?`, a - b); } },
      { id: 'm-1-count', t: 'Counting in 2s, 5s and 10s', icon: '🦘',
        learn: { say: 'Counting in steps is like jumping along a number line.', eg: '2s: 2, 4, 6, 8. 5s: 5, 10, 15, 20. 10s: 10, 20, 30, 40.', tip: 'Look at how much the numbers jump each time.' },
        gen() { const s = pick([2, 5, 10]), st = s * R(0, 5), seq = [0, 1, 2, 3, 4].map(i => st + i * s), m = R(1, 4); return num(`What number is missing?\n${seq.map((v, i) => i === m ? '?' : v).join(',  ')}`, seq[m], { hint: `It goes up in ${s}s.` }); } },
      { id: 'm-1-tens', t: 'Tens and ones', icon: '🧱',
        learn: { say: 'Two-digit numbers are made of tens and ones.', eg: '34 = 3 tens and 4 ones. ▮▮▮ ••••', tip: 'The first digit tells you the tens.' },
        gen() { const n = R(11, 99), t = Math.floor(n / 10), o = n % 10; return Math.random() < .5 ? num(`How many tens are in ${n}?`, t) : num(`${t} tens and ${o} ones makes what number?`, n); } },
      { id: 'm-1-half', t: 'Halves and doubles', icon: '🍕',
        learn: { say: 'Half means split into 2 equal parts. Double means add the same number again.', eg: 'Half of 8 is 4. Double 4 is 8.', tip: 'Halving and doubling are opposites!' },
        gen() { if (Math.random() < .5) { const n = 2 * R(1, 10); return num(`What is half of ${n}?`, n / 2, { hint: 'Share it equally between 2.' }); } const n = R(1, 10); return num(`What is double ${n}?`, 2 * n, { hint: `${n} + ${n}` }); } },
      { id: 'm-1-read', t: 'Shapes and sides', icon: '🔷',
        learn: { say: 'Every flat shape has sides and corners (we call corners "vertices").', eg: 'Triangle 3 sides · Square 4 · Pentagon 5 · Hexagon 6.', tip: 'Put your finger on a corner and count each side as you go round.' },
        gen() { const S = { triangle: 3, square: 4, rectangle: 4, pentagon: 5, hexagon: 6 }; const s = pick(Object.keys(S)); return num(`How many sides does this ${s} have?`, S[s], { html: shapeSVG(s) }); } }
    ],
    2: [
      { id: 'm-2-add', t: 'Adding 2-digit numbers', icon: '➕',
        learn: { say: 'Add the tens, then add the ones, then put them together.', eg: '34 + 25 → 30 + 20 = 50, 4 + 5 = 9 → 59.', tip: 'If the ones make more than 10, carry a ten over!' },
        gen() { const a = R(10, 80), b = R(10, 99 - a); return num(`${a} + ${b} = ?`, a + b); } },
      { id: 'm-2-sub', t: 'Subtracting 2-digit numbers', icon: '➖',
        learn: { say: 'Take away the tens, then the ones.', eg: '57 − 23 → 57 − 20 = 37, then 37 − 3 = 34.', tip: 'Check by adding back: 34 + 23 = 57 ✓' },
        gen() { const a = R(20, 99), b = R(10, a - 1); return num(`${a} − ${b} = ?`, a - b); } },
      { id: 'm-2-tables', t: '2, 5 and 10 times tables', icon: '✖️',
        learn: { say: 'Times means "lots of". 3 × 5 means 3 lots of 5.', eg: '3 × 5 = 5 + 5 + 5 = 15. And 15 ÷ 5 = 3.', tip: '10 times table numbers end in 0. 5 times table numbers end in 0 or 5.' },
        gen() { const t = pick([2, 5, 10]), k = R(1, 12); return Math.random() < .7 ? num(`${k} × ${t} = ?`, k * t) : num(`${k * t} ÷ ${t} = ?`, k, { hint: `How many ${t}s make ${k * t}?` }); } },
      { id: 'm-2-frac', t: 'Fractions of amounts', icon: '🍰',
        learn: { say: 'A fraction is part of a whole. ½ means 1 of 2 equal parts.', eg: '½ of 10 = 5. ¼ of 12 = 3 (share into 4 groups). ¾ of 12 = 9.', tip: 'Divide by the bottom number, times by the top.' },
        gen() { const [a, b] = pick([[1, 2], [1, 4], [1, 3], [3, 4], [2, 4]]), n = b * R(1, 10); return num(`What is ${a}/${b} of ${n}?`, n / b * a, { why: `${n} ÷ ${b} = ${n / b}, × ${a} = ${n / b * a}` }); } },
      { id: 'm-2-time', t: 'Telling the time', icon: '⏰',
        learn: { say: 'The short hand points to the hour. The long hand shows the minutes.', eg: 'Long hand on 12 = o\'clock. On 6 = half past. On 3 = quarter past. On 9 = quarter to.', tip: '"Quarter to" means the NEXT hour is coming.' },
        gen() { const h = R(1, 12), m = pick([0, 15, 30, 45]), nx = h % 12 + 1, pv = (h + 10) % 12 + 1; const W = { 0: `${h} o'clock`, 15: `quarter past ${h}`, 30: `half past ${h}`, 45: `quarter to ${nx}` }; return ch('What time does the clock show?', W[m], [`${h} o'clock`, `quarter past ${h}`, `half past ${h}`, `quarter to ${nx}`, `quarter to ${h}`, `half past ${pv}`].filter(x => x !== W[m]), { html: clockSVG(h, m) }); } },
      { id: 'm-2-money', t: 'Money', icon: '🪙',
        learn: { say: 'Coins have different values. We add them to find the total.', eg: '20p + 10p + 5p = 35p', tip: 'Start with the biggest coin and count on.' },
        gen() { const c = Array.from({ length: R(2, 4) }, () => pick([1, 2, 5, 10, 20, 50])).sort((a, b) => b - a); return num('How much money is this altogether? (in p)', c.reduce((s, x) => s + x, 0), { html: coinsHTML(c) }); } }
    ],
    3: [
      { id: 'm-3-tables', t: '3, 4 and 8 times tables', icon: '✖️',
        learn: { say: 'The 4 times table is double the 2s. The 8 times table is double the 4s!', eg: '6 × 4 = 24, so 6 × 8 = 48.', tip: 'Learn one fact and double it to find another.' },
        gen() { const t = pick([3, 4, 8]), k = R(1, 12); return Math.random() < .7 ? num(`${k} × ${t} = ?`, k * t) : num(`${k * t} ÷ ${t} = ?`, k); } },
      { id: 'm-3-place', t: 'Place value to 1000', icon: '🏠',
        learn: { say: 'In a 3-digit number, each digit has a value: hundreds, tens, ones.', eg: 'In 472, the 4 is worth 400, the 7 is worth 70, the 2 is worth 2.', tip: 'Count the places from the right: ones, tens, hundreds.' },
        gen() { for (;;) { const n = R(100, 999), d = String(n).split(''), p = R(0, 2), dg = d[p]; if (dg !== '0' && d.filter(x => x === dg).length === 1) return num(`What is the value of the ${dg} in ${n}?`, Number(dg) * 10 ** (2 - p)); } } },
      { id: 'm-3-add', t: 'Adding 3-digit numbers', icon: '➕',
        learn: { say: 'Line up the hundreds, tens and ones. Add the ones first.', eg: '345 + 128 → 5+8 = 13 (write 3, carry 1), 4+2+1 = 7, 3+1 = 4 → 473.', tip: 'Use paper — written column addition is a superpower!' },
        gen() { const a = R(100, 850), b = R(50, 999 - a); return num(`${a} + ${b} = ?`, a + b); } },
      { id: 'm-3-sub', t: 'Subtracting 3-digit numbers', icon: '➖',
        learn: { say: 'Line up the columns. If the top digit is smaller, exchange from the next column.', eg: '452 − 127 → 2−7 can\'t, exchange: 12−7 = 5, 4−2 = 2, 4−1 = 3 → 325.', tip: 'Check by adding your answer to the number you took away.' },
        gen() { const a = R(200, 999), b = R(100, a - 1); return num(`${a} − ${b} = ?`, a - b); } },
      { id: 'm-3-mult', t: 'Multiplying 2-digit by 1-digit', icon: '🚀',
        learn: { say: 'Split the big number into tens and ones, multiply both, then add.', eg: '23 × 4 → 20 × 4 = 80, 3 × 4 = 12 → 80 + 12 = 92.', tip: 'This is called partitioning.' },
        gen() { const a = R(11, 40), b = R(2, 9), t = Math.floor(a / 10) * 10, o = a % 10; return num(`${a} × ${b} = ?`, a * b, { why: `${t} × ${b} = ${t * b}, ${o} × ${b} = ${o * b}, total ${a * b}` }); } },
      { id: 'm-3-frac', t: 'Fractions of amounts', icon: '🍫',
        learn: { say: 'To find a fraction of a number: divide by the bottom, multiply by the top.', eg: '2/3 of 12 → 12 ÷ 3 = 4, 4 × 2 = 8.', tip: 'The bottom number tells you how many equal groups.' },
        gen() { const d = pick([2, 3, 4, 5, 6, 8, 10]), a = R(1, d - 1), n = d * R(2, 10); return num(`What is ${a}/${d} of ${n}?`, n / d * a, { why: `${n} ÷ ${d} = ${n / d}, × ${a} = ${n / d * a}` }); } },
      { id: 'm-3-perim', t: 'Perimeter', icon: '📏',
        learn: { say: 'Perimeter is the distance all the way around the outside of a shape.', eg: 'A rectangle 6 cm by 4 cm: 6 + 4 + 6 + 4 = 20 cm.', tip: 'Imagine an ant walking round the edge!' },
        gen() { const l = R(2, 15), w = R(1, l); return num('What is the perimeter of this rectangle? (cm)', 2 * (l + w), { html: rectSVG(l, w), why: `${l} + ${w} + ${l} + ${w} = ${2 * (l + w)}` }); } }
    ],
    4: [
      { id: 'm-4-tables', t: 'All times tables to 12 × 12', icon: '🏁',
        learn: { say: 'By Year 4 we know every times table up to 12 × 12 — fast!', eg: '7 × 8 = 56. 9 × 6 = 54. 12 × 11 = 132.', tip: 'Tricky ones? 9s trick: the digits add to 9 (54 → 5+4 = 9).' },
        gen() { const t = R(2, 12), k = R(2, 12); return Math.random() < .75 ? num(`${k} × ${t} = ?`, k * t) : num(`${k * t} ÷ ${t} = ?`, k); } },
      { id: 'm-4-add', t: '4-digit adding and subtracting', icon: '🧮',
        learn: { say: 'Column methods work for big numbers too — line up thousands, hundreds, tens and ones.', eg: '3456 + 2378 = 5834', tip: 'Estimate first: 3500 + 2400 ≈ 5900. Is your answer close?' },
        gen() { if (Math.random() < .5) { const a = R(1000, 7000), b = R(500, 9999 - a); return num(`${a} + ${b} = ?`, a + b); } const a = R(2000, 9999), b = R(500, a - 1); return num(`${a} − ${b} = ?`, a - b); } },
      { id: 'm-4-round', t: 'Rounding', icon: '🎯',
        learn: { say: 'Rounding finds the nearest "friendly" number.', eg: '347 to the nearest 10 → 350. To the nearest 100 → 300.', tip: 'Look at the digit to the right: 5 or more, round up!' },
        gen() { const to = pick([10, 100, 1000]), n = R(to === 10 ? 11 : to === 100 ? 101 : 1001, 9999); return num(`Round ${n} to the nearest ${to}.`, Math.round(n / to) * to); } },
      { id: 'm-4-dec', t: 'Dividing by 10 and 100', icon: '🔟',
        learn: { say: 'When we divide by 10, digits move one place to the right. By 100, two places.', eg: '45 ÷ 10 = 4.5   ·   45 ÷ 100 = 0.45', tip: 'Multiplying moves digits left — dividing moves them right.' },
        gen() { const n = R(1, 999), d = pick([10, 100]); if (Math.random() < .6) return num(`${n} ÷ ${d} = ?`, Number((n / d).toFixed(2))); const x = R(11, 99); return num(`${(x / 10).toFixed(1)} × ${d} = ?`, x * d / 10); } },
      { id: 'm-4-roman', t: 'Roman numerals', icon: '🏛️',
        learn: { say: 'The Romans used letters for numbers: I = 1, V = 5, X = 10, L = 50, C = 100.', eg: 'XIV = 10 + 4 = 14. A smaller letter BEFORE a bigger one means take away: IV = 4, XC = 90.', tip: 'Read left to right and add — unless a small one sits before a big one.' },
        gen() { const n = R(1, 100); if (Math.random() < .5) return num(`What number is ${roman(n)}?`, n); return ch(`Which Roman numeral means ${n}?`, roman(n), numWrongs(n, 6, 1).map(roman)); } },
      { id: 'm-4-equiv', t: 'Equivalent fractions', icon: '🥧',
        learn: { say: 'Equivalent fractions look different but are worth the same.', eg: '1/2 = 2/4 = 4/8. Multiply the top AND bottom by the same number.', tip: 'Whatever you do to the bottom, do to the top!' },
        gen() { const [a, b] = pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [1, 5]]), k = R(2, 6); return Math.random() < .5 ? num(`${a}/${b} = ?/${b * k}`, a * k, { why: `${b} × ${k} = ${b * k}, so ${a} × ${k} = ${a * k}` }) : num(`${a}/${b} = ${a * k}/?`, b * k, { why: `${a} × ${k} = ${a * k}, so ${b} × ${k} = ${b * k}` }); } },
      { id: 'm-4-area', t: 'Area', icon: '🟧',
        learn: { say: 'Area is how much space a flat shape covers. We count squares.', eg: 'A rectangle 5 squares long and 3 squares wide → 5 × 3 = 15 squares.', tip: 'Length × width is quicker than counting!' },
        gen() { const l = R(2, 10), w = R(2, 7); return num('What is the area of this shape? (squares)', l * w, { html: gridSVG(l, w), why: `${l} × ${w} = ${l * w}` }); } }
    ],
    5: [
      { id: 'm-5-mult', t: 'Long multiplication', icon: '✖️',
        learn: { say: 'For big multiplications, use the column method on paper.', eg: '24 × 13 → 24 × 3 = 72, 24 × 10 = 240, 72 + 240 = 312.', tip: 'Multiply by the ones, then by the tens (add a zero!), then add.' },
        gen() { if (Math.random() < .5) { const a = R(101, 999), b = R(2, 9); return num(`${a} × ${b} = ?`, a * b, { hint: 'Use paper for working out.' }); } const a = R(12, 35), b = R(11, 25); return num(`${a} × ${b} = ?`, a * b, { hint: 'Use paper for working out.', why: `${a} × ${b % 10} = ${a * (b % 10)}, ${a} × ${b - b % 10} = ${a * (b - b % 10)}, total ${a * b}` }); } },
      { id: 'm-5-prime', t: 'Prime numbers', icon: '🔐',
        learn: { say: 'A prime number has exactly two factors: 1 and itself.', eg: '7 is prime (only 1 × 7). 8 is not prime (2 × 4 = 8).', tip: '1 is NOT prime. 2 is the only even prime.' },
        gen() { const P = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47], C = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 21, 22, 25, 27, 33, 35, 39, 45, 49, 51]; return ch('Which of these is a prime number?', pick(P), shuffle(C).slice(0, 3)); } },
      { id: 'm-5-square', t: 'Square and cube numbers', icon: '🧊',
        learn: { say: 'A square number is a number times itself. A cube is a number times itself three times.', eg: '5² = 5 × 5 = 25.   3³ = 3 × 3 × 3 = 27.', tip: 'The little ² means "squared", the little ³ means "cubed".' },
        gen() { if (Math.random() < .65) { const n = R(1, 12); return num(`${n}² = ?`, n * n, { why: `${n} × ${n} = ${n * n}` }); } const n = R(1, 5); return num(`${n}³ = ?`, n ** 3, { why: `${n} × ${n} × ${n} = ${n ** 3}` }); } },
      { id: 'm-5-frac', t: 'Adding and subtracting fractions', icon: '🍕',
        learn: { say: 'When the bottom numbers (denominators) are the same, just add or subtract the tops.', eg: '2/7 + 3/7 = 5/7.   5/8 − 2/8 = 3/8.', tip: 'The bottom number stays the same!' },
        gen() { const d = R(4, 12); if (Math.random() < .5) { const a = R(1, d - 2), b = R(1, d - a - 1); return ch(`${a}/${d} + ${b}/${d} = ?`, `${a + b}/${d}`, [`${a + b}/${2 * d}`, `${a * b}/${d}`, `${a + b + 1}/${d}`, `${a + b - 1}/${d}`]); } const a = R(2, d - 1), b = R(1, a - 1); return ch(`${a}/${d} − ${b}/${d} = ?`, `${a - b}/${d}`, [`${a - b}/0`, `${a + b}/${d}`, `${a - b + 1}/${d}`, `${Math.max(1, a - b - 1)}/${d}`]); } },
      { id: 'm-5-percent', t: 'Percentages', icon: '💯',
        learn: { say: 'Per cent means "out of 100". 50% is a half, 25% is a quarter, 10% is a tenth.', eg: '10% of 80 = 8.   25% of 80 = 20.   50% of 80 = 40.', tip: 'Find 10% first by dividing by 10 — then build up.' },
        gen() { const p = pick([10, 20, 25, 50, 75, 5]), n = R(1, 25) * 20; return num(`What is ${p}% of ${n}?`, n * p / 100, { why: `${p}% of ${n} = ${n} × ${p} ÷ 100 = ${n * p / 100}` }); } },
      { id: 'm-5-neg', t: 'Negative numbers', icon: '🥶',
        learn: { say: 'Negative numbers are below zero — like very cold temperatures.', eg: 'It is 3°C. It gets 5 degrees colder → −2°C.', tip: 'Picture a thermometer: up is warmer, down is colder.' },
        gen() { const s = R(-10, 10), c = R(1, 12); return Math.random() < .5 ? num(`It is ${s}°C. It drops by ${c}°. What is the new temperature?`, s - c, { hint: 'Use the − key for minus numbers.' }) : num(`It is ${s}°C. It rises by ${c}°. What is the new temperature?`, s + c, { hint: 'Count up on a number line.' }); } },
      { id: 'm-5-dec', t: 'Adding and subtracting decimals', icon: '🔹',
        learn: { say: 'Line up the decimal points, then add or subtract like normal.', eg: '3.6 + 2.7 = 6.3   ·   5.2 − 1.8 = 3.4', tip: 'Keep the dots in a straight line!' },
        gen() { const a = R(11, 99), b = R(11, 99); if (Math.random() < .5) return num(`${(a / 10).toFixed(1)} + ${(b / 10).toFixed(1)} = ?`, (a + b) / 10); const [x, y] = a > b ? [a, b] : [b, a]; return num(`${(x / 10).toFixed(1)} − ${(y / 10).toFixed(1)} = ?`, (x - y) / 10); } }
    ],
    6: [
      { id: 'm-6-order', t: 'Order of operations', icon: '🧩',
        learn: { say: 'When a sum has lots of parts, we do them in order: Brackets, then × and ÷, then + and −.', eg: '3 + 4 × 2 = 3 + 8 = 11 (not 14!).   (3 + 4) × 2 = 14.', tip: 'Remember BODMAS / BIDMAS.' },
        gen() { const f = R(0, 3), a = R(2, 12), b = R(2, 9), c = R(2, 9); if (f === 0) return num(`${a} + ${b} × ${c} = ?`, a + b * c, { why: `${b} × ${c} = ${b * c} first, then + ${a}` }); if (f === 1) return num(`(${a} + ${b}) × ${c} = ?`, (a + b) * c, { why: `Brackets first: ${a + b}, then × ${c}` }); if (f === 2) { const p = a * b, q = R(1, p - 1); return num(`${a} × ${b} − ${q} = ?`, p - q, { why: `${a} × ${b} = ${p} first, then − ${q}` }); } const bb = b * c, aa = R(bb / b + 1, 40); return num(`${aa} − ${bb} ÷ ${b} = ?`, aa - c, { why: `${bb} ÷ ${b} = ${c} first, then ${aa} − ${c}` }); } },
      { id: 'm-6-percent', t: 'Percentages of amounts', icon: '💷',
        learn: { say: 'Find 10% (÷ 10) and 5% (half of 10%), then build any percentage.', eg: '35% of 60 → 10% = 6, so 30% = 18, 5% = 3 → 21.', tip: '1% means divide by 100.' },
        gen() { const p = 5 * R(1, 19), n = 20 * R(1, 20); return num(`What is ${p}% of ${n}?`, n * p / 100, { why: `${n} ÷ 100 × ${p} = ${n * p / 100}` }); } },
      { id: 'm-6-ratio', t: 'Ratio', icon: '⚖️',
        learn: { say: 'Ratio compares amounts. 2 : 3 means for every 2 of one, there are 3 of the other.', eg: 'Share 20 sweets in the ratio 2 : 3 → 5 parts, 20 ÷ 5 = 4 each part → 8 and 12.', tip: 'Add the parts, divide, then multiply.' },
        gen() { const a = R(1, 5); let b = R(1, 6); while (b === a) b = R(1, 6); const k = R(2, 10), T = (a + b) * k, big = Math.random() < .5; return num(`Share ${T} sweets in the ratio ${a} : ${b}. How many in the ${big ? 'larger' : 'smaller'} share?`, (big ? Math.max(a, b) : Math.min(a, b)) * k, { why: `${a} + ${b} = ${a + b} parts, ${T} ÷ ${a + b} = ${k} per part` }); } },
      { id: 'm-6-algebra', t: 'Algebra: find the missing number', icon: '🔎',
        learn: { say: 'In algebra, a letter stands for a missing number. We work backwards to find it.', eg: '3x + 4 = 19 → take 4: 3x = 15 → divide by 3: x = 5.', tip: 'Do the opposite operation to both sides.' },
        gen() { const x = R(1, 12), a = R(2, 9), b = R(1, 20); return Math.random() < .6 ? num(`${a}x + ${b} = ${a * x + b}.  What is x?`, x, { why: `${a * x + b} − ${b} = ${a * x}, ÷ ${a} = ${x}` }) : num(`${a}x − ${b} = ${a * x - b}.  What is x?`, x, { why: `${a * x - b} + ${b} = ${a * x}, ÷ ${a} = ${x}` }); } },
      { id: 'm-6-div', t: 'Long division', icon: '➗',
        learn: { say: 'Long division breaks a big division into small steps.', eg: '432 ÷ 12 → 12 into 43 = 3 r 7 → 12 into 72 = 6 → 36.', tip: 'Write the multiples of the divisor down the side first.' },
        gen() { const d = R(11, 25), q = R(12, 60); return num(`${d * q} ÷ ${d} = ?`, q, { hint: 'Use paper for working out.' }); } },
      { id: 'm-6-fracmul', t: 'Multiplying fractions', icon: '🍰',
        learn: { say: 'To multiply fractions, multiply the tops and multiply the bottoms.', eg: '2/3 × 3/4 = 6/12 = 1/2', tip: 'Then simplify if you can!' },
        gen() { const b = R(2, 6), d = R(2, 6), a = R(1, b - 1), c = R(1, d - 1); return ch(`${a}/${b} × ${c}/${d} = ? (simplest form)`, simp(a * c, b * d), [`${a + c}/${b + d}`, `${a * c}/${b + d}`, simp(a * d, b * c), `${a + c}/${b * d}`].filter(x => x !== simp(a * c, b * d)), { why: `${a} × ${c} = ${a * c}, ${b} × ${d} = ${b * d} → ${simp(a * c, b * d)}` }); } },
      { id: 'm-6-mean', t: 'Mean average', icon: '📊',
        learn: { say: 'The mean is the "fair share" average: add them all up, then divide by how many there are.', eg: '4, 6, 8 → 4 + 6 + 8 = 18, 18 ÷ 3 = 6.', tip: 'Count how many numbers there are carefully.' },
        gen() { const n = R(3, 5), m = R(4, 20); let v = Array.from({ length: n - 1 }, () => R(Math.max(1, m - 6), m + 6)); const last = m * n - v.reduce((s, x) => s + x, 0); if (last < 1) return this.gen(); v.push(last); v = shuffle(v); return num(`What is the mean of: ${v.join(', ')}?`, m, { why: `Total ${m * n} ÷ ${n} = ${m}` }); } },
      { id: 'm-6-tri', t: 'Area of triangles', icon: '🔺',
        learn: { say: 'A triangle is half of a rectangle! Area = base × height ÷ 2.', eg: 'Base 8 cm, height 5 cm → 8 × 5 = 40, ÷ 2 = 20 cm².', tip: 'The height must be straight up from the base (the dotted line).' },
        gen() { let b = R(2, 20); const h = R(2, 16); if ((b * h) % 2) b++; return num('What is the area of this triangle? (cm²)', b * h / 2, { html: triSVG(b, h), why: `${b} × ${h} = ${b * h}, ÷ 2 = ${b * h / 2}` }); } }
    ]
  };

  /* ================= ENGLISH ================= */
  const english = {
    R: [
      { id: 'e-r-sounds', t: 'First sounds', icon: '🔤',
        learn: { say: 'Every word starts with a sound. Say the word slowly and listen to the very first sound.', eg: '🐱 c-c-cat starts with "c".', tip: 'Stretch the word out like chewing gum!' },
        gen() { const [w, e] = pick(FIRST), L = w[0]; return ch(`What sound does this start with?`, L, 'abcdefghklmnoprstuvwz'.split('').filter(x => x !== L), { visual: e, speak: w }); } },
      { id: 'e-r-cvc', t: 'Reading words', icon: '📖',
        learn: { say: 'We can sound out a word, then blend the sounds together.', eg: 'p – i – g → pig 🐷', tip: 'Point to each letter as you say its sound.' },
        gen() { const [w, e] = pick(CVC); return ch(`Read the word:  ${w}\nWhich picture matches?`, e, CVC.filter(x => x[0] !== w).map(x => x[1]), { big: true }); } },
      { id: 'e-r-rhyme', t: 'Rhyming words', icon: '🎵',
        learn: { say: 'Words rhyme when they end with the same sound.', eg: 'cat, hat, bat, mat — they all end in "at".', tip: 'Say both words out loud. Do they sound the same at the end?' },
        gen() { const F = pick(RHYME), [w, a] = shuffle(F); const others = RHYME.filter(x => x !== F).map(x => pick(x)); return ch(`Which word rhymes with "${w}"?`, a, others, { speak: w }); } },
      { id: 'e-r-letters', t: 'Big and little letters', icon: '🅰️',
        learn: { say: 'Every letter has a big (capital) shape and a little shape.', eg: 'a → A,  b → B,  m → M', tip: 'Be careful with b and d — they face different ways!' },
        gen() { const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), L = pick(A); return ch(`Which capital letter matches  "${L.toLowerCase()}"?`, L, ({ B: ['D', 'P', 'R'], D: ['B', 'P', 'O'], P: ['B', 'Q', 'R'], Q: ['O', 'P', 'G'], M: ['N', 'W', 'H'], N: ['M', 'H', 'U'] }[L] || A.filter(x => x !== L))); } }
    ],
    1: [
      { id: 'e-1-digraph', t: 'Special sounds (sh, ch, th…)', icon: '🐚',
        learn: { say: 'Sometimes two letters work together to make one sound.', eg: 's + h = "sh" as in ship 🚢.  c + h = "ch" as in chick 🐥.', tip: 'Spot the sound buddies: sh, ch, th, ng, ck, oo, ai, oa, ar.' },
        gen() { const [w, g, e] = pick(DIGRAPH); return ch(`Which letters fill the gap?\n${w.replace(g, '__')}`, g, ['sh', 'ch', 'th', 'ng', 'ck', 'qu', 'oo', 'ai', 'oa', 'ar'].filter(x => x !== g), { visual: e, speak: w }); } },
      { id: 'e-1-words', t: 'Tricky words', icon: '🧠',
        learn: { say: 'Some words don\'t follow the normal sound rules. We learn them by heart.', eg: 'said, they, friend, school, people', tip: 'Look, say, cover, write, check!' },
        gen: spellQ(Y1W) },
      { id: 'e-1-plural', t: 'Adding s or es', icon: '🦊',
        learn: { say: 'To make more than one, we usually add "s". After s, x, z, sh or ch, we add "es".', eg: 'cat → cats.   fox → foxes.   dish → dishes.', tip: 'If you can hear an extra "iz" sound, add es!' },
        gen() { const L = [['cat', 'cats'], ['fox', 'foxes'], ['bus', 'buses'], ['dish', 'dishes'], ['box', 'boxes'], ['dog', 'dogs'], ['book', 'books'], ['church', 'churches'], ['brush', 'brushes'], ['hat', 'hats'], ['wish', 'wishes'], ['tree', 'trees'], ['glass', 'glasses'], ['frog', 'frogs']]; const [b, p] = pick(L); return ch(`One ${b}, two ...`, p, [b + 's', b + 'es', b + 'ses'].filter(x => x !== p)); } },
      { id: 'e-1-caps', t: 'Capital letters and full stops', icon: '✏️',
        learn: { say: 'A sentence starts with a capital letter and ends with a full stop.', eg: 'The dog ran to the park.', tip: 'The word "I" is always a capital letter too!' },
        gen() { const s = pick(['The dog ran to the park.', 'We went to the beach.', 'My cat is sleeping.', 'Dad made a big cake.', 'The sun is hot today.', 'Sam has a red hat.', 'We like to play.']); const lo = s[0].toLowerCase() + s.slice(1); return ch('Which sentence is written correctly?', s, [lo, s.slice(0, -1), lo.slice(0, -1)]); } },
      { id: 'e-1-days', t: 'Days of the week', icon: '📅',
        learn: { say: 'There are 7 days in a week, always in the same order.', eg: 'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.', tip: 'Days always start with a capital letter.' },
        gen() { const D = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], i = R(0, 6), after = Math.random() < .5; return ch(`What day comes ${after ? 'after' : 'before'} ${D[i]}?`, D[(i + (after ? 1 : 6)) % 7], D.filter((_, j) => j !== i)); } },
      { id: 'e-1-read', t: 'Reading detective', icon: '🕵️', learn: readLearn, gen: readQ('ks1') }
    ],
    2: [
      { id: 'e-2-words', t: 'Year 2 tricky words', icon: '🧠',
        learn: { say: 'These words are on the Year 2 spelling list. Some have sneaky silent letters or odd sounds.', eg: 'climb (silent b), because, beautiful, could, people', tip: 'Find the tricky part of the word and practise just that bit.' },
        gen: spellQ(Y2W) },
      { id: 'e-2-suffix', t: 'Endings: -ful, -less, -ness, -ment', icon: '🧩',
        learn: { say: 'A suffix is added to the end of a word to change its meaning.', eg: 'care + ful = careful.  kind + ness = kindness.  happy + ness = happiness (y → i!).', tip: '"-ful" only has ONE l at the end.' },
        gen() { const L = [['care', 'ful', 'careful'], ['help', 'ful', 'helpful'], ['hope', 'less', 'hopeless'], ['kind', 'ness', 'kindness'], ['enjoy', 'ment', 'enjoyment'], ['play', 'ful', 'playful'], ['sad', 'ness', 'sadness'], ['pay', 'ment', 'payment'], ['happy', 'ness', 'happiness'], ['fear', 'less', 'fearless'], ['dark', 'ness', 'darkness'], ['move', 'ment', 'movement'], ['beauty', 'ful', 'beautiful'], ['plenty', 'ful', 'plentiful']]; const [b, s, c] = pick(L); const w = []; if (b + s !== c) w.push(b + s); if (s === 'ful') w.push(c + 'l'); return ch(`${b} + ${s} = ?`, c, [...w, ...misspell(c)]); } },
      { id: 'e-2-past', t: 'Past tense', icon: '⏪',
        learn: { say: 'Past tense tells us something already happened. We often add "ed", but some verbs change completely!', eg: 'jump → jumped.  hop → hopped.  go → went.  see → saw.', tip: 'Say "Yesterday I ..." to check it sounds right.' },
        gen() { const L = [['jump', 'jumped'], ['walk', 'walked'], ['play', 'played'], ['hop', 'hopped'], ['skip', 'skipped'], ['smile', 'smiled'], ['cry', 'cried'], ['go', 'went'], ['run', 'ran'], ['see', 'saw'], ['eat', 'ate'], ['swim', 'swam'], ['sing', 'sang'], ['come', 'came']]; const [b, p] = pick(L); return ch(`Today I ${b}. Yesterday I ...`, p, [b + 'ed', b + 's', b + 'ing', b + 'd'].filter(x => x !== p)); } },
      { id: 'e-2-class', t: 'Nouns, verbs and adjectives', icon: '🏷️',
        learn: { say: 'A noun is a person, place or thing. A verb is a doing word. An adjective describes a noun.', eg: 'The happy (adjective) dog (noun) jumped (verb).', tip: 'Can you do it? Verb. Can you touch it? Noun. Does it describe? Adjective.' },
        gen() { const S = pick([{ s: 'The happy dog jumped over the log.', n: 'dog', v: 'jumped', a: 'happy', x: 'over' }, { s: 'A tall girl kicked the ball.', n: 'girl', v: 'kicked', a: 'tall', x: 'the' }, { s: 'The little bird sang a song.', n: 'bird', v: 'sang', a: 'little', x: 'a' }, { s: 'My big brother ate the cake.', n: 'brother', v: 'ate', a: 'big', x: 'my' }, { s: 'The cold wind blew all night.', n: 'wind', v: 'blew', a: 'cold', x: 'all' }, { s: 'A noisy cat climbed the fence.', n: 'cat', v: 'climbed', a: 'noisy', x: 'a' }, { s: 'The sleepy baby smiled at me.', n: 'baby', v: 'smiled', a: 'sleepy', x: 'at' }]); const k = pick(['n', 'v', 'a']), nm = { n: 'noun', v: 'verb', a: 'adjective' }[k]; return { text: `Which word is the ${nm}?\n"${S.s}"`, answer: S[k], choices: shuffle([S.n, S.v, S.a, S.x]) }; } },
      { id: 'e-2-contract', t: 'Shortened words (don\'t, can\'t)', icon: '✂️',
        learn: { say: 'A contraction squashes two words together. The apostrophe shows where letters are missing.', eg: 'do not → don\'t (the o is missing).  I am → I\'m.', tip: 'Put the apostrophe exactly where the letters were taken out.' },
        gen() { const L = [['do not', "don't"], ['can not', "can't"], ['did not', "didn't"], ['it is', "it's"], ['I am', "I'm"], ['you are', "you're"], ['we will', "we'll"], ['she is', "she's"], ['they have', "they've"], ['is not', "isn't"], ['I have', "I've"], ['he will', "he'll"]]; const [f, c] = pick(L), i = c.indexOf("'"), raw = c.replace("'", ''); return ch(`How do we shorten "${f}"?`, c, [raw, raw.slice(0, i - 1) + "'" + raw.slice(i - 1), raw.slice(0, i + 1) + "'" + raw.slice(i + 1)]); } },
      { id: 'e-2-conj', t: 'Joining words (and, but, because)', icon: '🔗',
        learn: { say: 'Conjunctions join ideas together in one sentence.', eg: 'and (adds), but (changes direction), because (gives a reason), or (a choice), so (a result).', tip: 'Read the whole sentence with each word — which makes sense?' },
        gen() { const S = pick([['I wanted to play outside ___ it was raining.', 'but'], ['I wore my coat ___ it was cold.', 'because'], ['Would you like juice ___ milk?', 'or'], ['We had fish ___ chips for tea.', 'and'], ['She was tired ___ she went to bed early.', 'so'], ['I like apples ___ I do not like pears.', 'but'], ['He was happy ___ he won the game.', 'because'], ['Do you want to paint ___ draw?', 'or'], ['It was sunny ___ we went to the beach.', 'so']]); return ch(S[0], S[1], ['but', 'or', 'because', 'so', ...(S[1] === 'and' ? [] : [])].filter(x => x !== S[1])); } },
      { id: 'e-2-punct', t: 'Full stop, question mark or exclamation mark?', icon: '❓',
        learn: { say: 'A statement ends with a full stop. A question ends with "?". A strong feeling ends with "!".', eg: 'I like cake.   Do you like cake?   What a huge cake!', tip: 'Does it ask something? Use ?' },
        gen() { const S = pick([['Where is my coat', '?'], ['I like pizza', '.'], ['What a huge dog', '!'], ['Can we go to the park', '?'], ['The bus is late', '.'], ['How old are you', '?'], ['What a lovely surprise', '!'], ['My cat is black', '.'], ['Who ate the cake', '?'], ['How amazing that was', '!']]); return { text: `Which mark ends this sentence?\n"${S[0]}__"`, answer: S[1], choices: ['.', '?', '!'] }; } },
      { id: 'e-2-read', t: 'Reading detective', icon: '🕵️', learn: readLearn, gen: readQ('ks1') }
    ],
    3: [
      { id: 'e-3-words', t: 'Year 3 spelling words', icon: '🧠',
        learn: { say: 'These words are from the Year 3/4 spelling list.', eg: 'believe, different, February, favourite, important', tip: 'Break long words into syllables: dif-fer-ent.' },
        gen: spellQ(Y3W) },
      { id: 'e-3-prefix', t: 'Prefixes: un, dis, mis, re', icon: '🔄',
        learn: { say: 'A prefix goes at the start of a word and changes its meaning.', eg: 'un + happy = unhappy (not happy).  re + build = rebuild (build again).  mis + spell = misspell (spell wrongly).', tip: 'The spelling of the root word never changes.' },
        gen() { const L = [['not happy', 'un', 'happy'], ['not kind', 'un', 'kind'], ['not tidy', 'un', 'tidy'], ['not fair', 'un', 'fair'], ['to not agree', 'dis', 'agree'], ['to vanish (not appear)', 'dis', 'appear'], ['to not obey', 'dis', 'obey'], ['not honest', 'dis', 'honest'], ['to behave badly', 'mis', 'behave'], ['to spell wrongly', 'mis', 'spell'], ['to understand wrongly', 'mis', 'understand'], ['to build again', 're', 'build'], ['to visit again', 're', 'visit'], ['to fill again', 're', 'fill']]; const [m, p, r] = pick(L); return ch(`Which word means "${m}"?`, p + r, ['un', 'dis', 'mis', 're'].filter(x => x !== p).map(x => x + r)); } },
      { id: 'e-3-aan', t: '"a" or "an"?', icon: '🍎',
        learn: { say: 'Use "an" before a vowel SOUND (a, e, i, o, u). Use "a" before other sounds.', eg: 'an apple, an egg, a banana, a dog. Tricky: an hour (silent h!), a unicorn ("you" sound).', tip: 'Listen to the sound, not just the letter.' },
        gen() { const L = [['apple', 'an'], ['egg', 'an'], ['elephant', 'an'], ['igloo', 'an'], ['orange', 'an'], ['umbrella', 'an'], ['owl', 'an'], ['hour', 'an'], ['octopus', 'an'], ['banana', 'a'], ['dog', 'a'], ['unicorn', 'a'], ['house', 'a'], ['uniform', 'a'], ['kite', 'a'], ['table', 'a']]; const [w, a] = pick(L); return { text: 'Which is correct?', answer: `${a} ${w}`, choices: [`a ${w}`, `an ${w}`] }; } },
      { id: 'e-3-homo', t: 'Homophones', icon: '👂',
        learn: { say: 'Homophones sound the same but are spelt differently and mean different things.', eg: 'hear (with your ears) / here (this place).   sea (water) / see (with your eyes).', tip: 'hEAR has an EAR in it!' },
        gen() { const S = pick([['Can you ___ the music?', 'hear', ['here']], ['Come over ___!', 'here', ['hear']], ['We swam in the ___.', 'sea', ['see']], ['I can ___ a rainbow.', 'see', ['sea']], ['I ___ my lunch.', 'ate', ['eight']], ['A spider has ___ legs.', 'eight', ['ate']], ['The children put on ___ coats.', 'their', ['there', "they're"]], ['Put the box over ___.', 'there', ['their', "they're"]], ["___ going to the park.", "They're", ['Their', 'There']], ['I have ___ sisters.', 'two', ['to', 'too']], ['It is ___ hot today.', 'too', ['two', 'to']], ['We walked ___ school.', 'to', ['two', 'too']], ['The ___ rode a horse.', 'knight', ['night']], ['The owl hunts at ___.', 'night', ['knight']], ['I ___ the bus this morning.', 'missed', ['mist']]]); return ch(S[0], S[1], S[2]); } },
      { id: 'e-3-adverb', t: 'Adverbs', icon: '💨',
        learn: { say: 'An adverb tells us HOW, WHEN or WHERE something happens.', eg: 'The cat crept quietly. (how?)  Yesterday we went out. (when?)', tip: 'Lots of adverbs end in "-ly".' },
        gen() { const S = pick([['The cat crept quietly into the room.', 'quietly', ['cat', 'crept', 'room']], ['Sam ran quickly to the bus.', 'quickly', ['Sam', 'ran', 'bus']], ['The baby slept peacefully all night.', 'peacefully', ['baby', 'slept', 'night']], ['Mum spoke softly to the puppy.', 'softly', ['Mum', 'spoke', 'puppy']], ['The children laughed loudly at the clown.', 'loudly', ['children', 'laughed', 'clown']], ['He carefully carried the eggs.', 'carefully', ['He', 'carried', 'eggs']], ['Yesterday we visited the zoo.', 'Yesterday', ['we', 'visited', 'zoo']], ['The rain fell heavily on the roof.', 'heavily', ['rain', 'fell', 'roof']]]); return ch(`Which word is the adverb?\n"${S[0]}"`, S[1], S[2]); } },
      { id: 'e-3-speech', t: 'Speech marks', icon: '💬',
        learn: { say: 'Speech marks (inverted commas) go around the exact words someone says.', eg: '“Come here,” said Mum.', tip: 'The comma goes INSIDE the speech marks.' },
        gen() { const [S, P] = pick([['Come here', 'Mum'], ['It is time for tea', 'Dad'], ['Look at that rainbow', 'Ella'], ['I love reading', 'Ravi'], ['The bus is coming', 'Grandma'], ["Let's play a game", 'Zara']]); return ch('Which is punctuated correctly?', `“${S},” said ${P}.`, [`“${S}” said ${P}.`, `${S}, said ${P}.`, `“${S}, said ${P}.”`]); } },
      { id: 'e-3-read', t: 'Reading detective', icon: '🕵️', learn: readLearn, gen: readQ('lks2') }
    ],
    4: [
      { id: 'e-4-words', t: 'Year 4 spelling words', icon: '🧠',
        learn: { say: 'More words from the Year 3/4 spelling list.', eg: 'separate, surprise, straight, through, therefore', tip: 'Make up a silly sentence to remember the tricky bit: "there is A RAT in sepARATe".' },
        gen: spellQ(Y4W) },
      { id: 'e-4-apost', t: 'Apostrophes for belonging', icon: '🎒',
        learn: { say: 'An apostrophe can show that something belongs to someone.', eg: 'one dog → the dog\'s tail.  two girls → the girls\' toys.  children → the children\'s coats.', tip: 'Plural ending in s? Put the apostrophe after the s.' },
        gen() { const L = [['dog', 'tail', 's'], ['girl', 'bag', 's'], ['teacher', 'desk', 's'], ['cat', 'bowl', 's'], ['girls', 'toys', 'p'], ['boys', 'football', 'p'], ['birds', 'nests', 'p'], ['children', 'coats', 'i'], ['women', 'team', 'i']]; const [o, t, k] = pick(L); let c, w; if (k === 'p') { const b = o.slice(0, -1); c = `the ${o}' ${t}`; w = [`the ${b}'s ${t}`, `the ${o}'s ${t}`, `the ${o} ${t}`]; } else { c = `the ${o}'s ${t}`; w = [`the ${o}s' ${t}`, `the ${o}s ${t}`, k === 'i' ? `the ${o}' ${t}` : `the ${o},s ${t}`]; } return ch(`The ${t} belonging to the ${o} → ?`, c, w); } },
      { id: 'e-4-fronted', t: 'Fronted adverbials', icon: '🏃',
        learn: { say: 'A fronted adverbial is a phrase at the START of a sentence that tells when, where or how. It is followed by a comma.', eg: 'After lunch, we played football.', tip: 'Fronted adverbial + comma + the rest of the sentence.' },
        gen() { const [A, B] = pick([['After lunch', 'we played football'], ['In the morning', 'the birds sang'], ['Without a sound', 'the fox crept away'], ['As the sun set', 'we walked home'], ['Later that day', 'Grandma baked a cake'], ['Under the bridge', 'a troll was sleeping'], ['Slowly', 'the snail crossed the path'], ['Excitedly', 'the children opened their presents']]); const a = A.split(' '), b = B.split(' '); const w = [`${A} ${B}.`, `${A} ${b[0]}, ${b.slice(1).join(' ')}.`]; if (a.length > 1) w.push(`${a[0]}, ${a.slice(1).join(' ')} ${B}.`); else w.push(`${A} ${b.slice(0, 2).join(' ')}, ${b.slice(2).join(' ')}.`); return ch('Which sentence uses the comma correctly?', `${A}, ${B}.`, w); } },
      { id: 'e-4-pronoun', t: 'Pronouns', icon: '👤',
        learn: { say: 'Pronouns replace nouns so we don\'t repeat ourselves.', eg: 'Tom lost Tom\'s bag → Tom lost HIS bag.  Amy and I → WE.', tip: 'he, she, it, we, they, you — pick the one that fits.' },
        gen() { const [n, p] = pick([['Tom', 'he'], ['Amy', 'she'], ['the dog', 'it'], ['Tom and Amy', 'they'], ['my sister and I', 'we'], ['the books', 'they'], ['Grandad', 'he'], ['Mum', 'she'], ['the bike', 'it'], ['Dad and I', 'we']]); return ch(`Which pronoun can replace "${n}"?`, p, ['he', 'she', 'it', 'we', 'they'].filter(x => x !== p)); } },
      { id: 'e-4-standard', t: 'Standard English', icon: '🎩',
        learn: { say: 'Standard English is the correct form we use in school writing.', eg: '✅ We were playing.  ❌ We was playing.   ✅ I did it.  ❌ I done it.', tip: 'Read it aloud like a newsreader!' },
        gen() { const S = pick([['We ___ going to the park.', 'were', ['was']], ['I have ___ my homework.', 'done', ['did']], ['They ___ very happy.', 'were', ['was']], ['She ___ to the shop yesterday.', 'went', ['gone']], ['___ books are mine.', 'Those', ['Them']], ['I ___ seen that film.', "haven't", ["ain't"]], ['He ___ his lunch quickly.', 'ate', ['eated']], ['You ___ late for school!', 'were', ['was']], ['I ___ any sweets left.', "don't have", ["don't have no"]]]); return ch(S[0], S[1], S[2]); } },
      { id: 'e-4-homo', t: 'Tricky homophones', icon: '👂',
        learn: { say: 'More homophones that trip people up!', eg: 'accept (to take) / except (not including).  piece (a bit) / peace (calm).', tip: 'A PIEce of PIE!' },
        gen() { const S = pick([['I ___ your apology.', 'accept', ['except']], ['Everyone came ___ Tom.', 'except', ['accept']], ['Can I have a ___ of cake?', 'piece', ['peace']], ['After the war there was ___.', 'peace', ['piece']], ['The ___ flew above the clouds.', 'plane', ['plain']], ['___ bag is this?', 'Whose', ["Who's"]], ["___ coming to tea?", "Who's", ['Whose']], ['The ___ is sunny today.', 'weather', ['whether']], ["I don't know ___ to go.", 'whether', ['weather']], ['Press the ___ to stop the bike.', 'brake', ['break']], ['Be careful not to ___ the glass.', 'break', ['brake']], ['The horse shook its ___.', 'mane', ['main']], ['We had a ___ time at the party.', 'great', ['grate']], ["The film's opening ___ was exciting.", 'scene', ['seen']]]); return ch(S[0], S[1], S[2]); } },
      { id: 'e-4-read', t: 'Reading detective', icon: '🕵️', learn: readLearn, gen: readQ('lks2') }
    ],
    5: [
      { id: 'e-5-words', t: 'Year 5 spelling words', icon: '🧠',
        learn: { say: 'These are from the Year 5/6 spelling list — real challenge words!', eg: 'accommodate (double c, double m), embarrass (double r, double s), definite', tip: 'Spot the double letters — they\'re usually the tricky part.' },
        gen: spellQ(Y5W) },
      { id: 'e-5-relative', t: 'Relative clauses', icon: '🔗',
        learn: { say: 'A relative clause adds extra information about a noun. It starts with who, which, where, when or whose.', eg: 'The girl WHO won the race is my sister.  The cake, WHICH was chocolate, was delicious.', tip: 'who = people, which = things, where = places, when = times, whose = belonging.' },
        gen() { const S = pick([['The girl ___ won the race is my sister.', 'who'], ['The cake, ___ was chocolate, tasted great.', 'which'], ['This is the park ___ we play football.', 'where'], ['I remember the day ___ it snowed.', 'when'], ['The boy ___ dog barked said sorry.', 'whose'], ['My uncle, ___ lives in Wales, has a farm.', 'who'], ['The book, ___ I borrowed, was brilliant.', 'which'], ['That is the house ___ I was born.', 'where'], ['The lady ___ car broke down called for help.', 'whose']]); return ch(S[0], S[1], ['who', 'which', 'where', 'when', 'whose'].filter(x => x !== S[1])); } },
      { id: 'e-5-modal', t: 'Modal verbs', icon: '🎲',
        learn: { say: 'Modal verbs show how likely or certain something is.', eg: 'will / must (certain) → should (likely) → might / could / may (possible).', tip: 'Imagine a "how sure am I?" scale.' },
        gen() { const S = pick([['Which modal verb shows something is CERTAIN to happen?', 'will', ['might', 'could', 'may']], ['Which word shows something is only POSSIBLE?  "It ___ snow tomorrow."', 'might', ['will', 'must', 'shall']], ['Which sentence is MOST certain?', 'We will win the match.', ['We might win the match.', 'We could win the match.', 'We may win the match.']], ['Which sentence is LEAST certain?', 'She might come to the party.', ['She will come to the party.', 'She must come to the party.', 'She is coming to the party.']], ['Which modal verb shows a rule you have to follow?  "You ___ wear a seatbelt."', 'must', ['might', 'could', 'may']], ['Which word is a modal verb?', 'should', ['quickly', 'happy', 'table']]]); return ch(S[0], S[1], S[2]); } },
      { id: 'e-5-syn', t: 'Synonyms and antonyms', icon: '🔁',
        learn: { say: 'Synonyms mean the SAME. Antonyms mean the OPPOSITE.', eg: 'big → enormous (synonym).  ancient → modern (antonym).', tip: 'Synonym = Same.  Antonym = Against.' },
        gen() { const SY = [['big', 'enormous'], ['happy', 'cheerful'], ['small', 'tiny'], ['fast', 'rapid'], ['angry', 'furious'], ['brave', 'courageous'], ['begin', 'commence'], ['clever', 'intelligent'], ['cold', 'chilly'], ['scared', 'terrified'], ['tired', 'exhausted'], ['shout', 'yell']], AN = [['ancient', 'modern'], ['generous', 'selfish'], ['include', 'exclude'], ['victory', 'defeat'], ['expand', 'shrink'], ['permanent', 'temporary'], ['rough', 'smooth'], ['accept', 'refuse'], ['frequent', 'rare'], ['hollow', 'solid'], ['brave', 'cowardly'], ['arrive', 'depart']]; const syn = Math.random() < .5, L = syn ? SY : AN, [w, a] = pick(L); return ch(syn ? `Which word means the SAME as "${w}"?` : `Which word means the OPPOSITE of "${w}"?`, a, L.filter(x => x[0] !== w).map(x => x[1])); } },
      { id: 'e-5-endings', t: 'Tricky spellings: -cious, -tious, ie/ei', icon: '🪄',
        learn: { say: 'Some word endings sound the same but are spelt differently. And remember: "i before e except after c".', eg: 'delicious, precious, ambitious, cautious.  believe, field — but receive, ceiling.', tip: 'If the root word ends in "ce", use -cious: space → spacious.' },
        gen() { if (Math.random() < .5) { const w = pick(['delicious', 'vicious', 'precious', 'spacious', 'malicious', 'gracious', 'ambitious', 'cautious', 'fictitious', 'nutritious', 'infectious']); const sw = w.includes('cious') ? w.replace('cious', 'tious') : w.replace('tious', 'cious'); return ch('Which word is spelt correctly?', w, [sw, w.replace(/[ct]ious$/, 'shus'), ...misspell(w)]); } const w = pick(['believe', 'receive', 'ceiling', 'field', 'piece', 'chief', 'deceive', 'shield', 'niece', 'thief', 'receipt']); return ch('Which word is spelt correctly?', w, [w.includes('ie') ? w.replace('ie', 'ei') : w.replace('ei', 'ie'), ...misspell(w)]); } },
      { id: 'e-5-read', t: 'Reading detective', icon: '🕵️', learn: readLearn, gen: readQ('uks2') }
    ],
    6: [
      { id: 'e-6-words', t: 'Year 6 spelling words', icon: '🧠',
        learn: { say: 'The final set of Year 5/6 spelling words — master these and you\'re ready for secondary school!', eg: 'necessary (1 collar, 2 sleeves: one c, two s), rhythm, yacht, twelfth', tip: 'Use a memory trick for each tricky word.' },
        gen: spellQ(Y6W) },
      { id: 'e-6-passive', t: 'Active and passive voice', icon: '🔀',
        learn: { say: 'Active: the subject DOES the action. Passive: the action is DONE TO the subject.', eg: 'Active: The dog chased the cat.  Passive: The cat was chased by the dog.', tip: 'Passive sentences often have "was … by".' },
        gen() { const L = [['The dog chased the cat.', 'The cat was chased by the dog.'], ['Sam wrote the letter.', 'The letter was written by Sam.'], ['The chef cooked the meal.', 'The meal was cooked by the chef.'], ['The wind broke the window.', 'The window was broken by the wind.'], ['Our class planted the trees.', 'The trees were planted by our class.'], ['The teacher marked the tests.', 'The tests were marked by the teacher.'], ['A bee stung my brother.', 'My brother was stung by a bee.'], ['The storm damaged the roof.', 'The roof was damaged by the storm.']]; const s = shuffle(L), pas = Math.random() < .5; return pas ? ch('Which sentence is in the PASSIVE voice?', s[0][1], [s[0][0], s[1][0], s[2][0]]) : ch('Which sentence is in the ACTIVE voice?', s[0][0], [s[0][1], s[1][1], s[2][1]]); } },
      { id: 'e-6-formal', t: 'Formal language and the subjunctive', icon: '🎩',
        learn: { say: 'Formal writing is polite and serious — for letters, reports and speeches. The subjunctive is a very formal verb form.', eg: 'Formal: "I would be grateful if you could reply."  Subjunctive: "If I WERE you…", "I insist that he BE on time."', tip: 'Formal writing avoids slang and contractions.' },
        gen() { if (Math.random() < .5) { const S = pick([['Could you please send me further information?', ['Can u send me more info?', 'Send me the stuff, yeah?', 'Gimme more details.']], ['I would be grateful if you could reply soon.', ['Write back quick!', 'Get back to me ASAP, mate.', 'Hurry up and reply.']], ['The meeting has been postponed until Friday.', ["The meeting's been pushed to Friday, guys.", 'No meeting till Friday lol.', 'Meeting? Nah, Friday.']], ['Pupils must not run in the corridors.', ["Don't go running about, ok?", 'No running, you lot!', 'Quit running in the halls.']], ['I am writing to complain about the noise.', ["I'm fed up with the racket.", 'The noise is doing my head in.', 'Oi, keep it down!']]]); return ch('Which sentence is the MOST formal?', S[0], S[1]); } const S = pick([['If I ___ you, I would apologise.', 'were', ['was', 'am', 'is']], ['The teacher insists that every pupil ___ on time.', 'be', ['is', 'are', 'was']], ['I suggest that he ___ early.', 'arrive', ['arrives', 'arrived', 'arriving']], ['If she ___ taller, she could reach the shelf.', 'were', ['was', 'is', 'be']], ['It is essential that she ___ the form.', 'sign', ['signs', 'signed', 'signing']]]); return ch(`Choose the formal (subjunctive) form:\n${S[0]}`, S[1], S[2]); } },
      { id: 'e-6-punct', t: 'Colons, semicolons, dashes and hyphens', icon: '✒️',
        learn: { say: 'Advanced punctuation helps make meaning clear.', eg: 'Colon before a list: I need: eggs… no! → I need three things: eggs, milk and flour.  Semicolon joins two linked sentences: It rained; we stayed in.', tip: 'A hyphen joins words (man-eating). A dash adds extra information – like this.' },
        gen() { const S = pick([['Which sentence uses a colon correctly?', 'I need three things: eggs, milk and flour.', ['I need: three things eggs, milk and flour.', 'I need three: things eggs, milk and flour.', 'I: need three things eggs, milk and flour.']], ['Which sentence uses a semicolon correctly?', 'It was raining; we stayed inside.', ['It was; raining we stayed inside.', 'It; was raining we stayed inside.', 'It was raining we; stayed inside.']], ['Which sentence uses a hyphen correctly?', 'We saw a man-eating shark.', ['We saw a man eating-shark.', 'We-saw a man eating shark.', 'We saw-a man eating shark.']], ['Which sentence uses brackets correctly?', 'My aunt (who lives in Leeds) is visiting.', ['My (aunt who lives) in Leeds is visiting.', 'My aunt who (lives in Leeds is) visiting.', 'My aunt who lives in Leeds (is visiting).']], ['Which sentence uses dashes correctly?', 'The cake – which was huge – vanished quickly.', ['The – cake which was huge vanished – quickly.', 'The cake which – was huge vanished quickly –.', '– The cake which was huge vanished quickly.']], ['Which list is punctuated correctly?', 'We packed sandwiches, crisps, apples and juice.', ['We packed, sandwiches crisps apples and juice.', 'We packed sandwiches crisps, apples, and, juice.', 'We packed sandwiches; crisps; apples and; juice.']]]); return ch(S[0], S[1], S[2]); } },
      { id: 'e-6-syn', t: 'Advanced vocabulary', icon: '📚',
        learn: { say: 'Strong writers choose precise, powerful words.', eg: 'Instead of "very big" → colossal. Instead of "said quietly" → whispered.', tip: 'Read lots — it\'s the best way to grow your word bank!' },
        gen() { const L = [['colossal', 'enormous'], ['fatigued', 'tired'], ['furious', 'very angry'], ['ancient', 'very old'], ['scarce', 'hard to find'], ['reluctant', 'unwilling'], ['vivid', 'bright and clear'], ['cautious', 'careful'], ['generous', 'happy to give'], ['ecstatic', 'extremely happy'], ['obscure', 'not well known'], ['durable', 'long-lasting']]; const [w, m] = pick(L); return ch(`What does "${w}" mean?`, m, L.filter(x => x[0] !== w).map(x => x[1])); } },
      { id: 'e-6-read', t: 'Reading detective', icon: '🕵️', learn: readLearn, gen: readQ('uks2') }
    ]
  };

  const CONTENT = { maths, english, YEARS: ['R', '1', '2', '3', '4', '5', '6'] };
  CONTENT.byId = {};
  for (const subj of ['maths', 'english']) for (const y of CONTENT.YEARS) CONTENT[subj][y].forEach((t, i) => { CONTENT.byId[t.id] = { topic: t, subj, year: y, idx: i }; });
  if (typeof module !== 'undefined') module.exports = CONTENT; else window.CONTENT = CONTENT;
})();
