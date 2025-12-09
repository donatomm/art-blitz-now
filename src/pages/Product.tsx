import { useParams, Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Mail, ChevronLeft, ChevronRight, ShoppingCart, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TreePine } from "lucide-react";

// Christmas deadline inline text component
const ChristmasDeadlineText = () => {
  const deadline = new Date('2025-12-14T23:59:59');
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  if (daysRemaining <= 0) return null;
  return <p className="text-sm text-foreground mt-2">
      <TreePine className="inline h-4 w-4 text-green-600 mr-1" />
      Consegna per Natale GARANTITA per acquisti ENTRO IL{" "}
      <span className="text-red-500 font-bold">14 Dicembre</span>, cioè{" "}
      <span className="text-red-500 font-bold">-{daysRemaining} giorni</span>
    </p>;
};
const Product = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const {
    data: products,
    isLoading
  } = useProducts();
  const [selectedSize, setSelectedSize] = useState<number>(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const {
    toast
  } = useToast();

  // Scroll to top or to #acquista section when page loads
  useEffect(() => {
    if (window.location.hash === '#acquista') {
      setTimeout(() => {
        document.getElementById('acquista')?.scrollIntoView({
          behavior: 'smooth'
        });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [id]);
  const product = products?.find(p => p.id === id);

  // Use mock rooms from database, or generate placeholders
  const mockRooms = product?.mock_rooms && product.mock_rooms.length > 0 ? product.mock_rooms.map((mockRoom, index) => {
    // Handle both old string format and new object format
    const isOldFormat = typeof mockRoom === 'string';
    const imageUrl = isOldFormat ? mockRoom : mockRoom?.url || "";
    const customLabel = isOldFormat ? "" : mockRoom?.label || "";
    const sizeDimensions = product?.sizes[index]?.dimensions || "";
    return {
      id: index + 1,
      image: imageUrl,
      customLabel: customLabel,
      // Only show if explicitly set, empty string = hidden
      sizeDimensions: sizeDimensions,
      note: ""
    };
  }) : [1, 2, 3].map(num => ({
    id: num,
    image: "",
    customLabel: "",
    sizeDimensions: "",
    note: ""
  }));
  const maxIndex = Math.max(0, mockRooms.length - 2);
  const handlePrev = () => {
    setCarouselIndex(prev => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    setCarouselIndex(prev => Math.min(maxIndex, prev + 1));
  };
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Caricamento...</div>
      </div>;
  }
  if (!product) {
    return <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Prodotto non trovato</h1>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla Home
            </Button>
          </Link>
        </div>
      </div>;
  }
  // Filter out sizes with price = 0 (hidden variants)
  const activeSizes = product.sizes.map((size, originalIndex) => ({
    ...size,
    originalIndex
  })).filter(size => size.price > 0);
  const selectedSizeData = activeSizes[selectedSize] || activeSizes[0];
  const getWhatsAppLink = () => {
    if (!selectedSizeData) return `https://wa.me/+393331234567?text=${encodeURIComponent(`Ciao! Sono interessato a "${product.name}"`)}`;
    const message = `Ciao! Sono interessato a "${product.name}" - ${selectedSizeData.dimensions} a €${selectedSizeData.price}`;
    return `https://wa.me/+393331234567?text=${encodeURIComponent(message)}`;
  };
  const getEmailLink = () => {
    const subject = encodeURIComponent(`Richiesta per ${product.name}`);
    if (!selectedSizeData) return `mailto:me@octowonders.com?subject=${subject}`;
    const body = encodeURIComponent(`Ciao!

Sono interessato a:
- Opera: ${product.name}
- Dimensione: ${selectedSizeData.dimensions}
- Prezzo: €${selectedSizeData.price}

Grazie!`);
    return `mailto:me@octowonders.com?subject=${subject}&body=${body}`;
  };
  const getCustomWhatsAppLink = () => {
    const message = `Ciao! Vorrei richiedere un FORMATO PERSONALIZZATO per "${product.name}" (${product.medium}). Per favore contattatemi per discutere dimensioni e preventivo.`;
    return `https://wa.me/+393331234567?text=${encodeURIComponent(message)}`;
  };
  const handleCheckout = async () => {
    if (!product) return;
    const sizeData = activeSizes[selectedSize];
    if (!sizeData?.stripe_product_id) {
      toast({
        title: "Pagamento non disponibile",
        description: "Questa dimensione non è ancora configurata per il pagamento. Contattaci via WhatsApp o Email.",
        variant: "destructive"
      });
      return;
    }
    setIsCheckoutLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('create-checkout', {
        body: {
          product_id: product.id,
          size_index: sizeData.originalIndex // Use original index from full sizes array
        }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.url) throw new Error("No checkout URL received");

      // Open Stripe Checkout in new tab (works better in iframe previews)
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile avviare il pagamento. Riprova o contattaci.",
        variant: "destructive"
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };
  const getCustomEmailLink = () => {
    const subject = `Formato Personalizzato - ${product.name}`;
    const body = `Ciao!\n\nVorrei richiedere un FORMATO PERSONALIZZATO per:\n- Opera: ${product.name}\n- Tecnica: ${product.medium}\n\nPer favore contattatemi per discutere dimensioni e preventivo.\n\nGrazie!`;
    return `mailto:info@octowonders.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Fixed back button */}
      <Link to="/" className="fixed top-20 left-4 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all duration-300 font-medium bg-gold text-primary opacity-75 hover:opacity-100 hover:scale-105 hover:shadow-xl">
        <ArrowLeft className="h-5 w-5" />
        <span className="hidden sm:inline">Torna alla Galleria</span>
      </Link>
      
      <div className="container mx-auto px-4 pt-32 pb-12">

        {/* Deal Label - based on selected size */}
        {selectedSizeData?.deal_label_enabled && selectedSizeData?.deal_label_text && <div className="w-full mb-4">
            <span className="inline-block font-bold text-sm px-4 py-2 rounded shadow-lg bg-fuchsia-500 text-primary-foreground">
              {selectedSizeData.deal_label_text}
            </span>
          </div>}

        {/* Product Name - Prominent display */}
        <h1 className="w-full text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-wide mx-[25px] my-0">
          {product.name}
        </h1>

        {/* Product Description - Full width */}
        {product.description && <div className="w-full mb-8 p-6 bg-card border border-border rounded-lg">
            <p className="text-muted-foreground leading-relaxed my-0 py-0 mt-px ml-0 text-lg font-sans font-medium">{product.description}</p>
          </div>}

        {/* Mock Room Carousel - Full width at top */}
        {mockRooms.length > 0 && <div className="relative mb-8">
            <div className="flex items-center gap-3">
              {/* Left Arrow */}
              <button onClick={handlePrev} disabled={carouselIndex === 0} className="flex-shrink-0 w-14 h-14 rounded-full bg-foreground text-background border-2 border-foreground flex items-center justify-center hover:bg-gold hover:border-gold hover:text-black transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft className="h-8 w-8 stroke-[3]" />
              </button>
              
              {/* Carousel Container */}
              <div className="flex-1 overflow-hidden">
                <div className="flex gap-4 transition-transform duration-300 ease-out" style={{
              transform: `translateX(-${carouselIndex * (50 + 8)}%)`
            }}>
                  {mockRooms.map(room => {
                const matchingSize = product?.sizes.find(s => s.dimensions === room.sizeDimensions);
                const price = matchingSize?.price;
                return <div key={room.id} className="flex-shrink-0 w-[calc(50%-8px)] flex flex-col">
                        <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden border border-border flex items-center justify-center">
                          {room.image ? <img src={room.image} alt={`${product?.name} in ambiente`} className="w-full h-full object-contain" /> : <div className="text-center text-muted-foreground p-4">
                              <div className="text-4xl mb-2">🖼️</div>
                              <div className="text-sm">Mockup {room.id}</div>
                            </div>}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {room.sizeDimensions && <span className="text-xs font-medium px-3 py-1 rounded border border-border tracking-wider bg-gray-950 text-primary-foreground">
                              {room.sizeDimensions}
                            </span>}
                          {price && <span className="bg-gold text-black text-xs font-bold px-3 py-1 rounded">
                              €{price}
                            </span>}
                          {room.customLabel ? <span className="bg-black text-white text-xs font-medium px-3 py-1 rounded tracking-wider">
                              {room.customLabel}
                            </span> : <span className="w-[10px]" />}
                          {room.note && <span className="bg-muted text-foreground text-xs px-3 py-1 rounded border border-border">
                              {room.note}
                            </span>}
                        </div>
                      </div>;
              })}
                </div>
              </div>
              
              {/* Right Arrow */}
              <button onClick={handleNext} disabled={carouselIndex >= maxIndex} className="flex-shrink-0 w-14 h-14 rounded-full bg-foreground text-background border-2 border-foreground flex items-center justify-center hover:bg-gold hover:border-gold hover:text-black transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight className="h-8 w-8 stroke-[3]" />
              </button>
            </div>
          </div>}

        {/* Product Info Row - Artwork left, Info right */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:pl-[68px]">
          {/* Artwork - Preview */}
          <div className="group relative overflow-hidden rounded-lg bg-card cursor-pointer w-[300px] mx-auto md:mx-0 flex-shrink-0">
            <img src={product.image_url} alt={product.name} className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-125" />
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Product Name and Medium + Christmas Deadline */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                {product.name}
              </h1>
              <p className="text-base text-muted-foreground">{product.medium}</p>
              <ChristmasDeadlineText />
            </div>

            {/* Size Selection */}
            <div id="acquista" className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Seleziona Dimensione</h3>
              <div className="flex flex-wrap gap-2">
                {activeSizes.map((size, index) => <button key={size.dimensions} onClick={() => setSelectedSize(index)} className={`px-4 py-3 rounded-lg border-2 transition-all ${selectedSize === index ? "border-gold bg-gold/10 text-foreground" : "border-border hover:border-gold/50 text-muted-foreground"}`}>
                    <div className="text-sm font-medium tracking-wider">{size.dimensions}</div>
                    <div className="text-lg font-bold">€{size.price}</div>
                  </button>)}
              </div>
            </div>

            {/* Price and Buy Button */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-card rounded-lg px-6 py-4 border border-border">
                <span className="text-muted-foreground text-sm">Totale </span>
                <span className="text-2xl font-bold text-green-600">€{selectedSizeData.price}</span>
              </div>
              
              <Button onClick={handleCheckout} disabled={isCheckoutLoading} className="h-14 px-10 bg-green-600 hover:bg-green-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                {isCheckoutLoading ? <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Caricamento...
                  </> : <>
                    <ShoppingCart className="mr-2 h-6 w-6 animate-bounce" />
                    ACQUISTA ORA
                  </>}
              </Button>
            </div>

            {/* Contact/Support Section */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border">
              <span className="text-sm text-muted-foreground">Contattami / Supporto </span>
              <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-gray-100 hover:bg-gray-200 text-black">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
              </a>
              <a 
                href={`mailto:me@octowonders.com?subject=${encodeURIComponent(`Richiesta per ${product.name}`)}&body=${encodeURIComponent(`Ciao!\n\nSono interessato a:\n- Opera: ${product.name}\n- Dimensione: ${selectedSizeData?.dimensions || ''}\n- Prezzo: ${selectedSizeData?.price || ''}EUR\n\nGrazie!`)}`}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 bg-gray-100 hover:bg-gray-200 text-black transition-colors"
              >
                <Mail className="mr-2 h-4 w-4" />
                Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Product;