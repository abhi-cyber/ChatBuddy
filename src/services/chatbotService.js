import axios from "axios";
import {preprocess} from "./textProcessingService";
import {generateGeminiResponse, analyzeSentiment} from "./geminiService";
import {generateResponse} from "./responseService";
import config from "../config/environment";
import {
  STRESS_KEYWORDS,
  ANXIETY_KEYWORDS,
  DEPRESSION_KEYWORDS,
} from "../utils/constants";

// IMPROVED: Track API availability with better exponential backoff
let apiAvailable = true;
let lastFailTime = 0;
let consecutiveFailures = 0;
const INITIAL_BACKOFF = 30000; // 30 seconds
const MAX_BACKOFF = 3600000; // Max 1 hour backoff for persistent failures

// Import API key and URL for availability checks
const API_KEY = config.GEMINI_API_KEY;
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/**
 * Calculate stress score based on keywords in processed text
 * @param {string[]} processedText - Processed user input
 * @returns {number} - Stress score (0-10)
 */
export const detectStress = (processedText) => {
  let score = 0;
  let detected = {
    stress: 0,
    anxiety: 0,
    depression: 0,
  };

  // Count occurrences of each keyword type
  processedText.forEach((word) => {
    if (STRESS_KEYWORDS.includes(word)) detected.stress++;
    if (ANXIETY_KEYWORDS.includes(word)) detected.anxiety++;
    if (DEPRESSION_KEYWORDS.includes(word)) detected.depression++;
  });

  // Calculate weighted score
  score =
    detected.stress * 2 + detected.anxiety * 2.5 + detected.depression * 3;

  // Normalize score to 0-10 range
  return Math.min(Math.floor(score), 10);
};

/**
 * Helper function for delaying with jitter - specific for availability checks
 * @param {number} baseMs - Base delay in milliseconds
 * @returns {Promise<void>}
 */
const delayWithJitter = (baseMs = 2000) => {
  // Add up to 50% jitter to prevent all clients from retrying simultaneously
  const jitterMs = Math.floor(Math.random() * (baseMs * 0.5));
  return new Promise((resolve) => setTimeout(resolve, baseMs + jitterMs));
};

/**
 * Check if the API is currently available with improved error handling
 * @returns {Promise<boolean>} True if API is available
 */
export const isApiAvailable = async () => {
  // Try up to 2 times with a short delay for transient errors
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      // Simplified prompt just to check connectivity
      const response = await axios.post(
        `${API_URL}?key=${API_KEY}`,
        {
          contents: [{role: "user", parts: [{text: "Hello"}]}],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 5,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000, // Shorter timeout for status check
        }
      );

      // If we get here, API is working again
      if (!apiAvailable) {
        console.log("API is available again after previous failures");
        // Reset the failure counters on success
        consecutiveFailures = 0;
      }

      return response.status === 200;
    } catch (error) {
      const statusCode = error.response?.status;
      console.error(
        `API availability check failed (${statusCode || "network error"}):`,
        error.message
      );

      // Track the type of failure
      if (statusCode === 503) {
        console.warn("API server unavailable (503 status code)");

        // For 503 errors, wait a bit and try once more before reporting unavailable
        if (attempt === 0) {
          await delayWithJitter();
          continue; // Try again
        }
      } else if (statusCode >= 500) {
        console.warn("API server experiencing other issues (5xx status code)");
      } else if (statusCode === 429) {
        console.warn("API rate limiting in effect (429 status code)");
      } else if (!statusCode) {
        console.warn("Network error or timeout occurred");
      }
    }
  }

  // If we get here, the API is unavailable after all attempts
  return false;
};

/**
 * Process user input and generate appropriate response using Gemini API
 * @param {string} userInput - Raw user message text
 * @returns {Promise<{response: string, usingFallback: boolean, errorType: string}>} - Chatbot response and status
 */
export const processChatbotResponse = async (userInput) => {
  const currentTime = Date.now();

  // Calculate current backoff with exponential increase for consecutive failures
  const currentBackoff = Math.min(
    MAX_BACKOFF,
    INITIAL_BACKOFF * Math.pow(2, consecutiveFailures)
  );

  // If API was unavailable, check if we've waited long enough to try again
  if (!apiAvailable && currentTime - lastFailTime > currentBackoff) {
    apiAvailable = true; // Reset flag to try API again
    console.log(
      `Attempting to reconnect to Gemini API after ${
        currentBackoff / 1000
      }s backoff`
    );
  }

  try {
    // First try Gemini API if it's available
    if (apiAvailable) {
      const response = await generateGeminiResponse(userInput);
      // If successful, reset failure tracking
      consecutiveFailures = 0;
      return {response, usingFallback: false, errorType: null};
    } else {
      // Skip API call during backoff period
      console.log(
        `Skipping Gemini API call during backoff period (${
          currentBackoff / 1000
        }s)`
      );
      throw new Error("API in backoff period");
    }
  } catch (error) {
    console.error("Error processing chatbot response:", error);

    // If this is a new failure, update our tracking
    if (apiAvailable) {
      apiAvailable = false;
      lastFailTime = Date.now();
      consecutiveFailures++;
      console.log(
        `API marked unavailable (failure #${consecutiveFailures}), will retry after ${
          currentBackoff / 1000
        }s`
      );
    }

    // Generate a more informative fallback response
    const processedText = preprocess(userInput);
    const stressScore = detectStress(processedText);

    // Extract specific error type
    const errorType =
      error.response?.status === 503
        ? "service_unavailable"
        : error.response?.status === 429
        ? "rate_limited"
        : "api_error";

    // Add info about the service status to the fallback response
    let fallbackResponse = generateResponse(stressScore, processedText);

    return {
      response: fallbackResponse,
      usingFallback: true,
      errorType,
    };
  }
};
