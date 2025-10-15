"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Phone, Mail, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function ConnectionRequest({ farmer, onRequestSent }) {
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [requestForm, setRequestForm] = useState({
    productInterest: '',
    quantity: '',
    preferredTime: '',
    contactMethod: 'phone',
    message: ''
  })

  const handleRequestSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/v1/connections/send-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          farmerId: farmer.id,
          ...requestForm
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setRequestSent(true)
        setRequestDialogOpen(false)
        onRequestSent && onRequestSent()
        // Reset form
        setRequestForm({
          productInterest: '',
          quantity: '',
          preferredTime: '',
          contactMethod: 'phone',
          message: ''
        })
      } else {
        alert(data.message || 'Failed to send request')
      }
    } catch (err) {
      console.error('Error sending request:', err)
      alert('Failed to send request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Success Message */}
      {requestSent && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800">Connection Request Sent!</p>
            <p className="text-sm text-green-600">The farmer will review your request and respond soon.</p>
          </div>
        </div>
      )}

      {/* Connection Request Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogTrigger asChild>
          <Button size="lg" variant="outline" className="w-full">
            <MessageCircle className="h-5 w-5 mr-2" />
            Send Connection Request
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect with {farmer.name}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div>
              <Label htmlFor="productInterest">What products are you interested in?</Label>
              <Input
                id="productInterest"
                placeholder="e.g., Fresh milk, Ghee, Paneer, Curd"
                value={requestForm.productInterest}
                onChange={(e) => setRequestForm({...requestForm, productInterest: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="quantity">How much do you need?</Label>
              <Input
                id="quantity"
                placeholder="e.g., 2 liters daily, 1 kg weekly"
                value={requestForm.quantity}
                onChange={(e) => setRequestForm({...requestForm, quantity: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="preferredTime">When would you like delivery?</Label>
              <Input
                id="preferredTime"
                placeholder="e.g., Morning, Evening, Weekends"
                value={requestForm.preferredTime}
                onChange={(e) => setRequestForm({...requestForm, preferredTime: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="contactMethod">How should the farmer contact you?</Label>
              <select
                id="contactMethod"
                className="w-full p-2 border rounded-md"
                value={requestForm.contactMethod}
                onChange={(e) => setRequestForm({...requestForm, contactMethod: e.target.value})}
              >
                <option value="phone">Phone Call</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="message">Additional message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Any specific requirements or questions..."
                value={requestForm.message}
                onChange={(e) => setRequestForm({...requestForm, message: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRequestDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Connection Status Component
export function ConnectionStatus({ request }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex items-center gap-2">
      {getStatusIcon(request.status)}
      <Badge className={getStatusColor(request.status)}>
        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
      </Badge>
    </div>
  )
}

// My Connections Component
export function MyConnections({ connections }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">My Connected Farmers</h3>
      {connections.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No connections yet</p>
            <p className="text-sm text-gray-500">Send connection requests to farmers to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {connections.map((connection) => (
            <Card key={connection.connection_id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold">{connection.farm_name}</h4>
                    <p className="text-sm text-gray-600">by {connection.farmer_name}</p>
                    <p className="text-sm text-gray-500 mt-1">{connection.address}</p>
                    
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{connection.farmer_phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{connection.farmer_email}</span>
                      </div>
                    </div>
                    
                    {connection.connection_notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <strong>Notes:</strong> {connection.connection_notes}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    <p>Connected: {new Date(connection.connected_at).toLocaleDateString()}</p>
                    <p>Last interaction: {new Date(connection.last_interaction_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
