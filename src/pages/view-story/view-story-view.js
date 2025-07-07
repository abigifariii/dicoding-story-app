import L from "leaflet"

export class ViewStoryView {
  constructor() {
    this.mapContainer = null
    this.storiesList = null
    this.loading = null
    this.map = null
    this.markers = [] // To keep track of all story markers
  }

  initElements() {
    this.mapContainer = document.getElementById("stories-map")
    this.storiesList = document.getElementById("stories-list")
    this.loading = document.getElementById("loading")
  }

  initializeMap() {
    if (this.map) {
      this.map.remove() // Ensure old map is removed
    }
    this.map = L.map(this.mapContainer).setView([-6.2088, 106.8456], 5)
    return this.map
  }

  addTileLayer() {
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(this.map)
  }

  addMarker(latlng, popupContent) {
    const marker = L.marker(latlng).addTo(this.map)
    marker.bindPopup(popupContent, {
      maxWidth: 220,
      className: "custom-popup",
    })
    this.markers.push(marker) // Store the marker
    return marker
  }

  clearAllMarkers() {
    this.markers.forEach((marker) => {
      if (marker && this.map.hasLayer(marker)) {
        this.map.removeLayer(marker)
      }
    })
    this.markers = []
  }

  setMapView(latlng, zoom) {
    this.map.setView(latlng, zoom)
  }

  fitMapBounds(markers) {
    if (markers.length > 0) {
      const group = new L.featureGroup(markers)
      this.map.fitBounds(group.getBounds(), { padding: [20, 20] })
    }
  }

  openMarkerPopup(index) {
    if (this.markers[index]) {
      this.markers[index].openPopup()
    }
  }

  renderStoriesList(stories, onStoryClick) {
    if (!stories || stories.length === 0) {
      this.storiesList.innerHTML = `
      <div class="no-stories">
        <i class="fas fa-map-marker-alt" style="font-size: 2rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
        <h3>No stories with location found</h3>
        <p>Stories with location data will appear here</p>
      </div>
    `
      return
    }

    this.storiesList.innerHTML = stories
      .map(
        (story, index) => `
      <div class="story-item" data-index="${index}" role="button" tabindex="0">
        <h4 class="story-author">${this._escapeHtml(story.name)}</h4>
        <p class="story-description">${this._escapeHtml(this._truncateText(story.description, 80))}</p>
        <div class="story-location">
          <i class="fas fa-map-marker-alt"></i>
          <span>${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}</span>
        </div>
        <time class="story-date" datetime="${story.createdAt}">${this._formatDate(story.createdAt)}</time>
        <div class="card-actions">
          <a href="#story/${story.id}" class="btn btn-primary btn-sm">
            <i class="fas fa-book-reader"></i> Read Full Story
          </a>
        </div>
      </div>
    `,
      )
      .join("")

    this.storiesList.querySelectorAll(".story-item").forEach((item) => {
      const clickHandler = () => {
        const index = Number.parseInt(item.dataset.index)
        onStoryClick(index)
      }

      item.addEventListener("click", clickHandler)
      item.addEventListener("keypress", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          clickHandler()
        }
      })
    })
  }

  highlightStoryItem(index) {
    this.storiesList.querySelectorAll(".story-item").forEach((item) => {
      item.classList.remove("active")
    })

    const selectedItem = this.storiesList.querySelector(`[data-index="${index}"]`)
    if (selectedItem) {
      selectedItem.classList.add("active")
      selectedItem.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  showLoading(show) {
    this.loading.style.display = show ? "flex" : "none"
  }

  createStoryPopupContent(story) {
    return `
      <div class="story-popup">
        <img src="${story.photoUrl}"
           alt="Story by ${this._escapeHtml(story.name)}"
           style="width: 200px; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;"
           onerror="this.src='/placeholder.svg?height=150&width=200'">
        <h4 style="margin: 0 0 8px 0; color: var(--primary-color);">${this._escapeHtml(story.name)}</h4>
        <p style="margin: 0 0 8px 0; font-size: 0.9rem;">${this._escapeHtml(this._truncateText(story.description, 100))}</p>
        <small style="color: var(--text-secondary);">${this._formatDate(story.createdAt)}</small>
        <div style="margin-top: 8px;">
          <a href="#story/${story.id}" class="btn btn-primary btn-sm">
            <i class="fas fa-book-reader"></i> Read Full Story
          </a>
        </div>
      </div>
    `
  }

  _truncateText(text, maxLength) {
    if (!text) return ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
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
