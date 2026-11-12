/** Public RevenueCat client keys. Live checkout remains gated separately. */
export const REVENUECAT_WEB_SANDBOX_KEY = "rcb_sb_rYVQTONZtIGtkbqwjPbNsKaHn";
export const REVENUECAT_WEB_PRODUCTION_KEY = "rcb_PAqeiCXpHMndFQaNywEzehXrVQym";
export const PREMIUM_ENTITLEMENT_ID = "niko_s_games_premium";
export const ANNUAL_PRODUCT_ID = "niko_annual_27";
export const OFFERING_ID = "default";

/** Only an explicit opt-in enables the live billing SDK in development. */
export const BILLING_MODE = import.meta.env.VITE_NIKO_BILLING_MODE === "live" ? "live" : "sandbox";
export const REVENUECAT_WEB_KEY = BILLING_MODE === "live"
  ? REVENUECAT_WEB_PRODUCTION_KEY
  : REVENUECAT_WEB_SANDBOX_KEY;
