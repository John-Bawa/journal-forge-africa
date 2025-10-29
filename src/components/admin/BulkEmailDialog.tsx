import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function BulkEmailDialog() {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState<string>("all");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject || !message) {
      toast.error("Please fill in all fields");
      return;
    }

    setSending(true);
    try {
      // Get recipient emails based on selection
      let query = supabase.from("profiles").select("email");
      
      if (recipient !== "all") {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", recipient as any);
        
        const userIds = roles?.map(r => r.user_id) || [];
        if (userIds.length > 0) {
          query = query.in("id", userIds);
        }
      }

      const { data: profiles } = await query;
      const emails = profiles?.map(p => p.email) || [];

      // Call edge function to send emails
      const { error } = await supabase.functions.invoke("send-bulk-email", {
        body: { subject, message, emails }
      });

      if (error) throw error;

      toast.success(`Email sent to ${emails.length} recipient(s)`);
      setOpen(false);
      setSubject("");
      setMessage("");
      setRecipient("all");
    } catch (error: any) {
      console.error("Error sending emails:", error);
      toast.error("Failed to send emails");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Mail className="w-4 h-4 mr-2" />
          Send Bulk Email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Bulk Email Notification</DialogTitle>
          <DialogDescription>
            Send announcements or notifications to users
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="recipient">Recipients</Label>
            <Select value={recipient} onValueChange={setRecipient}>
              <SelectTrigger id="recipient">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="author">Authors Only</SelectItem>
                <SelectItem value="reviewer">Reviewers Only</SelectItem>
                <SelectItem value="editor">Editors Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Email message..."
              rows={8}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}