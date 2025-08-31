// scripts/seed.js
// 使い方:
//   node scripts/seed.js --reset --file ../data/seed.todos.json
//   node scripts/seed.js --file ../data/seed.todos.json
//   node scripts/seed.js --random --count 40 --seed 42
//   node scripts/seed.js --count 40   // 既存件数を保ちながら合計N件まで補充

// このスクリプトは「お店をオープンする前に、棚にサンプル商品を並べる店員さん」みたいな役割
// MongoDB という「倉庫」に、todos という棚を作り、そこに見本のタスクを置いておく感じ
// このスクリプトは「毎回同じ状態（固定サンプル10件）に戻す」ことと、「動作を体感するために大量データを作る」こと、両方できるのが特徴
// まとめ
// 	•	倉庫 = MongoDB
//	•	商品カタログ = Todoモデル
//	•	棚に並べる作業 = insert (seed)
//	•	見本商品10個 = 固定のJSONファイル
//	•	追加補充 = ランダム生成
//	•	店長の指示 = --reset, --file, --count などのオプション
//	•	シャッター閉め = disconnect

const fs = require('fs');
const path = require('path');

// ★ server/node_modules から読み込むための require を作る
const { createRequire } = require('module');
const requireFromServer = createRequire(path.join(__dirname, '..', 'server', 'package.json'));

// 依存は server 側の node_modules を使う
const dotenv = requireFromServer('dotenv');
dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const mongoose = requireFromServer('mongoose');

// モデルは相対パスでOK（今のままで大丈夫）
const Todo = require('../server/models/todo');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/todo_api';
const STATUSES = ['pending', 'in-progress', 'completed'];
const TAGS = ['docs', 'api', 'backend', 'cleanup', 'ops', 'setup', 'db', 'ci', 'devex'];

function parseArgs() {
  const args = process.argv.slice(2);
  const getVal = (key, def = undefined) => {
    const i = args.indexOf(key);
    return i !== -1 ? args[i + 1] : def;
  };
  return {
    reset: args.includes('--reset'),
    file: getVal('--file'),
    random: args.includes('--random'),
    count: parseInt(getVal('--count', '0'), 10) || 0,
    seed: getVal('--seed')
  };
}

// 決定論的乱数ジェネレータ
function makeRng(seedStr) {
  let x = 0;
  const s = String(seedStr || 'seed');
  for (let i = 0; i < s.length; i++) x ^= s.charCodeAt(i) << (i % 24);
  if (x === 0) x = 0x9e3779b9;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return ((x >>> 0) / 0xFFFFFFFF);
  };
}
function pick(arr, rnd) { return arr[Math.floor(rnd() * arr.length)]; }
function randint(min, max, rnd) { return Math.floor(rnd() * (max - min + 1)) + min; }

function randomTitle(rnd) {
  const bases = [
    'Polish README', 'Investigate API bug', 'Refactor routes',
    'Add tests', 'Update docs', 'Review env config',
    'Add request logging', 'Unify error handling',
    'Create seed data', 'Setup CI'
  ];
  const suffix = ['v0.1', 'quick', 'minor', 'follow-up', 'review', 'draft'];
  return `${pick(bases, rnd)} ${pick(suffix, rnd)}`;
}

function randomDescription(rnd) {
  const parts = [
    'Small improvement.', 'Needs review.', 'Follow acceptance criteria.',
    'Low priority.', 'High priority task.', 'Add tests if possible.'
  ];
  return pick(parts, rnd);
}

function randomDueDate(rnd) {
  const offset = randint(-15, 15, rnd); // 今日から±15日
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return rnd() < 0.6 ? d : undefined; // 60%の確率でdueDateを設定
}

async function insertFixedFromFile(filePath) {
  const full = path.resolve(__dirname, filePath);
  const text = fs.readFileSync(full, 'utf-8');
  const items = JSON.parse(text);
  if (!Array.isArray(items)) throw new Error('seed file must be an array');
  const docs = items.map(it => ({
    title: it.title,
    description: it.description || '',
    status: STATUSES.includes(it.status) ? it.status : 'pending',
    tags: Array.isArray(it.tags) ? it.tags : [],
    dueDate: it.dueDate ? new Date(it.dueDate) : undefined
  }));
  const res = await Todo.insertMany(docs);
  return res.length;
}

async function insertRandom(n, seedStr) {
  const rnd = makeRng(seedStr || '42');
  const docs = Array.from({ length: n }, () => {
    const status = pick(STATUSES, rnd);
    const tag1 = pick(TAGS, rnd);
    const tag2 = pick(TAGS, rnd);
    const tags = Array.from(new Set([tag1, tag2])).slice(0, randint(1, 2, rnd));
    return {
      title: randomTitle(rnd),
      description: randomDescription(rnd),
      status,
      tags,
      dueDate: randomDueDate(rnd)
    };
  });
  const res = await Todo.insertMany(docs);
  return res.length;
}

async function main() {
  const opt = parseArgs();
  await mongoose.connect(MONGODB_URI);
  console.log('[seed] Connected:', MONGODB_URI);

  if (opt.reset) {
    const del = await Todo.deleteMany({});
    console.log(`[seed] Cleared: ${del.deletedCount}`);
    if (!opt.file) {
      throw new Error('--reset には --file <path> を指定してください');
    }
  }

  let inserted = 0;

  if (opt.file) {
    inserted += await insertFixedFromFile(opt.file);
    console.log(`[seed] Inserted from file: ${inserted}`);
  }

  if (opt.count > 0) {
    const current = await Todo.countDocuments();
    const toAdd = Math.max(opt.count - current, 0);
    if (toAdd > 0) {
      const n = await insertRandom(toAdd, opt.seed);
      inserted += n;
      console.log(`[seed] Random filled: ${n} (target=${opt.count}, after=${await Todo.countDocuments()})`);
    } else {
      console.log('[seed] No random fill needed (already at or above target).');
    }
  } else if (opt.random) {
    const n = await insertRandom(10, opt.seed);
    inserted += n;
    console.log(`[seed] Random inserted: ${n}`);
  }

  const finalCount = await Todo.countDocuments();
  console.log(`[seed] Final count: ${finalCount} (inserted=${inserted})`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('[seed] Error:', err);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});