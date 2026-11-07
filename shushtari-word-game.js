/* A Sheikh — Amirza-style Shushtari word game */
(()=>{
 const root=document.getElementById('shushtariGame');
 if(!root)return;
 const $=id=>root.querySelector('#'+id);
 const norm=s=>String(s||'').toLocaleLowerCase('fa')
  .replace(/[\u064b-\u065f\u0670\u0640]/g,'')
  .replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[ۀة]/g,'ه')
  .replace(/[ؤ]/g,'و').replace(/[أإ]/g,'ا')
  .replace(/\([^)]*\)/g,'').replace(/[^\p{L}\p{N}]/gu,'');
 const clean=s=>String(s||'').replace(/\([^)]*\)/g,'').replace(/[\u064b-\u065f\u0670\u0640]/g,'').trim();
 const freq=s=>{const o={};for(const c of s)o[c]=(o[c]||0)+1;return o;};
 const fits=(word,bag)=>Object.entries(freq(word)).every(([c,n])=>(bag[c]||0)>=n);
 const shuffle=a=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;};
 const key='shoushtar_ashiikh_game_v2';
 let saved={unlocked:1,best:{},total:0};
 try{saved={...saved,...JSON.parse(localStorage.getItem(key)||'{}')};}catch(_){}
 let stages=[],stage=1,found=new Set(),tiles=[],picked=[],points=0,hints=2,locked=false;
 const fa=n=>Number(n).toLocaleString('fa-IR');
 const persist=()=>{try{localStorage.setItem(key,JSON.stringify(saved));}catch(_){}};
 function makeStages(entries){
  const unique=[...new Map(entries.map(e=>({fa:e.persian,sh:clean(e.shushtari),key:norm(e.shushtari)}))
   .filter(x=>x.fa&&x.key.length>=3&&x.key.length<=5&&[...x.key].length===x.key.length)
   .map(x=>[x.key,x])).values()];
  const groups=new Map();
  unique.filter(x=>x.key.length===5).forEach(seed=>{
   const letters=[...seed.key].sort().join(''),bag=freq(letters);
   const words=unique.filter(w=>fits(w.key,bag));
   if(words.length>=4&&!groups.has(letters)){
    const selected=[...words].sort((a,b)=>b.key.length-a.key.length||a.fa.localeCompare(b.fa,'fa')).slice(0,5);
    groups.set(letters,{letters:[...letters],words:selected});
   }
  });
  return [...groups.values()].sort((a,b)=>b.words.length-a.words.length||a.letters.join('').localeCompare(b.letters.join(''),'fa')).slice(0,20);
 }
 function stageScreen(){
  $('wgStageScreen').hidden=false;$('wgPlayScreen').hidden=true;$('wgDoneScreen').hidden=true;
  $('wgStages').replaceChildren();
  for(let n=1;n<=20;n++){
   const b=document.createElement('button');b.type='button';b.className='wg-stage';
   b.disabled=n>saved.unlocked;
   const no=document.createElement('strong');no.textContent=fa(n);
   const small=document.createElement('small');small.textContent=saved.best[n]!==undefined?'★ '+fa(saved.best[n]):(n<=saved.unlocked?'شروع':'قفل');
   b.append(no,small);b.addEventListener('click',()=>start(n));$('wgStages').appendChild(b);
  }
  $('wgProgress').textContent=fa(Math.min(saved.unlocked-1,20))+' از ۲۰ مرحله باز شده';
  $('wgTotal').textContent='امتیاز کل: '+fa(saved.total||0);
 }
 function start(n){
  stage=n;found=new Set();picked=[];points=0;hints=2;locked=false;
  $('wgStageScreen').hidden=true;$('wgDoneScreen').hidden=true;$('wgPlayScreen').hidden=false;
  tiles=shuffle([...stages[n-1].letters]);
  $('wgStageLabel').textContent='مرحله '+fa(n)+' از ۲۰';
  $('wgLetterTray').replaceChildren();
  tiles.forEach((letter,i)=>{
   const b=document.createElement('button');b.type='button';b.className='wg-letter';b.textContent=letter;b.dataset.i=i;
   $('wgLetterTray').appendChild(b);
  });
  drawTargets();drawPicked();updateStats();
 }
 function drawTargets(){
  const wrap=$('wgTargets');wrap.replaceChildren();
  const words=stages[stage-1].words;
  words.forEach((w,i)=>{
   const row=document.createElement('div');row.className='wg-target'+(found.has(w.key)?' solved':'');
   const blanks=document.createElement('div');blanks.className='wg-blanks';
   for(let k=0;k<[...w.key].length;k++){const cell=document.createElement('i');cell.textContent=found.has(w.key)?[...w.key][k]||'✓':'';blanks.appendChild(cell);}
   const label=document.createElement('span');label.className='wg-target-label';label.textContent=found.has(w.key)?w.sh:'واژهٔ '+fa(i+1);
   const meaning=document.createElement('small');meaning.textContent=found.has(w.key)?w.fa:'';
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
  if(locked||picked.includes(i)||picked.length>=5)return;
  picked.push(i);drawPicked();
  if(picked.length===5)submitWord();
 }
 function undo(){if(locked||!picked.length)return;picked.pop();drawPicked();}
 function submitWord(){
  if(locked||!picked.length)return;
  const guess=picked.map(i=>tiles[i]).join('');
  const match=stages[stage-1].words.find(w=>w.key===guess);
  if(match&&!found.has(match.key)){
   found.add(match.key);points+=match.key.length*10;
   $('wgMessage').textContent='آفرین! «'+match.sh+'» درست بود.';
   $('wgMessage').className='wg-message good';
   picked=[];drawPicked();drawTargets();updateStats();
   if(found.size===stages[stage-1].words.length){setTimeout(finish,650);}
  }else{
   $('wgMessage').textContent=match?'این واژه را قبلاً پیدا کرده‌ای.':'این واژه در جواب‌های این مرحله نیست؛ دوباره امتحان کن.';
   $('wgMessage').className='wg-message wrong';
   setTimeout(()=>{picked=[];drawPicked();},500);
  }
 }
 function hint(){
  if(locked||hints<=0)return;
  const next=stages[stage-1].words.find(w=>!found.has(w.key));
  if(!next)return;
  hints--;updateStats();
  $('wgMessage').textContent='راهنمایی: معنی یکی از واژه‌ها «'+next.fa+'» است.';
  $('wgMessage').className='wg-message';
 }
 function finish(){
  locked=true;
  saved.best[stage]=Math.max(saved.best[stage]||0,points);
  saved.total=(saved.total||0)+points;
  if(stage<20)saved.unlocked=Math.max(saved.unlocked,stage+1);
  persist();
  $('wgPlayScreen').hidden=true;$('wgDoneScreen').hidden=false;
  $('wgDoneTitle').textContent=stage===20?'آفرین! همهٔ مراحل را تمام کردی':'مرحلهٔ '+fa(stage)+' تمام شد';
  $('wgDoneText').textContent='همهٔ واژه‌ها را پیدا کردی و '+fa(points)+' امتیاز گرفتی.';
  $('wgNextBtn').textContent=stage===20?'دیدن مراحل':'مرحلهٔ بعد';
  $('wgNextBtn').onclick=()=>stage===20?stageScreen():start(stage+1);
 }
 $('wgBackBtn').addEventListener('click',stageScreen);
 $('wgUndoBtn').addEventListener('click',undo);
 $('wgSubmitBtn').addEventListener('click',submitWord);
 $('wgHintBtn').addEventListener('click',hint);
 $('wgLetterTray').addEventListener('click',e=>{const b=e.target.closest('.wg-letter');if(b)choose(Number(b.dataset.i));});
 fetch('./data/shushtari-dictionary.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('واژه‌نامه در دسترس نیست');return r.json();}).then(data=>{
  stages=makeStages(data.entries||[]);
  if(stages.length<20)throw Error('برای ساخت ۲۰ مرحله واژهٔ کافی پیدا نشد.');
  $('wgLoading').hidden=true;stageScreen();
 }).catch(err=>{$('wgLoading').textContent='بارگذاری بازی ناموفق بود؛ صفحه را تازه‌سازی کن.';console.error(err);});
})();