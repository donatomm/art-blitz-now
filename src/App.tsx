import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
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
import Cookies from "./pages/Cookies";
import Terms from "./pages/Terms";
import ResiRimborsi from "./pages/ResiRimborsi";
import OrdinePersonalizzato from "./pages/OrdinePersonalizzato";
const queryClient = new QueryClient();

// Main app component
const App = () => (
  <div>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <CartDrawer />
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
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/resi-e-rimborsi" element={<ResiRimborsi />} />
            <Route path="/ordine-personalizzato" element={<OrdinePersonalizzato />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
    </QueryClientProvider>
  </div>
);

export default App;