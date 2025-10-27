"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, Camera, Award, MapPin, Phone, Mail, CheckCircle, AlertCircle, Edit, Save } from "lucide-react"
import { FarmerNav } from "@/components/farmer-nav"
import { api } from "@/lib/utils"
import { toast } from "sonner"
import LocationPicker from "@/components/LocationPicker"


export default function ProfilePage() {
  const API_BASE = "http://localhost:4000" // Hardcode for testing
  const [isLoading, setIsLoading] = useState(false)
  const [farmerProfile, setFarmerProfile] = useState(null)
  const [userId, setUserId] = useState(null) // Add userId state
  const [coverImage, setCoverImage] = useState("/farm_cover.jpg")
  const [profileImage, setProfileImage] = useState("/farmer_image.jpg")
  const [farmImages, setFarmImages] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  
  // New states for document upload and location update
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)
  const [showLocationUpdate, setShowLocationUpdate] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState({
    farmer_proof_doc: null,
    farm_image: null,
    farmer_image: null
  })
  const [newLocation, setNewLocation] = useState(null)

  // Debug useEffect to monitor state changes
  useEffect(() => {
    console.log("showDocumentUpload state changed to:", showDocumentUpload)
  }, [showDocumentUpload])

  useEffect(() => {
    console.log("showLocationUpdate state changed to:", showLocationUpdate)
  }, [showLocationUpdate])

  useEffect(() => {
    let active = true
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/v1/farmers/profile`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })
        
        const data = await res.json()
        console.log("Profile fetch response:", data) // Debug log
        
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load profile")
        }
        
        if (!data?.farmerProfile) throw new Error(data?.message || "Failed to load profile")
        if (!active) return
        setFarmerProfile(data.farmerProfile)
        
        // Get user ID from the response or extract from profile
        const userIdFromProfile = data.farmerProfile.id || data.userId
        console.log("User ID from profile:", userIdFromProfile) // Debug log
        if (userIdFromProfile) {
          setUserId(userIdFromProfile)
          console.log("User ID set to:", userIdFromProfile) // Debug log
        }
        
        // Set images from profile data
        if (data.farmerProfile.documents) {
          if (data.farmerProfile.documents.farm_image_url) {
            setCoverImage(data.farmerProfile.documents.farm_image_url)
          }
          if (data.farmerProfile.documents.farmer_image_url) {
            setProfileImage(data.farmerProfile.documents.farmer_image_url)
          }
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message || "Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
    return () => {
      active = false
    }
  }, [API_BASE])

  const handleCoverUpload = async (e) => {

    e.preventDefault()
    const file = e.target.files?.[0]
    if (!file) return;

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("cover_image", file)
      const res = await api.post(`${API_BASE}/api/v1/farmers/update-farm-cover`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      const data = res.data
      if (res.status !== 200) throw new Error(data?.message || "Failed to upload cover image")
      setCoverImage(URL.createObjectURL(file))
      if (res.status === 200) {
        toast.success("Cover image updated successfully")
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to upload cover image")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpload = async (e) => {
    e.preventDefault()
    const file = e.target.files?.[0]
    const fileName = file?.name
    console.log("Selected file:", file)
    if (!file) return
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append("profile_image", file)
      const res = await api.post(`${API_BASE}/api/v1/farmers/update-farmer-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      //console.log("Response from server:", res)
      const data = res.data
      console.log("Data from server:", data)
      if (res.status !== 200) throw new Error(data?.message || "Failed to upload image")
      setProfileImage(URL.createObjectURL(file))
      if (res.status === 200) {
        toast.success("Profile image updated successfully")
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to update profile image")
    } finally {
      setIsLoading(false)
    }
  }

  const removeFarmImage = (index) => {
    setFarmImages(farmImages.filter((_, i) => i !== index))
  }

  // Document upload functions
  const handleFileSelect = (fileType, file) => {
    setUploadedFiles({ ...uploadedFiles, [fileType]: file })
  }

  const handleDocumentUpload = async () => {
    console.log("Current userId state:", userId) // Debug log
    if (!uploadedFiles.farmer_proof_doc) {
      toast.error("Farmer proof document is required")
      return
    }

    if (!userId) {
      toast.error("User ID not found. Please refresh the page.")
      return
    }

    setIsLoading(true)
    try {
      const form = new FormData()
      
      // Add required farmer proof document
      form.append("farmer_proof_doc", uploadedFiles.farmer_proof_doc)
      
      // Add optional documents if provided
      if (uploadedFiles.farm_image) {
        form.append("farm_image", uploadedFiles.farm_image)
      }
      if (uploadedFiles.farmer_image) {
        form.append("farmer_image", uploadedFiles.farmer_image)
      }
      
      console.log("Uploading documents for user ID:", userId)
      const res = await fetch(`${API_BASE}/api/v1/farmers/submit-proof-docs/${userId}`, {
        method: "POST",
        credentials: "include",
        body: form,
      })
      
      const data = await res.json()
      console.log("Document upload response:", data)
      
      if (!res.ok) {
        toast.error(data?.message || "Failed to upload documents")
        return
      }
      
      toast.success("Documents submitted successfully")
      setShowDocumentUpload(false)
      setUploadedFiles({ farmer_proof_doc: null, farm_image: null, farmer_image: null })
      // Refresh profile data
      window.location.reload()
    } catch (err) {
      console.error("Document upload error:", err)
      toast.error(err?.response?.data?.message || "Failed to upload documents")
    } finally {
      setIsLoading(false)
    }
  }

  // Location update functions
  const handleLocationSelect = (location) => {
    setNewLocation(location)
  }

  const handleLocationUpdate = async () => {
    console.log("Current userId state:", userId) // Debug log
    if (!newLocation) {
      toast.error("Please select a location")
      return
    }

    if (!userId) {
      toast.error("User ID not found. Please refresh the page.")
      return
    }

    setIsLoading(true)
    try {
      console.log("Updating location for user ID:", userId, "with coordinates:", newLocation)
      const res = await fetch(`${API_BASE}/api/v1/farmers/location/${userId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
        }),
      })
      
      const data = await res.json()
      console.log("Location update response:", data)
      
      if (!res.ok) {
        toast.error(data?.message || "Failed to update location")
        return
      }
      
      toast.success("Location updated successfully")
      setShowLocationUpdate(false)
      setNewLocation(null)
      // Refresh profile data
      window.location.reload()
    } catch (err) {
      console.error("Location update error:", err)
      toast.error(err?.response?.data?.message || "Failed to update location")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <FarmerNav />
        <main className="container py-8 px-5">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!farmerProfile) {
    return (
      <div className="min-h-screen bg-background">
        <FarmerNav />
        <main className="container py-8 px-5">
          <div className="text-center">
            <p className="text-muted-foreground">Failed to load profile data</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <FarmerNav />

      <main className="container py-8  px-5 ">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">Farm Profile</h1>
          <p className="text-muted-foreground">Manage your farm information and showcase your products</p>
        </div>

        <div className="space-y-6">
          {/* Cover & Profile Image */}
          <Card>
            <CardContent className="p-0">
              <div className="relative h-48 md:h-64 bg-muted">
                <label className="absolute top-4 right-4 cursor-pointer">
                 <div className="flex items-center bg-primary text-white px-3 py-2 rounded-md">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Cover
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleCoverUpload}
                  />
                </label>

                <img src={coverImage} alt="Farm cover" className="w-full h-full object-cover" />
                
              </div>
              <div className="px-6 pb-6">
                <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-20">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full border-4 border-background overflow-hidden bg-muted">
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label className="absolute bottom-0 right-0 cursor-pointer">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center border-2 border-background">
                        <Camera className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleProfileUpload} />
                    </label>
                  </div>
                  <div className="flex-1 mt-16 md:mt-20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold">{farmerProfile.farmName}</h2>
                        <p className="text-muted-foreground">Member since {new Date(farmerProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={farmerProfile.farmerStatus === "active" ? "default" : "secondary"}>
                          {farmerProfile.farmerStatus}
                        </Badge>
                        {farmerProfile.documents?.is_doc_verified ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pending Verification
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader className='relative'>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your farm's basic details</CardDescription>
              <div className="absolute right-4">
              {/* {!isEditing?
              <Button >edit</Button>:
              <Button>save</Button>
              } */}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="farmName">Farm Name *</Label>
                <Input id="farmName" value={farmerProfile.farmName} readOnly={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input id="ownerName" value={farmerProfile.name} readOnly={!isEditing} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" value={farmerProfile.phone} className="pl-10" readOnly={!isEditing} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" value={farmerProfile.email} className="pl-10" readOnly={!isEditing} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Farm Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    value={farmerProfile.address}
                    className="pl-10"
                    rows={3}
                    readOnly={!isEditing}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
                  <Input id="deliveryRadius" value={farmerProfile.deliveryRadius} readreadOnly={!isEditing}Only />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coordinates">Coordinates</Label>
                  <Input 
                    id="coordinates" 
                    value={`${farmerProfile.coordinates.latitude}, ${farmerProfile.coordinates.longitude}`} 
                    readOnly={!isEditing} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Farm Description</Label>
                <Textarea
                  id="description"
                  defaultValue="We are a family-run dairy farm with over 20 years of experience. Our cows are grass-fed and we follow traditional methods to produce high-quality dairy products."
                  rows={4}
                  readOnly={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Documents & Verification</CardTitle>
                  <CardDescription>Your uploaded documents and verification status</CardDescription>
                </div>
                {!farmerProfile.hasSubmittedDocuments && (
                <Button 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log("Document upload button clicked, current state:", showDocumentUpload)
                    setShowDocumentUpload(!showDocumentUpload)
                    console.log("Document upload state changed to:", !showDocumentUpload)
                  }}
                  variant="outline"
                  size="sm"
                  type="button"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {showDocumentUpload ? "Cancel" : "Upload Documents"}
                </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!farmerProfile.hasSubmittedDocuments && showDocumentUpload && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <div className="space-y-4">
                      <p>Please upload your proof documents to complete your profile:</p>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="farmer_proof_doc">Farmer Proof Document *</Label>
                          <div 
                            className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer"
                            onClick={() => document.getElementById('farmer_proof_doc').click()}
                          >
                            <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Click to upload ID proof, license, or certification</p>
                            <Input 
                              id="farmer_proof_doc" 
                              type="file" 
                              className="hidden" 
                              onChange={(e) => handleFileSelect("farmer_proof_doc", e.target.files?.[0] || null)} 
                            />
                          </div>
                          {uploadedFiles.farmer_proof_doc && (
                            <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center space-x-2 text-green-800">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">Selected: {uploadedFiles.farmer_proof_doc.name}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="farm_image">Farm Image (Optional)</Label>
                          <div 
                            className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer"
                            onClick={() => document.getElementById('farm_image').click()}
                          >
                            <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Click to upload farm photo</p>
                            <Input 
                              id="farm_image" 
                              type="file" 
                              accept="image/*"
                              className="hidden" 
                              onChange={(e) => handleFileSelect("farm_image", e.target.files?.[0] || null)} 
                            />
                          </div>
                          {uploadedFiles.farm_image && (
                            <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center space-x-2 text-green-800">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">Selected: {uploadedFiles.farm_image.name}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="farmer_image">Farmer Photo (Optional)</Label>
                          <div 
                            className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer"
                            onClick={() => document.getElementById('farmer_image').click()}
                          >
                            <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Click to upload your photo</p>
                            <Input 
                              id="farmer_image" 
                              type="file" 
                              accept="image/*"
                              className="hidden" 
                              onChange={(e) => handleFileSelect("farmer_image", e.target.files?.[0] || null)} 
                            />
                          </div>
                          {uploadedFiles.farmer_image && (
                            <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center space-x-2 text-green-800">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">Selected: {uploadedFiles.farmer_image.name}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3 pt-4">
                        <Button 
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDocumentUpload()
                          }}
                          disabled={!uploadedFiles.farmer_proof_doc || isLoading}
                          className="flex-1"
                          type="button"
                        >
                          {isLoading ? "Uploading..." : "Submit Documents"}
                        </Button>
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {farmerProfile.documents ? (
                <div className="space-y-3">
                  {farmerProfile.documents.farmer_proof_doc_url && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Award className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">Farmer Proof Document</p>
                        <p className="text-sm text-muted-foreground">ID proof, license, or certification</p>
                      </div>
                      <Badge variant={farmerProfile.documents.is_doc_verified ? "default" : "secondary"}>
                        {farmerProfile.documents.is_doc_verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  )}
                  {farmerProfile.documents.farm_image_url && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Camera className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">Farm Image</p>
                        <p className="text-sm text-muted-foreground">Farm photo uploaded</p>
                      </div>
                    </div>
                  )}
                  {farmerProfile.documents.farmer_image_url && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Camera className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">Farmer Photo</p>
                        <p className="text-sm text-muted-foreground">Your photo uploaded</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                !showDocumentUpload && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No documents uploaded yet</p>
                  </div>
                )
              )}
            </CardContent>
          </Card>

          {/* Location Update */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Farm Location</CardTitle>
                  <CardDescription>Your farm's geographical location</CardDescription>
                </div>
                <Button 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log("Location update button clicked, current state:", showLocationUpdate)
                    setShowLocationUpdate(!showLocationUpdate)
                    console.log("Location update state changed to:", !showLocationUpdate)
                  }}
                  variant="outline"
                  size="sm"
                  type="button"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {showLocationUpdate ? "Cancel" : "Update Location"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showLocationUpdate && (
                <Alert className="border-blue-200 bg-blue-50">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <div className="space-y-4">
                      <p>Update your farm location using GPS or map selection:</p>
                      <LocationPicker 
                        onLocationSelect={handleLocationSelect}
                        initialLocation={farmerProfile.coordinates.latitude && farmerProfile.coordinates.longitude ? farmerProfile.coordinates : null}
                      />
                      <div className="flex gap-3 pt-4">
                        <Button 
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleLocationUpdate()
                          }}
                          disabled={!newLocation || isLoading}
                          className="flex-1"
                          type="button"
                        >
                          {isLoading ? "Updating..." : "Update Location"}
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Current Location</Label>
                <div className="p-3 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Coordinates</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Latitude: {farmerProfile.coordinates.latitude || "Not set"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Longitude: {farmerProfile.coordinates.longitude || "Not set"}
                  </p>
                  {farmerProfile.coordinates.latitude && farmerProfile.coordinates.longitude && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Delivery Radius: {farmerProfile.deliveryRadius} km
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
