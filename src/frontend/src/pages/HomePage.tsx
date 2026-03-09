import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  Construction,
  HardHat,
  Moon,
  Plus,
  Sun,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import AddSiteDialog from "../components/app/AddSiteDialog";
import SiteCard from "../components/app/SiteCard";
import { useAllSites, useOverallFinancialSummary } from "../hooks/useQueries";
import { useTheme } from "../hooks/useTheme";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function HomePage() {
  const navigate = useNavigate();
  const [addSiteOpen, setAddSiteOpen] = useState(false);
  const { data: sites = [], isLoading: sitesLoading } = useAllSites();
  const { data: summary, isLoading: summaryLoading } =
    useOverallFinancialSummary();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-bg min-h-dvh" data-ocid="home.page">
      <div className="mobile-frame flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border/50">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
              <HardHat className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-xl text-foreground leading-none">
                SiteTrack
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Construction Manager
              </p>
            </div>
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent"
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
          </div>
        </header>

        {/* Overall Summary Bar */}
        <section className="px-4 pt-4 pb-2">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-xl p-4 shadow-card"
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              All Sites Overview
            </p>
            {summaryLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-12 bg-muted" />
                    <Skeleton className="h-5 w-20 bg-muted" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-success" />
                    <span className="text-xs text-muted-foreground">
                      Income
                    </span>
                  </div>
                  <p className="font-display font-bold text-sm text-success">
                    {formatCurrency(summary?.totalIncome ?? 0)}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3 text-destructive" />
                    <span className="text-xs text-muted-foreground">
                      Expense
                    </span>
                  </div>
                  <p className="font-display font-bold text-sm text-destructive">
                    {formatCurrency(summary?.totalExpense ?? 0)}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1">
                    <Wallet className="h-3 w-3 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Balance
                    </span>
                  </div>
                  <p
                    className={`font-display font-bold text-sm ${
                      (summary?.balance ?? 0) >= 0
                        ? "text-success"
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

        {/* Sites List */}
        <main className="flex-1 px-4 pt-3 pb-24">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Construction Sites ({sites.length})
            </h2>
          </div>

          {sitesLoading ? (
            <div className="space-y-3" data-ocid="home.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl bg-muted" />
              ))}
            </div>
          ) : sites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-16 text-center"
              data-ocid="home.empty_state"
            >
              <div className="h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <Construction className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                No Sites Yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-[220px] leading-relaxed">
                Add your first construction site to start tracking work and
                finances.
              </p>
              <Button
                onClick={() => setAddSiteOpen(true)}
                className="mt-6 h-12 px-6 bg-primary text-primary-foreground font-semibold shadow-amber hover:opacity-90"
                data-ocid="home.add_site_button"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add First Site
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3 relative">
              {sites.map((site, index) => (
                <SiteCard
                  key={site.id.toString()}
                  site={site}
                  index={index}
                  onClick={() =>
                    navigate({
                      to: "/site/$siteId",
                      params: { siteId: site.id.toString() },
                    })
                  }
                />
              ))}
            </div>
          )}
        </main>

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

        {/* Floating Add Button */}
        {sites.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.4,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="fixed bottom-20 right-4 z-30"
            style={{
              maxWidth: "calc(430px - 1rem)",
              right: "max(1rem, calc((100vw - 430px) / 2 + 1rem))",
            }}
          >
            <Button
              onClick={() => setAddSiteOpen(true)}
              size="icon"
              className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-amber hover:opacity-90 hover:scale-110 transition-all"
              data-ocid="home.add_site_button"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </div>

      <AddSiteDialog open={addSiteOpen} onOpenChange={setAddSiteOpen} />
    </div>
  );
}
