import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Store, Package, ShoppingCart, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { AdminNav } from "@/components/admin-nav"

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container py-8 px-5">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and monitor the Milkeyway platform</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">156</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary">+12</span> this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Consumers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary">+234</span> this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,248</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary">+89</span> this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">5,432</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary">+18%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Pending Farmer Approvals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Farmer Approvals</CardTitle>
                  <CardDescription>New farmers waiting for verification</CardDescription>
                </div>
                <Badge variant="secondary" className="text-lg">
                  8
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Rajesh Sharma",
                    farm: "Sunrise Dairy Farm",
                    location: "Pune, Maharashtra",
                    date: "2 days ago",
                  },
                  {
                    name: "Meena Patel",
                    farm: "Green Valley Dairy",
                    location: "Ahmedabad, Gujarat",
                    date: "3 days ago",
                  },
                  {
                    name: "Suresh Kumar",
                    farm: "Happy Cows Farm",
                    location: "Bangalore, Karnataka",
                    date: "5 days ago",
                  },
                ].map((farmer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{farmer.name}</p>
                      <p className="text-sm text-muted-foreground">{farmer.farm}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {farmer.location} • {farmer.date}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline">
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/admin/farmers">
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  View All Farmers
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: "order", message: "New order placed by Priya Sharma", time: "5 min ago", icon: ShoppingCart },
                  { type: "farmer", message: "Ramesh Patel added 3 new products", time: "1 hour ago", icon: Package },
                  { type: "user", message: "15 new consumers registered", time: "2 hours ago", icon: Users },
                  {
                    type: "alert",
                    message: 'Product "Fresh Milk" reported by user',
                    time: "3 hours ago",
                    icon: AlertCircle,
                  },
                  {
                    type: "success",
                    message: 'Farmer "Green Valley" verified',
                    time: "5 hours ago",
                    icon: CheckCircle,
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        activity.type === "alert"
                          ? "bg-destructive/10"
                          : activity.type === "success"
                            ? "bg-primary/10"
                            : "bg-muted"
                      }`}
                    >
                      <activity.icon
                        className={`h-5 w-5 ${
                          activity.type === "alert"
                            ? "text-destructive"
                            : activity.type === "success"
                              ? "text-primary"
                              : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Statistics</CardTitle>
            <CardDescription>Overview of platform performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Farmers</span>
                  <span className="text-sm text-muted-foreground">142/156</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "91%" }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Order Completion Rate</span>
                  <span className="text-sm text-muted-foreground">94%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "94%" }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Customer Satisfaction</span>
                  <span className="text-sm text-muted-foreground">4.8/5.0</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "96%" }} />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4 mt-6">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Revenue</span>
                </div>
                <p className="text-2xl font-bold">₹12.4L</p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-medium">Avg Order Value</span>
                </div>
                <p className="text-2xl font-bold">₹428</p>
                <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">Active Users</span>
                </div>
                <p className="text-2xl font-bold">1,847</p>
                <p className="text-xs text-muted-foreground mt-1">Daily average</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Store className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Top Farmer</span>
                </div>
                <p className="text-lg font-bold">Green Valley</p>
                <p className="text-xs text-muted-foreground mt-1">₹45K revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
