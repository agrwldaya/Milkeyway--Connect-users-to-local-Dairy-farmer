"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Users, 
  Store, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  UserCheck,
  MessageCircle,
  Clock,
  Activity
} from "lucide-react";
import { AdminNav } from "@/components/admin-nav";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:4000/api/v1/admin/dashboard/stats", {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      
      const data = await response.json();
      setDashboardData(data.stats);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get activity icon
  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'farmer_registration':
        return Store;
      case 'consumer_registration':
        return Users;
      case 'connection_established':
        return UserCheck;
      case 'request_sent':
        return MessageCircle;
      default:
        return Activity;
    }
  };

  // Get activity color
  const getActivityColor = (activityType) => {
    switch (activityType) {
      case 'farmer_registration':
        return "bg-blue-100 text-blue-600";
      case 'consumer_registration':
        return "bg-green-100 text-green-600";
      case 'connection_established':
        return "bg-purple-100 text-purple-600";
      case 'request_sent':
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <main className="container py-8 px-5">
          <div className="text-center py-8">
            <div className="text-muted-foreground">Loading dashboard...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <main className="container py-8 px-5">
          <div className="text-center py-8">
            <div className="text-destructive">Failed to load dashboard data</div>
            <Button onClick={fetchDashboardData} className="mt-4">
              Retry
            </Button>
          </div>
        </main>
      </div>
    );
  }
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
              <div className="text-3xl font-bold">{dashboardData.farmers.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary">+{dashboardData.farmers.this_month}</span> this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Consumers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData.consumers.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary">+{dashboardData.consumers.this_month}</span> this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData.connections.active}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary">+{dashboardData.connections.this_month}</span> this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardData.requests.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary">{dashboardData.requests.acceptance_rate}%</span> acceptance rate
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
                  {dashboardData.pending_farmers.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.pending_farmers.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No pending farmer approvals
                  </div>
                ) : (
                  dashboardData.pending_farmers.map((farmer, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold">{farmer.farmer_name}</p>
                        <p className="text-sm text-muted-foreground">{farmer.farm_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {farmer.address} • {formatDate(farmer.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/admin/farmers/${farmer.id}`}>
                          <Button size="sm" className="bg-primary hover:bg-primary/90">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Link href="/admin/farmer-approvals">
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  View All Approvals
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
                {dashboardData.recent_activity.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No recent activity
                  </div>
                ) : (
                  dashboardData.recent_activity.map((activity, index) => {
                    const ActivityIcon = getActivityIcon(activity.activity_type);
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getActivityColor(activity.activity_type)}`}>
                          <ActivityIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.actor_name} • {formatDate(activity.activity_date)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
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
                  <span className="text-sm text-muted-foreground">
                    {dashboardData.farmers.active}/{dashboardData.farmers.total}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ 
                      width: `${dashboardData.farmers.total > 0 ? (dashboardData.farmers.active / dashboardData.farmers.total) * 100 : 0}%` 
                    }} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Request Success Rate</span>
                  <span className="text-sm text-muted-foreground">{dashboardData.requests.acceptance_rate}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${dashboardData.requests.acceptance_rate}%` }} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Connections</span>
                  <span className="text-sm text-muted-foreground">
                    {dashboardData.connections.active}/{dashboardData.connections.total}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ 
                      width: `${dashboardData.connections.total > 0 ? (dashboardData.connections.active / dashboardData.connections.total) * 100 : 0}%` 
                    }} 
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4 mt-6">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">This Week</span>
                </div>
                <p className="text-2xl font-bold">{dashboardData.farmers.this_week + dashboardData.consumers.this_week}</p>
                <p className="text-xs text-muted-foreground mt-1">New registrations</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-medium">Pending Requests</span>
                </div>
                <p className="text-2xl font-bold">{dashboardData.requests.pending}</p>
                <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">New Connections</span>
                </div>
                <p className="text-2xl font-bold">{dashboardData.connections.this_week}</p>
                <p className="text-xs text-muted-foreground mt-1">This week</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Store className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Pending Approvals</span>
                </div>
                <p className="text-2xl font-bold">{dashboardData.farmers.pending}</p>
                <p className="text-xs text-muted-foreground mt-1">Farmer applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
