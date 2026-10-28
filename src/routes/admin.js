'use strict';

const { Router } = require('express');
const requireAdmin = require('../middleware/requireAdmin');
const ctrl = require('../controllers/adminController');

const router = Router();

// requireAdmin is [requireAuth, adminCheck] — applies to every route in this file
router.use(requireAdmin);

// ─── Listings ────────────────────────────────────────────────────────────────
// Static route BEFORE parameterised to prevent 'featured' matching as an id
router.get('/listings/featured',        ctrl.getFeaturedListings);
router.patch('/listings/:id/featured',  ctrl.setListingFeatured);
router.get('/listings',                 ctrl.listListings);
router.get('/listings/:id',             ctrl.getListingDetail);
router.post('/listings/:id/flag',       ctrl.flagListing);
router.post('/listings/:id/remove',     ctrl.removeListing);
router.post('/listings/:id/restore',    ctrl.restoreListing);

// ─── Users ───────────────────────────────────────────────────────────────────
router.get('/users',                    ctrl.listUsers);
router.get('/users/:id',                ctrl.getUserDetail);
router.post('/users/:id/suspend',       ctrl.suspendUser);
router.post('/users/:id/ban',           ctrl.banUser);
router.post('/users/:id/reinstate',     ctrl.reinstateUser);
router.delete('/users/:id',             ctrl.hardDeleteUser);

// ─── Orders ──────────────────────────────────────────────────────────────────
// Static route BEFORE parameterised to prevent 'flagged' matching as an id
router.get('/orders/flagged',           ctrl.listFlaggedOrders);
router.get('/orders',                   ctrl.listOrders);

// ─── Disputes ────────────────────────────────────────────────────────────────
router.get('/disputes',                 ctrl.listDisputes);
router.get('/disputes/:id',             ctrl.getDisputeDetail);
router.post('/disputes/:id/rule',       ctrl.ruleDispute);
router.post('/disputes/:id/request-evidence', ctrl.requestEvidence);

// ─── Categories ──────────────────────────────────────────────────────────────
router.get('/sports',                               ctrl.listSports);
router.post('/sports',                              ctrl.createSport);
router.patch('/sports/:id',                         ctrl.updateSport);
router.delete('/sports/:id',                        ctrl.hideSport);
router.post('/sports/:id/unhide',                   ctrl.unhideSport);
router.post('/sports/:sportId/sub-categories',      ctrl.createSubCategory);

// ─── Badges ──────────────────────────────────────────────────────────────────
router.get('/badges/queue',                         ctrl.getBadgeQueue);
router.post('/badges/:userId/approve',              ctrl.approveBadge);
router.post('/badges/:userId/reject',               ctrl.rejectBadge);
router.post('/badges/:userId/revoke',               ctrl.revokeBadge);

// ─── Financials ──────────────────────────────────────────────────────────────
router.get('/fees',                                 ctrl.listFeeConfigs);
router.patch('/fees/:id',                           ctrl.updateFeeConfig);

// ─── Site Settings ───────────────────────────────────────────────────────────
router.get('/settings',                             ctrl.getSiteSettings);
router.patch('/settings/:key',                      ctrl.updateSiteSetting);

module.exports = router;
