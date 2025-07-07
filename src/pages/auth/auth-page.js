import { AuthView } from "./auth-view.js"
import { AuthPresenter } from "./auth-presenter.js"

export class AuthPage {
  constructor(authService, toastService) {
    this.authService = authService
    this.toastService = toastService
    this.view = null
    this.presenter = null
    this.onAuthStateChange = null // Callback for App to update UI
  }

  // Modals are global and not part of a specific page's main content,
  // so render() and afterRender() are not strictly for page content.
  // Instead, we expose methods to show/hide modals.

  showLoginModal() {
    if (!this.view) {
      this.afterRender() // Ensure view and presenter are initialized
    }
    this.presenter.showLoginModal()
  }

  showRegisterModal() {
    if (!this.view) {
      this.afterRender() // Ensure view and presenter are initialized
    }
    this.presenter.showRegisterModal()
  }

  afterRender() {
    // Initialize View and Presenter for modals
    this.view = new AuthView()
    this.presenter = new AuthPresenter(this.authService, this.toastService, this.view)

    // Pass the auth state change callback from App to Presenter
    this.presenter.onAuthStateChange = () => {
      if (this.onAuthStateChange) {
        this.onAuthStateChange()
      }
    }
  }
}
