"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"

// API base URL - ensure this matches your backend
const API_BASE_URL = "http://localhost:5000"

const AdminDashboard = () => {
  const { currentTheme } = useTheme()
  const navigate = useNavigate()
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortField, setSortField] = useState("foodName")
  const [sortDirection, setSortDirection] = useState("asc")
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [apiStatus, setApiStatus] = useState({ isOnline: false, message: "Checking connection..." })

  // Fetch menu items from backend
  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      setError("")

      // Add a cache-busting parameter to prevent browser caching
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

      const data = await response.json()
      setApiStatus({ isOnline: true, message: "Connected to database" })

      // Include pending items from localStorage
      const pendingItems = JSON.parse(localStorage.getItem("pendingMenuItems") || "[]")
      const combinedItems = [...data, ...pendingItems]

      setMenuItems(combinedItems)
    } catch (err) {
      console.error("Error fetching menu items:", err)
      setError("Failed to load menu items from database. Showing locally saved items.")
      setApiStatus({ isOnline: false, message: "Database connection unavailable" })

      // Get any pending items from localStorage
      const pendingItems = JSON.parse(localStorage.getItem("pendingMenuItems") || "[]")
      setMenuItems(pendingItems)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenuItems()
  }, [])

  // Handle delete confirmation
  const confirmDelete = (itemId) => {
    setDeleteConfirm(itemId)
  }

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirm(null)
  }

  // Handle delete
  const handleDelete = async (itemId) => {
    try {
      setLoading(true)

      // Check if it's a pending item (starts with "temp_")
      if (itemId.startsWith("temp_")) {
        // Remove from localStorage
        const pendingItems = JSON.parse(localStorage.getItem("pendingMenuItems") || "[]")
        const updatedItems = pendingItems.filter((item) => item._id !== itemId)
        localStorage.setItem("pendingMenuItems", JSON.stringify(updatedItems))

        // Update state
        setMenuItems((prev) => prev.filter((item) => item._id !== itemId))
        setSuccessMessage("Menu item deleted successfully")
      } else {
        // Delete from server
        const response = await fetch(`${API_BASE_URL}/api/menu-items/${itemId}`, {
          method: "DELETE",
          signal: AbortSignal.timeout(5000),
        })

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`)
        }

        // Update state
        setMenuItems((prev) => prev.filter((item) => item._id !== itemId))
        setSuccessMessage("Menu item deleted successfully")
      }
    } catch (err) {
      console.error("Error deleting menu item:", err)

      // If it's a network error, try to delete from localStorage as fallback
      if (err.message.includes("Failed to fetch") || err.message.includes("Network Error")) {
        try {
          // Add to pending deletions in localStorage
          const pendingDeletions = JSON.parse(localStorage.getItem("pendingDeletions") || "[]")
          pendingDeletions.push(itemId)
          localStorage.setItem("pendingDeletions", JSON.stringify(pendingDeletions))

          // Update UI
          setMenuItems((prev) => prev.filter((item) => item._id !== itemId))
          setSuccessMessage("Network unavailable. Item marked for deletion when connection is restored.")
        } catch (localErr) {
          setError("Failed to mark item for deletion locally.")
        }
      } else {
        setError("Failed to delete menu item. Please try again.")
      }
    } finally {
      setLoading(false)
      setDeleteConfirm(null)
    }
  }

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  // Handle category filter
  const handleCategoryFilter = (e) => {
    setSelectedCategory(e.target.value)
  }

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // New field, default to ascending
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Get sorted and filtered items
  const getFilteredItems = () => {
    return menuItems
      .filter((item) => {
        // Category filter
        const categoryMatch = selectedCategory === "all" || item.category === selectedCategory

        // Search filter
        const searchMatch =
          searchQuery === "" ||
          item.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.restaurantName.toLowerCase().includes(searchQuery.toLowerCase())

        return categoryMatch && searchMatch
      })
      .sort((a, b) => {
        // Handle sorting
        let valueA, valueB

        // Get values based on sort field
        if (sortField === "price") {
          // For price, use the lowest price
          const getLowestPrice = (prices) => {
            if (!prices) return 0
            const validPrices = Object.values(prices).filter((p) => p && !isNaN(p))
            return validPrices.length > 0 ? Math.min(...validPrices) : 0
          }
          valueA = getLowestPrice(a.prices)
          valueB = getLowestPrice(b.prices)
        } else {
          // For other fields
          valueA = a[sortField] || ""
          valueB = b[sortField] || ""
        }

        // Compare values
        if (typeof valueA === "string") {
          valueA = valueA.toLowerCase()
          valueB = valueB.toLowerCase()
        }

        // Sort direction
        if (sortDirection === "asc") {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0
        } else {
          return valueA < valueB ? 1 : valueA > valueB ? -1 : 0
        }
      })
  }

  // Get unique categories
  const categories = ["all", ...new Set(menuItems.map((item) => item.category))]

  // Format price for display
  const formatPrice = (prices) => {
    if (!prices) return "N/A"

    const priceValues = []
    if (prices.small) priceValues.push(`S: $${Number(prices.small).toFixed(2)}`)
    if (prices.medium) priceValues.push(`M: $${Number(prices.medium).toFixed(2)}`)
    if (prices.large) priceValues.push(`L: $${Number(prices.large).toFixed(2)}`)

    return priceValues.join(", ") || "N/A"
  }

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("")
      }, 3001)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className={`${currentTheme.primary} text-white`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-sm md:text-base opacity-90 mt-1">Manage your menu items</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <button
                onClick={fetchMenuItems}
                className="bg-white/20 text-white hover:bg-white/30 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                Refresh
              </button>
              <Link
                to="/create-menu-item"
                className="bg-white text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                Add New Item
              </Link>
              <Link
                to="/"
                className="bg-white/10 text-white hover:bg-white/20 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* API Status Indicator */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div
          className={`p-3 rounded-lg border ${
            apiStatus.isOnline ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
          }`}
        >
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${apiStatus.isOnline ? "bg-green-500" : "bg-yellow-500"}`}></div>
            <p className="text-sm">
              {apiStatus.isOnline
                ? "Connected to database - showing live data"
                : "Database connection unavailable - showing locally saved items"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search by name or restaurant..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={handleCategoryFilter}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <div className="flex space-x-2">
                <select
                  id="sort"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="foodName">Food Name</option>
                  <option value="restaurantName">Restaurant</option>
                  <option value="category">Category</option>
                  <option value="price">Price</option>
                </select>
                <button
                  onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title={sortDirection === "asc" ? "Ascending" : "Descending"}
                >
                  {sortDirection === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
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

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : getFilteredItems().length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">No menu items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("foodName")}
                    >
                      <div className="flex items-center">
                        Food Name
                        {sortField === "foodName" && (
                          <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("restaurantName")}
                    >
                      <div className="flex items-center">
                        Restaurant
                        {sortField === "restaurantName" && (
                          <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("category")}
                    >
                      <div className="flex items-center">
                        Category
                        {sortField === "category" && (
                          <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("price")}
                    >
                      <div className="flex items-center">
                        Prices
                        {sortField === "price" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Image
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredItems().map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.foodName}</div>
                        {item.isPending && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{item.restaurantName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatPrice(item.prices)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.imageUrl ? (
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                            <img
                              src={
                                item.imageUrl.startsWith("data:")
                                  ? item.imageUrl
                                  : item.imageUrl.startsWith("http")
                                    ? item.imageUrl
                                    : `${API_BASE_URL}/${item.imageUrl.replace(/^\//, "")}`
                              }
                              alt={item.foodName}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = `https://via.placeholder.com/40x40/f3f4f6/94a3b8?text=${encodeURIComponent(
                                  item.foodName.charAt(0),
                                )}`
                              }}
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">{item.foodName.charAt(0)}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {deleteConfirm === item._id ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={cancelDelete}
                              className="text-gray-700 bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-2">
                            <Link
                              to={`/edit-menu-item/${item._id}`}
                              className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => confirmDelete(item._id)}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Item Count */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {getFilteredItems().length} of {menuItems.length} items
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
