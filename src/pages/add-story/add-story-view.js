import L from "leaflet"

export class AddStoryView {
  constructor() {
    this.form = null
    this.clearBtn = null
    this.photoInput = null
    this.photoPreview = null
    this.cameraBtn = null
    this.captureBtn = null
    this.videoElement = null
    this.mapContainer = null
    this.locationDisplay = null
    this.submitBtn = null
    this.map = null
    this.mapInitialized = false
    this.currentMarker = null // To keep track of the single active marker
    this.cameraStream = null // To keep track of the camera stream
  }

  initElements() {
    this.form = document.getElementById("add-story-form")
    this.clearBtn = document.getElementById("clear-form")
    this.photoInput = document.getElementById("story-photo")
    this.photoPreview = document.getElementById("photo-preview")
    this.cameraBtn = document.getElementById("camera-btn")
    this.captureBtn = document.getElementById("capture-btn")
    this.videoElement = document.getElementById("camera-stream")
    this.mapContainer = document.getElementById("location-map")
    this.locationDisplay = document.getElementById("location-display")
    this.submitBtn = document.querySelector('#add-story-form button[type="submit"]')

    this.ensureMapContainer()
  }

  ensureMapContainer() {
    if (this.mapContainer) {
      this.mapContainer.style.height = "300px"
      this.mapContainer.style.width = "100%"
      this.mapContainer.style.minHeight = "300px"
      this.mapContainer.style.display = "block"
      this.mapContainer.style.border = "1px solid #dee2e6"
      this.mapContainer.style.borderRadius = "8px"
      this.mapContainer.style.backgroundColor = "#f8f9fa"
    }
  }

