export class HomeView {
  constructor() {
    this.storiesGrid = null
    this.prevBtn = null
    this.nextBtn = null
    this.pageInfo = null
    this.loading = null
  }

  initElements() {
    this.storiesGrid = document.getElementById("stories-grid")
    this.prevBtn = document.getElementById("prev-page")
    this.nextBtn = document.getElementById("next-page")
    this.pageInfo = document.getElementById("page-info")
    this.loading = document.getElementById("loading")
  }

  bindPaginationClick(onPrevClick, onNextClick) {
    // Ensure event listeners are not duplicated by cloning and replacing
    const newPrevBtn = this.prevBtn.cloneNode(true)
    const newNextBtn = this.nextBtn.cloneNode(true)

    this.prevBtn.parentNode.replaceChild(newPrevBtn, this.prevBtn)
    this.nextBtn.parentNode.replaceChild(newNextBtn, this.nextBtn)

    this.prevBtn = newPrevBtn
    this.nextBtn = newNextBtn

    this.prevBtn.addEventListener("click", onPrevClick)
    this.nextBtn.addEventListener("click", onNextClick)
  }

  renderStories(stories) {
    if (!stories || stories.length === 0) {
      this.storiesGrid.innerHTML = `
      <div class="no-stories">
        <i class="fas fa-book-open" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
        <h3>No stories found</h3>
        <p>Be the first to share your story!</p>
      </div>
    `
      return
    }

    this.storiesGrid.innerHTML = stories
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
          </div>
        </div>
      </article>
    `,
      )
      .join("")
  }

  updatePagination(currentPage, canGoPrev, canGoNext) {
    this.prevBtn.disabled = !canGoPrev
    this.nextBtn.disabled = !canGoNext
    this.pageInfo.textContent = `Page ${currentPage}`
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
