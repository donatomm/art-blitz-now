import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, RefreshCw, Image as ImageIcon } from "lucide-react";
import * as XLSX from "xlsx";

interface ImageEntry {
  type: "Artwork" | "Mockroom" | "Article";
  productName: string;
  size: string;
  currentFilename: string;
  bucket: string;
  folder: string;
  fullUrl: string;
}

interface ProductSize {
  dimensions: string;
  mock_room_url?: string;
}

interface Product {
  id: string;
  name: string;
  image_url: string;
  sizes: ProductSize[];
  display_order: number;
}

// Extract filename from URL
const getFilenameFromUrl = (url: string): string => {
  if (!url) return "";
  const parts = url.split("/");
  return parts[parts.length - 1] || "";
};

// Extract folder from URL (artworks or mockrooms)
const getFolderFromUrl = (url: string): string => {
  if (url.includes("/artworks/")) return "artworks";
  if (url.includes("/mockrooms/")) return "mockrooms";
  return "";
};

export default function ImageRename() {
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllImages = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch all products ordered by display_order
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id, name, image_url, sizes, display_order")
        .order("display_order", { ascending: true });

      if (productsError) throw productsError;

      const entries: ImageEntry[] = [];

      // 2. Process each product
      for (const product of products || []) {
        const typedProduct = product as unknown as Product;
        
        // Add main artwork image
        if (typedProduct.image_url) {
          entries.push({
            type: "Artwork",
            productName: typedProduct.name,
            size: "",
            currentFilename: getFilenameFromUrl(typedProduct.image_url),
            bucket: "product-images",
            folder: getFolderFromUrl(typedProduct.image_url) || "artworks",
            fullUrl: typedProduct.image_url,
          });
        }

        // Add mockroom images from sizes
        const sizes = typedProduct.sizes || [];
        for (const sizeEntry of sizes) {
          if (sizeEntry.mock_room_url) {
            entries.push({
              type: "Mockroom",
              productName: typedProduct.name,
              size: sizeEntry.dimensions || "",
              currentFilename: getFilenameFromUrl(sizeEntry.mock_room_url),
              bucket: "product-images",
              folder: getFolderFromUrl(sizeEntry.mock_room_url) || "mockrooms",
              fullUrl: sizeEntry.mock_room_url,
            });
          }
        }
      }

      // 3. Fetch article images from article-images bucket
      const { data: articleFiles, error: articleError } = await supabase.storage
        .from("article-images")
        .list("", { limit: 500 });

      if (articleError) {
        console.warn("Could not fetch article-images:", articleError);
      } else {
        for (const file of articleFiles || []) {
          if (file.name && file.name.endsWith(".webp")) {
            const publicUrl = supabase.storage
              .from("article-images")
              .getPublicUrl(file.name).data.publicUrl;

            entries.push({
              type: "Article",
              productName: "(no product)",
              size: "",
              currentFilename: file.name,
              bucket: "article-images",
              folder: "",
              fullUrl: publicUrl,
            });
          }
        }
      }

      // 4. Check for orphan files in product-images/artworks and mockrooms
      const { data: artworkFiles } = await supabase.storage
        .from("product-images")
        .list("artworks", { limit: 500 });

      const { data: mockroomFiles } = await supabase.storage
        .from("product-images")
        .list("mockrooms", { limit: 500 });

      // Find files not linked to any product
      const linkedFilenames = new Set(
        entries
          .filter((e) => e.bucket === "product-images")
          .map((e) => e.currentFilename)
      );

      for (const file of artworkFiles || []) {
        if (file.name && file.name.endsWith(".webp") && !linkedFilenames.has(file.name)) {
          const publicUrl = supabase.storage
            .from("product-images")
            .getPublicUrl(`artworks/${file.name}`).data.publicUrl;

          entries.push({
            type: "Artwork",
            productName: "(orphan - not linked)",
            size: "",
            currentFilename: file.name,
            bucket: "product-images",
            folder: "artworks",
            fullUrl: publicUrl,
          });
        }
      }

      for (const file of mockroomFiles || []) {
        if (file.name && file.name.endsWith(".webp") && !linkedFilenames.has(file.name)) {
          const publicUrl = supabase.storage
            .from("product-images")
            .getPublicUrl(`mockrooms/${file.name}`).data.publicUrl;

          entries.push({
            type: "Mockroom",
            productName: "(orphan - not linked)",
            size: "",
            currentFilename: file.name,
            bucket: "product-images",
            folder: "mockrooms",
            fullUrl: publicUrl,
          });
        }
      }

      setImages(entries);
    } catch (err) {
      console.error("Error fetching images:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllImages();
  }, []);

  const downloadXLSX = () => {
    // Create worksheet data
    const wsData = [
      ["Type", "Product Name", "Size", "Current Filename", "New Filename", "Bucket", "Folder", "Full URL"],
      ...images.map((img) => [
        img.type,
        img.productName,
        img.size,
        img.currentFilename,
        "", // New Filename - user fills this
        img.bucket,
        img.folder,
        img.fullUrl,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws["!cols"] = [
      { wch: 10 }, // Type
      { wch: 30 }, // Product Name
      { wch: 12 }, // Size
      { wch: 35 }, // Current Filename
      { wch: 35 }, // New Filename
      { wch: 15 }, // Bucket
      { wch: 12 }, // Folder
      { wch: 80 }, // Full URL
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Images");

    // Generate and download
    XLSX.writeFile(wb, "image-rename-export.xlsx");
  };

  // Count by type
  const artworkCount = images.filter((i) => i.type === "Artwork").length;
  const mockroomCount = images.filter((i) => i.type === "Mockroom").length;
  const articleCount = images.filter((i) => i.type === "Article").length;

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Image Rename Tool (Temporary)</h1>
        <p className="text-muted-foreground mb-6">
          Export all images grouped by product for bulk renaming. Fill the "New Filename" column in the XLSX and upload it back to the chat.
        </p>

        <div className="flex gap-4 mb-6">
          <Button onClick={fetchAllImages} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={downloadXLSX} disabled={loading || images.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Download XLSX
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-muted p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{artworkCount}</div>
            <div className="text-sm text-muted-foreground">Artworks</div>
          </div>
          <div className="bg-muted p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{mockroomCount}</div>
            <div className="text-sm text-muted-foreground">Mockrooms</div>
          </div>
          <div className="bg-muted p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{articleCount}</div>
            <div className="text-sm text-muted-foreground">Article Images</div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          Total: <strong>{images.length}</strong> images
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading images...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Preview</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Product Name</th>
                  <th className="text-left p-2">Size</th>
                  <th className="text-left p-2">Current Filename</th>
                </tr>
              </thead>
              <tbody>
                {images.map((img, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <img
                        src={img.fullUrl}
                        alt={img.currentFilename}
                        className="w-12 h-12 object-cover rounded"
                        loading="lazy"
                      />
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          img.type === "Artwork"
                            ? "bg-primary/20 text-primary"
                            : img.type === "Mockroom"
                            ? "bg-secondary/50 text-secondary-foreground"
                            : "bg-accent/50 text-accent-foreground"
                        }`}
                      >
                        {img.type}
                      </span>
                    </td>
                    <td className="p-2 font-medium">{img.productName}</td>
                    <td className="p-2">{img.size || "-"}</td>
                    <td className="p-2 font-mono text-xs truncate max-w-[200px]">
                      {img.currentFilename}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
