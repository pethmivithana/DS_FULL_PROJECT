"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"
import SearchBar from "../components/SearchBar"
import RestaurantCard from "../components/RestaurantCard"
import CategoryFilter from "../components/CategoryFilter"
import { checkApiStatus, getMenuItems } from "../services/api"

// API base URL - ensure this matches your backend
const API_BASE_URL = "http://localhost:5000"

// Mock data for when the API is unavailable
const MOCK_MENU_ITEMS = [
  {
    _id: "mock1",
    foodName: "Margherita Pizza",
    restaurantName: "Pizza Palace",
    category: "Pizza",
    imageUrl: "",
    prices: { small: 9.99, medium: 12.99, large: 15.99 },
  },
  {
    _id: "mock2",
    foodName: "Chicken Burger",
    restaurantName: "Burger Joint",
    category: "Burger",
    imageUrl: "",
    prices: { small: 7.99, medium: 10.99, large: 13.99 },
  },
  {
    _id: "mock3",
    foodName: "Vegetable Pasta",
    restaurantName: "Italian Bistro",
    category: "Pasta",
    imageUrl: "",
    prices: { small: 8.99, medium: 11.99, large: 14.99 },
  },
]

const HomePage = () => {
  const { currentTheme } = useTheme()
  const [menuItems, setMenuItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [usingMockData, setUsingMockData] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [apiStatus, setApiStatus] = useState({ isChecking: true, isOnline: false })

  // Function to refresh the menu items
  const refreshMenuItems = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  // Check API status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkApiStatus()
        setApiStatus({
          isChecking: false,
          isOnline: status.isOnline,
          details: status,
        })

        console.log(`API status check: ${status.isOnline ? "ONLINE" : "OFFLINE"}`, status)
      } catch (err) {
        console.warn("API check failed:", err.message)
        setApiStatus({ isChecking: false, isOnline: false, error: err.message })
      }
    }

    checkStatus()
  }, [refreshTrigger])

  // Fetch menu items from backend
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true)

        // Check if API is available
        const status = await checkApiStatus()

        if (!status.isOnline) {
          throw new Error(`API is offline: ${status.error || status.status}`)
        }

        // API is available, fetch menu items
        const data = await getMenuItems()

        // Combine local pending items with server data
        const pendingItems = JSON.parse(localStorage.getItem("pendingMenuItems") || "[]")

        // Merge server data with pending items
        const combinedItems = [...data, ...pendingItems]

        setMenuItems(combinedItems)
        setFilteredItems(combinedItems)
        setUsingMockData(false)
      } catch (err) {
        console.error("Error fetching menu items:", err)

        // Get any pending items from localStorage
        const pendingItems = JSON.parse(localStorage.getItem("pendingMenuItems") || "[]")

        // If we have pending items, use those + mock data
        if (pendingItems.length > 0) {
          const combinedItems = [...MOCK_MENU_ITEMS, ...pendingItems]
          setMenuItems(combinedItems)
          setFilteredItems(combinedItems)
        } else {
          // Otherwise just use mock data
          setMenuItems(MOCK_MENU_ITEMS)
          setFilteredItems(MOCK_MENU_ITEMS)
        }

        setUsingMockData(true)
      } finally {
        setLoading(false)
      }
    }

    fetchMenuItems()
  }, [refreshTrigger]) // Re-fetch when refreshTrigger changes

  // Extract unique categories from menu items
  const categories = ["all", ...new Set(menuItems.map((item) => item.category))]

  // Filter items when category or search query changes
  useEffect(() => {
    const applyFilters = () => {
      const lowercaseQuery = searchQuery.toLowerCase()

      return menuItems.filter((item) => {
        // Category filter
        const matchesCategory = selectedCategory === "all" || item.category === selectedCategory

        // Search filter
        const matchesSearch =
          !searchQuery ||
          item.foodName.toLowerCase().includes(lowercaseQuery) ||
          item.restaurantName.toLowerCase().includes(lowercaseQuery) ||
          item.category.toLowerCase().includes(lowercaseQuery)

        return matchesCategory && matchesSearch
      })
    }

    setFilteredItems(applyFilters())
  }, [selectedCategory, searchQuery, menuItems])

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`${currentTheme.primary} text-white`}>
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Delicious Food Delivered</h1>
              <p className="text-lg opacity-90 mb-6">Find your favorite meals from local restaurants</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={refreshMenuItems}
                className="bg-white/20 text-white hover:bg-white/30 px-4 py-2 rounded-md font-medium transition-colors self-start md:self-center mr-2"
                aria-label="Refresh menu items"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
             
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>

      {/* API Status Indicator */}
   

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-8">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            {selectedCategory === "all" ? "All Menu Items" : `${selectedCategory} Items`}
          </h2>
          <p className="text-gray-500 text-sm">
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} found
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading delicious options...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <RestaurantCard key={item._id} item={item} usingMockData={usingMockData} />
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-8 text-center">
            <p className="text-lg text-yellow-700 mb-2">No menu items found</p>
            <p className="text-gray-600">
              {searchQuery ? "Try a different search term or" : "Try"} selecting a different category
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
