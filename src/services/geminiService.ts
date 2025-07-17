// geminiServices.ts (Client-Side File)

// Import Firebase functions necessary for calling Cloud Functions
import { getFunctions, httpsCallable } from 'firebase/functions';
// Import your Firebase app instance. Ensure 'app' is exported from firebaseConfig.ts.
import { app } from '../firebaseConfig'; // Adjust path if necessary

// Check if the client-side API key is set for generateQuestions
if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set for client-side API calls.");
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Using v1beta as per your provided URL. Note: newer features like JSON mode often require v1.
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"; 

// Initialize Firebase Functions client using your Firebase app instance
const functions = getFunctions(app);

// Define the callable function reference for your Cloud Function (for final prompt generation)
// This specifies the input (request) and output (response) types for better type safety.
const callGenerateMagicalPromptFunction = httpsCallable<
    { initialIdea: string; contextQuestions: string }, // Data sent TO the Cloud Function
    { magicalPrompt: string } // Data returned FROM the Cloud Function
>(functions, 'generateMagicalPrompt'); // 'generateMagicalPrompt' must exactly match the name of your Cloud Function

/**
 * Generates clarifying questions based on an initial prompt.
 * This function uses a direct fetch call to the Gemini API from the client-side.
 */
export const generateQuestions = async (prompt: string): Promise<string[]> => {
    const modelName = "gemini-2.5-flash"; // Or "gemini-pro" if you prefer. Using 1.5-flash for broader availability.
    const url = `${BASE_URL}/${modelName}:generateContent`;

    // System instruction is provided as a separate field in the direct API request body.
    const systemInstructionContent = {
        parts: [{ text: `You are an expert AI assistant specializing in prompt engineering and contextual analysis. A user will provide an initial, high-level prompt. Your task is to analyze this initial prompt to identify areas that lack clarity, specificity, or sufficient detail.

Based on this analysis, generate a focused set of 3-8 highly specific and targeted questions to extract crucial, actionable details that will shape a powerful final LLM prompt. Prioritize questions that directly lead to concrete specifications for the LLM's role, task, context, format, or constraints.

Respond ONLY with a valid JSON object in the format: { "questions": ["question 1", "question 2", ...] }. Do not include any other text, explanation, or markdown formatting.` }]
    };

    const requestBody = {
        systemInstruction: systemInstructionContent, // Correct placement for system instruction
        contents: [
            {
                role: "user",
                parts: [{ text: prompt }],
            },
        ],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
        },
        // You might consider adding safety settings here for client-side calls if you want to filter responses early.
        // E.g., "safetySettings": [...] as defined in the server-side example I gave previously.
    };

    let responseText: string | undefined;

    try {
        console.log("Making direct fetch call for questions...");
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY, // API key in header
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error Response for questions:", errorData);
            throw new Error(`API request failed with status ${response.status}: ${errorData.error.message || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log("Direct fetch call successful for questions:", data);

        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log("Extracted responseText for questions:", responseText);

        if (responseText) {
            let cleanJsonString = responseText.trim();
            // Robust parsing for markdown JSON fences
            if (cleanJsonString.startsWith("```json")) {
                cleanJsonString = cleanJsonString.substring(cleanJsonString.indexOf("```json") + 7);
            }
            if (cleanJsonString.endsWith("```")) {
                cleanJsonString = cleanJsonString.substring(0, cleanJsonString.lastIndexOf("```"));
            }
            cleanJsonString = cleanJsonString.trim();

            try {
                const jsonResponse = JSON.parse(cleanJsonString);
                // Ensure it has the 'questions' property and it's an array
                if (jsonResponse && Array.isArray(jsonResponse.questions)) {
                    return jsonResponse.questions;
                } else {
                    console.warn("Model response for questions was not in expected JSON format: { 'questions': [...] }", jsonResponse);
                    throw new Error("Model response for questions was not valid JSON or missing 'questions' array.");
                }
            } catch (parseError) {
                console.error("Failed to parse JSON for questions:", parseError);
                console.error("Raw response text was:", responseText);
                console.error("Attempted to parse:", cleanJsonString);
                throw new Error("Model response for questions was not valid JSON even after stripping markdown.");
            }
        } else {
            console.error("No text content found in Gemini API response for questions. Candidates:", data.candidates);
            // It's usually better to throw an error here if no content is returned, as it's unexpected.
            throw new Error("No response content from Gemini API for questions.");
        }
    } catch (error: unknown) { // Catch unknown error type for better type safety
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Error generating questions:", errorMessage);
        throw new Error(`Failed to generate questions from the AI: ${errorMessage}`);
    }
};

/**
 * Generates the final magical prompt by calling a Firebase Cloud Function.
 * This function is subject to the daily generation limit.
 */
export const generateFinalPrompt = async (initialPrompt: string, qaPairs: { question: string; answer: string }[]): Promise<string> => {
    // Combine initial prompt and Q&A pairs into a single string to send to the Cloud Function
    const contextQuestions = `
    Initial Prompt: "${initialPrompt}"

    User's Answers to Clarifying Questions:
    ${qaPairs.map(pair => `- Question: ${pair.question}\n  - Answer: ${pair.answer || 'No answer provided.'}`).join('\n')}
    `;

    try {
        console.log("Calling Cloud Function for final prompt generation...");
        // Invoke the Cloud Function
        const result = await callGenerateMagicalPromptFunction({
            initialIdea: initialPrompt, // Send the original initial prompt
            contextQuestions: contextQuestions, // Send the combined Q&A for the Cloud Function to process
        });

        // The actual response data from your Cloud Function is in the 'data' property
        const { magicalPrompt } = result.data;

        console.log("Cloud Function call successful for final prompt:", magicalPrompt);
        return magicalPrompt;

    } catch (error: unknown) { // Use 'unknown' for better type safety
        const errorMessage = error instanceof Error ? error.message : String(error);
        // Log the error for debugging purposes
        console.error("Error calling Cloud Function for final prompt generation:", errorMessage);

        // If the Cloud Function throws an HttpsError (e.g., 'resource-exhausted'),
        // its properties (code, message) are accessible here.
        if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
            // Provide a more user-friendly message based on the Cloud Function's error
            throw new Error(`Failed to generate prompt via Cloud Function: ${error.message}`);
        } else {
            // Fallback for other unexpected errors
            throw new Error(`An unexpected error occurred during final prompt generation: ${errorMessage}`);
        }
    }
};