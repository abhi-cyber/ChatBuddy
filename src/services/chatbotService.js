import {preprocess} from "./textProcessingService";
import {generateResponse} from "./responseService";
import {
  STRESS_KEYWORDS,
  ANXIETY_KEYWORDS,
  DEPRESSION_KEYWORDS,
} from "../utils/constants";

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
 * Process user input and generate appropriate response
 * @param {string} userInput - Raw user message text
 * @returns {string} - Chatbot response
 */
export const processChatbotResponse = (userInput) => {
  const processedText = preprocess(userInput);
  const stressScore = detectStress(processedText);
  return generateResponse(stressScore, processedText);
};
