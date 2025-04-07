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

let apiAvailable = true;
let lastFailTime = 0;
let consecutiveFailures = 0;
const INITIAL_BACKOFF = 30000;
const MAX_BACKOFF = 3600000;

const API_KEY = config.GEMINI_API_KEY;
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export const detectStress = (processedText) => {
  let score = 0;
  let detected = {
    stress: 0,
    anxiety: 0,
    depression: 0,
  };

  processedText.forEach((word) => {
    if (STRESS_KEYWORDS.includes(word)) detected.stress++;
    if (ANXIETY_KEYWORDS.includes(word)) detected.anxiety++;
    if (DEPRESSION_KEYWORDS.includes(word)) detected.depression++;
  });

  score =
    detected.stress * 2 + detected.anxiety * 2.5 + detected.depression * 3;

  return Math.min(Math.floor(score), 10);
};

const delayWithJitter = (baseMs = 2000) => {
  const jitterMs = Math.floor(Math.random() * (baseMs * 0.5));
  return new Promise((resolve) => setTimeout(resolve, baseMs + jitterMs));
};

export const isApiAvailable = async () => {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
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
          timeout: 5000,
        }
      );

      if (!apiAvailable) {
        consecutiveFailures = 0;
      }

      return response.status === 200;
    } catch (error) {
      const statusCode = error.response?.status;

      if (statusCode === 503) {
        if (attempt === 0) {
          await delayWithJitter();
          continue;
        }
      }

      return false;
    }
  }

  return false;
};

export const processChatbotResponse = async (userInput) => {
  const currentTime = Date.now();

  const currentBackoff = Math.min(
    MAX_BACKOFF,
    INITIAL_BACKOFF * Math.pow(2, consecutiveFailures)
  );

  if (!apiAvailable && currentTime - lastFailTime > currentBackoff) {
    apiAvailable = true;
  }

  try {
    if (apiAvailable) {
      const response = await generateGeminiResponse(userInput);
      consecutiveFailures = 0;
      return {response, usingFallback: false, errorType: null};
    } else {
      throw new Error("API in backoff period");
    }
  } catch (error) {
    if (apiAvailable) {
      apiAvailable = false;
      lastFailTime = Date.now();
      consecutiveFailures++;
    }

    const processedText = preprocess(userInput);
    const stressScore = detectStress(processedText);

    const errorType =
      error.response?.status === 503
        ? "service_unavailable"
        : error.response?.status === 429
        ? "rate_limited"
        : "api_error";

    let fallbackResponse = generateResponse(stressScore, processedText);

    return {
      response: fallbackResponse,
      usingFallback: true,
      errorType,
    };
  }
};
