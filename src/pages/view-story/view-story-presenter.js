export class ViewStoryPresenter {
  constructor(storyService, toastService, authService, view) {
    this.storyService = storyService
    this.toastService = toastService
    this.authService = authService
    this.view = view
    this.stories = []
  }

  render() {
    this.view.initElements() // Initialize DOM elements in the view
    this.view.initializeMap() // View creates the map instance
    this.view.addTileLayer() // View adds the tile layer
    this.loadStoriesWithLocation()
  }

  async loadStoriesWithLocation() {
    try {
      this.view.showLoading(true)
      const token = this.authService.getToken()
      const response = await this.storyService.getStories(1, 50, 1, token)

      if (response && response.listStory) {
        this.stories = response.listStory.filter(
          (story) => story.lat !== null && story.lon !== null && !isNaN(story.lat) && !isNaN(story.lon),
        )

        this.view.renderStoriesList(this.stories, (index) => this.handleStoryClick(index))
        this.addMarkersToMap()
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      this.toastService.show(`Failed to load stories: ${error.message}`, "error")
      this.view.renderStoriesList([]) // Render empty state on error
    } finally {
      this.view.showLoading(false)
    }
  }

  handleStoryClick(index) {
    this.focusOnStory(index)
  }

  addMarkersToMap() {
    this.view.clearAllMarkers() // View clears all existing markers

    if (!this.stories || this.stories.length === 0) return

    const markersToAdd = []
    this.stories.forEach((story, index) => {
      try {
        const popupContent = this.view.createStoryPopupContent(story) // View creates popup content
        const marker = this.view.addMarker([story.lat, story.lon], popupContent) // View adds marker
        marker.on("click", () => {
          this.view.highlightStoryItem(index)
        })
        markersToAdd.push(marker)
      } catch (error) {
        console.error("Error adding marker for story:", story.id, error)
      }
    })

    if (markersToAdd.length > 0) {
      try {
        this.view.fitMapBounds(markersToAdd) // View fits map bounds
      } catch (error) {
        console.error("Error fitting map bounds:", error)
      }
    }
  }

  focusOnStory(index) {
    if (!this.stories[index]) return

    const story = this.stories[index]

    try {
      this.view.setMapView([story.lat, story.lon], 15) // View sets map view
      this.view.openMarkerPopup(index) // View opens specific marker popup
      this.view.highlightStoryItem(index)
    } catch (error) {
      console.error("Error focusing on story:", error)
    }
  }
}
