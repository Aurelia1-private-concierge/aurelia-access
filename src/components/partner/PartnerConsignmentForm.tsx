import { useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  X,
  ImagePlus,
  FileText,
  CheckCircle,
  Loader2,
  DollarSign,
  Package,
  Shield,
  Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConsignmentFormData {
  title: string;
  description: string;
  category_id: string;
  estimated_value_min: string;
  estimated_value_max: string;
  reserve_price_request: string;
  provenance: string;
  condition_report: string;
}

interface PartnerConsignmentFormProps {
  partnerId: string;
  onSuccess?: () => void;
}

const CATEGORIES = [
  { id: "watches-jewelry", name: "Watches & Jewelry", icon: "⌚" },
  { id: "art-collectibles", name: "Art & Collectibles", icon: "🎨" },
  { id: "vehicles", name: "Vehicles & Automobiles", icon: "🚗" },
  { id: "real-estate", name: "Real Estate", icon: "🏠" },
  { id: "yachts-aviation", name: "Yachts & Aviation", icon: "✈️" },
  { id: "wine-spirits", name: "Wine & Spirits", icon: "🍷" },
  { id: "fashion", name: "Fashion & Accessories", icon: "👜" },
  { id: "other", name: "Other Luxury Items", icon: "💎" },
];

export const PartnerConsignmentForm = ({ partnerId, onSuccess }: PartnerConsignmentFormProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ConsignmentFormData>({
    title: "",
    description: "",
    category_id: "",
    estimated_value_min: "",
    estimated_value_max: "",
    reserve_price_request: "",
    provenance: "",
    condition_report: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [step, setStep] = useState(1);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ...validFiles].slice(0, 10));
    
    // Generate previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target?.result as string].slice(0, 10));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 25MB limit`);
        return false;
      }
      return true;
    });

    setDocuments(prev => [...prev, ...validFiles].slice(0, 5));
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: File[], bucket: string, path: string): Promise<string[]> => {
    const urls: string[] = [];
    
    for (const file of files) {
      const fileName = `${path}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { error } = await supabase.storage.from(bucket).upload(fileName, file);
      
      if (error) {
        console.error("Upload error:", error);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
      urls.push(publicUrl);
    }

    return urls;
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.category_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setSubmitting(true);

    try {
      // Upload images
      const imageUrls = await uploadFiles(images, "consignments", `${partnerId}/images`);
      
      // Upload documents
      const documentUrls = await uploadFiles(documents, "consignments", `${partnerId}/documents`);

      // Create consignment record
      const { error } = await supabase.from("auction_consignments").insert({
        submitter_id: partnerId,
        submitter_type: "partner",
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id,
        estimated_value_min: formData.estimated_value_min ? parseFloat(formData.estimated_value_min) : null,
        estimated_value_max: formData.estimated_value_max ? parseFloat(formData.estimated_value_max) : null,
        reserve_price_request: formData.reserve_price_request ? parseFloat(formData.reserve_price_request) : null,
        provenance: formData.provenance || null,
        condition_report: formData.condition_report || null,
        images: imageUrls,
        authenticity_documents: documentUrls,
        status: "pending",
      });

      if (error) throw error;

      setShowSuccess(true);
      toast.success("Consignment submitted for review");
      
      // Reset form after delay
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          title: "",
          description: "",
          category_id: "",
          estimated_value_min: "",
          estimated_value_max: "",
          reserve_price_request: "",
          provenance: "",
          condition_report: "",
        });
        setImages([]);
        setDocuments([]);
        setImagePreview([]);
        setStep(1);
        onSuccess?.();
      }, 2000);
    } catch (error: any) {
      console.error("Consignment submission error:", error);
      toast.error(error.message || "Failed to submit consignment");
    } finally {
      setSubmitting(false);
    }
  };

  const isStep1Valid = formData.title && formData.description && formData.category_id;
  const isStep2Valid = images.length > 0;

  return (
    <>
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Submit Item for Auction
          </CardTitle>
          <CardDescription>
            Consign luxury items to our exclusive auction platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[
              { num: 1, label: "Item Details" },
              { num: 2, label: "Images & Docs" },
              { num: 3, label: "Review" },
            ].map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-2 ${step >= s.num ? "text-primary" : "text-muted-foreground"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s.num ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {step > s.num ? <CheckCircle className="w-4 h-4" /> : s.num}
                </div>
                <span className="text-sm hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Step 1: Item Details */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="title">Item Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Patek Philippe Nautilus 5711/1A"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of the item including specifications, features, and any notable characteristics..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value_min">Estimated Value (Min)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="value_min"
                      type="number"
                      placeholder="10,000"
                      className="pl-10"
                      value={formData.estimated_value_min}
                      onChange={(e) => setFormData({ ...formData, estimated_value_min: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value_max">Estimated Value (Max)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="value_max"
                      type="number"
                      placeholder="15,000"
                      className="pl-10"
                      value={formData.estimated_value_max}
                      onChange={(e) => setFormData({ ...formData, estimated_value_max: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reserve">Reserve Price Request</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="reserve"
                    type="number"
                    placeholder="Minimum acceptable price"
                    className="pl-10"
                    value={formData.reserve_price_request}
                    onChange={(e) => setFormData({ ...formData, reserve_price_request: e.target.value })}
                  />
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Final reserve is subject to Aurelia approval
                </p>
              </div>

              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
              >
                Continue to Images
              </Button>
            </motion.div>
          )}

          {/* Step 2: Images & Documents */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Image Upload */}
              <div className="space-y-4">
                <Label>Item Images * (up to 10)</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <ImagePlus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 10MB each
                    </p>
                  </label>
                </div>

                {imagePreview.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {imagePreview.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                        <img src={src} alt={`Consignment image ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Document Upload */}
              <div className="space-y-4">
                <Label>Authenticity Documents (optional)</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="doc-upload"
                  />
                  <label htmlFor="doc-upload" className="cursor-pointer">
                    <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Upload certificates, appraisals, receipts
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOC, Images up to 25MB each
                    </p>
                  </label>
                </div>

                {documents.length > 0 && (
                  <div className="space-y-2">
                    {documents.map((doc, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm truncate max-w-[200px]">{doc.name}</span>
                        </div>
                        <button onClick={() => removeDocument(i)}>
                          <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Provenance */}
              <div className="space-y-2">
                <Label htmlFor="provenance">Provenance (optional)</Label>
                <Textarea
                  id="provenance"
                  placeholder="Ownership history, acquisition details, exhibition history..."
                  rows={3}
                  value={formData.provenance}
                  onChange={(e) => setFormData({ ...formData, provenance: e.target.value })}
                />
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <Label htmlFor="condition">Condition Report (optional)</Label>
                <Textarea
                  id="condition"
                  placeholder="Current condition, any wear, repairs, or restorations..."
                  rows={3}
                  value={formData.condition_report}
                  onChange={(e) => setFormData({ ...formData, condition_report: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)} disabled={!isStep2Valid}>
                  Review Submission
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-muted/50 rounded-xl p-6 space-y-4">
                <h3 className="font-medium text-foreground">Review Your Submission</h3>
                
                <div className="grid gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Title</p>
                    <p className="font-medium">{formData.title}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p>{CATEGORIES.find(c => c.id === formData.category_id)?.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm">{formData.description}</p>
                  </div>
                  
                  {(formData.estimated_value_min || formData.estimated_value_max) && (
                    <div>
                      <p className="text-xs text-muted-foreground">Estimated Value</p>
                      <p>
                        ${parseInt(formData.estimated_value_min || "0").toLocaleString()} - 
                        ${parseInt(formData.estimated_value_max || "0").toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Images</p>
                    <p>{images.length} image(s) uploaded</p>
                  </div>
                  
                  {documents.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Documents</p>
                      <p>{documents.length} document(s) attached</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <p className="text-sm text-foreground">
                  <strong>What happens next:</strong> Our specialists will review your submission 
                  within 48 hours. If approved, we'll contact you to finalize auction details 
                  including final reserve price and timing.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Submit for Review
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              Consignment Submitted
            </DialogTitle>
            <DialogDescription>
              Your item has been submitted for review. Our specialists will evaluate it
              and contact you within 48 hours.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PartnerConsignmentForm;
