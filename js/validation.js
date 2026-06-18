document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const contactForm = document.getElementById("contactForm");

  if (!loginForm && !registerForm && !contactForm) return;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      clearFormErrors(loginForm);

      const emailInput = document.getElementById("loginEmail");
      const passwordInput = document.getElementById("loginPassword");
      const emailValue = emailInput.value.trim();
      const passwordValue = passwordInput.value.trim();
      let isValid = true;

      if (!emailValue) {
        setFieldError(emailInput, "Vui lòng nhập Email.");
        isValid = false;
      } else if (!emailPattern.test(emailValue)) {
        setFieldError(emailInput, "Email không hợp lệ.");
        isValid = false;
      }

      if (!passwordValue) {
        setFieldError(passwordInput, "Vui lòng nhập mật khẩu.");
        isValid = false;
      } else if (passwordValue.length < 6) {
        setFieldError(passwordInput, "Mật khẩu phải có ít nhất 6 ký tự.");
        isValid = false;
      }

      if (!isValid) return;

      // Kiểm tra tài khoản và mật khẩu từ LocalStorage
      const REGISTERED_ACCOUNTS_KEY = "sportx_registered_accounts";
      const accounts = JSON.parse(
        localStorage.getItem(REGISTERED_ACCOUNTS_KEY) || "{}",
      );
      const account = accounts[emailValue.toLowerCase()];

      if (!account) {
        setFieldError(emailInput, "Tài khoản không tồn tại.");
        return;
      }

     
      if (account.password !== CryptoJS.MD5(passwordValue).toString()) {
        setFieldError(passwordInput, "Mật khẩu không chính xác.");
        return;
      }

      const rememberMeInput = document.getElementById("rememberMe");
      const rememberMe = Boolean(rememberMeInput && rememberMeInput.checked);
      const userPayload = {
        email: emailValue,
        loggedInAt: new Date().toISOString(),
        rememberMe,
      };

      sessionStorage.setItem("sportx_user", JSON.stringify(userPayload));

      if (rememberMe) {
        localStorage.setItem("sportx_user", JSON.stringify(userPayload));
      } else {
        localStorage.removeItem("sportx_user");
      }

      if (window.Swal) {
        Swal.fire({
          icon: "success",
          title: "Đăng nhập thành công",
          text: "Phiên làm việc đã được khởi tạo.",
          confirmButtonColor: "#00b7ff",
        }).then(() => {
          window.location.href = "./index.html";
        });
      } else {
        window.location.href = "./index.html";
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      clearFormErrors(registerForm);

      const nameInput = document.getElementById("registerName");
      const emailInput = document.getElementById("registerEmail");
      const passwordInput = document.getElementById("registerPassword");
      const confirmInput = document.getElementById("registerConfirm");

      const nameValue = nameInput.value.trim();
      const emailValue = emailInput.value.trim();
      const passwordValue = passwordInput.value.trim();
      const confirmValue = confirmInput.value.trim();
      let isValid = true;

      if (!nameValue) {
        setFieldError(nameInput, "Vui lòng nhập họ tên.");
        isValid = false;
      }

      if (!emailValue) {
        setFieldError(emailInput, "Vui lòng nhập Email.");
        isValid = false;
      } else if (!emailPattern.test(emailValue)) {
        setFieldError(emailInput, "Email không hợp lệ.");
        isValid = false;
      }

      if (!passwordValue) {
        setFieldError(passwordInput, "Vui lòng nhập mật khẩu.");
        isValid = false;
      } else if (passwordValue.length < 6) {
        setFieldError(passwordInput, "Mật khẩu phải có ít nhất 6 ký tự.");
        isValid = false;
      }

      if (!confirmValue) {
        setFieldError(confirmInput, "Vui lòng xác nhận mật khẩu.");
        isValid = false;
      } else if (confirmValue !== passwordValue) {
        setFieldError(confirmInput, "Mật khẩu xác nhận không khớp.");
        isValid = false;
      }

      if (!isValid) return;

      // Lưu danh sách nhiều người dùng thay vì ghi đè một người
      const REGISTERED_ACCOUNTS_KEY = "sportx_registered_accounts";
      const accounts = JSON.parse(
        localStorage.getItem(REGISTERED_ACCOUNTS_KEY) || "{}",
      );
      accounts[emailValue.toLowerCase()] = {
        name: nameValue,
        email: emailValue,
        password: CryptoJS.MD5(passwordValue).toString(),
      };
      localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(accounts));

      if (window.Swal) {
        Swal.fire({
          icon: "success",
          title: "Đã tạo tài khoản",
          text: "Thông tin tài khoản đã được lưu lại.",
          confirmButtonColor: "#00b7ff",
        });
      }

      registerForm.reset();
      const loginTab = document.getElementById("login-tab");
      if (loginTab) {
        bootstrap.Tab.getOrCreateInstance(loginTab).show();
      }
      const loginEmail = document.getElementById("loginEmail");
      if (loginEmail) {
        loginEmail.value = emailValue;
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      clearFormErrors(contactForm);

      const nameInput = document.getElementById("contactName");
      const emailInput = document.getElementById("contactEmail");
      const subjectInput = document.getElementById("contactSubject");
      const messageInput = document.getElementById("contactMessage");

      let isValid = true;

      if (!nameInput.value.trim()) {
        setFieldError(nameInput, "Vui lòng nhập họ tên.");
        isValid = false;
      }
      if (!emailInput.value.trim()) {
        setFieldError(emailInput, "Vui lòng nhập email.");
        isValid = false;
      } else if (!emailPattern.test(emailInput.value.trim())) {
        setFieldError(emailInput, "Email không hợp lệ.");
        isValid = false;
      }
      if (!subjectInput.value.trim()) {
        setFieldError(subjectInput, "Vui lòng nhập chủ đề.");
        isValid = false;
      }
      if (!messageInput.value.trim()) {
        setFieldError(messageInput, "Vui lòng nhập nội dung tin nhắn.");
        isValid = false;
      }

      if (!isValid) return;

      if (window.Swal) {
        Swal.fire({
          icon: "success",
          title: "Đã gửi tin nhắn",
          text: "Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể!",
          confirmButtonColor: "#00b7ff",
        });
      }
      contactForm.reset();
    });
  }
});

function setFieldError(input, message) {
  input.classList.add("is-invalid");
  const feedback = getFeedbackElement(input);
  if (feedback) {
    feedback.textContent = message;
  }
}

function clearFormErrors(form) {
  form.querySelectorAll(".is-invalid").forEach((input) => {
    input.classList.remove("is-invalid");
  });
  form.querySelectorAll(".invalid-feedback").forEach((feedback) => {
    feedback.textContent = "";
  });
}

function getFeedbackElement(input) {
  if (input.getAttribute("aria-describedby")) {
    const feedback = document.getElementById(
      input.getAttribute("aria-describedby"),
    );
    if (feedback) return feedback;
  }

  return input.parentElement.querySelector(".invalid-feedback");
}
