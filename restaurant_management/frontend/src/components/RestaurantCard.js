"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"

// API base URL - ensure this matches your backend
const API_BASE_URL = "http://localhost:5000"

const RestaurantCard = ({ item, usingMockData = false }) => {
  const { currentTheme } = useTheme()
  const [imageError, setImageError] = useState(false)

  // Format price with currency
  const formatPrice = (price) => {
    return price ? `$${Number.parseFloat(price).toFixed(2)}` : "N/A"
  }

  // Get the lowest price for the badge
  const getLowestPrice = () => {
    const prices = []
    if (item.prices?.small) prices.push(item.prices.small)
    if (item.prices?.medium) prices.push(item.prices.medium)
    if (item.prices?.large) prices.push(item.prices.large)

    return prices.length > 0 ? Math.min(...prices) : null
  }

  const lowestPrice = getLowestPrice()

  // Determine image URL based on whether we're using mock data or if it's a pending item
  const getImageUrl = () => {
    // If it's a pending item with a data URL
    if (item.isPending && item.imageUrl && item.imageUrl.startsWith("data:")) {
      return item.imageUrl
    }

    // If using mock data or no image URL
    if (usingMockData || !item.imageUrl) {
      // Return a placeholder image for mock data
      return `https://via.placeholder.com/300x200/f3f4f6/94a3b8?text=${encodeURIComponent(item.foodName)}`
    }

    // For real data, check if the URL is already absolute
    if (item.imageUrl.startsWith("http")) {
      return item.imageUrl
    }

    // Otherwise, prepend the server URL
    return `${API_BASE_URL}/${item.imageUrl.replace(/^\//, "")}`
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col h-full border border-gray-100">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {!imageError ? (
          <img
            src={getImageUrl() || "/placeholder.svg"}
            alt={item.foodName}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">No image available</span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
            {item.category}
          </span>
        </div>

        {/* Price Badge */}
        {lowestPrice && (
          <div className="absolute bottom-3 left-3">
            <span className={`${currentTheme.primary} text-white text-sm font-bold px-3 py-1 rounded-lg shadow-sm`}>
              From {formatPrice(lowestPrice)}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-grow flex flex-col">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{item.foodName}</h3>
          <p className="text-gray-500 text-sm mb-2">{item.restaurantName}</p>
        </div>

        {/* Prices Section */}
        <div className="space-y-1.5 mb-4 flex-grow">
          {item.prices?.small || item.prices?.medium || item.prices?.large ? (
            <>
              {item.prices?.small && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Small</span>
                  <span className="font-medium">{formatPrice(item.prices.small)}</span>
                </div>
              )}
              {item.prices?.medium && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Medium</span>
                  <span className="font-medium">{formatPrice(item.prices.medium)}</span>
                </div>
              )}
              {item.prices?.large && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Large</span>
                  <span className="font-medium">{formatPrice(item.prices.large)}</span>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 italic">Pricing not available</p>
          )}
        </div>

        {/* Actions Section */}
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
         
          <button
            className={`${currentTheme.primary} hover:bg-opacity-90 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors`}
            aria-label={`Add ${item.foodName} to cart`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default RestaurantCard
