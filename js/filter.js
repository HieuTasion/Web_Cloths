document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("productsGrid");
  const searchInput = document.getElementById("productSearch");
  const clearButton = document.getElementById("clearFilters");
  const sortSelect = document.getElementById("sortProducts");

  if (!grid || !searchInput) return;

  const products = window.SportxCatalog || [];

  function getSelectedValues(nodes) {
    return nodes.filter((node) => node.checked).map((node) => node.value);
  }

  function getCartStore() {
    return window.SportxCartStore || null;
  }

  function formatCurrency(amount) {
    return amount.toLocaleString("vi-VN") + "đ";
  }

  function getPriceMatch(price, selectedRanges) {
    if (!selectedRanges.length) return true;

    return selectedRanges.some((range) => {
      if (range === "under-500") return price < 500000;
      if (range === "500-1000") return price >= 500000 && price <= 1000000;
      if (range === "above-1000") return price > 1000000;
      return true;
    });
  }

  const getCardTheme = (badge) => {
    if (!badge) return { card: "card-neutral", badge: "badge-sale" };
    const b = badge.toLowerCase();
    if (b.includes("mới")) return { card: "card-new", badge: "badge-new" };
    if (b.includes("hot") || b.includes("chạy"))
      return { card: "card-hot", badge: "badge-hot" };
    if (
      b.includes("sale") ||
      b.includes("%") ||
      b.includes("giảm") ||
      b.includes("nổi bật")
    )
      return { card: "card-sale", badge: "badge-sale" };
    return { card: "card-neutral", badge: "badge-sale" };
  };

  function renderProducts() {
    const categoryFilters = Array.from(
      document.querySelectorAll('[data-filter="category"]'),
    );
    const genderFilters = Array.from(
      document.querySelectorAll('[data-filter="gender"]'),
    );
    const targetFilters = Array.from(
      document.querySelectorAll('[data-filter="target"]'),
    );
    const priceFilters = Array.from(
      document.querySelectorAll('[data-filter="price"]'),
    );
    const brandFilters = Array.from(
      document.querySelectorAll('[data-filter="brand"]'),
    );

    const keyword = searchInput.value.trim().toLowerCase();
    const categories = getSelectedValues(categoryFilters);
    const genders = getSelectedValues(genderFilters);
    const targets = getSelectedValues(targetFilters);
    const priceRanges = getSelectedValues(priceFilters);
    const brands = getSelectedValues(brandFilters);
    const sortValue = sortSelect?.value || "default";

    let filtered = products.filter((product) => {
      const matchesKeyword =
        !keyword || product.name.toLowerCase().includes(keyword);
      const matchesCategory =
        !categories.length || categories.includes(product.category);
      const matchesBrand = !brands.length || brands.includes(product.brand);
      const matchesGender = !genders.length || genders.includes(product.gender);
      const matchesTarget = !targets.length || targets.includes(product.target);
      const matchesPrice = getPriceMatch(product.price, priceRanges);
      return (
        matchesKeyword &&
        matchesCategory &&
        matchesBrand &&
        matchesGender &&
        matchesTarget &&
        matchesPrice
      );
    });

    if (sortValue === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortValue === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortValue === "rating-desc") {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="col-12">
          <div class="glass-card p-4 text-center">
            <h3 class="h4 mb-2">Không tìm thấy sản phẩm</h3>
            <p class="text-muted mb-0">Hãy thử đổi điều kiện bộ lọc.</p>
          </div>
        </div>
      `;
      getCartStore()?.updateCartBadge();
      return;
    }

    const getOldPriceHtml = (product) =>
      product.originalPrice
        ? `<span class="text-muted text-decoration-line-through small me-2" style="font-size: 0.85rem;">${formatCurrency(product.originalPrice)}</span>`
        : "";

    grid.innerHTML = filtered
      .map((product, index) => {
        const delay = (index % 6) * 100;
        const theme = getCardTheme(product.badge);
        return `
      <div class="col-sm-6 col-lg-4 mb-4" data-aos="fade-up" data-aos-delay="${delay}">
        <div class="card product-card ${theme.card} h-100">
          <div class="position-relative product-img-wrapper">
            ${product.badge ? `<span class="product-badge ${theme.badge}">${product.badge}</span>` : ""}
            <img src="${product.image}" class="card-img-top" alt="${product.name}">
          </div>
          <div class="card-body d-flex flex-column">
            
            <div class="mb-2">
              <span class="text-uppercase small text-accent fw-semibold d-block mb-1">${product.brand} - ${product.category}</span>
              <h3 class="h5 product-name mb-0">${product.name}</h3>
            </div>
            
            <div class="price-wrapper mt-auto">
              <div class="price fs-5 fw-bold text-accent">
                ${getOldPriceHtml(product)}
                <span>${formatCurrency(product.price)}</span>
              </div>
            </div>

            <div class="d-flex gap-2">
              <button class="btn btn-accent flex-grow-1 js-add-to-cart fw-bold" data-id="${product.id}">MUA NGAY</button>
              <a class="btn btn-outline-light d-inline-flex align-items-center justify-content-center" 
                 href="./product-detail.html?id=${product.id}&from=collection" 
                 style="width: 42px; height: 37px; min-width: 42px; padding: 0;">
                <i class="fa-solid fa-eye"></i>
              </a>
            </div>

          </div>
        </div>
      </div>
    `;
      })
      .join("");

    getCartStore()?.updateCartBadge();
  }

  grid.addEventListener("click", (event) => {
    const button = event.target.closest(".js-add-to-cart");

    if (!button) {
      // Xử lý click vào card để xem chi tiết
      const card = event.target.closest(".product-card");
      const viewLink = event.target.closest('a[href*="product-detail.html"]');

      if (viewLink) return;

      if (card) {
        const detailLink = card.querySelector('a[href*="product-detail.html"]');
        if (detailLink) window.location.href = detailLink.href;
      }
      return;
    }

    const product = products.find(
      (entry) => String(entry.id) === button.dataset.id,
    );
    if (!product || !window.SportxCartStore) return;

    // Kiểm tra trạng thái đăng nhập
    if (window.SportxAuth && !window.SportxAuth.getCurrentUser()) {
      if (window.Swal) {
        Swal.fire({
          icon: "info",
          title: "Yêu cầu đăng nhập",
          text: "Bạn cần có tài khoản SportX để thực hiện thêm sản phẩm vào giỏ hàng.",
          showCancelButton: true,
          confirmButtonColor: "#00b7ff",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Đăng nhập ngay",
          cancelButtonText: "Để sau",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "./login.html";
          }
        });
      }
      return;
    }

    window.SportxCartStore.upsertCartItem({
      id: String(product.id),
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });

    if (window.Swal) {
      Swal.fire({
        icon: "success",
        title: "Da them vao gio hang",
        text: `${product.name} da duoc luu lai.`,
        confirmButtonColor: "#00b7ff",
      });
    }
  });

  const allFilterInputs = [
    ...document.querySelectorAll('[data-filter="category"]'),
    ...document.querySelectorAll('[data-filter="gender"]'),
    ...document.querySelectorAll('[data-filter="target"]'),
    ...document.querySelectorAll('[data-filter="price"]'),
    ...document.querySelectorAll('[data-filter="brand"]'),
  ];

  allFilterInputs.forEach((input) => {
    input.addEventListener("change", renderProducts);
  });

  searchInput.addEventListener("input", renderProducts);
  if (sortSelect) sortSelect.addEventListener("change", renderProducts);

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      searchInput.value = "";
      if (sortSelect) sortSelect.value = "default";
      allFilterInputs.forEach((input) => {
        input.checked = false;
      });
      renderProducts();
    });
  }

  // Xử lý lọc theo thương hiệu từ URL
  const urlParams = new URLSearchParams(window.location.search);
  const brandParam = urlParams.get("brand");
  if (brandParam) {
    const brandCheckbox = document.querySelector(
      `[data-filter="brand"][value="${brandParam}"]`,
    );
    if (brandCheckbox) {
      brandCheckbox.checked = true;
    }
    // Nếu không có checkbox trong sidebar vẫn lọc được nhờ logic matchesBrand
    // Ta gọi render lại để áp dụng tham số URL
  }

  renderProducts();
});
