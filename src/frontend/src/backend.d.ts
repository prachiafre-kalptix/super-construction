import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Site {
    id: bigint;
    status: string;
    clientName: string;
    name: string;
    location: string;
    startDate: string;
}
export interface DailyReport {
    id: bigint;
    labourCount: bigint;
    date: string;
    notes: string;
    siteId: bigint;
    photo?: ExternalBlob;
    workDone: string;
}
export interface FinancialSummary {
    balance: number;
    totalIncome: number;
    totalExpense: number;
}
export interface Transaction {
    id: bigint;
    date: string;
    notes: string;
    category: string;
    txType: string;
    siteId: bigint;
    amount: number;
}
export interface backendInterface {
    addDailyReport(siteId: bigint, date: string, workDone: string, labourCount: bigint, notes: string): Promise<bigint>;
    addReportPhoto(reportId: bigint, photo: ExternalBlob): Promise<void>;
    addTransaction(siteId: bigint, date: string, txType: string, category: string, amount: number, notes: string): Promise<bigint>;
    createSite(name: string, location: string, clientName: string, startDate: string): Promise<bigint>;
    deleteDailyReport(reportId: bigint): Promise<void>;
    deleteTransaction(transactionId: bigint): Promise<void>;
    getAllSites(): Promise<Array<Site>>;
    getDailyReportsForSite(siteId: bigint): Promise<Array<DailyReport>>;
    getFinancialSummaryForSite(siteId: bigint): Promise<FinancialSummary>;
    getOverallFinancialSummary(): Promise<FinancialSummary>;
    getReportPhoto(reportId: bigint): Promise<ExternalBlob>;
    getSite(id: bigint): Promise<Site>;
    getTransactionsForSite(siteId: bigint): Promise<Array<Transaction>>;
    updateDailyReport(reportId: bigint, date: string, workDone: string, labourCount: bigint, notes: string): Promise<void>;
    updateSiteStatus(id: bigint, status: string): Promise<void>;
    updateTransaction(transactionId: bigint, date: string, txType: string, category: string, amount: number, notes: string): Promise<void>;
}
