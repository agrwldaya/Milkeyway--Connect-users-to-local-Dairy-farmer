"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Star, Heart, Phone, Mail, Award, Truck, ShoppingCart, ChevronLeft } from "lucide-react"
import { ConsumerNav } from "@/components/consumer-nav"

export default function FarmerProfilePage() {
  const farmer = {
    id: 1,
    name: "Green Valley Farm",
    owner: "Ramesh Patel",
    location: "Andheri West, Mumbai",
    distance: "2.5 km",
    rating: 4.8,
    reviews: 124,
    image: "/dairy-farm-green-fields-cows.jpg",
    coverImage: "/dairy-farm-landscape.jpg",
    verified: true,
    phone: "+91 98765 43210",
    email: "ramesh@greenvalley.com",
    description:
      "Green Valley Farm is a family-owned organic dairy farm established in 2010. We pride ourselves on maintaining the highest standards of animal welfare and producing the freshest, most nutritious dairy products. Our cows are grass-fed and raised in natural, stress-free conditions.",
    certifications: ["Organic Certified", "FSSAI Licensed", "Animal Welfare Approved"],
    deliveryInfo: "Daily delivery between 6 AM - 9 AM. Free delivery within 5 km.",
  }

  const products = [
    {
      id: 1,
      name: "Fresh Cow Milk",
      price: 60,
      unit: "L",
      rating: 4.8,
      image: "/fresh-cow-milk-bottle.jpg",
      inStock: true,
    },
    {
      id: 2,
      name: "Buffalo Milk",
      price: 75,
      unit: "L",
      rating: 4.9,
      image: "/buffalo-milk-bottle.jpg",
      inStock: true,
    },
    {
      id: 3,
      name: "Pure Desi Ghee",
      price: 550,
      unit: "kg",
      rating: 4.9,
      image: "/pure-desi-ghee-jar.jpg",
      inStock: true,
    },
    {
      id: 4,
      name: "Fresh Curd",
      price: 70,
      unit: "kg",
      rating: 4.7,
      image: "/thick-curd-bowl.jpg",
      inStock: true,
    },
  ]

  const reviews = [
    {
      name: "Priya Sharma",
      rating: 5,
      date: "2 days ago",
      comment: "Excellent quality products! Very fresh and the delivery is always on time.",
    },
    {
      name: "Amit Patel",
      rating: 5,
      date: "1 week ago",
      comment: "Best dairy farm in the area. Ramesh is very professional and the products are top-notch.",
    },
    {
      name: "Sneha Reddy",
      rating: 4,
      date: "2 weeks ago",
      comment: "Good quality milk. My family loves it. Highly recommended!",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsumerNav />

      <main className="container py-8">
        <Link href="/consumer/farmers">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Farmers
          </Button>
        </Link>

        {/* Cover Image */}
        <div className="relative h-64 rounded-2xl overflow-hidden mb-8 bg-gray-100">
          <img src={farmer.coverImage || "/placeholder.svg"} alt={farmer.name} className="h-full w-full object-cover" />
        </div>

        {/* Farmer Info */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Card className="bg-white">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-4xl font-bold">{farmer.name}</h1>
                      {farmer.verified && <Badge className="bg-primary text-primary-foreground">✓ Verified</Badge>}
                    </div>
                    <p className="text-lg text-muted-foreground mb-4">by {farmer.owner}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <span>{farmer.location}</span>
                        <span className="text-muted-foreground">({farmer.distance})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{farmer.rating}</span>
                        <span className="text-muted-foreground">({farmer.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="icon" className="rounded-full bg-transparent">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>

                <Separator className="my-6" />

                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-3">About the Farm</h2>
                  <p className="text-muted-foreground leading-relaxed">{farmer.description}</p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  {farmer.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Award className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{cert}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 mb-1">Delivery Information</p>
                    <p className="text-sm text-blue-700">{farmer.deliveryInfo}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Card */}
          <div>
            <Card className="bg-white sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">Contact Information</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{farmer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{farmer.email}</p>
                    </div>
                  </div>
                </div>

                <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
                  <Phone className="h-5 w-5 mr-2" />
                  Call Farmer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Products and Reviews Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow bg-white">
                  <Link href={`/consumer/product/${product.id}`}>
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  <CardContent className="p-5">
                    <Link href={`/consumer/product/${product.id}`}>
                      <h3 className="font-semibold text-lg mb-3 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>

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
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="bg-white">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {reviews.map((review, index) => (
                    <div key={index} className="pb-6 border-b last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold mb-1">{review.name}</p>
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
