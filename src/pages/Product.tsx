import { useParams, Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const { data: products, isLoading } = useProducts();
  const [selectedSize, setSelectedSize] = useState<number>(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const product = products?.find((p) => p.id === id);
  
  // Placeholder mock rooms - will be replaced with actual images
  const mockRooms = [
    { id: 1, label: "Living Room 1" },
    { id: 2, label: "Living Room 2" },
    { id: 3, label: "Bedroom" },
    { id: 4, label: "Office" },
  ];
  
  const maxIndex = Math.max(0, mockRooms.length - 2);
  
  const handlePrev = () => {
    setCarouselIndex((prev) => Math.max(0, prev - 1));
  };
  
  const handleNext = () => {
    setCarouselIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
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
      </div>
    );
  }

  const selectedSizeData = product.sizes[selectedSize];

  const getWhatsAppLink = () => {
    const message = `Ciao! Sono interessato a "${product.name}" - ${selectedSizeData.dimensions}cm a €${selectedSizeData.price}`;
    return `https://wa.me/+393331234567?text=${encodeURIComponent(message)}`;
  };

  const getEmailLink = () => {
    const subject = `Richiesta per ${product.name}`;
    const body = `Ciao!\n\nSono interessato a:\n- Opera: ${product.name}\n- Dimensione: ${selectedSizeData.dimensions}cm\n- Prezzo: €${selectedSizeData.price}\n\nGrazie!`;
    return `mailto:info@octowonders.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alla Galleria
        </Link>

        <div className="space-y-8">
          {/* Mock Room Carousel - Netflix style */}
          <div className="relative">
            <div className="flex items-center gap-4">
              {/* Left Arrow */}
              <button
                onClick={handlePrev}
                disabled={carouselIndex === 0}
                className="flex-shrink-0 w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              
              {/* Carousel Container */}
              <div className="flex-1 overflow-hidden">
                <div 
                  className="flex gap-4 transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(-${carouselIndex * (50 + 8)}%)` }}
                >
                  {mockRooms.map((room) => (
                    <div 
                      key={room.id}
                      className="flex-shrink-0 w-[calc(50%-8px)] aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground border border-border"
                    >
                      {room.label}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Right Arrow */}
              <button
                onClick={handleNext}
                disabled={carouselIndex >= maxIndex}
                className="flex-shrink-0 w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Product Info Row */}
          <div className="grid lg:grid-cols-[180px_1fr] gap-8 items-start">
            {/* Small Artwork with Hover Zoom */}
            <div className="group relative overflow-hidden rounded-lg bg-card cursor-pointer max-w-[180px]">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  {product.name}
                </h1>
                <p className="text-lg text-muted-foreground">{product.medium}</p>
              </div>

              {/* Size Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Seleziona Dimensione</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size, index) => (
                    <button
                      key={size.label}
                      onClick={() => setSelectedSize(index)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        selectedSize === index
                          ? "border-gold bg-gold/10 text-foreground"
                          : "border-border hover:border-gold/50 text-muted-foreground"
                      }`}
                    >
                      <div className="text-sm font-medium">{size.dimensions}cm</div>
                      <div className="text-lg font-bold">€{size.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price and Contact Row */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="bg-card rounded-lg px-6 py-4 border border-border">
                  <span className="text-muted-foreground text-sm">Totale: </span>
                  <span className="text-2xl font-bold text-gold">€{selectedSizeData.price}</span>
                </div>
                
                <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                  <Button className="h-12 px-6 bg-green-600 hover:bg-green-700">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    WhatsApp
                  </Button>
                </a>
                <a href={getEmailLink()}>
                  <Button variant="outline" className="h-12 px-6">
                    <Mail className="mr-2 h-5 w-5" />
                    Email
                  </Button>
                </a>
              </div>

              {/* Product Details */}
              <div className="border-t border-border pt-4">
                <ul className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                  <li>• Stampa professionale su tela</li>
                  <li>• Tecnologia HP Latex</li>
                  <li>• Colori brillanti garantiti</li>
                  <li>• Pronta da appendere</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;