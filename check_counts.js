require('dotenv').config();
const prisma = require('./src/lib/prisma');
(async () => {
  const tables = ['sport','brand','subCategory','user','listing','offer','message','counterOffer','order','payment','dispute','review','favourite','notification','sellerBadge','session','share','siteSetting','auditLog','feeConfig'];
  for (const t of tables) {
    const count = await prisma[t].count();
    console.log(t.padEnd(15), count);
  }
  await prisma.$disconnect();
})();
