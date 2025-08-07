import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ScreenDiscovery from "./pages/ScreenDiscovery";
import ScreenDetails from "./pages/ScreenDetails";
import ContentUpload from "./pages/ContentUpload";
import Scheduling from "./pages/Scheduling";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import HowItWorksDetailed from "./pages/HowItWorksDetailed";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/how-it-works" element={<HowItWorksDetailed />} />
          <Route path="/discover" element={<ScreenDiscovery />} />
          <Route path="/screen/:screenId" element={<ScreenDetails />} />
          <Route path="/book/:screenId/upload" element={<ContentUpload />} />
          <Route path="/book/:screenId/schedule" element={<Scheduling />} />
          <Route path="/book/:screenId/payment" element={<Payment />} />
          <Route path="/confirmation/:bookingId" element={<Confirmation />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
