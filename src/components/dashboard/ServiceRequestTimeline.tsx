import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  UserCheck,
  FileText,
  XCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useServiceWorkflow } from "@/hooks/useServiceWorkflow";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ServiceRequestTimelineProps {
  requestId: string;
}

const getUpdateIcon = (updateType: string) => {
  switch (updateType) {
    case "status_change":
      return Clock;
    case "assignment":
      return UserCheck;
    case "message":
      return MessageSquare;
    case "document":
      return FileText;
    case "completion":
      return CheckCircle;
    case "cancellation":
      return XCircle;
    default:
      return Sparkles;
  }
};

const getUpdateColor = (updateType: string, newStatus?: string | null) => {
  if (newStatus === "completed") return "text-emerald-500 bg-emerald-500/10";
  if (newStatus === "cancelled") return "text-destructive bg-destructive/10";
  if (updateType === "assignment") return "text-primary bg-primary/10";
  if (updateType === "message") return "text-blue-500 bg-blue-500/10";
  return "text-muted-foreground bg-muted/50";
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, { color: string; label: string }> = {
    pending: { color: "bg-amber-500/20 text-amber-500 border-amber-500/30", label: "Pending Review" },
    in_progress: { color: "bg-blue-500/20 text-blue-500 border-blue-500/30", label: "In Progress" },
    assigned: { color: "bg-primary/20 text-primary border-primary/30", label: "Assigned" },
    awaiting_confirmation: { color: "bg-purple-500/20 text-purple-500 border-purple-500/30", label: "Awaiting Confirmation" },
    completed: { color: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30", label: "Completed" },
    cancelled: { color: "bg-destructive/20 text-destructive border-destructive/30", label: "Cancelled" },
  };

  const variant = variants[status] || variants.pending;
  return (
    <Badge variant="outline" className={variant.color}>
      {variant.label}
    </Badge>
  );
};

export const ServiceRequestTimeline = ({
  requestId,
}: ServiceRequestTimelineProps) => {
  const { updates, currentRequest, isLoading, fetchUpdates } =
    useServiceWorkflow(requestId);

  useEffect(() => {
    if (requestId) {
      fetchUpdates(requestId);
    }
  }, [requestId, fetchUpdates]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!currentRequest) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Request not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Request Header */}
      <div className="bg-card/50 rounded-xl border border-border p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-medium text-foreground">{currentRequest.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 capitalize">
              {currentRequest.category?.replace(/_/g, " ")} •{" "}
              {currentRequest.priority} Priority
            </p>
          </div>
          {getStatusBadge(currentRequest.status)}
        </div>
        {currentRequest.deadline && (
          <p className="text-xs text-muted-foreground mt-3">
            Deadline: {format(new Date(currentRequest.deadline), "PPP")}
          </p>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-6">
          {updates.length === 0 ? (
            <div className="ml-14 text-muted-foreground text-sm">
              No updates yet. Your request is being reviewed.
            </div>
          ) : (
            updates.map((update, index) => {
              const Icon = getUpdateIcon(update.update_type);
              const colorClass = getUpdateColor(update.update_type, update.new_status);

              return (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex gap-4"
                >
                  {/* Icon */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm text-foreground">
                        {update.title}
                      </h4>
                      {update.new_status && (
                        <span className="text-xs text-muted-foreground">
                          → {update.new_status.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                    {update.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {update.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(update.created_at), {
                        addSuffix: true,
                      })}
                      {update.updated_by_role && (
                        <span className="capitalize">
                          {" "}
                          • by {update.updated_by_role}
                        </span>
                      )}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestTimeline;
