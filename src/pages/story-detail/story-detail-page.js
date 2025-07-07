import { StoryDetailView } from "./story-detail-view.js"
import { StoryDetailPresenter } from "./story-detail-presenter.js"

export class StoryDetailPage {
  constructor(storyService, toastService, authService, indexedDBHelper) {
    this.storyService = storyService
    this.toastService = toastService
    this.authService = authService
    this.indexedDBHelper = indexedDBHelper
    this.view = null
    this.presenter = null
  }

  render() {
    // Static HTML structure for the story detail page
    return `
    <section id="story-detail-page" class="page">
        <div class="container">
            <header class="page-header">
                <h2 id="detail-story-title">Story Details</h2>
                <p id="detail-story-author"></p>
            </header>
            <div id="story-detail-content" class="story-detail-content">
                <!-- Story details will be loaded here -->
            </div>
        </div>
    </section>
    `
  }

  afterRender(storyId) {
    this.view = new StoryDetailView()
    this.presenter = new StoryDetailPresenter(
      this.storyService,
      this.toastService,
      this.authService,
      this.indexedDBHelper,
      this.view,
    )
    this.presenter.loadStoryDetail(storyId)
  }
}
