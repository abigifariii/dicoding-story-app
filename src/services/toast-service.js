export class ToastService {
  constructor() {
    this.container = document.getElementById("toast-container")
  }

  show(message, type = "info", duration = 5000) {
    const toast = document.createElement("div")
    toast.className = `toast ${type}`

    const icon = this.getIcon(type)
    toast.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `

    this.container.appendChild(toast)

    // Auto remove after duration
    setTimeout(() => {
      this.remove(toast)
    }, duration)

    // Allow manual removal by clicking
    toast.addEventListener("click", () => {
      this.remove(toast)
    })
  }

  remove(toast) {
    if (toast && toast.parentNode) {
      toast.style.animation = "slideOut 0.3s ease forwards"
      setTimeout(() => {
        toast.remove()
      }, 300)
    }
  }

  getIcon(type) {
    const icons = {
      success: "fas fa-check-circle",
      error: "fas fa-exclamation-circle",
      warning: "fas fa-exclamation-triangle",
      info: "fas fa-info-circle",
    }
    return icons[type] || icons.info
  }
}
