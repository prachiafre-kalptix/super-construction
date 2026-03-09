import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { DailyReport } from "../../backend.d";
import { useUpdateDailyReport } from "../../hooks/useQueries";

interface EditReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: DailyReport;
}

export default function EditReportDialog({
  open,
  onOpenChange,
  report,
}: EditReportDialogProps) {
  const [date, setDate] = useState(report.date);
  const [workDone, setWorkDone] = useState(report.workDone);
  const [labourCount, setLabourCount] = useState(report.labourCount.toString());
  const [notes, setNotes] = useState(report.notes);

  // Sync fields when report changes or dialog opens
  useEffect(() => {
    if (open) {
      setDate(report.date);
      setWorkDone(report.workDone);
      setLabourCount(report.labourCount.toString());
      setNotes(report.notes);
    }
  }, [open, report]);

  const updateReport = useUpdateDailyReport();

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !workDone.trim() || !labourCount) {
      toast.error("Please fill in all required fields");
      return;
    }
    const labourNum = Number.parseInt(labourCount, 10);
    if (Number.isNaN(labourNum) || labourNum < 0) {
      toast.error("Please enter a valid labour count");
      return;
    }
    try {
      await updateReport.mutateAsync({
        id: report.id,
        siteId: report.siteId,
        date,
        workDone,
        labourCount: labourNum,
        notes,
      });
      toast.success("Report updated");
      handleClose();
    } catch {
      toast.error("Failed to update report");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="w-full max-w-[400px] bg-card border-border max-h-[90dvh] overflow-y-auto"
        data-ocid="edit_report.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            Edit Daily Report
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">
              Date <span className="text-primary">*</span>
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 bg-secondary/50 border-border text-foreground"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">
              Work Done <span className="text-primary">*</span>
            </Label>
            <Textarea
              value={workDone}
              onChange={(e) => setWorkDone(e.target.value)}
              placeholder="Describe the work completed..."
              className="min-h-[90px] bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground resize-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">
              Labour Count <span className="text-primary">*</span>
            </Label>
            <Input
              type="number"
              min="0"
              value={labourCount}
              onChange={(e) => setLabourCount(e.target.value)}
              placeholder="Number of workers"
              className="h-11 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">
              Notes
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="min-h-[70px] bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>

          {report.photo && (
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
              <p className="text-xs text-muted-foreground">
                📷 Photo is preserved — photo editing is not supported here.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-11 border-border text-foreground"
              data-ocid="edit_report.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateReport.isPending}
              className="flex-1 h-11 bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-amber"
              data-ocid="edit_report.submit_button"
            >
              {updateReport.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
