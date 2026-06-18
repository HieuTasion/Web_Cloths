document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("cartTableBody");
  const totalPrice = document.getElementById("cartTotal");
  const emptyState = document.getElementById("cartEmpty");
  const tableWrap = document.getElementById("cartTableWrap");
  const checkoutButton = document.getElementById("checkoutBtn");
  const cartItemCount = document.getElementById("cartItemCount");
  const selectAllBtn = document.getElementById("selectAllBtn");

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


  let selectedKeys = [];

  function renderCart() {
    const cart = window.SportxCartStore.readCart();
    const count = window.SportxCartStore.getCartCount(cart);

    tableBody.innerHTML = "";
    if (cartItemCount) {
      cartItemCount.textContent = count;
    }
    window.SportxCartStore.updateCartBadge();

    if (!cart.length) {
      emptyState.classList.remove("d-none");
      tableWrap.classList.add("d-none");
      totalPrice.textContent = currency.format(0);
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


      const isChecked = selectedKeys.includes(itemKey) ? "checked" : "";

      row.innerHTML = `
        <td>
          <input type="checkbox" class="form-check-input item-checkbox" data-key="${itemKey}" ${isChecked} style="transform: scale(1.2); cursor: pointer;">
        </td>
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
            <button class="btn btn-outline-dark btn-sm quantity-btn" data-action="decrease" data-key="${itemKey}">-</button>
            <button class="btn btn-outline-dark btn-sm disabled" style="opacity: 1; color: #000;">${item.quantity}</button>
            <button class="btn btn-outline-dark btn-sm quantity-btn" data-action="increase" data-key="${itemKey}">+</button>
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

    calculateSelectedTotal();
  }

 
  function calculateSelectedTotal() {
    const cart = window.SportxCartStore.readCart();
    let selectedTotal = 0;

    cart.forEach((item) => {
      const itemKey = window.SportxCartStore.getCartKey(item);
      if (selectedKeys.includes(itemKey)) {
        selectedTotal += item.price * item.quantity;
      }
    });

    totalPrice.textContent = currency.format(selectedTotal);
  }


  tableBody.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".remove-btn");
    const quantityButton = event.target.closest(".quantity-btn");
    let cart = window.SportxCartStore.readCart();

   
    if (event.target.classList.contains("item-checkbox")) {
      const key = event.target.dataset.key;
      if (event.target.checked) {
        if (!selectedKeys.includes(key)) selectedKeys.push(key);
      } else {
        selectedKeys = selectedKeys.filter((k) => k !== key);
      }
      calculateSelectedTotal();
      return;
    }

    if (removeButton) {
      const keyToRemove = removeButton.dataset.key;
      cart = cart.filter((item) => window.SportxCartStore.getCartKey(item) !== keyToRemove);
      selectedKeys = selectedKeys.filter((k) => k !== keyToRemove); // Xóa khỏi danh sách chọn thanh toán nếu có
      window.SportxCartStore.writeCart(cart);
      renderCart();
      return;
    }

    if (quantityButton) {
      if (window.SportxAuth && !window.SportxAuth.getCurrentUser()) {
        showLoginAlert();
        return;
      }

      const item = cart.find((entry) => window.SportxCartStore.getCartKey(entry) === quantityButton.dataset.key);
      if (!item) return;

      if (quantityButton.dataset.action === "increase") {
        item.quantity += 1;
      } else if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        cart = cart.filter((entry) => window.SportxCartStore.getCartKey(entry) !== quantityButton.dataset.key);
        selectedKeys = selectedKeys.filter((k) => k !== quantityButton.dataset.key);
      }

      window.SportxCartStore.writeCart(cart);
      renderCart();
    }
  });


  if (selectAllBtn) {
    selectAllBtn.addEventListener("click", () => {
      const cart = window.SportxCartStore.readCart();
      const checkboxes = tableBody.querySelectorAll(".item-checkbox");
      
      if (selectedKeys.length === cart.length) {
        // Nếu đã chọn hết thì bấm vào sẽ hủy chọn toàn bộ
        selectedKeys = [];
        checkboxes.forEach(cb => cb.checked = false);
        selectAllBtn.innerHTML = `<i class="fa-regular fa-square-check me-1"></i>Chọn tất cả`;
      } else {
   
        selectedKeys = cart.map(item => window.SportxCartStore.getCartKey(item));
        checkboxes.forEach(cb => cb.checked = true);
        selectAllBtn.innerHTML = `<i class="fa-solid fa-square-minus me-1"></i>Hủy chọn tất cả`;
      }
      calculateSelectedTotal();
    });
  }

  function showLoginAlert() {
    Swal.fire({
      icon: "info",
      title: "Yêu cầu đăng nhập",
      text: "Vui lòng đăng nhập để quản lý giỏ hàng của bạn.",
      showCancelButton: true,
      confirmButtonColor: "#00b7ff",
      confirmButtonText: "Đăng nhập",
      cancelButtonText: "Đóng",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "./login.html";
      }
    });
  }


  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      if (window.SportxAuth && !window.SportxAuth.getCurrentUser()) {
        Swal.fire({
          icon: "warning",
          title: "Bạn chưa đăng nhập",
          text: "Vui lòng đăng nhập để tiến hành thanh toán đơn hàng.",
          showCancelButton: true,
          confirmButtonColor: "#00b7ff",
          confirmButtonText: "Đăng nhập ngay",
          cancelButtonText: "Quay lại",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "./login.html";
          }
        });
        return;
      }

      const cart = window.SportxCartStore.readCart();
      
      // Lọc ra danh sách các sản phẩm thực tế được tick chọn dựa trên mảng selectedKeys
      const checkoutItems = cart.filter((item) => selectedKeys.includes(window.SportxCartStore.getCartKey(item)));

      if (!checkoutItems.length) {
        Swal.fire({
          icon: "info",
          title: "Chưa chọn sản phẩm",
          text: "Vui lòng tích chọn ít nhất một sản phẩm trong giỏ hàng để tiến hành thanh toán.",
          confirmButtonColor: "#00b7ff",
        });
        return;
      }

     
      localStorage.setItem("sportx_checkout_items", JSON.stringify(checkoutItems));
      window.location.href = "./checkout.html";
    });
  }

  renderCart();
});