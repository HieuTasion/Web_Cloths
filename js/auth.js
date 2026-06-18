(function () {
  const AUTH_KEY = "sportx_user";
  const ACCOUNTS_KEY = "sportx_registered_accounts";

  function safeParse(value) {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function readUser(storage) {
    if (!storage) return null;
    return safeParse(storage.getItem(AUTH_KEY) || "null");
  }

  function getCurrentUser() {
    if (typeof sessionStorage !== "undefined") {
      const sessionUser = readUser(sessionStorage);
      if (sessionUser?.email) {
        return sessionUser;
      }
    }

    if (typeof localStorage !== "undefined") {
      const storedUser = readUser(localStorage);
      if (storedUser?.email) {
        return storedUser;
      }
    }

    return null;
  }

  function getRegisteredProfile(email) {
    if (!email || typeof localStorage === "undefined") return null;

    const accounts = safeParse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
    const userEmail = email.trim().toLowerCase();
    if (accounts && accounts[userEmail]) return accounts[userEmail];

    return null;
  }

  function getDisplayName(user) {
    const profile = getRegisteredProfile(user?.email || "");
    if (profile?.name) {
      return profile.name;
    }

    if (typeof user?.email === "string" && user.email.trim()) {
      return user.email.split("@")[0];
    }

    return "Khách";
  }

  function clearAuth() {
    const user = getCurrentUser();

    if (user?.email && window.SportxCartStore?.clearCartForEmail) {
      window.SportxCartStore.clearCartForEmail(user.email);
    }

    // Đảm bảo xóa sạch bộ nhớ tạm của trình duyệt để không lây lan sang Guest
    if (typeof window !== "undefined") {
      window.name = "";
    }

    try {
      sessionStorage.removeItem(AUTH_KEY);
    } catch (error) {}

    try {
      localStorage.removeItem(AUTH_KEY);
    } catch (error) {}
  }

  function updateNavLinks() {
    const user = getCurrentUser();
    const links = document.querySelectorAll('nav a[href$="login.html"]');

    links.forEach((link) => {
      if (!user) {
        link.textContent = "Đăng nhập";
        link.href = "./login.html";
        link.removeAttribute("data-auth-logout");
        link.removeAttribute("title");
        link.classList.remove("auth-user-link");
        if (link.classList.contains("btn")) {
          link.classList.add(
            "btn",
            "btn-outline-light",
            "rounded-pill",
            "px-4",
          );
        }
        return;
      }

      const displayName = getDisplayName(user);
      link.textContent = `Xin chào, ${displayName}`;
      link.href = "./login.html";
      link.title = "Xem thông tin tài khoản";
      link.removeAttribute("data-auth-logout");
      link.classList.add("auth-user-link");
    });
  }

  function renderLoginState() {
    const signedInState = document.getElementById("signedInState");
    const authForms = document.getElementById("authForms");
    if (!signedInState || !authForms) return;

    const user = getCurrentUser();
    const signedInName = document.getElementById("signedInName");
    const signedInEmail = document.getElementById("signedInEmail");
    const logoutBtn = document.getElementById("logoutBtn");

    if (!user) {
      signedInState.classList.add("d-none");
      authForms.classList.remove("d-none");
      return;
    }

    const displayName = getDisplayName(user);
    if (signedInName) {
      signedInName.textContent = displayName;
    }
    if (signedInEmail) {
      signedInEmail.textContent = `Email: ${user.email}`;
    }

    signedInState.classList.remove("d-none");
    authForms.classList.add("d-none");

    if (logoutBtn && logoutBtn.dataset.bound !== "1") {
      logoutBtn.dataset.bound = "1";
      logoutBtn.addEventListener("click", () => {
        clearAuth();
        // Sau khi clear auth, nếu có giỏ hàng của khách thì cập nhật lại badge
        if (window.SportxCartStore) {
          window.SportxCartStore.updateCartBadge?.();
        }
        window.location.reload();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateNavLinks();
    renderLoginState();
  });

  window.addEventListener("storage", (event) => {
    if (event.key === AUTH_KEY || event.key === ACCOUNTS_KEY) {
      updateNavLinks();
      renderLoginState();
    }
  });

  window.SportxAuth = {
    getCurrentUser,
    getDisplayName,
    clearAuth,
  };
})();
