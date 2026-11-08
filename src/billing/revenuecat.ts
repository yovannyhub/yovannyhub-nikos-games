import { Purchases } from "@revenuecat/purchases-js";
import { PREMIUM_ENTITLEMENT_ID, REVENUECAT_WEB_SANDBOX_KEY } from "./revenuecatConfig";

const ID_KEY = "niko-revenuecat-sandbox-customer-v1";
let instance: Purchases | null = null;

export function billingClient(): Purchases {
  if (instance) return instance;
  let id = localStorage.getItem(ID_KEY);
  if (!id) {
    id = Purchases.generateRevenueCatAnonymousAppUserId();
    localStorage.setItem(ID_KEY, id);
  }
  instance = Purchases.configure({ apiKey: REVENUECAT_WEB_SANDBOX_KEY, appUserId: id });
  return instance;
}

export async function hasPremiumAccess(): Promise<boolean> {
  const info = await billingClient().getCustomerInfo();
  return PREMIUM_ENTITLEMENT_ID in info.entitlements.active;
}

export async function openSandboxPaywall(htmlTarget: HTMLElement): Promise<boolean> {
  const client = billingClient();
  const offerings = await client.getOfferings();
  const offering = offerings.all["default"] ?? offerings.current;
  if (!offering || offering.availablePackages.length === 0) {
    throw new Error("The RevenueCat Billing annual offering is not available.");
  }
  const result = await client.presentPaywall({ htmlTarget, offering });
  return PREMIUM_ENTITLEMENT_ID in result.customerInfo.entitlements.active;
}
