import {
  LOW_STRESS_RESPONSES,
  MEDIUM_STRESS_RESPONSES,
  HIGH_STRESS_RESPONSES,
  GREETING_WORDS,
  FAREWELL_WORDS,
} from "../utils/constants";

/**
 * Get a random response from the appropriate category
 * @param {number} stressScore - Detected stress level (0-10)
 * @param {string[]} processedText - Processed user input for context
 * @returns {string} - An appropriate response
 */
export const generateResponse = (stressScore, processedText) => {
  // Check for greetings or farewells first
  if (processedText.some((word) => GREETING_WORDS.includes(word))) {
    return "Hey there! I'm here to chat about whatever's on your mind. How are you feeling today?";
  }

  if (processedText.some((word) => FAREWELL_WORDS.includes(word))) {
    return "Take care! Remember I'm here whenever you need to talk. Stay awesome!";
  }

  // Select response based on stress score
  let responseArray;
  if (stressScore <= 3) {
    responseArray = LOW_STRESS_RESPONSES;
  } else if (stressScore <= 6) {
    responseArray = MEDIUM_STRESS_RESPONSES;
  } else {
    responseArray = HIGH_STRESS_RESPONSES;
  }

  // Return random response from appropriate category
  return responseArray[Math.floor(Math.random() * responseArray.length)];
};
