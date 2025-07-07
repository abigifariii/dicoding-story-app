export class StoryService {
  constructor() {
    this.baseUrl = "https://story-api.dicoding.dev/v1"
  }

  async getStories(page = 1, size = 10, location = 0, token = null) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        location: location.toString(),
      })

      const headers = {
        "Content-Type": "application/json",
      }

      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      console.log("Fetching stories with params:", { page, size, location, hasToken: !!token })

      const response = await fetch(`${this.baseUrl}/stories?${params}`, {
        method: "GET",
        headers,
      })

      const data = await response.json()
      console.log("API Response:", data)

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error("Error fetching stories:", error)
      throw new Error(error.message || "Network error occurred")
    }
  }

  async getStoryDetail(id, token) {
    try {
      const response = await fetch(`${this.baseUrl}/stories/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch story detail")
      }

      return data
    } catch (error) {
      console.error("Error fetching story detail:", error)
      throw new Error(error.message || "Network error occurred")
    }
  }

  async addStory(formData, token = null) {
    try {
      const url = token ? `${this.baseUrl}/stories` : `${this.baseUrl}/stories/guest`
      const headers = {}

      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      console.log("Adding story to:", url, "with token:", !!token)

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      })

      const data = await response.json()
      console.log("Add story response:", data)

      if (!response.ok) {
        throw new Error(data.message || "Failed to add story")
      }

      return data
    } catch (error) {
      console.error("Error adding story:", error)
      throw new Error(error.message || "Network error occurred")
    }
  }
}
