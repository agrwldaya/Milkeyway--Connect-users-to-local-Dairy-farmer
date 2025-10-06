"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Star, Heart, Filter } from "lucide-react"
import { ConsumerNav } from "@/components/consumer-nav"

export default function FarmersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const farmers = [
    {
      id: 1,
      name: "Green Valley Farm",
      owner: "Ramesh Patel",
      location: "Andheri, Mumbai",
      distance: "2.5 km",
      rating: 4.8,
      reviews: 124,
      products: 8,
      image: "/dairy-farm-green-fields-cows.jpg",
      verified: true,
      description: "Organic dairy farm with grass-fed cows. Specializing in fresh milk and ghee.",
    },
    {
      id: 2,
      name: "Sunrise Dairy",
      owner: "Lakshmi Iyer",
      location: "Bandra, Mumbai",
      distance: "3.2 km",
      rating: 4.9,
      reviews: 98,
      products: 12,
      image: "/traditional-dairy-farm-sunrise.jpg",
      verified: true,
      description: "Traditional dairy methods with modern hygiene standards. Wide variety of products.",
    },
    {
      id: 3,
      name: "Happy Cows Farm",
      owner: "Suresh Kumar",
      location: "Powai, Mumbai",
      distance: "4.1 km",
      rating: 4.7,
      reviews: 156,
      products: 10,
      image: "/happy-cows-grazing-farm.jpg",
      verified: true,
      description: "Family-owned farm focusing on animal welfare and quality dairy products.",
    },
    {
      id: 4,
      name: "Organic Dairy",
      owner: "Meera Desai",
      location: "Goregaon, Mumbai",
      distance: "5.3 km",
      rating: 4.6,
      reviews: 89,
      products: 7,
      image: "/organic-dairy-farm.jpg",
      verified: true,
      description: "100% organic certified farm. No chemicals or hormones used.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsumerNav />

      <main className="container py-8 px-5">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Local Farmers</h1>
          <p className="text-muted-foreground">Connect with trusted dairy farmers in your area</p>
        </div>

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
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            <MapPin className="h-5 w-5 mr-2" />
            Near Me
          </Button>
        </div>

        {/* Farmers Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {farmers.map((farmer) => (
            <Card key={farmer.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
              <div className="relative aspect-video overflow-hidden bg-gray-100">
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
                <h3 className="text-xl font-bold mb-1">{farmer.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">by {farmer.owner}</p>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{farmer.description}</p>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{farmer.distance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{farmer.rating}</span>
                    <span className="text-muted-foreground">({farmer.reviews})</span>
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
      </main>
    </div>
  )
}
