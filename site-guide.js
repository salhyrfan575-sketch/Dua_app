(()=>{
'use strict';
const KEY='shoushtarjavan_intro_seen_v1';
const steps=[
 {target:'#home',title:'به شوشترجوان خوش آمدی',text:'اینجا صفحهٔ اصلی رسانه است. از نوار بالای سایت می‌توانی به بخش‌های مختلف بروی و خبرها و مطالب تازه را ببینی.',action:'شروع آشنایی'},
 {target:'#news',title:'آخرین اخبار شوشتر',text:'خبرها و گزارش‌های شهر در این قسمت نمایش داده می‌شوند. برای ارسال سوژه یا خبر هم از دکمهٔ ارسال خبر استفاده کن.',action:'دیدن اخبار'},
 {target:'#heritage',title:'گنجینهٔ آثار تاریخی',text:'در این بخش با آثار تاریخی شوشتر، پیشینه، معماری و کارکرد آن‌ها آشنا می‌شوی.',action:'دیدن آثار تاریخی'},
 {target:'#ai-history',title:'هوش مصنوعی تاریخ شوشتر',text:'سؤالت را دربارهٔ تاریخ، آثار، فرهنگ و زندگی محلی شوشتر بنویس. دستیار ابتدا دانشنامهٔ اختصاصی شوشترجوان را بررسی می‌کند و در صورت امکان از سرویس آنلاین کمک می‌گیرد.',action:'آشنایی با دستیار'},
 {target:'#dictionary',title:'واژه‌نامهٔ شوشتری',text:'در این بخش می‌توانی واژهٔ فارسی را به شوشتری تبدیل کنی و معنی واژه‌های محلی را جست‌وجو کنی.',action:'دیدن واژه‌نامه'},
 {target:'#word-game',title:'بازی واژه‌شناس',text:'با حروفی که در هر مرحله می‌بینی، واژه‌های شوشتری بساز و مرحله‌ها را پشت سر بگذار.',action:'دیدن بازی'},
 {target:'#about',title:'دربارهٔ شوشترجوان و ارتباط',text:'داستان شکل‌گیری رسانه و راه‌های ارتباط با ما در این قسمت قرار دارد. هر زمان خواستی می‌توانی از دکمهٔ راهنمای سایت دوباره این آموزش را باز کنی.',action:'پایان آموزش'}
];
let index=0,overlay,card,spot;
const style=document.createElement('style');
style.textContent=`
#sj-guide-launch{position:fixed;z-index:9900;left:16px;bottom:18px;border:0;border-radius:999px;padding:12px 17px;background:#174b3b;color:#fff;font:700 14px inherit;box-shadow:0 5px 22px #0003;cursor:pointer}
#sj-guide-overlay{position:fixed;inset:0;z-index:9998;background:rgba(8,17,14,.72);display:flex;align-items:flex-end;justify-content:center;padding:18px;box-sizing:border-box}
#sj-guide-card{width:min(560px,100%);background:#fff;color:#17231e;border-radius:20px;padding:22px;box-shadow:0 15px 60px #0005;direction:rtl;font-family:inherit;position:relative}
#sj-guide-card h3{margin:0 0 10px;font-size:21px;color:#174b3b}
#sj-guide-card p{margin:0 0 18px;line-height:2;font-size:15px}
#sj-guide-progress{font-size:12px;color:#64756c;margin-bottom:10px}
#sj-guide-actions{display:flex;gap:9px;flex-wrap:wrap}
#sj-guide-actions button{border:0;border-radius:11px;padding:11px 16px;font:inherit;cursor:pointer}
#sj-guide-next{background:#174b3b;color:#fff;flex:1}
#sj-guide-skip{background:#edf1ee;color:#27372f}
#sj-guide-prev{background:#edf1ee;color:#27372f}
.sj-guide-focus{position:relative!important;z-index:9999!important;outline:3px solid #f0c45b!important;outline-offset:5px!important;border-radius:8px!important;scroll-margin-top:100px}
@media(min-width:700px){#sj-guide-overlay{align-items:center}#sj-guide-card{margin-top:25vh}}
`;
document.head.appendChild(style);
function clearFocus(){document.querySelectorAll('.sj-guide-focus').forEach(x=>x.classList.remove('sj-guide-focus'))}
function close(mark=true){clearFocus();overlay?.remove();overlay=null;if(mark)try{localStorage.setItem(KEY,'1')}catch(e){}}
function draw(){
 clearFocus();
 const step=steps[index],target=document.querySelector(step.target);
 if(target){target.classList.add('sj-guide-focus');target.scrollIntoView({behavior:'smooth',block:'center'});}
 card.innerHTML='<div id="sj-guide-progress">راهنمای شروع · '+(index+1)+' از '+steps.length+'</div><h3>'+step.title+'</h3><p>'+step.text+'</p><div id="sj-guide-actions"><button id="sj-guide-prev" '+(index===0?'disabled':'')+'>قبلی</button><button id="sj-guide-skip">رد کردن</button><button id="sj-guide-next">'+(index===steps.length-1?'پایان آموزش':'مرحلهٔ بعد')+'</button></div>';
 card.querySelector('#sj-guide-next').onclick=()=>{if(index<steps.length-1){index++;draw()}else close(true)};
 card.querySelector('#sj-guide-prev').onclick=()=>{if(index>0){index--;draw()}};
 card.querySelector('#sj-guide-skip').onclick=()=>close(true);
}
function start(){index=0;if(!overlay){overlay=document.createElement('div');overlay.id='sj-guide-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','راهنمای استفاده از سایت');card=document.createElement('div');card.id='sj-guide-card';overlay.appendChild(card);document.body.appendChild(overlay);}draw();}
function init(){
 const launch=document.createElement('button');launch.id='sj-guide-launch';launch.type='button';launch.textContent='راهنمای سایت';launch.addEventListener('click',start);document.body.appendChild(launch);
 let seen=false;try{seen=localStorage.getItem(KEY)==='1'}catch(e){}
 if(!seen)setTimeout(start,1100);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();