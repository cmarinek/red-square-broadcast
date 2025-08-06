import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { CreditCard, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { format } from "date-fns";

interface BookingDetails {
  id: string;
  screen: {
    screen_name: string;
    address: string;
    city: string;
  };
  content: {
    file_name: string;
    file_type: string;
  };
  scheduled_date: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  total_amount: number;
  status: string;
}

export default function Payment() {
  const { screenId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const bookingId = searchParams.get('bookingId');
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          screen:screens(screen_name, address, city),
          content:content_uploads(file_name, file_type)
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      setBooking(data);
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast({
        title: "Error loading booking",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    if (!booking) return;

    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update booking status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          status: 'confirmed',
          stripe_session_id: `sim_${Date.now()}` // Simulated payment ID
        })
        .eq('id', booking.id);

      if (updateError) throw updateError;

      toast({
        title: "Payment successful!",
        description: "Your booking has been confirmed."
      });

      // Navigate to confirmation
      navigate(`/confirmation/${booking.id}`);

    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/2"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
            <Button onClick={() => navigate("/discover")}>
              Back to Discovery
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/book/${screenId}/schedule?contentId=${booking.content.file_name}`)}
              className="mb-4"
              disabled={processing}
            >
              ← Back to Scheduling
            </Button>
            
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Complete Your Payment
            </h1>
            <p className="text-muted-foreground">
              Review your booking details and complete the payment
            </p>
          </div>

          <div className="space-y-6">
            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Screen:</span>
                    <p className="text-muted-foreground">
                      {booking.screen.screen_name || "Digital Screen"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Location:</span>
                    <p className="text-muted-foreground">
                      {booking.screen.address}, {booking.screen.city}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Content:</span>
                    <p className="text-muted-foreground">{booking.content.file_name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>
                    <Badge variant="outline" className="capitalize">
                      {booking.content.file_type}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>
                    <p className="text-muted-foreground">
                      {format(new Date(booking.scheduled_date), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Time:</span>
                    <p className="text-muted-foreground">
                      {booking.scheduled_start_time} - {booking.scheduled_end_time}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Broadcast time:</span>
                    <span>
                      {Math.round(
                        (new Date(`1970-01-01T${booking.scheduled_end_time}`).getTime() - 
                         new Date(`1970-01-01T${booking.scheduled_start_time}`).getTime()) / 
                        (1000 * 60 * 60)
                      )} hour(s)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base rate:</span>
                    <span>${((booking.total_amount * 0.95) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform fee (5%):</span>
                    <span>${((booking.total_amount * 0.05) / 100).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-base">
                    <span>Total:</span>
                    <span>${(booking.total_amount / 100).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
                <CardDescription>
                  Secure payment processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-6 rounded-lg text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Stripe Payment Integration</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    In a real implementation, this would redirect to Stripe Checkout
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span>Secured by 256-bit SSL encryption</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/book/${screenId}/schedule`)}
                disabled={processing}
                className="flex-1"
              >
                Back to Scheduling
              </Button>
              <Button 
                onClick={processPayment}
                disabled={processing}
                className="flex-1"
              >
                {processing ? "Processing..." : `Pay $${(booking.total_amount / 100).toFixed(2)}`}
              </Button>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                By proceeding with payment, you agree to our Terms of Service and Privacy Policy.
                Your booking will be confirmed immediately after successful payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}