"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Star, Heart, Phone, Mail, Award, Truck, ShoppingCart, ChevronLeft, Loader2, AlertCircle, MessageCircle, Send, CheckCircle } from "lucide-react"
import { ConsumerNav } from "@/components/consumer-nav"
import { toast } from "sonner"
import { api } from "@/lib/utils"

export default function FarmerProfilePage() {
  const params = useParams()
  const [farmer, setFarmer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('not_connected') // 'not_connected', 'pending', 'connected'
  const [requestForm, setRequestForm] = useState({
    message: '',
    contactMethod: 'phone',
    preferredTime: '',
    quantity: '',
    productInterest: ''
  })

  // Check connection status
   
  useEffect(() => {
    const fetchFarmerDetails = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/api/v1/consumers/farmer/${params.id}`)

        const data = await response.data

        console.log("Fetched farmer data:", data)
        
        if (data.success) {
          setFarmer(data.farmer)
          // Check connection status after fetching farmer details
          setConnectionStatus(data.farmer.existingConnectionStatus)
          setIsConnected(data.farmer.existingConnectionStatus === 'connected')
        } else {
          setError(data.message || "Failed to fetch farmer details")
        }
      } catch (err) {
        console.error("Error fetching farmer details:", err)
        setError("Failed to fetch farmer details")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchFarmerDetails()
    }
  }, [params.id])

  // Handle request submission
  const handleRequestSubmit = async (e) => {
    e.preventDefault()
    setRequestLoading(true)
    
    try {
      console.log("Sending request with data:", {
        farmerId: params.id,
        ...requestForm
      })
      
      const response = await fetch('http://localhost:4000/api/v1/connections/send-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          farmerId: params.id,
          ...requestForm
        })
      })
      
      console.log("Response status:", response.status)
      
      const data = await response.json()
      
      if (data.success) {
        // Show success toast
        toast.success("Request sent successfully!", {
          description: "The farmer will contact you soon.",
          duration: 4000,
        })
        
        setRequestSent(true)
        setRequestDialogOpen(false)
        setConnectionStatus('pending') // Update status to pending
        
        // Reset form
        setRequestForm({
          message: '',
          contactMethod: 'phone',
          preferredTime: '',
          quantity: '',
          productInterest: ''
        })
      } else {
        // Show error toast
        toast.error("Failed to send request", {
          description: data.message || 'Please try again later.',
          duration: 4000,
        })
      }
    } catch (err) {
      console.error('Error sending request:', err)
      // Show error toast
      toast.error("Network error", {
        description: 'Failed to send request. Please check your connection.',
        duration: 4000,
      })
    } finally {
      setRequestLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ConsumerNav />
        <main className="container py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading farmer details...</span>
          </div>
        </main>
      </div>
    )
  }

  if (error || !farmer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ConsumerNav />
        <main className="container py-8">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Farmer</h2>
            <p className="text-muted-foreground mb-4">{error || "Farmer not found"}</p>
            <Link href="/consumer/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </Card>
        </main>
      </div>
    )
  }

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
      comment: "Best dairy farm in the area. Very professional and the products are top-notch.",
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


        {/* Farm and Farmer Images */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Farm Image */}
          <div className="relative h-64 rounded-2xl overflow-hidden bg-gray-100">
            <img 
              src={farmer.image || "/farm_cover.jpg"} 
              alt={`${farmer.name} Farm`} 
              className="h-full w-full object-cover" 
            />
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
              Farm
            </div>
          </div>
          
          {/* Farmer Image */}
          <div className="relative h-64 rounded-2xl overflow-hidden bg-gray-100">
            <img 
              src={farmer.coverImage || "/farmer.jpg"} 
              alt={`${farmer.owner} - Farmer`} 
              className="h-full w-full object-cover" 
            />
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
              Farmer
            </div>
          </div>
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
                        <span>{farmer.address}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{farmer.rating?.toFixed(1) || '4.5'}</span>
                        <span className="text-muted-foreground">({farmer.reviews || 0} reviews)</span>
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
                  <p className="text-muted-foreground leading-relaxed">
                    {farmer.description || "This farmer provides fresh dairy products with a focus on quality and sustainability."}
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">FSSAI Licensed</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Quality Assured</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Fresh Daily</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 mb-1">Delivery Information</p>
                    <p className="text-sm text-blue-700">
                      {farmer.deliveryRadius 
                        ? `Delivery available within ${farmer.deliveryRadius}km radius. Contact farmer for timing and details.`
                        : 'Contact farmer directly for delivery details and timing.'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Card */}
          <div>
            <Card className="bg-white sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">
                  {isConnected ? "Contact Information" : "Connect with Farmer"}
                </h2>

                 {/* Connection Status */}
                 {connectionStatus === 'pending' && (
                   <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                     <div className="flex items-center gap-2 mb-2">
                       <AlertCircle className="h-4 w-4 text-yellow-600" />
                       <span className="font-medium text-yellow-800">Request does not accepted yet</span>
                     </div>
                     <p className="text-sm text-yellow-700">
                       Your connection request is waiting for farmer approval.
                     </p>
                   </div>
                 )}

                {connectionStatus === 'connected' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Connected</span>
                    </div>
                    <p className="text-sm text-green-700">
                      You are now connected! You can view contact details and communicate directly.
                    </p>
                  </div>
                )}

                {/* Contact Details - Only show if connected */}
                {isConnected && (
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
                )}

                {/* Contact Details Hidden Message */}
                {!isConnected && connectionStatus !== 'pending' && (
                  <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-gray-600" />
                      <span className="font-medium text-gray-800">Contact Details Hidden</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Send a connection request to view contact details and communicate directly with the farmer.
                    </p>
                  </div>
                )}

                 <div className="space-y-3">
                   {/* Show contact buttons only if connected */}
                   {isConnected && (
                     <>
                       <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
                         <Phone className="h-5 w-5 mr-2" />
                         Call Farmer
                       </Button>
                       <Button size="lg" variant="outline" className="w-full">
                         <Mail className="h-5 w-5 mr-2" />
                         Send Email
                       </Button>
                     </>
                   )}
                   
                   {/* Show status button if request is pending */}
                   {!isConnected && connectionStatus === 'pending' && (
                     <Button size="lg" className="w-full bg-yellow-100 text-yellow-800 border border-yellow-300 cursor-not-allowed" disabled>
                       <AlertCircle className="h-5 w-5 mr-2" />
                       Request does not accepted yet
                     </Button>
                   )}
                   
                   {/* Show request button only if not connected and not pending */}
                   {!isConnected && connectionStatus !== 'pending' && (
                     <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
                       <DialogTrigger asChild>
                         <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
                           <MessageCircle className="h-5 w-5 mr-2" />
                           Send Connection Request
                         </Button>
                       </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Send Request to {farmer.name}</DialogTitle>
                      </DialogHeader>
                      
                      <form onSubmit={handleRequestSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="productInterest">Product Interest</Label>
                          <Input
                            id="productInterest"
                            placeholder="e.g., Fresh milk, Ghee, Paneer"
                            value={requestForm.productInterest}
                            onChange={(e) => setRequestForm({...requestForm, productInterest: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="quantity">Quantity Needed</Label>
                          <Input
                            id="quantity"
                            placeholder="e.g., 2 liters, 1 kg"
                            value={requestForm.quantity}
                            onChange={(e) => setRequestForm({...requestForm, quantity: e.target.value})}
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="preferredTime">Preferred Time</Label>
                          <Input
                            id="preferredTime"
                            placeholder="e.g., Morning, Evening, Anytime"
                            value={requestForm.preferredTime}
                            onChange={(e) => setRequestForm({...requestForm, preferredTime: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="contactMethod">Preferred Contact Method</Label>
                          <select
                            id="contactMethod"
                            className="w-full p-2 border rounded-md"
                            value={requestForm.contactMethod}
                            onChange={(e) => setRequestForm({...requestForm, contactMethod: e.target.value})}
                          >
                            <option value="phone">Phone Call</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="email">Email</option>
                          </select>
                        </div>
                        
                        <div>
                          <Label htmlFor="message">Additional Message</Label>
                          <Textarea
                            id="message"
                            placeholder="Any specific requirements or questions..."
                            value={requestForm.message}
                            onChange={(e) => setRequestForm({...requestForm, message: e.target.value})}
                            rows={3}
                          />
                        </div>
                        
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setRequestDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={requestLoading}
                            className="flex-1"
                          >
                            {requestLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Send Request
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Products and Reviews Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="products">Products ({farmer.products?.length || 0})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {farmer.products && farmer.products.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {farmer.products.map((product) => (
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
                          <span className="text-sm font-medium">4.5</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-muted-foreground mb-1">
                          {product.category} • {product.milkCategory}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Stock: {product.stock} {product.unit}
                        </p>
                      </div>

                      <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <h3 className="text-lg font-semibold mb-2">No Products Available</h3>
                <p className="text-muted-foreground">This farmer hasn't added any products yet.</p>
              </Card>
            )}
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