  bindSubmit(handler) {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault()
      handler()
    })
  }

  bindClear(handler) {
    this.clearBtn.addEventListener("click", handler)
  }

  bindFileSelect(handler) {
    this.photoInput.addEventListener("change", (e) => {
      handler(e.target.files[0])
    })
  }

  bindCameraToggle(handler) {
    this.cameraBtn.addEventListener("click", handler)
  }

  bindCapture(handler) {
    this.captureBtn.addEventListener("click", () => {
      try {
        if (!this.videoElement || !this.videoElement.videoWidth || !this.videoElement.videoHeight) {
          throw new Error("Video not ready for capture")
        }

        const canvas = document.createElement("canvas")
        const context = canvas.getContext("2d")

        canvas.width = this.videoElement.videoWidth
        canvas.height = this.videoElement.videoHeight
        context.drawImage(this.videoElement, 0, 0)

        canvas.toBlob(
          (blob) => {
            handler(blob)
          },
          "image/jpeg",
          0.8,
        )
      } catch (error) {
        console.error("Error capturing photo in view:", error)
        // Re-throw or handle error appropriately, maybe a view-level error display
      }
    })
  }

  bindMapClick(handler) {
    if (!this.mapInitialized) {
      console.warn("Map not initialized when binding click handler")
      return
    }
    this.map.on("click", (e) => handler(e.latlng))
  }

  initializeMap() {
    this.removeMap() // Cleanup existing map

    try {
      if (typeof L === "undefined") {
        throw new Error("Leaflet library not loaded")
      }

      this.map = L.map(this.mapContainer, {
        center: [-6.2088, 106.8456],
        zoom: 10,
        zoomControl: true,
        attributionControl: true,
      })

      this.mapInitialized = true

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize()
        }
      }, 100)

      return this.map
    } catch (error) {
      console.error("Failed to initialize map:", error)
      this.mapInitialized = false
      throw error // Re-throw for presenter to handle
    }
  }

  removeMap() {
    if (this.map) {
      this.map.off()
      this.map.remove()
      this.map = null
    }
    this.mapInitialized = false
    this.currentMarker = null // Clear marker reference
    if (this.mapContainer && this.mapContainer._leaflet_id) {
      delete this.mapContainer._leaflet_id
    }
  }

  addTileLayer() {
    if (!this.mapInitialized) return

    try {
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(this.map)
    } catch (error) {
      console.error("Failed to add tile layer:", error)
    }
  }

  setMapView(lat, lng, zoom = 15) {
    if (this.mapInitialized && this.map) {
      try {
        this.map.setView([lat, lng], zoom)
      } catch (error) {
        console.error("Failed to set map view:", error)
      }
    }
  }

  updateLocationMarker(latlng, popupText = "") {
    if (!this.mapInitialized || !this.map) return null

    // Remove existing marker if any
    if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker)
    }

    try {
      const marker = L.marker([latlng.lat, latlng.lng]).addTo(this.map)
      if (popupText) {
        marker.bindPopup(popupText).openPopup()
      }
      this.currentMarker = marker // Store reference to the new marker
      return marker
    } catch (error) {
      console.error("Failed to add marker:", error)
      return null
    }
  }

  clearMapMarker() {
    if (this.currentMarker && this.map && this.map.hasLayer(this.currentMarker)) {
      try {
        this.map.removeLayer(this.currentMarker)
      } catch (error) {
        console.error("Failed to remove marker:", error)
      }
    }
    this.currentMarker = null
  }

  displayPhotoPreview(imageSrc) {
    this.photoPreview.innerHTML = `
      <div style="text-align: center; margin-top: 1rem;">
        <img src="${imageSrc}" 
             alt="Photo preview" 
             style="max-width: 200px; max-height: 200px; border-radius: 8px; 
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1); border: 2px solid #28a745;">
        <p style="margin-top: 0.5rem; color: #28a745; font-weight: bold;">✓ Photo Ready</p>
      </div>
    `
  }

  clearPhotoPreview() {
    this.photoPreview.innerHTML = ""
  }

  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject(new Error("Geolocation not supported by this browser"))
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({ lat: position.coords.latitude, lng: position.coords.longitude })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000, // 5 minutes
        },
      )
    })
  }

  async startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera not supported by this browser")
    }
    const constraints = {
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    }
    this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints)
    this.videoElement.srcObject = this.cameraStream
    this.videoElement.style.display = "block"
    this.videoElement.style.width = "100%"
    this.videoElement.style.maxWidth = "400px"
    this.videoElement.style.height = "auto"
    this.videoElement.style.borderRadius = "8px"
    this.videoElement.style.border = "2px solid #28a745"

    this.captureBtn.style.display = "inline-flex"
    this.cameraBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Camera'
    this.cameraBtn.style.backgroundColor = "#dc3545"
    this.cameraBtn.style.color = "white"

    this.videoElement.play().catch((error) => {
      console.error("Error playing video:", error)
    })
  }

  stopCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((track) => track.stop())
      this.cameraStream = null
    }
    if (this.videoElement.srcObject) {
      this.videoElement.pause()
      this.videoElement.srcObject = null
    }

    this.videoElement.style.display = "none"
    this.captureBtn.style.display = "none"
    this.cameraBtn.innerHTML = '<i class="fas fa-camera"></i> Use Camera'
    this.cameraBtn.style.backgroundColor = ""
    this.cameraBtn.style.color = ""
  }

  isCameraActive() {
    return !!this.cameraStream
  }

  updateLocationDisplay(latlng) {
    this.locationDisplay.innerHTML = `
      <span style="color: #28a745; font-weight: bold;">
        ✓ Selected: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}
      </span>
    `
  }

  clearLocationDisplay() {
    this.locationDisplay.textContent = "Click on the map to set location"
  }

  setLoading(loading) {
    if (loading) {
      this.submitBtn.disabled = true
      this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sharing...'
    } else {
      this.submitBtn.disabled = false
      this.submitBtn.innerHTML = '<i class="fas fa-share"></i> Share Story'
    }
  }

  resetForm() {
    this.form.reset()
  }

  getFormData() {
    return new FormData(this.form)
  }

  getPhotoInputFile() {
    return this.photoInput.files[0]
  }

  setFileInput(file) {
    try {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      this.photoInput.files = dataTransfer.files
    } catch (error) {
      console.error("Error setting file input:", error)
    }
  }

  readFileAsDataURL(file, successCallback, errorCallback) {
    const reader = new FileReader()
    reader.onload = (e) => successCallback(e.target.result)
    reader.onerror = () => errorCallback()
    reader.readAsDataURL(file)
  }
}
