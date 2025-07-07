import { BookmarksView } from "./bookmarks-view.js"
import { BookmarksPresenter } from "./bookmarks-presenter.js"

export class BookmarksPage {
  constructor(indexedDBHelper, toastService) {
    this.indexedDBHelper = indexedDBHelper
    this.toastService = toastService
    this.view = null
    this.presenter = null
  }

  render() {
    // Static HTML structure for the bookmarks page
    return `
    <section id="bookmarks-page" class="page">
        <div class="container">
            <header class="page-header">
                <h2>Your Bookmarked Stories</h2>
                <p>Stories you've saved for later</p>
            </header>
            <div id="bookmarks-grid" class="stories-grid">
                <!-- Bookmarked stories will be loaded here -->
            </div>
        </div>
    </section>
    `
  }

  afterRender() {
    this.view = new BookmarksView()
    this.presenter = new BookmarksPresenter(this.indexedDBHelper, this.toastService, this.view)
    this.presenter.loadBookmarkedStories()
  }
}
