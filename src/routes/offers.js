const express         = require('express');
const requireAuth     = require('../middleware/auth');
const { scanContent } = require('../middleware/contentScan');
const offersCtrl      = require('../controllers/offersController');

// ── /api/offers ───────────────────────────────────────────────────────────────
const offersRouter = express.Router();

offersRouter.post('/',                    requireAuth, offersCtrl.getOrCreateThread);
offersRouter.get('/',                     requireAuth, offersCtrl.getMyThreads);
offersRouter.get('/:id',                  requireAuth, offersCtrl.getThreadDetail);
offersRouter.get('/:id/messages',         requireAuth, offersCtrl.getMessages);
offersRouter.post('/:id/messages',        requireAuth, scanContent, offersCtrl.sendMessage);
offersRouter.post('/:id/counter-offers',  requireAuth, scanContent, offersCtrl.sendCounterOffer);

// ── /api/counter-offers ───────────────────────────────────────────────────────
const counterOffersRouter = express.Router();

counterOffersRouter.post('/:id/accept',   requireAuth, offersCtrl.acceptCounterOffer);
counterOffersRouter.post('/:id/decline',  requireAuth, offersCtrl.declineCounterOffer);

module.exports = { offersRouter, counterOffersRouter };
