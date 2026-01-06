import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Upload, Copy, Check, Loader2, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StorageImage {
  name: string;
  publicUrl: string;
  size: number;
}

const WEBP_QUALITY = 0.85;
const MAX_DIMENSION = 2000;
const BUCKET_NAME = "article-images";

/**
 * Converts an image file to WebP format using Canvas API
 */
const convertToWebP = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;
      
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log(`[ArticleImageBrowser] Converted to WebP: ${(file.size / 1024).toFixed(1)}KB → ${(blob.size / 1024).toFixed(1)}KB`);
            resolve(blob);
          } else {
            reject(new Error('Failed to convert to WebP'));
          }
        },
        'image/webp',
        WEBP_QUALITY
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

const ArticleImageBrowser = () => {
  const [images, setImages] = useState<StorageImage[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scanBucket = async () => {
    setIsScanning(true);
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });

      if (error) throw error;

      const imageFiles = (data || []).filter(file => 
        file.name && !file.name.startsWith('.') && file.metadata
      );

      const imagesWithUrls: StorageImage[] = imageFiles.map(file => {
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(file.name);

        return {
          name: file.name,
          publicUrl: urlData.publicUrl,
          size: file.metadata?.size || 0,
        };
      });

      setImages(imagesWithUrls);
      
      if (imagesWithUrls.length === 0) {
        toast({
          title: "Nessuna immagine",
          description: "Il bucket article-images è vuoto.",
        });
      }
    } catch (error: any) {
      console.error("[ArticleImageBrowser] Scan error:", error);
      toast({
        title: "Errore scansione",
        description: error.message || "Impossibile leggere il bucket.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Errore",
        description: "Seleziona un file immagine valido.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Errore",
        description: "L'immagine deve essere inferiore a 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "Sessione scaduta",
          description: "Effettua nuovamente il login.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      // Convert to WebP (skip for GIFs)
      let uploadBlob: Blob = file;
      let fileExt = 'webp';
      
      if (file.type === 'image/gif') {
        uploadBlob = file;
        fileExt = 'gif';
      } else {
        uploadBlob = await convertToWebP(file);
      }

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, uploadBlob, {
          cacheControl: "3600",
          upsert: false,
          contentType: fileExt === 'gif' ? 'image/gif' : 'image/webp',
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

      toast({
        title: "Caricamento completato!",
        description: "Immagine caricata con successo.",
      });

      // Refresh list
      await scanBucket();

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("[ArticleImageBrowser] Upload error:", error);
      toast({
        title: "Errore caricamento",
        description: error.message || "Impossibile caricare l'immagine.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast({
        title: "URL copiato!",
        description: "Incolla nel contenuto HTML.",
      });
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile copiare negli appunti.",
        variant: "destructive",
      });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Caricamento...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Carica Immagine
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={scanBucket}
          disabled={isScanning}
        >
          {isScanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Empty state */}
      {images.length === 0 && !isScanning && (
        <div className="text-center py-8 text-muted-foreground">
          <Image className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Clicca "Aggiorna" per vedere le immagini</p>
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image) => (
            <div
              key={image.name}
              className={`relative group cursor-pointer rounded-md overflow-hidden border transition-all ${
                copiedUrl === image.publicUrl
                  ? "ring-2 ring-green-500 border-green-500"
                  : "hover:border-primary"
              }`}
              onClick={() => copyToClipboard(image.publicUrl)}
            >
              <img
                src={image.publicUrl}
                alt={image.name}
                className="w-full h-20 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {copiedUrl === image.publicUrl ? (
                  <Check className="h-6 w-6 text-green-400" />
                ) : (
                  <Copy className="h-5 w-5 text-white" />
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5">
                <p className="text-[10px] text-white truncate">{image.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Clicca su un'immagine per copiare l'URL negli appunti.
      </p>
    </div>
  );
};

export default ArticleImageBrowser;
