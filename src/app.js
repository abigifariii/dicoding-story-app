import "./styles.css"
import { Router } from "./utils/router.js"
import { AuthService } from "./services/auth-service.js"
import { StoryService } from "./services/story-service.js"
import { ToastService } from "./services/toast-service.js"
import { NotificationHelper } from "./utils/notification-helper.js"
import { IndexedDBHelper } from "./utils/indexeddb-helper.js"

// Import page composers
import { HomePage } from "./pages/home/home-page.js"
import { AddStoryPage } from "./pages/add-story/add-story-page.js"
import { ViewStoryPage } from "./pages/view-story/view-story-page.js"
import { StoryDetailPage } from "./pages/story-detail/story-detail-page.js"
import { BookmarksPage } from "./pages/bookmarks/bookmarks-page.js"
import { AboutPage } from "./pages/about/about-page.js"
import { AuthPage } from "./pages/auth/auth-page.js"
import { NotFoundPage } from "./pages/not-found/not-found-page.js"

class App {
  constructor() {
    this.router = new Router()
    this.authService = new AuthService()
    this.storyService = new StoryService()
    this.toastService = new ToastService()
    this.notificationHelper = new NotificationHelper(this.toastService)
    this.indexedDBHelper = new IndexedDBHelper()

    // Initialize page composers with injected dependencies
    this.pages = {
      home: new HomePage(this.storyService, this.toastService, this.authService),
      addStory: new AddStoryPage(this.storyService, this.authService, this.toastService, () =>
        this.router.navigate("home"),
      ), // Pass navigation callback
      viewStory: new ViewStoryPage(this.storyService, this.toastService, this.authService),
      storyDetail: new StoryDetailPage(this.storyService, this.toastService, this.authService, this.indexedDBHelper),
      bookmarks: new BookmarksPage(this.indexedDBHelper, this.toastService),
      about: new AboutPage(),
      auth: new AuthPage(this.authService, this.toastService),
      notFound: new NotFoundPage(this.router),
    }

    this.init()
  }

  async init() {
    console.log("Initializing Dicoding Story App...")

    await this.indexedDBHelper.initDb() // Initialize IndexedDB
    await this.notificationHelper.registerServiceWorker() // Register Service Worker

    this.setupRouter()
    this.setupNavigation()
    this.setupAuth()
    this.setupPushNotifications()
    this.checkAuthState()

    // Start the router
    this.router.start()

    console.log("App initialized successfully")
  }

  setupRouter() {
    this.router.addRoute("home", () => {
      console.log("Navigating to home page")
      this.showPage("home-page", () => this.pages.home.afterRender())
    })

    this.router.addRoute("add-story", () => {
      console.log("Navigating to add story page")
      this.showPage("add-story-page", () => this.pages.addStory.afterRender())
    })

    this.router.addRoute("view-story", (params) => {
      console.log("Navigating to view story page", params)
      this.showPage("view-story-page", () => this.pages.viewStory.afterRender(params?.id))
    })

    this.router.addRoute("story/:id", (params) => {
      console.log("Navigating to story detail page", params)
      this.showPage("story-detail-page", () => this.pages.storyDetail.afterRender(params.id))
    })

    this.router.addRoute("bookmarks", () => {
      console.log("Navigating to bookmarks page")
      this.showPage("bookmarks-page", () => this.pages.bookmarks.afterRender())
    })

    this.router.addRoute("about", () => {
      console.log("Navigating to about page")
      this.showPage("about-page", () => this.pages.about.afterRender())
    })

    // Auth routes (modals are global, so no specific page switch)
    this.router.addRoute("login", () => {
      console.log("Showing login modal")
      this.pages.auth.showLoginModal()
    })

    this.router.addRoute("register", () => {
      console.log("Showing register modal")
      this.pages.auth.showRegisterModal()
    })

    // Not Found route
    this.router.setNotFoundHandler(() => {
      console.log("Navigating to 404 page")
      this.showPage("not-found-page", () => this.pages.notFound.afterRender())
    })

    // Default route
    this.router.setDefaultRoute("home")
  }

