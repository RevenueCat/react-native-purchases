import {
  LogInResult,
  CustomerInfo,
  PurchasesEntitlementInfo,
  PurchasesEntitlementInfos,
  PurchasesStoreTransaction
} from "../src";

function checkLoginResult(result: LogInResult) {
  const customerInfo: CustomerInfo = result.customerInfo;
  const created: boolean = result.created;
}

function checkCustomerInfo(info: CustomerInfo) {
  const entitlements: PurchasesEntitlementInfos = info.entitlements;
  const activeSubscriptions: string[] = info.activeSubscriptions;
  const allPurchasedProductIdentifiers: string[] = info.allPurchasedProductIdentifiers;
  const latestExpirationDate: string | null = info.latestExpirationDate;
  const firstSeen: string = info.firstSeen;
  const originalAppUserId: string = info.originalAppUserId;
  const requestDate: string = info.requestDate;
  const allExpirationDates: { [p: string]: string | null } = info.allExpirationDates;
  const allPurchaseDates: { [p: string]: string | null } = info.allPurchaseDates;
  const originalApplicationVersion: string | null = info.originalApplicationVersion;
  const originalPurchaseDate: string | null = info.originalPurchaseDate;
  const managementURL: string | null = info.managementURL;
  const nonSubscriptionTransactions: PurchasesStoreTransaction[] = info.nonSubscriptionTransactions;
}

function checkEntitlementInfos(infos: PurchasesEntitlementInfos) {
  const all: { [p: string]: PurchasesEntitlementInfo } = infos.all;
  const active: { [p: string]: PurchasesEntitlementInfo } = infos.active;
}

function checkEntitlementInfo(info: PurchasesEntitlementInfo) {
  const identifier: string = info.identifier;
  const isActive: boolean = info.isActive;
  const willRenew: boolean = info.willRenew;
  const periodType: string = info.periodType;
  const latestPurchaseDate: string = info.latestPurchaseDate;
  const originalPurchaseDate: string = info.originalPurchaseDate;
  const expirationDate: string | null = info.expirationDate;
  const store: string = info.store;
  const productIdentifier: string = info.productIdentifier;
  const isSandbox: boolean = info.isSandbox;
  const unsubscribeDetectedAt: string | null = info.unsubscribeDetectedAt;
  const billingIssueDetectedAt: string | null = info.billingIssueDetectedAt;
}

function checkTransaction(transaction: PurchasesStoreTransaction) {
  const transactionIdentifier: string = transaction.transactionIdentifier;
  const productIdentifier: string = transaction.productIdentifier;
  const purchaseDate: string = transaction.purchaseDate;
}
