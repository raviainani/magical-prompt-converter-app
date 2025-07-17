"use strict";
// functions/src/index.ts (Cloud Function File)
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMagicalPrompt = void 0;
const https_1 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const generative_ai_1 = require("@google/generative-ai");
const admin = require("firebase-admin"); // <-- NEW: Import Firebase Admin SDK
// Initialize Firebase Admin SDK (This must be done once at the top level of your file)
admin.initializeApp();
// Define the daily limit for prompt generations per user
const DAILY_PROMPT_LIMIT = 5; // You can adjust this limit as needed
// Initialize Generative AI client and model globally, but API key check is deferred.
let ai = null;
let finalPromptModel = null;
// Define safety settings to filter potentially harmful content.
const safetySettings = [
    {
        category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: generative_ai_1.HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: generative_ai_1.HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: generative_ai_1.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];
// Helper to ensure AI client is initialized with the API key from environment variables.
function ensureAiInitialized() {
    // Access the API key directly from process.env for v2 functions.
    // The name 'GEMINI_API_KEY' should match how it's set in the Firebase Console.
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        v2_1.logger.error("Gemini API Key not found in process.env. Ensure it's set in the Firebase Console Environment variables.", { env: process.env });
        throw new https_1.HttpsError('internal', 'Server configuration error: Gemini API Key is missing. Please contact support.');
    }
    if (!ai) {
        ai = new generative_ai_1.GoogleGenerativeAI(API_KEY);
    }
}
/**
 * Callable Cloud Function to generate the final "magical prompt".
 * This function now includes user-specific daily generation limit.
 */
