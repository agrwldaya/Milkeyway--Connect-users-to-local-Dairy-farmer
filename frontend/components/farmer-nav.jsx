"use client" // This component uses client-side state, so mark it as a client component in Next.js

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/lib/utils"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet" // Import Sheet components
import {
  Milk,
  LayoutDashboard,
  Package,
  ShoppingCart,
  User,
  BarChart3,
  Settings,
  LogOut,
  Menu, // Import the Menu icon for the hamburger
} from "lucide-react"

export function FarmerNav() {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const handleLogout = async () => {
    try {
      await api.post("/api/v1/auth/logout")
      toast.success("Logged out")
    } finally {
      router.push("/")
    }
  }

  const navItems = [
    { href: "/farmer/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/farmer/products", icon: Package, label: "Products" },
    { href: "/farmer/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/farmer/profile", icon: User, label: "Profile" },
    { href: "/farmer/settings", icon: Settings, label: "Settings" },
  ]

    // { href: "/farmer/analytics", icon: BarChart3, label: "Analytics" },
  return (
    <header className="sticky top-0 z-50 w-full border-b px-5 border-[#80e619] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/farmer/dashboard" className="flex items-center gap-2">
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
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <item.icon className="h-4 w-4" />
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
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)} // Close menu on item click
                  >
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    {item.label}
                  </Link>
                ))}
                {/* Logout for mobile menu */}
                <button onClick={handleLogout} className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors mt-4 text-left">
                  <LogOut className="h-5 w-5 text-muted-foreground" />
                  Logout
                </button>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop Logout Button */}
          <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden md:block">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}