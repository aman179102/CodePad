'use server';

/**
 * @fileOverview This file defines a Genkit flow to infer the programming language of a given code snippet.
 *
 * - inferProgrammingLanguage - A function that takes code as input and returns the inferred programming language.
 * - InferProgrammingLanguageInput - The input type for the inferProgrammingLanguage function.
 * - InferProgrammingLanguageOutput - The return type for the inferProgrammingLanguage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InferProgrammingLanguageInputSchema = z.object({
  code: z.string().describe('The code snippet to analyze.'),
});
export type InferProgrammingLanguageInput = z.infer<
  typeof InferProgrammingLanguageInputSchema
>;

const InferProgrammingLanguageOutputSchema = z.object({
  language: z.string().describe('The inferred programming language.'),
});
export type InferProgrammingLanguageOutput = z.infer<
  typeof InferProgrammingLanguageOutputSchema
>;

export async function inferProgrammingLanguage(
  input: InferProgrammingLanguageInput
): Promise<InferProgrammingLanguageOutput> {
  return inferProgrammingLanguageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'inferProgrammingLanguagePrompt',
  input: {schema: InferProgrammingLanguageInputSchema},
  output: {schema: InferProgrammingLanguageOutputSchema},
  prompt: `You are an expert programming language identifier. Analyze the following code snippet and determine its programming language.\n\nCode:\n{{code}}\n\nRespond with just the language name. Do not include any other text.  For example, if the code is Javascript, respond with 'Javascript'.`,
});

const inferProgrammingLanguageFlow = ai.defineFlow(
  {
    name: 'inferProgrammingLanguageFlow',
    inputSchema: InferProgrammingLanguageInputSchema,
    outputSchema: InferProgrammingLanguageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
