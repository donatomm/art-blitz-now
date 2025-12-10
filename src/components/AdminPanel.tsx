import { useState, useEffect } from "react";
import { Product, ProductSize, MockRoom } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Plus, Trash2, GripVertical, Download, Edit, FileText, Loader2, Upload, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { usePages, useUpdatePage, Page } from "@/hooks/usePages";
import ImageUpload from "./ImageUpload";
import { supabase } from "@/integrations/supabase/client";

interface AdminPanelProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
}

const AdminPanel = ({ products, onProductsChange }: AdminPanelProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editPage, setEditPage] = useState<Page | null>(null);
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);
  const [isStripeImportDialogOpen, setIsStripeImportDialogOpen] = useState(false);
  const [stripeImportJson, setStripeImportJson] = useState("");
  const { toast } = useToast();
  
  const { data: pages = [] } = usePages();
  const updatePageMutation = useUpdatePage();

  // Check if already authenticated via Supabase session and has admin role
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Verify user has admin role
        const { data: hasAdminRole } = await supabase.rpc('has_role', {
          _user_id: session.user.id,
          _role: 'admin'
        });
        setIsAuthenticated(!!hasAdminRole);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Verify admin role on auth state change
        setTimeout(async () => {
          const { data: hasAdminRole } = await supabase.rpc('has_role', {
            _user_id: session.user.id,
            _role: 'admin'
          });
          setIsAuthenticated(!!hasAdminRole);
        }, 0);
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!emailInput || !passwordInput) {
      toast({
        title: "Errore",
        description: "Inserisci email e password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Sign in with email/password
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: emailInput,
        password: passwordInput,
      });

      if (signInError) {
        toast({
          title: "Errore di autenticazione",
          description: "Email o password non corretti.",
          variant: "destructive",
        });
        return;
      }

      // Verify user has admin role
      const { data: hasAdminRole } = await supabase.rpc('has_role', {
        _user_id: signInData.user.id,
        _role: 'admin'
      });

      if (!hasAdminRole) {
        await supabase.auth.signOut();
        toast({
          title: "Accesso negato",
          description: "Non hai i permessi di amministratore.",
          variant: "destructive",
        });
        return;
      }

      setEmailInput("");
      setPasswordInput("");
      toast({
        title: "Accesso effettuato",
        description: "Benvenuto nel pannello admin.",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'accesso.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(products, null, 2);
    navigator.clipboard.writeText(json);
    toast({
      title: "JSON Copiato!",
      description: "Dati prodotto copiati negli appunti.",
    });
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: "Nuova Opera",
      medium: "Stampa su Tela",
      description: "",
      image_url: "",
      sizes: [
        { dimensions: "40x40", price: 125 },
        { dimensions: "60x60", price: 175 },
        { dimensions: "80x80", price: 245 },
        { dimensions: "100x100", price: 295 },
      ],
      display_order: products.length,
      deal_label_enabled: false,
      deal_label_text: "OFFERTA DEL GIORNO, scade h20:00",
      mock_rooms: [],
    };
    setEditProduct(newProduct);
    setIsEditDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditProduct({ ...product });
    setIsEditDialogOpen(true);
  };

  const handleSaveProduct = () => {
    if (!editProduct) return;

    const existingIndex = products.findIndex((p) => p.id === editProduct.id);
    if (existingIndex >= 0) {
      const updated = [...products];
      updated[existingIndex] = editProduct;
      onProductsChange(updated);
    } else {
      onProductsChange([...products, editProduct]);
    }
    setIsEditDialogOpen(false);
    setEditProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    onProductsChange(products.filter((p) => p.id !== id));
  };

  const handleMoveProduct = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= products.length) return;

    const sorted = [...products].sort((a, b) => a.display_order - b.display_order);
    const temp = sorted[index].display_order;
    sorted[index].display_order = sorted[newIndex].display_order;
    sorted[newIndex].display_order = temp;
    onProductsChange([...sorted]);
  };

  const updateEditSize = (sizeIndex: number, field: keyof ProductSize, value: string | number | boolean) => {
    if (!editProduct) return;
    const newSizes = [...editProduct.sizes];
    newSizes[sizeIndex] = { ...newSizes[sizeIndex], [field]: value };
    setEditProduct({ ...editProduct, sizes: newSizes });
  };

  const handleEditPage = (page: Page) => {
    setEditPage({ ...page });
    setIsPageDialogOpen(true);
  };

  const handleSavePage = async () => {
    if (!editPage) return;

    try {
      await updatePageMutation.mutateAsync({
        id: editPage.id,
        title: editPage.title,
        content: editPage.content,
      });
      toast({
        title: "Pagina salvata!",
        description: `"${editPage.title}" è stata aggiornata.`,
      });
      setIsPageDialogOpen(false);
      setEditPage(null);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare la pagina. Verifica di essere admin.",
        variant: "destructive",
      });
    }
  };

  const pageLabels: Record<string, string> = {
    artista: "Artista",
    "nota-clienti": "Nota per i Clienti",
    spedizione: "Regole di Spedizione",
    contatti: "Contatti",
  };

  const handleImportStripeIds = () => {
    try {
      const mapping = JSON.parse(stripeImportJson) as Record<string, string>;
      
      const updatedProducts = products.map(product => {
        const stripeProductId = mapping[product.name];
        if (stripeProductId) {
          return {
            ...product,
            sizes: product.sizes.map(size => ({
              ...size,
              stripe_product_id: stripeProductId
            }))
          };
        }
        return product;
      });

      const matchedCount = Object.keys(mapping).filter(name => 
        products.some(p => p.name === name)
      ).length;

      onProductsChange(updatedProducts);
      setIsStripeImportDialogOpen(false);
      setStripeImportJson("");
      
      toast({
        title: "Stripe IDs importati!",
        description: `${matchedCount} prodotti aggiornati con successo.`,
      });
    } catch (error) {
      toast({
        title: "Errore nel JSON",
        description: "Formato JSON non valido. Controlla la sintassi.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle>Admin Panel</SheetTitle>
              {isAuthenticated && (
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Esci
                </Button>
              )}
            </div>
          </SheetHeader>
          
          {!isAuthenticated ? (
            <div className="mt-8 space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@example.com"
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  disabled={isLoading}
                />
              </div>
              <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accesso in corso...
                  </>
                ) : (
                  "Accedi"
                )}
              </Button>
            </div>
          ) : (
          <Tabs defaultValue="products" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="products">Prodotti</TabsTrigger>
              <TabsTrigger value="skus">SKUs</TabsTrigger>
              <TabsTrigger value="pages">Pagine</TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button onClick={handleAddProduct} className="flex-1">
                  <Plus className="mr-2 h-4 w-4" />
                  Aggiungi
                </Button>
                <Button onClick={handleExportJSON} variant="secondary">
                  <Download className="mr-2 h-4 w-4" />
                  Esporta
                </Button>
                <Button onClick={() => setIsStripeImportDialogOpen(true)} variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Stripe IDs
                </Button>
              </div>

              <div className="space-y-2">
                {[...products]
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-2 p-2 bg-muted rounded-md"
                    >
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleMoveProduct(index, "up")}
                          disabled={index === 0}
                        >
                          <GripVertical className="h-3 w-3 rotate-90" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleMoveProduct(index, "down")}
                          disabled={index === products.length - 1}
                        >
                          <GripVertical className="h-3 w-3 -rotate-90" />
                        </Button>
                      </div>
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.medium}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="skus" className="space-y-4">
              {(() => {
                // Collect all SKUs with product and size index references
                const allSkus: { 
                  size: string; 
                  price: number; 
                  productName: string; 
                  productId: string;
                  sizeIndex: number;
                  stripeId: string;
                }[] = [];
                products.forEach(product => {
                  product.sizes.forEach((size, sizeIndex) => {
                    if (size.price > 0) {
                      allSkus.push({
                        size: size.dimensions,
                        price: size.price,
                        productName: product.name,
                        productId: product.id,
                        sizeIndex: sizeIndex,
                        stripeId: size.stripe_product_id || '-'
                      });
                    }
                  });
                });

                // Get unique sizes sorted numerically
                const uniqueSizes = [...new Set(allSkus.map(s => s.size))].sort((a, b) => {
                  const numA = parseInt(a.split('x')[0]) || 0;
                  const numB = parseInt(b.split('x')[0]) || 0;
                  return numA - numB;
                });

                const handleExportXLSX = () => {
                  const exportData = allSkus
                    .sort((a, b) => {
                      const numA = parseInt(a.size.split('x')[0]) || 0;
                      const numB = parseInt(b.size.split('x')[0]) || 0;
                      return numA - numB || a.price - b.price;
                    })
                    .map(sku => ({
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

                const handlePriceChange = (productId: string, sizeIndex: number, newPrice: number) => {
                  const updatedProducts = products.map(product => {
                    if (product.id === productId) {
                      const newSizes = [...product.sizes];
                      newSizes[sizeIndex] = { ...newSizes[sizeIndex], price: newPrice };
                      return { ...product, sizes: newSizes };
                    }
                    return product;
                  });
                  onProductsChange(updatedProducts);
                };

                return (
                  <>
                    <Button onClick={handleExportXLSX} variant="outline" className="w-full">
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Esporta Excel
                    </Button>
                    
                    {/* All SKUs Table with inline editing */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="text-xs font-medium text-muted-foreground bg-muted grid grid-cols-12 gap-2 px-3 py-2 border-b">
                        <span className="col-span-3">Prodotto</span>
                        <span className="col-span-2">Size</span>
                        <span className="col-span-3">Prezzo €</span>
                        <span className="col-span-4">Stripe ID</span>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {allSkus
                          .sort((a, b) => {
                            // Sort by size first (smaller to bigger), then by product name
                            const numA = parseInt(a.size.split('x')[0]) || 0;
                            const numB = parseInt(b.size.split('x')[0]) || 0;
                            if (numA !== numB) return numA - numB;
                            return a.productName.localeCompare(b.productName);
                          })
                          .map((sku, idx) => (
                            <div 
                              key={`${sku.productId}-${sku.sizeIndex}-${idx}`}
                              className="grid grid-cols-12 gap-2 px-3 py-2 border-b last:border-b-0 text-sm items-center hover:bg-muted/50"
                            >
                              <span className="col-span-3 truncate text-xs">{sku.productName}</span>
                              <span className="col-span-2 font-mono text-xs">{sku.size}</span>
                              <div className="col-span-3">
                                <Input
                                  type="number"
                                  value={sku.price}
                                  onChange={(e) => handlePriceChange(sku.productId, sku.sizeIndex, Number(e.target.value))}
                                  className="h-7 text-sm w-20"
                                  min={0}
                                />
                              </div>
                              <span className="col-span-4 font-mono text-xs text-muted-foreground truncate">
                                {sku.stripeId}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Size tabs for filtered view */}
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">Vista per dimensione:</p>
                      <Tabs defaultValue={uniqueSizes[0] || ''} className="w-full">
                        <TabsList className="flex flex-wrap h-auto gap-1">
                          {uniqueSizes.map(size => (
                            <TabsTrigger key={size} value={size} className="text-xs px-2 py-1">
                              {size}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {uniqueSizes.map(size => (
                          <TabsContent key={size} value={size} className="mt-3 space-y-1">
                            <div className="text-xs font-medium text-muted-foreground mb-2 grid grid-cols-12 gap-2 px-2">
                              <span className="col-span-4">Product</span>
                              <span className="col-span-3">Prezzo €</span>
                              <span className="col-span-5">Stripe ID</span>
                            </div>
                            {allSkus
                              .filter(sku => sku.size === size)
                              .sort((a, b) => a.price - b.price)
                              .map((sku, idx) => (
                                <div 
                                  key={`${sku.productId}-${sku.size}-${idx}`}
                                  className="grid grid-cols-12 gap-2 p-2 bg-muted rounded text-sm items-center"
                                >
                                  <span className="col-span-4 truncate">{sku.productName}</span>
                                  <div className="col-span-3">
                                    <Input
                                      type="number"
                                      value={sku.price}
                                      onChange={(e) => handlePriceChange(sku.productId, sku.sizeIndex, Number(e.target.value))}
                                      className="h-7 text-sm w-20"
                                      min={0}
                                    />
                                  </div>
                                  <span className="col-span-5 font-mono text-xs text-muted-foreground truncate">
                                    {sku.stripeId}
                                  </span>
                                </div>
                              ))}
                          </TabsContent>
                        ))}
                      </Tabs>
                    </div>
                  </>
                );
              })()}
            </TabsContent>
            
            <TabsContent value="pages" className="space-y-2">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center gap-3 p-3 bg-muted rounded-md"
                >
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{pageLabels[page.slug] || page.title}</p>
                    <p className="text-xs text-muted-foreground">/{page.slug}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditPage(page)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </TabsContent>
          </Tabs>
          )}
        </SheetContent>
      </Sheet>

      {/* Product Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editProduct && products.find((p) => p.id === editProduct.id)
                ? "Modifica Prodotto"
                : "Aggiungi Prodotto"}
            </DialogTitle>
          </DialogHeader>
          {editProduct && (
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={editProduct.name}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Tecnica</Label>
                <Input
                  value={editProduct.medium}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, medium: e.target.value })
                  }
                />
              </div>
              <ImageUpload
                label="Immagine Opera"
                currentUrl={editProduct.image_url}
                onUpload={(url) => setEditProduct({ ...editProduct, image_url: url })}
                folder="artworks"
              />
              
              {/* Mock Room Images */}
              <div className="space-y-3 border-t pt-4">
                <Label>Immagini Mock Room</Label>
                <div className="space-y-4">
                  {[0, 1, 2, 3].map((index) => {
                    const mockRoom = editProduct.mock_rooms?.[index];
                    const currentUrl = typeof mockRoom === 'string' ? mockRoom : mockRoom?.url || "";
                    const currentLabel = typeof mockRoom === 'string' ? "" : mockRoom?.label || "";
                    
                    return (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <ImageUpload
                          label={`Mock ${index + 1}`}
                          currentUrl={currentUrl}
                          onUpload={(url) => {
                            const newMockRooms: MockRoom[] = [...(editProduct.mock_rooms || [])].map(mr => 
                              typeof mr === 'string' ? { url: mr, label: '' } : mr
                            );
                            while (newMockRooms.length <= index) {
                              newMockRooms.push({ url: '', label: '' });
                            }
                            newMockRooms[index] = { ...newMockRooms[index], url: url || '' };
                            setEditProduct({ ...editProduct, mock_rooms: newMockRooms });
                          }}
                          folder="mockrooms"
                        />
                        <div>
                          <Label className="text-xs text-muted-foreground">Etichetta (opzionale)</Label>
                          <Input
                            placeholder={editProduct.sizes[index]?.dimensions || `Mock ${index + 1}`}
                            value={currentLabel}
                            onChange={(e) => {
                              const newMockRooms: MockRoom[] = [...(editProduct.mock_rooms || [])].map(mr => 
                                typeof mr === 'string' ? { url: mr, label: '' } : mr
                              );
                              while (newMockRooms.length <= index) {
                                newMockRooms.push({ url: '', label: '' });
                              }
                              newMockRooms[index] = { ...newMockRooms[index], label: e.target.value };
                              setEditProduct({ ...editProduct, mock_rooms: newMockRooms });
                            }}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Descrizione</Label>
                <textarea
                  value={editProduct.description}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, description: e.target.value })
                  }
                  className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                  placeholder="Descrizione dell'opera..."
                />
              </div>

              <div className="space-y-2">
                <Label>Dimensioni, Prezzi & Offerta del Giorno</Label>
                {editProduct.sizes.map((size, i) => (
                  <div key={i} className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="NNxNN"
                        value={size.dimensions}
                        onChange={(e) => updateEditSize(i, "dimensions", e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-muted-foreground">€</span>
                      <Input
                        placeholder="Prezzo"
                        type="number"
                        value={size.price}
                        onChange={(e) => updateEditSize(i, "price", Number(e.target.value))}
                        className="w-24"
                      />
                    </div>
                    <Input
                      placeholder="Stripe Product ID (es. prod_ABC123)"
                      value={size.stripe_product_id || ""}
                      onChange={(e) => updateEditSize(i, "stripe_product_id", e.target.value)}
                      className="text-xs font-mono"
                    />
                    {/* Per-size Deal Label */}
                    <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                      <Switch
                        checked={size.deal_label_enabled || false}
                        onCheckedChange={(checked) => updateEditSize(i, "deal_label_enabled", checked)}
                      />
                      <span className="text-xs text-muted-foreground">Offerta</span>
                      {size.deal_label_enabled && (
                        <Input
                          placeholder="OFFERTA DEL GIORNO"
                          value={size.deal_label_text || ""}
                          onChange={(e) => updateEditSize(i, "deal_label_text", e.target.value)}
                          className="flex-1 text-xs"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={handleSaveProduct} className="w-full">
                Salva
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Page Edit Dialog */}
      <Dialog open={isPageDialogOpen} onOpenChange={setIsPageDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Modifica Pagina: {editPage && (pageLabels[editPage.slug] || editPage.title)}
            </DialogTitle>
          </DialogHeader>
          {editPage && (
            <div className="space-y-4">
              <div>
                <Label>Titolo</Label>
                <Input
                  value={editPage.title}
                  onChange={(e) =>
                    setEditPage({ ...editPage, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Contenuto (Markdown)</Label>
                <textarea
                  value={editPage.content}
                  onChange={(e) =>
                    setEditPage({ ...editPage, content: e.target.value })
                  }
                  className="w-full min-h-[300px] px-3 py-2 text-sm rounded-md border border-input bg-background font-mono"
                  placeholder="## Titolo sezione&#10;&#10;Contenuto della pagina..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Usa ## per titoli, **testo** per grassetto, - per liste
                </p>
              </div>

              <Button 
                onClick={handleSavePage} 
                className="w-full"
                disabled={updatePageMutation.isPending}
              >
                {updatePageMutation.isPending ? "Salvataggio..." : "Salva Pagina"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stripe IDs Import Dialog */}
      <Dialog open={isStripeImportDialogOpen} onOpenChange={setIsStripeImportDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Importa Stripe Product IDs</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>JSON Mapping</Label>
              <Textarea
                value={stripeImportJson}
                onChange={(e) => setStripeImportJson(e.target.value)}
                placeholder={`{
  "Octoheaded": "prod_ABC123",
  "Octoghost": "prod_DEF456",
  "Octosuckers": "prod_GHI789"
}`}
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Inserisci un JSON con i nomi prodotto come chiavi e gli ID Stripe come valori.
                Tutti i size variants di ogni prodotto saranno aggiornati con lo stesso ID.
              </p>
            </div>
            <Button onClick={handleImportStripeIds} className="w-full">
              Importa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPanel;
