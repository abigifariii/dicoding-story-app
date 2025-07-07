export class StoryDetailPresenter {
  constructor(storyService, toastService, authService, indexedDBHelper, view) {
    this.storyService = storyService
    this.toastService = toastService
    this.authService = authService
    this.indexedDBHelper = indexedDBHelper
    this.view = view
    this.currentStory = null
  }

  async loadStoryDetail(storyId) {
    this.view.initElements()
    this.view.showLoading(true)

    try {
      const token = this.authService.getToken()
      const response = await this.storyService.getStoryDetail(storyId, token)

      if (response && response.story) {
        this.currentStory = response.story
        const isBookmarked = await this.indexedDBHelper.isStoryBookmarked(this.currentStory.id)
        this.view.renderStoryDetail(this.currentStory, isBookmarked)
        this.view.bindBookmarkToggle(() => this.handleBookmarkToggle())
      } else {
        throw new Error("Story not found or invalid response")
      }
    } catch (error) {
      console.error("Error loading story detail:", error)
      this.toastService.show(`Failed to load story: ${error.message}`, "error")
      this.view.renderError("Failed to load story details. Please try again.")
    } finally {
      this.view.showLoading(false)
    }
  }

  async handleBookmarkToggle() {
    if (!this.currentStory) return

    try {
      const isBookmarked = await this.indexedDBHelper.isStoryBookmarked(this.currentStory.id)
      if (isBookmarked) {
        await this.indexedDBHelper.deleteStory(this.currentStory.id)
        this.toastService.show("Story removed from bookmarks!", "info")
        this.view.updateBookmarkButton(false)
      } else {
        await this.indexedDBHelper.addStory(this.currentStory)
        this.toastService.show("Story added to bookmarks!", "success")
        this.view.updateBookmarkButton(true)
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error)
      this.toastService.show(`Failed to update bookmark: ${error.message}`, "error")
    }
  }
}
