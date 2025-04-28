// API service for handling all API requests
const API_BASE_URL = "http://localhost:5000"

// Helper function to check if the API is available
export const checkApiStatus = async () => {
  try {
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
    return { 
      isOnline: response.ok, 
      status: response.status,
      statusText: response.statusText
    }
  } catch (err) {
    console.error("API check failed:", err.message)
    return { 
      isOnline: false, 
      error: err.message,
      isNetworkError: err.name === 'AbortError' || err.message.includes('network')
    }
  }
}

// Create a new menu item
export const createMenuItem = async (formData) => {
  try {
    // First check if API is available
    const apiStatus = await checkApiStatus()
    if (!apiStatus.isOnline) {
      return {
        success: false,
        offline: true,
        message: "API is offline",
        apiStatus
      }
    }

    // API is available, proceed with request
    console.log("Sending request to:", `${API_BASE_URL}/api/menu-items`)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(`${API_BASE_URL}/api/menu-items`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Parse response
    let data
    try {
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        const text = await response.text()
        console.log("Raw response:", text)
        try {
          data = JSON.parse(text)
        } catch (e) {
          data = { message: text, parseError: true }
        }
      }
    } catch (parseError) {
      console.error("Error parsing response:", parseError)
      data = { parseError: true, message: "Failed to parse server response" }
    }

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data,
      headers: Object.fromEntries([...response.headers.entries()]),
    }
  } catch (err) {
    console.error("API request failed:", err)
    return {
      success: false,
      error: err.message,
      isNetworkError: err.name === 'AbortError' || err.message.includes('network')
    }
  }
}

// Get all menu items
export const getMenuItems = async () => {
  try {
    const cacheBuster = new Date().getTime()
    const response = await fetch(`${API_BASE_URL}/api/menu-items?_=${cacheBuster}`, {
      signal: AbortSignal.timeout(5000),
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`)
    }

    return await response.json()
  } catch (err) {
    console.error("Error fetching menu items:", err)
    throw err
  }
}

export default {
  checkApiStatus,
  createMenuItem,
  getMenuItems,
  API_BASE_URL
}
