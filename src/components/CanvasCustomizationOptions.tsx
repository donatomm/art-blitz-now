import { useState } from "react";
import { cn } from "@/lib/utils";

interface BorderOption {
  id: string;
  name: string;
  image: string;
  description: string;
}

interface FrameOption {
  id: string;
  name: string;
  image: string;
  description: string;
}

const borderOptions: BorderOption[] = [
  {
    id: "ripiegato",
    name: "Ripiegato",
    image: "/images/preview-tela-angolo.png",
    description: "Proprio come in una tela di arte classica, la stampa viene stesa per adattarsi al telaio. L'immagine continua sui bordi laterali creando un effetto avvolgente e professionale."
  },
  {
    id: "specchiato",
    name: "Specchiato",
    image: "/images/preview-tela-angolo.png",
    description: "L'immagine viene mostrata per intero sulla parte frontale. Il bordo esterno viene copiato e riflesso sui lati del telaio, creando un effetto di continuità armoniosa."
  },
  {
    id: "allungato",
    name: "Allungato",
    image: "/images/preview-tela-angolo.png",
    description: "I pixel più esterni dell'immagine vengono estesi e allungati intorno al telaio. L'immagine completa rimane visibile sulla parte frontale della tela."
  },
  {
    id: "bianco",
    name: "Bianco",
    image: "/images/preview-tela-angolo.png",
    description: "I bordi laterali restano bianchi, senza stampa. Questo crea un effetto pulito e minimale che valorizza e incornicia naturalmente la tua immagine."
  },
  {
    id: "nero",
    name: "Nero",
    image: "/images/preview-tela-angolo.png",
    description: "Un elegante bordo nero avvolge i lati del telaio, creando un contrasto deciso che esalta la maggior parte dei soggetti fotografici."
  }
];

const frameOptions: FrameOption[] = [
  {
    id: "2cm",
    name: "Standard (2 cm)",
    image: "/images/spessori-telaio.jpg",
    description: "Telaio in legno di pino certificato FSC® con spessore di 2 cm. Leggero e ideale per formati piccoli e medi. Facile da appendere con uno o due chiodi."
  },
  {
    id: "4cm",
    name: "XXL (4 cm)",
    image: "/images/spessori-telaio.jpg",
    description: "Telaio XXL in legno di pino con spessore di 4 cm. Maggiore stabilità e un look da vera galleria fotografica. Ideale per formati grandi."
  }
];

const CanvasCustomizationOptions = () => {
  const [selectedBorder, setSelectedBorder] = useState<string>("ripiegato");
  const [selectedFrame, setSelectedFrame] = useState<string>("2cm");

  const activeBorder = borderOptions.find(b => b.id === selectedBorder);
  const activeFrame = frameOptions.find(f => f.id === selectedFrame);

  return (
    <div className="space-y-12 mt-8">
      {/* Border Options Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-foreground">
          Bordi Personalizzabili per le Tue Fotografie su Tela
        </h2>
        
        {/* Border Preview Image */}
        <div className="mb-6 flex justify-center">
          <div className="relative overflow-hidden rounded-lg shadow-lg border border-border bg-card">
            <img 
              src={activeBorder?.image} 
              alt={activeBorder?.name}
              className="w-full max-w-md h-auto object-cover"
            />
          </div>
        </div>

        {/* Border Selection Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {borderOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedBorder(option.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                "border-2",
                selectedBorder === option.id
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-accent"
              )}
            >
              {option.name}
            </button>
          ))}
        </div>

        {/* Border Description */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-2 text-foreground">
            Bordo {activeBorder?.name}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {activeBorder?.description}
          </p>
        </div>
      </section>

      {/* Frame Options Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-foreground">
          Spessore del Telaio in Vero Legno
        </h2>

        {/* Frame Preview Image */}
        <div className="mb-6 flex justify-center">
          <div className="relative overflow-hidden rounded-lg shadow-lg border border-border bg-card">
            <img 
              src={activeFrame?.image} 
              alt={activeFrame?.name}
              className="w-full max-w-md h-auto object-cover"
            />
          </div>
        </div>

        {/* Frame Selection Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {frameOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedFrame(option.id)}
              className={cn(
                "px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                "border-2 min-w-[140px]",
                selectedFrame === option.id
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card text-foreground border-border hover:border-primary/50 hover:bg-accent"
              )}
            >
              {option.name}
            </button>
          ))}
        </div>

        {/* Frame Description */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-2 text-foreground">
            Telaio {activeFrame?.name}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {activeFrame?.description}
          </p>
        </div>
      </section>

      {/* Additional Info */}
      <section className="bg-accent/50 rounded-lg p-6 border border-border">
        <h3 className="font-semibold text-lg mb-4 text-foreground">
          Qualità Premium Garantita
        </h3>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">✓</span>
            Tele stese su telai in legno di pino di alta qualità certificato FSC®
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">✓</span>
            Stampe in alta risoluzione con colori brillanti e duraturi
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">✓</span>
            Inchiostri resistenti agli UV, totalmente privi di solventi
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">✓</span>
            Ogni tela viene realizzata artigianalmente con cura
          </li>
        </ul>
      </section>
    </div>
  );
};

export default CanvasCustomizationOptions;
