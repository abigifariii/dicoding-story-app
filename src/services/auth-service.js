export class AuthService {
  constructor() {
    this.baseUrl = "https://story-api.dicoding.dev/v1"
    this.tokenKey = "dicoding-story-token"
    this.userKey = "dicoding-story-user"
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      // Store token and user info
      localStorage.setItem(this.tokenKey, data.loginResult.token)
      localStorage.setItem(
        this.userKey,
        JSON.stringify({
          userId: data.loginResult.userId,
          name: data.loginResult.name,
        }),
      )

      return data
    } catch (error) {
      throw new Error(error.message || "Network error occurred")
    }
  }

  async register(name, email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      return data
    } catch (error) {
      throw new Error(error.message || "Network error occurred")
    }
  }

  logout() {
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.userKey)
  }

  getToken() {
    return localStorage.getItem(this.tokenKey)
  }

  getUser() {
    const userStr = localStorage.getItem(this.userKey)
    return userStr ? JSON.parse(userStr) : null
  }

  isLoggedIn() {
    return !!this.getToken()
  }

  getAuthHeaders() {
    const token = this.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
}
