import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";



actor {
  include MixinStorage();

  type Site = {
    id : Nat;
    name : Text;
    location : Text;
    clientName : Text;
    startDate : Text;
    status : Text; // "Running" or "Completed"
  };

  module Site {
    public func compare(site1 : Site, site2 : Site) : Order.Order {
      Nat.compare(site1.id, site2.id);
    };
  };

  type DailyReport = {
    id : Nat;
    siteId : Nat;
    date : Text;
    workDone : Text;
    labourCount : Nat;
    notes : Text;
    photo : ?Storage.ExternalBlob;
  };

  module DailyReport {
    public func compare(report1 : DailyReport, report2 : DailyReport) : Order.Order {
      Nat.compare(report1.id, report2.id);
    };
  };

  type Transaction = {
    id : Nat;
    siteId : Nat;
    date : Text;
    txType : Text; // "Income" or "Expense"
    category : Text;
    amount : Float;
    notes : Text;
  };

  module Transaction {
    public func compare(transaction1 : Transaction, transaction2 : Transaction) : Order.Order {
      Nat.compare(transaction1.id, transaction2.id);
    };
  };

  type FinancialSummary = {
    totalIncome : Float;
    totalExpense : Float;
    balance : Float;
  };

  let sites = Map.empty<Nat, Site>();
  let dailyReports = Map.empty<Nat, DailyReport>();
  let transactions = Map.empty<Nat, Transaction>();

  var nextSiteId = 1;
  var nextReportId = 1;
  var nextTransactionId = 1;

  public shared ({ caller }) func createSite(name : Text, location : Text, clientName : Text, startDate : Text) : async Nat {
    let site : Site = {
      id = nextSiteId;
      name;
      location;
      clientName;
      startDate;
      status = "Running";
    };
    sites.add(nextSiteId, site);
    nextSiteId += 1;
    site.id;
  };

  public query ({ caller }) func getAllSites() : async [Site] {
    sites.values().toArray().sort(); // implicitly uses Site.compare
  };

  public query ({ caller }) func getSite(id : Nat) : async Site {
    switch (sites.get(id)) {
      case (null) { Runtime.trap("Site not found") };
      case (?site) { site };
    };
  };

  public shared ({ caller }) func updateSiteStatus(id : Nat, status : Text) : async () {
    if (status != "Running" and status != "Completed") {
      Runtime.trap("Invalid status");
    };
    switch (sites.get(id)) {
      case (null) { Runtime.trap("Site not found") };
      case (?site) {
        sites.add(
          id,
          {
            id = site.id;
            name = site.name;
            location = site.location;
            clientName = site.clientName;
            startDate = site.startDate;
            status;
          },
        );
      };
    };
  };

  public shared ({ caller }) func addDailyReport(siteId : Nat, date : Text, workDone : Text, labourCount : Nat, notes : Text) : async Nat {
    switch (sites.get(siteId)) {
      case (null) { Runtime.trap("Site not found") };
      case (?_) {
        let report : DailyReport = {
          id = nextReportId;
          siteId;
          date;
          workDone;
          labourCount;
          notes;
          photo = null;
        };
        dailyReports.add(nextReportId, report);
        nextReportId += 1;
        report.id;
      };
    };
  };

  public shared ({ caller }) func updateDailyReport(reportId : Nat, date : Text, workDone : Text, labourCount : Nat, notes : Text) : async () {
    switch (dailyReports.get(reportId)) {
      case (null) { Runtime.trap("Report not found") };
      case (?oldReport) {
        dailyReports.add(
          reportId,
          {
            id = oldReport.id;
            siteId = oldReport.siteId;
            date;
            workDone;
            labourCount;
            notes;
            photo = oldReport.photo;
          },
        );
      };
    };
  };

  public shared ({ caller }) func deleteDailyReport(reportId : Nat) : async () {
    if (not dailyReports.containsKey(reportId)) {
      Runtime.trap("Report not found");
    };
    dailyReports.remove(reportId);
  };

  public query ({ caller }) func getDailyReportsForSite(siteId : Nat) : async [DailyReport] {
    dailyReports.values().toArray().filter(func(report) { report.siteId == siteId }).sort();
  };

  public shared ({ caller }) func addTransaction(siteId : Nat, date : Text, txType : Text, category : Text, amount : Float, notes : Text) : async Nat {
    if (txType != "Income" and txType != "Expense") {
      Runtime.trap("Invalid transaction type");
    };
    switch (sites.get(siteId)) {
      case (null) { Runtime.trap("Site not found") };
      case (?_) {
        let transaction : Transaction = {
          id = nextTransactionId;
          siteId;
          date;
          txType;
          category;
          amount;
          notes;
        };
        transactions.add(nextTransactionId, transaction);
        nextTransactionId += 1;
        transaction.id;
      };
    };
  };

  public shared ({ caller }) func deleteTransaction(transactionId : Nat) : async () {
    if (not transactions.containsKey(transactionId)) {
      Runtime.trap("Transaction not found");
    };
    transactions.remove(transactionId);
  };

  public shared ({ caller }) func updateTransaction(transactionId : Nat, date : Text, txType : Text, category : Text, amount : Float, notes : Text) : async () {
    switch (transactions.get(transactionId)) {
      case (null) { Runtime.trap("Transaction not found") };
      case (?oldTransaction) {
        transactions.add(
          transactionId,
          {
            id = oldTransaction.id;
            siteId = oldTransaction.siteId;
            date;
            txType;
            category;
            amount;
            notes;
          },
        );
      };
    };
  };

  public query ({ caller }) func getTransactionsForSite(siteId : Nat) : async [Transaction] {
    transactions.values().toArray().filter(func(transaction) { transaction.siteId == siteId }).sort();
  };

  public query ({ caller }) func getFinancialSummaryForSite(siteId : Nat) : async FinancialSummary {
    switch (sites.get(siteId)) {
      case (null) { Runtime.trap("Site not found") };
      case (?_) {
        let siteTransactions = transactions.values().toArray().filter(func(transaction) { transaction.siteId == siteId });

        let totalIncome = siteTransactions.foldLeft(
          0.0,
          func(acc, transaction) {
            if (transaction.txType == "Income") { acc + transaction.amount } else { acc };
          },
        );

        let totalExpense = siteTransactions.foldLeft(
          0.0,
          func(acc, transaction) {
            if (transaction.txType == "Expense") { acc + transaction.amount } else { acc };
          },
        );

        {
          totalIncome;
          totalExpense;
          balance = totalIncome - totalExpense;
        };
      };
    };
  };

  public query ({ caller }) func getOverallFinancialSummary() : async FinancialSummary {
    let allTransactions = transactions.values().toArray();

    let totalIncome = allTransactions.foldLeft(
      0.0,
      func(acc, transaction) {
        if (transaction.txType == "Income") { acc + transaction.amount } else { acc };
      },
    );

    let totalExpense = allTransactions.foldLeft(
      0.0,
      func(acc, transaction) {
        if (transaction.txType == "Expense") { acc + transaction.amount } else { acc };
      },
    );

    {
      totalIncome;
      totalExpense;
      balance = totalIncome - totalExpense;
    };
  };

  public shared ({ caller }) func addReportPhoto(reportId : Nat, photo : Storage.ExternalBlob) : async () {
    switch (dailyReports.get(reportId)) {
      case (null) { Runtime.trap("Report not found") };
      case (?report) {
        dailyReports.add(
          reportId,
          {
            id = report.id;
            siteId = report.siteId;
            date = report.date;
            workDone = report.workDone;
            labourCount = report.labourCount;
            notes = report.notes;
            photo = ?photo;
          },
        );
      };
    };
  };

  public query ({ caller }) func getReportPhoto(reportId : Nat) : async Storage.ExternalBlob {
    switch (dailyReports.get(reportId)) {
      case (null) { Runtime.trap("Report not found") };
      case (?report) {
        switch (report.photo) {
          case (null) { Runtime.trap("Photo not found") };
          case (?photo) { photo };
        };
      };
    };
  };
};
