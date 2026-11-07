/* Shoushtar Javan — 20-stage Shushtari word puzzle */
(()=>{
 const root=document.getElementById('shushtariGame');
 if(!root)return;
 const $=id=>root.querySelector('#'+id);
 const norm=s=>String(s||'').toLocaleLowerCase('fa')
  .replace(/[\\u064b-\\u065f\\u0670\\u0640]/g,'')
  .replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[ۀة]/g,'ه')
  .replace(/[ؤ]/g,'و').replace(/[أإ]/g,'ا')
  .replace(/\\([^)]*\\)/g,'')
  .replace(/[^\\p{L}\\p{N}]/gu,'');
 const cleanWord=s=>String(s||'').replace(/\\([^)]*\\)/g,'').replace(/[\\u064b-\\u065f\\u0670\\u0640]/g,'').trim();
 const shuffle=a=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;};
 const stateKey='shoushtarjavan_wordgame_v1';
 let saved={unlocked:1,best:{},total:0};
 try{saved={...saved,...JSON.parse(localStorage.getItem(stateKey)||'{}')};}catch(_){}
 let stages=[],stage=1,question=0,selected=[],tiles=[],mistakes=0,hints=2,score=0,locked=false;
 const stageGrid=$('wgStages'),board=$('wgBoard'),status=$('wgStatus');
 const persist=()=>{try{localStorage.setItem(stateKey,JSON.stringify(saved));}catch(_){}};
 const fa=n=>Number(n).toLocaleString('fa-IR');
 function showStages(){
  $('wgStageScreen').hidden=false;$('wgPlayScreen').hidden=true;$('wgDoneScreen').hidden=true;
  stageGrid.replaceChildren();
  for(let i=1;i<=20;i++){
   const b=document.createElement('button');b.type='button';b.className='wg-stage'+(i<=saved.unlocked?'':' locked');
   b.disabled=i>saved.unlocked;b.innerHTML='<strong>'+fa(i)+'</strong><small>'+(saved.best[i]!==undefined?'★ '+fa(saved.best[i]):i<=saved.unlocked?'شروع':'قفل')+'</small>';
   b.addEventListener('click',()=>startStage(i));stageGrid.appendChild(b);
  }
  $('wgProgress').textContent=fa(Math.max(0,saved.unlocked-1))+' از ۲۰ مرحله باز شده';
  $('wgTotal').textContent='امتیاز کل: '+fa(saved.total||0);
 }
 function startStage(n){
  stage=n;question=0;mistakes=0;hints=2;score=0;locked=false;
  $('wgStageScreen').hidden=true;$('wgDoneScreen').hidden=true;$('wgPlayScreen').hidden=false;
  renderQuestion();
 }
 function renderQuestion(){
  locked=false;selected=[];const item=stages[(stage-1)*5+question];
  const answer=norm(cleanWord(item.shushtari));
  tiles=shuffle(Array.from(answer).map((letter,i)=>({letter,id:i})));
  $('wgStageLabel').textContent='مرحله '+fa(stage)+' از ۲۰';
  $('wgQuestionLabel').textContent='واژه '+fa(question+1)+' از ۵';
  $('wgMeaning').textContent=item.persian;
  $('wgShushtariHint').textContent='این واژه در شوشتری چه شکلی دارد؟';
  $('wgMistakes').textContent='اشتباه‌ها: '+fa(mistakes)+' / ۳';
  $('wgHints').textContent='راهنما: '+fa(hints);
  $('wgScore').textContent='امتیاز: '+fa(score);
  const slots=$('wgAnswer');slots.replaceChildren();
  tiles.forEach((_,i)=>{const s=document.createElement('span');s.className='wg-slot';s.dataset.index=i;s.textContent='';slots.appendChild(s);});
  const tray=$('wgTiles');tray.replaceChildren();
  tiles.forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.className='wg-tile';b.textContent=t.letter;b.dataset.index=i;b.addEventListener('click',()=>pick(i));tray.appendChild(b);});
  $('wgFeedback').textContent='حروف را به ترتیب کنار هم بچین.';
  $('wgFeedback').className='wg-feedback';
  $('wgHintBtn').disabled=hints<=0;
  status.textContent='بازی واژه‌شناس شوشتری';
 }
 function pick(i){
  if(locked)return;
  const btn=$('wgTiles').querySelector('[data-index="'+i+'"]');
  if(!btn||btn.disabled)return;
  const slotIndex=selected.length;if(slotIndex>=tiles.length)return;
  selected.push(i);btn.disabled=true;
  const slot=$('wgAnswer').children[slotIndex];slot.textContent=tiles[i].letter;slot.classList.add('filled');
  if(selected.length===tiles.length)checkAnswer();
 }
 function undo(){
  if(locked||!selected.length)return;
  const i=selected.pop(),btn=$('wgTiles').querySelector('[data-index="'+i+'"]');if(btn)btn.disabled=false;
  const slot=$('wgAnswer').children[selected.length];slot.textContent='';slot.classList.remove('filled');
 }
 function checkAnswer(){
  const item=stages[(stage-1)*5+question],guess=selected.map(i=>tiles[i].letter).join('');
  if(guess===norm(cleanWord(item.shushtari))){
   locked=true;score+=Math.max(5,20-mistakes*5);$('wgFeedback').textContent='درست است! آفرین؛ '+cleanWord(item.shushtari);$('wgFeedback').className='wg-feedback good';
   $('wgScore').textContent='امتیاز: '+fa(score);
   setTimeout(()=>{question++;if(question===5)finishStage();else renderQuestion();},850);
  }else{
   mistakes++;$('wgMistakes').textContent='اشتباه‌ها: '+fa(mistakes)+' / ۳';
   $('wgFeedback').textContent=mistakes>=3?'سه بار اشتباه شد؛ پاسخ را دوباره مرتب کن.':'ترتیب حروف درست نیست؛ دوباره تلاش کن.';
   $('wgFeedback').className='wg-feedback bad';
   if(mistakes>=3){locked=true;setTimeout(()=>{mistakes=0;renderQuestion();},1100);}
   else setTimeout(()=>{selected.forEach(i=>{const b=$('wgTiles').querySelector('[data-index="'+i+'"]');if(b)b.disabled=false;});selected=[];[...$('wgAnswer').children].forEach(s=>{s.textContent='';s.classList.remove('filled');});},650);
  }
 }
 function hint(){
  if(locked||hints<=0)return;
  const item=stages[(stage-1)*5+question],answer=norm(cleanWord(item.shushtari));
  hints--;$('wgHints').textContent='راهنما: '+fa(hints);$('wgHintBtn').disabled=hints<=0;
  const next=answer[selected.length];
  const match=tiles.findIndex((t,i)=>t.letter===next&&!selected.includes(i));
  if(match>=0)pick(match);
 }
 function finishStage(){
  const previous=saved.best[stage]||0;saved.best[stage]=Math.max(previous,score);
  saved.total=(saved.total||0)+score;
  if(stage<20)saved.unlocked=Math.max(saved.unlocked,stage+1);
  persist();$('wgPlayScreen').hidden=true;$('wgDoneScreen').hidden=false;
  $('wgDoneTitle').textContent=stage===20?'همه مراحل را تمام کردی!':'مرحله '+fa(stage)+' تمام شد!';
  $('wgDoneText').textContent='امتیاز این مرحله: '+fa(score)+' از ۱۰۰ · '+(stage===20?'قهرمان واژه‌شناس شوشتری شدی.':'مرحله بعدی برایت باز شد.');
  $('wgNextBtn').textContent=stage===20?'بازگشت به مراحل':'رفتن به مرحله بعد';
  $('wgNextBtn').onclick=()=>stage===20?showStages():startStage(stage+1);
 }
 $('wgBackBtn').addEventListener('click',showStages);
 $('wgUndoBtn').addEventListener('click',undo);
 $('wgHintBtn').addEventListener('click',hint);
 $('wgClearBtn').addEventListener('click',()=>{if(!locked){selected.forEach(i=>{const b=$('wgTiles').querySelector('[data-index="'+i+'"]');if(b)b.disabled=false;});selected=[];[...$('wgAnswer').children].forEach(s=>{s.textContent='';s.classList.remove('filled');});}});
 $('wgNextBtn').onclick=showStages;
 fetch('./data/shushtari-dictionary.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('واژه‌نامه بارگذاری نشد');return r.json();}).then(data=>{
  const seen=new Set(),pool=(data.entries||[]).filter(x=>x&&x.persian&&x.shushtari).map(x=>({...x,word:cleanWord(x.shushtari),key:norm(cleanWord(x.shushtari))}))
   .filter(x=>x.key.length>=3&&x.key.length<=11&&x.word&&x.persian.length<45&&!seen.has(x.key)&&seen.add(x.key));
  if(pool.length<100)throw Error('تعداد واژه‌های مناسب برای بازی کافی نیست');
  // Evenly sample the existing dictionary so the 20 stages cover its breadth.
  const chosen=Array.from({length:100},(_,i)=>pool[Math.floor(i*(pool.length-1)/99)]);
  stages=chosen.map(x=>({persian:x.persian,shushtari:x.shushtari}));
  $('wgLoading').hidden=true;$('wgStageScreen').hidden=false;showStages();
 }).catch(err=>{ $('wgLoading').textContent='بارگذاری واژه‌ها ناموفق بود. صفحه را تازه‌سازی کن.';console.error('Shushtari game:',err);});
})();