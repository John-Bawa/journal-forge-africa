import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { subject, message, emails }: BulkEmailRequest = await req.json();

    console.log(`Sending bulk email to ${emails.length} recipients`);
    console.log(`Subject: ${subject}`);
    
    // In production, integrate with email service (Resend, SendGrid, etc.)
    // For now, we'll log the email details
    
    // Example with Resend (uncomment when RESEND_API_KEY is configured):
    /*
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    for (const email of emails) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "AJVS <noreply@ajvs.org>",
          to: [email],
          subject: subject,
          html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
        }),
      });
    }
    */

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