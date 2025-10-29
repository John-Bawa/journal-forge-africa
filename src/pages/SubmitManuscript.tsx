import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { MultiStepSubmission } from "@/components/submissions/MultiStepSubmission";

const SubmitManuscript = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <MultiStepSubmission />
      <Footer />
    </div>
  );
};

export default SubmitManuscript;
