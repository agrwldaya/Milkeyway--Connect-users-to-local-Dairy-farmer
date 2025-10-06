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
  Store,
  Users,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Menu, // Import the Menu icon for the hamburger
} from "lucide-react"

export function AdminNav() {
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
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/farmers", icon: Store, label: "Farmers" },
    { href: "/admin/consumers", icon: Users, label: "Consumers" },
    { href: "/admin/products", icon: Package, label: "Products" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b px-5 border-[#80e619] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Milk className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
             <span className="font-serif text-2xl font-bold text-[#6db02a]">Milkeyway</span>
            <span className="ml-2 text-xs text-muted-foreground">Admin</span>
          </div>
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
                 {/* Logo inside mobile menu */}
                 <Link href="/admin/dashboard" className="flex items-center gap-2 mb-4" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                        <Milk className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                        <span className="font-serif text-xl font-bold text-foreground">Milkeyway</span>
                        <span className="ml-2 text-xs text-muted-foreground">Admin</span>
                    </div>
                </Link>
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
                {/* Settings and Logout for mobile menu */}
                <div className="border-t pt-4 mt-4 flex flex-col gap-4">
                    <Link href="/admin/settings" className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        <Settings className="h-5 w-5 text-muted-foreground" />
                        Settings
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-3 text-lg font-medium hover:text-primary transition-colors text-left">
                        <LogOut className="h-5 w-5 text-muted-foreground" />
                        Logout
                    </button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop Settings and Logout Buttons */}
          <Link href="/admin/settings" className="hidden md:block"> {/* Show Settings on desktop */}
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden md:block">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}