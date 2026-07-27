import {
  GoogleGenerativeAI,
  SchemaType,
  type Schema,
} from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  // Thrown at request time (not import time) in routes that use this,
  // but warn early in dev so it's obvious what's missing.
  console.warn(
    "[ai/client] GEMINI_API_KEY is not set. Get a free key at https://aistudio.google.com/apikey"
  );
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

// Strict JSON schema for task extraction. Passing this as
// responseSchema (alongside responseMimeType: application/json) makes
// Gemini constrain its output to this exact shape instead of just
// "trying" to return JSON — this is what makes the parsing route
// reliable enough to not need a fallback parser.
const extractedTaskSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    tasks: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          category: { type: SchemaType.STRING },
          priority: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["LOW", "MEDIUM", "HIGH"],
          },
          estimatedMinutes: { type: SchemaType.NUMBER },
          energyLevel: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["LOW", "MEDIUM", "HIGH"],
          },
        },
        required: [
          "title",
          "category",
          "priority",
          "estimatedMinutes",
          "energyLevel",
        ],
      },
    },
    ignoredNotes: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
  },
  required: ["tasks"],
};

/**
 * gemini-2.5-flash is deliberately chosen over Pro here: task
 * extraction is a well-scoped structured-output job, not a task that
 * benefits from Pro's deeper reasoning, and Flash's free-tier quota
 * (~1,500 req/day) is far more generous. Swap the model string if you
 * later want to experiment with Pro or the newer 3.x Flash line.
 */
export function getTaskExtractionModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: extractedTaskSchema,
      temperature: 0.4,
    },
  });
}
