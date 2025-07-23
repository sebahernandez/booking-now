import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Create admin user first
  let adminUser = await prisma.user.findFirst({
    where: { email: "admin@bookingsystem.com" },
  });
  if (!adminUser) {
    const hashedPassword = await bcrypt.hash("admin123", 12);
    adminUser = await prisma.user.create({
      data: {
        name: "Sistema Admin",
        email: "admin@bookingsystem.com",
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    });
    console.log("✅ Created admin user");
  } else {
    console.log("ℹ️ Admin user already exists");
  }

  // Create default tenant for demo data
  let defaultTenant = await prisma.tenant.findFirst({
    where: { email: "demo@bookingnowtenant.com" },
  });
  if (!defaultTenant) {
    const hashedPassword = await bcrypt.hash("demo123", 12);
    defaultTenant = await prisma.tenant.create({
      data: {
        name: "Demo Photography Studio",
        email: "demo@bookingnowtenant.com",
        password: hashedPassword,
        phone: "+1234567890",
      },
    });
    console.log("✅ Created default tenant");
  } else {
    console.log("ℹ️ Default tenant already exists");
  }

  // Create services (check if they exist first)
  let photoSession = await prisma.service.findFirst({
    where: { name: "Photography Session", tenantId: defaultTenant.id },
  });
  if (!photoSession) {
    photoSession = await prisma.service.create({
      data: {
        name: "Photography Session",
        description:
          "Professional photography for portraits, events, or commercial use",
        duration: 60,
        price: 150,
        tenantId: defaultTenant.id,
      },
    });
    console.log("✅ Created Photography Session service");
  } else {
    console.log("ℹ️ Photography Session service already exists");
  }

  let weddingPhoto = await prisma.service.findFirst({
    where: { name: "Wedding Photography", tenantId: defaultTenant.id },
  });
  if (!weddingPhoto) {
    weddingPhoto = await prisma.service.create({
      data: {
        name: "Wedding Photography",
        description: "Complete wedding day photography coverage",
        duration: 480,
        price: 1200,
        tenantId: defaultTenant.id,
      },
    });
    console.log("✅ Created Wedding Photography service");
  } else {
    console.log("ℹ️ Wedding Photography service already exists");
  }

  let productPhoto = await prisma.service.findFirst({
    where: { name: "Product Photography", tenantId: defaultTenant.id },
  });
  if (!productPhoto) {
    productPhoto = await prisma.service.create({
      data: {
        name: "Product Photography",
        description: "Professional product shots for e-commerce or marketing",
        duration: 120,
        price: 200,
        tenantId: defaultTenant.id,
      },
    });
    console.log("✅ Created Product Photography service");
  } else {
    console.log("ℹ️ Product Photography service already exists");
  }

  // Create professional users (check if they exist first)
  let johnUser = await prisma.user.findUnique({
    where: { email: "john@example.com" },
  });
  if (!johnUser) {
    johnUser = await prisma.user.create({
      data: {
        email: "john@example.com",
        name: "John Smith",
        phone: "+1234567890",
        role: UserRole.PROFESSIONAL,
        tenantId: defaultTenant.id,
      },
    });
    console.log("✅ Created John Smith user");
  } else {
    console.log("ℹ️ John Smith user already exists");
  }

  let sarahUser = await prisma.user.findUnique({
    where: { email: "sarah@example.com" },
  });
  if (!sarahUser) {
    sarahUser = await prisma.user.create({
      data: {
        email: "sarah@example.com",
        name: "Sarah Johnson",
        phone: "+1234567891",
        role: UserRole.PROFESSIONAL,
        tenantId: defaultTenant.id,
      },
    });
    console.log("✅ Created Sarah Johnson user");
  } else {
    console.log("ℹ️ Sarah Johnson user already exists");
  }

  let mikeUser = await prisma.user.findUnique({
    where: { email: "mike@example.com" },
  });
  if (!mikeUser) {
    mikeUser = await prisma.user.create({
      data: {
        email: "mike@example.com",
        name: "Mike Wilson",
        phone: "+1234567892",
        role: UserRole.PROFESSIONAL,
        tenantId: defaultTenant.id,
      },
    });
    console.log("✅ Created Mike Wilson user");
  } else {
    console.log("ℹ️ Mike Wilson user already exists");
  }

  // Create professional profiles
  let john = await prisma.professional.findUnique({
    where: { userId: johnUser.id },
  });
  if (!john) {
    john = await prisma.professional.create({
      data: {
        userId: johnUser.id,
        tenantId: defaultTenant.id,
        bio: "Experienced photographer specializing in portraits and events",
        hourlyRate: 150,
      },
    });
    console.log("✅ Created John professional profile");
  } else {
    console.log("ℹ️ John professional profile already exists");
  }

  let sarah = await prisma.professional.findUnique({
    where: { userId: sarahUser.id },
  });
  if (!sarah) {
    sarah = await prisma.professional.create({
      data: {
        userId: sarahUser.id,
        tenantId: defaultTenant.id,
        bio: "Creative photographer focused on commercial and product photography",
        hourlyRate: 175,
      },
    });
    console.log("✅ Created Sarah professional profile");
  } else {
    console.log("ℹ️ Sarah professional profile already exists");
  }

  let mike = await prisma.professional.findUnique({
    where: { userId: mikeUser.id },
  });
  if (!mike) {
    mike = await prisma.professional.create({
      data: {
        userId: mikeUser.id,
        tenantId: defaultTenant.id,
        bio: "Wedding photography specialist with 10+ years experience",
        hourlyRate: 200,
      },
    });
    console.log("✅ Created Mike professional profile");
  } else {
    console.log("ℹ️ Mike professional profile already exists");
  }

  // Link professionals to services (check if relationships exist)
  const serviceLinks = [
    { professionalId: john.id, serviceId: photoSession.id },
    { professionalId: john.id, serviceId: weddingPhoto.id },
    { professionalId: john.id, serviceId: productPhoto.id },
    { professionalId: sarah.id, serviceId: photoSession.id },
    { professionalId: sarah.id, serviceId: productPhoto.id },
    { professionalId: mike.id, serviceId: weddingPhoto.id },
  ];

  for (const link of serviceLinks) {
    const existing = await prisma.professionalService.findUnique({
      where: {
        professionalId_serviceId: {
          professionalId: link.professionalId,
          serviceId: link.serviceId,
        },
      },
    });

    if (!existing) {
      await prisma.professionalService.create({ data: link });
      console.log(
        `✅ Linked professional ${link.professionalId} to service ${link.serviceId}`
      );
    } else {
      console.log(`ℹ️ Professional service link already exists`);
    }
  }

  // Create availability slots for professionals
  const workDays = [1, 2, 3, 4, 5]; // Monday to Friday

  for (const professional of [john, sarah, mike]) {
    for (const dayOfWeek of workDays) {
      // Morning block: 9:00 - 12:00
      const morningSlot = await prisma.availabilitySlot.findFirst({
        where: {
          professionalId: professional.id,
          dayOfWeek,
          startTime: "09:00",
          endTime: "12:00",
        },
      });

      if (!morningSlot) {
        await prisma.availabilitySlot.create({
          data: {
            professionalId: professional.id,
            dayOfWeek,
            startTime: "09:00",
            endTime: "12:00",
          },
        });
        console.log(
          `✅ Created morning slot for professional ${professional.id}, day ${dayOfWeek} (9:00-12:00)`
        );
      } else {
        console.log(
          `ℹ️ Morning slot already exists for professional ${professional.id}, day ${dayOfWeek}`
        );
      }

      // Afternoon block: 14:00 - 18:00 (except Friday which ends at 17:00)
      const afternoonEndTime = dayOfWeek === 5 ? "17:00" : "18:00"; // Friday ends earlier
      const afternoonSlot = await prisma.availabilitySlot.findFirst({
        where: {
          professionalId: professional.id,
          dayOfWeek,
          startTime: "14:00",
          endTime: afternoonEndTime,
        },
      });

      if (!afternoonSlot) {
        await prisma.availabilitySlot.create({
          data: {
            professionalId: professional.id,
            dayOfWeek,
            startTime: "14:00",
            endTime: afternoonEndTime,
          },
        });
        console.log(
          `✅ Created afternoon slot for professional ${professional.id}, day ${dayOfWeek} (14:00-${afternoonEndTime})`
        );
      } else {
        console.log(
          `ℹ️ Afternoon slot already exists for professional ${professional.id}, day ${dayOfWeek}`
        );
      }
    }
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
