import { useState, useEffect } from "react";
import { useSiteSettings, useUpdateSiteSetting, getSettingValue } from "@/hooks/useSiteSettings";
import { useToast } from "@/hooks/use-toast";
import { TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";

const DEFAULT_POPUP_CONTENT = `📦 Spedizione Gratuita

La spedizione gratuita è valida per:

𝙄𝙩𝙖𝙡𝙞𝙖 𝙋𝙚𝙣𝙞𝙣𝙨𝙪𝙡𝙖𝙧𝙚 𝙚 𝙎𝙞𝙘𝙞𝙡𝙞𝙖

Per spedizioni in altre zone (Sardegna, isole minori, Paesi Europei), i costi di produzione sono significativamente più alti (diverso fornitore) mentre lo shipping rientra nella norma, ed offre consegna ESPRESSA 24h

Paesi inclusi: DE, AT, CH, LU, GB, IE, FR, BE, ES, SE, DK, FI, NL, PL, PT, CZ, HU, SK.

EXPRESS 24h. Contattaci per un preventivo personalizzato.`;

// Color input with preview - sanitizes double # prefixes
const ColorInput = ({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void;
}) => {
  const handleChange = (newValue: string) => {
    // Remove any double ## and ensure single #
    let sanitized = newValue.replace(/^#+/, '#');
    if (sanitized && !sanitized.startsWith('#')) {
      sanitized = '#' + sanitized;
    }
    onChange(sanitized);
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Label className="text-xs">{label}</Label>
        <Input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
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
};

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
  const [hellobarBgOpacity, setHellobarBgOpacity] = useState(100);
  const [hellobarCountdownEnabled, setHellobarCountdownEnabled] = useState(true);
  const [hellobarCountdownEnd, setHellobarCountdownEnd] = useState("");
  const [hellobarCountdownTextColor, setHellobarCountdownTextColor] = useState("#FFFFFF");
  const [hellobarCountdownBgColor, setHellobarCountdownBgColor] = useState("#15803D");
  const [hellobarButtonEnabled, setHellobarButtonEnabled] = useState(true);
  const [hellobarButtonText, setHellobarButtonText] = useState("Dettagli");
  const [hellobarButtonTextColor, setHellobarButtonTextColor] = useState("#16A34A");
  const [hellobarButtonBgColor, setHellobarButtonBgColor] = useState("#FFFFFF");
  const [hellobarButtonBorderColor, setHellobarButtonBorderColor] = useState("#FFFFFF");
  const [hellobarPopupContent, setHellobarPopupContent] = useState(DEFAULT_POPUP_CONTENT);
  const [hellobarWhatsappNumber, setHellobarWhatsappNumber] = useState("393666295174");
  const [hellobarContactEmail, setHellobarContactEmail] = useState("me@octowonders.com");
  
  // Load settings
  useEffect(() => {
    if (settings) {
      setHellobarEnabled(getSettingValue<boolean>(settings, "hellobar_enabled", true));
      setHellobarText(getSettingValue<string>(settings, "hellobar_text", "SPEDIZIONE GRATUITA in Italia - 30% fino a capodanno!"));
      setHellobarTextColor(getSettingValue<string>(settings, "hellobar_text_color", "#FFFFFF"));
      setHellobarBgColor(getSettingValue<string>(settings, "hellobar_bg_color", "#16A34A"));
      setHellobarBgOpacity(getSettingValue<number>(settings, "hellobar_bg_opacity", 100));
      setHellobarCountdownEnabled(getSettingValue<boolean>(settings, "hellobar_countdown_enabled", true));
      setHellobarCountdownEnd(getSettingValue<string>(settings, "hellobar_countdown_end", "2025-01-01T00:00:00"));
      setHellobarCountdownTextColor(getSettingValue<string>(settings, "hellobar_countdown_text_color", "#FFFFFF"));
      setHellobarCountdownBgColor(getSettingValue<string>(settings, "hellobar_countdown_bg_color", "#15803D"));
      setHellobarButtonEnabled(getSettingValue<boolean>(settings, "hellobar_button_enabled", true));
      setHellobarButtonText(getSettingValue<string>(settings, "hellobar_button_text", "Dettagli"));
      setHellobarButtonTextColor(getSettingValue<string>(settings, "hellobar_button_text_color", "#16A34A"));
      setHellobarButtonBgColor(getSettingValue<string>(settings, "hellobar_button_bg_color", "#FFFFFF"));
      setHellobarButtonBorderColor(getSettingValue<string>(settings, "hellobar_button_border_color", "#FFFFFF"));
      setHellobarPopupContent(getSettingValue<string>(settings, "hellobar_popup_content", DEFAULT_POPUP_CONTENT));
      setHellobarWhatsappNumber(getSettingValue<string>(settings, "hellobar_whatsapp_number", "393666295174"));
      setHellobarContactEmail(getSettingValue<string>(settings, "hellobar_contact_email", "me@octowonders.com"));
    }
  }, [settings]);
  
  const handleSave = async () => {
    try {
      await Promise.all([
        updateSetting.mutateAsync({ key: "hellobar_enabled", value: hellobarEnabled }),
        updateSetting.mutateAsync({ key: "hellobar_text", value: hellobarText }),
        updateSetting.mutateAsync({ key: "hellobar_text_color", value: hellobarTextColor }),
        updateSetting.mutateAsync({ key: "hellobar_bg_color", value: hellobarBgColor }),
        updateSetting.mutateAsync({ key: "hellobar_bg_opacity", value: hellobarBgOpacity }),
        updateSetting.mutateAsync({ key: "hellobar_countdown_enabled", value: hellobarCountdownEnabled }),
        updateSetting.mutateAsync({ key: "hellobar_countdown_end", value: hellobarCountdownEnd }),
        updateSetting.mutateAsync({ key: "hellobar_countdown_text_color", value: hellobarCountdownTextColor }),
        updateSetting.mutateAsync({ key: "hellobar_countdown_bg_color", value: hellobarCountdownBgColor }),
        updateSetting.mutateAsync({ key: "hellobar_button_enabled", value: hellobarButtonEnabled }),
        updateSetting.mutateAsync({ key: "hellobar_button_text", value: hellobarButtonText }),
        updateSetting.mutateAsync({ key: "hellobar_button_text_color", value: hellobarButtonTextColor }),
        updateSetting.mutateAsync({ key: "hellobar_button_bg_color", value: hellobarButtonBgColor }),
        updateSetting.mutateAsync({ key: "hellobar_button_border_color", value: hellobarButtonBorderColor }),
        updateSetting.mutateAsync({ key: "hellobar_popup_content", value: hellobarPopupContent }),
        updateSetting.mutateAsync({ key: "hellobar_whatsapp_number", value: hellobarWhatsappNumber }),
        updateSetting.mutateAsync({ key: "hellobar_contact_email", value: hellobarContactEmail }),
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
          <h3 className="font-bold text-sm text-blue-600 border-b pb-2">📝 Testo</h3>
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
          <div>
            <Label>Opacità Sfondo ({hellobarBgOpacity}%)</Label>
            <input
              type="range"
              min="0"
              max="100"
              value={hellobarBgOpacity}
              onChange={(e) => { setHellobarBgOpacity(Number(e.target.value)); markChanged(); }}
              className="w-full mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              0% = completamente trasparente, 100% = opaco
            </p>
          </div>
        </div>
        
        {/* Countdown Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-sm text-blue-600">⏱️ Countdown</h3>
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
                  onChange={(e) => { 
                    // Ensure we save with seconds appended for proper parsing
                    const dateValue = e.target.value ? `${e.target.value}:00` : "";
                    setHellobarCountdownEnd(dateValue); 
                    markChanged(); 
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Imposta una data futura! Il countdown mostrerà Giorni, Ore, Minuti, Secondi
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
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-sm text-blue-600">🔘 Bottone Dettagli</h3>
            <Switch
              checked={hellobarButtonEnabled}
              onCheckedChange={(val) => { setHellobarButtonEnabled(val); markChanged(); }}
            />
          </div>
          {hellobarButtonEnabled && (
            <>
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
            </>
          )}
        </div>
        
        {/* Popup Content Section */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-bold text-sm text-blue-600 border-b pb-2">💬 Contenuto Popup</h3>
          <div>
            <Label>Testo del Popup (mostrato quando si clicca "Dettagli")</Label>
            <Textarea
              value={hellobarPopupContent}
              onChange={(e) => { setHellobarPopupContent(e.target.value); markChanged(); }}
              placeholder="Inserisci il contenuto del popup..."
              rows={10}
              className="mt-2 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              I bottoni WhatsApp e Email vengono aggiunti automaticamente sotto il testo.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Numero WhatsApp</Label>
              <Input
                value={hellobarWhatsappNumber}
                onChange={(e) => { setHellobarWhatsappNumber(e.target.value); markChanged(); }}
                placeholder="393666295174"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Formato internazionale senza + (es: 393666295174)
              </p>
            </div>
            <div>
              <Label>Indirizzo Email</Label>
              <Input
                value={hellobarContactEmail}
                onChange={(e) => { setHellobarContactEmail(e.target.value); markChanged(); }}
                placeholder="me@octowonders.com"
                className="mt-1"
              />
            </div>
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
