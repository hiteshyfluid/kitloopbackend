# The Kit Loop — End-to-End Test Checklist

**Test password (all accounts):** `KitLoop2024!`
**Stripe test cards:**
| Card number | Scenario |
|---|---|
| `4242 4242 4242 4242` | Success (any future expiry, any CVC) |
| `4000 0000 0000 0002` | Hard decline |
| `4000 0025 0000 3155` | 3D Secure required |

---

## Setup

```bash
# 1. Start backend  (from Kit_loop/)
npm run dev

# 2. Start frontend  (from kit-loop-frontend/)
npm run dev

# 3. Seed reference data (sports, sub-categories, brands)
npm run seed

# 4. Seed test users + listings
npm run seed:test

# 5. Full reset and re-seed
npm run seed:test:reset
```

Pre-flight checks:
- [ ] Backend responds: `GET http://localhost:4000/health` → `{"status":"ok"}`
- [ ] `.env` has valid `STRIPE_SECRET_KEY` (sk_test_…) and `STRIPE_WEBHOOK_SECRET`
- [ ] `.env` has `CLOUDINARY_*` credentials
- [ ] Stripe webhook forwarding active: `stripe listen --forward-to localhost:4000/webhooks/stripe`
- [ ] At least one sport/sub-category/brand exists in DB (seedData.js run)

---

## Flow 1 — Buyer Happy Path

### 1a. Browse without account
- [ ] Open `http://localhost:3000` — homepage loads, hero visible
- [ ] Browse by sport tiles visible, clicking one filters listings
- [ ] Search bar: type "cricket" → listings with "cricket" in title appear
- [ ] Filter: price range £0–£100 → results update
- [ ] Filter: condition "Like new" → results update
- [ ] Click a listing → detail page loads with photos, condition, price, seller badge
- [ ] Add to wishlist → redirected to login (not logged in)

### 1b. Sign up as new buyer
- [ ] Go to `/auth/signup`
- [ ] Enter `newbuyer@test.com`, `NewPass2024!` → submit
- [ ] Receive verification email (check console/Resend dashboard if RESEND_API_KEY set)
- [ ] (Dev shortcut) Manually set `email_verified = true` in DB or use buyer@test.com instead
- [ ] Login → token stored in localStorage as `kit_loop_token`
- [ ] Navbar shows avatar + notification bell

### 1c. Wishlist a listing
- [ ] Browse to the Babolat tennis racket listing (`[TEST] Babolat Pure Drive`)
- [ ] Click "Save" / heart icon → count increments
- [ ] Navigate away and return → listing still wishlisted

### 1d. Make an offer
- [ ] Open the Nike Football Boots listing
- [ ] Click "Make offer" → messages page opens with offer input
- [ ] Enter `£38` in offer field → send
- [ ] Thread appears in message list
- [ ] Switch to `seller@test.com` account
- [ ] Notification bell shows unread
- [ ] Open messages → thread visible with buyer's £38 offer
- [ ] Seller sends counter-offer: `£42` with message "Best I can do"
- [ ] Switch back to buyer account
- [ ] Notification bell + message badge show unread
- [ ] Open thread → counter-offer card visible with Accept / Decline buttons

### 1e. Accept counter-offer and checkout
- [ ] Click "Accept counter-offer" → status changes to accepted
- [ ] Click "Checkout" / banner → checkout page opens at £42 + fees
- [ ] Verify totals: £42 item + £4.99 shipping + £2.10 buyer protection = £49.09
- [ ] Enter delivery address: `12 Test Street, London, SW1A 1AA`
- [ ] Enter card: `4242 4242 4242 4242`, expiry `12/28`, CVC `123`
- [ ] Click "Pay £49.09" → Stripe processes
- [ ] Order confirmation page shown
- [ ] `GET /api/orders/purchases` includes the new order (status: awaiting_dispatch)
- [ ] Seller receives "New sale!" notification (check seller account)

