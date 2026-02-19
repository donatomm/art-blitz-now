import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings, useUpdateSiteSetting, getSettingValue } from "@/hooks/useSiteSettings";
import MenuItemRow from "./admin/MenuItemRow";

export interface NavItem {
  label: string;
  href: string;
  order: number;
}

const defaultNavItems: NavItem[] = [
  { label: "L'Artista", href: "/artista", order: 0 },
  { label: "Regole di Spedizione", href: "/spedizione", order: 1 },
  { label: "Politica Prezzi", href: "/pricing-policy", order: 2 },
  { label: "Contatti", href: "/contatti", order: 3 },
];

/**
 * MenuTabContent — NO TabsContent wrapper here.
 * The TabsContent wrapper + lazy-mount guard live in AdminPanel.tsx.
 * This is a pure content component. See docs/SAFETY-CHECK.md §11 Rule 2.
 */
const MenuTabContent = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const { toast } = useToast();
  
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Load settings into local state
  useEffect(() => {
    if (settings) {
      const items = getSettingValue<NavItem[]>(settings, "nav_items", []);
      if (items.length > 0) {
        setNavItems(items.sort((a, b) => a.order - b.order));
      }
    }
  }, [settings]);
  
  const handleAddItem = () => {
    const newItem: NavItem = {
      label: "Nuovo Menu",
      href: "/",
      order: navItems.length,
    };
    setNavItems([...navItems, newItem]);
    setHasChanges(true);
  };
  
  const handleRemoveItem = (index: number) => {
    const updated = navItems.filter((_, i) => i !== index);
    const reordered = updated.map((item, i) => ({ ...item, order: i }));
    setNavItems(reordered);
    setHasChanges(true);
  };
  
  const handleUpdateItem = (index: number, field: "label" | "href", value: string) => {
    const updated = [...navItems];
    updated[index] = { ...updated[index], [field]: value };
    setNavItems(updated);
    setHasChanges(true);
  };
  
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...navItems];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    const reordered = updated.map((item, i) => ({ ...item, order: i }));
    setNavItems(reordered);
    setHasChanges(true);
  };
  
  const handleMoveDown = (index: number) => {
    if (index === navItems.length - 1) return;
    const updated = [...navItems];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    const reordered = updated.map((item, i) => ({ ...item, order: i }));
    setNavItems(reordered);
    setHasChanges(true);
  };
  
  const handleLoadDefaults = () => {
    setNavItems([...defaultNavItems]);
    setHasChanges(true);
  };
  
  const handleSave = async () => {
    try {
      await updateSetting.mutateAsync({ key: "nav_items", value: navItems as unknown as import("@/integrations/supabase/types").Json });
      setHasChanges(false);
      toast({
        title: "Menu salvato!",
        description: "Le voci di navigazione sono state aggiornate.",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare il menu.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Gestisci le voci del menu di navigazione.
      </p>
      
      <div className="space-y-3">
        {navItems.map((item, index) => (
          <MenuItemRow
            key={index}
            item={item}
            index={index}
            isFirst={index === 0}
            isLast={index === navItems.length - 1}
            onUpdate={handleUpdateItem}
            onRemove={handleRemoveItem}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        ))}
        
        {navItems.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm mb-3">Nessuna voce di menu configurata.</p>
            <Button variant="outline" size="sm" onClick={handleLoadDefaults}>
              Carica Voci Predefinite
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleAddItem}
          className="flex-1"
        >
          <Plus className="h-4 w-4 mr-1" />
          Aggiungi Voce
        </Button>
        {navItems.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLoadDefaults}
          >
            Reset
          </Button>
        )}
      </div>
      
      <Button
        onClick={handleSave}
        disabled={updateSetting.isPending || !hasChanges}
        className="w-full"
      >
        {updateSetting.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Salva Menu
      </Button>
    </div>
  );
};

export default MenuTabContent;
