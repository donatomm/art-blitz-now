import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminEmail = Deno.env.get('ADMIN_EMAIL')!;
    const adminPassword = Deno.env.get('ADMIN_PASSWORD')!;

    if (!adminEmail || !adminPassword) {
      console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD environment variables');
      return new Response(
        JSON.stringify({ error: 'Missing admin credentials in environment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    console.log(`Setting up admin user: ${adminEmail}`);

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === adminEmail);

    let userId: string;

    if (existingUser) {
      console.log('Admin user already exists, updating password...');
      userId = existingUser.id;
      
      // Update password to match the secret
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: adminPassword
      });
      
      if (updateError) {
        console.error('Error updating admin password:', updateError);
        throw updateError;
      }
    } else {
      console.log('Creating new admin user...');
      
      // Create new user with the password from secrets
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true
      });

      if (createError) {
        console.error('Error creating admin user:', createError);
        throw createError;
      }

      userId = newUser.user.id;
    }

    // Check if admin role already exists
    const { data: existingRole } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!existingRole) {
      console.log('Adding admin role...');
      
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });

      if (roleError) {
        console.error('Error adding admin role:', roleError);
        throw roleError;
      }
    } else {
      console.log('Admin role already exists');
    }

    console.log('Admin setup complete!');

    // Return the admin credentials for the client to use
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin user setup complete',
        email: adminEmail,
        password: adminPassword
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in setup-admin:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
