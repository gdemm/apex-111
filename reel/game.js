'use strict';
// 转轮军团 — original pixel-art slot auto-battler. All sprites are drawn in code.
const W = 240; let H = 440, OFF = 0, SKY = 0;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
let S = 2, DPR = 1;

// ---------- palette & sprites ----------
const PAL = {
  k: '#1a1420', s: '#f0c09a', S: '#c98e6a', w: '#f4f4f4', g: '#c4ccd4', G: '#7a8290',
  b: '#3b6fc4', B: '#284c8c', r: '#c8423b', R: '#8a2a2a', n: '#9a6a3a', N: '#5a3a20',
  y: '#f2c14e', Y: '#b8862a', p: '#7a4fc0', P: '#4a2f7a', l: '#4f9a38', L: '#2f6b2a',
  o: '#6cb84a', O: '#3f7a2a', h: '#e8d070', c: '#7fe0f0', x: '#a0a0ac', X: '#5a5a66', m: '#d86ab0'
};
function makeSprite(rows, pal) {
  pal = Object.assign({}, PAL, pal || {});
  const w = Math.max(...rows.map(r => r.length)), h = rows.length;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) { const ch = row[x]; if (ch !== '.' && pal[ch]) { g.fillStyle = pal[ch]; g.fillRect(x, y, 1, 1); } } });
  return c;
}
function flipSprite(src) { const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d'); g.translate(src.width, 0); g.scale(-1, 1); g.drawImage(src, 0, 0); return c; }
function whiteSprite(src) { const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; const g = c.getContext('2d'); g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); return c; }

const G_SWORD = [
  '...kkkkkk...', '..kggggggk..', '..kgGggGgk..', '..kssssssk.w', '..kskssksk.w', '..kssssssk.w',
  '...kbbbbk.kw', '..kbbbbbbkkw', '..ksbyybbsGk', '..kbbbbbbk..', '...kBk.kBk..', '...kNk.kNk..'];
const G_RANGER = [
  '....kkkk....', '...kllllk...', '..kllllllk..', '.nklssssLk..', 'n.kskssksk..', 'n.kssssssk..',
  'n..kllllk...', 'nskllllllk..', 'n.kslllLsk..', '.nkllllllk..', '...kNk.kNk..', '...kNk.kNk..'];
const G_MAGE = [
  '.....kk.....', '....kppk..cc', '...kppppk.cc', '..kpppyppk.n', '.kkkkkkkkk.n', '..kskssksk.n',
  '..kssssssk.n', '..kppppppksn', '..kppPpppk.n', '..kpppPpppkn', '..kkkkkkkk.n', '...kNk.kNk.n'];
const G_GUARD = [
  '....kkkk....', '...kxxxxk...', '..kxxxxxxk..', '..kxkkkkxk..', '..kskssksk..', 'kkkkkssssk..',
  'kryrkxxxxk..', 'kyyykxxxxxk.', 'kryrkxxxxk..', 'kryrkxxxxk..', '.kkk.kXkXk..', '.....kNkNk..'];
const G_WOLF = [
  '..............', '..............', '..............', '..........k.k.', '.........kxkxk.', 'k.......kxxxxxk',
  'xk.kkkkkxxkxxXk', '.xkxxxxxxxxxkk.', '..kxxxxxxxxxk..', '..kXxxxxxxxk...', '..kXk.kXk.kXk..', '..kk..kk..kk...'];
const G_GRUNT = [
  '....kkkk....', '...kooook...', '..kokookok..', '..kooooook..', '..kowoowok..', '...kooook...',
  '..kNNNNNNk..', '.koNNNNNNok.', '..kNNyNNNk..', '..kNNNNNNk..', '...kOk.kOk..', '...kkk.kkk..'];
const G_AXE = [
  '....kkkk....', '...kooook...', 'k.kokookok..', 'gk.ooooook..', 'ggkowoowok..', 'gGkkooook...',
  '.knkNNNNNk..', '.knoNNNNNok.', '..knNyNNNk..', '..knNNNNNk..', '...kOk.kOk..', '...kkk.kkk..'];
const G_SPEAR = [
  'w...kkkk....', '.k.kooook...', '..nokookok..', '...noooook..', '..kownowok..', '...kooonk...',
  '..kRRRRRRn..', '.koRRRRRRonk', '..kRRyRRRk..', '..kRRRRRRk..', '...kOk.kOk..', '...kkk.kkk..'];
const G_BOSS = [
  '.y........y.', '.yk.kkkk.ky.', '..kkOOOOkk..', '..kOkOOkOk..', '..kOOOOOOk..', '..kOwOOwOk..',
  '.kkNNNNNNkk.', 'kOkNyyyyNkOk', 'kOkNNNNNNkOk', '..kNNNNNNk..', '..kOOk.kOOk.', '..kkkk.kkkk.'];

const SYM_ROWS = {
  sword: ['..........kw', '.........kwk', '........kwk.', '.......kwk..', '......kwk...', '..k..kwk....', '..kykwk.....', '...kyk......', '..kNky......', '.kNk.kk.....', 'kNk.........', 'kk..........'],
  bow: ['....kkk.....', '...knnk.....', '..knk.k.....', '..nk..k.....', '.kn...k.....', '.kn..kwkkkkk', '.kn...k.....', '..nk..k.....', '..knk.k.....', '...knnk.....', '....kkk.....', '............'],
  staff: ['........kk..', '.......kcck.', '.......kcck.', '........kk..', '.......kn...', '......kn....', '.....kn.....', '....kn......', '...kn.......', '..kn........', '.kn.........', 'kk..........'],
  shield: ['.kkkkkkkkkk.', 'kggggggggggk', 'kgbbbbybbbgk', 'kgbbbbybbbgk', 'kgyyyyyyyygk', 'kgbbbbybbbgk', 'kgbbbbybbbgk', '.kgbbbybbgk.', '..kgbbybgk..', '...kgbbgk...', '....kggk....', '.....kk.....'],
  wolf: ['k.........k.', 'kxk.....kxk.', 'kxxkkkkkxxk.', 'kxxxxxxxxxk.', 'kxyxxxxxyxk.', 'kxxxxxxxxxk.', '.kxxxxxxxk..', '.kxxwwwxxk..', '..kxwkwxk...', '...kxwxk....', '....kkk.....', '............'],
  coin: ['...kkkkkk...', '..kyyyyyyk..', '.kyywwyyyYk.', 'kyywyyyyyyYk', 'kyyyyYYyyyYk', 'kyyyyYYyyyYk', 'kyyyyyyyyyYk', 'kyyyyyyyyYYk', '.kyyyyyyYYk.', '..kYYYYYYk..', '...kkkkkk...', '............']
};
const ICON_ROWS = {
  heart: ['.kk..kk.', 'krrkkrrk', 'krwrrrrk', 'krrrrrrk', '.krrrrk.', '..krrk..', '...kk...'],
  crystal: ['..kk..', '.kcck.', 'kcwcck', 'kcccck', '.kcck.', '..kk..'],
  skull: ['.kkkk.', 'kwwwwk', 'kwkwkw', 'kwwwwk', '.kwwk.', '.kkkk.'],
  helm: ['.kkkk.', 'kggggk', 'kgkkgk', 'kssssk', '.kbbk.', '..kk..']
};

const SPR = {};
// ---------- detailed chibi sprites (auto-outlined) ----------
function outlined(src, col) {
  const c = document.createElement('canvas'); c.width = src.width + 2; c.height = src.height + 2; const g = c.getContext('2d');
  const d = src.getContext('2d').getImageData(0, 0, src.width, src.height).data;
  g.fillStyle = col || '#1a1420';
  const op = (x, y) => x >= 0 && y >= 0 && x < src.width && y < src.height && d[(y * src.width + x) * 4 + 3] > 0;
  for (let y = -1; y <= src.height; y++) for (let x = -1; x <= src.width; x++) if (!op(x, y) && (op(x - 1, y) || op(x + 1, y) || op(x, y - 1) || op(x, y + 1))) g.fillRect(x + 1, y + 1, 1, 1);
  g.drawImage(src, 1, 1); return c;
}
const CHIBI = [
  '..............',
  '..............',
  '....HHHHHH....',
  '...HHHHHHHH...',
  '..HHIHHHHHHH..',
  '..HIHHHHHHHh..',
  '..HhFFFFFFFh..',
  '..hFFFFFFFFF..',
  '..FFFwFFFwFf..',
  '..FFFeFFFeFf..',
  '...FpFFFFpf...',
  '....fFFFFf....',
  '...MBBBBBBM...',
  '..SMBBBBBBMS..',
  '...BBbbbbBB...',
  '....BBBBBB....',
  '....LL..LL....',
  '....DD..DD....'];
