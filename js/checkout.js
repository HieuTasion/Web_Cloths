document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checkoutForm");
  const summaryWrap = document.getElementById("orderSummary");
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("total");
  const emptyState = document.getElementById("emptyCheckoutState");

  if (!form || !summaryWrap || !subtotalEl || !totalEl) return;

  const currency = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

  const getCart = () =>
    window.SportxCartStore ? window.SportxCartStore.readCart() : [];

  function renderSummary() {
    const cart = getCart();

    if (window.SportxCartStore) {
      window.SportxCartStore.updateCartBadge();
    }

    if (!cart.length) {
      summaryWrap.innerHTML = "";
      emptyState?.classList.remove("d-none");
      subtotalEl.textContent = currency.format(0);
      totalEl.textContent = currency.format(0);
      return;
    }

    emptyState?.classList.add("d-none");

    summaryWrap.innerHTML = cart
      .map((item) => {
        const variantText = [item.size ? `Size: ${item.size}` : ""]
          .filter(Boolean)
          .join(" | ");
        return `
        <div class="order-item">
          <img src="${item.image}" alt="${item.name}">
          <div class="flex-grow-1">
            <div class="fw-semibold">${item.name}</div>
            <small class="text-muted">${variantText || "Phiên bản mặc định"}</small>
          </div>
          <div class="text-end">
            <div class="fw-semibold">${currency.format(item.price * item.quantity)}</div>
            <small class="text-muted">x${item.quantity}</small>
          </div>
        </div>
      `;
      })
      .join("");

    const subtotal = window.SportxCartStore
      ? window.SportxCartStore.getCartTotal(cart)
      : 0;
    subtotalEl.textContent = currency.format(subtotal);
    totalEl.textContent = currency.format(subtotal);
  }

  function setInvalid(input, message) {
    input.classList.add("is-invalid");
    const feedback = input.parentElement.querySelector(".invalid-feedback");
    if (feedback) feedback.textContent = message;
  }

  function clearErrors() {
    form
      .querySelectorAll(".is-invalid")
      .forEach((input) => input.classList.remove("is-invalid"));
    form.querySelectorAll(".invalid-feedback").forEach((feedback) => {
      feedback.textContent = "";
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();

    const cart = getCart();
    if (!cart.length) {
      if (window.Swal) {
        Swal.fire({
          icon: "info",
          title: "Giỏ hàng trống",
          text: "Vui lòng thêm sản phẩm trước khi thanh toán.",
          confirmButtonColor: "#00b7ff",
        });
      }
      return;
    }

    const nameInput = document.getElementById("fullName");
    const phoneInput = document.getElementById("phone");
    const addressInput = document.getElementById("address");
    const emailInput = document.getElementById("email");

    const nameValue = nameInput.value.trim();
    const phoneValue = phoneInput.value.trim();
    const addressValue = addressInput.value.trim();
    const emailValue = emailInput.value.trim();
    const phonePattern = /^[0-9]{10}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let valid = true;

    if (!nameValue) {
      setInvalid(nameInput, "Vui lòng nhập họ và tên.");
      valid = false;
    }

    if (!phoneValue) {
      setInvalid(phoneInput, "Vui lòng nhập số điện thoại.");
      valid = false;
    } else if (!phonePattern.test(phoneValue)) {
      setInvalid(phoneInput, "Số điện thoại phải gồm 10 chữ số.");
      valid = false;
    }

    if (!addressValue) {
      setInvalid(addressInput, "Vui lòng nhập địa chỉ giao hàng.");
      valid = false;
    }

    if (emailValue && !emailPattern.test(emailValue)) {
      setInvalid(emailInput, "Địa chỉ email không hợp lệ.");
      valid = false;
    }

    if (!valid) return;

    if (window.SportxCartStore) {
      window.SportxCartStore.writeCart([]);
      window.SportxCartStore.updateCartBadge();
    }

    if (window.Swal) {
      Swal.fire({
        icon: "success",
        title: "Chúc mừng, đơn hàng đã được đặt thành công!",
        text: "Đơn hàng của bạn đã được xác nhận.",
        confirmButtonColor: "#00b7ff",
      }).then(() => {
        window.location.href = "./index.html";
      });
      return;
    }

    window.location.href = "./index.html";
  });

  renderSummary();
});
