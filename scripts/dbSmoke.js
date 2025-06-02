const { db, initializeDatabase, habits } = require("../db");

async function runSmokeTest() {
  try {
    console.log("🔄 Initializing database...");
    await initializeDatabase();

    console.log("🔄 Inserting test habit...");
    await db.insert(habits).values({
      name: "Smoke Test Habit",
      color: "#314146",
      icon: "flame-outline",
      freq: "daily",
    });

    console.log("🔄 Reading habits from database...");
    const rows = await db.select().from(habits);
    console.log(`✅ Found ${rows.length} habits in database`);

    if (rows.length > 0) {
      console.log("📋 Last habit:", rows[rows.length - 1]);
    }

    console.log("🎉 Database smoke test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Smoke test failed:", error);
    process.exit(1);
  }
}

runSmokeTest();
