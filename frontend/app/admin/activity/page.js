"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Store, 
  UserCheck, 
  MessageCircle, 
  CheckCircle, 
  XCircle,
  Activity,
  Clock,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Users,
  RefreshCw
} from "lucide-react";
import { AdminNav } from "@/components/admin-nav";

export default function AdminActivityPage() {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activityTypeFilter, setActivityTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);

  const itemsPerPage = 20;

  // Fetch activities data
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (activityTypeFilter !== "all") params.append("activity_type", activityTypeFilter);
      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);
      params.append("limit", itemsPerPage.toString());
      params.append("offset", ((currentPage - 1) * itemsPerPage).toString());
      
      const response = await fetch(`http://localhost:4000/api/v1/admin/activity?${params}`, {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to fetch activities");
      
      const data = await response.json();
      setActivities(data.activities || []);
      setTotalActivities(data.pagination?.total || 0);
      setTotalPages(Math.ceil((data.pagination?.total || 0) / itemsPerPage));
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast.error("Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/v1/admin/activity/stats", {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to fetch stats");
      
      const data = await response.json();
      setStats(data.stats || {});
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, [currentPage, activityTypeFilter, dateFrom, dateTo]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchActivities();
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchActivities();
    fetchStats();
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
      case 'request_accepted':
        return CheckCircle;
      case 'request_rejected':
        return XCircle;
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
      case 'request_accepted':
        return "bg-emerald-100 text-emerald-600";
      case 'request_rejected':
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Get activity badge variant
  const getActivityBadge = (activityType) => {
    const variants = {
      farmer_registration: "default",
      consumer_registration: "secondary",
      connection_established: "default",
      request_sent: "outline",
      request_accepted: "default",
      request_rejected: "destructive",
    };
    return variants[activityType] || "default";
  };

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

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return formatDate(dateString);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="py-4 sm:py-6 lg:py-8 px-4 sm:px-5">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Activity Log
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Monitor all platform activities and user interactions
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline" className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_activities || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary">+{stats.activities_this_week || 0}</span> this week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registrations</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(stats.farmer_registrations || 0) + (stats.consumer_registrations || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Farmers: {stats.farmer_registrations || 0} • Consumers: {stats.consumer_registrations || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connections</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.connections_established || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                New connections established
              </p>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requests</CardTitle>
              <MessageCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.requests_sent || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Sent: {stats.requests_sent || 0} • Accepted: {stats.requests_accepted || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="w-full lg:w-48">
                <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="farmer_registration">Farmer Registrations</SelectItem>
                    <SelectItem value="consumer_registration">Consumer Registrations</SelectItem>
                    <SelectItem value="connection_established">Connections</SelectItem>
                    <SelectItem value="request_sent">Requests Sent</SelectItem>
                    <SelectItem value="request_accepted">Requests Accepted</SelectItem>
                    <SelectItem value="request_rejected">Requests Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full lg:w-48">
                <Input
                  type="date"
                  placeholder="From date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="w-full lg:w-48">
                <Input
                  type="date"
                  placeholder="To date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              <Button onClick={handleSearch} className="w-full lg:w-auto">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activities List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading activities...</div>
            </div>
          ) : activities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-gray-500">No activities found</div>
              </CardContent>
            </Card>
          ) : (
            activities.map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.activity_type);
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getActivityColor(activity.activity_type)}`}>
                          <ActivityIcon className="h-6 w-6" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{activity.description}</h3>
                            <Badge variant={getActivityBadge(activity.activity_type)} className="w-fit">
                              {activity.activity_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="flex items-center gap-2 text-gray-600 mb-1">
                                <User className="h-4 w-4" />
                                <span className="font-medium">Actor:</span>
                              </div>
                              <div className="text-gray-900">{activity.actor_name}</div>
                              <div className="text-gray-500">{activity.actor_email}</div>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 text-gray-600 mb-1">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">Time:</span>
                              </div>
                              <div className="text-gray-900">{formatDate(activity.activity_date)}</div>
                              <div className="text-gray-500">{formatRelativeTime(activity.activity_date)}</div>
                            </div>
                            
                            {activity.location && (
                              <div>
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                  <MapPin className="h-4 w-4" />
                                  <span className="font-medium">Location:</span>
                                </div>
                                <div className="text-gray-900">{activity.location}</div>
                              </div>
                            )}
                          </div>
                          
                          {activity.actor_phone && (
                            <div className="mt-3 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="h-4 w-4" />
                                <span><strong>Phone:</strong> {activity.actor_phone}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10 h-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Activity Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">This Month</span>
                </div>
                <p className="text-2xl font-bold">{stats.activities_this_month || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Total activities</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-medium">New Users</span>
                </div>
                <p className="text-2xl font-bold">
                  {(stats.farmer_registrations || 0) + (stats.consumer_registrations || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Registrations this month</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">Success Rate</span>
                </div>
                <p className="text-2xl font-bold">
                  {stats.requests_sent > 0 
                    ? Math.round((stats.requests_accepted / stats.requests_sent) * 100) 
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Request acceptance rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
