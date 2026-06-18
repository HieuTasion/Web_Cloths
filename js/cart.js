document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("cartTableBody");
  const totalPrice = document.getElementById("cartTotal");
  const emptyState = document.getElementById("cartEmpty");
  const tableWrap = document.getElementById("cartTableWrap");
  const checkoutButton = document.getElementById("checkoutBtn");
  const cartItemCount = document.getElementById("cartItemCount");

  if (
    !tableBody ||
    !totalPrice ||
    !emptyState ||
    !tableWrap ||
    !window.SportxCartStore
  ) {
    return;
  }

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  function renderCart() {
    const cart = window.SportxCartStore.readCart();
    const total = window.SportxCartStore.getCartTotal(cart);
    const count = window.SportxCartStore.getCartCount(cart);

    tableBody.innerHTML = "";
    totalPrice.textContent = currency.format(total);
    if (cartItemCount) {
      cartItemCount.textContent = count;
    }
    window.SportxCartStore.updateCartBadge();

    if (!cart.length) {
      emptyState.classList.remove("d-none");
      tableWrap.classList.add("d-none");
      return;
    }

    emptyState.classList.add("d-none");
    tableWrap.classList.remove("d-none");

    cart.forEach((item, index) => {
      const row = document.createElement("tr");
      const itemKey = window.SportxCartStore.getCartKey(item);
      const variantLabel = [
        item.size ? `Size: ${item.size}` : "",
        item.color ? `Màu: ${item.color}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>
          <div class="d-flex align-items-center gap-3">
            <img src="${item.image}" alt="${item.name}" width="64" height="64" class="rounded-3 object-fit-cover">
            <div>
              <div class="fw-semibold">${item.name}</div>
              <small class="text-white-50">${variantLabel || "Phiên bản mặc định"}</small>
            </div>
          </div>
        </td>
        <td>${currency.format(item.price)}</td>
        <td>
          <div class="btn-group" role="group" aria-label="Quantity controls">
            <button class="btn btn-outline-light btn-sm quantity-btn" data-action="decrease" data-key="${itemKey}">-</button>
            <button class="btn btn-outline-light btn-sm disabled">${item.quantity}</button>
            <button class="btn btn-outline-light btn-sm quantity-btn" data-action="increase" data-key="${itemKey}">+</button>
          </div>
        </td>
        <td>${currency.format(item.price * item.quantity)}</td>
        <td>
          <button class="btn btn-sm btn-danger remove-btn" data-key="${itemKey}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  tableBody.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".remove-btn");
    const quantityButton = event.target.closest(".quantity-btn");
    let cart = window.SportxCartStore.readCart();

    if (removeButton) {
      cart = cart.filter(
        (item) =>
          window.SportxCartStore.getCartKey(item) !== removeButton.dataset.key,
      );
      window.SportxCartStore.writeCart(cart);
      renderCart();
      return;
    }

    if (quantityButton) {
    
      if (window.SportxAuth && !window.SportxAuth.getCurrentUser()) {
        Swal.fire({
          icon: "info",
          title: "Yêu cầu đăng nhập",
          text: "Vui lòng đăng nhập để quản lý giỏ hàng của bạn.",
          showCancelButton: true,
          confirmButtonColor: "#00b7ff",
          confirmButtonText: "Đăng nhập",
          cancelButtonText: "Đóng"
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "./login.html";
          }
        });
        return;
      }

      const item = cart.find(
        (entry) =>
          window.SportxCartStore.getCartKey(entry) ===
          quantityButton.dataset.key,
      );
      if (!item) return;

      if (quantityButton.dataset.action === "increase") {
        item.quantity += 1;
      } else if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        cart = cart.filter(
          (entry) =>
            window.SportxCartStore.getCartKey(entry) !==
            quantityButton.dataset.key,
        );
      }

      window.SportxCartStore.writeCart(cart);
      renderCart();
    }
  });

  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      // Chặn thanh toán nếu chưa đăng nhập
      if (window.SportxAuth && !window.SportxAuth.getCurrentUser()) {
        Swal.fire({
          icon: "warning",
          title: "Bạn chưa đăng nhập",
          text: "Vui lòng đăng nhập để tiến hành thanh toán đơn hàng.",
          showCancelButton: true,
          confirmButtonColor: "#00b7ff",
          confirmButtonText: "Đăng nhập ngay",
          cancelButtonText: "Quay lại"
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "./login.html";
          }
        });
        return;
      }

      const cart = window.SportxCartStore.readCart();
      if (!cart.length) {
        if (window.Swal) {
          Swal.fire({
            icon: "info",
            title: "Giỏ hàng trống",
            text: "Vui lòng chọn mua sản phẩm trước khi thanh toán.",
            confirmButtonColor: "#00b7ff",
          });
        }
        return;
      }

      window.location.href = "./checkout.html";
    });
  }

  renderCart();
});
