import { ViewStoryView } from "./view-story-view.js"
import { ViewStoryPresenter } from "./view-story-presenter.js"

export class ViewStoryPage {
  constructor(storyService, toastService, authService) {
    this.storyService = storyService
    this.toastService = toastService
    this.authService = authService
    this.view = null
    this.presenter = null
  }

  render() {
    // Return the static HTML structure for the view story page
    return `
    <section id="view-story-page" class="page">
        <div class="container">
            <header class="page-header">
                <h2>Stories with Locations</h2>
                <p>Explore stories from around the world</p>
            </header>
            <div class="view-story-container">
                <div id="stories-map" class="stories-map"></div>
                <div id="stories-list" class="stories-list">
                    <!-- Stories with locations will be loaded here -->
                </div>
            </div>
        </div>
    </section>
  `
  }

  afterRender(storyId = null) {
    // Initialize View and Presenter after the DOM is ready
    this.view = new ViewStoryView()
    this.presenter = new ViewStoryPresenter(this.storyService, this.toastService, this.authService, this.view)
    this.presenter.render(storyId)
  }
}
