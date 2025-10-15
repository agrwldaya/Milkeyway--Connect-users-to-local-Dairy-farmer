import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Milk, MapPin, Truck, Shield, Award, Users, TrendingUp, CheckCircle, ArrowRight, Heart, Clock, Zap } from "lucide-react"
 
export default function LandingPage() {
  
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto flex h-16 sm:h-20 items-center justify-between px-3 sm:px-4">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 px-1 group">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Milk className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
          </div>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Milkeyway
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="#products" className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 relative group">
              Products
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-200"></span>
            </Link>
            <Link href="#features" className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-200"></span>
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 relative group">
              Reviews
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-200"></span>
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 text-sm px-3 sm:px-4">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full px-4 sm:px-6 text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"></div>
        <div className="absolute inset-0 bg-[url('/hero_img.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-transparent"></div>
        
        <div className="relative z-10 container mx-auto px-3 sm:px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
                <div className="space-y-3 sm:space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium">
                    <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                    Fresh from Farm to Table
              </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                    Connect with
                    <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      Local Farmers
                    </span>
                </h1>
                  <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    Discover nearby dairy farmers, browse fresh products, and order directly from local farms. 
                    Support local agriculture while getting the freshest dairy products delivered to your doorstep.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                  <Link href="/auth/signup">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group w-full sm:w-auto"
                    >
                      Start Shopping
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-full px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                    >
                      Join as Farmer
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8 pt-4 justify-center lg:justify-start">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    <span className="text-xs sm:text-sm text-gray-600">10,000+ Active Users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    <span className="text-xs sm:text-sm text-gray-600">500+ Local Farmers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    <span className="text-xs sm:text-sm text-gray-600">4.9/5 Rating</span>
                  </div>
                </div>
              </div>
              
              <div className="relative mt-8 lg:mt-0">
                <div className="relative z-10 bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
                  <img
                    src="/hero_img.jpg"
                    alt="Fresh dairy farm"
                    className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white">
                    <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Fresh Daily Delivery</h3>
                    <p className="text-xs sm:text-sm opacity-90">From our farms to your doorstep</p>
                  </div>
                </div>
                
                <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 border border-gray-100">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-8 w-8 sm:h-12 sm:w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Truck className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-xs sm:text-sm">Fast Delivery</p>
                      <p className="text-xs text-gray-600">Within 2 hours</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 border border-gray-100">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-8 w-8 sm:h-12 sm:w-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-xs sm:text-sm">Quality Assured</p>
                      <p className="text-xs text-gray-600">100% Natural</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-12 sm:py-16 md:py-20 lg:py-32 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              Simple Process
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              How <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Milkeyway</span> Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Simple steps to connect with local farmers and get fresh dairy products delivered to your doorstep
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid gap-8 sm:gap-10 md:gap-12 md:grid-cols-3">
              {[
                {
                  image: "/farmImage.jpg",
                  title: "Discover Nearby Farmers",
                  description: "Our location-based system finds dairy farmers in your area. Browse their profiles, products, and ratings.",
                  icon: <MapPin className="h-8 w-8" />,
                  step: "01"
                },
                {
                  image: "/fresh-milk-bottle.jpg",
                  title: "Browse Fresh Products",
                  description: "Explore a wide variety of dairy products - milk, ghee, paneer, curd, and more from verified local farmers.",
                  icon: <Heart className="h-8 w-8" />,
                  step: "02"
                },
                {
                  image: "/farmer.jpg",
                  title: "Direct Farm-to-Table",
                  description: "Order directly from farmers and receive fresh, authentic dairy products delivered to your doorstep.",
                  icon: <Truck className="h-8 w-8" />,
                  step: "03"
              },
            ].map((item, index) => (
                <div key={index} className="group relative">
                  <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
                    <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                        {item.step}
                      </div>
                    </div>
                    
                    <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image || "/placeholder.svg?height=400&width=400"}
                    alt={item.title}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>
                    
                    <div className="p-4 sm:p-6 md:p-8">
                      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                          {item.icon}
                        </div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{item.title}</h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed text-sm sm:text-base md:text-lg">{item.description}</p>
                    </div>
                  </div>
                  
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                      <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <ArrowRight className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              </div>
          </div>
        </div>
      </section>

      <section id="products" className="py-12 sm:py-16 md:py-20 lg:py-32 bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
              Fresh Products
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Popular <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Dairy Products</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Discover our most loved dairy products, all sourced directly from verified local farmers
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                  name: "Fresh Cow Milk",
                  subtitle: "Pure, fresh milk from grass-fed cows",
                image: "/fresh-milk-bottle.jpg",
                  price: "₹60/L",
                  rating: 4.9,
                  badge: "Most Popular"
                },
                {
                  name: "Pure Desi Ghee",
                  subtitle: "Traditional homemade ghee",
                  image: "/ghee.jpg",
                  price: "₹550/kg",
                  rating: 4.8,
                  badge: "Premium"
                },
                {
                  name: "Fresh Paneer",
                  subtitle: "Soft, homemade cottage cheese",
                  image: "/paneer.jpg",
                  price: "₹350/kg",
                  rating: 4.7,
                  badge: "Fresh"
                },
                {
                  name: "Thick Curd",
                  subtitle: "Rich, creamy homemade yogurt",
                  image: "/thick-curd-bowl.jpg",
                  price: "₹70/kg",
                  rating: 4.6,
                  badge: "Organic"
              },
            ].map((product, index) => (
                <div key={index} className="group relative">
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white">
                    <div className="relative">
                      <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg?height=400&width=400"}
                    alt={product.name}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                      
                      <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                        <span className="px-2 sm:px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                          {product.badge}
                        </span>
                      </div>
                      
                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">{product.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4 sm:p-6">
                      <div className="space-y-2 sm:space-y-3">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{product.subtitle}</p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 pt-2">
                          <span className="text-xl sm:text-2xl font-bold text-green-600">{product.price}</span>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-full px-3 sm:px-4 text-xs sm:text-sm w-full sm:w-auto">
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-12 sm:py-16 md:py-20 lg:py-32 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Award className="h-3 w-3 sm:h-4 sm:w-4" />
              Why Choose Us
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Why Choose <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Milkeyway?</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Connecting consumers with local dairy farmers for fresh, authentic products
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <MapPin className="h-8 w-8" />,
                  title: "Location-Based Discovery",
                  description: "Find dairy farmers near you using GPS technology. Get fresh products from local farms within your area.",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  icon: <Users className="h-8 w-8" />,
                  title: "Direct Farm Connection",
                  description: "Skip the middleman. Connect directly with farmers to get authentic, fresh dairy products at fair prices.",
                  color: "from-green-500 to-emerald-500"
                },
                {
                  icon: <Shield className="h-8 w-8" />,
                  title: "Verified Farmers",
                  description: "All farmers are verified and authenticated. Browse profiles, ratings, and reviews before making purchases.",
                  color: "from-purple-500 to-violet-500"
                },
                {
                  icon: <Heart className="h-8 w-8" />,
                  title: "Wide Product Range",
                  description: "From fresh milk to ghee, paneer to curd - discover a variety of dairy products from local farmers.",
                  color: "from-pink-500 to-rose-500"
                },
                {
                  icon: <Truck className="h-8 w-8" />,
                  title: "Fresh Delivery",
                  description: "Get your dairy products delivered fresh from farm to your doorstep with proper packaging.",
                  color: "from-orange-500 to-red-500"
                },
                {
                  icon: <TrendingUp className="h-8 w-8" />,
                  title: "Support Local Agriculture",
                  description: "Help local farmers grow their business while getting the freshest, most authentic dairy products.",
                  color: "from-emerald-500 to-teal-500"
                },
              ].map((feature, index) => (
                <div key={index} className="group relative">
                  <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 p-4 sm:p-6 md:p-8 border border-gray-100">
                    <div className="flex items-start gap-4 sm:gap-6">
                      <div className={`h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-green-600 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 h-3 w-3 sm:h-4 sm:w-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero_img.jpg')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-transparent"></div>
        
        <div className="relative z-10 container mx-auto px-3 sm:px-4">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
              Get Started Today
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Ready to Get <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Started?</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 leading-relaxed max-w-3xl mx-auto px-4">
              Join thousands of consumers and farmers who are already using Milkeyway to connect and trade fresh dairy products.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-lg sm:text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 group w-full sm:w-auto"
                >
                  Start Shopping Now
                  <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-full px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-lg sm:text-xl font-semibold transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                >
                  Join as Farmer
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">10,000+</h3>
                <p className="text-sm sm:text-base text-gray-600">Active Users</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">500+</h3>
                <p className="text-sm sm:text-base text-gray-600">Local Farmers</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Award className="h-6 w-6 sm:h-8 sm:w-8 text-teal-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">4.9/5</h3>
                <p className="text-sm sm:text-base text-gray-600">Customer Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-12 sm:py-16 md:py-20 lg:py-32 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
              Customer Stories
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              What Our <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Community</span> Says
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Hear from our consumers and farmers about their Milkeyway experience
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {[
              {
                  name: "Priya Sharma",
                  role: "Consumer",
                time: "2 months ago",
                  content: "Milkeyway has been a game-changer! I can now get fresh milk directly from local farmers. The quality is amazing and I love supporting local agriculture.",
                  avatar: "/farmer_image.jpg",
                  rating: 5
              },
              {
                  name: "Rajesh Kumar",
                  role: "Dairy Farmer",
                time: "3 months ago",
                  content: "As a dairy farmer, this platform has helped me reach more customers in my area. I can now sell my products directly to consumers and grow my business.",
                  avatar: "/farmer.jpg",
                  rating: 5
              },
            ].map((testimonial, index) => (
                <div key={index} className="group">
                  <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white overflow-hidden">
                    <CardContent className="p-4 sm:p-6 md:p-8">
                      <div className="flex items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
                        <div className="relative">
                          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full overflow-hidden border-2 sm:border-4 border-green-100">
                      <img
                        src={testimonial.avatar || "/placeholder.svg?height=100&width=100"}
                        alt={testimonial.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 sm:h-6 sm:w-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-2 w-2 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{testimonial.name}</h3>
                            <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 text-xs sm:text-sm font-medium rounded-full w-fit">
                              {testimonial.role}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">{testimonial.time}</p>
                          <div className="flex gap-1 mb-3 sm:mb-4">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                        </div>
                      </div>
                      <blockquote className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed italic">
                        "{testimonial.content}"
                      </blockquote>
                </CardContent>
              </Card>
                </div>
            ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Milk className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                </div>
                <span className="text-xl sm:text-2xl font-bold">Milkeyway</span>
            </div>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                Connecting consumers with local dairy farmers for fresh, authentic products. 
                Supporting local agriculture while delivering quality dairy products.
              </p>
              <div className="flex items-center gap-3 sm:gap-4">
                <button className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </button>
                <button className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </button>
                <button className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </button>
            </div>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">For Consumers</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li><Link href="/consumer/dashboard" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Browse Products</Link></li>
                <li><Link href="/consumer/farmers" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Find Farmers</Link></li>
                <li><Link href="/consumer/orders" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">My Orders</Link></li>
                <li><Link href="/consumer/profile" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Profile</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">For Farmers</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li><Link href="/farmer/dashboard" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/farmer/products" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">My Products</Link></li>
                <li><Link href="/farmer/orders" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Orders</Link></li>
                <li><Link href="/farmer/analytics" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Support</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li><Link href="/help" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/terms" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 sm:pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <p className="text-sm sm:text-base text-gray-400">© 2024 Milkeyway. All rights reserved.</p>
              <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400">
                <span>Made with ❤️ for local farmers</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
