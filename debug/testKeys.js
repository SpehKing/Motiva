// Quick test to verify the key generation fix
const testData = [
  { id: 1, title: "Drink Water" },
  { id: 2, title: "Exercise" },
  { id: 3, title: "Read" },
  { id: 4, title: "Meditate" },
  { id: -1, title: "New Habit" }, // Our special ID for New Habit
];

console.log("Testing key generation:");
testData.forEach((card, index) => {
  const key = card.id !== undefined ? `habit-${card.id}` : `card-${index}`;
  console.log(`Title: ${card.title}, ID: ${card.id}, Key: ${key}`);
});

// Check for duplicates
const keys = testData.map((card, index) =>
  card.id !== undefined ? `habit-${card.id}` : `card-${index}`
);

const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
console.log(
  "\nDuplicate keys found:",
  duplicates.length > 0 ? duplicates : "None"
);
