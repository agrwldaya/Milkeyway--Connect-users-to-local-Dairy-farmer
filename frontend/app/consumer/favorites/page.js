"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ShoppingCart, Heart, MapPin } from "lucide-react"
import { ConsumerNav } from "@/components/consumer-nav"

export default function FavoritesPage() {
  const favorites = [
    {
      id: 1,
      name: "Fresh Cow Milk",
      farmer: "Green Valley Farm",
      location: "Andheri, Mumbai",
      price: 60,
      unit: "L",
      rating: 4.8,
      image: "/fresh-cow-milk-bottle.jpg",
      inStock: true,
    },
    {
      id: 2,
      name: "Pure Desi Ghee",
      farmer: "Sunrise Dairy",
      location: "Bandra, Mumbai",
      price: 550,
      unit: "kg",
      rating: 4.9,
      image: "/pure-desi-ghee-jar.jpg",
      inStock: true,
    },
    {
      id: 3,
      name: "Homemade Paneer",
      farmer: "Happy Cows Farm",
      location: "Powai, Mumbai",
      price: 350,
      unit: "kg",
      rating: 4.7,
      image: "/fresh-paneer-cubes.png",
      inStock: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsumerNav />

      <main className="container py-8 px-5">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Favorites</h1>
          <p className="text-muted-foreground">{favorites.length} products saved</p>
        </div>

        {favorites.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="mb-6 flex justify-center">
              <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                <Heart className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6">Start adding products to your favorites</p>
            <Link href="/consumer/browse">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((product) => (
              <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-all bg-white">
                <Link href={`/consumer/product/${product.id}`}>
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Button size="icon" variant="secondary" className="absolute top-4 right-4 rounded-full">
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    </Button>
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
                    </div>
                  </div>

                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
