import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ajvsLogo from "@/assets/ajvs-logo.png";
import { OJSRedirectNotice } from "@/components/ojs/OJSRedirectNotice";
import { getOJSLink } from "@/config/ojs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const Auth = () => {
  useEffect(() => {
    // Auto-redirect to OJS login after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = getOJSLink('LOGIN');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30 py-12 px-4">
      <Link to="/" className="flex items-center gap-3 mb-8 group">
        <div className="w-14 h-14 rounded-lg bg-white border border-primary/20 flex items-center justify-center transition-smooth group-hover:scale-105 shadow-md">
          <img src={ajvsLogo} alt="AJVS Logo" className="w-12 h-12 object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="text-foreground font-serif text-2xl font-bold">AJVS</span>
          <span className="text-muted-foreground text-sm">African Journal of Veterinary Sciences</span>
        </div>
      </Link>

      <Card className="w-full max-w-2xl shadow-elegant">
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Account Management</CardTitle>
          <CardDescription>All user accounts and manuscript submissions are managed through our OJS platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              AJVS uses Open Journal Systems (OJS) for all manuscript-related activities including submission, peer review, and author/reviewer accounts.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <OJSRedirectNotice
              title="Login to Your Account"
              description="If you already have an OJS account for manuscript submission, review, or editorial tasks, click below to sign in."
              actionLabel="Go to Login"
              actionUrl={getOJSLink('LOGIN')}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <OJSRedirectNotice
              title="Create a New Account"
              description="New to AJVS? Register for an OJS account to submit manuscripts, participate in peer review, or manage editorial tasks."
              actionLabel="Register Now"
              actionUrl={getOJSLink('REGISTER')}
            />
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              You will be automatically redirected to the OJS platform in 3 seconds...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