### 1f. Confirm delivery and review
- [ ] Login as `seller@test.com`
- [ ] Go to orders → click "Mark as dispatched" → enter tracking `RM999999999GB`
- [ ] Switch to buyer account → order shows "Dispatched" status + tracking
- [ ] Click "Confirm delivery" → order status → completed
- [ ] Review modal appears automatically → select 5 stars → enter text → submit
- [ ] Seller's profile shows updated rating and review count

---

## Flow 2 — Seller Flow

### 2a. Create a listing
- [ ] Login as `seller@test.com`
- [ ] Click "Sell" in navbar → create listing page
- [ ] Select sport: "Tennis", sub-category: "Rackets"
- [ ] Select brand: "Wilson"
- [ ] Enter title: "Wilson Pro Staff 97 — UK 4 3/8"
- [ ] Select condition: "Good"
- [ ] Enter price: `£89.99`
- [ ] Select parcel size: "Large"
- [ ] Upload at least 1 photo (PNG/JPEG < 10 MB) → thumbnail appears
- [ ] Enter description (min 20 chars)
- [ ] Click "Save as draft" → listing saved with status "draft"
- [ ] Click "Publish" → listing status becomes "live"

### 2b. View live listing
- [ ] Navigate to the listing URL → shows publicly
- [ ] Log out → listing visible without auth
- [ ] Seller's "My Listings" page shows the listing

### 2c. Receive and dispatch an order
- [ ] (Use buyer@test.com to purchase the listing — see Flow 1e)
- [ ] Login as seller → notification bell shows "New sale!"
- [ ] Go to orders → order status: awaiting_dispatch
- [ ] Click "Mark as dispatched" → enter tracking number → confirm
- [ ] Order status → dispatched
- [ ] Buyer receives dispatch notification

### 2d. Holiday mode
- [ ] Go to Profile → toggle "Holiday mode" ON
- [ ] Verify listings remain visible but show holiday badge
- [ ] Toggle OFF → returns to normal

---

## Flow 3 — Dispute Flow

> **Setup:** Use the completed order seeded by testSeed.js as the starting point,
> OR complete a fresh purchase through Flow 1e.

### 3a. Raise a dispute
- [ ] Login as `buyer@test.com`
- [ ] Go to the recently completed order
- [ ] Click "Raise a dispute" (visible within 3 days of delivery)
- [ ] Select reason: "Item not as described"
- [ ] Enter description (min 20 chars): "The bat has a crack on the shoulder not shown in photos."
- [ ] Upload 1–3 evidence photos
- [ ] Submit → dispute status: Open
- [ ] Seller receives dispute notification

### 3b. Seller responds
- [ ] Login as `seller@test.com`
- [ ] Open the order → dispute banner shows "Open"
- [ ] Click "Respond to dispute"
- [ ] Enter seller response (min 10 chars)
- [ ] Upload evidence photo (optional)
- [ ] Submit → dispute status: Seller responded

### 3c. Admin rules (refund)
- [ ] Login as `admin@test.com` → navigate to `/api/admin/disputes` (or call via HTTP)
- [ ] `POST /api/admin/disputes/:id/rule` body:
  ```json
  {
    "ruling": "refund_buyer",
    "ruling_reason": "Evidence supports buyer — crack not visible in seller's photos.",
    "refund_amount": 85.00,
    "shipping_fee_refunded": true
  }
  ```
- [ ] Response: `{ "success": true, "message": "Dispute ruled successfully" }`
- [ ] Stripe Dashboard: refund appears on the original payment intent
- [ ] Order `payment_status` → `refunded`, `escrow_status` → `refunded`
- [ ] Buyer receives "Dispute resolved" notification
- [ ] Seller's `violation_count` increments by 1
- [ ] Seller's listing status → `flagged`
- [ ] (If seller has ≥ 3 violations in 90 days) Admin receives escalation notification

---

## Flow 4 — Admin Flow

> Use HTTP client (curl / Postman / Bruno) with admin JWT.
> Login first: `POST /api/auth/login` with `admin@test.com` / `KitLoop2024!`

