import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  ClipboardList,
  ImageIcon,
  Pencil,
  Plus,
  StickyNote,
  Trash2,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { DailyReport } from "../../backend.d";
import {
  useDailyReports,
  useDeleteDailyReport,
  useReportPhoto,
} from "../../hooks/useQueries";
import AddReportDialog from "./AddReportDialog";
import EditReportDialog from "./EditReportDialog";

interface ReportCardProps {
  report: DailyReport;
  index: number;
  siteId: bigint;
}

function ReportPhotoThumb({ reportId }: { reportId: bigint }) {
  const { data: photoUrl } = useReportPhoto(reportId, true);
  if (!photoUrl) return null;
  return (
    <div className="mt-2 rounded-lg overflow-hidden border border-border h-24">
      <img
        src={photoUrl}
        alt="Site progress documentation"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function ReportCard({ report, index, siteId }: ReportCardProps) {
  const hasPhoto = !!report.photo;
  const ocidIndex = index + 1;
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteReport = useDeleteDailyReport();

  const handleDelete = async () => {
    try {
      await deleteReport.mutateAsync({ id: report.id, siteId });
      toast.success("Report deleted");
      setDeleteOpen(false);
    } catch {
      toast.error("Failed to delete report");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        className="bg-card border border-border rounded-xl p-4 shadow-card"
        data-ocid={`report.item.${ocidIndex}`}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CalendarDays className="h-4 w-4 text-primary shrink-0" />
            <span className="font-display font-semibold text-sm text-foreground truncate">
              {new Date(report.date).toLocaleDateString("en-GB", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Action buttons + labour badge */}
          <div className="flex items-center gap-1 shrink-0">
            <Badge
              variant="outline"
              className="bg-primary/10 border-primary/25 text-primary text-xs h-6 flex items-center gap-1 mr-1"
            >
              <Users className="h-3 w-3" />
              {report.labourCount.toString()}
            </Badge>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Edit report"
              data-ocid={`report.edit_button.${ocidIndex}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Delete report"
              data-ocid={`report.delete_button.${ocidIndex}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
              <ClipboardList className="h-3 w-3" /> Work Done
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {report.workDone}
            </p>
          </div>

          {report.notes && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                <StickyNote className="h-3 w-3" /> Notes
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.notes}
              </p>
            </div>
          )}

          {hasPhoto && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                <ImageIcon className="h-3 w-3" /> Photo
              </p>
              <ReportPhotoThumb reportId={report.id} />
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Dialog */}
      <EditReportDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        report={report}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent
          className="bg-card border-border max-w-[340px]"
          data-ocid="report.delete.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-foreground">
              Delete Report?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              This will permanently remove the report for{" "}
              <span className="text-foreground font-medium">
                {new Date(report.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              className="flex-1 h-10 border-border text-foreground bg-transparent hover:bg-accent"
              data-ocid="report.delete.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteReport.isPending}
              className="flex-1 h-10 bg-destructive text-destructive-foreground hover:opacity-90 font-semibold"
              data-ocid="report.delete.confirm_button"
            >
              {deleteReport.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface DailyReportsListProps {
  siteId: bigint;
}

export default function DailyReportsList({ siteId }: DailyReportsListProps) {
  const [addReportOpen, setAddReportOpen] = useState(false);
  const { data: reports = [], isLoading } = useDailyReports(siteId);

  // Sort newest first
  const sorted = [...reports].sort((a, b) => (b.date > a.date ? 1 : -1));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {sorted.length} Report{sorted.length !== 1 ? "s" : ""}
        </p>
        <Button
          size="sm"
          onClick={() => setAddReportOpen(true)}
          className="h-8 px-3 bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90"
          data-ocid="add_report.open_modal_button"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Report
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="report.loading_state">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl bg-muted" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
            data-ocid="report.empty_state"
          >
            <div className="h-14 w-14 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
              <ClipboardList className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              No Reports Yet
            </p>
            <p className="text-xs text-muted-foreground">
              Add your first daily report to track site progress.
            </p>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="space-y-3">
          {sorted.map((report, index) => (
            <ReportCard
              key={report.id.toString()}
              report={report}
              index={index}
              siteId={siteId}
            />
          ))}
        </div>
      )}

      <AddReportDialog
        open={addReportOpen}
        onOpenChange={setAddReportOpen}
        siteId={siteId}
      />
    </div>
  );
}
