export class AuthPresenter {
  constructor(authService, toastService, view) {
    this.authService = authService
    this.toastService = toastService
    this.view = view
    this.onAuthStateChange = null // Callback to notify App of auth state change
    this.setupModals()
  }

  setupModals() {
    this.view.initElements() // Initialize DOM elements in the view
    this.view.setupLoginModal(
      (e) => this.handleLogin(e),
      () => this.view.hideLoginModal(),
    )

    this.view.setupRegisterModal(
      (e) => this.handleRegister(e),
      () => this.view.hideRegisterModal(),
    )

    this.view.setupPasswordToggles()
  }

  async handleLogin(e) {
    e.preventDefault()

    const formData = this.view.getLoginFormData()
    const email = formData.get("email")
    const password = formData.get("password")

    if (!email || !password) {
      this.toastService.show("Please fill in all fields", "error")
      return
    }

    try {
      this.view.setFormLoading(this.view.loginForm, true)
      await this.authService.login(email, password)

      this.toastService.show("Login successful!", "success")
      this.view.hideLoginModal()
      this.view.resetLoginForm()

      if (this.onAuthStateChange) {
        this.onAuthStateChange() // Notify App of auth state change
      }
    } catch (error) {
      this.toastService.show(error.message, "error")
    } finally {
      this.view.setFormLoading(this.view.loginForm, false)
    }
  }

  async handleRegister(e) {
    e.preventDefault()

    const formData = this.view.getRegisterFormData()
    const name = formData.get("name")
    const email = formData.get("email")
    const password = formData.get("password")

    if (!name || !email || !password) {
      this.toastService.show("Please fill in all fields", "error")
      return
    }

    if (password.length < 8) {
      this.toastService.show("Password must be at least 8 characters long", "error")
      return
    }

    try {
      this.view.setFormLoading(this.view.registerForm, true)
      await this.authService.register(name, email, password)

      this.toastService.show("Registration successful! Please login.", "success")
      this.view.hideRegisterModal()
      this.view.resetRegisterForm()

      setTimeout(() => {
        this.showLoginModal()
      }, 500)
    } catch (error) {
      this.toastService.show(error.message, "error")
    } finally {
      this.view.setFormLoading(this.view.registerForm, false)
    }
  }

  showLoginModal() {
    this.view.showLoginModal()
  }

  showRegisterModal() {
    this.view.showRegisterModal()
  }
}
