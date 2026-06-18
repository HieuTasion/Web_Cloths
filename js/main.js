// FILE NÀY DÀNH CHO TRANG CHỦ (INDEX.HTML)
document.addEventListener("DOMContentLoaded", () => {
  if (window.AOS) {
    AOS.init({
      duration: 800,
      once: true,
      offset: 80,
    });
  }

  if (window.SportxCartStore) {
    window.SportxCartStore.updateCartBadge();
  }

  const productGrid = document.getElementById("productGrid");
  if (!productGrid) return;

  const catalog = window.SportxCatalog || [];

  // Định nghĩa các nhóm sản phẩm
  const groups = [
    {
      title: "Giày Thể Thao",
      items: catalog.filter((p) => p.category === "Giày"),
    },
    {
      title: "Quần Áo",
      items: catalog.filter(
        (p) => p.category === "Quần áo" || p.category === "Quần",
      ),
    },
    {
      title: "Phụ Kiện",
      items: catalog.filter((p) => p.category === "Phụ kiện"),
    },
  ];

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

  let finalHtml = "";
  let globalIndex = 0; // Dùng để tạo hiệu ứng delay AOS chạy mượt mà

  groups.forEach((group) => {
    if (group.items.length > 0) {
      // Thêm tiêu đề cho mỗi phần
      finalHtml += `
        <div class="col-12 mt-5 mb-3" data-aos="fade-right">
          <h2 class="h3 fw-bold border-start border-4 border-accent ps-3">${group.title}</h2>
        </div>
      `;

      // Thêm danh sách sản phẩm của nhóm đó
      finalHtml += group.items
        .map((product) => {
          const delay = (globalIndex % 6) * 100; // Reset delay sau mỗi 6 sản phẩm để không quá lâu
          globalIndex++;

          const theme = getCardTheme(product.badge);

          // trả về số tiền ban đầu giảm giá và gạch ngang nó
          const oldPriceHtml = product.originalPrice
            ? `<span class="text-muted text-decoration-line-through small me-2" style="font-size: 0.8rem;">${product.originalPrice.toLocaleString()}đ</span>`
            : "";

          return `
          <div class="col-md-6 col-xl-4 mb-4" data-aos="fade-up" data-aos-delay="${delay}">
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
            <div class="price-wrapper mt-auto mb-2">
              <div class="price fs-5 fw-bold text-accent">${oldPriceHtml}${product.price.toLocaleString()}đ</div>
            </div>
            <div class="d-flex gap-2">
                  <button class="btn btn-accent flex-grow-1 js-add-to-cart fw-bold" data-id="${product.id}">MUA NGAY</button>
                  <a class="btn btn-outline-light" href="./product-detail.html?id=${product.id}&from=home">
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
  });

  productGrid.innerHTML = finalHtml;

  productGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".js-add-to-cart");

    if (!button) {
      // Xử lý click vào card để xem chi tiết
      const card = event.target.closest(".product-card");
      const viewLink = event.target.closest('a[href*="product-detail.html"]');

      // Nếu click vào link "Xem" thì để trình duyệt tự xử lý chuyển trang
      if (viewLink) return;

      if (card) {
        const detailLink = card.querySelector('a[href*="product-detail.html"]');
        if (detailLink) window.location.href = detailLink.href;
      }
      return;
    }

    const product = catalog.find((entry) => entry.id === button.dataset.id);
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
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });

    if (window.Swal) {
      Swal.fire({
        icon: "success",
        title: "Đã thêm vào giỏ hàng",
        text: `${product.name} đã được thêm vào giỏ của bạn.`,
        confirmButtonColor: "#00b7ff",
      });
    }
  });
});
