import config from "../config.js"
import { AuthService } from "../services/auth-service.js" // Import AuthService to get token

export class NotificationHelper {
  constructor(toastService) {
    this.toastService = toastService
    this.swRegistration = null
    this.authService = new AuthService() // Initialize AuthService
  }

  async registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register("/service-worker.js")
        console.log("Service Worker registered:", this.swRegistration)
        this.toastService.show("Service Worker registered!", "success")
        return this.swRegistration
      } catch (error) {
        console.error("Service Worker registration failed:", error)
        this.toastService.show("Service Worker registration failed.", "error")
        return null
      }
    } else {
      console.warn("Service Worker not supported in this browser.")
      this.toastService.show("Push notifications not supported by your browser.", "warning")
      return null
    }
  }

  async requestNotificationPermission() {
    if (!("Notification" in window)) {
      this.toastService.show("This browser does not support notifications.", "error")
      return "denied"
    }

    const permission = await Notification.requestPermission()
    console.log("Notification permission:", permission)
    if (permission === "granted") {
      this.toastService.show("Notification permission granted!", "success")
    } else {
      this.toastService.show("Notification permission denied.", "warning")
    }
    return permission
  }

  async subscribeUser() {
    if (!this.swRegistration) {
      this.toastService.show("Service Worker not registered. Cannot subscribe.", "error")
      return null
    }

    const permission = await this.requestNotificationPermission()
    if (permission !== "granted") {
      return null
    }

    try {
      const applicationServerKey = this._urlB64ToUint8Array(config.VAPID_PUBLIC_KEY)
      const options = {
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      }

      const subscription = await this.swRegistration.pushManager.subscribe(options)
      console.log("User is subscribed:", subscription)
      this.toastService.show("Successfully subscribed to push notifications!", "success")

      // Send subscription to your backend server
      await this._sendSubscriptionToServer(subscription)
      return subscription
    } catch (error) {
      console.error("Failed to subscribe the user:", error)
      this.toastService.show(`Failed to subscribe: ${error.message}`, "error")
      return null
    }
  }

  async unsubscribeUser() {
    if (!this.swRegistration) {
      this.toastService.show("Service Worker not registered. Cannot unsubscribe.", "error")
      return
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        console.log("User is unsubscribed.")
        this.toastService.show("Successfully unsubscribed from push notifications.", "info")
        // Send a request to your server to remove the subscription
        await this._removeSubscriptionFromServer(subscription)
      } else {
        this.toastService.show("You are not subscribed to notifications.", "info")
      }
    } catch (error) {
      console.error("Failed to unsubscribe the user:", error)
      this.toastService.show(`Failed to unsubscribe: ${error.message}`, "error")
    }
  }

  async getSubscriptionStatus() {
    if (!this.swRegistration) return false
    const subscription = await this.swRegistration.pushManager.getSubscription()
    return !!subscription
  }

  _urlB64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  async _sendSubscriptionToServer(subscription) {
    const token = this.authService.getToken()
    if (!token) {
      this.toastService.show("You must be logged in to subscribe to notifications.", "error")
      return
    }

    try {
      const response = await fetch(config.PUSH_SUBSCRIPTION_SERVER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Failed to send subscription to server: ${response.statusText}`)
      }
      console.log("Subscription sent to server successfully:", data)
    } catch (error) {
      console.error("Error sending subscription to server:", error)
      this.toastService.show(`Failed to save subscription on server: ${error.message}`, "error")
    }
  }

  async _removeSubscriptionFromServer(subscription) {
    const token = this.authService.getToken()
    if (!token) {
      this.toastService.show("You must be logged in to unsubscribe from notifications.", "error")
      return
    }

    try {
      const response = await fetch(config.PUSH_SUBSCRIPTION_SERVER_ENDPOINT, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Failed to remove subscription from server: ${response.statusText}`)
      }
      console.log("Subscription removed from server successfully:", data)
    } catch (error) {
      console.error("Error removing subscription from server:", error)
      this.toastService.show(`Failed to remove subscription from server: ${error.message}`, "error")
    }
  }
}
