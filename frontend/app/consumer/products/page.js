"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Star, Milk, Filter, Loader2, AlertCircle, Users, MessageCircle, Map } from "lucide-react"
import { ConsumerNav } from "@/components/consumer-nav"
import { api } from "@/lib/utils"
import ConsumerMapPicker from "@/components/ConsumerMapPicker"

export default function ProductDiscoveryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [location, setLocation] = useState(null)
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [showMapView, setShowMapView] = useState(false)
  const [selectedFarmer, setSelectedFarmer] = useState(null)

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true)
        const response = await fetch('http://localhost:4000/api/v1/consumers/categories')
        const data = await response.json()
        
        if (data.success) {
          setCategories(data.categories)
        } else {
          setError(data.message || "Failed to fetch categories")
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
        setError("Failed to fetch categories")
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])

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
        if (selectedCategory) {
          await fetchFarmersByCategory(selectedCategory.id, latitude, longitude)
        }
        setLoading(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        setError("Unable to get your location. Please enable location access.")
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  // Fetch farmers by category
  const fetchFarmersByCategory = async (categoryId, lat, lng, radius = 10) => {
    try {
      setLoading(true)
      console.log("Fetching farmers with params:", { categoryId, lat, lng, radius })
      const response = await api.get(`/api/v1/consumers/farmers-by-category?categoryId=${categoryId}&latitude=${lat}&longitude=${lng}&radius=${radius}`)
      const data = await response.data
      setFarmers(data.farmers)
    } catch (err) {
      console.error("Error fetching farmers:", err)
      setError("Failed to fetch farmers")
    } finally {
      setLoading(false)
    }
  }

  // Handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    if (location) {
      fetchFarmersByCategory(category.id, location.latitude, location.longitude)
    } else {
      requestLocation()
    }
  }

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim() && location) {
      fetchFarmersByProduct(searchQuery.trim(), location.latitude, location.longitude)
    }
  }

  // Handle farmer selection from map
  const handleFarmerSelect = (farmer) => {
    setSelectedFarmer(farmer)
    // Navigate to farmer details page
    window.location.href = `/consumer/farmer/${farmer.id}`
  }

  // Handle location change from map
  const handleLocationChange = (newLocation) => {
    setLocation(newLocation)
    if (selectedCategory) {
      fetchFarmersByCategory(selectedCategory.id, newLocation.latitude, newLocation.longitude)
    }
  }

  // Handle category change from map
  const handleCategoryChange = async (categoryId) => {
    if (location) {
      try {
        setLoading(true)
        const response = await api.get(`/api/v1/consumers/farmers-by-category?categoryId=${categoryId}&latitude=${location.latitude}&longitude=${location.longitude}&radius=10`)
        const data = response.data
        if (data.success) {
          setFarmers(data.farmers)
        }
      } catch (err) {
        console.error("Error fetching farmers by category:", err)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <ConsumerNav />

      <main className="container py-8 px-5">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-balance">
            Find Farmers by Product
          </h1>
          <p className="text-lg text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Discover local farmers who sell specific dairy products. Connect directly with producers of your favorite items.
          </p>

          {/* Location Request */}
          {!location && (
            <div className="max-w-2xl mx-auto mb-8">
              <Card className="p-6 border-2 border-dashed border-primary/20">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Enable Location Access</h3>
                  <p className="text-muted-foreground mb-4">
                    Allow us to access your location to find nearby farmers selling your desired products
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
                        Enable Location
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Search Section */}
          {location && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search for specific products (e.g., fresh milk, organic ghee)..."
                    className="pl-10 h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSearch}
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8">
              <Card className="p-4 border-red-200 bg-red-50">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-red-600 mt-2">{error}</p>
                <Button 
                  onClick={requestLocation} 
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

        {/* Product Categories */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold">Browse by Product Category</h2>
            <Button 
              variant={showMapView ? "default" : "outline"} 
              size="sm"
              onClick={() => setShowMapView(!showMapView)}
            >
              <Map className="h-4 w-4 mr-2" />
              {showMapView ? "List View" : "Map View"}
            </Button>
          </div>
          {categoriesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading categories...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((category) => (
                <Card 
                  key={category.id} 
                  className={`cursor-pointer hover:border-primary transition-colors ${
                    selectedCategory?.id === category.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleCategorySelect(category)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden">
                      <img
                        src={category.imageurl}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="font-semibold mb-1">{category.name}</p>
                    <p className="text-xs text-muted-foreground">Find farmers</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Map View */}
        {showMapView && (
          <div className="mb-8">
            <ConsumerMapPicker
              onFarmerSelect={handleFarmerSelect}
              initialLocation={location}
              farmers={farmers}
              categories={categories}
              onCategoryChange={handleCategoryChange}
              onLocationChange={handleLocationChange}
              loading={loading}
            />
          </div>
        )}

        {/* Results Section */}
        {selectedCategory && !showMapView && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-bold">
                Farmers Selling {selectedCategory?.name}
                {farmers.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({farmers.length} found)
                  </span>
                )}
              </h2>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Finding farmers...</span>
              </div>
            )}

            {!loading && farmers.length === 0 && (
              <Card className="p-8 text-center">
                <Milk className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Farmers Found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find any farmers selling {selectedCategory?.name} in your area.
                </p>
                <Button 
                  onClick={() => fetchFarmersByCategory(selectedCategory.id, location.latitude, location.longitude, 20)}
                  variant="outline"
                >
                  Search within 20km
                </Button>
              </Card>
            )}

            {!loading && farmers.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {farmers.map((farmer) => (
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
                        </div>
                      </div>

                      {/* Product Information */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-2">Available Products:</h4>
                        <div className="space-y-1">
                          {farmer.products?.slice(0, 3).map((product, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">{product.name}</span>
                              <span className="font-medium text-primary">₹{product.price}/{product.unit}</span>
                            </div>
                          ))}
                          {farmer.products?.length > 3 && (
                            <p className="text-xs text-muted-foreground">+{farmer.products.length - 3} more products</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/consumer/farmer/${farmer.id}`} className="flex-1">
                          <Button className="w-full bg-primary hover:bg-primary/90">
                            <Users className="h-4 w-4 mr-2" />
                            View Farm
                          </Button>
                        </Link>
                        <Link href={`/consumer/farmer/${farmer.id}`}>
                          <Button variant="outline" className="px-3">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No Category Selected */}
        {!selectedCategory && !searchQuery && (
          <div className="text-center py-12">
            <Milk className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select a Product Category</h3>
            <p className="text-muted-foreground mb-4">
              Choose a product category above or search for specific products to find nearby farmers
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
