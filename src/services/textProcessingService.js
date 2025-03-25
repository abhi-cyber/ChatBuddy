import {STOP_WORDS} from "../utils/constants";

/**
 * Preprocesses text input similar to NLTK processes
 * @param {string} text - User input text
 * @returns {string[]} Array of processed words
 */
export const preprocess = (text) => {
  if (!text) return [];

  // Convert to lowercase
  const lowercaseText = text.toLowerCase();

  // Remove punctuation and split into words
  const tokenized = lowercaseText
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .split(/\s+/);

  // Remove stop words
  const filteredWords = tokenized.filter(
    (word) => !STOP_WORDS.includes(word) && word.length > 1
  );

  return filteredWords;
};
