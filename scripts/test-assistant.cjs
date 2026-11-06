'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const html = fs.readFileSync('index.html', 'utf8');
const knowledge = JSON.parse(fs.readFileSync('data/shushtar-knowledge.json', 'utf8'));

function extractObject(marker) {
  const p = html.indexOf(marker);
  assert.notEqual(p, -1, 'missing ' + marker);
  const start = html.indexOf('{', p);
  let depth = 0, quote = null, escaped = false;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (c === '\\\\') escaped = true;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return html.slice(start, i + 1);
  }
  throw new Error('unclosed object: ' + marker);
}

function extractFunction(name) {
  const p = html.indexOf('function ' + name + '(');
  assert.notEqual(p, -1, 'missing function ' + name);
  const start = html.indexOf('{', p);
  let depth = 0, quote = null, escaped = false;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (c === '\\\\') escaped = true;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return html.slice(p, i + 1);
  }
  throw new Error('unclosed function: ' + name);
}

const names = ['aiNorm', 'aiTokens', 'aiExpandTerms', 'aiRetrieve', 'aiShortText', 'aiCompose'];
const source = 'const AI_ALIASES = ' + extractObject('const AI_ALIASES=') + ';\\n' +
  names.map(extractFunction).join('\\n') +
  '\\nglobalThis.assistant = { aiRetrieve, aiCompose };';
const context = { shushtarDocs: knowledge };
vm.runInNewContext(source, context);
const { aiRetrieve, aiCompose } = context.assistant;

const tests = [
  ['جست‌وجوی دقیق بند میزان', () => {
    const r = aiRetrieve('بند میزان');
    assert.ok(r.length && r[0].d.title.includes('بند میزان'));
  }],
  ['سؤال محاوره‌ای درباره تقسیم آب', () => {
    const r = aiRetrieve('قدیما آب شوشتر رو چطوری تقسیم می‌کردن؟');
    assert.ok(r.length);
    assert.ok(r.some(x => /بند میزان|تقسیم آب|شبکه آبی/.test(x.d.title)));
  }],
  ['جست‌وجوی قلعه سلاسل', () => {
    const r = aiRetrieve('قلعه سلاسل کجاست؟');
    assert.ok(r.length && r.some(x => x.d.title.includes('قلعه سلاسل')));
  }],
  ['رد پرسش نامرتبط آب‌وهوا', () => {
    assert.equal(aiRetrieve('هوای امروز برلین چطوره؟').length, 0);
  }],
  ['رد پرسش نامرتبط فوتبال', () => {
    assert.equal(aiRetrieve('نتیجه بازی فوتبال دیشب چی شد؟').length, 0);
  }],
  ['پاسخ کوتاه و بدون متن اضافه', () => {
    const r = aiRetrieve('بند میزان');
    const answer = aiCompose('بند میزان', r);
    assert.ok(answer && typeof answer.answer === 'string');
    assert.ok(answer.answer.length <= 540);
    assert.ok(!answer.answer.includes('درجه اتکا'));
  }],
  ['سلامت ساختار دانشنامه', () => {
    assert.equal(knowledge.documents.length, 58);
    const ids = knowledge.documents.map(d => d.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.ok(knowledge.documents.every(d => d.title && d.content));
  }]
];

let failed = 0;
for (const [name, run] of tests) {
  try { run(); console.log('PASS ' + name); }
  catch (error) { failed++; console.error('FAIL ' + name + ': ' + error.message); }
}
console.log('\\nنتیجه: ' + (tests.length - failed) + '/' + tests.length + ' آزمون موفق');
if (failed) process.exitCode = 1;
