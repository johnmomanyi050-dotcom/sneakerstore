// ---------------------------
// Theme toggle (persists)
// ---------------------------
(function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") document.documentElement.setAttribute("data-theme", "dark");
})();

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    themeToggle.textContent = isDark ? "🌞" : "🌙";
    themeToggle.addEventListener("click", () => {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      if (dark) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙";
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "🌞";
      }
    });
  }

  // ---------------------------
  // Greeting + today's date (homepage)
  // ---------------------------
  const greetingEl = document.getElementById("greeting");
  const todayDateEl = document.getElementById("todayDate");
  if (greetingEl && todayDateEl) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    greetingEl.textContent = `${greeting}, welcome to SneakerStore`;
    todayDateEl.textContent = new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  // ---------------------------
  // Auth (sign in / sign out)
  // ---------------------------
  const authLink = document.getElementById("authLink");
  function refreshAuthLink() {
    const user = localStorage.getItem("user");
    if (authLink) {
      if (user) {
        authLink.innerHTML = `<a href="#" id="signout">Sign Out</a>`;
        const signoutBtn = document.getElementById("signout");
        if (signoutBtn) {
          signoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("user");
            // Optional: also clear cart on sign out
            // localStorage.removeItem("cart");
            window.location.href = "index.html";
          });
        }
      } else {
        authLink.innerHTML = `<a href="signin.html">Sign In</a>`;
      }
    }
  }
  refreshAuthLink();

  const signinForm = document.getElementById("signinForm");
  if (signinForm) {
    signinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const msg = document.getElementById("signinMessage");

      // Simple validation per assignment: email must contain '@'
      if (!email || !email.includes("@")) {
        msg.textContent = "Please enter a valid email that contains '@'.";
        return;
      }
      if (!password) {
        msg.textContent = "Please enter your password.";
        return;
      }

      localStorage.setItem("user", email);
      msg.textContent = "Signed in successfully!";
      setTimeout(() => (window.location.href = "index.html"), 800);
    });
  }

  // ---------------------------
  // Contact form validation
  // ---------------------------
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");
    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const messageError = document.getElementById("messageError");
    const successEl = document.getElementById("formSuccess");

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;

      if (!nameInput.value.trim()) { nameError.textContent = "Please enter your name."; valid = false; } else { nameError.textContent = ""; }
      const emailVal = emailInput.value.trim();
      if (!emailVal || !emailVal.includes("@")) { emailError.textContent = "Please enter a valid email that contains '@'."; valid = false; } else { emailError.textContent = ""; }
      if (!messageInput.value.trim()) { messageError.textContent = "Please enter a message."; valid = false; } else { messageError.textContent = ""; }

      if (valid) {
        successEl.hidden = false;
        contactForm.reset();
      }
    });
  }

  // ---------------------------
  // Cart with quantities + totals
  // ---------------------------
  function getCart() {
    return JSON.parse(localStorage.getItem("cart") || "{}"); // {id: {name, price, qty}}
  }
  function setCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
  }
  function updateCartCount() {
    const cartCountEl = document.getElementById("cartCount");
    if (!cartCountEl) return;
    const cart = getCart();
    const totalItems = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
    cartCountEl.textContent = String(totalItems);
  }
  updateCartCount();

  // Add to cart buttons (products page)
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = Number(btn.dataset.price);
      const cart = getCart();

      if (!cart[id]) cart[id] = { name, price, qty: 1 };
      else cart[id].qty += 1;

      setCart(cart);

      btn.textContent = "Added!";
      setTimeout(() => (btn.textContent = "Add to Cart"), 800);
    });
  });

  // Render cart page
  const cartItemsEl = document.getElementById("cartItems");
  const cartTotalEl = document.getElementById("cartTotal");
  const clearCartBtn = document.getElementById("clearCart");

  function renderCart() {
    if (!cartItemsEl || !cartTotalEl) return;
    const cart = getCart();
    const items = Object.entries(cart); // [[id, item], ...]

    if (items.length === 0) {
      cartItemsEl.innerHTML = "<li>Your cart is empty.</li>";
      cartTotalEl.textContent = "";
      return;
    }

    let total = 0;
    cartItemsEl.innerHTML = items.map(([id, item]) => {
      const lineTotal = item.price * item.qty;
      total += lineTotal;
      return `
        <li class="cart-line">
          <span>${item.name}</span>
          <span>KSh ${item.price} × ${item.qty} = KSh ${lineTotal}</span>
          <span class="qty-controls">
            <button class="qty-btn" data-action="dec" data-id="${id}">–</button>
            <button class="qty-btn" data-action="inc" data-id="${id}">+</button>
            <button class="qty-btn remove" data-action="remove" data-id="${id}">Remove</button>
          </span>
        </li>
      `;
    }).join("");

    cartTotalEl.textContent = `Total: KSh ${total}`;
  }
  renderCart();

  // Quantity controls (on cart page)
  if (cartItemsEl) {
    cartItemsEl.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (!target.classList.contains("qty-btn")) return;

      const action = target.dataset.action;
      const id = target.dataset.id;
      const cart = getCart();
      const item = cart[id];
      if (!item) return;

      if (action === "inc") item.qty += 1;
      if (action === "dec") item.qty = Math.max(0, item.qty - 1);
      if (action === "remove") delete cart[id];
      if (item.qty === 0) delete cart[id];

      setCart(cart);
      renderCart();
    });
  }

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      setCart({});
      renderCart();
    });
  }
});