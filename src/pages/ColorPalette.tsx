import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ColorSwatchProps {
  name: string;
  variable: string;
  lightHsl: string;
  darkHsl: string;
  lightHex: string;
  darkHex: string;
}

const ColorSwatch = ({ name, variable, lightHsl, darkHsl, lightHex, darkHex }: ColorSwatchProps) => {
  const [copiedLight, setCopiedLight] = useState(false);
  const [copiedDark, setCopiedDark] = useState(false);

  const copyToClipboard = (text: string, isDark: boolean) => {
    navigator.clipboard.writeText(text);
    if (isDark) {
      setCopiedDark(true);
      setTimeout(() => setCopiedDark(false), 1500);
    } else {
      setCopiedLight(true);
      setTimeout(() => setCopiedLight(false), 1500);
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">{name}</h3>
        <code className="text-xs text-muted-foreground">var({variable})</code>
      </div>
      <div className="grid grid-cols-2">
        {/* Light Mode */}
        <div className="p-4 bg-white">
          <div 
            className="w-full h-16 rounded-md border border-gray-200 mb-3"
            style={{ backgroundColor: lightHex }}
          />
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-900">Light</p>
            <div className="flex items-center gap-1">
              <code className="text-xs text-gray-600">{lightHex}</code>
              <button 
                onClick={() => copyToClipboard(lightHex, false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {copiedLight ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-gray-400" />}
              </button>
            </div>
            <code className="text-xs text-gray-500 block">{lightHsl}</code>
          </div>
        </div>
        {/* Dark Mode */}
        <div className="p-4 bg-gray-950">
          <div 
            className="w-full h-16 rounded-md border border-gray-700 mb-3"
            style={{ backgroundColor: darkHex }}
          />
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-100">Dark</p>
            <div className="flex items-center gap-1">
              <code className="text-xs text-gray-300">{darkHex}</code>
              <button 
                onClick={() => copyToClipboard(darkHex, true)}
                className="p-1 hover:bg-gray-800 rounded"
              >
                {copiedDark ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3 text-gray-500" />}
              </button>
            </div>
            <code className="text-xs text-gray-400 block">{darkHsl}</code>
          </div>
        </div>
      </div>
    </div>
  );
};

const colors: ColorSwatchProps[] = [
  // Core Colors
  {
    name: "Background",
    variable: "--background",
    lightHsl: "0 0% 100%",
    darkHsl: "222.2 84% 4.9%",
    lightHex: "#FFFFFF",
    darkHex: "#030712",
  },
  {
    name: "Foreground",
    variable: "--foreground",
    lightHsl: "222.2 84% 4.9%",
    darkHsl: "210 40% 98%",
    lightHex: "#020817",
    darkHex: "#F8FAFC",
  },
  {
    name: "Primary",
    variable: "--primary",
    lightHsl: "222.2 47.4% 11.2%",
    darkHsl: "210 40% 98%",
    lightHex: "#1E293B",
    darkHex: "#F8FAFC",
  },
  {
    name: "Primary Foreground",
    variable: "--primary-foreground",
    lightHsl: "210 40% 98%",
    darkHsl: "222.2 47.4% 11.2%",
    lightHex: "#F8FAFC",
    darkHex: "#1E293B",
  },
  {
    name: "Secondary",
    variable: "--secondary",
    lightHsl: "210 40% 96.1%",
    darkHsl: "217.2 32.6% 17.5%",
    lightHex: "#F1F5F9",
    darkHex: "#1E293B",
  },
  {
    name: "Secondary Foreground",
    variable: "--secondary-foreground",
    lightHsl: "222.2 47.4% 11.2%",
    darkHsl: "210 40% 98%",
    lightHex: "#1E293B",
    darkHex: "#F8FAFC",
  },
  {
    name: "Muted",
    variable: "--muted",
    lightHsl: "210 40% 96.1%",
    darkHsl: "217.2 32.6% 17.5%",
    lightHex: "#F1F5F9",
    darkHex: "#1E293B",
  },
  {
    name: "Muted Foreground",
    variable: "--muted-foreground",
    lightHsl: "215.4 16.3% 46.9%",
    darkHsl: "215 20.2% 65.1%",
    lightHex: "#64748B",
    darkHex: "#94A3B8",
  },
  {
    name: "Accent",
    variable: "--accent",
    lightHsl: "210 40% 96.1%",
    darkHsl: "217.2 32.6% 17.5%",
    lightHex: "#F1F5F9",
    darkHex: "#1E293B",
  },
  {
    name: "Accent Foreground",
    variable: "--accent-foreground",
    lightHsl: "222.2 47.4% 11.2%",
    darkHsl: "210 40% 98%",
    lightHex: "#1E293B",
    darkHex: "#F8FAFC",
  },
  // Special Colors
  {
    name: "CTA (Call to Action)",
    variable: "--cta",
    lightHsl: "142 76% 36%",
    darkHsl: "142 71% 45%",
    lightHex: "#22C55E",
    darkHex: "#4ADE80",
  },
  {
    name: "CTA Foreground",
    variable: "--cta-foreground",
    lightHsl: "0 0% 100%",
    darkHsl: "0 0% 100%",
    lightHex: "#FFFFFF",
    darkHex: "#FFFFFF",
  },
  {
    name: "Gold",
    variable: "--gold",
    lightHsl: "51 100% 50%",
    darkHsl: "51 100% 50%",
    lightHex: "#FFD700",
    darkHex: "#FFD700",
  },
  {
    name: "Gold Foreground",
    variable: "--gold-foreground",
    lightHsl: "0 0% 0%",
    darkHsl: "0 0% 0%",
    lightHex: "#000000",
    darkHex: "#000000",
  },
  {
    name: "Destructive",
    variable: "--destructive",
    lightHsl: "0 84.2% 60.2%",
    darkHsl: "0 62.8% 30.6%",
    lightHex: "#EF4444",
    darkHex: "#7F1D1D",
  },
  {
    name: "Destructive Foreground",
    variable: "--destructive-foreground",
    lightHsl: "210 40% 98%",
    darkHsl: "210 40% 98%",
    lightHex: "#F8FAFC",
    darkHex: "#F8FAFC",
  },
  // UI Colors
  {
    name: "Border",
    variable: "--border",
    lightHsl: "214.3 31.8% 91.4%",
    darkHsl: "217.2 32.6% 17.5%",
    lightHex: "#E2E8F0",
    darkHex: "#1E293B",
  },
  {
    name: "Input",
    variable: "--input",
    lightHsl: "214.3 31.8% 91.4%",
    darkHsl: "217.2 32.6% 17.5%",
    lightHex: "#E2E8F0",
    darkHex: "#1E293B",
  },
  {
    name: "Ring",
    variable: "--ring",
    lightHsl: "222.2 84% 4.9%",
    darkHsl: "212.7 26.8% 83.9%",
    lightHex: "#020817",
    darkHex: "#CBD5E1",
  },
  {
    name: "Card",
    variable: "--card",
    lightHsl: "0 0% 100%",
    darkHsl: "222.2 84% 4.9%",
    lightHex: "#FFFFFF",
    darkHex: "#030712",
  },
  {
    name: "Card Foreground",
    variable: "--card-foreground",
    lightHsl: "222.2 84% 4.9%",
    darkHsl: "210 40% 98%",
    lightHex: "#020817",
    darkHex: "#F8FAFC",
  },
  {
    name: "Popover",
    variable: "--popover",
    lightHsl: "0 0% 100%",
    darkHsl: "222.2 84% 4.9%",
    lightHex: "#FFFFFF",
    darkHex: "#030712",
  },
  {
    name: "Popover Foreground",
    variable: "--popover-foreground",
    lightHsl: "222.2 84% 4.9%",
    darkHsl: "210 40% 98%",
    lightHex: "#020817",
    darkHex: "#F8FAFC",
  },
];

const ColorPalette = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Color Palette</h1>
          <p className="text-muted-foreground">
            Design system colors with light and dark mode variants. Click the copy icon to copy hex values.
          </p>
        </div>

        {/* Core Colors */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">
            Core Colors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colors.slice(0, 10).map((color) => (
              <ColorSwatch key={color.variable} {...color} />
            ))}
          </div>
        </section>

        {/* Special Colors */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">
            Special Colors (CTA, Gold, Destructive)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colors.slice(10, 16).map((color) => (
              <ColorSwatch key={color.variable} {...color} />
            ))}
          </div>
        </section>

        {/* UI Colors */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-4 border-b border-border pb-2">
            UI Element Colors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colors.slice(16).map((color) => (
              <ColorSwatch key={color.variable} {...color} />
            ))}
          </div>
        </section>

        {/* Usage Guide */}
        <section className="bg-muted/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Usage Guide</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-medium text-foreground mb-2">In Tailwind CSS</h3>
              <code className="block bg-background p-3 rounded border border-border text-muted-foreground">
                bg-primary text-primary-foreground<br/>
                bg-cta text-cta-foreground<br/>
                text-gold border-border
              </code>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">In CSS</h3>
              <code className="block bg-background p-3 rounded border border-border text-muted-foreground">
                background: hsl(var(--primary));<br/>
                color: hsl(var(--cta));<br/>
                border-color: hsl(var(--border));
              </code>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ColorPalette;
