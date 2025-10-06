"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Camera, Award, MapPin, Phone, Mail } from "lucide-react"
import { FarmerNav } from "@/components/farmer-nav"


export default function ProfilePage() {
  const [coverImage, setCoverImage] = useState("/dairy-farm-landscape.jpg")
  const [profileImage, setProfileImage] = useState("/farmer-portrait.png")
  const [farmImages, setFarmImages] = useState([
    "/dairy-cows-grazing.jpg",
    "/milk-collection.jpg",
    "/vintage-farm-equipment.png",
  ])

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverImage(URL.createObjectURL(file))
    }
  }

  const handleProfileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(URL.createObjectURL(file))
    }
  }

  const handleFarmImageUpload = (e) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setFarmImages([...farmImages, ...newImages])
    }
  }

  const removeFarmImage = (index) => {
    setFarmImages(farmImages.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-background">
      <FarmerNav />

      <main className="container py-8  px-5 ">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">Farm Profile</h1>
          <p className="text-muted-foreground">Manage your farm information and showcase your products</p>
        </div>

        <form className="space-y-6">
          {/* Cover & Profile Image */}
          <Card>
            <CardContent className="p-0">
              <div className="relative h-48 md:h-64 bg-muted">
                <img src={coverImage || "/placeholder.svg"} alt="Farm cover" className="w-full h-full object-cover" />
                <label className="absolute bottom-4 right-4 cursor-pointer">
                  <Button type="button" size="sm" className="pointer-events-none">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Cover
                  </Button>
                  <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />
                </label>
              </div>
              <div className="px-6 pb-6">
                <div className="flex flex-col md:flex-row gap-6 -mt-16 md:-mt-20">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full border-4 border-background overflow-hidden bg-muted">
                      <img
                        src={profileImage || "/placeholder.svg"}
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
                        <h2 className="text-2xl font-bold">Ramesh Dairy Farm</h2>
                        <p className="text-muted-foreground">Member since January 2024</p>
                      </div>
                      <Badge className="w-fit">Verified Farmer</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your farm's basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="farmName">Farm Name *</Label>
                <Input id="farmName" defaultValue="Ramesh Dairy Farm" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input id="ownerName" defaultValue="Ramesh Kumar Patel" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" defaultValue="+91 98765 43210" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" defaultValue="ramesh@example.com" className="pl-10" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Farm Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    defaultValue="Village Khandala, Taluka Maval, District Pune, Maharashtra - 410301"
                    className="pl-10"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Farm Description</Label>
                <Textarea
                  id="description"
                  defaultValue="We are a family-run dairy farm with over 20 years of experience. Our cows are grass-fed and we follow traditional methods to produce high-quality dairy products."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Farm Details */}
          <Card>
            <CardHeader>
              <CardTitle>Farm Details</CardTitle>
              <CardDescription>Provide details about your farm operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="established">Established Year</Label>
                  <Input id="established" type="number" defaultValue="2004" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="farmSize">Farm Size (in acres)</Label>
                  <Input id="farmSize" type="number" defaultValue="5" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cattle">Number of Cattle</Label>
                  <Input id="cattle" type="number" defaultValue="15" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyProduction">Daily Milk Production (Liters)</Label>
                  <Input id="dailyProduction" type="number" defaultValue="80" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input id="specialization" defaultValue="A2 Cow Milk, Organic Ghee" />
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Certifications & Awards</CardTitle>
              <CardDescription>Add your certifications and recognitions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Award className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">FSSAI License</p>
                    <p className="text-sm text-muted-foreground">License No: 12345678901234</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Award className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">Organic Certification</p>
                    <p className="text-sm text-muted-foreground">Certified by NPOP</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button type="button" variant="outline" className="w-full bg-transparent">
                <Upload className="h-4 w-4 mr-2" />
                Add Certification
              </Button>
            </CardContent>
          </Card>

          {/* Farm Images */}
          <Card>
            <CardHeader>
              <CardTitle>Farm Gallery</CardTitle>
              <CardDescription>Showcase your farm with photos (Max 10 images)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {farmImages.map((image, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Farm ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => removeFarmImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {farmImages.length < 10 && (
                  <label className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground text-center px-2">Add Photo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFarmImageUpload} multiple />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button type="button" variant="outline" className="w-full sm:w-auto bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              Save Changes
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
