import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import FloatingCartButton from "@/components/FloatingCartButton";

// Critical path - load immediately
import Index from "./pages/Index";

// Lazy load secondary pages for smaller initial bundle
const Product = lazy(() => import("./pages/Product"));
const Artist = lazy(() => import("./pages/Artist"));
const Shipping = lazy(() => import("./pages/Shipping"));
const PricingPolicy = lazy(() => import("./pages/PricingPolicy"));
const Contact = lazy(() => import("./pages/Contact"));
const NotaClienti = lazy(() => import("./pages/NotaClienti"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Terms = lazy(() => import("./pages/Terms"));
const ResiRimborsi = lazy(() => import("./pages/ResiRimborsi"));
const OrdinePersonalizzato = lazy(() => import("./pages/OrdinePersonalizzato"));
const ColorPalette = lazy(() => import("./pages/ColorPalette"));

const queryClient = new QueryClient();

// Minimal loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse text-muted-foreground">Caricamento...</div>
  </div>
);

/// Main app component
const App = () => (
  <>
    <Helmet>
      <meta name="p:domain_verify" content="488c339e7167063621a6662be6c159b8" />
    </Helmet>

    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <CartDrawer />
          <FloatingCartButton />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/product/:slug" element={<Product />} />
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
                <Route path="/colors" element={<ColorPalette />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </>
);

export default App;
