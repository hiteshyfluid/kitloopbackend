const prisma  = require('../lib/prisma');
const AppError = require('../utils/AppError');

const PUBLIC_USER_SELECT = {
  id: true, username: true, displayName: true, avatarUrl: true,
  role: true, verifiedSeller: true, averageRating: true, reviewCount: true,
  totalSales: true, createdAt: true,
};

const OWN_PROFILE_SELECT = {
  ...PUBLIC_USER_SELECT,
  email: true, holidayMode: true, authProvider: true,
  notificationOrderUpdates: true, notificationMessages: true,
  notificationPriceDrops: true, notificationPromotions: true, notificationDisputes: true,
  privacyProfilePublic: true, privacyDataSharing: true,
  twoFactorEnabled: true, twoFactorMethod: true,
  stripeConnectId: true, stripeCustomerId: true,
  bankAccountLast4: true, bankSortCodeMasked: true,
  defaultParcelSize: true,
  preferredSports: true,
  updatedAt: true,
};

// ─── getOwnProfile ────────────────────────────────────────────────────────────
async function getOwnProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: OWN_PROFILE_SELECT,
  });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  return user;
}

// ─── updateProfile ────────────────────────────────────────────────────────────
async function updateProfile(userId, { displayName, username, avatarUrl, preferredSports }) {
  const data = {};
  if (preferredSports !== undefined) data.preferredSports = [...new Set(preferredSports)];
  if (displayName !== undefined) data.displayName = displayName.trim();
  if (username    !== undefined) data.username    = username.trim().toLowerCase();
  if (avatarUrl   !== undefined) data.avatarUrl   = avatarUrl;

  if (username) {
    const existing = await prisma.user.findFirst({
      where: { username: data.username, id: { not: userId } },
      select: { id: true },
    });
    if (existing) throw new AppError('Username is already taken', 409, 'USERNAME_TAKEN');
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: OWN_PROFILE_SELECT,
  });
}

// ─── getPublicProfile ─────────────────────────────────────────────────────────
async function getPublicProfile(sellerId) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sellerId)) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }
  const user = await prisma.user.findUnique({
    where: { id: sellerId, deletedAt: null },
    select: PUBLIC_USER_SELECT,
  });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  return user;
}

// ─── updateNotificationSettings ──────────────────────────────────────────────
async function updateNotificationSettings(userId, prefs) {
  const allowed = [
    'notificationOrderUpdates', 'notificationMessages',
    'notificationPriceDrops', 'notificationPromotions', 'notificationDisputes',
  ];
  const data = {};
  for (const key of allowed) {
    if (prefs[key] !== undefined) data[key] = Boolean(prefs[key]);
  }
  return prisma.user.update({ where: { id: userId }, data, select: OWN_PROFILE_SELECT });
}

// ─── updatePrivacySettings ────────────────────────────────────────────────────
async function updatePrivacySettings(userId, prefs) {
  const data = {};
  if (prefs.privacyProfilePublic !== undefined) data.privacyProfilePublic = Boolean(prefs.privacyProfilePublic);
  if (prefs.privacyDataSharing   !== undefined) data.privacyDataSharing   = Boolean(prefs.privacyDataSharing);
  return prisma.user.update({ where: { id: userId }, data, select: OWN_PROFILE_SELECT });
}

// ─── updatePostagePreference ─────────────────────────────────────────────────
async function updatePostagePreference(userId, defaultParcelSize) {
  return prisma.user.update({
    where: { id: userId },
    data:  { defaultParcelSize },
    select: OWN_PROFILE_SELECT,
  });
}

// ─── toggleHolidayMode ───────────────────────────────────────────────────────
async function toggleHolidayMode(userId, enabled) {
  return prisma.user.update({
    where: { id: userId },
    data:  { holidayMode: Boolean(enabled) },
    select: { id: true, holidayMode: true },
  });
}

// ─── getBalance ──────────────────────────────────────────────────────────────
async function getBalance(userId) {
  const [pending, initiated, total] = await Promise.all([
    prisma.payment.aggregate({
      where: { sellerId: userId, escrowStatus: 'released', payoutStatus: 'pending' },
      _sum: { amountSellerPayout: true },
      _count: { id: true },
    }),
    prisma.payment.aggregate({
      where: { sellerId: userId, escrowStatus: 'released', payoutStatus: 'initiated' },
      _sum: { amountSellerPayout: true },
    }),
    prisma.payment.aggregate({
      where: { sellerId: userId, payoutStatus: 'completed' },
      _sum: { amountSellerPayout: true },
    }),
  ]);

  return {
    pendingAmount:   Number(pending._sum.amountSellerPayout   ?? 0),
    initiatedAmount: Number(initiated._sum.amountSellerPayout ?? 0),
    totalPaidOut:    Number(total._sum.amountSellerPayout     ?? 0),
    pendingCount:    pending._count.id,
  };
}

// ─── requestAccountDeletion ──────────────────────────────────────────────────
async function requestAccountDeletion(userId) {
  const [activeOrder, openDispute] = await Promise.all([
    prisma.order.findFirst({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
        fulfilmentStatus: { in: ['awaiting_dispatch', 'dispatched'] },
      },
      select: { id: true },
    }),
    prisma.dispute.findFirst({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
        status: { in: ['open', 'seller_responded', 'admin_reviewing'] },
      },
      select: { id: true },
    }),
  ]);

  if (activeOrder) {
    throw new AppError('Cannot delete your account while you have an order in progress', 409, 'ACTIVE_ORDER_EXISTS');
  }
  if (openDispute) {
    throw new AppError('Cannot delete your account while a dispute is open', 409, 'OPEN_DISPUTE_EXISTS');
  }

  // Soft delete — set deletedAt and invalidate sessions
  const now = new Date();
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data:  { deletedAt: now, accountStatus: 'deleted' },
    }),
    prisma.session.updateMany({
      where: { userId },
      data:  { revokedAt: now },
    }),
  ]);
}

module.exports = {
  getOwnProfile,
  updateProfile,
  getPublicProfile,
  updateNotificationSettings,
  updatePrivacySettings,
  updatePostagePreference,
  toggleHolidayMode,
  getBalance,
  requestAccountDeletion,
};
