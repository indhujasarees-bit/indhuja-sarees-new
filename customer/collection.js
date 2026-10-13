
const C = window.INDHUJA_CONFIG;
const sb = supabase.createClient(
  C.SUPABASE_URL,
  C.SUPABASE_KEY
);

// Optimize ImageKit images only. Supabase and other image URLs remain unchanged.
function optimizedImageUrl(imageUrl) {
  if (!imageUrl) return imageUrl;
  try {
    const url = new URL(imageUrl, window.location.href);
    if (url.hostname !== "ik.imagekit.io") return imageUrl;

    const current = url.searchParams.get("tr");
    if (!current) {
      url.searchParams.set("tr", "f-auto,q-80");
    } else {
      const parts = current.split(",").map(part => part.trim());
      if (!parts.includes("f-auto")) parts.push("f-auto");
      if (!parts.some(part => /^q-\d+$/.test(part))) parts.push("q-80");
      url.searchParams.set("tr", parts.filter(Boolean).join(","));
    }
    return url.toString();
  } catch {
    return imageUrl;
  }
}


const id = new URLSearchParams(location.search).get("id");

wa.href = `https://wa.me/${C.WHATSAPP_NUMBER}`;

let zoomOpen = false;

let allProducts = [];

function renderProducts() {
  const sort = document.getElementById("priceSort")?.value || "default";
  let filtered = [...allProducts];

  if (sort === "low-high") filtered.sort((a,b) => Number(a.price || 0) - Number(b.price || 0));
  else if (sort === "high-low") filtered.sort((a,b) => Number(b.price || 0) - Number(a.price || 0));
  else filtered.sort((a,b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  document.getElementById("count").textContent = `${filtered.length} of ${allProducts.length} sarees`;
  document.getElementById("noResults").hidden = filtered.length > 0;
  grid.innerHTML = filtered.map(x => `
    <a class="card" href="product.html?id=${encodeURIComponent(x.id)}">
      <div class="pic">
        ${x.image_url ? `<img class="zoom-saree" src="${optimizedImageUrl(x.image_url)}" alt="${x.name || "Saree"}" data-full="${x.image_url}" loading="lazy" style="cursor:zoom-in;width:100%;height:100%;object-fit:cover;">` : ""}
      </div>
      <div class="info">
        <small>${x.code || ""}</small>
        <h3>${x.name || "Saree"}</h3>
        <div class="price">₹${Number(x.price || 0).toLocaleString("en-IN")}</div>
        <span class="btn">VIEW SAREE DETAILS →</span>
      </div>
    </a>
  `).join("");
}

async function run() {
  const { data: c } = await sb.from("collections").select("*").eq("id", id).single();
  if (!c) return;
  document.getElementById("title").textContent = c.name;

  const { data: p, error } = await sb.from("products").select("*").eq("collection_id", id).eq("is_active", true).order("created_at", { ascending: false });
  if (error) {
    document.getElementById("count").textContent = "Could not load sarees. Please refresh and try again.";
    return;
  }
  allProducts = p || [];
  renderProducts();
  document.getElementById("priceSort").addEventListener("change", renderProducts);

  // CREATE FULL-SCREEN IMAGE VIEWER
  if (!document.getElementById("sareeZoom")) {

    const viewer = document.createElement("div");

    viewer.id = "sareeZoom";

    viewer.innerHTML = `
      <img id="zoomImage" alt="Large saree photo">
      <div id="zoomHint">
        Mobile Back button to close
      </div>
    `;

    document.body.appendChild(viewer);

    // IMAGE VIEWER STYLE
    const style = document.createElement("style");

    style.textContent = `
      #sareeZoom {
        display: none;
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(0,0,0,.96);
        align-items: center;
        justify-content: center;
        padding: 20px 10px 45px;
      }

      #sareeZoom.active {
        display: flex;
      }

      #zoomImage {
        display: block;
        max-width: 100%;
        max-height: 90vh;
        width: auto;
        height: auto;
        object-fit: contain;
        border-radius: 4px;
      }

      #zoomHint {
        position: absolute;
        bottom: 15px;
        left: 0;
        right: 0;
        color: white;
        font: 13px Arial, sans-serif;
        text-align: center;
        opacity: .75;
        pointer-events: none;
      }
    `;

    document.head.appendChild(style);

    // CLOSE VIEWER
    function closeViewer() {
      viewer.classList.remove("active");
      document.body.style.overflow = "";
      zoomOpen = false;
    }

    // Android Back / Mobile Back Gesture
    window.addEventListener("popstate", () => {
      if (zoomOpen) {
        closeViewer();
      }
    });

    // TAP OUTSIDE IMAGE TO CLOSE
    viewer.addEventListener("click", e => {
      if (e.target === viewer) {
        history.back();
      }
    });

    // ESCAPE KEY SUPPORT
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && zoomOpen) {
        history.back();
      }
    });

  }

  // CLICK SAREE PHOTO TO ZOOM
  grid.addEventListener("click", e => {

    const img = e.target.closest(".zoom-saree");

    if (!img) return;

    // Prevent opening product details
    e.preventDefault();
    e.stopPropagation();

    const viewer = document.getElementById("sareeZoom");
    const zoomImage = document.getElementById("zoomImage");

    zoomImage.src = img.dataset.full;

    // Add browser history entry for back button
    history.pushState(
      { sareeZoom: true },
      "",
      location.href
    );

    zoomOpen = true;

    viewer.classList.add("active");

    document.body.style.overflow = "hidden";

  });

}

run();
