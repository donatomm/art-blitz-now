import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ImageIcon, CheckCircle, AlertCircle, Play, RefreshCw } from "lucide-react";

interface StorageImage {
  name: string;
  fullPath: string;
  size: number;
  type: 'convertible' | 'skip-gif' | 'already-webp' | 'oversized-webp';
}

interface ConversionResult {
  originalPath: string;
  newPath: string;
  originalSize: number;
  newSize: number;
  saved: number;
  status: 'success' | 'error';
  error?: string;
}

// Aggressive optimization for LCP < 2.5s target
const WEBP_QUALITY = 0.72;      // 72% - visually identical, -40% file size
const MAX_DIMENSION = 1400;     // 1400px max - sufficient for retina displays
const TARGET_SIZE_KB = 200;     // Warn if output exceeds this

const convertToWebP = (blob: Blob): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
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
        (webpBlob) => {
          if (webpBlob) {
            resolve(webpBlob);
          } else {
            reject(new Error('Failed to convert to WebP'));
          }
        },
        'image/webp',
        WEBP_QUALITY
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(blob);
  });
};

const ImageOptimizer = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [images, setImages] = useState<StorageImage[]>([]);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [batchSize, setBatchSize] = useState<number | 'all'>('all');
  const { toast } = useToast();

  const scanStorage = async () => {
    setIsScanning(true);
    setImages([]);
    setResults([]);
    
    try {
      const folders = ['artworks', 'mockrooms'];
      const allImages: StorageImage[] = [];

      for (const folder of folders) {
        const { data, error } = await supabase.storage
          .from('product-images')
          .list(folder, { limit: 500 });

        if (error) {
          console.error(`Error listing ${folder}:`, error);
          continue;
        }

        for (const file of data || []) {
          if (!file.name || file.id === null) continue; // Skip folders
          
          const ext = file.name.split('.').pop()?.toLowerCase();
          const fullPath = `${folder}/${file.name}`;
          
          let type: StorageImage['type'] = 'convertible';
          const fileSize = file.metadata?.size || 0;
          
          if (ext === 'gif') {
            type = 'skip-gif';
          } else if (ext === 'webp') {
            // Check if WebP is oversized (> 200KB needs re-optimization)
            if (fileSize > TARGET_SIZE_KB * 1024) {
              type = 'oversized-webp';
            } else {
              type = 'already-webp';
            }
          } else if (!['jpg', 'jpeg', 'png'].includes(ext || '')) {
            continue; // Skip non-image files
          }

          allImages.push({
            name: file.name,
            fullPath,
            size: file.metadata?.size || 0,
            type,
          });
        }
      }

      setImages(allImages);
      
      const convertible = allImages.filter(i => i.type === 'convertible').length;
      const oversized = allImages.filter(i => i.type === 'oversized-webp').length;
      const gifs = allImages.filter(i => i.type === 'skip-gif').length;
      const webps = allImages.filter(i => i.type === 'already-webp').length;
      
      toast({
        title: "Scansione completata",
        description: `${convertible} da convertire, ${oversized} WebP oversized (>${TARGET_SIZE_KB}KB), ${gifs} GIF, ${webps} OK`,
      });
    } catch (error) {
      console.error('Scan error:', error);
      toast({
        title: "Errore scansione",
        description: "Impossibile scansionare lo storage.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const convertAll = async () => {
    // Include both convertible (jpg/png) and oversized-webp for re-optimization
    const allConvertible = images.filter(i => i.type === 'convertible' || i.type === 'oversized-webp');
    const toConvert = batchSize === 'all' ? allConvertible : allConvertible.slice(0, batchSize);
    
    if (toConvert.length === 0) {
      toast({
        title: "Nessuna immagine",
        description: "Non ci sono immagini da convertire.",
      });
      return;
    }

    setIsConverting(true);
    setProgress(0);
    setResults([]);

    const newResults: ConversionResult[] = [];
    let totalSaved = 0;

    for (let i = 0; i < toConvert.length; i++) {
      const image = toConvert[i];
      setCurrentImage(image.name);
      setProgress(Math.round(((i + 1) / toConvert.length) * 100));

      try {
        // Download original
        const { data: downloadData, error: downloadError } = await supabase.storage
          .from('product-images')
          .download(image.fullPath);

        if (downloadError || !downloadData) {
          throw new Error(downloadError?.message || 'Download failed');
        }

        const originalSize = downloadData.size;

        // Convert to WebP
        const webpBlob = await convertToWebP(downloadData);
        const newSize = webpBlob.size;

        // Warn if still oversized
        if (newSize > TARGET_SIZE_KB * 1024) {
          console.warn(`⚠️ ${image.name} still ${(newSize/1024).toFixed(0)}KB > ${TARGET_SIZE_KB}KB target`);
        }

        // Generate new path (keep .webp for oversized-webp, convert extension for others)
        const newPath = image.type === 'oversized-webp' 
          ? image.fullPath 
          : image.fullPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

        // Upload WebP
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(newPath, webpBlob, {
            cacheControl: '3600',
            upsert: true,
            contentType: 'image/webp',
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        // Get public URLs
        const { data: oldUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(image.fullPath);
        
        const { data: newUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(newPath);

        // Update product URLs in database
        await updateProductUrls(oldUrlData.publicUrl, newUrlData.publicUrl);

        // Only delete original if the path actually changed
        // (prevents self-deletion of re-optimized oversized-webp files)
        if (newPath !== image.fullPath) {
          await supabase.storage
            .from('product-images')
            .remove([image.fullPath]);
          console.log(`🗑️ Deleted original: ${image.fullPath}`);
        } else {
          console.log(`♻️ Re-optimized in-place: ${image.fullPath}`);
        }

        const saved = originalSize - newSize;
        totalSaved += saved;

        newResults.push({
          originalPath: image.fullPath,
          newPath,
          originalSize,
          newSize,
          saved,
          status: 'success',
        });

        console.log(`✓ ${image.name}: ${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (saved ${(saved / 1024).toFixed(1)}KB)`);

      } catch (error: any) {
        console.error(`✗ ${image.name}:`, error);
        newResults.push({
          originalPath: image.fullPath,
          newPath: '',
          originalSize: image.size,
          newSize: 0,
          saved: 0,
          status: 'error',
          error: error.message,
        });
      }

      setResults([...newResults]);
    }

    setIsConverting(false);
    setCurrentImage(null);

    const successCount = newResults.filter(r => r.status === 'success').length;
    const errorCount = newResults.filter(r => r.status === 'error').length;

    toast({
      title: "Conversione completata!",
      description: `${successCount} convertite, ${errorCount} errori. Risparmiati ${(totalSaved / 1024 / 1024).toFixed(2)}MB`,
    });
  };

  const updateProductUrls = async (oldUrl: string, newUrl: string) => {
    // Fetch all products
    const { data: products, error } = await supabase
      .from('products')
      .select('*');

    if (error || !products) return;

    for (const product of products) {
      let updated = false;
      const updates: any = {};

      // Check main image URL
      if (product.image_url === oldUrl) {
        updates.image_url = newUrl;
        updated = true;
      }

      // Check mock_rooms URLs
      if (Array.isArray(product.mock_rooms)) {
        const newMockRooms = product.mock_rooms.map((mr: any) => {
          if (mr.url === oldUrl) {
            updated = true;
            return { ...mr, url: newUrl };
          }
          return mr;
        });
        if (updated) {
          updates.mock_rooms = newMockRooms;
        }
      }

      // Check sizes mock_room_url
      if (Array.isArray(product.sizes)) {
        const newSizes = product.sizes.map((size: any) => {
          if (size.mock_room_url === oldUrl) {
            updated = true;
            return { ...size, mock_room_url: newUrl };
          }
          return size;
        });
        if (updated && !updates.mock_rooms) {
          updates.sizes = newSizes;
        } else if (updated) {
          updates.sizes = newSizes;
        }
      }

      if (updated) {
        await supabase
          .from('products')
          .update(updates)
          .eq('id', product.id);
        
        console.log(`Updated product ${product.name} URLs`);
      }
    }
  };

  const convertibleCount = images.filter(i => i.type === 'convertible').length;
  const oversizedCount = images.filter(i => i.type === 'oversized-webp').length;
  const gifCount = images.filter(i => i.type === 'skip-gif').length;
  const webpCount = images.filter(i => i.type === 'already-webp').length;
  const totalToConvert = convertibleCount + oversizedCount;
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const totalSaved = results.reduce((acc, r) => acc + r.saved, 0);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Converti le immagini esistenti in WebP per ridurre dimensioni e velocizzare il sito.
      </p>

      {/* Scan Button */}
      <Button 
        onClick={scanStorage} 
        disabled={isScanning || isConverting}
        variant="outline"
        className="w-full"
      >
        {isScanning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Scansione in corso...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Analizza Storage
          </>
        )}
      </Button>

      {/* Scan Results */}
      {images.length > 0 && !isConverting && results.length === 0 && (
        <div className="p-4 bg-muted rounded-lg space-y-3">
          <div className="text-sm font-bold text-blue-600">Trovate {images.length} immagini:</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-blue-500" />
              <span>{convertibleCount} da convertire</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span>{oversizedCount} WebP &gt;{TARGET_SIZE_KB}KB</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{webpCount} già ottimizzate</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span>{gifCount} GIF (skip)</span>
            </div>
          </div>
          
          {totalToConvert > 0 && (
            <div className="space-y-3">
              {/* Batch size selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Batch:</span>
                <div className="flex gap-1">
                  {[5, 10, 25, 50].map(n => (
                    <Button
                      key={n}
                      size="sm"
                      variant={batchSize === n ? "default" : "outline"}
                      className="h-7 px-2 text-xs"
                      onClick={() => setBatchSize(n)}
                    >
                      {n}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant={batchSize === 'all' ? "default" : "outline"}
                    className="h-7 px-2 text-xs"
                    onClick={() => setBatchSize('all')}
                  >
                    Tutte
                  </Button>
                </div>
              </div>

              {/* Preview list of images to be converted */}
              <div className="bg-background/50 rounded p-2 max-h-32 overflow-y-auto">
                <div className="text-xs font-bold text-blue-600 mb-1">
                  Immagini da ottimizzare ({convertibleCount} nuove + {oversizedCount} oversized):
                </div>
                <div className="space-y-1 text-xs font-mono">
                  {images
                    .filter(i => i.type === 'convertible' || i.type === 'oversized-webp')
                    .slice(0, batchSize === 'all' ? undefined : batchSize)
                    .map((img, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="truncate">{img.fullPath}</span>
                        <span className={`ml-2 ${img.type === 'oversized-webp' ? 'text-orange-500 font-bold' : 'text-muted-foreground'}`}>
                          {(img.size / 1024).toFixed(0)}KB
                        </span>
                      </div>
                    ))}
                </div>
              </div>
              
              <Button onClick={convertAll} className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Ottimizza {batchSize === 'all' ? totalToConvert : Math.min(batchSize as number, totalToConvert)} immagini (target &lt;{TARGET_SIZE_KB}KB)
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Conversion Progress */}
      {isConverting && (
        <div className="p-4 bg-muted rounded-lg space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Conversione in corso...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          {currentImage && (
            <p className="text-xs text-muted-foreground truncate">
              ⏳ {currentImage}
            </p>
          )}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !isConverting && (
        <div className="p-4 bg-muted rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Conversione completata!</span>
            <span className="text-xs text-muted-foreground">
              💾 Risparmiati {(totalSaved / 1024 / 1024).toFixed(2)}MB
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>{successCount} convertite</span>
            </div>
            {errorCount > 0 && (
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span>{errorCount} errori</span>
              </div>
            )}
          </div>

          {/* Detailed results */}
          <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
            {results.map((r, i) => (
              <div 
                key={i} 
                className={`p-2 rounded ${r.status === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'}`}
              >
                {r.status === 'success' ? (
                  <span>
                    ✓ {r.originalPath.split('/').pop()} → {(r.originalSize / 1024).toFixed(0)}KB → {(r.newSize / 1024).toFixed(0)}KB 
                    <span className="text-green-600 ml-1">(-{((r.saved / r.originalSize) * 100).toFixed(0)}%)</span>
                  </span>
                ) : (
                  <span className="text-red-500">
                    ✗ {r.originalPath.split('/').pop()}: {r.error}
                  </span>
                )}
              </div>
            ))}
          </div>

          <Button onClick={scanStorage} variant="outline" size="sm" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Scansiona di nuovo
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageOptimizer;
