document.addEventListener("DOMContentLoaded", () => {
  const sportProductsSection = document.getElementById("sportProductsSection");
  const sportProductsGrid = document.getElementById("sportProductsGrid");
  const selectedSportTitle = document.getElementById("selectedSportTitle");
  const searchInput = document.getElementById("productSearch");
  const sortSelect = document.getElementById("sortProducts");
  const clearButton = document.getElementById("clearFilters");

  const catalog = window.SportxCatalog || [];
  let currentSport = "";

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
    if (
      b.includes("sale") ||
      b.includes("%") ||
      b.includes("giảm") ||
      b.includes("nổi bật")
    )
      return { card: "card-sale", badge: "badge-sale" };
    return { card: "card-neutral", badge: "badge-sale" };
  };

  window.filterBySport = (sportName) => {
    currentSport = sportName;
    renderProducts();
  };

  function renderProducts() {
    const breadcrumbOl = document.querySelector(".breadcrumb");

    // Nếu chưa chọn môn nào, hiển thị mặc định
    if (!currentSport) {
      if (breadcrumbOl) {
        breadcrumbOl.innerHTML = `
          <li class="breadcrumb-item"><a href="./index.html">Trang chủ</a></li>
          <li class="breadcrumb-item active" aria-current="page">Môn thể thao</li>
        `;
      }
      return;
    }

    selectedSportTitle.innerText = `TRANG THIẾT BỊ: ${currentSport.toUpperCase()}`;

    // Cập nhật Breadcrumb khi có môn thể thao cụ thể
    if (breadcrumbOl) {
      breadcrumbOl.innerHTML = `
        <li class="breadcrumb-item"><a href="./index.html">Trang chủ</a></li>
        <li class="breadcrumb-item"><a href="./sports.html">Môn thể thao</a></li>
        <li class="breadcrumb-item active" aria-current="page">${currentSport}</li>
      `;
    }

    const genderFilters = Array.from(
      document.querySelectorAll('[data-filter="gender"]'),
    );
    const targetFilters = Array.from(
      document.querySelectorAll('[data-filter="target"]'),
    );
    const priceFilters = Array.from(
      document.querySelectorAll('[data-filter="price"]'),
    );

    const keyword = searchInput.value.trim().toLowerCase();
    const genders = getSelectedValues(genderFilters);
    const targets = getSelectedValues(targetFilters);
    const priceRanges = getSelectedValues(priceFilters);
    const sortValue = sortSelect?.value || "default";

    // Lọc: Luôn ưu tiên lọc theo môn thể thao trước, sau đó mới lọc thêm các bộ lọc phụ
    let filtered = catalog.filter((p) => {
      const isRightSport = p.sport === currentSport;
      const matchesKeyword = !keyword || p.name.toLowerCase().includes(keyword);
      const matchesGender = !genders.length || genders.includes(p.gender);
      const matchesTarget = !targets.length || targets.includes(p.target);
      const matchesPrice = getPriceMatch(p.price, priceRanges);

      return (
        isRightSport &&
        matchesKeyword &&
        matchesGender &&
        matchesTarget &&
        matchesPrice
      );
    });

    // Sắp xếp
    if (sortValue === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortValue === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    }

    if (!filtered.length) {
      sportProductsGrid.innerHTML =
        '<div class="col-12 text-center text-muted py-5">Không tìm thấy sản phẩm nào khớp với bộ lọc.</div>';
      return;
    }

    sportProductsGrid.innerHTML = filtered
      .map((product, index) => {
        // Tính toán delay cho hiệu ứng AOS (cứ mỗi hàng 3 card sẽ lặp lại hiệu ứng)
        const delay = (index % 3) * 100;

        const theme = getCardTheme(product.badge);

        // ĐÃ SỬA: Kiểm tra và tạo giá cũ (originalPrice) nếu có trong data sản phẩm
        const oldPriceHtml = product.originalPrice
          ? `<span class="text-muted text-decoration-line-through small me-2" style="font-size: 0.85rem;">${product.originalPrice.toLocaleString()}đ</span>`
          : "";

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
                  <div class="price fs-5 fw-bold text-accent">${oldPriceHtml}${product.price.toLocaleString()}đ</div>
                </div>

                <div class="d-flex gap-2">
                  <button class="btn btn-accent flex-grow-1 js-add-to-cart fw-bold" data-id="${product.id}">MUA NGAY</button>
                  <a class="btn btn-outline-light d-inline-flex align-items-center justify-content-center" 
                     href="./product-detail.html?id=${product.id}&from=sport&val=${encodeURIComponent(currentSport)}" 
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
  }

  // Xử lý thêm vào giỏ hàng
  sportProductsGrid.addEventListener("click", (event) => {
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
        title: "Đã thêm vào giỏ",
        text: product.name,
        confirmButtonColor: "#00b7ff",
      });
    }
  });

  if (window.SportxCartStore) window.SportxCartStore.updateCartBadge();

  // Gán sự kiện cho các ô nhập liệu
  const allFilterInputs = [
    ...document.querySelectorAll('[data-filter="gender"]'),
    ...document.querySelectorAll('[data-filter="target"]'),
    ...document.querySelectorAll('[data-filter="price"]'),
  ];

  allFilterInputs.forEach((input) =>
    input.addEventListener("change", renderProducts),
  );
  searchInput.addEventListener("input", renderProducts);
  sortSelect.addEventListener("change", renderProducts);

  if (clearButton) {
    clearButton.addEventListener("click", () => {
      searchInput.value = "";
      sortSelect.value = "default";
      allFilterInputs.forEach((input) => {
        input.checked = false;
      });
      renderProducts();
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const sportParam = urlParams.get("sport");
  if (sportParam) {
    window.filterBySport(sportParam);
  }
});
