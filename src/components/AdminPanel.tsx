import { useState, useEffect, useRef } from "react";
import { Product, ProductSize, MockRoom } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Plus, Trash2, GripVertical, Download, Edit, Loader2, Upload, FileUp, AlertCircle, CheckCircle, ImageIcon, Save } from "lucide-react";
import * as XLSX from "xlsx";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useDebouncedInput } from "@/hooks/useDebouncedInput";
import ImageUpload from "./ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { parseCSVProducts, generateCSVTemplate, exportProductsToCSV, ParseResult, CSVImportMode } from "@/utils/csvProductParser";
import SKUEditor from "./SKUEditor";
import ImageOptimizer from "./ImageOptimizer";
import ArticleImageBrowser from "./ArticleImageBrowser";
import HelloBarTabContent from "./HelloBarTabContent";
import MenuTabContent from "./MenuTabContent";
import { usePages, useUpdatePage, useCreatePage, Page } from "@/hooks/usePages";
import { useSiteSettings, useUpdateSiteSetting, getSettingValue } from "@/hooks/useSiteSettings";
// NavItem interface for menu sync
interface NavItem {
  label: string;
  href: string;
  order: number;
}

// Generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

// Pages Editor sub-component
const PagesTabContent = () => {
  const {
    data: pages,
    isLoading: pagesLoading
  } = usePages();
  const { data: settings } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const updatePage = useUpdatePage();
  const createPage = useCreatePage();
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editSeoTitle, setEditSeoTitle] = useState("");
  const [editSeoDescription, setEditSeoDescription] = useState("");
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  
  // New page creation state
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newContentType, setNewContentType] = useState<'markdown' | 'html'>('markdown');
  
  const {
    toast
  } = useToast();

  // Debounced inputs for better INP
  const debouncedContent = useDebouncedInput(editContent, setEditContent);
  const debouncedSeoDescription = useDebouncedInput(editSeoDescription, setEditSeoDescription);

  const handleEditPage = (page: Page) => {
    setEditingPage(page);
    setEditSlug(page.slug);
    setEditTitle(page.title);
    setEditContent(page.content);
    setEditSeoTitle(page.seo_title || "");
    setEditSeoDescription(page.seo_description || "");
    setShowImageUpload(false);
    // Use saved content_type, don't detect
    setIsHtmlMode(page.content_type === 'html');
  };

  const handleSavePage = async () => {
    if (!editingPage) return;
    // Flush debounced values before saving
    debouncedContent.flushSync();
    debouncedSeoDescription.flushSync();
    
    const slugChanged = editSlug !== editingPage.slug;
    
    // Check for duplicate slug if changed
    if (slugChanged && pages?.some(p => p.id !== editingPage.id && p.slug.toLowerCase() === editSlug.toLowerCase())) {
      toast({
        title: "Errore",
        description: "Esiste già una pagina con questo slug.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await updatePage.mutateAsync({
        id: editingPage.id,
        slug: slugChanged ? editSlug : undefined,
        title: editTitle,
        content: editContent,
        content_type: isHtmlMode ? 'html' : 'markdown',
        seo_title: editSeoTitle || null,
        seo_description: editSeoDescription || null
      });

      // Sync menu item if title or slug changed
      let menuSynced = false;
      if ((editTitle !== editingPage.title || slugChanged) && settings) {
        const navItems = getSettingValue<NavItem[]>(settings, "nav_items", []);
        const matchingIndex = navItems.findIndex(
          item => item.href === `/${editingPage.slug}` || item.href === editingPage.slug
        );
        
        if (matchingIndex !== -1) {
          const updatedNavItems = [...navItems];
          updatedNavItems[matchingIndex] = {
            ...updatedNavItems[matchingIndex],
            label: editTitle,
            href: `/${editSlug}`
          };
          await updateSetting.mutateAsync({ 
            key: "nav_items", 
            value: JSON.parse(JSON.stringify(updatedNavItems))
          });
          menuSynced = true;
        }
      }

      toast({
        title: menuSynced ? "Pagina e Menu aggiornati!" : "Pagina salvata!",
        description: menuSynced 
          ? `"${editTitle}" aggiornata. Anche la voce di menu è stata sincronizzata.`
          : `"${editTitle}" aggiornata con successo.`
      });
      setEditingPage(null);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare la pagina.",
        variant: "destructive"
      });
    }
  };

  const handleCreatePage = async () => {
    if (!newTitle.trim() || !newSlug.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci titolo e slug.",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate slug
    if (pages?.some(p => p.slug.toLowerCase() === newSlug.toLowerCase())) {
      toast({
        title: "Errore",
        description: "Esiste già una pagina con questo slug.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createPage.mutateAsync({
        slug: newSlug,
        title: newTitle,
        content: newContentType === 'html' ? '<p>Contenuto della pagina</p>' : '# ' + newTitle + '\n\nContenuto della pagina.',
        content_type: newContentType,
        seo_title: newTitle,
        seo_description: null
      });

      // Add to nav_items
      if (settings) {
        const navItems = getSettingValue<NavItem[]>(settings, "nav_items", []);
        const maxOrder = navItems.length > 0 ? Math.max(...navItems.map(i => i.order)) : 0;
        const updatedNavItems = [...navItems, { 
          label: newTitle, 
          href: `/${newSlug}`, 
          order: maxOrder + 1 
        }];
        await updateSetting.mutateAsync({ 
          key: "nav_items", 
          value: JSON.parse(JSON.stringify(updatedNavItems))
        });
      }

      toast({
        title: "Pagina creata!",
        description: `"${newTitle}" creata e aggiunta al menu. Ricorda di ri-pubblicare il sito per indicizzarla.`
      });
      
      setIsCreating(false);
      setNewTitle("");
      setNewSlug("");
      setNewContentType('markdown');
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile creare la pagina.",
        variant: "destructive"
      });
    }
  };

  const handleImageUploaded = (url: string) => {
    const markdownImage = `\n![Immagine](${url})\n`;
    debouncedContent.onChange(debouncedContent.value + markdownImage);
    setShowImageUpload(false);
    toast({
      title: "Immagine inserita!",
      description: "Il codice Markdown dell'immagine è stato aggiunto al contenuto."
    });
  };

  if (pagesLoading) {
    return <TabsContent value="pages" className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </TabsContent>;
  }

  if (editingPage) {
    return <TabsContent value="pages" className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Modifica: {editingPage.slug}</h3>
            <Button variant="ghost" size="sm" onClick={() => setEditingPage(null)}>
              Annulla
            </Button>
          </div>
          <div>
            <Label>Titolo</Label>
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
          </div>
          <div>
            <Label>Slug (URL)</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">/</span>
              <Input 
                value={editSlug} 
                onChange={e => setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                placeholder="nome-pagina"
              />
            </div>
            <p className="text-xs text-amber-600 mt-1">
              ⚠️ Modificare lo slug cambierà l'URL. I vecchi link non funzioneranno più.
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Contenuto</Label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className={!isHtmlMode ? "font-medium" : "text-muted-foreground"}>Markdown</span>
                  <Switch checked={isHtmlMode} onCheckedChange={setIsHtmlMode} />
                  <span className={isHtmlMode ? "font-medium" : "text-muted-foreground"}>HTML</span>
                </div>
                {!isHtmlMode && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImageUpload(!showImageUpload)}
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    Immagine
                  </Button>
                )}
              </div>
            </div>
            {isHtmlMode && (
              <p className="text-xs text-amber-600 mb-2">
                Incolla codice HTML da Termly o altri servizi
              </p>
            )}
            {showImageUpload && !isHtmlMode && (
              <div className="mb-3 p-3 border rounded-md bg-muted/50">
                <ImageUpload
                  label="Carica immagine per la pagina"
                  currentUrl=""
                  onUpload={handleImageUploaded}
                  folder="pages"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  L'immagine verrà inserita alla fine del contenuto come Markdown.
                </p>
              </div>
            )}
            <Textarea 
              value={debouncedContent.value} 
              onChange={e => debouncedContent.onChange(e.target.value)} 
              rows={isHtmlMode ? 20 : 12} 
              className="font-mono text-sm" 
              placeholder={isHtmlMode ? "Incolla qui il codice HTML..." : "Scrivi in Markdown..."}
            />
          </div>
          
          {/* SEO Fields */}
          <div className="border-t pt-4 mt-4">
            <h4 className="font-bold text-sm mb-3 text-blue-600">🔍 SEO (per Google)</h4>
            <div className="space-y-3">
              <div>
                <Label>SEO Title <span className="text-xs text-muted-foreground ml-1">(max 60 caratteri)</span></Label>
                <Input 
                  value={editSeoTitle} 
                  onChange={e => setEditSeoTitle(e.target.value)} 
                  placeholder="Es: Marco De Francesco - Artista | OctoWonders"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground mt-1">{editSeoTitle.length}/60 caratteri</p>
              </div>
              <div>
                <Label>SEO Description <span className="text-xs text-muted-foreground ml-1">(max 160 caratteri)</span></Label>
                <Textarea 
                  value={debouncedSeoDescription.value} 
                  onChange={e => debouncedSeoDescription.onChange(e.target.value)} 
                  placeholder="Es: Scopri l'artista Marco De Francesco. Stampe su tela originali a tema marino."
                  rows={2}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground mt-1">{debouncedSeoDescription.value.length}/160 caratteri</p>
              </div>
            </div>
          </div>
          
          <Button onClick={handleSavePage} disabled={updatePage.isPending} className="w-full">
            {updatePage.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salva Pagina
          </Button>
        </div>
      </TabsContent>;
  }

  // New page creation form
  if (isCreating) {
    return <TabsContent value="pages" className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Nuova Pagina</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
              Annulla
            </Button>
          </div>
          <div>
            <Label>Titolo</Label>
            <Input 
              value={newTitle} 
              onChange={e => {
                setNewTitle(e.target.value);
                setNewSlug(generateSlug(e.target.value));
              }} 
              placeholder="Es: Chi Siamo"
            />
          </div>
          <div>
            <Label>Slug (URL)</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">/</span>
              <Input 
                value={newSlug} 
                onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                placeholder="chi-siamo"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">L'URL sarà: octowonders.com/{newSlug}</p>
          </div>
          <div>
            <Label>Tipo di Contenuto</Label>
            <div className="flex items-center gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="contentType" 
                  checked={newContentType === 'markdown'} 
                  onChange={() => setNewContentType('markdown')} 
                />
                <span>Markdown</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="contentType" 
                  checked={newContentType === 'html'} 
                  onChange={() => setNewContentType('html')} 
                />
                <span>HTML</span>
              </label>
            </div>
          </div>
          <Button onClick={handleCreatePage} disabled={createPage.isPending} className="w-full">
            {createPage.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Crea Pagina
          </Button>
        </div>
      </TabsContent>;
  }

  return <TabsContent value="pages" className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Modifica i contenuti delle pagine del sito e le impostazioni SEO.
        </p>
        <Button variant="outline" size="sm" onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Nuova
        </Button>
      </div>
      <div className="space-y-2">
        {pages?.map(page => <div key={page.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
            <div>
              <p className="font-medium">{page.title}</p>
              <p className="text-xs text-muted-foreground">/{page.slug}</p>
              {page.seo_title && <p className="text-xs text-green-600 mt-1">🔍 SEO configurato</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleEditPage(page)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>)}
      </div>
    </TabsContent>;
};

// Hero Settings Tab sub-component
const HeroTabContent = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const { toast } = useToast();
  
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroCtaText, setHeroCtaText] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [trustBarItems, setTrustBarItems] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Load settings into local state
  useEffect(() => {
    if (settings) {
      setHeroTitle(getSettingValue<string>(settings, "hero_title", ""));
      setHeroSubtitle(getSettingValue<string>(settings, "hero_subtitle", ""));
      setHeroCtaText(getSettingValue<string>(settings, "hero_cta_text", ""));
      setHeroImage(getSettingValue<string>(settings, "hero_image", ""));
      setTrustBarItems(getSettingValue<string[]>(settings, "trust_bar_items", []));
    }
  }, [settings]);
  
  const handleSave = async () => {
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: "hero_title", value: heroTitle }),
        updateSetting.mutateAsync({ key: "hero_subtitle", value: heroSubtitle }),
        updateSetting.mutateAsync({ key: "hero_cta_text", value: heroCtaText }),
        updateSetting.mutateAsync({ key: "hero_image", value: heroImage }),
        updateSetting.mutateAsync({ key: "trust_bar_items", value: trustBarItems }),
      ]);
      setHasChanges(false);
      toast({
        title: "Hero salvato!",
        description: "Le modifiche sono state applicate.",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare le impostazioni.",
        variant: "destructive",
      });
    }
  };
  
  const handleImageUpload = async (url: string) => {
    setHeroImage(url);
    // Save immediately when image is uploaded
    try {
      await updateSetting.mutateAsync({ key: "hero_image", value: url });
      toast({
        title: "Immagine Hero salvata!",
        description: "La nuova immagine è stata applicata.",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare l'immagine.",
        variant: "destructive",
      });
    }
  };
  
  const handleAddTrustItem = () => {
    setTrustBarItems([...trustBarItems, "Nuovo elemento"]);
    setHasChanges(true);
  };
  
  const handleRemoveTrustItem = (index: number) => {
    setTrustBarItems(trustBarItems.filter((_, i) => i !== index));
    setHasChanges(true);
  };
  
  const handleUpdateTrustItem = (index: number, value: string) => {
    const updated = [...trustBarItems];
    updated[index] = value;
    setTrustBarItems(updated);
    setHasChanges(true);
  };
  
  if (isLoading) {
    return (
      <TabsContent value="hero" className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </TabsContent>
    );
  }
  
  return (
    <TabsContent value="hero" className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Modifica i contenuti della sezione Hero della homepage.
      </p>
      
      <div className="space-y-4">
        {/* Hero Image */}
        <div>
          <ImageUpload
            label="Immagine Hero (1920×1080px, WebP consigliato)"
            currentUrl={heroImage}
            onUpload={handleImageUpload}
            folder="hero"
          />
        </div>
        
        {/* H1 Title */}
        <div>
          <Label>Titolo H1 (Hero)</Label>
          <Input
            value={heroTitle}
            onChange={(e) => {
              setHeroTitle(e.target.value);
              setHasChanges(true);
            }}
            placeholder="Opere magnetiche. Uniche. Non per tutti."
          />
        </div>
        
        {/* Subtitle */}
        <div>
          <Label>Sottotitolo</Label>
          <Textarea
            value={heroSubtitle}
            onChange={(e) => {
              setHeroSubtitle(e.target.value);
              setHasChanges(true);
            }}
            placeholder="Trasforma la tua parete in un'esperienza visiva..."
            rows={3}
          />
        </div>
        
        {/* CTA Text */}
        <div>
          <Label>Testo CTA (bottone)</Label>
          <Input
            value={heroCtaText}
            onChange={(e) => {
              setHeroCtaText(e.target.value);
              setHasChanges(true);
            }}
            placeholder="ESPLORA LA COLLEZIONE"
          />
        </div>
        
        {/* Trust Bar Items */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="font-bold text-blue-600">Trust Bar (badge sotto l'Hero)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTrustItem}
            >
              <Plus className="h-4 w-4 mr-1" />
              Aggiungi
            </Button>
          </div>
          <div className="space-y-2">
            {trustBarItems.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={item}
                  onChange={(e) => handleUpdateTrustItem(index, e.target.value)}
                  placeholder="Testo badge..."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveTrustItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {trustBarItems.length === 0 && (
              <p className="text-xs text-muted-foreground py-2">
                Nessun elemento. Clicca "Aggiungi" per creare badge.
              </p>
            )}
          </div>
        </div>
        
        {/* Save Button */}
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
          Salva Hero
        </Button>
      </div>
    </TabsContent>
  );
};
interface AdminPanelProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
}
const AdminPanel = ({
  products,
  onProductsChange
}: AdminPanelProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStripeImportDialogOpen, setIsStripeImportDialogOpen] = useState(false);
  const [stripeImportJson, setStripeImportJson] = useState("");
  const [isCSVImportDialogOpen, setIsCSVImportDialogOpen] = useState(false);
  const [csvParseResult, setCSVParseResult] = useState<ParseResult | null>(null);
  const [csvImportMode, setCSVImportMode] = useState<CSVImportMode>('merge');
  const [isMigratingImages, setIsMigratingImages] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const {
    toast
  } = useToast();

  // Check if already authenticated via Supabase session and has admin role
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session) {
        // Verify user has admin role
        const {
          data: hasAdminRole
        } = await supabase.rpc('has_role', {
          _user_id: session.user.id,
          _role: 'admin'
        });
        setIsAuthenticated(!!hasAdminRole);
      }
    };
    checkSession();
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Verify admin role on auth state change
        setTimeout(async () => {
          const {
            data: hasAdminRole
          } = await supabase.rpc('has_role', {
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
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      // Sign in with email/password
      const {
        data: signInData,
        error: signInError
      } = await supabase.auth.signInWithPassword({
        email: emailInput,
        password: passwordInput
      });
      if (signInError) {
        toast({
          title: "Errore di autenticazione",
          description: "Email o password non corretti.",
          variant: "destructive"
        });
        return;
      }

      // Verify user has admin role
      const {
        data: hasAdminRole
      } = await supabase.rpc('has_role', {
        _user_id: signInData.user.id,
        _role: 'admin'
      });
      if (!hasAdminRole) {
        await supabase.auth.signOut();
        toast({
          title: "Accesso negato",
          description: "Non hai i permessi di amministratore.",
          variant: "destructive"
        });
        return;
      }
      setEmailInput("");
      setPasswordInput("");
      toast({
        title: "Accesso effettuato",
        description: "Benvenuto nel pannello admin."
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'accesso.",
        variant: "destructive"
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
      description: "Dati prodotto copiati negli appunti."
    });
  };
  const handleAddProduct = () => {
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: "Nuova Opera",
      medium: "Stampa su Tela",
      description: "",
      image_url: "",
      sizes: [],
      display_order: products.length,
      deal_label_enabled: false,
      deal_label_text: "OFFERTA DEL GIORNO, scade h20:00",
      mock_rooms: [],
      is_active: true
    };
    setEditProduct(newProduct);
    setIsEditDialogOpen(true);
  };
  const handleEditProduct = (product: Product) => {
    setEditProduct({
      ...product
    });
    setIsEditDialogOpen(true);
  };
  const handleSaveProduct = () => {
    if (!editProduct) return;
    const existingIndex = products.findIndex(p => p.id === editProduct.id);
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
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
  };
  const confirmDeleteProduct = () => {
    if (productToDelete) {
      onProductsChange(products.filter(p => p.id !== productToDelete.id));
      setProductToDelete(null);
    }
  };
  const handleMoveProduct = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= products.length) return;
    
    // Sort products and normalize display_order to sequential values (0, 1, 2, ...)
    const sorted = [...products].sort((a, b) => a.display_order - b.display_order);
    
    // Create new array with swapped positions and renumbered display_order
    const reordered = [...sorted];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    
    // Assign sequential display_order values
    const updated = reordered.map((product, i) => ({
      ...product,
      display_order: i
    }));
    
    onProductsChange(updated);
  };
  const updateEditSize = (sizeIndex: number, field: keyof ProductSize, value: string | number | boolean) => {
    if (!editProduct) return;
    const newSizes = [...editProduct.sizes];
    newSizes[sizeIndex] = {
      ...newSizes[sizeIndex],
      [field]: value
    };
    setEditProduct({
      ...editProduct,
      sizes: newSizes
    });
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
      const matchedCount = Object.keys(mapping).filter(name => products.some(p => p.name === name)).length;
      onProductsChange(updatedProducts);
      setIsStripeImportDialogOpen(false);
      setStripeImportJson("");
      toast({
        title: "Stripe IDs importati!",
        description: `${matchedCount} prodotti aggiornati con successo.`
      });
    } catch (error) {
      toast({
        title: "Errore nel JSON",
        description: "Formato JSON non valido. Controlla la sintassi.",
        variant: "destructive"
      });
    }
  };

  // CSV Import handlers
  const handleCSVFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      const result = parseCSVProducts(content, products.length);
      setCSVParseResult(result);
      setIsCSVImportDialogOpen(true);
    };
    reader.readAsText(file);

    // Reset input so same file can be selected again
    event.target.value = '';
  };
  const handleCSVImportConfirm = () => {
    if (!csvParseResult || csvParseResult.products.length === 0) return;
    let updatedProducts = [...products];
    let createdCount = 0;
    let updatedCount = 0;
    for (const csvProduct of csvParseResult.products) {
      const existingIndex = updatedProducts.findIndex(p => p.name.toLowerCase() === csvProduct.name.toLowerCase());
      if (existingIndex >= 0) {
        // Update existing product (merge sizes, keep existing data like image_url)
        const existing = updatedProducts[existingIndex];
        updatedProducts[existingIndex] = {
          ...existing,
          medium: csvProduct.medium,
          description: csvProduct.description || existing.description,
          sizes: csvProduct.sizes,
          mock_rooms: csvProduct.mock_rooms.map((mr, idx) => ({
            ...mr,
            url: existing.mock_rooms?.[idx]?.url || mr.url
          }))
        };
        updatedCount++;
      } else {
        // Create new product
        updatedProducts.push({
          ...csvProduct,
          id: crypto.randomUUID()
        } as Product);
        createdCount++;
      }
    }
    onProductsChange(updatedProducts);
    const messages = [];
    if (createdCount > 0) messages.push(`${createdCount} nuovi`);
    if (updatedCount > 0) messages.push(`${updatedCount} aggiornati`);
    toast({
      title: "Import completato!",
      description: `Prodotti: ${messages.join(', ')}.`
    });
    setIsCSVImportDialogOpen(false);
    setCSVParseResult(null);
  };
  const handleExportCSV = () => {
    const csv = exportProductsToCSV(products);
    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'octowonders-prodotti.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: "CSV esportato!",
      description: `${products.length} prodotti esportati.`
    });
  };
  const handleDownloadCSVTemplate = () => {
    const template = generateCSVTemplate();
    const blob = new Blob([template], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template-prodotti.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Migrate local images to Supabase Storage
  const handleMigrateLocalImages = async () => {
    const localImageProducts = products.filter(p => p.image_url.startsWith('/artworks/') || p.image_url.startsWith('artworks/'));
    if (localImageProducts.length === 0) {
      toast({
        title: "Nessuna immagine locale",
        description: "Tutte le immagini sono già su Supabase Storage."
      });
      return;
    }
    setIsMigratingImages(true);
    let migratedCount = 0;
    const errors: string[] = [];
    for (const product of localImageProducts) {
      try {
        // Normalize path
        const imagePath = product.image_url.startsWith('/') ? product.image_url : `/${product.image_url}`;

        // Fetch the local image
        const response = await fetch(imagePath);
        if (!response.ok) {
          errors.push(`${product.name}: file non trovato`);
          continue;
        }
        const blob = await response.blob();
        const fileName = imagePath.split('/').pop() || 'image.jpg';
        const fileExtension = fileName.split('.').pop() || 'jpg';
        const uniqueFileName = `artworks/${Date.now()}-${fileName}`;

        // Upload to Supabase Storage
        const {
          error: uploadError
        } = await supabase.storage.from('product-images').upload(uniqueFileName, blob, {
          contentType: `image/${fileExtension === 'png' ? 'png' : 'jpeg'}`,
          upsert: false
        });
        if (uploadError) {
          errors.push(`${product.name}: ${uploadError.message}`);
          continue;
        }

        // Get public URL
        const {
          data: urlData
        } = supabase.storage.from('product-images').getPublicUrl(uniqueFileName);

        // Update product in database
        const {
          error: updateError
        } = await supabase.from('products').update({
          image_url: urlData.publicUrl
        }).eq('id', product.id);
        if (updateError) {
          errors.push(`${product.name}: aggiornamento DB fallito`);
          continue;
        }
        migratedCount++;
      } catch (err) {
        errors.push(`${product.name}: errore imprevisto`);
      }
    }
    setIsMigratingImages(false);
    if (migratedCount > 0) {
      // Refresh products by triggering a re-fetch
      window.location.reload();
    }
    if (errors.length > 0) {
      toast({
        title: `Migrazione parziale: ${migratedCount}/${localImageProducts.length}`,
        description: errors.join(', '),
        variant: "destructive"
      });
    } else {
      toast({
        title: "Migrazione completata!",
        description: `${migratedCount} immagini migrate su Supabase Storage.`
      });
    }
  };
  return <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg">
            <Settings className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle>Admin Panel</SheetTitle>
              {isAuthenticated && <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Esci
                </Button>}
            </div>
          </SheetHeader>
          
          {!isAuthenticated ? <div className="mt-8 space-y-4">
              <div>
                <Label>Email</Label>
                <Input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="admin@example.com" disabled={isLoading} />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} disabled={isLoading} />
              </div>
              <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
                {isLoading ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accesso in corso...
                  </> : "Accedi"}
              </Button>
            </div> : <Tabs defaultValue="products" className="mt-4">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="products">Prodotti</TabsTrigger>
              <TabsTrigger value="skus">SKUs</TabsTrigger>
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="hellobar">Hello Bar</TabsTrigger>
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="pages">Pagine</TabsTrigger>
              <TabsTrigger value="images">Immagini</TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button onClick={handleAddProduct} className="flex-1">
                  <Plus className="mr-2 h-4 w-4" />
                  Aggiungi
                </Button>
                <Button onClick={() => csvInputRef.current?.click()} variant="secondary">
                  <FileUp className="mr-2 h-4 w-4" />
                  Importa CSV
                </Button>
                <input ref={csvInputRef} type="file" accept=".csv" onChange={handleCSVFileSelect} className="hidden" />
                <Button onClick={handleExportCSV} variant="outline" title="Esporta CSV">
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button onClick={() => setIsStripeImportDialogOpen(true)} variant="outline" size="icon" title="Stripe IDs">
                  <Upload className="h-4 w-4" />
                </Button>
                <Button onClick={handleMigrateLocalImages} variant="outline" title="Migra local to DB" disabled={isMigratingImages} className="gap-1">
                  {isMigratingImages ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                  <span className="text-xs">Migra local to DB</span>
                </Button>
              </div>

              <div className="space-y-2">
                {[...products].sort((a, b) => a.display_order - b.display_order).map((product, index) => <div key={product.id} className={`flex items-center gap-2 p-2 bg-muted rounded-md ${!product.is_active ? 'opacity-50' : ''}`}>
                      <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveProduct(index, "up")} disabled={index === 0}>
                          <GripVertical className="h-3 w-3 rotate-90" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveProduct(index, "down")} disabled={index === products.length - 1}>
                          <GripVertical className="h-3 w-3 -rotate-90" />
                        </Button>
                      </div>
                      <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.medium}</p>
                      </div>
                      <div className="flex items-center gap-1" title={product.is_active ? "Visibile" : "Nascosto"}>
                        <Switch 
                          checked={product.is_active} 
                          onCheckedChange={(checked) => {
                            const updated = products.map(p => 
                              p.id === product.id ? { ...p, is_active: checked } : p
                            );
                            onProductsChange(updated);
                          }}
                        />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>)}
              </div>
            </TabsContent>

            <TabsContent value="skus" className="space-y-4">
              <SKUEditor products={products} onProductsChange={onProductsChange} />
            </TabsContent>

            <MenuTabContent />

            <HeroTabContent />

            <PagesTabContent />

            <HelloBarTabContent />
            
            <TabsContent value="images" className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium text-sm">📷 Libreria Immagini Articoli</h3>
                <p className="text-xs text-muted-foreground">
                  Carica e gestisci immagini per le pagine HTML. Clicca per copiare l'URL.
                </p>
                <ArticleImageBrowser />
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium text-sm mb-2">🔧 Ottimizza Immagini Prodotti</h3>
                <ImageOptimizer />
              </div>
            </TabsContent>
            
          </Tabs>}
        </SheetContent>
      </Sheet>

      {/* Product Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editProduct && products.find(p => p.id === editProduct.id) ? "Modifica Prodotto" : "Aggiungi Prodotto"}
            </DialogTitle>
          </DialogHeader>
          {editProduct && <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input value={editProduct.name} onChange={e => setEditProduct({
              ...editProduct,
              name: e.target.value
            })} />
              </div>
              <div>
                <Label>URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm whitespace-nowrap">/prodotti/</span>
                  <Input 
                    value={editProduct.slug || ''} 
                    onChange={e => setEditProduct({...editProduct, slug: e.target.value || undefined})}
                    placeholder="inserisci-slug-qui"
                  />
                </div>
                {editProduct.slug && (
                  <p className="text-xs text-muted-foreground mt-1">
                    URL: octowonders.com/prodotti/{editProduct.slug}
                  </p>
                )}
              </div>
              <div>
                <Label>Tecnica</Label>
                <Input value={editProduct.medium} onChange={e => setEditProduct({
              ...editProduct,
              medium: e.target.value
            })} />
              </div>
              <ImageUpload label="Immagine Opera" currentUrl={editProduct.image_url} onUpload={url => setEditProduct({
            ...editProduct,
            image_url: url
          })} folder="artworks" />
              
              {/* NEW Badge Toggle */}
              <div className="flex items-center gap-2 py-2">
                <Switch 
                  checked={editProduct.is_new || false} 
                  onCheckedChange={(checked) => setEditProduct({...editProduct, is_new: checked})} 
                />
                <Label className="cursor-pointer">Mostra badge "NEW"</Label>
              </div>

              {/* Tags for Related Products */}
              <div className="space-y-2 border-t pt-4">
                <Label>Tags (per Opere Simili)</Label>
                <div className="flex flex-wrap gap-2">
                  {['polpo', 'acciuga', 'pesce', 'astratto'].map(tag => (
                    <label key={tag} className="flex items-center gap-1.5 px-3 py-1.5 border rounded-full cursor-pointer hover:bg-muted transition-colors">
                      <Checkbox 
                        checked={editProduct.tags?.includes(tag) || false} 
                        onCheckedChange={(checked) => {
                          const currentTags = editProduct.tags || [];
                          if (checked) {
                            setEditProduct({...editProduct, tags: [...currentTags, tag]});
                          } else {
                            setEditProduct({...editProduct, tags: currentTags.filter(t => t !== tag)});
                          }
                        }}
                      />
                      <span className="text-sm capitalize">{tag}</span>
                    </label>
                  ))}
                  {/* Show custom tags (not in predefined list) */}
                  {editProduct.tags?.filter(t => !['polpo', 'acciuga', 'pesce', 'astratto'].includes(t)).map(tag => (
                    <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 border rounded-full bg-primary/10">
                      <span className="text-sm">{tag}</span>
                      <button 
                        type="button"
                        onClick={() => setEditProduct({...editProduct, tags: editProduct.tags?.filter(t => t !== tag)})}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {/* Add custom tag input */}
                <div className="flex gap-2">
                  <Input 
                    placeholder="Nuovo tag..." 
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.currentTarget;
                        const newTag = input.value.trim().toLowerCase();
                        if (newTag && !editProduct.tags?.includes(newTag)) {
                          setEditProduct({...editProduct, tags: [...(editProduct.tags || []), newTag]});
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      const newTag = input.value.trim().toLowerCase();
                      if (newTag && !editProduct.tags?.includes(newTag)) {
                        setEditProduct({...editProduct, tags: [...(editProduct.tags || []), newTag]});
                        input.value = '';
                      }
                    }}
                  >
                    Aggiungi
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  I prodotti con gli stessi tag appariranno in "Opere Simili"
                </p>
              </div>

              <div>
                <Label>Descrizione</Label>
                <textarea value={editProduct.description} onChange={e => setEditProduct({
              ...editProduct,
              description: e.target.value
            })} className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background" placeholder="Descrizione dell'opera..." />
              </div>

              {/* SIZE + PRICE + STRIPE ID Table */}
              <div className="space-y-2 border-t pt-4">
                <Label>Dimensioni & Prezzi</Label>
                <div className="grid grid-cols-[1fr_80px_1fr_40px] gap-2 text-xs font-medium text-muted-foreground px-1">
                  <span>SIZE</span>
                  <span>PRICE €</span>
                  <span>STRIPE ID</span>
                  <span></span>
                </div>
                {editProduct.sizes.map((size, i) => <div key={i} className="grid grid-cols-[1fr_80px_1fr_40px] gap-2 items-center">
                    <Input placeholder="NNxNN" value={size.dimensions} onChange={e => updateEditSize(i, "dimensions", e.target.value)} />
                    <Input placeholder="0" type="number" value={size.price || ""} onChange={e => updateEditSize(i, "price", Number(e.target.value))} />
                    <Input placeholder="prod_ABC123" value={size.stripe_product_id || ""} onChange={e => updateEditSize(i, "stripe_product_id", e.target.value)} className="text-xs font-mono" />
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                if (!editProduct) return;
                const newSizes = editProduct.sizes.filter((_, idx) => idx !== i);
                setEditProduct({
                  ...editProduct,
                  sizes: newSizes
                });
              }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>)}
                <Button type="button" variant="outline" size="sm" className="w-full text-xs mt-2" onClick={() => {
              if (!editProduct) return;
              const newSizes: ProductSize[] = [...editProduct.sizes, {
                dimensions: "",
                price: 0,
                stripe_product_id: "",
                deal_label_enabled: false,
                deal_label_text: "",
                mock_room_url: ""
              }];
              setEditProduct({
                ...editProduct,
                sizes: newSizes
              });
            }}>
                  + Aggiungi Size
                </Button>
              </div>

              {/* Mock Room Images - linked to sizes */}
              <div className="space-y-3 border-t pt-4">
                <Label>Mock Room per Size</Label>
                <p className="text-xs text-muted-foreground">Ogni size può avere un'immagine mock room associata</p>
                <div className="space-y-3">
                  {editProduct.sizes.map((size, i) => <div key={i} className="flex gap-2 items-center p-2 bg-muted/50 rounded-lg">
                      <Input placeholder="SIZE" value={size.dimensions} onChange={e => updateEditSize(i, "dimensions", e.target.value)} className="w-24 bg-yellow-100 dark:bg-yellow-900/30 font-medium" />
                      <div className="flex-1">
                        <ImageUpload label="" currentUrl={size.mock_room_url || ""} onUpload={url => updateEditSize(i, "mock_room_url", url || "")} folder="mockrooms" />
                      </div>
                    </div>)}
                </div>
              </div>

              {/* Offerte del Giorno - collapsed section */}
              <div className="space-y-2 border-t pt-4">
                <Label>Offerte del Giorno</Label>
                {editProduct.sizes.map((size, i) => <div key={i} className="p-2 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium w-20">{size.dimensions || "—"}</span>
                      <Switch checked={size.deal_label_enabled || false} onCheckedChange={checked => updateEditSize(i, "deal_label_enabled", checked)} />
                      <span className="text-xs text-muted-foreground">Offerta</span>
                      {size.deal_label_enabled && <>
                          <Input placeholder="Prezzo Offerta €" type="number" value={size.deal_price || ""} onChange={e => updateEditSize(i, "deal_price", Number(e.target.value))} className="w-24 text-xs" />
                          <Input value={size.deal_label_text || ""} onChange={e => updateEditSize(i, "deal_label_text", e.target.value)} className="flex-1 text-xs" placeholder="es. scade il 31 Dic." />
                        </>}
                    </div>
                  </div>)}
              </div>
 
               <Button onClick={handleSaveProduct} className="w-full">
                 Salva
               </Button>
            </div>}
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
              <Textarea value={stripeImportJson} onChange={e => setStripeImportJson(e.target.value)} placeholder={`{
  "Octoheaded": "prod_ABC123",
  "Octoghost": "prod_DEF456",
  "Octosuckers": "prod_GHI789"
}`} className="min-h-[200px] font-mono text-sm" />
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

      {/* CSV Import Dialog */}
      <Dialog open={isCSVImportDialogOpen} onOpenChange={setIsCSVImportDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importa Prodotti da CSV</DialogTitle>
          </DialogHeader>
          {csvParseResult && <div className="space-y-4">
              {/* Errors */}
              {csvParseResult.errors.length > 0 && <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Errori</span>
                  </div>
                  <ul className="text-sm text-destructive space-y-1">
                    {csvParseResult.errors.map((err, i) => <li key={i}>• {err}</li>)}
                  </ul>
                </div>}

              {/* Warnings */}
              {csvParseResult.warnings.length > 0 && <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-600 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Avvisi</span>
                  </div>
                  <ul className="text-sm text-yellow-600 space-y-1">
                    {csvParseResult.warnings.map((warn, i) => <li key={i}>• {warn}</li>)}
                  </ul>
                </div>}

              {/* Success preview */}
              {csvParseResult.products.length > 0 && <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">{csvParseResult.products.length} prodotti pronti</span>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {csvParseResult.products.map((product, i) => <div key={i} className="text-sm bg-background/50 p-2 rounded">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.sizes.map(s => `${s.dimensions} €${s.price}`).join(' | ')}
                        </p>
                      </div>)}
                  </div>
                </div>}

              <div className="flex gap-2">
                <Button onClick={handleCSVImportConfirm} className="flex-1" disabled={csvParseResult.products.length === 0}>
                  Importa {csvParseResult.products.length} prodotti
                </Button>
                <Button onClick={handleDownloadCSVTemplate} variant="outline" title="Scarica template CSV">
                  <Download className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Formato CSV: Nome,Tecnica,Dimensioni,Prezzi,Descrizione,Stripe_ID<br />
                Dimensioni e Prezzi separati da virgola (es. "40x60,75x100" e "119,149")
              </p>
            </div>}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={open => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare "{productToDelete?.name}"? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProduct} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>;
};
export default AdminPanel;