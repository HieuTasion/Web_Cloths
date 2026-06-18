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

  const urlParams = new URLSearchParams(window.location.search);
  const isBuyNowMode = urlParams.get("mode") === "buynow";

  // SỬA TẠI ĐÂY: Hàm lấy danh sách sản phẩm cần thanh toán
  const getCart = () => {
    if (isBuyNowMode) {
      const raw = sessionStorage.getItem("sportx_buy_now_item");
      try {
        return JSON.parse(raw) || [];
      } catch (e) {
        return [];
      }
    }

    // Nếu thanh toán từ giỏ hàng, ưu tiên đọc danh sách sản phẩm được tích chọn từ localStorage
    const selectedRaw = localStorage.getItem("sportx_checkout_items");
    try {
      return selectedRaw ? JSON.parse(selectedRaw) : [];
    } catch (e) {
      return [];
    }
  };

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

    // Tính tổng tiền dựa trên các mặt hàng thực tế được thanh toán
    const subtotal = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
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

    // SỬA TẠI ĐÂY: Xử lý xóa sản phẩm sau khi mua hàng thành công
    if (isBuyNowMode) {
      sessionStorage.removeItem("sportx_buy_now_item");
    } else if (window.SportxCartStore) {
      // Lấy toàn bộ giỏ hàng hiện tại ở cửa hàng
      const fullCart = window.SportxCartStore.readCart();

      // Chỉ giữ lại những sản phẩm KHÔNG nằm trong danh sách vừa chọn thanh toán
      const remainingCart = fullCart.filter((fullItem) => {
        const fullKey = window.SportxCartStore.getCartKey(fullItem);
        return !cart.some(
          (checkoutItem) =>
            window.SportxCartStore.getCartKey(checkoutItem) === fullKey,
        );
      });

      // Cập nhật lại giỏ hàng chính và xóa bộ nhớ tạm thanh toán chọn lọc
      window.SportxCartStore.writeCart(remainingCart);
      window.SportxCartStore.updateCartBadge();
      localStorage.removeItem("sportx_checkout_items");
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

  function autoFillUserInfo() {
    const userRaw =
      sessionStorage.getItem("sportx_user") ||
      localStorage.getItem("sportx_user");
    if (!userRaw) return;

    try {
      const user = JSON.parse(userRaw);
      const emailInput = document.getElementById("email");
      const nameInput = document.getElementById("fullName");

      if (user && user.email) {
        // Điền Email từ phiên đăng nhập
        if (emailInput && !emailInput.value) {
          emailInput.value = user.email;
        }

        // Tìm tên từ danh sách tài khoản đã đăng ký
        const accountsRaw = localStorage.getItem("sportx_registered_accounts");
        if (accountsRaw) {
          const accounts = JSON.parse(accountsRaw);
          const account = accounts[user.email.toLowerCase()];
          if (account && account.name && nameInput && !nameInput.value) {
            nameInput.value = account.name;
          }
        }
      }
    } catch (e) {
      console.error("Lỗi khi tự động điền thông tin người dùng:", e);
    }
  }

  function updateBreadcrumb() {
    const breadcrumbOl = document.querySelector(".breadcrumb");
    if (!breadcrumbOl) return;

    if (isBuyNowMode) {
      const cart = getCart();
      if (cart.length > 0) {
        const item = cart[0];
        breadcrumbOl.innerHTML = `
          <li class="breadcrumb-item"><a href="./index.html">Trang chủ</a></li>
          <li class="breadcrumb-item">Mua ngay</li>
          <li class="breadcrumb-item active" aria-current="page">Thanh toán giỏ hàng</li>
        `;
      }
    } else {
      breadcrumbOl.innerHTML = `
        <li class="breadcrumb-item"><a href="./index.html">Trang chủ</a></li>
        <li class="breadcrumb-item active" aria-current="page">Thanh toán giỏ hàng</li>
      `;
    }
  }

  renderSummary();
  autoFillUserInfo();
  updateBreadcrumb();
});
