"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { FarmerNav } from "@/components/farmer-nav"
import Link from "next/link"
import { api } from "@/lib/utils"
import { toast } from "sonner"

export default function AddProductPage() {
  const router = useRouter()
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || ""

  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [milkCategories, setMilkCategories] = useState([])

  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [selectedMilkCategoryId, setSelectedMilkCategoryId] = useState("")
  const [unit, setUnit] = useState("")
  const [pricePerUnit, setPricePerUnit] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    let active = true
    const fetchCategories = async () => {
      try {
        const res = await api.get(`${API_BASE}/api/v1/farmers/showcategories`)
        const data = res.data
        if (!data?.success) throw new Error(data?.message || "Failed to load categories")
        if (!active) return
        setCategories(data.categories || [])
        setMilkCategories(data.milkCategories || [])
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message || "Failed to load categories")
      }
    }
    fetchCategories()
    return () => {
      active = false
    }
  }, [API_BASE])

  const selectedCategory = categories.find((c) => String(c.id) === String(selectedCategoryId))
  const isMilkCategory = selectedCategory?.name?.toLowerCase() === "milk"

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedCategoryId || !unit || !pricePerUnit || !description) {
      toast.error("Please fill all required fields")
      return
    }
    if (isMilkCategory && !selectedMilkCategoryId) {
      toast.error("Please select a milk type")
      return
    }

    setIsLoading(true)
    try {
      const milkId = isMilkCategory ? selectedMilkCategoryId : 0
      await api.post(
        `${API_BASE}/api/v1/farmers/addproducts/${selectedCategoryId}/${milkId}`,
        {
          unit,
          price_per_unit: Number(pricePerUnit),
          description,
        }
      )
      toast.success("Product added successfully")
      router.push("/farmer/products")
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to add product")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <FarmerNav />

      <main className="container py-8 px-5 ">
        <div className="mb-8">
          <Link href="/farmer/products">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <h1 className="text-4xl font-serif font-bold mb-2">Add New Product</h1>
          <p className="text-muted-foreground">Select a product and provide details</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Product Selection</CardTitle>
              <CardDescription>Choose category and milk type (if applicable)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isMilkCategory && (
                  <div className="space-y-2">
                    <Label htmlFor="milk">Milk Type *</Label>
                    <Select value={selectedMilkCategoryId} onValueChange={setSelectedMilkCategoryId}>
                      <SelectTrigger id="milk">
                        <SelectValue placeholder="Select milk type" />
                      </SelectTrigger>
                      <SelectContent>
                        {milkCategories.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>{m.milk_cattle}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>Provide pricing, unit and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger id="unit">
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

                <div className="space-y-2">
                  <Label htmlFor="price">Price per Unit (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product, its quality, and what makes it special..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Link href="/farmer/products">
              <Button type="button" variant="outline" className="w-full sm:w-auto bg-transparent">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="bg-primary hover:bg-primary/90 w-full sm:w-auto" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
