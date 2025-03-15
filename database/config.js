const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Check connection
async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to the database successfully!");
  } catch (error) {
    console.error("❌ Failed to connect to the database:", error);
    process.exit(1); // Exit process if DB connection fails
  }
}

// Call the function to connect
connectToDatabase();

module.exports = prisma;
