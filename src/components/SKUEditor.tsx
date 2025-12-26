import { useState, useEffect } from "react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, Save, RefreshCw, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { 
  useDefaultPrices, 
  useBatchUpdateDefaultPrices,
  normalizeDimension,
  getMasterPrice,
  isPriceOverridden
} from "@/hooks/useDefaultPrices";

interface SKUEditorProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
}

const SKUEditor = ({ products, onProductsChange }: SKUEditorProps) => {
  const { toast } = useToast();
  
  const [localPrices, setLocalPrices] = useState<Map<string, number>>(new Map());
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);
  const [masterPriceEdits, setMasterPriceEdits] = useState<Map<string, number>>(new Map());
  const [hasMasterChanges, setHasMasterChanges] = useState(false);

  // Fetch default prices from database
  const { data: defaultPrices = [], isLoading: loadingPrices } = useDefaultPrices();
  const batchUpdateMutation = useBatchUpdateDefaultPrices();

  const getSkuKey = (productId: string, sizeIndex: number) => `${productId}-${sizeIndex}`;

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

  // Initialize master price edits from database
  useEffect(() => {
    const editMap = new Map<string, number>();
    defaultPrices.forEach(dp => {
      editMap.set(dp.dimension, dp.price);
    });
    setMasterPriceEdits(editMap);
    setHasMasterChanges(false);
  }, [defaultPrices]);

  // Collect all unique dimensions from products
  const allDimensions = new Set<string>();
  products.forEach(product => {
    product.sizes.forEach(size => {
      if (size.price > 0) {
        allDimensions.add(normalizeDimension(size.dimensions));
      }
    });
  });
  
  // Also include dimensions from default_prices that may not be in current products
  defaultPrices.forEach(dp => {
    allDimensions.add(dp.dimension);
  });
  
  const sortedDimensions = [...allDimensions].sort((a, b) => {
    const numA = parseInt(a.split('x')[0]) || 0;
    const numB = parseInt(b.split('x')[0]) || 0;
    return numA - numB;
  });

  // Get products for selected dimension
  const getProductsForDimension = (dim: string) => {
    const result: { productId: string; productName: string; sizeIndex: number; price: number; stripeId: string; isOverridden: boolean }[] = [];
    products.forEach(product => {
      product.sizes.forEach((size, sizeIndex) => {
        if (normalizeDimension(size.dimensions) === dim && size.price > 0) {
          const price = localPrices.get(getSkuKey(product.id, sizeIndex)) ?? size.price;
          result.push({
            productId: product.id,
            productName: product.name,
            sizeIndex,
            price,
            stripeId: size.stripe_product_id || '-',
            isOverridden: isPriceOverridden(defaultPrices, size.dimensions, price)
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

  const filteredProducts = selectedDimension ? getProductsForDimension(selectedDimension) : [];

  // Group SKUs by normalized dimension
  const skusByDimension = new Map<string, typeof allSkusList>();
  const allSkusList = products.flatMap(product =>
    product.sizes
      .map((size, sizeIndex) => {
        const price = localPrices.get(getSkuKey(product.id, sizeIndex)) ?? size.price;
        return {
          size: size.dimensions,
          normalizedSize: normalizeDimension(size.dimensions),
          price,
          productName: product.name,
          productId: product.id,
          sizeIndex: sizeIndex,
          stripeId: size.stripe_product_id || '-',
          isOverridden: isPriceOverridden(defaultPrices, size.dimensions, price)
        };
      })
      .filter(sku => sku.price > 0)
  );

  // Group by normalized dimension
  allSkusList.forEach(sku => {
    const existing = skusByDimension.get(sku.normalizedSize) || [];
    existing.push(sku);
    skusByDimension.set(sku.normalizedSize, existing);
  });

  // Sort dimensions and products within each dimension
  const groupedSkus = sortedDimensions.map(dim => ({
    dimension: dim,
    items: (skusByDimension.get(dim) || []).sort((a, b) => a.productName.localeCompare(b.productName))
  })).filter(g => g.items.length > 0);

  const handleMasterPriceEdit = (dimension: string, newPrice: number) => {
    setMasterPriceEdits(prev => new Map(prev).set(dimension, newPrice));
    setHasMasterChanges(true);
  };

  const handleSaveMasterPrices = async () => {
    const updates = Array.from(masterPriceEdits.entries()).map(([dimension, price]) => ({
      dimension,
      price
    }));

    try {
      await batchUpdateMutation.mutateAsync(updates);
      setHasMasterChanges(false);
      toast({
        title: "Listino salvato",
        description: "Prezzi base aggiornati nel database.",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare i prezzi base.",
        variant: "destructive",
      });
    }
  };

  const handleApplyMasterToAll = () => {
    // Apply master prices to all products (overwrite all)
    const updatedProducts = products.map(product => {
      const newSizes = product.sizes.map(size => {
        const normalizedDim = normalizeDimension(size.dimensions);
        const masterPrice = masterPriceEdits.get(normalizedDim);
        if (masterPrice !== undefined && masterPrice > 0) {
          return { ...size, price: masterPrice };
        }
        return size;
      });
      return { ...product, sizes: newSizes };
    });
    
    onProductsChange(updatedProducts);
    
    // Also update local prices map
    const priceMap = new Map<string, number>();
    updatedProducts.forEach(product => {
      product.sizes.forEach((size, sizeIndex) => {
        priceMap.set(getSkuKey(product.id, sizeIndex), size.price);
      });
    });
    setLocalPrices(priceMap);
    setHasChanges(false);
    
    toast({
      title: "Listino applicato",
      description: "Tutti i prodotti sono stati aggiornati con i prezzi del listino.",
    });
  };

  const handleResetToMaster = (productId: string, sizeIndex: number, dimension: string) => {
    const normalizedDim = normalizeDimension(dimension);
    const masterPrice = getMasterPrice(defaultPrices, normalizedDim);
    if (masterPrice !== null) {
      handleLocalPriceChange(productId, sizeIndex, masterPrice);
    }
  };

  if (loadingPrices) {
    return <div className="text-center py-4 text-muted-foreground">Caricamento listino...</div>;
  }

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

      {/* Master Price Table - Listino Prezzi */}
      <div className="border-2 border-primary rounded-lg overflow-hidden">
        <div className="bg-primary text-primary-foreground px-3 py-2 text-sm font-semibold flex items-center justify-between">
          <span>Listino Prezzi (Master)</span>
          <div className="flex gap-2">
            {hasMasterChanges && (
              <Button 
                size="sm" 
                variant="secondary"
                onClick={handleSaveMasterPrices}
                disabled={batchUpdateMutation.isPending}
                className="h-6 text-xs"
              >
                <Save className="mr-1 h-3 w-3" />
                Salva Listino
              </Button>
            )}
            <Button 
              size="sm" 
              variant="secondary"
              onClick={handleApplyMasterToAll}
              className="h-6 text-xs"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Applica a tutti
            </Button>
          </div>
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
                  value={masterPriceEdits.get(dim) ?? getMasterPrice(defaultPrices, dim) ?? 0}
                  onChange={(e) => handleMasterPriceEdit(dim, Number(e.target.value))}
                  className="h-7 text-sm w-24"
                  min={0}
                />
              </div>
            </div>
          ))}
        </div>
        {hasMasterChanges && (
          <div className="bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 text-xs text-amber-700 dark:text-amber-300 border-t">
            Modifiche al listino non salvate
          </div>
        )}
      </div>

      {/* Vista per dimensione */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Vista per dimensione:</p>
        <div className="flex flex-wrap gap-2">
          {sortedDimensions.filter(dim => skusByDimension.has(dim)).map(dim => {
            const hasOverrides = (skusByDimension.get(dim) || []).some(s => s.isOverridden);
            return (
              <Button
                key={dim}
                variant={selectedDimension === dim ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDimension(selectedDimension === dim ? null : dim)}
                className={`text-xs ${hasOverrides ? 'ring-2 ring-amber-400' : ''}`}
              >
                {dim}
                {hasOverrides && <span className="ml-1 text-amber-500">●</span>}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Products for selected dimension */}
      {selectedDimension && (
        <div className="border rounded-lg overflow-hidden">
          <div className="text-xs font-medium text-muted-foreground bg-muted grid grid-cols-12 gap-2 px-3 py-2 border-b">
            <span className="col-span-4">Product</span>
            <span className="col-span-2">Prezzo €</span>
            <span className="col-span-3">Stripe ID</span>
            <span className="col-span-3">Status</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {filteredProducts.map((item, idx) => (
              <div 
                key={`${item.productId}-${item.sizeIndex}-${idx}`}
                className={`grid grid-cols-12 gap-2 px-3 py-2 border-b last:border-b-0 text-sm items-center hover:bg-muted/50 ${item.isOverridden ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}
              >
                <span className="col-span-4 font-medium truncate">{item.productName}</span>
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => handleLocalPriceChange(item.productId, item.sizeIndex, Number(e.target.value))}
                    className={`h-7 text-sm w-20 ${item.isOverridden ? 'border-amber-400' : ''}`}
                    min={0}
                  />
                </div>
                <span className="col-span-3 text-xs text-muted-foreground truncate">{item.stripeId}</span>
                <div className="col-span-3 flex items-center gap-1">
                  {item.isOverridden ? (
                    <>
                      <span className="text-xs text-amber-600 dark:text-amber-400">Override</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 px-1 text-xs"
                        onClick={() => {
                          const product = products.find(p => p.id === item.productId);
                          if (product) {
                            const size = product.sizes[item.sizeIndex];
                            handleResetToMaster(item.productId, item.sizeIndex, size.dimensions);
                          }
                        }}
                      >
                        Reset
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Listino
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full SKU list grouped by dimension */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Lista completa (raggruppata per SKU):</p>
        <div className="border rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
          {groupedSkus.map(group => (
            <div key={group.dimension}>
              <div className="bg-muted px-3 py-1.5 text-xs font-semibold text-foreground border-b sticky top-0 flex justify-between items-center">
                <span>{group.dimension}</span>
                <span className="text-muted-foreground">
                  Listino: €{getMasterPrice(defaultPrices, group.dimension) ?? '-'}
                </span>
              </div>
              {group.items.map((sku, idx) => (
                <div 
                  key={`${sku.productId}-${sku.sizeIndex}-${idx}`}
                  className={`grid grid-cols-12 gap-2 px-3 py-2 border-b last:border-b-0 text-sm items-center hover:bg-muted/50 ${sku.isOverridden ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}
                >
                  <span className="col-span-6 truncate text-xs flex items-center gap-1">
                    {sku.productName}
                    {sku.isOverridden && <span className="text-amber-500 text-[10px]">(override)</span>}
                  </span>
                  <div className="col-span-6 flex justify-end items-center gap-2">
                    <Input
                      type="number"
                      value={sku.price}
                      onChange={(e) => handleLocalPriceChange(sku.productId, sku.sizeIndex, Number(e.target.value))}
                      className={`h-7 text-sm w-20 text-right ${sku.isOverridden ? 'border-amber-400' : ''}`}
                      min={0}
                    />
                    {sku.isOverridden && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleResetToMaster(sku.productId, sku.sizeIndex, sku.size)}
                      >
                        ↩
                      </Button>
                    )}
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