function chibi(pal, over, base) {
  const rows = (base || CHIBI).map(r => r.split(''));
  (over || []).forEach(([x, y, ch]) => { if (rows[y]) rows[y][x] = ch; });
  return outlined(makeSprite(rows.map(r => r.join('')), pal));
}
function line(x0, y0, x1, y1, ch) { const o = []; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) o.push([Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), ch]); return o; }
function box(x0, y0, x1, y1, ch) { const o = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) o.push([x, y, ch]); return o; }
const SKIN = { F: '#f6c8a0', f: '#d8987a', e: '#2a1e2a', w: '#ffffff', p: '#f08a8a' };
function buildSprites() {
  const sword = chibi(Object.assign({}, SKIN, { H: '#d4dce4', h: '#8a94a4', I: '#ffffff', B: '#3d72d0', b: '#f2c14e', M: '#26508f', S: '#f6c8a0', L: '#3a3046', D: '#6a4428', r: '#e84a4a', g: '#e8eef4', G: '#9aa4b4', y: '#f2c14e' }),
    [...box(5, 1, 8, 1, 'r'), [6, 0, 'r'], [7, 0, 'r'], ...line(12, 2, 12, 11, 'g'), ...line(13, 3, 13, 10, 'G'), [11, 12, 'y'], [12, 12, 'y'], [13, 12, 'y'], [12, 13, 'D']]);
  const ranger = chibi(Object.assign({}, SKIN, { H: '#4fa040', h: '#2f6b2a', I: '#8ad060', B: '#5a8a34', b: '#8a5a32', M: '#3d6a28', S: '#f6c8a0', L: '#4a3a28', D: '#6a4428', n: '#a0703a', s: '#e8e0c8', a: '#d8dce0' }),
    [...line(1, 6, 0, 9, 'n'), ...line(0, 10, 1, 15, 'n'), ...line(1, 7, 1, 14, 's'), [2, 5, 'n'], [2, 16, 'n'], ...line(9, 1, 11, 3, 'H'), [12, 4, 'H']]);
  const mage = chibi(Object.assign({}, SKIN, { H: '#8a5ad0', h: '#5a3a90', I: '#b88af0', B: '#6a42b0', b: '#f2c14e', M: '#4a2f80', S: '#f6c8a0', L: '#3a2a50', D: '#3a2a50', n: '#8a5a32', c: '#8ff0ff', C: '#ffffff' }),
    [[6, 0, 'H'], [7, 0, 'h'], [5, 1, 'H'], [6, 1, 'H'], [7, 1, 'h'], ...box(1, 5, 12, 5, 'h'), [0, 5, 'H'], [13, 5, 'H'], [6, 3, 'b'], [7, 4, 'b'], ...line(12, 6, 12, 17, 'n'), [11, 3, 'c'], [12, 3, 'C'], [13, 3, 'c'], [12, 2, 'c'], [12, 4, 'c'], [11, 4, 'c'], [13, 4, 'c'], ...box(4, 15, 9, 16, 'B'), ...box(4, 17, 9, 17, 'M')]);
  const guard = chibi(Object.assign({}, SKIN, { H: '#a07a4a', h: '#6a4a2a', I: '#d0a870', B: '#9aa2b0', b: '#5a6070', M: '#6a7280', S: '#f6c8a0', L: '#4a4458', D: '#4a3020', q: '#3a5ab0', Q: '#26408a', y: '#f2c14e', g: '#c4ccd4' }),
    [...box(3, 6, 10, 6, 'h'), ...box(0, 10, 5, 15, 'q'), ...box(0, 16, 4, 16, 'Q'), [5, 16, 'Q'], ...box(1, 11, 4, 11, 'y'), ...line(2, 10, 2, 15, 'y'), [0, 10, 'g'], [5, 10, 'g'], ...line(12, 7, 12, 14, 'g'), [12, 6, 'y']]);
  const prism = chibi(Object.assign({}, SKIN, { H: '#eaf8ff', h: '#9ad8ff', I: '#ffffff', B: '#b07af0', b: '#fff3a0', M: '#7a4fc0', S: '#f6c8a0', L: '#5a3a90', D: '#f2c14e', g: '#fffbe0', G: '#f2c14e', c: '#ff9af0', y: '#f2c14e' }),
    [...box(5, 0, 8, 1, 'c'), [4, 1, 'c'], [9, 1, 'c'], ...line(12, 0, 12, 11, 'g'), ...line(13, 1, 13, 10, 'G'), ...box(10, 12, 13, 12, 'y'), ...line(1, 12, 0, 17, 'c'), ...line(2, 13, 1, 17, 'c')]);
  const WOLF = [
    '................',
    '..........H.H...',
    '.........HHHHH..',
    '.........HwHeH..',
    'H.......HHHHHHkk',
    'hH...HHHHHHHFFF.',
    '.hHHHHHHHHHHHF..',
    '..HHHHHHHHHHH...',
    '..hHHHFFFFHHh...',
    '..hH.hH...hH.hH.',
    '..DD.DD...DD.DD.'];
  const wolf = outlined(makeSprite(WOLF, { H: '#a8a8b8', h: '#70707e', F: '#e8e8f0', w: '#f2c14e', e: '#1a1420', k: '#1a1420', D: '#4a4458' }));
  const ORC = { F: '#78c050', f: '#4f8a34', e: '#ff4a3a', w: '#1a1420', p: '#f4f0d8', H: '#2e2a26', h: '#1e1a18', I: '#4a4038', B: '#8a5a32', b: '#c4a060', M: '#6a4428', S: '#78c050', L: '#4a3a28', D: '#2e2a26', g: '#c4ccd4', G: '#7a8290', n: '#8a5a32', r: '#c8423b', R: '#8a2a2a', y: '#f2c14e', o: '#ffa040' };
  const grunt = chibi(ORC, [...box(3, 2, 10, 3, 'h'), [4, 10, 'p'], [9, 10, 'p'], [5, 4, 'F'], [8, 4, 'F'], ...line(12, 8, 12, 14, 'n'), [12, 7, 'G'], [13, 8, 'G']]);
  const axe = chibi(ORC, [...box(3, 2, 10, 3, 'R'), [4, 10, 'p'], [9, 10, 'p'], ...line(12, 5, 12, 15, 'n'), ...box(10, 4, 13, 7, 'g'), [10, 7, 'G'], [13, 4, 'G'], ...box(4, 12, 9, 12, 'r')]);
  const spear = chibi(Object.assign({}, ORC, { B: '#c8423b', M: '#8a2a2a', b: '#f2c14e' }), [[4, 10, 'p'], [9, 10, 'p'], ...line(12, 1, 12, 17, 'n'), [12, 0, 'g'], [11, 1, 'g'], [13, 1, 'g'], [12, 1, 'g'], ...box(2, 3, 11, 3, 'y')]);
  const boss = chibi(Object.assign({}, ORC, { F: '#5a9a40', f: '#3a6a2a', B: '#4a3a5a', M: '#2e2440', b: '#f2c14e', H: '#e8dcb0', h: '#b8a880', I: '#ffffff', D: '#2e2440' }),
    [[1, 1, 'H'], [1, 2, 'H'], [2, 3, 'H'], [12, 1, 'H'], [12, 2, 'H'], [11, 3, 'H'], ...box(3, 4, 10, 5, 'y'), [5, 3, 'r'], [8, 3, 'r'], [4, 10, 'p'], [9, 10, 'p'], [4, 11, 'p'], [9, 11, 'p'], ...line(12, 4, 12, 16, 'n'), ...box(11, 2, 13, 6, 'g'), [11, 6, 'G'], [13, 2, 'G']]);
  const S2 = { sword, ranger, mage, guard, wolf, prism, grunt, axe, spear, boss };
  for (const k in S2) {
    let s = S2[k];
    if (['grunt', 'axe', 'spear', 'boss'].includes(k)) s = flipSprite(s);
    SPR[k] = s; SPR[k + '_w'] = whiteSprite(s);
  }
  for (const k in SYM_ROWS) SPR['sym_' + k] = makeSprite(SYM_ROWS[k]);
  for (const k in ICON_ROWS) SPR['ic_' + k] = makeSprite(ICON_ROWS[k]);
  SPR.ic_coin = makeSprite(['.kkkk.', 'kyyyYk', 'kywyYk', 'kyyyYk', 'kyYYYk', '.kkkk.']);
}

// ---------- data ----------
const UNIT = {
  sword: { name: '剑士', hp: 60, atk: 9, rate: 0.8, range: 12, speed: 22 },
  ranger: { name: '游侠', hp: 40, atk: 7, rate: 1.0, range: 80, speed: 18, ranged: 'arrow' },
  mage: { name: '术士', hp: 34, atk: 6, rate: 1.4, range: 70, speed: 16, ranged: 'orb', aoe: 16 },
  guard: { name: '卫兵', hp: 120, atk: 4, rate: 1.0, range: 12, speed: 16, taunt: true },
  wolf: { name: '野狼', hp: 45, atk: 6, rate: 0.5, range: 10, speed: 40 },
  prism: { name: '棱晶骑士', hp: 220, atk: 20, rate: 0.7, range: 14, speed: 24, aoe: 14, legend: true }
};
const SYM_TO_UNIT = { sword: 'sword', bow: 'ranger', staff: 'mage', shield: 'guard', wolf: 'wolf' };
const ENEMY = {
  grunt: { name: '绿皮小兵', hp: 30, atk: 4, rate: 1.0, range: 10, speed: 14 },
  axe: { name: '斧兵', hp: 55, atk: 7, rate: 1.2, range: 12, speed: 12 },
  spear: { name: '投矛手', hp: 26, atk: 5, rate: 1.6, range: 60, speed: 13, ranged: 'spear' },
  boss: { name: '巨魔酋长', hp: 900, atk: 18, rate: 1.4, range: 20, speed: 7, aoe: 18, big: true }
};
const BONUSES = [
  { t: '攻击 +20%', f: u => u.atkM *= 1.2 }, { t: '生命 +25%', f: u => u.hpM *= 1.25 },
  { t: '攻速 +15%', f: u => u.rateM *= 0.87 }, { t: '吸血 10%', f: u => u.leech = 0.1 },
  { t: '暴击 20%', f: u => u.crit = 0.2 }, { t: '移速 +30%', f: u => u.spdM *= 1.3 }
];
const RELICS = [
  { id: 'dice', name: '幸运骰', c: '#f2c14e', d: '金币符号更常出现', ch: '骰' },
  { id: 'drum', name: '战鼓', c: '#c8423b', d: '全军攻击 +15%', ch: '鼓' },
  { id: 'whet', name: '磨刀石', c: '#a0a0ac', d: '近战攻击 +20%', ch: '刃' },
  { id: 'eagle', name: '鹰眼', c: '#7fe0f0', d: '远程射程 +25%', ch: '鹰' },
  { id: 'wall', name: '铁壁核心', c: '#5a8ad0', d: '卫兵生命 +30%，嘲讽更远', ch: '壁' },
  { id: 'pack', name: '狼群核心', c: '#9a9aa6', d: '狼更常出现，狼移速 +30%', ch: '狼' },
  { id: 'gold', name: '黄金核心', c: '#f2c14e', d: '每波额外 +5 金币', ch: '金' },
  { id: 'heal', name: '生命泉', c: '#6cb84a', d: '生命 +2', ch: '泉', once: true },
  { id: 'arcane', name: '奥术核心', c: '#7a4fc0', d: '术士爆炸范围 +50%', ch: '奥' },
  { id: 'magnet', name: '磁石', c: '#d86ab0', d: '每次转动 -2 金币', ch: '磁' }
];

