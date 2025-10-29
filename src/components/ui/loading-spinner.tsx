import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export const LoadingSpinner = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center p-8"
    >
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </motion.div>
  );
};

export const LoadingSkeleton = () => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
      <div className="h-4 bg-muted rounded w-5/6"></div>
    </div>
  );
};
