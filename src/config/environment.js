import {GEMINI_API_KEY, CHAT_CONFIG} from "../utils/env";

export default {
  GEMINI_API_KEY,

  // Firebase configuration is already in firebaseService.js

  // Chatbot configuration
  CHAT: {
    MAX_CONVERSATION_LENGTH: CHAT_CONFIG.maxConversationLength,
    DEFAULT_TEMPERATURE: CHAT_CONFIG.defaultTemperature,
    MAX_TOKENS: CHAT_CONFIG.maxTokens,
  },
};
