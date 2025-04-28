"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"

// API base URL - ensure this matches your backend
const API_BASE_URL = "http://localhost:5000"

// Maximum image dimensions for localStorage
const MAX_IMAGE_WIDTH = 800
const MAX_IMAGE_HEIGHT = 600
const IMAGE_QUALITY = 0.7

const PendingUploads = () => {
  const { currentTheme } = useTheme()
  const navigate = useNavigate()
  const [pendingItems, setPendingItems] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState({ success: 0, failed: 0 })
  const [isOnline, setIsOnline] = useState(true)
  const [debugInfo, setDebugInfo] = useState(null)
  const [apiStatus, setApiStatus] = useState({ isChecking: true, isOnline: false })
  const [storageStatus, setStorageStatus] = useState({ available: true, used: 0, total: 0 })
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Load pending uploads from localStorage on component mount
  useEffect(() => {
    try {
      const storedUploads = localStorage.getItem("pendingMenuItems")
      if (storedUploads) {
        setPendingItems(JSON.parse(storedUploads))
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

  // Silently check if the API is online
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
        setIsOnline(response.ok)
      } catch (err) {
        console.log("API check failed:", err.message)
        setApiStatus({ isChecking: false, isOnline: false })
        setIsOnline(false)
      }
    }

    checkApiStatus()
  }, [])

  // Save pending items to localStorage whenever they change
  useEffect(() => {
    if (pendingItems.length > 0) {
      try {
        const pendingItemsJson = JSON.stringify(pendingItems)
        localStorage.setItem("pendingMenuItems", pendingItemsJson)
        checkStorageUsage()
      } catch (err) {
        console.error("Error saving to localStorage:", err)
        setError("Error saving to local storage. Some items may not be saved properly.")
      }
    } else {
      localStorage.removeItem("pendingMenuItems")
      // Navigate back to home if no pending items
      navigate("/")
    }
  }, [pendingItems, navigate])

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

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Delete a pending item
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this saved item?")) {
      setPendingItems((prev) => prev.filter((item) => item._id !== id))
      setSuccessMessage("Item deleted successfully")

      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3001)
    }
  }

  // Clean up storage by removing images from items
  const cleanupStorage = () => {
    if (window.confirm("This will remove images from all saved items to free up storage space. Continue?")) {
      const itemsWithoutImages = pendingItems.map((item) => ({
        ...item,
        imageUrl: null,
      }))

      try {
        setPendingItems(itemsWithoutImages)
        setSuccessMessage("Images removed from saved items to free up storage")

        // Clear message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3001)
      } catch (err) {
        console.error("Error cleaning up storage:", err)
        setError("Failed to clean up storage")

        // Clear message after 3 seconds
        setTimeout(() => setError(""), 3001)
      }
    }
  }

  // Upload a single item
  const uploadItem = async (item) => {
    try {
      // Create FormData from the stored item
      const formData = new FormData()
      formData.append("restaurantId", item.restaurantId)
      formData.append("restaurantName", item.restaurantName)
      formData.append("foodName", item.foodName)
      formData.append("category", item.category)
      formData.append("prices", JSON.stringify(item.prices))

      // Handle image if it exists
      if (item.imageUrl) {
        try {
          // Convert data URL to Blob
          const response = await fetch(item.imageUrl)
          const blob = await response.blob()
          formData.append("image", blob, "image.jpg")
        } catch (imgErr) {
          console.error("Error processing image:", imgErr)
          // Continue without the image
        }
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(`${API_BASE_URL}/api/menu-items`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // For debugging
      let data
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        const responseText = await response.text()
        try {
          data = JSON.parse(responseText)
        } catch (e) {
          data = { error: "Invalid JSON response", raw: responseText }
        }
      }

      setDebugInfo({
        status: response.status,
        statusText: response.statusText,
        data: data,
      })

      if (!response.ok) {
        throw new Error("Failed to upload item")
      }

      return { success: true, id: item._id }
    } catch (error) {
      console.error("Error uploading item:", error)
      setDebugInfo({
        error: error.message,
        stack: error.stack,
      })
      return { success: false, id: item._id, error: error.message }
    }
  }

  // Upload all pending items
  const uploadAllItems = async () => {
    setIsUploading(true)
    setUploadStatus({ success: 0, failed: 0 })
    setError("")
    setSuccessMessage("")

    const results = []
    for (const item of pendingItems) {
      const result = await uploadItem(item)
      results.push(result)

      // Update status as we go
      setUploadStatus((prev) => ({
        success: prev.success + (result.success ? 1 : 0),
        failed: prev.failed + (result.success ? 0 : 1),
      }))
    }

    // Remove successfully uploaded items
    const successfulIds = results.filter((r) => r.success).map((r) => r.id)
    setPendingItems((prev) => prev.filter((item) => !successfulIds.includes(item._id)))

    setIsUploading(false)

    if (results.every((r) => r.success)) {
      setSuccessMessage("All items uploaded successfully!")
    } else if (results.some((r) => r.success)) {
      setSuccessMessage(
        `${results.filter((r) => r.success).length} items uploaded successfully. ${results.filter((r) => !r.success).length} failed.`,
      )
    } else {
      setError("Failed to upload any items. Please try again later.")
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${currentTheme.text}`}>Saved Menu Items</h1>
        <div className="flex space-x-2">
          <Link to="/" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md text-sm">
            Back to Home
          </Link>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
          <p>{successMessage}</p>
        </div>
      )}

      {/* Upload Status */}
      {(uploadStatus.success > 0 || uploadStatus.failed > 0) && (
        <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-bold">Upload Status</p>
          <p>
            Successfully uploaded: {uploadStatus.success} | Failed: {uploadStatus.failed}
          </p>
        </div>
      )}

      {pendingItems.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-lg text-gray-600 mb-2">No saved items</p>
          <p className="text-gray-500">All your menu items have been uploaded.</p>
          <Link
            to="/create-menu-item"
            className={`mt-4 inline-block px-4 py-2 ${currentTheme.primary} text-white rounded-md hover:opacity-90`}
          >
            Create New Menu Item
          </Link>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              {pendingItems.length} saved item{pendingItems.length !== 1 && "s"}
            </p>
            <button
              onClick={uploadAllItems}
              disabled={isUploading || !apiStatus.isOnline}
              className={`px-4 py-2 ${currentTheme.primary} text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isUploading ? "Uploading..." : "Upload All"}
            </button>
          </div>

          <div className="grid gap-4">
            {pendingItems.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center">
                  {/* Image */}
                  <div className="w-full md:w-24 h-24 mb-4 md:mb-0 md:mr-4">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.foodName}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-md">
                        <span className="text-gray-500 text-xs">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{item.foodName}</h3>
                    <p className="text-gray-600">{item.restaurantName}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">{item.category}</span>
                      {Object.entries(item.prices).map(
                        ([size, price]) =>
                          price && (
                            <span key={size} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                              {size}: ${Number(price).toFixed(2)}
                            </span>
                          ),
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Created: {formatDate(item.createdAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 md:mt-0 md:ml-4 flex flex-col md:items-end gap-2">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        setIsUploading(true)
                        uploadItem(item).then((result) => {
                          if (result.success) {
                            setPendingItems((prev) => prev.filter((i) => i._id !== item._id))
                            setUploadStatus((prev) => ({
                              ...prev,
                              success: prev.success + 1,
                            }))
                            setSuccessMessage("Item uploaded successfully")
                          } else {
                            setUploadStatus((prev) => ({
                              ...prev,
                              failed: prev.failed + 1,
                            }))
                            setError(`Failed to upload: ${result.error || "Unknown error"}`)
                          }
                          setIsUploading(false)
                        })
                      }}
                      disabled={isUploading || !apiStatus.isOnline}
                      className={`px-3 py-1.5 ${currentTheme.primary} text-white rounded text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Upload
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

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

export default PendingUploads
