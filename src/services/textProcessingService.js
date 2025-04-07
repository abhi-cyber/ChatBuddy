import {STOP_WORDS} from "../utils/constants";

export const preprocess = (text) => {
  if (!text) return [];

  // Convert to lowercase and remove punctuation
  const processed = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Split into words and filter out stop words
  const words = processed
    .split(" ")
    .filter((word) => !STOP_WORDS.includes(word));

  return words;
};
