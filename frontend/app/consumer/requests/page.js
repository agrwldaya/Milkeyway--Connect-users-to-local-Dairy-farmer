'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Phone, 
  MapPin,
  Calendar,
  AlertCircle,
  UserCheck,
  Send,
  RefreshCw
} from 'lucide-react';
import { ConsumerNav } from '@/components/consumer-nav';

export default function MyRequestsPage() {
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchRequestsData();
  }, []);

  const fetchRequestsData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/v1/connections/my-requests', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      
      const data = await response.json();
      setConnectionRequests(data.requests || []);

    } catch (error) {
      console.error('Error fetching requests data:', error);
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

  const getFilteredRequests = () => {
    switch (activeTab) {
      case 'pending':
        return connectionRequests.filter(req => req.status === 'pending');
      case 'accepted':
        return connectionRequests.filter(req => req.status === 'accepted');
      case 'rejected':
        return connectionRequests.filter(req => req.status === 'rejected');
      default:
        return connectionRequests;
    }
  };

  const filteredRequests = getFilteredRequests();

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
                <p className="break-words">Error loading requests: {error}</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const pendingCount = connectionRequests.filter(req => req.status === 'pending').length;
  const acceptedCount = connectionRequests.filter(req => req.status === 'accepted').length;
  const rejectedCount = connectionRequests.filter(req => req.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <ConsumerNav />

      <main className="container mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Requests</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Track your connection requests to farmers
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="all" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
              <Send className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">All</span>
              <span className="xs:hidden">All</span>
              <span className="ml-1">({connectionRequests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Pending</span>
              <span className="xs:hidden">Pending</span>
              <span className="ml-1">({pendingCount})</span>
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Accepted</span>
              <span className="xs:hidden">Accepted</span>
              <span className="ml-1">({acceptedCount})</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Rejected</span>
              <span className="xs:hidden">Rejected</span>
              <span className="ml-1">({rejectedCount})</span>
            </TabsTrigger>
          </TabsList>

        <TabsContent value={activeTab} className="mt-4 sm:mt-6">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="text-center py-6 sm:py-8">
                  <Send className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    {activeTab === 'all' ? 'No Requests Sent' : `No ${activeTab} Requests`}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {activeTab === 'all' 
                      ? "You haven't sent any connection requests to farmers yet."
                      : `You don't have any ${activeTab} requests at the moment.`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                          <AvatarImage src="/farm_cover.jpg" />
                          <AvatarFallback className="text-xs sm:text-sm">
                            {getInitials(request.farmer_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg truncate">{request.farm_name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1 text-sm">
                            <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{request.farmer_name}</span>
                          </CardDescription>
                        </div>
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
                    
                    {request.status === 'pending' && (
                      <>
                        <Separator className="my-3 sm:my-4" />
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button variant="outline" size="sm" className="flex items-center justify-center gap-2 flex-1 sm:flex-none">
                            <RefreshCw className="h-4 w-4" />
                            <span className="hidden xs:inline">Refresh Status</span>
                            <span className="xs:hidden">Refresh</span>
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center justify-center gap-2 flex-1 sm:flex-none">
                            <MessageSquare className="h-4 w-4" />
                            <span className="hidden xs:inline">Send Follow-up</span>
                            <span className="xs:hidden">Follow-up</span>
                          </Button>
                        </div>
                      </>
                    )}
                    
                    {request.status === 'accepted' && (
                      <>
                        <Separator className="my-3 sm:my-4" />
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button variant="default" size="sm" className="flex items-center justify-center gap-2 flex-1 sm:flex-none">
                            <MessageSquare className="h-4 w-4" />
                            <span className="hidden xs:inline">Start Conversation</span>
                            <span className="xs:hidden">Message</span>
                          </Button>
                          <Button variant="outline" size="sm" className="flex items-center justify-center gap-2 flex-1 sm:flex-none">
                            <Phone className="h-4 w-4" />
                            <span className="hidden xs:inline">Call Farmer</span>
                            <span className="xs:hidden">Call</span>
                          </Button>
                        </div>
                      </>
                    )}
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
