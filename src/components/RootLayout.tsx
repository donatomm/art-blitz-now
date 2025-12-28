import { Outlet } from "react-router-dom";
import { Head } from "vite-react-ssg";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import FloatingCartButton from "@/components/FloatingCartButton";

const queryClient = new QueryClient();

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
            <Outlet />
          </CartProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
}
