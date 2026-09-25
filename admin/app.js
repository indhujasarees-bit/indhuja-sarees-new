
const C=window.INDHUJA_CONFIG;
let db,products=[];
const $=id=>document.getElementById(id);

function init(){
  if(!C?.SUPABASE_URL||!C?.SUPABASE_KEY){
    alert('Update config.js');
    return false;
  }
  db=supabase.createClient(C.SUPABASE_URL,C.SUPABASE_KEY);
  return true;
}

// LOGOUT
$('logout').onclick=async()=>{
  await db.auth.signOut();
  location.replace('index.html');
};

// LOAD PRODUCTS, COLLECTIONS AND DASHBOARD
async function load(){
  const {data,error}=await db
    .from("products")
    .select("*,collections(id,name)")
    .order("created_at",{ascending:false});

  if(error){
    $("list").textContent=error.message;
    return;
  }

  products=data||[];

  const {data:cs}=await db
    .from("collections")
    .select("*")
    .eq("is_active",true)
    .order("sort_order");

  const cats=cs||[];

  const html='<option value="">Select collection</option>'+
    cats.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("");

  $("category").innerHTML=$("bulkCollection").innerHTML=html;

  $("total").textContent=products.length;
  $("active").textContent=products.filter(x=>x.is_active).length;
  $("collectionsCount").textContent=cats.length;

  $("cats").innerHTML=cats.map(c=>`
    <div class="cat">
      <span>
        <b>${esc(c.name)}</b>
        (${products.filter(x=>x.collection_id===c.id).length})
      </span>
      <button onclick="renameCat('${c.id}','${esc(c.name)}')">RENAME</button>
    </div>
  `).join("");

  render(products);
}

// RENDER SAREES
function render(a){
  $("list").innerHTML=a.map(x=>`
    <div class="item">
      <img src="${esc(x.image_url)}">
      <div>
        <b>${esc(x.name)}</b>
        <small>${esc(x.code)} · ${esc(x.collections?.name||"")} · ₹${x.price}</small>
      </div>
      <div class="actions">
        <button onclick='edit(${JSON.stringify(x)})'>EDIT</button>
        <button onclick="toggle('${x.id}',${x.is_active})">
          ${x.is_active?"HIDE":"SHOW"}
        </button>
        <button class="delete-btn" onclick="deleteSaree('${x.id}')">DELETE</button>
      </div>
    </div>
  `).join("")||"No sarees yet.";
}

// EDIT SAREE
window.edit=x=>{
  $("editid").value=x.id;
  $("code").value=x.code;
  $("pname").value=x.name;
  $("category").value=x.collection_id;
  $("price").value=x.price;
  $("desc").value=x.description||"";
  scrollTo({top:350,behavior:"smooth"});
};

// SHOW / HIDE SAREE
window.toggle=async(id,s)=>{
  const {error}=await db.from("products")
    .update({is_active:!s})
    .eq("id",id);

  if(error)alert(error.message);
  else load();
};

// DELETE SAREE
window.deleteSaree=async(id)=>{
  const item=products.find(p=>p.id===id);
  const name=item?.name||'this saree';

  if(!confirm('Permanently delete '+name+'? This cannot be undone.'))return;

  const {error}=await db.from('products').delete().eq('id',id);

  if(error){
    alert(error.message);
    return;
  }

  alert('Saree deleted.');
  await load();
};

// RENAME COLLECTION
window.renameCat=async(id,old)=>{
  const n=prompt("New collection name",old);

  if(!n||n.trim()===old)return;

  const {error}=await db.from("collections")
    .update({name:n.trim()})
    .eq("id",id);

  if(error)alert(error.message);
  else load();
};

// ADD COLLECTION
$("addcat").onclick=async()=>{
  const n=$("newcat").value.trim();

  if(!n)return;

  const {error}=await db.from("collections").insert({
    name:n,
    sort_order:Math.floor(Date.now()/1000)
  });

  if(error)alert(error.message);
  else{
    $("newcat").value="";
    load();
  }
};

// CLEAR SAREE FORM
$("clear").onclick=()=>{
  ["editid","code","pname","price","desc","photo"].forEach(id=>{
    if($(id))$(id).value="";
  });
};

