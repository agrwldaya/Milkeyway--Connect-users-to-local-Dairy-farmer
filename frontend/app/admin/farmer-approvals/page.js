"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, Shield, CheckCircle, XCircle, Eye, MapPin, Phone, Mail, Calendar, FileText, Image, User, ExternalLink } from "lucide-react"
import { AdminNav } from "@/components/admin-nav"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function FarmerApprovalsPage() {
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFarmer, setSelectedFarmer] = useState(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState(null) // 'approve' or 'reject'
  const [rejectionReason, setRejectionReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all") // 'all', 'pending', 'rejected'
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState(null)

  const fetchFarmers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:4000/api/v1/admin/farmers/pending", {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        setFarmers(data.farmers)
      } else {
        setError(data.message || "Failed to fetch farmers")
        toast.error("Failed to fetch farmers", { description: data.message || "Please try again." })
      }
    } catch (err) {
      console.error("Error fetching farmers:", err)
      setError("Failed to fetch farmers")
      toast.error("Network error", { description: "Could not connect to the server." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFarmers()
  }, [])

  const handleAction = async () => {
    if (!selectedFarmer || !actionType) return

    setActionLoading(true)
    try {
      const endpoint = actionType === 'approve' 
        ? `http://localhost:4000/api/v1/admin/farmers/${selectedFarmer.id}/approve`
        : `http://localhost:4000/api/v1/admin/farmers/${selectedFarmer.id}/reject`

      const body = actionType === 'reject' ? { reason: rejectionReason } : {}

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(`Farmer ${actionType}d successfully!`)
        setActionDialogOpen(false)
        setSelectedFarmer(null)
        setRejectionReason("")
        fetchFarmers() // Refresh the list
      } else {
        toast.error(`Failed to ${actionType} farmer`, { description: data.message || "Please try again." })
      }
    } catch (err) {
      console.error(`Error ${actionType}ing farmer:`, err)
      toast.error("Network error", { description: `Failed to ${actionType} farmer. Please check your connection.` })
    } finally {
      setActionLoading(false)
    }
  }

  const openActionDialog = (farmer, type) => {
    setSelectedFarmer(farmer)
    setActionType(type)
    setActionDialogOpen(true)
  }

  const openDocumentViewer = (farmer) => {
    setSelectedDocuments(farmer.documents)
    setDocumentViewerOpen(true)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredFarmers = farmers.filter(farmer => 
    filterStatus === 'all' || farmer.profile.status === filterStatus
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <main className="container py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading farmer approvals...</span>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNav />
        <main className="container py-8">
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Farmers</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchFarmers}>Retry</Button>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      
      <main className="container py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-2">Farmer Approvals</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Review and approve farmer applications</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{farmers.filter(f => f.profile.status === 'draft' || f.profile.status === 'pending').length}</p>
                  <p className="text-sm text-muted-foreground">Pending Approval</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{farmers.filter(f => f.profile.status === 'rejected').length}</p>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{farmers.length}</p>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All Applications", count: farmers.length },
              { key: "pending", label: "Pending", count: farmers.filter(f => f.profile.status === 'pending').length },
              { key: "rejected", label: "Rejected", count: farmers.filter(f => f.profile.status === 'rejected').length },
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={filterStatus === filter.key ? "default" : "outline"}
                onClick={() => setFilterStatus(filter.key)}
                className="flex items-center gap-2 text-xs sm:text-sm"
                size="sm"
              >
                <span className="hidden sm:inline">{filter.label}</span>
                <span className="sm:hidden">{filter.label.split(' ')[0]}</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {filter.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Farmers List */}
        {filteredFarmers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFarmers.map((farmer) => (
              <Card key={farmer.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg font-semibold truncate">{farmer.name}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          {farmer.profile.farm_name}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(farmer.profile.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Contact Information */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{farmer.email}</span>
                    </div>
                    {farmer.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{farmer.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{farmer.profile.address}</span>
                    </div>
                  </div>

                  {/* Farm Details */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>Applied: {formatDate(farmer.profile.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span>Documents: {farmer.documents.is_doc_verified ? 'Verified' : 'Pending'}</span>
                    </div>
                  </div>

                  {/* Documents Preview */}
                  {(farmer.documents.farmer_proof_doc_url || farmer.documents.farm_image_url || farmer.documents.farmer_image_url) && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-700">Documents:</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDocumentViewer(farmer)}
                          className="h-6 px-2 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        {farmer.documents.farm_image_url && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <Image className="h-3 w-3" />
                            Farm Image
                          </div>
                        )}
                        {farmer.documents.farmer_image_url && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <Image className="h-3 w-3" />
                            Farmer Image
                          </div>
                        )}
                        {farmer.documents.farmer_proof_doc_url && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <FileText className="h-3 w-3" />
                            Proof Document
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openActionDialog(farmer, 'approve')}
                      className="flex-1"
                      disabled={farmer.profile.status === 'approved'}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Approve</span>
                      <span className="sm:hidden">Approve</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openActionDialog(farmer, 'reject')}
                      className="flex-1"
                      disabled={farmer.profile.status === 'rejected'}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Reject</span>
                      <span className="sm:hidden">Reject</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No {filterStatus} Applications</h3>
            <p className="text-muted-foreground mb-4">
              There are no farmer applications matching your criteria.
            </p>
          </Card>
        )}
      </main>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {actionType === 'approve' ? 'Approve Farmer' : 'Reject Farmer'}
            </DialogTitle>
            <CardDescription className="text-sm">
              {actionType === 'approve' 
                ? `Approve ${selectedFarmer?.name}'s farmer application?`
                : `Reject ${selectedFarmer?.name}'s farmer application?`
              }
            </CardDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Farmer Details:</p>
              <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                <p className="text-sm"><strong>Name:</strong> {selectedFarmer?.name}</p>
                <p className="text-sm"><strong>Farm:</strong> {selectedFarmer?.profile.farm_name}</p>
                <p className="text-sm"><strong>Email:</strong> {selectedFarmer?.email}</p>
                <p className="text-sm"><strong>Address:</strong> {selectedFarmer?.profile.address}</p>
              </div>
            </div>
            
            {actionType === 'reject' && (
              <div>
                <Label htmlFor="reason" className="text-sm font-medium">Rejection Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            )}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={actionLoading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={actionLoading}
              className={`w-full sm:w-auto order-1 sm:order-2 ${
                actionType === 'approve' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionType === 'approve' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Farmer
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Farmer
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Dialog */}
      <Dialog open={documentViewerOpen} onOpenChange={setDocumentViewerOpen}>
        <DialogContent className="w-[95vw] max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Farmer Documents</DialogTitle>
            <CardDescription className="text-sm">
              Review all documents submitted by {selectedFarmer?.name}
            </CardDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {selectedDocuments && (
              <>
                {/* Farm Image */}
                {selectedDocuments.farm_image_url && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      Farm Image
                    </h4>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <img 
                        src={selectedDocuments.farm_image_url} 
                        alt="Farm Image" 
                        className="w-full h-64 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'block'
                        }}
                      />
                      <div className="hidden text-center py-8 text-gray-500">
                        <Image className="h-12 w-12 mx-auto mb-2" />
                        <p>Image could not be loaded</p>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(selectedDocuments.farm_image_url, '_blank')}
                          className="text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open in New Tab
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Farmer Image */}
                {selectedDocuments.farmer_image_url && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Farmer Image
                    </h4>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <img 
                        src={selectedDocuments.farmer_image_url} 
                        alt="Farmer Image" 
                        className="w-full h-64 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'block'
                        }}
                      />
                      <div className="hidden text-center py-8 text-gray-500">
                        <User className="h-12 w-12 mx-auto mb-2" />
                        <p>Image could not be loaded</p>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(selectedDocuments.farmer_image_url, '_blank')}
                          className="text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open in New Tab
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Proof Document */}
                {selectedDocuments.farmer_proof_doc_url && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Proof Document
                    </h4>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-8 w-8 text-blue-500" />
                          <div>
                            <p className="font-medium text-sm">Farmer Proof Document</p>
                            <p className="text-xs text-gray-500">Click to view document</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(selectedDocuments.farmer_proof_doc_url, '_blank')}
                          className="text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open Document
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Documents Message */}
                {!selectedDocuments.farm_image_url && !selectedDocuments.farmer_image_url && !selectedDocuments.farmer_proof_doc_url && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Documents Available</h3>
                    <p className="text-muted-foreground">This farmer has not uploaded any documents yet.</p>
                  </div>
                )}
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setDocumentViewerOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
