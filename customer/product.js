
const C = window.INDHUJA_CONFIG;

const sb = supabase.createClient(
  C.SUPABASE_URL,
  C.SUPABASE_KEY
);

const id = new URLSearchParams(location.search).get("id");

const phone = C.WHATSAPP_NUMBER;

const CART_KEY = "indhuja_cart";

// Default WhatsApp link
wa.href = `https://wa.me/${phone}`;

// Get existing cart
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

// Save cart
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Cart count
function updateCartCount() {
  const cart = getCart();

  const count = cart.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  const el = document.getElementById("cartCount");

  if (el) {
    el.textContent = count;
    el.style.display = count ? "inline-flex" : "none";
  }
}

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

  // WhatsApp order message
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

        <!-- ADD TO CART BUTTON -->
        <button
          type="button"
          id="addToCartBtn"
          class="cart-btn"
        >
          🛒 ADD TO CART
        </button>

        <p
          id="cartMessage"
          class="cart-message"
        ></p>

        <!-- VIEW CART -->
        <a
          href="cart.html"
          class="view-cart-btn"
        >
          VIEW CART / CHECKOUT
          <span id="cartCount">0</span>
        </a>

        <!-- EXISTING WHATSAPP ORDER -->
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
        cursor: zoom-in;
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

      /* ADD TO CART */
      .cart-btn {
        display: flex;
        width: 100%;
        align-items: center;
        justify-content: center;
        background: #b88a35;
        color: white;
        padding: 18px 24px;
        border: none;
        font-size: 15px;
        font-weight: bold;
        letter-spacing: 1px;
        border-radius: 4px;
        margin-top: 25px;
        cursor: pointer;
      }

      .cart-btn:hover {
        background: #9b7128;
      }

      .cart-message {
        color: #237544;
        font-size: 14px;
        font-weight: bold;
        min-height: 18px;
        margin: 10px 0;
      }

      /* VIEW CART */
      .view-cart-btn {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #f1e6d5;
        color: #65152e;
        padding: 16px 22px;
        text-decoration: none;
        font-size: 13px;
        font-weight: bold;
        border: 1px solid #d8c5a6;
        border-radius: 4px;
        margin-top: 10px;
      }

      #cartCount {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 25px;
        height: 25px;
        padding: 0 6px;
        border-radius: 50%;
        background: #65152e;
        color: white;
      }

      /* WHATSAPP ORDER */
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
        margin-top: 15px;
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

  // ADD TO CART ACTION
  document
    .getElementById("addToCartBtn")
    .addEventListener("click", () => {

      const cart = getCart();

      const existing = cart.find(
        item => String(item.id) === String(x.id)
      );

      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({
          id: x.id,
          name: x.name,
          code: x.code || "",
          price: Number(x.price),
          image_url: x.image_url || "",
          collection: x.collections?.name || "",
          qty: 1
        });
      }

      saveCart(cart);
      updateCartCount();

      document.getElementById("cartMessage").textContent =
        "✓ Saree added to your cart!";
    });

  updateCartCount();
}

run();