// SAVE SINGLE SAREE
$("save").onclick=async()=>{
  const id=$("editid").value;
  const code=$("code").value.trim();
  const name=$("pname").value.trim();
  const cid=$("category").value;
  const price=Number($("price").value);
  const desc=$("desc").value.trim();

  if(!code||!name||!cid||!price){
    return alert("Fill code, name, collection, price");
  }

  let image_url="";
  const f=$("photo").files[0];

  if(f){
    const path=Date.now()+"-"+f.name.replace(/[^a-zA-Z0-9._-]/g,"-");
    const u=await db.storage.from("sarees").upload(path,f);

    if(u.error)return alert(u.error.message);

    image_url=db.storage.from("sarees").getPublicUrl(path).data.publicUrl;
  }

  const row={code,name,collection_id:cid,price,description:desc};

  if(image_url)row.image_url=image_url;

  const r=id
    ?await db.from("products").update(row).eq("id",id)
    :await db.from("products").insert(row);

  if(r.error){
    alert(r.error.message);
  }else{
    alert("Saree saved");
    $("clear").click();
    load();
  }
};

// BULK UPLOAD SAREES
$("bulkSave").onclick=async()=>{
  const fs=[...$("bulkPhotos").files];
  const cid=$("bulkCollection").value;
  const price=Number($("bulkPrice").value);
  const pre=$("bulkPrefix").value.trim()||"IS";

  if(!fs.length||!cid||!price){
    return alert("Select collection, price and photos");
  }

  $("bulkSave").disabled=true;

  let ok=0;

  for(let i=0;i<fs.length;i++){
    const f=fs[i];

    const path=Date.now()+"-"+i+"-"+f.name.replace(/[^a-zA-Z0-9._-]/g,"-");

    const u=await db.storage.from("sarees").upload(path,f);

    if(u.error)continue;

    const url=db.storage.from("sarees").getPublicUrl(path).data.publicUrl;

    const name=f.name.replace(/\.[^/.]+$/,"").replace(/[-_]+/g," ");

    const r=await db.from("products").insert({
      code:pre+String(i+1).padStart(3,"0"),
      name,
      collection_id:cid,
      price,
      description:"Premium saree from our own manufacturing.",
      image_url:url
    });

    if(!r.error)ok++;
  }

  $("bulkMsg").textContent=ok+" sarees uploaded successfully.";
  $("bulkSave").disabled=false;

  load();
};

// SEARCH SAREES
$("search").oninput=e=>{
  const q=e.target.value.toLowerCase();

  render(products.filter(x=>
    (x.name+" "+x.code+" "+(x.collections?.name||""))
    .toLowerCase().includes(q)
  ));
};

