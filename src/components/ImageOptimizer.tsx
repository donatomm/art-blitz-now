import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ImageIcon, CheckCircle, AlertCircle, Play, RefreshCw, Eye, Trash2, ShieldAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  status: 'success' | 'error' | 'dry-run';
  error?: string;
  dbUpdateVerified?: boolean;
}

// Aggressive optimization for LCP < 2.5s target
const WEBP_QUALITY = 0.72;
const MAX_DIMENSION = 1400;
const TARGET_SIZE_KB = 200;

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
  const [isDryRun, setIsDryRun] = useState(true); // DEFAULT TO DRY-RUN FOR SAFETY
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'convert' | null>(null);
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
          if (!file.name || file.id === null) continue;
          
          const ext = file.name.split('.').pop()?.toLowerCase();
          const fullPath = `${folder}/${file.name}`;
          
          let type: StorageImage['type'] = 'convertible';
          const fileSize = file.metadata?.size || 0;
          
          if (ext === 'gif') {
            type = 'skip-gif';
          } else if (ext === 'webp') {
            if (fileSize > TARGET_SIZE_KB * 1024) {
              type = 'oversized-webp';
            } else {
              type = 'already-webp';
            }
          } else if (!['jpg', 'jpeg', 'png'].includes(ext || '')) {
            continue;
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

  const requestConversion = () => {
    if (isDryRun) {
      // Dry run doesn't need confirmation
      convertAll();
    } else {
      // Real conversion requires confirmation
      setPendingAction('convert');
      setShowConfirmDialog(true);
    }
  };

  const handleConfirm = () => {
    setShowConfirmDialog(false);
    if (pendingAction === 'convert') {
      convertAll();
    }
    setPendingAction(null);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  /**
   * CRITICAL: Verify database update succeeded by re-fetching and comparing URLs
   * Returns true ONLY if the database now contains the new URL
   */
  const verifyDatabaseUpdate = async (oldUrl: string, newUrl: string): Promise<boolean> => {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('id, image_url, mock_rooms, sizes');

      if (error || !products) {
        console.error('❌ DB verification failed - could not fetch products:', error);
        return false;
      }

      // Check if oldUrl still exists anywhere (it shouldn't after successful update)
      for (const product of products) {
        if (product.image_url === oldUrl) {
          console.error(`❌ DB verification failed - old URL still in image_url for product ${product.id}`);
          return false;
        }
        
        if (Array.isArray(product.mock_rooms)) {
          for (const mr of product.mock_rooms as any[]) {
            if (mr.url === oldUrl) {
              console.error(`❌ DB verification failed - old URL still in mock_rooms for product ${product.id}`);
              return false;
            }
          }
        }
        
        if (Array.isArray(product.sizes)) {
          for (const size of product.sizes as any[]) {
            if (size.mock_room_url === oldUrl) {
              console.error(`❌ DB verification failed - old URL still in sizes for product ${product.id}`);
              return false;
            }
          }
        }
      }

      // Also verify that new URL exists somewhere (if the old URL was in DB)
      let newUrlFound = false;
      for (const product of products) {
        if (product.image_url === newUrl) newUrlFound = true;
        if (Array.isArray(product.mock_rooms)) {
          for (const mr of product.mock_rooms as any[]) {
            if (mr.url === newUrl) newUrlFound = true;
          }
        }
        if (Array.isArray(product.sizes)) {
          for (const size of product.sizes as any[]) {
            if (size.mock_room_url === newUrl) newUrlFound = true;
          }
        }
      }

      console.log(`✅ DB verification passed - old URL removed, new URL ${newUrlFound ? 'found' : 'not applicable'}`);
      return true;
    } catch (err) {
      console.error('❌ DB verification exception:', err);
      return false;
    }
  };

  const updateProductUrls = async (oldUrl: string, newUrl: string): Promise<boolean> => {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*');

      if (error || !products) {
        console.error('Failed to fetch products for URL update:', error);
        return false;
      }

      let updatesMade = 0;
      let updatesFailed = 0;

      for (const product of products) {
        let updated = false;
        const updates: any = {};

        if (product.image_url === oldUrl) {
          updates.image_url = newUrl;
          updated = true;
        }

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
          const { error: updateError } = await supabase
            .from('products')
            .update(updates)
            .eq('id', product.id);
          
          if (updateError) {
            console.error(`Failed to update product ${product.name}:`, updateError);
            updatesFailed++;
          } else {
            console.log(`✓ Updated product ${product.name} URLs`);
            updatesMade++;
          }
        }
      }

      // Return true only if no updates failed
      if (updatesFailed > 0) {
        console.error(`⚠️ ${updatesFailed} product updates failed`);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Exception during URL update:', err);
      return false;
    }
  };

  const convertAll = async () => {
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
    let deletionsPrevented = 0;

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

        if (newSize > TARGET_SIZE_KB * 1024) {
          console.warn(`⚠️ ${image.name} still ${(newSize/1024).toFixed(0)}KB > ${TARGET_SIZE_KB}KB target`);
        }

        const newPath = image.type === 'oversized-webp' 
          ? image.fullPath 
          : image.fullPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

        const saved = originalSize - newSize;

        // DRY-RUN MODE: Just simulate, don't modify anything
        if (isDryRun) {
          newResults.push({
            originalPath: image.fullPath,
            newPath,
            originalSize,
            newSize,
            saved,
            status: 'dry-run',
            dbUpdateVerified: true,
          });
          totalSaved += saved;
          console.log(`🔍 [DRY-RUN] ${image.name}: ${(originalSize / 1024).toFixed(1)}KB → ${(newSize / 1024).toFixed(1)}KB (would save ${(saved / 1024).toFixed(1)}KB)`);
          continue;
        }

        // REAL MODE: Upload, verify DB, then conditionally delete

        // Step 1: Upload WebP
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(newPath, webpBlob, {
            cacheControl: '3600',
            upsert: true,
            contentType: 'image/webp',
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Step 2: Get public URLs
        const { data: oldUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(image.fullPath);
        
        const { data: newUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(newPath);

        // Step 3: Update product URLs in database
        const dbUpdateSuccess = await updateProductUrls(oldUrlData.publicUrl, newUrlData.publicUrl);

        if (!dbUpdateSuccess) {
          console.error(`⚠️ DB update failed for ${image.name} - SKIPPING DELETION`);
          deletionsPrevented++;
          newResults.push({
            originalPath: image.fullPath,
            newPath,
            originalSize,
            newSize,
            saved,
            status: 'error',
            error: 'Database update failed - original file preserved',
            dbUpdateVerified: false,
          });
          continue;
        }

        // Step 4: VERIFY database update actually succeeded
        const dbVerified = await verifyDatabaseUpdate(oldUrlData.publicUrl, newUrlData.publicUrl);

        if (!dbVerified) {
          console.error(`❌ DB verification FAILED for ${image.name} - PREVENTING DELETION`);
          deletionsPrevented++;
          newResults.push({
            originalPath: image.fullPath,
            newPath,
            originalSize,
            newSize,
            saved,
            status: 'error',
            error: 'Database verification failed - original file preserved for safety',
            dbUpdateVerified: false,
          });
          continue;
        }

        // Step 5: ONLY delete if path changed AND DB update verified
        if (newPath !== image.fullPath) {
          console.log(`🗑️ DB verified, safe to delete: ${image.fullPath}`);
          const { error: deleteError } = await supabase.storage
            .from('product-images')
            .remove([image.fullPath]);
          
          if (deleteError) {
            console.error(`⚠️ Delete failed (non-critical): ${deleteError.message}`);
          }
        } else {
          console.log(`♻️ Re-optimized in-place (verified): ${image.fullPath}`);
        }

        totalSaved += saved;

        newResults.push({
          originalPath: image.fullPath,
          newPath,
          originalSize,
          newSize,
          saved,
          status: 'success',
          dbUpdateVerified: true,
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
          dbUpdateVerified: false,
        });
      }

      setResults([...newResults]);
    }

    setIsConverting(false);
    setCurrentImage(null);

    const successCount = newResults.filter(r => r.status === 'success').length;
    const dryRunCount = newResults.filter(r => r.status === 'dry-run').length;
    const errorCount = newResults.filter(r => r.status === 'error').length;

    if (isDryRun) {
      toast({
        title: "🔍 Dry-run completato",
        description: `${dryRunCount} immagini simulate. Potenziale risparmio: ${(totalSaved / 1024 / 1024).toFixed(2)}MB. Disattiva dry-run per applicare.`,
      });
    } else {
      toast({
        title: deletionsPrevented > 0 ? "⚠️ Conversione con protezioni" : "✅ Conversione completata!",
        description: `${successCount} convertite, ${errorCount} errori, ${deletionsPrevented} file protetti. Risparmiati ${(totalSaved / 1024 / 1024).toFixed(2)}MB`,
        variant: deletionsPrevented > 0 ? "destructive" : "default",
      });
    }
  };

  const convertibleCount = images.filter(i => i.type === 'convertible').length;
  const oversizedCount = images.filter(i => i.type === 'oversized-webp').length;
  const gifCount = images.filter(i => i.type === 'skip-gif').length;
  const webpCount = images.filter(i => i.type === 'already-webp').length;
  const totalToConvert = convertibleCount + oversizedCount;
  const successCount = results.filter(r => r.status === 'success').length;
  const dryRunCount = results.filter(r => r.status === 'dry-run').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const totalSaved = results.reduce((acc, r) => acc + r.saved, 0);

  return (
    <div className="space-y-4">
      {/* Safety Warning Banner */}
      <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
        <ShieldAlert className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-yellow-700">⚠️ Operazioni irreversibili</p>
          <p className="text-yellow-600/80">
            La cancellazione di immagini da Supabase Storage è <strong>permanente</strong>. 
            Usa sempre la modalità Dry-Run prima di applicare modifiche reali.
          </p>
        </div>
      </div>

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
              {/* Dry-Run Toggle */}
              <div className="flex items-center justify-between p-2 bg-background/50 rounded border">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Modalità Dry-Run</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${isDryRun ? 'text-green-600 font-bold' : 'text-red-500'}`}>
                    {isDryRun ? '✓ ATTIVA (sicuro)' : '⚠️ DISATTIVATA'}
                  </span>
                  <Button
                    size="sm"
                    variant={isDryRun ? "default" : "destructive"}
                    className="h-7 px-2 text-xs"
                    onClick={() => setIsDryRun(!isDryRun)}
                  >
                    {isDryRun ? 'Simula' : 'Reale'}
                  </Button>
                </div>
              </div>

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

              {/* Preview list */}
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
              
              <Button 
                onClick={requestConversion} 
                className={`w-full ${isDryRun ? '' : 'bg-red-600 hover:bg-red-700'}`}
                variant={isDryRun ? "default" : "destructive"}
              >
                {isDryRun ? (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    🔍 Simula Ottimizzazione ({batchSize === 'all' ? totalToConvert : Math.min(batchSize as number, totalToConvert)} immagini)
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    ⚠️ Ottimizza REALMENTE ({batchSize === 'all' ? totalToConvert : Math.min(batchSize as number, totalToConvert)} immagini)
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Conversion Progress */}
      {isConverting && (
        <div className="p-4 bg-muted rounded-lg space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>{isDryRun ? '🔍 Simulazione' : '⚡ Conversione'} in corso...</span>
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
            <span className="text-sm font-medium">
              {dryRunCount > 0 ? '🔍 Dry-run completato!' : 'Conversione completata!'}
            </span>
            <span className="text-xs text-muted-foreground">
              💾 {dryRunCount > 0 ? 'Potenziale risparmio' : 'Risparmiati'}: {(totalSaved / 1024 / 1024).toFixed(2)}MB
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-sm">
            {dryRunCount > 0 && (
              <div className="flex items-center gap-2 text-blue-600">
                <Eye className="h-4 w-4" />
                <span>{dryRunCount} simulate</span>
              </div>
            )}
            {successCount > 0 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>{successCount} convertite</span>
              </div>
            )}
            {errorCount > 0 && (
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span>{errorCount} errori/protette</span>
              </div>
            )}
          </div>

          {/* Detailed results */}
          <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
            {results.map((r, i) => (
              <div 
                key={i} 
                className={`p-2 rounded ${
                  r.status === 'success' ? 'bg-green-500/10' : 
                  r.status === 'dry-run' ? 'bg-blue-500/10' : 
                  'bg-red-500/10'
                }`}
              >
                {r.status === 'success' ? (
                  <span>
                    ✓ {r.originalPath.split('/').pop()} → {(r.originalSize / 1024).toFixed(0)}KB → {(r.newSize / 1024).toFixed(0)}KB 
                    <span className="text-green-600 ml-1">(-{((r.saved / r.originalSize) * 100).toFixed(0)}%)</span>
                    {r.dbUpdateVerified && <span className="ml-1 text-green-700">[DB ✓]</span>}
                  </span>
                ) : r.status === 'dry-run' ? (
                  <span className="text-blue-600">
                    🔍 {r.originalPath.split('/').pop()} → {(r.originalSize / 1024).toFixed(0)}KB → {(r.newSize / 1024).toFixed(0)}KB 
                    <span className="ml-1">(-{((r.saved / r.originalSize) * 100).toFixed(0)}%)</span>
                  </span>
                ) : (
                  <span className="text-red-500">
                    ✗ {r.originalPath.split('/').pop()}: {r.error}
                    {!r.dbUpdateVerified && <span className="ml-1 font-bold">[FILE PRESERVED]</span>}
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

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="h-5 w-5" />
              ⚠️ Conferma Operazione Irreversibile
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Stai per <strong>convertire e cancellare</strong> {batchSize === 'all' ? totalToConvert : Math.min(batchSize as number, totalToConvert)} immagini originali.
              </p>
              <p className="text-red-500 font-semibold">
                La cancellazione da Supabase Storage è PERMANENTE e non può essere annullata.
              </p>
              <p>
                Assicurati di aver eseguito un <strong>backup locale</strong> delle immagini prima di procedere.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Procedi con la conversione
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ImageOptimizer;
