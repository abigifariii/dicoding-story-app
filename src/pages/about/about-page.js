import { AboutView } from "./about-view.js"
import { AboutPresenter } from "./about-presenter.js"

export class AboutPage {
  constructor() {
    this.view = null
    this.presenter = null
  }

  render() {
    // Return the static HTML structure for the about page
    return `
    <section id="about-page" class="page">
        <div class="container">
            <header class="page-header">
                <h2>About Dicoding Stories</h2>
            </header>
            <div class="about-content">
                <div class="about-section">
                    <h3>What is Dicoding Stories?</h3>
                    <p>Dicoding Stories is a platform where the Dicoding community can share their learning journey, experiences, and achievements. It's like Instagram but specifically designed for the Dicoding community.</p>
                </div>
                <div class="about-section">
                    <h3>Features</h3>
                    <ul>
                        <li><i class="fas fa-home"></i> Browse latest stories from the community</li>
                        <li><i class="fas fa-plus"></i> Share your own stories with photos and locations</li>
                        <li><i class="fas fa-map"></i> Explore stories on an interactive map</li>
                        <li><i class="fas fa-user"></i> User authentication and personalized experience</li>
                    </ul>
                </div>
                <div class="about-section">
                    <h3>Technology</h3>
                    <p>This application is built using modern web technologies including:</p>
                    <ul>
                        <li>Vanilla JavaScript with SPA architecture</li>
                        <li>Webpack for module bundling</li>
                        <li>Leaflet for interactive maps</li>
                        <li>Responsive design with CSS Grid and Flexbox</li>
                        <li>WCAG accessibility standards</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
  `
  }

  afterRender() {
    // Initialize View and Presenter after the DOM is ready
    this.view = new AboutView()
    this.presenter = new AboutPresenter(this.view)
    this.presenter.render()
  }
}
