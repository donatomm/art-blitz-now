import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, Loader2, ImageIcon } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { useToast } from "@/hooks/use-toast";
import { Page } from "@/hooks/usePages";

export interface PageSaveData {
  title: string;
  slug: string;
  content: string;
  isHtmlMode: boolean;
  seoTitle: string;
  seoDescription: string;
}

interface PageEditorFormProps {
  page: Page;
  isSaving: boolean;
  onSave: (data: PageSaveData) => void;
  onCancel: () => void;
}

/**
 * PageEditorForm - Isolated page editor component.
 * All edit state lives here so typing only re-renders this small component,
 * NOT the entire PagesTabContent (which includes the pages list).
 *
 * NO useDebouncedInput here — this component is already isolated.
 * Plain useState + direct onChange gives <5ms render cost.
 * Adding debounce would only add 150ms artificial delay (INP regression).
 *
 * Anti-regression: See docs/SAFETY-CHECK.md §11 Rule 1 before adding debounce.
 */
const PageEditorForm = ({ page, isSaving, onSave, onCancel }: PageEditorFormProps) => {
  const [editTitle, setEditTitle] = useState(page.title);
  const [editSlug, setEditSlug] = useState(page.slug);
  const [editContent, setEditContent] = useState(page.content);
  const [editSeoTitle, setEditSeoTitle] = useState(page.seo_title || "");
  const [editSeoDescription, setEditSeoDescription] = useState(page.seo_description || "");
  const [isHtmlMode, setIsHtmlMode] = useState(page.content_type === "html");
  const [showImageUpload, setShowImageUpload] = useState(false);

  const { toast } = useToast();

  const handleImageUploaded = (url: string) => {
    const markdownImage = `\n![Immagine](${url})\n`;
    setEditContent(editContent + markdownImage);
    setShowImageUpload(false);
    toast({
      title: "Immagine inserita!",
      description: "Il codice Markdown dell'immagine è stato aggiunto al contenuto.",
    });
  };

  const handleSave = () => {
    onSave({
      title: editTitle,
      slug: editSlug,
      content: editContent,
      isHtmlMode,
      seoTitle: editSeoTitle,
      seoDescription: editSeoDescription,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Modifica: {page.slug}</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Annulla
        </Button>
      </div>

      <div>
        <Label>Titolo</Label>
        <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
      </div>

      <div>
        <Label>Slug (URL)</Label>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">/</span>
          <Input
            value={editSlug}
            onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\/-]/g, ""))}
            placeholder="nome-pagina o blog/articolo"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          💡 Usa "/" per percorsi annidati (es: blog/articolo, guide/tutorial)
        </p>
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
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          rows={isHtmlMode ? 20 : 12}
          className="font-mono text-sm"
          placeholder={isHtmlMode ? "Incolla qui il codice HTML..." : "Scrivi in Markdown..."}
        />
      </div>

      {/* Contact Buttons Info Banner */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mt-2">
        <p className="text-sm font-medium text-green-800 dark:text-green-300">
          📱 I pulsanti WhatsApp + Email appaiono automaticamente in fondo a questa pagina.
        </p>
        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
          Per cambiare numero o email, vai alla tab "Hello/Contct".
        </p>
      </div>

      {/* SEO Fields */}
      <div className="border-t pt-4 mt-4">
        <h4 className="font-bold text-sm mb-3 text-blue-600">🔍 SEO (per Google)</h4>
        <div className="space-y-3">
          <div>
            <Label>
              SEO Title{" "}
              <span className="text-xs text-muted-foreground ml-1">(max 60 caratteri)</span>
            </Label>
            <Input
              value={editSeoTitle}
              onChange={(e) => setEditSeoTitle(e.target.value)}
              placeholder="Es: Marco De Francesco - Artista | OctoWonders"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground mt-1">{editSeoTitle.length}/60 caratteri</p>
          </div>
          <div>
            <Label>
              SEO Description{" "}
              <span className="text-xs text-muted-foreground ml-1">(max 160 caratteri)</span>
            </Label>
            <Textarea
              value={editSeoDescription}
              onChange={(e) => setEditSeoDescription(e.target.value)}
              placeholder="Es: Scopri l'artista Marco De Francesco. Stampe su tela originali a tema marino."
              rows={2}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {editSeoDescription.length}/160 caratteri
            </p>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        {isSaving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Salva Pagina
      </Button>
    </div>
  );
};

export default PageEditorForm;
