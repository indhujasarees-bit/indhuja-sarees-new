
const C = window.INDHUJA_CONFIG;

const sb = supabase.createClient(
  C.SUPABASE_URL,
  C.SUPABASE_KEY
);

const id = new URLSearchParams(location.search).get("id");

// WhatsApp number
const phone = C.WHATSAPP_NUMBER;

// Default WhatsApp link
wa.href = `https://wa.me/${phone}`;

async function run() {
  const { data: x, error } = await sb
    .from("products")
    .select("*,collections(name)")
    .eq("id", id)
    .single();

  if (error || !x) {
    product.innerHTML = `
      <div style="text-align:center;padding:60px">
        <h2>Saree not found</h2>
        <a href="index.html">Back to Collection</a>
      </div>
    `;
    return;
  }

  const price = Number(x.price).toLocaleString("en-IN");

  // WhatsApp order message with image URL
  const message =
    `Hi Indhuja Saree's! 👋\n\n` +
    `I would like to order this saree.\n\n` +
    `🛍️ Model: ${x.name}\n` +
    `🔖 Code: ${x.code || "N/A"}\n` +
    `💰 Price: ₹${price}\n\n` +
    `📸 Saree Photo:\n${x.image_url || ""}\n\n` +
    `Please confirm availability and delivery details.`;

  const whatsappLink =
    `https://wa.me/${phone}?text=` +
    encodeURIComponent(message);

  // Product details
  product.innerHTML = `
    <div class="product-container">

      <div class="product-image">
        ${
          x.image_url
            ? `<img
                src="${x.image_url}"
                alt="${x.name}"
                class="saree-img"
              >`
            : `<div class="no-image">
                Saree image not available
              </div>`
        }
      </div>

      <div class="product-details">

        <div class="collection-name">
          ${x.collections?.name || "SAREE COLLECTION"}
        </div>

        <h1 class="product-title">
          ${x.name}
        </h1>

        <h2 class="product-price">
          ₹${price}
        </h2>

        <p class="product-description">
          ${x.description || ""}
        </p>

        <p class="product-code">
          Saree Code: ${x.code || "N/A"}
        </p>

        <a
          class="order-btn"
          href="${whatsappLink}"
          target="_blank"
          rel="noopener"
        >
          ORDER ON WHATSAPP
          <span>→</span>
        </a>

        <p class="order-note">
          Saree image and product details included.
        </p>

      </div>

    </div>

    <style>
      .product-container {
        max-width: 1100px;
        margin: 45px auto;
        padding: 20px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 45px;
        align-items: center;
      }

      .product-image {
        width: 100%;
        overflow: hidden;
        background: #f8f3ed;
        border-radius: 8px;
      }

      .saree-img {
        display: block;
        width: 100%;
        height: 600px;
        object-fit: contain;
      }

      .no-image {
        padding: 100px 20px;
        text-align: center;
        color: #777;
      }

      .collection-name {
        color: #b88a35;
        letter-spacing: 3px;
        font-size: 13px;
        text-transform: uppercase;
      }

      .product-title {
        font-family: Georgia, serif;
        font-size: 45px;
        font-weight: 400;
        color: #35151f;
        margin: 18px 0;
      }

      .product-price {
        color: #65152e;
        font-size: 30px;
        margin: 15px 0;
      }

      .product-description {
        font-size: 16px;
        line-height: 1.8;
        color: #666;
      }

      .product-code {
        margin: 20px 0;
        color: #555;
        font-size: 14px;
      }

      .order-btn {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        background: #65152e;
        color: white;
        padding: 18px 24px;
        text-decoration: none;
        font-size: 15px;
        font-weight: bold;
        letter-spacing: 1px;
        border-radius: 4px;
        margin-top: 25px;
      }

      .order-btn:hover {
        background: #4a1022;
      }

      .order-note {
        font-size: 12px;
        color: #888;
        margin-top: 12px;
      }

      @media (max-width: 700px) {
        .product-container {
          grid-template-columns: 1fr;
          gap: 25px;
          margin: 15px auto;
          padding: 15px;
        }

        .saree-img {
          height: auto;
          max-height: 520px;
          aspect-ratio: 3 / 4;
          object-fit: contain;
        }

        .product-title {
          font-size: 34px;
        }

        .product-price {
          font-size: 26px;
        }
      }
    </style>
  `;
}

run();
