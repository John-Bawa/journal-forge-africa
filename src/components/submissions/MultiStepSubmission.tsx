import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PaymentStep } from "./PaymentStep";

interface Author {
  full_name: string;
  email: string;
  institution: string;
  orcid?: string;
  is_corresponding: boolean;
}

export const MultiStepSubmission = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [manuscriptId, setManuscriptId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    keywords: "",
    subject_area: "",
    manuscript_type: "Original Research",
    authors: [] as Author[],
    references: "",
    funding_statement: "",
    conflict_statement: "",
    ethical_approval: "",
  });

  const [newAuthor, setNewAuthor] = useState<Author>({
    full_name: "",
    email: "",
    institution: "",
    orcid: "",
    is_corresponding: false,
  });

  const steps = [
    { number: 1, title: "Manuscript Metadata" },
    { number: 2, title: "Author Details" },
    { number: 3, title: "File Uploads" },
    { number: 4, title: "References" },
    { number: 5, title: "Declarations" },
    { number: 6, title: "Payment" },
    { number: 7, title: "Review & Submit" },
  ];

  const handleNext = async () => {
    // Save draft before payment step
    if (currentStep === 5 && !manuscriptId) {
      await saveDraft();
    }
    if (currentStep < 7) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const addAuthor = () => {
    if (!newAuthor.full_name || !newAuthor.email || !newAuthor.institution) {
      toast.error("Please fill all required author fields");
      return;
    }
    setFormData({ ...formData, authors: [...formData.authors, newAuthor] });
    setNewAuthor({ full_name: "", email: "", institution: "", orcid: "", is_corresponding: false });
    toast.success("Author added");
  };

  const saveDraft = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to submit");
        return;
      }

      const { data: manuscript, error: manuscriptError } = await supabase
        .from("manuscripts")
        .insert({
          title: formData.title,
          abstract: formData.abstract,
          keywords: formData.keywords.split(",").map((k) => k.trim()),
          subject_area: formData.subject_area,
          manuscript_type: formData.manuscript_type,
          funding_statement: formData.funding_statement,
          conflict_statement: formData.conflict_statement,
          submitting_author_id: user.id,
          status: "draft",
        })
        .select()
        .single();

      if (manuscriptError) throw manuscriptError;

      // Insert authors
      for (let i = 0; i < formData.authors.length; i++) {
        const author = formData.authors[i];
        await supabase.from("manuscript_authors").insert({
          manuscript_id: manuscript.id,
          full_name: author.full_name,
          email: author.email,
          institution: author.institution,
          orcid: author.orcid,
          is_corresponding: author.is_corresponding,
          author_order: i + 1,
        });
      }

      setManuscriptId(manuscript.id);
      toast.success("Draft saved! Please proceed to payment.");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handlePaymentComplete = () => {
    toast.success("Payment successful! Manuscript submitted for review.");
    setTimeout(() => {
      navigate("/manuscripts");
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Progress Steps */}
        <div className="flex justify-between mb-8 relative">
          {/* Animated Progress Bar */}
          <motion.div
            className="absolute top-5 left-0 h-0.5 bg-primary z-0"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
          <div className="absolute top-5 left-0 w-full h-0.5 bg-muted z-0" />
          
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col items-center flex-1 relative z-10">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep >= step.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: currentStep === step.number ? 1.1 : 1,
                  transition: { duration: 0.2 }
                }}
                whileHover={{ scale: 1.15 }}
              >
                {currentStep > step.number ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  >
                    <Check className="w-5 h-5" />
                  </motion.div>
                ) : (
                  step.number
                )}
              </motion.div>
              <p className={`text-xs mt-2 text-center hidden md:block transition-all ${
                currentStep === step.number ? "font-semibold text-primary" : ""
              }`}>
                {step.title}
              </p>
            </div>
          ))}
        </div>

        <Card className="glass backdrop-blur-lg p-8 border-border/50">
          <AnimatePresence mode="wait">
            {/* Step 1: Manuscript Metadata */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-serif font-bold">Manuscript Metadata</h2>
                <div>
                  <Label htmlFor="title">Manuscript Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter the full title of your manuscript"
                    className="focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div>
                  <Label htmlFor="abstract">Abstract *</Label>
                  <Textarea
                    id="abstract"
                    value={formData.abstract}
                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                    placeholder="Provide a concise summary (max 300 words)"
                    rows={6}
                    className="focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div>
                  <Label htmlFor="keywords">Keywords *</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="Enter 4-6 keywords, separated by commas"
                    className="focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject_area">Subject Area *</Label>
                    <Input
                      id="subject_area"
                      value={formData.subject_area}
                      onChange={(e) => setFormData({ ...formData, subject_area: e.target.value })}
                      placeholder="e.g., Animal Nutrition"
                      className="focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  <div>
                    <Label htmlFor="manuscript_type">Manuscript Type *</Label>
                    <select
                      id="manuscript_type"
                      value={formData.manuscript_type}
                      onChange={(e) => setFormData({ ...formData, manuscript_type: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 focus:ring-2 focus:ring-primary/50 transition-all"
                    >
                      <option>Original Research</option>
                      <option>Review Article</option>
                      <option>Case Report</option>
                      <option>Short Communication</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

          {/* Step 2: Author Details */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-serif font-bold">Author Details</h2>
              <div className="space-y-4">
                {formData.authors.map((author, idx) => (
                  <Card key={idx} className="p-4 bg-secondary/20">
                    <p className="font-semibold">{author.full_name}</p>
                    <p className="text-sm text-muted-foreground">{author.email}</p>
                    <p className="text-sm">{author.institution}</p>
                    {author.is_corresponding && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Corresponding Author
                      </span>
                    )}
                  </Card>
                ))}
              </div>
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Add New Author</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input
                      value={newAuthor.full_name}
                      onChange={(e) => setNewAuthor({ ...newAuthor, full_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={newAuthor.email}
                      onChange={(e) => setNewAuthor({ ...newAuthor, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Institution *</Label>
                    <Input
                      value={newAuthor.institution}
                      onChange={(e) => setNewAuthor({ ...newAuthor, institution: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>ORCID iD (optional)</Label>
                    <Input
                      value={newAuthor.orcid}
                      onChange={(e) => setNewAuthor({ ...newAuthor, orcid: e.target.value })}
                      placeholder="0000-0000-0000-0000"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newAuthor.is_corresponding}
                    onChange={(e) => setNewAuthor({ ...newAuthor, is_corresponding: e.target.checked })}
                  />
                  <Label>Corresponding Author</Label>
                </div>
                <Button onClick={addAuthor} variant="outline">
                  Add Author
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: File Uploads */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-serif font-bold">File Uploads</h2>
              <div className="space-y-4">
                <div>
                  <Label>Main Manuscript File (PDF/DOCX) *</Label>
                  <Input type="file" accept=".pdf,.doc,.docx" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Max file size: 10MB. Accepted formats: PDF, DOC, DOCX
                  </p>
                </div>
                <div>
                  <Label>Supplementary Files (optional)</Label>
                  <Input type="file" multiple />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload figures, tables, or additional materials
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: References */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-serif font-bold">References</h2>
              <div>
                <Label htmlFor="references">References (APA 7th Edition)</Label>
                <Textarea
                  id="references"
                  value={formData.references}
                  onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                  placeholder="Paste your formatted references here..."
                  rows={10}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Please ensure all references follow APA 7th edition format
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 5: Declarations */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-serif font-bold">Declarations & Conflicts</h2>
              <div>
                <Label htmlFor="ethical_approval">Ethical Approval Statement</Label>
                <Textarea
                  id="ethical_approval"
                  value={formData.ethical_approval}
                  onChange={(e) => setFormData({ ...formData, ethical_approval: e.target.value })}
                  placeholder="Provide details of ethical approval or state N/A if not applicable"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="funding_statement">Funding Statement</Label>
                <Textarea
                  id="funding_statement"
                  value={formData.funding_statement}
                  onChange={(e) => setFormData({ ...formData, funding_statement: e.target.value })}
                  placeholder="List all funding sources or state 'No funding received'"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="conflict_statement">Conflict of Interest Statement *</Label>
                <Textarea
                  id="conflict_statement"
                  value={formData.conflict_statement}
                  onChange={(e) => setFormData({ ...formData, conflict_statement: e.target.value })}
                  placeholder="Declare any conflicts or state 'The authors declare no conflicts of interest'"
                  rows={3}
                />
              </div>
            </motion.div>
          )}

          {/* Step 6: Payment */}
          {currentStep === 6 && manuscriptId && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PaymentStep 
                manuscriptId={manuscriptId}
                amount={50000}
                currency="NGN"
                onPaymentComplete={handlePaymentComplete}
              />
            </motion.div>
          )}

          {/* Step 7: Review & Submit */}
          {currentStep === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-serif font-bold">Submission Complete!</h2>
              <Card className="p-6 bg-secondary/20 text-center">
                <Check className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold text-xl mb-2">Payment Successful</h3>
                <p className="mb-4">Your manuscript has been submitted for review.</p>
                <Card className="p-4 bg-background/50 text-left">
                  <h4 className="font-semibold mb-2">Manuscript Summary</h4>
                  <p><strong>Title:</strong> {formData.title}</p>
                  <p><strong>Type:</strong> {formData.manuscript_type}</p>
                  <p><strong>Subject:</strong> {formData.subject_area}</p>
                  <p><strong>Authors:</strong> {formData.authors.length}</p>
                </Card>
              </Card>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm">
                  You will receive an email confirmation shortly. The editorial team will review your submission and contact you within 7-10 business days.
                  all authors have approved the submission. An Article Processing Charge (APC) of
                  ₦50,000 will be required upon acceptance.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button 
              onClick={handleBack} 
              variant="outline" 
              disabled={currentStep === 1 || currentStep === 6 || currentStep === 7}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {currentStep < 6 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : currentStep === 7 ? (
              <Button onClick={() => navigate("/manuscripts")} className="bg-primary">
                Go to My Manuscripts
              </Button>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
};