// ---------- audio ----------
let AC = null, soundOn = true;
function beep(f, d, type, vol, slide) {
  if (!soundOn) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
    o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d);
    g.gain.setValueAtTime(vol || 0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d);
  } catch (e) { }
}
const SFX = {
  spin: () => beep(220, 0.08, 'square', 0.04, 330), stop: () => beep(160, 0.05, 'square', 0.04),
  line: () => { beep(523, 0.1); setTimeout(() => beep(784, 0.15), 90); },
  jackpot: () => [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'square', 0.06), i * 90)),
  hit: () => beep(120, 0.04, 'triangle', 0.03, 60), coin: () => { beep(988, 0.06); setTimeout(() => beep(1319, 0.1), 60); },
  bad: () => beep(140, 0.25, 'sawtooth', 0.05, 70)
};

// ---------- game state ----------
const FIELD = { x: 8, y: 24, w: 224, h: 186 };
let GROUND_TOP = FIELD.y + 100, GROUND_BOT = FIELD.y + FIELD.h - 10;
function applyLayout() { FIELD.h = 186 + OFF; SKY = Math.round(OFF * 0.45); GROUND_TOP = FIELD.y + 100 + SKY; GROUND_BOT = FIELD.y + FIELD.h - 12; BG.forest = makeBG('forest'); BG.cave = makeBG('cave'); }
let G;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
function newGame() {
  G = {
    gold: 40, lives: 6, cap: 7, crystals: 0, wave: 1, phase: 'prep', spinsThisWave: 0,
    units: [], enemies: [], shots: [], floats: [], parts: [], relics: {},
    reels: [[0, 0, 0], [0, 0, 0], [0, 0, 0]].map(c => c.map(() => pick(['sword', 'bow', 'staff', 'shield', 'wolf', 'coin']))),
    spin: null, flash: [], jackpotT: 0, lever: 0, speed: 1, toSpawn: [], spawnT: 0, kills: 0, need: 0,
    pending: null, sel: null, absorbMode: false, rewards: null, msg: '', msgT: 0, banner: '', bannerT: 0,
    best: +(localStorage.getItem('reel_best') || 0), shake: 0, t: 0, ended: null
  };
  G.reels = [0, 1, 2].map(() => [0, 1, 2].map(() => pick(['sword', 'bow', 'staff', 'shield', 'wolf', 'coin'])));
  addUnit('sword'); addUnit('ranger');
  layoutUnits();
}
function spinCost() { return Math.max(4, 10 + G.spinsThisWave * 2 - (G.relics.magnet ? 2 * G.relics.magnet : 0)); }
function symWeights() {
  const w = { sword: 3, bow: 3, staff: 2, shield: 2, wolf: 2, coin: 2 };
  if (G.relics.dice) w.coin += 1.5 * G.relics.dice;
  if (G.relics.pack) w.wolf += 1.5 * G.relics.pack;
  return w;
}
function rollSym() { const w = symWeights(); let t = 0; for (const k in w) t += w[k]; let r = Math.random() * t; for (const k in w) { r -= w[k]; if (r <= 0) return k; } return 'coin'; }
function rollGrid() {
  // reels[col][row]; sticky: later columns tend to copy the left neighbour so lines happen often
  const g = [[], [], []];
  for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) {
    if (c > 0 && Math.random() < 0.42) g[c][r] = g[c - 1][r];
    else if (c > 0 && Math.random() < 0.12) g[c][r] = g[c - 1][(r + (Math.random() < 0.5 ? 1 : 2)) % 3];
    else g[c][r] = rollSym();
  }
  return g;
}
const LINES = [[[0, 0], [1, 0], [2, 0]], [[0, 1], [1, 1], [2, 1]], [[0, 2], [1, 2], [2, 2]], [[0, 0], [0, 1], [0, 2]], [[1, 0], [1, 1], [1, 2]], [[2, 0], [2, 1], [2, 2]], [[0, 0], [1, 1], [2, 2]], [[0, 2], [1, 1], [2, 0]]];
function evalLines(g) { const hits = []; for (const L of LINES) { const a = g[L[0][0]][L[0][1]]; if (L.every(([c, r]) => g[c][r] === a)) hits.push({ sym: a, cells: L }); } return hits; }

function makeUnit(type, star) {
  const d = UNIT[type];
  const u = { type, star: star || 1, xp: 0, atkM: 1, hpM: 1, rateM: 1, spdM: 1, leech: 0, crit: 0, x: 0, y: 0, hx: 0, hy: 0, cd: rnd(0, 0.5), hit: 0, bob: rnd(0, 6), team: 'u' };
  const b = d.legend ? null : pick(BONUSES); u.bonus = b ? b.t : '传奇：全能'; if (b) b.f(u); else { u.atkM *= 1.2; u.hpM *= 1.2; }
  refreshStats(u); u.hp = u.maxhp; return u;
}
function refreshStats(u) {
  const d = UNIT[u.type], m = Math.pow(1.6, u.star - 1), R = G.relics;
  let atk = d.atk * m * u.atkM, hp = d.hp * m * u.hpM, range = d.range, aoe = d.aoe || 0, spd = d.speed * u.spdM;
  if (R.drum) atk *= Math.pow(1.15, R.drum);
  if (R.whet && !d.ranged) atk *= Math.pow(1.2, R.whet);
  if (R.eagle && d.ranged) range *= Math.pow(1.25, R.eagle);
  if (R.wall && u.type === 'guard') hp *= Math.pow(1.3, R.wall);
  if (R.pack && u.type === 'wolf') spd *= 1.3;
  if (R.arcane && u.type === 'mage') aoe *= Math.pow(1.5, R.arcane);
  const frac = u.maxhp ? u.hp / u.maxhp : 1;
  u.atk = atk; u.maxhp = Math.round(hp); u.hp = Math.max(1, Math.round(u.maxhp * frac)); u.range = range; u.aoe = aoe; u.spd = spd; u.rate = d.rate * u.rateM;
}
function addUnit(type) {
  if (G.units.length >= G.cap) { G.pending = makeUnit(type); toast('军团已满：点选单位吸收新兵'); return false; }
  const u = makeUnit(type); G.units.push(u); layoutUnits(); u.x = u.hx; u.y = u.hy - 30; u.drop = 1;
  for (let i = 0; i < 10; i++) G.parts.push({ x: u.hx, y: u.hy - 4, vx: rnd(-30, 30), vy: rnd(-50, -10), t: 0.6, c: d_color(type) });
  return true;
}
function d_color(t) { return { sword: '#c4ccd4', ranger: '#4f9a38', mage: '#7a4fc0', guard: '#a0a0ac', wolf: '#a0a0ac', prism: '#eaf6ff' }[t] || '#fff'; }
function layoutUnits() {
  // formation: melee front, ranged back
  const order = G.units.slice().sort((a, b) => (UNIT[a.type].ranged ? 1 : 0) - (UNIT[b.type].ranged ? 1 : 0));
  const cols = [[], [], []];
  order.forEach((u, i) => { const ranged = !!UNIT[u.type].ranged; const c = ranged ? (cols[1].length < 3 ? 1 : 0) : (cols[2].length < 3 ? 2 : 1); cols[c].push(u); });
  cols.forEach((col, ci) => col.forEach((u, i) => { u.hx = FIELD.x + 20 + ci * 32; u.hy = GROUND_TOP + 24 + (i + 0.5) * ((GROUND_BOT - GROUND_TOP - 24) / Math.max(col.length, 1)) + (ci % 2 ? 4 : 0); }));
}
function absorb(target, food) {
  target.xp += food.legend ? 2 : 1 + (food.star - 1);
  let up = false;
  while (target.xp >= 2 && target.star < 3) { target.xp -= 2; target.star++; up = true; }
  if (target.star >= 3) target.xp = Math.min(target.xp, 2);
  refreshStats(target); target.hp = target.maxhp;
  floatText(target.x, target.y - 16, up ? '升星！' : '+经验', up ? '#f2c14e' : '#7fe0f0');
  for (let i = 0; i < 14; i++) G.parts.push({ x: target.x, y: target.y - 6, vx: rnd(-40, 40), vy: rnd(-60, -10), t: 0.7, c: up ? '#f2c14e' : '#7fe0f0' });
  SFX.coin();
}

// ---------- spinning ----------
function doSpin() {
  if (G.phase !== 'prep' || G.spin || G.pending) { if (G.pending) toast('先处理待吸收的新兵'); return; }
  const cost = spinCost();
  if (G.gold < cost) { toast('金币不足'); SFX.bad(); return; }
  G.gold -= cost; G.spinsThisWave++;
  const result = rollGrid();
  G.spin = { t: 0, stopAt: [0.45, 0.65, 0.85], stopped: [false, false, false], result, offs: [0, 0, 0], strip: [0, 1, 2].map(() => Array.from({ length: 12 }, rollSym)) };
  G.lever = 1; G.flash = []; SFX.spin();
}
function finishSpin() {
  G.reels = G.spin.result; G.spin = null;
  const hits = evalLines(G.reels);
  if (!hits.length) { G.msg = '没有连线'; G.msgT = 1.5; return; }
  G.flash = hits.map(h => ({ cells: h.cells, t: 1.6 }));
  let gold = 0; const summons = [];
  for (const h of hits) { if (h.sym === 'coin') gold += 15; else summons.push(SYM_TO_UNIT[h.sym]); }
  if (hits.length >= 3) { G.jackpotT = 2.2; G.shake = 0.5; G.crystals += 1; SFX.jackpot(); summons.unshift('prism'); G.msg = 'JACKPOT！棱晶骑士降临'; }
  else { SFX.line(); G.msg = hits.map(h => h.sym === 'coin' ? '+15金币' : UNIT[SYM_TO_UNIT[h.sym]].name).join(' · '); }
  G.msgT = 2;
  if (gold) { G.gold += gold; floatText(70, 300, '+' + gold, '#f2c14e'); }
  G.summonQueue = summons; G.summonT = 0.25;
}
function processSummons(dt) {
  if (!G.summonQueue || !G.summonQueue.length || G.pending) return;
  G.summonT -= dt; if (G.summonT > 0) return;
  addUnit(G.summonQueue.shift()); G.summonT = 0.3;
}

