import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Product from "./pages/Product";
import Artist from "./pages/Artist";
import Shipping from "./pages/Shipping";
import PricingPolicy from "./pages/PricingPolicy";
import Contact from "./pages/Contact";
import NotaClienti from "./pages/NotaClienti";
import NotFound from "./pages/NotFound";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Privacy from "./pages/Privacy";
const queryClient = new QueryClient();

// Main app component
const App = () => (
  <div onContextMenu={(e) => e.preventDefault()}>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/artist" element={<Artist />} />
          <Route path="/nota-clienti" element={<NotaClienti />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/pricing-policy" element={<PricingPolicy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/privacy" element={<Privacy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </QueryClientProvider>
  </div>
);

export default App;