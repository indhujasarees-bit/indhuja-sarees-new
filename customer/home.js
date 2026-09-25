
const C = window.INDHUJA_CONFIG;
const sb = supabase.createClient(C.SUPABASE_URL, C.SUPABASE_KEY);

const wa = t =>
  `https://wa.me/${C.WHATSAPP_NUMBER}?text=${encodeURIComponent(t)}`;

document.getElementById("wa").href = wa(
  "Hi Indhuja Saree's, I would like to see your latest collections."
);

document.getElementById("order").href = wa(
  "Hi Indhuja Saree's, I would like to order a saree."
);

let homeSettings = {};

async function loadHomeSettings() {
  const { data } = await sb
    .from("site_settings")
    .select("settings")
    .eq("id", 1)
    .maybeSingle();

  homeSettings = data?.settings || {};

  const keys = [
    'heroKicker', 'heroTitle', 'heroText', 'heroButton',
    'trust1Title', 'trust1Text', 'trust2Title', 'trust2Text',
    'trust3Title', 'trust3Text', 'trust4Title', 'trust4Text',
    'offerKicker', 'offerHeading', 'offerIntro',
    'collectionsKicker', 'collectionsHeading', 'collectionsIntro',
    'storyKicker', 'storyHeading', 'storyText',
    'contactKicker', 'contactHeading', 'contactText',
    'footerText'
  ];

  keys.forEach(k => {
    const el = document.getElementById(k);
    if (el && homeSettings[k]) {
      el.textContent = homeSettings[k];
    }
  });

  // HERO BANNER IMAGE
  const heroImg = document.getElementById("heroImage");
  const heroPlaceholder = document.getElementById("heroPlaceholder");

  if (heroImg) {
    if (homeSettings.heroImageUrl) {
      heroImg.src = homeSettings.heroImageUrl;
      heroImg.style.display = "block";

      if (heroPlaceholder) {
        heroPlaceholder.style.display = "none";
      }
    } else {
      heroImg.removeAttribute("src");
      heroImg.style.display = "none";

      if (heroPlaceholder) {
        heroPlaceholder.style.display = "block";
      }
    }
  }

  const visibility = homeSettings.visibility || {};

  const sectionMap = {
    hero: '.hero',
    trust: '.trust',
    offers: '#offers',
    collections: '#collections',
    story: '#story',
    contact: '#contact'
  };

  Object.entries(sectionMap).forEach(([k, selector]) => {
    const el = document.querySelector(selector);

    if (el && visibility[k] === false) {
      el.hidden = true;
    }
  });
}

async function load() {
  const { data: c } = await sb
    .from("collections")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  const { data: p } = await sb
    .from("products")
    .select("*")
    .eq("is_active", true);

  const grid = document.getElementById('grid');

  grid.innerHTML = (c || []).map(x => {
    let a = (p || []).filter(y => y.collection_id === x.id);
    let img = a[0]?.image_url || "";

    return `
      <a class="card" href="collection.html?id=${x.id}">
        <div class="pic" ${
          img
            ? `style="background-image:url('${img}');background-size:cover;background-position:center"`
            : ""
        }>
          ${img ? "" : x.name}
        </div>

        <div class="info">
          <h3>${x.name}</h3>
          <small>${a.length} Sarees</small>
          <span class="view">VIEW COLLECTION →</span>
        </div>
      </a>
    `;
  }).join("") || "No collections yet.";
}

async function loadOffers() {
  const { data } = await sb
    .from("offers")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  const box = document.getElementById("offers");
  const grid = document.getElementById("offersGrid");

  if (
    homeSettings.visibility?.offers === false ||
    !data ||
    !data.length
  ) {
    box.hidden = true;
    return;
  }

  box.hidden = false;

  grid.innerHTML = data.map(o => `
    <article class="offer-card">
      ${
        o.image_url
          ? `<img src="${o.image_url}" alt="${o.title}">`
          : ""
      }

      <div class="offer-copy">
        <h3>${o.title}</h3>
        <p>${o.subtitle || ""}</p>

        ${
          o.link_url
            ? `<a class="offer-btn" href="${o.link_url}">VIEW OFFER →</a>`
            : ""
        }
      </div>
    </article>
  `).join("");
}

(async () => {
  await loadHomeSettings();
  await load();
  await loadOffers();
})();
