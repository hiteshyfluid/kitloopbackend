'use strict';

/**
 * Test data seed for The Kit Loop.
 *
 * Prerequisites: run `node src/jobs/seedData.js` first (sports, sub-categories, brands).
 * Usage:         node src/jobs/testSeed.js
 * Reset flag:    node src/jobs/testSeed.js --reset   (deletes test data first)
 *
 * Creates:
 *   - 3 test users  (buyer@test.com, seller@test.com, admin@test.com) — password: KitLoop2024!
 *   - 5 test listings across different sports and conditions
 *   - 1 completed order  (cricket bat sold, order fully released)
 *   - 1 active offer thread with a pending counter-offer (football boots)
 *   - Fee config rows if absent
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma  = require('../lib/prisma');

// ─── Constants ───────────────────────────────────────────────────────────────

const TEST_PASSWORD  = 'KitLoop2024!';
const SALT_ROUNDS    = 10;          // lower than prod (12) for seed speed
const TEST_TAG       = '[TEST]';    // prefix on listing titles for easy identification

// Placeholder Cloudinary-style URLs — swap for real images in staging
const PHOTO_BASE     = 'https://res.cloudinary.com/kitloop/image/upload/test';
const PHOTOS         = {
  cricket : [`${PHOTO_BASE}/cricket-bat-1.jpg`,  `${PHOTO_BASE}/cricket-bat-2.jpg`],
  football: [`${PHOTO_BASE}/football-boots-1.jpg`],
  tennis  : [`${PHOTO_BASE}/tennis-racket-1.jpg`, `${PHOTO_BASE}/tennis-racket-2.jpg`, `${PHOTO_BASE}/tennis-racket-3.jpg`],
  golf    : [`${PHOTO_BASE}/golf-driver-1.jpg`],
  running : [`${PHOTO_BASE}/running-shoes-1.jpg`, `${PHOTO_BASE}/running-shoes-2.jpg`],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg)  { process.stdout.write(`  ${msg}\n`); }
function ok(msg)   { log(`✓ ${msg}`); }
function skip(msg) { log(`  (skipped) ${msg}`); }
function warn(msg) { log(`! ${msg}`); }

async function getSport(slug) {
  const s = await prisma.sport.findUnique({ where: { slug } });
  if (!s) throw new Error(`Sport "${slug}" not found — run seedData.js first`);
  return s;
}

async function getFirstSubCat(sportId) {
  const sc = await prisma.subCategory.findFirst({ where: { sportId, status: 'active' }, orderBy: { displayOrder: 'asc' } });
  if (!sc) throw new Error(`No sub-categories found for sport ${sportId}`);
  return sc;
}

async function getBrand(slug) {
  const b = await prisma.brand.findUnique({ where: { slug } });
  if (!b) throw new Error(`Brand "${slug}" not found — run seedData.js first`);
  return b;
}

// ─── Reset ───────────────────────────────────────────────────────────────────

async function resetTestData(testUserIds) {
  if (testUserIds.length === 0) return;
  warn('Deleting existing test data…');

  // Order matters — foreign keys
  await prisma.auditLog.deleteMany({ where: { adminId: { in: testUserIds } } });
  await prisma.sellerBadge.deleteMany({ where: { sellerId: { in: testUserIds } } });
  await prisma.notification.deleteMany({ where: { userId: { in: testUserIds } } });
  await prisma.session.deleteMany({ where: { userId: { in: testUserIds } } });
  await prisma.favourite.deleteMany({ where: { userId: { in: testUserIds } } });

  // Messages / counter-offers / offers connected to test listings
  const testListingIds = (await prisma.listing.findMany({
    where: { sellerId: { in: testUserIds }, title: { startsWith: TEST_TAG } },
    select: { id: true },
  })).map((l) => l.id);

  if (testListingIds.length > 0) {
    const offerIds = (await prisma.offer.findMany({
      where: { listingId: { in: testListingIds } },
      select: { id: true },
    })).map((o) => o.id);

    if (offerIds.length > 0) {
      await prisma.counterOffer.deleteMany({ where: { offerId: { in: offerIds } } });
      await prisma.message.deleteMany({ where: { offerId: { in: offerIds } } });
      await prisma.offer.deleteMany({ where: { id: { in: offerIds } } });
    }

    const orderIds = (await prisma.order.findMany({
      where: { listingId: { in: testListingIds } },
      select: { id: true },
    })).map((o) => o.id);

    if (orderIds.length > 0) {
      await prisma.review.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.dispute.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    }

    await prisma.listing.deleteMany({ where: { id: { in: testListingIds } } });
  }

  await prisma.user.deleteMany({ where: { id: { in: testUserIds } } });
  ok('Test data deleted');
}

// ─── "Both" user listing + purchase ──────────────────────────────────────────

async function seedBothUserData(both, buyer, seller) {
  // Listing by "both" user as a seller (so they have selling activity)
  const existing = await prisma.listing.count({
    where: { sellerId: both.id, title: { startsWith: TEST_TAG } },
  });

  let yonexListing;
  if (existing > 0) {
    skip('"Both" user listing already exists');
    yonexListing = await prisma.listing.findFirst({
      where: { sellerId: both.id, title: { startsWith: TEST_TAG } },
    });
  } else {
    const badminton = await getSport('badminton').catch(() => null);
    if (!badminton) { warn('Badminton sport not found — skipping both-user listing'); return; }
    const badmintonSC = await getFirstSubCat(badminton.id);
    const yonex = await getBrand('yonex').catch(() => null);
    if (!yonex) { warn('Yonex brand not found — skipping both-user listing'); return; }

    yonexListing = await prisma.listing.create({
      data: {
        sellerId:      both.id,
        title:         `${TEST_TAG} Yonex Astrox 99 Badminton Racket`,
        description:   'Excellent condition Yonex Astrox 99 in 3U/G5. Strung with BG65 at 24lbs. Light scratches on frame from play but shaft is perfect. Bag included.',
        sportId:       badminton.id,
        subCategoryId: badmintonSC.id,
        brandId:       yonex.id,
        condition:     'like_new',
        colour:        'Red/Black',
        price:         95.00,
        shippingFee:   4.99,
        parcelSize:    'large',
        photos:        [`${PHOTO_BASE}/badminton-racket-1.jpg`],
        status:        'live',
        publishedAt:   new Date(Date.now() - 8 * 86400_000),
      },
    });
    ok(`"Both" user listing: Yonex Astrox 99 — £95 (live)`);
  }

  // Purchase by "both" user as a buyer (buying from seller@test.com)
  // Find the tennis racket (new_with_tags, £120) to use as the item
  const tennisList = await prisma.listing.findFirst({
    where: { sellerId: seller.id, title: { contains: 'Tennis Racket' }, status: { not: 'sold' } },
  });
  if (!tennisList) { warn('Tennis listing not found for both-user purchase — skipping'); return; }

  const existingOrder = await prisma.order.findFirst({ where: { listingId: tennisList.id, buyerId: both.id } });
  if (existingOrder) { skip('"Both" user purchase order already exists'); return; }

  const itemPrice          = Number(tennisList.price);
  const shippingFee        = Number(tennisList.shippingFee);
  const buyerProtectionFee = Number((itemPrice * 0.05).toFixed(2));
  const commission         = Number((itemPrice * 0.10).toFixed(2));
  const totalAmount        = Number((itemPrice + shippingFee + buyerProtectionFee).toFixed(2));
  const sellerNetAmount    = Number((itemPrice - commission).toFixed(2));

  const dispatchedAt = new Date(Date.now() - 2 * 86400_000);

  await prisma.order.create({
    data: {
      listingId:     tennisList.id,
      buyerId:       both.id,
      sellerId:      seller.id,
      itemPrice,
      shippingFee,
      buyerProtectionFee,
      platformCommission:  commission,
      totalAmount,
      sellerNetAmount,
      fulfilmentStatus:    'dispatched',
      paymentStatus:       'held',
      disputeStatus:       'none',
      trackingNumber:      'RM987654321GB',
      dispatchedAt,
      deliveryAddressLine1: '45 Racket Road',
      deliveryCity:         'Manchester',
      deliveryPostcode:     'M1 1AA',
      snapshotListingTitle: tennisList.title.replace(TEST_TAG + ' ', ''),
      snapshotCondition:    tennisList.condition,
      snapshotPhotos:       tennisList.photos,
      disputeWindowExpiresAt: new Date(Date.now() + 3 * 86400_000),
    },
  });

  ok(`"Both" user purchase: Babolat Pure Drive Tennis Racket — £${totalAmount} (dispatched, awaiting delivery)`);
}

// ─── Users ───────────────────────────────────────────────────────────────────

async function seedUsers(passwordHash) {
  const defs = [
    { email: 'buyer@test.com',  username: 'test_buyer',  displayName: 'Test Buyer',  role: 'buyer'  },
    { email: 'seller@test.com', username: 'test_seller', displayName: 'Test Seller', role: 'seller' },
    { email: 'both@test.com',   username: 'test_both',   displayName: 'Test BuyerSeller', role: 'both' },
    { email: 'admin@test.com',  username: 'test_admin',  displayName: 'Test Admin',  role: 'admin'  },
  ];

  const users = {};
  for (const def of defs) {
    const user = await prisma.user.upsert({
      where:  { email: def.email },
      update: { role: def.role, accountStatus: 'active', emailVerified: true, passwordHash },
      create: {
        email: def.email, username: def.username, displayName: def.displayName,
        role: def.role, authProvider: 'email', emailVerified: true,
        accountStatus: 'active', passwordHash,
      },
    });
    users[def.email] = user;
    ok(`User: ${def.email}  (role: ${def.role})`);
  }
  return users;
}

// ─── Fee config ───────────────────────────────────────────────────────────────

async function seedFeeConfig(adminId) {
  const defaults = [
    { configKey: 'buyer_protection_fee_percentage', configValue: 0.05, configType: 'percentage', description: 'Buyer protection fee (5 %)' },
    { configKey: 'platform_commission_percentage',  configValue: 0.10, configType: 'percentage', description: 'Platform commission (10 %)' },
    { configKey: 'dispute_window_days',             configValue: 3,    configType: 'flat_amount', description: 'Days after delivery buyer can raise a dispute' },
  ];

  let created = 0;
  for (const d of defaults) {
    const exists = await prisma.feeConfig.findUnique({ where: { configKey: d.configKey } });
    if (!exists) {
      await prisma.feeConfig.create({ data: { ...d, updatedBy: adminId } });
      created++;
    }
  }
  if (created > 0) ok(`Fee config: ${created} row(s) created`);
  else skip('Fee config already seeded');
}

// ─── Listings ────────────────────────────────────────────────────────────────

async function seedListings(seller) {
  // Check existing — tag-based idempotency
  const existing = await prisma.listing.count({
    where: { sellerId: seller.id, title: { startsWith: TEST_TAG } },
  });
  if (existing >= 5) {
    skip('Test listings already exist (5 found)');
    return prisma.listing.findMany({
      where: { sellerId: seller.id, title: { startsWith: TEST_TAG } },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Sports & sub-categories
  const [cricket, football, tennis, golf, running] = await Promise.all([
    getSport('cricket'), getSport('football'), getSport('tennis'),
    getSport('golf'), getSport('running'),
  ]);
  const [cricketSC, footballSC, tennisSC, golfSC, runningSC] = await Promise.all([
    getFirstSubCat(cricket.id), getFirstSubCat(football.id), getFirstSubCat(tennis.id),
    getFirstSubCat(golf.id), getFirstSubCat(running.id),
  ]);

  // Brands
  const [grayNicolls, nike, babolat, callaway, newBalance] = await Promise.all([
    getBrand('gray-nicolls'), getBrand('nike'), getBrand('babolat'),
    getBrand('callaway'), getBrand('new-balance'),
  ]);

  const now = new Date();
  const defs = [
    {
      title: `${TEST_TAG} Gray-Nicolls Kronus Cricket Bat`,
      description: 'Excellent condition full-size Gray-Nicolls Kronus bat. Light oiling done, one small knock mark on back. Used for one season club cricket.',
      sportId: cricket.id, subCategoryId: cricketSC.id, brandId: grayNicolls.id,
      condition: 'like_new', colour: 'Willow', price: 85.00, shippingFee: 6.99,
      parcelSize: 'large', photos: PHOTOS.cricket, status: 'sold', publishedAt: new Date(now - 30 * 86400_000), soldAt: new Date(now - 7 * 86400_000),
    },
    {
      title: `${TEST_TAG} Nike Mercurial Football Boots`,
      description: 'Size 9 Nike Mercurial Vapor boots in good condition. Some stud wear but upper is clean. FG studs. Worn for one season.',
      sportId: football.id, subCategoryId: footballSC.id, brandId: nike.id,
      condition: 'good', colour: 'Blue/Orange', price: 45.00, shippingFee: 4.99,
      parcelSize: 'medium', photos: PHOTOS.football, status: 'live', publishedAt: new Date(now - 14 * 86400_000),
    },
    {
      title: `${TEST_TAG} Babolat Pure Drive Tennis Racket`,
      description: 'Brand new, still in original packaging. Received as a gift but already have a racket. 300g, 4 3/8 grip. Unstrung.',
      sportId: tennis.id, subCategoryId: tennisSC.id, brandId: babolat.id,
      condition: 'new_with_tags', colour: 'Blue', price: 120.00, shippingFee: 5.99,
      parcelSize: 'large', photos: PHOTOS.tennis, status: 'live', publishedAt: new Date(now - 5 * 86400_000),
    },
    {
      title: `${TEST_TAG} Callaway Rogue Golf Driver`,
      description: 'Callaway Rogue 10.5° driver with Aldila Synergy shaft. Fair condition — normal signs of play. Head cover included.',
      sportId: golf.id, subCategoryId: golfSC.id, brandId: callaway.id,
      condition: 'fair', colour: 'Black', price: 95.00, shippingFee: 7.99,
      parcelSize: 'large', photos: PHOTOS.golf, status: 'live', publishedAt: new Date(now - 10 * 86400_000),
    },
    {
      title: `${TEST_TAG} New Balance Fresh Foam Running Shoes`,
      description: 'Lightly used NB Fresh Foam 1080 in UK 10. Only done around 50 miles. Minimal wear on outsole. Great cushioning.',
      sportId: running.id, subCategoryId: runningSC.id, brandId: newBalance.id,
      condition: 'like_new', colour: 'White/Black', price: 65.00, shippingFee: 4.99,
      parcelSize: 'medium', photos: PHOTOS.running, status: 'live', publishedAt: new Date(now - 3 * 86400_000),
    },
  ];

  const listings = [];
  for (const def of defs) {
    const l = await prisma.listing.create({ data: { sellerId: seller.id, ...def } });
    listings.push(l);
    ok(`Listing: "${def.title.replace(TEST_TAG + ' ', '')}" — £${def.price} (${def.status})`);
  }
  return listings;
}

// ─── Completed order ──────────────────────────────────────────────────────────

async function seedCompletedOrder(buyer, seller, cricketListing) {
  const existing = await prisma.order.findFirst({ where: { listingId: cricketListing.id } });
  if (existing) {
    skip('Completed order already exists');
    return existing;
  }

  const itemPrice          = Number(cricketListing.price);          // 85.00
  const shippingFee        = Number(cricketListing.shippingFee);    // 6.99
  const buyerProtectionFee = Number((itemPrice * 0.05).toFixed(2)); // 4.25
  const commission         = Number((itemPrice * 0.10).toFixed(2)); // 8.50
  const totalAmount        = Number((itemPrice + shippingFee + buyerProtectionFee).toFixed(2)); // 96.24
  const sellerNetAmount    = Number((itemPrice - commission).toFixed(2)); // 76.50

  const completedAt  = new Date(Date.now() - 7 * 86400_000);  // 7 days ago
  const deliveredAt  = new Date(Date.now() - 8 * 86400_000);
  const dispatchedAt = new Date(Date.now() - 10 * 86400_000);

  const order = await prisma.order.create({
    data: {
      listingId:     cricketListing.id,
      buyerId:       buyer.id,
      sellerId:      seller.id,
      itemPrice,
      shippingFee,
      buyerProtectionFee,
      platformCommission:  commission,
      totalAmount,
      sellerNetAmount,
      fulfilmentStatus:    'completed',
      paymentStatus:       'released',
      disputeStatus:       'none',
      trackingNumber:      'RM123456789GB',
      dispatchedAt,
      deliveredAt,
      completedAt,
      deliveryAddressLine1: '12 Test Street',
      deliveryCity:         'London',
      deliveryPostcode:     'SW1A 1AA',
      snapshotListingTitle: cricketListing.title.replace(TEST_TAG + ' ', ''),
      snapshotCondition:    cricketListing.condition,
      snapshotPhotos:       cricketListing.photos,
      disputeWindowExpiresAt: new Date(deliveredAt.getTime() + 3 * 86400_000), // expired
    },
  });

  await prisma.payment.create({
    data: {
      orderId:              order.id,
      buyerId:              buyer.id,
      sellerId:             seller.id,
      stripePaymentIntentId: 'pi_test_seed_completed_order_001',
      stripeChargeId:        'ch_test_seed_completed_order_001',
      stripeTransferId:      'tr_test_seed_completed_order_001',
      amountTotal:           totalAmount,
      amountItem:            itemPrice,
      amountShipping:        shippingFee,
      amountBuyerProtection: buyerProtectionFee,
      amountCommission:      commission,
      amountSellerPayout:    sellerNetAmount,
      paymentMethod:         'card',
      paymentStatus:         'succeeded',
      escrowStatus:          'released',
      payoutStatus:          'completed',
      payoutInitiatedAt:     completedAt,
      payoutCompletedAt:     new Date(completedAt.getTime() + 2 * 86400_000),
    },
  });

  await prisma.review.create({
    data: {
      orderId:    order.id,
      reviewerId: buyer.id,
      sellerId:   seller.id,
      rating:     5,
      body:       'Great seller, item exactly as described and dispatched promptly. Would buy from again.',
      isVisible:  true,
    },
  });

  await prisma.user.update({
    where: { id: seller.id },
    data:  { totalSales: { increment: 1 }, averageRating: 5.0, reviewCount: 1 },
  });

  ok(`Completed order: ${order.id.slice(0, 8)}… (cricket bat, buyer→seller, released + reviewed)`);
  return order;
}

// ─── Active offer thread with counter-offer ───────────────────────────────────

async function seedOfferThread(buyer, seller, footballListing) {
  const existing = await prisma.offer.findFirst({
    where: { listingId: footballListing.id, buyerId: buyer.id },
  });
  if (existing) {
    skip('Offer thread already exists');
    return;
  }

  const buyerOfferAmount   = 38.00;
  const counterAmount      = 42.00;
  const expiresAt          = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h from now

  // Offer thread
  const offer = await prisma.offer.create({
    data: {
      listingId:           footballListing.id,
      buyerId:             buyer.id,
      sellerId:            seller.id,
      status:              'active',
      lastMessageAt:       new Date(),
      lastMessagePreview:  `Counter offer: £${counterAmount}`,
      buyerUnreadCount:    1,   // buyer hasn't read the counter-offer
      sellerUnreadCount:   0,
    },
  });

  // Message 1: buyer's initial offer
  const msg1 = await prisma.message.create({
    data: {
      offerId:     offer.id,
      senderId:    buyer.id,
      messageType: 'offer',
      body:        "Hi! I'm interested in the boots. Would you accept £38?",
      offerAmount: buyerOfferAmount,
      isRead:      true,
    },
  });

  // Message 2: seller's counter-offer message
  const msg2 = await prisma.message.create({
    data: {
      offerId:     offer.id,
      senderId:    seller.id,
      messageType: 'counter_offer',
      body:        "Thanks for the interest! Best I can do is £42 — they're in great nick.",
      offerAmount: counterAmount,
      isRead:      false,  // buyer hasn't read it yet
    },
  });

  // Counter-offer record
  await prisma.counterOffer.create({
    data: {
      offerId:       offer.id,
      messageId:     msg2.id,
      sellerId:      seller.id,
      buyerId:       buyer.id,
      listingId:     footballListing.id,
      counterAmount,
      originalPrice: Number(footballListing.price),
      status:        'pending',
      expiresAt,
    },
  });

  ok(`Offer thread: buyer offered £${buyerOfferAmount}, seller countered £${counterAmount} (pending, expires in 24h)`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const reset = process.argv.includes('--reset');

  console.log('\n══════════════════════════════════════════════');
  console.log('  The Kit Loop — Test Data Seed');
  console.log('══════════════════════════════════════════════\n');

  if (reset) {
    const existing = await prisma.user.findMany({
      where: { email: { in: ['buyer@test.com', 'seller@test.com', 'both@test.com', 'admin@test.com'] } },
      select: { id: true },
    });
    await resetTestData(existing.map((u) => u.id));
    console.log();
  }

  console.log('Creating users…');
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, SALT_ROUNDS);
  const users = await seedUsers(passwordHash);
  const buyer  = users['buyer@test.com'];
  const seller = users['seller@test.com'];
  const both   = users['both@test.com'];
  const admin  = users['admin@test.com'];

  console.log('\nEnsuring fee config…');
  await seedFeeConfig(admin.id);

  console.log('\nCreating listings…');
  const listings = await seedListings(seller);

  const cricketListing  = listings.find((l) => l.title.includes('Cricket Bat'));
  const footballListing = listings.find((l) => l.title.includes('Football Boots'));

  if (!cricketListing || !footballListing) {
    throw new Error('Could not locate test listings by title — check seed output above');
  }

  console.log('\nCreating completed order…');
  await seedCompletedOrder(buyer, seller, cricketListing);

  console.log('\nCreating offer thread with counter-offer…');
  await seedOfferThread(buyer, seller, footballListing);

  console.log('\nCreating "both" user data (as seller and buyer)…');
  await seedBothUserData(both, buyer, seller);

  console.log('\n══════════════════════════════════════════════');
  console.log('  Test data ready!\n');
  console.log('  Credentials (all accounts use same password):');
  console.log(`  Email     buyer@test.com   / seller@test.com  / both@test.com  / admin@test.com`);
  console.log(`  Password  ${TEST_PASSWORD}`);
  console.log('\n  Stripe test cards:');
  console.log('  Success    4242 4242 4242 4242  exp: any future  CVC: any');
  console.log('  Decline    4000 0000 0000 0002');
  console.log('  3D Secure  4000 0025 0000 3155');
  console.log('══════════════════════════════════════════════\n');
}

main()
  .catch((err) => {
    console.error('\nSeed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
