export class NotFoundView {
  constructor() {
    this.goHomeBtn = null
  }

  initElements() {
    this.goHomeBtn = document.getElementById("go-home-btn")
  }

  bindGoHome(handler) {
    if (this.goHomeBtn) {
      this.goHomeBtn.addEventListener("click", handler)
    }
  }
}
