# **SRS — Manage Sport Categories**

**Platform:** The Kit Loop | **User:** Super Admin | **Module:** Platform Management | **Sub-Module:** Categories | **Version:** 1.0

---

## **1\. Feature Overview**

The Manage Sport Categories feature allows the Super Admin to add, edit, and remove sports and their associated product sub-categories from the platform taxonomy. This taxonomy directly drives the Browse by Sport navigation, listing creation category selection, and search filter options visible to all buyers and sellers. Any change made by the admin is reflected live across the platform immediately upon publish.

---

## **2\. Story & Story Narrative**

**Story** As a Super Admin, I want to manage sport categories so the platform browse, listing, and filter experience stays accurate, organised, and scalable as new sports and product types are added.

**Story Narrative** Case: The platform launches with Cricket and Football. As the business grows, Golf needs to be added with its own sub-categories (Golf driver, Golf irons, Golf wedge, Golf putter, Golf bag, Golf ball, Golf shoes, Golf glove). Separately, an existing sub-category may need renaming (e.g. "Cricket bat" → "Cricket Bat \- Senior") or a sport may need to be temporarily hidden from the buyer-facing catalogue while inventory is being built up.

Flow: Admin logs in → navigates to Platform Management → opens Categories → sees full sport and sub-category taxonomy → adds/edits/removes a sport or sub-category → publishes → changes are reflected live on homepage sport icons, browse filters, listing creation form category selector, and search filters.

Benefit: Keeps the catalogue accurate and scalable without requiring a developer, ensures new sports can be onboarded rapidly, and prevents buyers and sellers from seeing outdated or broken category options.

---

## **3\. User Flow**

**Preconditions**

* Admin is authenticated and has Super Admin role  
* Admin is on the Platform Management dashboard  
* At least one sport category exists on the platform

**Main Flow — Add a New Sport**

1. Admin navigates to Platform Management → Categories  
2. Admin sees a list of all existing sports with their sub-categories and status (Active / Hidden)  
3. Admin clicks "Add Sport"  
4. Admin enters sport name, uploads sport icon, assigns a sport tag (e.g. bat-ball, racket, team, endurance)  
5. Admin adds one or more product sub-categories under the new sport  
6. Admin sets status to Active or Hidden  
7. Admin clicks Publish  
8. New sport appears on homepage Browse by Sport row, listing creation category selector, and search filters

**Main Flow — Edit Existing Sport or Sub-Category**

1. Admin navigates to Categories → selects existing sport  
2. Admin edits sport name, icon, tag, or status  
3. Admin adds, renames, or reorders sub-categories within the sport  
4. Admin clicks Save  
5. Changes reflect live across all buyer and seller-facing surfaces

**Main Flow — Remove Sport or Sub-Category**

1. Admin selects sport or sub-category to remove  
2. System checks whether active listings exist under that sport or sub-category  
3. If active listings exist → system warns admin: "X active listings exist under this category. Removing it will hide these listings. Proceed?"  
4. Admin confirms → sport or sub-category removed → associated listings hidden from browse and search (not deleted)  
5. Sellers with affected listings notified to re-categorise

**Alternative Flow — Hide a Sport Without Removing**

1. Admin selects sport → toggles status to Hidden  
2. Sport disappears from buyer-facing surfaces (homepage, browse, filters, listing form)  
3. Existing listings under that sport remain in the system but are not visible to buyers  
4. Admin can re-activate at any time by toggling back to Active

**Alternative Flow — Reorder Sports on Homepage**

1. Admin in Categories → drag and drop to reorder sport icons  
2. New order reflects on homepage Browse by Sport row immediately on publish

**Post Conditions — Manage Sport Categories**

* Any add, edit, remove, or hide action is reflected live across all platform surfaces immediately on publish — homepage Browse by Sport row, seller listing creation form, buyer browse filters, and search filters  
* No sport or sub-category that has been removed or hidden is visible to buyers or sellers on any front-facing surface  
* All listings associated with a removed or hidden sport or sub-category are hidden from buyers but fully retained in the system with data and transaction history intact  
* Affected sellers have been notified of any category removal or rename that impacts their active listings  
* Every category change is recorded in the admin audit log with action type, admin user ID, and timestamp  
* Each active sub-category has exactly one recommended parcel size mapped, which is live and auto-populating on the seller listing form for new listings  
* Oversized sub-categories display a courier-only notice on the seller listing form — Royal Mail options are not selectable for these items  
* No existing order or completed transaction record has been altered as a result of any category change  
* The total sport and sub-category count in the admin Category panel reflects the current state of the taxonomy accurately

---

## **4\. Acceptance Criteria**

**Adding a Sport**

* Admin can add a new sport with a name, icon, sport tag, and at least one sub-category  
* New sport appears on the homepage Browse by Sport row after publishing  
* New sport appears in the listing creation Category selector for sellers  
* New sport appears as a filter option in the buyer-facing browse and search pages  
* Admin cannot publish a sport with no sub-categories  
* Admin cannot create a sport with a duplicate name of an existing sport  
* Sport icon is required before publish; system blocks save without one

**Editing a Sport or Sub-Category**

* Admin can rename a sport or sub-category  
* Admin can update the sport icon  
* Admin can change sport tag  
* Edited sport name and icon update live across all buyer and seller surfaces immediately  
* Renaming a sub-category updates it on all existing listings that used that sub-category  
* Admin can add new sub-categories to an existing sport at any time  
* Admin can reorder sub-categories within a sport

**Removing a Sport or Sub-Category**

* System displays a warning if active listings exist under the sport or sub-category being removed  
* Warning shows exact count of affected listings  
* Removal hides associated listings from buyers but does not delete them from the system  
* Sellers with affected listings receive a notification to re-categorise within 7 days  
* A removed sport no longer appears on homepage, browse filters, or listing creation form  
* Admin can restore a removed sport within 30 days before it is permanently archived

**Hiding a Sport**

* Admin can toggle any sport to Hidden without removing it  
* Hidden sport disappears from all buyer-facing surfaces  
* Hidden sport's existing listings are not visible to buyers while sport is hidden  
* Admin can re-activate a hidden sport at any time  
* Hidden sports remain visible to admin in the Category management panel

**Parcel Size Mapping**

* Each sub-category must have a recommended parcel size assigned (Small / Medium / Large / Oversized)  
* Parcel size recommendation is used to auto-populate the parcel size field on the seller listing form  
* Admin can edit the recommended parcel size per sub-category  
* Change to recommended parcel size applies to all new listings in that sub-category; existing listings are not retroactively changed

**General**

* All category changes are logged with admin user ID, timestamp, and action type for audit purposes  
* Changes publish instantly without requiring a platform redeployment  
* Admin cannot delete a sport that has a completed order history; it can only be hidden or archived

---

## **5\. Business Rules**

* A sport must have at least one active sub-category to be published as Active  
* Sub-category names must be unique within their parent sport (duplicates not allowed within same sport, allowed across different sports)  
* A sport name must be unique across the entire platform taxonomy  
* Removing a sub-category hides associated listings but does not delete listing data or transaction history  
* Sellers are notified within 24 hours if their listing's sub-category is removed or renamed  
* Each sub-category must have exactly one recommended parcel size assigned — this drives the auto-suggest on the seller listing form  
* Oversized sub-categories (e.g. Golf driver, Skis, Road bike, Punch bag) must display a courier-only notice on the seller listing form — Royal Mail options are not available for these  
* Sport icons must be in SVG or PNG format, max 200KB, square aspect ratio  
* A sport can be hidden at any time regardless of active listing count; removal requires admin confirmation if listings exist  
* Category changes are effective immediately on publish — there is no scheduled publish option in v1  
* Admin audit log must retain category change history for a minimum of 12 months

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Sport Name | Add / Edit sport | Required, max 50 characters, unique across all sports | "Sport name already exists" / "Sport name is required" | On save / publish |
| Sport Icon | Add sport | Required, SVG or PNG only, max 200KB, square aspect ratio | "Icon is required" / "Invalid file type — use SVG or PNG" / "File too large — max 200KB" | On file upload and on save |
| Sport Tag | Add / Edit sport | Required, selected from predefined list (bat-ball, racket, team, endurance, snow, water, combat, precision) | "Sport tag is required" | On save |
| Sub-Category Name | Add / Edit sub-category | Required, max 60 characters, unique within parent sport | "Sub-category name already exists in this sport" / "Sub-category name is required" | On save |
| Sub-Category Parcel Size | Add / Edit sub-category | Required, must be one of: Small, Medium, Large, Oversized | "Parcel size is required for each sub-category" | On save |
| Sub-Category Count | Publish sport | Sport must have at least 1 active sub-category | "Add at least one sub-category before publishing this sport" | On publish |
| Remove Sport | Remove action | If active listings exist, confirmation required | "X active listings exist under \[Sport\]. Removing will hide these listings from buyers. Confirm?" | On remove action |
| Remove Sub-Category | Remove action | If active listings exist, confirmation required | "X active listings are listed under \[Sub-category\]. Removing will hide these listings. Confirm?" | On remove action |

---

## **7\. Edge Cases**

| Scenario | Expected Behaviour | Handling |
| ----- | ----- | ----- |
| Admin removes a sport that has active orders in progress | Sport is hidden from browse but order fulfilment continues unaffected; sport cannot be permanently deleted until all orders are completed | System checks for in-progress orders before allowing permanent deletion; shows warning |
| Admin renames a sub-category that is mid-transaction | Existing orders retain the original sub-category name at time of purchase; new listings use the updated name | Order records store sub-category name as a snapshot at time of listing; rename only affects new listings forward |
| Admin adds a sport with the same name as a previously archived sport | System warns "A sport with this name was previously archived. Restore it instead?" with option to restore or create new | Duplicate name check includes archived sports; admin given choice |
| Admin tries to publish a sport with no icon | Publish button disabled; inline error shown | Client-side validation blocks publish; icon field highlighted |
| Two admins edit the same category simultaneously | Last save wins; system shows a stale data warning to the admin whose save was overwritten | Timestamp-based conflict detection; warning shown on next load |
| Admin hides a sport that is a seller's only active category | Seller's listings are hidden; seller receives notification to re-categorise | Automated notification sent within 24 hours of sport being hidden |
| Admin removes a sub-category that has a parcel size mapping in active use | Parcel size recommendation removed from listing form; existing listings with that sub-category retain their previously selected parcel size | Sub-category removal clears mapping; no retroactive change to existing listings |
| Seller is mid-listing when admin removes the category they selected | Seller receives inline error: "This category is no longer available. Please select a new category." | Real-time category availability check on listing form submission |
| Admin reorders sports and then hides one | Hidden sport is excluded from the live order; its position is saved internally and restored if the sport is re-activated | Hidden sports maintain their saved position in admin view; excluded from buyer-facing render |
| Sport icon upload fails mid-save | Sport is not published; admin returned to edit state with error message | Upload failure caught; save transaction rolled back; error displayed |

---

## **8\. Exceptional Cases**

* **Platform redeployment during category publish:** If a platform deployment occurs at the same moment a category change is published, the change must be included in or survive the deployment. Category data must be stored in the database, not in application config or code, to ensure persistence across deployments.

* **Bulk import of categories:** If the business needs to onboard 5+ new sports simultaneously (e.g. at platform launch), manually adding each sport and sub-category through the UI is inefficient. A CSV bulk import option should be considered for v2 to allow the admin to upload a structured file matching the sport master format.

* **Category used in a promoted listing:** If a sub-category is removed and a seller had a paid promoted listing under it, the platform must handle the refund or reallocation of the promotion — this edge case requires coordination with the payments module and should be defined before promoted listings are launched.

* **Taxonomy versioning:** If the platform needs to roll back a category change (e.g. a sport was accidentally removed), there is no undo in v1. Admin must manually recreate the sport. A version history / restore function should be considered for v2.

* **Parcel size change impact on in-flight listings:** If admin changes the recommended parcel size for a sub-category (e.g. from Medium to Large for batting pads), this must not retroactively alter the parcel size on listings that are already live or have active orders. The change applies only to new listings created after the update.

# **SRS — Platform Management | Listings**

**Platform:** The Kit Loop | **User:** Super Admin | **Module:** Platform Management | **Sub-Module:** Listings | **Version:** 1.0

---

## **1\. Feature Overview**

The Listings sub-module gives the Super Admin full visibility and control over every listing on the platform regardless of status — live, pending, flagged, or removed. The admin can review listing content, approve or reject pending listings, flag suspicious or policy-violating listings, and remove listings permanently. This sub-module is the primary tool for maintaining marketplace quality, trust, and safety without requiring seller input on every moderation decision.

There are two features within this sub-module:

* **Feature 1 — View All Listings**  
* **Feature 2 — Remove / Flag Listing**

---

---

# **Feature 1 — View All Listings**

---

## **2\. Story & Story Narrative**

**Story** As a Super Admin, I want to view all listings across the platform so I can monitor quality, identify issues, and take action where necessary.

**Story Narrative** Case: The platform has grown to 500+ listings across 17 sports. The admin needs a single panel to see all listings — live, pending review, and flagged — without having to navigate each seller's profile individually. They need to filter by status, sport, date, and seller to quickly locate a specific listing or identify patterns of bad behaviour.

Flow: Admin logs in → navigates to Platform Management → opens Listings panel → sees paginated list of all listings across the platform with key metadata → applies filters (status, sport, date, seller) → sorts results → drills into a specific listing to view full detail → takes action if required.

Benefit: Gives the admin a comprehensive, real-time view of all marketplace inventory, enabling proactive quality control rather than reactive complaint handling.

---

## **3\. User Flow**

**Preconditions**

* Admin is authenticated with Super Admin role  
* At least one listing exists on the platform  
* Admin is on the Platform Management dashboard

**Main Flow**

1. Admin navigates to Platform Management → Listings  
2. Listings panel loads showing all listings in a paginated table  
3. Each row shows: listing ID, item title, sport/category, seller username, price, condition, status (Live / Pending / Flagged / Removed), and date created  
4. Admin applies filters — status, sport, category, condition, price range, seller, date range  
5. Admin sorts by date, price, or status  
6. Admin clicks a listing row to open listing detail view  
7. Listing detail shows all seller-submitted data: photos, title, description, category, brand, condition, colour, price, parcel size, seller profile, and listing history (edits, flags, removals)  
8. Admin reviews and decides to take action or exit back to listings panel

**Alternative Flow — Search by Seller**

1. Admin types seller username or user ID in search bar  
2. Listings panel filters to show only that seller's listings  
3. Admin reviews seller's full listing history including removed and flagged items

**Alternative Flow — Filter by Flagged Status**

1. Admin selects status filter → Flagged  
2. Panel shows only listings that have been flagged by buyers, sellers, or the system  
3. Admin reviews each flagged listing with flag reason displayed  
4. Admin takes action: remove, clear flag, or escalate

**Post Conditions**

* Admin has a complete, accurate view of all platform listings at any point in time  
* Filters and sort preferences are retained within the session  
* Any action taken from the listing detail view is logged in the audit trail  
* No listing data is altered purely by viewing — read-only unless an action is explicitly taken

---

## **4\. Acceptance Criteria**

* All listings across the platform are visible in the admin Listings panel regardless of status  
* Listings are displayed in a paginated table with configurable page size (25 / 50 / 100 per page)  
* Each listing row displays: listing ID, title, sport, sub-category, seller username, price, condition, status, and date created  
* Admin can filter listings by status (Live, Pending, Flagged, Removed), sport, sub-category, condition, price range, seller username, and date range  
* Admin can sort listings by date created (newest/oldest), price (high/low), and status  
* Admin can search listings by keyword (title), seller username, or listing ID  
* Listing detail view shows all seller-submitted fields including all uploaded photos  
* Listing detail view shows full listing history — date created, any edits made, flag history, and any admin actions taken  
* Listing detail view shows seller profile summary — username, rating, total listings, previous violations  
* Admin can navigate between listing detail and listings panel without losing filter state  
* Listings panel loads within 3 seconds for up to 1000 listings  
* Removed listings remain visible in the admin panel with a Removed status label and cannot be accessed by buyers or sellers

---

## **5\. Business Rules**

* All listings are visible to admin regardless of status — Live, Pending, Flagged, and Removed  
* Admin view is read-only unless an explicit action (flag, remove, approve) is taken  
* Removed listings are never deleted from the database — they are retained for audit and dispute reference  
* A listing flagged by a buyer does not automatically become hidden — it enters Flagged status and awaits admin review  
* Admin can view a removed listing's full detail at any time for reference or dispute resolution  
* Listings panel must reflect real-time status — a listing that goes live while admin is viewing the panel must appear without requiring a page refresh (or refresh within 60 seconds)  
* Seller profile summary shown in listing detail must link directly to the full user profile in the Users sub-module

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Search — Keyword | Search listings by title | Min 2 characters | "Enter at least 2 characters to search" | On input |
| Search — Listing ID | Search by listing ID | Must match listing ID format | "No listing found with this ID" | On search submit |
| Filter — Price Range | Filter by price | Min value must be less than max value | "Minimum price must be less than maximum price" | On filter apply |
| Filter — Date Range | Filter by date | Start date must be before or equal to end date | "Start date must be before end date" | On filter apply |
| Filter — Seller Username | Filter by seller | Must match an existing username | "No seller found with this username" | On filter apply |
| Page Size | Listings per page | Must be 25, 50, or 100 | Dropdown limited to valid options | On selection |

---

## **7\. Edge Cases**

| Scenario | Expected Behaviour | Handling |
| ----- | ----- | ----- |
| No listings exist on the platform | Empty state shown with message "No listings found" | Empty state UI with prompt to check filters or confirm platform status |
| Admin applies filters that return zero results | Empty state shown with "No listings match your filters" and a Clear Filters option | Filters retained; empty state displayed with clear filters CTA |
| Listing is edited by seller while admin is viewing it | Admin sees a stale data notice on next interaction: "This listing was updated while you were viewing it. Reload to see latest." | Timestamp check on detail view; stale notice triggered if listing updated since page load |
| Admin opens a listing that has been removed by the seller mid-session | Listing detail loads with Removed status label; all data visible to admin but no actions available other than restore | Status checked on detail view load; appropriate action set displayed |
| Listing has no photos (edge case from data migration or error) | Listing detail shows placeholder image with notice "No photos uploaded" | Null photo array handled gracefully in detail view |
| Very large number of listings (10,000+) | Pagination, filtering, and search must remain performant | Server-side pagination and indexed filtering required; no client-side data dumps |
| Admin searches for a seller that has no listings | Filter returns empty state with "This seller has no listings" | Zero-result state handled per seller search |

---

## **8\. Exceptional Cases**

* **Data export:** If the admin needs to export listing data for legal, compliance, or reporting purposes, there is no export function in v1. A CSV export of filtered listing results should be considered for v2.  
* **Bulk actions:** In v1, admin takes action on one listing at a time. If a seller has posted 50 fraudulent listings, removing them individually is inefficient. Bulk select and bulk remove should be prioritised for v2.  
* **Listing version history:** If a seller edits a listing after it has been flagged, the admin needs to see both the original and edited versions. Version history per listing should be stored and accessible in the detail view.

---

---

# **Feature 2 — Remove / Flag Listing**

---

## **9\. Story & Story Narrative**

**Story** As a Super Admin, I want to remove or flag listings that violate platform policies so buyers are protected and marketplace integrity is maintained.

**Story Narrative** Case 1 — Flag: A buyer reports a listing as fraudulent — the item is described as "Like new" but photos suggest it is heavily worn. The admin reviews the listing, agrees it is misrepresented, and flags it. The listing is hidden from buyers pending seller response. The seller is notified to either update the listing or it will be removed.

Case 2 — Remove: A listing is found to contain a prohibited item. The admin removes it immediately. The seller is notified with the reason. The listing is permanently hidden from buyers but retained in the system for audit purposes.

Case 3 — Clear Flag: A flagged listing is reviewed by admin and found to be compliant. The admin clears the flag and the listing is restored to Live status.

Flow: Admin in Listings panel → identifies listing requiring action → opens listing detail → selects action (Flag / Remove / Clear Flag) → enters reason → confirms → action applied → seller notified → audit log updated.

Benefit: Gives the admin fast, precise moderation tools to maintain platform quality and protect buyers without requiring the seller's cooperation or a lengthy review process.

---

## **10\. User Flow**

**Preconditions**

* Admin is authenticated with Super Admin role  
* Admin has opened a listing in detail view  
* Listing is in Live, Pending, or Flagged status

**Main Flow — Flag a Listing**

1. Admin reviews listing detail and identifies a policy concern  
2. Admin clicks "Flag Listing"  
3. Admin selects flag reason from predefined list (Misrepresented condition, Prohibited item, Suspected fraud, Duplicate listing, Incomplete listing, Other)  
4. Admin optionally adds a free-text note  
5. Admin confirms flag action  
6. Listing status changes to Flagged  
7. Listing is hidden from buyers immediately  
8. Seller receives notification: "Your listing \[title\] has been flagged for review. Reason: \[reason\]. Please review and update your listing or contact support."  
9. Admin audit log updated

**Main Flow — Remove a Listing**

1. Admin reviews listing and determines it violates platform policy and cannot be remedied by the seller  
2. Admin clicks "Remove Listing"  
3. Admin selects removal reason from predefined list (Prohibited item, Fraudulent listing, Repeated policy violation, Seller requested removal, Other)  
4. Admin optionally adds a free-text note  
5. Admin confirms removal  
6. Listing status changes to Removed  
7. Listing is immediately and permanently hidden from all buyer and seller-facing surfaces  
8. Seller receives notification: "Your listing \[title\] has been removed. Reason: \[reason\]. If you believe this is an error, contact support."  
9. If listing had an active order in progress, order is flagged for admin review in the Orders sub-module  
10. Admin audit log updated

**Main Flow — Clear a Flag**

1. Admin reviews a Flagged listing and determines it is compliant  
2. Admin clicks "Clear Flag"  
3. Admin adds a note confirming compliance  
4. Listing status returns to Live  
5. Listing is immediately visible to buyers again  
6. Seller receives notification: "Your listing \[title\] has been reviewed and reinstated."  
7. Admin audit log updated

**Alternative Flow — Seller Updates a Flagged Listing**

1. Seller receives flag notification  
2. Seller updates listing content (photos, description, condition)  
3. Updated listing enters Pending Review status  
4. Admin receives notification of seller update  
5. Admin reviews updated listing → clears flag or removes listing

**Alternative Flow — Buyer Reports a Listing**

1. Buyer taps "Report Listing" on listing detail page  
2. Buyer selects report reason  
3. Listing is flagged in admin panel with source noted as "Buyer report"  
4. Admin reviews and takes action

**Post Conditions**

* Flagged listing is hidden from all buyers immediately and remains hidden until admin clears the flag or removes the listing  
* Removed listing is permanently hidden from all buyer and seller surfaces but fully retained in the system  
* Seller has been notified of the action and reason in all cases  
* If an active order existed on a removed listing, the order is flagged for review in the Orders sub-module  
* All actions are recorded in the admin audit log with action type, reason, free-text note, admin user ID, and timestamp  
* Listing status in the Listings panel accurately reflects the outcome of the action

---

## **11\. Acceptance Criteria**

**Flag**

* Admin can flag any Live or Pending listing  
* Admin must select a flag reason from a predefined list before confirming  
* Free-text note is optional but available on all flag actions  
* Flagged listing is hidden from buyers immediately on confirmation  
* Seller receives an in-app and email notification within 5 minutes of flag action  
* Notification includes listing title, flag reason, and next steps for the seller  
* Flagged listing remains visible to admin in the Listings panel with Flagged status label  
* Admin can view all previous flag history on a listing in the listing detail view

**Remove**

* Admin can remove any listing regardless of status (Live, Pending, Flagged)  
* Admin must select a removal reason before confirming  
* Removed listing disappears from all buyer and seller surfaces immediately  
* Removed listing remains visible to admin with Removed status  
* Seller receives in-app and email notification within 5 minutes of removal  
* Notification includes listing title, removal reason, and support contact option  
* If an active order exists on the listing at time of removal, an alert is raised in the Orders sub-module  
* Removed listing cannot be reinstated by the seller — only admin can restore it

**Clear Flag**

* Admin can clear a flag on any Flagged listing  
* Admin must add a brief compliance note before clearing  
* Listing returns to Live status immediately on clear  
* Listing becomes visible to buyers immediately  
* Seller receives notification that their listing has been reinstated  
* Flag event and clear event both appear in the listing's history log

**General**

* All three actions (Flag, Remove, Clear Flag) are available from the listing detail view  
* Actions are not available from the listings panel table view — admin must open detail view first  
* Confirmation prompt appears before any destructive action (flag or remove)  
* Admin cannot flag or remove a listing that is already in Removed status  
* All actions are reversible by admin only — sellers cannot undo a flag or removal

---

## **12\. Business Rules**

* Only Super Admin can flag, remove, or clear listings — sellers and buyers cannot trigger these states directly  
* A buyer report does not automatically flag a listing — it creates a flag request that the admin must action  
* A listing can only be in one status at a time: Live, Pending, Flagged, or Removed  
* A removed listing can only be restored by admin — not by the seller  
* Removal reason is mandatory; flag reason is mandatory — neither action can be completed without a reason selected  
* A listing with an active in-progress order cannot be silently removed — the admin must be warned and the order must be flagged for review in the Orders sub-module before removal is confirmed  
* Seller notification must be sent for every flag and removal action within 5 minutes  
* A seller who has 3 or more listings removed within 30 days is automatically escalated to the Users sub-module for account review  
* Flag and removal history is retained on the listing permanently and is visible to admin even after the listing is restored or archived  
* Admin free-text notes on flag and removal actions are internal only — they are not shared with the seller

---

## **13\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Flag Reason | Flag action | Required, must select from predefined list | "Please select a flag reason to continue" | On confirm |
| Removal Reason | Remove action | Required, must select from predefined list | "Please select a removal reason to continue" | On confirm |
| Admin Note — Flag | Optional free text | Max 500 characters | Character counter shown; input blocked at 500 | On input |
| Admin Note — Remove | Optional free text | Max 500 characters | Character counter shown; input blocked at 500 | On input |
| Clear Flag Note | Clear flag action | Required, min 10 characters | "Please add a brief compliance note before clearing this flag" | On confirm |
| Listing Status Check | Flag / Remove | Listing must not already be in Removed status | "This listing has already been removed — no further action available" | On action button render |
| Active Order Check | Remove action | System checks for active orders on the listing | "This listing has an active order. Removing it will flag the order for review. Confirm?" | On remove confirm |

---

## **14\. Edge Cases**

| Scenario | Expected Behaviour | Handling |
| ----- | ----- | ----- |
| Admin flags a listing that has already been flagged by another admin | Second flag action shows notice: "This listing is already flagged by \[Admin\]. View flag history before proceeding." | Flag history check on action render; duplicate flag prevented |
| Seller deletes their listing at the same moment admin tries to remove it | Admin sees: "This listing was removed by the seller moments ago." Action not required | Concurrent state check on confirm; graceful conflict message |
| Listing has an active Buyer Protection escrow payment at time of removal | Order is automatically flagged in Orders sub-module; escrow held pending admin resolution | Order flag triggered on removal; finance team alerted |
| Admin removes a listing but the seller immediately relists the same item | New listing is a separate entity — admin must flag/remove the new listing independently. Pattern of re-listing triggers automated escalation alert | Relisting detection logic: same seller \+ same title \+ same photos within 24 hours triggers alert to admin |
| Buyer report submitted for a listing that admin is already reviewing | Report queued and visible in listing flag history; admin sees both their own review and the buyer report as separate entries | Report logged against listing; does not interrupt active admin review session |
| Admin clears a flag but listing has since expired (e.g. seller account suspended) | Clear flag action blocked; notice shown: "This listing cannot be reinstated as the seller account is currently suspended." | Seller account status checked before clear flag is permitted |
| Network failure mid-flag or mid-remove action | Action is rolled back; listing status unchanged; admin shown error: "Action failed — please try again." | Transactional write to database; rollback on failure; no partial state |
| Seller has 3 removals in 30 days — escalation triggered | Automated alert raised in Users sub-module against seller account for admin review | Removal count tracked per seller per rolling 30-day window; threshold alert automated |

---

## **15\. Exceptional Cases**

* **Legal hold on a listing:** If law enforcement or a legal team requests that a listing be preserved exactly as-is (e.g. for fraud investigation), the standard remove flow must not be used as it alters the listing's accessibility. A legal hold flag that freezes the listing in its current state without notifying the seller should be considered for v2.  
* **Mass fraudulent listings from one seller:** If a seller posts 20+ fraudulent listings simultaneously, removing them one by one is not viable. Bulk remove with a single reason applied to all selected listings must be prioritised as a near-term feature before platform scale makes individual removal unmanageable.  
* **Automated listing quality flagging:** In v1, flagging is entirely manual. As the platform scales, an AI-assisted content quality check (blurry photos, mismatched category and description, suspiciously low price) should auto-flag listings for admin review rather than relying solely on buyer reports or admin discovery.  
* **Seller appeals process:** In v1, a removed seller has no formal in-platform appeals mechanism — they are directed to contact support. A structured in-platform appeals flow where the seller can submit evidence and the admin can review and reinstate should be designed before platform scale generates significant removal volume.

# **SRS — Platform Management | Users**

**Platform:** The Kit Loop | **User:** Super Admin | **Module:** Platform Management | **Sub-Module:** Users | **Version:** 1.0

---

## **1\. Feature Overview**

The Users sub-module gives the Super Admin complete visibility and control over all registered users on the platform — both buyers and sellers. The admin can search, filter, and review any user's profile, activity history, listing history, order history, and violation record. Where a user is found to be in breach of platform policy, the admin can apply a temporary suspension or a permanent ban.

There are two features within this sub-module:

* **Feature 1 — View All Users**  
* **Feature 2 — Suspend / Ban User**

---

---

# **Feature 1 — View All Users**

---

## **2\. Story & Story Narrative**

**Story** As a Super Admin, I want to view all registered users on the platform so I can monitor account activity, identify bad actors, and access full user detail when investigating a dispute or policy violation.

**Story Narrative** Case: A buyer raises a dispute claiming a seller has misrepresented multiple items across several transactions. The admin needs to pull up the seller's full account — listing history, completed orders, previous flags, and buyer complaints — from a single panel without navigating across multiple sub-modules.

Flow: Admin logs in → navigates to Platform Management → opens Users panel → sees paginated list of all registered users → applies filters (role, status, join date, sport activity) → searches by username or email → opens user profile → reviews full account detail including listings, orders, ratings, and violation history → decides whether to take action.

Benefit: Provides the admin with a centralised, comprehensive user directory that enables fast investigation, informed moderation decisions, and proactive identification of problematic accounts before they cause significant harm to buyers or the marketplace.

---

## **3\. User Flow**

**Preconditions**

* Admin is authenticated with Super Admin role  
* At least one registered user exists on the platform  
* Admin is on the Platform Management dashboard

**Main Flow**

1. Admin navigates to Platform Management → Users  
2. Users panel loads showing all registered users in a paginated table  
3. Each row displays: user ID, username, email, role (Buyer / Seller / Both), account status (Active / Suspended / Banned), join date, total listings, total orders, and last active date  
4. Admin applies filters — role, status, join date range, sport activity  
5. Admin sorts by join date, last active, total listings, or total orders  
6. Admin searches by username, email address, or user ID  
7. Admin clicks a user row to open the full user profile  
8. User profile displays:  
   * Personal details: username, email, profile photo, join date, last active  
   * Role summary: buyer activity (orders placed, disputes raised) and seller activity (listings created, sales completed, ratings received)  
   * Listing history: all listings with status (Live, Sold, Removed, Flagged)  
   * Order history: all purchases and sales with status and value  
   * Violation history: previous flags, suspensions, bans, listing removals with reasons and dates  
   * Seller rating: cumulative star rating and individual reviews  
9. Admin reviews profile and decides to take action or exit

**Alternative Flow — Search by Email**

1. Admin types full or partial email address in search bar  
2. Matching users displayed instantly  
3. Admin opens profile and reviews

**Alternative Flow — Filter Suspended / Banned Users**

1. Admin selects status filter → Suspended or Banned  
2. Panel shows only users in that status  
3. Admin reviews list and opens individual profiles as needed

**Alternative Flow — Navigate from Listing or Order**

1. Admin is reviewing a flagged listing or disputed order in another sub-module  
2. Admin clicks seller or buyer username within that view  
3. Platform navigates directly to that user's profile in the Users sub-module  
4. Admin reviews full account context without losing their place in the originating sub-module (back navigation available)

**Post Conditions**

* Admin has a complete, accurate, real-time view of all registered users  
* No user data is altered by viewing — panel and profile are read-only unless an explicit action is taken  
* Filter and sort state is retained within the session  
* Any action taken from the user profile is logged in the admin audit trail with admin user ID and timestamp

---

## **4\. Acceptance Criteria**

* All registered users are visible in the admin Users panel regardless of account status  
* Users table is paginated with configurable page size (25 / 50 / 100 per page)  
* Each row displays: user ID, username, email, role, account status, join date, total listings, total orders, and last active date  
* Admin can filter by role (Buyer, Seller, Both), status (Active, Suspended, Banned), join date range, and last active date range  
* Admin can sort by join date, last active date, total listings, and total orders  
* Admin can search by username, email address, and user ID  
* Search returns results for partial matches on username and email  
* User profile loads within 2 seconds and displays all sections: personal details, role summary, listing history, order history, violation history, and seller rating  
* Listing history in user profile links directly to the listing detail view in the Listings sub-module  
* Order history in user profile links directly to the order detail view in the Orders sub-module  
* Admin can navigate from a listing or order directly to the associated user's profile  
* Banned and suspended users remain fully visible in the admin Users panel  
* User profile shows a complete violation history including all previous suspensions, bans, and listing removals with reasons and dates  
* Users panel loads within 3 seconds for up to 10,000 registered users

---

## **5\. Business Rules**

* All user accounts are visible to admin regardless of status — Active, Suspended, or Banned  
* Admin view of user profiles is read-only unless an explicit action is taken  
* User data including email address is visible to admin for moderation and support purposes; this access must comply with GDPR and UK data protection regulations  
* A user's account history — listings, orders, violations — is never deleted from the admin view even if the user deletes their account  
* Deleted accounts are shown with a Deleted status label and retain all historical data for audit and dispute purposes  
* The violation history section must surface all cross-sub-module actions — listing removals from the Listings sub-module, order disputes from the Orders sub-module, and direct account actions from the Users sub-module — in a single unified timeline  
* Seller ratings and individual reviews are visible on the user profile and cannot be edited or deleted by admin in v1  
* Last active date is defined as the most recent of: login, listing creation, purchase, message sent, or dispute raised

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Search — Username | Search users | Min 2 characters | "Enter at least 2 characters to search" | On input |
| Search — Email | Search by email | Must contain @ symbol for email search | "Enter a valid email address" | On search submit |
| Search — User ID | Search by ID | Must match user ID format | "No user found with this ID" | On search submit |
| Filter — Join Date Range | Filter by join date | Start date must be before or equal to end date | "Start date must be before end date" | On filter apply |
| Filter — Last Active Range | Filter by activity | Start date must be before or equal to end date | "Start date must be before end date" | On filter apply |
| Page Size | Users per page | Must be 25, 50, or 100 | Dropdown limited to valid options | On selection |

---

## **7\. Edge Cases**

| Scenario | Expected Behaviour | Handling |
| ----- | ----- | ----- |
| Admin searches for a user who has deleted their account | User appears in results with Deleted status label; full historical data visible to admin | Deleted accounts retained with status flag; visible to admin only |
| User has both buyer and seller activity | Profile shows both buyer and seller sections with separate summaries; role shown as Both | Role detection based on activity; dual-section profile view |
| User has zero listings and zero orders (registered but never active) | Profile shows empty sections with "No activity" for listings and orders | Null state handled gracefully in profile view |
| Admin filters return zero results | Empty state shown: "No users match your filters" with Clear Filters option | Empty state UI; filters retained |
| Two admins view the same user profile simultaneously | Both admins can view; no conflict as view is read-only | Read-only access; no locking required for view |
| User account has thousands of listings or orders | Listing and order history sections within user profile are paginated | Pagination applied within profile sections; not a flat list |
| Admin navigates from a listing to user profile and then uses browser back | Returns to listing detail at the same scroll position | Navigation state preserved; back button returns to originating view |
| User has changed their username since a violation was recorded | Violation history shows the username at time of violation alongside current username | Username snapshot stored on violation record at time of action |

---

## **8\. Exceptional Cases**

* **GDPR right to erasure request:** If a user submits a GDPR erasure request, the platform must balance the legal obligation to delete personal data with the operational need to retain transaction and violation history for fraud prevention and dispute resolution. Personal identifiers (name, email, photo) should be anonymised rather than deleted outright, while transaction and violation records are retained. This process must be defined with legal counsel before v1 launch.  
* **Data export for legal purposes:** If law enforcement requests user data, there is no structured export mechanism in v1. A secure, audited data export function with legal hold capability should be designed for v2.  
* **Bulk user review:** If a coordinated fraud ring creates multiple accounts simultaneously, reviewing them one by one is inefficient. A bulk selection and bulk action capability (e.g. bulk suspend) should be prioritised for v2.  
* **User impersonation for support:** In some platforms, admin can log in as a user to replicate an issue. This capability carries significant privacy and security risk and must not be built without explicit consent mechanisms, full audit logging, and legal sign-off.

---

---

# **Feature 2 — Suspend / Ban User**

---

## **9\. Story & Story Narrative**

**Story** As a Super Admin, I want to suspend or permanently ban users who violate platform policy so the community remains safe, trustworthy, and fair for all buyers and sellers.

**Story Narrative** Case 1 — Suspension: A seller has had two listings removed in the past 30 days for misrepresenting item condition. A third complaint has been received. The admin reviews the account and issues a 14-day suspension as a warning — the seller's active listings are paused, they cannot create new listings or make purchases, and they are notified of the reason and duration. After 14 days the account is automatically reinstated.

Case 2 — Permanent Ban: A user is found to be operating a fraudulent scheme — listing items they do not own, collecting payment via off-platform methods, and creating multiple accounts to evade detection. The admin issues a permanent ban. All active listings are removed, all in-progress orders are flagged for admin review, the account is locked, and the user is notified. All associated device fingerprints and email addresses are flagged to prevent re-registration.

Case 3 — Lift Suspension: A suspended seller contacts support and provides satisfactory evidence that their policy violation was a genuine mistake. The admin reviews and lifts the suspension early, restoring the account to Active status.

Flow: Admin in Users panel → opens user profile → reviews violation history and activity → selects Suspend or Ban → sets duration (suspension) or confirms permanent (ban) → enters reason → confirms action → user notified → listings and orders actioned → audit log updated.

Benefit: Gives the admin precise, graduated enforcement tools that protect the marketplace from bad actors while allowing proportionate responses — a temporary suspension for minor violations, a permanent ban for serious or repeated offences.

---

## **10\. User Flow**

**Preconditions**

* Admin is authenticated with Super Admin role  
* Admin has opened a user profile in the Users sub-module  
* User account is currently in Active status (for suspend or ban) or Suspended status (for lift or escalate to ban)

**Main Flow — Suspend User**

1. Admin reviews user profile and violation history  
2. Admin clicks "Suspend User"  
3. Admin selects suspension duration: 7 days, 14 days, 30 days, or Custom (1–90 days)  
4. Admin selects suspension reason from predefined list (Misrepresented listing, Repeated policy violation, Buyer complaint — unresolved, Off-platform transaction attempt, Suspicious activity, Other)  
5. Admin optionally adds a free-text internal note  
6. Admin confirms suspension  
7. User account status changes to Suspended immediately  
8. All user's active listings are paused and hidden from buyers  
9. User loses ability to: create listings, make purchases, send messages, raise disputes  
10. User receives in-app and email notification: "Your account has been suspended for \[X days\]. Reason: \[reason\]. Your account will be reinstated on \[date\]. If you believe this is an error, contact support."  
11. Suspension end date is set; account automatically reinstates to Active on that date  
12. Admin audit log updated

**Main Flow — Ban User (Permanent)**

1. Admin reviews user profile and determines violation warrants permanent removal  
2. Admin clicks "Ban User"  
3. Admin selects ban reason from predefined list (Fraud, Repeated serious violations, Off-platform payment fraud, Counterfeit items, Multiple account evasion, Abusive behaviour, Other)  
4. Admin optionally adds a free-text internal note  
5. Admin is shown a confirmation prompt: "This action is permanent. The user will lose all access and cannot re-register with this email. Confirm permanent ban?"  
6. Admin confirms  
7. User account status changes to Banned immediately  
8. All user's active listings are removed (status set to Removed)  
9. All in-progress orders involving this user are flagged in the Orders sub-module for admin review  
10. User's email address and device fingerprint are flagged to prevent re-registration  
11. User receives notification: "Your account has been permanently banned from The Kit Loop. Reason: \[reason\]. If you believe this is an error, contact support."  
12. Admin audit log updated

**Main Flow — Lift Suspension**

1. Admin opens a Suspended user's profile  
2. Admin clicks "Lift Suspension"  
3. Admin adds a mandatory note explaining reason for early reinstatement  
4. Admin confirms  
5. User account status returns to Active immediately  
6. User's paused listings are restored to Live status  
7. User regains full platform access  
8. User receives notification: "Your account suspension has been lifted. You now have full access to The Kit Loop."  
9. Admin audit log updated

**Alternative Flow — Automatic Suspension Trigger**

1. System detects seller has reached 3 listing removals within 30 days  
2. Automated alert raised in Users sub-module against the seller's account  
3. Admin reviews alert and decides to issue suspension manually or dismiss the alert  
4. System does not auto-suspend — admin action is always required

**Alternative Flow — User Attempts to Re-register After Ban**

1. Banned user tries to register with the same email address  
2. System blocks registration: "This email address is not eligible for registration."  
3. If user attempts registration with a different email but same device fingerprint, system flags the attempt and alerts admin  
4. Admin reviews and takes action

**Post Conditions**

* Suspended user has immediately lost access to all platform actions (list, buy, message, dispute)  
* Suspended user's active listings are hidden from buyers for the duration of the suspension  
* Banned user's account is permanently locked and all active listings are removed  
* All in-progress orders involving a banned user are flagged in the Orders sub-module  
* Banned user's email and device fingerprint are flagged to block re-registration  
* User has received an in-app and email notification with reason and (for suspension) reinstatement date  
* Admin audit log records the full action: type, reason, duration, internal note, admin user ID, and timestamp  
* For lifted suspensions, user's listings are restored and full access reinstated immediately

---

## **11\. Acceptance Criteria**

**Suspend**

* Admin can suspend any Active user account from the user profile view  
* Admin must select a suspension duration and reason before confirming  
* Suspension duration options: 7 days, 14 days, 30 days, Custom (1–90 days)  
* Free-text internal note is optional but available  
* User account changes to Suspended status immediately on confirmation  
* All user's active listings are paused and hidden from buyers immediately  
* Suspended user cannot log in, create listings, purchase, send messages, or raise disputes during suspension  
* User receives in-app and email notification within 5 minutes including reason and reinstatement date  
* Account automatically reinstates to Active status on the suspension end date without admin action  
* On reinstatement, all previously paused listings are restored to Live status automatically

**Ban**

* Admin can permanently ban any Active or Suspended user from the user profile view  
* Admin must select a ban reason before confirming  
* A secondary confirmation prompt is shown before ban is applied — admin must confirm twice  
* User account changes to Banned status immediately on confirmation  
* All user's active listings are set to Removed status immediately  
* All in-progress orders involving the user are flagged in the Orders sub-module immediately  
* User's email address is flagged to block re-registration  
* Device fingerprint is flagged to alert admin if re-registration is attempted from same device  
* User receives in-app and email notification within 5 minutes  
* Banned account cannot be reinstated by the seller — only admin can lift a ban  
* Ban is permanent unless explicitly reversed by admin

**Lift Suspension**

* Admin can lift a suspension at any time before the suspension end date  
* Admin must add a mandatory note before confirming lift  
* Account returns to Active immediately  
* Previously paused listings are restored to Live immediately  
* User receives notification within 5 minutes of reinstatement

**General**

* Admin cannot suspend or ban another Super Admin account  
* Suspend and Ban actions are not available from the Users panel table — admin must open the user profile  
* All actions require a confirmation prompt before execution  
* Audit log entry is created for every suspend, ban, lift, and auto-reinstatement event

---

## **12\. Business Rules**

* Only Super Admin can suspend or ban a user — no automated system action without admin confirmation  
* A suspended user's listings are paused (hidden, not removed) and automatically restored on reinstatement  
* A banned user's listings are permanently removed — they are not restored if the ban is ever lifted  
* A ban can only be lifted by a Super Admin — there is no automatic reinstatement for bans  
* Admin cannot suspend or ban another Super Admin — this prevents a single admin from locking out the entire admin team  
* Suspension duration maximum is 90 days in a single action — longer enforcement requires a ban  
* A user who is suspended and reaches their suspension end date is automatically reinstated — no admin action required  
* A banned user's email address is permanently flagged in the registration system — they cannot re-register with that email  
* Device fingerprint flagging is a soft alert (notifies admin of re-registration attempt) not a hard block, to avoid false positives from shared devices  
* In-progress orders at time of ban must not be silently cancelled — they are flagged for admin review and resolved case by case  
* Seller ratings and reviews on a banned account are hidden from buyers but retained in the system for audit purposes  
* The automated alert for 3 listing removals in 30 days is a trigger for admin review only — it does not auto-suspend the user  
* All suspension and ban notifications sent to users must include a support contact route for appeals

---

## **13\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Suspension Duration — Preset | Suspend action | Must select one of: 7, 14, 30 days or Custom | Selection required; confirm button disabled until selected | On confirm attempt |
| Suspension Duration — Custom | Custom suspend duration | Integer, min 1, max 90 days | "Custom duration must be between 1 and 90 days" | On input and on confirm |
| Suspension Reason | Suspend action | Required, must select from predefined list | "Please select a suspension reason to continue" | On confirm |
| Ban Reason | Ban action | Required, must select from predefined list | "Please select a ban reason to continue" | On confirm |
| Ban Confirmation | Ban action | Admin must confirm twice — initial confirm \+ secondary prompt | Secondary prompt: "This action is permanent. Confirm permanent ban?" | On first confirm |
| Admin Note — Suspend | Optional free text | Max 500 characters | Character counter shown; input blocked at 500 | On input |
| Admin Note — Ban | Optional free text | Max 500 characters | Character counter shown; input blocked at 500 | On input |
| Lift Note | Lift suspension | Required, min 10 characters | "Please add a note explaining the reason for lifting this suspension" | On confirm |
| Target User — Admin Check | Suspend / Ban | Target user must not be a Super Admin | "Super Admin accounts cannot be suspended or banned" | On action button render |
| Account Status Check | Suspend | User must be in Active status | "This user is already suspended or banned" | On action button render |

---

## **14\. Edge Cases**

| Scenario | Expected Behaviour | Handling |
| ----- | ----- | ----- |
| Suspended user has an active order mid-suspension | Order continues to fulfilment — suspension does not cancel in-progress orders; buyer is not impacted | Order fulfilment proceeds; seller cannot create new listings but existing order obligations remain |
| Admin bans a user who is currently mid-checkout as a buyer | Checkout session is terminated; payment not processed; buyer notified that their account has been restricted | Session invalidated on ban; in-progress payment rolled back via Stripe |
| Suspension end date falls on a weekend or bank holiday | Account reinstates automatically at midnight on the exact end date regardless of day | Automated reinstatement is date-based, not business-day-based |
| Admin lifts a suspension for a user whose listings have since expired or been removed by another action | Only listings that were paused by the suspension are restored; listings removed by admin action during the suspension period remain removed | Listing restoration logic filters by suspension-paused status only |
| Banned user contacts support claiming ban is an error | Support team can escalate to admin for review; admin can lift ban manually | Lift ban function available to admin at any time; no in-platform appeals flow in v1 |
| User creates a second account after being suspended (not banned) | Second account is not automatically flagged — suspension only restricts the original account | Device fingerprint monitoring is a ban-only feature in v1; suspension evasion handled reactively |
| Admin suspends a user then immediately tries to ban them before suspension takes effect | Suspension is applied first; ban action is available from Suspended status | Sequential action supported; Suspended status enables Ban action |
| Two admins attempt to suspend the same user simultaneously | First admin's action is applied; second admin sees: "This user's status was updated moments ago. Reload to see the latest." | Optimistic locking on status field; conflict detected and surfaced |
| Banned user's in-progress order had buyer protection escrow payment held | Escrow is held; order flagged for admin review; admin resolves case by case — refund to buyer or release to seller | Escrow not automatically refunded on ban; requires admin decision per order |
| User has a positive seller balance at time of ban | Balance is frozen pending admin review; not automatically paid out | Payout frozen on ban; finance team alerted; resolved per platform policy |

---

## **15\. Exceptional Cases**

* **Coordinated fraud ring — multiple accounts:** If multiple accounts are identified as part of the same fraud operation, banning them individually is inefficient and risks missing linked accounts. A linked account detection feature (shared device, IP, or payment method) with bulk ban capability should be designed for v2.  
* **Legal obligation to maintain account access:** In rare cases (e.g. active law enforcement investigation), the platform may be legally required to keep an account active despite policy violations. A legal hold status that prevents admin from banning while preserving the account for monitoring should be considered.  
* **User balance at time of ban — disputed funds:** If a banned seller has a significant balance in escrow across multiple orders, the resolution process is not defined in v1. A clear policy and admin workflow for resolving frozen balances on banned accounts must be established before platform scale makes this a common scenario.  
* **Minor accounts:** If a user is identified as being under 18, the appropriate action may not be a standard ban but a different account closure process with potential parental notification obligations depending on jurisdiction. A dedicated underage account handling policy should be defined with legal counsel.  
* **Seller with outstanding buyer protection claims at time of ban:** If a seller is banned while one or more buyers have open disputes against them, the dispute resolution process must continue independently of the ban. The admin must be able to resolve those disputes and issue refunds from the banned seller's frozen balance without reinstating the account.

# **SRS — Platform Management | Orders**

**Platform:** The Kit Loop | **User:** Super Admin | **Module:** Platform Management | **Sub-Module:** Orders | **Version:** 1.0

---

## **1\. Feature Overview**

The Orders sub-module gives the Super Admin full visibility over every transaction on the platform and the tools to intervene when a buyer–seller dispute cannot be resolved independently. The admin can monitor all orders across all statuses, drill into individual order detail, and take binding decisions on disputed orders — including issuing refunds, releasing escrow to the seller, or escalating to a partial resolution.

There are two features within this sub-module:

* **Feature 1 — View All Orders**  
* **Feature 2 — Intervene in Dispute**

---

---

# **Feature 1 — View All Orders**

---

## **2\. Story & Story Narrative**

**Story** As a Super Admin, I want to view all orders across the platform so I can monitor transaction health, track fulfilment, and have full context when resolving disputes or investigating user complaints.

**Story Narrative** Case: A buyer contacts support claiming their item has not arrived 10 days after purchase. The admin needs to pull up the order immediately — see the payment status, dispatch date, tracking number, delivery address, and the seller's fulfilment actions — to assess the situation and decide whether to intervene.

Flow: Admin logs in → navigates to Platform Management → opens Orders panel → sees all orders in a paginated table with key transaction data → applies filters (status, date, sport, value) → searches by order ID, buyer, or seller → opens order detail → reviews full transaction record → decides to intervene or monitor.

Benefit: Provides the admin with a real-time, comprehensive view of all platform transactions enabling fast, informed responses to fulfilment failures, disputes, and fraud — without needing to ask buyers or sellers for information they should already have.

---

## **3\. User Flow**

**Preconditions**

* Admin is authenticated with Super Admin role  
* At least one order exists on the platform  
* Admin is on the Platform Management dashboard

**Main Flow**

1. Admin navigates to Platform Management → Orders  
2. Orders panel loads showing all orders in a paginated table  
3. Each row displays: order ID, item title, sport/category, buyer username, seller username, order value, payment status, fulfilment status, dispute status, and order date  
4. Admin applies filters — fulfilment status, payment status, dispute status, sport, date range, order value range  
5. Admin sorts by date, value, or status  
6. Admin searches by order ID, buyer username, seller username, or item title  
7. Admin clicks an order row to open order detail view  
8. Order detail displays:  
   * Item details: title, photos, category, brand, condition, price  
   * Buyer details: username, delivery address, payment method used  
   * Seller details: username, seller rating, dispatch actions  
   * Payment breakdown: item price, shipping fee, buyer protection fee, total paid, escrow status  
   * Fulfilment timeline: order placed, payment confirmed, dispatched (with tracking number if provided), delivered, buyer confirmation  
   * Dispute history: any disputes raised, reasons given, evidence submitted, admin actions taken  
   * Communication log: message thread between buyer and seller related to this order  
9. Admin reviews full order detail and decides to take action or monitor

**Alternative Flow — Filter by Dispute Status**

1. Admin selects Dispute Status filter → Active Dispute  
2. Panel shows only orders with an open dispute awaiting admin review  
3. Admin prioritises and opens each disputed order  
4. Admin reviews and intervenes

**Alternative Flow — Navigate from User Profile**

1. Admin is reviewing a user profile in the Users sub-module  
2. Admin clicks an order in the user's order history  
3. Platform navigates directly to that order detail in the Orders sub-module  
4. Admin reviews full order context  
5. Back navigation returns admin to the user profile

**Alternative Flow — Flagged Orders from Ban Action**

1. A user is banned in the Users sub-module  
2. All in-progress orders involving that user are automatically flagged in the Orders panel  
3. Admin sees flagged orders highlighted with a "Requires Review" label  
4. Admin opens each flagged order and resolves individually

**Post Conditions**

* Admin has a complete, accurate, real-time view of all platform orders at any point in time  
* No order data is altered purely by viewing — panel and detail view are read-only unless an action is explicitly taken  
* Filter and sort state is retained within the session  
* Any action taken from the order detail view is logged in the admin audit trail

---

## **4\. Acceptance Criteria**

* All orders across the platform are visible in the admin Orders panel regardless of status  
* Orders table is paginated with configurable page size (25 / 50 / 100 per page)  
* Each row displays: order ID, item title, sport, buyer username, seller username, order value, payment status, fulfilment status, dispute status, and order date  
* Admin can filter by fulfilment status (Pending, Dispatched, Delivered, Completed, Cancelled), payment status (Held in Escrow, Released, Refunded), dispute status (No Dispute, Active Dispute, Dispute Resolved), sport, date range, and order value range  
* Admin can sort by order date, order value, and status  
* Admin can search by order ID, buyer username, seller username, and item title  
* Order detail view loads within 2 seconds and displays all sections: item details, buyer details, seller details, payment breakdown, fulfilment timeline, dispute history, and communication log  
* Fulfilment timeline shows exact timestamps for each stage: order placed, payment confirmed, dispatched, delivered, buyer confirmation  
* Tracking number is displayed in fulfilment timeline when provided by seller  
* Payment breakdown shows itemised amounts: item price, Royal Mail shipping fee, buyer protection fee, and total paid  
* Escrow status is clearly shown: Held, Released to Seller, or Refunded to Buyer  
* Communication log shows the full buyer–seller message thread related to the order  
* Orders flagged from a ban action are highlighted with a "Requires Review" label in the panel  
* Admin can navigate from an order to the buyer or seller's user profile in the Users sub-module  
* Admin can navigate from an order to the listing detail in the Listings sub-module  
* Completed orders remain visible in the panel permanently and cannot be deleted

---

## **5\. Business Rules**

* All orders are visible to admin regardless of status — including completed, cancelled, refunded, and disputed  
* Admin view is read-only unless an explicit action is taken from the dispute intervention flow  
* Order records are never deleted from the database — they are retained permanently for audit, legal, and dispute reference  
* Escrow status must be accurate and real-time — the admin must always be able to see whether funds are held, released, or refunded at any point in time  
* Orders flagged as a result of a listing removal or user ban must appear in the Orders panel with a Requires Review label within 60 seconds of the triggering action  
* The communication log between buyer and seller is visible to admin for dispute and fraud investigation purposes — this access must comply with GDPR and UK data protection regulations  
* An order cannot be manually altered (price changed, item swapped) by admin — the only financial actions available are refund to buyer or release to seller via the dispute intervention flow  
* Orders in Completed status (escrow released, no dispute) cannot be reopened unless fraud is suspected — admin must document reasoning in the audit log if a completed order is reopened

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Search — Order ID | Search by order ID | Must match order ID format | "No order found with this ID" | On search submit |
| Search — Username | Search by buyer or seller | Min 2 characters | "Enter at least 2 characters to search" | On input |
| Filter — Date Range | Filter by order date | Start date must be before or equal to end date | "Start date must be before end date" | On filter apply |
| Filter — Order Value Range | Filter by value | Min value must be less than max value | "Minimum value must be less than maximum value" | On filter apply |
| Page Size | Orders per page | Must be 25, 50, or 100 | Dropdown limited to valid options | On selection |

---

## **7\. Edge Cases**

| Scenario | Expected Behaviour | Handling |
| ----- | ----- | ----- |
| Admin searches for an order ID that does not exist | Empty result with message: "No order found with this ID" | Zero result state handled gracefully |
| Order has no tracking number (seller has not provided one) | Fulfilment timeline shows dispatch date with "Tracking not provided" notice | Null tracking field handled in timeline display |
| Order involves a user whose account has since been deleted | Order detail shows username with Deleted Account label; full order data still visible | Deleted account status displayed; data retained |
| Admin applies filters that return zero results | Empty state: "No orders match your filters" with Clear Filters option | Filters retained; empty state displayed |
| Order value is zero (e.g. free item or data error) | Order is visible with £0.00 value; flagged for admin review automatically | Zero-value orders auto-flagged as anomalies |
| Order has multiple dispute entries (e.g. dispute raised, closed, then raised again) | Full dispute history shown chronologically in the dispute history section | All dispute events stored and displayed in timeline order |
| Admin navigates from a banned user's flagged order back to the Orders panel | Returns to Orders panel with Requires Review filter still applied | Navigation state preserved |
| Order is in a disputed state when admin opens it and buyer resolves it simultaneously | Admin sees stale data notice: "This order was updated while you were viewing it. Reload to see latest." | Timestamp check on detail view load |

---

## **8\. Exceptional Cases**

* **Data export for legal or accounting purposes:** No export function exists in v1. A CSV export of filtered order data is required before platform scale and should be prioritised for v2 — particularly for VAT reporting, GMV tracking, and fraud investigations.  
* **Order involving a banned payment method:** If Stripe flags a payment as fraudulent after the order has completed and escrow has been released, the platform has no automated chargeback handling in v1. A chargeback management workflow must be defined before platform launch.  
* **High order volume during peak periods:** During seasonal campaigns (e.g. start of cricket season), order volume may spike significantly. The Orders panel must remain performant under load — server-side pagination, indexed queries, and load testing should be completed before any marketing campaign that could drive a volume spike.  
* **Cross-currency orders:** The platform operates in GBP in v1. If international sellers or buyers are onboarded in future, multi-currency order display and reporting must be designed as a separate workstream.

---

---

# **Feature 2 — Intervene in Dispute**

---

## **9\. Story & Story Narrative**

**Story** As a Super Admin, I want to intervene in buyer–seller disputes so I can make a binding ruling, protect the buyer where warranted, and ensure the platform's 5% buyer protection guarantee is enforced fairly and consistently.

**Story Narrative** Case 1 — Refund to Buyer: A buyer purchased a cricket bat described as "Like new" for £120. On delivery the bat has a cracked edge not visible in the listing photos. The buyer raises a dispute within 48 hours with photos as evidence. The seller does not respond within the platform's 48-hour seller response window. The admin reviews the buyer's evidence, finds it credible, and issues a full refund. Escrow is returned to the buyer. The seller is notified and the listing is flagged.

Case 2 — Release to Seller: A buyer raises a dispute claiming the item was not as described, but the admin reviews the listing photos and the buyer's evidence and finds the item matches the description accurately. The admin rules in the seller's favour. Escrow is released to the seller. The buyer is notified of the decision.

Case 3 — Partial Resolution: A buyer purchased football boots for £65. On delivery one boot has a minor scuff not mentioned in the description. The item is broadly as described but not perfect. The admin issues a partial refund of £15 to the buyer as a goodwill resolution and releases the remaining £50 to the seller.

Flow: Admin in Orders panel → filters by Active Dispute → opens disputed order → reviews all evidence (listing photos, buyer photos, message thread, seller response) → selects ruling (Refund Buyer / Release to Seller / Partial Resolution) → enters ruling reason → confirms → financial action executed via Stripe → both parties notified → audit log updated.

Benefit: Enforces the platform's buyer protection guarantee consistently and fairly, resolves disputes that buyers and sellers cannot resolve independently, and protects the platform's reputation as a trustworthy marketplace.

---

## **10\. User Flow**

**Preconditions**

* Admin is authenticated with Super Admin role  
* An order exists with Active Dispute status  
* The dispute has been raised by the buyer within the 48-hour window  
* Escrow payment is currently held — not yet released or refunded

**Main Flow — Full Refund to Buyer**

1. Admin opens disputed order from Orders panel  
2. Admin reviews all dispute evidence:  
   * Original listing photos and description  
   * Buyer's dispute reason and supporting photos  
   * Seller's response (if provided within response window)  
   * Buyer–seller message thread  
   * Fulfilment timeline (dispatch date, tracking, delivery confirmation)  
3. Admin determines item was not as described or was not received  
4. Admin selects ruling: "Refund Buyer"  
5. Admin enters ruling reason (free text, mandatory)  
6. Admin confirms ruling  
7. Full refund issued to buyer via Stripe — item price \+ buyer protection fee returned; shipping fee non-refundable by default  
8. Escrow released back to buyer  
9. Listing flagged for admin review in Listings sub-module  
10. Seller's violation count incremented  
11. Buyer receives notification: "Your dispute has been resolved. A full refund of £\[amount\] has been issued to your original payment method."  
12. Seller receives notification: "The dispute for order \[ID\] has been resolved in the buyer's favour. Reason: \[reason\]. Your listing has been flagged for review."  
13. Admin audit log updated

**Main Flow — Release to Seller**

1. Admin reviews all dispute evidence  
2. Admin determines item matches the listing description and was delivered as expected  
3. Admin selects ruling: "Release to Seller"  
4. Admin enters ruling reason (mandatory)  
5. Admin confirms ruling  
6. Escrow released to seller via Stripe  
7. Order status updated to Completed  
8. Buyer receives notification: "Your dispute has been reviewed. The ruling has been made in the seller's favour. Reason: \[reason\]. If you have further concerns, contact support."  
9. Seller receives notification: "The dispute for order \[ID\] has been resolved in your favour. Payment has been released to your balance."  
10. Admin audit log updated

**Main Flow — Partial Resolution**

1. Admin reviews evidence and determines a partial refund is the fairest outcome  
2. Admin selects ruling: "Partial Resolution"  
3. Admin enters refund amount (must be between £0.01 and item price)  
4. Admin enters ruling reason (mandatory)  
5. Admin confirms ruling  
6. Partial refund amount returned to buyer via Stripe  
7. Remaining balance released to seller via Stripe  
8. Order status updated to Completed — Partial Refund  
9. Both buyer and seller notified with amounts and ruling reason  
10. Admin audit log updated

**Alternative Flow — Seller Does Not Respond Within Response Window**

1. Dispute is raised by buyer  
2. Seller is given 48 hours to respond via the platform  
3. Seller does not respond within 48 hours  
4. System automatically escalates dispute to admin review queue  
5. Admin is notified of escalated dispute  
6. Admin reviews buyer evidence only and makes ruling  
7. Ruling process continues as per main flows above

**Alternative Flow — Admin Requests Additional Evidence**

1. Admin reviews dispute and determines existing evidence is insufficient to make a ruling  
2. Admin selects "Request Additional Evidence"  
3. Admin specifies what is needed from buyer, seller, or both (free text)  
4. Both parties notified of evidence request with 48-hour submission window  
5. Evidence submitted by parties is attached to the dispute record  
6. Admin reviews new evidence and proceeds to ruling

**Post Conditions**

* A binding ruling has been made and cannot be reversed by the buyer or seller  
* Financial action (refund or release) has been executed via Stripe and is reflected in both parties' balances  
* Order status is updated to reflect the ruling outcome: Completed, Completed — Partial Refund, or Refunded  
* Escrow is fully resolved — no funds remain in a held state after ruling  
* Both buyer and seller have received a notification with the ruling decision and reason  
* If ruling was in buyer's favour, the listing has been flagged in the Listings sub-module for admin review  
* If ruling was in buyer's favour, seller's violation count has been incremented  
* Admin audit log records the full ruling: type, reason, amounts, admin user ID, and timestamp  
* Dispute status on the order is updated to Dispute Resolved

---

## **11\. Acceptance Criteria**

**General — Dispute Visibility**

* All orders with Active Dispute status are visible in the Orders panel with a clear Dispute label  
* Admin can filter Orders panel by Active Dispute to see all disputes requiring action  
* Disputed order detail view shows all evidence sections: listing photos, buyer evidence, seller response, message thread, and fulfilment timeline  
* Admin can view all previous dispute history on an order including any prior rulings

**Full Refund to Buyer**

* Admin can issue a full refund from any disputed order where escrow is currently held  
* Refund covers item price and buyer protection fee; shipping fee is non-refundable by default  
* Admin must enter a mandatory ruling reason before confirming  
* Refund is processed via Stripe within 5 minutes of admin confirmation  
* Buyer receives in-app and email notification within 5 minutes with refund amount and reason  
* Seller receives in-app and email notification within 5 minutes with ruling reason  
* Listing is automatically flagged in the Listings sub-module on a buyer-favour ruling  
* Seller's violation count is incremented by 1 on a buyer-favour ruling

**Release to Seller**

* Admin can release escrow to seller from any disputed order where escrow is currently held  
* Admin must enter a mandatory ruling reason before confirming  
* Payment released to seller's balance via Stripe within 5 minutes of confirmation  
* Order status updated to Completed  
* Both parties notified within 5 minutes with ruling reason

**Partial Resolution**

* Admin can specify any partial refund amount between £0.01 and the full item price  
* Admin must enter refund amount and mandatory ruling reason before confirming  
* Partial refund processed to buyer and remainder released to seller via Stripe within 5 minutes  
* Order status updated to Completed — Partial Refund  
* Both parties notified with their respective amounts and ruling reason

**Request Additional Evidence**

* Admin can request additional evidence from buyer, seller, or both before making a ruling  
* Evidence request notification sent to relevant parties within 5 minutes  
* Parties have 48 hours to submit evidence  
* If no evidence submitted within 48 hours, admin can proceed to ruling based on existing information  
* Submitted evidence is attached to the dispute record and visible to admin

**General**

* Admin cannot make a ruling on an order where escrow has already been released or refunded  
* Admin ruling is final — neither buyer nor seller can reverse it via the platform in v1  
* All rulings are logged with full detail in the audit trail  
* Dispute intervention actions are only available from the order detail view — not from the Orders panel table

---

## **12\. Business Rules**

* Admin can only intervene in a dispute where the order has Active Dispute status and escrow is currently held  
* A dispute can only be raised by the buyer within 48 hours of the delivery confirmation date  
* The seller has 48 hours to respond to a dispute before it is automatically escalated to admin  
* Shipping fee (£3.50 Royal Mail Tracked) is non-refundable by default in all dispute rulings — admin can override this in exceptional circumstances with a documented reason  
* Buyer protection fee (5% of item price) is refunded to the buyer in a full refund ruling and retained by the platform in a seller-favour ruling  
* Partial refund amount is determined entirely by admin discretion — there is no minimum threshold below the full item price  
* A ruling in the buyer's favour automatically flags the listing and increments the seller's violation count  
* Three buyer-favour dispute rulings against the same seller within 90 days triggers an automated escalation alert in the Users sub-module for account review  
* Admin ruling is binding and final — no in-platform appeals mechanism exists in v1; disputes about rulings are handled via support  
* Escrow must be fully resolved by the ruling — no funds can remain in a held state after a ruling is confirmed  
* Admin can request additional evidence a maximum of once per dispute to prevent indefinite delays  
* If a dispute involves a user who has been subsequently banned, the dispute must still be resolved — it is not automatically closed by the ban

---

## **13\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Ruling Reason | All rulings | Required, min 20 characters | "Please provide a ruling reason of at least 20 characters" | On confirm |
| Partial Refund Amount | Partial resolution | Required, numeric, min £0.01, max \= item price | "Refund amount must be between £0.01 and £\[item price\]" | On input and on confirm |
| Partial Refund Amount | Partial resolution | Must not exceed item price | "Refund amount cannot exceed the item price of £\[X\]" | On confirm |
| Evidence Request Note | Request evidence | Required, min 20 characters | "Please specify what evidence is required" | On confirm |
| Escrow Status Check | All rulings | Escrow must be in Held status | "This order's escrow has already been resolved — no financial action is available" | On ruling action render |
| Dispute Status Check | All rulings | Order must have Active Dispute status | "This order does not have an active dispute" | On ruling action render |
| Shipping Fee Override | Admin override | If admin refunds shipping, mandatory reason required | "Please provide a reason for refunding the shipping fee" | On confirm |

---

## **14\. Edge Cases**

| Scenario | Expected Behaviour | Handling |
| ----- | ----- | ----- |
| Buyer raises a dispute after the 48-hour window has closed | Dispute cannot be raised by buyer after 48 hours; platform blocks late dispute submission. Admin can manually open a dispute in exceptional circumstances with documented reason | Time-based dispute window enforced at submission; admin override available with audit log entry |
| Seller provides tracking showing item was delivered but buyer claims non-receipt | Admin reviews tracking evidence; if carrier confirms delivery to the correct address, ruling defaults to seller-favour unless buyer provides counter-evidence | Tracking data treated as primary delivery evidence; admin documents reasoning |
| Buyer and seller reach an agreement independently during admin review | Admin can mark dispute as Resolved by Agreement and release escrow to seller without a formal ruling | Resolved by Agreement option available; both parties must confirm agreement in platform messages before admin closes |
| Dispute is raised on an order where the seller has since been banned | Dispute proceeds independently; escrow remains held; admin resolves based on evidence; seller's frozen balance used for refund if applicable | Ban does not auto-resolve dispute; admin handles separately |
| Partial refund amount entered by admin equals the full item price | System treats this as a full refund and processes accordingly; admin prompted to use Full Refund ruling instead | Validation: if partial amount equals item price, prompt admin to use full refund flow |
| Stripe payment processing fails during ruling execution | Ruling is rolled back; order status unchanged; admin shown error: "Payment action failed — please try again." No notification sent to parties until action succeeds | Transactional Stripe call; rollback on failure; retry available |
| Admin requests additional evidence but neither party responds within 48 hours | Admin proceeds to ruling based on original evidence; both parties notified that ruling will proceed | 48-hour evidence window enforced; admin notified on expiry to proceed |
| Two admins open the same disputed order simultaneously | Both can view; only the first to confirm a ruling succeeds; second admin sees: "A ruling was made on this order moments ago. Reload to see the outcome." | Optimistic locking on ruling confirmation; conflict surfaced gracefully |
| Disputed order involves a listing that has since been removed by admin | Dispute continues independently; removed listing data is retained and visible in order detail for evidence review | Listing removal does not affect in-progress dispute; snapshot of listing data stored on order |
| Buyer raises a dispute then deletes their account before admin rules | Dispute continues; refund is processed to the original payment method on file; deleted account status shown in order detail | Account deletion does not void dispute or prevent refund; Stripe processes to original payment method |

---

## **15\. Exceptional Cases**

* **Chargeback initiated by buyer via bank:** If a buyer initiates a chargeback through their bank or card provider after admin has already ruled in the seller's favour and released escrow, the platform faces a double-loss scenario. A chargeback management policy and Stripe dispute handling workflow must be defined with the finance and legal team before platform launch. This is one of the highest financial risk scenarios for the platform.  
* **High value order dispute:** If a disputed order involves a very high value item (e.g. a full set of golf clubs at £800+), the admin ruling carries significant financial weight. A two-admin sign-off requirement for disputes above a defined threshold (e.g. £200) should be considered to reduce the risk of a single admin making an erroneous high-value ruling.  
* **Dispute volume at scale:** In v1, all disputes are manually reviewed by admin. If the platform reaches 1,000+ orders per month with a 5% dispute rate, that is 50+ disputes per month requiring individual admin review. An automated dispute triage system — routing clear-cut cases (e.g. seller never dispatched) to semi-automated resolution and only escalating ambiguous cases to admin — should be designed before the platform reaches that volume.  
* **International orders and consumer rights law:** If the platform expands beyond the UK, dispute resolution rules may be governed by different consumer protection legislation (e.g. EU Consumer Rights Directive). The current dispute flow is designed for UK consumer law only and must be reviewed by legal before any international expansion.  
* **Evidence tampering:** A buyer or seller could submit edited or fabricated photos as dispute evidence. The platform has no automated evidence verification in v1. Admin must apply judgement. Metadata verification of submitted photos (date, device, GPS if available) should be considered as a fraud-prevention measure for v2.

# **SRS — Platform Management | Financials**

**Platform:** The Kit Loop | **User:** Super Admin | **Module:** Platform Management | **Sub-Module:** Financials | **Version:** 1.0

---

## **1\. Feature Overview**

The Financials sub-module gives the Super Admin control over the platform's revenue configuration and visibility into its financial performance. It has two distinct functions: Fee & Commission Config allows the admin to set and update the rules that determine how the platform earns money on every transaction; View Revenue Dashboard gives the admin a real-time and historical view of GMV, commission earned, buyer protection fees collected, and seller payouts made.

There are two features within this sub-module:

* **Feature 1 — Fee & Commission Config**  
* **Feature 2 — View Revenue Dashboard**

---

---

# **Feature 1 — Fee & Commission Config**

---

## **2\. Story & Story Narrative**

**Story** As a Super Admin, I want to configure platform fees and commission rates so that revenue is calculated accurately on every transaction and pricing rules reflect current business decisions.

**Story Narrative** Case 1 — Buyer Protection Fee Change: The business decides to increase the buyer protection fee from 5% to 6% for orders above £150 to offset higher dispute rates on premium items. The admin updates the fee configuration, sets the threshold, and the new rate applies to all new orders immediately. Existing orders in escrow are not affected.

Case 2 — Parcel Size Pricing Update: Royal Mail increases its tracked parcel rates. The admin updates the shipping fee for each parcel tier — Small, Medium, Large, Oversized — so the amounts shown at checkout remain accurate and the platform does not absorb the difference.

Case 3 — Commission Rate by Sport: The business wants to run a zero-commission promotion for Golf listings for 30 days to attract new Golf sellers. The admin sets a temporary 0% commission rate for the Golf category with a start and end date. When the period ends, the standard rate automatically restores.

Flow: Admin navigates to Platform Management → Financials → Fee & Commission Config → reviews current fee structure → edits a fee or commission rule → previews the impact on a sample transaction → saves → new rates apply to all new transactions immediately.

Benefit: Gives the business full control over its revenue model without requiring a developer change or platform redeployment, and ensures fee changes are applied consistently and instantly across all new transactions.

---

## **3\. User Flow**

**Preconditions**

* Admin is authenticated with Super Admin role  
* Admin is on the Platform Management dashboard  
* At least one fee or commission rule exists in the system

**Main Flow — Update Buyer Protection Fee**

1. Admin navigates to Platform Management → Financials → Fee & Commission Config  
2. Config panel loads showing all current fee rules: buyer protection fee, platform commission rate, parcel size fees, and any active promotional rates  
3. Admin selects Buyer Protection Fee section  
4. Admin edits percentage rate and optionally sets a minimum flat fee (e.g. 5% \+ £0.70 minimum)  
5. Admin optionally sets a tiered rule (e.g. different rate above a price threshold)  
6. Admin previews impact: sample transaction shown with old and new fee applied  
7. Admin saves changes  
8. New rate applies to all new orders immediately  
9. Existing orders in escrow retain the rate at which they were placed  
10. Change logged in audit trail

**Main Flow — Update Parcel Size Shipping Fees**

1. Admin selects Parcel Size Fees section  
2. Admin sees current fees for each tier: Small, Medium, Large, Oversized  
3. Admin updates fee for one or more tiers  
4. Admin previews updated checkout total on a sample order  
5. Admin saves  
6. New shipping fees shown at checkout for all new orders immediately  
7. Change logged in audit trail

**Main Flow — Set Commission Rate**

1. Admin selects Platform Commission section  
2. Admin views current commission rate applied to all transactions  
3. Admin updates rate — either globally or per sport category  
4. Admin optionally sets a promotional rate with a defined start and end date  
5. Admin previews commission earned on a sample transaction at new rate  
6. Admin saves  
7. New commission rate applies to all new transactions immediately  
8. Promotional rate auto-expires on the set end date and standard rate restores  
9. Change logged in audit trail

**Alternative Flow — Preview Before Save**

1. Admin edits any fee or commission value  
2. Before saving, admin clicks Preview  
3. System displays a sample transaction breakdown showing old values vs new values side by side  
4. Admin confirms the output is as expected then saves, or discards changes

**Alternative Flow — Revert to Previous Config**

1. Admin navigates to Config change history  
2. Admin selects a previous configuration state  
3. Admin clicks Restore  
4. System previews the restored config  
5. Admin confirms  
6. Previous config restored and applied to new transactions immediately  
7. Restore action logged in audit trail

**Post Conditions**

* Updated fee or commission rates are live and applied to all new transactions immediately  
* Existing orders in progress retain the fee rates that were in place at the time of purchase — no retroactive changes  
* A promotional rate is scheduled with a confirmed end date and will auto-restore to standard rates on expiry  
* All config changes are recorded in the audit log with previous value, new value, admin user ID, and timestamp  
* The preview function accurately reflected the saved outcome before the admin confirmed

---

## **4\. Acceptance Criteria**

**Buyer Protection Fee**

* Admin can view the current buyer protection fee percentage and any flat minimum  
* Admin can update the buyer protection fee percentage to any value between 0% and 20%  
* Admin can set a flat minimum fee that applies when the percentage calculation falls below it  
* Admin can set tiered rates based on order value thresholds  
* Updated fee is applied to all new orders immediately on save  
* Existing orders in escrow are not affected by fee changes  
* Buyer sees the updated fee correctly calculated at checkout on new orders

**Parcel Size Fees**

* Admin can view current shipping fees for all four parcel tiers: Small, Medium, Large, Oversized  
* Admin can update the fee for any individual parcel tier independently  
* Updated parcel fee is shown at checkout for all new orders immediately on save  
* Oversized tier displays a courier-only notice at checkout — Royal Mail options are not shown

**Commission Rate**

* Admin can view the current platform commission rate  
* Admin can set a global commission rate between 0% and 30%  
* Admin can set a sport-specific commission rate that overrides the global rate for that sport  
* Admin can set a promotional commission rate with a defined start date and end date  
* Promotional rate auto-expires on end date and standard rate restores without admin action  
* Commission is calculated correctly on seller payouts for all new transactions at the updated rate

**Preview**

* Preview function is available before saving any fee or commission change  
* Preview shows old value vs new value for a sample transaction  
* Preview is accurate — saved output matches previewed output

**Config History**

* Admin can view a full history of all fee and commission changes with previous value, new value, admin user ID, and timestamp  
* Admin can restore any previous configuration state  
* Restore action is logged in audit trail

**General**

* All fee and commission changes take effect immediately on save for new transactions  
* No platform redeployment is required for any fee or commission change  
* All changes are audit logged with full detail

---

## **5\. Business Rules**

* Fee and commission changes apply only to new transactions — existing orders in escrow retain the rates at which they were placed, without exception  
* Buyer protection fee minimum is 0% (free to buyer) and maximum is 20% — values outside this range are blocked  
* Platform commission minimum is 0% and maximum is 30% — values outside this range are blocked  
* A sport-specific commission rate always overrides the global rate for that sport — if both exist, the sport-specific rate takes precedence  
* A promotional rate must have both a start date and an end date — open-ended promotions are not permitted in v1  
* Promotional rate auto-expires at midnight on the end date and the standard rate restores automatically — no admin action required for expiry  
* Shipping fees for each parcel tier must be greater than £0.00 — zero-cost shipping is not supported in v1  
* Oversized items must display a courier-only notice at checkout — the Oversized tier cannot be configured to show a Royal Mail fee  
* The preview function must use a real sample transaction from the platform's recent order history to ensure accuracy  
* Config change history must be retained for a minimum of 24 months for financial audit purposes  
* A single admin save action can update multiple fee rules simultaneously — batch updates are supported

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Buyer Protection Fee % | Update fee | Required, numeric, min 0, max 20 | "Buyer protection fee must be between 0% and 20%" | On input and on save |
| Buyer Protection Flat Min | Update fee | Numeric, min £0.00, max £50.00 | "Flat minimum must be between £0.00 and £50.00" | On input and on save |
| Commission Rate — Global | Update commission | Required, numeric, min 0, max 30 | "Commission rate must be between 0% and 30%" | On input and on save |
| Commission Rate — Sport Specific | Update commission | Numeric, min 0, max 30, sport must be selected | "Select a sport and enter a rate between 0% and 30%" | On input and on save |
| Promotional Rate — Start Date | Promotional rate | Required, must be today or a future date | "Start date must be today or a future date" | On input and on save |
| Promotional Rate — End Date | Promotional rate | Required, must be after start date, max 365 days from start | "End date must be after start date and within 365 days" | On input and on save |
| Parcel Fee — Small | Update parcel fee | Required, numeric, min £0.01 | "Shipping fee must be greater than £0.00" | On input and on save |
| Parcel Fee — Medium | Update parcel fee | Required, numeric, min £0.01 | "Shipping fee must be greater than £0.00" | On input and on save |
| Parcel Fee — Large | Update parcel fee | Required, numeric, min £0.01 | "Shipping fee must be greater than £0.00" | On input and on save |
| Parcel Fee — Oversized | Update parcel fee | Read-only courier notice — not a configurable fee in v1 | Field is display-only; edit is disabled | On render |

---

## **7\. Edge Cases**

| Scenario | Expected Behaviour | Handling |
| ----- | ----- | ----- |
| Admin sets buyer protection fee to 0% | Allowed — zero buyer protection fee is a valid promotional configuration; buyer sees £0.00 on checkout | 0% is within valid range; no error; audit log records the change |
| Admin saves a new commission rate at the same moment a buyer completes a checkout | Checkout in progress uses the rate that was active when the session started; new rate applies to the next checkout session | Rate snapshot taken at checkout session start; not live-updated mid-session |
| Promotional rate end date passes while admin is logged in | Rate auto-expires at midnight; admin's active session is not interrupted; config panel shows standard rate restored on next load | Scheduled job executes rate restoration at end date midnight; no admin action required |
| Admin sets a sport-specific rate for a sport that has no active listings | Rate is saved and will apply when the first listing in that sport is sold; no error | Sport-specific rate stored regardless of current listing count |
| Admin restores a previous config that included a promotional rate whose end date has already passed | System warns: "This config includes a promotional rate that has already expired. The promotional rate will not be restored — only standard rates will apply." | Expired promotional rates excluded from restore; admin informed |
| Two admins update the same fee rule simultaneously | Last save wins; second admin sees: "This configuration was updated while you were editing. Reload to see the latest before saving." | Optimistic locking on config save; stale data warning surfaced |
| Admin sets a tiered buyer protection rate where tier thresholds overlap | System validates that tier thresholds do not overlap before saving; error shown if conflict detected | Tier overlap validation on save; specific conflict highlighted |
| Royal Mail increases rates and admin forgets to update parcel fees | Platform absorbs the difference until updated; no automated alert in v1 | Manual process in v1; admin responsible for monitoring carrier rate changes |

---

## **8\. Exceptional Cases**

* **VAT on platform fees:** If the platform becomes VAT registered, buyer protection fees and commission rates may need to be displayed and calculated inclusive or exclusive of VAT depending on jurisdiction. The current fee config has no VAT field. A VAT configuration layer must be designed with the finance and legal team before the platform reaches the VAT registration threshold.  
* **Retroactive fee correction:** If a fee was configured incorrectly and a significant number of orders were processed at the wrong rate, there is no bulk correction mechanism in v1. A retroactive fee adjustment workflow with appropriate Stripe refund or charge tooling must be defined as a contingency before launch.  
* **Stripe fee absorption:** Stripe charges a processing fee on every transaction (typically 1.4% \+ 20p for European cards). This cost is not surfaced in the current fee config panel. A decision must be made on whether Stripe fees are absorbed into the platform commission or passed on — and if passed on, the config must support a Stripe fee passthrough field.  
* **Fee config access control:** In v1, all Super Admins have equal access to fee config. As the team grows, a finance-only admin role with restricted access to the fee config (view only for non-finance admins) should be considered to reduce the risk of accidental or unauthorised fee changes.

---

---

# **Feature 2 — View Revenue Dashboard**

---

## **9\. Story & Story Narrative**

**Story** As a Super Admin, I want to view a revenue dashboard so I can track platform financial performance, monitor GMV, understand commission and fee income, and make data-driven decisions about pricing, category expansion, and promotional activity.

**Story Narrative** Case 1 — Weekly Review: Every Monday morning the admin opens the Revenue Dashboard to review the previous week's GMV, commission earned, dispute refund costs, and top-performing sport categories. They export the data to share with the founding team.

Case 2 — Campaign Impact: After running a zero-commission Golf promotion for 30 days, the admin reviews the dashboard to compare Golf GMV before, during, and after the promotion to assess whether the campaign drove sufficient volume to justify the commission sacrifice.

Case 3 — Dispute Cost Monitoring: The admin notices that dispute refund costs have increased significantly in the past 30 days. They drill into the dispute breakdown to identify which sport category and which seller is generating the most refunds, and escalate accordingly via the Users and Listings sub-modules.

Flow: Admin navigates to Platform Management → Financials → Revenue Dashboard → selects date range → reviews top-level KPI tiles → drills into charts by sport, time period, or fee type → identifies trends or anomalies → exports data for offline analysis or reporting.

Benefit: Provides the admin and founding team with the financial visibility needed to make informed decisions on pricing, category investment, dispute management, and platform growth strategy — without relying on manual data extraction or third-party analytics tools.

---

## **10\. User Flow**

**Preconditions**

* Admin is authenticated with Super Admin role  
* At least one completed transaction exists on the platform  
* Admin is on the Platform Management → Financials section

**Main Flow**

1. Admin navigates to Platform Management → Financials → Revenue Dashboard  
2. Dashboard loads with default date range: last 30 days  
3. Admin reviews top-level KPI tiles:  
   * Total GMV (gross merchandise value — total value of all completed transactions)  
   * Platform Commission Earned  
   * Buyer Protection Fees Collected  
   * Total Seller Payouts Made  
   * Net Platform Revenue (Commission \+ Buyer Protection Fees − Dispute Refunds)  
   * Total Dispute Refund Cost  
   * Number of Completed Orders  
   * Average Order Value  
4. Admin selects a different date range: Last 7 days, Last 30 days, Last 90 days, Last 12 months, or Custom  
5. All KPI tiles and charts update to reflect selected date range  
6. Admin reviews charts:  
   * GMV over time (line chart by day or week)  
   * Commission earned over time  
   * Orders by sport category (bar chart)  
   * GMV by sport category (bar chart)  
   * Dispute refund cost over time  
   * Top 10 sellers by GMV  
7. Admin drills into a specific sport category to see category-level KPIs  
8. Admin drills into a specific time period to see day-level breakdown  
9. Admin exports dashboard data as CSV or PDF report

**Alternative Flow — Sport Category Drill-Down**

1. Admin clicks a sport category bar in the GMV by Sport chart  
2. Dashboard filters to show all KPIs for that sport only  
3. Admin sees sport-level GMV, commission, orders, average order value, and dispute rate  
4. Admin can further drill into top sellers within that sport  
5. Admin clicks a seller to navigate to their user profile in the Users sub-module

**Alternative Flow — Dispute Cost Analysis**

1. Admin clicks Dispute Refund Cost tile or chart  
2. Dashboard shows dispute breakdown: total refunds issued, number of disputes, average refund value, dispute rate as % of orders  
3. Admin sees disputes by sport category and by seller  
4. Admin identifies high-dispute sellers and navigates to their profile in Users sub-module

**Alternative Flow — Export**

1. Admin selects date range and any drill-down filters  
2. Admin clicks Export  
3. Selects format: CSV (raw data) or PDF (formatted report)  
4. File generated and downloaded within 30 seconds  
5. Export includes all visible KPIs and chart data for the selected date range and filters

**Post Conditions**

* Admin has a complete view of platform financial performance for the selected date range  
* No financial data is altered by viewing the dashboard — read-only  
* Exported file accurately reflects the data visible on the dashboard for the selected filters  
* Any drill-down navigation to Users or Listings sub-module opens in context without losing dashboard state

---

## **11\. Acceptance Criteria**

**KPI Tiles**

* Dashboard displays all 8 KPI tiles: Total GMV, Commission Earned, Buyer Protection Fees, Total Seller Payouts, Net Platform Revenue, Dispute Refund Cost, Completed Orders, Average Order Value  
* All KPI values update in real time when date range is changed  
* Net Platform Revenue is calculated as: Commission Earned \+ Buyer Protection Fees Collected − Dispute Refund Cost  
* All monetary values displayed in GBP with two decimal places  
* KPI tiles show percentage change vs previous equivalent period (e.g. last 30 days vs prior 30 days) with up/down indicator

**Date Range**

* Admin can select: Last 7 days, Last 30 days, Last 90 days, Last 12 months, Custom range  
* Custom range allows any start and end date from platform launch date to today  
* All tiles and charts update within 3 seconds of date range change

**Charts**

* GMV over time shown as a line chart with day-level granularity for ranges up to 90 days and week-level for ranges above 90 days  
* Orders by sport shown as a bar chart with all 17 sports represented  
* GMV by sport shown as a bar chart with all 17 sports represented  
* Dispute refund cost over time shown as a line chart  
* Top 10 sellers by GMV shown as a ranked list with seller username, total GMV, and order count  
* All charts are interactive — hovering a data point shows exact value and date  
* Charts are empty state handled: "No data for this period" shown if no transactions exist in range

**Drill-Down**

* Admin can click any sport in the GMV or Orders chart to filter dashboard to that sport  
* Admin can click any seller in the Top 10 list to navigate to their user profile  
* Admin can click Dispute Refund Cost tile to see dispute breakdown by sport and by seller  
* Back navigation from drill-down returns admin to dashboard with previous filter state intact

**Export**

* Export available for any selected date range and filter state  
* CSV export contains all raw transaction data: order ID, date, sport, item, buyer, seller, GMV, commission, buyer protection fee, shipping fee, dispute status, refund amount  
* PDF export contains formatted dashboard with all KPI tiles and charts for the selected period  
* Export file generated and downloaded within 30 seconds for date ranges up to 12 months  
* Export file named with date range: KitLoop\_Revenue\_\[StartDate\]\_\[EndDate\].csv / .pdf

**General**

* Dashboard is read-only — no financial data can be altered from this view  
* Dashboard loads within 5 seconds for any date range up to 12 months  
* Dashboard data reflects completed and settled transactions only — orders in escrow are shown separately as Pending GMV

---

## **12\. Business Rules**

* GMV is calculated from completed transactions only — orders in Active Dispute, Pending, or Cancelled status are excluded from GMV and shown separately as Pending GMV  
* Commission Earned is calculated from seller payouts where escrow has been released — not from orders still in escrow  
* Buyer Protection Fees Collected includes fees from all completed orders regardless of dispute outcome — if a refund is issued, the buyer protection fee is also refunded and that refund is reflected in the Dispute Refund Cost line, not deducted from Buyer Protection Fees Collected  
* Net Platform Revenue \= Commission Earned \+ Buyer Protection Fees Collected − Dispute Refund Cost; this is the true platform net income figure  
* Dispute Refund Cost includes the item price refunded to buyer and the buyer protection fee refunded — shipping fee refunds are tracked separately and only included if admin manually overrode the non-refundable shipping policy  
* Average Order Value is calculated on completed orders only — disputed and cancelled orders excluded  
* Dashboard data is updated in near real-time — maximum 15-minute lag from transaction completion to dashboard reflection  
* Top 10 sellers list is ranked by GMV generated — not by number of orders  
* Pending GMV (escrow-held orders) is shown as a separate informational tile and is not included in the main GMV figure  
* Export files contain only data the admin is authorised to view — no data outside the selected date range or filter is included  
* Dashboard data must be consistent with the individual order records in the Orders sub-module — any discrepancy is a data integrity issue requiring investigation

---

## **13\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Custom Date Range — Start | Custom date filter | Required, must be on or after platform launch date, must be before or equal to end date | "Start date must be on or after \[launch date\]" / "Start date must be before end date" | On date selection |
| Custom Date Range — End | Custom date filter | Required, must be on or before today, must be after start date | "End date cannot be in the future" / "End date must be after start date" | On date selection |
| Export — Date Range | Export action | A date range must be selected before export is available | Export button disabled until date range is set | On render |
| Export — Max Range | Export action | CSV export max range is 12 months in a single export; PDF max range is 3 months | "CSV export is limited to 12 months. Select a shorter range or export in segments." / "PDF export is limited to 3 months." | On export confirm |

---

## **14\. Edge Cases**

| Scenario | Expected Behaviour | Handling |
| ----- | ----- | ----- |
| No completed transactions exist in the selected date range | All KPI tiles show £0.00 or 0; charts show empty state with "No data for this period" | Null data state handled gracefully across all tiles and charts |
| Admin selects a date range that spans a fee configuration change | Dashboard shows blended financial figures for the period; a notice is shown: "Fee configuration changed during this period — figures reflect rates in place at time of each transaction" | Per-transaction rate snapshot used for calculations; blended period notice shown |
| Dashboard is opened during a very high order volume period | Dashboard must remain performant; pre-aggregated daily summaries used rather than real-time query of raw transaction table | Aggregated summary tables updated every 15 minutes; dashboard reads from summary not raw orders |
| Admin drills into a sport category with zero orders | Sport-level dashboard shows empty state: "No transactions in this category for the selected period" | Zero-order drill-down handled gracefully |
| Export file generation fails mid-download | Admin shown error: "Export failed — please try again." No partial file delivered | Export generation in background; error surfaced if job fails; retry available |
| Admin compares two periods where the base currency changed (future international expansion) | Not applicable in v1 — GBP only; must be redesigned if multi-currency is introduced | Single currency enforcement in v1; multi-currency flagged as future workstream |
| A dispute refund is processed after a completed order is included in an export | Export is a point-in-time snapshot — the refund is not retroactively applied to a past export. The refund appears in the dashboard and future exports for the date the refund was processed | Exports are snapshots; refunds appear in the period they are processed, not the period of the original order |
| Top 10 sellers list includes a seller who has since been banned | Banned seller appears in the list with a Banned label; their GMV contribution is retained in historical data | Banned status displayed; data not removed from historical dashboard |

---

## **15\. Exceptional Cases**

* **Accounting reconciliation:** The Revenue Dashboard is not a substitute for formal accounting records. The data must reconcile with Stripe's transaction records and the platform's bank account. A formal reconciliation process — comparing dashboard figures against Stripe payouts and bank statements — must be established with the finance team before the platform processes significant transaction volume.  
* **Tax reporting:** The dashboard does not currently produce tax-ready reports (e.g. VAT returns, income statements). As the platform scales and approaches VAT thresholds, a tax reporting module that produces HMRC-compliant outputs should be designed in partnership with an accountant.  
* **Real-time vs settled GMV discrepancy:** There will always be a lag between a transaction completing and escrow being released — typically 2–7 days depending on delivery and buyer confirmation speed. The dashboard must clearly distinguish between Pending GMV (escrow held) and Settled GMV (escrow released) to avoid the admin drawing incorrect conclusions from inflated GMV figures that include unsettled transactions.  
* **Dashboard data integrity audit:** If the dashboard figures ever diverge from the underlying order records in the Orders sub-module, there is a data integrity problem. An automated daily reconciliation job that compares dashboard aggregate figures against order-level data and alerts admin of any discrepancy should be built before the platform handles meaningful transaction volume.  
* **Historical data retention for regulatory compliance:** Financial records must be retained for a minimum of 6 years under UK company law. The platform's data retention policy must ensure that order and financial data is not deleted or anonymised within this window, even for users who have closed their accounts.

# **SRS — Platform Management | Seller**

**Platform:** The Kit Loop | **User:** Super Admin | **Module:** Platform Management | **Sub-Module:** Seller | **Version:** 1.0

---

## **1\. Feature Overview**

The Verify Seller Badges feature allows the Super Admin to review seller accounts that have met the platform's eligibility criteria for Verified Seller status and grant or revoke the Verified Seller badge accordingly. The badge is displayed on the seller's profile and on all their active listings, signalling to buyers that the seller has a proven track record of accurate listings, prompt dispatch, and positive buyer feedback. It is the platform's primary trust signal for sellers and directly influences buyer purchase confidence.

---

## **2\. Story & Story Narrative**

**Story** As a Super Admin, I want to review and approve Verified Seller badge requests so that buyers can identify trustworthy, high-performing sellers and make purchase decisions with greater confidence.

**Story Narrative** Case 1 — Badge Approval: A seller has completed 25 sales over 3 months with a 4.8 star average rating, zero disputes ruled against them, and an average dispatch time of 1.2 days. They meet all eligibility criteria. The admin reviews their profile, confirms the criteria are satisfied, and approves the Verified Seller badge. The badge appears on the seller's profile and all their active listings immediately.

Case 2 — Badge Rejection: A seller has completed 20 sales but has 2 disputes ruled against them in the past 90 days and a 3.9 star rating. They do not meet the quality threshold. The admin reviews and rejects the badge request with a reason. The seller is notified and told which criteria they did not meet. They can reapply once criteria are satisfied.

Case 3 — Badge Revocation: A previously verified seller receives 3 buyer-dispute rulings against them in a 60-day period. Their rating drops to 3.5 stars. The admin reviews and revokes the badge. The seller is notified. The badge is removed from their profile and all listings immediately.

Case 4 — Automatic Eligibility Alert: The system detects a seller has crossed the eligibility threshold and raises an alert in the admin Seller panel. The admin is not required to search for eligible sellers — the system surfaces them proactively.

Flow: Admin navigates to Platform Management → Seller → sees list of badge-eligible sellers and pending badge requests → opens seller profile → reviews eligibility metrics → approves, rejects, or revokes badge → seller notified → badge status updated across platform immediately.

Benefit: Creates a scalable, admin-controlled trust layer that rewards high-performing sellers, gives buyers a reliable quality signal, and incentivises all sellers to maintain high standards of listing accuracy, dispatch speed, and buyer satisfaction.

---

## **3\. User Flow**

**Preconditions**

* Admin is authenticated with Super Admin role  
* Admin is on the Platform Management dashboard  
* At least one seller account exists on the platform  
* Eligibility criteria are configured in the system

**Main Flow — Approve Verified Seller Badge**

1. Admin navigates to Platform Management → Seller  
2. Seller panel loads showing all sellers with their current badge status and an eligibility indicator  
3. Admin sees badge request queue — sellers who have met eligibility criteria and are awaiting review  
4. Admin clicks a seller in the queue to open their badge review profile  
5. Badge review profile displays:  
   * Seller username, profile photo, join date  
   * Total completed sales  
   * Average star rating (overall and last 90 days)  
   * Total disputes raised against seller  
   * Disputes ruled against seller (last 90 days)  
   * Average dispatch time (days from order to dispatch)  
   * Listing accuracy score (based on dispute reasons — item not as described rate)  
   * Any previous badge history (previously granted, revoked, or rejected)  
   * Eligibility criteria checklist with pass/fail for each criterion  
6. Admin reviews all metrics and eligibility checklist  
7. Admin clicks "Approve Badge"  
8. Admin adds an optional internal note  
9. Admin confirms approval  
10. Verified Seller badge applied to seller's profile immediately  
11. Badge displayed on all seller's active listings immediately  
12. Seller receives in-app and email notification: "Congratulations — you've been awarded the Verified Seller badge on The Kit Loop. This badge is displayed on your profile and all your active listings."  
13. Seller removed from badge request queue  
14. Admin audit log updated

**Main Flow — Reject Badge Request**

1. Admin opens seller badge review profile from the queue  
2. Admin reviews metrics and determines seller does not meet one or more eligibility criteria  
3. Admin clicks "Reject Request"  
4. Admin selects which criteria were not met (checklist — mandatory)  
5. Admin adds an optional internal note  
6. Admin confirms rejection  
7. Badge request status updated to Rejected  
8. Seller receives in-app and email notification: "Your Verified Seller badge request has not been approved at this time. Criteria not yet met: \[list of unmet criteria\]. You may reapply once these criteria are satisfied."  
9. Seller can reapply after 30 days  
10. Admin audit log updated

**Main Flow — Revoke Verified Seller Badge**

1. Admin identifies a verified seller whose performance has declined — either via an automated alert or manual review  
2. Admin opens seller profile from the Seller panel  
3. Admin reviews current metrics against revocation thresholds  
4. Admin clicks "Revoke Badge"  
5. Admin selects revocation reason from predefined list  
6. Admin adds a mandatory internal note documenting the basis for revocation  
7. Admin confirms revocation  
8. Verified Seller badge removed from seller profile immediately  
9. Badge removed from all seller's active listings immediately  
10. Seller receives in-app and email notification: "Your Verified Seller badge has been removed. Reason: \[reason\]. You may reapply for the badge after 60 days if your performance metrics meet the required standard."  
11. Seller is placed in a 60-day reapplication cooldown  
12. Admin audit log updated

**Alternative Flow — Automated Eligibility Alert**

1. System monitors all seller accounts continuously against eligibility criteria  
2. When a seller crosses the eligibility threshold, system raises an alert in the admin Seller panel badge queue  
3. Admin sees new entry in the badge request queue with Eligible label  
4. Admin reviews and approves or rejects as per main flow

**Alternative Flow — Admin Proactively Reviews a Seller**

1. Admin identifies a high-performing seller outside the queue (e.g. via the Revenue Dashboard top sellers list)  
2. Admin opens that seller's profile directly  
3. Admin reviews eligibility metrics  
4. If eligible, admin can grant the badge manually without the seller being in the formal queue  
5. Approval flow proceeds as per main flow from step 7

**Alternative Flow — Seller Disputes Revocation**

1. Seller receives revocation notification  
2. Seller contacts support to dispute the revocation  
3. Support escalates to admin  
4. Admin reviews the case in the seller profile — full metric history and audit log visible  
5. Admin reinstates badge if revocation is found to be in error, or upholds decision  
6. Seller notified of outcome  
7. Action logged in audit trail

**Post Conditions**

* Approved badge is live on the seller's profile and all active listings immediately  
* Rejected seller has been notified of unmet criteria and is eligible to reapply after 30 days  
* Revoked badge has been removed from seller profile and all active listings immediately  
* Revoked seller is in a 60-day reapplication cooldown  
* Seller has received an in-app and email notification in all cases  
* All actions are recorded in the admin audit log with action type, reason, internal note, admin user ID, and timestamp  
* Badge queue in the Seller panel accurately reflects the current state of all pending, approved, and rejected requests

---

## **4\. Acceptance Criteria**

**Badge Eligibility Criteria (system-enforced)**

* Minimum 20 completed sales on the platform  
* Minimum average star rating of 4.0 overall  
* Minimum average star rating of 4.2 in the last 90 days  
* Zero disputes ruled against the seller in the last 90 days  
* Average dispatch time of 3 days or fewer  
* Item not as described dispute rate below 5% of total completed orders  
* Account in Active status — suspended or banned sellers are ineligible  
* Minimum 60 days since account creation

**Approve**

* Admin can approve a badge for any seller who meets all eligibility criteria  
* Admin can approve a badge for a seller outside the formal queue via direct profile review  
* Badge is applied to seller profile and all active listings immediately on approval  
* Seller receives in-app and email notification within 5 minutes of approval  
* Approved seller is removed from the badge request queue

**Reject**

* Admin must select at least one unmet criterion before confirming rejection  
* Rejected seller receives notification with specific unmet criteria listed  
* Rejected seller cannot reapply for 30 days — system enforces this cooldown  
* Rejected request is logged with full detail in audit trail

**Revoke**

* Admin can revoke a badge from any Verified Seller at any time  
* Admin must select a revocation reason and add a mandatory internal note before confirming  
* Badge is removed from seller profile and all active listings immediately on revocation  
* Seller receives in-app and email notification within 5 minutes of revocation  
* Revoked seller is placed in a 60-day reapplication cooldown — system enforced  
* Revoked seller can reapply after 60 days if criteria are met

**Badge Display**

* Verified Seller badge is displayed on the seller's profile page  
* Verified Seller badge is displayed on all listing cards and listing detail pages for that seller  
* Badge is removed from all surfaces within 60 seconds of revocation  
* Badge is shown in buyer-facing listing detail alongside seller rating and review count

**Automated Alerts**

* System automatically raises an alert in the badge queue when a seller crosses the eligibility threshold  
* System automatically raises a revocation alert when a verified seller's metrics drop below revocation thresholds  
* Automated alerts do not auto-approve or auto-revoke — admin action is always required

**General**

* Admin can view full badge history for any seller: all approvals, rejections, and revocations with dates and reasons  
* Eligibility criteria checklist is displayed in the badge review profile with a clear pass/fail indicator for each criterion  
* All approve, reject, and revoke actions are logged in the audit trail

---

## **5\. Business Rules**

* The Verified Seller badge is granted solely at admin discretion — meeting eligibility criteria makes a seller eligible but does not automatically grant the badge  
* Automated alerts surface eligible sellers to admin but do not trigger automatic badge approval under any circumstances  
* A seller who is suspended or banned immediately loses their Verified Seller badge — reinstatement of the badge after account reinstatement requires a fresh admin review  
* A seller in a reapplication cooldown (30 days post-rejection or 60 days post-revocation) cannot be approved for a badge during the cooldown period — system blocks the action  
* Admin can revoke a badge at any time regardless of the seller's current metrics — revocation is not limited to sellers who have fallen below threshold  
* A seller whose badge is revoked retains their completed sales history and ratings — only the badge status changes  
* Revocation reason is mandatory — no badge can be revoked without a documented reason  
* Rejection must specify which eligibility criteria were not met — a blanket rejection without criteria is not permitted  
* The eligibility criteria thresholds are configurable by admin in the platform settings — they are not hardcoded — allowing the business to raise or lower the bar as the platform matures  
* Badge status changes (approve, reject, revoke) must be reflected across all platform surfaces within 60 seconds  
* A seller can hold only one badge status at a time: Unverified, Pending Review, Verified, or Revoked  
* Sellers cannot apply for a badge themselves in v1 — eligibility is detected automatically and surfaced to admin; there is no seller-initiated application flow

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Reject — Unmet Criteria | Reject action | At least one unmet criterion must be selected | "Please select at least one unmet criterion before rejecting this request" | On confirm |
| Revoke — Reason | Revoke action | Required, must select from predefined list (Performance decline, Dispute threshold exceeded, Policy violation, Account suspension, Other) | "Please select a revocation reason to continue" | On confirm |
| Revoke — Internal Note | Revoke action | Required, min 20 characters | "Please add a note of at least 20 characters documenting the basis for revocation" | On confirm |
| Approve — Cooldown Check | Approve action | Seller must not be in a reapplication cooldown period | "This seller is in a \[X\]-day reapplication cooldown until \[date\]. Badge cannot be approved before this date." | On approve action render |
| Approve — Account Status | Approve action | Seller account must be in Active status | "This seller's account is currently \[Suspended / Banned\]. Badge cannot be approved." | On approve action render |
| Admin Note — Approve | Optional | Max 500 characters | Character counter shown; input blocked at 500 | On input |
| Admin Note — Reject | Optional | Max 500 characters | Character counter shown; input blocked at 500 | On input |
| Admin Note — Revoke | Mandatory | Min 20 characters, max 500 characters | "Note must be between 20 and 500 characters" | On input and confirm |

---

## **7\. Edge Cases**

| Scenario | Expected Behaviour | Handling |
| ----- | ----- | ----- |
| Seller meets eligibility criteria but is in a 30-day rejection cooldown | Seller appears in admin view with cooldown indicator; Approve action is blocked until cooldown expires | System enforces cooldown; approve button disabled with expiry date shown |
| Admin approves a badge for a seller who drops below threshold the same day | Badge is granted based on metrics at time of approval; badge remains active until admin manually reviews and revokes | Badge is not auto-revoked on metric change; requires admin action; automated alert raised if seller crosses revocation threshold |
| Verified seller is suspended mid-badge period | Badge is automatically removed immediately on suspension without requiring admin action | Suspension trigger fires badge removal; seller notified; badge restored on reinstatement only after fresh admin review |
| Admin revokes a badge and seller immediately improves their metrics | Seller must wait out the full 60-day cooldown regardless of metric recovery; system enforces the cooldown | Cooldown is time-based, not metric-based; no early lift without admin override |
| Admin grants badge to a seller who had a previous revocation | Admin can approve after cooldown expires; previous revocation history is clearly visible in badge review profile | Revocation history retained and surfaced; admin can proceed with full context |
| Seller has exactly the minimum metrics (e.g. exactly 20 sales, exactly 4.0 rating) | Seller is eligible; system marks them as eligible; admin can approve | Boundary values treated as passing; eligibility check uses ≥ not \> |
| Two admins review the same seller's badge request simultaneously | Both can view; first to confirm action wins; second admin sees: "This seller's badge status was updated moments ago. Reload to see the latest." | Optimistic locking on badge action; conflict surfaced gracefully |
| Seller receives a new dispute ruling against them while admin is mid-review of their badge request | Admin sees a stale data notice: "This seller's metrics were updated while you were reviewing. Reload to see the latest." | Timestamp check on badge review profile load; stale notice triggered on metric change |
| Admin proactively reviews a seller not in the queue and finds they are ineligible | Admin can note the review in the audit log but cannot formally reject a seller who has not been surfaced by the system | Manual review recorded in audit log; no formal rejection issued unless seller is in queue |
| Eligibility criteria thresholds are updated while sellers are in the pending queue | Sellers in queue are re-evaluated against new criteria automatically; their pass/fail checklist updates accordingly | Criteria thresholds stored as configurable values; eligibility recalculated on each queue view |

---

## **8\. Exceptional Cases**

* **Seller purchases fake reviews:** If a seller is found to have manipulated their rating through fake transactions or coordinated review fraud, their badge should be revoked immediately and their account escalated for investigation in the Users sub-module. A review authenticity check — flagging rating spikes, unusually short review texts, or reviews from newly created accounts — should be considered as an automated fraud detection feature for v2.

* **Badge as a commercial product:** As the platform matures, the Verified Seller badge may evolve from a purely merit-based signal into a tiered commercial product (e.g. a premium subscription that unlocks a badge alongside other benefits). This would fundamentally change the badge eligibility and approval flow and must be designed as a separate workstream if the business decides to monetise it.

* **High volume of eligible sellers at scale:** In v1, admin manually reviews every badge request. If the platform reaches 500+ active sellers with 100+ simultaneously eligible, manual review of every request is not scalable. An auto-approval pathway for sellers who exceed a higher confidence threshold (e.g. 50+ sales, 4.8+ rating, zero disputes in 180 days) should be designed for v2 — with admin retaining the ability to revoke at any time.

* **Badge display on external platforms:** If sellers share their listings via social media or external links, the badge status shown at time of share may become stale if the badge is subsequently revoked. Any external link to a listing must pull live badge status on load — not cache it — to ensure revoked badges are never displayed on active listings.

* **Cross-platform seller identity:** If a seller operates on multiple resale platforms (e.g. eBay, Vinted) and is found to have a poor reputation or fraud history on those platforms, The Kit Loop has no mechanism to detect this in v1. A future seller verification step (e.g. ID verification, linked account check) could be incorporated into the badge eligibility criteria to raise the bar for verified status.


Understood — no MVP/Beta split this time, straight SRS. Let me build it clean.

---

# **SRS — Discovery | Home Page**

**Platform:** The Kit Loop | **User:** Buyer | **Module:** Discovery | **Sub-Module:** Home Page | **Version:** 1.0

---

## **1\. Feature Overview**

The Home Page is the primary entry point for all buyers visiting The Kit Loop. It serves two core discovery functions: Browse by Sport provides a fast, structured navigation path into sport-specific inventory via tappable sport icons; View Featured Listings surfaces curated, high-quality listings directly on the homepage to drive immediate engagement without requiring the buyer to search or filter.

Both features work together to reduce the time from landing on the platform to finding a relevant item — serving both buyers who arrive with a specific sport in mind and those who are browsing without a clear intent.

There are two features within this sub-module:

* **Feature 1 — Browse by Sport**  
* **Feature 2 — View Featured Listings**  
  ---

---

  # **Feature 1 — Browse by Sport**

  ---

  ## **2\. Story & Story Narrative**

**Story** As a buyer, I want to browse listings by sport so I can immediately see relevant gear without having to search or filter from scratch.

**Story Narrative** Case: A buyer visits The Kit Loop having seen a post about second-hand cricket gear. They land on the homepage and immediately see the Cricket icon in the Browse by Sport row. They tap it and are taken directly to a filtered listing page showing only cricket items — bats, helmets, pads, gloves, shoes. They find what they need within seconds without typing a single character or applying a single filter.

Flow: Buyer lands on homepage → sees Browse by Sport icon row below the hero banner → identifies their sport → taps the sport icon → filtered listing page loads at /search?sport=\[SportName\] → buyer browses sport-specific results.

Benefit: Reduces the cognitive load of discovery, drives higher engagement from the homepage, and ensures buyers reach relevant inventory in the fewest possible taps — particularly important for first-time visitors who may not know the platform's search capabilities.

---

## **3\. User Flow**

**Preconditions**

* Buyer is on the homepage — authenticated or guest  
* At least one sport category is set to Active status by admin  
* At least one live listing exists on the platform

**Main Flow**

1. Buyer lands on the homepage  
2. Hero banner loads at the top of the page  
3. Browse by Sport section loads below the hero banner with section heading "Browse by Sport" and a "View all →" link  
4. All active sports are displayed as icons in a horizontally scrollable row  
5. Each sport icon shows the sport illustration and sport name label below it  
6. Buyer identifies their sport (e.g. Cricket)  
7. Buyer taps the sport icon  
8. Platform navigates to /search?sport=Cricket  
9. Filtered listing page loads showing all live listings in Cricket sub-categories (bat, helmet, pads, gloves, ball, shoes, wicket keeping gloves)  
10. Buyer browses filtered results and applies further filters or searches if needed

**Alternative Flow — No Listings in Selected Sport**

1. Buyer taps a sport icon  
2. Filtered listing page loads with zero results  
3. Empty state displayed: "No listings in \[Sport\] yet — check back soon"  
4. CTAs shown: "Browse all listings" and "Sell your \[Sport\] gear"  
5. Buyer taps CTA or uses browser back to return to homepage

**Alternative Flow — Guest Buyer**

1. Guest buyer taps a sport icon  
2. Filtered listing page loads — no authentication required to browse  
3. Buyer can view all listings without logging in  
4. Authentication is only required at point of purchase or wishlist

**Alternative Flow — Direct URL Access**

1. Buyer accesses /search?sport=Cricket directly via a shared link or bookmark  
2. Filtered listing page loads correctly without requiring homepage visit  
3. Browse by Sport row is accessible from the homepage navigation if buyer wishes to switch sport

**Post Conditions**

* Buyer has been navigated to a filtered listing page for the selected sport  
* The filtered listing page URL reflects the selected sport — URL is shareable and bookmarkable  
* No listing data or user data has been altered — browsing is a read-only action  
* Buyer can apply further filters, sort, or search within the sport-filtered results  
  ---

  ## **4\. Acceptance Criteria**

* All active sport categories configured by admin are displayed as icons in the Browse by Sport row  
* Sport icons are displayed in admin-configured order  
* Sport icons are visible on the homepage without vertical scrolling on standard mobile and desktop viewports  
* Row is horizontally scrollable on mobile viewports when the number of sports exceeds the visible width  
* Each sport icon shows the sport illustration and the sport name label  
* Tapping any sport icon navigates the buyer to /search?sport=\[SportName\]  
* Filtered listing page loads within 2 seconds of sport icon tap  
* Filtered results show only live listings in the selected sport's sub-categories  
* Pending, flagged, and removed listings never appear in filtered results  
* If no listings exist for the selected sport, an empty state is shown with a Browse All and a Sell CTA  
* Browse by Sport is fully accessible to both authenticated buyers and guest visitors — no login required to browse  
* "View all →" link navigates to /search showing all live listings across all sports  
* Sport icons render correctly across iOS, Android, Chrome, Safari, and Firefox  
* If a sport icon image fails to load, the sport name text is shown as a fallback — layout is not broken  
* Tapping the same sport icon multiple times rapidly triggers only one navigation event — duplicate taps are debounced  
* Direct URL access to /search?sport=\[SportName\] loads the correct filtered results without requiring a homepage visit  
* If an invalid or inactive sport name is passed in the URL parameter, buyer is redirected to /search with all listings and a notice: "Sport not found — showing all listings"  
  ---

  ## **5\. Business Rules**

* Only sports set to Active status by admin are shown in the Browse by Sport row — hidden or removed sports are never displayed regardless of existing listing count  
* The order of sport icons is determined by admin configuration in the Category management panel  
* A sport icon tap always navigates directly to the filtered listing page — there is no intermediate modal or confirmation step  
* Guest buyers can browse by sport without authentication — no login wall is shown before or during browsing  
* The URL parameter for sport filtering must be consistent with the sport name as configured by admin — URL is case-insensitive (cricket and Cricket must both resolve correctly)  
* If admin changes a sport name, the old URL must redirect to the new sport name URL to preserve any shared or bookmarked links  
* A sport icon must remain visible in the row even if it currently has zero live listings — buyers can see the sport exists and are shown the empty state with Sell CTA if they tap it  
* The Browse by Sport row is a navigation element only — it does not display listing content, pricing, or counts in the base implementation  
  ---

  ## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Sport icon tap | Navigation trigger | Selected sport must be in Active status at time of tap | If sport deactivated mid-session: "This sport is no longer available — browse all listings instead" → redirect to /search | On navigation |
| URL parameter — sport | Direct URL access | Must match an active sport name (case-insensitive) | Invalid or inactive sport: redirect to /search with "Sport not found — showing all listings" notice | On page load |
| Icon image load | Display | Image asset must be available | If image fails to load: display sport name text as fallback; no broken image placeholder shown | On render |
| Tap debounce | Navigation | Single navigation event per tap sequence | Duplicate rapid taps ignored; only first tap event fires navigation | On tap |

  ---

  ## **7\. Edge Cases**

| Scenario | Expected Behaviour | Handling |
| ----- | ----- | ----- |
| Admin deactivates a sport while buyer has the homepage open in their browser | Sport icon disappears on next homepage load; if buyer taps a cached icon before reload, they are redirected to /search with a sport not found notice | Sport availability checked at navigation time; graceful redirect if sport inactive |
| All sports have zero live listings (e.g. platform just launched) | All active sport icons displayed; tapping any shows empty state with Sell CTA | Zero-listing state handled per sport; icons remain visible and tappable |
| Buyer taps a sport icon while page is still loading | Tap is queued and fires once navigation is ready; no double navigation triggered | Navigation ready state managed; tap event queued if fired during load |
| Sport icon row contains only one active sport | Row displays single icon; no scroll indicator shown; View all link still present | Single-item row renders without scroll; no layout break |
| Buyer shares a sport-filtered URL with another buyer | Recipient taps link; filtered listing page loads correctly for that sport without requiring homepage visit | Direct URL access fully supported; no homepage dependency |
| Buyer bookmarks a sport-filtered URL and returns after the sport has been renamed by admin | Old URL redirects to new sport name URL; buyer lands on correct filtered page | 301 redirect applied when sport is renamed; old URL never returns 404 |
| Very large number of active sports (e.g. 20+) on a narrow mobile viewport | Row scrolls horizontally; all sports accessible via scroll; no sports truncated or hidden | Horizontal scroll container; no max item limit on display |
| Sport icon row fails to load due to a network error | Section shows a retry option: "Unable to load sports — tap to retry"; rest of homepage loads normally | Section-level error boundary; graceful degradation; retry CTA |

  ---

  ## **8\. Exceptional Cases**

* **Sport taxonomy change mid-session:** If admin renames a sport while buyers have the homepage cached in their browsers, icon labels may show the old name until the page reloads. Old sport-filtered URLs must automatically redirect to the new sport name URL to prevent broken links from previously shared content. This redirect must be in place before any sport rename is published.

* **Performance at scale:** If the platform grows to 17+ sports with thousands of listings, the homepage must still load within 2 seconds. Sport icon data must be served from a cached layer — not queried live from the database on every homepage load. Cache must be invalidated when a sport's Active status changes to ensure deactivated sports are removed promptly.

* **Deep linking from marketing campaigns:** Seasonal email or social media campaigns will include direct links to sport-filtered pages. These links must work for both authenticated and guest buyers and must load the correct filtered results without requiring a homepage visit. URL parameter handling must be robust to capitalisation and encoding variations.

* **Accessibility:** Sport icons must be accessible to buyers using screen readers or keyboard navigation. Each icon must have a descriptive alt text (e.g. "Browse Cricket listings") and must be reachable via keyboard tab order. Colour contrast on sport name labels must meet WCAG 2.1 AA standards.

  ---

---

  # **Feature 2 — View Featured Listings**

  ---

  ## **9\. Story & Story Narrative**

**Story** As a buyer, I want to see featured listings on the homepage so I can discover quality gear immediately without having to search or filter.

**Story Narrative** Case 1 — Intent-free Browse: A buyer visits The Kit Loop with no specific item in mind. They scroll past the Browse by Sport row and land on the Featured Listings grid. A Gray-Nicolls cricket bat catches their eye — high quality photos, clearly described as Good condition, priced at £89. They tap it, review the listing detail, and complete a purchase without ever using the search bar. The featured grid converted a passive visitor into a buyer.

Case 2 — Seller Discovery: A buyer who plays padel sees the Bullpadel Vertex 03 Padel Racket featured on the homepage and recognises it as a model they have been looking for. They tap the listing, review the detail page, and buy immediately. Without the featured grid they would never have found this listing on their first visit.

Case 3 — Admin Curates Quality Inventory: The admin reviews available listings and selects 8 items for the featured grid — prioritising listings with multiple high-quality photos, accurate condition descriptions, competitive prices, and sellers with strong ratings. The grid is updated regularly to keep the homepage fresh and representative of the best available inventory.

Flow: Buyer lands on homepage → scrolls below Browse by Sport → sees Featured Listings grid → taps a listing card → listing detail page loads → buyer reviews item → buys, saves to wishlist, or returns to homepage via back navigation.

Benefit: Drives purchase intent for buyers who arrive without a specific search in mind, surfaces the platform's highest-quality inventory at the most visible point on the platform, and increases homepage-to-detail page click-through and overall conversion rate.

---

## **10\. User Flow**

**Preconditions**

* Buyer is on the homepage — authenticated or guest  
* At least one listing is live on the platform  
* Admin has configured at least one listing for the Featured Listings grid

**Main Flow**

1. Buyer lands on homepage and scrolls below the Browse by Sport row  
2. Featured Listings section loads with section heading "Featured Listings" and "View all →" link  
3. Grid displays up to 8 listing cards in a 4-column layout on desktop and 2-column layout on mobile  
4. Each listing card displays: primary listing photo, item title, and price  
5. Buyer scans the grid and identifies an item of interest  
6. Buyer taps a listing card  
7. Platform navigates to /listing/\[listingID\]  
8. Listing detail page loads showing full item information: all photos, title, brand, condition, description, price, seller info and rating  
9. Buyer reviews the full listing detail  
10. Buyer takes one of the following actions:  
    * Taps Buy Now → proceeds to checkout  
    * Taps heart icon → item saved to Favourites (if authenticated) or sign up prompt shown (if guest)  
    * Taps Make Offer → navigates to messages page  
    * Taps browser back → returns to homepage with Featured Listings grid in the same scroll position

**Alternative Flow — No Featured Listings Configured**

1. Admin has not configured any featured listings  
2. Featured Listings section falls back to showing the 8 most recently published live listings  
3. Section heading changes to "Latest Listings"  
4. Buyer experience is uninterrupted — no empty state or error shown

**Alternative Flow — Zero Live Listings on Platform**

1. Platform is newly launched with no live listings  
2. Featured Listings section is hidden entirely from homepage  
3. No empty grid, placeholder cards, or error state shown to buyer  
4. Homepage displays hero banner and Browse by Sport only

**Alternative Flow — Featured Listing Sold or Removed**

1. A featured listing sells or is removed while the buyer has the homepage open  
2. Listing card remains visible until buyer refreshes the page  
3. Buyer taps the listing card  
4. Listing detail page shows: "This item is no longer available"  
5. Buyer is offered: "Browse similar items" CTA navigating to the relevant sport-filtered search

**Alternative Flow — Guest Buyer Attempts to Wishlist**

1. Guest buyer taps the heart icon on a listing detail page  
2. Sign up or login prompt is shown  
3. Guest completes sign up or login  
4. Item is saved to Favourites automatically post-authentication  
5. Buyer is returned to the listing detail page with the heart icon filled

**Post Conditions**

* Buyer has tapped a listing card and been navigated to the listing detail page, or  
* Buyer has returned to the homepage via back navigation with scroll position preserved  
* No listing data has been altered by viewing — Featured Listings is a read-only display  
* "View all →" tap navigates buyer to /search with all live listings  
  ---

  ## **11\. Acceptance Criteria**

* Featured Listings section is displayed on the homepage below the Browse by Sport row  
* Section heading "Featured Listings" and "View all →" link are always visible when the section is present  
* Up to 8 listing cards are displayed in the featured grid  
* Each listing card displays: primary listing photo, item title, and price  
* Listing cards are displayed in a 4-column grid on desktop viewports and a 2-column grid on mobile viewports  
* Tapping a listing card navigates the buyer to /listing/\[listingID\] within 2 seconds  
* Only live listings appear in the featured grid — pending, flagged, and removed listings are never shown  
* If a featured listing is sold or removed, tapping its card shows an "Item no longer available" message with a Browse Similar CTA  
* If no featured listings are configured by admin, the 8 most recently published live listings are shown under a "Latest Listings" heading  
* If zero live listings exist on the platform, the Featured Listings section is hidden entirely — no empty state shown  
* "View all →" link navigates to /search displaying all live listings across all sports  
* Featured Listings section is accessible to both authenticated and guest buyers — no authentication required to view  
* Listing card images load progressively — skeleton loading state shown while images fetch; text content loads first  
* If a listing card image fails to load, a placeholder image is shown and the card layout is not broken  
* Section renders correctly on iOS, Android, Chrome, Safari, and Firefox  
* Back navigation from listing detail returns buyer to homepage at the same vertical scroll position  
  ---

  ## **12\. Business Rules**

* Only listings in Live status are eligible to appear in the Featured Listings grid — pending, flagged, and removed listings are excluded without exception  
* Admin manually selects which listings appear in the featured grid via the admin panel — there is no automated or algorithmic selection in this version  
* Featured listings are displayed to all buyers regardless of authentication status — no personalisation applied  
* If a featured listing is sold or removed after being placed in the featured grid, the next listing in the admin's featured selection takes its place automatically; if no backup selection exists, the most recently published live listing fills the gap  
* The featured grid displays a maximum of 8 listings — admin cannot exceed this limit in the configuration  
* Sellers cannot request or pay to have their listing featured — the featured grid is editorially controlled by admin only  
* The "View all →" CTA is always present when the Featured Listings section is visible — it cannot be hidden or removed  
* Featured listing card content (photo, title, price) reflects the live listing data at the time the page loads — it is not cached independently of the listing record  
* If the price of a featured listing is updated by the seller, the updated price is shown on the homepage card on the next page load  
  ---

  ## **13\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Listing card tap | Navigation | Listing must be in Live status at time of tap | If listing sold or removed between page load and tap: "This item is no longer available" → show Browse Similar CTA | On navigation to listing detail |
| Primary listing photo | Display | Listing must have at least one photo | If no photo exists: platform default placeholder image shown; card layout not broken | On card render |
| Price display | Display | Must be a positive numeric value in GBP | If price data is missing or malformed: card shown without price; does not crash the grid | On card render |
| View all link | Navigation | Always valid — navigates to /search | No validation required | On tap |
| Back navigation | UX | Returns buyer to homepage at same scroll position | If scroll position cannot be restored: returns to top of homepage | On back navigation |

  ---

  ## **14\. Edge Cases**

| Scenario | Expected Behaviour | Handling |
| ----- | ----- | ----- |
| Featured listing sells while buyer is viewing the homepage | Card remains visible until page refresh; on tap buyer sees item unavailable message with Browse Similar CTA | Live status checked on listing detail load; graceful unavailable state shown |
| Admin removes all featured listings simultaneously | Section falls back to 8 most recently published live listings under "Latest Listings" heading; buyer experience uninterrupted | Fallback logic fires when featured selection is empty; no broken or empty state shown |
| All 8 featured listing slots are occupied by the same seller's listings | Displayed as configured by admin — no diversity enforcement in this version; all 8 listings from one seller are valid | No seller diversity rule applied; admin responsible for curation quality |
| Featured listing's primary photo is portrait orientation on a landscape card | Photo is centre-cropped to fill card dimensions; no distortion or whitespace | CSS object-fit: cover applied to all listing card images; consistent card dimensions maintained |
| Buyer rapidly taps multiple listing cards | First tap fires navigation; subsequent taps ignored until navigation completes | Tap debounce and navigation lock applied; only first tap event triggers navigation |
| Featured Listings section fails to load due to network error | Section shows retry option: "Unable to load featured listings — tap to retry"; rest of homepage loads normally | Section-level error boundary; graceful degradation; retry CTA; hero and Browse by Sport not affected |
| Homepage is loaded on a very slow network connection | Skeleton loading cards shown in grid while images fetch; title and price text loads first; images load progressively | Skeleton UI for listing cards; progressive image loading; no blank white grid |
| Admin configures fewer than 8 featured listings (e.g. only 5\) | Grid shows 5 cards; remaining 3 slots are not shown as empty placeholders | Grid renders the exact number of featured listings configured; no empty slot placeholders |
| Buyer taps "View all →" from the Featured Listings section | Navigates to /search showing all live listings across all sports in default sort order | Standard /search page load; no featured filter applied; all listings shown |
| Featured listing price is updated by seller while buyer has homepage open | Buyer sees old price on homepage card; detail page always shows current price; discrepancy is resolved on next homepage load | Homepage card price is point-in-time from page load; detail page queries live listing data |

  ---

  ## **15\. Exceptional Cases**

* **Featured listing from a suspended seller:** If a seller is suspended after their listing has been added to the featured grid, the listing must be hidden from the featured grid immediately — suspended sellers' listings are paused platform-wide. The featured grid must reflect this within 60 seconds of the suspension being applied. Admin must not be required to manually remove the listing from the featured selection — it must be suppressed automatically by the listing's paused status.

* **Prohibited content reaching the featured grid:** If a listing containing prohibited or policy-violating content is manually selected by admin for the featured grid before it is flagged, it will have maximum visibility at the highest-traffic point on the platform. A content review step should be enforced before any listing can be added to the featured grid — the listing must be in Live and unflagged status for a minimum period (e.g. 24 hours) before it is eligible for featuring.

* **Homepage performance under high traffic:** During marketing campaigns or seasonal peaks, the homepage may receive significantly higher traffic than normal. The Featured Listings section must be served from a cached layer to avoid database load spikes. Cache must be invalidated when the featured selection changes or when a featured listing's status changes. Load testing of the homepage under peak traffic conditions must be completed before any significant marketing activity.

* **Accessibility:** Each listing card must be fully accessible to buyers using screen readers or keyboard navigation. The primary photo must have descriptive alt text pulled from the listing title (e.g. "Gray-Nicolls Kronus 1500 Cricket Bat — Short Handle, Good condition, £89.00"). Cards must be reachable via keyboard tab order and activatable via Enter key. Price and title text must meet WCAG 2.1 AA colour contrast standards against the card background.

* **Featured listing as a future revenue stream:** In the current version, featuring is editorial and free. As the platform scales, promoted or featured listing slots may become a paid product offered to sellers. When this is introduced, the featured grid logic, admin configuration panel, and seller-facing product must be redesigned to support both editorially featured and paid-featured listings coexisting in the grid — with clear rules on priority ordering and maximum paid slot allocation to prevent the grid from becoming purely commercial and losing buyer trust.


# **SRS — Discovery | Search & Filter**

**Platform:** The Kit Loop | **User:** Buyer | **Module:** Discovery | **Sub-Module:** Search & Filter | **Version:** 1.0

---

## **1\. Feature Overview**

The Search & Filter sub-module is the primary tool buyers use to find specific items on The Kit Loop. It operates on the browse and search results page (/search) and gives buyers three complementary ways to narrow inventory to exactly what they need: keyword search finds items by name or description; filters narrow results by sport, condition, brand, price range, and colour; sort controls the order in which results are presented. All three work together and can be combined simultaneously. The result set updates in response to any change without requiring a full page reload.

There are three features within this sub-module:

* **Feature 1 — Search by Keyword**  
* **Feature 2 — Filter by Sport / Condition / Brand / Price / Colour**  
* **Feature 3 — Sort Listings**

---

---

# **Feature 1 — Search by Keyword**

---

## **2\. Story & Story Narrative**

**Story** As a buyer, I want to search for items by keyword so I can find specific gear quickly without having to browse through unrelated listings.

**Story Narrative** Case 1 — Specific Item Search: A buyer wants a Wilson Pro Staff tennis racket. They type "Wilson Pro Staff" into the search bar. Results load immediately showing only listings where the title, brand, or description matches those terms. The buyer finds the exact model within seconds and proceeds to the listing detail.

Case 2 — Broad Search with Refinement: A buyer searches for "cricket bat" and gets 23 results. The results are too broad — they want a specific brand and condition. They keep the keyword search applied and layer on filters (Brand: Gray-Nicolls, Condition: Like new) to narrow to 3 results. Both the keyword and filters work simultaneously.

Case 3 — Partial Match: A buyer types "kookaburr" — a partial spelling of Kookaburra. The search returns listings containing Kookaburra in the title or brand field. The buyer finds the item without needing to spell the full brand name correctly.

Flow: Buyer navigates to /search or uses the search bar in the global navigation → types a keyword → results load automatically or on submit → buyer reviews results → applies additional filters or sorts if needed → taps a listing to view detail.

Benefit: Enables intent-driven discovery for buyers who know what they want, reduces time-to-find for returning buyers with specific items in mind, and handles partial or imprecise queries gracefully to avoid frustrating buyers with zero results.

---

## **3\. User Flow**

**Preconditions**

* Buyer is on any page of the platform — the search bar is accessible from global navigation  
* At least one live listing exists on the platform

**Main Flow**

1. Buyer taps or clicks the search bar in the global navigation  
2. Search bar becomes active — cursor placed in field  
3. Buyer types a keyword (e.g. "cricket bat")  
4. As buyer types, results begin updating after a short debounce delay (300ms)  
5. Results panel loads on /search showing all live listings where the keyword matches the title, brand, description, or category  
6. Result count shown above results (e.g. "23 results")  
7. Buyer reviews results  
8. Buyer taps a listing card to view listing detail  
9. Buyer can clear the search term using the × icon in the search bar to reset results

**Alternative Flow — No Results Found**

1. Buyer types a keyword that matches no live listings  
2. Results panel shows zero results  
3. Empty state displayed: "No results for '\[keyword\]' — try a different search or browse all listings"  
4. CTA shown: "Browse all listings" navigating to /search with no filters applied  
5. Search bar remains active — buyer can edit their keyword

**Alternative Flow — Search from Homepage**

1. Buyer types in the search bar on the homepage  
2. On submit (Enter key or tap search icon) buyer is navigated to /search?q=\[keyword\]  
3. Results load for the entered keyword  
4. Filters panel is available for further refinement

**Alternative Flow — Search Combined with Existing Filter**

1. Buyer is on /search with a sport filter already applied (e.g. Cricket)  
2. Buyer types a keyword in the search bar  
3. Results update to show only listings matching both the keyword and the active filter  
4. Filter and keyword work simultaneously — neither overrides the other

**Post Conditions**

* Results page shows all live listings matching the entered keyword  
* Keyword is visible in the search bar and in the URL (e.g. /search?q=cricket+bat)  
* Result count is displayed above the listing grid  
* Buyer can clear keyword, add filters, or sort results without losing their place on the page  
* No listing data is altered by searching — read-only action

---

## **4\. Acceptance Criteria**

* Search bar is accessible from global navigation on all pages of the platform  
* Buyer can type a keyword and results begin updating after a 300ms debounce delay  
* Search matches against listing title, brand name, description text, and category name  
* Search is case-insensitive — "Cricket Bat" and "cricket bat" return identical results  
* Search supports partial matches — "kookaburr" returns listings containing "Kookaburra"  
* Search ignores leading and trailing whitespace in the keyword input  
* Result count is displayed above the listing grid (e.g. "23 results")  
* Only live listings are returned in search results — pending, flagged, and removed listings never appear  
* Keyword is reflected in the page URL as a query parameter (/search?q=\[keyword\]) — URL is shareable and bookmarkable  
* If a shared search URL is opened, the keyword is pre-populated in the search bar and results load correctly  
* Buyer can clear the keyword using the × icon — results reset to show all live listings or current filter state  
* If no listings match the keyword, an empty state is shown with a Browse All CTA  
* Keyword search and active filters work simultaneously — keyword does not override filters and filters do not clear the keyword  
* Search results load within 2 seconds of keyword entry  
* Search bar is accessible on both mobile and desktop viewports  
* Buyer does not need to be authenticated to search — guest buyers have full search access

---

## **5\. Business Rules**

* Search is performed against live listings only — pending, flagged, removed, and paused listings are excluded from all results  
* Search is not limited to titles only — it queries title, brand, description, and category fields to maximise the chance of a relevant match  
* Partial matches are supported — the search must not require an exact full-word match to return results  
* Search is case-insensitive across all matched fields  
* The keyword entered by the buyer is preserved in the URL as a query parameter to support sharing and bookmarking  
* Keyword search and filter selections are cumulative — applying a keyword does not clear active filters; applying a filter does not clear the keyword  
* The search bar is available to all buyers regardless of authentication status  
* If a buyer clears the keyword, results revert to showing all live listings within the current filter state — filters are not also cleared  
* Minimum keyword length for a search to fire is 2 characters — single character input does not trigger a search query

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Search input | Keyword entry | Minimum 2 characters to trigger search | No error message — search simply does not fire until 2 characters entered; placeholder text guides buyer | On input |
| Search input | Keyword entry | Maximum 100 characters | Input blocked at 100 characters; no error message — character limit is silent | On input |
| Search input | Whitespace only input | Input of only spaces does not trigger a search | Whitespace trimmed; if result is empty string, search does not fire | On submit / debounce |
| Search URL parameter | Direct URL access with q parameter | Parameter must be URL-decoded correctly | Malformed URL parameter falls back to /search with no keyword; no error shown to buyer | On page load |

---

## **7\. Edge Cases**

| Scenario | Expected Behaviour | Handling |
| ----- | ----- | ----- |
| Buyer searches for a keyword matching a removed or flagged listing | Removed and flagged listings never appear in results — search is against live listings only | Status filter applied at query level; not filtered client-side |
| Buyer types very quickly and submits before debounce fires | Submit action (Enter key) overrides debounce and fires search immediately | Enter key bypasses debounce; immediate search query fired on submit |
| Buyer searches for a sport name (e.g. "Cricket") | Results include all listings in the Cricket category as well as listings where "cricket" appears in title or description | Category name included in search fields; broad results returned |
| Buyer clears keyword while filters are active | Keyword is removed; filters remain active; results update to show all listings matching remaining filters | Keyword and filters are independent state; clearing one does not affect the other |
| Search bar loses focus mid-typing on mobile (e.g. keyboard dismissed) | Partial keyword is retained in search bar; results reflect the partial keyword entered so far | Input state preserved on focus loss; no auto-clear |
| Buyer shares a search URL with another buyer | Recipient opens URL; keyword pre-populates in search bar; same results load | URL parameter handling robust to sharing; no session dependency |
| Search returns a very large number of results (e.g. 500+) | Results are paginated; first page shows 20 results; buyer can load more or refine with filters | Server-side pagination applied; result count shown; load more or pagination CTA |
| Keyword contains special characters (e.g. punctuation or emoji) | Special characters are stripped or ignored; search fires on alphanumeric content only | Input sanitised before query; no error shown; search proceeds on cleaned input |
| Search service is temporarily unavailable | Search bar shows: "Search is temporarily unavailable — please try again shortly"; rest of page loads normally | Service-level error caught; graceful degradation; no page crash |

---

## **8\. Exceptional Cases**

* **Search relevance ranking:** In the current implementation, results are returned in default listing order (newest first) when a keyword matches multiple fields. As the platform scales and result sets grow, a relevance ranking algorithm — scoring listings by match quality (title match weighted higher than description match), seller rating, and recency — should be introduced to ensure the most relevant results appear at the top rather than the most recent.

* **Synonyms and common misspellings:** Buyers may search for "footy boots" instead of "football boots" or "trainers" instead of "running shoes." Without synonym handling, these searches return zero results despite relevant inventory existing. A synonym dictionary and common misspelling correction layer should be built into the search service before platform scale makes zero-result searches a significant drop-off point.

* **Search analytics:** The platform has no search analytics in the current scope. Tracking what buyers search for — including zero-result searches — is one of the most valuable data sources for product and inventory decisions. A search analytics log capturing keyword, result count, and buyer action post-search should be implemented alongside the search feature, not retrospectively.

* **Sensitive keyword handling:** If a buyer searches for terms that could indicate prohibited item intent (e.g. searching for a weapon-type item on a sports platform), the search should return zero results gracefully and not surface any tangentially related listings. A keyword blocklist should be maintained by admin and applied at the search query layer.

---

---

# **Feature 2 — Filter by Sport / Condition / Brand / Price / Colour**

---

## **9\. Story & Story Narrative**

**Story** As a buyer, I want to filter search results by sport, condition, brand, price, and colour so I only see listings that are relevant to exactly what I am looking for.

**Story Narrative** Case 1 — Multi-filter: A buyer wants a Like new Wilson tennis racket priced between £50 and £150. They open the /search page, tick Tennis under Sport, tick Like new under Condition, tick Wilson under Brand, and set £50–£150 under Price. Results update to show only listings meeting all four criteria simultaneously. From 200+ total listings, they are now looking at 4 relevant results.

Case 2 — Colour Filter for Kit Matching: A buyer is purchasing kit for their team and needs items in black. They tick Black under Colour. Results show only black items in the selected sport — useful for apparel, footwear, and accessories where colour is a purchase requirement.

Case 3 — Filter \+ Keyword: A buyer searches "cricket" and then applies Condition: Good and Price: £0–£100. The keyword and filters work together — results show only cricket-related items in Good condition under £100. Neither the keyword nor the filters override each other.

Case 4 — Clear Filters: A buyer applied several filters and the result set is now too narrow — only 1 result. They tap "Clear All Filters" to reset all filter selections and return to the full result set for their keyword.

Flow: Buyer on /search → opens filter panel (sidebar on desktop, bottom sheet on mobile) → selects one or more filter values → results update in real time → buyer reviews narrowed results → taps a listing to view detail or clears filters to broaden results.

Benefit: Dramatically reduces the number of irrelevant listings a buyer needs to scroll through, shortens the decision-making process, increases purchase intent by serving only listings that match the buyer's specific requirements, and reduces bounce rate from buyers who cannot find relevant items.

---

## **10\. User Flow**

**Preconditions**

* Buyer is on the /search page — authenticated or guest  
* At least one live listing exists on the platform  
* Filter panel is visible (sidebar on desktop, accessible via Filter button on mobile)

**Main Flow**

1. Buyer is on /search — results show all live listings or keyword-filtered results  
2. Buyer opens filter panel  
3. Filter panel displays all filter groups: Sport, Condition, Price Range, Brand, Colour  
4. Buyer selects a filter value in any group (e.g. ticks Cricket under Sport)  
5. Results update immediately to show only listings matching the selected filter  
6. Result count updates above the listing grid  
7. Buyer selects additional filter values in the same or different groups (e.g. also ticks Good under Condition)  
8. Results update again — now showing only listings matching all selected filters simultaneously  
9. Active filter selections are visually indicated — selected checkboxes, filled state, or chip labels  
10. Buyer reviews narrowed results and taps a listing to view detail

**Alternative Flow — Price Range Filter**

1. Buyer opens Price Range filter group  
2. Buyer drags the range slider or types min and max values manually  
3. Results update to show only listings with a price within the entered range  
4. Price range is shown as an active filter indicator above the results

**Alternative Flow — Clear Individual Filter**

1. Buyer wants to remove one filter without clearing all  
2. Buyer unticks the specific filter value or taps the × on the active filter chip  
3. That filter is removed; all other active filters remain  
4. Results update to reflect the remaining active filters

**Alternative Flow — Clear All Filters**

1. Buyer taps "Clear All Filters" button  
2. All filter selections are removed simultaneously  
3. Results reset to show all live listings matching the current keyword (if any) or all live listings if no keyword  
4. Filter panel resets to default unselected state

**Alternative Flow — Filter on Mobile**

1. Buyer taps "Filters" button on mobile viewport  
2. Filter panel slides up as a bottom sheet  
3. Buyer selects filters within the bottom sheet  
4. Buyer taps "Apply" or "Show \[X\] results" button  
5. Bottom sheet closes; results update; active filter count shown on Filters button (e.g. "Filters (3)")

**Post Conditions**

* Results show only live listings matching all currently active filter selections and any active keyword  
* Active filter selections are reflected in the page URL as query parameters — URL is shareable and bookmarkable  
* Result count above the listing grid is accurate and reflects the filtered result set  
* Buyer can modify, add, or remove individual filters without losing other active selections  
* No listing data is altered by filtering — read-only action

---

## **11\. Acceptance Criteria**

**Sport Filter**

* All active sport categories configured by admin are shown as checkboxes in the Sport filter group  
* Buyer can select one or multiple sports simultaneously  
* Selecting a sport shows only listings categorised under that sport's sub-categories  
* Selecting multiple sports shows listings from all selected sports combined (OR logic within same filter group)  
* Sport filter selection updates results immediately without page reload

**Condition Filter**

* Condition filter shows all four condition options: New with tags, Like new, Good, Fair  
* Buyer can select one or multiple conditions simultaneously  
* Multiple condition selections use OR logic — selecting Good and Fair shows listings in either condition  
* Condition filter updates results immediately

**Brand Filter**

* Brand filter shows all brands present in current live listings — brands with no matching live listings are not shown  
* Buyer can select one or multiple brands simultaneously  
* Multiple brand selections use OR logic  
* Brand list is scrollable if number of brands exceeds visible filter panel height  
* Brand filter updates results immediately

**Price Range Filter**

* Price Range filter shows a dual-handle range slider with min and max values  
* Default range is £0 to the highest listed price in the current result set  
* Buyer can drag either handle or type values manually in min/max input fields  
* Results update to show only listings with a price within the set range  
* Price range filter updates results on slider release or on manual input confirmation

**Colour Filter**

* Colour filter shows all colours present in current live listings  
* Buyer can select one or multiple colours simultaneously  
* Multiple colour selections use OR logic  
* Colour filter updates results immediately

**General**

* All filter groups can be selected simultaneously — all active filters use AND logic across groups (e.g. Sport: Cricket AND Condition: Good AND Brand: Gray-Nicolls)  
* Within a single filter group, multiple selections use OR logic (e.g. Condition: Good OR Fair)  
* Active filter selections are shown as filter chips or indicators above the results grid  
* Each active filter chip has a × to remove that individual filter  
* "Clear All Filters" button resets all filter selections simultaneously  
* Active filters are reflected in the URL as query parameters — URL is shareable  
* Filter state is preserved when buyer navigates to a listing detail and returns via back navigation  
* On mobile, filter panel is accessible via a "Filters" button; active filter count is shown on the button  
* Filters load within 1 second of the /search page loading  
* Guest buyers have full access to all filters — no authentication required

---

## **12\. Business Rules**

* All filter groups operate simultaneously using AND logic across groups and OR logic within a group — this is the standard multi-filter behaviour and must be consistent across all filter types  
* The Brand filter only shows brands that have at least one live listing in the current result set — it does not show all platform brands regardless of listing availability  
* The Colour filter only shows colours present in the current result set — not all possible colours  
* Price Range filter bounds are dynamic — the maximum value reflects the highest price in the current result set, not a fixed platform maximum  
* Filters and keyword search are always cumulative — no filter or keyword clears another  
* Active filters persist when a buyer navigates from the results page to a listing detail and returns via back navigation — filter state is not lost on back navigation  
* A sport filter applied via the filter panel is equivalent to a sport filter applied via the Browse by Sport icon tap — both navigate to /search?sport=\[Sport\]  
* Removed, flagged, paused, and pending listings are excluded from all filtered results without exception  
* The "Clear All Filters" action clears all filter selections but does not clear the active keyword search

---

## **13\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Price Range — Min | Manual price input | Numeric, min £0, must be less than or equal to max value | If min \> max: min field highlighted; "Minimum price cannot exceed maximum price" | On input blur and on slider release |
| Price Range — Max | Manual price input | Numeric, must be greater than or equal to min value, max £9999 | If max \< min: max field highlighted; "Maximum price cannot be less than minimum price" | On input blur |
| Price Range — Non-numeric input | Manual price input | Numeric only | Non-numeric characters blocked silently; only digits and decimal point accepted | On input |
| Filter URL parameters | Direct URL access with filter params | Parameters must match valid filter values | Invalid filter parameter ignored silently; valid parameters applied; no error shown | On page load |
| Mobile — Apply button | Mobile filter confirmation | At least one filter must be selected or changed | If no change made: "Apply" button still available; tapping closes sheet with no results change | On apply tap |

---

## **14\. Edge Cases**

| Scenario | Expected Behaviour | Handling |
| ----- | ----- | ----- |
| Buyer selects filters that return zero results | Empty state shown: "No listings match your filters — try adjusting or clearing your filters"; Clear All Filters CTA shown | Zero-result state handled gracefully; filter panel remains open for adjustment |
| Brand filter shows 50+ brands | Brand list is scrollable within the filter panel; no truncation; all brands accessible | Scrollable filter group; no max display limit on brands |
| Buyer applies a sport filter and the selected sport has no matching brand in the brand filter | Brand filter updates dynamically to show only brands present in the sport-filtered result set | Brand filter is dynamic — always reflects brands in current result set not all platform brands |
| Price range max is dragged below current min | Max handle snaps to current min value; range is never inverted | Slider handles cannot cross; min/max swap prevented |
| Buyer applies filters and shares the URL with another buyer | Recipient opens URL; same filters are pre-applied; same result set loads | Filter state in URL parameters; fully shareable without session dependency |
| A live listing is added while buyer has filters applied | New listing appears in results on next results refresh if it matches active filters; does not appear mid-session without reload | Result set is a point-in-time snapshot; new listings appear on page reload |
| Buyer selects all available conditions simultaneously | Results show all listings regardless of condition — equivalent to no condition filter; result count equals total unfiltered count | All-selected state is logically equivalent to no filter; handled correctly |
| Colour filter shows a colour that only has 1 listing and that listing sells mid-session | Colour option remains in filter panel for the session; on next page load it is removed if no matching listings remain | Filter options are session-static; refreshed on page load not in real time |
| Buyer on mobile closes filter bottom sheet without tapping Apply | No filter changes are applied; results remain as they were before opening the sheet | Mobile filter changes only applied on explicit Apply tap; close without apply discards changes |
| Filter panel fails to load | Inline error shown in filter panel area: "Filters unavailable — please refresh"; listing results still displayed | Filter is a progressive enhancement; results display without filters if filter service fails |

---

## **15\. Exceptional Cases**

* **Filter performance at scale:** As the platform grows to thousands of listings with many concurrent users applying filters, real-time result updates on every filter change can generate significant database load. Filter queries must be optimised with appropriate indexing on sport, condition, brand, price, and colour fields. For high-traffic periods, pre-computed filter buckets should be considered to avoid per-request full-table queries.

* **Brand name inconsistency:** If sellers enter brand names inconsistently (e.g. "Gray-Nicolls", "Gray Nicolls", "GN"), the brand filter will show these as separate options, fragmenting buyer search behaviour. A brand name normalisation and validation step at listing creation — where sellers select from a predefined brand list rather than free-typing — must be enforced to maintain filter integrity. This is already present in the listing form but must be strictly enforced with no free-text fallback.

* **Price range currency change:** The platform currently operates in GBP only. If international expansion is introduced, price range filters must display in the buyer's local currency with real-time conversion. This requires a significant change to the filter architecture and must be designed as a separate workstream.

* **Accessibility of filter controls:** All filter checkboxes, the price range slider, and the mobile filter bottom sheet must be accessible via keyboard navigation and compatible with screen readers. The price range slider in particular requires careful ARIA labelling (aria-valuemin, aria-valuemax, aria-valuenow) to be usable by buyers relying on assistive technology. WCAG 2.1 AA compliance must be verified for all filter UI components before launch.

---

---

# **Feature 3 — Sort Listings**

---

## **16\. Story & Story Narrative**

**Story** As a buyer, I want to sort listings so I can view results in the order most relevant to my current intent — whether that is finding the newest stock, the lowest price, or the closest match.

**Story Narrative** Case 1 — Newest First for Regular Visitors: A buyer who visits the platform weekly wants to see what has been listed since their last visit. They select "Newest First" and see the most recently published listings at the top — they do not have to scroll past items they have already seen.

Case 2 — Price: Low to High for Budget Buyers: A buyer has a budget of £50 for cricket gloves. They sort by "Price: Low to High" and immediately see the most affordable options at the top. They do not need to scroll through expensive items to find something in their range.

Case 3 — Sort Combined with Filter and Keyword: A buyer searches "tennis racket", filters by Condition: Like new, and sorts by Price: Low to High. All three work simultaneously — results show Like new tennis rackets ordered from cheapest to most expensive.

Flow: Buyer is on /search with or without keyword and filters applied → taps or clicks the Sort dropdown → selects a sort option → results reorder immediately → buyer reviews results in new order.

Benefit: Gives buyers control over result ordering to match their intent, reduces scroll effort when a buyer's priority is price or recency, and complements keyword and filter functionality by giving buyers a third axis of control over their results.

---

## **17\. User Flow**

**Preconditions**

* Buyer is on /search — authenticated or guest  
* At least one live listing exists in the current result set (post-keyword and post-filter)  
* Sort dropdown is visible above the listing grid

**Main Flow**

1. Buyer is on /search with results displayed  
2. Sort dropdown is visible above the listing grid — default selection is "Newest First"  
3. Buyer taps or clicks the Sort dropdown  
4. Dropdown expands showing all sort options:  
   * Newest First (default)  
   * Oldest First  
   * Price: Low to High  
   * Price: High to Low  
5. Buyer selects a sort option (e.g. Price: Low to High)  
6. Dropdown closes  
7. Results reorder immediately to reflect the selected sort — no page reload required  
8. Selected sort option is shown as the active state in the dropdown  
9. Buyer reviews results in new order

**Alternative Flow — Sort with Active Filters and Keyword**

1. Buyer has keyword and filters active  
2. Buyer changes sort option  
3. Results reorder within the current filtered and keyword-matched result set  
4. Keyword and filters are not affected by sort change

**Alternative Flow — Sort Persists on Back Navigation**

1. Buyer sorts by Price: Low to High  
2. Buyer taps a listing card and views listing detail  
3. Buyer taps browser back  
4. Returns to /search with Price: Low to High sort still active and result set unchanged

**Post Conditions**

* Results are displayed in the order matching the selected sort option  
* Sort selection is reflected in the URL as a query parameter (e.g. /search?sort=price\_asc)  
* Sort selection persists alongside active keyword and filter state  
* Sort selection is preserved on back navigation from listing detail  
* No listing data is altered by sorting — read-only action

---

## **18\. Acceptance Criteria**

* Sort dropdown is visible above the listing grid on the /search page at all times  
* Default sort option on all /search page loads is "Newest First"  
* Sort dropdown offers four options: Newest First, Oldest First, Price: Low to High, Price: High to Low  
* Selecting a sort option reorders results immediately without page reload  
* Results reorder correctly for each sort option:  
  * Newest First: results ordered by listing creation date descending  
  * Oldest First: results ordered by listing creation date ascending  
  * Price: Low to High: results ordered by listing price ascending  
  * Price: High to Low: results ordered by listing price descending  
* Active sort selection is shown as selected state in the dropdown  
* Sort selection is reflected in the URL as a query parameter — URL is shareable  
* Sort works correctly when combined with active keyword search and active filters — sort does not override or clear keyword or filter state  
* Sort selection persists when buyer navigates to listing detail and returns via back navigation  
* Sort dropdown is accessible on both mobile and desktop viewports  
* If results contain listings with identical prices, listings at the same price are sub-sorted by Newest First  
* Guest buyers have full access to sort — no authentication required  
* Sort applies only to live listings — the result set composition does not change when sort changes, only the order

---

## **19\. Business Rules**

* Default sort for all /search page loads is Newest First — this is non-configurable by the buyer and resets to Newest First on a fresh /search page load with no sort parameter in the URL  
* Sort applies to the current result set only — it does not change which listings are included, only the order in which they are displayed  
* Sort is always cumulative with keyword and filter — changing sort does not clear keyword or filter state  
* Listings with identical prices are sub-sorted by Newest First to provide a consistent and deterministic order  
* Sort selection is preserved in the URL as a query parameter to support sharing and back navigation  
* Guest buyers can access all sort options — no authentication required

---

## **20\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Sort URL parameter | Direct URL access with sort param | Must match a valid sort value (newest, oldest, price\_asc, price\_desc) | Invalid sort parameter: falls back to Newest First silently; no error shown | On page load |
| Sort dropdown selection | Sort option selection | Must be one of the four defined options | Dropdown is constrained to defined options; no free input available | On selection |

---

## **21\. Edge Cases**

| Scenario | Expected Behaviour | Handling |
| ----- | ----- | ----- |
| Buyer sorts Price: Low to High when some listings have no price (data anomaly) | Listings with no price are sorted to the end of the result set | Null price treated as highest value for ascending sort; lowest value for descending sort |
| All listings in result set have the same price | All results displayed in Newest First sub-sort order regardless of selected price sort | Sub-sort by creation date applied when primary sort values are equal |
| Result set has only one listing | Sort dropdown remains visible and functional; result set does not change on sort | Single-result set renders correctly; no sort error |
| Buyer selects a sort, shares the URL, and recipient opens it | Recipient sees the same sort applied and same results (assuming no listing status changes between share and open) | Sort parameter in URL; applied on page load for all buyers |
| Buyer rapidly switches between sort options | Each selection triggers a results reorder; only the last selected sort is applied; intermediate sorts do not queue | Sort change debounced at 200ms; only final selection within debounce window fires reorder |
| New listing is published while buyer has sort applied | New listing does not appear mid-session; appears on next page load in correct sorted position | Result set is point-in-time; new listings appear on refresh |
| Sort dropdown fails to render | Listing results still displayed in default Newest First order; no sort control visible; page is not broken | Sort is a progressive enhancement; default order applied if sort control fails to render |
| Buyer applies sort and result count changes | Result count does not change when sort changes — sort only reorders, not filters | Sort does not affect result composition; count is stable across sort changes |

---

## **22\. Exceptional Cases**

* **Relevance sort:** The current sort options are purely mechanical (date, price). As the platform scales and search result sets grow, a "Most Relevant" sort option — ranking results by keyword match quality, seller rating, and listing completeness — should be introduced as the default sort when a keyword is active. Newest First remains the default when no keyword is present. This requires a search relevance scoring system and must be designed in conjunction with the search feature evolution.

* **Personalised sort default:** As personalisation capabilities are introduced (see Browse by Sport and Featured Listings Beta), the default sort for an authenticated buyer could be personalised — for example, defaulting to listings in the buyer's preferred sport at the top. This is a significant change to the sort architecture and must be designed carefully to avoid confusing buyers who expect a consistent default experience.

* **Sort performance at scale:** Sorting by price across thousands of listings with concurrent users must be performant. Price and date fields must be indexed in the database. For very large result sets, server-side sorting is mandatory — client-side sorting of paginated results would produce incorrect ordering and must not be used.

* **Accessibility of sort dropdown:** The sort dropdown must be fully accessible via keyboard navigation and screen reader compatible. The dropdown must use a native select element or an ARIA-compliant custom dropdown with appropriate role, aria-expanded, and aria-selected attributes. Sort option changes must be announced to screen readers so buyers using assistive technology are aware the results have reordered.

# **SRS — Transactions | Product Page**

**Platform:** The Kit Loop | **User:** Buyer | **Module:** Transactions | **Sub-Module:** Product Page | **Version:** 1.0

---

## **1\. Feature Overview**

The Product Page is the primary decision-making screen for a buyer on The Kit Loop. It is where a buyer arrives after tapping a listing card from the homepage, browse, or search results, and it presents the complete picture of an item — photos, condition, description, price, seller profile, and trust signals — giving the buyer everything they need to decide whether to purchase, save for later, or make an offer.

There are two features within this sub-module:

* **Feature 1 — View Listing Detail**  
* **Feature 2 — Wishlist / Save Item**

---

---

# **Feature 1 — View Listing Detail**

---

## **2\. Story & Story Narrative**

**Story** As a buyer, I want to view the full detail of a listing so I can make an informed purchase decision without needing to physically inspect the item.

**Story Narrative** Case 1 — Informed Purchase: A buyer taps a cricket bat listing from the search results. The listing detail page loads showing six photos — front, back, edges, grip, toe, and a close-up of minor wear. The condition is listed as Good with a description noting "one small surface scuff on the back face, does not affect performance." The brand is Gray-Nicolls, price is £89, seller has a 4.7 star rating with 31 reviews. The buyer has everything they need to make a confident purchase decision without needing to ask the seller a question.

Case 2 — Comparison Shopping: A buyer is deciding between two cricket bats. They open the first listing detail, review it, go back to search results, open the second listing detail, and compare both. They return to the preferred listing and buy. The back navigation preserves their search state so they do not lose their place.

Case 3 — Trust Verification: A buyer unfamiliar with the seller sees the Verified Seller badge and 4.8 star rating on the listing detail. The trust signals give them the confidence to purchase from a seller they have never transacted with before.

Case 4 — Pre-Purchase Query: A buyer wants to ask about the grip size of a tennis racket before committing to purchase. They tap Make Offer / Message Seller on the listing detail page and send a question. The seller responds and the buyer then completes the purchase.

Flow: Buyer taps a listing card from any surface (homepage, search results, direct link) → listing detail page loads → buyer reviews all photos, item details, condition, description, price breakdown, and seller info → buyer decides to Buy Now, Make Offer, Wishlist, or return to browse.

Benefit: Eliminates the primary trust barrier in peer-to-peer transactions — the inability to physically inspect the item — by providing comprehensive item information, verified seller signals, and transparent pricing. A well-executed listing detail page is the single most important driver of purchase conversion on the platform.

---

## **3\. User Flow**

**Preconditions**

* Buyer has tapped a listing card from homepage, search results, or a shared URL  
* The listing is in Live status  
* Buyer may be authenticated or a guest

**Main Flow**

1. Buyer taps a listing card  
2. Platform navigates to /listing/\[listingID\]  
3. Listing detail page loads  
4. Page displays in the following structure:  
   * **Photo gallery** — primary photo displayed full width; thumbnail strip below for additional photos; swipe left/right on mobile to navigate photos  
   * **Condition badge** — New with tags / Like new / Good / Fair shown prominently below the gallery  
   * **Item title** — full listing title displayed  
   * **Price** — asking price in GBP displayed prominently  
   * **Brand** — brand name  
   * **Category** — sport and sub-category (e.g. Cricket › Cricket bat)  
   * **Colour** — item colour  
   * **Description** — full seller-written description  
   * **Parcel size** — shipping parcel size (Small / Medium / Large / Oversized)  
   * **Seller info panel** — seller avatar, username, star rating, review count, Verified Seller badge (if applicable), member since date, total sales count  
   * **Buyer Protection notice** — brief explanation that payment is held in escrow and buyer is covered if item is not as described  
   * **Action buttons** — Buy Now (primary), Make Offer (secondary), Wishlist heart icon  
5. Buyer reviews all sections  
6. Buyer takes one of the following actions:  
   * Taps Buy Now → navigates to /checkout/\[listingID\]  
   * Taps Make Offer → navigates to /messages?listing=\[listingID\]  
   * Taps Wishlist heart → item saved to Favourites (see Feature 2\)  
   * Taps seller username → navigates to seller profile page  
   * Taps browser back → returns to previous page (search results, homepage) with scroll position preserved

**Alternative Flow — Shared Listing URL**

1. Buyer receives a direct link to a listing (e.g. via social media or message)  
2. Buyer opens the URL  
3. Listing detail page loads correctly — no homepage visit required  
4. If buyer is a guest, Buy Now and Make Offer prompt sign up / login; Wishlist also requires authentication

**Alternative Flow — Listing No Longer Available**

1. Buyer taps a listing card or opens a shared URL for a listing that has since been sold, removed, or paused  
2. Page loads with an unavailable state: "This item is no longer available"  
3. CTAs shown: "Browse similar items" (navigates to sport-filtered /search) and "Browse all listings"  
4. No listing detail content is shown for an unavailable listing

**Alternative Flow — Seller's Own Listing**

1. An authenticated user who is also a seller views their own listing detail  
2. Page displays listing detail as buyers see it  
3. Action buttons change: "Edit Listing" replaces Buy Now; Wishlist icon is hidden; Make Offer is hidden  
4. Seller can review how their listing appears to buyers

**Post Conditions**

* Buyer has reviewed the full listing detail  
* No listing data has been altered by viewing — read-only  
* If buyer tapped Buy Now they are on the checkout page for this listing  
* If buyer tapped Make Offer they are on the messages page for this listing  
* If buyer used back navigation they are returned to their previous page with scroll position and filter state preserved  
* Listing view is recorded against the listing for seller analytics (future feature)

---

## **4\. Acceptance Criteria**

**Photo Gallery**

* Primary photo is displayed full width at the top of the listing detail page  
* Buyer can swipe left and right on mobile to navigate between all uploaded photos  
* On desktop, thumbnail strip below primary photo allows click-to-view for each photo  
* Photo count indicator shown (e.g. "1 / 6")  
* Photos load progressively — skeleton shown while loading; primary photo prioritised  
* If only one photo is uploaded, swipe and thumbnail navigation are not shown  
* Tapping a photo on mobile opens a full-screen lightbox view  
* In lightbox, buyer can swipe between photos and pinch to zoom  
* Lightbox is dismissible by tapping outside or tapping × icon

**Item Details**

* All of the following fields are displayed: condition badge, item title, price, brand, category, colour, description, parcel size  
* Condition badge is visually distinct — colour-coded label (e.g. green for Like new, amber for Good)  
* Price is displayed in GBP with two decimal places (e.g. £89.00)  
* Category shown as breadcrumb (e.g. Cricket › Cricket bat)  
* Description is fully displayed — no truncation for descriptions under 500 characters; "Read more" toggle for descriptions over 500 characters  
* All fields populated by the seller are shown; any unpopulated optional fields are hidden — no blank field labels shown

**Seller Info Panel**

* Seller avatar, username, star rating, review count, member since date, and total sales count are displayed  
* Verified Seller badge displayed prominently if seller has been granted verified status by admin  
* Tapping seller username navigates to the seller's public profile page  
* Star rating displayed to one decimal place (e.g. 4.7) with visual star representation  
* If seller has no reviews yet, "No reviews yet" is shown in place of star rating

**Trust & Actions**

* Buyer Protection notice displayed on every listing detail page — non-dismissible  
* Buy Now button is primary CTA — always visible without scrolling on mobile  
* Make Offer button is secondary CTA — visible alongside Buy Now  
* Wishlist heart icon is visible in the top-right corner of the primary photo or near the action buttons  
* Buy Now and Make Offer are hidden and replaced with Edit Listing when the authenticated user is the listing's seller  
* All action buttons and the seller panel are visible without horizontal scrolling on all supported viewports

**Availability & Performance**

* Listing detail page loads within 2 seconds on a standard mobile connection  
* If a listing is sold, removed, or paused, an unavailable state is shown — no listing detail content displayed  
* Direct URL access to /listing/\[listingID\] loads the listing correctly without requiring a prior page visit  
* Listing detail is accessible to guest buyers — Buy Now and Make Offer require authentication; browsing does not

---

## **5\. Business Rules**

* Only listings in Live status are displayed with full listing detail and active action buttons  
* Sold, removed, flagged, and paused listings show the unavailable state — listing content is not shown to buyers  
* Buy Now is always the primary action — it cannot be hidden, deprioritised, or replaced by Make Offer as the primary CTA  
* Buyer Protection notice must appear on every listing detail page without exception — it is not optional and cannot be hidden by the seller  
* A seller viewing their own listing sees Edit Listing instead of Buy Now and Make Offer — a seller cannot purchase their own listing  
* Listing detail content (photos, title, description, price, condition) is exactly as submitted by the seller — the platform does not edit or summarise seller content on the listing detail page  
* If a listing's price is updated by the seller after a buyer has opened the listing detail, the buyer sees the updated price on next page load — the page does not auto-update mid-session  
* The parcel size shown on the listing detail is informational — it is used at checkout to calculate the shipping fee shown in the order summary  
* Seller reviews shown on the seller info panel are buyer reviews only — sellers cannot review buyers on listing detail pages

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Listing ID in URL | Direct URL access | Must match a valid listing ID in the database | If listing ID not found: show unavailable state with Browse Similar CTA; no 404 error page | On page load |
| Listing status check | Page load | Listing must be in Live status to show full detail | If sold / removed / paused: show unavailable state; no detail content displayed | On page load |
| Photo load | Gallery render | Each photo URL must resolve to a valid image | Failed photo: placeholder shown for that slot; other photos unaffected; gallery not broken | On image load |
| Buy Now tap — guest | Action | Buyer must be authenticated to purchase | Sign up / login prompt shown; buyer returned to listing detail after auth | On Buy Now tap |
| Make Offer tap — guest | Action | Buyer must be authenticated to message | Sign up / login prompt shown; buyer returned to listing detail after auth | On Make Offer tap |
| Seller own listing | Action | Authenticated user must not be the listing's seller to see Buy Now / Make Offer | Buy Now and Make Offer replaced with Edit Listing for seller's own listings | On page load — role check |

---

## **7\. Edge Cases**

| Scenario | Expected Behaviour | Handling |
| ----- | ----- | ----- |
| Listing sells while buyer is viewing the detail page | Buyer sees the listing detail normally until they attempt Buy Now; on Buy Now tap: "This item has just been sold — browse similar items" | Availability checked at Buy Now tap time; not on page load to avoid disrupting browsing |
| Listing has only one photo | Gallery renders single photo full width; no thumbnail strip, swipe indicator, or photo count shown | Single photo state handled; no broken gallery UI |
| Listing description is extremely long (e.g. 2000+ characters) | Description truncated at 500 characters with "Read more" toggle; full description revealed on tap | Character-based truncation with toggle; no layout break on long descriptions |
| Seller account is suspended after listing is viewed but before buyer taps Buy Now | On Buy Now tap: listing is paused (suspended seller's listings are hidden); buyer sees unavailable state | Listing status re-checked on Buy Now tap; suspended seller's listing treated as paused |
| Buyer opens listing detail via shared link on a device where they are not logged in | Full listing detail visible as guest; Buy Now and Make Offer prompt login; Wishlist prompts login | Guest access to listing detail is full; actions require auth |
| Listing detail page is opened on a very slow connection | Skeleton loading state shown for gallery and details sections; primary photo prioritised for loading; text content loads before images | Skeleton UI; progressive loading; no blank white page |
| Buyer navigates away and returns via browser back from checkout | Returns to listing detail with full detail intact; no re-fetch required if within session cache window | Browser back navigation uses cached page state within session |
| Listing has no description entered by seller | Description section is hidden — no blank "Description:" label shown | Optional fields hidden if empty; no empty field labels |
| Seller has zero reviews | Seller info panel shows star rating section as "No reviews yet" — no star graphic shown for zero reviews | Zero review state handled; no empty stars or broken rating display |
| Lightbox is opened on a low-end mobile device | Lightbox loads with reduced animation; pinch to zoom may be limited; swipe still functional | Progressive enhancement for lightbox; core photo navigation functional on all devices |

---

## **8\. Exceptional Cases**

* **Listing detail as a landing page for external traffic:** The listing detail page will be linked to from social media posts, WhatsApp messages, and potentially Google Shopping if the platform pursues SEO. The page must render correctly for unauthenticated users and must include appropriate meta tags (Open Graph title, description, and primary photo image) so that shared links preview correctly in messaging apps and social media platforms. This must be implemented from launch — not added later — as retroactive meta tag implementation does not fix previously shared links.

* **Counterfeit or prohibited item listing reaches detail page:** If a listing with prohibited content passes the initial listing submission and reaches Live status before admin moderation, it will be fully visible to buyers on the listing detail page. A post-publish automated content scan and a prominent buyer reporting mechanism directly on the listing detail page ("Report this listing") are both required to catch prohibited content that admin does not review before it goes live.

* **High traffic to a single listing:** If a listing is shared virally (e.g. a sought-after item at a very low price shared on a sports community group), the listing detail page may receive hundreds of concurrent views. The page must be served from a CDN-cached layer for static content with only the availability check and action buttons hitting the live database. A race condition where multiple buyers simultaneously tap Buy Now must be handled gracefully — only one buyer completes the purchase; others receive an "Item just sold" message.

* **Listing detail SEO and discoverability:** For organic search traffic to be a meaningful acquisition channel, listing detail pages must be server-side rendered or statically generated — not purely client-side rendered via JavaScript. A purely client-side rendered listing detail page will not be indexed by Google and will receive zero organic search traffic. This architectural decision must be made before launch and cannot easily be retrofitted.

---

---

# **Feature 2 — Wishlist / Save Item**

---

## **9\. Story & Story Narrative**

**Story** As a buyer, I want to save a listing to my wishlist so I can revisit it later when I am ready to make a purchase decision without having to search for it again.

**Story Narrative** Case 1 — Deferred Purchase: A buyer finds a Like new Wilson tennis racket priced at £95 and is very interested but is waiting for payday in 5 days. They tap the wishlist heart on the listing detail page. The item is saved to their Favourites. Five days later they open their profile, go to Favourite Items, find the racket, and complete the purchase — all without having to search again.

Case 2 — Comparison Shortlisting: A buyer is comparing three cricket bats. They wishlist all three from their respective listing detail pages. They then open their Favourites, view all three side by side, make their decision, and buy the preferred one. The wishlist functions as a shortlist tool for considered purchases.

Case 3 — Item Sells Before Purchase: A buyer wishlists a padel racket. When they return to Favourites two weeks later, the racket has sold. The Favourites page shows the item with a "No longer available" label. The buyer taps "Browse similar" and finds an alternative.

Case 4 — Guest Buyer Prompted to Sign Up: A guest buyer browsing the platform taps the wishlist heart on a listing they like. A sign up prompt appears. The buyer creates an account and the item is automatically saved to their Favourites — they do not need to find the listing again.

Flow: Buyer on listing detail page → taps heart icon → if authenticated: item saved to Favourites instantly with visual confirmation → if guest: sign up / login prompt shown → on authentication: item saved automatically → buyer can access saved item from Profile → Favourite Items at any time.

Benefit: Retains buyer interest beyond a single session, creates a natural re-engagement hook for buyers who are not ready to purchase immediately, reduces the likelihood of a buyer losing an item they intended to buy, and provides sellers with implicit demand signals when a listing accumulates wishlist saves.

---

## **10\. User Flow**

**Preconditions**

* Buyer is on a listing detail page for a Live listing  
* Buyer may be authenticated or a guest

**Main Flow — Authenticated Buyer**

1. Buyer is on the listing detail page  
2. Heart icon is visible — unfilled state indicating item is not currently wishlisted  
3. Buyer taps the heart icon  
4. Heart icon immediately transitions to filled state (visual confirmation)  
5. Toast notification briefly shown: "Saved to Favourites"  
6. Item is saved to buyer's Favourites list  
7. No page navigation occurs — buyer remains on the listing detail page  
8. Buyer can continue reviewing the listing or tap Buy Now / Make Offer

**Main Flow — Remove from Wishlist (Toggle)**

1. Buyer on listing detail page where the item is already in their Favourites  
2. Heart icon is shown in filled state  
3. Buyer taps the filled heart icon  
4. Heart icon immediately transitions to unfilled state  
5. Toast notification briefly shown: "Removed from Favourites"  
6. Item is removed from buyer's Favourites list  
7. No page navigation occurs

**Main Flow — Guest Buyer**

1. Guest buyer is on listing detail page  
2. Guest taps the heart icon  
3. Sign up / login prompt is displayed (modal or bottom sheet)  
4. Guest selects sign up or login method (Email, Google, Apple)  
5. Authentication completes  
6. Item is automatically saved to newly authenticated buyer's Favourites  
7. Buyer is returned to the listing detail page  
8. Heart icon is shown in filled state confirming save

**Alternative Flow — Wishlist from Homepage Featured Listings Card**

1. Buyer is on the homepage viewing the Featured Listings grid  
2. Heart icon is visible on each listing card (top-right corner of card photo)  
3. Buyer taps heart on a listing card without opening the listing detail  
4. If authenticated: item saved to Favourites; heart fills; toast shown  
5. If guest: sign up / login prompt shown; item saved post-authentication  
6. Buyer remains on homepage — no navigation to listing detail

**Alternative Flow — Access Wishlist from Profile**

1. Buyer navigates to /profile  
2. Taps "Favourite Items"  
3. Favourites page loads showing all wishlisted listings in a grid  
4. Each saved listing shows: primary photo, title, price, condition badge, and current availability status  
5. Buyer taps a listing card to open listing detail  
6. If listing is no longer available: card shows "No longer available" label with "Browse similar" CTA  
7. Buyer can remove items from Favourites directly from this page by tapping the filled heart on each card

**Post Conditions**

* Item is saved to the authenticated buyer's Favourites list and accessible from Profile → Favourite Items  
* Heart icon on the listing detail page reflects the current wishlist state — filled if saved, unfilled if not  
* No listing data has been altered by the wishlist action  
* Buyer remains on the listing detail page after wishlisting — no navigation occurs  
* If the item sells or is removed after being wishlisted, it remains in Favourites with a "No longer available" label until the buyer removes it

---

## **11\. Acceptance Criteria**

**Wishlist Action — Listing Detail Page**

* Heart icon is visible on every listing detail page for Live listings  
* Heart icon is in unfilled state if item is not in buyer's Favourites; filled state if it is  
* Tapping the unfilled heart saves the item to Favourites and transitions the heart to filled state immediately  
* Tapping the filled heart removes the item from Favourites and transitions the heart to unfilled state immediately  
* State transition is immediate — no loading state or delay visible to buyer  
* Toast notification "Saved to Favourites" is shown for 2 seconds on save; "Removed from Favourites" shown on remove  
* No page navigation occurs on wishlist action — buyer remains on listing detail  
* Wishlist action is not available on a seller's own listing — heart icon hidden for seller viewing their own listing

**Wishlist Action — Guest Buyer**

* Guest tapping heart icon sees a sign up / login prompt  
* Prompt does not navigate away from the listing detail — shown as a modal or bottom sheet  
* After successful authentication, item is saved to Favourites automatically  
* Buyer is returned to the same listing detail page post-authentication  
* Heart icon shown in filled state after automatic save

**Wishlist Action — Homepage Card**

* Heart icon is visible on Featured Listings cards on the homepage  
* Tapping heart on a homepage card saves item without requiring listing detail to be opened  
* Same authentication prompt applies for guest buyers  
* Toast confirmation shown on homepage without navigating away

**Favourites Page**

* All wishlisted listings accessible from Profile → Favourite Items  
* Each saved listing displayed as a card: primary photo, title, price, condition badge  
* Listings that are sold or removed shown with "No longer available" label — not silently removed from Favourites  
* Buyer can remove any item from Favourites by tapping the filled heart on the Favourites page  
* Tapping an available listing card navigates to listing detail page  
* Tapping "Browse similar" on an unavailable listing navigates to the sport-filtered /search for that listing's sport

**General**

* Wishlist state is consistent across all surfaces — if saved from search results card, it shows as saved on listing detail; if removed from Favourites, it shows as unsaved on listing detail  
* Wishlist requires authentication — guest buyers are prompted to sign up before saving  
* Maximum number of items in Favourites is not restricted in v1  
* Wishlist is personal — only the buyer can see their own Favourites; it is not public

---

## **12\. Business Rules**

* Wishlist is only available to authenticated buyers — guest buyers must sign up or log in before an item can be saved  
* A buyer cannot wishlist their own listing — the heart icon is hidden on the seller's own listing detail view  
* A single buyer can save the same listing only once — tapping heart on an already-saved listing removes it (toggle behaviour)  
* A saved listing remains in Favourites even after it is sold, removed, or paused — it is not automatically deleted from Favourites on status change; it is labelled "No longer available" instead  
* Wishlist saves do not reserve or hold inventory — another buyer can purchase a wishlisted item at any time  
* Wishlist is private — a buyer's Favourites list is not visible to sellers, other buyers, or admins in the buyer-facing product; admin may have back-end visibility for analytics and fraud purposes  
* The heart icon must reflect real-time wishlist state — if a buyer has the same listing open in two browser tabs and saves in one, the other tab shows the filled state on next interaction  
* Wishlist action does not trigger any notification to the seller in v1 — seller wishlist demand signals are a future analytics feature

---

## **13\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Heart icon tap — guest | Authentication check | Buyer must be authenticated | Sign up / login prompt shown; item saved post-auth | On heart tap |
| Heart icon — seller's own listing | Ownership check | Buyer must not be the listing's seller | Heart icon hidden for seller's own listing; no validation message needed | On page load |
| Wishlist save — duplicate | Duplicate check | Buyer cannot save same listing twice | If already saved: tapping heart removes item (toggle); no error message | On heart tap |
| Listing availability | Favourites page display | Listing status checked when Favourites page loads | Unavailable listings shown with "No longer available" label; not silently removed | On Favourites page load |
| Browse similar CTA | Navigation | Listing must have a sport category assigned | If no sport assigned (data anomaly): CTA navigates to /search with no sport filter | On CTA tap |

---

## **14\. Edge Cases**

| Scenario | Expected Behaviour | Handling |
| ----- | ----- | ----- |
| Buyer saves an item and it sells before they return to buy it | Item remains in Favourites with "No longer available" label; "Browse similar" CTA shown | Status checked on Favourites page load; label applied dynamically |
| Buyer taps heart rapidly multiple times | First tap fires save or remove; subsequent taps within 300ms debounce window are ignored | Debounce applied to heart tap; single action fires per tap sequence |
| Buyer wishlists a listing on mobile and checks Favourites on desktop | Item appears in Favourites on desktop — wishlist is account-based, not device-based | Wishlist stored server-side against user account; accessible on all devices |
| Buyer has hundreds of items in Favourites | Favourites page paginates — shows 20 items per page with load more; no performance degradation | Server-side pagination on Favourites; no flat list of all items |
| Buyer removes a listing from Favourites from the Favourites page while also viewing it on listing detail in another tab | Heart icon reflects unfilled state on next interaction in the listing detail tab | Heart state re-checked on tab focus or next interaction; stale state corrected |
| Guest buyer taps heart, is prompted to sign up, but abandons sign up | Item is not saved — authentication is required; buyer returned to listing detail; heart remains unfilled | Incomplete auth does not save the item; no partial state created |
| Wishlist service is temporarily unavailable | Heart tap shows: "Unable to save right now — please try again"; heart state does not change | Service error caught; graceful inline error; no state change on failure |
| Buyer tries to wishlist a listing from a sport that is subsequently removed by admin | Item remains in Favourites; "Browse similar" CTA on unavailable label navigates to /search with no sport filter since sport no longer exists | Graceful handling of removed sport in CTA; fallback to /search |
| Seller updates the price of a wishlisted listing | Updated price is shown on next Favourites page load — not updated in real time in a cached Favourites view | Price on Favourites page is fetched live on page load; reflects current listing price |
| Admin removes a listing that is in many buyers' Favourites | All buyers see the listing with "No longer available" label in their Favourites on next Favourites page load | Status change propagates to all Favourites displays on next load; no buyer-specific cleanup required |

---

## **15\. Exceptional Cases**

* **Wishlist as a demand signal for sellers:** In the current version, sellers have no visibility into how many buyers have wishlisted their listing. This data is commercially valuable — a listing with 50 wishlist saves but no purchases may indicate the price is too high. A seller-facing wishlist demand signal (e.g. "12 people have saved this listing") should be introduced as part of seller analytics in a future release. The data is already being captured server-side; surfacing it to sellers is a product decision, not a technical one.

* **Wishlist notification — price drop:** A buyer who has wishlisted an item and is waiting for the price to drop has no mechanism to be notified if the seller reduces the price. A price drop alert feature — notifying wishlisting buyers by push notification or email when a saved listing's price decreases — is one of the highest-value re-engagement tools available to the platform and should be prioritised in the next feature cycle after wishlist is launched.

* **Wishlist data on account deletion:** If a buyer deletes their account, their Favourites list should be deleted as part of the account data removal process. However, the anonymised aggregate wishlist count per listing (used for future seller analytics) should be retained. The data deletion policy must define exactly which wishlist data is personal (deleted) and which is aggregate (retained) before account deletion is implemented.

* **Wishlist used for fraud detection:** If a user account saves hundreds of listings in a very short period, this behaviour pattern could indicate automated scraping or price monitoring fraud. An anomaly detection rule — flagging accounts with unusually high wishlist activity — should be added to the fraud monitoring layer. The threshold should be defined with the trust and safety team before the wishlist feature is live at scale.

* **Wishlist state on shared devices:** If two buyers share a device and the same browser session (e.g. family members), wishlisting reflects the currently authenticated user's account. If one user logs out and another logs in on the same device, the heart icon state updates to reflect the new user's Favourites. This is correct behaviour but may be confusing to shared-device users. A brief "Signed in as \[username\]" indicator near the wishlist action could help clarify whose account the save is being made to.

# **SRS — Transactions | Make Offer**

**Platform:** The Kit Loop | **User:** Buyer | **Module:** Transactions | **Sub-Module:** Make Offer | **Version:** 1.0

---

## **1\. Feature Overview**

The Make Offer / Send Message feature enables a buyer to open a direct line of communication with a seller about a specific listing — either to negotiate a price, ask a question about the item, or clarify details before committing to a purchase. The conversation is tied to the listing and accessible via the /messages page. It is the primary negotiation and pre-purchase communication tool on the platform, keeping all buyer–seller interaction within The Kit Loop rather than moving it off-platform.

---

## **2\. Story & Story Narrative**

**Story** As a buyer, I want to send an offer or message to a seller so I can negotiate a fair price or get more information about an item before deciding to purchase.

**Story Narrative** Case 1 — Price Negotiation: A buyer finds a Bullpadel Vertex 03 Padel Racket listed at £195. They feel £170 is a fairer price based on the condition description. Rather than walking away or purchasing at full price, they tap Make Offer on the listing detail page, type their offer of £170 with a short message explaining their reasoning, and send it. The seller receives a notification, reviews the offer, and responds with a counter of £180. The buyer accepts and proceeds to checkout at the agreed price.

Case 2 — Pre-Purchase Question: A buyer wants to know the exact grip size of a tennis racket before purchasing. They tap Make Offer / Message and send a question: "Hi — is this the 4 3/8 grip size?" The seller confirms. The buyer is satisfied and proceeds to buy at the listed price.

Case 3 — Off-Platform Prevention: A seller attempts to include their phone number in a message reply to conduct the transaction outside the platform. The system detects and blocks the contact detail, protecting both parties and ensuring the transaction remains within the buyer protection framework.

Flow: Buyer on listing detail page → taps Make Offer → navigates to /messages?listing=\[listingID\] → message thread opens for this listing → buyer types offer amount and/or message → sends → seller notified → seller responds → buyer reviews response → proceeds to checkout or continues negotiating.

Benefit: Increases sell-through rate by enabling price negotiation on items that buyers find slightly overpriced, reduces listing abandonment caused by unanswered pre-purchase questions, keeps all buyer–seller communication within the platform's trust and safety framework, and supports the buyer protection guarantee by ensuring agreed prices are transacted through the escrow system.

---

## **3\. User Flow**

**Preconditions**

* Buyer is authenticated — Make Offer requires a logged-in account  
* Buyer is on the listing detail page for a Live listing  
* The listing does not belong to the authenticated buyer — a seller cannot message themselves  
* The listing has not already been sold

**Main Flow — Send an Offer**

1. Buyer taps "Make Offer" on the listing detail page  
2. If buyer is not authenticated: sign up / login prompt shown; buyer returned to listing detail after auth  
3. If authenticated: buyer navigated to /messages?listing=\[listingID\]  
4. Messages page loads showing the listing summary at the top of the thread: primary photo, title, condition, and asking price  
5. Message input area is visible at the bottom of the screen  
6. Offer input field is available — buyer enters their offer amount in GBP  
7. Message text area is available — buyer types an optional accompanying message  
8. Buyer reviews offer amount and message  
9. Buyer taps Send  
10. Offer and message are sent to the seller  
11. Seller receives an in-app notification and email: "You have a new offer on \[listing title\]"  
12. Buyer sees their sent offer displayed in the message thread with timestamp  
13. Buyer waits for seller response

**Main Flow — Send a Message (No Offer Amount)**

1. Buyer taps Make Offer on the listing detail page  
2. Buyer navigated to /messages?listing=\[listingID\]  
3. Messages page loads with listing summary  
4. Buyer leaves offer amount field blank  
5. Buyer types a question or message in the text area (e.g. "Hi — what grip size is this racket?")  
6. Buyer taps Send  
7. Message sent to seller  
8. Seller receives notification  
9. Buyer sees sent message in the thread

**Main Flow — Continue a Conversation**

1. Buyer has an existing message thread with a seller for a specific listing  
2. Buyer receives a seller response notification  
3. Buyer opens /messages → selects the relevant thread  
4. Thread loads showing full conversation history for this listing  
5. Buyer reads seller response  
6. Buyer types a reply and taps Send  
7. Conversation continues until buyer proceeds to checkout or abandons

**Main Flow — Proceed to Checkout from Messages**

1. Buyer and seller have agreed on a price via the message thread  
2. Buyer taps "Buy Now" or a checkout CTA visible within the messages page for this listing  
3. Buyer navigated to /checkout/\[listingID\]  
4. Checkout proceeds at the listed price — agreed price from negotiation is not automatically applied in v1; buyer proceeds at listed price or seller updates listing price before checkout

**Alternative Flow — Seller Declines Offer**

1. Seller responds to buyer's offer with a decline or counter-offer  
2. Buyer receives notification of seller response  
3. Buyer opens thread and reads response  
4. Buyer decides to:  
   * Accept counter-offer and proceed to checkout at listed/updated price  
   * Make a new counter-offer by typing a new offer amount  
   * Walk away — no further action required; thread remains in messages history

**Alternative Flow — No Response from Seller**

1. Buyer sends an offer or message  
2. Seller does not respond within a reasonable period  
3. Buyer can send a follow-up message in the same thread  
4. If seller remains unresponsive, buyer can choose to buy at listed price or find an alternative listing  
5. Platform does not force seller response in v1

**Alternative Flow — Access Messages Directly**

1. Buyer navigates to /messages directly (not from a listing detail)  
2. All existing message threads are listed — each thread shows: listing thumbnail, listing title, last message preview, timestamp, and unread indicator  
3. Buyer selects a thread to open it  
4. Full conversation history loads for that listing

**Post Conditions**

* Buyer's offer or message has been delivered to the seller  
* Seller has received an in-app and email notification  
* Message thread for this listing is accessible from /messages at any time  
* Buyer's sent message is visible in the thread with a sent timestamp  
* No transaction has been initiated — Make Offer is a pre-purchase communication tool only; no payment is taken and no escrow is created by sending an offer  
* Thread remains in buyer's messages history regardless of whether a purchase is completed

---

## **4\. Acceptance Criteria**

**Access & Authentication**

* Make Offer button is visible on every Live listing detail page that does not belong to the authenticated buyer  
* Make Offer button is hidden on the buyer's own listings  
* Tapping Make Offer when not authenticated shows a sign up / login prompt; buyer is returned to the listing detail after auth  
* After authentication, buyer is automatically navigated to /messages?listing=\[listingID\] — they do not need to tap Make Offer again

**Messages Page — Thread View**

* Messages page at /messages shows all existing threads for the authenticated buyer listed in reverse chronological order (most recent activity first)  
* Each thread in the list shows: listing thumbnail, listing title, seller username, last message preview (max 60 characters), timestamp of last message, and unread message indicator  
* Unread threads are visually differentiated from read threads (e.g. bold text, dot indicator)  
* Tapping a thread opens the full conversation for that listing  
* Thread list is paginated or infinitely scrollable — no hard limit on number of threads shown

**Messages Page — Conversation View**

* Listing summary shown at the top of the conversation: primary photo, title, condition badge, and asking price  
* "View Listing" link on the listing summary navigates back to the listing detail page  
* Full conversation history is displayed in chronological order — oldest messages at top, newest at bottom  
* Buyer's sent messages shown on the right side of the thread; seller's messages on the left  
* Each message shows: message content, offer amount (if included), sender username, and timestamp  
* Offer amounts are visually distinct from plain messages — displayed in a highlighted format (e.g. "Offer: £170")  
* Message input area is pinned to the bottom of the screen  
* Offer amount input field is available above the message text area — optional for plain messages  
* Send button is active when either an offer amount or message text is present — disabled when both are empty

**Sending a Message**

* Buyer can send a plain text message without an offer amount  
* Buyer can send an offer amount with or without an accompanying text message  
* Offer amount must be a positive numeric value in GBP  
* Message text has a maximum character limit of 500 characters  
* Character count shown as buyer approaches the limit (shown from 400 characters)  
* Send button tapped → message appears in thread immediately → seller notification triggered  
* Buyer can send multiple messages in a thread without waiting for seller response

**Off-Platform Contact Prevention**

* System scans outgoing messages for phone numbers, email addresses, and external URLs  
* If detected: message is blocked; buyer shown inline warning: "For your protection, contact details and external links cannot be shared in messages. Please keep all communication and transactions on The Kit Loop."  
* Buyer can edit and resend the message without the blocked content

**Notifications**

* Seller receives an in-app notification and email within 2 minutes of buyer sending a message  
* Buyer receives an in-app notification and email when seller replies  
* Notification includes: listing title, sender username, and message preview (first 60 characters)  
* Buyer can access the relevant thread directly by tapping the notification

**General**

* A buyer can have multiple concurrent message threads with different sellers for different listings  
* A buyer can have only one message thread per listing per seller — if a thread already exists for that listing, tapping Make Offer on the listing detail opens the existing thread rather than creating a new one  
* Messages are not editable or deletable by the buyer after sending in v1  
* The messages page is accessible only to authenticated buyers

---

## **5\. Business Rules**

* Make Offer is a communication feature only — it does not create a binding agreement, initiate a payment, or reserve the listing for the buyer  
* A listing can receive offers from multiple buyers simultaneously — the seller is free to respond to any or all  
* Sending an offer does not prevent another buyer from purchasing the listing at full price before the seller responds — no inventory hold is created by an offer  
* The agreed offer price from a negotiation is not automatically applied at checkout in v1 — the seller must update the listing price before the buyer checks out, or the buyer pays the listed price; agreed price enforcement is a future feature  
* All buyer–seller communication must remain within the platform — off-platform contact details are blocked at the message send layer  
* Admin has read access to all message threads for dispute resolution and fraud investigation purposes — buyers and sellers are made aware of this in the platform's terms of service  
* A seller who is suspended or banned cannot receive or send messages — if a buyer attempts to message a suspended seller's listing, they are shown: "This seller is currently unavailable"  
* A buyer cannot message a seller about a listing that has been sold, removed, or paused — Make Offer button is hidden on unavailable listings  
* Messages are retained in the system permanently — they cannot be deleted by buyers or sellers in v1; they form part of the dispute evidence record if a transaction goes to dispute

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Offer Amount | Send offer | Optional; if entered must be numeric, positive, max £9,999, two decimal places | "Please enter a valid offer amount in GBP" | On send tap |
| Offer Amount | Send offer | Must be greater than £0.00 if entered | "Offer amount must be greater than £0" | On send tap |
| Offer Amount — format | Send offer | Numeric only; no letters or special characters except decimal point | Non-numeric characters blocked silently on input | On input |
| Message Text | Send message | Optional if offer amount is present; required if no offer amount | "Please enter a message or an offer amount before sending" | On send tap |
| Message Text | Send message | Maximum 500 characters | Character counter shown from 400 characters; input blocked at 500; "Message cannot exceed 500 characters" | On input |
| Message Text | Off-platform content | Must not contain phone numbers, email addresses, or external URLs | "For your protection, contact details and external links cannot be shared in messages" — message blocked; buyer prompted to edit | On send tap — content scan |
| Send button state | UX | Enabled only when at least one of: offer amount or message text is present | Send button disabled and greyed out when both fields are empty | On input change |
| Listing availability | Access | Listing must be in Live status for Make Offer to be available | Make Offer hidden on sold / removed / paused listings | On listing detail page load |
| Authentication | Access | Buyer must be authenticated | Sign up / login prompt shown; redirected to listing detail after auth | On Make Offer tap |
| Own listing check | Access | Buyer must not be the listing's seller | Make Offer hidden for seller's own listings | On listing detail page load |

---

## **7\. Post Conditions (Summary)**

* Buyer's offer or message is delivered to the seller and visible in the shared thread at /messages  
* Seller has received an in-app and email notification within 2 minutes  
* No payment, escrow, or inventory hold has been created  
* Thread is permanently accessible from the buyer's /messages page  
* If the conversation results in a purchase, the order record references the listing ID — the message thread is retained as context and is available to admin if the order goes to dispute  
* Off-platform contact attempts have been blocked and the buyer has been notified of the reason

# **SRS — Transactions | Checkout**

**Platform:** The Kit Loop | **User:** Buyer | **Module:** Transactions | **Sub-Module:** Checkout | **Version:** 1.0

---

## **1\. Feature Overview**

The Checkout sub-module is the final step in the buyer's purchase journey on The Kit Loop. It brings together four critical functions in a single, secure page: a transparent order summary showing all costs before payment; a delivery address form with estimated delivery dates; a payment method selection powered by Stripe; and an active buyer protection notice confirming escrow is in place. All four features work together to give the buyer complete confidence before they commit to payment. A failed or confusing checkout is the single highest drop-off risk in any e-commerce flow — this sub-module must be frictionless, transparent, and trustworthy.

There are four features within this sub-module:

* **Feature 1 — Order Summary**  
* **Feature 2 — Delivery Address Entry**  
* **Feature 3 — Payment Method Selection**  
* **Feature 4 — Buyer Protection Active**

---

---

# **Feature 1 — Order Summary**

---

## **2\. Story & Story Narrative**

**Story** As a buyer, I want to see a clear breakdown of everything I am paying before I confirm my purchase so there are no surprises at payment.

**Story Narrative** Buyer taps Buy Now on a listing → arrives at checkout → immediately sees a full cost breakdown: item price, Royal Mail shipping fee, and buyer protection fee — with the total clearly shown. They can review the item details, confirm the costs are as expected, and proceed to payment with full confidence. No hidden fees appear after this point.

Benefit: Eliminates checkout abandonment caused by unexpected costs, builds payment confidence, and ensures the buyer understands exactly what each charge is before committing.

---

## **3\. User Flow**

**Preconditions**

* Buyer is authenticated  
* Buyer has tapped Buy Now on a Live listing  
* Listing has not been purchased by another buyer

**Main Flow**

1. Buyer taps Buy Now on listing detail page  
2. Browser navigates to /checkout/\[listingID\]  
3. Checkout page loads — secure payment header shown (lock icon \+ "Secure payment")  
4. Order Summary panel displays:  
   * Listing thumbnail photo  
   * Item title  
   * Condition and seller username  
   * Item price (e.g. £195.00)  
   * Shipping fee — Royal Mail Tracked (e.g. £3.50) based on seller's selected parcel size  
   * Buyer Protection fee — 5% of item price \+ flat minimum (e.g. £10.45)  
   * Total — sum of all three lines shown prominently in green (e.g. £208.95)  
5. Buyer reviews all line items  
6. Buyer proceeds to complete delivery address and payment

**Post Conditions**

* Buyer has seen and reviewed the full cost breakdown before any payment is taken  
* Total amount displayed matches exactly what will be charged at payment  
* No additional charges are applied after this screen

---

## **4\. Acceptance Criteria**

* Order Summary is the first panel visible on the checkout page — buyer does not need to scroll to see it  
* Listing thumbnail, title, condition, and seller username are displayed  
* Three cost lines are shown separately: item price, shipping fee, buyer protection fee  
* Shipping fee reflects the parcel size set by the seller on their listing  
* Buyer protection fee is calculated as 5% of item price plus the flat minimum fee  
* Total is shown as the sum of all three lines in a visually prominent format  
* All monetary values shown in GBP with two decimal places  
* Order Summary is read-only — buyer cannot edit item or price from this screen  
* If the listing is sold or removed between Buy Now tap and checkout load, buyer is shown "This item is no longer available" and redirected away from checkout

---

## **5\. Business Rules**

* Shipping fee is determined by the parcel size the seller selected at listing creation — buyer cannot change or negotiate the shipping fee at checkout  
* Buyer protection fee is always 5% of item price plus the platform flat minimum — it is non-negotiable and non-removable  
* The total shown in the Order Summary is the exact amount that will be charged — no additional taxes, surcharges, or fees are applied after this screen in v1  
* If the seller updates the listing price after the buyer has opened checkout but before payment is confirmed, the buyer is shown the price that was in place when they tapped Buy Now — the checkout price is locked at session start  
* A buyer cannot modify the listed item quantity at checkout — all listings on The Kit Loop are single-unit items

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Listing availability | Checkout page load | Listing must be in Live status | "This item is no longer available" — redirect away from checkout with Browse Similar CTA | On page load |
| Buyer authentication | Checkout access | Buyer must be authenticated | Redirect to sign up / login; returned to checkout after auth | On page load |
| Price integrity | Session check | Checkout price locked at session start | If price changed mid-session by seller, buyer completes at locked price; no mid-session update | On payment confirm |

---

---

# **Feature 2 — Delivery Address Entry**

---

## **7\. Story & Story Narrative**

**Story** As a buyer, I want to enter my delivery address and see an estimated delivery date so I know when to expect my item and can plan accordingly.

**Story Narrative** Buyer fills in their delivery address on the checkout page and immediately sees an estimated delivery window based on Royal Mail Tracked timelines. They can confirm the address is correct before paying — reducing the risk of items being sent to an incorrect or outdated address.

Benefit: Ensures items reach the right address, removes delivery uncertainty before payment, and reduces post-purchase support queries about delivery timing.

---

## **8\. User Flow**

**Preconditions**

* Buyer is on the checkout page  
* Order Summary is visible above the delivery address section

**Main Flow**

1. Buyer scrolls to the Delivery Address section below the Order Summary  
2. Address form displays the following fields:  
   * Address Line 1 (required)  
   * Address Line 2 (optional — flat or apartment)  
   * City (required)  
   * Postcode (required)  
3. Buyer fills in all required fields  
4. As buyer completes the Postcode field, estimated delivery window is displayed (e.g. "Estimated delivery: Apr 23 – Apr 27")  
5. Buyer reviews address and delivery estimate  
6. Buyer proceeds to payment method selection

**Alternative Flow — Returning Buyer with Saved Address**

1. Returning buyer opens checkout  
2. Previously used delivery address is pre-populated in the address fields  
3. Buyer reviews pre-populated address — edits if needed or confirms as correct  
4. Buyer proceeds to payment

**Post Conditions**

* Delivery address is confirmed and stored against the order record  
* Estimated delivery window is displayed and acknowledged before payment  
* Address is not editable after payment is confirmed — buyer must contact support for address changes post-payment

---

## **9\. Acceptance Criteria**

* Delivery Address section is displayed below the Order Summary on the checkout page  
* Form fields shown: Address Line 1 (required), Address Line 2 (optional), City (required), Postcode (required)  
* Placeholder text shown in each field to guide buyer input  
* Estimated delivery window is displayed after Postcode is entered — based on Royal Mail Tracked standard timelines  
* Estimated delivery is shown in day range format (e.g. "Apr 23 – Apr 27")  
* Returning buyers have their previously used address pre-populated — editable before confirming  
* Required fields are validated before buyer can proceed to payment — empty required fields prevent progression  
* Address Line 2 is clearly labelled as optional — no error shown if left blank  
* Address fields accept standard UK address formats including alphanumeric postcodes

---

## **10\. Business Rules**

* Delivery address is collected at checkout and stored against the order — it is shared with the seller so they can dispatch the item  
* Address is locked after payment confirmation — changes post-payment require manual support intervention  
* The platform delivers to UK addresses only in v1 — international addresses are not supported  
* Estimated delivery window is based on Royal Mail Tracked standard transit times — it is an estimate only and is not a guaranteed delivery date  
* Returning buyer's saved address is pre-populated as a convenience — buyer is responsible for confirming it is correct before payment  
* Address data is handled in accordance with GDPR — stored securely, shared only with the seller for fulfilment purposes, and not used for marketing without consent

---

## **11\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Address Line 1 | Required field | Must not be empty, max 100 characters | "Please enter your address" | On proceed to payment tap |
| Address Line 2 | Optional field | Max 100 characters | No error if empty | On input |
| City | Required field | Must not be empty, max 60 characters, letters only | "Please enter your city" | On proceed to payment tap |
| Postcode | Required field | Must not be empty, must match UK postcode format (e.g. SW1A 1AA) | "Please enter a valid UK postcode" | On input blur and on proceed to payment tap |
| International address | Restriction | UK postcodes only in v1 | If non-UK format detected: "We currently only deliver within the UK" | On postcode input blur |

---

---

# **Feature 3 — Payment Method Selection**

---

## **12\. Story & Story Narrative**

**Story** As a buyer, I want to choose how I pay so checkout is fast and I can use my preferred payment method.

**Story Narrative** Buyer reaches the payment section of checkout and is presented with multiple payment options — Apple Pay or Google Pay for one-tap mobile payment, a saved card for returning buyers, or a new card entry for first-time buyers. They select their preferred method and tap Pay. Stripe processes the payment securely. The buyer never needs to leave the checkout page to complete the transaction.

Benefit: Reduces checkout friction and abandonment by supporting fast one-tap mobile payments alongside traditional card entry, and leverages Stripe's secure, trusted payment infrastructure for all transactions.

---

## **13\. User Flow**

**Preconditions**

* Buyer has completed the delivery address section  
* Checkout page is loaded and Order Summary is confirmed

**Main Flow — Pay with Saved Card**

1. Payment Method panel loads below the delivery address section  
2. Panel header shows "Payment Method" with "Powered by Stripe" label and lock icon  
3. Payment options displayed:  
   * Apple Pay button (shown on compatible iOS / Safari devices)  
   * Google Pay button (shown on compatible Android / Chrome devices)  
   * Saved card — displayed with card brand logo, last 4 digits, and expiry date; selected by default if present (e.g. Visa ••••4242 Expires 12/26)  
   * "Use a different card" option to enter new card details  
4. Buyer confirms saved card is selected (green tick indicator)  
5. Buyer taps "Pay £\[total\]" button  
6. Stripe processes the payment  
7. On success: buyer navigated to payment confirmation screen  
8. On failure: inline error shown; buyer prompted to retry or use a different method

**Main Flow — Pay with Apple Pay or Google Pay**

1. Buyer taps Apple Pay or Google Pay button  
2. Native payment sheet appears (device-level authentication — Face ID, Touch ID, or fingerprint)  
3. Buyer authenticates  
4. Payment processed by Stripe  
5. On success: buyer navigated to payment confirmation screen

**Main Flow — Pay with New Card**

1. Buyer taps "Use a different card"  
2. New card entry form expands: card number, expiry date, CVV, and name on card  
3. Buyer fills in card details  
4. Option shown to save card for future purchases (checkbox — opt-in)  
5. Buyer taps "Pay £\[total\]"  
6. Stripe processes the payment  
7. On success: buyer navigated to payment confirmation screen

**Post Conditions**

* Payment has been successfully processed by Stripe  
* Funds are held in escrow — not released to seller  
* Buyer is navigated to the payment confirmation screen  
* Order record is created with payment status: Held in Escrow  
* Seller receives notification that their item has been purchased and should be dispatched

---

## **14\. Acceptance Criteria**

* Payment Method panel is displayed below the Delivery Address section on the checkout page  
* "Powered by Stripe" label and SSL encrypted notice are displayed on the payment panel  
* Apple Pay button is shown on compatible iOS and Safari devices only  
* Google Pay button is shown on compatible Android and Chrome devices only  
* If the buyer has a saved card, it is displayed with card brand logo, last 4 digits, expiry date, and a selected indicator  
* "Use a different card" option is always available regardless of saved card presence  
* New card entry form accepts: card number, expiry (MM/YY), CVV, and name on card  
* Buyer can opt in to save a new card for future purchases — opt-in checkbox; not pre-ticked  
* "Pay £\[total\]" button displays the exact total from the Order Summary  
* Pay button is disabled until a payment method is selected and delivery address is complete  
* On successful payment: buyer navigated to /payment-success screen within 3 seconds  
* On payment failure: inline error shown below the Pay button; buyer can retry without re-entering address  
* Payment is processed entirely within the checkout page — no redirect to an external payment page

---

## **15\. Business Rules**

* All payments are processed through Stripe — no other payment processor is used in v1  
* Payment is held in escrow immediately on success — funds are not released to the seller until the buyer confirms delivery or the dispute window expires  
* Apple Pay and Google Pay are shown only on compatible devices — no error shown on incompatible devices; standard card options are shown instead  
* A saved card is pre-selected by default if one exists — buyer can deselect and choose an alternative  
* Saving a new card is opt-in only — the checkbox must not be pre-ticked; buyer explicitly chooses to save  
* The Pay button total must exactly match the Order Summary total — any discrepancy is a critical bug  
* If payment fails, the listing remains Live and available — no inventory hold is applied on a failed payment  
* Stripe's 3D Secure authentication is applied where required by the buyer's card issuer — the platform cannot opt out of 3DS on behalf of the buyer  
* Card details are never stored by The Kit Loop directly — all card data is handled and tokenised by Stripe in compliance with PCI DSS

---

## **16\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Card Number | New card entry | 16 digits, numeric, Luhn algorithm valid | "Please enter a valid card number" | On input blur and on pay tap |
| Expiry Date | New card entry | MM/YY format, must be a future date | "Please enter a valid expiry date" / "This card has expired" | On input blur and on pay tap |
| CVV | New card entry | 3 digits (4 for Amex), numeric | "Please enter a valid CVV" | On pay tap |
| Name on Card | New card entry | Required, letters and spaces only, max 60 characters | "Please enter the name as it appears on your card" | On pay tap |
| Payment method selection | Pay button | A payment method must be selected | Pay button disabled until method selected | On render |
| Pay button — address check | Pay tap | Delivery address must be complete before payment | Pay button disabled if required address fields are incomplete | On render and on pay tap |
| Stripe payment response | Payment processing | Stripe returns success or failure | On failure: inline error below Pay button — Stripe error message displayed (e.g. "Your card was declined — please try a different card") | On Stripe response |

---

---

# **Feature 4 — Buyer Protection Active**

---

## **17\. Story & Story Narrative**

**Story** As a buyer, I want to know my payment is protected so I can purchase with confidence even from sellers I have never transacted with before.

**Story Narrative** Before the buyer pays, a clear Buyer Protection notice is displayed on the checkout page explaining that their payment will be held in escrow until they confirm delivery — and that they are covered if the item is not as described. This single trust signal removes the primary anxiety of peer-to-peer purchasing and is the reason buyers are willing to pay the 5% buyer protection fee.

Benefit: Eliminates the trust barrier inherent in peer-to-peer marketplaces, makes the buyer protection fee feel like a value-add rather than a cost, and reduces purchase abandonment from buyers who are uncertain about transacting with unknown sellers.

---

## **18\. User Flow**

**Preconditions**

* Buyer is on the checkout page  
* Order Summary is visible

**Main Flow**

1. Buyer is reviewing the checkout page  
2. Buyer Protection notice is displayed within or directly below the Order Summary panel  
3. Notice shows:  
   * Shield icon in green  
   * Heading: "Buyer Protection Active"  
   * Body: "Your payment is held securely in escrow until you confirm delivery. If the item is not as described, you're covered."  
4. Buyer reads the notice and is reassured  
5. Buyer proceeds to complete delivery address and payment  
6. After payment is confirmed, escrow is activated — funds held until buyer confirms delivery or 48-hour dispute window is used

**Post Conditions**

* Buyer has been explicitly informed that escrow is active before payment  
* Payment is held in escrow immediately on successful payment confirmation  
* Funds are not released to the seller until buyer confirms delivery on the order detail page  
* If buyer raises a dispute within 48 hours of delivery, escrow remains held pending admin resolution  
* If buyer does not confirm delivery and does not raise a dispute within the platform's confirmation window, funds are automatically released to the seller

---

## **19\. Acceptance Criteria**

* Buyer Protection notice is displayed on every checkout page — it cannot be hidden, dismissed, or removed  
* Notice is positioned within or directly adjacent to the Order Summary — visible without scrolling on standard mobile viewport  
* Notice includes: shield icon, "Buyer Protection Active" heading, and a plain-language explanation of escrow and coverage  
* Notice is informational only — it requires no buyer interaction or acknowledgement checkbox  
* Buyer Protection fee line in the Order Summary links conceptually to the notice — buyer understands the fee funds the protection  
* After successful payment, order record is created with escrow status: Held  
* Buyer can view escrow status on the My Orders page for each active order  
* Funds are released to seller automatically if buyer does not confirm or dispute within the defined window  
* If buyer raises a dispute within 48 hours of delivery confirmation, escrow remains held pending admin ruling

---

## **20\. Business Rules**

* Buyer protection and escrow are applied to every transaction on The Kit Loop without exception — there is no opt-out for buyers or sellers  
* The buyer protection fee (5% \+ flat minimum) is collected at checkout and retained by the platform — it is refunded to the buyer only if a dispute is ruled in the buyer's favour  
* Escrow is activated immediately on successful payment — funds are held by Stripe and not accessible to the seller until release conditions are met  
* Release conditions for escrow: buyer confirms delivery on the platform, or the buyer confirmation window expires without a dispute being raised  
* Dispute window is 48 hours from the point the buyer marks the item as delivered or the carrier confirms delivery — whichever is earlier  
* If a dispute is raised within the 48-hour window, escrow remains held until admin makes a ruling  
* Shipping fee (£3.50) is non-refundable in the event of a dispute ruling in the buyer's favour — item price and buyer protection fee are refunded; shipping fee is not, unless admin overrides  
* The Buyer Protection notice wording is platform-controlled — sellers cannot edit or remove it from any buyer-facing surface

---

## **21\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Escrow activation | Payment success | Escrow must be created in Stripe immediately on payment success | If escrow creation fails: payment is rolled back; buyer shown "Payment could not be completed — please try again"; no funds taken | On Stripe payment confirmation |
| Buyer Protection notice | Page render | Notice must be present on every checkout page load | If notice fails to render: checkout page load is blocked — notice is a required element | On page load |
| Dispute window | Post-delivery | Dispute must be raised within 48 hours of delivery confirmation | After 48 hours: dispute option is disabled on order detail; escrow auto-releases to seller | On delivery confirmation timestamp \+ 48hr check |

# **SRS — Transactions | Payment Success**

**Platform:** The Kit Loop | **User:** Buyer | **Module:** Transactions | **Sub-Module:** Payment Success | **Version:** 1.0

---

## **1\. Feature Overview**

The Payment Success sub-module is the screen a buyer lands on immediately after a payment has been successfully processed through Stripe. It serves two purposes: the Payment Confirmation screen closes the purchase loop by giving the buyer clear, reassuring confirmation that their order has been placed and their money is accounted for; the Post-Payment CTAs guide the buyer to their logical next action — either tracking their new order or continuing to browse. Together they complete the checkout journey with clarity and maintain buyer engagement immediately after a transaction.

There are two features within this sub-module:

* **Feature 1 — Payment Confirmation Screen**  
* **Feature 2 — Post-Payment CTAs**

---

---

# **Feature 1 — Payment Confirmation Screen**

---

## **2\. Story & Story Narrative**

**Story** As a buyer, I want to see a clear confirmation after payment so I know my order has been placed successfully and I understand what happens next.

**Story Narrative** Immediately after payment is processed, the buyer lands on a success screen with a green tick, their order summary, and a tracking notification. It removes any post-payment anxiety — the buyer knows their money has gone to the right place, their item is on its way, and they will receive tracking details by email.

Benefit: Closes the purchase loop cleanly, prevents unnecessary repeat payment attempts from anxious buyers, and sets clear expectations for the next step without requiring the buyer to go searching for confirmation.

---

## **3\. User Flow**

**Preconditions**

* Buyer has successfully completed payment on the checkout page  
* Stripe has returned a successful payment confirmation  
* Order record has been created with escrow status: Held

**Main Flow**

1. Stripe confirms payment success  
2. Platform navigates buyer to the payment success screen  
3. Screen loads and displays:  
   * Green circular tick icon — large, centred, prominent  
   * Heading: "Payment Successful\!"  
   * Sub-text: "Your order has been placed. The seller will ship your item soon."  
   * Order summary card showing:  
     * Item name (e.g. Bullpadel Vertex 03 Padel Racket)  
     * Total paid in GBP (e.g. £208.95)  
     * Tracking notice: "You'll receive tracking details by email"  
4. Seller receives an in-app and email notification that their item has been purchased and must be dispatched  
5. Buyer reads confirmation and proceeds via one of the Post-Payment CTAs

**Alternative Flow — Payment Success but Order Creation Fails**

1. Stripe confirms payment success  
2. Platform fails to create the order record  
3. Buyer is shown a neutral holding screen: "Your payment was received — we're setting up your order. You'll receive a confirmation email shortly."  
4. Platform retries order creation automatically  
5. Support team is alerted to investigate if order creation does not resolve within 5 minutes  
6. Buyer is not shown an error or asked to pay again

**Post Conditions**

* Buyer is on the payment success screen with full order confirmation visible  
* Order record exists in the system with payment status: Held in Escrow  
* Seller has been notified to dispatch the item  
* Buyer will receive a confirmation and tracking email from the platform  
* Checkout session is closed — the buyer cannot return to the checkout page for this order via back navigation

---

## **4\. Acceptance Criteria**

* Payment success screen loads within 3 seconds of Stripe payment confirmation  
* Green tick icon is displayed prominently at the top of the screen  
* "Payment Successful\!" heading is displayed clearly  
* Sub-text confirms the order has been placed and the seller will ship soon  
* Order summary card displays: item name, total paid in GBP, and tracking email notice  
* Total paid on confirmation screen matches exactly the total shown on the checkout Order Summary  
* Item name matches the purchased listing title exactly  
* Tracking notice informs buyer that tracking details will be sent by email — no tracking number is shown on this screen at this stage  
* Seller receives in-app and email notification within 2 minutes of payment confirmation  
* Buyer receives a confirmation email within 5 minutes of payment confirmation containing: item name, total paid, order ID, and next steps  
* Back navigation from the payment success screen does not return buyer to the checkout — checkout is closed on payment success  
* Payment success screen is accessible only after a successful payment — it cannot be accessed directly via URL without a valid completed payment session

---

## **5\. Business Rules**

* Payment success screen is shown only after Stripe has confirmed a successful payment — it is never shown for a pending or failed payment  
* The total displayed on the confirmation screen is the final charged amount — it cannot differ from the checkout total  
* The order record must be created with escrow status Held before the success screen is shown — if order creation fails, a holding screen is shown and support is alerted  
* Seller notification must be triggered automatically on payment success — it is not manual and cannot be skipped  
* Back navigation from the payment success screen is blocked — the buyer cannot accidentally return to the checkout and attempt to pay again  
* The payment success screen is a one-time view per order — refreshing the page shows the same confirmation; navigating away and returning via direct URL is not supported

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Payment session validity | Page access | Screen accessible only with a valid completed Stripe payment session | If accessed without valid session: redirect to /orders with message "Your order has been placed — view it in My Orders" | On page load |
| Total amount display | Confirmation accuracy | Total shown must match Stripe charge amount exactly | If mismatch detected: support team alerted; buyer shown correct Stripe charge amount | On page render |
| Order record existence | Post-payment | Order must exist in system before full confirmation is shown | If order not yet created: holding screen shown; retry logic executed; support alerted after 5 minutes | On page load |
| Seller notification | Triggered event | Notification must fire within 2 minutes of payment success | If notification fails: retry triggered automatically up to 3 times; support alerted on persistent failure | On payment confirmation |

---

---

# **Feature 2 — Post-Payment CTAs**

---

## **7\. Story & Story Narrative**

**Story** As a buyer, I want clear next-step actions after payment so I can either track my order or continue shopping without feeling lost.

**Story Narrative** After seeing their payment confirmation, the buyer is presented with two clear options — view their order to track progress, or continue browsing for more items. The CTAs maintain momentum and keep the buyer engaged with the platform rather than leaving after a single transaction.

Benefit: Maintains buyer engagement immediately post-purchase, increases the likelihood of repeat browse or purchase in the same session, and provides a polished, professional end to the checkout journey.

---

## **8\. User Flow**

**Preconditions**

* Buyer is on the payment success screen  
* Payment confirmation details are fully displayed  
* Order record exists in the system

**Main Flow — View My Orders**

1. Buyer reads payment confirmation  
2. Buyer taps "View My Orders" (primary CTA — green, full width)  
3. Platform navigates to /orders  
4. Orders page loads showing all buyer orders with the new order at the top  
5. New order shows status: Payment received — awaiting dispatch  
6. Buyer can track order progress from this page

**Main Flow — Continue Shopping**

1. Buyer reads payment confirmation  
2. Buyer taps "Continue Shopping" (secondary CTA — outlined button below primary)  
3. Platform navigates to /search or homepage  
4. Buyer browses available listings for additional purchases

**Alternative Flow — Buyer Takes No Action**

1. Buyer reads confirmation but does not tap either CTA  
2. No automatic redirect occurs — buyer remains on the success screen  
3. Buyer can navigate using the global navigation bar to go anywhere on the platform  
4. Success screen remains accessible for the duration of the session

**Post Conditions**

* If buyer tapped View My Orders: buyer is on /orders with the new order visible at the top of their order list  
* If buyer tapped Continue Shopping: buyer is on /search or homepage ready to browse  
* In both cases the completed order record is accessible from /orders at any time  
* The payment success screen remains in the browser session history but cannot be re-entered as an active checkout

---

## **9\. Acceptance Criteria**

* Two CTAs are displayed on the payment success screen below the order summary card  
* Primary CTA: "View My Orders" — green, full-width button, displayed first  
* Secondary CTA: "Continue Shopping" — outlined button, displayed below the primary CTA  
* Tapping "View My Orders" navigates to /orders within 2 seconds  
* On /orders the new order appears at the top of the list with correct status: awaiting dispatch  
* Tapping "Continue Shopping" navigates to /search or homepage within 2 seconds  
* Both CTAs are visible without scrolling on standard mobile viewports  
* Neither CTA is disabled — both are always active on the payment success screen  
* Global navigation remains accessible on the payment success screen — buyer is not locked into choosing one of the two CTAs  
* If buyer uses browser back from /orders or /search, they are returned to the payment success screen — not to checkout

---

## **10\. Business Rules**

* "View My Orders" is always the primary CTA — it takes visual precedence over "Continue Shopping" in all cases  
* "Continue Shopping" navigates to /search in preference to the homepage to encourage active browsing and filtering rather than passive homepage viewing  
* No additional CTAs are shown on the payment success screen — the two options are the only post-payment actions presented; upsell prompts, share buttons, and review requests are not shown at this stage  
* The payment success screen does not auto-redirect after a timer — the buyer chooses when and where to go next  
* Both CTAs are available to all buyers regardless of their order history or account type

---

## **11\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| View My Orders navigation | CTA tap | /orders page must load with the new order present | If order not yet visible in /orders on load: page shows loading state for up to 5 seconds; order appears once record is confirmed | On /orders page load |
| Continue Shopping navigation | CTA tap | /search must load with all live listings | If /search fails to load: fallback to homepage | On navigation |
| CTA render | Page load | Both CTAs must render on every payment success screen | If either CTA fails to render: global navigation remains available; support alerted | On page render |

# **SRS — Post Purchase | Orders**

**Platform:** The Kit Loop | **User:** Buyer | **Module:** Post Purchase | **Sub-Module:** Orders | **Version:** 1.0

---

## **1\. Feature Overview**

The Orders sub-module is the buyer's central hub for tracking and managing everything that happens after a purchase is made. It gives the buyer full visibility over all their active and past orders and provides the mechanism to raise a formal dispute if an item arrives not as described. Together these two features complete the post-purchase experience — ensuring buyers are never left wondering where their item is and always have a clear route to resolution if something goes wrong.

There are two features within this sub-module:

* **Feature 1 — View My Orders**  
* **Feature 2 — Raise a Dispute**

---

---

# **Feature 1 — View My Orders**

---

## **2\. Story & Story Narrative**

**Story** As a buyer, I want to view all my orders and their current status so I always know where my items are and what is happening with my purchases.

**Story Narrative** After completing a purchase, the buyer can access /orders at any time to see the full list of their purchases — active, completed, and historical. Each order shows its current status so the buyer knows whether to expect a dispatch notification, a delivery, or whether an order has been completed. They can tap into any order for full detail without needing to search through emails.

Benefit: Gives buyers complete visibility and control over their purchase history, reduces inbound support queries about order status, and builds ongoing trust in the platform's reliability.

---

## **3\. User Flow**

**Preconditions**

* Buyer is authenticated  
* At least one order exists on the buyer's account

**Main Flow**

1. Buyer navigates to /orders from profile, navigation, or post-payment CTA  
2. Orders page loads showing all orders in reverse chronological order — most recent first  
3. Each order row displays:  
   * Listing thumbnail photo  
   * Item title  
   * Seller username  
   * Order date  
   * Total paid  
   * Current order status  
4. Buyer identifies the order they want to review  
5. Buyer taps the order row  
6. Order detail view loads showing:  
   * Full item details: photo, title, brand, condition, category  
   * Payment breakdown: item price, shipping fee, buyer protection fee, total paid  
   * Escrow status: Held / Released / Refunded  
   * Delivery address confirmed at checkout  
   * Fulfilment timeline: order placed, payment confirmed, dispatched (with tracking number if provided by seller), delivered  
   * Dispute status if applicable  
7. Buyer reviews order detail and takes action if needed

**Alternative Flow — No Orders Yet**

1. Buyer navigates to /orders  
2. No orders exist on the account  
3. Empty state displayed: "You haven't placed any orders yet"  
4. CTA shown: "Browse listings" navigating to /search

**Alternative Flow — Access from Profile**

1. Buyer navigates to /profile  
2. Taps "My Orders"  
3. Navigated to /orders — same flow as main flow above

**Post Conditions**

* Buyer has reviewed their order list and/or individual order detail  
* No order data has been altered by viewing — read-only  
* Buyer can proceed to raise a dispute from the order detail view if the item has been delivered and is not as described  
* Tracking information is visible if the seller has provided it

---

## **4\. Acceptance Criteria**

**Orders List**

* All orders are shown in reverse chronological order — most recent first  
* Each order row shows: listing thumbnail, item title, seller username, order date, total paid, and current status  
* Order statuses shown: Payment Received — Awaiting Dispatch, Dispatched, Delivered, Completed, Disputed, Refunded  
* Status labels are colour-coded for quick visual scanning  
* Orders page is accessible from /profile → My Orders and from global navigation  
* Empty state shown with Browse Listings CTA if no orders exist  
* Orders page is paginated — maximum 20 orders per page with load more or pagination

**Order Detail**

* Tapping an order row opens the full order detail view  
* Order detail shows: item details, payment breakdown, escrow status, delivery address, fulfilment timeline, and dispute status  
* Fulfilment timeline shows exact timestamps for each completed stage  
* Tracking number is displayed in the fulfilment timeline when provided by seller  
* If no tracking number has been provided, "Tracking not yet available" is shown  
* Escrow status is clearly labelled: Held in Escrow / Released to Seller / Refunded to Buyer  
* "Raise a Dispute" CTA is visible on the order detail for eligible orders — see Feature 2  
* "Confirm Delivery" CTA is visible when the order status is Dispatched and delivery window has passed

**General**

* Orders page loads within 2 seconds  
* Only the authenticated buyer's own orders are shown — no other buyer's orders are visible  
* Guest buyers cannot access /orders — redirected to sign up / login

---

## **5\. Business Rules**

* Orders are visible to the buyer permanently — completed and historical orders are never removed from the buyer's order history  
* Buyers can only see their own orders — cross-account order visibility is not permitted under any circumstance  
* The escrow status shown on the order detail must be accurate and real-time — the buyer must always be able to see whether funds are held, released, or refunded  
* Tracking information is provided by the seller — the platform displays it as entered; it is not validated or verified by the platform in v1  
* A buyer can confirm delivery on an order that is in Dispatched status — confirming delivery triggers escrow release to the seller  
* Once a buyer confirms delivery, the action cannot be undone — escrow release is immediate and irreversible  
* If a buyer has not confirmed delivery within the platform's confirmation window and has not raised a dispute, escrow is automatically released to the seller  
* Order detail is read-only for the buyer — they cannot edit any order information directly

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Authentication | Page access | Buyer must be authenticated | Redirect to sign up / login; returned to /orders after auth | On page load |
| Order ownership | Order detail access | Order must belong to the authenticated buyer | If order ID in URL does not belong to buyer: redirect to /orders with no error message | On order detail load |
| Confirm Delivery tap | Delivery confirmation | Order must be in Dispatched status | Confirm Delivery CTA only visible for orders in Dispatched status | On order detail render |
| Confirm Delivery — double confirmation | Irreversible action | Buyer must confirm twice — confirmation prompt shown | "Confirm delivery? This will release payment to the seller and cannot be undone. Confirm?" | On Confirm Delivery tap |

---

---

# **Feature 2 — Raise a Dispute**

---

## **7\. Story & Story Narrative**

**Story** As a buyer, I want to raise a dispute if my item arrives not as described so I am protected and can get a resolution without being left out of pocket.

**Story Narrative** If a buyer receives an item that does not match the listing description — wrong condition, damaged, or significantly different from what was advertised — they can raise a formal dispute from the order detail page within 48 hours of delivery. The dispute triggers escrow to remain held while admin reviews the evidence and makes a binding ruling. The buyer is covered under the platform's buyer protection guarantee throughout this process.

Benefit: Enforces the platform's buyer protection guarantee, gives buyers a clear and accessible route to resolution, deters dishonest sellers, and ensures the escrow system functions as a genuine safety net rather than a marketing claim.

---

## **8\. User Flow**

**Preconditions**

* Buyer is authenticated  
* Order is in Dispatched or Delivered status  
* Item has been received by the buyer  
* Dispute window is still open — within 48 hours of delivery confirmation or carrier delivery confirmation  
* Escrow is currently Held — not yet released to seller

**Main Flow**

1. Buyer receives item and finds it is not as described  
2. Buyer navigates to /orders  
3. Buyer taps the relevant order  
4. Order detail loads  
5. Buyer taps "Raise a Dispute" CTA  
6. Dispute form loads with the following fields:  
   * Dispute reason — predefined list (required):  
     * Item not as described  
     * Item arrived damaged  
     * Wrong item received  
     * Item not received  
     * Significantly different from listing photos  
   * Description — free text field for buyer to explain the issue (required)  
   * Evidence photos — buyer can upload photos showing the issue (optional but strongly recommended)  
7. Buyer selects reason, writes description, and optionally uploads photos  
8. Buyer reviews dispute submission  
9. Buyer taps "Submit Dispute"  
10. Dispute submitted  
11. Order status updates to: Disputed  
12. Escrow remains Held — funds not released to seller  
13. Seller receives notification: "A dispute has been raised on order \[ID\]. Reason: \[reason\]. Please respond within 48 hours."  
14. Admin is notified of the new dispute in the Orders sub-module  
15. Buyer receives confirmation: "Your dispute has been submitted. We'll review it and get back to you. Your payment is held safely while we investigate."  
16. Buyer awaits admin ruling

**Alternative Flow — Dispute Window Expired**

1. Buyer attempts to raise a dispute after the 48-hour window has closed  
2. "Raise a Dispute" CTA is no longer visible on the order detail  
3. Buyer sees: "The dispute window for this order has closed. If you have an issue, please contact support."  
4. Escrow has been or will be automatically released to the seller

**Alternative Flow — Seller Responds to Dispute**

1. Seller receives dispute notification  
2. Seller opens the order in their orders panel  
3. Seller submits their response and any counter-evidence within 48 hours  
4. Admin reviews all evidence from both parties  
5. Admin makes ruling — refund to buyer, release to seller, or partial resolution  
6. Both parties notified of outcome

**Post Conditions**

* Dispute has been formally submitted and is visible on the order detail with Disputed status  
* Escrow remains Held pending admin ruling — seller cannot access funds during dispute  
* Seller has been notified and has 48 hours to respond  
* Admin has been alerted and the dispute is in the admin Orders panel for review  
* Buyer has received an in-app and email confirmation of their dispute submission  
* Buyer cannot raise a second dispute on the same order — one dispute per order

---

## **9\. Acceptance Criteria**

**Dispute Eligibility**

* "Raise a Dispute" CTA is visible on the order detail only when all of the following are true:  
  * Order status is Dispatched or Delivered  
  * Dispute window is still open (within 48 hours of delivery)  
  * Escrow status is Held  
  * No dispute has already been raised on this order  
* "Raise a Dispute" CTA is hidden after the 48-hour window closes  
* "Raise a Dispute" CTA is hidden if a dispute already exists on the order  
* "Raise a Dispute" CTA is hidden if escrow has already been released or refunded

**Dispute Form**

* Dispute reason is a required field — buyer must select from the predefined list before submitting  
* Description is a required field — minimum 20 characters  
* Evidence photo upload is optional — buyer can submit without photos  
* Maximum 5 photos can be uploaded as evidence  
* Accepted photo formats: JPG, PNG — maximum 5MB per photo  
* Character counter shown on description field from 400 characters — maximum 500 characters  
* Submit button is disabled until reason and description are both complete

**Submission & Notification**

* On submission: order status updates to Disputed immediately  
* Escrow status remains Held — no change to escrow on dispute submission  
* Buyer receives in-app and email confirmation within 5 minutes of submission  
* Seller receives in-app and email notification within 5 minutes of submission  
* Admin dispute alert raised in the Orders sub-module within 5 minutes of submission  
* Dispute submission and all evidence are permanently attached to the order record

**General**

* Only one dispute can be raised per order — the CTA is hidden after a dispute is submitted  
* Dispute cannot be withdrawn by the buyer after submission in v1  
* Submitted dispute evidence (description and photos) cannot be edited after submission — buyer can submit additional evidence only if admin requests it

---

## **10\. Business Rules**

* The dispute window is 48 hours from the point the buyer confirms delivery or the carrier confirms delivery — whichever is earlier; after 48 hours the dispute window is permanently closed  
* A dispute can only be raised while escrow is in Held status — if escrow has already been released the dispute mechanism is unavailable and the buyer must contact support  
* One dispute per order — raising multiple disputes on the same order is not permitted  
* Raising a dispute does not automatically result in a refund — it initiates an admin review process; the outcome depends on the evidence provided by both parties  
* Escrow remains Held for the full duration of the dispute — seller has no access to the funds until admin makes a ruling  
* The buyer protection fee is refunded to the buyer if admin rules in the buyer's favour — it is not refunded if admin rules in the seller's favour  
* Shipping fee is non-refundable in dispute rulings unless admin explicitly overrides this  
* Admin ruling is binding and final — neither buyer nor seller can reverse it via the platform in v1  
* Dispute evidence (description and photos) submitted by the buyer is visible to admin and to the seller as part of the dispute review process — buyers are made aware of this before submitting  
* A buyer who raises a dispute in bad faith — where the item clearly matches the description — may have their account flagged for review by admin

---

## **11\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Dispute reason | Dispute form | Required — must select from predefined list | "Please select a reason for your dispute" | On submit tap |
| Description | Dispute form | Required, min 20 characters, max 500 characters | "Please describe the issue in at least 20 characters" / "Description cannot exceed 500 characters" | On input and on submit |
| Evidence photos | Dispute form | Optional; max 5 photos; JPG or PNG only; max 5MB each | "You can upload a maximum of 5 photos" / "Invalid file type — please upload JPG or PNG" / "File too large — maximum 5MB per photo" | On file upload |
| Dispute eligibility | CTA render | Order must meet all eligibility criteria | CTA hidden if ineligible — no error message shown; ineligibility is silent | On order detail render |
| Dispute window | Submit tap | Must be within 48 hours of delivery | If window expired between CTA render and submit tap: "The dispute window for this order has now closed" — dispute blocked | On submit tap |
| Duplicate dispute | CTA render | Only one dispute per order | CTA hidden if dispute already exists on order | On order detail render |
| Authentication | Page access | Buyer must be authenticated | Redirect to sign up / login; returned to /orders after auth | On page load |

# **SRS — Account | Profile**

**Platform:** The Kit Loop | **User:** Buyer | **Module:** Account | **Sub-Module:** Profile | **Version:** 1.0

---

## **1\. Feature Overview**

The Profile sub-module is the buyer's central account hub on The Kit Loop. It is accessible from the global navigation and brings together all account-related sections in one place — from personal identity and saved items through to platform guidance and support. Rather than scattering account functions across multiple disconnected pages, the profile page acts as a single structured menu that gives the buyer visibility and control over every aspect of their account. Each menu item leads to a dedicated section. The profile is shared between buyers and sellers — users who do both see all relevant sections for both roles.

There are seven features within this sub-module:

* **Feature 1 — Profile Overview**  
* **Feature 2 — Favourite Items**  
* **Feature 3 — Balance**  
* **Feature 4 — Personalisation**  
* **Feature 5 — Your Guide to The Kit Loop**  
* **Feature 6 — Help Centre**  
* **Feature 7 — About The Kit Loop**

---

---

# **Feature 1 — Profile Overview**

---

## **2\. Story & Story Narrative**

**Story** As a buyer, I want a central profile page so I can access all my account sections from one place without navigating across multiple disconnected pages.

**Story Narrative** Buyer taps the profile icon in the global navigation and lands on their profile page. They see their avatar and username at the top confirming they are in their own account, followed by a clear menu of all account sections. From here they can reach any part of their account in one tap.

Benefit: Creates a single intuitive hub for all account activity, reduces navigation confusion, and ensures buyers feel in control of their account from one organised screen.

---

## **3\. User Flow**

**Preconditions**

* Buyer is authenticated  
* Buyer taps profile icon in global navigation

**Main Flow**

1. Buyer taps profile icon in the global navigation  
2. Platform navigates to /profile  
3. Profile page loads  
4. Top of page displays:  
   * Circular avatar (profile photo or default initials avatar)  
   * Username displayed below avatar  
5. Below avatar, a structured menu is displayed with the following sections in grouped order:  
   * View my listings  
   * Favourite Items  
   * Balance  
   * My Orders  
   * Personalisation  
   * Holiday Mode  
   * Your guide to The Kit Loop  
   * Help Centre  
   * Settings  
   * Cookie Settings  
   * About The Kit Loop  
   * Legal Information  
6. Each menu item has a right-facing chevron indicating it is tappable  
7. Buyer taps any menu item to navigate to that section

**Alternative Flow — Unauthenticated Access**

1. Guest buyer taps profile icon  
2. Sign up / login prompt is shown  
3. Guest authenticates  
4. Redirected to /profile after authentication

**Post Conditions**

* Buyer has a complete view of all their account sections from one page  
* No account data has been altered by viewing the profile page  
* Buyer can navigate to any account section from this page in one tap

---

## **4\. Acceptance Criteria**

* Profile page is accessible from the global navigation on all pages of the platform  
* Avatar and username are displayed at the top of the profile page  
* If no profile photo has been uploaded, a default avatar using the buyer's initials is shown  
* All account menu sections are listed with a right-facing chevron  
* Menu items are grouped logically — activity items grouped together, support items grouped together, settings grouped together  
* Each menu item navigates to its corresponding section on tap  
* Profile page is not accessible to guest buyers — sign up / login prompt shown  
* Profile page loads within 2 seconds  
* Username displayed matches the authenticated buyer's account username exactly

---

## **5\. Business Rules**

* Profile page is accessible only to authenticated buyers — guest access is not permitted  
* The avatar and username shown are always the currently authenticated buyer's own details — another user's profile is never shown on this page  
* The profile menu structure is platform-defined — buyers cannot reorder or hide menu items in v1  
* Menu items that are relevant to both buyer and seller roles (e.g. View my listings, Holiday Mode, Balance) are always shown — the profile does not differentiate between pure buyers and buyer-sellers in the menu structure

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Authentication | Page access | Buyer must be authenticated | Sign up / login prompt shown; redirected to /profile after auth | On page load |
| Avatar image | Display | Must be a valid image URL or default initials avatar shown | If image URL fails: initials avatar shown as fallback; no broken image | On render |

---

---

# **Feature 2 — Favourite Items**

---

## **7\. Story & Story Narrative**

**Story** As a buyer, I want quick access to my saved items from my profile so I can revisit listings I was interested in and complete a purchase when I am ready.

**Story Narrative** Buyer taps Favourite Items from their profile page and sees a grid of all listings they have previously wishlisted. They can review saved items, tap through to listing detail, and purchase — or remove items they are no longer interested in. If a saved item has sold, it is shown with an unavailable label rather than disappearing silently.

Benefit: Turns passive saved interest into active purchase intent, gives buyers easy access to deferred purchases, and ensures previously saved items are never lost between sessions.

---

## **8\. User Flow**

**Preconditions**

* Buyer is authenticated  
* Buyer is on the profile page

**Main Flow**

1. Buyer taps "Favourite Items" from the profile menu  
2. Navigated to the Favourites page  
3. Page loads showing all wishlisted listings in a grid  
4. Each listing card shows: primary photo, item title, price, condition badge, and availability status  
5. Buyer taps a listing card for an available item  
6. Navigated to the listing detail page  
7. Buyer reviews item and proceeds to purchase, make offer, or return to Favourites

**Alternative Flow — Remove from Favourites**

1. Buyer on Favourites page  
2. Buyer taps the filled heart icon on a listing card  
3. Confirmation prompt: "Remove from Favourites?"  
4. Buyer confirms  
5. Item removed from Favourites grid immediately

**Alternative Flow — Unavailable Item**

1. Buyer opens Favourites and sees a listing with "No longer available" label  
2. Buyer taps the listing card  
3. "Browse similar items" CTA shown — navigates to sport-filtered /search for that listing's sport  
4. Buyer browses alternatives

**Alternative Flow — No Saved Items**

1. Buyer opens Favourites with no saved items  
2. Empty state shown: "You haven't saved any items yet"  
3. CTA shown: "Browse listings" navigating to /search

**Post Conditions**

* Buyer has viewed their saved listings  
* If an item was removed, it is no longer in the Favourites list  
* If buyer tapped a listing, they have been navigated to the listing detail page  
* No listing data has been altered by viewing Favourites

---

## **9\. Acceptance Criteria**

* Favourites page is accessible from Profile → Favourite Items  
* All wishlisted listings are displayed in a grid — 2 columns on mobile, 4 columns on desktop  
* Each card shows: primary photo, title, price, condition badge, and availability status  
* Sold or removed listings shown with "No longer available" label — not silently removed from the grid  
* "Browse similar" CTA shown on unavailable listing cards linking to sport-filtered /search  
* Tapping an available listing card navigates to /listing/\[listingID\]  
* Buyer can remove an item from Favourites by tapping the filled heart on the card — confirmation prompt shown before removal  
* Empty state shown with Browse Listings CTA if no saved items exist  
* Favourites page is paginated — 20 items per page with load more  
* Page loads within 2 seconds

---

## **10\. Business Rules**

* Favourites list is private — visible only to the authenticated buyer; not visible to sellers, other buyers, or publicly  
* A sold or removed item remains in Favourites with an unavailable label — it is not automatically deleted when the listing status changes  
* Buyer must explicitly remove items from Favourites — they are never auto-removed by the platform  
* Wishlisting does not reserve inventory — another buyer can purchase a wishlisted item at any time  
* Maximum number of items in Favourites is not restricted in v1

---

## **11\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Authentication | Page access | Buyer must be authenticated | Redirect to sign up / login | On page load |
| Remove confirmation | Remove action | Buyer must confirm removal | Confirmation prompt shown before item is removed | On heart tap |
| Listing availability | Card tap | Listing must be in Live status for detail navigation | Unavailable listing shows label and Browse Similar CTA; tapping does not navigate to detail | On card tap |

---

---

# **Feature 3 — Balance**

---

## **12\. Story & Story Narrative**

**Story** As a buyer and seller, I want to view my account balance so I know how much I have earned from sales and what funds are available for withdrawal.

**Story Narrative** A user who has sold items on the platform taps Balance from their profile to see their current earnings, any amounts still held in escrow, and their cleared balance available for payout. They can then request a withdrawal to their linked bank account.

Benefit: Provides full financial transparency, builds trust that earnings are tracked accurately, and gives users confidence in the platform's payout process.

---

## **13\. User Flow**

**Preconditions**

* Buyer / seller is authenticated  
* At least one transaction has been completed or is in progress

**Main Flow**

1. Buyer taps "Balance" from the profile menu  
2. Balance page loads showing:  
   * Current cleared balance — available for withdrawal  
   * Pending balance — funds still in escrow awaiting buyer delivery confirmation  
   * Total earned — cumulative earnings from all completed sales  
3. Transaction history listed below — each entry shows: order ID, item title, amount, date, and status (Cleared / Pending / Refunded)  
4. "Request Payout" CTA visible if cleared balance is greater than £0.00  
5. Buyer taps Request Payout  
6. Payout initiated to linked bank account via Stripe  
7. Balance updates to reflect the requested withdrawal

**Alternative Flow — No Earnings Yet**

1. User taps Balance with no completed sales  
2. Balance page shows £0.00 across all fields  
3. Empty transaction history with message: "No transactions yet"  
4. Request Payout button is disabled

**Post Conditions**

* Buyer has reviewed their current balance and transaction history  
* If payout was requested, withdrawal has been initiated to the linked bank account  
* Balance figures reflect the current accurate state of the user's account

---

## **14\. Acceptance Criteria**

* Balance page accessible from Profile → Balance  
* Three balance figures shown: cleared balance, pending balance, total earned  
* All amounts displayed in GBP with two decimal places  
* Transaction history shown in reverse chronological order  
* Each transaction entry shows: order ID, item title, amount, date, and status  
* Request Payout CTA is active only when cleared balance is greater than £0.00  
* Request Payout CTA is disabled with "No funds available" label when cleared balance is £0.00  
* Payout is processed to the bank account linked in Settings → Payments  
* If no bank account is linked, Request Payout shows: "Add a bank account in Settings to request a payout"  
* Page loads within 2 seconds  
* Balance figures are real-time — not cached from a previous session

---

## **15\. Business Rules**

* Cleared balance is funds from completed sales where escrow has been released — available for withdrawal  
* Pending balance is funds still held in escrow — not available for withdrawal until buyer confirms delivery or dispute window closes  
* Payout is processed to the bank account linked in Settings → Payments — no payout can be made to a card or alternative destination  
* Minimum payout amount is £1.00 — payouts below this threshold are not permitted  
* Payout processing time is determined by Stripe and the receiving bank — typically 1–3 business days; this is communicated to the user at point of request  
* A refund issued on a dispute reduces the cleared or pending balance accordingly — the balance always reflects the net position after all refunds

---

## **16\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Authentication | Page access | Must be authenticated | Redirect to sign up / login | On page load |
| Request Payout | Payout action | Cleared balance must be ≥ £1.00 | "Minimum payout amount is £1.00" — button disabled below threshold | On render and on tap |
| Bank account linked | Payout action | Bank account must be linked in Settings | "Add a bank account in Settings to request a payout" — payout blocked | On payout tap |

---

---

# **Feature 4 — Personalisation**

---

## **17\. Story & Story Narrative**

**Story** As a buyer, I want to personalise my app experience so the platform feels relevant to my sport preferences and browsing habits from every visit.

**Story Narrative** Buyer taps Personalisation from their profile and sets their preferred sports. On returning to the homepage and browse pages, content is ordered and surfaced to reflect their preferences — reducing the need to filter every time they visit.

Benefit: Creates a tailored experience that feels relevant from first login, increases return visit frequency, and reduces the effort required to find relevant content on every session.

---

## **18\. User Flow**

**Preconditions**

* Buyer is authenticated  
* Buyer is on the profile page

**Main Flow**

1. Buyer taps "Personalisation" from the profile menu  
2. Personalisation settings page loads  
3. Buyer sees the following settings:  
   * Preferred sports — multi-select from all active sports (17 available)  
   * Notification preferences — toggle for order updates, messages, price drops, promotions  
   * Display preferences — any platform appearance settings available in v1  
4. Buyer selects preferred sports by tapping sport chips  
5. Buyer adjusts notification toggles  
6. Changes are saved automatically or via a Save button  
7. Homepage and browse experience updates to reflect sport preferences on next visit

**Post Conditions**

* Preferences are saved against the buyer's account  
* Homepage Browse by Sport row reflects preferred sports on next load  
* Notification preferences are applied immediately  
* Personalisation settings can be updated at any time

---

## **19\. Acceptance Criteria**

* Personalisation page accessible from Profile → Personalisation  
* All 17 active sports shown as selectable chips — multi-select supported  
* Buyer can select any combination of sports or deselect all  
* Notification preference toggles available for: order updates, messages, price drops, promotions  
* Changes saved automatically on toggle or via explicit Save button  
* Saved sport preferences influence Browse by Sport ordering on homepage  
* Preferences persist across sessions and devices for the authenticated account  
* Page loads within 2 seconds

---

## **20\. Business Rules**

* Personalisation settings are account-based — they persist across all devices where the buyer is authenticated  
* Selecting preferred sports does not restrict the buyer from browsing other sports — it only influences the default display order and content surfacing  
* If no preferred sports are set, the platform defaults to the admin-configured sport order — no personalisation is applied  
* Notification preferences set in Personalisation align with and do not conflict with notification settings in Settings → Notifications — both control the same underlying preference

---

## **21\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Authentication | Page access | Must be authenticated | Redirect to sign up / login | On page load |
| Sport selection | Multi-select | No minimum or maximum selection enforced | If all deselected: default admin-configured order applied — no error | On save |

---

---

# **Feature 5 — Your Guide to The Kit Loop**

---

## **22\. Story & Story Narrative**

**Story** As a buyer, I want an in-app guide so I can understand how the platform works without needing to contact support.

**Story Narrative** A first-time buyer unsure about how escrow, buyer protection, or the dispute process works taps Your Guide from their profile. They find a simple step-by-step explanation of how to buy safely on The Kit Loop. Their question is answered without leaving the app or waiting for a support response.

Benefit: Reduces onboarding friction, decreases support ticket volume for common questions, and builds buyer confidence by proactively educating users on platform mechanics before issues arise.

---

## **23\. User Flow**

**Preconditions**

* Buyer is authenticated  
* Buyer is on the profile page

**Main Flow**

1. Buyer taps "Your guide to The Kit Loop" from the profile menu  
2. In-app guide page loads  
3. Guide is structured in clearly labelled sections covering:  
   * How to buy on The Kit Loop  
   * How buyer protection and escrow works  
   * How to track your order  
   * How to raise a dispute  
   * How to sell on The Kit Loop  
   * How payouts work  
4. Buyer reads the relevant section  
5. Buyer returns to the platform with their question answered

**Post Conditions**

* Buyer has read the guide section relevant to their query  
* No account data has been altered  
* Buyer can return to any part of the platform via back navigation or global navigation

---

## **24\. Acceptance Criteria**

* Guide page accessible from Profile → Your guide to The Kit Loop  
* Guide is structured into clearly labelled sections  
* All sections are readable without needing to leave the app or open an external link  
* Guide content is maintained by admin — copy is platform-controlled and not buyer-editable  
* Page loads within 2 seconds  
* Back navigation returns buyer to the profile page

---

## **25\. Business Rules**

* Guide content is controlled and updated by the platform team — buyers cannot edit it  
* Guide is available only to authenticated buyers in v1 — it is not publicly accessible without login  
* Guide content must be kept current — any changes to platform rules, fees, or processes must be reflected in the guide within 5 business days of the change going live

---

## **26\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Authentication | Page access | Must be authenticated | Redirect to sign up / login | On page load |
| Guide content load | Page render | Guide content must load from CMS or static source | If content fails to load: "Guide temporarily unavailable — please try again shortly" | On page load |

---

---

# **Feature 6 — Help Centre**

---

## **27\. Story & Story Narrative**

**Story** As a buyer, I want access to a help centre so I can find answers to common questions and resolve issues independently without waiting for support.

**Story Narrative** A buyer who has a question about how to return an item or how long a payout takes taps Help Centre from their profile. They search for their topic and find a relevant article that answers their question. They resolve the issue without raising a support ticket.

Benefit: Empowers buyers to self-serve common issues, reduces support team workload, and ensures help is available at any time without waiting for a human response.

---

## **28\. User Flow**

**Preconditions**

* Buyer is authenticated  
* Buyer is on the profile page

**Main Flow**

1. Buyer taps "Help Centre" from the profile menu  
2. Help Centre page loads  
3. Page displays:  
   * Search bar — buyer can type a question or keyword  
   * Categorised article list — grouped by topic (Buying, Selling, Payments, Disputes, Account)  
4. Buyer types a query in the search bar (e.g. "dispute")  
5. Matching articles are displayed  
6. Buyer taps a relevant article  
7. Article loads with full answer  
8. If issue not resolved, contact support option is available at the bottom of each article

**Alternative Flow — Browse by Category**

1. Buyer does not search — browses article categories instead  
2. Taps a category (e.g. Disputes)  
3. List of articles within that category loads  
4. Buyer taps relevant article and reads answer

**Post Conditions**

* Buyer has found and read a help article relevant to their query  
* No account data has been altered  
* If buyer could not find an answer, they have been directed to contact support

---

## **29\. Acceptance Criteria**

* Help Centre accessible from Profile → Help Centre  
* Search bar present at the top of the Help Centre page  
* Search returns relevant articles based on keyword match against article titles and content  
* Articles are organised into categories: Buying, Selling, Payments, Disputes, Account  
* Each article loads in full within the app — no redirect to an external website  
* Contact support option available at the bottom of every article  
* If search returns no results: "No articles found for '\[query\]' — contact support" shown with support CTA  
* Page loads within 2 seconds

---

## **30\. Business Rules**

* Help Centre content is maintained by the platform team — buyers cannot create or edit articles  
* Help Centre is available to authenticated buyers only in v1  
* All help content must be kept current — articles must be reviewed and updated within 5 business days of any platform change that affects the described process  
* Contact support route must always be available as a fallback — no help article dead-ends without a support option

---

## **31\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Authentication | Page access | Must be authenticated | Redirect to sign up / login | On page load |
| Search input | Article search | Minimum 2 characters to trigger search | Search does not fire until 2 characters entered — no error message | On input |
| Search — no results | Query result | If no matching articles found | "No articles found for '\[query\]' — contact support" with support CTA | On search result render |

---

---

# **Feature 7 — About The Kit Loop**

---

## **32\. Story & Story Narrative**

**Story** As a buyer, I want to read about The Kit Loop so I understand what the platform is, who is behind it, and why I should trust it.

**Story Narrative** A new buyer who discovered The Kit Loop through a friend or social media post taps About from their profile before making their first purchase. They read the platform's mission, values, and background. The transparency builds confidence and they proceed to buy.

Benefit: Builds brand credibility and emotional connection with the platform, helps convert hesitant first-time buyers by establishing legitimacy, and communicates the platform's values around sustainability and community in sport.

---

## **33\. User Flow**

**Preconditions**

* Buyer is authenticated  
* Buyer is on the profile page

**Main Flow**

1. Buyer taps "About The Kit Loop" from the profile menu  
2. About page loads  
3. Page displays:  
   * Platform name and logo  
   * Mission statement  
   * Platform story and founding background  
   * Core values (sustainability, community, sport)  
   * Platform version or copyright notice  
4. Buyer reads content  
5. Buyer returns to profile or navigates elsewhere via global navigation

**Post Conditions**

* Buyer has read the About page content  
* No account data has been altered  
* Buyer can return to profile or any other page via navigation

---

## **34\. Acceptance Criteria**

* About page accessible from Profile → About The Kit Loop  
* Page displays: platform name, mission statement, founding story, and core values  
* Content is readable within the app — no external redirect required  
* Page loads within 2 seconds  
* Back navigation returns buyer to the profile page  
* Content is platform-controlled — buyers cannot edit it

---

## **35\. Business Rules**

* About page content is maintained by the platform team and updated as needed  
* About page is accessible to authenticated buyers only in v1  
* Content must accurately reflect the current platform mission and values — any significant business direction change must be reflected in the About page within 10 business days

---

## **36\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Authentication | Page access | Must be authenticated | Redirect to sign up / login | On page load |
| Content load | Page render | About content must load successfully | If content fails: "Unable to load this page — please try again" with retry CTA | On page load |

# **SRS — Account | Settings**

**Platform:** The Kit Loop | **User:** Buyer | **Module:** Account | **Sub-Module:** Settings | **Version:** 1.0

---

## **1\. Feature Overview**

The Settings sub-module gives the buyer full control over their account configuration — from personal identity and security through to payment methods, notification preferences, and privacy controls. It is accessible from Profile → Settings and is organised into clearly labelled sections. Each section is self-contained and deals with a specific aspect of account management. Settings changes take effect immediately on save unless otherwise specified. This sub-module is critical to account security, user trust, and regulatory compliance.

There are six features within this sub-module:

* **Feature 1 — Profile Details**  
* **Feature 2 — Account Settings**  
* **Feature 3 — Notifications**  
* **Feature 4 — Payments**  
* **Feature 5 — Privacy**  
* **Feature 6 — Security**

---

---

# **Feature 1 — Profile Details**

---

## **2\. Story & Story Narrative**

**Story** As a buyer, I want to update my profile details so my name, photo, and username accurately represent me on the platform.

**Story Narrative** Buyer navigates to Settings → Profile Details to update their display name, username, or profile photo. Changes are saved and immediately reflected across the platform — on their profile page, in message threads with sellers, and on any listings they have created.

Benefit: Keeps user identity accurate and current, improves trust in buyer–seller interactions, and gives users control over how they are represented on the platform.

---

## **3\. User Flow**

**Preconditions**

* Buyer is authenticated  
* Buyer has navigated to Profile → Settings → Profile Details

**Main Flow**

1. Buyer taps Profile Details from the Settings menu  
2. Profile Details page loads showing current values pre-populated:  
   * Profile photo (current avatar or default initials)  
   * Display name  
   * Username  
3. Buyer taps profile photo area to update image  
4. Device photo picker opens  
5. Buyer selects or captures a new photo  
6. Photo is cropped to a square format and previewed  
7. Buyer edits display name or username as needed  
8. Buyer taps Save  
9. Changes saved immediately  
10. Updated details reflected across the platform

**Alternative Flow — Remove Profile Photo**

1. Buyer taps profile photo  
2. Option shown: "Remove photo"  
3. Buyer confirms  
4. Profile photo reverts to default initials avatar

**Post Conditions**

* Updated profile photo, display name, and username are saved and live across the platform  
* Changes are visible immediately on the profile page and in any buyer–seller message threads  
* Previous username is released and available for other users to claim

---

## **4\. Acceptance Criteria**

* Profile Details page shows current profile photo, display name, and username pre-populated  
* Buyer can upload a new profile photo from their device camera roll or camera  
* Uploaded photo is cropped to square format with a preview before saving  
* Accepted photo formats: JPG, PNG — maximum 5MB  
* Display name field: required, max 60 characters  
* Username field: required, min 3 characters, max 30 characters, alphanumeric and underscores only, must be unique across the platform  
* If chosen username is already taken: inline error shown before save — buyer prompted to choose another  
* Save button is disabled until at least one field has been changed from its current value  
* Changes saved and live across all platform surfaces within 60 seconds of save  
* Back navigation without saving shows: "You have unsaved changes — discard or continue editing?"

---

## **5\. Business Rules**

* Username must be unique across the entire platform — no two accounts can share the same username at any time  
* Changing a username releases the previous username immediately — it becomes available for other users  
* Display name and username are shown in buyer–seller message threads — both must be appropriate and comply with platform community guidelines  
* Profile photo is shown on the public profile page and in message threads — it must not contain prohibited content  
* Admin can remove a profile photo that violates community guidelines without requiring the buyer's permission

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Profile photo | Upload | JPG or PNG only, max 5MB, minimum 200x200px | "Invalid file type — use JPG or PNG" / "File too large — max 5MB" / "Image too small — minimum 200x200px" | On file select |
| Display name | Edit | Required, max 60 characters | "Display name is required" / "Display name cannot exceed 60 characters" | On save |
| Username | Edit | Required, min 3 chars, max 30 chars, alphanumeric and underscores only, unique | "Username must be between 3 and 30 characters" / "Username can only contain letters, numbers, and underscores" / "This username is already taken" | On input blur and on save |
| Unsaved changes | Navigation | Warn buyer if navigating away with unsaved changes | "You have unsaved changes — discard or continue editing?" | On back navigation |

---

---

# **Feature 2 — Account Settings**

---

## **7\. Story & Story Narrative**

**Story** As a buyer, I want to manage my core account settings so I can keep my email address current and control how I access the platform.

**Story Narrative** Buyer navigates to Settings → Account Settings to update their email address or manage their linked authentication methods (Google, Apple). Changes are confirmed via email verification before taking effect to protect the account from unauthorised changes.

Benefit: Ensures communication reliability, keeps account access credentials current, and protects the buyer from missing important order or dispute notifications due to an outdated email address.

---

## **8\. User Flow**

**Preconditions**

* Buyer is authenticated  
* Buyer has navigated to Profile → Settings → Account Settings

**Main Flow — Update Email**

1. Buyer taps Account Settings from Settings menu  
2. Account Settings page loads showing:  
   * Current email address (partially masked e.g. j\*\*\*@gmail.com)  
   * Linked accounts (Google / Apple if connected)  
   * Account type (Buyer / Seller / Both)  
3. Buyer taps email field to edit  
4. New email address entered  
5. Buyer taps Save  
6. Verification email sent to the new address  
7. Buyer opens email and taps verification link  
8. Email address updated on confirmation of verification link  
9. Buyer notified at old email address that the email has been changed

**Alternative Flow — Manage Linked Accounts**

1. Buyer sees linked Google or Apple account in Account Settings  
2. Buyer taps Unlink next to a linked account  
3. Confirmation prompt: "Are you sure you want to unlink \[Google / Apple\]? You will need to use your email and password to log in."  
4. Buyer confirms  
5. Linked account removed — email and password login required going forward

**Post Conditions**

* Email address has been updated and verified  
* Old email has been notified of the change as a security measure  
* Linked account changes are reflected immediately

---

## **9\. Acceptance Criteria**

* Account Settings page shows current email (partially masked), linked accounts, and account type  
* Buyer can update email address — verification email sent to new address before change takes effect  
* Email change does not take effect until verification link is clicked — old email remains active until then  
* Buyer receives a security notification at their old email address when email is changed  
* Linked Google and Apple accounts are shown with Unlink option  
* Buyer cannot unlink all authentication methods — at least one must remain (email/password or linked account)  
* Account type (Buyer / Seller / Both) is display-only — not editable by buyer  
* Page loads within 2 seconds

---

## **10\. Business Rules**

* Email change requires verification at the new address before it takes effect — unverified email changes do not update the account  
* A security notification is always sent to the previous email address when an email change is completed — this cannot be disabled  
* Buyer must retain at least one active authentication method — unlinking a social account when no password is set is blocked until a password is created  
* Email address must be unique across all platform accounts — an email already associated with another account cannot be used  
* Account type is system-determined based on activity — a buyer who creates a listing becomes Buyer / Seller automatically

---

## **11\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Email address | Update email | Required, valid email format, unique across platform | "Please enter a valid email address" / "This email is already associated with an account" | On input blur and on save |
| Verification link | Email change | Link must be clicked within 24 hours of being sent | If expired: "This verification link has expired — request a new one" | On link click |
| Unlink account | Remove linked auth | At least one auth method must remain | "You must have at least one login method. Set a password before unlinking \[Google / Apple\]." | On unlink tap |

---

---

# **Feature 3 — Notifications**

---

## **12\. Story & Story Narrative**

**Story** As a buyer, I want to control which notifications I receive so I only get alerts that are relevant to me and my activity.

**Story Narrative** Buyer navigates to Settings → Notifications and sees toggles for each notification type. They turn off promotional emails while keeping order updates and message alerts active. Their inbox is no longer cluttered with irrelevant platform communications.

Benefit: Reduces notification fatigue and unsubscribe rates, ensures buyers only receive alerts they value, and keeps platform communication respectful and targeted.

---

## **13\. User Flow**

**Preconditions**

* Buyer is authenticated  
* Buyer has navigated to Profile → Settings → Notifications

**Main Flow**

1. Buyer taps Notifications from Settings menu  
2. Notifications page loads showing all notification categories with toggles:  
   * Order updates (dispatched, delivered, escrow released) — default ON  
   * Messages (new message from seller) — default ON  
   * Price drops (saved item price reduced) — default ON  
   * Dispute updates (ruling made, evidence requested) — default ON  
   * Promotions and platform news — default OFF  
3. Each category has separate toggles for in-app and email notification channels  
4. Buyer toggles preferences on or off  
5. Changes saved automatically on toggle — no Save button required  
6. Preferences take effect immediately

**Post Conditions**

* Notification preferences are saved against buyer's account  
* Changes take effect immediately — next notifications fired reflect updated preferences  
* Preferences persist across devices and sessions

---

## **14\. Acceptance Criteria**

* Notifications page accessible from Settings → Notifications  
* All notification categories shown with individual toggles  
* Separate toggles for in-app and email channels per category  
* Default states: order updates ON, messages ON, price drops ON, dispute updates ON, promotions OFF  
* Toggle changes are saved automatically — no explicit Save button required  
* Changes take effect immediately — next notification in that category respects the updated preference  
* Order updates and dispute update notifications cannot be fully disabled — these are critical transaction notifications; email can be toggled but in-app remains mandatory  
* Preferences persist across all devices for the authenticated account

---

## **15\. Business Rules**

* Order updates and dispute notifications are mandatory in-app — buyers cannot turn off in-app notifications for these categories as they are critical to transaction and dispute management  
* Email notifications for order updates and disputes can be toggled off — buyer assumes responsibility for monitoring the app  
* Promotional notifications are off by default and require explicit opt-in — this complies with GDPR email marketing consent requirements  
* Notification preferences are account-level — they apply across all devices where the buyer is authenticated  
* Turning off a notification category does not delete historical notifications — past notifications remain visible in the in-app notification centre

---

## **16\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Order updates — in-app toggle | Mandatory notification | Cannot be toggled off | Toggle shown as locked/greyed — tapping shows: "Order update notifications cannot be disabled — they keep you informed about your purchases" | On toggle tap |
| Dispute updates — in-app toggle | Mandatory notification | Cannot be toggled off | Toggle shown as locked/greyed — tapping shows: "Dispute notifications cannot be disabled — they are required to protect your purchases" | On toggle tap |
| Auto-save | Preference change | Change must be saved immediately on toggle | If auto-save fails: error toast shown "Unable to save preference — please try again"; toggle reverts to previous state | On toggle change |

---

---

# **Feature 4 — Payments**

---

## **17\. Story & Story Narrative**

**Story** As a buyer, I want to manage my saved payment methods and payout bank details so I can pay quickly at checkout and receive earnings from my sales promptly.

**Story Narrative** Buyer navigates to Settings → Payments to add or remove a saved card for checkout or to link a bank account for receiving sale proceeds. All payment data is handled securely by Stripe — the platform never stores raw card or bank details directly.

Benefit: Ensures payment and payout methods are always current, prevents checkout failures due to expired cards, and gives sellers confidence that their earnings will reach the correct account.

---

## **18\. User Flow**

**Preconditions**

* Buyer is authenticated  
* Buyer has navigated to Profile → Settings → Payments

**Main Flow — Add Saved Card**

1. Buyer taps Payments from Settings menu  
2. Payments page loads showing:  
   * Saved cards section — lists any saved cards with brand, last 4 digits, expiry  
   * Bank account section — linked bank account for payouts (if added)  
3. Buyer taps "Add card"  
4. Stripe card entry form opens: card number, expiry, CVV, name on card  
5. Buyer enters card details  
6. Buyer taps Save  
7. Card saved via Stripe tokenisation  
8. New card appears in saved cards list

**Alternative Flow — Remove Saved Card**

1. Buyer taps the × or Remove option next to a saved card  
2. Confirmation prompt: "Remove this card?"  
3. Buyer confirms  
4. Card removed from saved list — no longer available at checkout

**Alternative Flow — Add Bank Account for Payouts**

1. Buyer taps "Add bank account" in the bank account section  
2. Stripe Connect form opens: account holder name, sort code, account number  
3. Buyer enters bank details  
4. Buyer taps Save  
5. Bank account linked via Stripe Connect  
6. Payouts from sales will be sent to this account

**Post Conditions**

* Saved cards are updated and available at next checkout  
* Bank account is linked and will receive future payouts  
* Removed cards are no longer available at checkout  
* All payment data is stored securely by Stripe — not by the platform directly

---

## **19\. Acceptance Criteria**

* Payments page accessible from Settings → Payments  
* Saved cards listed with: card brand logo, last 4 digits, expiry date  
* Buyer can add a new card via Stripe card entry form  
* Buyer can remove any saved card — confirmation prompt shown before removal  
* Maximum 3 saved cards per account  
* Bank account section shows linked account with masked sort code and account number  
* Buyer can add a bank account via Stripe Connect  
* Buyer can remove and replace the linked bank account  
* "Powered by Stripe" label shown on all payment entry forms  
* No raw card or bank data is stored by the platform — all data handled by Stripe  
* Page loads within 2 seconds

---

## **20\. Business Rules**

* All payment data is tokenised and stored by Stripe — The Kit Loop never stores raw card numbers, CVVs, or full bank account numbers directly  
* Maximum of 3 saved cards per account — buyer must remove an existing card before adding a fourth  
* Removing a saved card does not affect any in-progress orders or escrow payments already processed with that card  
* A bank account linked for payouts can be updated at any time — the new bank account receives all future payouts; past payouts are not affected  
* Payout bank account must be a UK account in v1 — international bank accounts are not supported  
* If a saved card expires, it remains in the saved cards list with an "Expired" label — buyer must remove it manually or add a new card

---

## **21\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Card number | Add card | 16 digits, numeric, Luhn valid | "Please enter a valid card number" | On input blur |
| Card expiry | Add card | MM/YY format, must be a future date | "Please enter a valid expiry date" / "This card has expired" | On input blur |
| CVV | Add card | 3 digits (4 for Amex) | "Please enter a valid CVV" | On save tap |
| Name on card | Add card | Required, letters and spaces, max 60 characters | "Please enter the name as it appears on your card" | On save tap |
| Sort code | Add bank account | 6 digits, numeric | "Please enter a valid sort code" | On input blur |
| Account number | Add bank account | 8 digits, numeric | "Please enter a valid account number" | On input blur |
| Max saved cards | Add card | Maximum 3 saved cards | "You have reached the maximum of 3 saved cards. Remove a card before adding a new one." | On add card tap |
| Remove card confirmation | Remove action | Buyer must confirm before removal | Confirmation prompt shown — removal only on confirm | On remove tap |

---

---

# **Feature 5 — Privacy**

---

## **22\. Story & Story Narrative**

**Story** As a buyer, I want to control my privacy settings so I can manage what information is visible to others and how my data is used by the platform.

**Story Narrative** Buyer navigates to Settings → Privacy to review and adjust their profile visibility and data sharing preferences. Privacy-conscious buyers can restrict their profile from being publicly visible while still transacting on the platform.

Benefit: Gives users agency over their personal data, supports GDPR compliance, and builds trust with privacy-conscious users who may otherwise hesitate to register or engage fully with the platform.

---

## **23\. User Flow**

**Preconditions**

* Buyer is authenticated  
* Buyer has navigated to Profile → Settings → Privacy

**Main Flow**

1. Buyer taps Privacy from Settings menu  
2. Privacy settings page loads with the following controls:  
   * Profile visibility — Public or Private toggle  
   * Data sharing for personalisation — toggle (allows platform to use browsing data to personalise content)  
   * Data sharing for analytics — toggle (allows anonymised usage data to be used for platform analytics)  
3. Buyer reviews current settings  
4. Buyer adjusts toggles as preferred  
5. Changes saved automatically on toggle  
6. Settings take effect immediately

**Alternative Flow — Request Data Download**

1. Buyer taps "Download my data" option on Privacy page  
2. Platform generates a downloadable file of all personal data held against the buyer's account  
3. Download link sent to buyer's registered email within 24 hours  
4. Buyer downloads and reviews their data

**Alternative Flow — Request Account Deletion**

1. Buyer taps "Delete my account" on Privacy page  
2. Warning shown: "Deleting your account is permanent. All your data will be removed. Active orders must be completed before deletion."  
3. If active orders exist: deletion blocked until all orders are completed or resolved  
4. If no active orders: buyer confirms deletion  
5. Account scheduled for deletion — 30-day grace period during which buyer can cancel the deletion  
6. After 30 days: account and personal data deleted in accordance with GDPR

**Post Conditions**

* Privacy preferences are saved and take effect immediately  
* Profile visibility reflects the buyer's chosen setting across all platform surfaces  
* Data download or deletion request has been initiated if requested

---

## **24\. Acceptance Criteria**

* Privacy page accessible from Settings → Privacy  
* Profile visibility toggle: Public (profile visible to other users) or Private (profile visible to buyer only)  
* Data sharing for personalisation toggle — default ON  
* Data sharing for analytics toggle — default ON  
* All toggles auto-save on change — no explicit Save button required  
* "Download my data" option available — generates GDPR data export sent to registered email within 24 hours  
* "Delete my account" option available — blocked if active orders exist; 30-day grace period before permanent deletion  
* Changes to profile visibility take effect across all platform surfaces within 60 seconds  
* Page loads within 2 seconds

---

## **25\. Business Rules**

* Profile visibility set to Private hides the buyer's profile page from other users — it does not affect the buyer's ability to purchase, sell, or message on the platform  
* Data sharing for personalisation toggle controls whether the platform uses browsing and purchase history to personalise content — turning it off reverts all surfaces to default non-personalised display  
* Data sharing for analytics uses anonymised data only — no personally identifiable information is used in analytics if the toggle is on  
* GDPR right to data portability is supported via the Download my data function — data export must be provided within 30 days of request; the platform targets 24 hours  
* GDPR right to erasure is supported via Delete my account — personal data is deleted after the 30-day grace period; anonymised transaction records are retained for legal and financial compliance  
* Account deletion cannot be processed while active orders or unresolved disputes exist — buyer must complete all obligations before deletion is permitted  
* The 30-day grace period for account deletion allows the buyer to cancel the deletion if they change their mind — after 30 days deletion is irreversible

---

## **26\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Profile visibility toggle | Privacy setting | Must be Public or Private — no null state | Default to Public if no preference set | On render |
| Delete my account | Deletion request | No active orders or unresolved disputes | "You have active orders that must be completed before your account can be deleted" | On delete tap |
| Auto-save | Toggle change | Change saved immediately | If save fails: error toast; toggle reverts to previous state | On toggle change |
| Data download | Export request | Valid authenticated session required | If session invalid: redirect to login | On download request |

---

---

# **Feature 6 — Security**

---

## **27\. Story & Story Narrative**

**Story** As a buyer, I want to manage my account security settings so my account and payment details are protected from unauthorised access.

**Story Narrative** Buyer navigates to Settings → Security to change their password or enable two-factor authentication. After enabling 2FA, their account requires both a password and a one-time code on every login — significantly reducing the risk of unauthorised access even if their password is compromised.

Benefit: Protects buyer accounts and linked payment data, reduces platform fraud risk, and gives buyers peace of mind that their account cannot be easily compromised by a third party.

---

## **28\. User Flow**

**Preconditions**

* Buyer is authenticated  
* Buyer has navigated to Profile → Settings → Security

**Main Flow — Change Password**

1. Buyer taps Security from Settings menu  
2. Security page loads showing:  
   * Change password section  
   * Two-factor authentication (2FA) section  
   * Active sessions section  
3. Buyer taps Change Password  
4. Form shown:  
   * Current password  
   * New password  
   * Confirm new password  
5. Buyer enters current password to verify identity  
6. Buyer enters and confirms new password  
7. Buyer taps Save  
8. Password updated immediately  
9. Security notification sent to buyer's registered email: "Your password was changed. If this was not you, contact support immediately."

**Main Flow — Enable Two-Factor Authentication**

1. Buyer taps Enable 2FA in the 2FA section  
2. Options shown: Authenticator App or SMS  
3. Buyer selects preferred method  
4. For Authenticator App: QR code displayed — buyer scans with authenticator app (e.g. Google Authenticator)  
5. Buyer enters the 6-digit code from authenticator app to confirm setup  
6. 2FA enabled — confirmation shown  
7. On future logins: buyer prompted for 6-digit code after password entry

**Alternative Flow — Disable 2FA**

1. Buyer taps Disable 2FA  
2. Buyer must enter current password and a valid 2FA code to confirm disable  
3. 2FA removed from account  
4. Security notification sent to registered email

**Alternative Flow — View and Revoke Active Sessions**

1. Buyer scrolls to Active Sessions section  
2. List of all current login sessions shown: device type, location (approximate), last active timestamp  
3. Buyer identifies an unrecognised session  
4. Buyer taps Revoke next to the session  
5. Session terminated immediately — that device is logged out

**Post Conditions**

* Password has been updated and security notification sent  
* 2FA is enabled and will be required on all future logins  
* Revoked sessions are logged out immediately  
* All security changes are logged in the account activity record

---

## **29\. Acceptance Criteria**

* Security page accessible from Settings → Security  
* Change Password form requires: current password, new password, confirm new password  
* New password and confirm new password must match before save is permitted  
* Password updated immediately on save — security email sent within 5 minutes  
* 2FA section shows current status: Enabled or Disabled  
* Buyer can enable 2FA via Authenticator App or SMS  
* For Authenticator App: QR code displayed and 6-digit code verification required to complete setup  
* For SMS: buyer enters their mobile number and a verification code sent by SMS to confirm  
* Disabling 2FA requires current password and a valid 2FA code — cannot be disabled with password only  
* Active Sessions section shows all current login sessions with device, approximate location, and last active time  
* Buyer can revoke any individual session — revoked session is logged out within 30 seconds  
* Security notification email sent for: password change, 2FA enable, 2FA disable, and session revocation  
* Page loads within 2 seconds

---

## **30\. Business Rules**

* Current password must be verified before a new password can be set — password change cannot be completed without confirming the existing password  
* Password must meet minimum security requirements — these are enforced at the field level  
* Security notification emails are sent for all security-sensitive changes — they cannot be disabled by the buyer and are not subject to notification preferences set in the Notifications settings  
* Disabling 2FA requires both the current password and a valid 2FA code — this dual verification prevents an attacker who only has the password from disabling 2FA  
* Active sessions are shown for the past 90 days — sessions older than 90 days are automatically expired and removed  
* Revoking a session logs that device out immediately — the user on that device must re-authenticate to regain access  
* If a buyer has forgotten their password they must use the Forgot Password flow on the login page — password reset is not available from within Settings as it requires the current password to proceed

---

## **31\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Current password | Change password | Required, must match account's current password | "Current password is incorrect" | On save tap |
| New password | Change password | Required, min 8 characters, at least 1 uppercase, 1 number, 1 special character | "Password must be at least 8 characters and include an uppercase letter, a number, and a special character" | On input blur and on save |
| Confirm new password | Change password | Must match new password exactly | "Passwords do not match" | On input blur and on save |
| 2FA code — setup | Enable 2FA | 6-digit numeric code from authenticator app or SMS | "Invalid code — please check your authenticator app and try again" | On setup confirm |
| 2FA code — disable | Disable 2FA | Valid 6-digit code required alongside current password | "Invalid code — please enter a valid 2FA code to disable two-factor authentication" | On disable confirm |
| SMS mobile number | 2FA via SMS | Valid UK mobile number format | "Please enter a valid UK mobile number" | On input blur |
| Session revoke | Active sessions | Session must still be active | If session already expired: removed from list silently | On revoke tap |

# **SRS — Account | Auth**

**Platform:** The Kit Loop | **User:** Buyer | **Module:** Account | **Sub-Module:** Auth | **Version:** 1.0

---

## **1\. Feature Overview**

The Auth sub-module handles all aspects of buyer identity on The Kit Loop — from first registration through to securely ending a session. It covers two features: Sign Up / Login gives buyers a fast, low-friction way to create an account or return to the platform using email, Google, or Apple; Log Out gives buyers the ability to end their session securely from any device. Together these features form the entry and exit points of the authenticated buyer experience. Authentication is a prerequisite for purchasing, wishlisting, messaging, and accessing any account section — guests can browse but must authenticate before transacting.

There are two features within this sub-module:

* **Feature 1 — Sign Up / Login**  
* **Feature 2 — Log Out**

---

---

# **Feature 1 — Sign Up / Login**

---

## **2\. Story & Story Narrative**

**Story** As a buyer, I want to sign up or log in quickly so I can access the platform and start buying without a lengthy registration process.

**Story Narrative** A new buyer discovers The Kit Loop and wants to purchase an item. They tap Sign Up, choose Google, and their account is created instantly using their existing Google profile — no forms to fill in, no verification email to wait for. A returning buyer taps Login, selects their saved method, and is back in their account within seconds. In both cases the buyer is returned to exactly where they were before authentication was triggered — whether that is a listing detail, checkout, or the homepage.

Benefit: Minimises onboarding drop-off by offering fast, familiar authentication methods, reduces form-fill friction for new buyers, and allows buyers to go from discovery to purchase in the shortest possible time.

---

## **3\. User Flow**

**Preconditions**

* Buyer is on any page of the platform as a guest  
* Authentication has been triggered either by tapping Sign Up / Login in the navigation or by attempting a gated action (Buy Now, Make Offer, Wishlist)

**Main Flow — Sign Up with Google**

1. Buyer taps "Sign up" in the global navigation or is prompted by a gated action  
2. Auth screen loads showing three options:  
   * Continue with Google  
   * Continue with Apple  
   * Sign up with Email  
3. Buyer taps "Continue with Google"  
4. Google OAuth sheet opens  
5. Buyer selects their Google account  
6. Google authenticates and returns to The Kit Loop  
7. Account created automatically using Google profile name and email  
8. Buyer prompted to set a username (if not already assigned from Google profile)  
9. Account created and buyer is authenticated  
10. Buyer returned to the page or action that triggered authentication

**Main Flow — Sign Up with Apple**

1. Buyer taps "Continue with Apple"  
2. Apple Sign In sheet opens  
3. Buyer authenticates with Face ID, Touch ID, or Apple ID password  
4. Buyer chooses to share or hide their email (Apple private relay email accepted)  
5. Account created using Apple profile data  
6. Buyer prompted to set a username  
7. Buyer authenticated and returned to triggering page or action

**Main Flow — Sign Up with Email**

1. Buyer taps "Sign up with Email"  
2. Email registration form loads:  
   * Email address  
   * Password  
   * Confirm password  
   * Username  
3. Buyer fills in all fields  
4. Buyer taps Create Account  
5. Verification email sent to registered address  
6. Buyer opens email and taps verification link  
7. Account verified and activated  
8. Buyer authenticated and returned to triggering page or action

**Main Flow — Login with Google or Apple**

1. Returning buyer taps "Login" in the global navigation  
2. Auth screen loads with same three options  
3. Buyer taps the method used when they registered  
4. OAuth or Apple Sign In completes  
5. Buyer authenticated and returned to where they left off

**Main Flow — Login with Email**

1. Returning buyer taps "Login"  
2. Buyer taps "Sign up with Email" section — toggle to login view  
3. Login form loads:  
   * Email address  
   * Password  
4. Buyer enters credentials  
5. Buyer taps Log In  
6. Credentials validated  
7. Buyer authenticated and returned to where they left off

**Alternative Flow — Forgot Password**

1. Buyer on login form taps "Forgot password?"  
2. Email entry screen shown  
3. Buyer enters their registered email address  
4. Password reset email sent  
5. Buyer opens email and taps reset link  
6. Password reset form shown: new password and confirm new password  
7. Buyer sets new password  
8. Password updated — buyer redirected to login  
9. Buyer logs in with new password

**Alternative Flow — Gated Action Triggers Auth**

1. Guest buyer taps Buy Now, Make Offer, or Wishlist heart  
2. Auth screen appears as a modal or bottom sheet — buyer does not lose their place on the listing  
3. Buyer authenticates via any method  
4. Returned to the same listing detail with the gated action automatically resumed:  
   * Buy Now → checkout opens  
   * Wishlist → item saved to Favourites; heart shows filled state  
   * Make Offer → messages page opens for that listing

**Post Conditions**

* Buyer is authenticated with a valid session token  
* For new accounts: account record created with username, email, and auth method stored  
* For returning buyers: session restored; account data accessible  
* Buyer is on the page or action that triggered authentication — no redirect to an unrelated page  
* Verification email sent for email sign up — account is active after verification

---

## **4\. Acceptance Criteria**

**Auth Screen**

* Auth screen is accessible from Sign Up and Login links in the global navigation  
* Auth screen is shown as a modal or bottom sheet when triggered by a gated action — full page when accessed from navigation  
* Three authentication options displayed: Continue with Google, Continue with Apple, Sign up with Email  
* Google and Apple options use official OAuth and Sign In with Apple SDKs  
* Auth screen is accessible to all guests — no prior action required to access it

**Sign Up — Google and Apple**

* Google and Apple sign up completes in a single flow — no additional forms beyond username selection  
* Username is auto-suggested from the buyer's Google or Apple profile name — buyer can edit before confirming  
* If the Google or Apple email is already registered, buyer is logged into the existing account — no duplicate account created  
* Account created and buyer authenticated within 5 seconds of OAuth completion

**Sign Up — Email**

* Email registration form collects: email address, password, confirm password, username  
* Verification email sent within 2 minutes of form submission  
* Account is not fully active until email is verified — buyer can browse but cannot transact until verified  
* Verification link expires after 24 hours — buyer can request a new link if expired  
* If email is already registered: inline notice shown "An account with this email already exists — log in instead" with Login CTA

**Login**

* Login with Google and Apple uses the same OAuth flow as sign up — no separate login form for social auth  
* Login with email requires email address and password  
* Incorrect credentials show: "Incorrect email or password — please try again"  
* After 5 consecutive failed login attempts: account temporarily locked for 15 minutes; buyer notified by email  
* Successful login restores buyer to where they were before authentication was triggered

**Forgot Password**

* Forgot Password link available on the email login form  
* Password reset email sent within 2 minutes of request  
* Reset link expires after 1 hour  
* New password must meet minimum security requirements  
* After password reset buyer is directed to the login screen — not automatically authenticated

**General**

* Authentication state persists across sessions — buyer remains logged in until they explicitly log out or session expires  
* Session expires after 30 days of inactivity — buyer prompted to log in again  
* Authentication is required for: Buy Now, Make Offer, Wishlist, accessing /orders, /profile, /messages  
* Authentication is not required for: browsing listings, viewing listing detail, searching and filtering, accessing /how-it-works

---

## **5\. Business Rules**

* Each email address can only be associated with one account — duplicate accounts on the same email are not permitted  
* If a buyer attempts to sign up with Google or Apple using an email already registered via email/password, the system links the social auth to the existing account rather than creating a duplicate  
* A buyer who signs up with Apple and hides their email (Apple private relay) is registered with the relay address — this is treated as their account email for all platform communication  
* Email verification is required for email sign up before the buyer can transact — browsing is permitted before verification; purchasing, wishlisting, and messaging require a verified email  
* Social sign up via Google or Apple does not require email verification — the email is considered verified by the OAuth provider  
* Accounts created via Google or Apple do not have a platform password by default — buyer can set one in Settings → Security if they choose  
* Session tokens expire after 30 days of inactivity — active sessions are extended on each authenticated interaction  
* Failed login attempt lockout is applied after 5 consecutive failures within a 15-minute window — the lockout lasts 15 minutes; buyer is notified by email

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Email — sign up | Registration | Required, valid email format, unique across platform | "Please enter a valid email address" / "An account with this email already exists — log in instead" | On input blur and on submit |
| Password — sign up | Registration | Required, min 8 characters, at least 1 uppercase, 1 number, 1 special character | "Password must be at least 8 characters and include an uppercase letter, a number, and a special character" | On input blur and on submit |
| Confirm password | Registration | Must match password field exactly | "Passwords do not match" | On input blur and on submit |
| Username | Registration | Required, min 3 chars, max 30 chars, alphanumeric and underscores only, unique | "Username must be between 3 and 30 characters" / "Only letters, numbers, and underscores allowed" / "This username is already taken" | On input blur and on submit |
| Email — login | Login | Required, valid email format | "Please enter a valid email address" | On input blur |
| Password — login | Login | Required | "Please enter your password" | On submit |
| Login credentials | Login validation | Email and password must match account record | "Incorrect email or password — please try again" | On submit |
| Failed login attempts | Security | Max 5 consecutive failures | After 5th failure: "Too many failed attempts — your account has been temporarily locked. Try again in 15 minutes." — email sent to registered address | On 5th failed submit |
| Verification link | Email sign up | Must be clicked within 24 hours | "This verification link has expired — request a new verification email" with resend CTA | On link click |
| Password reset link | Forgot password | Must be used within 1 hour | "This reset link has expired — request a new password reset" with resend CTA | On link click |
| New password — reset | Forgot password | Same rules as sign up password | "Password must be at least 8 characters and include an uppercase letter, a number, and a special character" | On input blur and on submit |

---

---

# **Feature 2 — Log Out**

---

## **7\. Story & Story Narrative**

**Story** As a buyer, I want to log out of my account so my account and payment details are secure when I am on a shared or public device.

**Story Narrative** Buyer has finished using The Kit Loop on a shared device and wants to ensure no one else can access their account, saved cards, or order history. They navigate to Settings, tap Log Out, and their session is ended immediately. They are returned to the homepage as a guest.

Benefit: Protects buyer account and payment data on shared devices, demonstrates the platform's commitment to account security, and gives buyers full control over their active sessions.

---

## **8\. User Flow**

**Preconditions**

* Buyer is authenticated  
* Buyer has navigated to Profile → Settings

**Main Flow**

1. Buyer scrolls to the bottom of the Settings page  
2. "Log Out" is displayed in red text — visually distinct from other menu items  
3. Buyer taps Log Out  
4. Confirmation prompt shown: "Are you sure you want to log out?"  
5. Buyer taps Confirm  
6. Session token invalidated immediately  
7. Buyer is redirected to the homepage as a guest  
8. All account data is cleared from the device session — no cached profile, orders, or payment data accessible without re-authentication

**Alternative Flow — Log Out from Active Session via Security Settings**

1. Buyer navigates to Settings → Security → Active Sessions  
2. Buyer sees a session on another device they want to end  
3. Buyer taps Revoke next to that session  
4. That device's session is ended immediately  
5. The device that was revoked is logged out on next platform interaction

**Alternative Flow — Automatic Session Expiry**

1. Buyer has not used the platform for 30 days  
2. Session token expires automatically  
3. On next visit buyer is shown the homepage as a guest  
4. Login prompt shown when buyer attempts any authenticated action

**Post Conditions**

* Buyer's session is invalidated on the device they logged out from  
* Buyer is on the homepage as a guest  
* All account data is cleared from the local session — not accessible without re-authentication  
* No data is deleted from the buyer's account — only the session is ended; all account data persists for next login  
* If buyer logs out while on a page that requires authentication, they are redirected to the homepage — not left on a broken page

---

## **9\. Acceptance Criteria**

* Log Out option is visible at the bottom of the Settings page in red text  
* Log Out is not accessible from any other page — it is Settings-only in v1  
* Confirmation prompt shown before log out is executed — buyer must confirm  
* On confirmation: session token invalidated within 1 second  
* Buyer redirected to homepage immediately after session invalidation  
* Homepage loads in guest state — no profile icon, no account data visible  
* Back navigation after log out does not restore the authenticated session — browser back returns to homepage in guest state  
* If buyer attempts to access an authenticated page via URL after logging out, they are redirected to the auth screen  
* Log Out applies to the current device and session only — other active sessions on other devices are not affected unless revoked via Security Settings  
* Automatic session expiry after 30 days of inactivity behaves identically to a manual log out from the buyer's perspective

---

## **10\. Business Rules**

* Log Out invalidates the session token on the server — it is not a client-side only action; the token cannot be reused after log out  
* Confirmation prompt is always shown before log out — there is no single-tap log out without confirmation  
* Log Out only ends the current device session — other active sessions (e.g. on a second phone or tablet) remain active until the buyer explicitly revokes them in Security Settings  
* No account data is deleted on log out — orders, favourites, messages, and settings are all preserved and accessible on next login  
* If a buyer logs out while an order is in progress or a dispute is active, those processes continue unaffected — the buyer must log in again to take action  
* Session tokens are server-side invalidated on log out — a stolen or cached token cannot be used to access the account after the buyer has logged out  
* Automatic session expiry after 30 days of inactivity is a security measure — it cannot be disabled by the buyer in v1

---

## **11\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Log Out confirmation | Confirmation prompt | Buyer must confirm before log out executes | If buyer taps Cancel: no action taken; buyer remains on Settings page | On Log Out tap |
| Session token invalidation | Server-side | Token must be invalidated on server immediately | If invalidation fails: retry up to 3 times; if persistent failure: session flagged for forced expiry; support alerted | On confirm tap |
| Post-logout navigation | Redirect | Authenticated pages must not be accessible after log out | Any authenticated URL accessed after log out redirects to auth screen | On page load post-logout |
| Back navigation | Session check | Browser back must not restore authenticated session | Back navigation after log out returns to homepage in guest state — session is not restored | On browser back |

# **SRS — Listing | Create Listing**

**Platform:** The Kit Loop | **User:** Seller | **Module:** Listing | **Sub-Module:** Create Listing | **Version:** 1.0

---

## **1\. Feature Overview**

The Create Listing sub-module is the primary tool sellers use to put their sports gear on The Kit Loop marketplace. It is a single-page form accessible from the Sell Now CTA and guides the seller through all required and optional fields needed to create a complete, accurate, and discoverable listing. The form is designed to be as frictionless as possible — fields are structured, options are predefined where possible, and parcel size is auto-recommended based on category selection to reduce guesswork. A listing cannot be published without completing all required fields. On successful submission the listing goes live immediately and the seller is shown a confirmation screen.

There are ten features within this sub-module:

* **Feature 1 — Add Photos / Video**  
* **Feature 2 — Set Title**  
* **Feature 3 — Write Description**  
* **Feature 4 — Select Category**  
* **Feature 5 — Select Brand**  
* **Feature 6 — Set Condition**  
* **Feature 7 — Choose Colour**  
* **Feature 8 — Set Price**  
* **Feature 9 — Choose Parcel Size**  
* **Feature 10 — Upload / Publish**

---

---

# **Feature 1 — Add Photos / Video**

---

## **2\. Story & Story Narrative**

**Story** As a seller, I want to upload photos or a video of my item so buyers can see exactly what they are purchasing and feel confident enough to buy.

**Story Narrative** Seller taps the photo upload area at the top of the sell form, selects multiple photos from their device, and the first photo is automatically set as the main listing image. Good photos are the single biggest driver of buyer confidence and purchase conversion — a listing with clear, accurate photos sells faster and generates fewer disputes.

Benefit: Higher quality visuals directly increase buyer confidence and conversion rate, and reduce post-purchase disputes caused by items not matching buyer expectations.

---

## **3\. User Flow**

**Preconditions**

* Seller is authenticated  
* Seller has navigated to /sell  
* Sell an Item form is loaded

**Main Flow**

1. Seller taps the photo upload area at the top of the form — labelled "Add Photos or Video — Tap to get started"  
2. Device photo picker opens  
3. Seller selects one or more photos from camera roll or captures new photos  
4. Selected photos are uploaded and displayed as thumbnails in the photo strip  
5. First uploaded photo is automatically tagged as Main  
6. Seller can tap any thumbnail to reorder — dragging a photo to the first position sets it as Main  
7. Seller can tap × on any thumbnail to remove that photo  
8. Seller can add a video by tapping the \+ icon — one video permitted per listing  
9. Photo strip shows up to 10 photo slots — seller can upload between 1 and 10 photos

**Alternative Flow — Remove a Photo**

1. Seller taps × on a photo thumbnail  
2. Photo removed from the strip  
3. If the removed photo was the Main photo, the next photo in the strip automatically becomes Main

**Post Conditions**

* At least one photo is uploaded and displayed in the form  
* First photo in the strip is tagged as Main — this is the photo shown on listing cards in search and browse  
* Photos are stored against the draft listing and will be published when the seller taps Upload

---

## **4\. Acceptance Criteria**

* Photo upload area is displayed at the top of the sell form with clear tap-to-upload prompt  
* Accepted formats: JPG, PNG — max 10MB per photo  
* Video accepted: MP4 — max 50MB, max 60 seconds, one video per listing  
* Minimum 1 photo required — Upload button disabled until at least one photo is uploaded  
* Maximum 10 photos per listing  
* First uploaded photo is automatically tagged as Main with a visible Main badge  
* Seller can reorder photos by drag and drop — first position always tagged as Main  
* Seller can remove any photo by tapping × on its thumbnail  
* Photos display as square thumbnails in the upload strip  
* Upload progress indicator shown while photos are uploading  
* If a photo fails to upload: inline error shown for that photo only; other photos unaffected

---

## **5\. Business Rules**

* At least one photo is mandatory — a listing cannot be published without a photo  
* The Main photo is always the first photo in the strip — reordering photos changes which photo is shown on listing cards  
* Photos must not contain prohibited content — admin can remove a listing if photos violate platform guidelines  
* Video is optional and supplementary to photos — it does not replace the photo requirement  
* Photos are stored securely and associated with the listing — they are not publicly accessible outside the listing detail page

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Photo format | Upload | JPG or PNG only | "Invalid file type — please upload JPG or PNG images" | On file select |
| Photo size | Upload | Max 10MB per photo | "This photo is too large — maximum file size is 10MB" | On file select |
| Photo count | Upload | Min 1, max 10 | "You can upload a maximum of 10 photos" — additional uploads blocked | On file select |
| Video format | Upload | MP4 only | "Invalid file type — please upload an MP4 video" | On file select |
| Video size | Upload | Max 50MB | "Video is too large — maximum file size is 50MB" | On file select |
| Video duration | Upload | Max 60 seconds | "Video is too long — maximum duration is 60 seconds" | On upload |
| Video count | Upload | Max 1 video per listing | "Only one video per listing is allowed" | On file select |
| Minimum photo | Publish | At least 1 photo required | Upload button disabled; "Please add at least one photo before publishing" | On Upload tap |

---

---

# **Feature 2 — Set Title**

---

## **7\. Story & Story Narrative**

**Story** As a seller, I want to set a clear and descriptive title for my listing so buyers can find my item in search results and understand exactly what is being sold.

**Story Narrative** Seller types a descriptive title for their item — including brand, model, and key spec — that appears on the listing card and in search results. A specific, accurate title improves search discoverability and attracts the right buyers.

Benefit: A clear title improves search ranking, attracts relevant buyers, and sets accurate expectations before a buyer even opens the listing detail.

---

## **8\. User Flow**

**Preconditions**

* Seller is on the sell form  
* Photo section has been completed or seller is filling the form sequentially

**Main Flow**

1. Seller taps the Title field  
2. Keyboard appears  
3. Seller types a descriptive title (e.g. "Gray-Nicolls Kronus 1500 Cricket Bat — Short Handle")  
4. Character count updates as seller types  
5. Seller taps Next or moves to the next field

**Post Conditions**

* Title is entered and saved against the draft listing  
* Title will appear on the listing card in search, browse, and the listing detail page

---

## **9\. Acceptance Criteria**

* Title field displays placeholder text: "Tell buyers what you're selling"  
* Required field — Upload button disabled until title is entered  
* Minimum 5 characters  
* Maximum 80 characters  
* Character count shown below the field  
* Title is displayed on the listing card in search results, browse, homepage featured grid, and listing detail page  
* No HTML or special formatting accepted — plain text only

---

## **10\. Business Rules**

* Title is mandatory — a listing cannot be published without a title  
* Title must accurately represent the item — admin can remove listings with misleading titles  
* Title is plain text only — HTML tags, markdown, or special characters beyond standard punctuation are stripped on save

---

## **11\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Title | Entry | Required, min 5 characters, max 80 characters | "Please enter a title" / "Title must be at least 5 characters" / "Title cannot exceed 80 characters" | On input blur and on Upload tap |
| Title content | Entry | Plain text only — no HTML or script tags | HTML tags stripped silently on save | On save |

---

---

# **Feature 3 — Write Description**

---

## **12\. Story & Story Narrative**

**Story** As a seller, I want to write a description of my item so buyers have all the information they need to make a confident purchase decision.

**Story Narrative** Seller writes a description covering the item's condition, age, usage history, and any defects. A thorough description reduces pre-purchase questions from buyers and significantly reduces the risk of a post-purchase dispute.

Benefit: Accurate descriptions reduce disputes, build buyer confidence, and reflect positively on the seller's reputation and ratings.

---

## **13\. User Flow**

**Preconditions**

* Seller is on the sell form

**Main Flow**

1. Seller taps the Description field  
2. Keyboard appears  
3. Seller types a detailed description of the item  
4. Character count updates as seller types  
5. Seller taps Next or moves to the next field

**Post Conditions**

* Description entered and saved against the draft listing  
* Full description displayed on the listing detail page

---

## **14\. Acceptance Criteria**

* Description field displays placeholder text: "Tell buyers more about it"  
* Required field — Upload button disabled until description is entered  
* Minimum 20 characters  
* Maximum 1000 characters  
* Character count shown below the field — counter shown from 800 characters  
* Full description displayed on listing detail page  
* Descriptions over 500 characters shown with "Read more" toggle on listing detail

---

## **15\. Business Rules**

* Description is mandatory — listing cannot be published without a description  
* Description must accurately represent the item — misleading descriptions are grounds for listing removal and seller violation  
* Plain text only — no HTML, links, or contact details permitted in the description; contact details are stripped on save and seller warned

---

## **16\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Description | Entry | Required, min 20 characters, max 1000 characters | "Please write a description" / "Description must be at least 20 characters" / "Description cannot exceed 1000 characters" | On input blur and on Upload tap |
| Contact details | Content scan | No phone numbers, emails, or external URLs | Detected content stripped; inline warning: "Contact details cannot be included in descriptions — please keep all communication on The Kit Loop" | On save |

---

---

# **Feature 4 — Select Category**

---

## **17\. Story & Story Narrative**

**Story** As a seller, I want to select the correct sport and product category for my item so it appears in the right browse section and is discoverable by the right buyers.

**Story Narrative** Seller taps the Category field and selects from the platform's full sport and sub-category taxonomy — 17 sports with 87 product sub-categories. Correct categorisation ensures the listing appears in sport-filtered browse results and the right category-based search queries.

Benefit: Correct categorisation directly improves listing discoverability, attracts the right buyers, and ensures the listing appears when buyers filter by sport or sub-category.

---

## **18\. User Flow**

**Preconditions**

* Seller is on the sell form

**Main Flow**

1. Seller taps the Category field — displays "Select category" placeholder  
2. Category selector opens as a bottom sheet or new screen  
3. First level: list of all 17 active sports shown (Cricket, Football, Golf, Tennis, Padel, Squash, Running, Skiing, American Football, Basketball, Ice Hockey, Netball, Cycling, Swimming, Rugby, Badminton, Boxing & MMA)  
4. Seller taps their sport (e.g. Cricket)  
5. Second level: list of sub-categories for that sport shown (Cricket bat, Cricket helmet, Batting pads, Batting gloves, Cricket ball, Cricket shoes, Wicket keeping gloves)  
6. Seller taps the relevant sub-category (e.g. Cricket bat)  
7. Selection confirmed — category field displays "Cricket › Cricket bat"  
8. Parcel size field auto-updates to the recommended parcel size for that sub-category (see Feature 9\)

**Post Conditions**

* Sport and sub-category are saved against the draft listing  
* Category breadcrumb displayed on listing detail page  
* Parcel size has been auto-recommended based on the selected sub-category

---

## **19\. Acceptance Criteria**

* Category field required — Upload button disabled until category is selected  
* All 17 active sports displayed at first level  
* Sub-categories shown at second level after sport selection  
* Only sub-categories belonging to the selected sport are shown at second level  
* Selected category displayed as breadcrumb: Sport › Sub-category (e.g. Cricket › Cricket bat)  
* Selecting a category auto-triggers parcel size recommendation  
* Seller can change category by tapping the field again — parcel size recommendation updates accordingly  
* Only admin-configured active categories are shown — removed or hidden categories not available

---

## **20\. Business Rules**

* Category is mandatory — listing cannot be published without both a sport and a sub-category selected  
* Only active categories configured by admin are available for selection — sellers cannot create custom categories  
* Changing the category after other fields have been filled does not reset other fields — only the parcel size recommendation updates  
* The selected category determines which sport-filtered browse pages and filters the listing appears in

---

## **21\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Sport selection | Category | Required — must select a sport before sub-category | Sub-category list not shown until sport is selected | On field interaction |
| Sub-category selection | Category | Required — must select a sub-category | "Please select a category for your item" | On Upload tap |
| Category availability | Selection | Selected category must be active at time of publish | If category deactivated between selection and publish: "This category is no longer available — please select a new one" | On Upload tap |

---

---

# **Feature 5 — Select Brand**

---

## **22\. Story & Story Narrative**

**Story** As a seller, I want to tag my item with the correct brand so buyers filtering by brand can find my listing.

**Story Narrative** Seller taps the Brand field and selects from a predefined list of brands relevant to the platform. Brand tagging makes the listing appear when buyers use the brand filter on the search and browse pages.

Benefit: Makes listings discoverable via brand filters, attracts buyers with strong brand preferences, and ensures brand data is consistent across the platform.

---

## **23\. User Flow**

**Preconditions**

* Seller is on the sell form

**Main Flow**

1. Seller taps the Brand field  
2. Brand selector opens — scrollable predefined list of all platform brands  
3. Seller scrolls or searches within the list  
4. Seller taps their brand (e.g. Gray-Nicolls)  
5. Brand field displays the selected brand name  
6. Seller proceeds to next field

**Post Conditions**

* Brand saved against the draft listing  
* Brand displayed on listing detail page and used in brand filter matching

---

## **24\. Acceptance Criteria**

* Brand field required — Upload button disabled until brand is selected  
* Brand list is predefined and admin-managed — no free-text brand entry  
* Brands are displayed in alphabetical order  
* Search within brand list available if list exceeds 20 brands  
* Selected brand displayed in the field and on listing detail  
* "Other" option available as a fallback for brands not in the predefined list

---

## **25\. Business Rules**

* Brand selection is mandatory — listing cannot be published without a brand  
* Brand list is maintained by admin — sellers cannot add new brands; requests for new brands go through support  
* If seller selects "Other," the listing will not appear in brand-specific filter results — it appears in all results without brand filter applied  
* Brand must reflect the actual brand of the item — misrepresenting brand is grounds for listing removal

---

## **26\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Brand | Selection | Required — must select from predefined list or Other | "Please select a brand for your item" | On Upload tap |

---

---

# **Feature 6 — Set Condition**

---

## **27\. Story & Story Narrative**

**Story** As a seller, I want to accurately declare the condition of my item so buyers know exactly what to expect and trust my listing.

**Story Narrative** Seller selects from four condition options that clearly define the item's state. The selected condition is displayed prominently on the listing card and detail page — it is one of the first things a buyer reads and has a direct impact on purchase confidence and price expectation.

Benefit: Clear condition grading sets accurate buyer expectations, reduces post-purchase disputes, and builds seller credibility.

---

## **28\. User Flow**

**Preconditions**

* Seller is on the sell form

**Main Flow**

1. Seller taps the Condition field  
2. Condition selector opens showing four options with descriptions:  
   * New with tags — unused, original tags/packaging intact  
   * Like new — used once or twice, no visible wear  
   * Good — used with minor signs of wear, fully functional  
   * Fair — visible wear and tear, functional but cosmetic imperfections  
3. Seller taps the most accurate description of their item's condition  
4. Condition field displays selected option  
5. Seller proceeds to next field

**Post Conditions**

* Condition saved against the draft listing  
* Condition badge displayed prominently on listing card and listing detail page

---

## **29\. Acceptance Criteria**

* Condition field required — Upload button disabled until condition is selected  
* Four options displayed: New with tags, Like new, Good, Fair — each with a brief description  
* Selected condition displayed as a colour-coded badge on listing card and detail page  
* Seller can change condition by tapping the field again before publishing

---

## **30\. Business Rules**

* Condition is mandatory — listing cannot be published without a condition selected  
* The declared condition is the seller's responsibility — inaccurate condition is the most common basis for a buyer dispute and is grounds for ruling in the buyer's favour  
* Condition options are platform-defined and fixed — sellers cannot create custom condition labels

---

## **31\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Condition | Selection | Required — must select one of the four options | "Please select the condition of your item" | On Upload tap |

---

---

# **Feature 7 — Choose Colour**

---

## **32\. Story & Story Narrative**

**Story** As a seller, I want to tag my item with its colour so buyers using the colour filter can find my listing.

**Story Narrative** Seller selects the primary colour of their item from a predefined colour list. This tag is used by the colour filter on the browse and search pages — particularly useful for buyers purchasing team kit or colour-matched gear.

Benefit: Increases listing discoverability for buyers using the colour filter, particularly relevant for apparel, footwear, and accessories.

---

## **33\. User Flow**

**Preconditions**

* Seller is on the sell form

**Main Flow**

1. Seller taps the Colour field  
2. Colour selector opens — predefined list of colours with colour swatches  
3. Seller taps the primary colour of their item (e.g. Pink)  
4. Colour field displays the selected colour name and swatch  
5. Seller proceeds to next field

**Post Conditions**

* Colour saved against the draft listing  
* Colour tag used in colour filter matching on browse and search pages

---

## **34\. Acceptance Criteria**

* Colour field required — Upload button disabled until colour is selected  
* Predefined colour list shown with colour swatches alongside each name  
* Single colour selection — one primary colour per listing  
* Selected colour shown in the field  
* Colour used in colour filter on browse and search results pages

---

## **35\. Business Rules**

* Colour is mandatory — listing cannot be published without a colour selected  
* Colour list is predefined by admin — sellers cannot enter a custom colour  
* Seller selects the dominant or primary colour of the item — for multicolour items the dominant colour should be selected

---

## **36\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Colour | Selection | Required — must select from predefined list | "Please select the colour of your item" | On Upload tap |

---

---

# **Feature 8 — Set Price**

---

## **37\. Story & Story Narrative**

**Story** As a seller, I want to set my asking price so I earn what I expect from the sale.

**Story Narrative** Seller taps the Price field and enters their asking price in GBP. The price is shown on the listing card and on the listing detail page. At checkout the buyer sees the item price alongside the platform-calculated shipping and buyer protection fees — the seller's asking price is never altered by the platform.

Benefit: Gives sellers full pricing control, ensures the seller earns exactly what they listed, and provides transparency to buyers on the item cost before additional fees are added.

---

## **38\. User Flow**

**Preconditions**

* Seller is on the sell form

**Main Flow**

1. Seller taps the Price field  
2. Numeric keyboard appears  
3. Seller types their asking price (e.g. 120.00)  
4. Price field displays £120.00  
5. Seller proceeds to next field

**Post Conditions**

* Price saved against the draft listing  
* Price displayed on listing card and listing detail page  
* Price used as the base for buyer protection fee and total calculation at checkout

---

## **39\. Acceptance Criteria**

* Price field required — Upload button disabled until price is entered  
* Numeric input only — currency symbol £ displayed automatically  
* Minimum price £1.00  
* Maximum price £9,999.00  
* Price displayed to two decimal places  
* Price shown on listing card, listing detail, and checkout order summary

---

## **40\. Business Rules**

* Price is mandatory — listing cannot be published without a price  
* The price entered by the seller is the item price only — shipping fee and buyer protection fee are added at checkout by the platform; the seller does not set these  
* Seller can update the price of a live listing at any time — the updated price applies to new checkouts; any checkout session already in progress uses the price at session start  
* Platform commission is deducted from the seller's payout after the transaction completes — it is not shown to the buyer or subtracted from the listed price

---

## **41\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Price | Entry | Required, numeric, min £1.00, max £9,999.00 | "Please enter a price" / "Minimum price is £1.00" / "Maximum price is £9,999.00" | On input blur and on Upload tap |
| Price format | Entry | Two decimal places, no letters or special characters | Non-numeric input blocked; auto-formatted to two decimal places on blur | On input |

---

---

# **Feature 9 — Choose Parcel Size**

---

## **42\. Story & Story Narrative**

**Story** As a seller, I want the platform to recommend the right parcel size for my item so I do not have to guess and risk shipping issues.

**Story Narrative** When the seller selects a category, the parcel size field is automatically populated with the recommended size based on the item's typical shipping dimensions from the platform's sport master data. Smaller parcel sizes that are inappropriate for the item are greyed out. If the seller selects an undersized option, a soft warning is shown advising them to change it. Oversized items show a courier-only notice.

Benefit: Removes guesswork for sellers, reduces mis-shipped parcels, protects seller ratings from delivery failures caused by incorrect packaging, and keeps the listing flow frictionless without requiring admin approval or manual dimension entry.

---

## **43\. User Flow**

**Preconditions**

* Seller is on the sell form  
* Category has been selected

**Main Flow — Auto-Recommended Size**

1. Seller selects a category (e.g. Cricket › Cricket bat)  
2. Parcel Size field automatically populates with the recommended size (Large)  
3. Smaller options (Small, Medium) are shown but greyed out  
4. Seller reviews the recommendation and proceeds — no action required if recommendation is acceptable  
5. Seller proceeds to Upload

**Alternative Flow — Seller Selects a Smaller Size**

1. Seller taps the greyed-out Small or Medium option  
2. Soft warning shown inline: "This parcel size may be too small for a \[item category\] — we recommend \[recommended size\] to avoid shipping issues"  
3. Seller can acknowledge and proceed with their selected size or revert to the recommendation  
4. No hard block — seller retains the ability to override with documented risk

**Alternative Flow — Oversized Item**

1. Seller selects a category with an Oversized recommendation (e.g. Golf driver, Skis, Road bike)  
2. Parcel Size field shows: "Oversized — Courier Required"  
3. Royal Mail Small, Medium, and Large options are not shown  
4. Seller is informed they must arrange courier shipping for this item  
5. Checkout will show a courier shipping notice to the buyer

**Post Conditions**

* Parcel size is set against the draft listing — either the recommended size or seller's override  
* Parcel size is used at checkout to calculate the shipping fee shown to the buyer  
* If seller overrode the recommendation, the soft warning is logged against the listing

---

## **44\. Acceptance Criteria**

* Parcel size field auto-populates with the recommended size immediately on category selection  
* Recommended parcel sizes per category are derived from the sport master CSV data:  
  * Large: Cricket bat, Golf irons set, Golf wedge, Golf putter  
  * Medium: Batting pads, Tennis racket, Tennis bag, Padel racket, Padel bag, Squash racket, Ski jacket, Ski trousers, Am. Football shoulder pads, Ice hockey shin pads, Rugby body armour, Badminton racket  
  * Small: All remaining categories not in Large, Medium, or Oversized  
  * Oversized (courier only): Golf driver, Golf bag, Ski pair, Ski poles, Ice hockey stick, Road bike, Punch bag  
* Options smaller than the recommendation are greyed out but still selectable  
* Soft inline warning shown if seller selects a size smaller than recommended  
* Oversized categories show courier-only notice — Royal Mail options not shown  
* Parcel size field is required — Upload button disabled until a size is selected  
* Seller can change category after setting parcel size — parcel size recommendation resets to match the new category

---

## **45\. Business Rules**

* Parcel size recommendation is category-based — the platform determines the appropriate size from the sport master data; the seller is not required to input item dimensions  
* A soft warning is shown for undersized selections — it is advisory not a hard block; the seller can override at their own risk  
* Oversized items cannot be shipped via Royal Mail — only courier-only notice is shown for these categories; no Royal Mail parcel size options are available  
* The parcel size selected by the seller determines the Royal Mail shipping fee shown to the buyer at checkout — an incorrect parcel size that results in an underpaid shipment is the seller's responsibility  
* Admin can update the recommended parcel size per sub-category in the Category management panel — changes apply to new listings only; existing listings are not retroactively changed

---

## **46\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Parcel size | Selection | Required — must select a parcel size | "Please select a parcel size" | On Upload tap |
| Undersized selection | Override warning | Selected size is smaller than recommendation | Soft inline warning: "This parcel size may be too small for a \[category\] — we recommend \[size\] to avoid shipping issues" | On selection |
| Oversized category | Display | Oversized categories must not show Royal Mail options | Royal Mail options hidden; courier-only notice shown | On category selection |
| Category change | Reset | Parcel size recommendation must reset when category changes | Parcel size field resets to new category recommendation on category change | On category change |

---

---

# **Feature 10 — Upload / Publish**

---

## **47\. Story & Story Narrative**

**Story** As a seller, I want to publish my listing with a single tap so my item is live on the platform as quickly as possible.

**Story Narrative** Seller completes all required fields and taps the Upload button. The listing is submitted, validated, and published immediately. The seller is taken to the success screen confirming their item is live with a preview of the listing and options to view it or list another item.

Benefit: Fast time-to-market for sellers, immediate confirmation that the listing is live, and a smooth re-list path for sellers with multiple items to sell.

---

## **48\. User Flow**

**Preconditions**

* Seller has completed all required fields: photos, title, description, category, brand, condition, colour, price, parcel size  
* Seller is authenticated

**Main Flow**

1. Seller reviews the completed form  
2. Upload button at the bottom of the form is active (green)  
3. Seller taps Upload  
4. Form is validated — all required fields checked  
5. If validation passes: listing is submitted to the platform  
6. Listing status set to Live immediately  
7. Seller navigated to the Post-Publish success screen  
8. Success screen displays:  
   * Green tick icon  
   * "Listing is now live\!" heading  
   * "Your item has been published to The Kit Loop."  
   * Listing preview card: item title and price  
   * "View listing →" link  
   * "List another item" link

**Alternative Flow — Validation Failure**

1. Seller taps Upload with one or more required fields incomplete  
2. Form scrolls to first incomplete field  
3. Inline error shown on each incomplete field  
4. Upload button remains active — seller can correct and resubmit  
5. Listing is not submitted until all validation passes

**Alternative Flow — Network Failure During Submit**

1. Seller taps Upload  
2. Network connection lost during submission  
3. Error message shown: "Unable to publish your listing — please check your connection and try again"  
4. Form data retained — seller does not lose their entered content  
5. Seller can retry when connection is restored

**Post Conditions**

* Listing is Live and immediately visible in search, browse, and sport-filtered pages  
* Seller is on the Post-Publish success screen  
* Listing is accessible via /listing/\[listingID\]  
* Seller's listing appears in their View My Listings section in profile

---

## **49\. Acceptance Criteria**

* Upload button is green and active when all required fields are complete  
* Upload button is greyed out and disabled when any required field is incomplete  
* Tapping Upload with incomplete fields scrolls to first error and shows inline validation messages  
* On successful submission: seller navigated to Post-Publish success screen within 3 seconds  
* Success screen shows: green tick, "Listing is now live\!" heading, listing preview with title and price, "View listing →" link, and "List another item" link  
* Listing is immediately searchable and browsable after publish — no admin approval delay in standard flow  
* Form data is retained if submission fails due to network error — seller does not need to re-enter content  
* Progress indicator shown while listing is being submitted

---

## **50\. Business Rules**

* All required fields must be complete before the Upload button fires a submission — the platform does not publish partial listings  
* Listing goes Live immediately on successful submission — there is no admin approval queue for standard listings in v1  
* If the listing contains content that triggers an automated or manual flag post-publish, the listing status is changed to Flagged by admin — the seller is notified  
* The listing is immediately indexed for search and browse on publish — there is no delay between publish and discoverability  
* A seller can have multiple Live listings simultaneously — there is no limit on active listing count per seller in v1  
* The Upload button label ("Upload") is the publish trigger — it is the single action that submits the entire form

---

## **51\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| All required fields | Publish | Photos, title, description, category, brand, condition, colour, price, parcel size must all be present | Scroll to first incomplete field; inline error per field; "Please complete all required fields before publishing" | On Upload tap |
| Authentication | Publish | Seller must be authenticated | Redirect to sign up / login; returned to sell form after auth | On Upload tap |
| Network availability | Publish | Network connection required | "Unable to publish your listing — please check your connection and try again"; form data retained | On submission |
| Upload button state | UX | Disabled until all required fields complete | Button greyed out with reduced opacity; tapping shows validation errors | On field completion state change |

# **SRS — Listing | Post Publish**

**Platform:** The Kit Loop | **User:** Seller | **Module:** Listing | **Sub-Module:** Post Publish | **Version:** 1.0

---

## **1\. Feature Overview**

The Post Publish sub-module is the screen a seller lands on immediately after their listing has been successfully submitted and published to The Kit Loop. It serves two purposes: View Live Listing gives the seller instant confirmation and access to their live listing so they can verify it looks correct before sharing it; List Another Item provides a fast re-list path for sellers who have multiple items to sell, returning them directly to a fresh sell form without any unnecessary navigation. Together these two features close the listing creation journey cleanly and keep seller momentum going — particularly important for active sellers clearing multiple items at once.

There are two features within this sub-module:

* **Feature 1 — View Live Listing**  
* **Feature 2 — List Another Item**

---

---

# **Feature 1 — View Live Listing**

---

## **2\. Story & Story Narrative**

**Story** As a seller, I want to see confirmation that my listing is live and be able to view it so I can verify it looks correct before sharing it with potential buyers.

**Story Narrative** Immediately after publishing, the seller lands on the success screen showing a green tick and their item details. They tap View Listing to open their live listing exactly as buyers see it — confirming the photos, title, condition, and price are all correct before sharing the link.

Benefit: Gives the seller instant verification that their listing is live and accurately represents the item, reducing the chance of an incorrect listing generating buyer confusion or disputes.

---

## **3\. User Flow**

**Preconditions**

* Seller has successfully submitted and published a listing via the Create Listing form  
* Listing status is Live  
* Seller is on the Post Publish success screen

**Main Flow**

1. Seller lands on the Post Publish success screen  
2. Screen displays:  
   * Green circular tick icon — prominent, centred  
   * Heading: "Listing is now live\!"  
   * Sub-text: "Your item has been published to The Kit Loop."  
   * Listing preview card showing:  
     * Listing thumbnail photo (Main photo)  
     * Item title  
     * Price in GBP  
   * "View listing →" link below the preview card  
   * "List another item" link below View listing  
3. Seller taps "View listing →"  
4. Platform navigates to /listing/\[listingID\]  
5. Listing detail page loads — exactly as buyers see it  
6. Seller reviews all content: photos, title, condition, description, price, parcel size, seller info panel  
7. Seller confirms listing looks correct  
8. Seller can share the listing URL from this page  
9. Seller navigates back to profile, homepage, or any other page via global navigation

**Alternative Flow — Listing Detail Shows an Error**

1. Seller opens their live listing via "View listing →"  
2. Seller identifies an error — wrong price, incorrect condition, typo in title  
3. Seller navigates back to their listings via Profile → View My Listings  
4. Seller taps the listing to edit  
5. Seller corrects the error and saves  
6. Updated listing reflected live immediately

**Post Conditions**

* Seller has confirmed their listing is live and accessible at /listing/\[listingID\]  
* Listing is visible to buyers in search, browse, sport-filtered pages, and via direct URL  
* Seller has had the opportunity to verify listing accuracy before the listing receives significant buyer traffic  
* Any errors identified can be corrected by the seller via the edit listing flow

---

## **4\. Acceptance Criteria**

* Post Publish success screen displays immediately after successful listing submission — within 3 seconds of Upload tap  
* Green tick icon displayed prominently at the top of the success screen  
* "Listing is now live\!" heading displayed clearly  
* Sub-text confirms item has been published to The Kit Loop  
* Listing preview card shows: Main photo thumbnail, item title, and price  
* "View listing →" link is displayed below the preview card  
* Tapping "View listing →" navigates to /listing/\[listingID\] within 2 seconds  
* Listing detail page at /listing/\[listingID\] shows the listing exactly as it appears to buyers  
* Listing is Live and searchable immediately — no delay between publish and discoverability  
* Back navigation from the listing detail page returns seller to the Post Publish success screen or profile — not back to the sell form  
* "View listing →" link is always present on the success screen — it cannot be hidden or omitted

---

## **5\. Business Rules**

* The listing referenced on the Post Publish success screen is always the most recently published listing in that session — if the seller published multiple listings in sequence, each success screen references its own listing  
* The listing is Live immediately on publish — "View listing →" always opens a live, publicly accessible listing; there is no preview-only mode  
* If the seller edits the listing after viewing it, the edit is applied immediately and the listing detail reflects the updated content within 60 seconds  
* The Post Publish success screen is a one-time view per listing publish event — refreshing the page or navigating away and returning via URL does not show the success screen again; the seller is directed to /listing/\[listingID\] or their listings page instead  
* The listing URL (/listing/\[listingID\]) is shareable — the seller can copy and share it directly from the listing detail page

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Listing availability | View listing tap | Listing must be in Live status | If listing status has changed since publish (anomaly): "This listing is no longer available — view your listings in your profile" with Profile CTA | On navigation to /listing/\[listingID\] |
| Success screen access | Page load | Must follow a successful listing publish event | If success screen is accessed directly via URL without a valid publish session: redirect to /sell or /profile | On page load |
| Listing preview data | Display | Preview card must show photo, title, and price | If any preview field is missing (data anomaly): show available fields; no broken card layout | On render |

---

---

# **Feature 2 — List Another Item**

---

## **7\. Story & Story Narrative**

**Story** As a seller, I want to quickly start a new listing from the success screen so I can list multiple items without unnecessary navigation.

**Story Narrative** A seller clearing out their sports gear has five items to list. After publishing the first, they tap "List another item" on the success screen and are taken straight back to a fresh sell form — ready to start the next listing immediately without going back to the homepage or profile.

Benefit: Reduces friction for active sellers listing multiple items in a session, increases overall listing volume on the platform, and rewards sellers who bring multiple items to market at once.

---

## **8\. User Flow**

**Preconditions**

* Seller has successfully published a listing  
* Seller is on the Post Publish success screen  
* Seller has additional items they want to list

**Main Flow**

1. Seller is on the Post Publish success screen  
2. Seller taps "List another item" link below "View listing →"  
3. Platform navigates to /sell  
4. Fresh sell form loads — all fields blank and reset to default state  
5. Seller begins filling in details for the next item  
6. Seller completes the form and publishes  
7. New Post Publish success screen shown for the second listing  
8. Process repeats for as many items as the seller wants to list

**Alternative Flow — Seller Changes Mind After Tapping**

1. Seller taps "List another item"  
2. Fresh sell form loads  
3. Seller decides not to list another item  
4. Seller navigates away using global navigation — to homepage, profile, or browse  
5. Empty sell form is abandoned — no draft saved in v1  
6. No error or warning shown — seller can return to /sell at any time

**Post Conditions**

* Seller is on a fresh, blank sell form at /sell  
* Previous listing remains Live and is not affected by starting a new listing  
* No data from the previous listing is pre-populated in the new form — each listing starts fresh  
* Seller's listing count in their profile increases by one for each successfully published listing

---

## **9\. Acceptance Criteria**

* "List another item" link is displayed on every Post Publish success screen below the "View listing →" link  
* Tapping "List another item" navigates to /sell within 2 seconds  
* Sell form at /sell loads completely blank — no pre-populated data from the previous listing  
* All form fields reset to their default empty or placeholder state  
* Parcel size field resets to empty — no carry-over from the previous listing's parcel size selection  
* Progress bar at the top of the sell form resets to its initial state  
* "List another item" is always the secondary action on the success screen — "View listing →" is always shown first  
* Guest sellers tapping "List another item" are not prompted to re-authenticate — their session remains active throughout

---

## **10\. Business Rules**

* "List another item" always opens a completely blank sell form — no data from the previous listing is carried over or pre-populated in any field  
* There is no draft save functionality in v1 — if the seller navigates away from the blank form without completing it, all blank form state is lost  
* Each listing publish creates an entirely independent listing record — listing another item does not create a duplicate of the previous listing  
* There is no limit on the number of listings a seller can create in a single session — "List another item" can be used consecutively without restriction  
* The previous listing remains Live and fully active while the seller is filling in the new listing form — publishing a new listing does not affect existing listings in any way

---

## **11\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Sell form state | Page load | Form must be completely blank on load from "List another item" tap | If any field carries over previous data (anomaly): form is cleared on load; no pre-populated content shown | On /sell page load |
| Authentication | Form access | Seller must remain authenticated | If session expired between listings: sign up / login prompt shown; seller returned to /sell after re-authentication | On /sell page load |
| Navigation away | Abandonment | No validation required — no draft save in v1 | Seller can navigate away freely; no unsaved changes warning shown on blank form | On navigation |

# **SRS — Transactions | Offers**

**Platform:** The Kit Loop | **User:** Seller | **Module:** Transactions | **Sub-Module:** Offers | **Version:** 1.0

---

## **1\. Feature Overview**

The Offers sub-module gives the seller the ability to receive, review, and respond to price offers and messages sent by buyers on their active listings. All buyer–seller communication is centralised in the /messages page and tied to the specific listing it relates to. The seller can accept an offer, decline it, make a counter-offer, or simply reply to a buyer's question. No transaction is created by an offer alone — it is a pre-purchase negotiation tool that keeps all communication within the platform's trust and safety framework.

---

## **2\. Story & Story Narrative**

**Story** As a seller, I want to receive and respond to buyer offers so I can negotiate a price that works for both parties and close the sale.

**Story Narrative** Seller receives a notification that a buyer has made an offer on their listing. They open the messages page, review the offer and any accompanying message, and respond — accepting, declining, or countering. All negotiation happens within the platform, protecting both parties under the buyer protection framework and ensuring any agreed transaction goes through the escrow system.

Benefit: Increases the number of completed transactions by enabling price flexibility, builds a more human and community-driven marketplace experience, and keeps all negotiation within the platform so buyer protection remains intact on any resulting purchase.

---

## **3\. User Flow**

**Preconditions**

* Seller is authenticated  
* Seller has at least one Live listing  
* A buyer has sent an offer or message on one of the seller's listings  
* Seller has received an in-app or email notification of the new offer

**Main Flow — Accept Offer**

1. Seller receives in-app notification: "You have a new offer on \[listing title\]"  
2. Seller taps notification or navigates to /messages  
3. Messages page loads showing all message threads in reverse chronological order  
4. New offer thread is shown at the top with an unread indicator  
5. Seller taps the thread  
6. Thread opens showing:  
   * Listing summary at the top: Main photo, title, condition badge, asking price  
   * "View listing" link on listing summary  
   * Conversation history in chronological order  
   * Buyer's offer displayed in a highlighted format: "Offer: £\[amount\]" with any accompanying message  
7. Seller reviews the offer  
8. Seller types a reply accepting the offer (e.g. "Hi — yes I'm happy to accept £170. Please go ahead and purchase.")  
9. Seller taps Send  
10. Reply delivered to buyer  
11. Buyer receives notification of seller response  
12. Buyer proceeds to checkout at the listed price or the seller updates the listing price to reflect the agreed amount before the buyer checks out

**Main Flow — Counter-Offer**

1. Seller reviews buyer's offer and wants to counter  
2. Seller types a counter-offer in the message field (e.g. "Thanks for the offer — I can do £180, that's the best I can do.")  
3. Seller optionally includes a counter-offer amount in the offer amount field  
4. Seller taps Send  
5. Counter-offer delivered to buyer  
6. Buyer notified and conversation continues

**Main Flow — Decline Offer**

1. Seller reviews buyer's offer and decides to decline  
2. Seller types a decline message (e.g. "Thanks for your interest — I'm going to hold at the listed price for now.")  
3. Seller taps Send  
4. Decline delivered to buyer  
5. Buyer notified — buyer can make a revised offer, buy at listed price, or walk away

**Main Flow — Respond to a Question**

1. Buyer has sent a question without an offer amount (e.g. "Hi — what grip size is this racket?")  
2. Seller opens the thread  
3. Seller types their answer in the message field  
4. Seller taps Send  
5. Answer delivered to buyer  
6. Buyer notified

**Alternative Flow — Access Messages Directly**

1. Seller navigates to /messages without a notification trigger  
2. All threads listed in reverse chronological order  
3. Unread threads shown with visual indicator (bold text or unread dot)  
4. Seller browses threads and opens any to review and respond

**Alternative Flow — Multiple Offers on the Same Listing**

1. Seller has received offers from three different buyers on the same listing  
2. Each buyer's thread appears separately in the messages list — one thread per buyer per listing  
3. Seller reviews and responds to each thread independently  
4. Seller accepts one buyer's offer — listing remains Live until a purchase is completed  
5. Other buyers can still purchase at listed price or continue negotiating until the item sells

**Post Conditions**

* Seller's response has been delivered to the buyer  
* Buyer has received an in-app and email notification of the seller's response  
* The message thread is updated with the seller's reply and remains accessible from /messages  
* No transaction has been created — the offer and response are pre-purchase communication only  
* If the seller and buyer have agreed a price, the buyer proceeds to checkout independently — the agreed price is not automatically applied at checkout in v1

---

## **4\. Acceptance Criteria**

**Notifications**

* Seller receives an in-app notification when a buyer sends an offer or message on their listing  
* Seller receives an email notification within 2 minutes of a buyer message being sent  
* Notification includes: listing title, buyer username, and first 60 characters of the message or offer amount  
* Tapping the notification navigates directly to the relevant message thread

**Messages Page — Thread List**

* All message threads are listed in reverse chronological order — most recent activity first  
* Each thread shows: listing thumbnail, listing title, buyer username, last message preview, timestamp, and unread indicator  
* Unread threads are visually differentiated — bold text or unread dot indicator  
* Thread list is accessible from /messages and from Profile → My Orders (messages link)  
* Thread list is paginated or infinitely scrollable

**Messages Page — Conversation View**

* Listing summary shown at the top of each thread: Main photo, title, condition badge, asking price, and "View listing" link  
* Conversation history displayed in chronological order — oldest at top, newest at bottom  
* Buyer messages shown on the left; seller messages shown on the right  
* Offer amounts displayed in a visually distinct highlighted format: "Offer: £\[amount\]"  
* Each message shows: content, offer amount if included, sender username, and timestamp  
* Message input area pinned to bottom of screen  
* Optional offer amount field available above message text area  
* Send button active when at least one of: offer amount or message text is present

**Sending a Response**

* Seller can send a plain text reply without an offer amount  
* Seller can include a counter-offer amount with or without accompanying text  
* Message text maximum 500 characters — character counter shown from 400 characters  
* Response delivered and visible in thread immediately after Send  
* Buyer receives in-app and email notification within 2 minutes of seller response

**Off-Platform Contact Prevention**

* Outgoing seller messages scanned for phone numbers, email addresses, and external URLs  
* If detected: message blocked; seller shown inline warning: "For your protection, contact details and external links cannot be shared in messages. Please keep all communication and transactions on The Kit Loop."  
* Seller can edit and resend without the blocked content

**General**

* Seller can have multiple concurrent threads with different buyers for the same or different listings  
* One thread per buyer per listing — no duplicate threads for the same buyer–listing combination  
* Messages are not editable or deletable by the seller after sending in v1  
* Messages page accessible only to authenticated sellers

---

## **5\. Business Rules**

* Offers and messages are a communication tool only — they do not create a binding agreement, initiate a payment, or place a hold on the listing  
* A listing can receive offers from multiple buyers simultaneously — the seller is free to respond to any or all; the listing remains Live until a purchase is completed  
* The agreed offer price from negotiation is not automatically applied at checkout in v1 — the seller must update the listing price before the buyer checks out, or the buyer pays the current listed price  
* All buyer–seller communication must remain within the platform — off-platform contact details are blocked at the message send layer for both buyer and seller messages  
* Admin has read access to all message threads for dispute resolution and fraud investigation purposes — sellers are made aware of this in the platform's terms of service  
* A seller whose account is suspended cannot send or receive messages — their threads are frozen for the duration of the suspension  
* If a listing is sold, removed, or paused, the existing message threads for that listing remain accessible in /messages — historical communication is retained  
* Messages are retained in the system permanently — they form part of the dispute evidence record if a transaction on this listing goes to dispute  
* Seller response time is not enforced in v1 — there is no mandatory response window for sellers; buyers who receive no response can choose to purchase at the listed price or find an alternative

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Counter-offer amount | Send response | Optional; if entered must be numeric, positive, max £9,999, two decimal places | "Please enter a valid offer amount in GBP" | On Send tap |
| Counter-offer amount | Send response | Must be greater than £0.00 if entered | "Offer amount must be greater than £0" | On Send tap |
| Counter-offer format | Send response | Numeric only; no letters or special characters except decimal point | Non-numeric characters blocked silently on input | On input |
| Message text | Send response | Optional if offer amount present; required if no offer amount | "Please enter a message or an offer amount before sending" | On Send tap |
| Message text | Send response | Maximum 500 characters | Character counter shown from 400; input blocked at 500; "Message cannot exceed 500 characters" | On input |
| Off-platform content | Content scan | No phone numbers, email addresses, or external URLs | "For your protection, contact details and external links cannot be shared in messages" — message blocked; seller prompted to edit | On Send tap |
| Send button state | UX | Enabled only when at least one of: offer amount or message text is present | Send button disabled and greyed out when both fields are empty | On input change |
| Authentication | Access | Seller must be authenticated | Redirect to sign up / login; returned to /messages after auth | On page load |

# **SRS — Transactions | Orders**

**Platform:** The Kit Loop | **User:** Seller | **Module:** Transactions | **Sub-Module:** Orders | **Version:** 1.0

---

## **1\. Feature Overview**

The Orders sub-module gives the seller a dedicated view of all their sales — past and active — with the information and actions needed to fulfil each order promptly. Unlike the buyer's orders view which tracks purchases, the seller's orders view is focused on dispatch management: knowing what has been sold, where it needs to go, and confirming when it has been sent. Prompt dispatch is directly tied to the seller's rating and the buyer's experience, making this sub-module a critical operational tool for any active seller on the platform.

---

## **2\. Story & Story Narrative**

**Story** As a seller, I want to view all my sales orders so I know what has sold, what needs to be dispatched, and where each order stands — without having to rely on email notifications alone.

**Story Narrative** Seller opens their sales orders page and sees all their completed sales listed with current status. They can see which orders are awaiting dispatch, which have been sent, and which have been confirmed as delivered. They tap into an individual order to get the buyer's delivery address and dispatch the item. Once sent, they mark it as dispatched on the platform so the buyer is updated.

Benefit: Keeps the seller organised across multiple concurrent orders, ensures items are dispatched promptly, protects seller ratings from delays, and gives the seller a single source of truth for all their sales activity.

---

## **3\. User Flow**

**Preconditions**

* Seller is authenticated  
* Seller has at least one completed sale on their account  
* Seller navigates to their orders from /profile → My Orders or /orders

**Main Flow**

1. Seller navigates to /orders  
2. Orders page loads — seller sees two tabs or sections:  
   * My Sales (items sold by the seller — this feature)  
   * My Purchases (items bought by the seller as a buyer)  
3. Seller selects My Sales tab  
4. Sales orders list loads in reverse chronological order — most recent first  
5. Each order row displays:  
   * Listing thumbnail photo  
   * Item title  
   * Buyer username  
   * Sale date  
   * Sale price (item price only — seller's received amount)  
   * Current order status  
6. Seller scans the list to identify orders requiring action  
7. Seller taps an order row requiring dispatch  
8. Order detail view loads displaying:  
   * Full item details: Main photo, title, brand, condition, category  
   * Sale summary: item price, platform commission deducted, net amount to seller  
   * Buyer delivery address: Address Line 1, Address Line 2, City, Postcode  
   * Parcel size selected at listing creation  
   * Recommended shipping: Royal Mail Tracked at the parcel size tier selected  
   * Fulfilment timeline: order placed, payment confirmed, dispatched (with tracking number if entered), delivered, buyer confirmation  
   * Escrow status: Held / Released / Refunded  
   * Dispute status if applicable  
   * "Mark as Dispatched" CTA — visible when order is in Awaiting Dispatch status  
9. Seller packs the item and ships via Royal Mail Tracked  
10. Seller returns to the order detail  
11. Seller taps "Mark as Dispatched"  
12. Tracking number entry field appears  
13. Seller enters the Royal Mail tracking number  
14. Seller taps Confirm Dispatch  
15. Order status updates to Dispatched  
16. Buyer receives notification: "Your item has been dispatched — tracking details: \[tracking number\]"  
17. Seller returns to sales orders list

**Alternative Flow — No Sales Yet**

1. Seller navigates to My Sales  
2. No orders exist  
3. Empty state displayed: "No sales yet — your sold items will appear here"  
4. CTA shown: "View my listings" linking to seller's active listings

**Alternative Flow — View Completed Orders**

1. Seller opens My Sales and sees orders with Completed status  
2. Seller taps a completed order  
3. Order detail loads — all fulfilment and payment detail visible  
4. No dispatch action available — order is fully resolved  
5. Escrow status shows Released to Seller  
6. Seller reviews for reference or dispute context

**Alternative Flow — Disputed Order**

1. Seller sees an order with Disputed status in My Sales  
2. Seller taps the order  
3. Order detail shows dispute reason submitted by the buyer  
4. Seller can view the dispute detail and submit their response via the messages thread linked to the order  
5. Escrow status shows Held — funds not released pending admin ruling  
6. Seller awaits admin resolution

**Post Conditions**

* Seller has reviewed their sales orders and identified any requiring action  
* If dispatch was confirmed: order status updated to Dispatched; buyer notified with tracking number; escrow remains Held until buyer confirms delivery  
* If no action was taken: orders remain in their current status unchanged  
* All order data is read-only except for the Mark as Dispatched action — seller cannot edit order details, buyer address, or pricing after the order is placed

---

## **4\. Acceptance Criteria**

**Sales Orders List**

* My Sales list loads in reverse chronological order — most recent sale first  
* Each row displays: listing thumbnail, item title, buyer username, sale date, sale price, and current status  
* Order statuses displayed: Payment Received — Awaiting Dispatch, Dispatched, Delivered, Completed, Disputed, Refunded  
* Status labels are colour-coded for quick visual scanning  
* Unactioned orders requiring dispatch are visually prioritised — shown at the top or with a visual indicator  
* Sales orders list is paginated — 20 orders per page with load more  
* Empty state shown with View My Listings CTA if no sales exist  
* List loads within 2 seconds

**Order Detail**

* Tapping an order row opens the full order detail view  
* Order detail displays: item details, sale summary with commission deducted, buyer delivery address, parcel size, fulfilment timeline, escrow status, and dispute status  
* Buyer delivery address is displayed in full — Address Line 1, Address Line 2, City, Postcode  
* Fulfilment timeline shows exact timestamps for each completed stage  
* "Mark as Dispatched" CTA visible only when order status is Awaiting Dispatch  
* Tracking number entry field appears on tapping Mark as Dispatched  
* Tracking number is optional — seller can confirm dispatch without entering one but is strongly encouraged to provide it  
* Confirm Dispatch button fires the dispatch confirmation and updates order status  
* Escrow status clearly labelled: Held in Escrow / Released to Seller / Refunded to Buyer  
* Dispute status shown if applicable with dispute reason visible to seller

**Dispatch Confirmation**

* On Confirm Dispatch: order status updates to Dispatched immediately  
* Buyer receives in-app and email notification within 2 minutes including tracking number if provided  
* Tracking number is displayed in the buyer's order detail view and in the fulfilment timeline  
* Once dispatched is confirmed, the Mark as Dispatched CTA is replaced by Dispatched status label — action cannot be repeated  
* Seller cannot un-dispatch an order — dispatch confirmation is irreversible

**General**

* My Sales and My Purchases accessible from the same /orders page via tabs or sections  
* Orders page accessible from /profile → My Orders and from global navigation  
* Only authenticated sellers can access My Sales — guest access not permitted  
* Seller can only see their own sales orders — no other seller's orders visible

---

## **5\. Business Rules**

* Seller's sales orders are visible permanently — completed and historical orders are never removed from the My Sales view  
* Seller can only view their own sales orders — cross-account visibility is not permitted  
* Dispatch confirmation is irreversible — once an order is marked as dispatched it cannot be reverted to Awaiting Dispatch  
* Tracking number is strongly recommended but not mandatory — if not provided the buyer is notified of dispatch without a tracking number and "Tracking not provided" is shown in the fulfilment timeline  
* Escrow is not released to the seller on dispatch — it is held until the buyer confirms delivery or the buyer confirmation window expires without a dispute being raised  
* If a buyer raises a dispute, the seller is notified and can submit their response via the message thread linked to the order — the seller cannot resolve the dispute unilaterally; admin makes the final ruling  
* Platform commission is deducted from the seller's payout automatically when escrow is released — the commission amount is shown on the order detail so the seller can see their net payout  
* A seller whose account is suspended cannot access My Sales or mark orders as dispatched during the suspension period — existing orders in progress are flagged for admin review  
* The buyer's delivery address shown on the order detail is the address confirmed at checkout — it cannot be changed by the seller or the buyer after payment is confirmed; address changes require admin intervention

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Authentication | Page access | Seller must be authenticated | Redirect to sign up / login; returned to /orders after auth | On page load |
| Order ownership | Order detail access | Order must belong to the authenticated seller | If order ID in URL does not belong to seller: redirect to /orders with no error message | On order detail load |
| Mark as Dispatched | CTA visibility | Order must be in Awaiting Dispatch status | CTA only rendered for orders in Awaiting Dispatch status — hidden for all other statuses | On order detail render |
| Tracking number | Dispatch confirmation | Optional; if entered must be alphanumeric, max 50 characters | "Tracking number can only contain letters and numbers" / "Tracking number cannot exceed 50 characters" | On input and on Confirm Dispatch tap |
| Confirm Dispatch | Irreversible action | Confirmation prompt shown before dispatch is confirmed | "Confirm dispatch? This cannot be undone. The buyer will be notified that their item is on the way." | On Mark as Dispatched tap |
| Dispatch — double confirmation | UX | Seller must confirm dispatch action | Confirmation prompt: "Mark this order as dispatched?" with Confirm and Cancel options | On Confirm Dispatch tap |

# **SRS — Account | Profile**

**Platform:** The Kit Loop | **User:** Seller | **Module:** Account | **Sub-Module:** Profile | **Version:** 1.0

---

## **1\. Feature Overview**

The Seller Profile sub-module covers the account features that are specific to or particularly important for sellers on The Kit Loop. While buyers and sellers share a common profile hub, three features are especially relevant to the seller role: Seller Profile & Ratings builds the seller's public reputation and trust signals that directly influence buyer purchase decisions; Holiday Mode allows sellers to pause their listings and activity without losing their inventory; Balance gives sellers visibility over their earnings, pending payouts, and transaction history. Together these features support the seller's ability to manage their presence, protect their reputation, and track their financial activity on the platform.

There are three features within this sub-module:

* **Feature 1 — Seller Profile & Ratings**  
* **Feature 2 — Holiday Mode**  
* **Feature 3 — Balance**

---

---

# **Feature 1 — Seller Profile & Ratings**

---

## **2\. Story & Story Narrative**

**Story** As a seller, I want a visible profile with a cumulative star rating and buyer reviews so buyers trust me and feel confident purchasing from me.

**Story Narrative** After each completed transaction, the buyer is prompted to leave a star rating and written review. These accumulate on the seller's public profile page and are displayed on all their active listings. A strong rating and positive reviews are the seller's most important trust signals — they directly influence a buyer's decision to purchase from an unknown seller over another with no track record.

Benefit: Builds long-term seller reputation, directly influences buyer purchase decisions, incentivises sellers to provide accurate descriptions and fast dispatch, and increases overall platform trust.

---

## **3\. User Flow**

**Preconditions**

* Seller is authenticated  
* Seller has completed at least one transaction where the buyer has left a review

**Main Flow — View Own Seller Profile**

1. Seller navigates to /profile  
2. Seller taps their username or avatar at the top of the profile page  
3. Seller's public profile page loads — exactly as buyers see it  
4. Profile page displays:  
   * Seller avatar and username  
   * Verified Seller badge (if granted by admin)  
   * Member since date  
   * Total completed sales count  
   * Cumulative star rating — displayed to one decimal place (e.g. 4.7) with visual star representation  
   * Total review count (e.g. "31 reviews")  
   * Individual buyer reviews listed in reverse chronological order — each showing: star rating, review text, buyer username, and date  
   * Active listings grid — all seller's current Live listings  
5. Seller reviews their rating and reads individual reviews  
6. Seller identifies any feedback to act on

**Main Flow — Buyer Leaves a Review (Triggered Post-Purchase)**

1. Buyer completes a purchase and receives their item  
2. Buyer confirms delivery on the platform  
3. Platform prompts buyer to leave a review: "How was your experience with \[seller username\]?"  
4. Buyer selects a star rating (1–5) and optionally writes a review text  
5. Buyer submits review  
6. Review added to seller's profile immediately  
7. Seller's cumulative star rating recalculated and updated  
8. Seller receives in-app notification: "You have a new review from \[buyer username\]"

**Alternative Flow — Seller Has No Reviews Yet**

1. Buyer views seller's profile from a listing detail page  
2. Seller has no reviews  
3. Profile shows: "No reviews yet" in place of star rating  
4. Total sales count still shown if sales have been completed  
5. Active listings still shown

**Alternative Flow — Seller Views Profile from Listing Detail**

1. Buyer or seller taps seller username on a listing detail page  
2. Seller's public profile page loads  
3. Same profile content shown as above  
4. Buyer can proceed to purchase from this page or browse seller's other listings

**Post Conditions**

* Seller's public profile accurately reflects all reviews and cumulative rating  
* New review is immediately visible on the seller's profile after buyer submission  
* Seller's cumulative rating has been recalculated to include the new review  
* Seller has been notified of the new review

---

## **4\. Acceptance Criteria**

**Public Profile Display**

* Seller profile page is publicly accessible — authenticated and guest buyers can view it  
* Profile displays: avatar, username, Verified Seller badge (if applicable), member since date, total sales count, cumulative star rating, total review count, individual reviews, and active listings grid  
* Cumulative star rating displayed to one decimal place with visual star graphic  
* If seller has no reviews: "No reviews yet" shown — no empty star graphic displayed  
* Individual reviews listed in reverse chronological order — most recent first  
* Each review shows: star rating, review text (if provided), buyer username, and date  
* Active listings grid shows all seller's current Live listings — sold or removed listings not shown  
* Profile page loads within 2 seconds

**Review Submission**

* Buyer is prompted to leave a review after confirming delivery  
* Star rating is required — 1 to 5 stars; review text is optional  
* Review submitted immediately and visible on seller profile within 60 seconds  
* Seller receives in-app notification within 2 minutes of review submission  
* Cumulative rating recalculated immediately on new review submission  
* One review per buyer per transaction — buyer cannot submit multiple reviews for the same order

**Rating Calculation**

* Cumulative rating is the arithmetic mean of all individual star ratings received  
* Rating displayed to one decimal place (e.g. 4.7)  
* Rating updates in real time on new review submission — no manual refresh required  
* Review count increments by one on each new review submission

**General**

* Seller cannot edit or delete reviews left by buyers  
* Admin can remove a review that violates platform community guidelines  
* Reviews from disputed transactions that resulted in a refund are still displayed — they are not automatically removed

---

## **5\. Business Rules**

* Seller profile and ratings are public — accessible to all buyers whether authenticated or guest  
* One review per buyer per completed transaction — a buyer who purchases multiple items from the same seller submits one review per order, not per seller  
* Reviews are permanent — sellers cannot delete or edit reviews; only admin can remove a review that violates community guidelines  
* A review text is optional — a buyer can submit a star rating without written feedback  
* Cumulative rating is calculated from all reviews across all time — there is no weighting by recency in v1  
* Reviews from transactions that ended in a buyer refund are retained on the seller's profile — they are not removed as they form part of the seller's honest track record  
* The Verified Seller badge on the profile is granted and revoked by admin only — the seller cannot control its display  
* Seller's total sales count reflects all completed sales where escrow was released — disputed transactions that resulted in a refund are not counted in the total sales figure  
* A suspended or banned seller's profile remains accessible to admin but is hidden from buyer-facing surfaces for the duration of the suspension or ban

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Star rating — submission | Review form | Required, integer 1–5 | Review cannot be submitted without a star rating; submit button disabled until rating selected | On submit tap |
| Review text — submission | Review form | Optional; if entered max 500 characters | "Review cannot exceed 500 characters" — character counter shown from 400 | On input |
| Review text — content | Content scan | No contact details or external URLs | Content blocked; inline warning: "Contact details and external links cannot be included in reviews" | On submit tap |
| Duplicate review | Submission | One review per buyer per order | If buyer attempts to submit a second review for the same order: blocked silently; existing review shown | On submit tap |

---

---

# **Feature 2 — Holiday Mode**

---

## **7\. Story & Story Narrative**

**Story** As a seller, I want to pause all my listings while I am away so I do not receive orders I cannot fulfil, without having to delete and recreate my listings when I return.

**Story Narrative** Seller is going on a two-week holiday and cannot dispatch orders during that time. They toggle Holiday Mode on from their profile. All their active listings are immediately hidden from buyers — no purchases can be made while Holiday Mode is active. When they return, they toggle it off and all listings are instantly restored to Live status exactly as they were.

Benefit: Prevents unfulfilled orders and negative reviews caused by seller unavailability, protects seller ratings, and removes the need to delete and recreate listings after a break.

---

## **8\. User Flow**

**Preconditions**

* Seller is authenticated  
* Seller has at least one Live listing  
* Seller navigates to /profile

**Main Flow — Enable Holiday Mode**

1. Seller taps "Holiday Mode" from the profile menu  
2. Holiday Mode page loads showing current status: Off  
3. Seller reads the explanation: "When Holiday Mode is on, your listings are hidden from buyers and cannot be purchased. Turn it off when you're back to restore all your listings instantly."  
4. Seller toggles Holiday Mode to On  
5. Confirmation prompt: "Enable Holiday Mode? All your active listings will be hidden from buyers until you turn it off."  
6. Seller confirms  
7. Holiday Mode activates immediately  
8. All seller's Live listings are paused and hidden from search, browse, and sport-filtered pages  
9. Buyers cannot purchase any of the seller's listings while Holiday Mode is active  
10. Seller's profile page shows Holiday Mode status: On with a visual indicator  
11. Seller receives confirmation: "Holiday Mode is on. Your listings are hidden. Turn it off when you're back."

**Main Flow — Disable Holiday Mode**

1. Seller returns and navigates to /profile → Holiday Mode  
2. Holiday Mode page shows current status: On  
3. Seller toggles Holiday Mode to Off  
4. Confirmation prompt: "Disable Holiday Mode? All your listings will be restored and visible to buyers immediately."  
5. Seller confirms  
6. Holiday Mode deactivates immediately  
7. All previously paused listings are restored to Live status instantly  
8. Listings are immediately visible in search, browse, and sport-filtered pages  
9. Seller receives confirmation: "Holiday Mode is off. Your listings are live again."

**Alternative Flow — Seller Has No Live Listings**

1. Seller with no Live listings enables Holiday Mode  
2. Holiday Mode activates — no listings to pause but mode is recorded  
3. Any listings the seller publishes while Holiday Mode is on are immediately paused on publish  
4. Listings go Live only when Holiday Mode is turned off

**Alternative Flow — Order Placed Just Before Holiday Mode Activates**

1. Buyer completes a purchase seconds before seller enables Holiday Mode  
2. Order is created normally — Holiday Mode does not cancel in-progress orders  
3. Seller must fulfil the order despite Holiday Mode being active  
4. My Sales orders page remains accessible to the seller during Holiday Mode  
5. Seller dispatches the item and confirms dispatch as normal

**Post Conditions**

* Holiday Mode is active: all seller's listings are paused and hidden from all buyer-facing surfaces  
* Holiday Mode is inactive: all previously paused listings are restored to Live status immediately  
* In-progress orders at time of Holiday Mode activation are not cancelled — they proceed to fulfilment  
* Seller's balance, message threads, and account data are fully accessible during Holiday Mode  
* Holiday Mode status is visible on the seller's profile page

---

## **9\. Acceptance Criteria**

**Enable Holiday Mode**

* Holiday Mode toggle is accessible from Profile → Holiday Mode  
* Current status shown clearly: On or Off  
* Explanation of what Holiday Mode does shown before toggle is available  
* Confirmation prompt shown before Holiday Mode is enabled  
* On confirmation: all Live listings hidden from buyers within 60 seconds  
* Seller's profile page shows Holiday Mode active indicator  
* Seller receives in-app confirmation that Holiday Mode is on  
* Buyers attempting to access a paused listing via a direct URL see: "This item is currently unavailable"

**Disable Holiday Mode**

* Confirmation prompt shown before Holiday Mode is disabled  
* On confirmation: all previously paused listings restored to Live status within 60 seconds  
* Restored listings immediately visible in search, browse, and sport-filtered pages  
* Seller receives in-app confirmation that Holiday Mode is off and listings are live again

**General**

* Holiday Mode can be toggled on and off an unlimited number of times  
* Holiday Mode applies to all of the seller's listings simultaneously — it cannot be applied selectively to individual listings in v1  
* In-progress orders are not affected by Holiday Mode — they continue to fulfilment as normal  
* Messages remain accessible and sendable during Holiday Mode — seller can still communicate with buyers  
* Balance and financial data remain accessible during Holiday Mode  
* Holiday Mode does not affect the seller's account status — they remain Active and authenticated

---

## **10\. Business Rules**

* Holiday Mode pauses all of the seller's Live listings simultaneously — there is no selective pause of individual listings in v1  
* A listing published by the seller while Holiday Mode is active is immediately paused on publish — it does not go Live until Holiday Mode is disabled  
* In-progress orders at the time Holiday Mode is enabled are not cancelled — the seller remains obligated to fulfil them  
* Holiday Mode does not affect the seller's rating, balance, messages, or account standing — it is a listing visibility control only  
* Buyers who have wishlisted a seller's listing see it with a "No longer available" label during Holiday Mode — the listing is restored in their Favourites when Holiday Mode is disabled  
* There is no maximum duration for Holiday Mode in v1 — the seller can leave it active indefinitely; the platform does not auto-disable it after a set period  
* If a seller's account is suspended while Holiday Mode is active, the suspension takes precedence — listings remain hidden for the duration of the suspension regardless of Holiday Mode status

---

## **11\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Holiday Mode toggle | Enable | Confirmation required before enabling | Confirmation prompt: "Enable Holiday Mode? All your active listings will be hidden from buyers until you turn it off." | On toggle to On |
| Holiday Mode toggle | Disable | Confirmation required before disabling | Confirmation prompt: "Disable Holiday Mode? All your listings will be restored and visible to buyers immediately." | On toggle to Off |
| Authentication | Page access | Seller must be authenticated | Redirect to sign up / login; returned to Holiday Mode page after auth | On page load |
| Listing restoration | Disable | All listings paused by Holiday Mode must be restored | If any listing fails to restore: retry automatically; seller notified if restoration is incomplete after 2 minutes | On Holiday Mode disable |

---

---

# **Feature 3 — Balance**

---

## **12\. Story & Story Narrative**

**Story** As a seller, I want to view my earnings and payout balance so I know exactly how much I have made and when I can withdraw my funds.

**Story Narrative** Seller taps Balance from their profile and sees a clear breakdown of their cleared earnings available for withdrawal, any amounts still held in escrow pending buyer confirmation, and their total lifetime earnings. They can review individual transactions and request a payout to their linked bank account when ready.

Benefit: Provides full financial transparency, builds trust that earnings are tracked accurately, reduces uncertainty around when funds are available, and gives sellers confidence in the platform's payout process.

---

## **13\. User Flow**

**Preconditions**

* Seller is authenticated  
* Seller has at least one completed or in-progress sale

**Main Flow**

1. Seller taps "Balance" from the profile menu  
2. Balance page loads displaying:  
   * Cleared balance — funds available for withdrawal (escrow released, commission deducted)  
   * Pending balance — funds still held in escrow awaiting buyer delivery confirmation  
   * Total earned — cumulative net earnings from all completed sales (after commission)  
3. Transaction history listed below balance summary — reverse chronological order  
4. Each transaction entry shows:  
   * Order ID  
   * Item title  
   * Gross sale price  
   * Platform commission deducted  
   * Net amount credited to seller  
   * Date  
   * Status: Cleared / Pending / Refunded  
5. Seller reviews balance and transaction history  
6. Seller taps "Request Payout" if cleared balance is greater than £0.00  
7. Payout confirmation shown: amount to be paid out and destination bank account (masked)  
8. Seller confirms  
9. Payout initiated via Stripe to linked bank account  
10. Balance updated to reflect the withdrawal  
11. Seller receives in-app and email confirmation of payout request

**Alternative Flow — No Earnings Yet**

1. Seller taps Balance with no completed sales  
2. Balance page shows £0.00 across all balance fields  
3. Empty transaction history with message: "No transactions yet — your earnings will appear here as your items sell"  
4. Request Payout button disabled

**Alternative Flow — No Bank Account Linked**

1. Seller taps Request Payout  
2. No bank account linked in Settings → Payments  
3. Payout blocked — seller shown: "Add a bank account in Settings → Payments to request a payout"  
4. CTA links directly to Settings → Payments  
5. Seller adds bank account and returns to Balance to request payout

**Alternative Flow — Disputed Transaction**

1. Seller sees a transaction with Refunded status in their history  
2. Transaction shows: gross sale price, commission refunded, net amount deducted from balance  
3. If dispute ruled in buyer's favour after escrow was already pending: pending balance reduced by refund amount  
4. Seller can tap the transaction to view the order detail for context

**Post Conditions**

* Seller has reviewed their current balance and full transaction history  
* If payout was requested: withdrawal initiated to linked bank account via Stripe  
* Balance figures reflect the accurate current state after payout request  
* Transaction history updated to show the payout as a withdrawal entry

---

## **14\. Acceptance Criteria**

**Balance Summary**

* Balance page accessible from Profile → Balance  
* Three balance figures displayed: cleared balance, pending balance, total earned  
* All amounts displayed in GBP with two decimal places  
* Cleared balance \= gross sale proceeds minus platform commission for all completed sales where escrow has been released  
* Pending balance \= gross sale proceeds minus platform commission for sales where escrow is still held  
* Total earned \= cumulative net earnings from all time including historical payouts

**Transaction History**

* All transactions listed in reverse chronological order  
* Each entry shows: order ID, item title, gross sale price, commission deducted, net amount, date, and status  
* Status labels: Cleared, Pending, Refunded  
* Transaction history is paginated — 20 entries per page with load more  
* Empty state shown with explanatory message if no transactions exist

**Request Payout**

* Request Payout CTA active only when cleared balance ≥ £1.00  
* Request Payout CTA disabled with "No funds available" label when cleared balance \< £1.00  
* Payout confirmation screen shows: exact payout amount and masked destination bank account  
* Seller must confirm payout before it is initiated  
* Payout processed via Stripe to linked bank account  
* Seller receives in-app and email confirmation within 5 minutes of payout request  
* If no bank account is linked: Request Payout blocked; CTA to Settings → Payments shown  
* Payout processing time communicated to seller: typically 1–3 business days

**General**

* Balance page loads within 2 seconds  
* Balance figures are real-time — not cached from a previous session  
* Page accessible only to authenticated sellers

---

## **15\. Business Rules**

* Cleared balance consists of funds from completed sales where escrow has been released and platform commission has been deducted — it is the seller's net receivable amount  
* Pending balance consists of funds from sales where escrow is still held — these are not available for withdrawal until the buyer confirms delivery or the dispute window closes without a dispute being raised  
* Platform commission is deducted from the seller's payout automatically when escrow is released — it is shown as a line item on each transaction entry so the seller has full visibility of what was deducted  
* Minimum payout amount is £1.00 — payouts below this threshold are not permitted  
* Payout is processed to the bank account linked in Settings → Payments only — no alternative payout destination is supported in v1  
* A refund issued on a disputed transaction reduces the seller's balance by the refund amount — if escrow was already released and added to cleared balance, the refund amount is deducted from the next available cleared balance; if still pending, the pending balance is reduced  
* There is no maximum payout amount — the seller can withdraw their full cleared balance in a single payout request  
* Payout processing time is 1–3 business days depending on the receiving bank — this is a Stripe and bank processing timeline; the platform cannot guarantee same-day payment  
* Balance data must reconcile with the individual order records in the seller's My Sales view — any discrepancy is a data integrity issue

---

## **16\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Authentication | Page access | Seller must be authenticated | Redirect to sign up / login; returned to Balance page after auth | On page load |
| Request Payout — minimum | Payout action | Cleared balance must be ≥ £1.00 | "Minimum payout amount is £1.00" — button disabled below threshold | On render and on tap |
| Bank account linked | Payout action | Bank account must be linked in Settings → Payments | "Add a bank account in Settings → Payments to request a payout" — payout blocked; CTA to Settings shown | On payout tap |
| Payout confirmation | Irreversible action | Seller must confirm before payout is initiated | Confirmation prompt showing amount and destination bank — payout only fires on explicit confirm | On Request Payout tap |

# **SRS — Account | Settings**

**Platform:** The Kit Loop | **User:** Seller | **Module:** Account | **Sub-Module:** Settings | **Version:** 1.0

---

## **1\. Feature Overview**

The Settings sub-module for sellers covers two features that are specifically relevant to the selling experience on The Kit Loop: Postage Preferences allows sellers to set a default parcel size that pre-populates on every new listing they create, reducing repetitive data entry; Payment / Payout Settings allows sellers to add and manage the bank account to which their sale proceeds are paid out. Both features are accessible from Profile → Settings and are designed to make the selling process faster and more reliable for active sellers who list frequently and expect prompt, accurate payouts.

There are two features within this sub-module:

* **Feature 1 — Postage Preferences**  
* **Feature 2 — Payment / Payout Settings**

---

---

# **Feature 1 — Postage Preferences**

---

## **2\. Story & Story Narrative**

**Story** As a seller, I want to set a default parcel size in my settings so my listing form is pre-populated with my preferred shipping option and I do not have to select it manually every time I list an item.

**Story Narrative** A seller who regularly lists cricket bats knows they always ship Large parcels. They set Large as their default parcel size in Postage Preferences. Every time they start a new listing, the parcel size field is pre-populated with Large — saving them a step and reducing the chance of accidentally selecting the wrong size.

Benefit: Speeds up the listing creation process for active sellers, reduces repetitive input, and ensures parcel size is consistently set correctly for sellers who typically list items of similar dimensions.

---

## **3\. User Flow**

**Preconditions**

* Seller is authenticated  
* Seller has navigated to Profile → Settings → Postage

**Main Flow**

1. Seller taps "Postage" from the Settings menu  
2. Postage Preferences page loads showing:  
   * Current default parcel size (if previously set)  
   * Four parcel size options with descriptions and indicative Royal Mail pricing:  
     * Small Parcel — e.g. gloves, balls, small accessories  
     * Medium Parcel — e.g. rackets, pads, helmets  
     * Large Parcel — e.g. cricket bats, golf clubs, hockey sticks  
     * Oversized — courier required e.g. skis, golf bags, road bikes  
3. Seller taps their preferred default parcel size  
4. Selection highlighted with active indicator  
5. Seller taps Save  
6. Default parcel size saved against seller's account  
7. Confirmation shown: "Your default parcel size has been saved"  
8. From this point, all new listing forms pre-populate the Parcel Size field with the saved default

**Alternative Flow — No Default Set**

1. Seller has not previously set a postage preference  
2. Postage Preferences page shows all four options with none selected  
3. Parcel size field on the sell form shows the platform default (Medium) until seller sets a preference  
4. Seller sets their preference and saves — subsequent listing forms use the new default

**Alternative Flow — Change Default**

1. Seller previously set Large as their default  
2. Seller navigates back to Postage Preferences  
3. Current selection (Large) shown as active  
4. Seller taps a different option (e.g. Medium)  
5. Seller saves  
6. New default (Medium) applied to all subsequent new listing forms  
7. Previously published listings are not affected

**Post Conditions**

* Default parcel size is saved against the seller's account  
* All new listing forms created after saving will pre-populate the Parcel Size field with the saved default  
* The pre-populated value is still editable by the seller on each individual listing — it is a default, not a lock  
* Previously published listings are not retroactively updated

---

## **4\. Acceptance Criteria**

* Postage Preferences page accessible from Profile → Settings → Postage  
* Four parcel size options displayed with clear labels and item type examples  
* Current saved default shown as selected/active on page load  
* Seller can select any one of the four options  
* Save button present — preference saved only on explicit Save tap  
* Confirmation message shown after successful save  
* Saved default pre-populates the Parcel Size field on all new listing forms created after saving  
* Pre-populated value is editable by the seller on each individual listing form  
* Previously published listings are not affected by a change to postage preference  
* If no preference is set, listing form shows platform default (Medium) or auto-recommended size based on category — whichever is more specific  
* Page loads within 2 seconds

---

## **5\. Business Rules**

* Default parcel size is a convenience setting only — it pre-populates the listing form field but does not lock the value; the seller can always override it on any individual listing  
* The category-based parcel size auto-recommendation on the sell form takes precedence over the saved default when a category is selected — the auto-recommendation reflects the item's actual typical dimensions from the sport master data  
* Changing the default parcel size does not retroactively update any published listings — it only affects new listings created after the change is saved  
* The Oversized option in Postage Preferences serves as a default for sellers who primarily list oversized items — when selected, the listing form shows the courier-only notice for the parcel size field  
* Postage preference is account-level — it applies across all devices where the seller is authenticated

---

## **6\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Authentication | Page access | Seller must be authenticated | Redirect to sign up / login; returned to Postage Preferences after auth | On page load |
| Parcel size selection | Save action | One option must be selected before saving | Save button disabled until a selection is made if no existing preference is saved | On render |
| Save action | Preference update | Selection must differ from current saved preference to enable Save | If same option selected as current default: Save button disabled; no change required | On selection |

---

---

# **Feature 2 — Payment / Payout Settings**

---

## **7\. Story & Story Narrative**

**Story** As a seller, I want to add and manage my bank account details so I receive my sale proceeds promptly and to the correct account after each transaction completes.

**Story Narrative** A seller completes their first sale and wants to ensure their payout reaches the right bank account. They navigate to Settings → Payments, add their bank account via the secure Stripe Connect form, and confirm. From this point, all future payouts from completed sales are automatically sent to this account when escrow is released.

Benefit: Ensures sellers can receive earnings without delay, removes friction from the payout process, and leverages Stripe's secure infrastructure for bank-level payment handling.

---

## **8\. User Flow**

**Preconditions**

* Seller is authenticated  
* Seller has navigated to Profile → Settings → Payments

**Main Flow — Add Bank Account**

1. Seller taps "Payments" from the Settings menu  
2. Payment / Payout Settings page loads showing:  
   * Payout bank account section — shows current linked account or "No bank account linked"  
   * Saved cards section — for buyer checkout use (shared with buyer payment settings)  
3. Seller taps "Add bank account" in the payout section  
4. Stripe Connect secure form opens:  
   * Account holder name  
   * Sort code (6 digits)  
   * Account number (8 digits)  
5. Seller enters bank details  
6. Seller taps Save  
7. Bank account verified and linked via Stripe Connect  
8. Payout section updates to show linked account: account holder name, masked sort code (e.g. **\-**\-12), masked account number (e.g. \*\*\*\*5678)  
9. Confirmation shown: "Your bank account has been linked. Payouts from your sales will be sent to this account."  
10. All future payouts from completed sales automatically sent to this account

**Main Flow — Update Bank Account**

1. Seller already has a bank account linked  
2. Seller taps "Update bank account" or "Change" next to the existing account  
3. Stripe Connect form opens pre-populated with existing account holder name (sort code and account number not shown for security)  
4. Seller enters new bank details  
5. Seller taps Save  
6. New bank account verified and linked  
7. Previous bank account replaced — all future payouts go to the new account  
8. Confirmation shown: "Your bank account has been updated."

**Main Flow — Remove Bank Account**

1. Seller taps "Remove" next to the linked bank account  
2. Confirmation prompt: "Remove your bank account? You will not be able to receive payouts until a new account is added."  
3. Seller confirms  
4. Bank account removed from account  
5. Request Payout in Balance page is blocked until a new bank account is added

**Alternative Flow — Payout Attempted with No Bank Account**

1. Seller navigates to Profile → Balance and taps Request Payout  
2. No bank account linked  
3. Seller shown: "Add a bank account in Settings → Payments to receive your payout"  
4. CTA links directly to Settings → Payments  
5. Seller adds bank account and returns to Balance to complete payout

**Post Conditions**

* Bank account is linked and will receive all future payouts automatically when escrow is released  
* Masked bank account details are shown in Payout Settings confirming the linked account  
* Request Payout in the Balance page is now active  
* All financial data is handled and stored securely by Stripe — the platform does not store raw bank details

---

## **9\. Acceptance Criteria**

**Bank Account — Add**

* Payment / Payout Settings page accessible from Profile → Settings → Payments  
* Payout section shows "No bank account linked" if no account has been added  
* "Add bank account" CTA opens Stripe Connect secure form  
* Form collects: account holder name, sort code, account number  
* "Powered by Stripe" label shown on the form  
* Successful link shows masked account details: masked sort code and last 4 digits of account number  
* Confirmation message shown after successful link  
* Page updates to show linked account details immediately after save

**Bank Account — Update**

* "Change" or "Update" option visible when a bank account is already linked  
* Existing account holder name pre-populated in update form  
* Sort code and account number fields blank — seller must re-enter for security  
* New account replaces old account immediately on save  
* Confirmation message shown after successful update

**Bank Account — Remove**

* "Remove" option visible when a bank account is linked  
* Confirmation prompt shown before removal  
* On confirmation: bank account removed; payout section returns to "No bank account linked" state  
* Request Payout in Balance page disabled until new account added

**Saved Cards Section**

* Saved cards section shown on the same Payments settings page  
* Lists any saved buyer payment cards with: card brand, last 4 digits, expiry date  
* Seller can add, view, and remove saved cards (same as buyer payment settings)  
* Maximum 3 saved cards per account

**General**

* No raw bank details stored by the platform — all data tokenised and managed by Stripe  
* Page loads within 2 seconds  
* Accessible only to authenticated sellers

---

## **10\. Business Rules**

* All payout bank details are handled exclusively by Stripe Connect — the platform never stores raw sort codes or account numbers  
* Only one bank account can be linked per seller account at a time — updating the bank account replaces the previous one; multiple simultaneous payout accounts are not supported in v1  
* Removing a bank account does not affect payouts already in transit — any payout initiated before removal is processed to the original account; only future payouts are affected  
* Payout bank account must be a UK bank account in v1 — international bank accounts are not supported  
* If a seller attempts to request a payout without a linked bank account, the payout is blocked and the seller is directed to add a bank account first  
* Bank account changes take effect immediately — the updated account receives all payouts initiated after the change is saved  
* A seller whose account is suspended cannot update bank account details during the suspension period  
* The saved cards section on this page is shared with the buyer payment settings — cards added here are available at checkout when the seller makes a purchase as a buyer and vice versa

---

## **11\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Authentication | Page access | Seller must be authenticated | Redirect to sign up / login; returned to Payments page after auth | On page load |
| Account holder name | Add / Update bank account | Required, letters and spaces only, max 60 characters | "Please enter the account holder name" / "Name can only contain letters and spaces" | On input blur and on save |
| Sort code | Add / Update bank account | Required, 6 digits, numeric | "Please enter a valid 6-digit sort code" | On input blur and on save |
| Account number | Add / Update bank account | Required, 8 digits, numeric | "Please enter a valid 8-digit account number" | On input blur and on save |
| UK bank account | Add / Update | Sort code must be a valid UK sort code format | "Please enter a valid UK sort code" — international formats rejected | On input blur |
| Remove bank account | Remove action | Seller must confirm before removal | Confirmation prompt: "Remove your bank account? You will not be able to receive payouts until a new account is added." | On remove tap |
| Stripe Connect response | Account verification | Bank account must pass Stripe verification | If Stripe rejects account details: "We were unable to verify your bank account — please check your details and try again" | On Stripe Connect response |

Starting with Share a Listing, then Counter Offer update immediately after.

---

# **SRS — Share a Listing**

**Platform:** The Kit Loop | **User:** Buyer & Seller | **Module:** Transactions (Buyer) / Listing (Seller) | **Sub-Module:** Product Page (Buyer) / Post Publish & Active Listings (Seller) | **Version:** 1.0

---

## **1\. Feature Overview**

Share a Listing allows both buyers and sellers to share a listing from The Kit Loop to external platforms — social media, messaging apps, email, or by copying a direct link. For buyers, sharing is available from the listing detail page. For sellers, sharing is available from the Post Publish success screen and from their active listings in View My Listings. The share action generates a preview-rich link that renders the listing's primary photo, title, price, and condition when posted to social media or messaging platforms. Keeping sharing frictionless and visually compelling is critical — every shared listing is a free acquisition channel bringing new buyers to the platform.

---

## **2\. Story & Story Narrative**

**Story — Buyer** As a buyer, I want to share a listing I have found so I can send it to a friend, post it in a group, or save the link for later.

**Story — Seller** As a seller, I want to share my live listing so I can promote it directly to my network and increase its chances of selling quickly.

**Story Narrative** A seller publishes a cricket bat listing and immediately taps Share from the Post Publish success screen. They share it to a WhatsApp cricket club group — the link previews with the listing photo, title, and price. Three group members tap the link, land on the listing detail page, and one purchases. Separately, a buyer finds a padel racket they think a friend would like — they tap Share on the listing detail, copy the link, and send it via iMessage. The friend opens it, sees the full listing, and buys.

Benefit: Every share is a free acquisition event. A well-optimised share preview (photo, title, price) increases click-through from external platforms, brings new buyers to The Kit Loop without paid acquisition cost, and gives sellers a direct promotional tool for their own listings.

---

## **3\. Where Sharing is Available**

| Surface | Role | Entry Point |
| ----- | ----- | ----- |
| Listing detail page | Buyer & Seller | Share icon on listing detail |
| Post Publish success screen | Seller | Share button below View Listing |
| View My Listings | Seller | Share option on each active listing card |

---

## **4\. Share Destinations**

| Destination | Method | Notes |
| ----- | ----- | ----- |
| WhatsApp | Native share sheet / deep link | Most relevant for UK sports communities and club groups |
| Facebook | Native share sheet / Open Graph | Link preview uses OG meta tags |
| Instagram | Copy link (Instagram does not support direct URL sharing in feed; link in bio or DM only) | Copy link provided; buyer pastes manually |
| X (Twitter) | Native share sheet | Link preview via Twitter Card meta tags |
| iMessage / SMS | Native share sheet | Link preview rendered by iOS Messages |
| Email | Native share sheet / mailto | Subject pre-populated with listing title |
| Copy Link | Clipboard copy | Always available as a fallback option |
| Native Share Sheet | iOS / Android system share | Triggers OS-level share sheet showing all installed apps |

---

## **5\. User Flow**

**Preconditions**

* Listing is in Live status  
* Buyer or seller is on a surface where Share is available  
* Buyer may be authenticated or guest — sharing does not require authentication

**Main Flow — Buyer shares from Listing Detail**

1. Buyer is on listing detail page (/listing/\[listingID\])  
2. Share icon visible in the top-right area of the page (alongside wishlist heart)  
3. Buyer taps Share icon  
4. Share bottom sheet opens showing:  
   * Listing preview card: primary photo thumbnail, item title, price, condition badge  
   * Share destination options: WhatsApp, Facebook, X, iMessage, Email, Copy Link  
   * "More" option triggering the native OS share sheet  
5. Buyer selects a destination  
6. Relevant share action fires:  
   * WhatsApp / iMessage / Email / X / Facebook → native share sheet or deep link opens with pre-populated listing URL and preview  
   * Copy Link → listing URL copied to clipboard; toast shown: "Link copied"  
   * More → OS native share sheet opens with all installed apps  
7. Buyer completes share in destination app  
8. Bottom sheet dismisses — buyer remains on listing detail page

**Main Flow — Seller shares from Post Publish success screen**

1. Seller is on Post Publish success screen after publishing a listing  
2. "Share listing" button shown below "View listing →" and above "List another item"  
3. Seller taps Share listing  
4. Same share bottom sheet opens with listing preview and destination options  
5. Seller selects destination and completes share  
6. Bottom sheet dismisses — seller remains on success screen

**Main Flow — Seller shares from View My Listings**

1. Seller navigates to Profile → View My Listings  
2. Each active listing card has a Share option — accessible via a tap-and-hold context menu or a share icon on the card  
3. Seller taps Share on a listing card  
4. Share bottom sheet opens for that listing  
5. Seller selects destination and completes share

**Alternative Flow — Guest shares a listing**

1. Guest buyer on listing detail taps Share  
2. Share bottom sheet opens — no authentication required to share  
3. Guest selects Copy Link or a social destination  
4. Share completes — guest is not prompted to sign up

**Alternative Flow — Recipient opens shared link**

1. Recipient receives a shared link (WhatsApp, iMessage, social post, email)  
2. Recipient taps the link  
3. Link preview rendered in the messaging/social app showing: primary photo, listing title, price, platform name  
4. Recipient lands on /listing/\[listingID\]  
5. Full listing detail loads — accessible to both authenticated and guest users  
6. If listing has sold or been removed: unavailable state shown with Browse Similar CTA

**Post Conditions**

* Listing URL has been shared to the selected destination or copied to clipboard  
* Buyer or seller remains on the originating page — no navigation occurs on share  
* If Copy Link was selected: URL is in the clipboard; toast confirmation shown  
* No listing data has been altered by sharing  
* Share event is recorded for listing analytics (future feature)

---

## **6\. Acceptance Criteria**

**Share Trigger**

* Share icon visible on every Live listing detail page — for both authenticated and guest users  
* Share icon positioned in the top-right of the listing detail alongside the wishlist heart  
* Share button visible on Post Publish success screen below View Listing link  
* Share option available on each Live listing card in View My Listings

**Share Bottom Sheet**

* Bottom sheet opens within 1 second of Share tap  
* Listing preview card shown at top of sheet: primary photo thumbnail, item title, price, condition badge  
* Minimum share destinations shown: WhatsApp, Facebook, X, iMessage, Email, Copy Link, More  
* Each destination shows its recognisable icon and label  
* Tapping a destination fires the correct share action for that platform  
* "More" option opens the OS native share sheet on iOS and Android  
* Bottom sheet is dismissible by tapping outside it or swiping down  
* Buyer/seller returns to the originating page after share or dismissal

**Copy Link**

* Copy Link always available regardless of device or OS  
* Tapping Copy Link copies the full listing URL to clipboard  
* Toast notification shown: "Link copied" — disappears after 2 seconds  
* Copied URL is the canonical listing URL: https://kit-loop-gear.base44.app/listing/\[listingID\]

**Share Preview (Open Graph / Social Meta Tags)**

* Every listing detail page must include Open Graph meta tags for rich link preview:  
  * og:title → item title (e.g. "Gray-Nicolls Kronus 1500 Cricket Bat — Short Handle")  
  * og:description → first 120 characters of listing description \+ price (e.g. "Good condition · £89 — on The Kit Loop")  
  * og:image → primary listing photo URL (min 600x315px for OG compliance)  
  * og:url → canonical listing URL  
  * og:site\_name → "The Kit Loop"  
* Twitter Card meta tags included for X share previews  
* Meta tags are server-side rendered — not client-side injected — so they are readable by social crawlers  
* If listing photo does not meet OG minimum dimensions, platform default fallback image used

**Unavailable Listing**

* If a shared listing URL is opened after the listing has sold or been removed: unavailable state shown  
* Unavailable state includes: "This item is no longer available" \+ Browse Similar CTA linking to sport-filtered /search

**General**

* Sharing does not require authentication — guests can share and recipients can view without logging in  
* Share is available on both mobile and desktop — desktop shows share destinations appropriate to that platform (Copy Link always present; native share sheet on supported browsers)  
* Listing must be in Live status for Share to be available — Share icon hidden on sold, removed, paused, or flagged listings

---

## **7\. Business Rules**

* Share is available on Live listings only — removed, paused, flagged, and sold listings cannot be shared; the share icon is hidden for these statuses  
* Authentication is not required to share a listing — this maximises the acquisition value of every share event  
* The shared URL is always the canonical public listing URL — no tracking parameters, UTM codes, or session tokens are included in the base share URL in v1; UTM parameters for analytics attribution are a v2 addition  
* Open Graph meta tags must be server-side rendered — client-side rendering is not sufficient because social platform crawlers do not execute JavaScript  
* The listing's primary photo is used as the share preview image — the seller's chosen Main photo is therefore important not just for on-platform display but for off-platform preview quality  
* If a listing is sold or removed after a share link has been distributed, the recipient sees the unavailable state — the link never 404s; it always resolves gracefully  
* Share events are recorded against the listing record for future seller-facing analytics (number of shares, share source) — this data is captured server-side but not surfaced to sellers in v1

---

## **8\. Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Listing status | Share icon render | Listing must be Live | Share icon hidden for non-Live listings — no error shown | On page load |
| OG image dimensions | Meta tag generation | Primary photo must meet OG minimum 600x315px | If photo too small: platform default fallback OG image used; no error shown to user | On meta tag generation at listing publish |
| Copy Link | Clipboard write | Browser must support Clipboard API | If Clipboard API unavailable: show listing URL in a selectable text field with manual copy instruction | On Copy Link tap |
| Shared URL resolution | Recipient page load | Listing ID must exist in database | If listing not found: redirect to homepage with "Item not found" notice | On page load |
| Listing availability | Recipient page load | Listing must be Live for full detail to show | If sold / removed / paused: unavailable state shown with Browse Similar CTA | On page load |

---

## **9\. Edge Cases**

| Scenario | Expected Behaviour | Handling |
| ----- | ----- | ----- |
| Listing sells between share and recipient opening link | Recipient sees unavailable state with Browse Similar CTA | Status checked on page load; unavailable state shown if not Live |
| Seller shares their own listing before it is fully indexed by search | Listing detail page loads correctly from direct URL — search indexing is separate from direct URL access | Direct URL always resolves from database; no dependency on search index |
| Recipient opens shared link on a device with no Kit Loop account | Full listing detail visible as guest; prompted to sign up only at point of purchase | Guest access to listing detail is unrestricted |
| Share bottom sheet opened on desktop browser | Desktop-appropriate share options shown: Copy Link always present; Web Share API used if browser supports it; individual social share links as fallback | Feature-detect Web Share API; fallback to individual deep links |
| User taps Share multiple times rapidly | Share bottom sheet opens once; duplicate taps ignored | Tap debounce applied; single sheet instance |
| OG image is a video thumbnail (seller uploaded video only) | Platform default OG image used — video cannot be used as OG preview image | OG image always set to primary photo; video never used as OG image |
| Instagram share selected | Instagram does not support direct URL share to feed; Copy Link shown instead with instruction: "Paste this link in your Instagram bio or DM" | Instagram deep link opens DM composer on mobile if Instagram app installed; otherwise Copy Link fallback |

---

## **10\. Exceptional Cases**

* **UTM tracking for share attribution:** In v1 the shared URL contains no tracking parameters. This means the platform cannot attribute inbound traffic to specific share events or channels. A UTM parameter layer — appending ?utm\_source=whatsapp\&utm\_medium=share\&utm\_campaign=listing to each destination-specific share URL — should be added in v2 to give the marketing and product teams share attribution data without compromising the cleanliness of the canonical URL.

* **Dynamic OG image generation:** In v1, the primary listing photo is used as-is for the OG preview image. If the photo is portrait-orientation or does not fill the 1.91:1 OG aspect ratio, the preview will be letterboxed or cropped inconsistently across platforms. A server-side image transformation service that crops and resizes the primary photo to exactly 1200x630px on listing publish would ensure consistent, high-quality share previews across all platforms and should be prioritised before any social sharing marketing campaign.

* **Share count as a trust signal:** The number of times a listing has been shared is a meaningful demand signal — a listing shared 40 times is implicitly more desirable than one shared 0 times. Displaying a share count on the listing detail page (e.g. "Shared 12 times") could increase buyer confidence and urgency. This requires server-side share event tracking and a display component on the listing detail — a v2 feature once share tracking data has been collected for a meaningful period.

* **Deep link handling on mobile:** If the recipient taps a shared link on a mobile device that has The Kit Loop app installed (future native app), the link should open in the app rather than the browser. Universal Links (iOS) and App Links (Android) must be configured before a native app is launched to ensure shared links route correctly across web and app contexts.

---

---

# **SRS Update — Counter Offer Flow**

**Platform:** The Kit Loop | **Affects:** Buyer / Transactions / Make Offer \+ Seller / Transactions / Offers | **Version:** 1.1 — replaces counter-offer section in both SRS documents\*\*

---

## **1\. What Changes and Why**

The original Make Offer flow allowed sellers to counter-offer only via a free-text message reply. This creates friction — the buyer must read the seller's text, mentally parse the counter amount, and manually decide whether to proceed to checkout at that price. There is no structured handoff from negotiation to purchase.

The updated flow introduces a structured numerical counter-offer field. When a seller sends a counter-offer using this field, the buyer receives a clear counter-offer card in the thread with Accept or Decline actions. If the buyer taps Accept, the listing price is automatically updated to the agreed counter amount and the buyer is taken directly to checkout. This closes the gap between negotiation and transaction, reduces drop-off between offer acceptance and purchase, and makes the pricing agreement explicit and structured rather than informal and text-based.

---

## **2\. Updated Story Narratives**

**Buyer — Send Offer / Message (updated)** Buyer finds a listing priced at £195 and wants to offer £170. They tap Make Offer, enter £170 in the offer field with an optional message, and send. The seller responds with a structured counter-offer of £180. The buyer sees a counter-offer card in the thread showing £180 with Accept and Decline buttons. They tap Accept — the listing price updates to £180 and checkout opens automatically at the agreed price. No manual navigation, no price confusion.

**Seller — Receive & Respond to Offers (updated)** Seller receives a £170 offer on a £195 listing. They open the thread and see the buyer's offer card. Rather than typing a reply, they tap Counter Offer, enter £180 in the counter-offer field, add an optional message, and send. The buyer receives a structured counter-offer card. If the buyer accepts, the deal is locked at £180 and checkout opens automatically.

---

## **3\. Updated User Flow — Counter Offer**

**Preconditions**

* Seller has received a buyer offer in a message thread  
* Listing is in Live status  
* Seller is authenticated and in the message thread

**Main Flow — Seller sends structured counter-offer**

1. Seller opens message thread  
2. Seller sees buyer's offer displayed as an offer card: "Offer: £170" with Accept and Decline options  
3. Seller taps Counter Offer (third option alongside Accept and Decline)  
4. Counter-offer input appears inline in the message composer:  
   * Numerical field pre-populated with the listing's current price (£195) — seller edits to their counter amount  
   * Optional message text field below the counter amount  
5. Seller enters counter amount (e.g. £180) and optional message  
6. Seller taps Send Counter Offer  
7. Counter-offer card appears in the thread for the buyer:  
   * "Counter offer: £180" displayed prominently  
   * Seller's optional message below  
   * Two action buttons: Accept (green) and Decline (outlined)  
   * Expiry notice: "This counter offer expires in 24 hours"  
8. Buyer receives in-app and email notification: "Seller has made a counter offer of £180 on \[listing title\]"

**Main Flow — Buyer accepts counter-offer**

1. Buyer opens thread and sees counter-offer card  
2. Buyer taps Accept  
3. Confirmation prompt: "Accept counter offer of £180? You'll be taken to checkout at this price."  
4. Buyer confirms  
5. Listing price temporarily locked at £180 for this buyer's checkout session  
6. Buyer navigated automatically to /checkout/\[listingID\]  
7. Checkout loads with order summary showing £180 as the item price  
8. Buyer completes checkout at agreed price  
9. Thread updated: counter-offer card shows "Accepted" status  
10. Seller notified: "Your counter offer of £180 was accepted — \[buyer username\] is completing checkout"

**Main Flow — Buyer declines counter-offer**

1. Buyer taps Decline on the counter-offer card  
2. Decline confirmation: "Decline this counter offer?"  
3. Buyer confirms — optional: buyer can type a reply counter amount in a new offer field  
4. Counter-offer card updates to "Declined" status in thread  
5. Seller notified: "Your counter offer was declined by \[buyer username\]"  
6. Conversation continues — buyer and seller can continue negotiating via further offers or messages

**Alternative Flow — Counter-offer expires**

1. Buyer does not respond to counter-offer within 24 hours  
2. Counter-offer card updates to "Expired" status  
3. Seller notified: "Your counter offer on \[listing title\] has expired"  
4. Listing price reverts to original listed price if it was temporarily adjusted  
5. Buyer can still make a new offer or purchase at listed price

**Alternative Flow — Multiple buyers, one counter-offer accepted**

1. Seller has active offer threads with three different buyers simultaneously  
2. Seller sends a counter-offer to Buyer A  
3. Before Buyer A responds, Buyer B purchases the listing at full price  
4. Listing status changes to Sold  
5. Buyer A's counter-offer card updates to "No longer available — this item has been sold"  
6. All open offer threads are closed automatically

**Post Conditions**

* If counter-offer accepted: listing price locked at counter amount for buyer's checkout session; buyer is on the checkout page; seller notified of acceptance  
* If counter-offer declined: thread remains open; original listing price unchanged; further negotiation possible  
* If counter-offer expired: card marked expired; listing price unchanged; thread remains open  
* Counter-offer is recorded in the thread permanently — it cannot be withdrawn by the seller after sending

---

## **4\. Updated Acceptance Criteria**

**Seller — Counter Offer**

* Counter Offer option available on all received buyer offer cards in the thread  
* Counter Offer opens an inline numerical input field — not a free-text field  
* Numerical field accepts GBP amounts only — min £1.00, max £9,999.00  
* Counter amount must be less than the current listed price — seller cannot counter above their own listing price  
* Optional message field available alongside the counter amount  
* Send Counter Offer button disabled until a valid counter amount is entered  
* Counter-offer card appears in thread immediately after send  
* Counter-offer card clearly shows: "Counter offer: £\[amount\]", optional message, Accept button, Decline button, 24-hour expiry notice  
* Seller notified when buyer accepts, declines, or allows counter to expire

**Buyer — Receive and Act on Counter Offer**

* Counter-offer card displayed prominently in the message thread — visually distinct from plain messages  
* Counter amount displayed in large, clear format: "Counter offer: £\[amount\]"  
* Accept and Decline buttons clearly labelled and visually distinct  
* Tapping Accept shows a confirmation prompt before proceeding  
* On confirmation: buyer navigated automatically to /checkout/\[listingID\] with counter price applied  
* Checkout order summary reflects the counter-agreed price — not the original listed price  
* Tapping Decline prompts confirmation and updates card to Declined status  
* Buyer can submit a new offer after declining — negotiation continues

**Counter Price at Checkout**

* Agreed counter price is applied to the buyer's checkout session only — it is not a permanent listing price change visible to other buyers  
* Other buyers browsing the listing during the counter-offer period see the original listed price  
* If buyer abandons checkout after accepting counter-offer, the counter price lock expires after 30 minutes — buyer must re-accept to get the counter price again  
* If listing sells to another buyer while counter is accepted but checkout not completed, buyer is shown: "This item has just been sold"

**Counter-Offer Card States**

* Pending — awaiting buyer response (Accept / Decline buttons active)  
* Accepted — green confirmed state; buttons replaced with "Accepted" label  
* Declined — muted state; buttons replaced with "Declined" label  
* Expired — muted state; "Expired after 24 hours" label shown  
* Unavailable — listing sold or removed; "No longer available" label shown

**General**

* Only one active counter-offer per thread at a time — seller cannot send a second counter while first is Pending  
* Counter-offer card is read-only after sending — seller cannot edit the amount after it is sent  
* Both buyer and seller can still send plain text messages while a counter-offer is pending

---

## **5\. Updated Business Rules**

* The structured counter-offer field replaces free-text counter-offer in all negotiation flows — sellers can still send plain text messages but the counter-offer amount must be entered via the numerical field, not typed in a message  
* A counter-offer does not change the listing's public price — the agreed price is applied only to the accepting buyer's checkout session; other buyers see the original listed price throughout  
* Counter-offer price lock at checkout expires after 30 minutes of inactivity — if buyer takes longer than 30 minutes to complete checkout after accepting, the lock expires and they must re-accept the counter  
* Only one counter-offer can be active per thread at a time — sending a new counter while one is pending is not permitted; seller must wait for the buyer to respond or for the current counter to expire  
* Counter-offer expiry is 24 hours from the time it is sent — this is platform-defined and cannot be extended by buyer or seller  
* A counter-offer amount must be greater than £0 and less than or equal to the current listed price — a seller cannot counter above their own asking price  
* If the listing is sold or removed while a counter-offer is pending, all pending counter-offer cards across all threads are automatically updated to Unavailable status  
* The accepted counter price applied at checkout is the exact amount shown on the counter-offer card — no rounding, no additional adjustment  
* Counter-offer history is retained permanently in the thread — it forms part of the dispute evidence record if the transaction goes to dispute  
* Admin has full visibility of all counter-offer card states and amounts in message threads for dispute resolution purposes

---

## **6\. Updated Field Validations**

| Field | Use Case | Validation Rule | Error Message / Behaviour | When to Validate |
| ----- | ----- | ----- | ----- | ----- |
| Counter amount | Seller entry | Required, numeric, min £1.00, max £9,999.00 | "Please enter a valid counter offer amount" | On input and on send |
| Counter amount | Seller entry | Must be ≤ current listed price | "Counter offer cannot exceed your listed price of £\[X\]" | On input blur and on send |
| Counter amount format | Seller entry | GBP only, two decimal places, no letters | Non-numeric characters blocked silently; auto-formatted to two decimal places | On input |
| Active counter check | Send counter | Only one active counter per thread | If counter pending: Send Counter Offer option greyed out; "You have a pending counter offer — wait for a response before sending another" | On counter offer tap |
| Accept confirmation | Buyer accept | Buyer must confirm before checkout redirect | Confirmation prompt: "Accept counter offer of £\[X\]? You'll be taken to checkout at this price." | On Accept tap |
| Decline confirmation | Buyer decline | Buyer must confirm before declining | Confirmation prompt: "Decline this counter offer?" | On Decline tap |
| Counter price at checkout | Checkout load | Counter price lock must be valid (not expired, listing still Live) | If lock expired: "Your counter offer price has expired — return to messages to re-accept" | On checkout page load |
| Listing availability | Accept tap | Listing must be Live at time of accept | If listing sold or removed: "This item is no longer available" — counter card updates to Unavailable | On Accept tap |

---

Both SRS documents are fully updated. To summarise what changed across both:

**Share a Listing** — brand new feature covering 3 surfaces (listing detail, post publish screen, view my listings), 8 share destinations, OG meta tag requirements, and full recipient journey including unavailable state handling.

**Counter Offer** — replaces free-text counter in both Buyer and Seller SRS with a structured numerical counter-offer card system including 5 card states (Pending, Accepted, Declined, Expired, Unavailable), automatic checkout redirect on acceptance, 24-hour expiry, 30-minute checkout price lock, and single-active-counter-per-thread enforcement.

# Flow 

![][image1]  


[image1]: <data:image/png;base64,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>