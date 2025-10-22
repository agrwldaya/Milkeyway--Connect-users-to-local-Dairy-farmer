"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Search, Filter, Eye, Trash2, Edit, Calendar, User, Phone, Mail, MapPin } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch requests data
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
      
      const response = await fetch(`http://localhost:4000/api/v1/admin/requests?${params}`, {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to fetch requests");
      
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/v1/admin/requests/stats", {
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
    fetchRequests();
    fetchStats();
  }, [searchTerm, statusFilter]);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedRequest || !newStatus) return;

    try {
      setActionLoading(true);
      const response = await fetch(`http://localhost:4000/api/v1/admin/requests/${selectedRequest.request_id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: newStatus,
          admin_notes: adminNotes,
        }),
      });

      if (!response.ok) throw new Error("Failed to update request status");

      toast.success("Request status updated successfully");
      setUpdateDialogOpen(false);
      setSelectedRequest(null);
      setNewStatus("");
      setAdminNotes("");
      fetchRequests();
      fetchStats();
    } catch (error) {
      console.error("Error updating request status:", error);
      toast.error("Failed to update request status");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete request
  const handleDelete = async () => {
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      const response = await fetch(`http://localhost:4000/api/v1/admin/requests/${selectedRequest.request_id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete request");

      toast.success("Request deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedRequest(null);
      fetchRequests();
      fetchStats();
    } catch (error) {
      console.error("Error deleting request:", error);
      toast.error("Failed to delete request");
    } finally {
      setActionLoading(false);
    }
  };

  // Get status badge variant
  const getStatusBadge = (status) => {
    const variants = {
      pending: "default",
      accepted: "default",
      rejected: "destructive",
      completed: "secondary",
    };
    return variants[status] || "default";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="py-4 sm:py-6 lg:py-8 px-4 sm:px-5">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Request Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage and monitor all farmer-consumer requests
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_requests || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending_requests || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.accepted_requests || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.acceptance_rate || 0}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by consumer, farmer, product, or message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading requests...</div>
            </div>
          ) : requests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-gray-500">No requests found</div>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.request_id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <h3 className="font-semibold text-lg">{request.product_interest}</h3>
                        <Badge variant={getStatusBadge(request.status)} className="w-fit">
                          {request.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <User className="h-4 w-4" />
                            <span className="font-medium">Consumer:</span>
                          </div>
                          <div className="text-gray-900">{request.consumer_name}</div>
                          <div className="text-gray-500">{request.consumer_email}</div>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <User className="h-4 w-4" />
                            <span className="font-medium">Farmer:</span>
                          </div>
                          <div className="text-gray-900">{request.farmer_name}</div>
                          <div className="text-gray-500">{request.farm_name}</div>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 text-gray-600 mb-1">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Requested:</span>
                          </div>
                          <div className="text-gray-900">{formatDate(request.created_at)}</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm">
                        <div className="text-gray-600 mb-1">
                          <strong>Quantity:</strong> {request.quantity}
                        </div>
                        {request.preferred_time && (
                          <div className="text-gray-600 mb-1">
                            <strong>Preferred Time:</strong> {request.preferred_time}
                          </div>
                        )}
                        {request.message && (
                          <div className="text-gray-600">
                            <strong>Message:</strong> {request.message}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setViewDialogOpen(true);
                        }}
                        className="w-full sm:w-auto"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setNewStatus(request.status);
                          setUpdateDialogOpen(true);
                        }}
                        className="w-full sm:w-auto"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Update
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setDeleteDialogOpen(true);
                        }}
                        className="w-full sm:w-auto"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* View Request Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Request Details</DialogTitle>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-6">
                {/* Request Info */}
                <div>
                  <h4 className="font-medium mb-3 text-sm sm:text-base">Request Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Product Interest:</strong> {selectedRequest.product_interest}
                    </div>
                    <div>
                      <strong>Quantity:</strong> {selectedRequest.quantity}
                    </div>
                    <div>
                      <strong>Status:</strong> 
                      <Badge variant={getStatusBadge(selectedRequest.status)} className="ml-2">
                        {selectedRequest.status}
                      </Badge>
                    </div>
                    <div>
                      <strong>Created:</strong> {formatDate(selectedRequest.created_at)}
                    </div>
                    {selectedRequest.preferred_time && (
                      <div>
                        <strong>Preferred Time:</strong> {selectedRequest.preferred_time}
                      </div>
                    )}
                    {selectedRequest.contact_method && (
                      <div>
                        <strong>Contact Method:</strong> {selectedRequest.contact_method}
                      </div>
                    )}
                  </div>
                  {selectedRequest.message && (
                    <div className="mt-4">
                      <strong>Message:</strong>
                      <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                        {selectedRequest.message}
                      </p>
                    </div>
                  )}
                </div>

                {/* Consumer Info */}
                <div>
                  <h4 className="font-medium mb-3 text-sm sm:text-base">Consumer Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span><strong>Name:</strong> {selectedRequest.consumer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span><strong>Email:</strong> {selectedRequest.consumer_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span><strong>Phone:</strong> {selectedRequest.consumer_phone}</span>
                    </div>
                    <div>
                      <strong>Status:</strong> 
                      <Badge variant={selectedRequest.consumer_status === 'active' ? 'default' : 'secondary'} className="ml-2">
                        {selectedRequest.consumer_status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Farmer Info */}
                <div>
                  <h4 className="font-medium mb-3 text-sm sm:text-base">Farmer Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span><strong>Name:</strong> {selectedRequest.farmer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span><strong>Email:</strong> {selectedRequest.farmer_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span><strong>Phone:</strong> {selectedRequest.farmer_phone}</span>
                    </div>
                    <div>
                      <strong>Farm:</strong> {selectedRequest.farm_name}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span><strong>Address:</strong> {selectedRequest.farm_address}</span>
                    </div>
                    <div>
                      <strong>Status:</strong> 
                      <Badge variant={selectedRequest.farmer_status === 'active' ? 'default' : 'secondary'} className="ml-2">
                        {selectedRequest.farmer_status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Response Info */}
                {selectedRequest.farmer_response && (
                  <div>
                    <h4 className="font-medium mb-3 text-sm sm:text-base">Farmer Response</h4>
                    <div className="p-3 bg-gray-50 rounded-md text-sm">
                      {selectedRequest.farmer_response}
                    </div>
                    {selectedRequest.response_at && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Responded:</strong> {formatDate(selectedRequest.response_at)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Update Status Dialog */}
        <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
          <DialogContent className="max-w-md sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Update Request Status</DialogTitle>
              <DialogDescription>
                Change the status of this request
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Admin Notes (Optional)</label>
                <Textarea
                  placeholder="Add admin notes..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setUpdateDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button 
                onClick={handleStatusUpdate}
                disabled={!newStatus || actionLoading}
                className="w-full sm:w-auto"
              >
                {actionLoading ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Delete Request</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this request? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={actionLoading}
                className="w-full sm:w-auto"
              >
                {actionLoading ? "Deleting..." : "Delete Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
