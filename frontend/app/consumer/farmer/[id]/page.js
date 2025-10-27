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
  const [formErrors, setFormErrors] = useState({})

  // Reset form when dialog closes
  const handleDialogClose = (open) => {
    setRequestDialogOpen(open)
    if (!open) {
      // Reset form and errors when dialog closes
      setRequestForm({
        message: '',
        contactMethod: 'phone',
        preferredTime: '',
        quantity: '',
        productInterest: ''
      })
      setFormErrors({})
    }
  }

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
          console.log("Farmer data:", data.farmer)
          // Check connection status after fetching farmer details
          if(data.farmer.existingConnectionStatus === 'accepted'){
            setConnectionStatus('connected')
            setIsConnected(true)
          } else {
            setConnectionStatus('not_connected')
            setIsConnected(false)
          }
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
  
  // Form validation
  const validateForm = () => {
    const errors = {}
    
    if (!requestForm.productInterest.trim()) {
      errors.productInterest = 'Please specify the products you are interested in'
    }
    
    if (!requestForm.quantity.trim()) {
      errors.quantity = 'Please specify the quantity you need'
    }
    
    if (requestForm.productInterest.trim().length < 3) {
      errors.productInterest = 'Product interest must be at least 3 characters'
    }
    
    if (requestForm.quantity.trim().length < 2) {
      errors.quantity = 'Please provide a more specific quantity'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle request submission
  const handleRequestSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fix the form errors", {
        description: "Check the highlighted fields and try again.",
        duration: 4000,
      })
      return
    }
    
    setRequestLoading(true)
    setFormErrors({}) // Clear any previous errors
    
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
        setFormErrors({}) // Clear any form errors
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
    <div className="min-h-screen bg-gray-50 px-2">
      <ConsumerNav />

      <main className="container py-8">
        <Link href="/consumer/farmers">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Farmers
          </Button>
        </Link>


        {/* Hero Section with Farm and Farmer */}
        <div className="relative mb-8 sm:mb-12">
          {/* Farm Background Image */}
          <div className="relative h-64 sm:h-80 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-green-50 to-blue-50">
            <img 
              src={farmer.image || "/farm_cover.jpg"} 
              alt={`${farmer.name} Farm`} 
              className="h-full w-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Farm Label */}
            <div className="absolute top-3 left-3 sm:top-6 sm:left-6">
              <div className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                🏡 Farm Location
              </div>
            </div>
            
            {/* Farmer Profile Card Overlay */}
            <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 left-3 sm:left-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-2xl border border-white/20 max-w-full sm:max-w-sm">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Farmer Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-green-100 border-2 sm:border-4 border-white shadow-lg">
                      <img 
                        src={farmer.coverImage || "/farmer.jpg"} 
                        alt={`${farmer.owner} - Farmer`} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    {/* Online Status Indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Farmer Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-0.5 sm:mb-1 truncate">{farmer.owner}</h2>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Farm Owner & Operator</p>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`h-3 w-3 sm:h-4 sm:w-4 ${
                              i < Math.floor(farmer.rating || 4.5) 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-gray-300"
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">
                        {farmer.rating?.toFixed(1) || '4.5'}
                      </span>
                      <span className="text-xs text-gray-500 hidden sm:inline">
                        ({farmer.reviews || 0} reviews)
                      </span>
                    </div>
                    
                    {/* Verification Badge */}
                    {farmer.verified && (
                      <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                        <CheckCircle className="h-3 w-3" />
                        <span className="hidden sm:inline">Verified Farmer</span>
                        <span className="sm:hidden">Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Farmer Information Section */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8">
                  <div className="flex-1 mb-4 sm:mb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {farmer.name}
                      </h1>
                      {farmer.verified && (
                        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold self-start">
                          <CheckCircle className="h-4 w-4" />
                          Verified
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                        <span className="font-medium text-sm sm:text-base">{farmer.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i}
                              className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                i < Math.floor(farmer.rating || 4.5) 
                                  ? "fill-yellow-400 text-yellow-400" 
                                  : "text-gray-300"
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="font-bold text-base sm:text-lg text-gray-800">
                          {farmer.rating?.toFixed(1) || '4.5'}
                        </span>
                        <span className="text-gray-500 text-sm">
                          ({farmer.reviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-red-50 hover:border-red-200 transition-all duration-200 self-start sm:self-auto">
                    <Heart className="h-5 w-5 text-gray-600 hover:text-red-500" />
                  </Button>
                </div>

                <Separator className="my-6 sm:my-8 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

                {/* About Section */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">About the Farm</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                    {farmer.description || "This farmer provides fresh dairy products with a focus on quality and sustainability. Our farm is committed to ethical farming practices and delivering the freshest products directly to your doorstep."}
                  </p>
                </div>

                {/* Certifications & Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">FSSAI Licensed</p>
                      <p className="text-xs text-green-700">Certified Quality</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900">Quality Assured</p>
                      <p className="text-xs text-blue-700">Premium Products</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-orange-900">Fresh Daily</p>
                      <p className="text-xs text-orange-700">Farm to Table</p>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900 text-base sm:text-lg mb-2">Delivery Information</h3>
                      <p className="text-blue-800 leading-relaxed text-sm sm:text-base">
                        {farmer.deliveryRadius 
                          ? `🚚 Delivery available within ${farmer.deliveryRadius}km radius. Contact farmer for timing and details.`
                          : '📞 Contact farmer directly for delivery details and timing.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Card */}
          <div className="mt-6 lg:mt-0">
            <Card className="bg-white sticky top-24 shadow-xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
                    {isConnected ? "Contact Information" : "Connect with Farmer"}
                  </h2>
                  <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-primary to-primary/60 rounded-full mx-auto"></div>
                </div>

                 {/* Connection Status */}
                 {connectionStatus === 'pending' && (
                   <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl sm:rounded-2xl">
                     <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                       <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                         <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                       </div>
                       <span className="font-semibold text-yellow-800 text-sm sm:text-base">Request Pending</span>
                     </div>
                     <p className="text-xs sm:text-sm text-yellow-700 leading-relaxed">
                       Your connection request is waiting for farmer approval. You'll be notified once they respond.
                     </p>
                   </div>
                 )}

                {connectionStatus === 'connected' && (
                  <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl sm:rounded-2xl">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <span className="font-semibold text-green-800 text-sm sm:text-base">Connected Successfully</span>
                    </div>
                    <p className="text-xs sm:text-sm text-green-700 leading-relaxed">
                      🎉 You are now connected! You can view contact details and communicate directly with the farmer.
                    </p>
                  </div>
                )}

                {/* Contact Details - Only show if connected */}
                {isConnected && (
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-blue-200">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-blue-600 font-medium">Phone Number</p>
                        <p className="font-bold text-blue-900 text-sm sm:text-lg truncate">{farmer.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl border border-green-200">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-green-600 font-medium">Email Address</p>
                        <p className="font-bold text-green-900 text-sm sm:text-lg truncate">{farmer.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Details Hidden Message */}
                {!isConnected && connectionStatus !== 'pending' && (
                  <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-xl sm:rounded-2xl">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <span className="font-semibold text-gray-800 text-sm sm:text-base">Contact Details Hidden</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      🔒 Send a connection request to view contact details and communicate directly with the farmer.
                    </p>
                  </div>
                )}

                 <div className="space-y-3">
                   {/* Show contact buttons only if connected */}
                   {isConnected && (
                     <>
                       <Button size="lg" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base">
                         <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                         Call Farmer
                       </Button>
                       <Button size="lg" variant="outline" className="w-full border-2 border-green-200 text-green-700 hover:bg-green-50 font-semibold py-3 rounded-xl sm:rounded-2xl transition-all duration-200 text-sm sm:text-base">
                         <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                         Send Email
                       </Button>
                     </>
                   )}
                   
                   {/* Show status button if request is pending */}
                   {!isConnected && connectionStatus === 'pending' && (
                     <Button size="lg" className="w-full bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-300 cursor-not-allowed font-semibold py-3 rounded-xl sm:rounded-2xl text-sm sm:text-base" disabled>
                       <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                       Request Pending
                     </Button>
                   )}
                   
                   {/* Show request button only if not connected and not pending */}
                   {!isConnected && connectionStatus !== 'pending' && (
                     <Dialog open={requestDialogOpen} onOpenChange={handleDialogClose}>
                       <DialogTrigger asChild>
                         <Button size="lg" className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold py-3 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base">
                           <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                           Send Connection Request
                         </Button>
                       </DialogTrigger>
                    <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
                      <DialogHeader className="pb-3 sm:pb-4">
                        <DialogTitle className="text-lg sm:text-xl font-bold text-center">Connect with {farmer.name}</DialogTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground text-center">
                          Send a connection request to start communicating with this farmer
                        </p>
                      </DialogHeader>
                      
                      <form onSubmit={handleRequestSubmit} className="space-y-4 sm:space-y-6">
                        {/* Product Interest */}
                        <div className="space-y-2">
                          <Label htmlFor="productInterest" className="text-sm font-medium">
                            Products You're Interested In <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="productInterest"
                            placeholder="e.g., Fresh milk, Ghee, Paneer, Curd"
                            value={requestForm.productInterest}
                            onChange={(e) => {
                              setRequestForm({...requestForm, productInterest: e.target.value})
                              // Clear error when user starts typing
                              if (formErrors.productInterest) {
                                setFormErrors({...formErrors, productInterest: ''})
                              }
                            }}
                            required
                            className={`h-11 ${formErrors.productInterest ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                          />
                          {formErrors.productInterest && (
                            <p className="text-sm text-red-500">{formErrors.productInterest}</p>
                          )}
                        </div>
                        
                        {/* Quantity */}
                        <div className="space-y-2">
                          <Label htmlFor="quantity" className="text-sm font-medium">
                            Quantity Needed <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="quantity"
                            placeholder="e.g., 2 liters daily, 1 kg weekly"
                            value={requestForm.quantity}
                            onChange={(e) => {
                              setRequestForm({...requestForm, quantity: e.target.value})
                              // Clear error when user starts typing
                              if (formErrors.quantity) {
                                setFormErrors({...formErrors, quantity: ''})
                              }
                            }}
                            required
                            className={`h-11 ${formErrors.quantity ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                          />
                          {formErrors.quantity && (
                            <p className="text-sm text-red-500">{formErrors.quantity}</p>
                          )}
                        </div>
                        
                        {/* Preferred Time */}
                        <div className="space-y-2">
                          <Label htmlFor="preferredTime" className="text-sm font-medium">
                            Preferred Delivery Time
                          </Label>
                          <select
                            id="preferredTime"
                            className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            value={requestForm.preferredTime}
                            onChange={(e) => setRequestForm({...requestForm, preferredTime: e.target.value})}
                          >
                            <option value="">Select preferred time</option>
                            <option value="morning">Morning (6 AM - 12 PM)</option>
                            <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
                            <option value="evening">Evening (6 PM - 10 PM)</option>
                            <option value="anytime">Anytime</option>
                          </select>
                        </div>
                        
                        {/* Contact Method */}
                        <div className="space-y-2">
                          <Label htmlFor="contactMethod" className="text-sm font-medium">
                            Preferred Contact Method
                          </Label>
                          <select
                            id="contactMethod"
                            className="w-full h-11 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            value={requestForm.contactMethod}
                            onChange={(e) => setRequestForm({...requestForm, contactMethod: e.target.value})}
                          >
                            <option value="phone">Phone Call</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="email">Email</option>
                          </select>
                        </div>
                        
                        {/* Additional Message */}
                        <div className="space-y-2">
                          <Label htmlFor="message" className="text-sm font-medium">
                            Additional Message
                          </Label>
                          <Textarea
                            id="message"
                            placeholder="Any specific requirements, questions, or special instructions..."
                            value={requestForm.message}
                            onChange={(e) => setRequestForm({...requestForm, message: e.target.value})}
                            rows={4}
                            className="resize-none"
                          />
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-3 sm:pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleDialogClose(false)}
                            className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={requestLoading}
                            className="flex-1 h-10 sm:h-11 bg-primary hover:bg-primary/90 text-sm sm:text-base"
                          >
                            {requestLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                <span className="hidden sm:inline">Sending Request...</span>
                                <span className="sm:hidden">Sending...</span>
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Send Connection Request</span>
                                <span className="sm:hidden">Send Request</span>
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
        <Tabs defaultValue="products" className="space-y-4 sm:space-y-6">
          <TabsList className="bg-white w-full sm:w-auto">
            <TabsTrigger value="products" className="flex-1 sm:flex-none text-sm sm:text-base">
              Products ({farmer.products?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1 sm:flex-none text-sm sm:text-base">
              Reviews ({reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {farmer.products && farmer.products.length > 0 ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {farmer.products.map((product) => (
                  <Card key={product.id} className="overflow-hidden rounded-xl sm:rounded-2xl group hover:shadow-lg transition-shadow bg-white">
                    <Link href={`/consumer/product/${product.id}`}>
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                    <CardContent className="p-3 sm:p-4 lg:p-5">
                      <Link href={`/consumer/product/${product.id}`}>
                        <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 hover:text-primary transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <span className="text-lg sm:text-xl font-bold text-primary">
                          ₹{product.price}/{product.unit}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs sm:text-sm font-medium">4.5</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                          {product.category} • {product.milkCategory}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Stock: {product.stock} {product.unit}
                        </p>
                      </div>

                      <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-xs sm:text-sm py-2 sm:py-2.5">
                        <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
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
            <Card className="bg-white rounded-xl sm:rounded-2xl">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-4 sm:space-y-6">
                  {reviews.map((review, index) => (
                    <div key={index} className="pb-4 sm:pb-6 border-b last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm sm:text-base mb-1">{review.name}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs sm:text-sm text-muted-foreground">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{review.comment}</p>
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
