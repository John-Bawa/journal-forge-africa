import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

export const SuccessAnimation = () => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center"
    >
      <Check className="w-10 h-10 text-white" />
    </motion.div>
  );
};

export const ErrorAnimation = () => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: [0, 1.2, 1] }}
      transition={{ duration: 0.3 }}
      className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <X className="w-10 h-10 text-white" />
      </motion.div>
    </motion.div>
  );
};
