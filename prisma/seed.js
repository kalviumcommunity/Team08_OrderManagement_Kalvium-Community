const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const customerPasswordHash = await bcrypt.hash("customer123", 10);

  // Clean existing database records
  await prisma.inventoryLog.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  // Seed default users
  const admin = await prisma.user.upsert({
    where: { email: "admin@orderflow.com" },
    update: {},
    create: {
      email: "admin@orderflow.com",
      name: "Admin User",
      restaurantName: "Licious Grill",
      phone: "1234567890",
      businessType: "Restaurant",
      passwordHash: adminPasswordHash,
      role: "OWNER",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@orderflow.com" },
    update: {},
    create: {
      email: "customer@orderflow.com",
      name: "Customer User",
      restaurantName: "N/A",
      phone: "0987654321",
      businessType: "Consumer",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
    },
  });

  // Seed default product
  const product = await prisma.product.create({
    data: {
      name: "Default Product",
      sku: "DEF-PROD-001",
      category: "Meat & Grill",
      stock: 10,
    },
  });

  console.log("Seeded Users:");
  console.log("Admin:", admin.email);
  console.log("Customer:", customer.email);
  console.log("Product:", product.name, `(ID: ${product.id}, Stock: ${product.stock})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
