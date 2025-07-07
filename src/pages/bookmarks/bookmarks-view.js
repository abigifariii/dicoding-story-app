export class BookmarksView {
  constructor() {
    this.bookmarksGrid = null
    this.loading = null
  }

  initElements() {
    this.bookmarksGrid = document.getElementById("bookmarks-grid")
    this.loading = document.getElementById("loading")
  }

  renderBookmarkedStories(stories, onRemoveBookmark) {
    if (!stories || stories.length === 0) {
      this.bookmarksGrid.innerHTML = `
        <div class="no-stories">
          <i class="fas fa-bookmark" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
          <h3>No bookmarked stories yet</h3>
          <p>Save your favorite stories to view them here!</p>
        </div>
      `
      return
    }

    this.bookmarksGrid.innerHTML = stories
      .map(
        (story) => `
        <article class="story-card">
          <img src="${story.photoUrl}" 
               alt="Story by ${this._escapeHtml(story.name)}" 
               class="story-image" 
               loading="lazy"
               onerror="this.src='/placeholder.svg?height=200&width=300'">
          <div class="story-content">
            <h3 class="story-author">${this._escapeHtml(story.name)}</h3>
            <p class="story-description">${this._escapeHtml(this._truncateText(story.description, 100))}</p>
            <time class="story-date" datetime="${story.createdAt}">${this._formatDate(story.createdAt)}</time>
            ${
              story.lat && story.lon
                ? `
              <div class="story-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>Location: ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}</span>
              </div>
            `
                : ""
            }
            <div class="card-actions">
              <a href="#story/${story.id}" class="btn btn-primary btn-sm">
                <i class="fas fa-book-reader"></i> Read Full Story
              </a>
              <button class="btn btn-outline btn-sm remove-bookmark-btn" data-id="${story.id}">
                <i class="fas fa-trash-alt"></i> Remove
              </button>
            </div>
          </div>
        </article>
      `,
      )
      .join("")

    this.bookmarksGrid.querySelectorAll(".remove-bookmark-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const storyId = e.target.dataset.id || e.target.closest("button").dataset.id
        if (storyId) {
          onRemoveBookmark(storyId)
        }
      })
    })
  }

  showLoading(show) {
    this.loading.style.display = show ? "flex" : "none"
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
