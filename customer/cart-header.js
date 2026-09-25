
function updateHeaderCartCount() {
  try {
    const cart = JSON.parse(
      localStorage.getItem("indhuja_cart") || "[]"
    );

    const count = cart.reduce(
      (total, item) => total + Number(item.qty || 1),
      0
    );

    document.querySelectorAll("#headerCartCount").forEach(
      function (badge) {
        badge.textContent = count;
      }
    );
  } catch (error) {
    console.log("Cart count error:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  updateHeaderCartCount();
});
