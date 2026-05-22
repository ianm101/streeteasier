import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing seed data...');

  // Delete all apartments that were created from seed data
  // We'll identify seed apartments by their lack of real StreetEasy URLs or specific addresses
  const seedAddresses = [
    '123 W 14th Street',
    '456 Bedford Ave',
    '789 E 10th Street',
    '321 Court Street',
    '555 W 23rd Street'
  ];

  // Delete apartments with seed addresses
  const deleted = await prisma.apartment.deleteMany({
    where: {
      address: {
        in: seedAddresses
      }
    }
  });

  console.log(`Deleted ${deleted.count} seed apartments`);
  console.log('Seed data cleared successfully!');
}

main()
  .catch((e) => {
    console.error('Error clearing seed data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
