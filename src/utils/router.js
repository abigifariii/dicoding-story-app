export class Router {
  constructor() {
    this.routes = new Map()
    this.defaultRoute = null
    this.currentRoute = null
    this.notFoundHandler = null // New property for 404 handler
  }

  addRoute(path, handler) {
    this.routes.set(path, handler)
  }

  setDefaultRoute(path) {
    this.defaultRoute = path
  }

  setNotFoundHandler(handler) {
    this.notFoundHandler = handler
  }

  navigate(path) {
    window.location.hash = `#${path}`
  }

  start() {
    window.addEventListener("hashchange", () => {
      this.handleRouteChange()
    })

    // Handle initial load
    this.handleRouteChange()
  }

  handleRouteChange() {
    const hash = window.location.hash.substring(1)
    let routePath = hash.split("/")[0] // Get the base route (e.g., "story" from "story/123")
    const params = this._extractParams(hash) // Extract parameters

    let handler = this.routes.get(routePath)

    // Handle dynamic routes like 'story/:id'
    if (!handler) {
      for (const [key, value] of this.routes.entries()) {
        if (key.includes(":")) {
          const regex = new RegExp(`^${key.replace(/:[^/]+/g, "([^/]+)")}$`)
          const match = hash.match(regex)
          if (match) {
            handler = value
            const paramNames = key.match(/:[^/]+/g).map((p) => p.substring(1))
            paramNames.forEach((name, index) => {
              params[name] = match[index + 1]
            })
            routePath = key // Set routePath to the pattern for active link update
            break
          }
        }
      }
    }

    if (handler) {
      this.currentRoute = routePath // Store the route pattern (e.g., "story/:id")
      handler(params)
    } else if (this.notFoundHandler) {
      this.currentRoute = "404" // Indicate 404 route
      this.notFoundHandler()
    } else if (this.defaultRoute) {
      this.navigate(this.defaultRoute)
    }
  }

  _extractParams(hash) {
    const parts = hash.split("/")
    const params = {}
    if (parts.length > 1) {
      // Assuming format like #route/param1/param2 or #route/id
      // For now, we only support a single ID parameter after the route name
      if (parts[0] === "story" && parts[1]) {
        params.id = parts[1]
      }
    }
    return params
  }

  getCurrentRoute() {
    return this.currentRoute
  }
}
