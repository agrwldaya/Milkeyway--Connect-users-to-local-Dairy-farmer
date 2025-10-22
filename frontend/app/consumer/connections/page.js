'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Phone, 
  MapPin,
  Calendar,
  AlertCircle,
  UserCheck,
  UserX
} from 'lucide-react';
import { ConsumerNav } from '@/components/consumer-nav';

export default function MyConnectionsPage() {
  const [activeConnections, setActiveConnections] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('connections');

  useEffect(() => {
    fetchConnectionsData();
  }, []);

  const fetchConnectionsData = async () => {
    try {
      setLoading(true);
      
      // Fetch active connections
      const connectionsResponse = await fetch('/api/v1/connections/my-connections', {
        credentials: 'include'
      });
      
      if (!connectionsResponse.ok) {
        throw new Error('Failed to fetch connections');
      }
      
      const connectionsData = await connectionsResponse.json();
      setActiveConnections(connectionsData.connections || []);

      // Fetch connection requests
      const requestsResponse = await fetch('/api/v1/connections/my-requests', {
        credentials: 'include'
      });
      
      if (!requestsResponse.ok) {
        throw new Error('Failed to fetch requests');
      }
      
      const requestsData = await requestsResponse.json();
      setConnectionRequests(requestsData.requests || []);

    } catch (error) {
      console.error('Error fetching connections data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'secondary', icon: Clock, text: 'Pending' },
      accepted: { variant: 'default', icon: CheckCircle, text: 'Accepted' },
      rejected: { variant: 'destructive', icon: XCircle, text: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ConsumerNav />
        <main className="container mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ConsumerNav />
        <main className="container mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
          <Card className="border-destructive">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center gap-2 text-destructive text-sm sm:text-base">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="break-words">Error loading connections: {error}</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsumerNav />

      <main className="container mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Connections</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Manage your connections with farmers and track your requests
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="connections" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Active Connections</span>
              <span className="xs:hidden">Connections</span>
              <span className="ml-1">({activeConnections.length})</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">My Requests</span>
              <span className="xs:hidden">Requests</span>
              <span className="ml-1">({connectionRequests.length})</span>
            </TabsTrigger>
          </TabsList>

        <TabsContent value="connections" className="mt-4 sm:mt-6">
          {activeConnections.length === 0 ? (
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="text-center py-6 sm:py-8">
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No Active Connections</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    You don't have any active connections with farmers yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6">
              {activeConnections.map((connection) => (
                <Card key={connection.connection_id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                          <AvatarImage src={connection.farm_image_url} />
                          <AvatarFallback className="text-xs sm:text-sm">
                            {getInitials(connection.farmer_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg truncate">{connection.farm_name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1 text-sm">
                            <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{connection.farmer_name}</span>
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="default" className="flex items-center gap-1 w-fit text-xs">
                        <CheckCircle className="h-3 w-3" />
                        Connected
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span className="break-words">{connection.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span className="break-all">{connection.farmer_phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>Connected on {formatDate(connection.connected_at)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Delivery Radius:</span> {connection.delivery_radius_km} km
                        </div>
                        {connection.connection_notes && (
                          <div className="text-sm">
                            <span className="font-medium">Notes:</span> <span className="break-words">{connection.connection_notes}</span>
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">
                          Last interaction: {formatDate(connection.last_interaction_at)}
                        </div>
                      </div>
                    </div>
                    <Separator className="my-3 sm:my-4" />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" size="sm" className="flex items-center justify-center gap-2 flex-1 sm:flex-none">
                        <MessageSquare className="h-4 w-4" />
                        <span className="hidden xs:inline">Message</span>
                        <span className="xs:hidden">Msg</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center justify-center gap-2 flex-1 sm:flex-none">
                        <Phone className="h-4 w-4" />
                        <span className="hidden xs:inline">Call</span>
                        <span className="xs:hidden">Call</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center justify-center gap-2 flex-1 sm:flex-none">
                        <UserX className="h-4 w-4" />
                        <span className="hidden xs:inline">Disconnect</span>
                        <span className="xs:hidden">Disconnect</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-4 sm:mt-6">
          {connectionRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="text-center py-6 sm:py-8">
                  <Clock className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">No Requests Sent</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    You haven't sent any connection requests to farmers yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6">
              {connectionRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base sm:text-lg truncate">{request.farm_name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1 text-sm">
                          <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{request.farmer_name}</span>
                        </CardDescription>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Product Interest:</span> <span className="break-words">{request.product_interest}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Quantity:</span> <span className="break-words">{request.quantity}</span>
                        </div>
                        {request.preferred_time && (
                          <div className="text-sm">
                            <span className="font-medium">Preferred Time:</span> <span className="break-words">{request.preferred_time}</span>
                          </div>
                        )}
                        <div className="text-sm">
                          <span className="font-medium">Contact Method:</span> {request.contact_method}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Sent on {formatDate(request.created_at)}
                        </div>
                        {request.response_at && (
                          <div className="text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            Responded on {formatDate(request.response_at)}
                          </div>
                        )}
                        {request.farmer_response && (
                          <div className="text-sm">
                            <span className="font-medium">Farmer Response:</span> <span className="break-words">{request.farmer_response}</span>
                          </div>
                        )}
                        {request.message && (
                          <div className="text-sm">
                            <span className="font-medium">Your Message:</span> <span className="break-words">{request.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </main>
    </div>
  );
}
