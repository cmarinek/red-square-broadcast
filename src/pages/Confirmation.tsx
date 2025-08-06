import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Calendar, MapPin, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { format } from "date-fns";

interface BookingDetails {
  id: string;
  screen: { screen_name: string; address: string; city: string; };
  content: { file_name: string; file_type: string; };
  scheduled_date: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  total_amount: number;
}

export default function Confirmation() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetails | null>(null);

  useEffect(() => {
    if (bookingId) fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    const { data } = await supabase
      .from('bookings')
      .select(`*, screen:screens(screen_name, address, city), content:content_uploads(file_name, file_type)`)
      .eq('id', bookingId)
      .single();
    setBooking(data);
  };

  if (!booking) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
          <p className="text-muted-foreground mb-8">Your content is scheduled to broadcast</p>
          
          <Card className="text-left mb-8">
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Screen:</strong> {booking.screen.screen_name}</div>
                <div><strong>Location:</strong> {booking.screen.address}</div>
                <div><strong>Date:</strong> {format(new Date(booking.scheduled_date), 'MMM d, yyyy')}</div>
                <div><strong>Time:</strong> {booking.scheduled_start_time} - {booking.scheduled_end_time}</div>
                <div><strong>Content:</strong> {booking.content.file_name}</div>
                <div><strong>Total:</strong> ${(booking.total_amount / 100).toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate("/discover")}>
              Book Another Screen
            </Button>
            <Button onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}