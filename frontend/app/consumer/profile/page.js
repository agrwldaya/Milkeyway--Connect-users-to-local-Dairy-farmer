"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, MapPin, Phone, Mail, Loader2, AlertCircle, Edit3, Check, X } from "lucide-react"
import { ConsumerNav } from "@/components/consumer-nav"
import { api } from "@/lib/utils"
import { toast } from "sonner"
import ConsumerMapPicker from "@/components/ConsumerMapPicker"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [consumerProfile, setConsumerProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showLocationUpdate, setShowLocationUpdate] = useState(false)
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false)
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "localhost:4000"


  useEffect(() => {
    let active = true
    const fetchConsumerProfile = async () => {
      setIsLoading(true)
      try {
        const response = await api.get(`${API_BASE}/api/v1/consumers/profile`)
        const data = await response.data
        if(!data.consumerProfile) throw new Error(data.message || "Failed to load consumer profile")
        if(!active) return
        setConsumerProfile(data.consumerProfile)
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message || "Failed to load consumer profile")
        setError(err?.response?.data?.message || err.message || "Failed to load consumer profile")
      } finally {
        setIsLoading(false)
      }
    }
    fetchConsumerProfile()
    return () => {
      active = false
    }
  }, [API_BASE])

  // Handle location update
  const handleLocationUpdate = async (newLocation) => {
    setIsUpdatingLocation(true)
    try {
      const response = await fetch(`${API_BASE}/api/v1/consumers/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          address: null
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Update the consumer profile with new location
        setConsumerProfile(prev => ({
          ...prev,
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
          address: data.location.address || prev.address
        }))
        toast.success("Location updated successfully!")
        setShowLocationUpdate(false)
      } else {
        toast.error(data.message || "Failed to update location")
      }
    } catch (error) {
      console.error('Error updating location:', error)
      toast.error("Failed to update location")
    } finally {
      setIsUpdatingLocation(false)
    }
  }

  if(isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-10 h-10 animate-spin" /></div>
  if(error) return <div className="flex justify-center items-center h-screen"><AlertCircle className="w-10 h-10 text-red-500" />{error}</div>
  if(!consumerProfile) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-10 h-10 animate-spin" /></div>
  
  return (
    <div className="min-h-screen bg-gray-50">
      <ConsumerNav />

      <main className="container py-8 px-5">
        <h1 className="text-4xl font-bold mb-8">My Profile</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="bg-white">
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4 border-2 border-primary rounded-full">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={consumerProfile.image} />
                  <AvatarFallback className="text-2xl">PS</AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full h-10 w-10 bg-primary hover:bg-primary/90"
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </div>

              <h2 className="text-2xl font-bold mb-1">{consumerProfile.name}</h2>
              <p className="text-muted-foreground mb-6">Customer since {consumerProfile.createdAt.split("T")[0]}</p>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{consumerProfile.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{consumerProfile.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{consumerProfile.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Personal Information</h2>
                  <Button variant={isEditing ? "default" : "outline"} onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? "Save Changes" : "Edit Profile"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue={consumerProfile.name.split(" ")[0]} disabled={!isEditing} className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue={consumerProfile.name.split(" ")[1]} disabled={!isEditing} className="mt-1.5" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={consumerProfile.email}
                      disabled={!isEditing}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      defaultValue={consumerProfile.phone}
                      disabled={!isEditing}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">Delivery Address</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Textarea
                      id="address"
                      defaultValue={consumerProfile.address}
                      disabled={!isEditing}
                      className="mt-1.5"
                      rows={3}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" defaultValue={consumerProfile.city} disabled={!isEditing} className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input id="pincode" defaultValue={consumerProfile.pincode} disabled={!isEditing} className="mt-1.5" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                      <Input id="landmark" defaultValue={consumerProfile.landmark} disabled={!isEditing} className="mt-1.5" />
                  </div>
                </div>  
              </CardContent>
            </Card>

            {/* Location Update Card */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Location Settings</h2>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowLocationUpdate(true)}
                    disabled={isUpdatingLocation}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    {isUpdatingLocation ? "Updating..." : "Update Location"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span className="font-medium">Current Location</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{consumerProfile.address}</p>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-mono">Lat: {consumerProfile.latitude ? Number(consumerProfile.latitude).toFixed(6) : 'N/A'}</span>
                      <span className="mx-2">•</span>
                      <span className="font-mono">Lng: {consumerProfile.longitude ? Number(consumerProfile.longitude).toFixed(6) : 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Update your location to find farmers in different areas or set a more precise location for better search results.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">Order Statistics</h2>

                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-3xl font-bold text-primary mb-1">24</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-3xl font-bold text-primary mb-1">₹8,450</p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-3xl font-bold text-primary mb-1">5</p>
                    <p className="text-sm text-muted-foreground">Favorite Farmers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Location Update Dialog */}
        <Dialog open={showLocationUpdate} onOpenChange={setShowLocationUpdate}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Update Your Location
              </DialogTitle>
              <DialogDescription>
                Set your location to find farmers in different areas or update your current location for better search results.
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4">
              <ConsumerMapPicker
                onLocationChange={handleLocationUpdate}
                initialLocation={consumerProfile.latitude && consumerProfile.longitude ? {
                  latitude: consumerProfile.latitude,
                  longitude: consumerProfile.longitude
                } : null}
                farmers={[]}
                categories={[]}
                loading={isUpdatingLocation}
              />
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowLocationUpdate(false)}
                disabled={isUpdatingLocation}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
