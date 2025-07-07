export class HomePresenter {
  constructor(storyService, toastService, authService, view) {
    this.storyService = storyService
    this.toastService = toastService
    this.authService = authService
    this.view = view
    this.currentPage = 1
    this.pageSize = 9
    this.isLoading = false
  }

  render() {
    // Initialize view elements and bind events
    this.view.initElements()
    this.view.bindPaginationClick(
      () => this.handlePrevPage(),
      () => this.handleNextPage(),
    )
    this.loadStories()
  }

  handlePrevPage() {
    if (this.currentPage > 1) {
      this.currentPage--
      this.loadStories()
    }
  }

  handleNextPage() {
    this.currentPage++
    this.loadStories()
  }

  async loadStories() {
    if (this.isLoading) return

    this.isLoading = true
    this.view.showLoading(true)

    try {
      const token = this.authService.getToken()
      console.log("Loading stories with token:", !!token)

      const response = await this.storyService.getStories(this.currentPage, this.pageSize, 0, token)
      console.log("Stories loaded:", response)

      if (response && response.listStory) {
        this.view.renderStories(response.listStory)
        this.view.updatePagination(this.currentPage, this.currentPage > 1, response.listStory.length >= this.pageSize)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("Error loading stories:", error)
      this.toastService.show(`Failed to load stories: ${error.message}`, "error")
      this.view.renderStories([]) // Render empty state on error
    } finally {
      this.isLoading = false
      this.view.showLoading(false)
    }
  }
}
