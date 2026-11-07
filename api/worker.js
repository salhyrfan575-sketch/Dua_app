const MODEL = "gemini-3.8-flash";
const CORPUS_URL = "https://raw.githubusercontent.com/salhyrfan575-sketch/Dua_app/main/data/assistant-corpus.json";
const MONUMENTS_URL = "https://raw.githubusercontent.com/salhyrfan575-sketch/Dua_app/main/data/shushtar-monuments.json";
const SITE_ORIGIN = "https://salhyrfan575-sketch.github.io";
const cors = () => ({ "Access-Control-Allow-Origin": SITE_ORIGIN, "Access-Control-Allow-Methods": "POST, OPTIONS, GET", "Access-Control-Allow-Headers": "Content-Type", "Vary": "Origin" });
const json = (data, status=200) => new Response(JSON.stringify(data), {status, headers:{"Content-Type":"application/json; charset=utf-8", ...cors()}});
function norm(s=""){return String(s).toLowerCase().replace(/[يى]/g,"ی").replace(/ك/g,"ک").replace(/[ۀة]/g,"ه").replace(/[\u064B-\u065F\u0670]/g,"").replace(/[\u200c\u200f\u200e]/g," ").replace(/[؟?!،؛,:.()\[\]{}«»"'ـ]/g," ").replace(/\s+/g," ").trim()}
const STOP=new Set("چی چیه چه چطور چگونه درباره برای است هست بود شده می از به در را این آن های یک رو و قدیم قدیما چطوری کردن کردند میکردن میکنند شود شدن معنی مفهوم بگو توضیح دارد داره".split(" "));
function tokens(s){return norm(s).split(" ").filter(x=>x.length>1&&!STOP.has(x))}
function rank(doc,qt){const title=new Set(tokens(doc.title||"")),keys=new Set(tokens([...(Array.isArray(doc.keywords)?doc.keywords:[]),doc.persian||"",doc.shushtari||""].join(" "))),cat=new Set(tokens(doc.category||"")),body=new Set(tokens(doc.content||""));let n=0;for(const t of qt){if(title.has(t))n+=12;if(keys.has(t))n+=9;if(cat.has(t))n+=3;if(body.has(t))n++}const q=qt.join(" ");if(q.length>5&&norm(doc.title||"").includes(q))n+=18;return n}
async function loadDocs(){const [a,b]=await Promise.all([fetch(CORPUS_URL),fetch(MONUMENTS_URL)]);if(!a.ok)throw Error("دانشنامه شوشترجوان در دسترس نیست.");const c=await a.json();if(!Array.isArray(c.documents))throw Error("ساختار دانشنامه معتبر نیست.");if(b.ok){const m=await b.json();if(Array.isArray(m.documents))c.documents.push(...m.documents)}return c.documents}
export default {async fetch(request,env){
 if(request.method==="OPTIONS")return new Response(null,{headers:cors()});
 if(request.method==="GET")return json({ok:true,service:"Shoushtar Javan AI Assistant",model:MODEL});
 if(request.method!=="POST")return json({error:"Method not allowed"},405);
 if(!env.GEMINI_API_KEY)return json({error:"سرویس هنوز کلید امن ندارد."},503);
 try{
  const body=await request.json(),question=String(body.question||"").trim().slice(0,1200);
  if(!question)return json({error:"پرسش خالی است."},400);
  const docs=await loadDocs(),qt=tokens(question);
  const matches=docs.map(doc=>({doc,score:rank(doc,qt)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,7);
  const context=matches.map((x,i)=>{const d=x.doc;return "["+(i+1)+"] "+(d.title||"بدون عنوان")+"\nنوع: "+(d.sourceType||d.category||"دانشنامه")+"\nمحتوا: "+String(d.content||"").slice(0,4000)+"\nمنابع: "+JSON.stringify(d.sources||[])}).join("\n\n---\n\n").slice(0,22000);
  const system="تو دستیار هوشمند رسانه شوشترجوان هستی؛ فارسی‌زبان و مسلط به گفتار محاوره‌ای فارسی و فرهنگ شوشتر. غلط تایپی و جمله‌بندی شکسته را بفهم و کاربر را بابت آن اصلاح نکن. پرسش را با اسناد زیر پاسخ بده؛ اسناد مرتبط را ترکیب کن و متن یک سند را صرفاً کپی نکن. هیچ تاریخ، نام، نقل‌قول یا جزئیات تاریخی نساز. اگر سند کافی نیست صریح بگو اطلاعات کافی در منابع فعلی پیدا نشد و حدس را واقعیت جلوه نده. پرسش عمومی غیرمرتبط با شوشتر را می‌توانی از دانش عمومی پاسخ بدهی و روشن کن که از دانشنامه نیست. پاسخ طبیعی، روان، متین و مختصر اما کامل باشد. در اختلاف روایت‌ها اختلاف را توضیح بده. در پایان، در صورت وجود، منابع مرتبط را نام ببر.\n\nاسناد بازیابی‌شده:\n"+(context||"سند مرتبطی در دانشنامه پیدا نشد.");
  const history=Array.isArray(body.history)?body.history.slice(-8).map(m=>({role:m.role==="model"?"model":"user",parts:[{text:String(m.text||"").slice(0,1500)}]})):[];
  const api=await fetch("https://generativelanguage.googleapis.com/v1beta/models/"+MODEL+":generateContent",{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":env.GEMINI_API_KEY},body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:[...history,{role:"user",parts:[{text:question}]}],generationConfig:{temperature:.35,topP:.9,maxOutputTokens:900}})});
  const data=await api.json();if(!api.ok){console.error("Gemini API",api.status,JSON.stringify(data).slice(0,1000));return json({error:"ارتباط با مدل هوش مصنوعی برقرار نشد."},502)}
  const answer=(data.candidates||[]).flatMap(c=>c.content?.parts||[]).map(p=>p.text||"").join("").trim();if(!answer)return json({error:"پاسخ معتبری از مدل دریافت نشد."},502);
  const sources=[...new Map(matches.flatMap(x=>Array.isArray(x.doc.sources)?x.doc.sources:[]).filter(s=>s?.url).map(s=>[s.url,s])).values()].slice(0,6);
  return json({answer,sources,matched:matches.length});
 }catch(e){console.error(e);return json({error:e.message||"خطای داخلی سرویس."},500)}
}};
