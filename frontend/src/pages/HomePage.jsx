import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Star, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/+$/, "");
const API = `${BACKEND_URL}/api`;

export const HomePage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // First, seed the clients
        await axios.post(`${API}/seed-clients`);
        // Then fetch all clients
        const response = await axios.get(`${API}/clients`);
        setClients(response.data);
      } catch (err) {
        console.error("Error fetching clients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50" data-testid="home-page">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28 lg:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-teal-50" />
        
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full mb-6 font-semibold text-sm">
              <Sparkles size={16} />
              AI-Powered Review Suggestions
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
              Review<span className="text-indigo-600">Gen</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed mb-8">
              Generate personalized, authentic review suggestions for your customers. 
              Help them share their positive experiences on Google Maps with just a few clicks.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              Our Partner Businesses
            </h2>
            <p className="text-lg text-slate-600">
              Select a business to generate review suggestions for their customers
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={40} className="animate-spin text-indigo-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8" data-testid="clients-grid">
              {clients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  data-testid={`client-card-${client.slug}`}
                >
                  <Link to={`/${client.slug}`} className="block group">
                    <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-100">
                      {/* Image */}
                      <div className="h-48 md:h-56 overflow-hidden">
                        <img
                          src={client.hero_image}
                          alt={client.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div 
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(to top, ${client.brand_color}cc 0%, transparent 60%)`
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="p-6 md:p-8">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                              {client.name}
                            </h3>
                            <p className="text-slate-500 text-sm font-medium mb-3">
                              {client.industry}
                            </p>
                            <p className="text-slate-600 line-clamp-2">
                              {client.description}
                            </p>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {client.key_features.slice(0, 3).map((feature, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 text-xs font-medium rounded-full"
                              style={{
                                backgroundColor: `${client.brand_color}10`,
                                color: client.brand_color
                              }}
                            >
                              {feature}
                            </span>
                          ))}
                        </div>

                        {/* CTA */}
                        <div className="mt-6 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={16} fill="currentColor" />
                            ))}
                          </div>
                          <Button
                            variant="ghost"
                            className="rounded-full font-semibold group-hover:bg-slate-100"
                            style={{ color: client.brand_color }}
                          >
                            Generate Reviews
                            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && clients.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-500 text-lg">No businesses configured yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>ReviewGen - AI-Powered Review Suggestions</p>
          <div className="mt-4">
            <Link to="/admin" className="text-slate-300 hover:text-indigo-400 font-medium transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
