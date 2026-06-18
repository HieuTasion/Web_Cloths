document.addEventListener("DOMContentLoaded", () => {
  const brandProductsGrid = document.getElementById("brandProductsGrid");
  const brandTitle = document.getElementById("brandTitle");
  const searchInput = document.getElementById("productSearch");
  const sortSelect = document.getElementById("sortProducts");
  const clearButton = document.getElementById("clearFilters");

  const catalog = window.SportxCatalog || [];
  const urlParams = new URLSearchParams(window.location.search);
  const currentBrand = urlParams.get("brand") || "";

  function getSelectedValues(nodes) {
    return nodes.filter((node) => node.checked).map((node) => node.value);
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
    return { card: "card-sale", badge: "badge-sale" };
  };

  function renderProducts() {
    const breadcrumbOl = document.querySelector(".breadcrumb");

    if (!currentBrand) {
      brandTitle.innerText = "Vui lòng chọn một thương hiệu";
      if (breadcrumbOl) {
        breadcrumbOl.innerHTML = `
          <li class="breadcrumb-item"><a href="./index.html">Trang chủ</a></li>
          <li class="breadcrumb-item active" aria-current="page">Thương hiệu</li>
        `;
      }
      return;
    }

    brandTitle.innerText = `Thương hiệu: ${currentBrand}`;

    // Cập nhật Breadcrumb khi có thương hiệu cụ thể
    if (breadcrumbOl) {
      breadcrumbOl.innerHTML = `
        <li class="breadcrumb-item"><a href="./index.html">Trang chủ</a></li>
        <li class="breadcrumb-item"><a href="./brands.html">Thương hiệu</a></li>
        <li class="breadcrumb-item active" aria-current="page">${currentBrand}</li>
      `;
    }

    const genderFilters = Array.from(
      document.querySelectorAll('[data-filter="gender"]'),
    );
    const priceFilters = Array.from(
      document.querySelectorAll('[data-filter="price"]'),
    );

    const keyword = searchInput.value.trim().toLowerCase();
    const genders = getSelectedValues(genderFilters);
    const priceRanges = getSelectedValues(priceFilters);
    const sortValue = sortSelect?.value || "default";

    let filtered = catalog.filter((p) => {
      // So khớp không phân biệt hoa thường và xóa khoảng trắng để chính xác tuyệt đối
      const isRightBrand =
        p.brand.trim().toLowerCase() === currentBrand.trim().toLowerCase();

      const matchesKeyword = !keyword || p.name.toLowerCase().includes(keyword);
      const matchesGender = !genders.length || genders.includes(p.gender);
      const matchesPrice = getPriceMatch(p.price, priceRanges);

      return isRightBrand && matchesKeyword && matchesGender && matchesPrice;
    });

    if (sortValue === "price-asc") filtered.sort((a, b) => a.price - b.price);
    else if (sortValue === "price-desc")
      filtered.sort((a, b) => b.price - a.price);

    if (!filtered.length) {
      brandProductsGrid.innerHTML =
        '<div class="col-12 text-center text-muted py-5">Không có sản phẩm nào.</div>';
      return;
    }

    brandProductsGrid.innerHTML = filtered
      .map((product) => {
        const theme = getCardTheme(product.badge);
        const oldPriceHtml = product.originalPrice
          ? `<span class="text-muted text-decoration-line-through small me-2">${product.originalPrice.toLocaleString()}đ</span>`
          : "";

        return `
        <div class="col-sm-6 col-lg-4 mb-4">
          <div class="card product-card ${theme.card} h-100">
            <div class="position-relative product-img-wrapper">
              ${product.badge ? `<span class="product-badge ${theme.badge}">${product.badge}</span>` : ""}
              <img src="${product.image}" class="card-img-top" alt="${product.name}">
            </div>
            <div class="card-body d-flex flex-column">
              <div class="mb-2">
                <span class="text-uppercase small text-accent fw-semibold d-block mb-1">${product.category}</span>
                <h3 class="h5 product-name mb-0">${product.name}</h3>
              </div>
              <div class="price-wrapper mt-auto mb-3">
                <div class="price fs-5 fw-bold text-accent">${oldPriceHtml}${product.price.toLocaleString()}đ</div>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-accent flex-grow-1 js-add-to-cart fw-bold" data-id="${product.id}">MUA NGAY</button>
                <a class="btn btn-outline-light d-flex align-items-center justify-content-center" href="./product-detail.html?id=${product.id}&from=brand&val=${encodeURIComponent(currentBrand)}" style="width: 42px;">
                  <i class="fa-solid fa-eye"></i>
                </a>
              </div>
            </div>
          </div>
        </div>`;
      })
      .join("");
  }

  // Sự kiện thêm giỏ hàng
  brandProductsGrid.addEventListener("click", (event) => {
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

    const product = catalog.find(
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

    if (product && window.SportxCartStore) {
      window.SportxCartStore.upsertCartItem({
        id: String(product.id),
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
      Swal.fire({
        icon: "success",
        title: "Đã thêm vào giỏ",
        text: product.name,
        confirmButtonColor: "#00b7ff",
      });
    }
  });

  // Lắng nghe thay đổi bộ lọc
  [searchInput, sortSelect].forEach((el) =>
    el?.addEventListener("input", renderProducts),
  );
  document
    .querySelectorAll("[data-filter]")
    .forEach((el) => el.addEventListener("change", renderProducts));

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      searchInput.value = "";
      sortSelect.value = "default";
      document
        .querySelectorAll("[data-filter]")
        .forEach((el) => (el.checked = false));
      renderProducts();
    });
  }

  renderProducts();
  if (window.SportxCartStore) window.SportxCartStore.updateCartBadge();
});
