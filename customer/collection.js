
const C = window.INDHUJA_CONFIG;
const sb = supabase.createClient(C.SUPABASE_URL, C.SUPABASE_KEY);
const id = new URLSearchParams(location.search).get("id");

wa.href = `https://wa.me/${C.WHATSAPP_NUMBER}`;

async function run() {
  const { data: c } = await sb
    .from("collections")
    .select("*")
    .eq("id", id)
    .single();

  if (!c) return;

  title.textContent = c.name;

  const { data: p } = await sb
    .from("products")
    .select("*")
    .eq("collection_id", id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  count.textContent = `${p?.length || 0} sarees`;

  grid.innerHTML = (p || []).map(x => `
    <a class="card" href="product.html?id=${x.id}">
      <div class="pic">
        ${
          x.image_url
            ? `<img class="zoom-saree"
                src="${x.image_url}"
                alt="${x.name}"
                data-full="${x.image_url}"
                loading="lazy"
                style="cursor:zoom-in;width:100%;height:100%;object-fit:cover;">`
            : ""
        }
      </div>

      <div class="info">
        <small>${x.code}</small>
        <h3>${x.name}</h3>
        <div class="price">
          ₹${Number(x.price).toLocaleString("en-IN")}
        </div>
        <span class="btn">VIEW SAREE DETAILS →</span>
      </div>
    </a>
  `).join("");

  // CREATE IMAGE VIEWER
  if (!document.getElementById("sareeZoom")) {
    const viewer = document.createElement("div");
    viewer.id = "sareeZoom";

    viewer.innerHTML = `
      <button id="zoomClose" aria-label="Close image">&times;</button>
      <img id="zoomImage" alt="Large saree photo">
      <div id="zoomHint">Tap outside the image to close</div>
    `;

    document.body.appendChild(viewer);

    // VIEWER STYLES
    const style = document.createElement("style");

    style.textContent = `
      #sareeZoom {
        display: none;
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(0,0,0,.94);
        align-items: center;
        justify-content: center;
        padding: 55px 12px 45px;
      }

      #sareeZoom.active {
        display: flex;
      }

      #zoomImage {
        display: block;
        max-width: 100%;
        max-height: 85vh;
        width: auto;
        height: auto;
        object-fit: contain;
        border-radius: 4px;
      }

      #zoomClose {
        position: absolute;
        top: 12px;
        right: 18px;
        background: #65152e;
        color: white;
        border: 0;
        border-radius: 50%;
        width: 44px;
        height: 44px;
        font-size: 32px;
        cursor: pointer;
      }

      #zoomHint {
        position: absolute;
        bottom: 15px;
        color: white;
        font: 13px Arial;
        opacity: .8;
        text-align: center;
      }
    `;

    document.head.appendChild(style);

    const closeViewer = () => {
      viewer.classList.remove("active");
      document.body.style.overflow = "";
    };

    document.getElementById("zoomClose")
      .addEventListener("click", closeViewer);

    viewer.addEventListener("click", e => {
      if (e.target === viewer) closeViewer();
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") closeViewer();
    });
  }
}

// CLICK IMAGE TO ENLARGE
grid.addEventListener("click", e => {
  const img = e.target.closest(".zoom-saree");

  if (!img) return;

  // Prevent opening product page when photo is clicked
  e.preventDefault();
  e.stopPropagation();

  const viewer = document.getElementById("sareeZoom");
  const zoomImage = document.getElementById("zoomImage");

  zoomImage.src = img.dataset.full;
  viewer.classList.add("active");

  document.body.style.overflow = "hidden";
});

run();
