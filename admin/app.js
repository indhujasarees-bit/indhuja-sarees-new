const C=window.INDHUJA_CONFIG;let db,products=[];const $=id=>document.getElementById(id);function init(){if(!C?.SUPABASE_URL||!C?.SUPABASE_KEY){$("msg").textContent="Update config.js";return false}db=supabase.createClient(C.SUPABASE_URL,C.SUPABASE_KEY);return true}function state(login){$("login").hidden=!login;$("app").hidden=login}$("loginBtn").onclick=async()=>{if(!init())return;const {error}=await db.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});if(error)return $("msg").textContent=error.message;state(false);load()};$("logout").onclick=async()=>{await db.auth.signOut();state(true)};async function load(){const {data,error}=await db.from("products").select("*,collections(id,name)").order("created_at",{ascending:false});if(error)return $("list").textContent=error.message;products=data||[];const {data:cs}=await db.from("collections").select("*").eq("is_active",true).order("sort_order");const cats=cs||[];const html='<option value="">Select collection</option>'+cats.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("");$("category").innerHTML=$("bulkCollection").innerHTML=html;$("total").textContent=products.length;$("active").textContent=products.filter(x=>x.is_active).length;$("collectionsCount").textContent=cats.length;$("cats").innerHTML=cats.map(c=>`<div class="cat"><span><b>${esc(c.name)}</b> (${products.filter(x=>x.collection_id===c.id).length})</span><button onclick="renameCat('${c.id}','${esc(c.name)}')">RENAME</button></div>`).join("");render(products)}function render(a){$("list").innerHTML=a.map(x=>`<div class="item"><img src="${esc(x.image_url)}"><div><b>${esc(x.name)}</b><small>${esc(x.code)} · ${esc(x.collections?.name||"")} · ₹${x.price}</small></div><div class="actions"><button onclick='edit(${JSON.stringify(x)})'>EDIT</button><button onclick="toggle('${x.id}',${x.is_active})">${x.is_active?"HIDE":"SHOW"}</button></div></div>`).join("")||"No sarees yet."}window.edit=x=>{$("editid").value=x.id;$("code").value=x.code;$("pname").value=x.name;$("category").value=x.collection_id;$("price").value=x.price;$("desc").value=x.description||"";scrollTo({top:350,behavior:"smooth"})};window.toggle=async(id,s)=>{const {error}=await db.from("products").update({is_active:!s}).eq("id",id);if(error)alert(error.message);else load()};window.renameCat=async(id,old)=>{const n=prompt("New collection name",old);if(!n||n.trim()===old)return;const {error}=await db.from("collections").update({name:n.trim()}).eq("id",id);if(error)alert(error.message);else load()};$("addcat").onclick=async()=>{const n=$("newcat").value.trim();if(!n)return;const {error}=await db.from("collections").insert({name:n,sort_order:Date.now()});if(error)alert(error.message);else{$("newcat").value="";load()}};$("clear").onclick=()=>["editid","code","pname","price","desc","photo"].forEach(id=>{if($(id))$(id).value=""});$("save").onclick=async()=>{const id=$("editid").value,code=$("code").value.trim(),name=$("pname").value.trim(),cid=$("category").value,price=Number($("price").value),desc=$("desc").value.trim();if(!code||!name||!cid||!price)return alert("Fill code, name, collection, price");let image_url="";const f=$("photo").files[0];if(f){const path=Date.now()+"-"+f.name.replace(/[^a-zA-Z0-9._-]/g,"-"),u=await db.storage.from("sarees").upload(path,f);if(u.error)return alert(u.error.message);image_url=db.storage.from("sarees").getPublicUrl(path).data.publicUrl}const row={code,name,collection_id:cid,price,description:desc};if(image_url)row.image_url=image_url;const r=id?await db.from("products").update(row).eq("id",id):await db.from("products").insert(row);if(r.error)alert(r.error.message);else{alert("Saree saved");$("clear").click();load()}};$("bulkSave").onclick=async()=>{const fs=[...$("bulkPhotos").files],cid=$("bulkCollection").value,price=Number($("bulkPrice").value),pre=$("bulkPrefix").value.trim()||"IS";if(!fs.length||!cid||!price)return alert("Select collection, price and photos");$("bulkSave").disabled=true;let ok=0;for(let i=0;i<fs.length;i++){const f=fs[i],path=Date.now()+"-"+i+"-"+f.name.replace(/[^a-zA-Z0-9._-]/g,"-"),u=await db.storage.from("sarees").upload(path,f);if(u.error)continue;const url=db.storage.from("sarees").getPublicUrl(path).data.publicUrl,name=f.name.replace(/\.[^/.]+$/,"").replace(/[-_]+/g," ");const r=await db.from("products").insert({code:pre+String(i+1).padStart(3,"0"),name,collection_id:cid,price,description:"Premium saree from our own manufacturing.",image_url:url});if(!r.error)ok++}$("bulkMsg").textContent=ok+" sarees uploaded successfully."; $("bulkSave").disabled=false;load()};$("search").oninput=e=>{const q=e.target.value.toLowerCase();render(products.filter(x=>(x.name+" "+x.code+" "+(x.collections?.name||"")).toLowerCase().includes(q)))};function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}(async()=>{if(init()){const {data}=await db.auth.getSession();state(!data.session);if(data.session)load()}})();
async function loadOffersAdmin(){
 const {data,error}=await db.from("offers").select("*").order("sort_order",{ascending:true});
 if(error){$("offerList").textContent=error.message;return}
 $("offerList").innerHTML=(data||[]).map(o=>`<div class="offer-row">
   <img src="${esc(o.image_url)}">
   <div><b>${esc(o.title)}</b><small>${esc(o.subtitle)}</small></div>
   <div class="offer-actions">
     <button class="${o.is_active?"on":"off"}" onclick="toggleOffer('${o.id}',${o.is_active})">${o.is_active?"ON":"OFF"}</button>
     <button onclick="deleteOffer('${o.id}')">DELETE</button>
   </div>
 </div>`).join("")||"<small>No offers added.</small>";
}
window.toggleOffer=async(id,state)=>{
 const {error}=await db.from("offers").update({is_active:!state}).eq("id",id);
 if(error) alert(error.message); else loadOffersAdmin();
};
window.deleteOffer=async(id)=>{
 if(!confirm("Delete this offer?"))return;
 const {error}=await db.from("offers").delete().eq("id",id);
 if(error)alert(error.message);else loadOffersAdmin();
};
$("offerSave").onclick=async()=>{
 const title=$("offerTitle").value.trim(),subtitle=$("offerSubtitle").value.trim(),link=$("offerLink").value.trim(),file=$("offerPhoto").files[0];
 if(!title)return alert("Offer title type pannunga.");
 let image_url="";
 if(file){
   const path="offers-"+Date.now()+"-"+file.name.replace(/[^a-zA-Z0-9._-]/g,"-");
   const u=await db.storage.from("sarees").upload(path,file);
   if(u.error)return alert(u.error.message);
   image_url=db.storage.from("sarees").getPublicUrl(path).data.publicUrl;
 }
 const {error}=await db.from("offers").insert({title,subtitle,link_url:link,image_url,sort_order:Date.now(),is_active:true});
 if(error)alert(error.message);
 else{$("offerTitle").value="";$("offerSubtitle").value="";$("offerLink").value="";$("offerPhoto").value="";alert("Offer added & ON");loadOffersAdmin();}
};