### 4a. Flag a listing
```
POST /api/admin/listings/:id/flag
{ "reason": "Prohibited item description", "internal_note": "Seller warned" }
```
- [ ] Response 200 — listing status → `flagged`
- [ ] Seller receives "listing_flagged" notification
- [ ] Audit log row created with `action_type: listing_flagged`

### 4b. Restore a listing
```
POST /api/admin/listings/:id/restore
{ "internal_note": "Warning issued; restored" }
```
- [ ] Response 200 — listing status → `live`
- [ ] Audit log row: `listing_restored`

### 4c. Suspend a user
```
POST /api/admin/users/:id/suspend
{ "reason": "Repeated policy violations", "duration_days": 7 }
```
- [ ] Response 200 — user `account_status` → `suspended`
- [ ] All user sessions revoked (future requests return 401)
- [ ] `suspension_end_date` set to 7 days from now
- [ ] Audit log row: `user_suspended`
- [ ] autoReinstate job will clear this after 7 days (test manually: set `suspension_end_date` to past, run `runAutoReinstate()`)

### 4d. Update fee config
```
GET /api/admin/fees
→ copy the id for "buyer_protection_fee_percentage"

PATCH /api/admin/fees/:id
{ "config_value": 0.04, "internal_note": "Promotional reduction" }
```
- [ ] Response 200 — `config_value` updated
- [ ] `previous_value` preserved on the row
- [ ] Audit log row: `fee_updated`
- [ ] New checkout uses updated fee (verify: initiate a new checkout, total reflects 4% BPF)

### 4e. Approve seller badge
```
GET /api/admin/badges/queue
→ find a user with totalSales >= 5

POST /api/admin/badges/:userId/approve
{ "internal_note": "Meets all criteria, 5+ sales, 5.0 rating" }
```
- [ ] Response 200
- [ ] User `verified_seller` → `true`
- [ ] Seller badge record created with `action: granted`
- [ ] Seller receives "badge_granted" notification
- [ ] Seller's listing page shows verified badge

### 4f. List flagged orders
```
GET /api/admin/orders/flagged
```
- [ ] Returns orders with active disputes

---

## Flow 5 — Stripe Card Edge Cases

### 5a. Declined card
- [ ] At checkout, enter card `4000 0000 0000 0002`
- [ ] Expected: Stripe returns decline → frontend shows "Your card was declined"
- [ ] No order is created in DB

### 5b. 3D Secure card
- [ ] At checkout, enter card `4000 0025 0000 3155`
- [ ] Stripe shows 3DS authentication modal
- [ ] Click "Complete authentication" in the Stripe test modal
- [ ] Order created successfully

### 5c. 3D Secure — fail authentication
- [ ] Enter `4000 0025 0000 3155`
- [ ] In 3DS modal, click "Fail authentication"
- [ ] Expected: payment fails, no order created, error shown to user

---

## Edge Cases for Manual Testing

### Auth & Sessions
- [ ] Login on two tabs simultaneously — both sessions work independently
- [ ] Log out on tab 1 — tab 2 next API call gets 401 (session revoked)
- [ ] Attempt login with wrong password 5× → account lockout for 15 min
- [ ] Request password reset → token in email → use within 1hr → works
- [ ] Use password reset token twice → second use fails (token consumed)
- [ ] JWT tampered in localStorage → all API calls return 401

### Listings
- [ ] Create listing as buyer-role user → should be rejected (role check)
- [ ] Upload 0 photos → publish fails with validation error
- [ ] Upload a .exe file as photo → rejected (MIME type check)
- [ ] Set price to £0 → validation error
- [ ] Listing title with 81 characters → validation error (max 80)
- [ ] Try to buy your own listing → 400 SELF_PURCHASE error

### Messages & Offers
- [ ] Send a message containing an email address (e.g. "text me at test@gmail.com") → message blocked by content scan
- [ ] Send a phone number in message body → blocked
- [ ] Send a URL in message body → blocked
- [ ] Accept a counter-offer twice → second accept returns 409
- [ ] Counter-offer expires (wait past 24h or manually set `expires_at` to past) → status shows expired, cannot accept

