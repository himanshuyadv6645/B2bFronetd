# B2B Marketplace - Fixes & Improvements Log

This document tracks the logical and UX bugs identified and fixed across the B2B frontend and backend applications.

## ✅ Bug Fixes & UX Improvements (July 2026)

### 1. Inventory Logic Fix (Backend)
- **Bug:** The "Set Exact" stock adjustment in `InventoryService` allowed `available_stock` to go negative if it didn't account for `reserved_stock`.
- **Fix:** Updated the stock calculation logic using `select_for_update()` to ensure concurrency safety and properly factor in reserved stock, preventing negative available stock balances.

### 2. Seller/Buyer Profile Field Mismatches (Frontend/Backend)
- **Bug:** Discrepancies in field names between the frontend models and backend models (e.g., `gst_number` vs `gstin`). This caused form submissions and profile updates to fail silently or throw validation errors.
- **Fix:** Standardized field names across the frontend API services and components to match the backend serializers.

### 3. Stock Granularity & Product Page UI (Frontend/Backend)
- **Bug:** The API did not return seller-specific stock, and the Product Page UI did not enforce stock limits correctly per seller. This allowed buyers to over-order products from sellers who didn't have enough stock.
- **Fix:** 
  - Backend: Updated `CompareSellersView` in `apps.pricing.views.pricing.py` to return `available_stock` per seller.
  - Frontend: Updated the `ProductDetailPage.tsx` logic to calculate and validate `availableStock` on a per-seller basis.

### 4. Shipping Logistics & Tracking (Frontend)
- **Bug:** The `SellerOrdersPage` lacked a way for sellers to provide tracking information when marking an order as shipped, resulting in missing logistics data for buyers.
- **Fix:** Added a tracking form (Number and URL) in the `SellerOrdersPage` and passed it through the `shipSellerOrder` mutation to the backend.

### 5. Review & Rating System Accessibility (Frontend)
- **Bug:** The backend supported Product and Seller reviews, but the `BuyerOrdersPage` had no UI for buyers to actually leave reviews on delivered orders.
- **Fix:** Created a `ReviewModal` component and integrated it into `BuyerOrdersPage.tsx`. Buyers can now rate the seller and review individual products once an order is marked as "Delivered".

### 6. Generic Error Bubbling (Frontend)
- **Bug:** Multiple pages (`BuyerOrdersPage`, `SellerInventoryPage`, `SellerOrdersPage`, `SellerPricingPage`, `AdminApprovalsPage`) used generic toast messages (e.g., "Failed to save") that masked critical backend validation rules.
- **Fix:** Replaced generic toast errors with detailed backend-driven messages (`error.response?.data?.message`), making errors actionable for users.

---
*Maintained by the Antigravity Agent*
