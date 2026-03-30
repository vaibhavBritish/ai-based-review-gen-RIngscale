import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { HeroSection } from "../components/HeroSection";
import { ReviewCard } from "../components/ReviewCard";
import { ActionBar } from "../components/ActionBar";
import { ReviewSkeleton } from "../components/ReviewSkeleton";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/+$/, "");
const API = `${BACKEND_URL}/api`;

export const ClientLandingPage = () => {
  const { clientSlug } = useParams();
  const [client, setClient] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingReviews, setGeneratingReviews] = useState(false);
  const [error, setError] = useState(null);
  const [reviewCount, setReviewCount] = useState(5);

  // Fetch client data
  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API}/clients/${clientSlug}`);
        setClient(response.data);
        // Auto-generate reviews on load
        generateReviews(response.data.slug);
      } catch (err) {
        console.error("Error fetching client:", err);
        if (err.response?.status === 404) {
          setError("Business not found. Please check the URL.");
        } else {
          setError("Failed to load business information.");
        }
        setLoading(false);
      }
    };

    if (clientSlug) {
      fetchClient();
    }
  }, [clientSlug]);

  // Generate reviews
  const generateReviews = async (slug) => {
    try {
      setGeneratingReviews(true);
      const response = await axios.post(`${API}/generate-reviews`, {
        client_slug: slug || clientSlug,
        count: reviewCount,
      });
      setReviews(response.data.reviews);
      setSelectedReview(null);
      toast.success(`Generated ${response.data.reviews.length} review suggestions!`);
    } catch (err) {
      console.error("Error generating reviews:", err);
      toast.error("Failed to generate reviews. Please try again.");
    } finally {
      setGeneratingReviews(false);
      setLoading(false);
    }
  };

  const handleSelectReview = (review) => {
    setSelectedReview(review);
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
          data-testid="error-state"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Oops!</h1>
          <p className="text-slate-600">{error}</p>
        </motion.div>
      </div>
    );
  }

  // Loading state (initial)
  if (loading && !client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
          data-testid="loading-state"
        >
          <Loader2 size={48} className="animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading business information...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32" data-testid="client-landing-page">
      {/* Hero Section */}
      <HeroSection client={client} reviewCount={reviews.length} />

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-12 md:py-16">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10"
        >
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
              Choose Your Review
            </h2>
            <p className="text-slate-500">
              Click any review to copy it, then post it on Google Maps
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Review count slider */}
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-200">
              <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
                Reviews: {reviewCount}
              </span>
              <Slider
                data-testid="review-count-slider"
                value={[reviewCount]}
                onValueChange={(value) => setReviewCount(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-24"
              />
            </div>

            {/* Regenerate button */}
            <Button
              data-testid="regenerate-btn"
              onClick={() => generateReviews()}
              disabled={generatingReviews}
              variant="outline"
              className="rounded-full px-6 py-5 font-semibold border-2"
              style={{ 
                borderColor: client?.brand_color,
                color: client?.brand_color
              }}
            >
              {generatingReviews ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw size={18} className="mr-2" />
                  New Suggestions
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Reviews Grid */}
        {generatingReviews ? (
          <ReviewSkeleton count={reviewCount} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            data-testid="reviews-grid"
          >
            {reviews.map((review, index) => (
              <ReviewCard
                key={index}
                review={review}
                index={index}
                isSelected={selectedReview === review}
                onSelect={handleSelectReview}
                brandColor={client?.brand_color || "#4F46E5"}
              />
            ))}
          </motion.div>
        )}

        {/* Empty state */}
        {!generatingReviews && reviews.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
            data-testid="empty-state"
          >
            <p className="text-slate-500 text-lg">
              No reviews generated yet. Click "New Suggestions" to get started.
            </p>
          </motion.div>
        )}
      </main>

      {/* Action Bar - Always visible */}
      {client && (
        <ActionBar
          selectedReview={selectedReview}
          gmbLink={client?.gmb_link}
          brandColor={client?.brand_color || "#4F46E5"}
        />
      )}
    </div>
  );
};

export default ClientLandingPage;
