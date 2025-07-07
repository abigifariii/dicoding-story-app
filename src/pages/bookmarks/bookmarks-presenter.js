export class BookmarksPresenter {
  constructor(indexedDBHelper, toastService, view) {
    this.indexedDBHelper = indexedDBHelper
    this.toastService = toastService
    this.view = view
  }

  async loadBookmarkedStories() {
    this.view.initElements()
    this.view.showLoading(true)

    try {
      const stories = await this.indexedDBHelper.getStories()
      this.view.renderBookmarkedStories(stories, (id) => this.handleRemoveBookmark(id))
    } catch (error) {
      console.error("Error loading bookmarked stories:", error)
      this.toastService.show(`Failed to load bookmarks: ${error.message}`, "error")
      this.view.renderBookmarkedStories([]) // Render empty state on error
    } finally {
      this.view.showLoading(false)
    }
  }

  async handleRemoveBookmark(storyId) {
    try {
      await this.indexedDBHelper.deleteStory(storyId)
      this.toastService.show("Story removed from bookmarks!", "info")
      this.loadBookmarkedStories() // Reload stories after removal
    } catch (error) {
      console.error("Error removing bookmark:", error)
      this.toastService.show(`Failed to remove bookmark: ${error.message}`, "error")
    }
  }
}
