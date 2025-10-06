import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Milk } from "lucide-react"
 
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      <header className="sticky  top-0 z-50 w-full ">
        <div className="container mx-auto    flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 px-2 md:px-5">
             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Milk className="h-6 w-6 text-primary-foreground" />
          </div>
            <span className="text-2xl  font-bold text-[#6db02a]">Milkeyway</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
             
            <Link href="#products" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Products
            </Link>
            <Link href="#about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              About Us
            </Link>
            <Link href="#contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center md:mx-8 md:gap-5 gap-2 px-3 md:px-5">
            <Link href="/auth/login">
              <Button variant="ghost" size="lg" className="text-foreground">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-[#80e619] hover:bg-[#80e619]/90 text-primary rounded-full md:px-8 px-3">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-5 md:py-10">
        <div className="container mx-auto px-3 md:px-10">
          <div className=" mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 p-12 md:p-20">
              <div className="absolute inset-0 ">
                <img
                  src="/hero_img.jpg"
                  alt="Fresh dairy farm"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="relative z-10 text-center max-w-4xl mx-auto">
                <h1 className="text-xl md:text-4xl font-bold text-foreground mb-6 text-balance leading-tight">
                  Fresh, Local, Healthy Dairy Delivered to You
                </h1>
                <p className="text-xl text-white font-semibold    mb-10 text-pretty max-w-2xl mx-auto leading-relaxed">
                  Connect directly with local dairy farmers. Get authentic dairy products straight from farm to table.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/auth/login">
                    <Button
                      size="lg"
                      className="bg-[#80e619] hover:bg-[#80e619]/90 text-primary rounded-full md:px-8 md:h-12 text-lg"
                    >
                      Find Farmers Near You
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-[#80e619] hover:bg-[#80e619]/90 text-primary rounded-full md:px-8 md:h-12 text-lg"
                    >
                      Join as Farmer
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance">How It Works</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                image:"/heroImage.jpg",
                title: "Find Local Farmers",
                description: "Browse nearby dairy farms and their products.",
              },
              {
                image: "/heroImage.jpg",
                title: "Order Fresh Dairy",
                description: "Select your favorite dairy items and place an order.",
              },
              {
                image: "/heroImage.jpg",
                title: "Enjoy Delivery",
                description: "Receive your fresh products at your doorstep.",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="aspect-square overflow-hidden rounded-3xl bg-muted mb-6">
                  <img
                    src={item.image || "/placeholder.svg?height=400&width=400"}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="products" className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl md:text-5xl font-bold">Popular Products / Featured Farmers</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Fresh Milk",
                subtitle: "From our cows to your table.",
                image: "/fresh-milk-bottle.jpg",
              },
              {
                name: "Artisan Cheese",
                subtitle: "Handcrafted cheese with love.",
                image: "/artisan-cheese.jpg",
              },
              {
                name: "Creamy Yogurt",
                subtitle: "Delicious yogurt made with real fruit.",
                image: "/creamy-yogurt.jpg",
              },
              {
                name: "Meet Farmer Ethan",
                subtitle: "Supporting local dairy farmers.",
                image: "/farmer-portrait.jpg",
              },
            ].map((product, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.image || "/placeholder.svg?height=400&width=400"}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.subtitle}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What Our Community Says</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {[
              {
                name: "Sophia Clark",
                time: "2 months ago",
                content: "I love getting my dairy products from Milk & Honey. The milk is so fresh and tastes amazing!",
                avatar: "/indian-woman-smiling.png",
              },
              {
                name: "Liam Carter",
                time: "3 months ago",
                content: "As a farmer, this platform has helped me reach more customers and grow my business.",
                avatar: "/indian-farmer-man.jpg",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-sm bg-gray-50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-muted overflow-hidden">
                      <img
                        src={testimonial.avatar || "/placeholder.svg?height=100&width=100"}
                        alt={testimonial.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.time}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </button>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-muted-foreground">© 2023 Milk & Honey. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
