import { motion } from "framer-motion";

export const ReviewSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 h-64"
          data-testid={`skeleton-${index}`}
        >
          {/* Quote placeholder */}
          <div className="skeleton-shimmer w-12 h-12 rounded-lg mb-6 opacity-50" />
          
          {/* Text lines */}
          <div className="space-y-3">
            <div className="skeleton-shimmer h-4 rounded-full w-full" />
            <div className="skeleton-shimmer h-4 rounded-full w-11/12" />
            <div className="skeleton-shimmer h-4 rounded-full w-4/5" />
            <div className="skeleton-shimmer h-4 rounded-full w-3/4" />
          </div>

          {/* Bottom section */}
          <div className="mt-8 flex items-center justify-between">
            <div className="skeleton-shimmer h-4 rounded-full w-24" />
            <div className="skeleton-shimmer h-10 rounded-full w-20" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ReviewSkeleton;
