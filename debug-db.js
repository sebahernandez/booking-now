const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("=== DEBUGGING DATABASE ===\n");

  // Check professionals
  const professionals = await prisma.professional.findMany({
    include: {
      user: true,
      availabilitySlots: true,
    },
  });

  console.log("PROFESSIONALS:");
  professionals.forEach((prof) => {
    console.log(`- ID: ${prof.id}`);
    console.log(`- Name: ${prof.user.name}`);
    console.log(`- Email: ${prof.user.email}`);
    console.log(`- Availability Slots: ${prof.availabilitySlots.length}`);
    prof.availabilitySlots.forEach((slot) => {
      console.log(
        `  Day ${slot.dayOfWeek}: ${slot.startTime} - ${slot.endTime}`
      );
    });
    console.log("");
  });

  // Check first professional's availability
  if (professionals.length > 0) {
    const firstProfId = professionals[0].id;
    console.log(`\nTesting API format for professional: ${firstProfId}`);

    const availabilitySlots = await prisma.availabilitySlot.findMany({
      where: {
        professionalId: firstProfId,
        isAvailable: true,
        specificDate: null,
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    console.log("Raw availability slots from DB:");
    availabilitySlots.forEach((slot) => {
      console.log(
        `- Day ${slot.dayOfWeek}: ${slot.startTime} - ${slot.endTime}, Available: ${slot.isAvailable}`
      );
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
