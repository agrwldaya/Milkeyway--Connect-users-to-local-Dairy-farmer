"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Star, ShoppingCart, Heart, Filter } from "lucide-react"
import { ConsumerNav } from "@/components/consumer-nav"

export default function ConsumerDashboard() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-background">
      <ConsumerNav />

      <main className="container py-8 px-5">
        {/* Hero Search Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-balance">Discover Fresh Dairy Near You</h1>
          <p className="text-lg text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Find authentic dairy products from trusted local farmers in your area
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for products or farmers..."
                  className="pl-10 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                <MapPin className="h-5 w-5 mr-2" />
                Near Me
              </Button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Milk", icon: "🥛", count: 45 },
              { name: "Ghee", icon: "🧈", count: 28 },
              { name: "Paneer", icon: "🧀", count: 32 },
              { name: "Curd", icon: "🥣", count: 38 },
              { name: "Butter", icon: "🧈", count: 24 },
              { name: "All Products", icon: "📦", count: 167 },
            ].map((category) => (
              <Card key={category.name} className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <p className="font-semibold mb-1">{category.name}</p>
                  <p className="text-xs text-muted-foreground">{category.count} products</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Farmers */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold">Farmers Near You</h2>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Green Valley Farm",
                owner: "Ramesh Patel",
                location: "Andheri, Mumbai",
                distance: "2.5 km",
                rating: 4.8,
                reviews: 124,
                products: 8,
                image: "/dairy-farm-green-fields-cows.jpg",
                verified: true,
              },
              {
                name: "Sunrise Dairy",
                owner: "Lakshmi Iyer",
                location: "Bandra, Mumbai",
                distance: "3.2 km",
                rating: 4.9,
                reviews: 98,
                products: 12,
                image: "/traditional-dairy-farm-sunrise.jpg",
                verified: true,
              },
              {
                name: "Happy Cows Farm",
                owner: "Suresh Kumar",
                location: "Powai, Mumbai",
                distance: "4.1 km",
                rating: 4.7,
                reviews: 156,
                products: 10,
                image: "/happy-cows-grazing-farm.jpg",
                verified: true,
              },
            ].map((farmer, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <img
                    src={farmer.image || "/placeholder.svg"}
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
                  <h3 className="font-serif text-xl font-bold mb-1">{farmer.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">by {farmer.owner}</p>

                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{farmer.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span>{farmer.rating}</span>
                      <span className="text-muted-foreground">({farmer.reviews})</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{farmer.products} products available</p>

                  <Link href={`/consumer/farmer/${index + 1}`}>
                    <Button className="w-full bg-primary hover:bg-primary/90">View Products</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Products */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold">Popular Products</h2>
            <Link href="/consumer/browse">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Fresh Cow Milk",
                farmer: "Green Valley Farm",
                price: "₹60/L",
                rating: 4.8,
                image: "/fresh-cow-milk-bottle.jpg",
                inStock: true,
              },
              {
                name: "Pure Desi Ghee",
                farmer: "Sunrise Dairy",
                price: "₹550/kg",
                rating: 4.9,
                image: "/pure-desi-ghee-jar.jpg",
                inStock: true,
              },
              {
                name: "Homemade Paneer",
                farmer: "Happy Cows Farm",
                price: "₹350/kg",
                rating: 4.7,
                image: "/fresh-paneer-cubes.png",
                inStock: true,
              },
              {
                name: "Thick Curd",
                farmer: "Organic Dairy",
                price: "₹70/kg",
                rating: 4.6,
                image: "/thick-curd-bowl.jpg",
                inStock: false,
              },
            ].map((product, index) => (
              <Card key={index} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary">Out of Stock</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{product.farmer}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">{product.price}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="text-sm">{product.rating}</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-3 bg-primary hover:bg-primary/90" disabled={!product.inStock}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
