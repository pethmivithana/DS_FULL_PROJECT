"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import { checkApiStatus, createMenuItem } from "../services/api"

// Sample manager IDs for demonstration
const SAMPLE_MANAGER_IDS = ["64f8a9b2e5c8d7f6a3b2c1d0", "64f8a9b2e5c8d7f6a3b2c1d1"]

// Generate a temporary ID for offline items
const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// API base URL - ensure this matches your backend
const API_BASE_URL = "http://localhost:5000"

// Maximum image dimensions for localStorage
const MAX_IMAGE_WIDTH = 800
const MAX_IMAGE_HEIGHT = 600
const IMAGE_QUALITY = 0.7

const CreateMenuItem = () => {
  const { currentTheme } = useTheme()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    restaurantId: SAMPLE_MANAGER_IDS[0],
    restaurantName: "",
    foodName: "",
    category: "",
    prices: {
      small: "",
      medium: "",
      large: "",
    },
  })

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState("")
  const [offlineMode, setOfflineMode] = useState(false)
  const [pendingUploads, setPendingUploads] = useState([])
  const [debugInfo, setDebugInfo] = useState(null)
  const [apiStatus, setApiStatus] = useState({ isChecking: true, isOnline: false })
  const [storageStatus, setStorageStatus] = useState({ available: true, used: 0, total: 0 })
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  const [lastApiResponse, setLastApiResponse] = useState(null)

  // Load pending uploads from localStorage on component mount
  useEffect(() => {
    try {
      const storedUploads = localStorage.getItem("pendingMenuItems")
      if (storedUploads) {
        setPendingUploads(JSON.parse(storedUploads))
      }

      // Check storage usage
      checkStorageUsage()
    } catch (err) {
      console.error("Error parsing stored uploads:", err)
      localStorage.removeItem("pendingMenuItems")
    }
  }, [])

  // Check localStorage usage
  const checkStorageUsage = () => {
    try {
      let total = 0
      let used = 0

      // Estimate total localStorage size (varies by browser)
      total = 5 * 1024 * 1024 // Assume 5MB as a conservative estimate

      // Calculate current usage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        const value = localStorage.getItem(key)
        used += (key.length + value.length) * 2 // UTF-16 uses 2 bytes per character
      }

      setStorageStatus({
        available: used < total * 0.9, // Consider storage available if less than 90% used
        used,
        total,
      })

      setDebugInfo((prev) => ({
        ...prev,
        storageStatus: { used, total, percentUsed: ((used / total) * 100).toFixed(2) + "%" },
      }))
    } catch (err) {
      console.error("Error checking storage usage:", err)
      setStorageStatus({ available: false, used: 0, total: 0 })
    }
  }

  // Check if the API is online - more robust check
  useEffect(() => {
    const checkStatus = async () => {
      try {
        setApiStatus({ isChecking: true, isOnline: false })

        const status = await checkApiStatus()
        setApiStatus({
          isChecking: false,
          isOnline: status.isOnline,
          details: status,
        })
        setOfflineMode(!status.isOnline)

        console.log(`API status check: ${status.isOnline ? "ONLINE" : "OFFLINE"}`, status)

        if (!status.isOnline) {
          console.warn(`API check failed:`, status)
        }
      } catch (err) {
        console.warn("API check failed:", err.message)
        setApiStatus({ isChecking: false, isOnline: false, error: err.message })
        setOfflineMode(true)
      }
    }

    checkStatus()

    // Set up periodic API status checking
    const intervalId = setInterval(checkStatus, 30000) // Check every 30 seconds

    return () => clearInterval(intervalId)
  }, [])

  // Save pending uploads to localStorage whenever they change
  useEffect(() => {
    if (pendingUploads.length > 0) {
      try {
        const pendingItemsJson = JSON.stringify(pendingUploads)
        localStorage.setItem("pendingMenuItems", pendingItemsJson)
        checkStorageUsage()
      } catch (err) {
        console.error("Error saving to localStorage:", err)

        if (err.name === "QuotaExceededError" || err.message.includes("exceeded the quota")) {
          setError("Local storage is full. Please upload existing items before adding new ones.")
          // Try to save without images as a fallback
          try {
            const itemsWithoutImages = pendingUploads.map((item) => ({
              ...item,
              imageUrl: item.imageUrl ? "IMAGE_TOO_LARGE" : null,
            }))
            localStorage.setItem("pendingMenuItems", JSON.stringify(itemsWithoutImages))
          } catch (innerErr) {
            console.error("Failed to save even without images:", innerErr)
          }
        }
      }
    } else {
      localStorage.removeItem("pendingMenuItems")
    }
  }, [pendingUploads])

  const validateForm = () => {
    const errors = {}

    // Required fields
    if (!formData.restaurantId.trim()) errors.restaurantId = "Manager ID is required"
    if (!formData.restaurantName.trim()) errors.restaurantName = "Restaurant name is required"
    if (!formData.foodName.trim()) errors.foodName = "Food name is required"
    if (!formData.category) errors.category = "Category is required"

    // Price validation
    const priceFields = ["small", "medium", "large"]
    let hasPriceError = true

    priceFields.forEach((size) => {
      const price = Number.parseFloat(formData.prices[size])

      // At least one price must be set
      if (!isNaN(price) && price > 0) {
        hasPriceError = false
      }

      // If price is set, validate it
      if (formData.prices[size] !== "") {
        if (isNaN(price)) {
          errors[`prices.${size}`] = "Must be a valid number"
        } else if (price <= 0) {
          errors[`prices.${size}`] = "Price must be greater than 0"
        } else if (price > 1000) {
          errors[`prices.${size}`] = "Price cannot exceed $1000"
        }
      }
    })

    if (hasPriceError) {
      errors.prices = "At least one price option must be set"
    }

    // MongoDB ObjectId validation for restaurantId (simplified)
    const objectIdPattern = /^[0-9a-fA-F]{24}$/
    if (formData.restaurantId && !objectIdPattern.test(formData.restaurantId)) {
      errors.restaurantId = "Invalid Manager ID format"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    // Clear field-specific error when user makes changes
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }))
    }

    if (name.startsWith("prices.")) {
      const priceField = name.split(".")[1]

      // Clear price-specific error
      if (fieldErrors[name]) {
        setFieldErrors((prev) => ({ ...prev, [name]: "" }))
      }

      // Clear general prices error
      if (fieldErrors.prices) {
        setFieldErrors((prev) => ({ ...prev, prices: "" }))
      }

      setFormData((prev) => ({
        ...prev,
        prices: {
          ...prev.prices,
          [priceField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  // Compress image before storing
  const compressImage = (dataUrl, maxWidth, maxHeight, quality) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = dataUrl
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Calculate new dimensions
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width))
          width = maxWidth
        }

        if (height > maxHeight) {
          width = Math.round(width * (maxHeight / height))
          height = maxHeight
        }

        // Create canvas and resize
        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0, width, height)

        // Get compressed data URL
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality)

        // Log compression stats
        const originalSize = Math.round(dataUrl.length / 1024)
        const compressedSize = Math.round(compressedDataUrl.length / 1024)
        console.log(
          `Image compressed: ${originalSize}KB → ${compressedSize}KB (${Math.round((compressedSize / originalSize) * 100)}%)`,
        )

        resolve(compressedDataUrl)
      }
      img.onerror = reject
    })
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        image: "Please select a valid image file (JPEG, PNG, GIF, WEBP)",
      }))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        image: "Image size should not exceed 5MB",
      }))
      return
    }

    // Clear any previous errors
    if (fieldErrors.image) {
      setFieldErrors((prev) => ({ ...prev, image: "" }))
    }

    setImageFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        // Compress image if we're likely to use localStorage
        if (!apiStatus.isOnline) {
          const compressedImage = await compressImage(reader.result, MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT, IMAGE_QUALITY)
          setImagePreview(compressedImage)
        } else {
          setImagePreview(reader.result)
        }
      } catch (err) {
        console.error("Error compressing image:", err)
        setImagePreview(reader.result) // Fallback to original
      }
    }
    reader.readAsDataURL(file)
  }

  // Save item to localStorage for offline mode
  const saveItemOffline = async () => {
    // Format prices to ensure they're valid numbers
    const formattedPrices = {}
    Object.entries(formData.prices).forEach(([size, value]) => {
      if (value !== "") {
        formattedPrices[size] = Number.parseFloat(value)
      }
    })

    let imageToStore = imagePreview

    // If storage is getting full, try to compress the image further or remove it
    if (!storageStatus.available && imagePreview) {
      try {
        // Try more aggressive compression
        imageToStore = await compressImage(imagePreview, 400, 300, 0.5)

        // If still too large, use a placeholder
        const testObj = { test: imageToStore }
        const testJson = JSON.stringify(testObj)
        if (testJson.length > 500000) {
          // If over ~500KB
          imageToStore = null
        }
      } catch (err) {
        console.error("Error with additional compression:", err)
        imageToStore = null
      }
    }

    // Create a new menu item with a temporary ID
    const newItem = {
      _id: generateTempId(),
      restaurantId: formData.restaurantId.trim(),
      restaurantName: formData.restaurantName.trim(),
      foodName: formData.foodName.trim(),
      category: formData.category,
      prices: formattedPrices,
      imageUrl: imageToStore, // Store the compressed data URL for the image
      createdAt: new Date().toISOString(),
      isPending: true,
    }

    // Add to pending uploads
    try {
      setPendingUploads((prev) => [...prev, newItem])
      return newItem
    } catch (err) {
      console.error("Error adding to pending uploads:", err)

      // If quota exceeded, try without the image
      if (err.name === "QuotaExceededError" || err.message.includes("quota")) {
        const itemWithoutImage = { ...newItem, imageUrl: null }
        setPendingUploads((prev) => [...prev, itemWithoutImage])
        return itemWithoutImage
      }

      throw err
    }
  }

  // Toggle debug info display
  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Reset messages
    setError("")
    setSuccessMessage("")
    setDebugInfo(null)
    setLastApiResponse(null)

    // Validate form
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = Object.keys(fieldErrors)[0]
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
        element.focus()
      }
      return
    }

    setIsSubmitting(true)

    try {
      // Format prices to ensure they're valid numbers
      const formattedPrices = {}
      Object.entries(formData.prices).forEach(([size, value]) => {
        if (value !== "") {
          formattedPrices[size] = Number.parseFloat(value)
        }
      })

      // Check API status first
      const status = await checkApiStatus()
      console.log("API status before submission:", status)

      // If API is not available, save offline
      if (!status.isOnline) {
        console.log("API unavailable, saving item offline")
        await saveItemOffline()
        setSuccessMessage(
          "Network connection unavailable. Menu item saved locally and will be uploaded when connection is restored.",
        )
        setDebugInfo({
          apiStatus: status,
          offlineSave: true,
        })

        // Reset form after successful offline save
        setFormData({
          restaurantId: SAMPLE_MANAGER_IDS[0],
          restaurantName: "",
          foodName: "",
          category: "",
          prices: {
            small: "",
            medium: "",
            large: "",
          },
        })
        setImageFile(null)
        setImagePreview(null)

        // Navigate after a short delay
        setTimeout(() => {
          navigate("/")
        }, 2000)

        setIsSubmitting(false)
        return
      }

      // API is available, proceed with online submission
      console.log("API available, submitting to database")

      const formDataToSend = new FormData()
      formDataToSend.append("restaurantId", formData.restaurantId.trim())
      formDataToSend.append("restaurantName", formData.restaurantName.trim())
      formDataToSend.append("foodName", formData.foodName.trim())
      formDataToSend.append("category", formData.category)
      formDataToSend.append("prices", JSON.stringify(formattedPrices))

      if (imageFile) {
        formDataToSend.append("image", imageFile)
      }

      // Log what we're sending
      console.log("Form data being sent:", {
        restaurantId: formData.restaurantId.trim(),
        restaurantName: formData.restaurantName.trim(),
        foodName: formData.foodName.trim(),
        category: formData.category,
        prices: formattedPrices,
        hasImage: !!imageFile,
      })

      // Use our API service to create the menu item
      const result = await createMenuItem(formDataToSend)
      console.log("API response:", result)

      // Store the API response for debugging
      setLastApiResponse(result)
      setDebugInfo({
        apiResponse: result,
        formData: {
          restaurantId: formData.restaurantId.trim(),
          restaurantName: formData.restaurantName.trim(),
          foodName: formData.foodName.trim(),
          category: formData.category,
          prices: formattedPrices,
          hasImage: !!imageFile,
        },
      })

      if (result.success) {
        // Successfully saved to database
        setSuccessMessage("Menu item created successfully and saved to database!")

        // Reset form after successful submission
        setFormData({
          restaurantId: SAMPLE_MANAGER_IDS[0],
          restaurantName: "",
          foodName: "",
          category: "",
          prices: {
            small: "",
            medium: "",
            large: "",
          },
        })
        setImageFile(null)
        setImagePreview(null)

        // Navigate after a short delay
        setTimeout(() => {
          navigate("/")
        }, 1500)
      } else if (result.offline) {
        // API was detected as offline, save locally
        await saveItemOffline()
        setSuccessMessage(
          "Network connection issue detected. Menu item saved locally and will be uploaded when connection is restored.",
        )

        // Reset form
        setFormData({
          restaurantId: SAMPLE_MANAGER_IDS[0],
          restaurantName: "",
          foodName: "",
          category: "",
          prices: {
            small: "",
            medium: "",
            large: "",
          },
        })
        setImageFile(null)
        setImagePreview(null)

        // Navigate after a short delay
        setTimeout(() => {
          navigate("/")
        }, 2000)
      } else {
        // API request failed but connection was available
        setError(
          `Failed to save to database: ${result.error || result.data?.message || "Unknown error"}. Saving locally instead.`,
        )

        // Save locally as fallback
        await saveItemOffline()
        setSuccessMessage(
          "Connection issue detected. Menu item saved locally and will be uploaded when connection is restored.",
        )

        // Reset form
        setFormData({
          restaurantId: SAMPLE_MANAGER_IDS[0],
          restaurantName: "",
          foodName: "",
          category: "",
          prices: {
            small: "",
            medium: "",
            large: "",
          },
        })
        setImageFile(null)
        setImagePreview(null)

        // Navigate after a short delay
        setTimeout(() => {
          navigate("/")
        }, 2000)
      }
    } catch (err) {
      console.error("Error in form submission:", err)
      setError(`There was a problem creating the menu item: ${err.message}`)

      // For debugging
      setDebugInfo({
        error: err.message,
        stack: err.stack,
      })

      // Try to save locally as a last resort
      try {
        await saveItemOffline()
        setSuccessMessage("Error occurred, but item was saved locally as a backup.")
      } catch (localErr) {
        console.error("Failed to save locally after error:", localErr)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className={`text-2xl font-bold mb-6 ${currentTheme.text}`}>Create New Menu Item</h1>

      {/* API Status Indicator */}
      <div
        className={`mb-4 p-3 rounded-lg border ${
          apiStatus.isChecking
            ? "bg-gray-50 border-gray-200"
            : apiStatus.isOnline
              ? "bg-green-50 border-green-200"
              : "bg-yellow-50 border-yellow-200"
        }`}
      >
        <div className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              apiStatus.isChecking ? "bg-gray-400" : apiStatus.isOnline ? "bg-green-500" : "bg-yellow-500"
            }`}
          ></div>
          <p className="text-sm">
            {apiStatus.isChecking
              ? "Checking database connection..."
              : apiStatus.isOnline
                ? "Connected to database"
                : "Database connection unavailable - changes will be saved locally"}
          </p>
        </div>
      </div>

      {/* Debug toggle */}
      <div className="mb-4 text-right">
        <button
          onClick={toggleDebugInfo}
          className="text-xs text-gray-400 hover:text-gray-600"
          aria-label="Toggle debug information"
        >
          {showDebugInfo ? "Hide Debug Info" : "Show Debug Info"}
        </button>
      </div>

      {/* Debug Information (only shown when toggled) */}
      {showDebugInfo && (
        <div className="mb-4 p-3 rounded-lg border border-gray-200 bg-gray-50">
          <h3 className="text-sm font-medium mb-2">Debug Information</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p>
                <strong>API Status:</strong>{" "}
                {apiStatus.isChecking ? "Checking..." : apiStatus.isOnline ? "Online" : "Offline"}
              </p>
              <p>
                <strong>Storage:</strong> {Math.round(storageStatus.used / 1024)} KB used of{" "}
                {Math.round(storageStatus.total / 1024)} KB
              </p>
              <p>
                <strong>Pending Items:</strong> {pendingUploads.length}
              </p>
            </div>
            <div>
              <p>
                <strong>API URL:</strong> {API_BASE_URL}/api/menu-items
              </p>
              <p>
                <strong>Mode:</strong> {apiStatus.isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-bold">Success</p>
          <p>{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Manager ID */}
          <div>
            <label htmlFor="restaurantId" className="block text-sm font-medium text-gray-700 mb-1">
              Manager ID <span className="text-red-500">*</span>
            </label>
            <select
              id="restaurantId"
              name="restaurantId"
              value={formData.restaurantId}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border ${fieldErrors.restaurantId ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select a Manager ID</option>
              {SAMPLE_MANAGER_IDS.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
            {fieldErrors.restaurantId && <p className="mt-1 text-sm text-red-600">{fieldErrors.restaurantId}</p>}
            <p className="mt-1 text-xs text-gray-500">
              In a real app, this would be automatically filled based on your login.
            </p>
          </div>

          {/* Restaurant Name */}
          <div>
            <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700 mb-1">
              Restaurant Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="restaurantName"
              name="restaurantName"
              value={formData.restaurantName}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border ${fieldErrors.restaurantName ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {fieldErrors.restaurantName && <p className="mt-1 text-sm text-red-600">{fieldErrors.restaurantName}</p>}
          </div>

          {/* Food Name */}
          <div>
            <label htmlFor="foodName" className="block text-sm font-medium text-gray-700 mb-1">
              Food Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="foodName"
              name="foodName"
              value={formData.foodName}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border ${fieldErrors.foodName ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {fieldErrors.foodName && <p className="mt-1 text-sm text-red-600">{fieldErrors.foodName}</p>}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className={`w-full px-3 py-2 border ${fieldErrors.category ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select a category</option>
              <option value="Chicken">Chicken</option>
              <option value="Cheese">Cheese</option>
              <option value="Veg">Vegetarian</option>
              <option value="Seafood">Seafood</option>
              <option value="Dessert">Dessert</option>
              <option value="Beverage">Beverage</option>
              <option value="Pizza">Pizza</option>
              <option value="Burger">Burger</option>
              <option value="Pasta">Pasta</option>
            </select>
            {fieldErrors.category && <p className="mt-1 text-sm text-red-600">{fieldErrors.category}</p>}
          </div>

          {/* Prices */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prices <span className="text-red-500">*</span>
              <span className="text-xs font-normal ml-1">(at least one required)</span>
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <label htmlFor="smallPrice" className="w-20">
                  Small:
                </label>
                <input
                  type="number"
                  id="smallPrice"
                  name="prices.small"
                  value={formData.prices.small}
                  onChange={handleChange}
                  step="0.01"
                  min="0.01"
                  max="1000"
                  placeholder="0.00"
                  className={`flex-1 px-3 py-2 border ${fieldErrors["prices.small"] ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {fieldErrors["prices.small"] && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors["prices.small"]}</p>
              )}

              <div className="flex items-center">
                <label htmlFor="mediumPrice" className="w-20">
                  Medium:
                </label>
                <input
                  type="number"
                  id="mediumPrice"
                  name="prices.medium"
                  value={formData.prices.medium}
                  onChange={handleChange}
                  step="0.01"
                  min="0.01"
                  max="1000"
                  placeholder="0.00"
                  className={`flex-1 px-3 py-2 border ${fieldErrors["prices.medium"] ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {fieldErrors["prices.medium"] && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors["prices.medium"]}</p>
              )}

              <div className="flex items-center">
                <label htmlFor="largePrice" className="w-20">
                  Large:
                </label>
                <input
                  type="number"
                  id="largePrice"
                  name="prices.large"
                  value={formData.prices.large}
                  onChange={handleChange}
                  step="0.01"
                  min="0.01"
                  max="1000"
                  placeholder="0.00"
                  className={`flex-1 px-3 py-2 border ${fieldErrors["prices.large"] ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {fieldErrors["prices.large"] && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors["prices.large"]}</p>
              )}
            </div>
            {fieldErrors.prices && <p className="mt-1 text-sm text-red-600">{fieldErrors.prices}</p>}
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Food Image
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/gif,image/webp"
              className={`w-full px-3 py-2 border ${fieldErrors.image ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {fieldErrors.image && <p className="mt-1 text-sm text-red-600">{fieldErrors.image}</p>}
            <p className="mt-1 text-xs text-gray-500">Accepted formats: JPEG, PNG, GIF, WEBP. Max size: 5MB</p>

            {imagePreview && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Image Preview:</p>
                <div className="relative w-32 h-32 border border-gray-300 rounded-md overflow-hidden">
                  <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${currentTheme.primary} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
          >
            {isSubmitting ? "Creating..." : "Create Menu Item"}
          </button>
        </div>
      </form>

      {/* Debug info - only visible when debug mode is enabled */}
      {showDebugInfo && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-sm font-bold mb-2">Detailed Debug Information:</h3>
          <div className="mb-4">
            <h4 className="text-xs font-semibold mb-1">API Status:</h4>
            <pre className="text-xs overflow-auto max-h-20 bg-white p-2 rounded border">
              {JSON.stringify(apiStatus, null, 2)}
            </pre>
          </div>

          {lastApiResponse && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold mb-1">Last API Response:</h4>
              <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded border">
                {JSON.stringify(lastApiResponse, null, 2)}
              </pre>
            </div>
          )}

          {debugInfo && (
            <div>
              <h4 className="text-xs font-semibold mb-1">Other Debug Info:</h4>
              <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded border">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CreateMenuItem
