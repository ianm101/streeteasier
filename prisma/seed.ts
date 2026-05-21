import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users (these will be created automatically by NextAuth on first sign-in,
  // but we'll add them here as placeholders for the seed data)
  const user1 = await prisma.user.upsert({
    where: { email: 'christianbarnard00@gmail.com' },
    update: {},
    create: {
      email: 'christianbarnard00@gmail.com',
      name: 'Christian Barnard',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'charlespackard11@gmail.com' },
    update: {},
    create: {
      email: 'charlespackard11@gmail.com',
      name: 'Charles Packard',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'ianmurray2019@gmail.com' },
    update: {},
    create: {
      email: 'ianmurray2019@gmail.com',
      name: 'Ian Murray',
    },
  });

  console.log('Created users:', { user1: user1.email, user2: user2.email, user3: user3.email });

  // Create sample apartments
  const apt1 = await prisma.apartment.create({
    data: {
      address: '123 W 14th Street',
      unit: '4B',
      neighborhood: 'Chelsea',
      borough: 'Manhattan',
      price: 4200,
      beds: 2,
      baths: 1,
      sqft: 850,
      floor: 4,
      listingUrl: 'https://streeteasy.com/building/123-w-14th-street',
      source: 'streeteasy',
      status: 'interested',
      brokerName: 'Jane Smith',
      brokerEmail: 'jane@realty.com',
      descriptionSummary: 'Charming pre-war 2BR in the heart of Chelsea. High ceilings, exposed brick, and plenty of natural light.',
      salientFeatures: ['Exposed brick', 'High ceilings', 'Near subway', 'Lots of natural light'],
      addedById: user1.id,
      pointPersonId: user1.id,
      amenities: {
        create: [
          { key: 'in_unit_laundry' },
          { key: 'dishwasher' },
          { key: 'pets_allowed' }
        ]
      },
      rankings: {
        create: [
          { userId: user1.id, rank: 1 },
          { userId: user2.id, rank: 2 }
        ]
      }
    },
  });

  const apt2 = await prisma.apartment.create({
    data: {
      address: '456 Bedford Ave',
      unit: '2F',
      neighborhood: 'Williamsburg',
      borough: 'Brooklyn',
      price: 3800,
      beds: 1.5,
      baths: 1,
      sqft: 700,
      floor: 2,
      listingUrl: 'https://streeteasy.com/building/456-bedford-ave',
      source: 'streeteasy',
      status: 'reached_out',
      brokerName: 'Mike Johnson',
      brokerEmail: 'mike@compass.com',
      descriptionSummary: 'Modern 1.5BR in prime Williamsburg. Recently renovated with stainless steel appliances.',
      salientFeatures: ['Renovated kitchen', 'Near L train', 'Rooftop access'],
      addedById: user2.id,
      pointPersonId: user2.id,
      amenities: {
        create: [
          { key: 'dishwasher' },
          { key: 'no_broker_fee' },
          { key: 'building_amenities' }
        ]
      },
      rankings: {
        create: [
          { userId: user1.id, rank: 3 },
          { userId: user2.id, rank: 1 },
          { userId: user3.id, rank: 2 }
        ]
      }
    },
  });

  const apt3 = await prisma.apartment.create({
    data: {
      address: '789 E 10th Street',
      unit: '5A',
      neighborhood: 'East Village',
      borough: 'Manhattan',
      price: 4500,
      beds: 2,
      baths: 1.5,
      sqft: 900,
      floor: 5,
      source: 'off-market',
      status: 'tour_scheduled',
      brokerName: 'Sarah Lee',
      brokerEmail: 'sarah@realty.com',
      brokerPhone: '555-123-4567',
      descriptionSummary: 'Spacious 2BR/1.5BA in a quiet East Village building. Corner unit with great light.',
      salientFeatures: ['Corner unit', 'Quiet building', 'Near Tompkins Square Park', 'Elevator building'],
      addedById: user3.id,
      pointPersonId: user3.id,
      amenities: {
        create: [
          { key: 'in_unit_laundry' },
          { key: 'dishwasher' },
          { key: 'elevator' },
          { key: 'pets_allowed' }
        ]
      },
      rankings: {
        create: [
          { userId: user1.id, rank: 2 },
          { userId: user3.id, rank: 1 }
        ]
      }
    },
  });

  const apt4 = await prisma.apartment.create({
    data: {
      address: '321 Court Street',
      unit: '3C',
      neighborhood: 'Carroll Gardens',
      borough: 'Brooklyn',
      price: 3600,
      beds: 2,
      baths: 1,
      sqft: 800,
      source: 'compass',
      status: 'toured',
      descriptionSummary: 'Classic Brooklyn 2BR in a charming brownstone. Original details preserved.',
      salientFeatures: ['Brownstone building', 'Original details', 'Near F/G trains'],
      addedById: user1.id,
      amenities: {
        create: [
          { key: 'laundry_in_building' },
          { key: 'outdoor_space' }
        ]
      }
    },
  });

  const apt5 = await prisma.apartment.create({
    data: {
      address: '555 W 23rd Street',
      unit: '12D',
      neighborhood: 'Chelsea',
      borough: 'Manhattan',
      price: 5200,
      beds: 2,
      baths: 2,
      sqft: 1100,
      floor: 12,
      listingUrl: 'https://streeteasy.com/building/555-w-23rd-street',
      source: 'streeteasy',
      status: 'passed',
      descriptionSummary: 'Luxury 2BR/2BA with floor-to-ceiling windows and stunning city views. Too expensive.',
      salientFeatures: ['City views', 'Luxury building', 'Doorman', 'Gym'],
      addedById: user2.id,
      amenities: {
        create: [
          { key: 'in_unit_laundry' },
          { key: 'dishwasher' },
          { key: 'doorman' },
          { key: 'elevator' },
          { key: 'building_amenities' }
        ]
      }
    },
  });

  console.log('Created apartments:', { apt1: apt1.id, apt2: apt2.id, apt3: apt3.id, apt4: apt4.id, apt5: apt5.id });

  // Add some notes
  await prisma.note.create({
    data: {
      apartmentId: apt1.id,
      userId: user2.id,
      body: 'Love the exposed brick! Let\'s schedule a tour ASAP.'
    }
  });

  await prisma.note.create({
    data: {
      apartmentId: apt2.id,
      userId: user3.id,
      body: 'Broker responded - tour available this Saturday at 2pm.'
    }
  });

  await prisma.note.create({
    data: {
      apartmentId: apt3.id,
      userId: user1.id,
      body: 'Tour scheduled for Thursday 5pm. Everyone available?'
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
