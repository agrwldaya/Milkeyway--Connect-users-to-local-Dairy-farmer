"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Users, MessageCircle, Filter, Loader2, AlertCircle, Activity, TrendingUp, Milk, Map, X, SlidersHorizontal } from "lucide-react"
import { ConsumerNav } from "@/components/consumer-nav"
import { api } from "@/lib/utils"
import ConsumerMapPicker from "@/components/ConsumerMapPicker"

export default function ConsumerDashboard() {
  const [location, setLocation] = useState(null)
  const [nearbyFarmers, setNearbyFarmers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [locationPermission, setLocationPermission] = useState(null)
  const [consumerConnectionData, setConsumerConnectionData] = useState(null)
  const [categories, setCategories] = useState([])
  const [showMapView, setShowMapView] = useState(false)
  const [selectedFarmer, setSelectedFarmer] = useState(null)
  const [showFilters, setShowFilters] = useState(() => {
    // Load filter panel state from localStorage
    if (typeof window !== 'undefined') {
      const savedShowFilters = localStorage.getItem('showFarmerFilters')
      return savedShowFilters === 'true'
    }
    return false
  })
  const [filters, setFilters] = useState(() => {
    // Load filters from localStorage on initialization
    if (typeof window !== 'undefined') {
      const savedFilters = localStorage.getItem('farmerFilters')
      if (savedFilters) {
        try {
          return JSON.parse(savedFilters)
        } catch (error) {
          console.error('Error parsing saved filters:', error)
        }
      }
    }
    // Default filters
    return {
      maxDistance: 50, // km
      minRating: 0, // 0-5 stars
      maxRating: 5
    }
  })
  const [filteredFarmers, setFilteredFarmers] = useState([])
  console.log(filteredFarmers)
  //console.log(consumerConnectionData)

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/v1/consumers/categories')
        const data = response.data
        if (data.success) {
          setCategories(data.categories)
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
      }
    }
    fetchCategories()
  }, [])

  // Handle farmer selection from map
  const handleFarmerSelect = (farmer) => {
    setSelectedFarmer(farmer)
    // Navigate to farmer details page
    window.location.href = `/consumer/farmer/${farmer.id}`
  }

  // Handle location change from map
  const handleLocationChange = (newLocation) => {
    setLocation(newLocation)
    fetchNearbyFarmers(newLocation.latitude, newLocation.longitude)
  }

  // Handle category change from map
  const handleCategoryChange = async (categoryId) => {
    if (location) {
      try {
        setLoading(true)
        const response = await api.get(`/api/v1/consumers/farmers-by-category?categoryId=${categoryId}&latitude=${location.latitude}&longitude=${location.longitude}&radius=10`)
        const data = response.data
        if (data.success) {
          setNearbyFarmers(data.farmers)
        }
      } catch (err) {
        console.error("Error fetching farmers by category:", err)
      } finally {
        setLoading(false)
      }
    }
  }

  // Save filters to localStorage
  const saveFiltersToStorage = (newFilters) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('farmerFilters', JSON.stringify(newFilters))
      } catch (error) {
        console.error('Error saving filters to localStorage:', error)
      }
    }
  }

  // Save filter panel state to localStorage
  const saveFilterPanelState = (isOpen) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('showFarmerFilters', isOpen.toString())
      } catch (error) {
        console.error('Error saving filter panel state:', error)
      }
    }
  }

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...filters,
      [filterType]: value
    }
    setFilters(newFilters)
    saveFiltersToStorage(newFilters)
  }

  // Clear all filters
  const clearFilters = () => {
    const defaultFilters = {
      maxDistance: 50,
      minRating: 0,
      maxRating: 5
    }
    setFilters(defaultFilters)
    saveFiltersToStorage(defaultFilters)
  }

  // Reset filters to default
  const resetFilters = () => {
    const defaultFilters = {
      maxDistance: 50,
      minRating: 0,
      maxRating: 5
    }
    setFilters(defaultFilters)
    saveFiltersToStorage(defaultFilters)
  }

  // Request user location
  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.")
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      
      async (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ latitude, longitude })
        setLocationPermission("granted")
        
        // Fetch nearby farmers
        await fetchNearbyFarmers(latitude, longitude)
        setLoading(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        setError("Unable to get your location. Please enable location access or enter your location manually.")
        setLocationPermission("denied")
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  // Fetch nearby farmers from API
  const fetchNearbyFarmers = async (lat, lng, radius = 10) => {
    try {
      const response = await fetch(`/api/v1/consumers/nearby-farmers?latitude=${lat}&longitude=${lng}&radius=${radius}`)
      const data = await response.json()
      
      if (data.success) {
        setNearbyFarmers(data.farmers)
      } else {
        setError(data.message || "Failed to fetch nearby farmers")
      }
    } catch (err) {
      console.error("Error fetching nearby farmers:", err)
      setError("Failed to fetch nearby farmers")
    }
  }
  
  // Fetch consumer connection data from API
  const fetchConsumerConnectionData = async () => {
    try {
      const response = await api.get(`/api/v1/consumers/connection-data`)
      const data = await response.data
      
     // console.log(data)
      setConsumerConnectionData(data.connectionData)
      setError(null) // Clear any previous errors
    } catch (err) {
      console.error("Error fetching consumer connection data:", err)
      
      // Handle different types of errors
      if (err.response?.status === 401) {
        setError("Please log in to view your connection data")
      } else if (err.response?.status === 404) {
        // No connection data exists yet, set default values
        setConsumerConnectionData({
          totalRequests: 0,
          totalActiveConnections: 0,
          totalAcceptedRequests: 0,
          totalRejectedRequests: 0,
          totalPendingRequests: 0,
          requestSuccessRate: 0
        })
        setError(null)
      } else {
        setError("Failed to fetch consumer connection data")
      }
    }
  }
  // Check if location permission was previously granted
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state)
        if (result.state === 'granted') {
          requestLocation()
        }
      })
    }
    fetchConsumerConnectionData()
  }, [])

  // Filter farmers based on current filters
  useEffect(() => {
    if (nearbyFarmers.length === 0) {
      setFilteredFarmers([])
      return
    }

    const filtered = nearbyFarmers.filter(farmer => {
      // Filter by distance
      const distance = parseFloat(farmer.distance.replace(' km', ''))
      if (distance > filters.maxDistance) return false

      // Filter by rating
      const rating = farmer.rating || 0
      if (rating < filters.minRating || rating > filters.maxRating) return false

      return true
    })

    setFilteredFarmers(filtered)
  }, [nearbyFarmers, filters])

  
  return (
    <div className="min-h-screen bg-background">
      <style jsx>{`
        .slider {
          -webkit-appearance: none;
          appearance: none;
          background: #e5e7eb;
          outline: none;
          border-radius: 8px;
        }
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
        }
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #3b82f6;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
      <ConsumerNav />

      <main className="container py-8 px-5">
        {/* Hero Search Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-balance">Connect with Local Dairy Farmers</h1>
          <p className="text-lg text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Discover and connect with trusted local farmers for fresh dairy products. Build direct relationships with your food producers.
          </p>

          {/* Location Request Section */}  
          {!location && locationPermission !== "granted" && (
            <div className="max-w-2xl mx-auto mb-8">
              <Card className="p-6 border-2 border-dashed border-primary/20">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Enable Location Access</h3>
                  <p className="text-muted-foreground mb-4">
                    Allow us to access your location to find nearby farmers and connect with them directly
                  </p>
                  <Button 
                    onClick={requestLocation} 
                    disabled={loading}
                    size="lg" 
                    className="bg-primary hover:bg-primary/90"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <MapPin className="h-5 w-5 mr-2" />
                        Find Farmers Near Me
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8">
              <Card className="p-4 border-red-200 bg-red-50">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">
                    {error.includes("connection data") ? "Connection Error" : "Location Error"}
                  </span>
                </div>
                <p className="text-red-600 mt-2">{error}</p>
                <Button 
                  onClick={() => {
                    if (error.includes("connection data")) {
                      fetchConsumerConnectionData()
                    } else {
                      requestLocation()
                    }
                  }} 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                >
                  Try Again
                </Button>
              </Card>
            </div>
          )}

        </div>

        {/* Quick Stats */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold mb-6">Your Connection Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{consumerConnectionData?.totalActiveConnections || 0}</p>
                  <p className="text-sm text-muted-foreground">Active Connections</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{consumerConnectionData?.totalPendingRequests || 0}</p>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{consumerConnectionData?.totalRequests || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/consumer/products">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-6 text-center">
                  <Milk className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="font-semibold">Find by Product</p>
                  <p className="text-xs text-muted-foreground">Search by specific products</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/consumer/connections">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-6 text-center">
                  <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold">My Connections</p>
                  <p className="text-xs text-muted-foreground">View active connections</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/consumer/requests">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-6 text-center">
                  <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold">My Requests</p>
                  <p className="text-xs text-muted-foreground">Track request status</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/consumer/farmers">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold">All Farmers</p>
                  <p className="text-xs text-muted-foreground">Browse all farmers</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Nearby Farmers */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold">
              {location ? "Farmers Near You" : "Local Farmers"}
              {location && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({filteredFarmers.length} of {nearbyFarmers.length} found)
                </span>
              )}
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <Button 
                variant={showMapView ? "default" : "outline"} 
                size="sm"
                onClick={() => setShowMapView(!showMapView)}
                className="w-full sm:w-auto"
              >
                <Map className="h-4 w-4 mr-2" />
                {showMapView ? "List View" : "Map View"}
              </Button>
              <Button 
                variant={showFilters ? "default" : "outline"} 
                size="sm" 
                onClick={() => {
                  const newState = !showFilters
                  setShowFilters(newState)
                  saveFilterPanelState(newState)
                }}
                className="w-full sm:w-auto"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {Object.values(filters).some(v => v !== 50 && v !== 0 && v !== 5) && (
                  <span className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="mb-6 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filter Farmers</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowFilters(false)
                    saveFilterPanelState(false)
                  }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Distance Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Maximum Distance: {filters.maxDistance} km
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={filters.maxDistance}
                    onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 km</span>
                    <span>100 km</span>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Rating Range: {filters.minRating} - {filters.maxRating} stars
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600">Minimum Rating</label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={filters.minRating}
                        onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Maximum Rating</label>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={filters.maxRating}
                        onChange={(e) => handleFilterChange('maxRating', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0 stars</span>
                    <span>5 stars</span>
                  </div>
                </div>
              </div>

              {/* Filter Summary */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Showing farmers within <span className="font-medium">{filters.maxDistance} km</span> 
                  {' '}with ratings between <span className="font-medium">{filters.minRating}</span> and <span className="font-medium">{filters.maxRating}</span> stars
                </p>
              </div>
            </Card>
          )}

          {/* Map View */}
          {showMapView && (
            <div className="mb-8">
              <ConsumerMapPicker
                onFarmerSelect={handleFarmerSelect}
                initialLocation={location}
                farmers={filteredFarmers}
                categories={categories}
                onCategoryChange={handleCategoryChange}
                onLocationChange={handleLocationChange}
                loading={loading}
              />
            </div>
          )}

          {/* List View */}
          {!showMapView && (
            <>
              {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Finding nearby farmers...</span>
            </div>
          )}

          {!loading && nearbyFarmers.length === 0 && location && (
            <Card className="p-8 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Farmers Found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find any farmers in your area. Try expanding your search radius.
              </p>
              <Button 
                onClick={() => fetchNearbyFarmers(location.latitude, location.longitude, 20)}
                variant="outline"
              >
                Search within 20km
              </Button>
            </Card>
          )}

          {!loading && nearbyFarmers.length > 0 && filteredFarmers.length === 0 && (
            <Card className="p-8 text-center">
              <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Farmers Match Your Filters</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your distance or rating filters to see more farmers.
              </p>
              <Button 
                onClick={clearFilters}
                variant="outline"
              >
                Clear Filters
              </Button>
            </Card>
          )}

          {!loading && filteredFarmers.length > 0 && (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredFarmers.map((farmer) => (
                <Card key={farmer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                      src={farmer.image || farmer.coverImage || "/farmer.jpg"}
                      alt={farmer.name}
                      className="h-full w-full object-cover"
                    />
                    {farmer.verified && (
                      <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">✓ Verified</Badge>
                    )}
                    <Button size="sm" variant="secondary" className="absolute top-4 right-4 h-8 w-8 p-0 rounded-full">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-serif text-xl font-bold mb-1">{farmer.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">by {farmer.owner}</p>

                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{farmer.distance}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span>{farmer.rating?.toFixed(1) || '4.5'}</span>
                        <span className="text-muted-foreground">({farmer.reviews || 0})</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{farmer.products} products available</p>

                    <Link href={`/consumer/farmer/${farmer.id}`}>
                      <Button className="w-full bg-primary hover:bg-primary/90">Connect with Farmer</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!location && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Enable Location to Find Farmers</h3>
              <p className="text-muted-foreground mb-4">
                Allow location access to discover farmers near you
              </p>
              <Button onClick={requestLocation} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Find Farmers Near Me
                  </>
                )}
              </Button>
            </div>
          )}
            </>
          )}
        </div>

      </main>
    </div>
  )
}
