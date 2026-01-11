import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, Save, RotateCcw, BadgeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDefaultPrices, getDefaultPrice } from "@/hooks/useDefaultPrices";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import * as XLSX from "xlsx";

interface SKUEditorProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
}

const SKUEditor = ({ products, onProductsChange }: SKUEditorProps) => {
  const { toast } = useToast();
  const { data: defaultPriceMap } = useDefaultPrices();
  
  const [localPrices, setLocalPrices] = useState<Map<string, number>>(new Map());
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);

  const getSkuKey = (productId: string, sizeIndex: number) => `${productId}-${sizeIndex}`;

  // Normalize dimension to canonical form (smaller x larger)
  const normalizeDimension = (dim: string): string => {
    const match = dim.match(/^(\d+)x(\d+)(.*)$/);
    if (!match) return dim;
    const [, a, b, suffix] = match;
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (numA <= numB) return dim;
    return `${numB}x${numA}${suffix}`;
  };

  useEffect(() => {
    const priceMap = new Map<string, number>();
    products.forEach(product => {
      product.sizes.forEach((size, sizeIndex) => {
        priceMap.set(getSkuKey(product.id, sizeIndex), size.price);
      });
    });
    setLocalPrices(priceMap);
    setHasChanges(false);
  }, [products]);

  // Collect all unique dimensions
  const allDimensions = new Set<string>();
  products.forEach(product => {
    product.sizes.forEach(size => {
      if (size.price > 0) {
        allDimensions.add(normalizeDimension(size.dimensions));
      }
    });
  });
  const sortedDimensions = [...allDimensions].sort((a, b) => {
    const numA = parseInt(a.split('x')[0]) || 0;
    const numB = parseInt(b.split('x')[0]) || 0;
    return numA - numB;
  });

  // Get products for selected dimension
  const getProductsForDimension = (dim: string) => {
    const result: { productId: string; productName: string; sizeIndex: number; price: number; stripeId: string }[] = [];
    products.forEach(product => {
      product.sizes.forEach((size, sizeIndex) => {
        if (normalizeDimension(size.dimensions) === dim && size.price > 0) {
          result.push({
            productId: product.id,
            productName: product.name,
            sizeIndex,
            price: localPrices.get(getSkuKey(product.id, sizeIndex)) ?? size.price,
            stripeId: size.stripe_product_id || '-'
          });
        }
      });
    });
    return result.sort((a, b) => a.productName.localeCompare(b.productName));
  };

  const handleLocalPriceChange = (productId: string, sizeIndex: number, newPrice: number) => {
    const key = getSkuKey(productId, sizeIndex);
    setLocalPrices(prev => new Map(prev).set(key, newPrice));
    setHasChanges(true);
  };

  const handleSaveAll = () => {
    const updatedProducts = products.map(product => {
      const newSizes = product.sizes.map((size, sizeIndex) => {
        const key = getSkuKey(product.id, sizeIndex);
        const newPrice = localPrices.get(key);
        if (newPrice !== undefined && newPrice !== size.price) {
          return { ...size, price: newPrice };
        }
        return size;
      });
      return { ...product, sizes: newSizes };
    });
    
    onProductsChange(updatedProducts);
    setHasChanges(false);
    toast({
      title: "Prodotti aggiornati",
      description: "Modifiche salvate con successo.",
    });
  };

  // Reset all prices to default values from default_prices table
  const handleResetToDefault = () => {
    if (!defaultPriceMap || defaultPriceMap.size === 0) {
      toast({
        title: "Errore",
        description: "Prezzi di default non disponibili.",
        variant: "destructive",
      });
      return;
    }

    let resetCount = 0;
    products.forEach(product => {
      product.sizes.forEach((size, sizeIndex) => {
        const defaultPrice = getDefaultPrice(defaultPriceMap, size.dimensions);
        if (defaultPrice !== null && defaultPrice > 0) {
          handleLocalPriceChange(product.id, sizeIndex, defaultPrice);
          resetCount++;
        }
      });
    });

    toast({
      title: "Prezzi reimpostati",
      description: `${resetCount} prezzi reimpostati ai valori di default.`,
    });
  };

  const handleExportXLSX = () => {
    const allSkus = products.flatMap(product =>
      product.sizes
        .map((size, sizeIndex) => ({
          size: size.dimensions,
          price: localPrices.get(getSkuKey(product.id, sizeIndex)) ?? size.price,
          productName: product.name,
          stripeId: size.stripe_product_id || '-'
        }))
        .filter(sku => sku.price > 0)
    );
    
    const exportData = allSkus.map(sku => ({
      'Size': sku.size,
      'Price (€)': sku.price,
      'Product Name': sku.productName,
      'Stripe ID': sku.stripeId
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SKUs");
    XLSX.writeFile(wb, "octowonders-skus.xlsx");
    
    toast({
      title: "Esportato!",
      description: "File Excel scaricato.",
    });
  };

  // Clear all offers from all products
  const handleClearAllOffers = () => {
    const updatedProducts = products.map(product => {
      // Update all sizes: disable offer, set deal_price = price, clear deal_label_text
      const newSizes = product.sizes.map(size => ({
        ...size,
        deal_label_enabled: false,
        deal_price: size.price, // Copy current price to deal_price
        deal_label_text: '',
      }));
      
      // Also reset legacy product-level deal fields
      return {
        ...product,
        sizes: newSizes,
        deal_label_enabled: false,
        deal_label_text: 'OFFERTA DEL GIORNO, scade h20:00', // Reset to default
      };
    });
    
    onProductsChange(updatedProducts);
    
    toast({
      title: "Offerte rimosse",
      description: `Tutte le offerte sono state rimosse da ${products.length} prodotti.`,
    });
  };

  const filteredProducts = selectedDimension ? getProductsForDimension(selectedDimension) : [];

  // Group SKUs by normalized dimension
  const skusByDimension = new Map<string, typeof allSkus>();
  const allSkus = products.flatMap(product =>
    product.sizes
      .map((size, sizeIndex) => ({
        size: size.dimensions,
        normalizedSize: normalizeDimension(size.dimensions),
        price: localPrices.get(getSkuKey(product.id, sizeIndex)) ?? size.price,
        productName: product.name,
        productId: product.id,
        sizeIndex: sizeIndex,
        stripeId: size.stripe_product_id || '-'
      }))
      .filter(sku => sku.price > 0)
  );

  // Group by normalized dimension
  allSkus.forEach(sku => {
    const existing = skusByDimension.get(sku.normalizedSize) || [];
    existing.push(sku);
    skusByDimension.set(sku.normalizedSize, existing);
  });

  // Sort dimensions and products within each dimension
  const groupedSkus = sortedDimensions.map(dim => ({
    dimension: dim,
    items: (skusByDimension.get(dim) || []).sort((a, b) => a.productName.localeCompare(b.productName))
  })).filter(g => g.items.length > 0);

  // Master price table - get unique price per dimension
  const masterPrices = new Map<string, number>();
  sortedDimensions.forEach(dim => {
    const skusForDim = skusByDimension.get(dim) || [];
    if (skusForDim.length > 0) {
      masterPrices.set(dim, skusForDim[0].price);
    }
  });

  const handleMasterPriceChange = (dimension: string, newPrice: number) => {
    // Update all products with this dimension
    products.forEach(product => {
      product.sizes.forEach((size, sizeIndex) => {
        if (normalizeDimension(size.dimensions) === dimension) {
          handleLocalPriceChange(product.id, sizeIndex, newPrice);
        }
      });
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handleExportXLSX} variant="outline" className="flex-1">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Esporta Excel
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="flex-1"
              disabled={!defaultPriceMap || defaultPriceMap.size === 0}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset a Default
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma reset prezzi</AlertDialogTitle>
              <AlertDialogDescription>
                Sei sicuro di voler reimpostare tutti i prezzi ai valori di default? 
                Questa azione sovrascriverà tutti i prezzi attualmente impostati.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetToDefault}>
                Conferma Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
            >
              <BadgeX className="mr-2 h-4 w-4" />
              Rimuovi Offerte
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Conferma rimozione offerte</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <span className="block">Sei sicuro di voler rimuovere tutte le offerte attive? Questa azione:</span>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Disattiverà tutte le etichette offerta</li>
                  <li>Imposterà il prezzo offerta uguale al prezzo corrente</li>
                  <li>Cancellerà tutti i testi delle offerte</li>
                </ul>
                <span className="block font-medium">I prezzi dei prodotti rimarranno invariati.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleClearAllOffers}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Conferma Rimozione
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {hasChanges && (
          <Button onClick={handleSaveAll} className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            Salva Modifiche
          </Button>
        )}
      </div>

      {/* Master Price Table - 9 SKUs */}
      <div className="border-2 border-primary rounded-lg overflow-hidden">
        <div className="bg-primary text-primary-foreground px-3 py-2 text-sm font-semibold">
          Listino Prezzi (9 SKU)
        </div>
        <div className="grid grid-cols-2 gap-0">
          <div className="bg-muted px-3 py-1.5 text-xs font-semibold border-b border-r">SIZE</div>
          <div className="bg-muted px-3 py-1.5 text-xs font-semibold border-b">PRICE €</div>
          {sortedDimensions.map((dim, idx) => (
            <div key={dim} className="contents">
              <div className={`px-3 py-2 text-sm font-medium border-r ${idx < sortedDimensions.length - 1 ? 'border-b' : ''}`}>
                {dim}
              </div>
              <div className={`px-3 py-1.5 ${idx < sortedDimensions.length - 1 ? 'border-b' : ''}`}>
                <Input
                  type="number"
                  value={masterPrices.get(dim) || 0}
                  onChange={(e) => handleMasterPriceChange(dim, Number(e.target.value))}
                  className="h-7 text-sm w-24"
                  min={0}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vista per dimensione */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-blue-600">Vista per dimensione:</p>
        <div className="flex flex-wrap gap-2">
          {sortedDimensions.map(dim => (
            <Button
              key={dim}
              variant={selectedDimension === dim ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDimension(selectedDimension === dim ? null : dim)}
              className="text-xs"
            >
              {dim}
            </Button>
          ))}
        </div>
      </div>

      {/* Products for selected dimension */}
      {selectedDimension && (
        <div className="border rounded-lg overflow-hidden">
          <div className="text-xs font-medium text-muted-foreground bg-muted grid grid-cols-12 gap-2 px-3 py-2 border-b">
            <span className="col-span-5">Product</span>
            <span className="col-span-3">Prezzo €</span>
            <span className="col-span-4">Stripe ID</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {filteredProducts.map((item, idx) => (
              <div 
                key={`${item.productId}-${item.sizeIndex}-${idx}`}
                className="grid grid-cols-12 gap-2 px-3 py-2 border-b last:border-b-0 text-sm items-center hover:bg-muted/50"
              >
                <span className="col-span-5 font-medium truncate">{item.productName}</span>
                <div className="col-span-3">
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => handleLocalPriceChange(item.productId, item.sizeIndex, Number(e.target.value))}
                    className="h-7 text-sm w-20"
                    min={0}
                  />
                </div>
                <span className="col-span-4 text-xs text-muted-foreground truncate">{item.stripeId}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full SKU list grouped by dimension */}
      <div className="space-y-2">
        <p className="text-sm font-bold text-blue-600">Lista completa (raggruppata per SKU):</p>
        <div className="border rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
          {groupedSkus.map(group => (
            <div key={group.dimension}>
              <div className="bg-muted px-3 py-1.5 text-xs font-semibold text-foreground border-b sticky top-0">
                {group.dimension}
              </div>
              {group.items.map((sku, idx) => (
                <div 
                  key={`${sku.productId}-${sku.sizeIndex}-${idx}`}
                  className="grid grid-cols-12 gap-2 px-3 py-2 border-b last:border-b-0 text-sm items-center hover:bg-muted/50"
                >
                  <span className="col-span-7 truncate text-xs">{sku.productName}</span>
                  <div className="col-span-5 flex justify-end">
                    <Input
                      type="number"
                      value={sku.price}
                      onChange={(e) => handleLocalPriceChange(sku.productId, sku.sizeIndex, Number(e.target.value))}
                      className="h-7 text-sm w-20 text-right"
                      min={0}
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {hasChanges && (
        <p className="text-xs text-amber-600 text-center">
          Hai modifiche non salvate. Clicca "Salva Modifiche" per applicarle.
        </p>
      )}
    </div>
  );
};

export default SKUEditor;