// ---------- waves ----------
function waveComp(w) {
  const list = []; const judge = w % 5 === 0 && w !== 10; const n = Math.round((4 + w * 1.5) * (judge ? 1.6 : 1));
  for (let i = 0; i < n; i++) { const r = Math.random(); list.push(w >= 3 && r < 0.25 ? 'spear' : w >= 2 && r < 0.55 ? 'axe' : 'grunt'); }
  if (w === 10) { list.length = 8; list.push('boss'); }
  return list;
}
function startWave() {
  if (G.phase !== 'prep' || G.spin || G.pending) return;
  if (!G.units.length) { toast('至少需要一个单位'); return; }
  G.sel = null; G.absorbMode = false;
  G.phase = 'battle'; G.toSpawn = waveComp(G.wave); G.need = G.toSpawn.length; G.kills = 0; G.spawnT = 0.3;
  const judge = G.wave % 5 === 0 && G.wave !== 10;
  G.banner = G.wave === 10 ? '首领波 · 巨魔酋长' : judge ? '审判波' : '第' + G.wave + '波'; G.bannerT = 1.8;
  for (const u of G.units) { u.x = u.hx; u.y = u.hy; u.cd = rnd(0, 0.4); }
  beep(330, 0.12); setTimeout(() => beep(440, 0.2), 120);
}
function spawnEnemy(type) {
  const d = ENEMY[type], sc = 1 + 0.22 * (G.wave - 1) + (G.wave % 5 === 0 ? 0.15 : 0);
  const e = { type, team: 'e', hp: Math.round(d.hp * sc), maxhp: Math.round(d.hp * sc), atk: d.atk * (1 + 0.12 * (G.wave - 1)), rate: d.rate, range: d.range, spd: d.speed * rnd(0.9, 1.15), aoe: d.aoe || 0,
    x: FIELD.x + FIELD.w + 6, y: rnd(GROUND_TOP + 24, GROUND_BOT), cd: rnd(0.2, 0.8), hit: 0, bob: rnd(0, 6), big: !!d.big };
  if (e.big) { e.y = (GROUND_TOP + GROUND_BOT) / 2 + 20; G.shake = 0.6; SFX.bad(); }
  G.enemies.push(e);
}
function endWave() {
  G.phase = 'reward';
  const R = G.relics; const bonus = 15 + 3 * G.wave + (R.gold ? 5 * R.gold : 0);
  G.gold += bonus; if (G.wave % 5 === 0) G.crystals += 1;
  for (const u of G.units) u.hp = u.maxhp;
  G.shots = [];
  if (G.wave >= 10) return gameOver(true);
  G.rewardGold = bonus; G.rewards = rollRewards();
}
function rollRewards() { const pool = RELICS.filter(r => !(r.once && G.relics[r.id] >= 3)); const out = []; while (out.length < 3) { const r = pick(pool); if (!out.includes(r)) out.push(r); } return out; }
function takeReward(r) {
  G.relics[r.id] = (G.relics[r.id] || 0) + 1;
  if (r.id === 'heal') G.lives += 2;
  G.units.forEach(refreshStats); G.units.forEach(u => u.hp = u.maxhp);
  G.rewards = null; G.wave++; G.spinsThisWave = 0; G.phase = 'prep'; layoutUnits();
  for (const u of G.units) { u.x = u.hx; u.y = u.hy; }
  if (G.wave > G.best) { G.best = G.wave - 1; }
  toast('获得 ' + r.name);
}
function gameOver(win) {
  G.phase = 'end'; G.ended = { win, wave: G.wave };
  const reached = win ? 10 : G.wave - 1; if (reached > G.best) { G.best = reached; localStorage.setItem('reel_best', reached); }
  if (win) SFX.jackpot(); else SFX.bad();
}

// ---------- combat ----------
function nearest(from, list, filter) { let best = null, bd = 1e9; for (const o of list) { if (o.dead || (filter && !filter(o))) continue; const d = Math.hypot(o.x - from.x, (o.y - from.y) * 1.3); if (d < bd) { bd = d; best = o; } } return best ? { o: best, d: bd } : null; }
function damage(t, amt, src) {
  if (t.dead) return; let crit = false;
  if (src && src.crit && Math.random() < src.crit) { amt *= 2; crit = true; }
  amt = Math.max(1, Math.round(amt)); t.hp -= amt; t.hit = 0.12;
  floatText(t.x + rnd(-3, 3), t.y - (t.big ? 66 : 36), (crit ? '暴' : '') + amt, t.team === 'e' ? (crit ? '#f2c14e' : '#fff') : '#ff7a6a');
  if (src && src.leech) src.hp = Math.min(src.maxhp, src.hp + amt * src.leech);
  if (t.hp <= 0) { t.dead = true; for (let i = 0; i < 8; i++) G.parts.push({ x: t.x, y: t.y - 6, vx: rnd(-40, 40), vy: rnd(-50, 0), t: 0.5, c: t.team === 'e' ? '#6cb84a' : '#c8423b' }); if (t.team === 'e') G.kills++; }
}
function attack(a, t, dt) {
  const d = a.team === 'u' ? UNIT[a.type] : ENEMY[a.type];
  if (d.ranged) { G.shots.push({ kind: d.ranged, x: a.x + (a.team === 'u' ? 6 : -6), y: a.y - 16, t, src: a, spd: d.ranged === 'orb' ? 110 : 160, aoe: a.aoe }); if (a.team === 'u') beep(700, 0.03, 'triangle', 0.02); }
  else {
    if (a.aoe) { const foes = a.team === 'u' ? G.enemies : G.units; for (const f of foes) if (!f.dead && Math.hypot(f.x - t.x, f.y - t.y) < a.aoe + 6) damage(f, a.atk, a); }
    else damage(t, a.atk, a);
    a.lunge = 0.12; SFX.hit();
  }
}
function updateActor(a, dt, foes) {
  a.cd -= dt; a.hit = Math.max(0, a.hit - dt); a.lunge = Math.max(0, (a.lunge || 0) - dt);
  let tgt;
  if (a.team === 'e') {
    const taunter = nearest(a, foes, o => UNIT[o.type].taunt);
    const tauntR = 50 * (G.relics.wall ? 1.4 : 1);
    if (taunter && taunter.d < tauntR) tgt = taunter; else { tgt = nearest(a, foes); if (tgt && tgt.d > 46 && !ENEMY[a.type].ranged) tgt = null; if (tgt && ENEMY[a.type].ranged && tgt.d > a.range + 10) tgt = null; }
    if (!tgt) { a.x -= a.spd * dt; if (a.x < FIELD.x + 2) { a.dead = true; a.leaked = true; G.lives--; G.kills++; G.shake = 0.3; SFX.bad(); floatText(FIELD.x + 14, a.y - 10, '-1 生命', '#ff5a4a'); } return; }
  } else { tgt = nearest(a, foes); if (!tgt) return; }
  const reach = a.range + 8 + (tgt.o.big ? 16 : 0);
  if (tgt.d > reach) { const dx = tgt.o.x - a.x, dy = tgt.o.y - a.y, L = Math.hypot(dx, dy) || 1; a.x += dx / L * a.spd * dt; a.y += dy / L * a.spd * dt * 0.8; }
  else if (a.cd <= 0) { attack(a, tgt.o, dt); a.cd = a.rate; }
  a.y = Math.max(GROUND_TOP + 20, Math.min(GROUND_BOT + 2, a.y));
}
function updateBattle(dt) {
  G.spawnT -= dt;
  if (G.toSpawn.length && G.spawnT <= 0) { spawnEnemy(G.toSpawn.shift()); G.spawnT = G.toSpawn[0] === 'boss' ? 2 : rnd(0.5, 1.1) * (G.wave % 5 === 0 ? 0.7 : 1); }
  for (const u of G.units) updateActor(u, dt, G.enemies);
  for (const e of G.enemies) updateActor(e, dt, G.units);
  for (const s of G.shots) {
    const dx = s.t.x - s.x, dy = (s.t.y - 14) - s.y, L = Math.hypot(dx, dy);
    if (s.t.dead && !s.aoe) { s.done = true; continue; }
    if (L < 5) { s.done = true; if (s.aoe) { const foes = s.src.team === 'u' ? G.enemies : G.units; for (const f of foes) if (!f.dead && Math.hypot(f.x - s.t.x, f.y - s.t.y) < s.aoe) damage(f, s.src.atk, s.src); G.parts.push({ ring: true, x: s.t.x, y: s.t.y - 6, r: s.aoe, t: 0.3 }); } else damage(s.t, s.src.atk, s.src); continue; }
    s.x += dx / L * s.spd * dt; s.y += dy / L * s.spd * dt; s.ang = Math.atan2(dy, dx);
  }
  G.shots = G.shots.filter(s => !s.done);
  G.units = G.units.filter(u => !u.dead); G.enemies = G.enemies.filter(e => !e.dead);
  if (G.lives <= 0) return gameOver(false);
  if (!G.toSpawn.length && !G.enemies.length) { G.enemies = []; endWave(); }
  else if (!G.units.length && G.enemies.length && !G.toSpawn.length) { /* enemies just walk through */ }
}

// ---------- fx helpers ----------
function floatText(x, y, t, c) { G.floats.push({ x, y, t, c, life: 0.9 }); }
let toastMsg = '', toastT = 0;
function toast(m) { toastMsg = m; toastT = 1.8; }

