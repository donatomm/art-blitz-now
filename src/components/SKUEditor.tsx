import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface SKUEditorProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
}

interface LocalPrice {
  productId: string;
  sizeIndex: number;
  price: number;
}

const SKUEditor = ({ products, onProductsChange }: SKUEditorProps) => {
  const { toast } = useToast();
  
  // Local state for prices - allows editing without triggering DB save on every keystroke
  const [localPrices, setLocalPrices] = useState<Map<string, number>>(new Map());
  const [hasChanges, setHasChanges] = useState(false);

  // Generate a unique key for each SKU
  const getSkuKey = (productId: string, sizeIndex: number) => `${productId}-${sizeIndex}`;

  // Initialize local prices from products
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

  // Collect all SKUs with product and size index references
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

  // Sort by normalized size then product name
  const sortedSkus = [...allSkus].sort((a, b) => {
    const numA = parseInt(a.normalizedSize.split('x')[0]) || 0;
    const numB = parseInt(b.normalizedSize.split('x')[0]) || 0;
    if (numA !== numB) return numA - numB;
    return a.productName.localeCompare(b.productName);
  });

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
  };

  const handleExportXLSX = () => {
    const exportData = sortedSkus.map(sku => ({
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

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={handleExportXLSX} variant="outline" className="flex-1">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Esporta Excel
        </Button>
        {hasChanges && (
          <Button onClick={handleSaveAll} className="flex-1">
            <Save className="mr-2 h-4 w-4" />
            Salva Modifiche
          </Button>
        )}
      </div>

      {/* SKU List - Simple vertical layout */}
      <div className="border rounded-lg overflow-hidden">
        <div className="text-xs font-medium text-muted-foreground bg-muted grid grid-cols-12 gap-2 px-3 py-2 border-b">
          <span className="col-span-2">Size</span>
          <span className="col-span-6">Prodotto</span>
          <span className="col-span-4 text-right">Prezzo €</span>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          {sortedSkus.map((sku, idx) => (
            <div 
              key={`${sku.productId}-${sku.sizeIndex}-${idx}`}
              className="grid grid-cols-12 gap-2 px-3 py-2 border-b last:border-b-0 text-sm items-center hover:bg-muted/50"
            >
              <span className="col-span-2 font-mono text-xs font-medium">{sku.size}</span>
              <span className="col-span-6 truncate text-xs">{sku.productName}</span>
              <div className="col-span-4 flex justify-end">
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
