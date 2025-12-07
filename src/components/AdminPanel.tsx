import { useState } from "react";
import { Product, ProductSize } from "@/types/product";
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
import { Settings, Plus, Trash2, GripVertical, Download, Edit, FileText } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { usePages, useUpdatePage, Page } from "@/hooks/usePages";
import ImageUpload from "./ImageUpload";

interface AdminPanelProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
}

const AdminPanel = ({ products, onProductsChange }: AdminPanelProps) => {
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editPage, setEditPage] = useState<Page | null>(null);
  const [isPageDialogOpen, setIsPageDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: pages = [] } = usePages();
  const updatePageMutation = useUpdatePage();

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
      id: Date.now().toString(),
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

  const updateEditSize = (sizeIndex: number, field: keyof ProductSize, value: string | number) => {
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
            <SheetTitle>Admin Panel</SheetTitle>
          </SheetHeader>
          
          <Tabs defaultValue="products" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="products">Prodotti</TabsTrigger>
              <TabsTrigger value="pages">Pagine</TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={handleAddProduct} className="flex-1">
                  <Plus className="mr-2 h-4 w-4" />
                  Aggiungi Prodotto
                </Button>
                <Button onClick={handleExportJSON} variant="secondary">
                  <Download className="mr-2 h-4 w-4" />
                  Esporta
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
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <ImageUpload
                      key={index}
                      label={`Mock ${index + 1}`}
                      currentUrl={editProduct.mock_rooms?.[index] || ""}
                      onUpload={(url) => {
                        const newMockRooms = [...(editProduct.mock_rooms || [])];
                        if (url) {
                          newMockRooms[index] = url;
                        } else {
                          newMockRooms[index] = "";
                        }
                        setEditProduct({ ...editProduct, mock_rooms: newMockRooms });
                      }}
                      folder="mockrooms"
                    />
                  ))}
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
                <Label>Dimensioni & Prezzi</Label>
                {editProduct.sizes.map((size, i) => (
                  <div key={i} className="flex gap-2 items-center">
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
                ))}
              </div>

              {/* Deal Label Section */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label>Offerta del Giorno</Label>
                  <Switch
                    checked={editProduct.deal_label_enabled}
                    onCheckedChange={(checked) =>
                      setEditProduct({ ...editProduct, deal_label_enabled: checked })
                    }
                  />
                </div>
                {editProduct.deal_label_enabled && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Testo Label</Label>
                    <Input
                      value={editProduct.deal_label_text}
                      onChange={(e) =>
                        setEditProduct({ ...editProduct, deal_label_text: e.target.value })
                      }
                      placeholder="OFFERTA DEL GIORNO, scade h20:00 GG/MM/YY"
                    />
                  </div>
                )}
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
                {updatePageMutation.isPending ? "Salvataggio..." : "Salva"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPanel;
