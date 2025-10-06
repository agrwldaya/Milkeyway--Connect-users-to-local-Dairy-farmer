"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, ShoppingCart, Heart, MapPin, Truck, Shield, Award, ChevronLeft, Minus, Plus } from "lucide-react"
import { ConsumerNav } from "@/components/consumer-nav"

export default function ProductDetailPage() {
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)

  const product = {
    id: 1,
    name: "Fresh Cow Milk",
    farmer: "Green Valley Farm",
    farmerImage: "/farmer-portrait.jpg",
    location: "Andheri, Mumbai",
    distance: "2.5 km",
    price: 60,
    unit: "L",
    rating: 4.8,
    reviews: 124,
    image: "/fresh-cow-milk-bottle.jpg",
    images: ["/fresh-cow-milk-bottle.jpg", "/dairy-farm-green-fields-cows.jpg", "/fresh-milk-pouring.jpg"],
    inStock: true,
    description:
      "Fresh, pure cow milk delivered daily from our farm. Our cows are grass-fed and raised in natural conditions. No hormones or antibiotics used. Rich in nutrients and perfect for your family's health.",
    features: [
      "100% Pure & Natural",
      "No Preservatives",
      "Farm Fresh Daily",
      "Grass-Fed Cows",
      "Rich in Calcium & Protein",
    ],
    nutritionPer100ml: {
      calories: 61,
      protein: "3.2g",
      fat: "3.4g",
      carbs: "4.8g",
      calcium: "120mg",
    },
  }

  const reviews = [
    {
      name: "Priya Sharma",
      rating: 5,
      date: "2 days ago",
      comment: "Excellent quality milk! My kids love it. Very fresh and creamy.",
      verified: true,
    },
    {
      name: "Amit Patel",
      rating: 5,
      date: "1 week ago",
      comment: "Best milk I've had in Mumbai. Tastes just like village milk. Highly recommended!",
      verified: true,
    },
    {
      name: "Sneha Reddy",
      rating: 4,
      date: "2 weeks ago",
      comment: "Good quality milk. Delivery is always on time. Would be perfect if packaging was better.",
      verified: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsumerNav />

      <main className="container py-8">
        {/* Back Button */}
        <Link href="/consumer/browse">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white mb-4">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 rounded-full"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((img, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-xl overflow-hidden bg-white cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-2xl p-8">
              <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-100">In Stock</Badge>

              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviews} reviews)</span>
                </div>
              </div>

              <div className="text-4xl font-bold text-primary mb-6">
                ₹{product.price}/{product.unit}
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Quantity</label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-muted-foreground ml-2">{product.unit}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <Button size="lg" className="flex-1 bg-primary hover:bg-primary/90 h-14 text-base">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button size="lg" variant="outline" className="h-14 bg-transparent">
                  Buy Now
                </Button>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-primary" />
                  <span>Free delivery within {product.distance}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>100% Quality Guaranteed</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Award className="h-5 w-5 text-primary" />
                  <span>Certified Organic Farm</span>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Farmer Info */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={product.farmerImage || "/placeholder.svg"}
                    alt={product.farmer}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Sold by</p>
                  <p className="font-semibold text-lg">{product.farmer}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{product.location}</span>
                  </div>
                </div>
                <Link href={`/consumer/farmer/${product.id}`}>
                  <Button variant="outline">View Farm</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <Card className="bg-white">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Nutrition (per 100ml)</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Calories</span>
                  <span className="font-medium">{product.nutritionPer100ml.calories} kcal</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Protein</span>
                  <span className="font-medium">{product.nutritionPer100ml.protein}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fat</span>
                  <span className="font-medium">{product.nutritionPer100ml.fat}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Carbohydrates</span>
                  <span className="font-medium">{product.nutritionPer100ml.carbs}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Calcium</span>
                  <span className="font-medium">{product.nutritionPer100ml.calcium}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Delivery Info</h3>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">Daily delivery available between 6 AM - 9 AM</p>
                <p className="text-muted-foreground">Free delivery for orders above ₹200</p>
                <p className="text-muted-foreground">Subscription plans available with discounts</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

          <div className="space-y-6">
            {reviews.map((review, index) => (
              <div key={index} className="pb-6 border-b last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{review.name}</p>
                      {review.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>

          <Button variant="outline" className="mt-6 bg-transparent">
            View All Reviews
          </Button>
        </div>
      </main>
    </div>
  )
}
