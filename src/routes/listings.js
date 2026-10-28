const express = require('express');

const requireAuth = require('../middleware/auth');
const listingUpload = require('../middleware/upload');
const listingController = require('../controllers/listingController');

const { optionalAuth } = requireAuth;

const router = express.Router();

// ─── Seller: listing management ───────────────────────────────────────────────
router.post('/listings', requireAuth, listingUpload, listingController.createListing);
router.post('/listings/:id/publish', requireAuth, listingController.publishListing);
router.put('/listings/:id', requireAuth, listingUpload, listingController.updateListing);
router.delete('/listings/:id', requireAuth, listingController.deleteListing);

// ─── Seller: my listings ──────────────────────────────────────────────────────
// Must be declared BEFORE /:id to prevent "mine" being matched as a listing ID
router.get('/listings/mine', requireAuth, listingController.getMyListings);

// ─── Public: listing detail & share preview ───────────────────────────────────
router.get('/listings/:id/share-preview', listingController.getSharePreview);
router.get('/listings/:id', optionalAuth, listingController.getListing);

// ─── Public: search, browse, homepage ────────────────────────────────────────
router.get('/listings', listingController.searchListings);
router.get('/home', optionalAuth, listingController.getHomepageData);

// ─── Share (analytics — no auth required, records user_id if present) ─────────
router.post('/listings/:id/share', optionalAuth, listingController.recordShare);

// ─── Favourites ───────────────────────────────────────────────────────────────
router.post('/listings/:id/favourite', requireAuth, listingController.toggleFavourite);
router.get('/favourites', requireAuth, listingController.getMyFavourites);

module.exports = router;
