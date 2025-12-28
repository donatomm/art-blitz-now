import { useState, useEffect } from "react";
import { useSiteSettings, useUpdateSiteSetting, getSettingValue } from "@/hooks/useSiteSettings";
import { useToast } from "@/hooks/use-toast";
import { TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";

// Color input with preview
const ColorInput = ({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void;
}) => (
  <div className="flex items-center gap-2">
    <div className="flex-1">
      <Label className="text-xs">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#FFFFFF"
        className="font-mono text-sm"
      />
    </div>
    <div 
      className="w-10 h-10 rounded border border-border mt-5"
      style={{ backgroundColor: value }}
    />
  </div>
);

const HelloBarTabContent = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();
  const { toast } = useToast();
  const [hasChanges, setHasChanges] = useState(false);
  
  // HelloBar state
  const [hellobarEnabled, setHellobarEnabled] = useState(true);
  const [hellobarText, setHellobarText] = useState("");
  const [hellobarTextColor, setHellobarTextColor] = useState("#FFFFFF");
  const [hellobarBgColor, setHellobarBgColor] = useState("#16A34A");
  const [hellobarCountdownEnabled, setHellobarCountdownEnabled] = useState(true);
  const [hellobarCountdownEnd, setHellobarCountdownEnd] = useState("");
  const [hellobarCountdownTextColor, setHellobarCountdownTextColor] = useState("#FFFFFF");
  const [hellobarCountdownBgColor, setHellobarCountdownBgColor] = useState("#15803D");
  const [hellobarButtonText, setHellobarButtonText] = useState("Dettagli");
  const [hellobarButtonTextColor, setHellobarButtonTextColor] = useState("#16A34A");
  const [hellobarButtonBgColor, setHellobarButtonBgColor] = useState("#FFFFFF");
  const [hellobarButtonBorderColor, setHellobarButtonBorderColor] = useState("#FFFFFF");
  
  // Load settings
  useEffect(() => {
    if (settings) {
      setHellobarEnabled(getSettingValue<boolean>(settings, "hellobar_enabled", true));
      setHellobarText(getSettingValue<string>(settings, "hellobar_text", "SPEDIZIONE GRATUITA in Italia - 30% fino a capodanno!"));
      setHellobarTextColor(getSettingValue<string>(settings, "hellobar_text_color", "#FFFFFF"));
      setHellobarBgColor(getSettingValue<string>(settings, "hellobar_bg_color", "#16A34A"));
      setHellobarCountdownEnabled(getSettingValue<boolean>(settings, "hellobar_countdown_enabled", true));
      setHellobarCountdownEnd(getSettingValue<string>(settings, "hellobar_countdown_end", "2025-01-01T00:00:00"));
      setHellobarCountdownTextColor(getSettingValue<string>(settings, "hellobar_countdown_text_color", "#FFFFFF"));
      setHellobarCountdownBgColor(getSettingValue<string>(settings, "hellobar_countdown_bg_color", "#15803D"));
      setHellobarButtonText(getSettingValue<string>(settings, "hellobar_button_text", "Dettagli"));
      setHellobarButtonTextColor(getSettingValue<string>(settings, "hellobar_button_text_color", "#16A34A"));
      setHellobarButtonBgColor(getSettingValue<string>(settings, "hellobar_button_bg_color", "#FFFFFF"));
      setHellobarButtonBorderColor(getSettingValue<string>(settings, "hellobar_button_border_color", "#FFFFFF"));
    }
  }, [settings]);
  
  const handleSave = async () => {
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: "hellobar_enabled", value: hellobarEnabled }),
        updateSetting.mutateAsync({ key: "hellobar_text", value: hellobarText }),
        updateSetting.mutateAsync({ key: "hellobar_text_color", value: hellobarTextColor }),
        updateSetting.mutateAsync({ key: "hellobar_bg_color", value: hellobarBgColor }),
        updateSetting.mutateAsync({ key: "hellobar_countdown_enabled", value: hellobarCountdownEnabled }),
        updateSetting.mutateAsync({ key: "hellobar_countdown_end", value: hellobarCountdownEnd }),
        updateSetting.mutateAsync({ key: "hellobar_countdown_text_color", value: hellobarCountdownTextColor }),
        updateSetting.mutateAsync({ key: "hellobar_countdown_bg_color", value: hellobarCountdownBgColor }),
        updateSetting.mutateAsync({ key: "hellobar_button_text", value: hellobarButtonText }),
        updateSetting.mutateAsync({ key: "hellobar_button_text_color", value: hellobarButtonTextColor }),
        updateSetting.mutateAsync({ key: "hellobar_button_bg_color", value: hellobarButtonBgColor }),
        updateSetting.mutateAsync({ key: "hellobar_button_border_color", value: hellobarButtonBorderColor }),
      ]);
      setHasChanges(false);
      toast({
        title: "Hello Bar salvata!",
        description: "Le modifiche sono state applicate.",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare le impostazioni.",
        variant: "destructive",
      });
    }
  };
  
  const markChanged = () => setHasChanges(true);
  
  if (isLoading) {
    return (
      <TabsContent value="hellobar" className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </TabsContent>
    );
  }
  
  return (
    <TabsContent value="hellobar" className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Configura la Hello Bar fissa in cima alla pagina.
      </p>
      
      <div className="space-y-6">
        {/* Enable/Disable HelloBar */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label className="text-base font-semibold">Mostra Hello Bar</Label>
            <p className="text-xs text-muted-foreground">Attiva/disattiva la barra in cima alla pagina</p>
          </div>
          <Switch
            checked={hellobarEnabled}
            onCheckedChange={(val) => { setHellobarEnabled(val); markChanged(); }}
          />
        </div>
        
        {/* Text Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-sm border-b pb-2">📝 Testo</h3>
          <div>
            <Label>Testo Hello Bar</Label>
            <Input
              value={hellobarText}
              onChange={(e) => { setHellobarText(e.target.value); markChanged(); }}
              placeholder="SPEDIZIONE GRATUITA in Italia..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ColorInput
              label="Colore Testo"
              value={hellobarTextColor}
              onChange={(val) => { setHellobarTextColor(val); markChanged(); }}
            />
            <ColorInput
              label="Colore Sfondo Barra"
              value={hellobarBgColor}
              onChange={(val) => { setHellobarBgColor(val); markChanged(); }}
            />
          </div>
        </div>
        
        {/* Countdown Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-semibold text-sm">⏱️ Countdown</h3>
            <Switch
              checked={hellobarCountdownEnabled}
              onCheckedChange={(val) => { setHellobarCountdownEnabled(val); markChanged(); }}
            />
          </div>
          {hellobarCountdownEnabled && (
            <>
              <div>
                <Label>Data/Ora Fine Countdown</Label>
                <Input
                  type="datetime-local"
                  value={hellobarCountdownEnd.slice(0, 16)}
                  onChange={(e) => { setHellobarCountdownEnd(e.target.value); markChanged(); }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Il countdown mostrerà Giorni, Ore, Minuti, Secondi
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <ColorInput
                  label="Colore Testo Countdown"
                  value={hellobarCountdownTextColor}
                  onChange={(val) => { setHellobarCountdownTextColor(val); markChanged(); }}
                />
                <ColorInput
                  label="Colore Sfondo Countdown"
                  value={hellobarCountdownBgColor}
                  onChange={(val) => { setHellobarCountdownBgColor(val); markChanged(); }}
                />
              </div>
            </>
          )}
        </div>
        
        {/* Button Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-sm border-b pb-2">🔘 Bottone Dettagli</h3>
          <div>
            <Label>Testo Bottone</Label>
            <Input
              value={hellobarButtonText}
              onChange={(e) => { setHellobarButtonText(e.target.value); markChanged(); }}
              placeholder="Dettagli"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <ColorInput
              label="Colore Testo"
              value={hellobarButtonTextColor}
              onChange={(val) => { setHellobarButtonTextColor(val); markChanged(); }}
            />
            <ColorInput
              label="Colore Sfondo"
              value={hellobarButtonBgColor}
              onChange={(val) => { setHellobarButtonBgColor(val); markChanged(); }}
            />
            <ColorInput
              label="Colore Bordo"
              value={hellobarButtonBorderColor}
              onChange={(val) => { setHellobarButtonBorderColor(val); markChanged(); }}
            />
          </div>
        </div>
        
        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={updateSetting.isPending || !hasChanges}
          className="w-full"
        >
          {updateSetting.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salva Hello Bar
        </Button>
      </div>
    </TabsContent>
  );
};

export default HelloBarTabContent;
