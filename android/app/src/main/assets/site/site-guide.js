(()=> {
'use strict';
if (window.__SJ_GUIDE_V3__) return;
window.__SJ_GUIDE_V3__ = true;

const steps = [
 {target:'#home',title:'به شوشترجوان خوش آمدی',text:'این صفحهٔ اصلی رسانه است. از نوار بالای سایت به بخش‌های مختلف برو و خبرها و مطالب تازه را ببین.'},
 {target:'#news',title:'آخرین اخبار شوشتر',text:'خبرها و گزارش‌های شهر در این قسمت نمایش داده می‌شوند.'},
 {target:'#heritage',title:'گنجینهٔ آثار تاریخی',text:'در این بخش با آثار تاریخی شوشتر، پیشینه، معماری و کارکرد آن‌ها آشنا می‌شوی.'},
 {target:'#ai-history',title:'دستیار تاریخ شوشتر',text:'پرسش‌هایت دربارهٔ تاریخ، آثار و فرهنگ شوشتر را در بخش دستیار بنویس.'},
 {target:'#dictionary',title:'واژه‌نامهٔ شوشتری',text:'واژه‌های فارسی و معادل‌های شوشتری را جست‌وجو کن.'},
 {target:'#word-game',title:'بازی واژه‌شناس',text:'با حروف هر مرحله واژه‌های شوشتری بساز و مرحله‌ها را کامل کن.'},
 {target:'#about',title:'دربارهٔ شوشترجوان',text:'داستان شکل‌گیری رسانه و راه‌های ارتباط با ما را در این قسمت بخوان.'}
];

let index=0, overlay=null, card=null, previousFocus=null;
const style=document.createElement('style');
style.textContent=`
#sj-guide-launch{position:fixed;z-index:9900;left:16px;bottom:18px;border:0;border-radius:999px;padding:11px 16px;background:#174b3b;color:#fff;font:700 14px Vazirmatn,Tahoma,sans-serif;box-shadow:0 5px 22px #0003;cursor:pointer}
#sj-guide-overlay{position:fixed;inset:0;z-index:9998;background:rgba(8,17,14,.72);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}
#sj-guide-card{width:min(520px,100%);max-height:80vh;overflow:auto;background:#fff;color:#17231e;border-radius:18px;padding:22px;box-shadow:0 15px 60px #0005;direction:rtl;text-align:right;font-family:Vazirmatn,Tahoma,sans-serif}
#sj-guide-card h3{margin:0 0 10px;font-size:20px;color:#174b3b}
#sj-guide-card p{margin:0 0 18px;line-height:2;font-size:14px}
#sj-guide-progress{font-size:12px;color:#64756c;margin-bottom:10px}
#sj-guide-actions{display:flex;gap:8px;flex-wrap:wrap}
#sj-guide-actions button{border:0;border-radius:10px;padding:10px 15px;font:700 13px Vazirmatn,Tahoma,sans-serif;cursor:pointer}
#sj-guide-next{background:#174b3b;color:#fff;flex:1}
#sj-guide-close,#sj-guide-prev{background:#edf1ee;color:#27372f}
#sj-guide-prev:disabled{opacity:.45;cursor:not-allowed}
`;
document.head.appendChild(style);

function close(){
 if(overlay) overlay.remove();
 overlay=null; card=null;
 if(previousFocus&&typeof previousFocus.focus==='function') previousFocus.focus();
 previousFocus=null;
}
function draw(){
 const step=steps[index], target=document.querySelector(step.target);
 if(target&&typeof target.scrollIntoView==='function') target.scrollIntoView({behavior:'smooth',block:'center'});
 card.replaceChildren();
 const progress=document.createElement('div');progress.id='sj-guide-progress';progress.textContent='راهنمای سایت · '+(index+1)+' از '+steps.length;
 const title=document.createElement('h3');title.textContent=step.title;
 const body=document.createElement('p');body.textContent=step.text;
 const actions=document.createElement('div');actions.id='sj-guide-actions';
 const prev=document.createElement('button');prev.id='sj-guide-prev';prev.textContent='قبلی';prev.disabled=index===0;
 prev.addEventListener('click',()=>{if(index>0){index--;draw();}});
 const stop=document.createElement('button');stop.id='sj-guide-close';stop.textContent='بستن';stop.addEventListener('click',close);
 const next=document.createElement('button');next.id='sj-guide-next';next.textContent=index===steps.length-1?'پایان':'مرحلهٔ بعد';
 next.addEventListener('click',()=>{if(index<steps.length-1){index++;draw();}else close();});
 actions.append(prev,stop,next);card.append(progress,title,body,actions);next.focus();
}
function start(){
 previousFocus=document.activeElement;index=0;
 if(!overlay){
  overlay=document.createElement('div');overlay.id='sj-guide-overlay';
  overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','راهنمای استفاده از سایت');
  card=document.createElement('div');card.id='sj-guide-card';overlay.appendChild(card);document.body.appendChild(overlay);
  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
 }
 draw();
}
function init(){
 if(document.getElementById('sj-guide-launch')) return;
 const launch=document.createElement('button');launch.id='sj-guide-launch';launch.type='button';
 launch.textContent='راهنمای سایت';launch.setAttribute('aria-haspopup','dialog');launch.addEventListener('click',start);
 document.body.appendChild(launch);
 // عمداً هیچ پنجره‌ای هنگام ورود خودکار باز نمی‌شود؛ فقط با لمس دکمهٔ راهنما.
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();