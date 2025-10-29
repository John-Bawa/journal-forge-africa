import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BulkReminderRequest {
  reviewIds: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reviewIds }: BulkReminderRequest = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch review details
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(`
        id,
        manuscript_id,
        reviewer_id
      `)
      .in("id", reviewIds);

    if (error) throw error;

    console.log(`Sending bulk reminders to ${reviews?.length || 0} reviewers`);

    // In production, send emails to all reviewers
    for (const review of reviews || []) {
      // Fetch manuscript and reviewer details separately
      const { data: manuscript } = await supabase
        .from("manuscripts")
        .select("title")
        .eq("id", review.manuscript_id)
        .single();
      
      const { data: reviewer } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", review.reviewer_id)
        .single();

      const emailContent = `
        <h2>Review Reminder</h2>
        <p>Dear ${reviewer?.full_name},</p>
        <p>This is a friendly reminder that your review for the following manuscript is pending:</p>
        <p><strong>${manuscript?.title}</strong></p>
        <p>Please log in to your dashboard to complete the review at your earliest convenience.</p>
        <p>Best regards,<br>Editorial Team<br>African Journal of Veterinary Sciences</p>
      `;

      console.log(`Would send email to: ${reviewer?.email}`);
      
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
          to: [reviewer?.email],
          subject: `Reminder: Review Pending`,
          html: emailContent,
        }),
      });
      */
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Reminders sent to ${reviews?.length || 0} reviewer(s)` 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error sending bulk reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});