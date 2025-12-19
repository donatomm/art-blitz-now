import { useState } from "react";
import { cn } from "@/lib/utils";

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
  const [selectedView, setSelectedView] = useState<ViewType>("frontale");

  const activeFrame = frameOptions.find((f) => f.id === selectedFrame);

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

        {/* Preview Area with frame simulation */}
        <div className="mb-6 flex justify-center">
          <div
            className="relative rounded-lg shadow-xl overflow-hidden transition-all duration-300"
            style={{
              padding: "16px",
              backgroundColor: activeFrame?.color,
            }}
          >
            {/* Inner canvas simulation */}
            <div className="bg-card rounded overflow-hidden shadow-inner">
              <img
                src="/artworks/octoheaded.jpg"
                alt={`Anteprima cornice ${activeFrame?.name}`}
                className="w-64 h-64 sm:w-80 sm:h-80 object-cover"
              />
            </div>
            {/* Frame label */}
            <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded">
              {activeFrame?.name}
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex justify-center gap-2 mb-6">
          {viewLabels.map((view) => (
            <button
              key={view.id}
              onClick={() => setSelectedView(view.id)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-all duration-200 border",
                selectedView === view.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              )}
            >
              {view.label}
            </button>
          ))}
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
                className="w-4 h-4 rounded-full border border-border/50"
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