// ---------- backgrounds ----------
let BG = {};
function makeBG(kind) {
  const c = document.createElement('canvas'); c.width = FIELD.w; c.height = FIELD.h; const g = c.getContext('2d');
  const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const circ = (cx, cy, r, col) => { g.fillStyle = col; for (let y = -r; y <= r; y++) { const w = Math.round(Math.sqrt(r * r - y * y)); g.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2, 1); } };
  const dither = (x0, y0, w, h, col, dens) => { g.fillStyle = col; for (let y = y0; y < y0 + h; y++) for (let x = x0 + (y % 2); x < x0 + w; x += 2) if (((x * 73856093) ^ (y * 19349663)) % 100 < dens * 100) g.fillRect(x, y, 1, 1); };
  const HZ = 100;
  if (kind === 'forest') {
    const sky = ['#7ec8f0', '#8ad0f2', '#98d6f2', '#a8ddf2', '#b8e4f2', '#c8eaf0'];
    R(0, 0, FIELD.w, FIELD.h, sky[0]); g.translate(0, SKY);
    sky.forEach((col, i) => R(0, i * 14 - SKY, FIELD.w, 14 + (i === 0 ? SKY : 0), col));
    R(0, 84, FIELD.w, 20, '#d4eef0');
    // sun with bands
    circ(112, 80, 30, '#fbe7a6'); circ(112, 80, 26, '#fdeeb8'); circ(112, 80, 22, '#fff5cc');
    for (let i = 0; i < 4; i++) R(80, 62 + i * 7, 64, 1, '#f4d890');
    // clouds
    for (let i = 0; i < 18; i++) circ(i * 14 + (i % 3) * 3, 86 + (i % 3) * 2, 8 + (i % 2) * 3, '#ffffff');
    for (let i = 0; i < 18; i++) circ(i * 14 + 6, 92, 6, '#e8f4fa');
    R(0, 92, FIELD.w, 8, '#e8f4fa');
    // far hills and bushes
    for (let i = 0; i < 16; i++) circ(i * 16 + 6, 98, 9, '#5aa046');
    for (let i = 0; i < 24; i++) circ(i * 10 + 2, 100, 6, i % 2 ? '#3f8a3a' : '#4a9640');
    for (let i = 0; i < 24; i++) R(i * 10, 96, 3, 1, '#6cb850');
    // ground
    R(0, HZ, FIELD.w, FIELD.h, '#78c050');
    R(0, HZ, FIELD.w, 3, '#5aa040');
    dither(0, HZ + 3, FIELD.w, 10, '#6ab448', 0.5);
    for (let y = HZ + 14; y < FIELD.h; y += 5) dither(0, y, FIELD.w, 1, '#6ab448', 0.35);
    for (let i = 0; i < 70; i++) { const x = (i * 53 + i * i * 7) % FIELD.w, y = HZ + 8 + (i * 37) % (FIELD.h - HZ - 10); R(x, y, 1, 2, '#5aa040'); R(x + 2, y + 1, 1, 1, '#5aa040'); R(x + 1, y - 1, 1, 3, '#94d468'); }
    for (let i = 0; i < 14; i++) { const x = (i * 97) % FIELD.w, y = HZ + 12 + (i * 41) % (FIELD.h - HZ - 16); R(x, y, 2, 2, i % 3 ? '#fff3a0' : '#ffb0c8'); R(x, y + 2, 1, 1, '#4f9a38'); }
    // trees
    const tree = (x, y, s) => {
      R(x - 3 * s, y, 6 * s, 34 * s, '#5a3a22'); R(x - 2 * s, y, 2 * s, 34 * s, '#7a5232'); R(x + 2 * s, y + 4, 1, 30 * s, '#3e2818');
      R(x - 7 * s, y + 34 * s - 2, 14 * s, 3, '#4a3020');
      const blob = (bx, by, r) => { circ(bx, by, r, '#235a2a'); circ(bx - 1, by - 2, r - 2, '#2f7232'); circ(bx - 3, by - 4, r - 5, '#45903c'); if (r > 8) circ(bx - 4, by - 6, r - 9, '#62ac4a'); };
      blob(x - 12 * s, y + 6, 11 * s); blob(x + 13 * s, y + 4, 11 * s); blob(x, y - 4, 14 * s); blob(x - 6 * s, y - 14 * s, 10 * s); blob(x + 8 * s, y - 12 * s, 9 * s);
    };
    tree(18, 44, 1.05); tree(206, 40, 1.15); tree(74, 52, 0.7); tree(158, 56, 0.6);
  } else {
    R(0, 0, FIELD.w, FIELD.h, '#2e2838'); g.translate(0, SKY);
    for (let i = 0; i < 50; i++) circ((i * 53) % FIELD.w, ((i * 29) % 96) - 4, 6 + (i % 4) * 3, ['#3e3648', '#463e52', '#38303f'][i % 3]);
    for (let i = 0; i < 18; i++) { const x = (i * 41 + 7) % FIELD.w, h = 8 + (i % 5) * 5; for (let k = 0; k < h; k++) R(x + k / 4, -SKY + k, Math.max(1, 5 - k / 3), 1, '#221c28'); }
    g.globalAlpha = 0.14; for (let i = 0; i < 3; i++) { g.fillStyle = '#fff3c0'; g.beginPath(); const x = 40 + i * 64; g.moveTo(x, -SKY); g.lineTo(x + 16, -SKY); g.lineTo(x + 46, HZ + 20); g.lineTo(x + 12, HZ + 20); g.fill(); } g.globalAlpha = 1;
    for (let i = 0; i < 6; i++) { const x = 20 + i * 38; circ(x, 60 + (i % 2) * 10, 2, '#7fe0f0'); circ(x, 60 + (i % 2) * 10, 1, '#ffffff'); }
    R(0, HZ, FIELD.w, FIELD.h, '#5e5568'); R(0, HZ, FIELD.w, 3, '#766c82');
    for (let i = 0; i < 9; i++) circ((i * 67) % FIELD.w, HZ - 2, 9, '#2e2836');
    dither(0, HZ + 3, FIELD.w, 12, '#544c5e', 0.5);
    for (let i = 0; i < 70; i++) R((i * 31) % FIELD.w, HZ + 8 + (i * 17) % (FIELD.h - HZ - 10), 2 + (i % 3), 1, i % 2 ? '#4e4658' : '#6e647a');
    for (let i = 0; i < 6; i++) { const x = (i * 83) % FIELD.w, y = HZ + 20 + (i * 29) % 60; R(x, y, 6, 3, '#463e50'); R(x + 1, y, 4, 1, '#7a7088'); }
  }
  return c;
}
let STONE = null;
function makeStone() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = '#1c1622'; g.fillRect(0, 0, W, H);
  let y = 0, row = 0;
  while (y < H) {
    const h = 10 + (row * 7) % 6; let x = -((row * 13) % 20);
    while (x < W) { const w = 16 + ((x * 31 + row * 17) % 14); const col = ['#2a2230', '#2e2635', '#262030'][(x + row) % 3 & 3] || '#2a2230';
      g.fillStyle = col; g.fillRect(x + 1, y + 1, w - 2, h - 2); g.fillStyle = '#3a3044'; g.fillRect(x + 1, y + 1, w - 2, 1); g.fillStyle = '#18121c'; g.fillRect(x + 1, y + h - 2, w - 2, 1); x += w; }
    y += h; row++;
  }
  return c;
}
function rivet(x, y) { rect(x, y, 3, 3, '#120e16'); rect(x, y, 2, 2, '#b8a8c4'); rect(x, y, 1, 1, '#ffffff'); }
function woodPanel(x, y, w, h) {
  rect(x, y, w, h, '#120e16'); rect(x + 1, y + 1, w - 2, h - 2, '#4a3a52');
  for (let i = x + 2; i < x + w - 2; i += 9) { rect(i, y + 2, 8, h - 4, (i / 9 | 0) % 2 ? '#3e3046' : '#43354c'); rect(i, y + 2, 1, h - 4, '#54445e'); }
  rect(x + 1, y + 1, w - 2, 1, '#6a5876'); rect(x + 1, y + h - 2, w - 2, 1, '#241c2a');
  for (const [cx, cy] of [[x + 3, y + 3], [x + w - 6, y + 3], [x + 3, y + h - 6], [x + w - 6, y + h - 6]]) { rect(cx - 1, cy - 1, 5, 5, '#6a5c74'); rivet(cx, cy); }
}
function parchmentFrame() {
  const x = FIELD.x - 4, y = FIELD.y - 4, w = FIELD.w + 8, h = FIELD.h + 8;
  rect(x - 1, y - 1, w + 2, h + 3, '#120e16');
  rect(x, y, w, h, '#e8dcb0'); rect(x + 1, y + 1, w - 2, 1, '#fff6d8'); rect(x, y + h - 2, w, 2, '#b8a678');
  rect(FIELD.x - 1, FIELD.y - 1, FIELD.w + 2, FIELD.h + 2, '#8a7a5a');
  // curled corners
  const curl = (cx, cy, fx, fy) => { for (let i = 0; i < 6; i++) rect(cx + (fx > 0 ? 0 : -6 + i), cy + fy * i, 6 - i, 1, i < 2 ? '#fff6d8' : '#d8c890'); rect(cx + (fx > 0 ? 6 : -7), cy, 1, 1, '#120e16'); };
  curl(x - 2, y - 2, 1, 1); curl(x + w + 2, y - 2, -1, 1);
}
function drawHUD() {
  rect(0, 0, W, 20, '#120e16'); rect(0, 0, W, 19, '#2b2433'); rect(0, 18, W, 1, '#3e3446');
  const items = [['ic_coin', G.gold, '#f2c14e'], ['ic_heart', G.lives, '#ff8a7a'], ['ic_helm', G.units.length + '/' + G.cap, '#e0e8f0'], ['ic_crystal', G.crystals, '#7fe0f0'], ['ic_skull', G.phase === 'battle' ? G.kills + '/' + G.need : '0/0', '#e8e0d0']];
  let x = 3;
  for (const [ic, v, c] of items) {
    const s = SPR[ic], tw = String(v).length * 4.6 + 4, bw = s.width + tw + 4;
    rect(x, 3, bw, 13, '#120e16'); rect(x + 1, 4, bw - 2, 11, '#3a3044'); rect(x + 1, 4, bw - 2, 1, '#54445e');
    ctx.drawImage(s, x + 2, 10 - s.height / 2 | 0, s.width, s.height); text(String(v), x + s.width + 4, 10, 7, c, 'left'); x += bw + 2;
  }
  const nxt = G.wave % 5 === 0 ? '本波' : (5 - G.wave % 5) + '波后';
  text('精英 ' + nxt, W - 3, 10, 6.5, '#ff8a7a', 'right');
}
function waveRibbon() {
  const tx = FIELD.x + FIELD.w / 2, y = FIELD.y + 4;
  rect(tx - 54, y, 108, 14, '#120e16'); rect(tx - 53, y + 1, 106, 12, '#3a2a48'); rect(tx - 53, y + 1, 106, 1, '#5a4670');
  for (const sx of [-1, 1]) { const ex = tx + sx * 54; for (let i = 0; i < 7; i++) rect(sx < 0 ? ex - 8 + i : ex + 1, y + i, 8 - i, 14 - i * 2, i ? '#2a1e36' : '#120e16'); }
  for (let i = -2; i <= 2; i++) {
    const w = G.wave + i; if (w < 1 || w > 10) continue; const big = i === 0, elite = w % 5 === 0, xx = tx + i * 20;
    if (elite && !big) { rect(xx - 4, y + 4, 8, 6, '#8a2a2a'); rect(xx - 5, y + 2, 2, 3, '#e8dcb0'); rect(xx + 3, y + 2, 2, 3, '#e8dcb0'); rect(xx - 2, y + 6, 1, 1, '#ffd060'); rect(xx + 1, y + 6, 1, 1, '#ffd060'); }
    else text(String(w), xx, y + 7.5, big ? 11 : 7, big ? '#ffffff' : '#9a8aa8', 'center');
  }
}
function drawCabinet() {
  const cx = 4, cy = 222 + OFF, cw = 232, ch = 172;
  woodPanel(cx, cy, cw, ch);
  // hanging horned-helmet emblem with ropes
  const ex = 70, ey = cy - 10;
  rect(ex - 18, cy - 4, 1, 8, '#8a7a5a'); rect(ex + 17, cy - 4, 1, 8, '#8a7a5a');
  const hr = [[-26, 4], [-24, 1], [-22, -1], [-20, 0]];
  hr.forEach(([dx, dy], i) => { rect(ex + dx, ey + 6 + dy, 4, 4, '#120e16'); rect(ex - dx - 4, ey + 6 + dy, 4, 4, '#120e16'); rect(ex + dx + 1, ey + 7 + dy, 3, 2, '#e8dcb0'); rect(ex - dx - 4, ey + 7 + dy, 3, 2, '#e8dcb0'); });
  rect(ex - 17, ey, 34, 22, '#120e16'); rect(ex - 16, ey + 1, 32, 20, '#8a92a0'); rect(ex - 16, ey + 1, 32, 4, '#c4ccd4'); rect(ex - 16, ey + 1, 32, 1, '#eef2f6');
  rect(ex - 2, ey + 1, 4, 20, '#b0b8c4'); rect(ex - 1, ey + 1, 1, 20, '#eef2f6');
  rect(ex - 12, ey + 10, 9, 4, '#120e16'); rect(ex + 3, ey + 10, 9, 4, '#120e16');
  const glow = Math.floor(G.t * 3) % 2 ? '#ff5a4a' : '#ff8a6a'; rect(ex - 9, ey + 11, 3, 2, glow); rect(ex + 6, ey + 11, 3, 2, glow);
  for (let i = 0; i < 5; i++) rivet(ex - 14 + i * 6.5, ey + 17);
  // title plaque
  rect(cx + 130, cy + 6, 96, 18, '#120e16'); rect(cx + 131, cy + 7, 94, 16, '#6a4428'); rect(cx + 132, cy + 8, 92, 14, '#8a5a32'); rect(cx + 132, cy + 8, 92, 1, '#b8844a');
  rivet(cx + 133, cy + 13); rivet(cx + 220, cy + 13); text('命运转轮', cx + 178, cy + 15, 8.5, '#ffe08a', 'center');
  // reel window
  const rx = 18, ry = cy + 22, cw2 = 34, rh = 30, top = ry + 10;
  rect(rx - 7, ry - 2, cw2 * 3 + 14, rh * 3 + 26, '#120e16'); rect(rx - 6, ry - 1, cw2 * 3 + 12, rh * 3 + 24, '#2a2232'); rect(rx - 6, ry - 1, cw2 * 3 + 12, 1, '#54445e');
  rect(rx + cw2 - 14, ry + 1, 30 + 40, 8, '#120e16'); rect(rx + cw2 - 13, ry + 2, 28 + 40, 6, '#3a3044');
  ctx.drawImage(SPR.ic_coin, rx + cw2 - 11, ry + 2); text('转动 ' + spinCost(), rx + cw2 * 1.5, ry + 5.5, 6.5, '#f2c14e', 'center');
  for (let c = 0; c < 3; c++) {
    const x = rx + c * cw2;
    ctx.save(); ctx.beginPath(); ctx.rect(x + 1, top, cw2 - 2, rh * 3); ctx.clip();
    rect(x + 1, top, cw2 - 2, rh * 3, '#cbbf98');
    const cell = (sym, yy, lit) => { rect(x + 3, yy + 2, cw2 - 6, rh - 3, '#120e16'); rect(x + 3, yy + 2, cw2 - 6, rh - 4, lit ? '#fff3a0' : '#efe4c0'); rect(x + 3, yy + 2, cw2 - 6, 1, '#fffaf0'); rect(x + 3, yy + rh - 4, cw2 - 6, 2, lit ? '#e8c860' : '#d4c69c'); spr('sym_' + sym, x + cw2 / 2, yy + rh - 6, 1.75); };
    if (G.spin && !G.spin.stopped[c]) {
      const strip = G.spin.strip[c], off = (G.spin.t * 520) % (rh * strip.length);
      for (let i = -1; i < strip.length; i++) { const yy = top + ((i * rh + off) % (rh * strip.length)) - rh; cell(strip[(i + strip.length) % strip.length], yy, false); }
      ctx.fillStyle = 'rgba(40,30,50,0.25)'; ctx.fillRect(x, top, cw2, rh * 3);
    } else {
      const grid = G.spin ? G.spin.result : G.reels;
      for (let r = 0; r < 3; r++) { const lit = G.flash.some(f => f.cells.some(([cc, rr]) => cc === c && rr === r)) && Math.floor(G.t * 8) % 2; cell(grid[c][r], top + r * rh, lit); }
    }
    // reel shading top/bottom
    ctx.fillStyle = 'rgba(20,14,26,0.35)'; ctx.fillRect(x + 1, top, cw2 - 2, 4); ctx.fillRect(x + 1, top + rh * 3 - 4, cw2 - 2, 4);
    ctx.restore();
    rect(x, top, 1, rh * 3, '#120e16');
    // arrow plate under reel
    const ay = top + rh * 3 + 2; rect(x + 4, ay, cw2 - 8, 7, '#120e16'); rect(x + 5, ay + 1, cw2 - 10, 5, '#3a3044');
    rect(x + cw2 / 2 - 3, ay + 2, 6, 1, '#8a7a96'); rect(x + cw2 / 2 - 2, ay + 3, 4, 1, '#8a7a96'); rect(x + cw2 / 2 - 1, ay + 4, 2, 1, '#8a7a96');
  }
  rect(rx + cw2 * 3, top, 1, rh * 3, '#120e16');
  // lever
  const lx = rx + cw2 * 3 + 10, ly = top, pull = G.lever;
  rect(lx - 1, ly + 34, 14, 26, '#120e16'); rect(lx, ly + 35, 12, 24, '#54445e'); rect(lx, ly + 35, 12, 2, '#7a6a86'); rivet(lx + 2, ly + 52); rivet(lx + 7, ly + 52);
  const knobY = ly + 2 + pull * 40, top2 = Math.min(knobY, ly + 44);
  rect(lx + 4, top2, 4, Math.abs(ly + 44 - knobY) + 2, '#120e16'); rect(lx + 5, top2, 2, Math.abs(ly + 44 - knobY) + 2, '#d4dce4');
  for (let yy = -6; yy <= 6; yy++) { const w = Math.round(Math.sqrt(36 - yy * yy)); rect(lx + 6 - w - 1, knobY + yy, w * 2 + 2, 1, '#120e16'); }
  for (let yy = -5; yy <= 5; yy++) { const w = Math.round(Math.sqrt(25 - yy * yy)); rect(lx + 6 - w, knobY + yy, w * 2, 1, yy < 0 ? '#d84a3a' : '#a02a2a'); }
  rect(lx + 3, knobY - 3, 3, 2, '#ffa08a');
  BTN.lever = { x: lx - 6, y: ly - 4, w: 26, h: 70 };
  // relics shelf
  const px = 160, py = cy + 30;
  rect(px, py, 70, 84, '#120e16'); rect(px + 1, py + 1, 68, 82, '#241c2a'); rect(px + 1, py + 1, 68, 12, '#3a3044');
  text('遗物 · 核心', px + 35, py + 7.5, 6.5, '#d8c890', 'center');
  const ids = Object.keys(G.relics);
  for (let i = 0; i < 12; i++) { const ix = px + 5 + (i % 4) * 16, iy = py + 17 + Math.floor(i / 4) * 21; rect(ix, iy + 15, 14, 2, '#3a3044'); }
  if (!ids.length) text('胜利后获得', px + 35, py + 50, 6.5, '#6a6074', 'center');
  ids.forEach((id, i) => { const r = RELICS.find(q => q.id === id); const ix = px + 5 + (i % 4) * 16, iy = py + 17 + Math.floor(i / 4) * 21; drawRelic(r, ix, iy, 14); if (G.relics[id] > 1) text('' + G.relics[id], ix + 13, iy + 13, 6, '#fff', 'center'); });
  // result line
  const msgY = top + rh * 3 + 19;
  rect(10, msgY - 6, 220, 13, '#120e16'); rect(11, msgY - 5, 218, 11, '#2a2232');
  if (G.pending) text('军团已满！点选场上单位吸收：' + UNIT[G.pending.type].name, 120, msgY + 0.5, 7, '#ff9a8a', 'center');
  else if (G.msgT > 0) text(G.msg, 120, msgY + 0.5, 7.5, G.jackpotT > 0 ? '#f2c14e' : '#fff3c0', 'center');
  else text(G.phase === 'prep' ? '横、竖、斜连成三个相同符号即可召唤' : '战斗进行中…', 120, msgY + 0.5, 6.5, '#9a8aa8', 'center');
  const ly2 = msgY + 10; const leg = [['sword', '剑士'], ['bow', '游侠'], ['staff', '术士'], ['shield', '卫兵'], ['wolf', '野狼'], ['coin', '+15']];
  leg.forEach(([s, n], i) => { const x = 14 + i * 37; spr('sym_' + s, x + 5, ly2 + 10, 0.75); text(n, x + 11, ly2 + 5.5, 6, '#c9b98a'); });
}
function drawRelic(r, x, y, s) {
  rect(x, y, s, s, '#120e16'); rect(x + 1, y + 1, s - 2, s - 2, r.c); rect(x + 1, y + 1, s - 2, Math.max(1, s / 7 | 0), 'rgba(255,255,255,0.45)'); rect(x + 1, y + s - 3, s - 2, 2, 'rgba(0,0,0,0.3)');
  text(r.ch, x + s / 2, y + s / 2 + 0.5, s * 0.55, '#1a1420', 'center');
}
function button(id, x, y, w, h, label, sub, col, disabled) {
  BTN[id] = { x, y, w, h, disabled };
  const p = pressId === id ? 2 : 0, base = disabled ? '#4a4252' : col;
  rect(x, y + 3, w, h, '#0c0910');
  rect(x, y + p, w, h, '#120e16');
  rect(x + 1, y + 1 + p, w - 2, h - 2, base);
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(x + 2, y + 2 + p, w - 4, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 2, y + h - 4 + p, w - 4, 2);
  if (w > 40) { rivet(x + 3, y + 3 + p); rivet(x + w - 6, y + 3 + p); }
  if (sub) { text(label, x + w / 2, y + h / 2 - 4 + p, 11, disabled ? '#9a90a4' : '#fff', 'center'); text(sub, x + w / 2, y + h / 2 + 8 + p, 6.5, disabled ? '#8a8094' : '#fff3c0', 'center'); }
  else text(label, x + w / 2, y + h / 2 + 0.5 + p, 7.5, disabled ? '#9a90a4' : '#fff', 'center');
}
function drawButtons() {
  const y = 400 + OFF, prep = G.phase === 'prep';
  const can = prep && !G.spin && !G.pending;
  button('spin', 6, y, 110, 34, '转 动', spinCost() + ' 金币', '#c08a2a', !can || G.gold < spinCost());
  button('fight', 124, y, 110, 34, '开 战', prep ? '迎战第' + G.wave + '波' : '战斗中', '#a8342e', !can);
}

