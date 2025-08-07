import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Monitor, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Shield, 
  Settings,
  AlertTriangle,
  TrendingUp,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  FileText,
  Clock,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { format } from "date-fns";

interface AdminStats {
  totalUsers: number;
  totalScreens: number;
  totalBookings: number;
  totalRevenue: number;
  activeScreens: number;
  pendingBookings: number;
  thisMonthRevenue: number;
  thisMonthBookings: number;
}

interface UserData {
  id: string;
  email: string;
  display_name: string;
  role: 'broadcaster' | 'screen_owner' | 'admin';
  created_at: string;
  last_sign_in_at: string;
}

interface ScreenData {
  id: string;
  screen_name: string;
  owner_email: string;
  city: string;
  is_active: boolean;
  price_per_hour: number;
  created_at: string;
  bookings_count: number;
}

interface BookingData {
  id: string;
  user_email: string;
  screen_name: string;
  scheduled_date: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAdmin, loading: rolesLoading } = useUserRoles();
  
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalScreens: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeScreens: 0,
    pendingBookings: 0,
    thisMonthRevenue: 0,
    thisMonthBookings: 0
  });
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [screens, setScreens] = useState<ScreenData[]>([]);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!rolesLoading && !isAdmin()) {
      navigate('/');
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive"
      });
      return;
    }
    
    if (!rolesLoading && isAdmin()) {
      fetchAdminData();
    }
  }, [user, isAdmin, rolesLoading, navigate]);

  const fetchAdminData = async () => {
    try {
      // Fetch users with profiles
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('user_id, display_name, role, created_at')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch all screens first
      const { data: allScreens, error: screensError } = await supabase
        .from('screens')
        .select('*')
        .order('created_at', { ascending: false });

      if (screensError) throw screensError;

      // Get owner info and booking counts separately
      let processedScreens: ScreenData[] = [];
      if (allScreens) {
        processedScreens = await Promise.all(
          allScreens.map(async (screen) => {
            const { data: ownerData } = await supabase
              .from('profiles')
              .select('display_name, user_id')
              .eq('user_id', screen.owner_id)
              .maybeSingle();
            
            const { data: bookingData } = await supabase
              .from('bookings')
              .select('id')
              .eq('screen_id', screen.id);
            
            return {
              id: screen.id,
              screen_name: screen.screen_name || 'Unnamed Screen',
              owner_email: ownerData?.display_name || 'Unknown Owner',
              city: screen.city || 'Unknown City',
              is_active: screen.is_active,
              price_per_hour: screen.price_per_hour || 0,
              created_at: screen.created_at,
              bookings_count: bookingData?.length || 0
            };
          })
        );
      }

      // Fetch all bookings first
      const { data: allBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Get related user and screen data separately
      let processedBookings: BookingData[] = [];
      if (allBookings) {
        processedBookings = await Promise.all(
          allBookings.map(async (booking) => {
            const { data: userData } = await supabase
              .from('profiles')
              .select('display_name, user_id')
              .eq('user_id', booking.user_id)
              .maybeSingle();
            
            const { data: screenData } = await supabase
              .from('screens')
              .select('screen_name, id')
              .eq('id', booking.screen_id)
              .maybeSingle();
            
            return {
              id: booking.id,
              user_email: userData?.display_name || 'Unknown User',
              screen_name: screenData?.screen_name || 'Unknown Screen',
              scheduled_date: booking.scheduled_date,
              total_amount: booking.total_amount,
              status: booking.status,
              payment_status: booking.payment_status,
              created_at: booking.created_at
            };
          })
        );
      }

      // Process users data
      const processedUsers: UserData[] = usersData?.map(user => ({
        id: user.user_id,
        email: user.user_id.slice(0, 8) + '...', // Shortened ID as email placeholder
        display_name: user.display_name || 'Unknown User',
        role: user.role as 'broadcaster' | 'screen_owner' | 'admin',
        created_at: user.created_at,
        last_sign_in_at: user.created_at // Placeholder
      })) || [];

      // Calculate stats
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const totalRevenue = processedBookings.reduce((sum, booking) => sum + booking.total_amount, 0);
      const thisMonthBookings = processedBookings.filter(booking => 
        new Date(booking.created_at) >= thisMonth
      );
      const thisMonthRevenue = thisMonthBookings.reduce((sum, booking) => sum + booking.total_amount, 0);

      setStats({
        totalUsers: processedUsers.length,
        totalScreens: processedScreens.length,
        totalBookings: processedBookings.length,
        totalRevenue,
        activeScreens: processedScreens.filter(s => s.is_active).length,
        pendingBookings: processedBookings.filter(b => b.status === 'pending').length,
        thisMonthRevenue,
        thisMonthBookings: thisMonthBookings.length
      });

      setUsers(processedUsers);
      setScreens(processedScreens);
      setBookings(processedBookings);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error loading data",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'broadcaster' | 'screen_owner' | 'admin') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      ));

      toast({
        title: "User role updated",
        description: `User role changed to ${newRole}`,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error updating user role",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));

      toast({
        title: "Booking status updated",
        description: `Booking ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        title: "Error updating booking",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleScreenStatus = async (screenId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('screens')
        .update({ is_active: !currentStatus })
        .eq('id', screenId);

      if (error) throw error;

      setScreens(prev => prev.map(screen => 
        screen.id === screenId 
          ? { ...screen, is_active: !currentStatus }
          : screen
      ));

      toast({
        title: !currentStatus ? "Screen activated" : "Screen deactivated",
        description: "Screen status updated successfully.",
      });
    } catch (error) {
      console.error("Error updating screen:", error);
      toast({
        title: "Error updating screen",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredScreens = screens.filter(screen =>
    screen.screen_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    screen.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    screen.owner_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter(booking =>
    booking.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.screen_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || rolesLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Platform management and analytics overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="lg">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="lg">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 mb-8">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Users</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Platform wide</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Active Screens</p>
                  <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{stats.activeScreens}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">of {stats.totalScreens} total</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-full">
                  <Monitor className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/50 dark:to-violet-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-violet-700 dark:text-violet-300">Total Revenue</p>
                  <p className="text-3xl font-bold text-violet-900 dark:text-violet-100">
                    ${(stats.totalRevenue / 100).toFixed(0)}
                  </p>
                  <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">All time</p>
                </div>
                <div className="p-3 bg-violet-500/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">This Month</p>
                  <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{stats.thisMonthBookings}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">${(stats.thisMonthRevenue / 100).toFixed(0)} revenue</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-full">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b bg-muted/5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Platform Management</CardTitle>
                <CardDescription>Manage users, screens, bookings, and platform settings</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full lg:w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b">
                <TabsList className="grid w-full grid-cols-4 h-auto p-0 bg-transparent">
                  <TabsTrigger value="overview" className="py-4">Overview</TabsTrigger>
                  <TabsTrigger value="users" className="py-4">Users ({stats.totalUsers})</TabsTrigger>
                  <TabsTrigger value="screens" className="py-4">Screens ({stats.totalScreens})</TabsTrigger>
                  <TabsTrigger value="bookings" className="py-4">Bookings ({stats.totalBookings})</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="mt-0 p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Pending Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Pending bookings</span>
                          <Badge variant="outline">{stats.pendingBookings}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Inactive screens</span>
                          <Badge variant="outline">{stats.totalScreens - stats.activeScreens}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        Quick Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Average booking value</span>
                          <span className="font-medium">
                            ${stats.totalBookings > 0 ? ((stats.totalRevenue / stats.totalBookings) / 100).toFixed(2) : '0.00'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Screen utilization</span>
                          <span className="font-medium">
                            {stats.totalScreens > 0 ? ((stats.activeScreens / stats.totalScreens) * 100).toFixed(0) : 0}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users" className="mt-0">
                <div className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.slice(0, 10).map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.display_name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(user.created_at), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => updateUserRole(user.id, 'broadcaster')}>
                                  Set as Broadcaster
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateUserRole(user.id, 'screen_owner')}>
                                  Set as Screen Owner
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateUserRole(user.id, 'admin')}>
                                  Set as Admin
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="screens" className="mt-0">
                <div className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Screen</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Bookings</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredScreens.slice(0, 10).map((screen) => (
                        <TableRow key={screen.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{screen.screen_name}</div>
                              <div className="text-sm text-muted-foreground">${(screen.price_per_hour / 100).toFixed(2)}/hr</div>
                            </div>
                          </TableCell>
                          <TableCell>{screen.owner_email}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              {screen.city}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={screen.is_active ? "default" : "secondary"}>
                              {screen.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>{screen.bookings_count}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => toggleScreenStatus(screen.id, screen.is_active)}>
                                  {screen.is_active ? (
                                    <>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="bookings" className="mt-0">
                <div className="p-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Screen</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.slice(0, 10).map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>{booking.user_email}</TableCell>
                          <TableCell>{booking.screen_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {format(new Date(booking.scheduled_date), 'MMM dd, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${(booking.total_amount / 100).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="capitalize">
                                {booking.status}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {booking.payment_status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'confirmed')}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'cancelled')}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;