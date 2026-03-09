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
  Pencil,
  Plus,
  Receipt,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Transaction } from "../../backend.d";
import { useDeleteTransaction, useTransactions } from "../../hooks/useQueries";
import AddTransactionDialog from "./AddTransactionDialog";
import EditTransactionDialog from "./EditTransactionDialog";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface TransactionCardProps {
  tx: Transaction;
  index: number;
  siteId: bigint;
}

function TransactionCard({ tx, index, siteId }: TransactionCardProps) {
  const isIncome = tx.txType === "Income";
  const ocidIndex = index + 1;
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteTransaction = useDeleteTransaction();

  const handleDelete = async () => {
    try {
      await deleteTransaction.mutateAsync({ id: tx.id, siteId });
      toast.success("Transaction deleted");
      setDeleteOpen(false);
    } catch {
      toast.error("Failed to delete transaction");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        className="bg-card border border-border rounded-xl px-4 py-3 shadow-card"
        data-ocid={`transaction.item.${ocidIndex}`}
      >
        <div className="flex items-start gap-3">
          {/* Type icon */}
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              isIncome ? "bg-success/15" : "bg-destructive/15"
            }`}
          >
            {isIncome ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              {/* Left: badges */}
              <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                <Badge
                  variant="outline"
                  className={`text-xs px-2 py-0 h-5 border font-medium shrink-0 flex items-center gap-1 ${
                    isIncome
                      ? "bg-success/10 border-success/25 text-success"
                      : "bg-destructive/10 border-destructive/25 text-destructive"
                  }`}
                >
                  {isIncome ? (
                    <TrendingUp className="h-2.5 w-2.5" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5" />
                  )}
                  {tx.txType}
                </Badge>
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {tx.category}
                  </span>
                </div>
              </div>

              {/* Right: amount + action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <p
                  className={`font-display font-bold text-base leading-none mr-1 ${
                    isIncome ? "text-success" : "text-destructive"
                  }`}
                >
                  {isIncome ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </p>
                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  aria-label="Edit transaction"
                  data-ocid={`transaction.edit_button.${ocidIndex}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label="Delete transaction"
                  data-ocid={`transaction.delete_button.${ocidIndex}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1 mt-1">
              <CalendarDays className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">
                {new Date(tx.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Notes */}
            {tx.notes && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                {tx.notes}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Edit Dialog */}
      <EditTransactionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        transaction={tx}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent
          className="bg-card border-border max-w-[340px]"
          data-ocid="transaction.delete.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-foreground">
              Delete Transaction?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              This will permanently remove the{" "}
              <span className={isIncome ? "text-success" : "text-destructive"}>
                {isIncome ? "+" : "-"}
                {formatCurrency(tx.amount)}
              </span>{" "}
              {tx.txType.toLowerCase()} transaction. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              className="flex-1 h-10 border-border text-foreground bg-transparent hover:bg-accent"
              data-ocid="transaction.delete.cancel_button"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteTransaction.isPending}
              className="flex-1 h-10 bg-destructive text-destructive-foreground hover:opacity-90 font-semibold"
              data-ocid="transaction.delete.confirm_button"
            >
              {deleteTransaction.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface TransactionsListProps {
  siteId: bigint;
}

export default function TransactionsList({ siteId }: TransactionsListProps) {
  const [addTxOpen, setAddTxOpen] = useState(false);
  const { data: transactions = [], isLoading } = useTransactions(siteId);

  // Sort newest first
  const sorted = [...transactions].sort((a, b) => (b.date > a.date ? 1 : -1));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {sorted.length} Transaction{sorted.length !== 1 ? "s" : ""}
        </p>
        <Button
          size="sm"
          onClick={() => setAddTxOpen(true)}
          className="h-8 px-3 bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90"
          data-ocid="add_transaction.open_modal_button"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add Transaction
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="transaction.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl bg-muted" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
            data-ocid="transaction.empty_state"
          >
            <div className="h-14 w-14 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
              <Receipt className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              No Transactions Yet
            </p>
            <p className="text-xs text-muted-foreground">
              Track income and expenses for this site.
            </p>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="space-y-2">
          {sorted.map((tx, index) => (
            <TransactionCard
              key={tx.id.toString()}
              tx={tx}
              index={index}
              siteId={siteId}
            />
          ))}
        </div>
      )}

      <AddTransactionDialog
        open={addTxOpen}
        onOpenChange={setAddTxOpen}
        siteId={siteId}
      />
    </div>
  );
}