// ESCAPE HTML
function esc(s){
  return String(s??"").replace(/[&<>"']/g,m=>({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  }[m]));
}

// ==========================================
// OFFER ZONE
// ==========================================

async function loadOffersAdmin(){
  const {data,error}=await db
    .from("offers")
    .select("*")
    .order("sort_order",{ascending:true});

  if(error){
    $("offerList").textContent=error.message;
    return;
  }

  $("offerList").innerHTML=(data||[]).map(o=>`
    <div class="offer-row">
      <img src="${esc(o.image_url)}">
      <div>
        <b>${esc(o.title)}</b>
        <small>${esc(o.subtitle)}</small>
      </div>
      <div class="offer-actions">
        <button class="${o.is_active?"on":"off"}"
          onclick="toggleOffer('${o.id}',${o.is_active})">
          ${o.is_active?"ON":"OFF"}
        </button>
        <button onclick="deleteOffer('${o.id}')">DELETE</button>
      </div>
    </div>
  `).join("")||"<small>No offers added.</small>";
}

window.toggleOffer=async(id,state)=>{
  const {error}=await db.from("offers")
    .update({is_active:!state})
    .eq("id",id);

  if(error)alert(error.message);
  else loadOffersAdmin();
};

window.deleteOffer=async(id)=>{
  if(!confirm("Delete this offer?"))return;

  const {error}=await db.from("offers").delete().eq("id",id);

  if(error)alert(error.message);
  else loadOffersAdmin();
};

// SAVE OFFER
$("offerSave").onclick=async()=>{
  const title=$("offerTitle").value.trim();
  const subtitle=$("offerSubtitle").value.trim();
  const link=$("offerLink").value.trim();
  const file=$("offerPhoto").files[0];

  if(!title)return alert("Offer title type pannunga.");

  let image_url="";

  if(file){
    const path="offers-"+Date.now()+"-"+file.name.replace(/[^a-zA-Z0-9._-]/g,"-");

    const u=await db.storage.from("sarees").upload(path,file);

    if(u.error)return alert(u.error.message);

    image_url=db.storage.from("sarees").getPublicUrl(path).data.publicUrl;
  }

  const {error}=await db.from("offers").insert({
    title,
    subtitle,
    link_url:link,
    image_url,
    sort_order:Math.floor(Date.now()/1000),
    is_active:true
  });

  if(error){
    alert(error.message);
  }else{
    $("offerTitle").value="";
    $("offerSubtitle").value="";
    $("offerLink").value="";
    $("offerPhoto").value="";

    alert("Offer added & ON");
    loadOffersAdmin();
  }
};

// ==========================================
// HOME PAGE EDITOR
// ==========================================

const homeDefaults={
  heroKicker:'OWN MANUFACTURING · PREMIUM WEAVES',
  heroTitle:'Luxury, woven by us.',
  heroText:'Exclusive sarees crafted with care from our own manufacturing — made for the moments you remember.',
  heroButton:'EXPLORE COLLECTIONS →',

  trust1Title:'Own Manufacturing',
  trust1Text:'Made by us',
  trust2Title:'Premium Quality',
  trust2Text:'Carefully selected',
  trust3Title:'Direct Value',
  trust3Text:'Factory to you',
  trust4Title:'WhatsApp Order',
  trust4Text:'Easy & quick',

  offerKicker:'LIMITED TIME',
  offerHeading:'Offer Zone',
  offerIntro:"Special offers from Indhuja Saree's.",

  collectionsKicker:'CURATED FOR YOU',
  collectionsHeading:'Our Collections',
  collectionsIntro:'Discover sarees from our latest collections.',

  storyKicker:'FROM OUR LOOMS TO YOUR WARDROBE',
  storyHeading:'Woven by us. Chosen by you.',
  storyText:'We manufacture our own sarees with traditional craftsmanship and a modern eye for colour, texture and value.',

  contactKicker:'VISIT / ORDER',
  contactHeading:'Ready for your next saree?',
  contactText:'Message us on WhatsApp for photos, availability and orders.',

  footerText:"© Indhuja Saree's · Own Manufacturing · Ilampillai, Salem"
};

// Cache of all current homepage settings.
// This is important so heroImageUrl is not lost when saving text.
let homeSettingsCache={};

async function getHomeSettings(){
  const {data,error}=await db
    .from('site_settings')
    .select('settings')
    .eq('id',1)
    .maybeSingle();

  if(error)throw error;

  return data?.settings||{};
}

// LOAD HOME PAGE EDITOR
async function loadHomeEditor(){
  const {data,error}=await db
    .from('site_settings')
    .select('settings')
    .eq('id',1)
    .maybeSingle();

  if(error){
    $('homeMsg').textContent='Site settings error: '+error.message;
    return;
  }

  const s=data?.settings||{};

  homeSettingsCache=s;

  Object.entries(homeDefaults).forEach(([k,v])=>{
    const el=$('set_'+k);
    if(el)el.value=s[k]??v;
  });

  const vis=s.visibility||{};

  ['hero','trust','offers','collections','story','contact'].forEach(k=>{
    const el=$('show_'+k);
    if(el)el.checked=vis[k]!==false;
  });
}

// SAVE HOME PAGE TEXT AND VISIBILITY
$("homeSave").onclick=async()=>{
  try{
    $("homeSave").disabled=true;
    $("homeMsg").textContent='Saving…';

    // Read existing settings first to preserve hero image URL.
    const existing=await getHomeSettings();

    const settings={
      ...existing,
      ...homeDefaults,
      visibility:{
        ...(existing.visibility||{})
      }
    };

    Object.keys(homeDefaults).forEach(k=>{
      const el=$('set_'+k);
      if(el)settings[k]=el.value.trim();
    });

    ['hero','trust','offers','collections','story','contact'].forEach(k=>{
      settings.visibility[k]=$('show_'+k).checked;
    });

    const {error}=await db.from('site_settings').upsert({
      id:1,
      settings,
      updated_at:new Date().toISOString()
    },{onConflict:'id'});

    if(error)throw error;

    homeSettingsCache=settings;

    $("homeMsg").textContent=
      'Saved! Home page changes are live. Refresh customer website to see updates.';

  }catch(error){
    $("homeMsg").textContent=error.message;
  }finally{
    $("homeSave").disabled=false;
  }
};

// RESET HOME PAGE TEXT PREVIEW
$("homeReset").onclick=()=>{
  Object.entries(homeDefaults).forEach(([k,v])=>{
    if($('set_'+k))$('set_'+k).value=v;
  });

  ['hero','trust','offers','collections','story','contact'].forEach(k=>{
    $('show_'+k).checked=true;
  });
};

// ==========================================
// HERO BANNER IMAGE UPLOAD
// ==========================================

let heroPreviewObjectURL=null;

// Load saved hero image from Supabase settings
async function loadHeroImageSettings(){
  const msg=$('heroImageMsg');
  const preview=$('heroPreview');

  try{
    const settings=await getHomeSettings();

    homeSettingsCache=settings;

    if(settings.heroImageUrl){
      preview.src=settings.heroImageUrl;
      preview.style.display='block';
      msg.textContent='Current Hero image loaded.';
    }else{
      preview.removeAttribute('src');
      preview.style.display='none';
      msg.textContent='No Hero image uploaded yet.';
    }
  }catch(error){
    msg.textContent='Could not load Hero image: '+error.message;
  }
}

// Show selected photo preview
$('heroPhoto').onchange=()=>{
  const file=$('heroPhoto').files[0];
  const preview=$('heroPreview');
  const msg=$('heroImageMsg');

  if(!file)return;

  if(!file.type.startsWith('image/')){
    msg.textContent='Please select an image file.';
    $('heroPhoto').value='';
    return;
  }

  if(heroPreviewObjectURL){
    URL.revokeObjectURL(heroPreviewObjectURL);
  }

  heroPreviewObjectURL=URL.createObjectURL(file);

  preview.src=heroPreviewObjectURL;
  preview.style.display='block';

  msg.textContent='Preview ready. Press UPLOAD & SAVE HERO IMAGE.';
};

// UPLOAD AND SAVE HERO IMAGE
$('heroImageSave').onclick=async()=>{
  const file=$('heroPhoto').files[0];
  const btn=$('heroImageSave');
  const msg=$('heroImageMsg');

  if(!file){
    alert('First choose a Hero image from your mobile gallery.');
    return;
  }

  if(!file.type.startsWith('image/')){
    alert('Please select a valid image file.');
    return;
  }

  btn.disabled=true;
  msg.textContent='Uploading Hero image…';

  try{
    // Unique filename so existing product and offer images are untouched.
    const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,'-');
    const path='hero-'+Date.now()+'-'+safeName;

    const {error:uploadError}=await db.storage
      .from('sarees')
      .upload(path,file,{
        upsert:false,
        contentType:file.type
      });

    if(uploadError)throw uploadError;

    const publicUrl=db.storage
      .from('sarees')
      .getPublicUrl(path).data.publicUrl;

    // Preserve existing text, visibility and other settings.
    const settings=await getHomeSettings();

    settings.heroImageUrl=publicUrl;

    const {error:saveError}=await db.from('site_settings').upsert({
      id:1,
      settings,
      updated_at:new Date().toISOString()
    },{onConflict:'id'});

    if(saveError)throw saveError;

    homeSettingsCache=settings;

    $('heroPreview').src=publicUrl;
    $('heroPreview').style.display='block';
    $('heroPhoto').value='';

    if(heroPreviewObjectURL){
      URL.revokeObjectURL(heroPreviewObjectURL);
      heroPreviewObjectURL=null;
    }

    msg.textContent='Hero image uploaded and saved successfully!';

  }catch(error){
    msg.textContent='Upload failed: '+error.message;
  }finally{
    btn.disabled=false;
  }
};

// REMOVE HERO IMAGE FROM HOMEPAGE SETTINGS
$('heroImageRemove').onclick=async()=>{
  const btn=$('heroImageRemove');
  const msg=$('heroImageMsg');

  if(!confirm('Remove the Hero image from your customer homepage?'))return;

  btn.disabled=true;
  msg.textContent='Removing Hero image…';

  try{
    const settings=await getHomeSettings();

    delete settings.heroImageUrl;

    const {error}=await db.from('site_settings').upsert({
      id:1,
      settings,
      updated_at:new Date().toISOString()
    },{onConflict:'id'});

    if(error)throw error;

    homeSettingsCache=settings;

    $('heroPreview').removeAttribute('src');
    $('heroPreview').style.display='none';
    $('heroPhoto').value='';

    if(heroPreviewObjectURL){
      URL.revokeObjectURL(heroPreviewObjectURL);
      heroPreviewObjectURL=null;
    }

    msg.textContent='Hero image removed from homepage settings.';

  }catch(error){
    msg.textContent='Remove failed: '+error.message;
  }finally{
    btn.disabled=false;
  }
};

// ==========================================
// AUTHENTICATION AND INITIAL LOAD
// ==========================================

(async()=>{
  if(!init())return;

  const {data}=await db.auth.getSession();

  if(!data.session){
    location.replace('index.html');
    return;
  }

  await load();

  await loadHomeEditor();

  await loadHeroImageSettings();
})();
           
