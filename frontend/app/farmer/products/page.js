import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Eye, MoreVertical } from "lucide-react"
import { FarmerNav } from "@/components/farmer-nav"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function ProductsPage() {
  const products = [
    {
      id: 1,
      name: "Fresh Cow Milk",
      category: "Milk",
      price: "₹60/L",
      stock: 50,
      unit: "Liters",
      status: "active",
      image: "/fresh-milk-bottle.jpg",
      description: "Pure A2 cow milk from grass-fed cows",
    },
    {
      id: 2,
      name: "Pure Desi Ghee",
      category: "Ghee",
      price: "₹550/kg",
      stock: 8,
      unit: "Kg",
      status: "active",
      image: "/ghee.jpg",
      description: "Traditional bilona method ghee",
    },
    {
      id: 3,
      name: "Homemade Paneer",
      category: "Paneer",
      price: "₹350/kg",
      stock: 15,
      unit: "Kg",
      status: "active",
      image: "/paneer.jpg",
      description: "Fresh cottage cheese made daily",
    },
    {
      id: 4,
      name: "Thick Curd",
      category: "Curd",
      price: "₹70/kg",
      stock: 0,
      unit: "Kg",
      status: "inactive",
      image: "/thick-curd-bowl.jpg",
      description: "Creamy homemade curd",
    },
    {
      id: 5,
      name: "Fresh Butter",
      category: "Butter",
      price: "₹450/kg",
      stock: 12,
      unit: "Kg",
      status: "active",
      image: "/butter-block.jpg",
      description: "Unsalted fresh butter",
    },
    {
      id: 6,
      name: "Buffalo Milk",
      category: "Milk",
      price: "₹75/L",
      stock: 30,
      unit: "Liters",
      status: "active",
      image: "/buffalo-milk.jpg",
      description: "Rich and creamy buffalo milk",
    },
  ]

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
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </Link>
        </div>

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
                          {product.stock < 10 && product.stock > 0 && (
                            <Badge variant="outline" className="border-secondary text-secondary">
                              Low Stock
                            </Badge>
                          )}
                          {product.stock === 0 && (
                            <Badge variant="outline" className="border-destructive text-destructive">
                              Out of Stock
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Category: <span className="text-foreground font-medium">{product.category}</span>
                          </span>
                          <span className="text-muted-foreground">
                            Stock:{" "}
                            <span className="text-foreground font-medium">
                              {product.stock} {product.unit}
                            </span>
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
                            <DropdownMenuItem>
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
      </main>
    </div>
  )
}
