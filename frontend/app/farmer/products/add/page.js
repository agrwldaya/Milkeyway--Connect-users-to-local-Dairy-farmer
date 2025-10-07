"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, X } from "lucide-react"
import { FarmerNav } from "@/components/farmer-nav"
import Link from "next/link"

export default function AddProductPage() {
  const [images, setImages] = useState([])

  const handleImageUpload = (e) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
      setImages([...images, ...newImages])
    }
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-background">
      <FarmerNav />

      <main className="container py-8 px-5 ">
        <div className="mb-8">
          <Link href="/farmer/products">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <h1 className="text-4xl font-serif font-bold mb-2">Add New Product</h1>
          <p className="text-muted-foreground">Fill in the details to list your product</p>
        </div>

        <form className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details of your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" placeholder="e.g., Fresh Cow Milk" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="milk">Milk</SelectItem>
                      <SelectItem value="ghee">Ghee</SelectItem>
                      <SelectItem value="paneer">Paneer</SelectItem>
                      <SelectItem value="curd">Curd</SelectItem>
                      <SelectItem value="butter">Butter</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select>
                    <SelectTrigger id="unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="liter">Liter</SelectItem>
                      <SelectItem value="kg">Kilogram</SelectItem>
                      <SelectItem value="gram">Gram</SelectItem>
                      <SelectItem value="piece">Piece</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product, its quality, and what makes it special..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
              <CardDescription>Set your pricing and stock information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Unit (₹) *</Label>
                  <Input id="price" type="number" placeholder="0.00" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Available Stock *</Label>
                  <Input id="stock" type="number" placeholder="0" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minOrder">Minimum Order Quantity</Label>
                  <Input id="minOrder" type="number" placeholder="1" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxOrder">Maximum Order Quantity</Label>
                  <Input id="maxOrder" type="number" placeholder="100" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>Upload clear images of your product (Max 5 images)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground text-center px-2">Upload Image</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} multiple />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
              <CardDescription>Optional information about your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications (if any)</Label>
                <Input id="certifications" placeholder="e.g., Organic, FSSAI certified" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shelfLife">Shelf Life</Label>
                <Input id="shelfLife" placeholder="e.g., 2 days, 1 week" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage">Storage Instructions</Label>
                <Textarea id="storage" placeholder="How should customers store this product?" rows={3} />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link href="/farmer/products">
              <Button type="button" variant="outline" className="w-full sm:w-auto bg-transparent">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              Add Product
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
