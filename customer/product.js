
const C = window.INDHUJA_CONFIG;
const sb = supabase.createClient(
  C.SUPABASE_URL,
  C.SUPABASE_KEY
);

const id = new URLSearchParams(location.search).get("id");

wa.href = `https://wa.me/${C.WHATSAPP_NUMBER}`;

async function run() {
  const { data: x, error } = await sb
    .from("products")
    .select("*,collections(name)")
    .eq("id", id)
    .single();

  if (error || !x) {
    product.innerHTML = "<p>Saree not found.</p>";
    return;
  }

  const message =
    `Hi Indhuja Saree's, I am interested in ${x.name} ` +
    `(${x.code}) - ₹${x.price}`;

  product.innerHTML = `
    <div style="
      max-width:1100px;
      margin:55px auto;
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:45px;
      padding:20px;
    ">
      <div class="pic" style="height:600px">
        ${x.image_url
          ? `<img src="${x.image_url}"
              id="sareeImage"
              crossorigin="anonymous"
              style="width:100%;height:100%;object-fit:cover">`
          : ""}
      </div>

      <div style="align-self:center">
        <i style="color:#b88a35;letter-spacing:.2em">
          ${x.collections?.name || "SAREE"}
        </i>

        <h1 style="font:52px Georgia">${x.name}</h1>

        <h2 style="color:#65152e">
          ₹${Number(x.price).toLocaleString("en-IN")}
        </h2>

        <p>${x.description || ""}</p>
        <p>Code: ${x.code || ""}</p>

        <button class="btn" id="orderButton" type="button">
          ORDER WITH PHOTO →
        </button>
      </div>
    </div>
  `;

  // Mobile layout
  const style = document.createElement("style");
  style.textContent = `
    @media(max-width:700px){
      #product > div{
        grid-template-columns:1fr !important;
        gap:20px !important;
        margin:20px auto !important;
      }
      #product .pic{
        height:auto !important;
        aspect-ratio:3/4;
      }
      #product h1{
        font-size:36px !important;
      }
    }
  `;
  document.head.appendChild(style);

  document.getElementById("orderButton")
    .addEventListener("click", async () => {

      const btn = document.getElementById("orderButton");
      btn.disabled = true;
      btn.textContent = "Preparing photo...";

      try {
        if (!x.image_url) {
          throw new Error("No image");
        }

        // Download product image as a file
        const response = await fetch(x.image_url);

        if (!response.ok) {
          throw new Error("Image download failed");
        }

        const blob = await response.blob();

        const ext = blob.type.includes("png") ? "png" : "jpg";

        const file = new File(
          [blob],
          `Indhuja-${x.code || "Saree"}.${ext}`,
          { type: blob.type || "image/jpeg" }
        );

        const shareText =
          `Indhuja Saree's\n` +
          `Model: ${x.name}\n` +
          `Code: ${x.code || ""}\n` +
          `Price: ₹${x.price}\n\n` +
          message;

        // Check whether browser supports sharing image files
        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare({ files: [file] })
        ) {
          await navigator.share({
            title: "Indhuja Saree's Order",
            text: shareText,
            files: [file]
          });
        } else {
          throw new Error("Image sharing not supported");
        }

      } catch (err) {
        if (err.name === "AbortError") {
          // Customer cancelled the share sheet
          return;
        }

        // Fallback to normal WhatsApp text order
        const fallbackText =
          message +
          (x.image_url ? "\nSaree photo: " + x.image_url : "");

        window.open(
          `https://wa.me/${C.WHATSAPP_NUMBER}?text=` +
          encodeURIComponent(fallbackText),
          "_blank"
        );

      } finally {
        btn.disabled = false;
        btn.textContent = "ORDER WITH PHOTO →";
      }
    });
}

run();
