(function () {
  const STORAGE_PREFIX = "sportx_cart";
  const LEGACY_STORAGE_KEY = "sportx_cart";
  const USER_STORAGE_KEY = "sportx_user";
  const WINDOW_NAME_PREFIX = "sportx_cart=";
  let memoryCart = [];

  function safeParse(value) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function readFromWindowName() {
    if (typeof window === "undefined" || typeof window.name !== "string")
      return [];
    if (!window.name.startsWith(WINDOW_NAME_PREFIX)) return [];
    return safeParse(window.name.slice(WINDOW_NAME_PREFIX.length));
  }

  function writeToWindowName(cart) {
    if (typeof window === "undefined") return;
    window.name = `${WINDOW_NAME_PREFIX}${JSON.stringify(cart)}`;
  }

  function safeReadStorage(storage, key) {
    if (!storage) return [];

    try {
      return safeParse(storage.getItem(key) || "[]");
    } catch (error) {
      return [];
    }
  }

  function safeWriteStorage(storage, key, value) {
    if (!storage) return;

    try {
      storage.setItem(key, value);
    } catch (error) {}
  }

  function safeRemoveStorage(storage, key) {
    if (!storage) return;

    try {
      storage.removeItem(key);
    } catch (error) {}
  }

  function getCurrentUserEmail() {
    const readUser = (storage) => {
      if (!storage) return null;
      try {
        const raw = storage.getItem(USER_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : null;
      } catch (e) {
        return null;
      }
    };

    let user = null;

    if (typeof sessionStorage !== "undefined") {
      user = readUser(sessionStorage);
    }

    if (!user && typeof localStorage !== "undefined") {
      user = readUser(localStorage);
    }

    const email = user?.email;
    if (typeof email === "string" && email.trim()) {
      return email.trim().toLowerCase();
    }

    return "guest";
  }

  function getStorageKeyForCurrentUser() {
    const userEmail = getCurrentUserEmail();
    return `${STORAGE_PREFIX}__${encodeURIComponent(userEmail)}`;
  }

  function readLegacyCart() {
    if (typeof localStorage !== "undefined") {
      return safeReadStorage(localStorage, LEGACY_STORAGE_KEY);
    }

    if (typeof sessionStorage !== "undefined") {
      return safeReadStorage(sessionStorage, LEGACY_STORAGE_KEY);
    }

    return [];
  }

  function migrateLegacyCartIfNeeded(storageKey) {
    const legacyCart = readLegacyCart();
    if (!legacyCart.length) return [];

    const existingCart = safeReadStorage(localStorage, storageKey);
    if (existingCart.length) {
      safeRemoveStorage(localStorage, LEGACY_STORAGE_KEY);
      safeRemoveStorage(sessionStorage, LEGACY_STORAGE_KEY);
      return existingCart;
    }

    safeWriteStorage(localStorage, storageKey, JSON.stringify(legacyCart));
    safeWriteStorage(sessionStorage, storageKey, JSON.stringify(legacyCart));
    safeRemoveStorage(localStorage, LEGACY_STORAGE_KEY);
    safeRemoveStorage(sessionStorage, LEGACY_STORAGE_KEY);
    return legacyCart;
  }

  function readCart() {
    const storageKey = getStorageKeyForCurrentUser();

    // Ưu tiên đọc từ sessionStorage trước (phiên hiện tại)
    if (typeof sessionStorage !== "undefined") {
      const raw = sessionStorage.getItem(storageKey);
      if (raw !== null) {
        memoryCart = safeParse(raw);
        return memoryCart;
      }
    }

    // Nếu không có trong session, mới đọc từ localStorage (lâu dài)
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(storageKey);
      if (raw !== null) {
        memoryCart = safeParse(raw);
        return memoryCart;
      }
    }

    const migratedCart = migrateLegacyCartIfNeeded(storageKey);
    if (migratedCart.length) {
      memoryCart = migratedCart;
      return memoryCart;
    }

    const windowNameStored = readFromWindowName();
    if (windowNameStored.length) {
      memoryCart = windowNameStored;
      return memoryCart;
    }

    return memoryCart;
  }

  function writeCart(cart) {
    memoryCart = Array.isArray(cart) ? cart : [];
    
    const userEmail = getCurrentUserEmail();
    const storageKey = getStorageKeyForCurrentUser();

    
    if (userEmail !== "guest") {
      try {
        localStorage.setItem(storageKey, JSON.stringify(memoryCart));
      } catch (error) {}
    } else {
      
      safeRemoveStorage(localStorage, storageKey);
    }

    
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(memoryCart));
    } catch (error) {}

    writeToWindowName(memoryCart);
  }

  function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function getCartKey(item) {
    return [item.id || "unknown", item.size || "one-size"].join("|");
  }

  function getCartCount(cart = readCart()) {
    return cart.reduce((sum, item) => sum + toNumber(item.quantity), 0);
  }

  function getCartTotal(cart = readCart()) {
    return cart.reduce(
      (sum, item) => sum + toNumber(item.price) * toNumber(item.quantity),
      0,
    );
  }

  function updateCartBadge() {
    const badge = document.getElementById("cartCount");
    if (badge) {
      badge.textContent = getCartCount();
    }
  }

  function clearCartForEmail(email) {
    if (!email) return;
    const userEmail = email.trim().toLowerCase();
    const storageKey = `${STORAGE_PREFIX}__${encodeURIComponent(userEmail)}`;

    // Xóa dữ liệu trong storage của user đó
    safeRemoveStorage(sessionStorage, storageKey);

    // Nếu đang xóa giỏ hàng của chính người dùng hiện tại, reset luôn trạng thái tạm thời
    if (userEmail === getCurrentUserEmail()) {
      memoryCart = [];
      if (typeof window !== "undefined") {
        window.name = "";
      }
    }
  }

  function upsertCartItem(item) {
    const cart = readCart();
    const quantity = Math.max(1, toNumber(item.quantity) || 1);
    const normalizedItem = {
      id: item.id,
      name: item.name,
      price: toNumber(item.price),
      image: item.image || "",
      size: item.size || "",
      quantity,
    };

    const existing = cart.find(
      (entry) => getCartKey(entry) === getCartKey(normalizedItem),
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push(normalizedItem);
    }

    writeCart(cart);
    updateCartBadge();
    return cart;
  }

  window.SportxCartStore = {
    readCart,
    writeCart,
    getCartKey,
    getCartCount,
    getCartTotal,
    updateCartBadge,
    upsertCartItem,
    clearCartForEmail,
  };
})();
