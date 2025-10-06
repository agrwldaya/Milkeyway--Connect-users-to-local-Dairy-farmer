"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react"
import { ConsumerNav } from "@/components/consumer-nav"

export default function OrdersPage() {
  const orders = [
    {
      id: "ORD-2024-001",
      date: "Jan 15, 2024",
      status: "delivered",
      total: 670,
      items: [
        { name: "Fresh Cow Milk", quantity: 2, image: "/fresh-cow-milk-bottle.jpg" },
        { name: "Pure Desi Ghee", quantity: 1, image: "/pure-desi-ghee-jar.jpg" },
      ],
      farmer: "Green Valley Farm",
    },
    {
      id: "ORD-2024-002",
      date: "Jan 17, 2024",
      status: "in-transit",
      total: 350,
      items: [{ name: "Homemade Paneer", quantity: 1, image: "/fresh-paneer-cubes.png" }],
      farmer: "Happy Cows Farm",
      estimatedDelivery: "Today, 6-9 AM",
    },
    {
      id: "ORD-2024-003",
      date: "Jan 18, 2024",
      status: "processing",
      total: 120,
      items: [{ name: "Fresh Cow Milk", quantity: 2, image: "/fresh-cow-milk-bottle.jpg" }],
      farmer: "Green Valley Farm",
      estimatedDelivery: "Tomorrow, 6-9 AM",
    },
    {
      id: "ORD-2024-004",
      date: "Jan 10, 2024",
      status: "cancelled",
      total: 450,
      items: [{ name: "White Butter", quantity: 1, image: "/white-butter-bowl.jpg" }],
      farmer: "Sunrise Dairy",
    },
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Delivered</Badge>
      case "in-transit":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Transit</Badge>
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Processing</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "in-transit":
        return <Package className="h-5 w-5 text-blue-600" />
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  const filterOrders = (status) => {
    if (!status) return orders
    return orders.filter((order) => order.status === status)
  }

  const OrderCard = ({ order }) => (
    <Card className="bg-white hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(order.status)}
              <div>
                <p className="font-semibold text-lg">{order.id}</p>
                <p className="text-sm text-muted-foreground">{order.date}</p>
              </div>
            </div>
          </div>
          {getStatusBadge(order.status)}
        </div>

        <div className="space-y-3 mb-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-xl font-bold text-primary">₹{order.total}</p>
          </div>
          <Link href={`/consumer/orders/${order.id}`}>
            <Button variant="outline">
              View Details
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {order.estimatedDelivery && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <Clock className="h-4 w-4 inline mr-2" />
              Estimated delivery: {order.estimatedDelivery}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsumerNav />

      <main className="container py-8 px-5">
        <h1 className="text-4xl font-bold mb-8">My Orders</h1>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="in-transit">In Transit</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </TabsContent>

          <TabsContent value="processing" className="space-y-4">
            {filterOrders("processing").map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </TabsContent>

          <TabsContent value="in-transit" className="space-y-4">
            {filterOrders("in-transit").map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </TabsContent>

          <TabsContent value="delivered" className="space-y-4">
            {filterOrders("delivered").map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {filterOrders("cancelled").map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
