/* A Sheikh — redesigned, dictionary-backed 20-stage Shushtari word game */
(()=>{
 'use strict';
 const root=document.getElementById('shushtariGame'); if(!root||root.dataset.initialized==='yes')return;
 root.dataset.initialized='yes';
 const $=id=>root.querySelector('#'+id);
 const norm=s=>String(s||'').toLocaleLowerCase('fa')
  .replace(/\\([^)]*\\)/g,'').replace(/[\\u064b-\\u065f\\u0670\\u0640]/g,'')
  .replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[ۀة]/g,'ه')
  .replace(/[ؤ]/g,'و').replace(/[أإ]/g,'ا').replace(/[^ء-ی]/g,'');
 const clean=s=>String(s||'').replace(/\\([^)]*\\)/g,'').replace(/[\\u064b-\\u065f\\u0670\\u0640]/g,'').trim();
 const freq=s=>{const o={};for(const c of s)o[c]=(o[c]||0)+1;return o;};
 const fits=(word,bag)=>Object.entries(freq(word)).every(([c,n])=>(bag[c]||0)>=n);
 const shuffle=a=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;};
 const STORAGE='shoushtar_ashiikh_game_v3';
 const oldKeys=['shoushtar_ashiikh_game_v2'];
 let saved={unlocked:1,best:{},total:0};
 try{saved={...saved,...JSON.parse(localStorage.getItem(STORAGE)||localStorage.getItem(oldKeys[0])||'{}')};}catch(_){}
 saved.unlocked=Math.max(1,Math.min(20,Number(saved.unlocked)||1));
 let stages=[],stage=1,found=new Set(),tiles=[],picked=[],points=0,hints=2,locked=false;
 const fa=n=>Number(n).toLocaleString('fa-IR');
 const persist=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(saved));}catch(_){}};
 const wordScore=w=>{
  const sh=clean(w.shushtari),faText=String(w.persian||'');
  let score=0;
  if(sh&&!/[a-zA-Z]/.test(sh))score+=4;
  if(faText.length<=24)score+=3;
  if(!/[؛،؟()]/.test(sh))score+=2;
  if(w.category)score+=1;
  return score;
 };
 function uniqueEntries(entries){
  const map=new Map();
  for(const e of entries||[]){
   const sh=clean(e.shushtari),key=norm(sh);
   if(!e.persian||key.length<3||key.length>6||!/^[-ء-ی]+$/.test(key))continue;
   if(!map.has(key))map.set(key,{fa:String(e.persian),sh,key,category:e.category||''});
  }
  return [...map.values()];
 }
 function groupsFor(entries,size,minCount){
  const groups=new Map();
  entries.filter(w=>w.key.length===size).forEach(seed=>{
   const letters=[...seed.key],bag=freq(seed.key);
   const words=entries.filter(w=>fits(w.key,bag));
   if(words.length<minCount)return;
   const id=[...letters].sort().join('');
   if(!groups.has(id))groups.set(id,{letters,words});
  });
  return [...groups.values()];
 }
 function buildStages(entries){
  const easyPool=groupsFor(entries,5,3).filter(g=>[3,4,5].every(n=>g.words.some(w=>w.key.length===n)));
  const easy=[];
  for(const g of easyPool){
   const selected=[3,4,5].map(n=>g.words.filter(w=>w.key.length===n).sort((a,b)=>wordScore(b)-wordScore(a))[0]);
   if(selected.every(Boolean))easy.push({...g,words:selected});
   if(easy.length===9)break;
  }
  if(easy.length!==9)throw Error('برای ۹ مرحلهٔ آسان، واژه‌های سه، چهار و پنج‌حرفی کافی نیست.');
  const used=new Set(easy.map(g=>[...g.letters].sort().join('')));
  const normal=groupsFor(entries,5,5).filter(g=>!used.has([...g.letters].sort().join('')))
   .map(g=>({...g,words:[...g.words].sort((a,b)=>wordScore(b)-wordScore(a)||b.key.length-a.key.length).slice(0,5)}))
   .filter(g=>g.words.length===5);
  const hard=groupsFor(entries,6,5)
   .map(g=>({...g,words:[...g.words].sort((a,b)=>wordScore(b)-wordScore(a)||b.key.length-a.key.length).slice(0,5)}))
   .filter(g=>g.words.length===5);
  if(normal.length<9||hard.length<2)throw Error('تعداد واژه‌های معتبر برای ساخت ۲۰ مرحله کافی نیست.');
  const result=[...easy];
  // Stage 10: a six-letter, five-answer challenge.
  result.push(hard[0]);
  // Stages 11–19: five answers, slightly harder five-letter pools.
  result.push(...normal.slice(0,9));
  // Stage 20: another six-letter final challenge, with a different letter pool.
  const finalHard=hard.find(g=>[...g.letters].sort().join('')!==[...hard[0].letters].sort().join(''));
  if(!finalHard)throw Error('مرحلهٔ پایانیِ دشوار ساخته نشد.');
  result.push(finalHard);
  return result;
 }
 function stageScreen(){
  $('wgStageScreen').hidden=false;$('wgPlayScreen').hidden=true;$('wgDoneScreen').hidden=true;
  $('wgStages').replaceChildren();
  stages.forEach((data,index)=>{
   const n=index+1,b=document.createElement('button');b.type='button';b.className='wg-stage-card';
   b.disabled=n>saved.unlocked;
   const number=document.createElement('span');number.className='wg-stage-number';number.textContent=fa(n);
   const title=document.createElement('strong');title.textContent=n<=9?'آسان':(n%10===0?'چالش ویژه':'معمولی');
   const info=document.createElement('small');info.textContent=n<=9?'۳ واژه · ۳، ۴ و ۵ حرفی':(n%10===0?'۵ واژه · ۶ حرف':'۵ واژه · ۵ حرف');
   const mark=document.createElement('span');mark.className='wg-stage-mark';mark.textContent=saved.best[n]!==undefined?'✓':(n>saved.unlocked?'🔒':'←');
   b.append(number,title,info,mark);
   if(n%10===0)b.classList.add('challenge');
   if(saved.best[n]!==undefined)b.classList.add('completed');
   b.addEventListener('click',()=>start(n));$('wgStages').appendChild(b);
  });
  $('wgProgress').textContent=fa(Math.min(saved.unlocked-1,20))+' از ۲۰ مرحله باز شده';
  $('wgTotal').textContent='امتیاز کل: '+fa(saved.total||0);
 }
 function start(n){
  stage=n;found=new Set();picked=[];points=0;hints=n<=9?3:2;locked=false;
  $('wgStageScreen').hidden=true;$('wgDoneScreen').hidden=true;$('wgPlayScreen').hidden=false;
  const data=stages[n-1];tiles=shuffle([...data.letters]);
  $('wgStageLabel').textContent='مرحله '+fa(n)+' از ۲۰';
  $('wgDifficulty').textContent=n<=9?'آسان · شروع یادگیری':(n%10===0?'چالش ویژه · سخت':'معمولی · پنج واژه');
  $('wgLetterTray').replaceChildren();
  tiles.forEach((letter,i)=>{
   const b=document.createElement('button');b.type='button';b.className='wg-letter';b.textContent=letter;b.dataset.i=i;
   $('wgLetterTray').appendChild(b);
  });
  $('wgMessage').textContent=n<=9?'سه واژه را پیدا کن؛ هر مرحله یک واژهٔ ۳، ۴ و ۵ حرفی دارد.':'حروف را کنار هم بگذار و هر پنج واژه را پیدا کن.';
  $('wgMessage').className='wg-message';
  drawTargets();drawPicked();updateStats();
 }
 function drawTargets(){
  const wrap=$('wgTargets');wrap.replaceChildren();
  const words=stages[stage-1].words;
  words.forEach((w,i)=>{
   const row=document.createElement('div');row.className='wg-target'+(found.has(w.key)?' solved':'');
   const blanks=document.createElement('div');blanks.className='wg-blanks';
   for(let k=0;k<[...w.key].length;k++){const cell=document.createElement('i');cell.textContent=found.has(w.key)?[...w.key][k]:' ';blanks.appendChild(cell);}
   const label=document.createElement('span');label.className='wg-target-label';label.textContent=found.has(w.key)?w.sh:'واژهٔ '+fa(i+1);
   const meaning=document.createElement('small');meaning.textContent=found.has(w.key)?w.fa:fa(w.key.length)+' حرفی';
   row.append(blanks,label,meaning);wrap.appendChild(row);
  });
  $('wgRemaining').textContent=fa(words.length-found.size)+' واژه باقی مانده';
 }
 function drawPicked(){
  $('wgPicked').replaceChildren();
  picked.forEach(i=>{const s=document.createElement('span');s.className='wg-picked-letter';s.textContent=tiles[i];$('wgPicked').appendChild(s);});
  $('wgLetterTray').querySelectorAll('.wg-letter').forEach((b,i)=>b.classList.toggle('used',picked.includes(i)));
 }
 function updateStats(){
  $('wgPoints').textContent='امتیاز '+fa(points);
  $('wgHints').textContent='راهنما '+fa(hints);
  $('wgStageLabel').textContent='مرحله '+fa(stage)+' از ۲۰';
 }
 function choose(i){
  if(locked||picked.includes(i)||picked.length>=tiles.length)return;
  picked.push(i);drawPicked();
  const guess=picked.map(j=>tiles[j]).join('');
  if(stages[stage-1].words.some(w=>w.key===guess))submitWord();
 }
 function undo(){if(locked||!picked.length)return;picked.pop();drawPicked();}
 function submitWord(){
  if(locked||!picked.length)return;
  const guess=picked.map(i=>tiles[i]).join('');
  const match=stages[stage-1].words.find(w=>w.key===guess);
  if(match&&!found.has(match.key)){
   found.add(match.key);points+=match.key.length*10;
   $('wgMessage').textContent='آفرین! «'+match.sh+'» درست بود؛ معنی: '+match.fa;
   $('wgMessage').className='wg-message good';
   picked=[];drawPicked();drawTargets();updateStats();
   if(found.size===stages[stage-1].words.length)setTimeout(finish,550);
  }else{
   $('wgMessage').textContent=match?'این واژه را قبلاً پیدا کرده‌ای.':'این ترکیب در جواب‌های این مرحله نیست؛ دوباره امتحان کن.';
   $('wgMessage').className='wg-message wrong';
   setTimeout(()=>{picked=[];drawPicked();},550);
  }
 }
 function hint(){
  if(locked||hints<=0)return;
  const next=stages[stage-1].words.find(w=>!found.has(w.key));if(!next)return;
  hints--;updateStats();
  $('wgMessage').textContent='راهنما: معنی این واژه «'+next.fa+'» است و '+fa(next.key.length)+' حرف دارد.';
  $('wgMessage').className='wg-message';
 }
 function finish(){
  locked=true;saved.best[stage]=Math.max(saved.best[stage]||0,points);
  saved.total=(saved.total||0)+points;
  if(stage<20)saved.unlocked=Math.max(saved.unlocked,stage+1);
  persist();$('wgPlayScreen').hidden=true;$('wgDoneScreen').hidden=false;
  $('wgDoneTitle').textContent=stage===20?'آفرین! مرحلهٔ پایانی را هم رد کردی':'مرحلهٔ '+fa(stage)+' تمام شد';
  $('wgDoneText').textContent='همهٔ '+fa(stages[stage-1].words.length)+' واژه را پیدا کردی و '+fa(points)+' امتیاز گرفتی.';
  $('wgNextBtn').textContent=stage===20?'دیدن مراحل':'مرحلهٔ بعد';
  $('wgNextBtn').onclick=()=>stage===20?stageScreen():start(stage+1);
 }
 $('wgBackBtn').addEventListener('click',stageScreen);
 $('wgUndoBtn').addEventListener('click',undo);
 $('wgSubmitBtn').addEventListener('click',submitWord);
 $('wgHintBtn').addEventListener('click',hint);
 $('wgLetterTray').addEventListener('click',e=>{const b=e.target.closest('.wg-letter');if(b&&!b.classList.contains('used'))choose(Number(b.dataset.i));});
 fetch('./data/shushtari-dictionary.json?v=3',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('واژه‌نامه در دسترس نیست');return r.json();}).then(data=>{
  stages=buildStages(uniqueEntries(data.entries));
  $('wgLoading').hidden=true;stageScreen();
 }).catch(err=>{$('wgLoading').textContent='بارگذاری بازی ناموفق بود؛ صفحه را تازه‌سازی کن.';console.error('A Sheikh game:',err);});
})();