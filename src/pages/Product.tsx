import { useParams, Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
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
  const product = products?.find(p => p.id === id);

  // Mock room images per product
  const mockRoomsByProduct: Record<string, {
    id: number;
    image: string;
    dimensions: string;
    note?: string;
  }[]> = {
    "octoheaded": [{
      id: 1,
      image: "/mockrooms/octoheaded-room1.jpg",
      dimensions: "80x80",
      note: "Disponibile Su Lastra di Alluminio"
    }, {
      id: 2,
      image: "/mockrooms/octoheaded-room2.jpg",
      dimensions: "60x60",
      note: "Con Cornice"
    }, {
      id: 3,
      image: "/mockrooms/octoheaded-room3.jpg",
      dimensions: "40x40",
      note: ""
    }]
  };

  // Get mock rooms for current product or use empty array
  const productKey = product?.name?.toLowerCase().replace(/\s+/g, '') || '';
  const mockRooms = mockRoomsByProduct[productKey] || [];
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
    const message = `Ciao! Sono interessato a "${product.name}" - ${selectedSizeData.dimensions}cm a €${selectedSizeData.price}`;
    return `https://wa.me/+393331234567?text=${encodeURIComponent(message)}`;
  };
  const getEmailLink = () => {
    const subject = `Richiesta per ${product.name}`;
    const body = `Ciao!\n\nSono interessato a:\n- Opera: ${product.name}\n- Dimensione: ${selectedSizeData.dimensions}cm\n- Prezzo: €${selectedSizeData.price}\n\nGrazie!`;
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
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alla Galleria
        </Link>

        {/* Product Description - Full width */}
        <div className="w-full mb-8 p-6 bg-card border border-border rounded-lg">
          <p className="text-muted-foreground text-base leading-relaxed">Descrizione del prodoserire qui. Puoi modificare questo testo per aggiungere dettagli sull'opera, la tecnica utilizzata, l'ispirazione artistica o qualsiasi altra informazione rilevante per i clienti.</p>
        </div>

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
                          <img src={room.image} alt={`${product?.name} in ambiente`} className="w-full h-full object-contain" />
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
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Artwork - Small preview */}
          <div className="group relative overflow-hidden rounded-lg bg-card cursor-pointer w-[200px] mx-auto md:mx-0 flex-shrink-0">
            <img src={product.image_url} alt={product.name} className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105" />
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