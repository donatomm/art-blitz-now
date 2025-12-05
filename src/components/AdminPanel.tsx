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
import { Settings, Plus, Trash2, GripVertical, Download, Edit } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface AdminPanelProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
}

const AdminPanel = ({ products, onProductsChange }: AdminPanelProps) => {
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleExportJSON = () => {
    const json = JSON.stringify(products, null, 2);
    navigator.clipboard.writeText(json);
    toast({
      title: "JSON Copied!",
      description: "Product data copied to clipboard. Share it with Lovable to update the code.",
    });
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: "New Artwork",
      medium: "Stampa su Tela",
      image_url: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80",
      sizes: [
        { dimensions: "40x40", price: 125 },
        { dimensions: "60x60", price: 175 },
        { dimensions: "80x80", price: 245 },
      ],
      display_order: products.length,
      deal_label_enabled: false,
      deal_label_text: "OFFERTA DEL GIORNO, scade h20:00",
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
          <div className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Button onClick={handleAddProduct} className="flex-1">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
              <Button onClick={handleExportJSON} variant="secondary">
                <Download className="mr-2 h-4 w-4" />
                Export JSON
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
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editProduct && products.find((p) => p.id === editProduct.id)
                ? "Edit Product"
                : "Add Product"}
            </DialogTitle>
          </DialogHeader>
          {editProduct && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={editProduct.name}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Medium</Label>
                <Input
                  value={editProduct.medium}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, medium: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input
                  value={editProduct.image_url}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, image_url: e.target.value })
                  }
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
                Save
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPanel;
