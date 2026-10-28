

# **API Documentation**

# **Group 1: Auth**

**Base URL (local dev):** `http://localhost:3000/api` **Base URL (production):** `https://api.kitloop.com/api` *(placeholder — update once you choose your domain)*

**Auth method:** JWT (JSON Web Token) — issued on login/signup, sent in `Authorization: Bearer <token>` header on every authenticated request. Session expires after 30 days of inactivity per the SRS.

---

## **1\. Sign Up — Email**

**`POST /auth/signup/email`**

Creates a new account using email and password. Per the SRS, the account is not fully active (cannot transact) until the email is verified.

**Auth required:** No

**Request body:**

```json
{
  "email": "buyer@example.com",
  "password": "SecurePass123!",
  "username": "jameswilson"
}
```

**Validation rules (from SRS):**

* `email` — required, valid email format, must be unique  
* `password` — required, min 8 characters, at least 1 uppercase, 1 number, 1 special character  
* `username` — required, 3–30 characters, alphanumeric \+ underscores only, must be unique

**Success response — 201 Created:**

```json
{
  "success": true,
  "user": {
    "id": "a1b2c3d4-...",
    "email": "buyer@example.com",
    "username": "jameswilson",
    "email_verified": false,
    "role": "buyer"
  },
  "message": "Verification email sent. Please verify your email to start buying or selling."
}
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 400 | `INVALID_EMAIL` | Email format invalid |
| 400 | `WEAK_PASSWORD` | Password doesn't meet requirements |
| 400 | `INVALID_USERNAME` | Username fails format rules |
| 409 | `EMAIL_EXISTS` | "An account with this email already exists — log in instead" |
| 409 | `USERNAME_TAKEN` | "This username is already taken" |

---

## **2\. Verify Email**

**`GET /auth/verify-email?token=<verification_token>`**

Confirms the email verification link the user clicked.

**Auth required:** No (token in URL is the auth)

**Success response — 200 OK:**

```json
{
  "success": true,
  "message": "Email verified successfully.",
  "user": {
    "id": "a1b2c3d4-...",
    "email_verified": true
  }
}
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 400 | `TOKEN_EXPIRED` | Link older than 24 hours — "This verification link has expired" |
| 400 | `TOKEN_INVALID` | Token doesn't match any pending verification |

---

## **3\. Resend Verification Email**

**`POST /auth/resend-verification`**

**Auth required:** No

**Request body:**

```json
{ "email": "buyer@example.com" }
```

**Success response — 200 OK:**

```json
{ "success": true, "message": "Verification email resent." }
```

---

## **4\. Sign Up / Login — Google OAuth**

**`POST /auth/google`**

Single endpoint handles both sign up and login — if the Google email matches an existing account, it logs in; otherwise it creates a new account. Per the SRS, social sign up does not require separate email verification (Google has already verified it).

**Auth required:** No

**Request body:**

```json
{
  "google_id_token": "eyJhbGciOiJSUzI1NiIs..."
}
```

