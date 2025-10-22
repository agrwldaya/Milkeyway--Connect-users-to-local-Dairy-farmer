"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  MessageCircle, 
  User, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Loader2,
  AlertCircle
} from "lucide-react"
import { FarmerNav } from "@/components/farmer-nav"
import { toast } from "sonner"

export default function FarmerRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [responseDialogOpen, setResponseDialogOpen] = useState(false)
  const [responseLoading, setResponseLoading] = useState(false)
  const [responseMessage, setResponseMessage] = useState("")
  const [filterStatus, setFilterStatus] = useState("all") // all, pending, accepted, rejected

  // Fetch requests
  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:4000/api/v1/connections/farmer/requests', {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        setRequests(data.requests || [])
      } else {
        setError(data.message || "Failed to fetch requests")
      }
    } catch (err) {
      console.error("Error fetching requests:", err)
      setError("Failed to fetch requests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  // Handle request response
  const handleRequestResponse = async (action) => {
    if (!selectedRequest) return

    setResponseLoading(true)
    try {
      const response = await fetch(`http://localhost:4000/api/v1/connections/farmer/requests/${selectedRequest.id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: action, // 'accept' or 'reject'
          responseMessage: responseMessage
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(`Request ${action}ed successfully!`)
        setResponseDialogOpen(false)
        setSelectedRequest(null)
        setResponseMessage("")
        // Refresh requests
        await fetchRequests()
      } else {
        toast.error(data.message || `Failed to ${action} request`)
      }
    } catch (err) {
      console.error(`Error ${action}ing request:`, err)
      toast.error(`Failed to ${action} request`)
    } finally {
      setResponseLoading(false)
    }
  }

  // Filter requests by status
  const filteredRequests = requests.filter(request => {
    if (filterStatus === "all") return true
    return request.status === filterStatus
  })

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending': return 'secondary'
      case 'accepted': return 'default'
      case 'rejected': return 'destructive'
      default: return 'secondary'
    }
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FarmerNav />
        <main className="container py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading requests...</span>
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
            <h2 className="text-xl font-semibold mb-2">Error Loading Requests</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchRequests}>Try Again</Button>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <FarmerNav />

      <main className="container py-8 px-5">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-2">Connection Requests</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage consumer connection requests</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All Requests", count: requests.length },
              { key: "pending", label: "Pending", count: requests.filter(r => r.status === 'pending').length },
              { key: "accepted", label: "Accepted", count: requests.filter(r => r.status === 'accepted').length },
              { key: "rejected", label: "Rejected", count: requests.filter(r => r.status === 'rejected').length },
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

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Requests Found</h3>
              <p className="text-muted-foreground">
                {filterStatus === "all" 
                  ? "You haven't received any connection requests yet."
                  : `No ${filterStatus} requests found.`
                }
              </p>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-base sm:text-lg truncate">{request.consumer_name}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Requested {formatDate(request.created_at)}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(request.status)} className="self-start sm:self-center">
                          {request.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium">Product:</span>
                            <span className="text-xs sm:text-sm truncate">{request.product_interest}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium">Quantity:</span>
                            <span className="text-xs sm:text-sm">{request.quantity}</span>
                          </div>
                          {request.preferred_time && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs sm:text-sm font-medium">Time:</span>
                              <span className="text-xs sm:text-sm">{request.preferred_time}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium">Contact:</span>
                            <span className="text-xs sm:text-sm capitalize">{request.contact_method}</span>
                          </div>
                          {request.message && (
                            <div className="flex items-start gap-2">
                              <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <span className="text-xs sm:text-sm font-medium">Message:</span>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{request.message}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {request.farmer_response && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium text-blue-800">Your Response:</span>
                          </div>
                          <p className="text-xs sm:text-sm text-blue-700">{request.farmer_response}</p>
                          {request.response_at && (
                            <p className="text-xs text-blue-600 mt-1">
                              Responded on {formatDate(request.response_at)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0 lg:ml-4">
                      {request.status === 'pending' && (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request)
                              setResponseDialogOpen(true)
                            }}
                            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Accept</span>
                            <span className="sm:hidden">Accept</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedRequest(request)
                              setResponseDialogOpen(true)
                            }}
                            className="w-full sm:w-auto"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Reject</span>
                            <span className="sm:hidden">Reject</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Response Dialog */}
        <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
          <DialogContent className="w-[95vw] max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                {selectedRequest?.status === 'pending' ? 'Respond to Request' : 'Request Details'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {selectedRequest && (
                  <>
                    Respond to {selectedRequest.consumer_name}'s request for {selectedRequest.product_interest}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="response" className="text-sm font-medium">Response Message (Optional)</Label>
                <Textarea
                  id="response"
                  placeholder="Add a message for the consumer..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setResponseDialogOpen(false)
                  setSelectedRequest(null)
                  setResponseMessage("")
                }}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-1 sm:order-2">
                <Button
                  onClick={() => handleRequestResponse('accept')}
                  disabled={responseLoading}
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                >
                  {responseLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Request
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleRequestResponse('reject')}
                  disabled={responseLoading}
                  className="w-full sm:w-auto"
                >
                  {responseLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Request
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
