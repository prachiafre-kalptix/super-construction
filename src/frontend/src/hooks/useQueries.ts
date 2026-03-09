import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type {
  DailyReport,
  FinancialSummary,
  backendInterface as FullBackendInterface,
  Site,
  Transaction,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Sites ────────────────────────────────────────────────────────────────────

export function useAllSites() {
  const { actor, isFetching } = useActor();
  return useQuery<Site[]>({
    queryKey: ["sites"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSites();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSite(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Site | null>({
    queryKey: ["site", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getSite(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateSite() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      location: string;
      clientName: string;
      startDate: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createSite(
        data.name,
        data.location,
        data.clientName,
        data.startDate,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      queryClient.invalidateQueries({ queryKey: ["overall-summary"] });
    },
  });
}

export function useUpdateSiteStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: bigint; status: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateSiteStatus(id, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["site", variables.id.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    },
  });
}

// ─── Financial Summaries ──────────────────────────────────────────────────────

export function useOverallFinancialSummary() {
  const { actor, isFetching } = useActor();
  return useQuery<FinancialSummary>({
    queryKey: ["overall-summary"],
    queryFn: async () => {
      if (!actor) return { balance: 0, totalIncome: 0, totalExpense: 0 };
      return actor.getOverallFinancialSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSiteFinancialSummary(siteId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<FinancialSummary>({
    queryKey: ["site-summary", siteId?.toString()],
    queryFn: async () => {
      if (!actor || siteId === null)
        return { balance: 0, totalIncome: 0, totalExpense: 0 };
      return actor.getFinancialSummaryForSite(siteId);
    },
    enabled: !!actor && !isFetching && siteId !== null,
  });
}

// ─── Daily Reports ────────────────────────────────────────────────────────────

export function useDailyReports(siteId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<DailyReport[]>({
    queryKey: ["daily-reports", siteId?.toString()],
    queryFn: async () => {
      if (!actor || siteId === null) return [];
      return actor.getDailyReportsForSite(siteId);
    },
    enabled: !!actor && !isFetching && siteId !== null,
  });
}

export function useAddDailyReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      siteId: bigint;
      date: string;
      workDone: string;
      labourCount: number;
      notes: string;
      photoFile?: File | null;
    }) => {
      if (!actor) throw new Error("No actor");
      const reportId = await actor.addDailyReport(
        data.siteId,
        data.date,
        data.workDone,
        BigInt(data.labourCount),
        data.notes,
      );
      if (data.photoFile) {
        const bytes = new Uint8Array(await data.photoFile.arrayBuffer());
        const blob = ExternalBlob.fromBytes(bytes);
        await actor.addReportPhoto(reportId, blob);
      }
      return reportId;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["daily-reports", variables.siteId.toString()],
      });
    },
  });
}

export function useUpdateDailyReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      siteId: bigint;
      date: string;
      workDone: string;
      labourCount: number;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return (actor as unknown as FullBackendInterface).updateDailyReport(
        data.id,
        data.date,
        data.workDone,
        BigInt(data.labourCount),
        data.notes,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["daily-reports", variables.siteId.toString()],
      });
    },
  });
}

export function useDeleteDailyReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: bigint; siteId: bigint }) => {
      if (!actor) throw new Error("No actor");
      return (actor as unknown as FullBackendInterface).deleteDailyReport(
        data.id,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["daily-reports", variables.siteId.toString()],
      });
    },
  });
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export function useTransactions(siteId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions", siteId?.toString()],
    queryFn: async () => {
      if (!actor || siteId === null) return [];
      return actor.getTransactionsForSite(siteId);
    },
    enabled: !!actor && !isFetching && siteId !== null,
  });
}

export function useAddTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      siteId: bigint;
      date: string;
      txType: string;
      category: string;
      amount: number;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addTransaction(
        data.siteId,
        data.date,
        data.txType,
        data.category,
        data.amount,
        data.notes,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["transactions", variables.siteId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["site-summary", variables.siteId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["overall-summary"] });
    },
  });
}

export function useUpdateTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      siteId: bigint;
      date: string;
      txType: string;
      category: string;
      amount: number;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateTransaction(
        data.id,
        data.date,
        data.txType,
        data.category,
        data.amount,
        data.notes,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["transactions", variables.siteId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["site-summary", variables.siteId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["overall-summary"] });
    },
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: bigint; siteId: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteTransaction(data.id);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["transactions", variables.siteId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["site-summary", variables.siteId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["overall-summary"] });
    },
  });
}

// ─── Photo ────────────────────────────────────────────────────────────────────

export function useReportPhoto(reportId: bigint | null, hasPhoto: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["report-photo", reportId?.toString()],
    queryFn: async () => {
      if (!actor || reportId === null) return null;
      const blob = await actor.getReportPhoto(reportId);
      return blob.getDirectURL();
    },
    enabled: !!actor && !isFetching && reportId !== null && hasPhoto,
    staleTime: 5 * 60 * 1000,
  });
}
