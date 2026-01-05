import { Outlet } from "react-router-dom";
import { Head } from "vite-react-ssg";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import FloatingCartButton from "@/components/FloatingCartButton";
import ErrorBoundary from "@/components/ErrorBoundary";

// Create query client outside component to prevent re-creation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry JSON parse errors (SyntaxError from HTML responses)
        if (error instanceof SyntaxError) return false;
        // Disable retries during SSG
        if (typeof window === 'undefined') return false;
        return failureCount < 3;
      },
    },
  },
});

export default function RootLayout() {
  return (
    <>
      <Head>
        <meta name="p:domain_verify" content="488c339e7167063621a6662be6c159b8" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <CartDrawer />
            <FloatingCartButton />
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </CartProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
}
