"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation, Search, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function LocationPicker({ onLocationSelect, initialLocation = null }) {
  const [locationMethod, setLocationMethod] = useState("") // "current" or "map"
  const [currentLocation, setCurrentLocation] = useState(null)
  const [mapLocation, setMapLocation] = useState(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(initialLocation)
  const [isMapLoading, setIsMapLoading] = useState(false)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  // Initialize map when component mounts
  useEffect(() => {
    if (locationMethod === "map") {
      initializeMap()
    }
  }, [locationMethod])

  const initializeMap = () => {
    // Using OpenStreetMap with Leaflet as it's free and doesn't require API keys
    if (typeof window !== "undefined" && !mapInstanceRef.current) {
      setIsMapLoading(true)
      import("leaflet").then((L) => {
        try {
          // Create map
          const map = L.map("map-container").setView([20.5937, 78.9629], 6) // Center on India
          
          // Add tile layer
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map)

          mapInstanceRef.current = map
          setIsMapLoading(false)

          // Add click handler to map
          map.on("click", (e) => {
            const { lat, lng } = e.latlng
            setMapLocation({ latitude: lat, longitude: lng })
            setSelectedLocation({ latitude: lat, longitude: lng })
            
            // Add marker
            map.eachLayer((layer) => {
              if (layer instanceof L.Marker) {
                map.removeLayer(layer)
              }
            })
            L.marker([lat, lng]).addTo(map)
          })
        } catch (error) {
          console.error("Error initializing map:", error)
          setIsMapLoading(false)
          toast.error("Failed to load map. Please try refreshing the page.")
        }
      }).catch((error) => {
        console.error("Error loading Leaflet:", error)
        setIsMapLoading(false)
        toast.error("Failed to load map library. Please check your internet connection.")
      })
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser")
      return
    }

    setIsLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCurrentLocation({ latitude, longitude })
        setSelectedLocation({ latitude, longitude })
        setIsLoadingLocation(false)
        toast.success("Current location detected successfully")
      },
      (error) => {
        setIsLoadingLocation(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location access denied. Please enable location permissions.")
            break
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information unavailable.")
            break
          case error.TIMEOUT:
            toast.error("Location request timed out.")
            break
          default:
            toast.error("An unknown error occurred while retrieving location.")
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  const searchLocation = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a location to search")
      return
    }

    setIsSearching(true)
    try {
      // Using Nominatim (OpenStreetMap's geocoding service) - free
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=in`
      )
      const results = await response.json()
      
      if (results.length === 0) {
        toast.error("No locations found. Please try a different search term.")
        setSearchResults([])
      } else {
        setSearchResults(results)
      }
    } catch (error) {
      toast.error("Error searching for location")
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const selectSearchResult = (result) => {
    const { lat, lon, display_name } = result
    const location = { 
      latitude: parseFloat(lat), 
      longitude: parseFloat(lon),
      address: display_name
    }
    setMapLocation(location)
    setSelectedLocation(location)
    
    // Update map if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lon], 15)
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof window.L?.Marker) {
          mapInstanceRef.current.removeLayer(layer)
        }
      })
      if (window.L) {
        window.L.marker([lat, lon]).addTo(mapInstanceRef.current)
      }
    }
    
    setSearchResults([])
    setSearchQuery("")
  }

  const handleLocationConfirm = () => {
    if (!selectedLocation) {
      toast.error("Please select a location first")
      return
    }
    
    // Validate coordinate ranges
    if (selectedLocation.latitude < -90 || selectedLocation.latitude > 90) {
      toast.error("Invalid latitude. Please select a valid location.")
      return
    }
    if (selectedLocation.longitude < -180 || selectedLocation.longitude > 180) {
      toast.error("Invalid longitude. Please select a valid location.")
      return
    }
    
    onLocationSelect(selectedLocation)
  }

  const renderLocationMethodSelection = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Choose Location Method</h3>
        <p className="text-sm text-muted-foreground">
          Select how you'd like to provide your farm location
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            locationMethod === "current" ? "ring-2 ring-[#80e619]" : ""
          }`}
          onClick={() => setLocationMethod("current")}
        >
          <CardHeader className="text-center">
            <Navigation className="h-8 w-8 mx-auto mb-2 text-[#80e619]" />
            <CardTitle className="text-base">Use Current Location</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Automatically detect your current location using GPS
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${
            locationMethod === "map" ? "ring-2 ring-[#80e619]" : ""
          }`}
          onClick={() => setLocationMethod("map")}
        >
          <CardHeader className="text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-[#80e619]" />
            <CardTitle className="text-base">Choose on Map</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Select your farm location on an interactive map
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderCurrentLocationMethod = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Current Location</h3>
        <p className="text-sm text-muted-foreground">
          We'll use your device's GPS to detect your current location
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <Button
          onClick={getCurrentLocation}
          disabled={isLoadingLocation}
          className="bg-[#80e619] hover:bg-[#80e619]/90"
        >
          <Navigation className="h-4 w-4 mr-2" />
          {isLoadingLocation ? "Detecting Location..." : "Get Current Location"}
        </Button>

        {currentLocation && (
          <div className="w-full p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">Location Detected</span>
            </div>
            <div className="mt-2 text-xs sm:text-sm text-green-700">
              <p className="break-all">Latitude: {Number(currentLocation.latitude).toFixed(6)}</p>
              <p className="break-all">Longitude: {Number(currentLocation.longitude).toFixed(6)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderMapLocationMethod = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Select Farm Location</h3>
        <p className="text-sm text-muted-foreground">
          Search for your location or click on the map to select
        </p>
      </div>

      {/* Search Bar */}
      <div className="space-y-2">
        <Label htmlFor="location-search">Search Location</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="location-search"
              placeholder="Enter city, district, or landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              onKeyPress={(e) => e.key === "Enter" && searchLocation()}
            />
          </div>
          <Button
            onClick={searchLocation}
            disabled={isSearching}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          <Label>Search Results</Label>
          <div className="max-h-32 sm:max-h-40 overflow-y-auto space-y-1">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                onClick={() => selectSearchResult(result)}
              >
                <p className="text-xs sm:text-sm font-medium line-clamp-2">{result.display_name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="space-y-2">
        <Label>Interactive Map</Label>
        <div className="relative">
        <div 
          id="map-container" 
          className="w-full h-48 sm:h-64 md:h-80 lg:h-96 border rounded-lg"
          style={{ minHeight: "192px" }}
        />
          {isMapLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#80e619] mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading map...</p>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Click anywhere on the map to select your farm location
        </p>
      </div>

      {/* Selected Location Display */}
      {mapLocation && (
        <div className="w-full p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 text-green-800">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">Location Selected</span>
          </div>
          <div className="mt-2 text-xs sm:text-sm text-green-700">
            <p className="break-all">Latitude: {Number(mapLocation.latitude).toFixed(6)}</p>
            <p className="break-all">Longitude: {Number(mapLocation.longitude).toFixed(6)}</p>
            {mapLocation.address && (
              <p className="mt-1 line-clamp-2">Address: {mapLocation.address}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {!locationMethod && renderLocationMethodSelection()}
      
      {locationMethod === "current" && renderCurrentLocationMethod()}
      
      {locationMethod === "map" && renderMapLocationMethod()}

      {/* Action Buttons */}
      {locationMethod && (
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setLocationMethod("")
              setCurrentLocation(null)
              setMapLocation(null)
              setSelectedLocation(null)
              setSearchResults([])
              setSearchQuery("")
            }}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleLocationConfirm}
            disabled={!selectedLocation}
            className="flex-1 bg-[#80e619] hover:bg-[#80e619]/90"
          >
            Confirm Location
          </Button>
        </div>
      )}
    </div>
  )
}
