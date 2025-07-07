import { HomeView } from "./home-view.js"
import { HomePresenter } from "./home-presenter.js"

export class HomePage {
  constructor(storyService, toastService, authService) {
    this.storyService = storyService
    this.toastService = toastService
    this.authService = authService
    this.view = null
    this.presenter = null
  }

  render() {
    // Return the static HTML structure for the home page
    return `
    <section id="home-page" class="page active">
        <div class="container">
            <header class="page-header">
                <h2>Latest Stories</h2>
                <p>Discover amazing stories from the Dicoding community</p>
            </header>
            <div id="stories-grid" class="stories-grid">
                <!-- Stories will be loaded here -->
            </div>
            <div class="pagination">
                <button id="prev-page" class="btn btn-outline" disabled>Previous</button>
                <span id="page-info">Page 1</span>
                <button id="next-page" class="btn btn-outline">Next</button>
            </div>
        </div>
    </section>
  `
  }

  afterRender() {
    // Initialize View and Presenter after the DOM is ready
    this.view = new HomeView()
    this.presenter = new HomePresenter(this.storyService, this.toastService, this.authService, this.view)
    this.presenter.render()
  }
}
