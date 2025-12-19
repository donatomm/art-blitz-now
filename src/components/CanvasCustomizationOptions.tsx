import { useState } from "react";
import { cn } from "@/lib/utils";
import framePreview from "@/assets/frame-preview.jpg";

interface FrameOption {
  id: string;
  name: string;
  color: string;
}

type ViewType = "frontale" | "anteriore" | "posteriore";

const frameOptions: FrameOption[] = [
  { id: "nero", name: "Nero opaco", color: "#1a1a1a" },
  { id: "argento", name: "Argento antico", color: "#a8a8a8" },
  { id: "bianco", name: "Bianco", color: "#f5f5f5" },
  { id: "noce", name: "Color noce", color: "#5c4033" },
  { id: "quercia", name: "Color quercia antico", color: "#8b7355" },
];

const viewLabels: { id: ViewType; label: string }[] = [
  { id: "frontale", label: "Vista frontale" },
  { id: "anteriore", label: "Dettaglio anteriore" },
  { id: "posteriore", label: "Dettaglio posteriore" },
];

const CanvasCustomizationOptions = () => {
  const [selectedFrame, setSelectedFrame] = useState<string>("nero");
  const [selectedView, setSelectedView] = useState<ViewType>("anteriore");

  const activeFrame = frameOptions.find((f) => f.id === selectedFrame);

  // Frame thickness varies by view
  const getFrameStyle = () => {
    const baseColor = activeFrame?.color || "#1a1a1a";
    switch (selectedView) {
      case "frontale":
        return { padding: "12px", backgroundColor: baseColor };
      case "anteriore":
        return { padding: "20px", backgroundColor: baseColor };
      case "posteriore":
        return { padding: "16px", backgroundColor: baseColor };
      default:
        return { padding: "20px", backgroundColor: baseColor };
    }
  };

  return (
    <div className="mt-8 space-y-8">
      {/* Section Header */}
      <section>
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          Foto su Tela con Cornice di Alta Qualità
        </h2>
        <p className="text-muted-foreground mb-6">
          Una cornice di prima scelta per la tua foto su tela. I caratteristici
          bordi ripiegati della tela sono visibili attraverso la cornice
          fluttuante decorativa.
        </p>

        {/* View Tabs */}
        <div className="flex justify-center gap-2 mb-6">
          {viewLabels.map((view) => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id)}
              className={cn(
                "px-4 py-2 text-sm rounded-lg transition-all duration-200 border font-medium",
                selectedView === view.id
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:bg-accent"
              )}
            >
              {view.label}
            </button>
          ))}
        </div>

        {/* Preview Area with frame simulation */}
        <div className="mb-6 flex justify-center">
          <div
            className="relative rounded-sm shadow-2xl overflow-hidden transition-all duration-300"
            style={getFrameStyle()}
          >
            {/* Inner canvas with gap effect for floating frame */}
            <div 
              className="bg-background rounded-sm overflow-hidden"
              style={{ padding: selectedView === "anteriore" ? "4px" : "2px" }}
            >
              <img
                src={framePreview}
                alt={`Anteprima cornice ${activeFrame?.name} - ${viewLabels.find(v => v.id === selectedView)?.label}`}
                className="w-64 h-80 sm:w-72 sm:h-96 object-cover rounded-sm"
              />
            </div>
            
            {/* Frame depth effect for side views */}
            {selectedView === "anteriore" && (
              <div 
                className="absolute -right-1 top-0 bottom-0 w-4 opacity-60"
                style={{ 
                  background: `linear-gradient(to right, ${activeFrame?.color}, ${activeFrame?.color}dd)`,
                  transform: "skewY(-2deg)",
                }}
              />
            )}
            {selectedView === "posteriore" && (
              <div 
                className="absolute inset-4 border-2 border-dashed border-muted-foreground/30 rounded pointer-events-none"
              />
            )}
          </div>
        </div>

        {/* Frame Color Selection */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {frameOptions.map((frame) => (
            <button
              key={frame.id}
              onClick={() => setSelectedFrame(frame.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2",
                selectedFrame === frame.id
                  ? "border-primary shadow-md scale-105"
                  : "border-border hover:border-primary/50"
              )}
            >
              {/* Color swatch */}
              <span
                className="w-5 h-5 rounded-full border border-border/50 shadow-inner"
                style={{ backgroundColor: frame.color }}
              />
              {frame.name}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm max-w-2xl mx-auto">
          <p className="text-muted-foreground text-center">
            Crea la tua foto su tela e scegli una{" "}
            <strong className="text-foreground">cornice fluttuante</strong>{" "}
            disponibile in tanti diversi design. La cornice valorizza l'opera e
            crea un effetto galleria professionale.
          </p>
        </div>
      </section>
    </div>
  );
};

export default CanvasCustomizationOptions;
