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
  MoreHorizontal
} from "lucide-react";
import { AdminNav } from "@/components/admin-nav";

export default function AdminFarmers() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch farmers data
  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/v1/admin/farmers', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setFarmers(data.farmers || []);
      } else {
        console.error('Failed to fetch farmers');
      }
    } catch (error) {
      console.error('Error fetching farmers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (farmerId) => {
    try {
      setActionLoading(true);
      const response = await fetch(`http://localhost:4000/api/v1/admin/farmers/${farmerId}/approve`, {
        method: 'PATCH',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Refresh farmers list
        await fetchFarmers();
        alert('Farmer approved successfully');
      } else {
        alert('Failed to approve farmer');
      }
    } catch (error) {
      console.error('Error approving farmer:', error);
      alert('Error approving farmer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (farmerId) => {
    try {
      setActionLoading(true);
      const response = await fetch(`http://localhost:4000/api/v1/admin/farmers/${farmerId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reason: rejectReason })
      });
      
      if (response.ok) {
        // Refresh farmers list
        await fetchFarmers();
        setRejectDialogOpen(false);
        setRejectReason("");
        alert('Farmer rejected successfully');
      } else {
        alert('Failed to reject farmer');
      }
    } catch (error) {
      console.error('Error rejecting farmer:', error);
      alert('Error rejecting farmer');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="h-3 w-3 mr-1" />Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch = farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        farmer.profile?.farm_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        farmer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || farmer.profile?.status === statusFilter;
    
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
              <p className="text-muted-foreground">Loading farmers...</p>
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-2">Farmers Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage and monitor all farmers on the platform</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Farmers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{farmers.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All farmers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {farmers.filter(f => f.profile?.status === 'approved').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Active farmers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {farmers.filter(f => f.profile?.status === 'pending' || f.profile?.status === 'draft').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {farmers.filter(f => f.profile?.status === 'rejected').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Rejected farmers</p>
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
                    placeholder="Search by name, farm, or email..."
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
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Farmers List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredFarmers.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-24 sm:h-32">
                <div className="text-center">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm sm:text-base text-muted-foreground">No farmers found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredFarmers.map((farmer) => (
              <Card key={farmer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                        <h3 className="text-base sm:text-lg font-semibold">{farmer.name}</h3>
                        <div className="flex flex-wrap gap-2">
                          {getStatusBadge(farmer.profile?.status)}
                        </div>
                      </div>
                      
                      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{farmer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{farmer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2 lg:col-span-1">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{farmer.profile?.address}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-1">Farm Details</h4>
                        <p className="text-sm text-muted-foreground">
                          <strong>Farm Name:</strong> {farmer.profile?.farm_name || 'Not provided'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong>Delivery Radius:</strong> {farmer.profile?.delivery_radius_km || 'N/A'} km
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>Joined: {new Date(farmer.user_created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:ml-4 lg:min-w-fit">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFarmer(farmer)}
                        className="w-full sm:w-auto"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      
                      {farmer.profile?.status === 'pending' || farmer.profile?.status === 'draft' ? (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                            onClick={() => handleApprove(farmer.id)}
                            disabled={actionLoading}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedFarmer(farmer);
                              setRejectDialogOpen(true);
                            }}
                            disabled={actionLoading}
                            className="w-full sm:w-auto"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground text-center sm:text-left">
                          {farmer.profile?.status === 'approved' ? 'Approved' : 'Rejected'}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Farmer Details Dialog */}
        <Dialog open={!!selectedFarmer} onOpenChange={() => setSelectedFarmer(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Farmer Details</DialogTitle>
              <DialogDescription>
                Complete information about {selectedFarmer?.name}
              </DialogDescription>
            </DialogHeader>
            
            {selectedFarmer && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Personal Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedFarmer.name}</p>
                      <p><strong>Email:</strong> {selectedFarmer.email}</p>
                      <p><strong>Phone:</strong> {selectedFarmer.phone}</p>
                      <p><strong>Status:</strong> {selectedFarmer.user_status}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Farm Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Farm Name:</strong> {selectedFarmer.profile?.farm_name || 'Not provided'}</p>
                      <p><strong>Address:</strong> {selectedFarmer.profile?.address || 'Not provided'}</p>
                      <p><strong>Delivery Radius:</strong> {selectedFarmer.profile?.delivery_radius_km || 'N/A'} km</p>
                      <p><strong>Profile Status:</strong> {selectedFarmer.profile?.status}</p>
                    </div>
                  </div>
                </div>

                {selectedFarmer.documents && (
                  <div>
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Documents</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Document Verified:</strong> {selectedFarmer.documents.is_doc_verified ? 'Yes' : 'No'}</p>
                      {selectedFarmer.documents.farm_image_url && (
                        <p><strong>Farm Image:</strong> <a href={selectedFarmer.documents.farm_image_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">View</a></p>
                      )}
                      {selectedFarmer.documents.farmer_image_url && (
                        <p><strong>Farmer Image:</strong> <a href={selectedFarmer.documents.farmer_image_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">View</a></p>
                      )}
                      {selectedFarmer.documents.farmer_proof_doc_url && (
                        <p><strong>Proof Document:</strong> <a href={selectedFarmer.documents.farmer_proof_doc_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">View</a></p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Joined: {new Date(selectedFarmer.user_created_at).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="max-w-md sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Reject Farmer</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting {selectedFarmer?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleReject(selectedFarmer?.id)}
                disabled={!rejectReason.trim() || actionLoading}
                className="w-full sm:w-auto"
              >
                Reject Farmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
