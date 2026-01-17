import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Clock, CheckCircle, XCircle, Loader2, ChevronDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useServiceWorkflow } from "@/hooks/useServiceWorkflow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import ServiceRequestForm from "./ServiceRequestForm";
import ServiceRequestTimeline from "./ServiceRequestTimeline";
import ServiceProcessTimeline from "./ServiceProcessTimeline";

const getStatusVariant = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-amber-500/20 text-amber-500 border-amber-500/30";
    case "in_progress":
    case "accepted":
      return "bg-blue-500/20 text-blue-500 border-blue-500/30";
    case "completed":
      return "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
    case "cancelled":
      return "bg-destructive/20 text-destructive border-destructive/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return Clock;
    case "in_progress":
    case "accepted":
      return Loader2;
    case "completed":
      return CheckCircle;
    case "cancelled":
      return XCircle;
    default:
      return Clock;
  }
};

export const ServiceRequestsView = () => {
  const { requests, isLoading } = useServiceWorkflow();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [expandedTimeline, setExpandedTimeline] = useState<string | null>(null);

  if (selectedRequestId) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setSelectedRequestId(null)}>
          ← Back to Requests
        </Button>
        <ServiceRequestTimeline requestId={selectedRequestId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl text-foreground">Service Requests</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage your concierge service requests
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-5 bg-muted rounded w-1/3 mb-2" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </Card>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-foreground mb-2">No Requests Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Submit your first concierge request to get started
          </p>
          <Button onClick={() => setIsFormOpen(true)} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Create Request
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request, index) => {
            const StatusIcon = getStatusIcon(request.status);
            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="hover:bg-muted/30 transition-colors"
                >
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => setSelectedRequestId(request.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-foreground truncate">
                            {request.title}
                          </h3>
                          <Badge variant="outline" className={getStatusVariant(request.status)}>
                            <StatusIcon className={`w-3 h-3 mr-1 ${request.status === "in_progress" ? "animate-spin" : ""}`} />
                            {request.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {request.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="capitalize">
                            {request.category?.replace(/_/g, " ")}
                          </span>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      
                      {/* Timeline toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedTimeline(expandedTimeline === request.id ? null : request.id);
                        }}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <motion.div
                          animate={{ rotate: expandedTimeline === request.id ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </motion.div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Expandable process timeline */}
                  {expandedTimeline === request.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 pb-6 border-t border-border/50"
                    >
                      <div className="pt-4">
                        <ServiceProcessTimeline 
                          currentStatus={request.status} 
                          showEstimates={true}
                        />
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* New Request Form Dialog */}
      <ServiceRequestForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  );
};

export default ServiceRequestsView;
