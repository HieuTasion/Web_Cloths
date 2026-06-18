document.addEventListener("DOMContentLoaded", () => {
  const productName = document.getElementById("productName");
  const productPrice = document.getElementById("productPrice");
  const productRating = document.getElementById("productRating");
  const productSummary = document.getElementById("productSummary");
  const productDescription = document.getElementById("productDescription");
  const productMaterial = document.getElementById("productMaterial");
  const productOrigin = document.getElementById("productOrigin");
  const productWeight = document.getElementById("productWeight");
  const detailForm = document.getElementById("detailForm");
  const quantityInput = document.getElementById("quantity");
  const mainImage = document.getElementById("mainImage");
  const thumbsWrap = document.getElementById("thumbsWrap");
  const sizeWrap = document.getElementById("sizeOptions");
  const hiddenProductId = document.getElementById("productId");

  if (!productName || !mainImage || !detailForm) return;

  const products = window.SportxCatalog || [];
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id") || products[0]?.id;
  const product =
    products.find((entry) => entry.id === productId) || products[0];

  if (!product) return;

  if (window.SportxCartStore) {
    window.SportxCartStore.updateCartBadge();
  }

  const state = {
    size: "",
  };

  productName.textContent = product.name;
  productPrice.textContent = `${product.price.toLocaleString()}đ`;
  productRating.textContent = `Đánh giá: ${product.rating.toFixed(1)}`;
  productSummary.textContent = product.summary;
  productDescription.textContent = product.description;
  productMaterial.textContent = product.material;
  productOrigin.textContent = product.origin;
  productWeight.textContent = product.weight;
  hiddenProductId.value = product.id;
  mainImage.src = product.gallery[0] || product.image;
  mainImage.alt = product.name;

  const breadcrumbOl = document.querySelector(".breadcrumb");
  const fromParam = params.get("from");
  const valParam = params.get("val");

  if (breadcrumbOl) {
    let breadcrumbHtml = `<li class="breadcrumb-item"><a href="./index.html">Trang chủ</a></li>`;

    if (fromParam === "brand" && valParam) {
      breadcrumbHtml += `<li class="breadcrumb-item"><a href="./brands.html">Thương hiệu</a></li>`;
      breadcrumbHtml += `<li class="breadcrumb-item"><a href="./brands.html?brand=${encodeURIComponent(valParam)}">${valParam}</a></li>`;
    } else if (fromParam === "sport" && valParam) {
      breadcrumbHtml += `<li class="breadcrumb-item"><a href="./sports.html">Môn thể thao</a></li>`;
      breadcrumbHtml += `<li class="breadcrumb-item"><a href="./sports.html?sport=${encodeURIComponent(valParam)}">${valParam}</a></li>`;
    } else if (fromParam === "collection") {
      breadcrumbHtml += `<li class="breadcrumb-item"><a href="./products.html">Bộ sưu tập</a></li>`;
    }

    breadcrumbHtml += `<li class="breadcrumb-item active" aria-current="page">${product.name}</li>`;
    breadcrumbOl.innerHTML = breadcrumbHtml;
  }

  thumbsWrap.innerHTML = product.gallery
    .map(
      (image, index) => `
    <button class="thumb-btn ${index === 0 ? "active" : ""}" type="button" data-image="${image}">
      <img src="${image}" alt="${product.name} thumbnail ${index + 1}">
    </button>
  `,
    )
    .join("");

  sizeWrap.innerHTML = product.sizes
    .map(
      (size) => `
    <button class="size-btn" type="button" data-size="${size}">${size}</button>
  `,
    )
    .join("");

  thumbsWrap.addEventListener("click", (event) => {
    const button = event.target.closest(".thumb-btn");
    if (!button) return;
    mainImage.src = button.dataset.image;
    thumbsWrap
      .querySelectorAll(".thumb-btn")
      .forEach((thumb) => thumb.classList.remove("active"));
    button.classList.add("active");
  });

  sizeWrap.addEventListener("click", (event) => {
    const button = event.target.closest(".size-btn");
    if (!button) return;
    state.size = button.dataset.size;
    sizeWrap
      .querySelectorAll(".size-btn")
      .forEach((sizeButton) => sizeButton.classList.remove("active"));
    button.classList.add("active");
  });

  detailForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!state.size) {
      if (window.Swal) {
        Swal.fire({
          icon: "error",
          title: "Yêu cầu lựa chọn",
          text: "Vui lòng chọn kích cỡ trước khi thêm vào giỏ hàng.",
          confirmButtonColor: "#00b7ff",
        });
      }
      return;
    }

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

    const quantity = Math.max(1, Number(quantityInput.value) || 1);

    if (window.SportxCartStore) {
      window.SportxCartStore.upsertCartItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: mainImage.src,
        size: state.size,
        quantity,
      });
    }

    if (window.Swal) {
      Swal.fire({
        icon: "success",
        title: "Đã thêm vào giỏ hàng",
        text: `${product.name} đã được thêm với size ${state.size}.`,
        confirmButtonColor: "#00b7ff",
      });
    }
  });
});
