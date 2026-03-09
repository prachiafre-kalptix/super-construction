import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin, TrendingDown, TrendingUp, User } from "lucide-react";
import { motion } from "motion/react";
import type { Site } from "../../backend.d";
import { useSiteFinancialSummary } from "../../hooks/useQueries";

interface SiteCardProps {
  site: Site;
  index: number;
  onClick: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SiteCard({ site, index, onClick }: SiteCardProps) {
  const { data: summary } = useSiteFinancialSummary(site.id);
  const isRunning = site.status === "Running";

  const ocidIndex = index + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.07 }}
    >
      <Card
        className="bg-card border-border shadow-card card-hover cursor-pointer overflow-hidden active:scale-[0.98] transition-transform"
        onClick={onClick}
        data-ocid={`home.site.item.${ocidIndex}`}
      >
        {/* Amber accent left bar */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${
            isRunning ? "bg-primary" : "bg-muted-foreground"
          }`}
        />
        <div className="pl-5 pr-4 py-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-base text-foreground leading-tight truncate">
                {site.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <User className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground truncate">
                  {site.clientName}
                </span>
              </div>
            </div>
            <Badge
              variant={isRunning ? "default" : "secondary"}
              className={
                isRunning
                  ? "bg-primary/15 text-primary border border-primary/30 font-medium text-xs shrink-0"
                  : "bg-muted text-muted-foreground border border-border font-medium text-xs shrink-0"
              }
            >
              {site.status}
            </Badge>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                {site.location}
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

          {summary && (
            <div className="flex items-center gap-3 pt-3 border-t border-border/60">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-success shrink-0" />
                <span className="text-xs font-medium text-success">
                  {formatCurrency(summary.totalIncome)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingDown className="h-3.5 w-3.5 text-destructive shrink-0" />
                <span className="text-xs font-medium text-destructive">
                  {formatCurrency(summary.totalExpense)}
                </span>
              </div>
              <div className="ml-auto">
                <span
                  className={`text-sm font-display font-bold ${
                    summary.balance >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {summary.balance >= 0 ? "+" : ""}
                  {formatCurrency(summary.balance)}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
