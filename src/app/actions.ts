'use server';

import { suggestMessages, type SuggestMessagesInput } from '@/ai/flows/smart-message-suggestions';

export async function getMessageSuggestions(input: SuggestMessagesInput) {
  try {
    const result = await suggestMessages(input);
    return result.suggestions || [];
  } catch (error) {
    console.error('Error getting message suggestions:', error);
    // Return empty array or a set of default suggestions in case of an error
    return ['Got it.', 'Thanks!', 'Can you explain more?'];
  }
}
