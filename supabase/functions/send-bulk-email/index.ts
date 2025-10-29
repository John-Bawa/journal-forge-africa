import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BulkEmailRequest {
  subject: string;
  message: string;
  emails: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT and get user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Check if user has admin/editor/secretary role
    const { data: hasRole, error: roleError } = await supabase.rpc(
      "has_any_role",
      { 
        _user_id: user.id, 
        _roles: ['super_admin', 'editor', 'secretary']
      }
    );

    if (roleError || !hasRole) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions. Admin, editor, or secretary role required." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }

    const { subject, message, emails }: BulkEmailRequest = await req.json();

    console.log(`Sending bulk email to ${emails.length} recipients`);
    console.log(`Subject: ${subject}`);
    
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    // Send emails using Resend API
    const emailPromises = emails.map(email => 
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "AJVS <noreply@ajvs.org>",
          to: [email],
          subject: subject,
          html: `
            <!DOCTYPE html>
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
                    <h2>${subject}</h2>
                  </div>
                  <div style="padding: 20px; background: #f9fafb;">
                    ${message.replace(/\n/g, '<br>')}
                  </div>
                  <div style="padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
                    <p>African Journal of Veterinary Sciences</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        }),
      })
    );
    
    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Sent ${successful} emails successfully, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email queued for ${emails.length} recipient(s)` 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error sending bulk email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});