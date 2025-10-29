import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderRequest {
  reviewId: string;
  reviewerEmail: string;
  manuscriptTitle: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reviewId, reviewerEmail, manuscriptTitle }: ReminderRequest = await req.json();

    console.log(`Sending reminder for review ${reviewId} to ${reviewerEmail}`);
    
    // In production, integrate with email service
    // Example email content:
    const emailContent = `
      <h2>Review Reminder</h2>
      <p>Dear Reviewer,</p>
      <p>This is a friendly reminder that your review for the following manuscript is pending:</p>
      <p><strong>${manuscriptTitle}</strong></p>
      <p>Please log in to your dashboard to complete the review at your earliest convenience.</p>
      <p>If you need an extension or have any questions, please contact the editorial office.</p>
      <p>Best regards,<br>Editorial Team<br>African Journal of Veterinary Sciences</p>
    `;

    // Example with Resend (uncomment when RESEND_API_KEY is configured):
    /*
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "AJVS Editorial <editorial@ajvs.org>",
        to: [reviewerEmail],
        subject: `Reminder: Review Pending for "${manuscriptTitle}"`,
        html: emailContent,
      }),
    });
    */

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Reminder sent successfully" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error sending reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});