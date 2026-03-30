import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, MousePointerClick } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

export const ActionBar = ({ selectedReview, gmbLink, brandColor }) => {
  const handlePostReview = () => {
    if (!selectedReview) {
      toast.info("Please select a review first", {
        description: "Click on any review card above to copy it"
      });
      return;
    }
    // Copy review to clipboard again for safety
    navigator.clipboard.writeText(selectedReview);
    toast.success("Review copied! Paste it on Google", {
      description: "Press Ctrl+V (or Cmd+V on Mac) to paste"
    });
    // Open GMB link in new tab
    window.open(gmbLink, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.5 }}
      className="fixed bottom-0 left-0 right-0 z-50 glass-bar bg-white/95 border-t border-slate-200 p-4 md:p-6 shadow-2xl"
      data-testid="action-bar"
    >
      <div className="container mx-auto px-4 max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status indicator */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div 
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: selectedReview ? `${brandColor}15` : '#f1f5f9' }}
          >
            {selectedReview ? (
              <CheckCircle2 size={20} style={{ color: brandColor }} />
            ) : (
              <MousePointerClick size={20} className="text-slate-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            {selectedReview ? (
              <>
                <p className="text-sm font-semibold text-slate-800">Review Ready to Post</p>
                <p className="text-sm text-slate-500 truncate max-w-md">
                  "{selectedReview.substring(0, 60)}..."
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-800">Select a Review</p>
                <p className="text-sm text-slate-500">Click any review card above to copy it</p>
              </>
            )}
          </div>
        </div>

        {/* Post button - always visible */}
        <Button
          data-testid="post-review-btn"
          onClick={handlePostReview}
          className={`rounded-full px-8 py-6 text-lg font-bold shadow-lg transition-all hover:shadow-xl ${
            !selectedReview ? 'opacity-70' : ''
          }`}
          style={{ 
            backgroundColor: brandColor,
            boxShadow: selectedReview ? `0 10px 40px ${brandColor}40` : 'none'
          }}
        >
          Post Review on Google
          <ArrowRight size={20} className="ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};

export default ActionBar;
