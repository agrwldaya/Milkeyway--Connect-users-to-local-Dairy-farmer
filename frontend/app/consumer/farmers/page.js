"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Star, Heart, Filter, Loader2, AlertCircle } from "lucide-react"
import { ConsumerNav } from "@/components/consumer-nav"

export default function FarmersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState(null)
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [locationPermission, setLocationPermission] = useState(null)

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
        setFarmers(data.farmers)
      } else {
        setError(data.message || "Failed to fetch nearby farmers")
      }
    } catch (err) {
      console.error("Error fetching nearby farmers:", err)
      setError("Failed to fetch nearby farmers")
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
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsumerNav />

      <main className="container py-8 px-5">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {location ? "Farmers Near You" : "Local Farmers"}
            {location && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({farmers.length} found)
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">
            {location ? "Connect with trusted dairy farmers in your area" : "Enable location to find farmers near you"}
          </p>
        </div>

        {/* Location Request Section */}
        {!location && locationPermission !== "granted" && (
          <div className="mb-8">
            <Card className="p-6 border-2 border-dashed border-primary/20">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Enable Location Access</h3>
                <p className="text-muted-foreground mb-4">
                  Allow us to access your location to find nearby farmers and fresh dairy products
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
          <div className="mb-8">
            <Card className="p-4 border-red-200 bg-red-50">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Location Error</span>
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

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search farmers..."
              className="pl-10 h-12 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="lg" className="bg-white">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </Button>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90"
            onClick={location ? () => fetchNearbyFarmers(location.latitude, location.longitude) : requestLocation}
          >
            <MapPin className="h-5 w-5 mr-2" />
            {location ? "Refresh" : "Near Me"}
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Finding nearby farmers...</span>
          </div>
        )}

        {/* No Farmers Found */}
        {!loading && farmers.length === 0 && location && (
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

        {/* Farmers Grid */}
        {!loading && farmers.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {farmers.map((farmer) => (
              <Card key={farmer.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={farmer.image || farmer.coverImage || "/farmer.jpg"}
                    alt={farmer.name}
                    className="h-full w-full object-cover"
                  />
                  {farmer.verified && (
                    <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">✓ Verified</Badge>
                  )}
                  <Button size="sm" variant="secondary" className="absolute top-4 right-4 h-8 w-8 p-0 rounded-full">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-1">{farmer.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">by {farmer.owner}</p>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {farmer.description || "Fresh dairy products from a trusted local farmer."}
                  </p>

                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{farmer.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{farmer.rating?.toFixed(1) || '4.5'}</span>
                      <span className="text-muted-foreground">({farmer.reviews || 0})</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{farmer.products} products available</p>

                  <Link href={`/consumer/farmer/${farmer.id}`}>
                    <Button className="w-full bg-primary hover:bg-primary/90">View Products</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Location State */}
        {!location && !loading && (
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
      </main>
    </div>
  )
}
