'use server';

/**
 * @fileOverview AI-powered flow for generating smart message suggestions based on chat context.
 *
 * - suggestMessages - A function that generates message suggestions.
 * - SuggestMessagesInput - The input type for the suggestMessages function.
 * - SuggestMessagesOutput - The return type for the suggestMessages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMessagesInputSchema = z.object({
  chatHistory: z
    .string()
    .describe(
      'The recent chat history, including previous messages in the conversation.'
    ),
  userInput: z
    .string()
    .describe(
      'The latest message from the user to provide context for generating relevant suggestions.'
    ),
});
export type SuggestMessagesInput = z.infer<typeof SuggestMessagesInputSchema>;

const SuggestMessagesOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested messages based on the chat context.'),
});
export type SuggestMessagesOutput = z.infer<typeof SuggestMessagesOutputSchema>;

export async function suggestMessages(input: SuggestMessagesInput): Promise<SuggestMessagesOutput> {
  return suggestMessagesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMessagesPrompt',
  input: {schema: SuggestMessagesInputSchema},
  output: {schema: SuggestMessagesOutputSchema},
  prompt: `You are an AI assistant designed to provide smart message suggestions based on chat context.

  Given the following chat history:
  {{chatHistory}}

  And the user's latest input:
  {{userInput}}

  Generate 3 message suggestions that the user can quickly select to respond to the conversation.

  Ensure that the suggestions are relevant to the context and helpful for keeping the conversation flowing.
  Return the suggestions as an array of strings in the output.`,
});

const suggestMessagesFlow = ai.defineFlow(
  {
    name: 'suggestMessagesFlow',
    inputSchema: SuggestMessagesInputSchema,
    outputSchema: SuggestMessagesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
