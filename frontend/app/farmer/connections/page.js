"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, Users, MessageCircle, Phone, Mail, Calendar, Clock, Edit, Trash2, Eye } from "lucide-react"
import { FarmerNav } from "@/components/farmer-nav"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function FarmerConnectionsPage() {
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState(null)
  const [connectionNotes, setConnectionNotes] = useState("")
  const [notesLoading, setNotesLoading] = useState(false)
  const [deactivateLoading, setDeactivateLoading] = useState(false)

  const fetchConnections = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("http://localhost:4000/api/v1/connections/farmer/connections", {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.success) {
        setConnections(data.connections)
      } else {
        setError(data.message || "Failed to fetch connections")
        toast.error("Failed to fetch connections", { description: data.message || "Please try again." })
      }
    } catch (err) {
      console.error("Error fetching connections:", err)
      setError("Failed to fetch connections")
      toast.error("Network error", { description: "Could not connect to the server." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConnections()
  }, [])

  const handleUpdateNotes = async () => {
    if (!selectedConnection) return

    setNotesLoading(true)
    try {
      const response = await fetch(`http://localhost:4000/api/v1/connections/connections/${selectedConnection.connection_id}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          notes: connectionNotes
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Notes updated successfully!")
        setNotesDialogOpen(false)
        setSelectedConnection(null)
        setConnectionNotes("")
        fetchConnections() // Refresh connections
      } else {
        toast.error("Failed to update notes", { description: data.message || "Please try again." })
      }
    } catch (err) {
      console.error("Error updating notes:", err)
      toast.error("Network error", { description: "Failed to update notes. Please check your connection." })
    } finally {
      setNotesLoading(false)
    }
  }

  const handleDeactivateConnection = async (connectionId) => {
    setDeactivateLoading(true)
    try {
      const response = await fetch(`http://localhost:4000/api/v1/connections/connections/${connectionId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Connection deactivated successfully!")
        fetchConnections() // Refresh connections
      } else {
        toast.error("Failed to deactivate connection", { description: data.message || "Please try again." })
      }
    } catch (err) {
      console.error("Error deactivating connection:", err)
      toast.error("Network error", { description: "Failed to deactivate connection. Please check your connection." })
    } finally {
      setDeactivateLoading(false)
    }
  }

  const openNotesDialog = (connection) => {
    setSelectedConnection(connection)
    setConnectionNotes(connection.connection_notes || "")
    setNotesDialogOpen(true)
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

  const getConnectionDuration = (connectedAt) => {
    const now = new Date()
    const connected = new Date(connectedAt)
    const diffTime = Math.abs(now - connected)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return "1 day"
    if (diffDays < 30) return `${diffDays} days`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`
    return `${Math.floor(diffDays / 365)} years`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FarmerNav />
        <main className="container py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading connections...</span>
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
            <h2 className="text-xl font-semibold mb-2">Error Loading Connections</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchConnections}>Retry</Button>
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold mb-2">My Connections</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your active consumer connections</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{connections.length}</p>
                  <p className="text-sm text-muted-foreground">Active Connections</p>
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
                  <p className="text-2xl font-bold text-gray-900">
                    {connections.filter(c => c.last_interaction_at).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Recent Interactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {connections.length > 0 ? getConnectionDuration(connections[0].connected_at) : "0"}
                  </p>
                  <p className="text-sm text-muted-foreground">Longest Connection</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connections List */}
        {connections.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {connections.map((connection) => (
              <Card key={connection.connection_id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg font-semibold truncate">{connection.consumer_name}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          Connected {getConnectionDuration(connection.connected_at)} ago
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Contact Information */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{connection.consumer_email}</span>
                    </div>
                    {connection.consumer_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{connection.consumer_phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Connection Details */}
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>Connected: {formatDate(connection.connected_at)}</span>
                    </div>
                    {connection.last_interaction_at && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span>Last interaction: {formatDate(connection.last_interaction_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* Connection Notes */}
                  {connection.connection_notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 mb-1">Notes:</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{connection.connection_notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openNotesDialog(connection)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Edit Notes</span>
                      <span className="sm:hidden">Notes</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeactivateConnection(connection.connection_id)}
                      disabled={deactivateLoading}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Deactivate</span>
                      <span className="sm:hidden">Remove</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Active Connections</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any active connections yet. Accept some connection requests to get started.
            </p>
            <Button asChild>
              <a href="/farmer/requests">View Connection Requests</a>
            </Button>
          </Card>
        )}
      </main>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Connection Notes</DialogTitle>
            <CardDescription className="text-sm">
              Add or update notes for your connection with {selectedConnection?.consumer_name}
            </CardDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes" className="text-sm font-medium">Connection Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this connection..."
                value={connectionNotes}
                onChange={(e) => setConnectionNotes(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setNotesDialogOpen(false)}
              disabled={notesLoading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateNotes}
              disabled={notesLoading}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {notesLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Notes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
