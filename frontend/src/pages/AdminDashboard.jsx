import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { 
  LayoutDashboard, 
  Plus, 
  Store, 
  ArrowLeft, 
  Loader2, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Info,
  Lock,
  Unlock,
  LogOut,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/+$/, "");
const API = `${BACKEND_URL}/api`;

export const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState("list"); // "list" or "create"

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    industry: "",
    gmb_link: "",
    brand_color: "#4F46E5",
    accent_color: "#10B981",
    hero_image: "",
    key_features: [""]
  });

  useEffect(() => {
    const savedPassword = localStorage.getItem("admin_password");
    if (savedPassword) {
      verifyStoredPassword(savedPassword);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyStoredPassword = async (pwd) => {
    try {
      setLoginLoading(true);
      await axios.post(`${API}/login`, { password: pwd });
      setIsAuthenticated(true);
      setPassword(pwd);
      fetchClients(pwd);
    } catch (err) {
      localStorage.removeItem("admin_password");
      toast.error("Session expired. Please login again.");
    } finally {
      setLoginLoading(false);
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoginLoading(true);
      await axios.post(`${API}/login`, { password });
      localStorage.setItem("admin_password", password);
      setIsAuthenticated(true);
      fetchClients(password);
      toast.success("Login successful");
    } catch (err) {
      toast.error("Invalid admin password");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_password");
    setIsAuthenticated(false);
    setPassword("");
    setClients([]);
    toast.info("Logged out successfully");
  };

  const fetchClients = async (authPwd = password) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/clients`, {
        headers: { "X-Admin-Password": authPwd }
      });
      setClients(response.data);
    } catch (err) {
      console.error("Error fetching clients:", err);
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        toast.error("Failed to load businesses");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === "name") {
      const suggestedSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      setFormData(prev => ({ ...prev, slug: suggestedSlug }));
    }
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.key_features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, key_features: newFeatures }));
  };

  const addFeatureField = () => {
    setFormData(prev => ({ ...prev, key_features: [...prev.key_features, ""] }));
  };

  const removeFeatureField = (index) => {
    const newFeatures = formData.key_features.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, key_features: newFeatures.length ? newFeatures : [""] }));
  };

  const handleImageUpload = (file) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File is too large. Max 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, hero_image: reader.result }));
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const cleanedFeatures = formData.key_features.filter(f => f.trim() !== "");
      const submitData = { ...formData, key_features: cleanedFeatures };

      await axios.post(`${API}/clients`, submitData, {
        headers: { "X-Admin-Password": password }
      });
      toast.success("Business created successfully!");
      
      setFormData({
        name: "",
        slug: "",
        description: "",
        industry: "",
        gmb_link: "",
        brand_color: "#4F46E5",
        accent_color: "#10B981",
        hero_image: "",
        key_features: [""]
      });
      setView("list");
      fetchClients();
    } catch (err) {
      console.error("Error creating business:", err);
      toast.error(err.response?.data?.detail || "Failed to create business");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-none">
            <CardHeader className="text-center space-y-2">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-indigo-100">
                <Lock size={32} />
              </div>
              <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
              <CardDescription>Enter your administrator password to continue.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="py-6"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loginLoading}
                  className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 font-bold text-lg"
                >
                  {loginLoading ? <Loader2 className="animate-spin" /> : "Unlock Dashboard"}
                </Button>
                <div className="text-center">
                  <Link to="/" className="text-sm text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1">
                    <ArrowLeft size={14} /> Back to Portal
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-indigo-600 text-xl">
              <div className="bg-indigo-600 text-white p-1 rounded-lg">
                <Store size={20} />
              </div>
              ReviewGen <span className="text-slate-400 font-medium ml-1">Admin</span>
            </Link>
            <Badge variant="outline" className="text-indigo-500 bg-indigo-50 border-indigo-100 gap-1 hidden sm:flex">
              <ShieldCheck size={12} /> Secure Session
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleLogout} className="text-slate-600 hover:text-red-500 hover:bg-red-50 gap-2">
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {view === "list" ? "Business Management" : "Create New Business"}
            </h1>
            <p className="text-slate-500">
              {view === "list" 
                ? "Manage your partner businesses and view their performance." 
                : "Fill in the details below to add a new business to the portal."}
            </p>
          </div>
          
          {view === "list" ? (
            <Button onClick={() => setView("create")} className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-6">
              <Plus size={20} className="mr-2" />
              Add Business
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setView("list")} className="rounded-full">
              <ArrowLeft size={18} className="mr-2" />
              Back to List
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {view === "list" ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-slate-200 overflow-hidden shadow-sm">
                <CardHeader className="bg-white border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                       <LayoutDashboard size={18} className="text-indigo-500" />
                       All Businesses
                    </CardTitle>
                    <Badge variant="secondary" className="font-semibold px-3">
                      {clients.length} Total
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex items-center justify-center py-20 text-slate-400">
                      <Loader2 size={32} className="animate-spin mr-3" />
                      Loading businesses...
                    </div>
                  ) : clients.length === 0 ? (
                    <div className="text-center py-20 px-4">
                       <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                         <Store size={32} />
                       </div>
                       <h3 className="text-lg font-semibold text-slate-900 mb-1">No businesses yet</h3>
                       <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                         Start by adding your first business to enable QR-based review generation.
                       </p>
                       <Button onClick={() => setView("create")} variant="outline" className="rounded-full">
                          <Plus size={18} className="mr-2" />
                          Create your first business
                       </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-slate-50/50">
                          <TableRow>
                            <TableHead className="w-[300px]">Business</TableHead>
                            <TableHead>Industry</TableHead>
                            <TableHead>QR Slug</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clients.map((client) => (
                            <TableRow key={client.id} className="group hover:bg-slate-50/80 transition-colors">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                                    style={{ backgroundColor: client.brand_color }}
                                  >
                                    {client.name.charAt(0)}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-800 block">{client.name}</span>
                                    <span className="text-xs text-slate-500 block truncate max-w-[180px]">
                                      {client.description}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-white">{client.industry}</Badge>
                              </TableCell>
                              <TableCell>
                                <code className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600">
                                  /{client.slug}
                                </code>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-indigo-500">
                                    <Link to={`/${client.slug}`} target="_blank">
                                      <ExternalLink size={16} />
                                    </Link>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Info size={18} className="text-indigo-500" />
                        Basic Information
                      </CardTitle>
                      <CardDescription>Primary details about the business.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Business Name</Label>
                          <Input 
                            id="name" 
                            name="name" 
                            placeholder="e.g. Blue Bottle Coffee" 
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="slug">Unique Slug (URL)</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-sm">/</span>
                            <Input 
                              id="slug" 
                              name="slug" 
                              placeholder="blue-bottle" 
                              value={formData.slug}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Input 
                          id="industry" 
                          name="industry" 
                          placeholder="e.g. Hospitality / Food & Beverage" 
                          value={formData.industry}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Business Description</Label>
                        <Textarea 
                          id="description" 
                          name="description" 
                          placeholder="Tell us what this business does..." 
                          className="min-h-[100px]"
                          value={formData.description}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Feature Section */}
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Plus size={18} className="text-indigo-500" />
                        Key Features
                      </CardTitle>
                      <CardDescription>Distinct highlights (used for AI review generation).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {formData.key_features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <Input 
                            placeholder={`Feature #${index + 1}`} 
                            value={feature}
                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                            required
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-red-500"
                            onClick={() => removeFeatureField(index)}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={addFeatureField}
                      >
                        <Plus size={16} className="mr-2" />
                        Add Feature
                      </Button>
                    </CardContent>
                  </Card>

                  {/* External Links & Image Section */}
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ExternalLink size={18} className="text-indigo-500" />
                        External Links & Media
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="gmb_link">Google Maps Business URL</Label>
                        <Input 
                          id="gmb_link" 
                          name="gmb_link" 
                          placeholder="https://maps.google.com/..." 
                          value={formData.gmb_link}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Hero Image</Label>
                        <div 
                          className={`
                            relative border-2 border-dashed rounded-2xl transition-all duration-200 flex flex-col items-center justify-center p-6 min-h-[200px]
                            ${formData.hero_image 
                              ? "border-indigo-200 bg-indigo-50/30" 
                              : "border-slate-200 bg-slate-50/50 hover:border-indigo-400 hover:bg-slate-50"}
                          `}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file && file.type.startsWith('image/')) {
                              handleImageUpload(file);
                            } else {
                              toast.error("Please upload a valid image file");
                            }
                          }}
                        >
                          {formData.hero_image ? (
                            <div className="relative w-full h-[140px] rounded-xl overflow-hidden shadow-lg border-2 border-white group">
                              <img 
                                src={formData.hero_image} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button 
                                  type="button" 
                                  variant="destructive" 
                                  size="sm" 
                                  className="rounded-full"
                                  onClick={() => setFormData(prev => ({ ...prev, hero_image: "" }))}
                                >
                                  <Trash2 size={16} className="mr-2" />
                                  Remove Image
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center group pointer-events-none">
                              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <Plus size={24} className="text-indigo-500" />
                              </div>
                              <p className="text-indigo-600 font-bold text-sm mb-1">Click to upload photo</p>
                              <p className="text-slate-400 text-xs">PNG, JPG or WEBP (Max 2MB)</p>
                            </div>
                          )}
                          <input 
                            type="file" 
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) handleImageUpload(file);
                            }}
                            required={!formData.hero_image}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Brand Styling</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="brand_color">Brand Primary Color</Label>
                        <div className="flex gap-2">
                          <div 
                            className="w-10 h-10 rounded-lg border border-slate-200 shrink-0 shadow-sm"
                            style={{ backgroundColor: formData.brand_color }}
                          />
                          <Input 
                            id="brand_color" 
                            name="brand_color" 
                            type="text"
                            value={formData.brand_color}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accent_color">Accent Color</Label>
                        <div className="flex gap-2">
                          <div 
                            className="w-10 h-10 rounded-lg border border-slate-200 shrink-0 shadow-sm"
                            style={{ backgroundColor: formData.accent_color }}
                          />
                          <Input 
                            id="accent_color" 
                            name="accent_color" 
                            type="text"
                            value={formData.accent_color}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-indigo-600 text-white border-none shadow-xl shadow-indigo-100">
                    <CardHeader>
                      <CardTitle>Ready to Go?</CardTitle>
                      <CardDescription className="text-indigo-100">This will add the business to your portal immediately.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button 
                        type="submit" 
                        disabled={submitting} 
                        className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-6 text-lg"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Business"
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setView("list")}
                        className="w-full text-white hover:bg-indigo-700 hover:text-white"
                      >
                        Cancel
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-8 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
          <p>&copy; 2026 ReviewGen Admin Portal</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