*(This token comes from Google's OAuth SDK on the frontend — the frontend handles the Google login popup/redirect and sends the resulting token here.)*

**Success response — 200 OK (existing user) or 201 Created (new user):**

```json
{
  "success": true,
  "is_new_user": false,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "a1b2c3d4-...",
    "email": "buyer@gmail.com",
    "username": "jameswilson",
    "display_name": "James Wilson",
    "avatar_url": "https://...",
    "role": "buyer",
    "email_verified": true
  }
}
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 401 | `INVALID_GOOGLE_TOKEN` | Google token verification failed |

---

## **5\. Sign Up / Login — Apple OAuth**

**`POST /auth/apple`**

Same pattern as Google. Handles Apple's private relay email if the user chooses to hide their email.

**Auth required:** No

**Request body:**

```json
{
  "apple_identity_token": "eyJhbGciOiJSUzI1NiIs...",
  "apple_user_id": "001234.abcd5678...",
  "display_name": "James Wilson"
}
```

*(`display_name` is only sent on first sign up — Apple only provides it once)*

**Success response — same shape as Google endpoint above**

---

## **6\. Login — Email**

**`POST /auth/login/email`**

**Auth required:** No

**Request body:**

```json
{
  "email": "buyer@example.com",
  "password": "SecurePass123!"
}
```

**Success response — 200 OK:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "a1b2c3d4-...",
    "email": "buyer@example.com",
    "username": "jameswilson",
    "role": "buyer",
    "email_verified": true,
    "account_status": "active"
  }
}
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 401 | `INVALID_CREDENTIALS` | "Incorrect email or password — please try again" |
| 423 | `ACCOUNT_LOCKED` | 5 failed attempts in 15 min — "Too many failed attempts — your account has been temporarily locked. Try again in 15 minutes." |
| 403 | `ACCOUNT_SUSPENDED` | Returns suspension reason and end date |
| 403 | `ACCOUNT_BANNED` | Account permanently banned |

---

## **7\. Forgot Password — Request Reset**

**`POST /auth/forgot-password`**

**Auth required:** No

**Request body:**

```json
{ "email": "buyer@example.com" }
```

**Success response — 200 OK:**

```json
{ "success": true, "message": "If an account exists with this email, a reset link has been sent." }
```

*(Note: always returns success even if email doesn't exist — this prevents attackers from using this endpoint to discover which emails are registered)*

---

## **8\. Forgot Password — Reset**

**`POST /auth/reset-password`**

**Auth required:** No

**Request body:**

```json
{
  "token": "reset_token_from_email_link",
  "new_password": "NewSecurePass456!"
}
```

**Success response — 200 OK:**

```json
{ "success": true, "message": "Password updated. Please log in with your new password." }
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 400 | `TOKEN_EXPIRED` | Link older than 1 hour |
| 400 | `WEAK_PASSWORD` | Doesn't meet password rules |

---

## **9\. Get Current User**

**`GET /auth/me`**

Returns the logged-in user's own profile. Used by the frontend on every page load to check if someone is authenticated and populate the navigation/profile.

**Auth required:** Yes

**Success response — 200 OK:**

```json
{
  "success": true,
  "user": {
    "id": "a1b2c3d4-...",
    "email": "buyer@example.com",
    "username": "jameswilson",
    "display_name": "James Wilson",
    "avatar_url": "https://...",
    "role": "buyer",
    "account_status": "active",
    "verified_seller": false,
    "average_rating": 4.7,
    "review_count": 31,
    "holiday_mode": false,
    "preferred_sports": ["cricket-uuid", "football-uuid"]
  }
}
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 401 | `UNAUTHORIZED` | No valid token provided |

---

## **10\. Log Out**

**`POST /auth/logout`**

Invalidates the current session token server-side.

**Auth required:** Yes

**Success response — 200 OK:**

```json
{ "success": true, "message": "Logged out successfully." }
```

---

## **11\. Revoke a Specific Session**

**`DELETE /auth/sessions/:session_id`**

Used from Settings → Security → Active Sessions, to log out a different device.

**Auth required:** Yes

**Success response — 200 OK:**

```json
{ "success": true, "message": "Session revoked." }
```

---

## **12\. List Active Sessions**

**`GET /auth/sessions`**

**Auth required:** Yes

**Success response — 200 OK:**

```json
{
  "success": true,
  "sessions": [
    {
      "session_id": "sess_abc123",
      "device": "iPhone 15 — Safari",
      "approximate_location": "London, UK",
      "last_active_at": "2026-06-18T14:30:00Z",
      "is_current_session": true
    },
    {
      "session_id": "sess_def456",
      "device": "Windows PC — Chrome",
      "approximate_location": "Manchester, UK",
      "last_active_at": "2026-06-15T09:12:00Z",
      "is_current_session": false
    }
  ]
}
```

---

## **13\. Enable Two-Factor Authentication**

**`POST /auth/2fa/enable`**

**Auth required:** Yes

**Request body:**

```json
{ "method": "authenticator_app" }
```

*(or `"method": "sms"` with an additional `"phone_number"` field)*

**Success response — 200 OK (authenticator app):**

```json
{
  "success": true,
  "qr_code_url": "data:image/png;base64,...",
  "secret_key": "JBSWY3DPEHPK3PXP"
}
```

---

## **14\. Confirm Two-Factor Setup**

**`POST /auth/2fa/confirm`**

**Auth required:** Yes

**Request body:**

```json
{ "code": "123456" }
```

**Success response — 200 OK:**

```json
{ "success": true, "two_factor_enabled": true }
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 400 | `INVALID_2FA_CODE` | "Invalid code — please check your authenticator app and try again" |

---

## **15\. Disable Two-Factor Authentication**

**`POST /auth/2fa/disable`**

**Auth required:** Yes

**Request body:**

```json
{
  "current_password": "SecurePass123!",
  "code": "123456"
}
```

*(Per SRS — disabling 2FA requires both password AND a valid 2FA code)*

**Success response — 200 OK:**

```json
{ "success": true, "two_factor_enabled": false }
```

---

## **16\. Change Password**

**`POST /auth/change-password`**

**Auth required:** Yes

**Request body:**

```json
{
  "current_password": "SecurePass123!",
  "new_password": "NewSecurePass456!",
  "confirm_password": "NewSecurePass456!"
}
```

**Success response — 200 OK:**

```json
{ "success": true, "message": "Password updated successfully." }
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 401 | `INCORRECT_PASSWORD` | "Current password is incorrect" |
| 400 | `PASSWORDS_DONT_MATCH` | Confirm doesn't match new |
| 400 | `WEAK_PASSWORD` | Doesn't meet requirements |

---

### **A note on how this maps to your database**

Every endpoint above reads or writes to the `users` table we built in migration `001_users.sql`. For example:

* Sign Up creates a row with `auth_provider`, `password_hash` (or leaves it null for OAuth), `email_verified = false`  
* Login checks `account_status` — this is where the suspended/banned checks from migration `001` get enforced in actual code  
* 2FA endpoints read/write `two_factor_enabled` and `two_factor_secret`

# **Group 2: Listings**

**Base URL:** `http://localhost:3000/api`

---

## **A. Listing CRUD (Seller-side)**

### **1\. Create Listing (Draft)**

**`POST /listings`**

Creates a new listing in draft status. Called as the seller fills out the sell form — typically the frontend calls this once all required fields are complete, right before Upload.

**Auth required:** Yes (any authenticated user)

**Request body:**

```json
{
  "title": "Gray-Nicolls Kronus 1500 Cricket Bat - Short Handle",
  "description": "Used for one season, minor surface scuff on the back face, does not affect performance.",
  "sport_id": "sport-uuid-cricket",
  "sub_category_id": "subcat-uuid-cricket-bat",
  "brand_id": "brand-uuid-gray-nicolls",
  "condition": "good",
  "colour": "Brown",
  "price": 89.00,
  "parcel_size": "large",
  "photos": [
    "https://cloudinary.com/.../photo1.jpg",
    "https://cloudinary.com/.../photo2.jpg"
  ],
  "video_url": null
}
```

**Validation rules (from SRS):**

* `title` — required, 5–80 characters  
* `description` — required, 20–1000 characters  
* `sport_id`, `sub_category_id`, `brand_id` — required, must reference active records  
* `condition` — required, one of: `new_with_tags`, `like_new`, `good`, `fair`  
* `colour` — required  
* `price` — required, £1.00–£9,999.00  
* `parcel_size` — required, one of: `small`, `medium`, `large`, `oversized`  
* `photos` — required, minimum 1, maximum 10

**Success response — 201 Created:**

```json
{
  "success": true,
  "listing": {
    "id": "listing-uuid-xyz",
    "status": "draft",
    "shipping_fee": 5.50,
    "created_at": "2026-06-19T10:00:00Z"
  }
}
```

*(`shipping_fee` is calculated server-side from `parcel_size` using the `fee_config` table — never trust a client-supplied shipping fee)*

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 400 | `VALIDATION_ERROR` | Returns field-by-field errors, e.g. `{"errors": {"title": "Title must be at least 5 characters"}}` |
| 400 | `MISSING_PHOTOS` | "Please add at least one photo before publishing" |
| 404 | `INVALID_CATEGORY` | sport\_id/sub\_category\_id doesn't exist or isn't active |
| 401 | `UNAUTHORIZED` | Not logged in |

---

### **2\. Publish Listing**

**`POST /listings/:id/publish`**

Moves a draft listing to live status. Separated from creation so the frontend can save a draft and publish in a distinct, explicit action (matches the "Upload" button in the SRS).

**Auth required:** Yes (must be the listing's seller)

**Success response — 200 OK:**

```json
{
  "success": true,
  "listing": {
    "id": "listing-uuid-xyz",
    "status": "live",
    "published_at": "2026-06-19T10:02:00Z",
    "og_image_url": "https://cloudinary.com/.../og-1200x630.jpg"
  }
}
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 400 | `INCOMPLETE_LISTING` | A required field is missing — lists which fields |
| 403 | `NOT_LISTING_OWNER` | User isn't the seller |
| 403 | `ACCOUNT_SUSPENDED` | Seller is suspended/banned — cannot publish |
| 403 | `HOLIDAY_MODE_ACTIVE` | Listing is created but stays paused, not an error — see note below |

**Note:** Per the SRS, if `holiday_mode = true` on the seller's account, the listing is created successfully but its status is set to `paused` instead of `live`. This isn't an error — the response just reflects `status: "paused"` instead.

---

### **3\. Get Listing Detail**

**`GET /listings/:id`**

Public endpoint — the listing detail page. Increments `view_count` on each call (debounced/throttled server-side to avoid inflating counts from rapid refreshes).

**Auth required:** No

**Success response — 200 OK:**

```json
{
  "success": true,
  "listing": {
    "id": "listing-uuid-xyz",
    "title": "Gray-Nicolls Kronus 1500 Cricket Bat - Short Handle",
    "description": "Used for one season...",
    "price": 89.00,
    "shipping_fee": 5.50,
    "condition": "good",
    "colour": "Brown",
    "parcel_size": "large",
    "status": "live",
    "photos": ["https://...", "https://..."],
    "video_url": null,
    "sport": { "id": "sport-uuid", "name": "Cricket", "slug": "cricket" },
    "sub_category": { "id": "subcat-uuid", "name": "Cricket bat" },
    "brand": { "id": "brand-uuid", "name": "Gray-Nicolls" },
    "seller": {
      "id": "user-uuid",
      "username": "jameswilson",
      "avatar_url": "https://...",
      "average_rating": 4.7,
      "review_count": 31,
      "verified_seller": true,
      "member_since": "2025-03-01"
    },
    "view_count": 142,
    "wishlist_count": 8,
    "is_wishlisted_by_current_user": false,
    "created_at": "2026-06-19T10:02:00Z"
  }
}
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 404 | `LISTING_NOT_FOUND` | No listing with this ID |
| 410 | `LISTING_UNAVAILABLE` | Listing exists but is `sold`/`removed`/`paused`/`flagged` — returns minimal data \+ suggested sport for "Browse Similar" |

**410 response example:**

```json
{
  "success": false,
  "error": "LISTING_UNAVAILABLE",
  "message": "This item is no longer available",
  "sport_slug": "cricket"
}
```

---

### **4\. Update Listing**

**`PUT /listings/:id`**

**Auth required:** Yes (must be the listing's seller)

**Request body:** same shape as Create, any subset of editable fields

**Success response — 200 OK:**

```json
{
  "success": true,
  "listing": { "id": "listing-uuid-xyz", "updated_at": "2026-06-19T11:00:00Z" }
}
```

**Important:** Per the SRS, editing a listing's price or details after a sale must NEVER alter the `orders` table's snapshot fields. This endpoint only ever touches the `listings` table.

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 403 | `NOT_LISTING_OWNER` | — |
| 409 | `LISTING_SOLD` | Cannot edit a sold listing |

---

### **5\. Delete / Remove Own Listing**

**`DELETE /listings/:id`**

Seller removing their own listing (different from admin removal — see Group 8).

**Auth required:** Yes (must be the listing's seller)

**Success response — 200 OK:**

```json
{ "success": true, "message": "Listing removed." }
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 409 | `ACTIVE_ORDER_EXISTS` | Cannot delete while an order is in progress |

---

### **6\. Get My Listings (Seller)**

**`GET /listings/mine`**

Powers Profile → View My Listings.

**Auth required:** Yes

**Query params:** `?status=live` (optional filter: `draft`, `live`, `sold`, `paused`, `flagged`)

**Success response — 200 OK:**

```json
{
  "success": true,
  "listings": [
    {
      "id": "listing-uuid-xyz",
      "title": "Gray-Nicolls Kronus 1500 Cricket Bat",
      "price": 89.00,
      "status": "live",
      "photos": ["https://..."],
      "view_count": 142,
      "created_at": "2026-06-19T10:02:00Z"
    }
  ],
  "pagination": { "page": 1, "page_size": 20, "total": 4 }
}
```

---

## **B. Search, Browse & Filter (Buyer-side)**

### **7\. Search / Browse Listings**

**`GET /listings`**

The single endpoint powering homepage Featured Listings, sport-filtered browse, full search, and all filter combinations. Every query param is optional and combinable.

**Auth required:** No

**Query params:**

| Param | Example | Notes |
| ----- | ----- | ----- |
| `q` | `cricket bat` | Keyword search — matches title, description, brand, category |
| `sport` | `cricket` | Sport slug, comma-separated for multiple: `cricket,football` |
| `sub_category` | `cricket-bat` | Sub-category slug |
| `condition` | `good,like_new` | Comma-separated, OR logic |
| `brand` | `gray-nicolls,wilson` | Comma-separated, OR logic |
| `colour` | `black,brown` | Comma-separated, OR logic |
| `price_min` | `0` | — |
| `price_max` | `150` | — |
| `sort` | `newest` | One of: `newest`, `oldest`, `price_asc`, `price_desc` (default: `newest`) |
| `featured` | `true` | Only featured listings (homepage use) |
| `page` | `1` | Default 1 |
| `page_size` | `20` | Default 20, max 100 |

**Success response — 200 OK:**

```json
{
  "success": true,
  "listings": [
    {
      "id": "listing-uuid-xyz",
      "title": "Gray-Nicolls Kronus 1500 Cricket Bat",
      "price": 89.00,
      "condition": "good",
      "colour": "Brown",
      "photos": ["https://..."],
      "sport": { "name": "Cricket", "slug": "cricket" },
      "brand": { "name": "Gray-Nicolls" },
      "created_at": "2026-06-19T10:02:00Z"
    }
  ],
  "pagination": { "page": 1, "page_size": 20, "total_results": 23, "total_pages": 2 },
  "available_filters": {
    "brands": [{ "id": "...", "name": "Gray-Nicolls", "count": 4 }],
    "colours": [{ "name": "Brown", "count": 6 }],
    "price_range": { "min": 18.00, "max": 733.95 }
  }
}
```

**Note on `available_filters`:** per the SRS, the Brand and Colour filters only show options present in the *current* result set, not the whole platform. This block tells the frontend exactly what to render in the filter sidebar based on the current query — it recalculates on every search call.

**Business rule enforced here:** only listings with `status = 'live'` are ever returned. Pending, flagged, removed, sold, and paused listings never appear, regardless of filters.

---

### **8\. Homepage Data (Composite Endpoint)**

**`GET /home`**

A single call for the whole homepage — sports list with highlight states, plus featured listings — to minimise round trips on the highest-traffic page.

**Auth required:** No (optional — see personalisation note)

**Success response — 200 OK:**

```json
{
  "success": true,
  "sports": [
    {
      "id": "sport-uuid",
      "name": "Cricket",
      "slug": "cricket",
      "icon_url": "https://...",
      "listing_count": 47,
      "is_seasonal_highlight": true
    }
  ],
  "featured_listings": [
    {
      "id": "listing-uuid",
      "title": "Callaway Rogue ST MAX Driver",
      "price": 189.99,
      "photos": ["https://..."]
    }
  ]
}
```

If the request includes a valid `Authorization` header, the backend personalises `sports` ordering using `users.preferred_sports` (Beta behaviour from the Home Page SRS). If no token, default admin-configured order is used. This is the kind of detail you should literally paste into Claude Code so it builds the conditional logic correctly.

---

## **C. Reference Data (Sports, Sub-Categories, Brands)**

These power dropdowns in the sell form and filter sidebar. All public, all cacheable.

### **9\. List All Sports**

**`GET /sports`**

**Auth required:** No

**Success response — 200 OK:**

```json
{
  "success": true,
  "sports": [
    { "id": "sport-uuid", "name": "Cricket", "slug": "cricket", "icon_url": "https://...", "display_order": 1 }
  ]
}
```

*(Only `status = 'active'` sports returned)*

---

### **10\. List Sub-Categories for a Sport**

**`GET /sports/:sport_id/sub-categories`**

**Auth required:** No

**Success response — 200 OK:**

```json
{
  "success": true,
  "sub_categories": [
    {
      "id": "subcat-uuid",
      "name": "Cricket bat",
      "slug": "cricket-bat",
      "recommended_parcel_size": "large",
      "is_oversized": false
    }
  ]
}
```

This is the exact endpoint that powers the parcel-size auto-recommendation from the Choose Parcel Size SRS — the frontend calls this when a sport is selected, gets the sub-category list with `recommended_parcel_size` already attached, and uses it to pre-populate and grey out options the moment the seller picks a sub-category.

---

### **11\. List All Brands**

**`GET /brands`**

**Auth required:** No

**Query params:** `?search=gray` (optional, for the searchable brand picker if list \>20)

**Success response — 200 OK:**

```json
{
  "success": true,
  "brands": [
    { "id": "brand-uuid", "name": "Gray-Nicolls", "slug": "gray-nicolls", "logo_url": "https://..." }
  ]
}
```

---

## **D. Share**

### **12\. Record a Share Event**

**`POST /listings/:id/share`**

Fires when a user taps a share destination — used purely for analytics per the Share a Listing SRS.

**Auth required:** No (sharing doesn't require auth)

**Request body:**

```json
{
  "destination": "whatsapp",
  "surface": "listing_detail"
}
```

**Success response — 200 OK:**

```json
{ "success": true }
```

---

### **13\. Get Listing Share Preview Data**

**`GET /listings/:id/share-preview`**

Returns the data needed to build the share bottom sheet (separate from the full `GET /listings/:id` call to keep it lightweight if called independently).

**Auth required:** No

**Success response — 200 OK:**

```json
{
  "success": true,
  "title": "Gray-Nicolls Kronus 1500 Cricket Bat",
  "price": 89.00,
  "condition": "good",
  "primary_photo": "https://...",
  "share_url": "https://kit-loop-gear.base44.app/listing/listing-uuid-xyz"
}
```

Note: the actual Open Graph meta tags (`og:title`, `og:image`, etc.) for social media link previews are NOT served by this API endpoint — they must be server-side rendered directly into the HTML `<head>` of the listing detail page itself, per the SRS requirement that crawlers don't execute JavaScript. This is a frontend/Next.js concern, not a separate API call — worth flagging to Claude Code explicitly when you build the listing detail page.

---

## **E. Favourites / Wishlist**

### **14\. Toggle Wishlist**

**`POST /listings/:id/favourite`**

Single toggle endpoint — adds if not saved, removes if already saved. Matches the SRS's "tap heart again to remove" behaviour.

**Auth required:** Yes

**Success response — 200 OK:**

```json
{ "success": true, "is_favourited": true, "wishlist_count": 9 }
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 403 | `OWN_LISTING` | Cannot wishlist your own listing |

---

### **15\. Get My Favourites**

**`GET /favourites`**

**Auth required:** Yes

**Success response — 200 OK:**

```json
{
  "success": true,
  "favourites": [
    {
      "listing_id": "listing-uuid-xyz",
      "title": "Bullpadel Vertex 03 Padel Racket",
      "price": 195.00,
      "condition": "like_new",
      "photos": ["https://..."],
      "is_available": true,
      "saved_at": "2026-06-10T08:00:00Z"
    }
  ],
  "pagination": { "page": 1, "page_size": 20, "total": 6 }
}
```

*(`is_available: false` when the saved listing has since sold/been removed — frontend shows "No longer available" per SRS, never silently drops it from the list)*

---

### **A note on how this maps to your database**

Every read here hits `listings` (migration 005), joined with `sports`, `sub_categories`, `brands` (002, 003, 004), and `users` for seller info (001). The search endpoint is the one to pay closest attention to performance-wise — it's why we put indexes on `sport_id`, `sub_category_id`, `brand_id`, `condition`, `price`, and `colour` back in the ERD work. Worth explicitly telling Claude Code: "use the existing indexes, don't do full table scans" when it writes this query.

# **Group 3: Orders & Checkout**

**Base URL:** `http://localhost:3000/api`

This group covers the full buyer purchase journey — from tapping Buy Now through to escrow being held — plus the seller-facing dispatch flow and buyer's delivery confirmation. Stripe-specific payment processing details (PaymentIntents, webhooks, payouts) live in **Group 4**, since payments is its own table and its own concern. This group is about the `orders` table and the business logic around it.

---

## **A. Checkout Flow (Buyer-side)**

### **1\. Initiate Checkout**

**`POST /checkout/initiate`**

Called the moment a buyer taps Buy Now. Validates the listing is still purchasable, locks in pricing (including any accepted counter-offer), and returns everything the Checkout page needs to render the Order Summary — without yet creating an order or touching payment.

**Auth required:** Yes

**Request body:**

```json
{
  "listing_id": "listing-uuid-xyz",
  "counter_offer_id": null
}
```

*(`counter_offer_id` is populated only when the buyer arrived here via "Accept" on a counter-offer card — see Group 5\)*

**Success response — 200 OK:**

```json
{
  "success": true,
  "checkout_session": {
    "listing_id": "listing-uuid-xyz",
    "listing_title": "Bullpadel Vertex 03 Padel Racket",
    "listing_photo": "https://...",
    "seller_username": "liamobrien",
    "condition": "like_new",
    "item_price": 195.00,
    "shipping_fee": 3.50,
    "buyer_protection_fee": 10.45,
    "total_amount": 208.95,
    "price_source": "listed",
    "checkout_session_expires_at": "2026-06-19T11:30:00Z"
  }
}
```

*(`price_source` is `"listed"` or `"counter_offer"` — tells the frontend whether to show "Negotiated price" messaging)*

**Business rule enforced here (per Checkout SRS):** the price shown is locked at this moment and used for the rest of the checkout session, even if the seller edits the listing price before the buyer finishes paying.

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 404 | `LISTING_NOT_FOUND` | — |
| 410 | `LISTING_UNAVAILABLE` | Listing sold/removed/paused since buyer last viewed it |
| 403 | `OWN_LISTING` | Seller cannot buy their own listing |
| 403 | `ACCOUNT_SUSPENDED` | Buyer's own account is suspended |
| 410 | `COUNTER_OFFER_EXPIRED` | The referenced counter-offer's checkout price lock has expired |

---

### **2\. Submit Delivery Address**

**`POST /checkout/:checkout_session_id/address`**

**Auth required:** Yes

**Request body:**

```json
{
  "address_line1": "123 High Street",
  "address_line2": "",
  "city": "London",
  "postcode": "SW1A 1AA"
}
```

**Validation rules (from SRS):**

* `address_line1` — required, max 100 chars  
* `city` — required, max 60 chars, letters only  
* `postcode` — required, valid UK postcode format

**Success response — 200 OK:**

```json
{
  "success": true,
  "estimated_delivery": {
    "from": "2026-06-23",
    "to": "2026-06-27"
  }
}
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 400 | `INVALID_POSTCODE` | "Please enter a valid UK postcode" |
| 400 | `NON_UK_ADDRESS` | "We currently only deliver within the UK" |

---

### **3\. Create Payment Intent**

**`POST /checkout/:checkout_session_id/payment-intent`**

Creates a Stripe PaymentIntent for the locked checkout total. The frontend uses the returned `client_secret` to render Stripe's payment element (card / Apple Pay / Google Pay) and confirm payment client-side. This is the handoff point to Stripe — full detail on what happens after Stripe confirms is in Group 4\.

**Auth required:** Yes

**Request body:**

```json
{ "payment_method_type": "card" }
```

**Success response — 200 OK:**

```json
{
  "success": true,
  "client_secret": "pi_3Nxxx_secret_yyy",
  "stripe_publishable_key": "pk_test_..."
}
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 400 | `ADDRESS_MISSING` | Must complete address step first |
| 410 | `SESSION_EXPIRED` | Checkout session timed out (30 min) |

---

### **4\. Confirm Order (Post-Payment)**

**`POST /checkout/:checkout_session_id/confirm`**

Called by the frontend immediately after Stripe confirms the payment succeeded client-side. **This is the endpoint that actually creates the row in `orders`.** It also fires the Stripe webhook handler as a backup confirmation path (see Group 4\) — this endpoint should be treated as the fast path, the webhook as the guaranteed path, in case the buyer closes their browser mid-confirmation.

**Auth required:** Yes

**Request body:**

```json
{ "payment_intent_id": "pi_3Nxxx" }
```

**Success response — 201 Created:**

```json
{
  "success": true,
  "order": {
    "id": "order-uuid-abc",
    "listing_id": "listing-uuid-xyz",
    "item_price": 195.00,
    "shipping_fee": 3.50,
    "buyer_protection_fee": 10.45,
    "total_amount": 208.95,
    "fulfilment_status": "awaiting_dispatch",
    "payment_status": "held",
    "tracking_number": null
  }
}
```

**What this endpoint does internally (worth telling Claude Code explicitly):**

1. Verifies the PaymentIntent status with Stripe is `succeeded`  
2. Creates the `orders` row — copying `snapshot_listing_title`, `snapshot_condition`, `snapshot_photos` from the listing **at this exact moment**  
3. Creates the linked `payments` row with `escrow_status = 'held'`  
4. Sets `listings.status = 'sold'` and `listings.sold_at = now()`  
5. If this order resulted from an accepted counter-offer, updates that `counter_offers.status = 'accepted'` (if not already)  
6. Sends notifications: buyer gets order confirmation, seller gets "New Sale — Dispatch now"  
7. Sets `orders.dispute_window_expires_at` to NULL for now — this only gets set once the item is delivered (see endpoint 7 below)

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 402 | `PAYMENT_NOT_SUCCEEDED` | Stripe shows the PaymentIntent didn't succeed |
| 409 | `LISTING_ALREADY_SOLD` | Race condition — another buyer's order was confirmed first; this buyer's payment is automatically refunded server-side and this error explains why |

**This 409 case is the most important edge case in the whole API.** Two buyers can both pass payment with Stripe within seconds of each other on a popular listing. Whichever `confirm` call reaches the database first wins — wrapped in a transaction that checks `listings.status = 'live'` before flipping it to `sold`. The second call must auto-refund and return this error. Flag this specifically to Claude Code as a "must use a database transaction with row locking" requirement — it's the kind of bug that's invisible until your platform actually has concurrent traffic.

---

## **B. Buyer Order Management**

### **5\. Get My Orders (Buyer — Purchases)**

**`GET /orders/purchases`**

Powers Buyer → My Orders.

**Auth required:** Yes

**Query params:** `?status=awaiting_dispatch` (optional)

**Success response — 200 OK:**

```json
{
  "success": true,
  "orders": [
    {
      "id": "order-uuid-abc",
      "listing_title": "Bullpadel Vertex 03 Padel Racket",
      "listing_photo": "https://...",
      "seller_username": "liamobrien",
      "total_amount": 208.95,
      "fulfilment_status": "dispatched",
      "tracking_number": "RM123456789GB",
      "created_at": "2026-06-19T11:15:00Z"
    }
  ],
  "pagination": { "page": 1, "page_size": 20, "total": 3 }
}
```

---

### **6\. Get Order Detail**

**`GET /orders/:id`**

**Auth required:** Yes (must be the buyer or seller on this order, or admin)

**Success response — 200 OK:**

```json
{
  "success": true,
  "order": {
    "id": "order-uuid-abc",
    "listing": {
      "id": "listing-uuid-xyz",
      "title": "Bullpadel Vertex 03 Padel Racket",
      "photos": ["https://..."],
      "condition": "like_new"
    },
    "buyer": { "id": "user-uuid-1", "username": "buyer1" },
    "seller": { "id": "user-uuid-2", "username": "liamobrien" },
    "item_price": 195.00,
    "shipping_fee": 3.50,
    "buyer_protection_fee": 10.45,
    "total_amount": 208.95,
    "seller_net_amount": 175.50,
    "fulfilment_status": "dispatched",
    "payment_status": "held",
    "dispute_status": "none",
    "tracking_number": "RM123456789GB",
    "delivery_address": {
      "line1": "123 High Street",
      "line2": "",
      "city": "London",
      "postcode": "SW1A 1AA"
    },
    "timeline": {
      "created_at": "2026-06-19T11:15:00Z",
      "dispatched_at": "2026-06-20T09:00:00Z",
      "delivered_at": null,
      "completed_at": null
    },
    "dispute_window_expires_at": null,
    "can_raise_dispute": false,
    "can_confirm_delivery": false
  }
}
```

*(`can_raise_dispute` and `can_confirm_delivery` are pre-computed booleans the frontend uses to show/hide buttons — saves the frontend from re-implementing the eligibility rules from the SRS)*

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 403 | `NOT_ORDER_PARTY` | User is neither the buyer, seller, nor admin on this order |
| 404 | `ORDER_NOT_FOUND` | — |

---

### **7\. Confirm Delivery**

**`POST /orders/:id/confirm-delivery`**

Buyer confirms they've received the item. This triggers escrow release — the single most consequential endpoint in the buyer flow.

**Auth required:** Yes (must be the order's buyer)

**Success response — 200 OK:**

```json
{
  "success": true,
  "order": {
    "id": "order-uuid-abc",
    "fulfilment_status": "completed",
    "payment_status": "released",
    "completed_at": "2026-06-23T14:00:00Z"
  },
  "review_prompt": true
}
```

**What this endpoint does internally:**

1. Sets `orders.delivered_at` and `orders.completed_at`  
2. Sets `orders.fulfilment_status = 'completed'`, `orders.payment_status = 'released'`  
3. Triggers a Stripe Transfer to the seller's Connect account (see Group 4\) and updates `payments.escrow_status = 'released'`  
4. Increments `users.total_sales` on the seller  
5. Prompts the buyer to leave a review (response flag `review_prompt: true` tells frontend to show that screen — see Group 6\)

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 403 | `NOT_ORDER_BUYER` | — |
| 409 | `INVALID_STATUS` | Order isn't in `dispatched` status — can't confirm delivery on an order not yet shipped |
| 409 | `DISPUTE_ACTIVE` | Cannot confirm delivery while a dispute is open on this order |

---

### **8\. Auto-Release Escrow (System / Scheduled Job)**

**`POST /system/orders/auto-release`** *(internal — not called by frontend)*

A scheduled job (cron) that runs periodically and auto-releases escrow for any order where the buyer hasn't confirmed delivery or raised a dispute within the platform's confirmation window after delivery.

**Auth required:** Internal service key only — never exposed to frontend or public internet

**Behaviour:** Finds all orders where `fulfilment_status = 'dispatched'` and the dispute window has expired with no active dispute, then runs the same escrow-release logic as endpoint 7\.

Flagging this now even though it's not buyer/seller-facing: this is the kind of background job a beginner often forgets to build, then wonders why test orders sit in limbo forever. Tell Claude Code explicitly: "set up a scheduled job (node-cron, or a Supabase Edge Function on a schedule) that runs this auto-release logic daily."

---

## **C. Seller Order Management**

### **9\. Get My Sales Orders (Seller)**

**`GET /orders/sales`**

Powers Seller → My Sales.

**Auth required:** Yes

**Query params:** `?status=awaiting_dispatch`

**Success response — 200 OK:**

```json
{
  "success": true,
  "orders": [
    {
      "id": "order-uuid-abc",
      "listing_title": "Bullpadel Vertex 03 Padel Racket",
      "listing_photo": "https://...",
      "buyer_username": "buyer1",
      "item_price": 195.00,
      "fulfilment_status": "awaiting_dispatch",
      "created_at": "2026-06-19T11:15:00Z"
    }
  ],
  "pagination": { "page": 1, "page_size": 20, "total": 5 }
}
```

---

### **10\. Mark Order as Dispatched**

**`POST /orders/:id/dispatch`**

**Auth required:** Yes (must be the order's seller)

**Request body:**

```json
{ "tracking_number": "RM123456789GB" }
```

*(`tracking_number` is optional per the SRS — strongly encouraged, not mandatory)*

**Success response — 200 OK:**

```json
{
  "success": true,
  "order": {
    "id": "order-uuid-abc",
    "fulfilment_status": "dispatched",
    "tracking_number": "RM123456789GB",
    "dispatched_at": "2026-06-20T09:00:00Z"
  }
}
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 403 | `NOT_ORDER_SELLER` | — |
| 409 | `INVALID_STATUS` | Order isn't `awaiting_dispatch` — already dispatched or cancelled |
| 400 | `INVALID_TRACKING_FORMAT` | Alphanumeric only, max 50 chars |

**Irreversible action, per SRS** — there is intentionally no "undo dispatch" endpoint. If a seller makes a mistake, that's a support/admin intervention, not a self-service API call.

---

### **A note on how this maps to your database**

This group is the busiest write path in your entire app, and the one most worth stress-testing before launch. Endpoint 4 (Confirm Order) writes to **three tables in a single transaction** — `orders`, `payments`, and `listings` — and that transaction is exactly where the database constraints we built in `006_orders.sql` earn their keep: `chk_orders_distinct_parties` and `chk_orders_total_matches` will reject a bad write at the database level even if a bug in your application code tries to push one through.

When you hand this to Claude Code, explicitly say: **"Endpoint 4 must use a single database transaction across orders, payments, and listings — if any step fails, roll back all three."** This is the single highest-value instruction you can give it for this group.

# **Group 4: Payments & Payouts**

**Base URL:** `http://localhost:3000/api`

This group covers everything Stripe-related that sits behind the scenes of checkout — webhook handling (the most important endpoint in your entire app, despite being invisible to users), seller balance, payout requests, and saved payment methods. Group 3 created the order and PaymentIntent; this group handles what Stripe tells you back, and what happens to money after that.

---

## **A. Stripe Webhooks (Critical — Internal)**

### **1\. Stripe Webhook Receiver**

**`POST /webhooks/stripe`**

**This is the single most important endpoint in the entire platform.** Stripe calls this URL directly whenever something happens on their side — a payment succeeds, a payment fails, a transfer completes, a refund processes. It is the *source of truth*, not a convenience. Endpoint 4 in Group 3 (`/checkout/:id/confirm`) is the fast path that makes the app feel instant for the buyer — but if that call never fires (buyer closes their laptop the second they pay, network drops, app crashes), this webhook is what guarantees the order still gets created correctly. **Never rely solely on the frontend telling you payment succeeded.**

**Auth required:** No standard auth — instead, verified via Stripe's webhook signature (`Stripe-Signature` header), which only Stripe's servers can produce correctly using your webhook secret key.

**Request body:** Sent entirely by Stripe — not something your frontend ever calls. Example payload shape for one event type:

```json
{
  "id": "evt_1Nxxx",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_3Nxxx",
      "amount": 20895,
      "status": "succeeded",
      "metadata": {
        "checkout_session_id": "cs_uuid",
        "listing_id": "listing-uuid-xyz",
        "buyer_id": "user-uuid-1"
      }
    }
  }
}
```

**Events this endpoint must handle:**

| Stripe Event | What it means | What your backend does |
| ----- | ----- | ----- |
| `payment_intent.succeeded` | Payment confirmed | If order doesn't already exist (buyer's browser-side confirm call didn't reach the server), create it now — same logic as Group 3 endpoint 4 |
| `payment_intent.payment_failed` | Card declined etc. | Log it, no order created, nothing for buyer to do but retry at checkout |
| `transfer.created` | Seller payout transfer initiated | Update `payments.payout_status = 'initiated'`, `payments.payout_initiated_at` |
| `transfer.paid` | Money has landed in seller's bank | Update `payments.payout_status = 'completed'`, `payments.payout_completed_at` |
| `charge.refunded` | A refund was processed (from a dispute ruling) | Update `payments.amount_refunded`, `payments.escrow_status` |
| `charge.dispute.created` | **Stripe-level** chargeback (different from your platform's own dispute system — buyer went to their bank, not to you) | Flag the order urgently for admin review — see Exceptional Case noted in your dispute SRS |

**Success response — 200 OK (required within a few seconds, or Stripe will retry):**

```json
{ "received": true }
```

**Error handling:** Always return `200 OK` once you've safely recorded the event, even if your internal processing has a problem you need to investigate separately — returning an error code makes Stripe retry the same event repeatedly, which can cause duplicate processing. Instead, log failures internally and process them out-of-band.

**Tell Claude Code explicitly:** "Every webhook handler must be idempotent — store the Stripe event `id` and check if you've already processed it before acting, because Stripe can and will deliver the same event more than once." This single sentence prevents an entire category of bugs (double-crediting a seller, double-sending a notification) that are very hard to debug after the fact.

---

## **B. Seller Balance & Payouts**

### **2\. Get My Balance**

**`GET /payments/balance`**

Powers Profile → Balance for sellers.

**Auth required:** Yes

**Success response — 200 OK:**

```json
{
  "success": true,
  "balance": {
    "cleared_balance": 412.30,
    "pending_balance": 89.00,
    "total_earned": 1893.75,
    "minimum_payout": 1.00,
    "bank_account_linked": true
  }
}
```

**Calculation logic (worth specifying to Claude Code):**

* `cleared_balance` \= SUM of `payments.amount_seller_payout` where `payments.escrow_status = 'released'` AND `payments.payout_status` is `null` or `'pending'` (i.e. released by escrow, but not yet paid out)  
* `pending_balance` \= SUM of `payments.amount_seller_payout` where `payments.escrow_status = 'held'`  
* `total_earned` \= SUM of `payments.amount_seller_payout` across all time where `escrow_status = 'released'`, regardless of payout status

---

### **3\. Get Transaction History**

**`GET /payments/transactions`**

Powers the transaction list under Balance.

**Auth required:** Yes

**Query params:** `?page=1&page_size=20`

**Success response — 200 OK:**

```json
{
  "success": true,
  "transactions": [
    {
      "order_id": "order-uuid-abc",
      "listing_title": "Bullpadel Vertex 03 Padel Racket",
      "gross_amount": 195.00,
      "commission_deducted": 19.50,
      "net_amount": 175.50,
      "status": "cleared",
      "date": "2026-06-23T14:00:00Z"
    }
  ],
  "pagination": { "page": 1, "page_size": 20, "total": 14 }
}
```

*(`status` is one of `cleared`, `pending`, `refunded` — a simplified view derived from `payments.escrow_status` \+ `payments.payout_status`)*

---

### **4\. Request Payout**

**`POST /payments/payout`**

**Auth required:** Yes

**Request body:** *(none needed — pays out full cleared balance per the SRS: "no maximum payout amount, seller can withdraw their full cleared balance")*

```json
{}
```

**Success response — 200 OK:**

```json
{
  "success": true,
  "payout": {
    "amount": 412.30,
    "destination_bank_masked": "**-**-12 / ****5678",
    "status": "initiated",
    "estimated_arrival": "1-3 business days"
  }
}
```

**What this endpoint does internally:**

1. Re-checks `cleared_balance` server-side (never trust a client-supplied amount)  
2. Calls Stripe's Transfer API to move funds to the seller's `stripe_connect_id`  
3. Sets `payments.payout_status = 'initiated'` on all included transactions  
4. The actual `'completed'` status arrives later via the `transfer.paid` webhook (endpoint 1\)

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 400 | `BELOW_MINIMUM` | "Minimum payout amount is £1.00" |
| 400 | `NO_BANK_ACCOUNT` | "Add a bank account in Settings → Payments to request a payout" |
| 403 | `ACCOUNT_SUSPENDED` | Suspended sellers cannot request payout |

---

## **C. Saved Payment Methods (Buyer) & Bank Account (Seller)**

### **5\. Get Saved Payment Methods**

**`GET /payments/methods`**

**Auth required:** Yes

**Success response — 200 OK:**

```json
{
  "success": true,
  "cards": [
    {
      "id": "pm_1Nxxx",
      "brand": "visa",
      "last4": "4242",
      "exp_month": 12,
      "exp_year": 2026,
      "is_default": true
    }
  ]
}
```

*(Card data comes directly from Stripe's API on each call — your database never stores raw card details, only `stripe_customer_id` on the `users` table, per the SRS's PCI compliance requirement)*

---

### **6\. Add Card**

**`POST /payments/methods`**

**Auth required:** Yes

**Request body:**

```json
{ "stripe_payment_method_id": "pm_1Nxxx" }
```

*(The frontend collects raw card details using Stripe's hosted card element — your backend never sees raw card numbers, only the tokenised `payment_method_id` Stripe hands back)*

**Success response — 201 Created:**

```json
{ "success": true, "card": { "id": "pm_1Nxxx", "brand": "visa", "last4": "4242" } }
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 400 | `MAX_CARDS_REACHED` | "You have reached the maximum of 3 saved cards" |

---

### **7\. Remove Card**

**`DELETE /payments/methods/:payment_method_id`**

**Auth required:** Yes

**Success response — 200 OK:**

```json
{ "success": true }
```

---

### **8\. Add / Update Bank Account (Payout Destination)**

**`POST /payments/bank-account`**

**Auth required:** Yes

**Request body:**

```json
{ "stripe_bank_account_token": "btok_1Nxxx" }
```

*(Same pattern — frontend uses Stripe Connect's secure onboarding form, your backend only ever receives a token, never raw sort code/account number)*

**Success response — 200 OK:**

```json
{
  "success": true,
  "bank_account": {
    "account_holder_name": "James Wilson",
    "sort_code_masked": "**-**-12",
    "account_number_masked": "****5678"
  }
}
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 400 | `INVALID_SORT_CODE` | — |
| 400 | `STRIPE_VERIFICATION_FAILED` | "We were unable to verify your bank account — please check your details and try again" |

---

### **9\. Remove Bank Account**

**`DELETE /payments/bank-account`**

**Auth required:** Yes

**Success response — 200 OK:**

```json
{ "success": true, "message": "Bank account removed. You will not be able to receive payouts until a new account is added." }
```

---

### **A note on how this maps to your database**

This is the group where the line between "your database" and "Stripe's database" matters most. Your `payments` table (migration 007\) deliberately mirrors Stripe's IDs (`stripe_payment_intent_id`, `stripe_transfer_id`, etc.) precisely so you can always cross-reference — but Stripe remains the actual source of truth for money movement. If your database and Stripe's dashboard ever disagree, **Stripe is right and your database has a bug**, never the other way round.

One thing worth deciding now, before Claude Code writes a line of this: **you need a Stripe Connect account type decision.** For a marketplace like The Kit Loop where sellers receive payouts, you'll use **Stripe Connect (Express accounts)** — this is what `stripe_connect_id` on the `users` table is for. Sellers go through a short Stripe-hosted onboarding flow (collecting their own KYC details, bank account) the first time they try to add payout details, and Stripe handles the regulatory/compliance side for you. This is a setup decision to make explicitly with Claude Code before building endpoint 8 — worth its own short conversation when you get there, since it involves creating a Stripe account and getting API keys.

# **Group 5: Offers, Messages & Counter Offers**

**Base URL:** `http://localhost:3000/api`

This group covers buyer-seller negotiation — from a buyer's first message on a listing through to a structured counter-offer being accepted and routed straight into checkout. Three tables are involved (`offers`, `messages`, `counter_offers`), and the trickiest part of this group isn't the CRUD — it's the real-time feel buyers and sellers expect from a messaging interface, and the state machine governing counter-offer cards. I'll flag both explicitly where they come up.

---

## **A. Offer Threads**

### **1\. Get or Create Thread**

**`POST /offers`**

Called when a buyer taps "Make Offer" on a listing. Per the SRS, there's only ever one thread per buyer per listing — so this endpoint is "get or create," not a pure create. If a thread already exists between this buyer and this listing, it returns the existing thread rather than making a duplicate.

**Auth required:** Yes

**Request body:**

```json
{ "listing_id": "listing-uuid-xyz" }
```

**Success response — 200 OK (existing thread) or 201 Created (new thread):**

```json
{
  "success": true,
  "is_new_thread": false,
  "offer": {
    "id": "offer-uuid-thread1",
    "listing_id": "listing-uuid-xyz",
    "status": "active"
  }
}
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 403 | `OWN_LISTING` | Seller cannot make an offer on their own listing |
| 410 | `LISTING_UNAVAILABLE` | Listing sold/removed — cannot start new negotiation |
| 403 | `SELLER_SUSPENDED` | "This seller is currently unavailable" |

---

### **2\. List My Threads**

**`GET /offers`**

Powers the /messages thread list — used by both buyers and sellers (same endpoint, returns whichever threads the logged-in user is a party to, either as buyer or seller).

**Auth required:** Yes

**Query params:** `?unread_only=true` (optional)

**Success response — 200 OK:**

```json
{
  "success": true,
  "threads": [
    {
      "id": "offer-uuid-thread1",
      "listing": {
        "id": "listing-uuid-xyz",
        "title": "Bullpadel Vertex 03 Padel Racket",
        "photo": "https://...",
        "condition": "like_new",
        "price": 195.00
      },
      "other_party": { "id": "user-uuid-2", "username": "liamobrien" },
      "last_message_preview": "Hi — what grip size is this racket?",
      "last_message_at": "2026-06-19T10:30:00Z",
      "unread_count": 1
    }
  ],
  "pagination": { "page": 1, "page_size": 20, "total": 5 }
}
```

*(`unread_count` is `buyer_unread_count` or `seller_unread_count` depending on which side the logged-in user is on)*

---

### **3\. Get Thread Detail (Full Conversation)**

**`GET /offers/:id`**

**Auth required:** Yes (must be buyer or seller on this thread, or admin)

**Success response — 200 OK:**

```json
{
  "success": true,
  "offer": {
    "id": "offer-uuid-thread1",
    "status": "active",
    "listing": {
      "id": "listing-uuid-xyz",
      "title": "Bullpadel Vertex 03 Padel Racket",
      "photo": "https://...",
      "condition": "like_new",
      "price": 195.00,
      "status": "live"
    },
    "buyer": { "id": "user-uuid-1", "username": "buyer1" },
    "seller": { "id": "user-uuid-2", "username": "liamobrien" }
  }
}
```

*(Returns thread/listing context only — actual messages come from endpoint 4 below, kept separate so the frontend can paginate long conversations independently of reloading listing context)*

**This call also marks messages as read** for the requesting user (resets their unread count to 0\) — worth telling Claude Code this is a side effect, not just a GET.

---

### **4\. Get Messages in Thread**

**`GET /offers/:id/messages`**

**Auth required:** Yes (must be a party to the thread)

**Query params:** `?before=<message_id>` (for loading older messages, cursor-based pagination — recommended over page numbers for chat-style UIs since new messages keep arriving)

**Success response — 200 OK:**

```json
{
  "success": true,
  "messages": [
    {
      "id": "msg-uuid-1",
      "sender_id": "user-uuid-1",
      "message_type": "offer",
      "body": "Would you consider £170?",
      "offer_amount": 170.00,
      "created_at": "2026-06-19T10:25:00Z"
    },
    {
      "id": "msg-uuid-2",
      "sender_id": "user-uuid-2",
      "message_type": "counter_offer",
      "body": "Thanks for the offer — I can do £180.",
      "counter_offer": {
        "id": "counter-uuid-1",
        "counter_amount": 180.00,
        "status": "pending",
        "expires_at": "2026-06-20T10:30:00Z"
      },
      "created_at": "2026-06-19T10:30:00Z"
    }
  ],
  "has_more": false
}
```

*(`message_type: "counter_offer"` messages carry a nested `counter_offer` object so the frontend can render the special card UI directly from this one call, rather than needing a second request)*

---

### **5\. Send a Message**

**`POST /offers/:id/messages`**

Handles plain text messages and buyer-initiated offers (not seller counter-offers — that's a separate endpoint below, since it has its own state machine).

**Auth required:** Yes (must be a party to the thread)

**Request body:**

```json
{
  "body": "Would you consider £170?",
  "offer_amount": 170.00
}
```

*(`offer_amount` is optional — omit for a plain message)*

**Validation rules (from SRS):**

* At least one of `body` / `offer_amount` required  
* `body` — max 500 characters  
* `offer_amount` — if present, £0.01–£9,999.00  
* Content scanned for phone numbers, emails, external URLs — blocked if found

**Success response — 201 Created:**

```json
{
  "success": true,
  "message": {
    "id": "msg-uuid-1",
    "sender_id": "user-uuid-1",
    "message_type": "offer",
    "body": "Would you consider £170?",
    "offer_amount": 170.00,
    "created_at": "2026-06-19T10:25:00Z"
  }
}
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 400 | `EMPTY_MESSAGE` | Neither body nor offer\_amount present |
| 400 | `CONTACT_DETAILS_BLOCKED` | "For your protection, contact details and external links cannot be shared in messages" |
| 403 | `SELLER_SUSPENDED` | Other party's account is suspended — can't message into a frozen thread |
| 410 | `LISTING_SOLD` | Listing sold to someone else — thread is now informational only |

---

## **B. Counter Offers (Structured — Seller → Buyer)**

This is the part of Group 5 that changed per your conversation with Andy — replacing the free-text counter reply with a structured card. Three endpoints here, each mapping to one card state transition.

### **6\. Send Counter Offer**

**`POST /offers/:id/counter-offers`**

**Auth required:** Yes (must be the thread's seller)

**Request body:**

```json
{
  "counter_amount": 180.00,
  "message": "Thanks for the offer — I can do £180, that's the best I can do."
}
```

**Validation rules (from SRS):**

* `counter_amount` — required, £1.00–£9,999.00, must be ≤ current listing price  
* Only one **pending** counter-offer allowed per thread at a time (enforced at the database level via the partial unique index from migration `010_counter_offers.sql`)

**Success response — 201 Created:**

```json
{
  "success": true,
  "counter_offer": {
    "id": "counter-uuid-1",
    "counter_amount": 180.00,
    "status": "pending",
    "expires_at": "2026-06-20T10:30:00Z"
  }
}
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 403 | `NOT_THREAD_SELLER` | — |
| 400 | `EXCEEDS_LISTED_PRICE` | "Counter offer cannot exceed your listed price of £\[X\]" |
| 409 | `PENDING_COUNTER_EXISTS` | "You have a pending counter offer — wait for a response before sending another" |
| 410 | `LISTING_UNAVAILABLE` | Listing sold/removed since thread was opened |

---

### **7\. Accept Counter Offer**

\*\*\`POST /counter-offers/:id/accept\`\`

**This is the endpoint that closes the gap Andy raised** — accepting here doesn't just update a status, it immediately prepares a price-locked checkout session, so the buyer flows straight from "Accept" into Checkout without re-entering anything.

**Auth required:** Yes (must be the counter-offer's buyer)

**Success response — 200 OK:**

```json
{
  "success": true,
  "counter_offer": { "id": "counter-uuid-1", "status": "accepted" },
  "checkout_session_id": "cs_uuid_from_counter",
  "redirect_to": "/checkout/listing-uuid-xyz?counter_offer_id=counter-uuid-1"
}
```

*(`checkout_session_id` here is generated by internally calling the same logic as Group 3 endpoint 1 — `POST /checkout/initiate` — with the counter offer's `counter_amount` as `price_source: "counter_offer"`. The frontend just follows `redirect_to`.)*

**What this endpoint does internally:**

1. Verifies the counter-offer is still `pending` and not expired  
2. Sets `status = 'accepted'`, `accepted_at = now()`  
3. Sets `checkout_price_lock_expires_at = now() + 30 minutes`  
4. Triggers a checkout session at the counter-agreed price (reuses Group 3's checkout initiation logic internally)  
5. Notifies the seller: "Your counter offer of £180 was accepted — buyer1 is completing checkout"

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 403 | `NOT_COUNTER_OFFER_BUYER` | — |
| 410 | `COUNTER_OFFER_EXPIRED` | 24hr window passed — card should already show "Expired" client-side, this is the server-side guard |
| 410 | `LISTING_UNAVAILABLE` | Listing sold to someone else while this counter was pending |

---

### **8\. Decline Counter Offer**

**`POST /counter-offers/:id/decline`**

**Auth required:** Yes (must be the counter-offer's buyer)

**Success response — 200 OK:**

```json
{ "success": true, "counter_offer": { "id": "counter-uuid-1", "status": "declined" } }
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 403 | `NOT_COUNTER_OFFER_BUYER` | — |
| 409 | `NOT_PENDING` | Already accepted/declined/expired — can't decline twice |

---

### **9\. Auto-Expire Counter Offers (System / Scheduled Job)**

**`POST /system/counter-offers/auto-expire`** *(internal — not called by frontend)*

Same pattern as the order auto-release job in Group 3\. Runs periodically, finds any `counter_offers` where `status = 'pending'` and `expires_at < now()`, flips them to `'expired'`, and notifies the seller.

**Auth required:** Internal service key only

Also worth this job's attention: clearing `checkout_price_lock_expires_at` situations — if a buyer accepted a counter but never completed checkout within 30 minutes, this same scheduled job (or a second one on a tighter interval) should catch that and let the seller send a new counter if they want to.

---

### **A note on the real-time experience**

Everything above is standard request/response — fine for sending messages and getting confirmations back. But buyers and sellers expect a chat thread to update *live* when the other person replies, without refreshing the page. Two honest options here, worth deciding with Claude Code before building the frontend for this group:

**Option A — Polling (simplest, recommended for your first build):** the frontend calls `GET /offers/:id/messages` every few seconds while a thread is open. Crude, but reliable, easy to reason about, and completely sufficient for a marketplace where message volume per thread is low. No new infrastructure needed.

**Option B — WebSockets / real-time subscriptions:** genuinely live updates, but adds real infrastructure complexity (a persistent connection layer) that's easy to get wrong as a first project. Supabase offers this fairly painlessly if you're using it as your database host (its Realtime feature can subscribe directly to changes on the `messages` table with very little extra code) — worth considering specifically *because* you're a beginner and it removes most of the hard parts other approaches would require you to build yourself.

**My recommendation:** start with polling for your MVP. It will work, it will feel "good enough," and you can swap in Supabase Realtime later without changing any of the API endpoints above — only how the frontend listens for new data.

---

### **A note on how this maps to your database**

Endpoint 6 (Send Counter Offer) is the one to point Claude Code at most carefully — it writes to **two tables in one transaction**: a `messages` row with `message_type = 'counter_offer'`, and a `counter_offers` row referencing that message's `id`. The partial unique index from migration `010_counter_offers.sql` (`WHERE status = 'pending'`) is what makes the "only one active counter per thread" rule unbreakable even under concurrent requests — tell Claude Code to let that constraint do the enforcement rather than just checking in application code first, since a check-then-insert in app code has a race condition the database constraint doesn't.

# **Group 6: Disputes & Reviews**

**Base URL:** `http://localhost:3000/api`

This group covers the platform's two trust mechanisms: disputes (the safety net when something goes wrong) and reviews (the reputation system that builds long-term trust). Disputes touch admin workflows heavily — the buyer/seller-facing endpoints here are deliberately narrow, with the heavier admin ruling endpoints reserved for Group 8 where all admin functionality lives together.

---

## **A. Disputes — Buyer-side**

### **1\. Raise a Dispute**

**`POST /orders/:order_id/dispute`**

**Auth required:** Yes (must be the order's buyer)

**Request body:**

```json
{
  "reason": "item_not_as_described",
  "description": "The bat has a cracked edge that wasn't visible in any of the listing photos and wasn't mentioned in the description.",
  "evidence_photos": [
    "https://cloudinary.com/.../evidence1.jpg",
    "https://cloudinary.com/.../evidence2.jpg"
  ]
}
```

**Validation rules (from SRS):**

* `reason` — required, one of: `item_not_as_described`, `item_arrived_damaged`, `wrong_item_received`, `item_not_received`, `significantly_different`  
* `description` — required, min 20 characters, max 500 characters  
* `evidence_photos` — optional, max 5 photos, JPG/PNG, max 5MB each

**Success response — 201 Created:**

```json
{
  "success": true,
  "dispute": {
    "id": "dispute-uuid-1",
    "order_id": "order-uuid-abc",
    "status": "open",
    "seller_response_deadline": "2026-06-25T14:00:00Z"
  }
}
```

**What this endpoint does internally:**

1. Verifies eligibility: order is `dispatched` or `delivered`, dispute window (48hrs from delivery) hasn't closed, escrow status is `held`, no existing dispute on this order  
2. Creates the `disputes` row, sets `seller_response_deadline = now() + 48 hours`  
3. Sets `orders.dispute_status = 'active'`  
4. **Crucially: does not touch escrow.** Per the SRS, escrow was already held — raising a dispute simply prevents the normal auto-release/confirm-delivery paths from firing while the dispute is open. Group 3's auto-release job (endpoint 8\) must check `dispute_status = 'none'` before releasing — worth double-checking that guard exists once both groups are built.  
5. Notifies seller with the deadline; notifies admin a new dispute needs eventual review

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 403 | `NOT_ORDER_BUYER` | — |
| 409 | `WINDOW_CLOSED` | 48hrs since delivery already passed |
| 409 | `DISPUTE_EXISTS` | One dispute per order — already raised |
| 409 | `ESCROW_NOT_HELD` | Escrow already released/refunded — too late |
| 400 | `DESCRIPTION_TOO_SHORT` | Under 20 characters |

---

### **2\. Get My Dispute Detail**

**`GET /disputes/:id`**

**Auth required:** Yes (must be buyer, seller, or admin on this dispute)

**Success response — 200 OK:**

```json
{
  "success": true,
  "dispute": {
    "id": "dispute-uuid-1",
    "order_id": "order-uuid-abc",
    "reason": "item_not_as_described",
    "description": "The bat has a cracked edge...",
    "evidence_photos": ["https://...", "https://..."],
    "seller_response": null,
    "seller_evidence_photos": null,
    "seller_response_deadline": "2026-06-25T14:00:00Z",
    "status": "open",
    "ruling": null,
    "ruling_reason": null,
    "created_at": "2026-06-23T14:00:00Z"
  }
}
```

*(Once resolved, `ruling`, `ruling_reason`, `refund_amount` fields populate — buyers and sellers see the same resolved record, just from their own perspective)*

---

## **B. Disputes — Seller-side**

### **3\. Submit Seller Response**

**`POST /disputes/:id/respond`**

**Auth required:** Yes (must be the dispute's seller)

**Request body:**

```json
{
  "response": "The item was in the condition described — the photo evidence the buyer submitted appears to be from a different angle than what I photographed.",
  "evidence_photos": ["https://cloudinary.com/.../seller-evidence1.jpg"]
}
```

**Success response — 200 OK:**

```json
{
  "success": true,
  "dispute": { "id": "dispute-uuid-1", "status": "seller_responded" }
}
```

**What this endpoint does internally:** sets `seller_responded_at`, `status = 'seller_responded'`, and notifies admin the dispute now has both sides' evidence and is ready for review.

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 403 | `NOT_DISPUTE_SELLER` | — |
| 409 | `RESPONSE_DEADLINE_PASSED` | 48hrs passed — dispute auto-escalates to admin without seller input (see job below) |
| 409 | `ALREADY_RESPONDED` | Can't submit twice |

---

### **4\. Auto-Escalate Unanswered Disputes (System / Scheduled Job)**

**`POST /system/disputes/auto-escalate`** *(internal — not called by frontend)*

Finds disputes where `status = 'open'` and `seller_response_deadline < now()` with no seller response, flips `status = 'admin_reviewing'`, and notifies admin the dispute is ready for ruling using buyer evidence alone — matches the SRS's "Alternative Flow — Seller Does Not Respond Within Response Window."

**Auth required:** Internal service key only

---

## **C. Reviews**

### **5\. Submit a Review**

**`POST /orders/:order_id/review`**

Triggered from the `review_prompt: true` flag returned by Group 3's Confirm Delivery endpoint.

**Auth required:** Yes (must be the order's buyer)

**Request body:**

```json
{
  "rating": 5,
  "body": "Bat arrived exactly as described, fast dispatch. Would buy from again."
}
```

**Validation rules (from SRS):**

* `rating` — required, integer 1–5  
* `body` — optional, max 500 characters, scanned for contact details/URLs

**Success response — 201 Created:**

```json
{
  "success": true,
  "review": {
    "id": "review-uuid-1",
    "rating": 5,
    "body": "Bat arrived exactly as described...",
    "created_at": "2026-06-23T15:00:00Z"
  }
}
```

**What this endpoint does internally:**

1. Verifies order is `completed` and no review already exists for this `order_id`  
2. Creates the `reviews` row  
3. Recalculates and updates `users.average_rating` and `users.review_count` on the seller — this is a denormalised cache on `users` (migration 001\) kept in sync here so every other endpoint that displays a seller's rating doesn't need to recompute it from scratch on every read  
4. Notifies seller: "You have a new review from buyer1"

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 403 | `NOT_ORDER_BUYER` | — |
| 409 | `ORDER_NOT_COMPLETED` | Can only review after order is fully completed |
| 409 | `REVIEW_ALREADY_EXISTS` | One review per order — enforced by the unique constraint on `reviews.order_id` in migration 012 |
| 400 | `INVALID_RATING` | Must be 1–5 |

---

### **6\. Get Seller's Reviews**

**`GET /sellers/:seller_id/reviews`**

Powers the public seller profile page.

**Auth required:** No

**Query params:** `?page=1&page_size=20`

**Success response — 200 OK:**

```json
{
  "success": true,
  "summary": {
    "average_rating": 4.7,
    "review_count": 31
  },
  "reviews": [
    {
      "id": "review-uuid-1",
      "rating": 5,
      "body": "Bat arrived exactly as described...",
      "reviewer_username": "buyer1",
      "created_at": "2026-06-23T15:00:00Z"
    }
  ],
  "pagination": { "page": 1, "page_size": 20, "total": 31 }
}
```

*(Only returns reviews where `is_visible = true` — admin-removed reviews are silently excluded, never returned to public callers)*

---

### **A note on how this maps to your database**

The dispute flow is the one place in your whole schema where a **partial unique index** earns its keep twice over — migration `011_disputes.sql` has `disputes.order_id UNIQUE`, so the database itself blocks a second dispute on the same order even if your application code has a bug that lets a duplicate request through. Same pattern on `reviews.order_id UNIQUE` in migration `012`. Worth telling Claude Code explicitly: **"rely on these database-level unique constraints as the real enforcement — catch the resulting database error and translate it into the `DISPUTE_EXISTS` / `REVIEW_ALREADY_EXISTS` API error, rather than only checking with a SELECT first."** A check-then-insert pattern in application code has a race condition; the database constraint doesn't.

One more thing worth flagging now rather than later: **dispute *rulings*** (admin reviewing evidence and deciding refund vs release vs partial) are deliberately not in this group — they live in Group 8 (Admin) since `disputes.ruling`, `disputes.admin_id`, and the actual Stripe refund/release logic are all admin-only actions that also touch the Orders sub-module's "Intervene in Dispute" feature. Splitting it this way keeps this group's surface area to exactly what a buyer or seller can do themselves.

# **Group 7: Notifications**

**Base URL:** `http://localhost:3000/api`

**Quick note before this group starts:** as flagged at the end of Group 6, Favourites (endpoints 14–15) and Share (endpoints 12–13) were already documented back in **Group 2 — Listings**, since they're tightly coupled to the listing detail page and made more sense to build alongside it. This group is just **Notifications** — the system that powers every "You have a new offer," "Your item has been dispatched," and "Your dispute has been resolved" message across the platform.

---

## **A. Notifications**

### **1\. Get My Notifications**

**`GET /notifications`**

Powers the notification bell/inbox.

**Auth required:** Yes

**Query params:**

| Param | Example | Notes |
| ----- | ----- | ----- |
| `unread_only` | `true` | Optional filter |
| `type` | `offer_received` | Optional filter by notification type |
| `page` | `1` | Default 1 |
| `page_size` | `20` | Default 20 |

**Success response — 200 OK:**

```json
{
  "success": true,
  "notifications": [
    {
      "id": "notif-uuid-1",
      "type": "counter_offer_received",
      "title": "New counter offer",
      "body": "Seller has made a counter offer of £180 on Bullpadel Vertex 03 Padel Racket",
      "reference_id": "counter-uuid-1",
      "reference_type": "counter_offer",
      "is_read": false,
      "created_at": "2026-06-19T10:30:00Z"
    }
  ],
  "unread_count": 3,
  "pagination": { "page": 1, "page_size": 20, "total": 17 }
}
```

*(`reference_id` \+ `reference_type` is the polymorphic pointer described in migration `014_notifications.sql` — the frontend uses `reference_type` to decide which route to navigate to when the notification is tapped, e.g. `reference_type: "counter_offer"` → navigate to `/messages?offer={offer_id}`)*

**`reference_type` → frontend route mapping (worth giving Claude Code as a lookup table):**

| reference\_type | Frontend route |
| ----- | ----- |
| `order` | `/orders/:reference_id` |
| `listing` | `/listing/:reference_id` |
| `offer` / `counter_offer` | `/messages?offer=:reference_id` |
| `dispute` | `/orders/:order_id` *(dispute is nested under its order — backend resolves this)* |
| `review` | `/profile` (seller's own profile, Ratings section) |
| `badge` | `/profile` |

---

### **2\. Mark Notification as Read**

**`PATCH /notifications/:id/read`**

**Auth required:** Yes (must be the notification's recipient)

**Success response — 200 OK:**

```json
{ "success": true, "unread_count": 2 }
```

---

### **3\. Mark All as Read**

**`PATCH /notifications/read-all`**

**Auth required:** Yes

**Success response — 200 OK:**

```json
{ "success": true, "unread_count": 0 }
```

---

### **A note on how notifications actually get created**

This is the important part to get right with Claude Code, and it's not really a REST endpoint at all — **there's no `POST /notifications` endpoint exposed to the frontend**, deliberately. Notifications are never created directly by a user action; they're always a *side effect* of something else happening elsewhere in the system. You've already seen this pattern across every group above:

| When this happens... | ...this notification gets created (internally, not via API call) |
| ----- | ----- |
| Group 3, Confirm Order | Buyer: `order_placed` · Seller: `order_placed` (their copy says "New Sale") |
| Group 3, Mark as Dispatched | Buyer: `dispatched` |
| Group 3, Confirm Delivery | (none directly — but triggers the review prompt) |
| Group 4, `transfer.paid` webhook | Seller: `payout_completed` |
| Group 5, Send Message | Recipient: depends — only fires for offers/counter-offers, not every plain text message (per SRS, to avoid notification spam) |
| Group 5, Counter Offer accepted/declined | Seller: `counter_offer_accepted` / `counter_offer_declined` |
| Group 6, Raise Dispute | Seller: `dispute_raised` |
| Group 6, Submit Review | Seller: `review_received` |
| Group 8 (Admin), Flag/Remove Listing | Seller: `listing_flagged` / `listing_removed` |
| Group 8 (Admin), Suspend/Ban | User: `account_suspended` |
| Group 8 (Admin), Grant/Revoke Badge | Seller: `badge_granted` / `badge_revoked` |
| Group 8 (Admin), Dispute Ruling | Both parties: `dispute_resolved` |

**The practical instruction for Claude Code:** build one shared internal function — something like `createNotification({ userId, type, title, body, referenceId, referenceType })` — and call it from inside every endpoint above, in the same database transaction as the main action where possible. Don't build this as a separate public API route. This keeps notification creation consistent and means you only need to get the email/in-app sending logic right once, not 15 times across 15 different endpoints.

---

### **A note on the in-app vs email split**

Per several SRS documents, every notification type has independent control over whether it sends in-app, email, both, or — for a few critical types — cannot be disabled at all. This logic should live inside that same shared `createNotification` function, checking the recipient's preferences (stored on `users` — `notification_order_updates`, `notification_messages`, `notification_price_drops`, `notification_promotions`, `notification_disputes`) before deciding what to actually send:

| Notification category | Can buyer/seller disable in-app? | Can they disable email? |
| ----- | ----- | ----- |
| Order updates (dispatched, delivered) | **No — mandatory** | Yes |
| Disputes (raised, resolved) | **No — mandatory** | Yes |
| Messages / offers / counter-offers | Yes | Yes |
| Price drops | Yes | Yes |
| Promotions | Yes | Yes |
| Admin actions (suspension, badge) | **No — mandatory, security-relevant** | **No — mandatory** |

This table is worth handing to Claude Code verbatim — it's pulled directly from the Notifications feature acceptance criteria in your Settings SRS, and it's the kind of nuance that's easy to flatten into "just send everything" or "just respect all toggles" if you don't specify it explicitly.

---

### **How email actually gets sent — one more decision to make**

The `notifications` table tracks `sent_in_app` and `sent_email` as booleans, but actually *sending* an email requires a transactional email service — your backend can't just SMTP directly to Gmail/Outlook reliably (it'll get marked as spam almost immediately without proper sender reputation). For a beginner setup, the simplest options are:

**Resend** — modern, generous free tier, very easy SDK, designed for exactly this use case (transactional app emails). My recommendation for you specifically, since it's the lowest-friction option to wire up with Claude Code's help.

**SendGrid** — older, more enterprise-y, also has a free tier, slightly more setup.

Either works fine — just flag to Claude Code which one you've picked so it installs the right SDK and asks you for the right API key in your `.env` file.

# **Group 8: Admin**

**Base URL:** `http://localhost:3000/api/admin`

The final group. Every endpoint here requires `role = 'admin'` — worth building this as a single middleware layer (`requireAdmin`) applied once to the entire `/admin` route prefix in Claude Code, rather than repeating the check on every individual endpoint. I'll organise this by sub-module, matching your SRS structure exactly: Listings, Users, Orders/Disputes, Categories, Seller Badges, Financials.

---

## **A. Listings Moderation**

### **1\. Get All Listings (Admin View)**

**`GET /admin/listings`**

**Auth required:** Admin only

**Query params:** `?status=flagged&sport=cricket&seller=jameswilson&date_from=2026-06-01&date_to=2026-06-19&page=1`

**Success response — 200 OK:**

```json
{
  "success": true,
  "listings": [
    {
      "id": "listing-uuid-xyz",
      "title": "Gray-Nicolls Kronus 1500 Cricket Bat",
      "seller_username": "jameswilson",
      "sport": "Cricket",
      "price": 89.00,
      "condition": "good",
      "status": "flagged",
      "created_at": "2026-06-19T10:02:00Z"
    }
  ],
  "pagination": { "page": 1, "page_size": 50, "total": 312 }
}
```

*(Unlike the public `GET /listings` in Group 2, this returns listings of **every** status — draft, live, sold, paused, flagged, removed — with no filtering of non-live listings)*

---

### **2\. Get Listing Detail (Admin View)**

**`GET /admin/listings/:id`**

**Auth required:** Admin only

**Success response — 200 OK:** Full listing detail plus seller summary and flag/removal history — same shape as the public detail endpoint, with additional fields:

```json
{
  "success": true,
  "listing": {
    "id": "listing-uuid-xyz",
    "title": "...",
    "...": "... (all public fields) ...",
    "flag_history": [
      { "reason": "Misrepresented condition", "flagged_at": "2026-06-19T12:00:00Z", "flagged_by": "buyer_report" }
    ],
    "seller_summary": {
      "id": "user-uuid",
      "username": "jameswilson",
      "total_listings": 12,
      "violation_count": 0,
      "account_status": "active"
    }
  }
}
```

---

### **3\. Flag Listing**

**`POST /admin/listings/:id/flag`**

**Auth required:** Admin only

**Request body:**

```json
{
  "reason": "misrepresented_condition",
  "internal_note": "Buyer reported photos don't match condition described"
}
```

**Success response — 200 OK:**

```json
{ "success": true, "listing": { "id": "listing-uuid-xyz", "status": "flagged" } }
```

**What this does internally:** sets `listings.status = 'flagged'`, `listings.flag_reason`, writes an `audit_log` row (`action_type: 'listing_flagged'`), notifies the seller within 5 minutes per SRS.

---

### **4\. Remove Listing**

**`POST /admin/listings/:id/remove`**

**Auth required:** Admin only

**Request body:**

```json
{
  "reason": "prohibited_item",
  "internal_note": "Item violates platform policy"
}
```

**Success response — 200 OK:**

```json
{ "success": true, "listing": { "id": "listing-uuid-xyz", "status": "removed" } }
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 409 | `ACTIVE_ORDER_EXISTS` | "This listing has an active order. Removing it will flag the order for review. Confirm?" — frontend should show this warning and resend with `force: true` to proceed |

---

### **5\. Clear Flag**

**`POST /admin/listings/:id/clear-flag`**

**Auth required:** Admin only

**Request body:**

```json
{ "compliance_note": "Reviewed photos and description — accurate, clearing flag." }
```

**Success response — 200 OK:**

```json
{ "success": true, "listing": { "id": "listing-uuid-xyz", "status": "live" } }
```

---

## **B. User Management**

### **6\. Get All Users (Admin View)**

**`GET /admin/users`**

**Auth required:** Admin only

**Query params:** `?role=seller&status=suspended&search=james&page=1`

**Success response — 200 OK:**

```json
{
  "success": true,
  "users": [
    {
      "id": "user-uuid",
      "username": "jameswilson",
      "email": "james@example.com",
      "role": "seller",
      "account_status": "active",
      "total_listings": 12,
      "total_orders": 8,
      "joined_at": "2025-03-01T00:00:00Z",
      "last_active_at": "2026-06-18T09:00:00Z"
    }
  ],
  "pagination": { "page": 1, "page_size": 50, "total": 1204 }
}
```

---

### **7\. Get User Detail (Full Admin Profile)**

**`GET /admin/users/:id`**

**Auth required:** Admin only

**Success response — 200 OK:**

```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "username": "jameswilson",
    "email": "james@example.com",
    "role": "seller",
    "account_status": "active",
    "violation_count": 0,
    "listings_summary": { "live": 4, "sold": 8, "removed": 0 },
    "orders_summary": { "as_buyer": 3, "as_seller": 8 },
    "violation_history": [
      { "type": "listing_flagged", "date": "2026-05-01T00:00:00Z", "reason": "..." }
    ]
  }
}
```

---

### **8\. Suspend User**

**`POST /admin/users/:id/suspend`**

**Auth required:** Admin only

**Request body:**

```json
{
  "duration_days": 14,
  "reason": "repeated_policy_violation",
  "internal_note": "Third complaint in 30 days regarding item condition accuracy"
}
```

**Success response — 200 OK:**

```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "account_status": "suspended",
    "suspension_end_date": "2026-07-03T00:00:00Z"
  }
}
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 403 | `CANNOT_SUSPEND_ADMIN` | "Super Admin accounts cannot be suspended or banned" |
| 400 | `DURATION_OUT_OF_RANGE` | Must be 1–90 days |

**What this does internally:** sets `account_status = 'suspended'`, `suspension_end_date`, `suspension_reason`; pauses all the seller's `live` listings (status → `paused`, but tagged so the auto-reinstatement job knows to restore them, not treat them as seller-initiated Holiday Mode); writes `audit_log`; notifies user.

---

### **9\. Ban User (Permanent)**

**`POST /admin/users/:id/ban`**

**Auth required:** Admin only

**Request body:**

```json
{
  "reason": "fraud",
  "internal_note": "Confirmed off-platform payment solicitation across 3 separate threads"
}
```

**Success response — 200 OK:**

```json
{ "success": true, "user": { "id": "user-uuid", "account_status": "banned" } }
```

**What this does internally:** sets `account_status = 'banned'`; sets all seller's listings `status = 'removed'`; flags any in-progress orders for review (writes a flag admin sees in endpoint 13 below); notifies user. Email is recorded as permanently ineligible for re-registration at the auth layer (Group 1).

---

### **10\. Reinstate / Lift Suspension**

**`POST /admin/users/:id/reinstate`**

**Auth required:** Admin only

**Request body:**

```json
{ "note": "Seller provided evidence the violation was a listing error, not intentional misrepresentation." }
```

**Success response — 200 OK:**

```json
{ "success": true, "user": { "id": "user-uuid", "account_status": "active" } }
```

**What this does internally:** restores `account_status = 'active'`; restores any listings that were paused *by this suspension specifically* back to `live` (not listings the seller separately put in Holiday Mode).

---

### **11\. Auto-Reinstate Expired Suspensions (System / Scheduled Job)**

**`POST /system/users/auto-reinstate`** *(internal)*

Same pattern as the other scheduled jobs in this guide. Finds users where `account_status = 'suspended'` and `suspension_end_date < now()`, runs the same reinstatement logic as endpoint 10\.

**Auth required:** Internal service key only

---

## **C. Orders & Dispute Rulings**

### **12\. Get All Orders (Admin View)**

**`GET /admin/orders`**

**Auth required:** Admin only

**Query params:** `?fulfilment_status=disputed&date_from=...&page=1`

**Success response — 200 OK:** Same shape as Group 3's buyer/seller order list, but returns every order on the platform regardless of party, plus a `requires_review` flag.

---

### **13\. Get Orders Requiring Review**

**`GET /admin/orders/flagged`**

Surfaces orders auto-flagged from a user ban (endpoint 9\) or active disputes — the admin's priority queue.

**Auth required:** Admin only

**Success response — 200 OK:**

```json
{
  "success": true,
  "orders": [
    {
      "id": "order-uuid-abc",
      "flag_reason": "seller_banned_mid_order",
      "fulfilment_status": "awaiting_dispatch",
      "payment_status": "held",
      "flagged_at": "2026-06-19T16:00:00Z"
    }
  ]
}
```

---

### **14\. Rule on a Dispute**

**`POST /admin/disputes/:id/rule`**

**The single highest-stakes endpoint in the platform** — directly moves money. This is where Group 6's dispute mechanics meet Group 4's payment infrastructure.

**Auth required:** Admin only

**Request body — full refund to buyer:**

```json
{
  "ruling": "refund_buyer",
  "ruling_reason": "Buyer's evidence clearly shows undisclosed damage not visible in original listing photos.",
  "refund_shipping_fee": false
}
```

**Request body — release to seller:**

```json
{
  "ruling": "release_seller",
  "ruling_reason": "Item matches listing description accurately based on both parties' evidence."
}
```

**Request body — partial resolution:**

```json
{
  "ruling": "partial_resolution",
  "ruling_reason": "Item largely as described; minor undisclosed scuff warrants partial goodwill refund.",
  "refund_amount": 15.00
}
```

**Validation rules (from SRS):**

* `ruling_reason` — required, min 20 characters  
* `refund_amount` — required only when `ruling: "partial_resolution"`, must be £0.01 to item price (if it equals the full item price, reject and prompt to use `refund_buyer` instead)

**Success response — 200 OK:**

```json
{
  "success": true,
  "dispute": {
    "id": "dispute-uuid-1",
    "status": "resolved",
    "ruling": "refund_buyer",
    "resolved_at": "2026-06-25T11:00:00Z"
  },
  "financial_outcome": {
    "buyer_refund": 205.45,
    "seller_payout": 0.00
  }
}
```

**What this endpoint does internally — the most important transaction in the whole app:**

1. Verifies escrow is still `held` and dispute `status` is `open` / `seller_responded` / `admin_reviewing`  
2. Based on `ruling`, calls Stripe to either: issue a full refund, release the existing transfer to the seller, or do both partially (refund partial amount to buyer, transfer remainder to seller)  
3. Updates `payments.escrow_status`, `payments.amount_refunded`  
4. Updates `disputes.status = 'resolved'`, `disputes.ruling`, `disputes.ruling_reason`, `disputes.admin_id`, `disputes.resolved_at`  
5. Updates `orders.dispute_status = 'resolved'`, `orders.fulfilment_status` accordingly  
6. **If ruling favours the buyer:** flags the listing in the Listings sub-module for review, increments `users.violation_count` on the seller, and — if this is the seller's 3rd buyer-favour ruling in 90 days — fires an automated escalation alert (see endpoint 7 from the Users SRS)  
7. Writes `audit_log`  
8. Notifies both parties with their respective outcome and the ruling reason

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 400 | `RULING_REASON_TOO_SHORT` | — |
| 400 | `PARTIAL_EQUALS_FULL_PRICE` | "This is equivalent to a full refund — use the Refund Buyer ruling instead" |
| 409 | `ESCROW_ALREADY_RESOLVED` | Can't rule twice on the same dispute |

**Tell Claude Code explicitly:** "This endpoint must run inside a single database transaction, and the Stripe API call must be the last step before commit — if the Stripe call fails, the entire database transaction rolls back, so a dispute is never marked `resolved` without the money having actually moved." This is the one endpoint in the whole platform where a bug has a direct cash cost — worth the extra care up front.

---

### **15\. Request Additional Evidence**

**`POST /admin/disputes/:id/request-evidence`**

**Auth required:** Admin only

**Request body:**

```json
{ "note": "Please provide a photo of the original packaging showing the dispatch date." }
```

**Success response — 200 OK:**

```json
{
  "success": true,
  "dispute": { "id": "dispute-uuid-1", "additional_evidence_requested": true, "additional_evidence_deadline": "2026-06-27T11:00:00Z" }
}
```

---

## **D. Categories (Sports, Sub-Categories, Brands)**

### **16\. Add Sport**

**`POST /admin/sports`**

**Auth required:** Admin only

**Request body:**

```json
{
  "name": "Padel",
  "slug": "padel",
  "icon_url": "https://...",
  "sport_tag": "racket",
  "display_order": 5
}
```

**Success response — 201 Created:** new sport object.

---

### **17\. Update Sport**

**`PUT /admin/sports/:id`**

**Auth required:** Admin only

Same body shape, partial updates allowed (e.g. just toggling `status: "hidden"`).

---

### **18\. Add Sub-Category**

**`POST /admin/sports/:sport_id/sub-categories`**

**Auth required:** Admin only

**Request body:**

```json
{
  "name": "Padel racket",
  "slug": "padel-racket",
  "recommended_parcel_size": "medium",
  "is_oversized": false
}
```

**Success response — 201 Created:** new sub-category object.

---

### **19\. Remove Sport / Sub-Category**

**`DELETE /admin/sports/:id`** and **`DELETE /admin/sub-categories/:id`**

**Auth required:** Admin only

**Success response (when listings exist under it) — requires confirmation:**

```json
{
  "success": false,
  "requires_confirmation": true,
  "active_listing_count": 23,
  "message": "23 active listings exist under this category. Removing it will hide these listings. Proceed?"
}
```

Resend with `?force=true` to proceed — matches the SRS confirmation flow exactly.

---

## **E. Seller Badges**

### **20\. Get Badge Queue**

**`GET /admin/seller-badges/queue`**

Returns sellers who meet the eligibility criteria and are awaiting admin review.

**Auth required:** Admin only

**Success response — 200 OK:**

```json
{
  "success": true,
  "eligible_sellers": [
    {
      "user_id": "user-uuid",
      "username": "jameswilson",
      "total_sales": 25,
      "average_rating_90d": 4.8,
      "disputes_90d": 0,
      "avg_dispatch_days": 1.2,
      "eligibility_checklist": {
        "min_sales": true,
        "min_rating": true,
        "min_rating_90d": true,
        "zero_disputes_90d": true,
        "dispatch_time": true,
        "account_age": true
      }
    }
  ]
}
```

---

### **21\. Approve Badge**

**`POST /admin/seller-badges/:user_id/approve`**

**Auth required:** Admin only

**Success response — 200 OK:**

```json
{ "success": true, "user": { "id": "user-uuid", "verified_seller": true } }
```

**Error responses:**

| Status | Code | When |
| ----- | ----- | ----- |
| 409 | `IN_COOLDOWN` | "This seller is in a 30-day reapplication cooldown until \[date\]" |

---

### **22\. Reject Badge Request**

**`POST /admin/seller-badges/:user_id/reject`**

**Auth required:** Admin only

**Request body:**

```json
{ "unmet_criteria": ["zero_disputes_90d"], "note": "2 disputes ruled against seller in last 90 days" }
```

**Success response — 200 OK:** writes a `seller_badges` row (`action: 'rejected'`), sets `reapplication_eligible_at = now() + 30 days`.

---

### **23\. Revoke Badge**

**`POST /admin/seller-badges/:user_id/revoke`**

**Auth required:** Admin only

**Request body:**

```json
{
  "reason": "dispute_threshold_exceeded",
  "internal_note": "3 buyer-favour dispute rulings in 60 days — quality standard no longer met"
}
```

**Validation:** `internal_note` required, min 20 characters.

**Success response — 200 OK:** sets `users.verified_seller = false`, writes `seller_badges` row, sets `reapplication_eligible_at = now() + 60 days`.

---

## **F. Financials**

### **24\. Get Fee Configuration**

**`GET /admin/fee-config`**

**Auth required:** Admin only

**Success response — 200 OK:**

```json
{
  "success": true,
  "config": {
    "buyer_protection_pct": 5.0,
    "buyer_protection_flat_min": 0.70,
    "platform_commission_pct": 10.0,
    "shipping_fees": { "small": 2.50, "medium": 3.50, "large": 5.50 },
    "sport_overrides": [
      { "sport": "Golf", "commission_pct": 0.0, "is_promotional": true, "promotional_end": "2026-07-19T00:00:00Z" }
    ]
  }
}
```

---

### **25\. Update Fee Configuration**

**`PUT /admin/fee-config/:config_key`**

**Auth required:** Admin only

**Request body:**

```json
{ "config_value": 6.0 }
```

**Success response — 200 OK:** new value applied to all **new** transactions immediately; writes `audit_log` with `previous_value` and `new_value`.

Per the SRS, this never touches existing orders — `orders` and `payments` rows already store their own fee amounts at time of purchase (migration 006/007), so changing `fee_config` going forward is inherently safe and non-retroactive by design, not something this endpoint needs to guard against separately.

---

### **26\. Get Revenue Dashboard**

**`GET /admin/revenue`**

**Auth required:** Admin only

**Query params:** `?date_from=2026-05-19&date_to=2026-06-19`

**Success response — 200 OK:**

```json
{
  "success": true,
  "kpis": {
    "total_gmv": 48230.50,
    "commission_earned": 4823.05,
    "buyer_protection_fees": 2411.50,
    "dispute_refund_cost": 312.00,
    "net_platform_revenue": 6922.55,
    "completed_orders": 247,
    "average_order_value": 195.26,
    "pending_gmv": 1840.00
  },
  "gmv_by_sport": [{ "sport": "Cricket", "gmv": 8200.00, "order_count": 38 }],
  "top_sellers": [{ "user_id": "user-uuid", "username": "jameswilson", "gmv": 1240.00, "order_count": 8 }]
}
```

*(`pending_gmv` is separated out per the SRS — escrow-held orders are never blended into the headline GMV figure)*

---

### **A closing note on this group as a whole**

Group 8 is where every database-level safety net you built back in the migrations actually gets exercised under pressure — suspending an admin is blocked by application logic (`CANNOT_SUSPEND_ADMIN`), but the financial integrity of a dispute ruling is ultimately protected by `chk_payments_refund_bounds` in migration 007, no matter what the application code does. That layering — application logic for business rules, database constraints as the last line of defence — is the single most valuable habit to carry into how Claude Code builds the rest of this platform.

---

**Group 8 (Admin) — 26 endpoints, done.**

---

## **All 8 groups complete — full API surface: 94 endpoints**

| Group | Endpoints |
| ----- | ----- |
| 1\. Auth | 16 |
| 2\. Listings (+ Favourites \+ Share) | 15 |
| 3\. Orders & Checkout | 10 |
| 4\. Payments & Payouts | 9 |
| 5\. Offers, Messages & Counter Offers | 9 |
| 6\. Disputes & Reviews | 6 |
| 7\. Notifications | 3 |
| 8\. Admin | 26 |

