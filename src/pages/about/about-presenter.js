export class AboutPresenter {
  constructor(view) {
    this.view = view
  }

  render() {
    this.view.initElements() // Initialize DOM elements (though none for AboutView)
    this.view.render() // Render the static content (already in HTML)
  }
}