const _oldLoad=load;load=async()=>{await _oldLoad();await loadOffersAdmin();};

// Editable home page content and section visibility
const homeDefaults={heroKicker:'OWN MANUFACTURING · PREMIUM WEAVES',heroTitle:'Luxury, woven by us.',heroText:'Exclusive sarees crafted with care from our own manufacturing — made for the moments you remember.',heroButton:'EXPLORE COLLECTIONS →',trust1Title:'Own Manufacturing',trust1Text:'Made by us',trust2Title:'Premium Quality',trust2Text:'Carefully selected',trust3Title:'Direct Value',trust3Text:'Factory to you',trust4Title:'WhatsApp Order',trust4Text:'Easy & quick',offerKicker:'LIMITED TIME',offerHeading:'Offer Zone',offerIntro:"Special offers from Indhuja Saree's.",collectionsKicker:'CURATED FOR YOU',collectionsHeading:'Our Collections',collectionsIntro:'Discover sarees from our latest collections.',storyKicker:'FROM OUR LOOMS TO YOUR WARDROBE',storyHeading:'Woven by us. Chosen by you.',storyText:'We manufacture our own sarees with traditional craftsmanship and a modern eye for colour, texture and value.',contactKicker:'VISIT / ORDER',contactHeading:'Ready for your next saree?',contactText:'Message us on WhatsApp for photos, availability and orders.',footerText:"© Indhuja Saree's · Own Manufacturing · Ilampillai, Salem"};
async function loadHomeEditor(){
 const {data,error}=await db.from('site_settings').select('settings').eq('id',1).maybeSingle();
 if(error){$('homeMsg').textContent='Run the latest setup.sql in Supabase to enable this editor.';return}
 const s=data?.settings||{};
 Object.entries(homeDefaults).forEach(([k,v])=>{const el=$('set_'+k);if(el)el.value=s[k]??v});
 const vis=s.visibility||{};['hero','trust','offers','collections','story','contact'].forEach(k=>{const el=$('show_'+k);if(el)el.checked=vis[k]!==false});
}
$('homeSave').onclick=async()=>{
 const settings={...homeDefaults,visibility:{}};
 Object.keys(homeDefaults).forEach(k=>{settings[k]=$('set_'+k).value.trim()});
 ['hero','trust','offers','collections','story','contact'].forEach(k=>settings.visibility[k]=$('show_'+k).checked);
 $('homeSave').disabled=true;$('homeMsg').textContent='Saving…';
 const {error}=await db.from('site_settings').upsert({id:1,settings,updated_at:new Date().toISOString()},{onConflict:'id'});
 $('homeSave').disabled=false;
 if(error){$('homeMsg').textContent=error.message;return}
 homeSettingsCache=settings;$('homeMsg').textContent='Saved! Home page changes are live. Refresh customer website to see updates.';
};
$('homeReset').onclick=()=>{Object.entries(homeDefaults).forEach(([k,v])=>{if($('set_'+k))$('set_'+k).value=v});['hero','trust','offers','collections','story','contact'].forEach(k=>$('show_'+k).checked=true)};
let homeSettingsCache={};
const _loadWithHome=load;load=async()=>{await _loadWithHome();await loadOffersAdmin();await loadHomeEditor();};
