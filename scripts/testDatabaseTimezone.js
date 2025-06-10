// Test database operations with UTC+2 timezone
const { getAllHabits, getWeeklyCompletionData } = require("../db/habitOps.ts");

async function testDatabaseTimezone() {
  try {
    console.log("Testing database operations with UTC+2 timezone...");

    // Test getAllHabits to see if "today" is correctly identified
    console.log("\n=== Testing getAllHabits (today check) ===");
    const habits = await getAllHabits();
    console.log("Habits found:", habits.length);
    habits.forEach((habit, index) => {
      if (habit.id !== -1) {
        // Skip "New Habit" card
        console.log(`${index + 1}. ${habit.title} - Status: ${habit.status}`);
      }
    });

    // Test getWeeklyCompletionData for the first real habit
    const firstHabit = habits.find((h) => h.id && h.id !== -1);
    if (firstHabit) {
      console.log(
        `\n=== Testing getWeeklyCompletionData for "${firstHabit.title}" (ID: ${firstHabit.id}) ===`
      );
      const weeklyData = await getWeeklyCompletionData(firstHabit.id);
      console.log("Weekly completion data:", weeklyData);

      const dayNames = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      weeklyData.forEach((completions, index) => {
        console.log(`${dayNames[index]}: ${completions} completions`);
      });
    }
  } catch (error) {
    console.error("Error testing database timezone:", error);
  }
}

testDatabaseTimezone();
