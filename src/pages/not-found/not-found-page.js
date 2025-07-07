import { NotFoundView } from "./not-found-view.js"
import { NotFoundPresenter } from "./not-found-presenter.js"

export class NotFoundPage {
  constructor(router) {
    this.router = router
    this.view = null
    this.presenter = null
  }

  render() {
    return `
    <section id="not-found-page" class="page">
        <div class="container text-center">
            <i class="fas fa-exclamation-triangle" style="font-size: 5rem; color: var(--warning-color); margin-bottom: 1rem;"></i>
            <h2 class="page-header">404 - Page Not Found</h2>
            <p>Oops! The page you are looking for does not exist.</p>
            <button id="go-home-btn" class="btn btn-primary" style="margin-top: 1.5rem;">
                <i class="fas fa-home"></i> Go to Home
            </button>
        </div>
    </section>
    `
  }

  afterRender() {
    this.view = new NotFoundView()
    this.presenter = new NotFoundPresenter(this.router, this.view)
    this.presenter.init()
  }
}
