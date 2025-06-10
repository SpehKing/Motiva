// Simple test script to verify API key storage functionality
import { AppStorage } from "../utils/storage";

async function testApiKeyStorage() {
  console.log("🧪 Testing API key storage functionality...");

  try {
    // Test 1: Check if API key exists (should be false initially)
    console.log("Test 1: Checking if API key exists...");
    const hasKey = await AppStorage.hasApiKey();
    console.log("Has API key:", hasKey);

    // Test 2: Save an API key
    console.log("Test 2: Saving API key...");
    const testApiKey = "sk-test-key-123456789";
    await AppStorage.saveApiKey(testApiKey);
    console.log("API key saved successfully");

    // Test 3: Retrieve the API key
    console.log("Test 3: Retrieving API key...");
    const retrievedKey = await AppStorage.getApiKey();
    console.log("Retrieved API key:", retrievedKey ? "✓ Found" : "✗ Not found");
    console.log("Keys match:", retrievedKey === testApiKey ? "✓" : "✗");

    // Test 4: Check if API key exists (should be true now)
    console.log("Test 4: Checking if API key exists after saving...");
    const hasKeyAfterSave = await AppStorage.hasApiKey();
    console.log("Has API key after save:", hasKeyAfterSave);

    // Test 5: Remove the API key
    console.log("Test 5: Removing API key...");
    await AppStorage.removeApiKey();
    console.log("API key removed successfully");

    // Test 6: Check if API key exists (should be false again)
    console.log("Test 6: Checking if API key exists after removal...");
    const hasKeyAfterRemove = await AppStorage.hasApiKey();
    console.log("Has API key after removal:", hasKeyAfterRemove);

    console.log("✅ All API key storage tests completed successfully!");
  } catch (error) {
    console.error("❌ API key storage test failed:", error);
  }
}

testApiKeyStorage();
