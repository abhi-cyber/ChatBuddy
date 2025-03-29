import axios from "axios";
import config from "../config/environment";
import {PERSONA_DETAILS, DEFAULT_PERSONA} from "../utils/personaConstants";

// Using the API key from environment config
const API_KEY = config.GEMINI_API_KEY;

// Updated to use gemini-2.0-flash model as per the API quickstart guide
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Store conversation history based on the selected persona
let currentPersona = DEFAULT_PERSONA;
let conversationHistories = {};

// Initialize conversation histories for each persona
Object.keys(PERSONA_DETAILS).forEach((personaType) => {
  const persona = PERSONA_DETAILS[personaType];
  conversationHistories[personaType] = [
    {
      role: "user",
      parts: [
        {text: `Please act as a ${persona.name}. ${persona.systemPrompt}`},
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: persona.initialMessage,
        },
      ],
    },
  ];
});

// Maximum number of messages to keep in history (to manage token limits)
const MAX_CONVERSATION_LENGTH = 10;

// IMPROVED: More robust retry settings
const MAX_RETRIES = 3; // Increase retry attempts
const RETRY_DELAY_BASE = 1000; // Base delay of 1 second
const RETRY_DELAY_MAX = 10000; // Cap the maximum delay at 10 seconds

// Helper function to delay execution with jitter for better distribution
const delay = (retryCount) => {
  // Exponential backoff with jitter to prevent thundering herd problem
  const exponentialDelay = Math.min(
    RETRY_DELAY_MAX,
    RETRY_DELAY_BASE * Math.pow(2, retryCount)
  );
  // Add randomness (jitter) of 0-30%
  const jitter = exponentialDelay * 0.3 * Math.random();
  return new Promise((resolve) =>
    setTimeout(resolve, exponentialDelay + jitter)
  );
};

/**
 * Set the current persona for the conversation
 * @param {string} personaType - The persona type to use
 */
export const setPersona = (personaType) => {
  if (PERSONA_DETAILS[personaType]) {
    currentPersona = personaType;
    console.log(`Persona set to: ${PERSONA_DETAILS[personaType].name}`);
  } else {
    console.error(`Invalid persona type: ${personaType}`);
    currentPersona = DEFAULT_PERSONA;
  }
};

/**
 * Get the current persona details
 * @returns {Object} The current persona details
 */
export const getCurrentPersona = () => {
  return PERSONA_DETAILS[currentPersona];
};

/**
 * Reset the conversation history for the current persona
 */
export const resetConversation = () => {
  const persona = PERSONA_DETAILS[currentPersona];
  conversationHistories[currentPersona] = [
    {
      role: "user",
      parts: [
        {text: `Please act as a ${persona.name}. ${persona.systemPrompt}`},
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: persona.initialMessage,
        },
      ],
    },
  ];
};

/**
 * Generate a response from the Gemini API with retry logic
 * @param {string} userMessage - The user's message
 * @returns {Promise<string>} - The AI response
 */
export const generateGeminiResponse = async (userMessage) => {
  let retries = 0;
  const conversationHistory = conversationHistories[currentPersona];

  while (retries <= MAX_RETRIES) {
    try {
      // Add user message to conversation history
      conversationHistory.push({role: "user", parts: [{text: userMessage}]});

      // Trim conversation if it gets too long (keeping first two messages for context)
      if (conversationHistory.length > MAX_CONVERSATION_LENGTH) {
        conversationHistory = [
          // Keep our initial "system" context messages
          conversationHistory[0],
          conversationHistory[1],
          // And the most recent messages
          ...conversationHistory.slice(-(MAX_CONVERSATION_LENGTH - 2)),
        ];
      }

      // Save the updated conversation history
      conversationHistories[currentPersona] = conversationHistory;

      console.log(
        `Calling Gemini API (attempt ${retries + 1}/${MAX_RETRIES + 1})`
      );
      console.log("Using model: gemini-2.0-flash");
      console.log("Conversation history length:", conversationHistory.length);

      const response = await axios.post(
        `${API_URL}?key=${API_KEY}`,
        {
          contents: conversationHistory,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 15000, // Increase timeout to 15s for potentially slow responses
        }
      );

      // Extract the response text
      const responseText = response.data.candidates[0].content.parts[0].text;

      // Add AI response to conversation history
      conversationHistory.push({role: "model", parts: [{text: responseText}]});

      // Save the updated conversation history again
      conversationHistories[currentPersona] = conversationHistory;

      return responseText;
    } catch (error) {
      const status = error.response?.status;

      // Log detailed error information
      console.error(
        `Gemini API Error (attempt ${retries + 1}/${MAX_RETRIES + 1}):`,
        status || error.message
      );

      if (error.response) {
        console.error("Error details:", error.response.data);
      }

      // IMPROVED: Handle specific error types differently
      if (status === 503 || status >= 500) {
        // For server errors (including 503), use exponential backoff
        if (retries < MAX_RETRIES) {
          retries++;
          const waitTime = await delay(retries);
          console.log(`Retrying in ${Math.round(waitTime)}ms...`);
          continue;
        }
      } else if (status === 429) {
        // Rate limit - wait longer before retry
        if (retries < MAX_RETRIES) {
          retries++;
          // Rate limits usually require longer waits
          await new Promise((resolve) =>
            setTimeout(resolve, 3000 + retries * 2000)
          );
          console.log(
            `Rate limited. Waiting longer before retry ${retries}...`
          );
          continue;
        }
      }

      // For other errors or if we've exhausted retries, throw to trigger fallback
      throw error;
    }
  }

  throw new Error("Maximum retries exceeded. API appears to be unavailable.");
};

/**
 * Get the sentiment of a message with retry logic
 * @param {string} message - The message to analyze
 * @returns {Promise<object>} - Sentiment analysis with mood suggestion
 */
export const analyzeSentiment = async (message) => {
  let retries = 0;

  while (retries <= MAX_RETRIES) {
    try {
      const prompt = `Analyze the emotional sentiment in this message and categorize it as one of: 
                     "very_sad", "sad", "neutral", "good", or "very_good". 
                     Return ONLY the category name, nothing else: "${message}"`;

      console.log(
        `Sentiment analysis attempt ${retries + 1}/${MAX_RETRIES + 1}`
      );

      // Using a simple request format without conversation history
      const response = await axios.post(
        `${API_URL}?key=${API_KEY}`,
        {
          contents: [{role: "user", parts: [{text: prompt}]}],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 8000, // Add 8s timeout
        }
      );

      const mood = response.data.candidates[0].content.parts[0].text
        .trim()
        .toLowerCase();

      // Map the response to a valid mood value, with fallback
      const validMoods = ["very_sad", "sad", "neutral", "good", "very_good"];
      const detectedMood =
        validMoods.find((m) => mood.includes(m)) || "neutral";

      return {mood: detectedMood};
    } catch (error) {
      const status = error.response?.status;

      console.error(
        `Sentiment Analysis Error (attempt ${retries + 1}/${MAX_RETRIES + 1}):`,
        status || error.message
      );

      // Only retry for 5xx errors
      if ((status === 503 || status >= 500) && retries < MAX_RETRIES) {
        retries++;
        // Fix: Use the delay function with retry count instead of undefined RETRY_DELAY
        const waitTime = await delay(retries);
        console.log(
          `Retrying sentiment analysis in ${Math.round(waitTime)}ms...`
        );
        continue;
      }

      // For other errors or if retries are exhausted, use fallback
      return {mood: "neutral"}; // Default fallback
    }
  }

  // Fallback if all retries fail
  return {mood: "neutral"};
};
