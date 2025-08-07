import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Play, 
  Pause,
  MoreHorizontal,
  FileText,
  MapPin,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

interface BookingData {
  id: string;
  scheduled_date: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  total_amount: number;
  status: string;
  payment_status: string;
  screen: {
    screen_name: string;
    address: string;
    city: string;
  };
  content_uploads: {
    file_name: string;
    file_type: string;
    file_url: string;
  }[];
}

const BroadcasterDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalSpent: 0,
    upcomingBookings: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserBookings();
  }, [user, navigate]);

  const fetchUserBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          screens!inner(screen_name, address, city),
          content_uploads(file_name, file_type, file_url)
        `)
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedBookings: BookingData[] = data?.map(booking => ({
        id: booking.id,
        scheduled_date: booking.scheduled_date,
        scheduled_start_time: booking.scheduled_start_time,
        scheduled_end_time: booking.scheduled_end_time,
        total_amount: booking.total_amount,
        status: booking.status,
        payment_status: booking.payment_status,
        screen: {
          screen_name: (booking as any).screens.screen_name,
          address: (booking as any).screens.address,
          city: (booking as any).screens.city,
        },
        content_uploads: Array.isArray(booking.content_uploads) ? booking.content_uploads : []
      })) || [];

      setBookings(transformedBookings);
      
      // Calculate stats
      const now = new Date();
      const totalSpent = data?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;
      const activeBookings = data?.filter(booking => 
        booking.status === 'confirmed' && 
        new Date(booking.scheduled_date) >= now
      ).length || 0;
      const upcomingBookings = data?.filter(booking => 
        new Date(booking.scheduled_date) > now
      ).length || 0;

      setStats({
        totalBookings: data?.length || 0,
        activeBookings,
        totalSpent,
        upcomingBookings
      });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error loading bookings",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-700';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700';
      case 'cancelled':
        return 'bg-red-500/10 text-red-700';
      case 'completed':
        return 'bg-blue-500/10 text-blue-700';
      default:
        return 'bg-gray-500/10 text-gray-700';
    }
  };

  const formatTime = (time: string) => {
    return format(new Date(`2000-01-01T${time}`), 'h:mm a');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Campaigns
            </h1>
            <p className="text-muted-foreground">
              Manage your broadcasts and view campaign performance
            </p>
          </div>
          <Button onClick={() => navigate('/discover')} className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            New Campaign
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{stats.activeBookings}</p>
                </div>
                <Play className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold">{stats.upcomingBookings}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">
                    ${stats.totalSpent / 100}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <Card className="text-center p-12">
            <CardContent>
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-6">
                Start broadcasting your content by booking your first screen
              </p>
              <Button onClick={() => navigate('/discover')}>
                <Play className="h-4 w-4 mr-2" />
                Find Screens to Book
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{booking.screen.screen_name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {booking.screen.address}, {booking.screen.city}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/confirmation/${booking.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {booking.status === 'pending' && (
                            <DropdownMenuItem className="text-red-600">
                              <Pause className="h-4 w-4 mr-2" />
                              Cancel Booking
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Booking Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-muted-foreground">
                        {format(new Date(booking.scheduled_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-muted-foreground">
                        {formatTime(booking.scheduled_start_time)} - {formatTime(booking.scheduled_end_time)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Amount</p>
                      <p className="text-muted-foreground">${booking.total_amount / 100}</p>
                    </div>
                    <div>
                      <p className="font-medium">Payment</p>
                      <Badge variant={booking.payment_status === 'paid' ? 'default' : 'secondary'}>
                        {booking.payment_status}
                      </Badge>
                    </div>
                  </div>

                  {/* Content Preview */}
                  {booking.content_uploads.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-medium">Content</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {booking.content_uploads.map((content, index) => (
                          <div key={index} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm">
                            <span>{content.file_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {content.file_type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BroadcasterDashboard;