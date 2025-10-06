import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, CheckCircle, XCircle, Eye, Phone, MapPin } from "lucide-react"
import { FarmerNav } from "@/components/farmer-nav"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function OrdersPage() {
  const orders = [
    {
      id: "#ORD-001",
      customer: "Priya Sharma",
      phone: "+91 98765 43210",
      address: "123 Green Valley, Sector 12, Pune",
      products: [{ name: "Fresh Cow Milk", quantity: "5L", price: "₹300" }],
      total: "₹300",
      status: "pending",
      date: "2025-01-10",
      time: "10:30 AM",
    },
    {
      id: "#ORD-002",
      customer: "Amit Patel",
      phone: "+91 98765 43211",
      address: "456 Sunrise Apartments, Kothrud, Pune",
      products: [{ name: "Pure Desi Ghee", quantity: "1kg", price: "₹550" }],
      total: "₹550",
      status: "confirmed",
      date: "2025-01-10",
      time: "09:15 AM",
    },
    {
      id: "#ORD-003",
      customer: "Anjali Desai",
      phone: "+91 98765 43212",
      address: "789 Lake View, Baner, Pune",
      products: [
        { name: "Homemade Paneer", quantity: "500g", price: "₹175" },
        { name: "Fresh Butter", quantity: "250g", price: "₹112" },
      ],
      total: "₹287",
      status: "pending",
      date: "2025-01-09",
      time: "04:45 PM",
    },
    {
      id: "#ORD-004",
      customer: "Rajesh Kumar",
      phone: "+91 98765 43213",
      address: "321 Hill Station, Aundh, Pune",
      products: [{ name: "Buffalo Milk", quantity: "3L", price: "₹225" }],
      total: "₹225",
      status: "delivered",
      date: "2025-01-09",
      time: "08:00 AM",
    },
    {
      id: "#ORD-005",
      customer: "Sneha Joshi",
      phone: "+91 98765 43214",
      address: "654 Garden Estate, Viman Nagar, Pune",
      products: [{ name: "Thick Curd", quantity: "1kg", price: "₹70" }],
      total: "₹70",
      status: "cancelled",
      date: "2025-01-08",
      time: "02:30 PM",
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "confirmed":
        return "default"
      case "delivered":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <FarmerNav />

      <main className="container py-8 px-5">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">Orders</h1>
          <p className="text-muted-foreground">Manage and track all your customer orders</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-secondary">3</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">4</div>
              <p className="text-xs text-muted-foreground">Confirmed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-muted-foreground">1</div>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by order ID or customer name..." className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="newest">
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Value</SelectItem>
                  <SelectItem value="lowest">Lowest Value</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{order.id}</h3>
                        <Badge variant={getStatusColor(order.status)}>{order.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.date} at {order.time}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="font-medium text-sm">Customer:</div>
                        <div className="text-sm text-muted-foreground">{order.customer}</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="text-sm text-muted-foreground">{order.phone}</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="text-sm text-muted-foreground">{order.address}</div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="text-sm font-medium mb-2">Products:</div>
                      <div className="space-y-1">
                        {order.products.map((product, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {product.name} × {product.quantity}
                            </span>
                            <span className="font-medium">{product.price}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-base font-semibold mt-3 pt-3 border-t">
                        <span>Total</span>
                        <span className="text-primary">{order.total}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2 justify-end">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 lg:flex-none bg-transparent">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Order Details - {order.id}</DialogTitle>
                          <DialogDescription>Complete order information</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <h4 className="font-semibold mb-2">Customer Information</h4>
                            <div className="space-y-1 text-sm">
                              <p>{order.customer}</p>
                              <p className="text-muted-foreground">{order.phone}</p>
                              <p className="text-muted-foreground">{order.address}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Order Items</h4>
                            <div className="space-y-2">
                              {order.products.map((product, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>
                                    {product.name} × {product.quantity}
                                  </span>
                                  <span className="font-medium">{product.price}</span>
                                </div>
                              ))}
                              <div className="flex justify-between font-semibold pt-2 border-t">
                                <span>Total</span>
                                <span className="text-primary">{order.total}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {order.status === "pending" && (
                      <>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 flex-1 lg:flex-none">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 lg:flex-none text-destructive bg-transparent"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
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
