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
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddTransaction } from "../../hooks/useQueries";

const CATEGORIES = [
  "Labour",
  "Material",
  "Transport",
  "Equipment",
  "Client Payment",
  "Other",
];

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteId: bigint;
}

export default function AddTransactionDialog({
  open,
  onOpenChange,
  siteId,
}: AddTransactionDialogProps) {
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [txType, setTxType] = useState("Income");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const addTransaction = useAddTransaction();

  const handleClose = () => {
    onOpenChange(false);
    setDate(new Date().toISOString().split("T")[0]);
    setTxType("Income");
    setCategory("");
    setAmount("");
    setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !category || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    const amountNum = Number.parseFloat(amount);
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      await addTransaction.mutateAsync({
        siteId,
        date,
        txType,
        category,
        amount: amountNum,
        notes,
      });
      toast.success(`${txType} transaction added`);
      handleClose();
    } catch {
      toast.error("Failed to add transaction");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="w-full max-w-[400px] bg-card border-border"
        data-ocid="add_transaction.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            Add Transaction
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">
              Type <span className="text-primary">*</span>
            </Label>
            <ToggleGroup
              type="single"
              value={txType}
              onValueChange={(val) => val && setTxType(val)}
              className="grid grid-cols-2 gap-2"
              data-ocid="add_transaction.type_toggle"
            >
              <ToggleGroupItem
                value="Income"
                className={`h-11 text-sm font-semibold border rounded-lg transition-all ${
                  txType === "Income"
                    ? "bg-success/15 border-success/40 text-success"
                    : "border-border text-muted-foreground"
                }`}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Income
              </ToggleGroupItem>
              <ToggleGroupItem
                value="Expense"
                className={`h-11 text-sm font-semibold border rounded-lg transition-all ${
                  txType === "Expense"
                    ? "bg-destructive/15 border-destructive/40 text-destructive"
                    : "border-border text-muted-foreground"
                }`}
              >
                <TrendingDown className="mr-2 h-4 w-4" />
                Expense
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">
              Date <span className="text-primary">*</span>
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-11 bg-secondary/50 border-border text-foreground"
              data-ocid="add_transaction.date_input"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">
              Category <span className="text-primary">*</span>
            </Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger
                className="h-11 bg-secondary/50 border-border text-foreground"
                data-ocid="add_transaction.category_select"
              >
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">
              Amount (₦) <span className="text-primary">*</span>
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="h-11 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
              data-ocid="add_transaction.amount_input"
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
              placeholder="Optional notes..."
              className="min-h-[70px] bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground resize-none"
              data-ocid="add_transaction.notes_textarea"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-11 border-border text-foreground"
              data-ocid="add_transaction.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addTransaction.isPending}
              className={`flex-1 h-11 font-semibold shadow-amber hover:opacity-90 ${
                txType === "Income"
                  ? "bg-success text-success-foreground"
                  : "bg-destructive text-destructive-foreground"
              }`}
              data-ocid="add_transaction.submit_button"
            >
              {addTransaction.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                `Add ${txType}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
