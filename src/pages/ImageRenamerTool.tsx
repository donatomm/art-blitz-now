import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Play, CheckCircle, XCircle, AlertCircle, Loader2, FileImage, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface RenameEntry {
  preview: string;
  type: string;
  productName: string;
  productSlug: string;
  size: string;
  currentFilename: string;
  newFilename: string;
  isOrphan: boolean;
  bucket: string;
  folder: string;
  fullUrl: string;
  status: "pending" | "processing" | "success" | "error" | "skipped";
  error?: string;
}

interface ProductSize {
  dimensions: string;
  mock_room_url: string;
  price?: number;
}

export default function ImageRenamerTool() {
  const [entries, setEntries] = useState<RenameEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dryRun, setDryRun] = useState(true);
  const [deleteOrphans, setDeleteOrphans] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [stats, setStats] = useState({ success: 0, error: 0, skipped: 0 });
  const { toast } = useToast();

  const parseXLSX = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet);

        const parsed: RenameEntry[] = jsonData
          .filter((row) => {
            const newName = row["New Filename"]?.trim();
            const currentName = row["Current Filename"]?.trim();
            // Skip if no new filename or if it's a GIF
            if (!newName || !currentName) return false;
            if (currentName.toLowerCase().endsWith(".gif")) return false;
            return true;
          })
          .map((row) => ({
            preview: row["Preview (Google Sheets)"] || "",
            type: row["Type"] || "",
            productName: row["Product Name"] || "",
            productSlug: row["Product Slug"] || "",
            size: row["Size"] || "",
            currentFilename: row["Current Filename"]?.trim() || "",
            newFilename: row["New Filename"]?.trim() || "",
            isOrphan: row["Is Orphan"]?.toLowerCase() === "yes",
            bucket: row["Bucket"] || "product-images",
            folder: row["Folder"] || "",
            fullUrl: row["Full URL"] || "",
            status: "pending" as const,
          }));

        // Count skipped GIFs
        const skippedGifs = jsonData.filter(
          (row) => row["Current Filename"]?.toLowerCase().endsWith(".gif")
        ).length;

        setEntries(parsed);
        setStats({ success: 0, error: 0, skipped: skippedGifs });
        
        toast({
          title: "File parsed successfully",
          description: `Found ${parsed.length} images to rename${skippedGifs > 0 ? ` (${skippedGifs} GIFs skipped)` : ""}`,
        });
      } catch (error) {
        toast({
          title: "Error parsing file",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  }, [toast]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
        parseXLSX(file);
      } else {
        toast({
          title: "Invalid file",
          description: "Please upload an XLSX file",
          variant: "destructive",
        });
      }
    },
    [parseXLSX, toast]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseXLSX(file);
    }
  };

  const renameImage = async (entry: RenameEntry): Promise<{ success: boolean; error?: string }> => {
    const storagePath = entry.folder ? `${entry.folder}/${entry.currentFilename}` : entry.currentFilename;
    const newStoragePath = entry.folder ? `${entry.folder}/${entry.newFilename}` : entry.newFilename;

    try {
      // 1. Download the original file
      const { data: fileData, error: downloadError } = await supabase.storage
        .from(entry.bucket)
        .download(storagePath);

      if (downloadError) {
        throw new Error(`Download failed: ${downloadError.message}`);
      }

      // 2. Upload with new filename
      const { error: uploadError } = await supabase.storage
        .from(entry.bucket)
        .upload(newStoragePath, fileData, {
          contentType: fileData.type || "image/webp",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // 3. Delete original file
      const { error: deleteError } = await supabase.storage
        .from(entry.bucket)
        .remove([storagePath]);

      if (deleteError) {
        console.warn(`Delete warning: ${deleteError.message}`);
      }

      // 4. Update database if not orphan
      if (!entry.isOrphan && entry.productSlug) {
        const newUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${entry.bucket}/${newStoragePath}`;

        if (entry.type === "Artwork") {
          const { error: updateError } = await supabase
            .from("products")
            .update({ image_url: newUrl })
            .eq("slug", entry.productSlug);

          if (updateError) {
            throw new Error(`DB update failed: ${updateError.message}`);
          }
        } else if (entry.type === "Mockroom") {
          // Fetch current product to update the specific size's mock_room_url
          const { data: product, error: fetchError } = await supabase
            .from("products")
            .select("sizes")
            .eq("slug", entry.productSlug)
            .single();

          if (fetchError) {
            throw new Error(`DB fetch failed: ${fetchError.message}`);
          }

          const sizes = (product?.sizes as unknown as ProductSize[]) || [];
          const updatedSizes = sizes.map((s) => {
            if (s.mock_room_url?.includes(entry.currentFilename)) {
              return { ...s, mock_room_url: newUrl };
            }
            return s;
          });

          const { error: updateError } = await supabase
            .from("products")
            .update({ sizes: JSON.parse(JSON.stringify(updatedSizes)) })
            .eq("slug", entry.productSlug);

          if (updateError) {
            throw new Error(`DB update failed: ${updateError.message}`);
          }
        }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const processRenames = async () => {
    if (entries.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    const newStats = { success: 0, error: 0, skipped: stats.skipped };

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      // Update status to processing
      setEntries((prev) =>
        prev.map((e, idx) => (idx === i ? { ...e, status: "processing" } : e))
      );

      if (dryRun) {
        // Simulate processing
        await new Promise((resolve) => setTimeout(resolve, 50));
        setEntries((prev) =>
          prev.map((e, idx) => (idx === i ? { ...e, status: "success" } : e))
        );
        newStats.success++;
      } else {
        // Handle orphans
        if (entry.isOrphan && deleteOrphans) {
          const storagePath = entry.folder
            ? `${entry.folder}/${entry.currentFilename}`
            : entry.currentFilename;

          const { error } = await supabase.storage
            .from(entry.bucket)
            .remove([storagePath]);

          if (error) {
            setEntries((prev) =>
              prev.map((e, idx) =>
                idx === i ? { ...e, status: "error", error: error.message } : e
              )
            );
            newStats.error++;
          } else {
            setEntries((prev) =>
              prev.map((e, idx) => (idx === i ? { ...e, status: "success" } : e))
            );
            newStats.success++;
          }
        } else {
          // Rename the image
          const result = await renameImage(entry);
          if (result.success) {
            setEntries((prev) =>
              prev.map((e, idx) => (idx === i ? { ...e, status: "success" } : e))
            );
            newStats.success++;
          } else {
            setEntries((prev) =>
              prev.map((e, idx) =>
                idx === i ? { ...e, status: "error", error: result.error } : e
              )
            );
            newStats.error++;
          }
        }
      }

      setProgress(((i + 1) / entries.length) * 100);
      setStats(newStats);
    }

    setIsProcessing(false);
    toast({
      title: dryRun ? "Dry run complete" : "Rename complete",
      description: `${newStats.success} success, ${newStats.error} errors${newStats.skipped > 0 ? `, ${newStats.skipped} skipped` : ""}`,
    });
  };

  const getStatusIcon = (status: RenameEntry["status"]) => {
    switch (status) {
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "skipped":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <FileImage className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const pendingCount = entries.filter((e) => e.status === "pending").length;
  const orphanCount = entries.filter((e) => e.isOrphan).length;
  const linkedCount = entries.filter((e) => !e.isOrphan).length;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-6 w-6" />
            Batch Image Renamer
          </CardTitle>
          <CardDescription>
            Upload your XLSX mapping file to batch rename images. GIF files are automatically skipped.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop your XLSX file here</p>
            <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="xlsx-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="xlsx-upload" className="cursor-pointer">
                Browse Files
              </label>
            </Button>
          </div>

          {/* Stats */}
          {entries.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="text-sm">
                Total: {entries.length}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                Linked: {linkedCount}
              </Badge>
              <Badge variant="destructive" className="text-sm">
                Orphans: {orphanCount}
              </Badge>
              {stats.skipped > 0 && (
                <Badge variant="outline" className="text-sm text-muted-foreground">
                  GIFs Skipped: {stats.skipped}
                </Badge>
              )}
            </div>
          )}

          {/* Options */}
          {entries.length > 0 && (
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Switch id="dry-run" checked={dryRun} onCheckedChange={setDryRun} />
                <Label htmlFor="dry-run">Dry Run (simulate only)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="delete-orphans"
                  checked={deleteOrphans}
                  onCheckedChange={setDeleteOrphans}
                />
                <Label htmlFor="delete-orphans" className="flex items-center gap-1">
                  <Trash2 className="h-4 w-4" />
                  Delete orphans instead of rename
                </Label>
              </div>
            </div>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground text-center">
                Processing... {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Results Summary */}
          {(stats.success > 0 || stats.error > 0) && !isProcessing && (
            <div className="flex gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>{stats.success} success</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <span>{stats.error} errors</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          {entries.length > 0 && (
            <Button
              onClick={processRenames}
              disabled={isProcessing || pendingCount === 0}
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  {dryRun ? "Run Dry Test" : "Start Renaming"} ({pendingCount} files)
                </>
              )}
            </Button>
          )}

          {/* Entries Table */}
          {entries.length > 0 && (
            <ScrollArea className="h-[400px] border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-left p-2 w-10">Status</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Product</th>
                    <th className="text-left p-2">Current</th>
                    <th className="text-left p-2">→</th>
                    <th className="text-left p-2">New</th>
                    <th className="text-left p-2">Orphan</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, idx) => (
                    <tr
                      key={idx}
                      className={`border-b ${
                        entry.status === "error" ? "bg-destructive/10" : ""
                      }`}
                    >
                      <td className="p-2">{getStatusIcon(entry.status)}</td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-xs">
                          {entry.type}
                        </Badge>
                      </td>
                      <td className="p-2 max-w-[150px] truncate" title={entry.productName}>
                        {entry.productName}
                      </td>
                      <td className="p-2 font-mono text-xs max-w-[180px] truncate" title={entry.currentFilename}>
                        {entry.currentFilename}
                      </td>
                      <td className="p-2 text-muted-foreground">→</td>
                      <td className="p-2 font-mono text-xs max-w-[180px] truncate text-primary" title={entry.newFilename}>
                        {entry.newFilename}
                      </td>
                      <td className="p-2">
                        {entry.isOrphan && (
                          <Badge variant="destructive" className="text-xs">
                            Orphan
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
