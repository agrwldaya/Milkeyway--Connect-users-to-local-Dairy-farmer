"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  AlertCircle,
  UserCheck,
  UserX,
  Activity,
  TrendingUp,
  Link as LinkIcon,
  Store,
  ShoppingCart,
  MessageCircle
} from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { toast } from "sonner";

export default function AdminConnections() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Fetch connections data
  useEffect(() => {
    fetchConnections();
    fetchStats();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/v1/admin/connections', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
      } else {
        console.error('Failed to fetch connections');
        toast.error('Failed to fetch connections', { description: 'Please try again.' });
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast.error('Error fetching connections', { description: error.message || 'Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/v1/admin/connections/stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        console.error('Failed to fetch stats');
        toast.error('Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Error fetching stats', { description: error.message || 'Please try again.' });
    }
  };

  const handleDeactivate = async (connectionId) => {
    try {
      setActionLoading(true);
      const response = await fetch(`http://localhost:4000/api/v1/admin/connections/${connectionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reason: deactivateReason })
      });
      
      if (response.ok) {
        // Refresh connections list
        await fetchConnections();
        await fetchStats();
        setDeactivateDialogOpen(false);
        setDeactivateReason("");
        toast.info('Connection deactivated successfully');
      } else {
        toast.error('Failed to deactivate connection');
      }
    } catch (error) {
      console.error('Error deactivating connection:', error);
      toast.error('Error deactivating connection');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>;
    }
  };

  const filteredConnections = connections.filter(connection => {
    const matchesSearch = 
      connection.consumer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.farmer.farm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.consumer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.farmer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && connection.is_active) ||
      (statusFilter === "inactive" && !connection.is_active);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <main className="container py-4 sm:py-6 lg:py-8 px-4 sm:px-5">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading connections...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      <main className="container py-4 sm:py-6 lg:py-8 px-4 sm:px-5">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-2">Connections Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage and monitor all farmer-consumer connections</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total_connections || connections.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All connections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats?.active_connections || connections.filter(c => c.is_active).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Active connections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats?.connections_this_week || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">New this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {stats?.connections_this_month || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">New this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by consumer, farmer, farm, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connections List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredConnections.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-24 sm:h-32">
                <div className="text-center">
                  <LinkIcon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm sm:text-base text-muted-foreground">No connections found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredConnections.map((connection) => (
              <Card key={connection.connection_id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                        <h3 className="text-base sm:text-lg font-semibold">
                          {connection.consumer.name} ↔ {connection.farmer.name}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {getStatusBadge(connection.is_active)}
                        </div>
                      </div>
                      
                      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{connection.consumer.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Store className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{connection.farmer.farm_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2 lg:col-span-1">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{connection.farmer.farm_address}</span>
                        </div>
                      </div>

                      {connection.request && (
                        <div className="mb-4">
                          <h4 className="font-medium text-sm mb-1">Request Details</h4>
                          <p className="text-sm text-muted-foreground">
                            <strong>Product Interest:</strong> {connection.request.product_interest || 'Not specified'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Quantity:</strong> {connection.request.quantity || 'Not specified'}
                          </p>
                          {connection.request.preferred_time && (
                            <p className="text-sm text-muted-foreground">
                              <strong>Preferred Time:</strong> {connection.request.preferred_time}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>Connected: {new Date(connection.connected_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:ml-4 lg:min-w-fit">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedConnection(connection)}
                        className="w-full sm:w-auto"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      
                      {connection.is_active ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedConnection(connection);
                            setDeactivateDialogOpen(true);
                          }}
                          disabled={actionLoading}
                          className="w-full sm:w-auto"
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Deactivate
                        </Button>
                      ) : (
                        <div className="text-sm text-muted-foreground text-center sm:text-left">
                          Connection Inactive
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Connection Details Dialog */}
        <Dialog open={!!selectedConnection} onOpenChange={() => setSelectedConnection(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Connection Details</DialogTitle>
              <DialogDescription>
                Complete information about this connection
              </DialogDescription>
            </DialogHeader>
            
            {selectedConnection && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Consumer Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedConnection.consumer.name}</p>
                      <p><strong>Email:</strong> {selectedConnection.consumer.email}</p>
                      <p><strong>Phone:</strong> {selectedConnection.consumer.phone}</p>
                      <p><strong>Status:</strong> {selectedConnection.consumer.status}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Farmer Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedConnection.farmer.name}</p>
                      <p><strong>Email:</strong> {selectedConnection.farmer.email}</p>
                      <p><strong>Phone:</strong> {selectedConnection.farmer.phone}</p>
                      <p><strong>Farm:</strong> {selectedConnection.farmer.farm_name}</p>
                      <p><strong>Address:</strong> {selectedConnection.farmer.farm_address}</p>
                    </div>
                  </div>
                </div>

                {selectedConnection.request && (
                  <div>
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Request Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Product Interest:</strong> {selectedConnection.request.product_interest || 'Not specified'}</p>
                      <p><strong>Quantity:</strong> {selectedConnection.request.quantity || 'Not specified'}</p>
                      {selectedConnection.request.preferred_time && (
                        <p><strong>Preferred Time:</strong> {selectedConnection.request.preferred_time}</p>
                      )}
                      {selectedConnection.request.contact_method && (
                        <p><strong>Contact Method:</strong> {selectedConnection.request.contact_method}</p>
                      )}
                      {selectedConnection.request.message && (
                        <p><strong>Message:</strong> {selectedConnection.request.message}</p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2 text-sm sm:text-base">Connection Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Status:</strong> {selectedConnection.is_active ? 'Active' : 'Inactive'}</p>
                    <p><strong>Connected:</strong> {new Date(selectedConnection.connected_at).toLocaleDateString()}</p>
                    {selectedConnection.last_interaction_at && (
                      <p><strong>Last Interaction:</strong> {new Date(selectedConnection.last_interaction_at).toLocaleDateString()}</p>
                    )}
                    {selectedConnection.connection_notes && (
                      <p><strong>Notes:</strong> {selectedConnection.connection_notes}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Deactivate Dialog */}
        <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
          <DialogContent className="max-w-md sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Deactivate Connection</DialogTitle>
              <DialogDescription>
                Please provide a reason for deactivating this connection
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <Textarea
                placeholder="Enter deactivation reason..."
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setDeactivateDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDeactivate(selectedConnection?.connection_id)}
                disabled={!deactivateReason.trim() || actionLoading}
                className="w-full sm:w-auto"
              >
                Deactivate Connection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
