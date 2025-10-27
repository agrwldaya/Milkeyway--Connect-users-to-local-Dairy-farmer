"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, ShoppingCart, SlidersHorizontal, MapPin, Map } from "lucide-react"
import { ConsumerNav } from "@/components/consumer-nav"
import ConsumerMapPicker from "@/components/ConsumerMapPicker"
import { api } from "@/lib/utils"

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [location, setLocation] = useState(null)
  const [showMapView, setShowMapView] = useState(false)
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])

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

  // Handle location change from map
  const handleLocationChange = (newLocation) => {
    setLocation(newLocation)
    // You can add logic here to fetch farmers based on location
  }

  // Handle farmer selection from map
  const handleFarmerSelect = (farmer) => {
    // Navigate to farmer details page
    window.location.href = `/consumer/farmer/${farmer.id}`
  }

  const products = [
    {
      id: 1,
      name: "Fresh Cow Milk",
      farmer: "Green Valley Farm",
      location: "Andheri, Mumbai",
      price: 60,
      unit: "L",
      rating: 4.8,
      reviews: 124,
      image: "/fresh-cow-milk-bottle.jpg",
      inStock: true,
      category: "milk",
    },
    {
      id: 2,
      name: "Pure Desi Ghee",
      farmer: "Sunrise Dairy",
      location: "Bandra, Mumbai",
      price: 550,
      unit: "kg",
      rating: 4.9,
      reviews: 98,
      image: "/pure-desi-ghee-jar.jpg",
      inStock: true,
      category: "ghee",
    },
    {
      id: 3,
      name: "Homemade Paneer",
      farmer: "Happy Cows Farm",
      location: "Powai, Mumbai",
      price: 350,
      unit: "kg",
      rating: 4.7,
      reviews: 156,
      image: "/fresh-paneer-cubes.png",
      inStock: true,
      category: "paneer",
    },
    {
      id: 4,
      name: "Thick Curd",
      farmer: "Organic Dairy",
      location: "Goregaon, Mumbai",
      price: 70,
      unit: "kg",
      rating: 4.6,
      reviews: 89,
      image: "/thick-curd-bowl.jpg",
      inStock: true,
      category: "curd",
    },
    {
      id: 5,
      name: "Fresh Buffalo Milk",
      farmer: "Green Valley Farm",
      location: "Andheri, Mumbai",
      price: 75,
      unit: "L",
      rating: 4.9,
      reviews: 142,
      image: "/buffalo-milk-bottle.jpg",
      inStock: true,
      category: "milk",
    },
    {
      id: 6,
      name: "White Butter",
      farmer: "Sunrise Dairy",
      location: "Bandra, Mumbai",
      price: 450,
      unit: "kg",
      rating: 4.8,
      reviews: 76,
      image: "/white-butter-bowl.jpg",
      inStock: false,
      category: "butter",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsumerNav />

      <main className="container py-8 px-5">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Products</h1>
          <p className="text-muted-foreground">Discover fresh dairy products from local farmers</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 h-12 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px] h-12 bg-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="milk">Milk</SelectItem>
              <SelectItem value="ghee">Ghee</SelectItem>
              <SelectItem value="paneer">Paneer</SelectItem>
              <SelectItem value="curd">Curd</SelectItem>
              <SelectItem value="butter">Butter</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant={showMapView ? "default" : "outline"} 
            size="lg"
            onClick={() => setShowMapView(!showMapView)}
            className="bg-white w-full sm:w-auto"
          >
            <Map className="h-5 w-5 mr-2" />
            {showMapView ? "List View" : "Map View"}
          </Button>
          <Button variant="outline" size="lg" className="bg-white w-full sm:w-auto">
            <SlidersHorizontal className="h-5 w-5 mr-2" />
            Filters
          </Button>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">Showing {products.length} products</p>
        </div>

        {/* Map View */}
        {showMapView && (
          <div className="mb-8">
            <ConsumerMapPicker
              onFarmerSelect={handleFarmerSelect}
              initialLocation={location}
              farmers={farmers}
              categories={categories}
              onLocationChange={handleLocationChange}
              loading={loading}
            />
          </div>
        )}

        {/* List View */}
        {!showMapView && (
          <>
            {/* Products Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-all bg-white">
              <Link href={`/consumer/product/${product.id}`}>
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary" className="text-sm">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                </div>
              </Link>
              <CardContent className="p-5">
                <Link href={`/consumer/product/${product.id}`}>
                  <h3 className="font-semibold text-lg mb-1 hover:text-primary transition-colors">{product.name}</h3>
                </Link>
                <p className="text-sm text-muted-foreground mb-1">{product.farmer}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <MapPin className="h-3 w-3" />
                  <span>{product.location}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-primary">
                    ₹{product.price}/{product.unit}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-xs text-muted-foreground">({product.reviews})</span>
                  </div>
                </div>

                <Button size="sm" className="w-full bg-primary hover:bg-primary/90" disabled={!product.inStock}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
          </>
        )}
      </main>
    </div>
  )
}
