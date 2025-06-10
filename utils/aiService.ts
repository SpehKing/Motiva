import { Platform } from 'react-native';
import { encode as btoa } from 'base-64';
import OpenAI from 'openai';
import * as FileSystem from 'expo-file-system';
import { AppStorage } from './storage';

/* -------------------------------------------------------------------------
 * OpenAI client using stored API key
 * -----------------------------------------------------------------------*/
let openai: OpenAI | null = null;

async function getOpenAIClient(): Promise<OpenAI> {
  if (!openai) {
    const apiKey = await AppStorage.getApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key not found. Please set your API key in the app settings.');
    }
    openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  }
  return openai;
}

// Reset OpenAI client when API key changes
export function resetOpenAIClient(): void {
  openai = null;
}

/* -------------------------------------------------------------------------
 * File helpers
 * -----------------------------------------------------------------------*/
const readAsBase64 = async (uri: string) => {
  const sanitized = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
  return FileSystem.readAsStringAsync(sanitized, {
    encoding: FileSystem.EncodingType.Base64,
  });
};

export async function imageUriToBase64(uri: string): Promise<string> {
  const raw = await readAsBase64(uri);
  return typeof atob === 'undefined' ? btoa(raw) : raw;
}

/* -------------------------------------------------------------------------
 * Vision: verify that the image shows the claimed activity
 * -----------------------------------------------------------------------*/
export async function verifyActivity(
  imageUri: string,
  activityDescription: string,
): Promise<{ verified: boolean; confidence: number; explanation: string }> {
  let base64;
  try {
    base64 = await imageUriToBase64(imageUri);
  } catch (error) {
    console.error('Failed to convert image to base64:', error);
    throw new Error('Failed to process image');
  }

  const openaiClient = await getOpenAIClient();
  const completion = await openaiClient.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 120,
    messages: [
      {
        role: 'system',
        content:
          'You are a verification assistant that determines if an image shows evidence that a user has completed a specific activity. Be skeptical but fair.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Did the user perform this activity: ${activityDescription}?\nReturn:\nYES | NO\nConfidence: NN%\nOne‑sentence reason.`,
          },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64}`, detail: 'low' },
          },
        ],
      },
    ],
  });

  const text = completion.choices[0].message.content ?? '';
  const verified = /^yes\b/i.test(text);
  const confidenceMatch = text.match(/(\d{1,3})%/);
  const confidence = confidenceMatch ? parseInt(confidenceMatch[1], 10) : 0;

  return { verified, confidence, explanation: text.trim() };
}
