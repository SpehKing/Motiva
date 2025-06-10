// Test timezone functionality
function getTodayInUTCPlus2() {
  const now = new Date();
  // Add 2 hours to get UTC+2
  const utcPlus2 = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return utcPlus2.toISOString().split("T")[0];
}

function getDateInUTCPlus2(daysOffset = 0) {
  const now = new Date();
  // Add 2 hours to get UTC+2
  const utcPlus2 = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  // Apply the day offset
  utcPlus2.setDate(utcPlus2.getDate() + daysOffset);
  return utcPlus2.toISOString().split("T")[0];
}

console.log("Current time:", new Date().toString());
console.log("Current UTC time:", new Date().toISOString());
console.log(
  "Current local date (wrong):",
  new Date().toISOString().split("T")[0]
);
console.log("Current UTC+2 date (correct):", getTodayInUTCPlus2());
console.log("");

console.log("Weekly dates in UTC+2:");
for (let i = 6; i >= 0; i--) {
  const date = getDateInUTCPlus2(-i);
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const tempDate = new Date(date + "T12:00:00Z"); // Use noon to avoid timezone issues
  const dayName = dayNames[tempDate.getDay()];
  console.log(`${i} days ago: ${date} (${dayName})`);
}