### Checkout & Orders
- [ ] Navigate to checkout URL directly without initiating session → redirect to listing
- [ ] Checkout session expires (wait 15min or manipulate TTL) → checkout page shows expiry error
- [ ] Duplicate webhook delivery → confirm idempotency (order not created twice)
- [ ] Dispatch order that's already dispatched → 409
- [ ] Buyer confirms delivery before seller dispatches → 409
- [ ] Raise dispute after 3-day window → 409 with DISPUTE_WINDOW_CLOSED

### Disputes
- [ ] Raise dispute on order that already has a dispute → 409
- [ ] Seller submits response after 48hr deadline → should still be accepted (deadline only triggers escalation, not lockout)
- [ ] `POST /api/admin/disputes/:id/rule` with `release_seller` but seller has no Stripe Connect ID → 400 NO_STRIPE_CONNECT
- [ ] Dispute ruling with `partial_resolution` — verify both Stripe refund and transfer created

### Admin
- [ ] Non-admin user hits `GET /api/admin/listings` → 403 ADMIN_REQUIRED
- [ ] Admin tries to ban another admin → should succeed (no special protection)
- [ ] Hard delete user (`DELETE /api/admin/users/:id` with `{ "confirm": "DELETE" }`) → user soft-deleted, sessions revoked
- [ ] Hard delete without `"confirm": "DELETE"` in body → 400 validation error
- [ ] `autoReinstate` job: set `suspension_end_date` to 1 minute ago, wait for 01:00 UTC run → user reinstated

### Notifications
- [ ] 30s polling: trigger an event (new order) → notification bell updates without page refresh
- [ ] Mark single notification read → unread count decrements
- [ ] Mark all read → all items lose unread highlight

### Profile & Settings
- [ ] Change username to an already-taken username → 409 USERNAME_TAKEN
- [ ] Toggle holiday mode ON → all seller listings show holiday indicator
- [ ] Delete account: enter `DELETE` in confirmation field → account soft-deleted, immediate logout
- [ ] Login with deleted account → 401

---

## Pre-Launch Checklist

### Security
- [ ] All `/api/admin/*` routes return 403 without admin JWT — verify with curl (no auth header)
- [ ] SQL injection attempt in search param: `search='; DROP TABLE listings;--` → safe (Prisma parameterised queries)
- [ ] XSS in listing title: `<script>alert(1)</script>` → stored and rendered safely (React escapes)
- [ ] CORS: browser request from non-localhost origin is rejected
- [ ] Rate limiter: 101 requests in 15min from same IP → 429 Too Many Requests
- [ ] Stripe webhook secret verified (tampered payload rejected with 400)

### Data integrity
- [ ] Checkout price matches listing price at time of purchase (snapshot fields populated)
- [ ] Seller net amount = item price - 10% commission (verify arithmetic in Payment row)
- [ ] Dispute window: `dispute_window_expires_at` = `delivered_at` + 3 days
- [ ] Seller `total_sales` increments on order completion (not on payment)
- [ ] Seller `average_rating` recalculated correctly after each review

### Stripe
- [ ] Webhook `payment_intent.succeeded` → order created with `payment_status: held`
- [ ] Webhook `charge.refunded` → `payment_status` on Payment updated (if applicable)
- [ ] Webhook signature failure → 400 returned, no DB write

### Observability
- [ ] Server logs show `[autoRelease]`, `[counterOfferExpiry]`, `[disputeEscalation]`, `[autoReinstate]` on startup
- [ ] Health endpoint reachable: `GET /health` → `{"status":"ok"}`
- [ ] `POST /api/auth/login` with wrong password logs failed attempt count (no PII in logs)

### Environment
- [ ] `NODE_ENV=production` suppresses stack traces in error responses
- [ ] All required env vars present: `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLOUDINARY_*`
- [ ] No `console.log(user)` or raw DB objects logged to stdout in production
