import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CreateClientRequest {
  email: string;
  companyName: string;
  fullName: string;
  phone?: string;
  planId?: string;
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function sendCredentialsEmail(
  email: string,
  fullName: string,
  companyName: string,
  tempPassword: string,
  loginUrl: string
): Promise<boolean> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY not configured - skipping email send");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Shadoo <noreply@shadoo.lovable.app>",
        to: [email],
        subject: "Welcome to Shadoo - Your Account Credentials",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a2e;">Welcome to Shadoo!</h1>
            <p>Hello ${fullName},</p>
            <p>Your account for <strong>${companyName}</strong> has been created. Here are your login credentials:</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
            </div>
            <p style="color: #e74c3c;"><strong>Important:</strong> You will be required to change your password upon first login.</p>
            <a href="${loginUrl}" style="display: inline-block; background: #1a1a2e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">Login to Shadoo</a>
            <p style="margin-top: 30px; color: #666; font-size: 12px;">If you have any questions, please contact support.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send email:", error);
      return false;
    }

    console.log("Credentials email sent successfully to:", email);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify admin access
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create client with user's token to verify they're admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: callerUser }, error: userError } = await userClient.auth.getUser();
    if (userError || !callerUser) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if caller is admin
    const { data: isAdmin } = await userClient.rpc("is_admin", { _user_id: callerUser.id });
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body: CreateClientRequest = await req.json();
    const { email, companyName, fullName, phone, planId } = body;

    if (!email || !companyName || !fullName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, companyName, fullName" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client for user creation
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Generate temporary password
    const tempPassword = generateTempPassword();

    // Create user with admin API
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        company_name: companyName,
      },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = newUser.user.id;

    // Create profile with must_change_password flag
    const { error: profileError } = await adminClient
      .from("profiles")
      .insert({
        user_id: userId,
        full_name: fullName,
        company_name: companyName,
        phone: phone || null,
        must_change_password: true,
      });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Still continue - user was created
    }

    // Assign client_admin role
    const { error: roleError } = await adminClient
      .from("user_roles")
      .insert({
        user_id: userId,
        role: "client_admin",
      });

    if (roleError) {
      console.error("Error assigning role:", roleError);
    }

    // Create wallet for client
    const { error: walletError } = await adminClient
      .from("wallets")
      .insert({
        user_id: userId,
        balance: 0,
        currency: "EGP",
      });

    if (walletError) {
      console.error("Error creating wallet:", walletError);
    }

    // Create subscription if plan provided
    if (planId) {
      const { error: subError } = await adminClient
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          plan_id: planId,
          status: "active",
          current_period_start: new Date().toISOString(),
        });

      if (subError) {
        console.error("Error creating subscription:", subError);
      }
    }

    // Get login URL from request origin or use default
    const origin = req.headers.get("origin") || "https://shadoo.lovable.app";
    const loginUrl = `${origin}/auth`;

    // Send credentials email
    const emailSent = await sendCredentialsEmail(
      email,
      fullName,
      companyName,
      tempPassword,
      loginUrl
    );

    console.log(`Client created successfully: ${email} (${companyName})`);

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        email,
        companyName,
        emailSent,
        tempPassword: emailSent ? undefined : tempPassword, // Return password only if email failed
        message: emailSent 
          ? "Client created and credentials sent via email"
          : "Client created but email not sent - save the temporary password",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
