"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Eye, MoreVertical } from "lucide-react"
import { FarmerNav } from "@/components/farmer-nav"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { api } from "@/lib/utils"
import { toast } from "sonner"

export default function ProductsPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [isApproved, setIsApproved] = useState(false) // Add approval status
  const [updateForm, setUpdateForm] = useState({
    unit: "",
    price_per_unit: "",
    description: "",
    is_available: true
  })

  useEffect(() => {
    let active = true
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const res = await api.get(`${API_BASE}/api/v1/farmers/products`)
        const data = res.data
        console.log(data)
        if (!data?.success) throw new Error(data?.message || "Failed to load products")
        if (!active) return
        
        // Set approval status
        setIsApproved(data.isApproved || false)
        
        // Map API fields to UI
        const mapped = (data.products || []).map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: `₹${p.price_per_unit}`,
          status: p.is_available ? "active" : "inactive",
          category: p.category_name,
          image: p.image_url || "/placeholder.svg",
          unit: p.unit || "",
        }))
        setProducts(mapped)
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message || "Failed to load products")
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
    return () => {
      active = false
    }
  }, [API_BASE])

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setUpdateForm({
      unit: product.unit || "",
      price_per_unit: product.price?.replace("₹", "") || "",
      description: product.description || "",
      is_available: product.status === "active"
    })
    setIsUpdateDialogOpen(true)
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct || !updateForm.unit || !updateForm.price_per_unit || !updateForm.description) {
      toast.error("Please fill all required fields")
      return
    }

    setIsLoading(true)
    try {
      await api.put(
        `${API_BASE}/api/v1/farmers/products/${editingProduct.id}`,
        {
          unit: updateForm.unit,
          price_per_unit: Number(updateForm.price_per_unit),
          description: updateForm.description,
          is_available: updateForm.is_available
        }
      )
      toast.success("Product updated successfully")
      setIsUpdateDialogOpen(false)
      setEditingProduct(null)
      // Refresh products list
      const res = await api.get(`${API_BASE}/api/v1/farmers/products`)
      const data = res.data
      if (data?.success) {
        const mapped = (data.products || []).map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: `₹${p.price_per_unit}`,
          status: p.is_available ? "active" : "inactive",
          category: p.category_name,
          image: p.image_url || "/placeholder.svg",
          unit: p.unit || "",
        }))
        setProducts(mapped)
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to update product")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <FarmerNav />

      <main className="container py-8 px-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2">Products</h1>
            <p className="text-muted-foreground">Manage your product listings and inventory</p>
          </div>
          <Link href="/farmer/products/add">
            <Button 
              className="bg-primary hover:bg-primary/90"
              disabled={!isApproved}
              title={!isApproved ? "Complete your profile and get approved to add products" : ""}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </Link>
        </div>

        {/* Approval Status Warning */}
        {!isApproved && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Account Pending Approval</p>
                  <p className="text-sm">You can view your products but cannot add or edit them until your account is approved by admin.</p>
                </div>
                <Link href="/farmer/profile">
                  <Button variant="outline" size="sm" className="text-yellow-800 border-yellow-300 hover:bg-yellow-100">
                    Complete Profile
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products..." className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="milk">Milk</SelectItem>
                  <SelectItem value="ghee">Ghee</SelectItem>
                  <SelectItem value="paneer">Paneer</SelectItem>
                  <SelectItem value="curd">Curd</SelectItem>
                  <SelectItem value="butter">Butter</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <div className="grid gap-6">
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full md:w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{product.name}</h3>
                          <Badge variant={product.status === "active" ? "default" : "secondary"}>
                            {product.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Category: <span className="text-foreground font-medium">{product.category}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{product.price}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleEditProduct(product)}
                              disabled={!isApproved}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Product
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Update Product Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update the details for {editingProduct?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select value={updateForm.unit} onValueChange={(value) => setUpdateForm({...updateForm, unit: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="liter">Liter</SelectItem>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="gram">Gram</SelectItem>
                    <SelectItem value="piece">Piece</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price per Unit (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={updateForm.price_per_unit}
                  onChange={(e) => setUpdateForm({...updateForm, price_per_unit: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product..."
                  rows={3}
                  value={updateForm.description}
                  onChange={(e) => setUpdateForm({...updateForm, description: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={updateForm.is_available}
                  onChange={(e) => setUpdateForm({...updateForm, is_available: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="is_available">Product is available</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProduct} disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Product"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
