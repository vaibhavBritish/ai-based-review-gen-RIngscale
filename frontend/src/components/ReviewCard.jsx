import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Quote } from "lucide-react";
import { toast } from "sonner";

export const ReviewCard = ({ review, index, isSelected, onSelect, brandColor }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(review);
      setCopied(true);
      onSelect(review);
      toast.success("Review copied to clipboard!", {
        description: "Click 'Post Review' to continue to Google Maps",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy review");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      data-testid={`review-card-${index}`}
      className={`review-card relative bg-white border rounded-2xl p-6 md:p-8 cursor-pointer group h-full flex flex-col ${
        isSelected
          ? "border-2 shadow-xl"
          : "border-slate-100 shadow-sm hover:shadow-xl"
      }`}
      style={{
        borderColor: isSelected ? brandColor : undefined,
      }}
      onClick={handleCopy}
    >
      {/* Quote icon */}
      <div
        className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ color: brandColor }}
      >
        <Quote size={48} />
      </div>

      {/* Review text */}
      <p className="text-lg md:text-xl font-medium text-slate-800 leading-relaxed flex-1 relative z-10">
        "{review}"
      </p>

      {/* Copy indicator */}
      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-slate-400 font-medium">
          {isSelected ? "Selected" : "Click to copy"}
        </span>
        <motion.button
          data-testid={`copy-btn-${index}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            copied || isSelected
              ? "text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
          style={{
            backgroundColor: copied || isSelected ? brandColor : undefined,
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
        >
          {copied || isSelected ? (
            <>
              <Check size={16} />
              Copied
            </>
          ) : (
            <>
              <Copy size={16} />
              Copy
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ReviewCard;
