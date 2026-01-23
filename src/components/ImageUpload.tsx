import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  label: string;
  currentUrl?: string;
  onUpload: (url: string) => void;
  folder: string;
}

// Aggressive optimization for LCP < 2.5s target
const WEBP_QUALITY = 0.72;      // 72% - visually identical, -40% file size
const MAX_DIMENSION = 1400;     // 1400px max - sufficient for retina displays

/**
 * Sanitizes a filename for SEO-friendly URLs
 */
const sanitizeFilename = (filename: string): string => {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const normalized = nameWithoutExt.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return normalized
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
};

/**
 * Converts an image file to WebP format using Canvas API
 * Also resizes if larger than MAX_DIMENSION
 */
const convertToWebP = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      
      // Resize if too large
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
            console.log(`[ImageUpload] Converted to WebP: ${(file.size / 1024).toFixed(1)}KB → ${(blob.size / 1024).toFixed(1)}KB`);
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

const ImageUpload = ({ label, currentUrl, onUpload, folder }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Sync preview with currentUrl when it changes (e.g., when switching products)
  useEffect(() => {
    setPreview(currentUrl || null);
  }, [currentUrl]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Errore",
        description: "Seleziona un file immagine valido.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB before conversion)
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
      // Verify session before upload
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('[ImageUpload] Session check:', {
        hasSession: !!sessionData.session,
        userId: sessionData.session?.user?.id,
        email: sessionData.session?.user?.email
      });

      if (!sessionData.session) {
        toast({
          title: "Sessione scaduta",
          description: "Devi effettuare nuovamente il login per caricare immagini.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      // Convert to WebP (skip for GIFs to preserve animation)
      let uploadBlob: Blob = file;
      let fileExt = 'webp';
      
      if (file.type === 'image/gif') {
        // Keep GIFs as-is to preserve animation
        uploadBlob = file;
        fileExt = 'gif';
        console.log('[ImageUpload] Keeping GIF format for animation');
      } else {
        // Convert to WebP
        uploadBlob = await convertToWebP(file);
      }

      // Create SEO-friendly filename from original
      const baseName = sanitizeFilename(file.name);
      const desiredFileName = baseName ? `${baseName}.${fileExt}` : `image-${Date.now()}.${fileExt}`;
      
      // Check if file already exists
      const { data: existingFiles } = await supabase.storage
        .from("product-images")
        .list(folder, { search: desiredFileName });
      
      const fileExists = existingFiles?.some(f => f.name === desiredFileName);
      const fileName = `${folder}/${fileExists ? `${baseName}-${Date.now()}.${fileExt}` : desiredFileName}`;

      console.log('[ImageUpload] Uploading to:', fileName);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, uploadBlob, {
          cacheControl: "3600",
          upsert: false,
          contentType: fileExt === 'gif' ? 'image/gif' : 'image/webp',
        });

      if (error) {
        console.error('[ImageUpload] Storage error:', error);
        throw error;
      }

      console.log('[ImageUpload] Upload successful:', data.path);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(data.path);

      setPreview(urlData.publicUrl);
      onUpload(urlData.publicUrl);

      toast({
        title: "Caricamento completato",
        description: "Immagine caricata con successo.",
      });
    } catch (error: any) {
      console.error("[ImageUpload] Upload error:", error);
      
      // Provide more specific error messages
      let errorMessage = "Impossibile caricare l'immagine.";
      if (error.message?.includes("row-level security")) {
        errorMessage = "Permessi insufficienti. Prova a rieffettuare il login.";
      } else if (error.message?.includes("not authenticated")) {
        errorMessage = "Sessione scaduta. Effettua nuovamente il login.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Errore caricamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    onUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-2">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt={label}
              className="w-16 h-16 object-cover rounded border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-5 w-5"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="w-16 h-16 border-2 border-dashed border-muted-foreground/25 rounded flex items-center justify-center">
            <Upload className="h-6 w-6 text-muted-foreground/50" />
          </div>
        )}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id={`upload-${label}`}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Caricamento...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Sfoglia
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
