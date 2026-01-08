import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FolderLock, 
  FileText, 
  Download, 
  Eye, 
  Shield, 
  Clock,
  Search,
  Filter,
  Upload,
  MoreVertical,
  FileImage,
  FileSpreadsheet,
  Lock,
  CheckCircle2
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: "pdf" | "image" | "spreadsheet" | "document";
  category: string;
  size: string;
  uploadedAt: string;
  secured: boolean;
}

const documents: Document[] = [
  { id: "1", name: "Monaco Property Agreement.pdf", type: "pdf", category: "Real Estate", size: "2.4 MB", uploadedAt: "Jan 8, 2026", secured: true },
  { id: "2", name: "Patek Philippe Certificate.pdf", type: "pdf", category: "Collectibles", size: "856 KB", uploadedAt: "Jan 7, 2026", secured: true },
  { id: "3", name: "Q4 2025 Portfolio Report.xlsx", type: "spreadsheet", category: "Financial", size: "1.2 MB", uploadedAt: "Jan 5, 2026", secured: true },
  { id: "4", name: "Art Collection Valuation.pdf", type: "pdf", category: "Art & Collectibles", size: "5.8 MB", uploadedAt: "Jan 3, 2026", secured: true },
  { id: "5", name: "Private Jet Insurance.pdf", type: "pdf", category: "Aviation", size: "1.1 MB", uploadedAt: "Dec 28, 2025", secured: true },
  { id: "6", name: "Trust Documentation.pdf", type: "pdf", category: "Legal", size: "3.2 MB", uploadedAt: "Dec 20, 2025", secured: true },
];

const categories = ["All Documents", "Financial", "Real Estate", "Legal", "Art & Collectibles", "Aviation"];

const getFileIcon = (type: Document["type"]) => {
  switch (type) {
    case "pdf":
      return FileText;
    case "image":
      return FileImage;
    case "spreadsheet":
      return FileSpreadsheet;
    default:
      return FileText;
  }
};

const DocumentVault = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Documents");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory = selectedCategory === "All Documents" || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Shield className="w-4 h-4" />
            <span className="text-xs tracking-wider uppercase font-medium">256-bit AES Encryption</span>
          </div>
          <p className="text-sm text-muted-foreground">
            All documents are encrypted at rest and in transit. Access requires biometric verification.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-card/50 border border-border/30 rounded-lg">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none flex-1"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-xs whitespace-nowrap rounded-lg transition-colors ${
                selectedCategory === category
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc, index) => {
          const FileIcon = getFileIcon(doc.type);
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group p-5 bg-card/50 border border-border/30 backdrop-blur-sm rounded-lg hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <FileIcon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex items-center gap-1">
                  {doc.secured && (
                    <div className="p-1.5 rounded bg-emerald-500/10">
                      <Lock className="w-3 h-3 text-emerald-500" />
                    </div>
                  )}
                  <button className="p-1.5 rounded hover:bg-muted/50 transition-colors opacity-0 group-hover:opacity-100">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-medium text-foreground mb-1 truncate" title={doc.name}>
                {doc.name}
              </h4>
              <p className="text-xs text-primary mb-3">{doc.category}</p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{doc.size}</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{doc.uploadedAt}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                  View
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Storage Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 bg-card/50 border border-border/30 backdrop-blur-sm rounded-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FolderLock className="w-5 h-5 text-primary" />
            <h3 className="font-serif text-lg text-foreground">Vault Storage</h3>
          </div>
          <div className="flex items-center gap-2 text-emerald-500">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs tracking-wider uppercase">Secure</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Storage Used</span>
            <span className="text-foreground">14.5 GB of 100 GB</span>
          </div>
          <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "14.5%" }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            85.5 GB available • Unlimited document retention
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default DocumentVault;
