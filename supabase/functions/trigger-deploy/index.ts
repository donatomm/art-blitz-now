import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const deployHookUrl = Deno.env.get('VERCEL_DEPLOY_HOOK');
    
    if (!deployHookUrl) {
      console.error('VERCEL_DEPLOY_HOOK not configured');
      return new Response(
        JSON.stringify({ error: 'Deploy hook not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Triggering Vercel deploy...');
    
    const response = await fetch(deployHookUrl, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vercel deploy failed:', errorText);
      return new Response(
        JSON.stringify({ error: 'Deploy trigger failed', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log('Vercel deploy triggered successfully:', result);

    return new Response(
      JSON.stringify({ success: true, job: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error triggering deploy:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
