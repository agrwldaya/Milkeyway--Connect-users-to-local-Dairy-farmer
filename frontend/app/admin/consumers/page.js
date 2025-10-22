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
  TrendingUp
} from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { toast } from "sonner";

export default function AdminConsumers() {
  const [consumers, setConsumers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Fetch consumers data
  useEffect(() => {
    fetchConsumers();
    fetchStats();
  }, []);

  const fetchConsumers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/v1/admin/consumers', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setConsumers(data.consumers || []);
      } else {
        console.error('Failed to fetch consumers');
        toast.error('Failed to fetch consumers', { description: data.message || 'Please try again.' });
      }
    } catch (error) {
      console.error('Error fetching consumers:', error);
      toast.error('Error fetching consumers', { description: error.message || 'Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/v1/admin/consumers/stats', {
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

  const handleActivate = async (consumerId) => {
    try {
      setActionLoading(true);
      const response = await fetch(`http://localhost:4000/api/v1/admin/consumers/${consumerId}/activate`, {
        method: 'PATCH',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Refresh consumers list
        await fetchConsumers();
        await fetchStats();
        toast.info('Consumer activated successfully');
      } else {
        toast.error('Failed to activate consumer');
      }
    } catch (error) {
      console.error('Error activating consumer:', error);
      toast.error('Error activating consumer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async (consumerId) => {
    try {
      setActionLoading(true);
      const response = await fetch(`http://localhost:4000/api/v1/admin/consumers/${consumerId}/deactivate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reason: deactivateReason })
      });
      
      if (response.ok) {
        // Refresh consumers list
        await fetchConsumers();
        await fetchStats();
        setDeactivateDialogOpen(false);
        setDeactivateReason("");
        toast.info('Consumer deactivated successfully');
      } else {
        toast.error('Failed to deactivate consumer');
      }
    } catch (error) {
      console.error('Error deactivating consumer:', error);
      toast.error('Error deactivating consumer');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Inactive</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredConsumers = consumers.filter(consumer => {
    const matchesSearch = consumer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        consumer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        consumer.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || consumer.user_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <main className="container py-8 px-5">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading consumers...</p>
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-2">Consumers Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage and monitor all consumers on the platform</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Consumers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total_consumers || consumers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All consumers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats?.active_consumers || consumers.filter(c => c.user_status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Active consumers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {stats?.inactive_consumers || consumers.filter(c => c.user_status === 'inactive').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Inactive consumers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">With Profiles</CardTitle>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats?.consumers_with_profiles || consumers.filter(c => c.profile).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Complete profiles</p>
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
                    placeholder="Search by name, email, or phone..."
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
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consumers List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredConsumers.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-24 sm:h-32">
                <div className="text-center">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm sm:text-base text-muted-foreground">No consumers found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredConsumers.map((consumer) => (
              <Card key={consumer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                        <h3 className="text-base sm:text-lg font-semibold">{consumer.name}</h3>
                        <div className="flex flex-wrap gap-2">
                          {getStatusBadge(consumer.user_status)}
                          {consumer.profile && (
                            <Badge variant="outline" className="text-blue-600">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Profile Complete
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{consumer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{consumer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2 lg:col-span-1">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{consumer.location?.city}, {consumer.location?.state}</span>
                        </div>
                      </div>

                      {consumer.profile && (
                        <div className="mb-4">
                          <h4 className="font-medium text-sm mb-1">Profile Details</h4>
                          <p className="text-sm text-muted-foreground">
                            <strong>Address:</strong> {consumer.profile.address || 'Not provided'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Preferred Radius:</strong> {consumer.profile.preferred_radius_km || 'N/A'} km
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>Joined: {new Date(consumer.user_created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:ml-4 lg:min-w-fit">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedConsumer(consumer)}
                        className="w-full sm:w-auto"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      
                      {consumer.user_status === 'draft' || consumer.user_status === 'inactive' ? (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                          onClick={() => handleActivate(consumer.id)}
                          disabled={actionLoading}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Activate
                        </Button>
                      ) : consumer.user_status === 'active' ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedConsumer(consumer);
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
                          {consumer.user_status}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Consumer Details Dialog */}
        <Dialog open={!!selectedConsumer} onOpenChange={() => setSelectedConsumer(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Consumer Details</DialogTitle>
              <DialogDescription>
                Complete information about {selectedConsumer?.name}
              </DialogDescription>
            </DialogHeader>
            
            {selectedConsumer && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Personal Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedConsumer.name}</p>
                      <p><strong>Email:</strong> {selectedConsumer.email}</p>
                      <p><strong>Phone:</strong> {selectedConsumer.phone}</p>
                      <p><strong>Status:</strong> {selectedConsumer.user_status}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Location Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Country:</strong> {selectedConsumer.location?.country || 'Not provided'}</p>
                      <p><strong>State:</strong> {selectedConsumer.location?.state || 'Not provided'}</p>
                      <p><strong>City:</strong> {selectedConsumer.location?.city || 'Not provided'}</p>
                      <p><strong>Pincode:</strong> {selectedConsumer.location?.pincode || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {selectedConsumer.profile && (
                  <div>
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Profile Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Address:</strong> {selectedConsumer.profile.address || 'Not provided'}</p>
                      <p><strong>Preferred Radius:</strong> {selectedConsumer.profile.preferred_radius_km || 'N/A'} km</p>
                      <p><strong>Profile Status:</strong> {selectedConsumer.profile.status}</p>
                      {selectedConsumer.profile.landmark && (
                        <p><strong>Landmark:</strong> {selectedConsumer.profile.landmark}</p>
                      )}
                      {selectedConsumer.profile.profile_image_url && (
                        <p><strong>Profile Image:</strong> <a href={selectedConsumer.profile.profile_image_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">View</a></p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Joined: {new Date(selectedConsumer.user_created_at).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Deactivate Dialog */}
        <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
          <DialogContent className="max-w-md sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Deactivate Consumer</DialogTitle>
              <DialogDescription>
                Please provide a reason for deactivating {selectedConsumer?.name}
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
                onClick={() => handleDeactivate(selectedConsumer?.id)}
                disabled={!deactivateReason.trim() || actionLoading}
                className="w-full sm:w-auto"
              >
                Deactivate Consumer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
