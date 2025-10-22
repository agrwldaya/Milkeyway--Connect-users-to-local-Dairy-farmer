"use client";

import { useState, useEffect } from "react";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Users, MessageCircle, Activity, Plus, Edit, Trash2, CheckCircle, XCircle, UserPlus, AlertCircle } from "lucide-react"
import { FarmerNav } from "@/components/farmer-nav"
import { api } from "@/lib/utils"

export default function FarmerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/v1/farmers/dashboard');
      if (response.data.success) {
        console.log(response.data.data);
        setDashboardData(response.data.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen font-sans bg-[#f2f5f0]">
        <FarmerNav />
        <main className="container py-8 px-5">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen font-sans">
        <FarmerNav />
        <main className="container py-8 px-5">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <p>Error loading dashboard: {error}</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const { stats, recentRequests, recentConnections, products } = dashboardData || {};
  return (
    <div className="min-h-screen font-sans">
      <FarmerNav />

      <main className="container py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-2">
            Welcome back, {dashboardData.farmer?.name || 'Farmer'}!
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your connections and grow your consumer network</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">{stats?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary">Active</span> products listed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">{stats?.activeConnections || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary">Connected</span> consumers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">{stats?.pendingRequests || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-secondary">Awaiting</span> your response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">{stats?.profileViews || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary">Total</span> profile views
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Recent Connection Requests */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Recent Connection Requests</CardTitle>
                  <CardDescription className="text-sm">Consumer requests awaiting your response</CardDescription>
                </div>
                <Link href="/farmer/requests">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRequests && recentRequests.length > 0 ? (
                  recentRequests.map((request) => (
                    <div key={request.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">#{request.id}</p>
                          <Badge variant={request.status === "pending" ? "secondary" : "default"} className="text-xs">
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{request.consumer_name}</p>
                        <p className="text-sm truncate">
                          {request.product_interest} - {request.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{request.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent requests</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Connections */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Recent Connections</CardTitle>
                  <CardDescription className="text-sm">Your latest consumer connections</CardDescription>
                </div>
                <Link href="/farmer/connections">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentConnections && recentConnections.length > 0 ? (
                  recentConnections.map((connection, index) => (
                    <div key={connection.connection_id || index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold truncate">{connection.consumer_name}</p>
                          <Badge variant="default" className="text-xs">
                            active
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{connection.connection_notes || 'No notes'}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Connected {new Date(connection.connected_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent connections</p>
                  </div>
                )}
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
                {products && products.length > 0 ? (
                  products.map((product, index) => (
                    <div key={product.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{product.name}</p>
                          <Badge variant={product.is_available ? "default" : "secondary"} className="text-xs">
                            {product.is_available ? "active" : "inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ₹{product.price_per_unit}/{product.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.category_name}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            product.stock_quantity === 0 
                              ? "text-destructive" 
                              : product.stock_quantity < 10 
                                ? "text-secondary" 
                                : "text-primary"
                          }`}
                        >
                          {product.stock_quantity === 0 
                            ? "Out of Stock" 
                            : product.stock_quantity < 10 
                              ? "Low Stock" 
                              : "In Stock"} ({product.stock_quantity} units)
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No products listed</p>
                    <p className="text-xs mt-1">Add your first product to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          
        </div>
      </main>
    </div>
  )
}
