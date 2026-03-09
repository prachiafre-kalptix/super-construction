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
import { Camera, ImageIcon, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAddDailyReport } from "../../hooks/useQueries";

interface AddReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: bigint;
}

export default function AddReportDialog({
  open,
  onOpenChange,
  siteId,
}: AddReportDialogProps) {
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [workDone, setWorkDone] = useState("");
  const [labourCount, setLabourCount] = useState("");
  const [notes, setNotes] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addReport = useAddDailyReport();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    onOpenChange(false);
    setDate(new Date().toISOString().split("T")[0]);
    setWorkDone("");
    setLabourCount("");
    setNotes("");
    clearPhoto();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !workDone.trim() || !labourCount) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await addReport.mutateAsync({
        siteId,
        date,
        workDone,
        labourCount: Number.parseInt(labourCount, 10),
        notes,
        photoFile,
      });
      toast.success("Daily report added");
      handleClose();
    } catch {
      toast.error("Failed to add report");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="w-full max-w-[400px] bg-card border-border max-h-[90dvh] overflow-y-auto"
        data-ocid="add_report.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            Add Daily Report
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
              data-ocid="add_report.date_input"
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
              placeholder="Describe the work completed today..."
              className="min-h-[90px] bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground resize-none"
              data-ocid="add_report.work_done_textarea"
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
              data-ocid="add_report.labour_input"
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
              data-ocid="add_report.notes_textarea"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">
              Photo (optional)
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              className="hidden"
            />
            {photoPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-36 object-cover"
                />
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center"
                >
                  <X className="h-4 w-4 text-foreground" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-11 border-dashed border-border text-muted-foreground hover:text-foreground"
                data-ocid="add_report.photo_upload_button"
              >
                <Camera className="mr-2 h-4 w-4" />
                Attach Photo
              </Button>
            )}
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-11 border-border text-foreground"
              data-ocid="add_report.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addReport.isPending}
              className="flex-1 h-11 bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-amber"
              data-ocid="add_report.submit_button"
            >
              {addReport.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Report"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Export photo icon for use in report cards
export { ImageIcon };
