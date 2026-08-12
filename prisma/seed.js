const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

/**
 * Database Seed Script
 * Resets database tables and inserts demo users and catalog products
 * for local testing and demonstration purposes.
 */
async function main() {
  // Pre-hash passwords for seed users
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const customerPasswordHash = await bcrypt.hash("customer123", 10);

  // 1. Clean existing database records in foreign-key dependency order
  await prisma.inventoryLog.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed default Admin / Owner User
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

  // 3. Seed default Customer User
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

  // 4. Seed default Product
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

// Execute main seeding flow
main()
  .catch((e) => {
    console.error("Database seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Disconnect Prisma client connection pool
    await prisma.$disconnect();
  });
