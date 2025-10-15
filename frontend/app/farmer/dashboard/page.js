import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Users, MessageCircle, Activity, Plus, Edit, Trash2, CheckCircle, XCircle, UserPlus } from "lucide-react"
import { FarmerNav } from "@/components/farmer-nav"

export default function FarmerDashboard() {
  return (
    <div className="min-h-screen font-sans bg-[#f2f5f0]">
      <FarmerNav />

      <main className="container py-8  px-5 ">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">Welcome back, Ramesh!</h1>
          <p className="text-muted-foreground">Manage your connections and grow your consumer network</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary">+2</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary">+5</span> this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">8</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-secondary">3</span> new today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">156</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary">+23%</span> this week
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Connection Requests */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Connection Requests</CardTitle>
                  <CardDescription>Consumer requests awaiting your response</CardDescription>
                </div>
                <Link href="/farmer/requests">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: "#REQ-001",
                    consumer: "Priya Sharma",
                    product: "Fresh Cow Milk",
                    quantity: "5L",
                    message: "Looking for fresh milk delivery",
                    status: "pending",
                  },
                  {
                    id: "#REQ-002",
                    consumer: "Amit Patel",
                    product: "Pure Desi Ghee",
                    quantity: "1kg",
                    message: "Need ghee for home use",
                    status: "pending",
                  },
                  {
                    id: "#REQ-003",
                    consumer: "Anjali Desai",
                    product: "Homemade Paneer",
                    quantity: "500g",
                    message: "Regular customer, weekly order",
                    status: "pending",
                  },
                ].map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{request.id}</p>
                        <Badge variant={request.status === "pending" ? "secondary" : "default"} className="text-xs">
                          {request.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{request.consumer}</p>
                      <p className="text-sm">
                        {request.product} - {request.quantity}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{request.message}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-transparent">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-transparent">
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Connections */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Connections</CardTitle>
                  <CardDescription>Your latest consumer connections</CardDescription>
                </div>
                <Link href="/farmer/connections">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    consumer: "Priya Sharma", 
                    connected: "2 days ago", 
                    product: "Fresh Cow Milk",
                    status: "active" 
                  },
                  { 
                    consumer: "Amit Patel", 
                    connected: "1 week ago", 
                    product: "Pure Desi Ghee",
                    status: "active" 
                  },
                  { 
                    consumer: "Anjali Desai", 
                    connected: "2 weeks ago", 
                    product: "Homemade Paneer",
                    status: "active" 
                  },
                ].map((connection, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{connection.consumer}</p>
                        <Badge variant={connection.status === "active" ? "default" : "secondary"} className="text-xs">
                          {connection.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{connection.product}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Connected {connection.connected}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-transparent">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Management Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Products</CardTitle>
                  <CardDescription>Manage your product listings for consumer discovery</CardDescription>
                </div>
                <Link href="/farmer/products/add">
                  <Button size="sm" className="bg-[#80e619] hover:bg-[#80e619]/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Fresh Cow Milk", price: "₹60/L", stock: "In Stock", status: "active" },
                  { name: "Pure Desi Ghee", price: "₹550/kg", stock: "Low Stock", status: "active" },
                  { name: "Homemade Paneer", price: "₹350/kg", stock: "In Stock", status: "active" },
                  { name: "Thick Curd", price: "₹70/kg", stock: "Out of Stock", status: "inactive" },
                ].map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{product.name}</p>
                        <Badge variant={product.status === "active" ? "default" : "secondary"} className="text-xs">
                          {product.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{product.price}</p>
                      <p
                        className={`text-xs mt-1 ${product.stock === "Out of Stock" ? "text-destructive" : product.stock === "Low Stock" ? "text-secondary" : "text-primary"}`}
                      >
                        {product.stock}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-transparent">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 bg-transparent">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          
        </div>
      </main>
    </div>
  )
}
