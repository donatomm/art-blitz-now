import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, CheckCircle, Trash2, Eye, RefreshCw, ShieldAlert, ImageOff } from "lucide-react";
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

interface BrokenReference {
  productId: string;
  productName: string;
  field: 'image_url' | 'mock_rooms' | 'sizes';
  index?: number;
  url: string;
  label?: string;
}

interface Product {
  id: string;
  name: string;
  image_url: string;
  mock_rooms: any[];
  sizes: any[];
}

const BrokenImageCleanup = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [brokenRefs, setBrokenRefs] = useState<BrokenReference[]>([]);
  const [markedForDeletion, setMarkedForDeletion] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const { toast } = useToast();

  // Generate a unique key for a broken reference
  const getRefKey = (ref: BrokenReference) => 
    `${ref.productId}:${ref.field}:${ref.index ?? 'main'}:${ref.url}`;

  // Check if a URL returns 404
  const checkUrl = async (url: string): Promise<boolean> => {
    if (!url || url.trim() === '') return false; // Empty URLs are considered broken
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  const scanForBrokenImages = async () => {
    setIsScanning(true);
    setBrokenRefs([]);
    setMarkedForDeletion(new Set());
    setScanComplete(false);
    setProgress(0);

    try {
      // Fetch all products
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, image_url, mock_rooms, sizes')
        .eq('is_active', true);

      if (error || !products) {
        throw new Error(error?.message || 'Failed to fetch products');
      }

      const broken: BrokenReference[] = [];
      const urlsToCheck: { ref: BrokenReference; url: string }[] = [];

      // Collect all URLs to check
      for (const product of products as Product[]) {
        // Main image
        if (product.image_url) {
          urlsToCheck.push({
            ref: {
              productId: product.id,
              productName: product.name,
              field: 'image_url',
              url: product.image_url,
            },
            url: product.image_url,
          });
        }

        // Mock rooms
        if (Array.isArray(product.mock_rooms)) {
          product.mock_rooms.forEach((mr: any, idx: number) => {
            if (mr.url && mr.url.trim() !== '') {
              urlsToCheck.push({
                ref: {
                  productId: product.id,
                  productName: product.name,
                  field: 'mock_rooms',
                  index: idx,
                  url: mr.url,
                  label: mr.label,
                },
                url: mr.url,
              });
            }
          });
        }

        // Sizes mock_room_url
        if (Array.isArray(product.sizes)) {
          product.sizes.forEach((size: any, idx: number) => {
            if (size.mock_room_url && size.mock_room_url.trim() !== '') {
              urlsToCheck.push({
                ref: {
                  productId: product.id,
                  productName: product.name,
                  field: 'sizes',
                  index: idx,
                  url: size.mock_room_url,
                  label: size.dimensions,
                },
                url: size.mock_room_url,
              });
            }
          });
        }
      }

      // Check URLs in batches
      const batchSize = 10;
      for (let i = 0; i < urlsToCheck.length; i += batchSize) {
        const batch = urlsToCheck.slice(i, i + batchSize);
        
        const results = await Promise.all(
          batch.map(async ({ ref, url }) => {
            const isValid = await checkUrl(url);
            return { ref, isValid };
          })
        );

        for (const { ref, isValid } of results) {
          if (!isValid) {
            broken.push(ref);
          }
        }

        setProgress(Math.round(((i + batchSize) / urlsToCheck.length) * 100));
      }

      setBrokenRefs(broken);
      setScanComplete(true);

      toast({
        title: broken.length > 0 ? "⚠️ Riferimenti rotti trovati" : "✅ Nessun problema",
        description: broken.length > 0 
          ? `Trovati ${broken.length} riferimenti a immagini mancanti (404)`
          : "Tutte le immagini sono accessibili",
        variant: broken.length > 0 ? "destructive" : "default",
      });

    } catch (error: any) {
      console.error('Scan error:', error);
      toast({
        title: "Errore scansione",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const toggleMarkForDeletion = (ref: BrokenReference) => {
    const key = getRefKey(ref);
    const newSet = new Set(markedForDeletion);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setMarkedForDeletion(newSet);
  };

  const markAllForDeletion = () => {
    const allKeys = new Set(brokenRefs.map(getRefKey));
    setMarkedForDeletion(allKeys);
  };

  const unmarkAll = () => {
    setMarkedForDeletion(new Set());
  };

  const requestCleanup = () => {
    if (markedForDeletion.size === 0) {
      toast({
        title: "Nessuna selezione",
        description: "Seleziona almeno un riferimento da rimuovere",
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  const executeCleanup = async () => {
    setShowConfirmDialog(false);
    setIsCleaning(true);

    try {
      // Group broken refs by product
      const productUpdates = new Map<string, {
        id: string;
        name: string;
        clearImageUrl: boolean;
        mockRoomsToRemove: number[];
        sizesToClearMockRoom: number[];
      }>();

      for (const ref of brokenRefs) {
        const key = getRefKey(ref);
        if (!markedForDeletion.has(key)) continue;

        if (!productUpdates.has(ref.productId)) {
          productUpdates.set(ref.productId, {
            id: ref.productId,
            name: ref.productName,
            clearImageUrl: false,
            mockRoomsToRemove: [],
            sizesToClearMockRoom: [],
          });
        }

        const update = productUpdates.get(ref.productId)!;

        if (ref.field === 'image_url') {
          update.clearImageUrl = true;
        } else if (ref.field === 'mock_rooms' && ref.index !== undefined) {
          update.mockRoomsToRemove.push(ref.index);
        } else if (ref.field === 'sizes' && ref.index !== undefined) {
          update.sizesToClearMockRoom.push(ref.index);
        }
      }

      // Apply updates to each product
      let successCount = 0;
      let errorCount = 0;

      for (const [productId, update] of productUpdates) {
        try {
          // Fetch current product data
          const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('image_url, mock_rooms, sizes')
            .eq('id', productId)
            .single();

          if (fetchError || !product) {
            throw new Error(`Failed to fetch product: ${fetchError?.message}`);
          }

          const updates: any = {};

          // Mark image_url as broken (prefix with [BROKEN])
          if (update.clearImageUrl) {
            updates.image_url = `[BROKEN-DELETED]${product.image_url}`;
          }

          // Remove broken mock_rooms entries
          if (update.mockRoomsToRemove.length > 0 && Array.isArray(product.mock_rooms)) {
            updates.mock_rooms = product.mock_rooms.filter(
              (_: any, idx: number) => !update.mockRoomsToRemove.includes(idx)
            );
          }

          // Clear broken mock_room_url in sizes
          if (update.sizesToClearMockRoom.length > 0 && Array.isArray(product.sizes)) {
            updates.sizes = product.sizes.map((size: any, idx: number) => {
              if (update.sizesToClearMockRoom.includes(idx)) {
                return { ...size, mock_room_url: '' };
              }
              return size;
            });
          }

          if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
              .from('products')
              .update(updates)
              .eq('id', productId);

            if (updateError) {
              throw new Error(updateError.message);
            }

            console.log(`✓ Cleaned product "${update.name}":`, updates);
            successCount++;
          }

        } catch (err: any) {
          console.error(`✗ Failed to clean product ${update.name}:`, err);
          errorCount++;
        }
      }

      // Remove cleaned refs from state
      const remainingRefs = brokenRefs.filter(ref => !markedForDeletion.has(getRefKey(ref)));
      setBrokenRefs(remainingRefs);
      setMarkedForDeletion(new Set());

      toast({
        title: errorCount > 0 ? "⚠️ Pulizia parziale" : "✅ Pulizia completata",
        description: `${successCount} prodotti puliti, ${errorCount} errori. Esegui Sync & Deploy per applicare.`,
        variant: errorCount > 0 ? "destructive" : "default",
      });

    } catch (error: any) {
      console.error('Cleanup error:', error);
      toast({
        title: "Errore pulizia",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCleaning(false);
    }
  };

  const mainImageBroken = brokenRefs.filter(r => r.field === 'image_url').length;
  const mockRoomsBroken = brokenRefs.filter(r => r.field === 'mock_rooms').length;
  const sizesBroken = brokenRefs.filter(r => r.field === 'sizes').length;

  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-2">
        <ImageOff className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-orange-700">Pulizia riferimenti immagini rotte</p>
          <p className="text-orange-600/80">
            Scansiona il database per trovare URL che restituiscono 404 e puliscili in sicurezza.
          </p>
        </div>
      </div>

      {/* Scan Button */}
      <Button 
        onClick={scanForBrokenImages} 
        disabled={isScanning || isCleaning}
        variant="outline"
        className="w-full"
      >
        {isScanning ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Scansione in corso... {progress}%
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Scansiona per immagini rotte (404)
          </>
        )}
      </Button>

      {/* Progress */}
      {isScanning && (
        <Progress value={progress} className="h-2" />
      )}

      {/* Results */}
      {scanComplete && brokenRefs.length === 0 && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Nessun riferimento rotto trovato!</span>
          </div>
        </div>
      )}

      {brokenRefs.length > 0 && (
        <div className="p-4 bg-muted rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {brokenRefs.length} riferimenti rotti trovati
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={markAllForDeletion} className="text-xs">
                Seleziona tutti
              </Button>
              <Button size="sm" variant="outline" onClick={unmarkAll} className="text-xs">
                Deseleziona
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-red-500/10 rounded text-center">
              <div className="font-bold text-red-600">{mainImageBroken}</div>
              <div className="text-muted-foreground">Immagini principali</div>
            </div>
            <div className="p-2 bg-orange-500/10 rounded text-center">
              <div className="font-bold text-orange-600">{mockRoomsBroken}</div>
              <div className="text-muted-foreground">Mock rooms</div>
            </div>
            <div className="p-2 bg-yellow-500/10 rounded text-center">
              <div className="font-bold text-yellow-600">{sizesBroken}</div>
              <div className="text-muted-foreground">Sizes mock rooms</div>
            </div>
          </div>

          {/* Broken refs list */}
          <div className="max-h-64 overflow-y-auto space-y-1 text-xs">
            {brokenRefs.map((ref, i) => {
              const key = getRefKey(ref);
              const isMarked = markedForDeletion.has(key);
              const urlFilename = ref.url.split('/').pop() || ref.url;
              
              return (
                <div 
                  key={i}
                  onClick={() => toggleMarkForDeletion(ref)}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    isMarked 
                      ? 'bg-red-500/20 border border-red-500/50' 
                      : 'bg-background/50 hover:bg-background/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={isMarked}
                        onChange={() => toggleMarkForDeletion(ref)}
                        className="h-3 w-3"
                      />
                      <span className={`font-mono ${
                        ref.field === 'image_url' ? 'text-red-500' :
                        ref.field === 'mock_rooms' ? 'text-orange-500' : 'text-yellow-600'
                      }`}>
                        [{ref.field}]
                      </span>
                      <span className="font-medium">{ref.productName}</span>
                      {ref.label && <span className="text-muted-foreground">({ref.label})</span>}
                    </div>
                    {isMarked && <Trash2 className="h-3 w-3 text-red-500" />}
                  </div>
                  <div className="mt-1 text-muted-foreground truncate pl-5">
                    {urlFilename}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={requestCleanup}
              disabled={markedForDeletion.size === 0 || isCleaning}
              variant="destructive"
              className="flex-1"
            >
              {isCleaning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Pulizia in corso...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Rimuovi {markedForDeletion.size} riferimenti selezionati
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            ⚠️ Dopo la pulizia, esegui <strong>Sync & Deploy</strong> dalla tab Deploy per aggiornare il sito.
          </p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
              <ShieldAlert className="h-5 w-5" />
              Conferma pulizia riferimenti
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Stai per rimuovere <strong>{markedForDeletion.size}</strong> riferimenti a immagini mancanti.
              </p>
              <p>
                Questa operazione:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Rimuoverà le voci mock_rooms con URL rotti</li>
                <li>Svuoterà i mock_room_url nelle sizes con URL rotti</li>
                <li>Marcherà le image_url principali con [BROKEN-DELETED]</li>
              </ul>
              <p className="text-orange-500 font-semibold mt-2">
                Ricorda: dovrai eseguire Sync & Deploy per applicare le modifiche al sito.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeCleanup}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Procedi con la pulizia
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BrokenImageCleanup;
