"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Navigation, Search, Filter, Users, Star, Edit3, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function ConsumerMapPicker({ 
  onFarmerSelect, 
  initialLocation = null,
  farmers = [],
  categories = [],
  onCategoryChange,
  onLocationChange,
  loading = false 
}) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const [isMapLoading, setIsMapLoading] = useState(true)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedFarmer, setSelectedFarmer] = useState(null)
  const [userLocation, setUserLocation] = useState(initialLocation)
  const [mapCenter, setMapCenter] = useState(initialLocation || { latitude: 19.0760, longitude: 72.8777 }) // Mumbai default
  const [showLocationDialog, setShowLocationDialog] = useState(false)
  const [manualLocation, setManualLocation] = useState({ latitude: "", longitude: "" })
  const [locationAddress, setLocationAddress] = useState("")

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initMap = async () => {
      try {
        setIsMapLoading(true)
        
        // Dynamically import Leaflet
        const L = await import('leaflet')
        
        // Initialize map
        if (mapRef.current && !mapInstanceRef.current) {
          mapInstanceRef.current = L.map(mapRef.current).setView([mapCenter.latitude, mapCenter.longitude], 13)
          
          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(mapInstanceRef.current)
          
          // Add click handler for map
          mapInstanceRef.current.on('click', (e) => {
            const { lat, lng } = e.latlng
            setMapCenter({ latitude: lat, longitude: lng })
            if (onLocationChange) {
              onLocationChange({ latitude: lat, longitude: lng })
            }
          })
        }
      } catch (error) {
        console.error('Error initializing map:', error)
        toast.error('Failed to load map')
      } finally {
        setIsMapLoading(false)
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update map center when location changes
  useEffect(() => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setView([userLocation.latitude, userLocation.longitude], 13)
      setMapCenter(userLocation)
    }
  }, [userLocation])

  // Add farmer markers to map
  useEffect(() => {
    if (!mapInstanceRef.current || !farmers.length) return

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker)
    })
    markersRef.current = []

    // Add new markers
    farmers.forEach(farmer => {
      if (farmer.latitude && farmer.longitude) {
        const L = window.L
        const marker = L.marker([farmer.latitude, farmer.longitude])
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">${farmer.name}</h3>
              <p class="text-xs text-gray-600">${farmer.owner}</p>
              <p class="text-xs text-gray-500">${farmer.distance}</p>
              <p class="text-xs text-gray-500">${farmer.products} products</p>
              <button 
                onclick="window.selectFarmer(${farmer.id})"
                class="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                View Details
              </button>
            </div>
          `)
          .on('click', () => {
            setSelectedFarmer(farmer)
            if (onFarmerSelect) {
              onFarmerSelect(farmer)
            }
          })

        markersRef.current.push(marker)
      }
    })

    // Fit map to show all markers
    if (farmers.length > 0) {
      const group = new window.L.featureGroup(markersRef.current)
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
    }
  }, [farmers, onFarmerSelect])

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser")
      return
    }

    setIsLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const location = { latitude, longitude }
        setUserLocation(location)
        setMapCenter(location)
        if (onLocationChange) {
          onLocationChange(location)
        }
        
        // Save location to backend
        saveLocationToBackend(location, null)
        
        toast.success("Location updated!")
        setIsLoadingLocation(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        toast.error("Unable to get your location")
        setIsLoadingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  // Search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      // Use Nominatim API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=in`
      )
      const data = await response.json()
      
      if (data.length > 0) {
        const { lat, lon } = data[0]
        const location = { latitude: parseFloat(lat), longitude: parseFloat(lon) }
        setMapCenter(location)
        setUserLocation(location)
        if (onLocationChange) {
          onLocationChange(location)
        }
        
        // Save location to backend
        saveLocationToBackend(location, data[0].display_name)
        
        toast.success(`Location updated to ${data[0].display_name}`)
      } else {
        toast.error("Location not found")
      }
    } catch (error) {
      console.error("Search error:", error)
      toast.error("Search failed")
    } finally {
      setIsSearching(false)
    }
  }

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    if (onCategoryChange) {
      onCategoryChange(categoryId === "all" ? "" : categoryId)
    }
  }

  // Handle manual location update
  const handleManualLocationUpdate = () => {
    const lat = parseFloat(manualLocation.latitude)
    const lng = parseFloat(manualLocation.longitude)
    
    // Validate coordinates
    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Please enter valid latitude and longitude")
      return
    }
    
    if (lat < -90 || lat > 90) {
      toast.error("Latitude must be between -90 and 90")
      return
    }
    
    if (lng < -180 || lng > 180) {
      toast.error("Longitude must be between -180 and 180")
      return
    }
    
    const location = { latitude: lat, longitude: lng }
    setUserLocation(location)
    setMapCenter(location)
    if (onLocationChange) {
      onLocationChange(location)
    }
    
    // Save location to backend
    saveLocationToBackend(location, locationAddress)
    
    setShowLocationDialog(false)
    setManualLocation({ latitude: "", longitude: "" })
    setLocationAddress("")
    toast.success("Location updated successfully!")
  }

  // Save location to backend
  const saveLocationToBackend = async (location, address) => {
    try {
      const response = await fetch('/api/v1/consumers/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          address: address || null
        })
      })

      const data = await response.json()
      
      if (data.success) {
        console.log('Location saved to backend:', data.location)
      } else {
        console.error('Failed to save location:', data.message)
      }
    } catch (error) {
      console.error('Error saving location to backend:', error)
    }
  }

  // Handle address search for location update
  const handleAddressSearch = async () => {
    if (!locationAddress.trim()) return
    
    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationAddress)}&limit=1&countrycodes=in`
      )
      const data = await response.json()
      
      if (data.length > 0) {
        const { lat, lon } = data[0]
        setManualLocation({ 
          latitude: parseFloat(lat).toFixed(6), 
          longitude: parseFloat(lon).toFixed(6) 
        })
        toast.success(`Found: ${data[0].display_name}`)
      } else {
        toast.error("Address not found")
      }
    } catch (error) {
      console.error("Address search error:", error)
      toast.error("Address search failed")
    } finally {
      setIsSearching(false)
    }
  }

  // Open location update dialog
  const openLocationDialog = () => {
    if (userLocation) {
      setManualLocation({
        latitude: Number(userLocation.latitude).toFixed(6),
        longitude: Number(userLocation.longitude).toFixed(6)
      })
    }
    setShowLocationDialog(true)
  }

  // Make selectFarmer available globally for popup buttons
  useEffect(() => {
    window.selectFarmer = (farmerId) => {
      const farmer = farmers.find(f => f.id === farmerId)
      if (farmer) {
        setSelectedFarmer(farmer)
        if (onFarmerSelect) {
          onFarmerSelect(farmer)
        }
      }
    }
  }, [farmers, onFarmerSelect])

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            {/* Location Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Current Location Button */}
            <Button
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Navigation className="h-4 w-4 mr-2" />
              {isLoadingLocation ? "Getting..." : "My Location"}
            </Button>

            {/* Update Location Button */}
            <Button
              onClick={openLocationDialog}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Update Location
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          <div className="relative">
            <div 
              ref={mapRef} 
              className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-lg"
              style={{ minHeight: '300px' }}
            />
            
            {isMapLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading map...</p>
                </div>
              </div>
            )}

            {/* Map Info */}
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 sm:p-3 shadow-lg max-w-[200px] sm:max-w-none">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span className="truncate">{farmers.length} farmers found</span>
              </div>
              {userLocation && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">
                    {Number(userLocation.latitude).toFixed(4)}, {Number(userLocation.longitude).toFixed(4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Farmer Info */}
      {selectedFarmer && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                {selectedFarmer.image ? (
                  <img 
                    src={selectedFarmer.image} 
                    alt={selectedFarmer.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <MapPin className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{selectedFarmer.name}</h3>
                  {selectedFarmer.verified && (
                    <Badge variant="secondary" className="text-xs w-fit">
                      <Star className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2 truncate">{selectedFarmer.owner}</p>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{selectedFarmer.address}</p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                  <span>{selectedFarmer.distance}</span>
                  <span>{selectedFarmer.products} products</span>
                  <span>Delivery: {selectedFarmer.deliveryRadius}km</span>
                </div>
              </div>
              <Button 
                onClick={() => {
                  if (onFarmerSelect) {
                    onFarmerSelect(selectedFarmer)
                  }
                }}
                size="sm"
                className="w-full sm:w-auto mt-2 sm:mt-0"
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">Loading farmers...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Update Dialog */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Update Your Location
            </DialogTitle>
            <DialogDescription>
              Set your location manually or search for an address to find farmers in a specific area.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Address Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search by Address</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter address (e.g., Mumbai, Maharashtra)"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
                />
                <Button 
                  onClick={handleAddressSearch} 
                  disabled={isSearching || !locationAddress.trim()}
                  size="sm"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Manual Coordinates */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Or Enter Coordinates</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Latitude</label>
                  <Input
                    placeholder="19.0760"
                    value={manualLocation.latitude}
                    onChange={(e) => setManualLocation({...manualLocation, latitude: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Longitude</label>
                  <Input
                    placeholder="72.8777"
                    value={manualLocation.longitude}
                    onChange={(e) => setManualLocation({...manualLocation, longitude: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Current Location Display */}
            {userLocation && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Current Location:</p>
                <p className="text-xs text-muted-foreground">
                  {Number(userLocation.latitude).toFixed(6)}, {Number(userLocation.longitude).toFixed(6)}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowLocationDialog(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleManualLocationUpdate}
              disabled={!manualLocation.latitude || !manualLocation.longitude}
            >
              <Check className="h-4 w-4 mr-2" />
              Update Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
