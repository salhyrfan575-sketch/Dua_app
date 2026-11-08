package ir.shoushtarjavan.app;

import android.app.*;
import android.os.*;
import android.content.*;
import android.graphics.*;
import android.graphics.drawable.*;
import android.net.Uri;
import android.view.*;
import android.view.inputmethod.InputMethodManager;
import android.webkit.*;
import android.widget.*;
import android.text.*;
import org.json.*;
import java.io.*;
import java.text.Normalizer;
import java.util.*;

public class MainActivity extends Activity {
    private static final int GREEN=Color.rgb(20,65,55), DEEP=Color.rgb(12,43,37), GOLD=Color.rgb(195,153,82);
    private static final int BG=Color.rgb(246,247,243), CARD=Color.WHITE, INK=Color.rgb(34,48,43), MUTED=Color.rgb(112,125,117);
    private static final String HOME="https://salhyrfan575-sketch.github.io/Dua_app/";
    private LinearLayout root, topBar, bottomBar;
    private FrameLayout contentFrame;
    private WebView web;
    private Typeface iranFont;
    private JSONArray words=new JSONArray(), articles=new JSONArray();
    private android.content.SharedPreferences prefs;
    private String pendingAnchor=null, currentPage="home";
    private int textScale=100;

    @Override public void onCreate(Bundle state){
        super.onCreate(state);
        getWindow().setStatusBarColor(DEEP);getWindow().setNavigationBarColor(DEEP);
        getWindow().getDecorView().setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        prefs=getSharedPreferences("sj-modern",MODE_PRIVATE);
        textScale=prefs.getInt("textScale",100);
        try{iranFont=Typeface.createFromAsset(getAssets(),"fonts/IRAmir.ttf");}catch(Exception ignored){iranFont=Typeface.create("sans-serif",Typeface.NORMAL);}
        loadData();buildShell();showHome();
    }
    private int dp(float n){return (int)(n*getResources().getDisplayMetrics().density+.5f);}
    private GradientDrawable shape(int color,int radius,int stroke){GradientDrawable d=new GradientDrawable();d.setColor(color);d.setCornerRadius(dp(radius));if(stroke!=0)d.setStroke(dp(1),stroke);return d;}
    private GradientDrawable gradient(int a,int b,int radius){GradientDrawable d=new GradientDrawable(GradientDrawable.Orientation.TL_BR,new int[]{a,b});d.setCornerRadius(dp(radius));return d;}
    private void loadData(){try{words=new JSONObject(asset("shushtari-dictionary.json")).getJSONArray("entries");JSONObject k=new JSONObject(asset("shushtar-knowledge.json"));articles=k.optJSONArray("documents");if(articles==null)articles=new JSONArray();try{JSONArray m=new JSONObject(asset("shushtar-monuments.json")).optJSONArray("documents");if(m!=null)for(int i=0;i<m.length();i++)articles.put(m.getJSONObject(i));}catch(Exception ignored){}}catch(Exception e){words=new JSONArray();articles=new JSONArray();}}
    private String asset(String name)throws Exception{InputStream in=getAssets().open(name);ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] b=new byte[8192];int n;while((n=in.read(b))>0)out.write(b,0,n);in.close();return out.toString("UTF-8");}
    private TextView label(String s,int size,int color,boolean bold){TextView t=new TextView(this);t.setText(s);t.setTextSize(size*textScale/100f);t.setTextColor(color);t.setGravity(Gravity.RIGHT|Gravity.CENTER_VERTICAL);t.setTextDirection(View.TEXT_DIRECTION_RTL);t.setTypeface(iranFont,bold?Typeface.BOLD:Typeface.NORMAL);t.setLineSpacing(dp(3),1f);return t;}
    private TextView centerLabel(String s,int size,int color,boolean bold){TextView t=label(s,size,color,bold);t.setGravity(Gravity.CENTER);return t;}
    private LinearLayout col(){LinearLayout l=new LinearLayout(this);l.setOrientation(LinearLayout.VERTICAL);return l;}
    private LinearLayout row(){LinearLayout l=new LinearLayout(this);l.setOrientation(LinearLayout.HORIZONTAL);l.setGravity(Gravity.CENTER_VERTICAL);return l;}
    private LinearLayout.LayoutParams lp(int w,int h){return new LinearLayout.LayoutParams(w<0?w:dp(w),h<0?h:dp(h));}
    private void buildShell(){
        root=col();root.setBackgroundColor(BG);
        topBar=row();topBar.setPadding(dp(18),dp(8),dp(18),dp(8));topBar.setBackgroundColor(Color.WHITE);
        LinearLayout brand=col();TextView name=label("شوشترجوان",21,GREEN,true);TextView sub=label("رسانه و دانشنامهٔ شهر ما",10,MUTED,false);brand.addView(name);brand.addView(sub);
        topBar.addView(brand,new LinearLayout.LayoutParams(0,-2,1));
        TextView logo=centerLabel("ش",22,Color.WHITE,true);logo.setBackground(gradient(GREEN,GOLD,14));topBar.addView(logo,lp(42,42));
        root.addView(topBar,lp(-1,64));
        contentFrame=new FrameLayout(this);root.addView(contentFrame,new LinearLayout.LayoutParams(-1,0,1));
        bottomBar=row();bottomBar.setPadding(dp(7),dp(6),dp(7),dp(7));bottomBar.setBackgroundColor(Color.WHITE);
        root.addView(bottomBar,lp(-1,66));setContentView(root);
    }
    private void nav(String selected){
        bottomBar.removeAllViews();
        String[][] items={{"home","⌂","خانه"},{"site","▤","سایت"},{"dictionary","آ","واژه‌ها"},{"saved","♡","نشان‌شده‌ها"}};
        for(String[] item:items){boolean active=item[0].equals(selected);LinearLayout b=col();b.setGravity(Gravity.CENTER);b.setPadding(dp(4),dp(3),dp(4),dp(3));TextView icon=centerLabel(item[1],20,active?GREEN:MUTED,true);TextView title=centerLabel(item[2],10,active?GREEN:MUTED,active);b.addView(icon);b.addView(title);if(active)b.setBackground(shape(Color.rgb(232,241,235),14,0));LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(0,-1,1);p.setMargins(dp(3),0,dp(3),0);bottomBar.addView(b,p);b.setOnClickListener(v->{switch(item[0]){case"home":showHome();break;case"site":openSite(null);break;case"dictionary":showDictionary();break;case"saved":showSaved();break;}});}
    }
    private void show(View v,String page,String nav){currentPage=page;contentFrame.removeAllViews();if(v.getParent() instanceof android.view.ViewGroup)((android.view.ViewGroup)v.getParent()).removeView(v);contentFrame.addView(v,new FrameLayout.LayoutParams(-1,-1));nav(nav);}
    private ScrollView scroll(LinearLayout[] out){ScrollView s=new ScrollView(this);s.setFillViewport(false);LinearLayout body=col();body.setPadding(dp(17),dp(17),dp(17),dp(25));s.addView(body);out[0]=body;return s;}
    private void sectionTitle(LinearLayout body,String title,String hint){TextView h=label(title,19,GREEN,true);h.setPadding(0,dp(15),0,dp(3));body.addView(h);if(hint!=null&&!hint.isEmpty()){TextView p=label(hint,12,MUTED,false);p.setPadding(0,0,0,dp(10));body.addView(p);}}
    private LinearLayout panel(LinearLayout body,int margin){LinearLayout c=col();c.setPadding(dp(15),dp(14),dp(15),dp(14));c.setBackground(shape(CARD,18,Color.rgb(232,235,229)));LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2);p.bottomMargin=dp(margin);body.addView(c,p);return c;}
    private void hero(LinearLayout body){LinearLayout h=col();h.setPadding(dp(20),dp(21),dp(20),dp(21));h.setBackground(gradient(DEEP,GREEN,24));LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2);p.bottomMargin=dp(18);body.addView(h,p);TextView tag=label("رسانهٔ مستقل فرهنگی شوشتر",11,Color.rgb(231,207,158),true);h.addView(tag);TextView title=label("شوشتر؛ روایتِ زندهٔ یک شهر",24,Color.WHITE,true);title.setPadding(0,dp(8),0,dp(5));h.addView(title);h.addView(label("خبر، تاریخ، زبان و فرهنگ شوشتر در یک همراه هوشمند.",13,Color.rgb(231,238,231),false));LinearLayout stats=row();stats.setPadding(0,dp(18),0,0);stats.addView(stat(words.length()+"+","واژهٔ محلی"),new LinearLayout.LayoutParams(0,-2,1));stats.addView(stat(articles.length()+"","مدخل دانشنامه"),new LinearLayout.LayoutParams(0,-2,1));h.addView(stats);}
    private LinearLayout stat(String value,String caption){LinearLayout l=col();l.addView(label(value,19,Color.WHITE,true));l.addView(label(caption,10,Color.rgb(222,232,222),false));return l;}
    private void showHome(){
        LinearLayout[] holder={null};ScrollView sc=scroll(holder);LinearLayout b=holder[0];hero(b);
        sectionTitle(b,"دسترسی سریع","هر بخش را با یک لمس باز کن");
        String[][] cards={{"اخبار و تیتر یک","خبرها و اطلاعیه‌های تازهٔ شهر","▤","news"},{"تولیدات اختصاصی","ویدئوها و محتوای اختصاصی رسانه","▶","exclusive"},{"دستیار تاریخ شوشتر","پرسش و پاسخ دربارهٔ تاریخ و فرهنگ شهر","✦","ai-history"},{"واژه‌شناس شوشتری","جست‌وجوی فارسی و شوشتری در واژه‌نامه","آ","dictionary"},{"بازی آ شیخ","۲۰ مرحلهٔ واژه‌سازی با حروف شوشتری","♟","word-game"},{"آثار تاریخی شوشتر","آشنایی با سازه‌ها و میراث جهانی شهر","⌂","heritage"},{"دانشنامهٔ آفلاین","جست‌وجو در تاریخ و فرهنگ ذخیره‌شده","◈","offline-history"},{"مشاغل و فرهنگ","حرفه‌ها، آداب و فرهنگ بومی","◇","professions"},{"راهنمای استفاده","آشنایی با بخش‌های سایت و برنامه","؟","guide"}};
        for(int i=0;i<cards.length;i+=2){LinearLayout r=row();b.addView(r);for(int j=i;j<Math.min(i+2,cards.length);j++){final String anchor=cards[j][3];LinearLayout c=col();c.setPadding(dp(13),dp(13),dp(13),dp(13));c.setBackground(shape(Color.WHITE,17,Color.rgb(230,235,228)));LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(0,dp(128),1);p.setMargins(dp(3),dp(4),dp(3),dp(4));r.addView(c,p);TextView ic=centerLabel(cards[j][2],21,GREEN,true);ic.setBackground(shape(Color.rgb(232,241,235),13,0));c.addView(ic,lp(38,38));TextView t=label(cards[j][0],14,GREEN,true);t.setPadding(0,dp(8),0,dp(2));c.addView(t);c.addView(label(cards[j][1],10,MUTED,false));c.setOnClickListener(v->{if(anchor.equals("dictionary"))showDictionary();else if(anchor.equals("guide"))showGuide();else if(anchor.equals("offline-history"))showHistory();else openSite(anchor);});}}
        sectionTitle(b,"دانش آفلاین","برای استفاده از این بخش‌ها به اینترنت نیاز نداری");
        LinearLayout offline=panel(b,12);offline.addView(label("واژه‌نامه و دانشنامه در خود برنامه ذخیره شده‌اند.",13,INK,true));offline.addView(label("در سفر، خارج از پوشش اینترنت یا حالت پرواز هم می‌توانی آن‌ها را بخوانی.",11,MUTED,false));
        LinearLayout foot=panel(b,0);foot.addView(label("دربارهٔ شوشترجوان",14,GREEN,true));foot.addView(label("رسانه‌ای مردمی برای روایت تاریخ، فرهنگ و مسائل شهر شوشتر.",12,MUTED,false));TextView about=label("درباره ما و راه‌های ارتباطی ←",12,GREEN,true);about.setPadding(0,dp(10),0,0);foot.addView(about);foot.setOnClickListener(v->openSite("about"));
        show(sc,"home","home");
    }
    private void showDictionary(){
        LinearLayout[] holder={null};ScrollView sc=scroll(holder);LinearLayout b=holder[0];sectionTitle(b,"واژه‌شناس شوشتری","جست‌وجو در واژه‌نامهٔ آفلاین • "+words.length()+" مدخل");
        EditText input=edit("واژهٔ فارسی یا شوشتری را بنویس…");b.addView(input,lp(-1,52));LinearLayout results=col();LinearLayout.LayoutParams rp=new LinearLayout.LayoutParams(-1,-2);rp.topMargin=dp(13);b.addView(results,rp);
        input.addTextChangedListener(new TextWatcher(){public void beforeTextChanged(CharSequence s,int st,int c,int a){}public void onTextChanged(CharSequence s,int st,int before,int count){renderWords(results,s.toString());}public void afterTextChanged(Editable e){}});
        renderWords(results,"");show(sc,"dictionary","dictionary");
    }
    private EditText edit(String hint){EditText e=new EditText(this);e.setSingleLine(true);e.setTextSize(15);e.setTextColor(INK);e.setHintTextColor(MUTED);e.setHint(hint);e.setTypeface(iranFont);e.setTextDirection(View.TEXT_DIRECTION_RTL);e.setPadding(dp(15),dp(7),dp(15),dp(7));e.setBackground(shape(Color.WHITE,15,Color.rgb(224,229,221)));return e;}
    private String norm(String s){return Normalizer.normalize(s==null?"":s,Normalizer.Form.NFD).replaceAll("[\\u0640\\u064B-\\u065F\\u0670]","").replace('ي','ی').replace('ى','ی').replace('ك','ک').replace('ۀ','ه').replace('ة','ه').replace('‌',' ').toLowerCase(Locale.ROOT).replaceAll("[^\\p{L}\\p{N} ]"," ").replaceAll("\\s+"," ").trim();}
    private void renderWords(LinearLayout target,String query){target.removeAllViews();String q=norm(query);int n=0;for(int i=0;i<words.length()&&n<80;i++){JSONObject w=words.optJSONObject(i);if(w==null)continue;String fa=w.optString("persian"),sh=w.optString("shushtari"),note=w.optString("note"),cat=w.optString("category");if(q.isEmpty()||norm(fa+" "+sh+" "+note+" "+cat).contains(q)){entry(target,sh,fa+(cat.isEmpty()?"":"  •  "+cat),note,()->showWordDialog(sh,fa,note));n++;}}if(n==0)empty(target,"واژه‌ای پیدا نشد؛ املای دیگری را امتحان کن.");}
    private void showWordDialog(String sh,String fa,String note){new AlertDialog.Builder(this).setTitle(sh).setMessage(fa+(note.isEmpty()?"":"\n\n"+note)).setPositiveButton("ذخیره", (d,w)->save(sh+" — "+fa)).setNeutralButton("اشتراک‌گذاری",(d,w)->share(sh+" — "+fa+"\n"+note)).setNegativeButton("بستن",null).show();}
    private void showHistory(){LinearLayout[] holder={null};ScrollView sc=scroll(holder);LinearLayout b=holder[0];sectionTitle(b,"دانشنامهٔ شوشتر","تاریخ، آثار، فرهنگ و روایت‌های محلی • "+articles.length()+" مدخل");
        EditText input=edit("نام اثر، محله یا موضوع را جست‌وجو کن…");b.addView(input,lp(-1,52));LinearLayout results=col();b.addView(results);input.addTextChangedListener(new TextWatcher(){public void beforeTextChanged(CharSequence s,int st,int c,int a){}public void onTextChanged(CharSequence s,int st,int before,int count){renderArticles(results,s.toString());}public void afterTextChanged(Editable e){}});renderArticles(results,"");show(sc,"history","site");}
    private void renderArticles(LinearLayout target,String query){target.removeAllViews();String q=norm(query);int n=0;for(int i=0;i<articles.length()&&n<90;i++){JSONObject a=articles.optJSONObject(i);if(a==null)continue;String title=a.optString("title",a.optString("name","مدخل تاریخی")),content=a.optString("content",a.optString("description",a.optString("summary",""))),cat=a.optString("category","تاریخ و فرهنگ"),keys=a.optJSONArray("keywords")==null?"":a.optJSONArray("keywords").toString();if(q.isEmpty()||norm(title+" "+content+" "+cat+" "+keys).contains(q)){String excerpt=content.length()>190?content.substring(0,190)+"…":content;entry(target,title,cat,excerpt,()->new AlertDialog.Builder(this).setTitle(title).setMessage(content).setPositiveButton("ذخیره",(d,w)->save(title)).setNeutralButton("اشتراک",(d,w)->share(title+"\n"+content)).setNegativeButton("بستن",null).show());n++;}}if(n==0)empty(target,"مطلبی با این عبارت پیدا نشد.");}
    private void entry(LinearLayout target,String title,String subtitle,String detail,Runnable click){LinearLayout c=col();c.setPadding(dp(14),dp(12),dp(14),dp(12));c.setBackground(shape(Color.WHITE,15,Color.rgb(231,235,228)));LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2);p.bottomMargin=dp(8);target.addView(c,p);c.addView(label(title,16,GREEN,true));if(!subtitle.isEmpty()){TextView st=label(subtitle,11,GOLD,true);st.setPadding(0,dp(3),0,dp(2));c.addView(st);}if(!detail.isEmpty())c.addView(label(detail,12,MUTED,false));c.setOnClickListener(v->click.run());}
    private void showGuide(){LinearLayout[] holder={null};ScrollView sc=scroll(holder);LinearLayout b=holder[0];sectionTitle(b,"راهنمای شوشترجوان","راهنمای سریع استفاده از برنامه و سایت");String[][] qs={{"خبرها را از کجا بخوانم؟","از کارت «اخبار و تیتر یک» در خانه وارد سایت شو؛ آخرین خبرها، تولیدات اختصاصی و بخش‌های فرهنگی آنجا هستند."},{"چطور واژهٔ شوشتری پیدا کنم؟","بخش واژه‌شناس را باز کن و واژهٔ فارسی یا صورت شوشتری آن را جست‌وجو کن. واژه‌نامه در خود برنامه ذخیره شده است."},{"بازی آ شیخ کجاست؟","در صفحهٔ اصلی کارت بازی آ شیخ را انتخاب کن. مراحل اول آسان‌اند و مرحله‌های ۱۰ و ۲۰ چالش ویژه‌اند."},{"چطور آثار تاریخی را ببینم؟","از کارت آثار تاریخی وارد سایت شو؛ یا از دانشنامهٔ آفلاین، نام اثر را جست‌وجو کن."},{"کدام بخش‌ها آفلاین‌اند؟","واژه‌شناس و دانشنامهٔ داخلی بدون اینترنت در دسترس‌اند. خبرهای تازه و دستیار آنلاین به اتصال اینترنت نیاز دارند."}};for(String[] q:qs){LinearLayout c=panel(b,9);c.addView(label(q[0],14,GREEN,true));TextView answer=label(q[1],12,INK,false);answer.setVisibility(View.GONE);answer.setPadding(0,dp(9),0,0);c.addView(answer);c.setOnClickListener(v->answer.setVisibility(answer.getVisibility()==View.VISIBLE?View.GONE:View.VISIBLE));}show(sc,"guide","home");}
    private void showSaved(){LinearLayout[] holder={null};ScrollView sc=scroll(holder);LinearLayout b=holder[0];sectionTitle(b,"نشان‌شده‌ها","واژه‌ها و مدخل‌هایی که ذخیره کرده‌ای");JSONArray a;try{a=new JSONArray(prefs.getString("saved","[]"));}catch(Exception e){a=new JSONArray();}if(a.length()==0)empty(b,"هنوز چیزی ذخیره نکرده‌ای. در واژه‌نامه یا دانشنامه روی یک مورد بزن و ذخیره‌اش کن.");for(int i=0;i<a.length();i++){String value=a.optString(i);entry(b,value,"ذخیره‌شده در این دستگاه","",()->new AlertDialog.Builder(this).setMessage(value).setPositiveButton("اشتراک",(d,w)->share(value)).setNegativeButton("بستن",null).show());}show(sc,"saved","saved");}
    private void save(String value){JSONArray a;try{a=new JSONArray(prefs.getString("saved","[]"));}catch(Exception e){a=new JSONArray();}for(int i=0;i<a.length();i++)if(value.equals(a.optString(i))){Toast.makeText(this,"قبلاً ذخیره شده است",Toast.LENGTH_SHORT).show();return;}a.put(value);prefs.edit().putString("saved",a.toString()).apply();Toast.makeText(this,"به نشان‌شده‌ها اضافه شد",Toast.LENGTH_SHORT).show();}
    private void empty(LinearLayout b,String message){TextView t=centerLabel(message,13,MUTED,false);t.setPadding(dp(15),dp(24),dp(15),dp(24));b.addView(t);}
    private void share(String s){Intent i=new Intent(Intent.ACTION_SEND);i.setType("text/plain");i.putExtra(Intent.EXTRA_TEXT,s);startActivity(Intent.createChooser(i,"اشتراک‌گذاری"));}
    private void openSite(String anchor){
        pendingAnchor=anchor;
        if(web==null){web=new WebView(this);web.setBackgroundColor(Color.WHITE);WebSettings st=web.getSettings();st.setJavaScriptEnabled(true);st.setDomStorageEnabled(true);st.setDatabaseEnabled(true);st.setLoadsImagesAutomatically(true);st.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);st.setSupportZoom(false);st.setBuiltInZoomControls(false);web.setWebViewClient(new WebViewClient(){
            @Override public void onPageFinished(WebView view,String url){injectFont(view);if(pendingAnchor!=null){String a=pendingAnchor;pendingAnchor=null;view.evaluateJavascript("(function(){var e=document.getElementById('"+a+"');if(e){e.scrollIntoView({behavior:'smooth',block:'start'});}else{window.scrollTo(0,0);}})();",null);}}
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){Uri u=request.getUrl();if("http".equals(u.getScheme())||"https".equals(u.getScheme())){String host=u.getHost();if(host!=null&&!host.endsWith("github.io")&&!host.equals("eitaa.com")&&!host.equals("instagram.com")&&!host.equals("aparat.com")){try{startActivity(new Intent(Intent.ACTION_VIEW,u));}catch(Exception ignored){}return true;}}return false;}
            @Override public void onReceivedError(WebView view,WebResourceRequest request,WebResourceError error){if(request.isForMainFrame())Toast.makeText(MainActivity.this,"برای نمایش محتوای زنده سایت، اتصال اینترنت را بررسی کن.",Toast.LENGTH_LONG).show();}
        });web.setDownloadListener((url,ua,cd,mime,len)->{try{startActivity(new Intent(Intent.ACTION_VIEW,Uri.parse(url)));}catch(Exception ignored){}});}
        show(web,"site","site");
        if(web.getUrl()==null||!web.getUrl().startsWith(HOME)){web.loadUrl(HOME);}else if(anchor!=null){String a=anchor;pendingAnchor=null;web.evaluateJavascript("(function(){var e=document.getElementById('"+a+"');if(e)e.scrollIntoView({behavior:'smooth',block:'start'});})();",null);}
    }
    private void injectFont(WebView view){try{InputStream in=getAssets().open("fonts/IRAmir.ttf");ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] buf=new byte[8192];int n;while((n=in.read(buf))>0)out.write(buf,0,n);in.close();String base=android.util.Base64.encodeToString(out.toByteArray(),android.util.Base64.NO_WRAP);String css="@font-face{font-family:IRAmir;src:url(data:font/ttf;base64,"+base+") format('truetype');font-weight:100 900}html,body,button,input,textarea,select,*{font-family:IRAmir,Tahoma,sans-serif!important}";String js="(function(){var s=document.getElementById('sj-app-font');if(!s){s=document.createElement('style');s.id='sj-app-font';document.head.appendChild(s);}s.textContent="+JSONObject.quote(css)+";})();";view.evaluateJavascript(js,null);}catch(Exception ignored){}}
    @Override public void onBackPressed(){if(web!=null&&web.getParent()!=null&&web.canGoBack()){web.goBack();return;}if(!"home".equals(currentPage)){showHome();return;}super.onBackPressed();}
}