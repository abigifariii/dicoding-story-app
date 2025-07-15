export class AddStoryPresenter {
  constructor(storyService, authService, toastService, view, onStoryAddedCallback) {
    this.storyService = storyService
    this.authService = authService
    this.toastService = toastService
    this.view = view
    this.onStoryAddedCallback = onStoryAddedCallback // Callback for App to navigate

    this.selectedLocation = null
    this.capturedPhoto = null
  }

  initialize() {
    this.view.initElements() // Initialize DOM elements in the view
    this.initMap()
    this.initViewBindings()
  }

  initViewBindings() {
    this.view.bindSubmit(() => this.handleSubmit())
    this.view.bindClear(() => this.clearForm())
    this.view.bindFileSelect((file) => this.handleFileSelect(file))
    this.view.bindCameraToggle(() => this.toggleCamera())
    this.view.bindCapture((blob) => this.capturePhoto(blob))
    this.view.bindMapClick((latlng) => this.selectLocation(latlng))
  }

  initMap() {
    try {
      this.view.initializeMap() // View initializes the map instance
      this.view.addTileLayer() // View adds the tile layer
      this.getCurrentLocation()
    } catch (error) {
      console.error("Map initialization error:", error)
      this.toastService.show("Failed to initialize map. Please refresh the page.", "error")
    }
  }

  async toggleCamera() {
    if (this.view.isCameraActive()) {
      this.view.stopCamera()
      this.toastService.show("Camera stopped", "info")
    } else {
      try {
        await this.view.startCamera()
        this.toastService.show("Camera started successfully!", "success")
      } catch (error) {
        console.error("Camera error:", error)
        let errorMessage = "Camera access failed: "
        if (error.name === "NotAllowedError") {
          errorMessage += "Please allow camera access in your browser settings."
        } else if (error.name === "NotFoundError") {
          errorMessage += "No camera found on this device."
        } else if (error.name === "NotReadableError") {
          errorMessage += "Camera is already in use by another application."
        } else {
          errorMessage += error.message
        }
        this.toastService.show(errorMessage, "error")
      }
    }
  }

  async getCurrentLocation() {
    this.toastService.show("Detecting your location...", "info")
    if (!navigator.geolocation) {
      this.toastService.show("Geolocation is not supported by your browser. Please select manually on the map.", "warning")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const userLocation = { lat, lng }
        this.view.setMapView(lat, lng)
        this.selectLocation(userLocation, "📍 Your current location")
        this.toastService.show("Location detected successfully!", "success")
      },
      (error) => {
        console.error("Geolocation error:", error)
        let errorMessage = "Could not detect your location. "
        if (error.code === 1) {
          errorMessage += "Location access denied."
        } else if (error.code === 2) {
          errorMessage += "Location unavailable."
        } else if (error.code === 3) {
          errorMessage += "Location request timed out."
        } else {
          errorMessage += error.message
        }
        errorMessage += " Please select manually on the map."
        this.toastService.show(errorMessage, "warning")
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  selectLocation(latlng, popupText = `📍 Selected location: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`) {
    this.view.updateLocationMarker(latlng, popupText) // View handles removing old and adding new marker
    this.selectedLocation = latlng
    this.view.updateLocationDisplay(latlng)
    this.toastService.show("Location selected successfully!", "success")
  }

  handleFileSelect(file) {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      this.toastService.show("Please select a valid image file", "error")
      return
    }

    if (file.size > 1024 * 1024) {
      this.toastService.show("Image size must be less than 1MB", "error")
      return
    }

    this.view.readFileAsDataURL(
      file,
      (result) => {
        this.view.displayPhotoPreview(result)
        this.capturedPhoto = file // Store the actual file object
        this.toastService.show("Photo selected successfully!", "success")
      },
      () => {
        this.toastService.show("Failed to read the selected file", "error")
      },
    )
  }

  capturePhoto(blob) {
    if (!blob) {
      this.toastService.show("Failed to capture photo", "error")
      return
    }

    this.capturedPhoto = new File([blob], `captured-photo-${Date.now()}.jpg`, {
      type: "image/jpeg",
    })

    this.view.readFileAsDataURL(
      this.capturedPhoto,
      (result) => {
        this.view.displayPhotoPreview(result)
        this.view.setFileInput(this.capturedPhoto)
        this.view.stopCamera()
        this.toastService.show("Photo captured successfully!", "success")
      },
      () => {
        this.toastService.show("Failed to process captured photo", "error")
      },
    )
  }

  async handleSubmit() {
    try {
      const formData = this.view.getFormData()
      const description = formData.get("description")

      if (!description || description.trim().length === 0) {
        this.toastService.show("Please enter a story description", "error")
        return
      }

      const photo = this.view.getPhotoInputFile() || this.capturedPhoto
      if (!photo) {
        this.toastService.show("Please select or capture a photo", "error")
        return
      }

      const apiFormData = new FormData()
      apiFormData.append("description", description.trim())
      apiFormData.append("photo", photo)

      if (this.selectedLocation) {
        apiFormData.append("lat", this.selectedLocation.lat.toString())
        apiFormData.append("lon", this.selectedLocation.lng.toString())
      }

      this.view.setLoading(true)
      const token = this.authService.getToken()
      await this.storyService.addStory(apiFormData, token)

      this.toastService.show("Story shared successfully!", "success")
      this.clearForm()

      if (this.onStoryAddedCallback) {
        this.onStoryAddedCallback() // Notify App to navigate
      }
    } catch (error) {
      console.error("Error adding story:", error)
      this.toastService.show(`Failed to share story: ${error.message}`, "error")
    } finally {
      this.view.setLoading(false)
    }
  }

  clearForm() {
    this.view.resetForm()
    this.view.clearPhotoPreview()
    this.view.clearMapMarker() // View handles removing the marker
    this.view.clearLocationDisplay()
    this.view.setMapView(-6.2088, 106.8456, 10)

    this.selectedLocation = null
    this.capturedPhoto = null
    this.view.stopCamera() // View handles stopping camera stream

    this.toastService.show("Form cleared", "info")
  }
}
