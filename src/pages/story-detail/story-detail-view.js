import L from "leaflet"

export class StoryDetailView {
  constructor() {
    this.detailTitle = null
    this.detailAuthor = null
    this.detailContent = null
    this.loading = null
    this.bookmarkBtn = null
  }

  initElements() {
    this.detailTitle = document.getElementById("detail-story-title")
    this.detailAuthor = document.getElementById("detail-story-author")
    this.detailContent = document.getElementById("story-detail-content")
    this.loading = document.getElementById("loading")
  }

  renderStoryDetail(story, isBookmarked) {
    if (!story) {
      this.detailContent.innerHTML = `<p class="text-center">Story not found.</p>`
      return
    }

    this.detailTitle.textContent = `Story by ${this._escapeHtml(story.name)}`
    this.detailAuthor.textContent = `Shared on ${this._formatDate(story.createdAt)}`

    this.detailContent.innerHTML = `
      <div class="story-detail-card">
        <img src="${story.photoUrl}"
             alt="Story by ${this._escapeHtml(story.name)}"
             class="story-detail-image"
             onerror="this.src='/placeholder.svg?height=400&width=600'">
        <div class="story-detail-body">
          <p class="story-detail-description">${this._escapeHtml(story.description)}</p>
          ${
            story.lat && story.lon
              ? `
              <div class="story-detail-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>Location: ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}</span>
              </div>
              <div id="detail-map" class="detail-map"></div>
              `
              : ""
          }
          <button id="bookmark-btn" class="btn btn-outline bookmark-btn">
            <i class="fas fa-bookmark"></i> ${isBookmarked ? "Remove from Bookmarks" : "Add to Bookmarks"}
          </button>
        </div>
      </div>
    `
    this.bookmarkBtn = document.getElementById("bookmark-btn")
    this.updateBookmarkButton(isBookmarked)

    if (story.lat && story.lon) {
      this._renderMap(story.lat, story.lon, story.name)
    }
  }

  bindBookmarkToggle(handler) {
    if (this.bookmarkBtn) {
      this.bookmarkBtn.addEventListener("click", handler)
    }
  }

  updateBookmarkButton(isBookmarked) {
    if (this.bookmarkBtn) {
      this.bookmarkBtn.innerHTML = `<i class="fas fa-bookmark"></i> ${
        isBookmarked ? "Remove from Bookmarks" : "Add to Bookmarks"
      }`
      this.bookmarkBtn.classList.toggle("bookmarked", isBookmarked)
    }
  }

  _renderMap(lat, lon, name) {
    const mapElement = document.getElementById("detail-map")
    if (mapElement && typeof L !== "undefined") {
      const map = L.map(mapElement).setView([lat, lon], 13)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map)
      L.marker([lat, lon])
        .addTo(map)
        .bindPopup(`<b>${this._escapeHtml(name)}'s Story</b>`)
        .openPopup()

      // Invalidate size to ensure map renders correctly after content is loaded
      setTimeout(() => {
        map.invalidateSize()
      }, 100)
    }
  }

  renderError(message) {
    this.detailTitle.textContent = "Error"
    this.detailAuthor.textContent = ""
    this.detailContent.innerHTML = `<p class="text-center error-message">${this._escapeHtml(message)}</p>`
  }

  showLoading(show) {
    this.loading.style.display = show ? "flex" : "none"
  }

  _escapeHtml(text) {
    if (!text) return ""
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  _formatDate(dateString) {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return "Unknown date"
    }
  }
}
