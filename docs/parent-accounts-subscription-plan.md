# Parent accounts and subscription restoration (sandbox implementation plan)

Status: authentication provider not configured; **do not enable live payments**.

## Current confirmed bug
A sandbox purchase is active under RevenueCat anonymous ID `$RCAnonymousID:ceda9da6c37144bc904e329448a8ada2`, but a separate Cloudflare preview origin uses another anonymous ID. Browser localStorage is scoped to origin; separate preview URLs do not share identity. Never hardcode the purchaser's anonymous ID into the public client.

## Target design
- Use Supabase Auth email one-time-password/magic-link for **parents only**. Children never authenticate or supply an email.
- Create a stable, non-email RevenueCat app user ID based on the verified Supabase auth subject, namespaced `niko_parent_<uuid>`.
- Configure RevenueCat only after auth state is resolved; call `Purchases.configure` with verified parent identity. Do not accept a user-entered email or arbitrary ID as proof of ownership.
- Keep World 1 free. Gate Worlds 2–10 using active entitlement `niko_s_games_premium`; show loading, offline, and expired states distinctly.
- Add parent-only sign-in, sign-out, session refresh, and check-subscription UI. Validate same-account access after reload, across preview URLs, and on a second device.
- Treat RevenueCat client entitlement as UX state, not server-side authorization for sensitive resources. Protect future premium APIs server-side.
- Provide parent-only billing management/cancellation links and restore instructions; never initiate an additional purchase while investigating an existing one.

## Migration of existing sandbox purchase
- Do not automatically claim the anonymous purchase based on a typed email.
- Confirm existing purchase owner and active entitlement in RevenueCat.
- Use RevenueCat-supported verified migration/alias or an authorized admin process after confirming parent ownership; test in sandbox first. Avoid transferring another user's purchases or exposing API secrets in the browser.
- Preserve historical anonymous ID only in an authenticated, access-controlled migration workflow; do not bake it into the app.

## Required configuration before implementation
1. Supabase project URL and **public anon/publishable key** (never service-role key).
2. Configure allowed auth redirect origins: production `https://playnikogames.com` and an appropriate stable sandbox preview hostname (not each ephemeral deployment URL).
3. Confirm RevenueCat app user identity/migration policy and parent billing/legal consent flow.
4. Server-side secret credentials, if needed, must live in Cloudflare environment secrets, never in Vite client code.

## Acceptance tests
- Parent verifies email; account survives refresh and browser restart.
- Same verified parent on another device sees the same active entitlement.
- Other parent account cannot access first parent's subscription.
- World 1 always free; Worlds 2–10 locked without verified entitlement.
- Sandbox expiry/cancellation removes access after refresh.
- Child-facing interface never exposes parent email or account tokens.
- No production deployment or live checkout without explicit approval.
