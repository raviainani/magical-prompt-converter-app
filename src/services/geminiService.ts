// No longer importing GoogleGenerativeAI since we are using direct fetch
// import { GoogleGenerativeAI } from "@google/generative-ai";

if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// REMOVED ALL PREVIOUS DEBUGGING CONSOLE LOGS RELATED TO AI INSTANCE

export const generateQuestions = async (prompt: string): Promise<string[]> => {
    const modelName = "gemini-1.5-flash"; // Or "gemini-pro" if you prefer
    const url = `${BASE_URL}/${modelName}:generateContent`;

    const systemInstruction = `You are an expert AI assistant specializing in prompt engineering and contextual analysis. A user will provide an initial, high-level prompt. Your task is to perform a deep analysis of the user's request, inferring their underlying intent, purpose, and the potential complexity of the desired output.

Based on this analysis, generate a focused set of 3-8 highly specific and targeted questions to extract crucial, actionable details that will shape a powerful final LLM prompt. Prioritize questions that clarify the core nature, purpose, and intended audience of the request. For complex or multi-modal outputs (like videos, scripts, or reports), ensure your questions cover all necessary components (e.g., duration, style, audio, scenes, data structure).

Respond ONLY with a valid JSON object in the format: { "questions": ["question 1", "question 2", ...] }. Do not include any other text, explanation, or markdown formatting.`;

    const requestBody = {
        contents: [
            {
                role: "user",
                parts: [{ text: systemInstruction }],
            },
            {
                role: "model",
                parts: [{ text: "Understood. I will provide questions in JSON format." }],
            },
            {
                role: "user",
                parts: [{ text: prompt }],
            },
        ],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
        },
    };

    // Declare responseText here to ensure its scope covers the entire function
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
            console.error("API Error Response:", errorData);
            throw new Error(`API request failed with status ${response.status}: ${errorData.error.message || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log("Direct fetch call successful for questions:", data);

        // Assign responseText AFTER the data is successfully fetched and parsed to JSON
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log("Extracted responseText:", responseText); // Log to see what was extracted

        if (responseText) {
            // Strip markdown code block delimiters if present
            let cleanJsonString = responseText.trim();
            if (cleanJsonString.startsWith("```json")) {
                cleanJsonString = cleanJsonString.substring(cleanJsonString.indexOf("```json") + 7);
            }
            if (cleanJsonString.endsWith("```")) {
                cleanJsonString = cleanJsonString.substring(0, cleanJsonString.lastIndexOf("```"));
            }
            cleanJsonString = cleanJsonString.trim(); // Trim again after stripping

            try {
                const jsonResponse = JSON.parse(cleanJsonString);
                return jsonResponse.questions;
            } catch (parseError) {
                console.error("Failed to parse JSON after stripping markdown:", parseError);
                console.error("Raw response text was:", responseText);
                console.error("Attempted to parse:", cleanJsonString);
                throw new Error("Model response was not valid JSON even after stripping markdown.");
            }
        } else {
            console.error("No text content found in Gemini API response for questions. Candidates:", data.candidates);
            return [];
        }
    } catch (error) {
        console.error("Error generating questions:", error);
        throw error;
    }
};

export const generateFinalPrompt = async (initialPrompt: string, qaPairs: { question: string; answer: string }[]): Promise<string> => {
    const modelName = "gemini-1.5-flash"; // Or "gemini-pro"
    const url = `${BASE_URL}/${modelName}:generateContent`;

    const systemInstruction = `You are an expert AI Prompt Engineer. Your task is to synthesize an initial user prompt and their answers to several clarifying questions into a single, meticulously structured, and commanding 'magical' prompt for a Large Language Model (LLM).

You MUST organize the generated prompt using the following markdown sections EXACTLY as specified below. Each section must be concise yet packed with relevant details derived from the user's input. If a section is not applicable or information is not provided, OMIT THE SECTION ENTIRELY.

**[ROLE]**: Assign a specific, expert persona to the LLM (e.g., "You are a professional scriptwriter specializing in educational content," "You are an expert fantasy artist.").
**[CONTEXT]**: Provide the essential background and overall purpose. Set the stage for the LLM.
**[TASK]**: State the core, imperative directive. Use strong action verbs. For complex outputs, break this down into clear, numbered sub-tasks.
**[DETAILS/SPECIFICATIONS]**: List all granular attributes, characteristics, themes, styles, and specific elements provided by the user. Use bullet points for clarity.
**[FORMAT/OUTPUT INSTRUCTIONS]**: Explicitly define the desired output structure, formatting (e.g., JSON, markdown), and any length constraints.
**[CONSTRAINTS/EXCLUSIONS]**: List any limitations, things to avoid, or specific rules. Use bullet points.
**[TONE/STYLE]**: Reiterate the exact desired tone and writing style.

Combine all information seamlessly, using polished, clear, and direct language. The final output should be a single, cohesive, actionable directive ready for an LLM. Output ONLY the final, engineered prompt as a single block of text, following the mandatory structure. Do not add any conversational fluff, apologies, or introductory text like 'Here is the final prompt:'.`;

    const userContent = `
    **Initial Prompt:**
    "${initialPrompt}"

    **User's Answers to Clarifying Questions:**
    ${qaPairs.map(pair => `- Question: ${pair.question}\n  - Answer: ${pair.answer || 'No answer provided.'}`).join('\n')}
    `;

    const requestBody = {
        contents: [
            {
                role: "user",
                parts: [{ text: systemInstruction }],
            },
            {
                role: "model",
                parts: [{ text: "Understood. I will generate the final prompt." }],
            },
            {
                role: "user",
                parts: [{ text: userContent }],
            },
        ],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
        },
    };

    try {
        console.log("Making direct fetch call for final prompt...");
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
            console.error("API Error Response:", errorData);
            throw new Error(`API request failed with status ${response.status}: ${errorData.error.message || 'Unknown error'}`);
        }

        const data = await response.json();
        console.log("Direct fetch call successful for final prompt:", data);

        const responseText = data.candidates[0]?.content?.parts[0]?.text;
        return responseText || '';
    } catch (error) {
        console.error("Error generating final prompt:", error);
        throw error;
    }
};