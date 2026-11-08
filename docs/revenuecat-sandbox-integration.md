# Niko's Games — RevenueCat sandbox integration

Development branch only. Do not merge until test purchase, parental gate, entitlement verification, restore access, and mobile tests pass.

## RevenueCat identifiers
- Test Store public SDK key: supplied by project owner; inject via VITE_REVENUECAT_PUBLIC_KEY for sandbox preview only.
- Offering: default
- Product: niko_annual_27
- Entitlement: niko_s_games_premium
- Billing: $27/year, no free trial

## Required behavior
- World 1 is always free.
- Worlds 2–10 show a lock for non-subscribers, regardless of stars/progression.
- Selecting a locked world opens a parent gate and then the RevenueCat paywall.
- Verified subscribers may choose any world 2–10 without requiring completion of previous worlds.
- Verify entitlement before entering premium gameplay, including next-world, restart, and other navigation paths.
- Preserve earned stars, scores, Laury audio, sensory settings, and gameplay.
- Provide parent sign-in, restore access, manage subscription, and terms/privacy.
- Never use a localStorage boolean as proof of payment.
- Test Store transactions are not real payments. Production needs Web Billing setup and appropriate customer identity/secure entitlement checks.

## Existing code
- src/App.tsx highestUnlockedWorld currently grants access by earned stars.
- src/components/StartScreen.tsx disables locked world buttons, so locked taps cannot currently open paywall.
- src/App.tsx play() also checks highestUnlockedWorld.
- package.json is React/Vite and currently lacks @revenuecat/purchases-js.
