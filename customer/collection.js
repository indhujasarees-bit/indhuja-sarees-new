
const C = window.INDHUJA_CONFIG;
const sb = supabase.createClient(
  C.SUPABASE_URL,
  C.SUPABASE_KEY
);

const id = new URLSearchParams(location.search).get("id");

wa.href = `https://wa.me/${C.WHATSAPP_NUMBER}`;

let zoomOpen = false;

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

  // DISPLAY COLLECTION PRODUCTS
  grid.innerHTML = (p || []).map(x => `
    <a class="card" href="product.html?id=${x.id}">

      <div class="pic">
        ${
          x.image_url
            ? `<img
                class="zoom-saree"
                src="${x.image_url}"
                alt="${x.name}"
                data-full="${x.image_url}"
                loading="lazy"
                style="
                  cursor:zoom-in;
                  width:100%;
                  height:100%;
                  object-fit:cover;
                "
              >`
            : ""
        }
      </div>

      <div class="info">
        <small>${x.code}</small>

        <h3>${x.name}</h3>

        <div class="price">
          ₹${Number(x.price).toLocaleString("en-IN")}
        </div>

        <span class="btn">
          VIEW SAREE DETAILS →
        </span>
      </div>

    </a>
  `).join("");

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
