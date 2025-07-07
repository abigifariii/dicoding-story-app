export class AuthView {
  constructor() {
    this.loginModal = null
    this.registerModal = null
    this.loginForm = null
    this.registerForm = null
  }

  initElements() {
    this.loginModal = document.getElementById("login-modal")
    this.registerModal = document.getElementById("register-modal")
    this.loginForm = document.getElementById("login-form")
    this.registerForm = document.getElementById("register-form")
  }

  setupLoginModal(onSubmit, onClose) {
    const closeBtn = this.loginModal.querySelector(".modal-close")

    // Remove existing listeners by cloning to prevent duplicates on re-render
    const newForm = this.loginForm.cloneNode(true)
    const newCloseBtn = closeBtn.cloneNode(true)

    this.loginForm.parentNode.replaceChild(newForm, this.loginForm)
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn)

    this.loginForm = newForm // Update reference to the new form

    this.loginForm.addEventListener("submit", onSubmit)
    newCloseBtn.addEventListener("click", onClose)

    // Close modal when clicking outside
    this.loginModal.addEventListener("click", (e) => {
      if (e.target === this.loginModal) {
        onClose()
      }
    })

    // Close modal on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.loginModal.classList.contains("active")) {
        onClose()
      }
    })
  }

  setupRegisterModal(onSubmit, onClose) {
    const closeBtn = this.registerModal.querySelector(".modal-close")

    // Remove existing listeners by cloning to prevent duplicates on re-render
    const newForm = this.registerForm.cloneNode(true)
    const newCloseBtn = closeBtn.cloneNode(true)

    this.registerForm.parentNode.replaceChild(newForm, this.registerForm)
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn)

    this.registerForm = newForm // Update reference to the new form

    this.registerForm.addEventListener("submit", onSubmit)
    newCloseBtn.addEventListener("click", onClose)

    // Close modal when clicking outside
    this.registerModal.addEventListener("click", (e) => {
      if (e.target === this.registerModal) {
        onClose()
      }
    })

    // Close modal on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.registerModal.classList.contains("active")) {
        onClose()
      }
    })
  }

  setupPasswordToggles() {
    document.querySelectorAll(".password-toggle").forEach((toggle) => {
      // Clone to remove existing listeners
      const newToggle = toggle.cloneNode(true)
      toggle.parentNode.replaceChild(newToggle, toggle)

      newToggle.addEventListener("click", () => {
        const input = newToggle.previousElementSibling
        const icon = newToggle.querySelector("i")

        if (input.type === "password") {
          input.type = "text"
          icon.classList.remove("fa-eye")
          icon.classList.add("fa-eye-slash")
          newToggle.setAttribute("aria-label", "Hide password")
        } else {
          input.type = "password"
          icon.classList.remove("fa-eye-slash")
          icon.classList.add("fa-eye")
          newToggle.setAttribute("aria-label", "Show password")
        }
      })
    })
  }

  showLoginModal() {
    this.loginModal.classList.add("active")
    this.loginModal.setAttribute("aria-hidden", "false")

    // Focus first input
    const firstInput = this.loginModal.querySelector("input")
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100)
    }

    // Prevent body scroll
    document.body.style.overflow = "hidden"
  }

  hideLoginModal() {
    this.loginModal.classList.remove("active")
    this.loginModal.setAttribute("aria-hidden", "true")
    document.body.style.overflow = ""
  }

  showRegisterModal() {
    this.registerModal.classList.add("active")
    this.registerModal.setAttribute("aria-hidden", "false")

    // Focus first input
    const firstInput = this.registerModal.querySelector("input")
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100)
    }

    // Prevent body scroll
    document.body.style.overflow = "hidden"
  }

  hideRegisterModal() {
    this.registerModal.classList.remove("active")
    this.registerModal.setAttribute("aria-hidden", "true")
    document.body.style.overflow = ""
  }

  setFormLoading(form, loading) {
    const submitBtn = form.querySelector('button[type="submit"]')
    const inputs = form.querySelectorAll("input")

    if (loading) {
      submitBtn.disabled = true
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Please wait...'
      inputs.forEach((input) => (input.disabled = true))
    } else {
      submitBtn.disabled = false
      inputs.forEach((input) => (input.disabled = false))

      // Restore original button text
      if (form.id === "login-form") {
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login'
      } else {
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Sign Up'
      }
    }
  }

  getLoginFormData() {
    return new FormData(this.loginForm)
  }

  getRegisterFormData() {
    return new FormData(this.registerForm)
  }

  resetLoginForm() {
    this.loginForm.reset()
  }

  resetRegisterForm() {
    this.registerForm.reset()
  }
}
