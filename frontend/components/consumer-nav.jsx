"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/lib/utils"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet" // Import Sheet components
import {
  Milk,
  Search,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Menu, // Import Menu icon for hamburger
} from "lucide-react"

export function ConsumerNav() {
  const router = useRouter()
  const [cartCount] = useState(3)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const handleLogout = async () => {
    try {
      await api.post("/api/v1/auth/logout")
      toast.success("Logged out")
    } finally {
      router.push("/")
    }
  }

  const navItems = [
    { href: "/consumer/dashboard", label: "Home" },
    { href: "/consumer/browse", label: "Browse" },
    { href: "/consumer/farmers", label: "Farmers" },
    { href: "/consumer/orders", label: "My Orders" },
    { href: "/consumer/favorites", label: "Favorites" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b px-5 border-[#80e619] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/consumer/dashboard" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Milk className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-serif text-2xl font-bold text-[#6db02a]">Milkeyway</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Mobile Menu Trigger (Hamburger) */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] sm:w-[300px] p-4 bg-white">
              <nav className="flex flex-col gap-4 pt-6">
                {/* Logo inside mobile menu */}
                <Link href="/consumer/dashboard" className="flex items-center gap-2 mb-4" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <Milk className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="font-serif text-xl font-bold text-foreground">Milkeyway</span>
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)} // Close menu on item click
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t pt-4 mt-4 flex flex-col gap-4">
                    <Link href="/consumer/profile" className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        <User className="h-5 w-5 text-muted-foreground" />
                        Profile
                    </Link>
                    <button onClick={() => { setIsMobileMenuOpen(false); setIsConfirmOpen(true) }} className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors text-left">
                        <LogOut className="h-5 w-5 text-muted-foreground" />
                        Logout
                    </button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Action Icons (Search, Heart, Cart, User, Logout) */}
          <Button variant="ghost" size="sm" className="hidden md:flex"> {/* Search on desktop */}
            <Search className="h-4 w-4" />
          </Button>
          <Link href="/consumer/favorites" className="hidden md:block"> {/* Favorites on desktop */}
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/consumer/cart"> {/* Cart visible on all screens */}
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-secondary">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          <Link href="/consumer/profile" className="hidden md:block"> {/* Profile on desktop */}
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setIsConfirmOpen(true)} className="hidden md:block">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleLogout}>Yes, log out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}