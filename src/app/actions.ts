"use server";

import { inferProgrammingLanguage } from "@/ai/flows/infer-programming-language";
import type { InferProgrammingLanguageOutput } from "@/ai/flows/infer-programming-language";

export async function detectLanguageAction({
  code,
}: {
  code: string;
}): Promise<InferProgrammingLanguageOutput> {
  if (!code || !code.trim()) {
    throw new Error("Code snippet is empty.");
  }
  try {
    const result = await inferProgrammingLanguage({ code });
    return result;
  } catch (error) {
    console.error("Error in detectLanguageAction:", error);
    throw new Error("Failed to infer programming language from the provided snippet.");
  }
}
