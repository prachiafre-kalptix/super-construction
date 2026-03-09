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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateSite } from "../../hooks/useQueries";

interface AddSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddSiteDialog({
  open,
  onOpenChange,
}: AddSiteDialogProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [clientName, setClientName] = useState("");
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  const createSite = useCreateSite();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !clientName.trim() || !startDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await createSite.mutateAsync({ name, location, clientName, startDate });
      toast.success("Site created successfully");
      onOpenChange(false);
      setName("");
      setLocation("");
      setClientName("");
      setStartDate(new Date().toISOString().split("T")[0]);
    } catch {
      toast.error("Failed to create site");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-[400px] bg-card border-border"
        data-ocid="add_site.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            New Construction Site
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="site-name"
              className="text-sm font-medium text-muted-foreground"
            >
              Site Name <span className="text-primary">*</span>
            </Label>
            <Input
              id="site-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Downtown Office Block"
              className="h-11 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
              data-ocid="add_site.name_input"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="site-location"
              className="text-sm font-medium text-muted-foreground"
            >
              Location <span className="text-primary">*</span>
            </Label>
            <Input
              id="site-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. 45 Market Street, Lagos"
              className="h-11 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
              data-ocid="add_site.location_input"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="client-name"
              className="text-sm font-medium text-muted-foreground"
            >
              Client Name <span className="text-primary">*</span>
            </Label>
            <Input
              id="client-name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Apex Properties Ltd"
              className="h-11 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
              data-ocid="add_site.client_input"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="start-date"
              className="text-sm font-medium text-muted-foreground"
            >
              Start Date <span className="text-primary">*</span>
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-11 bg-secondary/50 border-border text-foreground"
              data-ocid="add_site.start_date_input"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">
              Status
            </Label>
            <Select defaultValue="Running">
              <SelectTrigger
                className="h-11 bg-secondary/50 border-border text-foreground"
                data-ocid="add_site.status_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="Running">Running</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 border-border text-foreground"
              data-ocid="add_site.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createSite.isPending}
              className="flex-1 h-11 bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-amber"
              data-ocid="add_site.submit_button"
            >
              {createSite.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Site"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
