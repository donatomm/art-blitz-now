import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings, getSettingValue } from "@/hooks/useSiteSettings";
import { useToast } from "@/hooks/use-toast";

const SyncStatusIndicator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const { data: settings, refetch } = useSiteSettings();
  const { toast } = useToast();

  // Check if user is authenticated admin
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: hasAdminRole } = await supabase.rpc('has_role', {
          _user_id: session.user.id,
          _role: 'admin'
        });
        setIsAuthenticated(!!hasAdminRole);
      }
    };
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: hasAdminRole } = await supabase.rpc('has_role', {
          _user_id: session.user.id,
          _role: 'admin'
        });
        setIsAuthenticated(!!hasAdminRole);
      } else {
        setIsAuthenticated(false);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Don't render if not authenticated admin
  if (!isAuthenticated) return null;

  // Get timestamps from settings
  const lastContentUpdated = getSettingValue<string>(settings, 'last_content_updated_at', '1970-01-01T00:00:00.000Z');
  const lastDeployTriggered = getSettingValue<string>(settings, 'last_deploy_triggered_at', '1970-01-01T00:00:00.000Z');
  
  // Parse as JSON strings (they're stored with quotes)
  const contentDate = new Date(typeof lastContentUpdated === 'string' ? lastContentUpdated.replace(/"/g, '') : lastContentUpdated);
  const deployDate = new Date(typeof lastDeployTriggered === 'string' ? lastDeployTriggered.replace(/"/g, '') : lastDeployTriggered);
  
  const needsSync = contentDate > deployDate;

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const response = await supabase.functions.invoke('trigger-deploy');
      
      if (response.error) {
        throw new Error(response.error.message || 'Deploy failed');
      }

      // Update deploy timestamp
      await supabase.from('site_settings').upsert({
        key: 'last_deploy_triggered_at',
        value: new Date().toISOString()
      }, { onConflict: 'key' });

      // Refetch settings to update UI
      await refetch();

      toast({
        title: "🚀 Deploy avviato!",
        description: "Il sito sarà pubblicato in 1-2 minuti."
      });
    } catch (error) {
      console.error('Deploy error:', error);
      toast({
        title: "Errore nel deploy",
        description: error instanceof Error ? error.message : "Impossibile avviare il deploy.",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // Deploying state
  if (isDeploying) {
    return (
      <Button
        disabled
        className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg bg-amber-500 hover:bg-amber-500"
        size="sm"
      >
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Deploying...
      </Button>
    );
  }

  // Needs sync - red button
  if (needsSync) {
    return (
      <Button
        onClick={handleDeploy}
        className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg bg-red-500 hover:bg-red-600"
        size="sm"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Need synch/deploy
      </Button>
    );
  }

  // All synced - green button (disabled)
  return (
      <Button
        disabled
        className="fixed bottom-20 right-4 z-50 rounded-full shadow-lg bg-green-600 hover:bg-green-600 disabled:opacity-100"
        size="sm"
      >
      <CheckCircle className="h-4 w-4 mr-2" />
      All SYNCed
    </Button>
  );
};

export default SyncStatusIndicator;
