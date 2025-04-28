"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"

// Sample manager IDs for demonstration
const SAMPLE_MANAGER_IDS = ["64f8a9b2e5c8d7f6a3b2c1d0", "64f8a9b2e5c8d7f6a3b2c1d1"]

// API base URL - ensure this matches your backend
const API_BASE_URL = "http://localhost:5000"

const EditMenuItem = () => {
  const { currentTheme } = useTheme()
  const navigate = useNavigate()
  const { id } = useParams()

  const [formData, setFormData] = useState({
    restaurantId: "",
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState("")
  const [isPendingItem, setIsPendingItem] = useState(false)
  const [apiStatus, setApiStatus] = useState({ isChecking: true, isOnline: false })
  const [debugInfo, setDebugInfo] = useState(null)

  // Check API status
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        setApiStatus({ isChecking: true, isOnline: false })

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(`${API_BASE_URL}/api/menu-items`, {
          method: "HEAD",
          signal: controller.signal,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })

        clearTimeout(timeoutId)
        setApiStatus({ isChecking: false, isOnline: response.ok })
      } catch (err) {
        console.warn("API check failed:", err.message)
        setApiStatus({ isChecking: false, isOnline: false })
      }
    }

    checkApiStatus()
  }, [])

  // Fetch menu item data
  useEffect(() => {
    const fetchMenuItem = async () => {
      try {
        setIsLoading(true)
        setError("")

        // Check if it's a pending item (starts with "temp_")
        if (id.startsWith("temp_")) {
          // Get from localStorage
          const pendingItems = JSON.parse(localStorage.getItem("pendingMenuItems") || "[]")
          const item = pendingItems.find((item) => item._id === id)

          if (!item) {
            throw new Error("Menu item not found")
          }

          // Set form data
          setFormData({
            restaurantId: item.restaurantId || "",
            restaurantName: item.restaurantName || "",
            foodName: item.foodName || "",
            category: item.category || "",
            prices: {
              small: item.prices?.small || "",
              medium: item.prices?.medium || "",
              large: item.prices?.large || "",
            },
          })

          // Set image preview if available
          if (item.imageUrl) {
            setImagePreview(item.imageUrl)
          }

          setIsPendingItem(true)
          setDebugInfo({ itemSource: "localStorage", itemId: id })
        } else {
          // Fetch from server
          if (!apiStatus.isOnline) {
            setError("Database connection unavailable. Cannot fetch menu item.")
            setIsLoading(false)
            return
          }

          try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

            const response = await fetch(`${API_BASE_URL}/api/menu-items/${id}`, {
              signal: controller.signal,
              headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
              },
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
              throw new Error(`Server responded with status: ${response.status}`)
            }

            // Handle different response types
            let item
            const contentType = response.headers.get("content-type")

            if (contentType && contentType.includes("application/json")) {
              item = await response.json()
            } else {
              const text = await response.text()
              try {
                item = JSON.parse(text)
              } catch (e) {
                throw new Error(`Invalid response format: ${text.substring(0, 100)}...`)
              }
            }

            // Set form data
            setFormData({
              restaurantId: item.restaurantId || "",
              restaurantName: item.restaurantName || "",
              foodName: item.foodName || "",
              category: item.category || "",
              prices: {
                small: item.prices?.small || "",
                medium: item.prices?.medium || "",
                large: item.prices?.large || "",
              },
            })

            // Set image preview if available
            if (item.imageUrl) {
              setImagePreview(
                item.imageUrl.startsWith("http")
                  ? item.imageUrl
                  : `${API_BASE_URL}/${item.imageUrl.replace(/^\//, "")}`,
              )
            }

            setIsPendingItem(false)
            setDebugInfo({ itemSource: "server", itemId: id, item })
          } catch (err) {
            console.error("Error fetching from server:", err)

            // Try to find the item in localStorage as a fallback
            const pendingItems = JSON.parse(localStorage.getItem("pendingMenuItems") || "[]")
            const localItem = pendingItems.find((item) => item._id === id)

            if (localItem) {
              // Set form data from localStorage
              setFormData({
                restaurantId: localItem.restaurantId || "",
                restaurantName: localItem.restaurantName || "",
                foodName: localItem.foodName || "",
                category: localItem.category || "",
                prices: {
                  small: localItem.prices?.small || "",
                  medium: localItem.prices?.medium || "",
                  large: localItem.prices?.large || "",
                },
              })

              // Set image preview if available
              if (localItem.imageUrl) {
                setImagePreview(localItem.imageUrl)
              }

              setIsPendingItem(true)
              setDebugInfo({
                itemSource: "localStorage-fallback",
                itemId: id,
                serverError: err.message,
              })
            } else {
              throw new Error(`Failed to load menu item: ${err.message}`)
            }
          }
        }
      } catch (err) {
        console.error("Error fetching menu item:", err)
        setError(`Failed to load menu item: ${err.message}`)
        setDebugInfo({ error: err.message, stack: err.stack })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenuItem()
  }, [id, apiStatus.isOnline])

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

  const handleImageChange = (e) => {
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
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Reset messages
    setError("")
    setSuccessMessage("")
    setDebugInfo(null)

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

      // Check if it's a pending item
      if (isPendingItem) {
        // Update in localStorage
        const pendingItems = JSON.parse(localStorage.getItem("pendingMenuItems") || "[]")
        const updatedItems = pendingItems.map((item) => {
          if (item._id === id) {
            return {
              ...item,
              restaurantId: formData.restaurantId.trim(),
              restaurantName: formData.restaurantName.trim(),
              foodName: formData.foodName.trim(),
              category: formData.category,
              prices: formattedPrices,
              imageUrl: imagePreview || item.imageUrl,
              updatedAt: new Date().toISOString(),
            }
          }
          return item
        })

        localStorage.setItem("pendingMenuItems", JSON.stringify(updatedItems))
        setSuccessMessage("Menu item updated successfully in local storage!")
        setDebugInfo({ action: "update", target: "localStorage", itemId: id })

        // Navigate after a short delay
        setTimeout(() => {
          navigate("/admin-dashboard")
        }, 1500)
      } else {
        // Check if API is online
        if (!apiStatus.isOnline) {
          // Save to localStorage instead
          const pendingItems = JSON.parse(localStorage.getItem("pendingMenuItems") || "[]")

          // Create a new item with a temporary ID
          const newItem = {
            _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            restaurantId: formData.restaurantId.trim(),
            restaurantName: formData.restaurantName.trim(),
            foodName: formData.foodName.trim(),
            category: formData.category,
            prices: formattedPrices,
            imageUrl: imagePreview,
            createdAt: new Date().toISOString(),
            isPending: true,
            originalId: id, // Store the original ID for reference
          }

          pendingItems.push(newItem)
          localStorage.setItem("pendingMenuItems", JSON.stringify(pendingItems))

          setSuccessMessage(
            "Database connection unavailable. Changes saved locally and will be uploaded when connection is restored.",
          )
          setDebugInfo({ action: "update", target: "localStorage-fallback", originalId: id, newTempId: newItem._id })

          // Navigate after a short delay
          setTimeout(() => {
            navigate("/admin-dashboard")
          }, 2000)

          return
        }

        // Update on server
        const formDataToSend = new FormData()
        formDataToSend.append("restaurantId", formData.restaurantId.trim())
        formDataToSend.append("restaurantName", formData.restaurantName.trim())
        formDataToSend.append("foodName", formData.foodName.trim())
        formDataToSend.append("category", formData.category)
        formDataToSend.append("prices", JSON.stringify(formattedPrices))

        if (imageFile) {
          formDataToSend.append("image", imageFile)
        }

        try {
          console.log("Updating item on server:", id)

          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

          const response = await fetch(`${API_BASE_URL}/api/menu-items/${id}`, {
            method: "PUT",
            body: formDataToSend,
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          // Handle different response types
          let data
          const contentType = response.headers.get("content-type")

          if (contentType && contentType.includes("application/json")) {
            data = await response.json()
          } else {
            const text = await response.text()
            try {
              data = JSON.parse(text)
            } catch (e) {
              data = { message: text, parseError: true }
            }
          }

          setDebugInfo({
            action: "update",
            target: "server",
            status: response.status,
            statusText: response.statusText,
            data: data,
            contentType,
          })

          if (!response.ok) {
            throw new Error(data.error || data.message || `Failed to update menu item: ${response.status}`)
          }

          setSuccessMessage("Menu item updated successfully in database!")

          // Navigate after a short delay
          setTimeout(() => {
            navigate("/admin-dashboard")
          }, 1500)
        } catch (err) {
          console.error("Error updating on server:", err)

          // If server update fails, save to localStorage
          const pendingItems = JSON.parse(localStorage.getItem("pendingMenuItems") || "[]")

          // Create a new item with a temporary ID
          const newItem = {
            _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            restaurantId: formData.restaurantId.trim(),
            restaurantName: formData.restaurantName.trim(),
            foodName: formData.foodName.trim(),
            category: formData.category,
            prices: formattedPrices,
            imageUrl: imagePreview,
            createdAt: new Date().toISOString(),
            isPending: true,
            originalId: id, // Store the original ID for reference
          }

          pendingItems.push(newItem)
          localStorage.setItem("pendingMenuItems", JSON.stringify(pendingItems))

          setError(
            `Server error: ${err.message}. Changes saved locally and will be uploaded when connection is restored.`,
          )
          setDebugInfo({
            action: "update",
            target: "localStorage-fallback-after-error",
            originalId: id,
            newTempId: newItem._id,
            error: err.message,
            stack: err.stack,
          })

          // Don't navigate automatically on error
        }
      }
    } catch (err) {
      console.error("Error updating menu item:", err)
      setError(`There was a problem updating the menu item: ${err.message}`)
      setDebugInfo({ error: err.message, stack: err.stack })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className={`text-2xl font-bold mb-6 ${currentTheme.text}`}>Edit Menu Item</h1>

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

      {/* Item Source Indicator */}
      <div
        className={`mb-4 p-3 rounded-lg border ${isPendingItem ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200"}`}
      >
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${isPendingItem ? "bg-blue-500" : "bg-green-500"}`}></div>
          <p className="text-sm">
            {isPendingItem
              ? "Editing locally saved item - changes will be saved to local storage"
              : "Editing database item - changes will be saved to database if connection is available"}
          </p>
        </div>
      </div>

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
            onClick={() => navigate("/admin-dashboard")}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${currentTheme.primary} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
          >
            {isSubmitting ? "Updating..." : "Update Menu Item"}
          </button>
        </div>
      </form>

      {/* Debug info - only visible during development */}
      {process.env.NODE_ENV === "development" && debugInfo && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-sm font-bold mb-2">Debug Information:</h3>
          <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default EditMenuItem
