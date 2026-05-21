import { prisma } from "../lib/prisma";

async function checkData() {
  console.log("Checking database data...\n");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  console.log(`👥 Users (${users.length}):`);
  users.forEach((user) => {
    console.log(`  - ${user.name} (${user.email})`);
  });

  const apartments = await prisma.apartment.findMany({
    select: {
      id: true,
      address: true,
      price: true,
      status: true,
      addedBy: {
        select: {
          name: true,
        },
      },
    },
  });

  console.log(`\n🏠 Apartments (${apartments.length}):`);
  apartments.forEach((apt) => {
    console.log(
      `  - ${apt.address} - $${apt.price}/mo - ${apt.status} (added by ${apt.addedBy.name})`
    );
  });

  const rankings = await prisma.ranking.findMany();
  console.log(`\n⭐ Rankings: ${rankings.length}`);

  const notes = await prisma.note.findMany();
  console.log(`📝 Notes: ${notes.length}`);

  await prisma.$disconnect();
}

checkData().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
