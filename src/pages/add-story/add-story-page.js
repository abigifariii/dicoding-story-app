import { AddStoryView } from "./add-story-view.js"
import { AddStoryPresenter } from "./add-story-presenter.js"

export class AddStoryPage {
  constructor(storyService, authService, toastService) {
    this.storyService = storyService
    this.authService = authService
    this.toastService = toastService
    this.view = null
    this.presenter = null
  }

  render() {
    // Return the static HTML structure for the add story page
    return `
    <section id="add-story-page" class="page">
        <div class="container">
            <header class="page-header">
                <h2>Share Your Story</h2>
                <p>Create and share your amazing story with the community</p>
            </header>
            <form id="add-story-form" class="story-form">
                <div class="form-group">
                    <label for="story-description">Story Description</label>
                    <textarea id="story-description" name="description" required 
                              placeholder="Tell us your story..." rows="4"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="story-photo">Photo</label>
                    <div class="photo-input-container">
                        <input type="file" id="story-photo" name="photo" accept="image/*" required>
                        <button type="button" id="camera-btn" class="btn btn-outline">
                            <i class="fas fa-camera"></i> Use Camera
                        </button>
                    </div>
                    <div id="photo-preview" class="photo-preview"></div>
                    <video id="camera-stream" class="camera-stream" style="display: none;" autoplay></video>
                    <button type="button" id="capture-btn" class="btn btn-primary" style="display: none;">
                        <i class="fas fa-camera"></i> Capture Photo
                    </button>
                </div>

                <div class="form-group">
                    <label>Location (Optional)</label>
                    <div id="location-map" class="location-map"></div>
                    <div class="location-info">
                        <input type="hidden" id="story-lat" name="lat">
                        <input type="hidden" id="story-lon" name="lon">
                        <p id="location-display">Click on the map to set location</p>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-share"></i> Share Story
                    </button>
                    <button type="button" id="clear-form" class="btn btn-outline">
                        <i class="fas fa-times"></i> Clear
                    </button>
                </div>
            </form>
        </div>
    </section>
  `
  }

  afterRender() {
    // Initialize View and Presenter after the DOM is ready
    this.view = new AddStoryView()
    this.presenter = new AddStoryPresenter(this.storyService, this.authService, this.toastService, this.view)
    this.presenter.initialize()
  }
}