  setupNavigation() {
    // Navigation links
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const route = link.getAttribute("href").substring(1)
        console.log("Navigation clicked:", route)
        this.router.navigate(route)
        this.updateActiveNavLink(link)
      })
    })

    // Mobile menu toggle
    const navToggle = document.querySelector(".nav-toggle")
    const navMenu = document.querySelector(".nav-menu")

    if (navToggle && navMenu) {
      navToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active")
      })

      // Close mobile menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
          navMenu.classList.remove("active")
        }
      })
    }
  }

  setupAuth() {
    const loginBtn = document.getElementById("login-btn")
    const registerBtn = document.getElementById("register-btn")
    const logoutBtn = document.getElementById("logout-btn")

    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        console.log("Login button clicked")
        this.router.navigate("login")
      })
    }

    if (registerBtn) {
      registerBtn.addEventListener("click", () => {
        console.log("Register button clicked")
        this.router.navigate("register")
      })
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        console.log("Logout button clicked")
        this.authService.logout()
        this.updateAuthUI()
        this.toastService.show("Logged out successfully", "success")

        // Refresh current page to update content
        const currentRoute = this.router.getCurrentRoute()
        if (currentRoute) {
          this.router.navigate(currentRoute)
        }
      })
    }

    // Listen for auth state changes from AuthPresenter
    this.pages.auth.onAuthStateChange = () => {
      this.updateAuthUI()

      // Refresh current page content if it's home or view-story
      const currentRoute = this.router.getCurrentRoute()
      if (currentRoute === "home") {
        this.pages.home.afterRender()
      } else if (currentRoute === "view-story") {
        this.pages.viewStory.afterRender()
      }
    }
  }

  async setupPushNotifications() {
    const subscribeBtn = document.getElementById("subscribe-btn")
    if (!subscribeBtn) return

    const updateSubscribeButton = async () => {
      const isSubscribed = await this.notificationHelper.getSubscriptionStatus()
      if (isSubscribed) {
        subscribeBtn.textContent = "Unsubscribe"
        subscribeBtn.classList.add("subscribed")
        subscribeBtn.innerHTML = '<i class="fas fa-bell-slash"></i> Unsubscribe'
      } else {
        subscribeBtn.textContent = "Subscribe"
        subscribeBtn.classList.remove("subscribed")
        subscribeBtn.innerHTML = '<i class="fas fa-bell"></i> Subscribe'
      }
    }

    // Initial update
    await updateSubscribeButton()

    subscribeBtn.addEventListener("click", async () => {
      const isSubscribed = await this.notificationHelper.getSubscriptionStatus()
      if (isSubscribed) {
        await this.notificationHelper.unsubscribeUser()
      } else {
        await this.notificationHelper.subscribeUser()
      }
      await updateSubscribeButton() // Update button state after action
    })
  }

  checkAuthState() {
    this.updateAuthUI()

    const user = this.authService.getUser()
    if (user) {
      console.log("User logged in:", user.name)
      this.toastService.show(`Welcome back, ${user.name}!`, "success")
    }
  }

  updateAuthUI() {
    const isLoggedIn = this.authService.isLoggedIn()
    const loginBtn = document.getElementById("login-btn")
    const registerBtn = document.getElementById("register-btn")
    const logoutBtn = document.getElementById("logout-btn")

    console.log("Updating auth UI, logged in:", isLoggedIn)

    if (isLoggedIn) {
      if (loginBtn) loginBtn.style.display = "none"
      if (registerBtn) registerBtn.style.display = "none"
      if (logoutBtn) logoutBtn.style.display = "inline-flex"
    } else {
      if (loginBtn) loginBtn.style.display = "inline-flex"
      if (registerBtn) registerBtn.style.display = "inline-flex"
      if (logoutBtn) logoutBtn.style.display = "none"
    }
  }

  showPage(pageId, afterRenderCallback) {
    // Use View Transition API if supported
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this.switchPage(pageId)
        afterRenderCallback()
      })
    } else {
      this.switchPage(pageId)
      afterRenderCallback()
    }
  }

  switchPage(pageId) {
    document.querySelectorAll(".page").forEach((page) => {
      page.classList.remove("active")
    })

    const targetPage = document.getElementById(pageId)
    if (targetPage) {
      targetPage.classList.add("active")
      console.log("Page switched to:", pageId)
    }
  }

  updateActiveNavLink(activeLink) {
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active")
    })
    activeLink.classList.add("active")
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing app...")
  new App()
})

// Handle any unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason)
  new ToastService().show("An unexpected error occurred", "error")
})
