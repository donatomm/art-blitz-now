import { useParams, Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Mail } from "lucide-react";
import { useState } from "react";

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const { data: products, isLoading } = useProducts();
  const [selectedSize, setSelectedSize] = useState<number>(0);

  const product = products?.find((p) => p.id === id);

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

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Main Image */}
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden bg-card">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-auto object-contain"
              />
            </div>
            
            {/* Mock Room Gallery - placeholder for future images */}
            <div className="grid grid-cols-3 gap-2">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-xs">
                Mock Room 1
              </div>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-xs">
                Mock Room 2
              </div>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-xs">
                Mock Room 3
              </div>
            </div>
          </div>

          {/* Product Info */}
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

            {/* Price Display */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">Totale</span>
                <span className="text-3xl font-bold text-gold">€{selectedSizeData.price}</span>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="space-y-3">
              <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full h-12 text-lg bg-green-600 hover:bg-green-700">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Contatta su WhatsApp
                </Button>
              </a>
              <a href={getEmailLink()} className="block">
                <Button variant="outline" className="w-full h-12 text-lg">
                  <Mail className="mr-2 h-5 w-5" />
                  Invia Email
                </Button>
              </a>
            </div>

            {/* Product Details */}
            <div className="border-t border-border pt-6 space-y-4">
              <h3 className="text-sm font-medium text-foreground">Dettagli</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Stampa professionale su tela</li>
                <li>• Tecnologia HP Latex per colori brillanti</li>
                <li>• Pronta da appendere</li>
                <li>• Spedizione assicurata in tutta Italia</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;