exports.generateMagicalPrompt = (0, https_1.onCall)(async (request) => {
    // 1. Authenticate User and Get UID
    if (!request.auth || !request.auth.uid) {
        v2_1.logger.warn("Unauthenticated call to generateMagicalPrompt. Authentication is required for this function.");
        throw new https_1.HttpsError('unauthenticated', 'Authentication required to generate prompts. Please log in.');
    }
    const uid = request.auth.uid;
    const today = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD for daily reset
    // 2. Implement Daily User Limit Check using Firestore Transaction
    // Transactions ensure atomic updates (read and write together safely)
    const userLimitRef = admin.firestore().collection('userLimits').doc(uid);
    try {
        await admin.firestore().runTransaction(async (transaction) => {
            const userLimitDoc = await transaction.get(userLimitRef);
            let currentCount = 0;
            let lastResetDate = '';
            if (userLimitDoc.exists) {
                const data = userLimitDoc.data();
                currentCount = (data === null || data === void 0 ? void 0 : data.count) || 0;
                lastResetDate = (data === null || data === void 0 ? void 0 : data.lastResetDate) || '';
            }
            // If it's a new day, reset the count
            if (lastResetDate !== today) {
                currentCount = 0;
                lastResetDate = today;
            }
            // Check if the user has exceeded the daily limit
            if (currentCount >= DAILY_PROMPT_LIMIT) {
                v2_1.logger.warn(`User ${uid} exceeded daily prompt limit (${DAILY_PROMPT_LIMIT}).`);
                // Throw an HttpsError with 'resource-exhausted' code
                throw new https_1.HttpsError('resource-exhausted', `You have reached your daily limit of ${DAILY_PROMPT_LIMIT} prompt generations. Please try again tomorrow.`);
            }
            // If not exceeded, increment the count for this generation
            transaction.set(userLimitRef, {
                count: currentCount + 1,
                lastResetDate: today,
                // Optional: track the exact time of the last generation
                lastGenerationTime: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true }); // Use merge to update fields without overwriting others
        });
        v2_1.logger.info(`User ${uid} consumed 1 generation for today. Remaining capacity available.`);
    }
    catch (transactionError) { // Use 'unknown' for better type safety
        // If our custom HttpsError for 'resource-exhausted' was thrown, re-throw it directly.
        if (transactionError instanceof https_1.HttpsError && transactionError.code === 'resource-exhausted') {
            throw transactionError;
        }
        // Log other unexpected transaction errors
        const errMessage = transactionError instanceof Error ? transactionError.message : String(transactionError);
        v2_1.logger.error(`Firestore transaction failed for user ${uid}:`, { error: errMessage });
        throw new https_1.HttpsError('internal', 'Failed to check/update user limit due to a server error. Please try again.');
    }
    // 3. Proceed with AI generation (rest of your existing logic)
    try {
        ensureAiInitialized(); // Ensure the AI client is set up
        if (!finalPromptModel) {
            finalPromptModel = ai.getGenerativeModel({
                model: "gemini-1.5-pro", // Or your preferred model
                systemInstruction: `You are a Master Prompt Architect. Your mission is to synthesize a user's initial idea and their answers to a series of clarifying questions into a single, comprehensive, and highly-effective 'super-prompt' for a Large Language Model (LLM).

You MUST structure the final prompt using the following markdown sections. If a section is not relevant based on the user's input, OMIT THE SECTION ENTIRELY. Do not invent information.

**[ROLE]**
- **Persona**: Define the expert persona the LLM should adopt. Be specific (e.g., "You are a senior data scientist specializing in time-series analysis," not just "You are a data scientist").

**[CONTEXT]**
- **Background**: Provide the essential background, purpose, and goals of the task. Explain the 'why' behind the request.

**[TASK]**
- **Primary Objective**: State the core, imperative directive in a clear and concise command.
- **Step-by-Step Instructions**: If the task is complex, break it down into a logical sequence of sub-tasks. This helps the LLM with chain-of-thought reasoning.

**[SPECIFICATIONS]**
- **Key Details**: Use bullet points to list all granular attributes, themes, specific elements, and data points provided by the user. Be meticulous.
- **Audience**: Clearly define the target audience for the final output.

**[STYLE & TONE]**
- **Voice**: Describe the desired writing style and tone (e.g., "Formal and academic," "Witty and conversational," "Simple and direct for a general audience").

**[EXAMPLES]**
- **Positive Example (Do this)**: If the user provided an example of good output, include it here as a guide for the LLM (few-shot learning).

**[FORMATTING]**
- **Output Structure**: Define the exact desired output structure (e.g., "Respond ONLY with a JSON object matching this schema: ...", "Format the output as a markdown table with columns 'X', 'Y', 'Z'.").
- **Length Constraints**: Specify any length requirements (e.g., "The summary must be exactly 3 paragraphs long.").

**[CONSTRAINTS]**
- **Exclusions**: Use bullet points to list anything the LLM should explicitly avoid, topics to exclude, or words not to use.
- **Rules**: List any other hard rules the LLM must follow.

Your final output must be ONLY the engineered prompt, formatted in markdown as described above. Do not include any conversational text, introductions, or apologies like "Here is the final prompt:". The prompt should be a complete, self-contained directive ready for an LLM.`
            });
        }
        const { initialIdea, contextQuestions } = request.data;
        const userContent = `
        **Initial Prompt:**
        "${initialIdea}"

        **User's Answers to Clarifying Questions:**
        ${contextQuestions}
        `;
        v2_1.logger.info("Generating final prompt with Gemini API (server-side)...", { initialIdea, contextQuestions });
        const response = await finalPromptModel.generateContent({
            contents: [{ role: "user", parts: [{ text: userContent }] }],
            safetySettings: safetySettings
        });
        const generatedText = response.response.text();
        if (!generatedText) {
            v2_1.logger.warn("Gemini API returned no text for final prompt from server-side.");
            throw new https_1.HttpsError('internal', 'No content received from AI for final prompt.');
        }
        v2_1.logger.info("Final prompt generated successfully.");
        return { magicalPrompt: generatedText.trim() };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        v2_1.logger.error("Error in generateMagicalPrompt Cloud Function (AI generation phase):", { error: errorMessage });
        // Re-throw specific HttpsErrors (like 'resource-exhausted' from the limit check, or 'unauthenticated')
        if (error instanceof https_1.HttpsError) {
            throw error;
        }
        else if (errorMessage.includes("API Key") || errorMessage.includes("missing") || errorMessage.includes("not found") || errorMessage.includes("configured")) {
            throw new https_1.HttpsError('failed-precondition', 'AI service not configured correctly. Gemini API Key is missing or invalid.');
        }
        else if (errorMessage.includes("quota")) {
            throw new https_1.HttpsError('resource-exhausted', 'AI quota exceeded. Please try again later.');
        }
        else {
            throw new https_1.HttpsError('internal', `Failed to generate final prompt: ${errorMessage}`);
        }
    }
});
//# sourceMappingURL=index.js.map