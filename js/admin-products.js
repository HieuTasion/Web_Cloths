document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addProductForm");
  const tableBody = document.getElementById("adminProductList");
  const clearBtn = document.getElementById("clearAll");

  const STORAGE_KEY = "sportx_custom_products";

  function getCustomProducts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  }

  function saveCustomProducts(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  function renderAdminProducts() {
    const products = getCustomProducts();
    tableBody.innerHTML = "";

    if (products.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="5" class="text-center text-white-50">Chưa có sản phẩm tự thêm nào.</td></tr>';
      return;
    }

    products.forEach((p, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><img src="${p.image}" class="table-img"></td>
        <td class="text-white">${p.name}</td>
        <td class="small">${p.category}</td>
        <td class="small text-white-50">${p.brand || "Khác"}</td>
        <td class="text-accent">${p.price.toLocaleString()}đ</td>
        <td>
          <button class="btn btn-sm btn-danger rounded-circle delete-btn" data-index="${index}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Lấy các giá trị cơ bản để kiểm tra
    const pId = document.getElementById("pId").value.trim();
    const pName = document.getElementById("pName").value.trim();
    const pPrice = Number(document.getElementById("pPrice").value);
    const pOriginalPrice = document.getElementById("pOriginalPrice").value;
    const pImage = document.getElementById("pImage").value.trim();

    // Kiểm tra ràng buộc
    if (!pId || !pName || !pImage) {
      Swal.fire(
        "Lỗi",
        "Vui lòng nhập đầy đủ Mã, Tên và Ảnh sản phẩm!",
        "error",
      );
      return;
    }

    if (isNaN(pPrice) || pPrice <= 0) {
      Swal.fire("Lỗi", "Giá sản phẩm phải là số dương!", "error");
      return;
    }

    // Xử lý Gallery: Tách chuỗi thành mảng
    const galleryInput = document.getElementById("pGallery").value;
    const gallery = galleryInput
      ? galleryInput.split(",").map((s) => s.trim())
      : [document.getElementById("pImage").value];

    // Xử lý Sizes: Tách chuỗi thành mảng
    const sizes = document
      .getElementById("pSizes")
      .value.split(",")
      .map((s) => s.trim());

    // Xử lý Colors: Tách chuỗi "Tên:Mã" thành mảng Object {name, value}
    const newProduct = {
      id: document.getElementById("pId").value,
      name: document.getElementById("pName").value,
      category: document.getElementById("pCategory").value,
      brand: document.getElementById("pBrand").value,
      price: Number(document.getElementById("pPrice").value),
      originalPrice: pOriginalPrice ? Number(pOriginalPrice) : null,
      gender: document.getElementById("pGender").value,
      target: document.getElementById("pTarget").value,
      image: document.getElementById("pImage").value,
      summary: document.getElementById("pSummary").value,
      badge: document.getElementById("pBadge").value || "Mới",
      gallery: gallery,
      rating: 5.0,
      description: document.getElementById("pDescription").value,
      sizes: sizes,
      material: "Tổng hợp",
      origin: "Việt Nam",
      weight: "300g",
    };

    const products = getCustomProducts();
    products.push(newProduct);
    saveCustomProducts(products);
    form.reset();
    renderAdminProducts();
    Swal.fire("Thành công", "Đã thêm sản phẩm mới vào hệ thống!", "success");
  });

  tableBody.addEventListener("click", (e) => {
    const btn = e.target.closest(".delete-btn");
    if (!btn) return;
    const index = btn.dataset.index;
    const products = getCustomProducts();
    products.splice(index, 1);
    saveCustomProducts(products);
    renderAdminProducts();
  });

  clearBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    renderAdminProducts();
  });
  renderAdminProducts();
});
