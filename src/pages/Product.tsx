import { useParams, Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
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

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  const product = products?.find(p => p.id === id);

  // Use mock rooms from database, or generate placeholders
  const mockRooms = product?.mock_rooms && product.mock_rooms.length > 0 ? product.mock_rooms.map((mockRoom, index) => {
    // Handle both old string format and new object format
    const isOldFormat = typeof mockRoom === 'string';
    const imageUrl = isOldFormat ? mockRoom : mockRoom?.url || "";
    const customLabel = isOldFormat ? "" : mockRoom?.label || "";
    const defaultLabel = product?.sizes[index]?.dimensions || `Mock ${index + 1}`;
    return {
      id: index + 1,
      image: imageUrl,
      dimensions: customLabel || defaultLabel,
      note: ""
    };
  }) : [1, 2, 3].map(num => ({
    id: num,
    image: "",
    dimensions: `${product?.name}-Mock${num}`,
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
  const selectedSizeData = product.sizes[selectedSize];
  const getWhatsAppLink = () => {
    const message = `Ciao! Sono interessato a "${product.name}" - ${selectedSizeData.dimensions} a €${selectedSizeData.price}`;
    return `https://wa.me/+393331234567?text=${encodeURIComponent(message)}`;
  };
  const getEmailLink = () => {
    const subject = `Richiesta per ${product.name}`;
    const body = `Ciao!\n\nSono interessato a:\n- Opera: ${product.name}\n- Dimensione: ${selectedSizeData.dimensions}\n- Prezzo: €${selectedSizeData.price}\n\nGrazie!`;
    return `mailto:info@octowonders.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  const getCustomWhatsAppLink = () => {
    const message = `Ciao! Vorrei richiedere un FORMATO PERSONALIZZATO per "${product.name}" (${product.medium}). Per favore contattatemi per discutere dimensioni e preventivo.`;
    return `https://wa.me/+393331234567?text=${encodeURIComponent(message)}`;
  };
  const getCustomEmailLink = () => {
    const subject = `Formato Personalizzato - ${product.name}`;
    const body = `Ciao!\n\nVorrei richiedere un FORMATO PERSONALIZZATO per:\n- Opera: ${product.name}\n- Tecnica: ${product.medium}\n\nPer favore contattatemi per discutere dimensioni e preventivo.\n\nGrazie!`;
    return `mailto:info@octowonders.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Fixed back button */}
      <Link to="/" className="fixed top-20 left-4 z-40 inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full shadow-lg hover:bg-gold hover:text-black transition-all font-medium">
        <ArrowLeft className="h-5 w-5 bg-gold" />
        <span className="hidden sm:inline bg-gold text-primary-foreground">Torna alla Galleria</span>
      </Link>
      
      <div className="container mx-auto px-4 pt-32 pb-12">

        {/* Deal Label */}
        {product.deal_label_enabled && product.deal_label_text && <div className="w-full mb-4">
            <span className="inline-block bg-gold text-black font-bold text-sm px-4 py-2 rounded shadow-lg">
              {product.deal_label_text}
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
                const matchingSize = product?.sizes.find(s => s.dimensions === room.dimensions);
                const price = matchingSize?.price;
                return <div key={room.id} className="flex-shrink-0 w-[calc(50%-8px)] flex flex-col">
                        <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden border border-border flex items-center justify-center">
                          {room.image ? <img src={room.image} alt={`${product?.name} in ambiente`} className="w-full h-full object-contain" /> : <div className="text-center text-muted-foreground p-4">
                              <div className="text-4xl mb-2">🖼️</div>
                              <div className="text-sm">Mockup {room.dimensions}</div>
                            </div>}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="bg-black text-white text-xs font-medium px-3 py-1 rounded tracking-wider">
                            {room.dimensions}
                          </span>
                          {price && <span className="bg-gold text-black text-xs font-bold px-3 py-1 rounded">
                              €{price}
                            </span>}
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
            {/* Product Name and Medium */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                {product.name}
              </h1>
              <p className="text-base text-muted-foreground">{product.medium}</p>
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Seleziona Dimensione</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size, index) => <button key={size.dimensions} onClick={() => setSelectedSize(index)} className={`px-4 py-3 rounded-lg border-2 transition-all ${selectedSize === index ? "border-gold bg-gold/10 text-foreground" : "border-border hover:border-gold/50 text-muted-foreground"}`}>
                    <div className="text-sm font-medium tracking-wider">{size.dimensions}</div>
                    <div className="text-lg font-bold">€{size.price}</div>
                  </button>)}
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

            {/* Custom Format Section */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Vuoi una dimensione diversa?</span>
              <a href={getCustomWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="border-gold/50 hover:border-gold hover:bg-gold/10">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Formato Personalizzato
                </Button>
              </a>
              <a href={getCustomEmailLink()}>
                <Button variant="ghost" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
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
    </div>;
};
export default Product;