"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, Activity, TrendingUp, Users, MessageCircle, Clock, Calendar, ArrowUp, ArrowDown, CheckCircle, XCircle, UserPlus, Mail } from "lucide-react"
import { FarmerNav } from "@/components/farmer-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FarmerActivityPage() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalConnections: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    rejectedRequests: 0,
    responseRate: 0,
    avgResponseTime: 0
  })
  const [activeTab, setActiveTab] = useState("recent")

  const fetchActivity = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:4000/api/v1/connections/activity?limit=50", {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        setActivities(data.activities)
        calculateStats(data.activities)
      } else {
        setError(data.message || "Failed to fetch activity")
      }
    } catch (err) {
      console.error("Error fetching activity:", err)
      setError("Failed to fetch activity")
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (activities) => {
    const now = new Date()
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const recentActivities = activities.filter(activity => 
      new Date(activity.activity_date) >= last30Days
    )

    const stats = {
      totalConnections: activities.filter(a => a.activity_type === 'connection_established').length,
      pendingRequests: activities.filter(a => a.activity_type === 'request_received' && a.direction === 'incoming').length,
      acceptedRequests: activities.filter(a => a.activity_type === 'connection_established' && a.direction === 'system').length,
      rejectedRequests: 0, // This would need to be tracked separately
      responseRate: 0,
      avgResponseTime: 0
    }

    // Calculate response rate
    const totalRequests = activities.filter(a => a.activity_type === 'request_received').length
    if (totalRequests > 0) {
      stats.responseRate = Math.round((stats.acceptedRequests / totalRequests) * 100)
    }

    setStats(stats)
  }

  useEffect(() => {
    fetchActivity()
  }, [])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (activityType, direction) => {
    switch (activityType) {
      case 'request_received':
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case 'request_sent':
        return <ArrowUp className="h-5 w-5 text-green-500" />
      case 'connection_established':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'connection_deactivated':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getActivityColor = (activityType, direction) => {
    switch (activityType) {
      case 'request_received':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'request_sent':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'connection_established':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800'
      case 'connection_deactivated':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getActivityTitle = (activity) => {
    switch (activity.activity_type) {
      case 'request_received':
        return `New request from ${activity.consumer_name}`
      case 'request_sent':
        return `Request sent to ${activity.farmer_name}`
      case 'connection_established':
        return `Connected with ${activity.consumer_name || activity.farmer_name}`
      case 'connection_deactivated':
        return `Connection ended with ${activity.consumer_name || activity.farmer_name}`
      default:
        return 'Activity'
    }
  }

  const getActivityDescription = (activity) => {
    switch (activity.activity_type) {
      case 'request_received':
        return `Requested ${activity.product_interest} (${activity.quantity})`
      case 'request_sent':
        return `Requested ${activity.product_interest} (${activity.quantity})`
      case 'connection_established':
        return 'Connection established successfully'
      case 'connection_deactivated':
        return 'Connection has been deactivated'
      default:
        return activity.activity_description || 'No description available'
    }
  }

  const recentActivities = activities.slice(0, 10)
  const connectionActivities = activities.filter(a => a.activity_type === 'connection_established')
  const requestActivities = activities.filter(a => a.activity_type === 'request_received')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FarmerNav />
        <main className="container py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading activity...</span>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FarmerNav />
        <main className="container py-8">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Activity</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchActivity}>Retry</Button>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FarmerNav />
      
      <main className="container py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-2">Activity Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Track your connection activity and performance</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalConnections}</p>
                  <p className="text-sm text-muted-foreground">Total Connections</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.acceptedRequests}</p>
                  <p className="text-sm text-muted-foreground">Accepted Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.responseRate}%</p>
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recent" className="text-sm">Recent Activity</TabsTrigger>
            <TabsTrigger value="connections" className="text-sm">Connections</TabsTrigger>
            <TabsTrigger value="requests" className="text-sm">Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest connection activities</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${getActivityColor(activity.activity_type, activity.direction)}`}>
                        <div className="flex items-start gap-3">
                          {getActivityIcon(activity.activity_type, activity.direction)}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm">{getActivityTitle(activity)}</h4>
                            <p className="text-sm opacity-80 mt-1">{getActivityDescription(activity)}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-3 w-3" />
                              <span className="text-xs">{formatDate(activity.activity_date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
                    <p className="text-muted-foreground">Your recent activities will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Connection History
                </CardTitle>
                <CardDescription>All your established connections</CardDescription>
              </CardHeader>
              <CardContent>
                {connectionActivities.length > 0 ? (
                  <div className="space-y-4">
                    {connectionActivities.map((activity, index) => (
                      <div key={index} className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-emerald-800">
                              Connected with {activity.consumer_name || activity.farmer_name}
                            </h4>
                            <p className="text-sm text-emerald-700 mt-1">
                              {activity.product_interest && `${activity.product_interest} (${activity.quantity})`}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Calendar className="h-3 w-3 text-emerald-600" />
                              <span className="text-xs text-emerald-600">{formatDate(activity.activity_date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Connections Yet</h3>
                    <p className="text-muted-foreground">Your established connections will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Request History
                </CardTitle>
                <CardDescription>All connection requests you've received</CardDescription>
              </CardHeader>
              <CardContent>
                {requestActivities.length > 0 ? (
                  <div className="space-y-4">
                    {requestActivities.map((activity, index) => (
                      <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-blue-800">
                              Request from {activity.consumer_name}
                            </h4>
                            <p className="text-sm text-blue-700 mt-1">
                              {activity.product_interest} ({activity.quantity})
                            </p>
                            {activity.activity_description && (
                              <p className="text-sm text-blue-600 mt-1 italic">
                                "{activity.activity_description}"
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="h-3 w-3 text-blue-600" />
                              <span className="text-xs text-blue-600">{formatDate(activity.activity_date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Requests Yet</h3>
                    <p className="text-muted-foreground">Connection requests you receive will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
