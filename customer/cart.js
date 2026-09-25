
const C = window.INDHUJA_CONFIG;

const cartKey = "indhuja_cart";

let cart = JSON.parse(localStorage.getItem(cartKey) || "[]");

const cartItems = document.getElementById("cartItems");
const cartSummary = document.getElementById("cartSummary");

function saveCart() {
  localStorage.setItem(cartKey, JSON.stringify(cart));
}

function money(amount) {
  return Number(amount).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  });
}

function renderCart() {
  cartItems.innerHTML = "";
  cartSummary.innerHTML = "";

  if (!cart.length) {
    cartItems.innerHTML = `
      <div style="text-align:center;padding:40px 15px">
        <h2>Your cart is empty 🛍️</h2>
        <p>Add your favourite sarees to continue.</p>
        <a href="index.html"
           style="display:inline-block;padding:12px 22px;
           background:#8b1e3f;color:white;text-decoration:none;
           border-radius:8px;margin-top:12px">
          Shop Sarees
        </a>
      </div>
    `;
    return;
  }

  let subtotal = 0;

  cart.forEach((item, index) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 1;
    const lineTotal = price * qty;

    subtotal += lineTotal;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <img src="${item.image_url || ""}"
           alt="Saree"
           onerror="this.style.display='none'">

      <div class="cart-details">
        <h3>${escapeHTML(item.name || "Saree")}</h3>

        <p>Code: ${escapeHTML(item.code || "N/A")}</p>

        <p>Price: ₹${money(price)}</p>

        <div class="qty-controls">
          <button data-action="minus" data-index="${index}">−</button>

          <span>${qty}</span>

          <button data-action="plus" data-index="${index}">+</button>
        </div>

        <p><b>Subtotal: ₹${money(lineTotal)}</b></p>

        <button class="remove-btn"
                data-action="remove"
                data-index="${index}">
          Remove
        </button>
      </div>
    `;

    cartItems.appendChild(div);
  });

  cartSummary.innerHTML = `
    <h2>Order Summary</h2>

    <div style="display:flex;justify-content:space-between;
                margin:15px 0">
      <span>Total Items</span>
      <b>${cart.reduce((sum, item) => sum + Number(item.qty || 1), 0)}</b>
    </div>

    <div style="display:flex;justify-content:space-between;
                margin:15px 0">
      <span>Subtotal</span>
      <b>₹${money(subtotal)}</b>
    </div>

    <p style="font-size:13px;color:#777">
      Delivery charges will be confirmed by our team.
    </p>

    <h2 style="margin-top:20px">Total: ₹${money(subtotal)}</h2>

    <button id="checkoutBtn"
            style="width:100%;padding:15px;background:#25D366;
            color:white;border:0;border-radius:8px;
            font-size:16px;font-weight:bold;margin-top:15px">
      Order on WhatsApp
    </button>
  `;

  document.getElementById("checkoutBtn")
    .addEventListener("click", checkout);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

cartItems.addEventListener("click", function(event) {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const index = Number(button.dataset.index);
  const action = button.dataset.action;

  if (!cart[index]) return;

  if (action === "plus") {
    cart[index].qty = Number(cart[index].qty || 1) + 1;
  }

  if (action === "minus") {
    cart[index].qty = Number(cart[index].qty || 1) - 1;

    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
  }

  if (action === "remove") {
    cart.splice(index, 1);
  }

  saveCart();
  renderCart();
});

function checkout() {
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }

  let subtotal = 0;

  let message =
    "Hi Indhuja Saree's! 👋\n\n" +
    "I would like to place an order for these sarees:\n\n";

  cart.forEach((item, index) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 1;
    const lineTotal = price * qty;

    subtotal += lineTotal;

    message +=
      `${index + 1}. ${item.name}\n` +
      `Code: ${item.code || "N/A"}\n` +
      `Price: ₹${money(price)}\n` +
      `Quantity: ${qty}\n` +
      `Subtotal: ₹${money(lineTotal)}\n`;

    if (item.image_url) {
      message += `Photo: ${item.image_url}\n`;
    }

    message += "\n";
  });

  message +=
    `Order Total: ₹${money(subtotal)}\n\n` +
    "Please confirm availability, delivery charges and delivery details.\n\n" +
    "My Name:\n" +
    "Delivery Address:\n" +
    "Contact Number:";

  const phone = C.WHATSAPP_NUMBER;

  const whatsappLink =
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  window.open(whatsappLink, "_blank");
}

renderCart();
                       
