import { Purchases } from "@revenuecat/purchases-js";
import { supabase } from "../auth/supabase";
import { PREMIUM_ENTITLEMENT_ID, REVENUECAT_WEB_SANDBOX_KEY } from "./revenuecatConfig";

const ID_KEY = "niko-revenuecat-sandbox-customer-v1";
let instance: Purchases | null = null;
let configuredId: string | null = null;

export function currentBillingIdentity(): string | null { return configuredId; }

/** Resolve a verified parent identity before configuring RevenueCat. */
export async function initializeParentBilling(): Promise<void> {
  // A missing or expired session is normal for a signed-out visitor.
  // Initialize anonymous billing while reserving parent-linked identities
  // for verified Supabase users.
  const { data } = await supabase.auth.getUser();
  const parentId = data.user ? `niko_parent_${data.user.id}` : null;
  if (instance) {
    if (parentId && configuredId !== parentId) throw new Error("Parent identity changed; reload to reconnect billing.");
    return;
  }
  const id = parentId ?? getOrCreateAnonymousId();
  configuredId = id;
  instance = Purchases.configure({ apiKey: REVENUECAT_WEB_SANDBOX_KEY, appUserId: id });
}

function getOrCreateAnonymousId(): string {
  let id = localStorage.getItem(ID_KEY);
  if (!id) { id = Purchases.generateRevenueCatAnonymousAppUserId(); localStorage.setItem(ID_KEY, id); }
  return id;
}


export function billingClient(): Purchases {
  if (!instance) throw new Error("Billing is not initialized; verify parent authentication first.");
  return instance;
}

export async function getMembershipDetails(): Promise<{ active: boolean; managementUrl: string | null; expiresAt: string | null; willRenew: boolean | null }> {
  const info = await billingClient().getCustomerInfo();
  const entitlement = info.entitlements.active[PREMIUM_ENTITLEMENT_ID];
  return { active: Boolean(entitlement), managementUrl: info.managementURL ?? null, expiresAt: entitlement?.expirationDate?.toISOString() ?? null, willRenew: entitlement?.willRenew ?? null };
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

/** Sandbox-only diagnostic: the exact RevenueCat identity this browser uses. */
export function getSandboxCustomerId(): string {
  return configuredId ?? "Not initialized";
}
