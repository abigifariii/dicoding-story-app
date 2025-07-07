export class NotFoundPresenter {
  constructor(router, view) {
    this.router = router
    this.view = view
  }

  init() {
    this.view.initElements()
    this.view.bindGoHome(() => this.handleGoHome())
  }

  handleGoHome() {
    this.router.navigate("home")
  }
}
