(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("navSearchInput");
    const searchResults = document.getElementById("navSearchResults");

    if (!searchInput || !searchResults) return;

    searchInput.addEventListener("input", () => {
      const catalog = window.SportxCatalog || [];
      const query = searchInput.value.trim().toLowerCase();

      if (query.length < 1) {
        searchResults.classList.add("d-none");
        return;
      }


      const matches = catalog
        .filter((product) => {
          return (
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
          );
        })
        .slice(0, 6); // Giới hạn 6 kết quả hiển thị nhanh

      if (matches.length > 0) {
        renderResults(matches);
        searchResults.classList.remove("d-none");
      } else {
        searchResults.innerHTML = `<div class="p-3 text-white-50 small text-center">Không tìm thấy sản phẩm.</div>`;
        searchResults.classList.remove("d-none");
      }
    });

    function renderResults(products) {
      searchResults.innerHTML = products
        .map((p) => {
          return `
          <a href="./product-detail.html?id=${p.id}" class="search-item d-flex align-items-center gap-3 p-2 text-decoration-none">
            <img src="${p.image}" alt="${p.name}" class="rounded" width="45" height="45" style="object-fit: cover;">
            <div class="overflow-hidden">
              <div class="text-white fw-medium text-truncate small">${p.name}</div>
              <div class="text-accent smaller">${p.price.toLocaleString()}đ</div>
            </div>
          </a>
        `;
        })
        .join("");
    }

    // Đóng dropdown khi click ra ngoài
    document.addEventListener("click", (e) => {
      if (
        !searchInput.contains(e.target) &&
        !searchResults.contains(e.target)
      ) {
        searchResults.classList.add("d-none");
      }
    });
  });
})();
