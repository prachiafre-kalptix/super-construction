import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Moon,
  RefreshCw,
  Sun,
  TrendingDown,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import DailyReportsList from "../components/app/DailyReportsList";
import TransactionsList from "../components/app/TransactionsList";
import {
  useSite,
  useSiteFinancialSummary,
  useUpdateSiteStatus,
} from "../hooks/useQueries";
import { useTheme } from "../hooks/useTheme";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SitePage() {
  const { siteId } = useParams({ from: "/site/$siteId" });
  const navigate = useNavigate();
  const siteIdBigInt = BigInt(siteId);
  const { theme, toggleTheme } = useTheme();

  const { data: site, isLoading: siteLoading } = useSite(siteIdBigInt);
  const { data: summary, isLoading: summaryLoading } =
    useSiteFinancialSummary(siteIdBigInt);
  const updateStatus = useUpdateSiteStatus();

  const handleToggleStatus = async () => {
    if (!site) return;
    const newStatus = site.status === "Running" ? "Completed" : "Running";
    try {
      await updateStatus.mutateAsync({ id: siteIdBigInt, status: newStatus });
      toast.success(`Site marked as ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const isRunning = site?.status === "Running";

  return (
    <div className="app-bg min-h-dvh" data-ocid="site.page">
      <div className="mobile-frame flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border/50">
          <div className="px-4 py-3">
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate({ to: "/" })}
                className="h-9 w-9 shrink-0 text-foreground hover:bg-accent mt-0.5"
                data-ocid="site.back_button"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 min-w-0">
                {siteLoading ? (
                  <>
                    <Skeleton className="h-6 w-40 bg-muted mb-1" />
                    <Skeleton className="h-4 w-24 bg-muted" />
                  </>
                ) : (
                  <>
                    <h1 className="font-display font-bold text-lg text-foreground leading-tight truncate">
                      {site?.name ?? "Site"}
                    </h1>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Badge
                        className={
                          isRunning
                            ? "bg-primary/15 text-primary border border-primary/30 text-xs py-0 h-5 font-medium"
                            : "bg-muted text-muted-foreground border border-border text-xs py-0 h-5 font-medium"
                        }
                      >
                        {site?.status}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent mt-0.5"
                  aria-label={
                    theme === "dark"
                      ? "Switch to light mode"
                      : "Switch to dark mode"
                  }
                  data-ocid="theme.toggle"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4.5 w-4.5" />
                  ) : (
                    <Moon className="h-4.5 w-4.5" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleStatus}
                  disabled={updateStatus.isPending || siteLoading}
                  className="h-8 text-xs border-border text-foreground hover:bg-accent mt-0.5"
                  data-ocid="site.status_button"
                >
                  <RefreshCw
                    className={`mr-1.5 h-3.5 w-3.5 ${updateStatus.isPending ? "animate-spin" : ""}`}
                  />
                  {isRunning ? "Complete" : "Reopen"}
                </Button>
              </div>
            </div>

            {/* Site Meta */}
            {!siteLoading && site && (
              <div className="ml-12 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                    {site.location}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {site.clientName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground">
                    {new Date(site.startDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Financial Summary */}
        <section className="px-4 pt-4 pb-2">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {summaryLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-xl bg-muted" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {/* Income */}
                <div className="bg-success/10 border border-success/20 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-success" />
                    <span className="text-xs text-success/80 font-medium">
                      Income
                    </span>
                  </div>
                  <p className="font-display font-bold text-sm text-success leading-none">
                    {formatCurrency(summary?.totalIncome ?? 0)}
                  </p>
                </div>

                {/* Expense */}
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1">
                    <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-xs text-destructive/80 font-medium">
                      Expense
                    </span>
                  </div>
                  <p className="font-display font-bold text-sm text-destructive leading-none">
                    {formatCurrency(summary?.totalExpense ?? 0)}
                  </p>
                </div>

                {/* Balance */}
                <div
                  className={`border rounded-xl p-3 space-y-1 ${
                    (summary?.balance ?? 0) >= 0
                      ? "bg-primary/10 border-primary/20"
                      : "bg-destructive/10 border-destructive/20"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Wallet
                      className={`h-3.5 w-3.5 ${
                        (summary?.balance ?? 0) >= 0
                          ? "text-primary"
                          : "text-destructive"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        (summary?.balance ?? 0) >= 0
                          ? "text-primary/80"
                          : "text-destructive/80"
                      }`}
                    >
                      Balance
                    </span>
                  </div>
                  <p
                    className={`font-display font-bold text-sm leading-none ${
                      (summary?.balance ?? 0) >= 0
                        ? "text-primary"
                        : "text-destructive"
                    }`}
                  >
                    {(summary?.balance ?? 0) >= 0 ? "+" : ""}
                    {formatCurrency(summary?.balance ?? 0)}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </section>

        {/* Tabs */}
        <div className="flex-1 px-4 pb-8">
          <Tabs defaultValue="reports" className="mt-4">
            <TabsList className="w-full bg-secondary/50 border border-border h-11 p-1 rounded-xl">
              <TabsTrigger
                value="reports"
                className="flex-1 h-9 text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs rounded-lg"
                data-ocid="site.reports_tab"
              >
                Daily Reports
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="flex-1 h-9 text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs rounded-lg"
                data-ocid="site.transactions_tab"
              >
                Transactions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="reports" className="mt-4">
              <DailyReportsList siteId={siteIdBigInt} />
            </TabsContent>
            <TabsContent value="transactions" className="mt-4">
              <TransactionsList siteId={siteIdBigInt} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <footer className="px-4 py-3 border-t border-border/40 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined" ? window.location.hostname : "",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Built with ♥ using caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
