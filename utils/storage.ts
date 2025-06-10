import AsyncStorage from '@react-native-async-storage/async-storage';

const OPENAI_API_KEY = 'openai_api_key';

/**
 * Storage utility for managing API keys and other app settings
 */
export class AppStorage {
  /**
   * Save OpenAI API key to local storage
   */
  static async saveApiKey(apiKey: string): Promise<void> {
    try {
      await AsyncStorage.setItem(OPENAI_API_KEY, apiKey);
    } catch (error) {
      console.error('Error saving API key:', error);
      throw new Error('Failed to save API key');
    }
  }

  /**
   * Retrieve OpenAI API key from local storage
   */
  static async getApiKey(): Promise<string | null> {
    try {
      const apiKey = await AsyncStorage.getItem(OPENAI_API_KEY);
      return apiKey;
    } catch (error) {
      console.error('Error retrieving API key:', error);
      return null;
    }
  }

  /**
   * Remove OpenAI API key from local storage
   */
  static async removeApiKey(): Promise<void> {
    try {
      await AsyncStorage.removeItem(OPENAI_API_KEY);
    } catch (error) {
      console.error('Error removing API key:', error);
      throw new Error('Failed to remove API key');
    }
  }

  /**
   * Check if API key exists in storage
   */
  static async hasApiKey(): Promise<boolean> {
    try {
      const apiKey = await AsyncStorage.getItem(OPENAI_API_KEY);
      return apiKey !== null && apiKey.trim().length > 0;
    } catch (error) {
      console.error('Error checking API key:', error);
      return false;
    }
  }

  /**
   * Validate OpenAI API key format
   */
  static validateApiKey(apiKey: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }
    
    const trimmed = apiKey.trim();
    
    // OpenAI API keys start with 'sk-' and are typically 51 characters long
    return trimmed.startsWith('sk-') && trimmed.length >= 20;
  }
}
