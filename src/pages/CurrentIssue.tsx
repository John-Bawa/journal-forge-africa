import Header from "@/components/layout/Header";
import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";
import { OJSCurrentIssueSection } from "@/components/ojs/OJSCurrentIssueSection";
import { SEOHead } from "./SEOHead";

const CurrentIssue = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Current Issue"
        description="Browse the latest published articles in the current issue of AJVS. Open access peer-reviewed veterinary research."
        canonicalUrl="https://africanjournalvetsci.org/current-issue"
      />
      <TopBar />
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4">Current Issue</h1>
            <p className="text-lg text-muted-foreground">
              Browse the latest articles published in AJVS
            </p>
          </div>
          
          <OJSCurrentIssueSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CurrentIssue;