// ---------- drawing ----------
function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function frame(x, y, w, h, fill, edge, hi) {
  rect(x, y, w, h, '#120e16'); rect(x + 1, y + 1, w - 2, h - 2, edge); rect(x + 3, y + 3, w - 6, h - 6, fill);
  rect(x + 1, y + 1, w - 2, 1, hi); rect(x + 1, y + 1, 1, h - 2, hi);
}
function spr(name, x, y, sc, flip) {
  const s = SPR[name]; if (!s) return; sc = sc || 1;
  ctx.save(); ctx.translate(Math.round(x), Math.round(y));
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(s, Math.round(-s.width * sc / 2), Math.round(-s.height * sc), s.width * sc, s.height * sc); ctx.restore();
}
function text(t, x, y, size, col, align, bold) {
  ctx.font = (bold === false ? '' : 'bold ') + size + 'px "PingFang SC","Microsoft YaHei",monospace';
  ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#120e16'; ctx.fillText(t, x + 0.6, y + 0.6); ctx.fillStyle = col || '#fff'; ctx.fillText(t, x, y);
}
const BTN = {};
function drawField(dt) {
  const shx = G.shake > 0 ? rnd(-2, 2) * G.shake * 2 : 0, shy = G.shake > 0 ? rnd(-2, 2) * G.shake * 2 : 0;
  // parchment frame
  parchmentFrame();
  ctx.save(); ctx.beginPath(); ctx.rect(FIELD.x, FIELD.y, FIELD.w, FIELD.h); ctx.clip();
  ctx.translate(shx, shy);
  ctx.drawImage(G.wave > 5 ? BG.cave : BG.forest, FIELD.x, FIELD.y);
  // drifting clouds
  if (G.wave <= 5) { for (let i = 0; i < 4; i++) { const cx = FIELD.x + ((G.t * (3 + i) + i * 70) % (FIELD.w + 50)) - 25, cy = FIELD.y + 24 + i * 9 + (i % 2) * SKY * 0.5; drawCloud(cx, cy, 1 + (i % 2) * 0.4); } }
  else { for (let i = 0; i < 8; i++) { const fx = FIELD.x + (i * 37 + Math.sin(G.t * 0.7 + i) * 12 + 400) % FIELD.w, fy = FIELD.y + 30 + SKY + (i * 23) % 60 + Math.sin(G.t * 1.3 + i * 2) * 6; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(G.t * 3 + i); rect(fx, fy, 2, 2, '#bff4ff'); ctx.globalAlpha = 1; } }
  // spawn portal
  const px = FIELD.x + FIELD.w - 14, py = GROUND_TOP + 30;
  if (G.phase === 'battle' && G.toSpawn.length) { ctx.globalAlpha = 0.5 + 0.3 * Math.sin(G.t * 6); rect(px - 5, py - 30, 12, 60, '#2a1030'); rect(px - 3, py - 26, 8, 52, '#7a2a6a'); ctx.globalAlpha = 1; }
  // actors sorted by y
  const actors = G.units.concat(G.enemies).sort((a, b) => a.y - b.y);
  for (const a of actors) drawActor(a);
  // shots
  for (const s of G.shots) {
    if (s.kind === 'orb') { rect(s.x - 2, s.y - 2, 4, 4, '#c8a0ff'); rect(s.x - 1, s.y - 1, 2, 2, '#fff'); }
    else { ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.ang || 0); rect(-4, 0, 7, 1, s.kind === 'spear' ? '#9a6a3a' : '#e8dcb0'); rect(3, -1, 2, 3, '#c4ccd4'); ctx.restore(); }
  }
  // particles
  for (const p of G.parts) { if (p.ring) { ctx.strokeStyle = 'rgba(200,160,255,' + (p.t / 0.3) + ')'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1.2 - p.t), 0, 7); ctx.stroke(); } else rect(p.x, p.y, 2, 2, p.c); }
  // floats
  for (const f of G.floats) { ctx.globalAlpha = Math.min(1, f.life * 2); text(f.t, f.x, f.y, 7, f.c, 'center'); ctx.globalAlpha = 1; }
  // jackpot rays
  if (G.jackpotT > 0) {
    const cx = FIELD.x + FIELD.w / 2, cy = FIELD.y + 90 + SKY, a = Math.min(1, G.jackpotT);
    ctx.save(); ctx.globalAlpha = 0.55 * a; ctx.translate(cx, cy); ctx.rotate(G.t * 0.8);
    for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.fillStyle = i % 2 ? '#fff3a0' : '#f2c14e'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-10, -170); ctx.lineTo(10, -170); ctx.fill(); }
    ctx.restore(); ctx.globalAlpha = a; rect(cx - 2, FIELD.y, 4, FIELD.h, '#fffbe0');
    frame(cx - 52, cy - 14, 104, 26, '#3a2a1a', '#b8862a', '#f2c14e');
    text('棱晶骑士（传奇）', cx, cy - 5, 8, '#f2c14e', 'center'); text('JACKPOT 三线以上', cx, cy + 5, 6.5, '#fff3c0', 'center');
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  waveRibbon();
  // phase label
  text(G.phase === 'battle' ? '战斗中' : G.phase === 'prep' ? '备战 · 点单位查看' : '', FIELD.x + 4, FIELD.y + FIELD.h - 6, 6.5, '#fff', 'left');
  button('speed', FIELD.x + FIELD.w - 24, FIELD.y + 4, 20, 14, G.speed + 'x', null, '#574a63');
  // banner
  if (G.bannerT > 0) { const a = Math.min(1, G.bannerT * 2); ctx.globalAlpha = a; const red = G.banner !== '第' + G.wave + '波'; rect(FIELD.x, FIELD.y + 60, FIELD.w, 22, red ? 'rgba(138,42,42,0.85)' : 'rgba(26,20,32,0.8)'); text(G.banner, FIELD.x + FIELD.w / 2, FIELD.y + 71, 12, red ? '#ffd0c0' : '#f2c14e', 'center'); ctx.globalAlpha = 1; }
}
function drawCloud(x, y, k) {
  const parts = [[0, 4, 26, 6], [4, 1, 12, 4], [12, -1, 10, 6], [20, 2, 8, 4]];
  for (const [dx, dy, w, h] of parts) rect(x + dx * k - 1, y + dy * k - 1, w * k + 2, h * k + 2, '#d8eef8');
  for (const [dx, dy, w, h] of parts) rect(x + dx * k, y + dy * k, w * k, h * k, '#ffffff');
  rect(x, y + 9 * k, 26 * k, 1, '#c8e0f0');
}
function drawStar(x, y) { rect(x, y - 2, 1, 5, '#120e16'); rect(x - 2, y, 5, 1, '#120e16'); rect(x, y - 1, 1, 3, '#f2c14e'); rect(x - 1, y, 3, 1, '#f2c14e'); }
function drawActor(a) {
  const isU = a.team === 'u';
  const key = isU ? a.type : a.type;
  const sc = a.big ? 3 : 1.5;
  let x = a.x, y = a.y;
  if (a.drop) { y -= a.drop * 30; }
  const moving = G.phase === 'battle';
  const bob = moving ? Math.round(Math.abs(Math.sin(G.t * 8 + a.bob))) : Math.round(Math.sin(G.t * 2 + a.bob) * 0.5 + 0.5) * 0;
  const lunge = a.lunge ? (isU ? 2 : -2) : 0;
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(Math.round(x - 5 * sc), Math.round(a.y - 1), 10 * sc, 3);
  if (isU && a === G.sel) { const fl = Math.floor(G.t * 4) % 2; ctx.strokeStyle = fl ? '#f2c14e' : '#fff3a0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, a.y, 11, 4, 0, 0, 7); ctx.stroke(); }
  if (isU && a.type === 'prism') { ctx.globalAlpha = 0.35 + 0.2 * Math.sin(G.t * 5); const hue = (G.t * 120) % 360; ctx.fillStyle = 'hsl(' + hue + ',90%,70%)'; ctx.beginPath(); ctx.arc(x, y - 15 - bob, 15, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
  spr(key, x + lunge, y - bob, sc); if (a.hit > 0.05) { ctx.globalAlpha = 0.65; spr(key + '_w', x + lunge, y - bob, sc); ctx.globalAlpha = 1; }
  // stars
  if (isU && a.star > 1) for (let i = 0; i < a.star; i++) drawStar(x - 5 + i * 5, y - 35 - bob);
  // hp bar
  const bw = a.big ? 36 : 16, frac = Math.max(0, a.hp / a.maxhp);
  if (G.phase === 'battle' || frac < 1) { rect(x - bw / 2 - 1, y - (a.big ? 64 : 34) - bob, bw + 2, 4, '#120e16'); rect(x - bw / 2, y - (a.big ? 63 : 33) - bob, bw * frac, 2, isU ? '#6cd84a' : '#e84a3a'); }
}
function drawUnitPanel() {
  const u = G.sel; if (!u || G.phase !== 'prep' || G.absorbMode) return;
  const x = 20, y = 60, w = 200, h = 120;
  ctx.fillStyle = 'rgba(10,8,14,0.5)'; ctx.fillRect(0, 0, W, H);
  frame(x, y, w, h, '#2b2433', '#574a63', '#8a7a96');
  rect(x + 10, y + 8, 38, 40, '#e8dcb0'); spr(u.type, x + 29, y + 46, 1.9);
  text(UNIT[u.type].name, x + 54, y + 14, 10, '#fff'); text('★'.repeat(u.star) + '☆'.repeat(3 - u.star), x + 54, y + 27, 8, '#f2c14e');
  text('吸收 ' + u.xp + '/2' + (u.star >= 3 ? '（满星）' : ''), x + 54, y + 39, 6.5, '#7fe0f0');
  text('生命 ' + u.maxhp + '   攻击 ' + Math.round(u.atk) + '   射程 ' + Math.round(u.range), x + 10, y + 56, 7, '#e8e0d0');
  text('词条：' + u.bonus, x + 10, y + 68, 7, '#fff3c0');
  button('absorb', x + 10, y + 82, 86, 28, '吸收', '选一个单位喂它', '#3b6fc4', G.units.length < 2 || u.star >= 3);
  button('close', x + 104, y + 82, 86, 28, '关闭', null, '#574a63');
}
function drawReward() {
  if (G.phase !== 'reward' || !G.rewards) return;
  ctx.fillStyle = 'rgba(10,8,14,0.7)'; ctx.fillRect(0, 0, W, H);
  text('第' + G.wave + '波 胜利', W / 2, 70, 13, '#f2c14e', 'center'); text('+' + G.rewardGold + ' 金币 · 选择一件遗物', W / 2, 88, 7.5, '#fff3c0', 'center');
  G.rewards.forEach((r, i) => {
    const x = 14, y = 104 + i * 62, w = 212, h = 54; BTN['rw' + i] = { x, y, w, h };
    frame(x, y, w, h, '#2b2433', pressId === 'rw' + i ? '#f2c14e' : '#574a63', '#8a7a96');
    rect(x + 10, y + 11, 32, 32, '#120e16'); rect(x + 11, y + 12, 30, 30, r.c); text(r.ch, x + 26, y + 27.5, 15, '#120e16', 'center');
    text(r.name + (G.relics[r.id] ? '  ×' + (G.relics[r.id] + 1) : ''), x + 52, y + 18, 10, '#fff'); text(r.d, x + 52, y + 35, 7.5, '#c9b98a');
  });
}
function drawEnd() {
  if (G.phase !== 'end') return;
  ctx.fillStyle = 'rgba(10,8,14,0.8)'; ctx.fillRect(0, 0, W, H);
  const win = G.ended.win;
  frame(24, 120, 192, 170, '#2b2433', win ? '#b8862a' : '#8a2a2a', '#8a7a96');
  spr(win ? 'prism' : 'boss', W / 2, 176, 2.5);
  text(win ? '胜利！巨魔酋长倒下了' : '军团覆灭', W / 2, 190, 12, win ? '#f2c14e' : '#ff8a7a', 'center');
  text('到达第 ' + G.ended.wave + ' 波  ·  最佳 ' + G.best + ' 波', W / 2, 210, 7.5, '#e8e0d0', 'center');
  text('剩余军团 ' + G.units.length + '  ·  遗物 ' + Object.keys(G.relics).length, W / 2, 224, 7.5, '#c9b98a', 'center');
  button('restart', 60, 242, 120, 34, '再来一局', null, '#b8862a');
}
function drawToast() { if (toastT <= 0) return; ctx.globalAlpha = Math.min(1, toastT * 3); const w = 8 + toastMsg.length * 8; rect(W / 2 - w / 2, FIELD.y + 22, w, 16, 'rgba(18,14,22,0.9)'); text(toastMsg, W / 2, FIELD.y + 30, 7.5, '#fff', 'center'); ctx.globalAlpha = 1; }
function drawTitleBar() { text('最佳 ' + G.best + ' 波', W - 6, 212 + 0, 0.1, '#000', 'right'); }

// ---------- loop ----------
let last = performance.now();
function tick(now) {
  let dt = Math.min(0.05, (now - last) / 1000); last = now;
  G.t += dt; toastT -= dt; G.msgT -= dt; G.bannerT -= dt; G.jackpotT -= dt; G.shake = Math.max(0, G.shake - dt);
  G.lever = Math.max(0, G.lever - dt * 2.5);
  G.flash.forEach(f => f.t -= dt); G.flash = G.flash.filter(f => f.t > 0);
  if (G.spin) {
    G.spin.t += dt;
    for (let c = 0; c < 3; c++) if (!G.spin.stopped[c] && G.spin.t >= G.spin.stopAt[c]) { G.spin.stopped[c] = true; SFX.stop(); }
    if (G.spin.stopped[2]) finishSpin();
  }
  processSummons(dt);
  for (const u of G.units) if (u.drop) { u.drop = Math.max(0, u.drop - dt * 3); if (!u.drop) { u.x = u.hx; u.y = u.hy; } }
  if (G.phase === 'prep') for (const u of G.units) if (!u.drop) { u.x += (u.hx - u.x) * Math.min(1, dt * 6); u.y += (u.hy - u.y) * Math.min(1, dt * 6); }
  const steps = G.phase === 'battle' ? G.speed : 1;
  for (let i = 0; i < steps; i++) if (G.phase === 'battle') updateBattle(dt);
  for (const p of G.parts) { p.t -= dt; if (!p.ring) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 120 * dt; } }
  G.parts = G.parts.filter(p => p.t > 0);
  for (const f of G.floats) { f.life -= dt; f.y -= 14 * dt; } G.floats = G.floats.filter(f => f.life > 0);
  render(); requestAnimationFrame(tick);
}
function render() {
  ctx.setTransform(S * DPR, 0, 0, S * DPR, 0, 0); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(STONE, 0, 0);
  for (const k in BTN) delete BTN[k];
  drawHUD(); drawField(); drawCabinet(); drawButtons(); drawUnitPanel(); drawReward(); drawEnd(); drawToast();
  if (G.absorbMode && G.sel) { rect(0, 214, W, 0, '#000'); rect(FIELD.x, FIELD.y + FIELD.h - 16, FIELD.w, 14, 'rgba(59,111,196,0.85)'); text('点选另一个单位作为养料（点空白取消）', FIELD.x + FIELD.w / 2, FIELD.y + FIELD.h - 9, 7, '#fff', 'center'); }
}

// ---------- input ----------
let pressId = null;
function toLogical(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }
function hitBtn(p) { for (const id in BTN) { const b = BTN[id]; if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) return id; } return null; }
function unitAt(p) { let best = null, bd = 16; for (const u of G.units) { const d = Math.hypot(u.x - p.x, (u.y - 14) - p.y); if (d < bd) { bd = d; best = u; } } return best; }
cv.addEventListener('pointerdown', e => { e.preventDefault(); const p = toLogical(e); pressId = hitBtn(p); if (AC && AC.state === 'suspended') AC.resume(); });
cv.addEventListener('pointerup', e => {
  e.preventDefault(); const p = toLogical(e); const id = hitBtn(p); const was = pressId; pressId = null;
  if (id && id === was) {
    const b = BTN[id]; if (b && b.disabled) { SFX.bad(); return; }
    return onButton(id);
  }
  if (G.phase !== 'prep') return;
  if (G.sel && !G.absorbMode) { const x = 20, y = 60; if (p.x > x && p.x < x + 200 && p.y > y && p.y < y + 120) return; G.sel = null; return; }
  const u = unitAt(p);
  if (G.pending) { if (u) { absorb(u, G.pending); G.pending = null; } return; }
  if (G.absorbMode) { if (u && u !== G.sel) { absorb(G.sel, u); G.units = G.units.filter(q => q !== u); layoutUnits(); } G.absorbMode = false; G.sel = null; return; }
  if (u) { G.sel = u; beep(660, 0.04); }
});
function onButton(id) {
  if (id === 'spin' || id === 'lever') return doSpin();
  if (id === 'fight') return startWave();
  if (id === 'speed') { G.speed = G.speed === 1 ? 2 : G.speed === 2 ? 3 : 1; return; }
  if (id === 'absorb') { G.absorbMode = true; return; }
  if (id === 'close') { G.sel = null; return; }
  if (id === 'restart') { newGame(); return; }
  if (id.startsWith('rw') && G.rewards) return takeReward(G.rewards[+id.slice(2)]);
}
window.addEventListener('keydown', e => { if (e.code === 'Space') doSpin(); if (e.key === 'Enter') startWave(); });

function resize() {
  DPR = window.devicePixelRatio || 1;
  const vw = window.innerWidth, vh = window.innerHeight;
  H = Math.round(Math.max(440, Math.min(540, W * vh / vw))); OFF = H - 440; applyLayout(); STONE = makeStone();
  S = Math.min(vw / W, vh / H);
  cv.width = Math.round(W * S * DPR); cv.height = Math.round(H * S * DPR);
  cv.style.width = Math.round(W * S) + 'px'; cv.style.height = Math.round(H * S) + 'px';
}
window.addEventListener('resize', resize);
buildSprites();
resize(); newGame(); requestAnimationFrame(tick);
window.__G = () => G;
