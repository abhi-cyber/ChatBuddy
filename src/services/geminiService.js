import axios from "axios";
import config from "../config/environment";
import {PERSONA_DETAILS, DEFAULT_PERSONA} from "../utils/personaConstants";

const API_KEY = config.GEMINI_API_KEY;
const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

let currentPersona = DEFAULT_PERSONA;
let conversationHistories = {};

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

const MAX_CONVERSATION_LENGTH = 10;

const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;
const RETRY_DELAY_MAX = 10000;

const delay = (retryCount) => {
  const exponentialDelay = Math.min(
    RETRY_DELAY_MAX,
    RETRY_DELAY_BASE * Math.pow(2, retryCount)
  );
  const jitter = exponentialDelay * 0.3 * Math.random();
  return new Promise((resolve) =>
    setTimeout(resolve, exponentialDelay + jitter)
  );
};

export const setPersona = (personaType) => {
  if (PERSONA_DETAILS[personaType]) {
    currentPersona = personaType;
  } else {
    currentPersona = DEFAULT_PERSONA;
  }
};

export const getCurrentPersona = () => {
  return PERSONA_DETAILS[currentPersona];
};

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

export const generateGeminiResponse = async (userMessage) => {
  let retries = 0;
  const conversationHistory = conversationHistories[currentPersona];

  while (retries <= MAX_RETRIES) {
    try {
      conversationHistory.push({role: "user", parts: [{text: userMessage}]});

      if (conversationHistory.length > MAX_CONVERSATION_LENGTH) {
        conversationHistory = [
          conversationHistory[0],
          conversationHistory[1],
          ...conversationHistory.slice(-(MAX_CONVERSATION_LENGTH - 2)),
        ];
      }

      conversationHistories[currentPersona] = conversationHistory;

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
          timeout: 15000,
        }
      );

      const responseText = response.data.candidates[0].content.parts[0].text;

      conversationHistory.push({role: "model", parts: [{text: responseText}]});
      conversationHistories[currentPersona] = conversationHistory;

      return responseText;
    } catch (error) {
      const status = error.response?.status;

      if (error.response) {
        // Keep this error information for production troubleshooting
      }

      if (status === 503 || status >= 500) {
        if (retries < MAX_RETRIES) {
          retries++;
          const waitTime = await delay(retries);
          continue;
        }
      } else if (status === 429) {
        if (retries < MAX_RETRIES) {
          retries++;
          await new Promise((resolve) =>
            setTimeout(resolve, 3000 + retries * 2000)
          );
          continue;
        }
      } else if (status === 400) {
        if (retries < MAX_RETRIES) {
          retries++;
          continue;
        }
      }

      throw error;
    }
  }
  throw new Error("Max retries exceeded");
};

export const analyzeSentiment = async (text) => {
  const prompt = `Analyze the sentiment in this message: "${text}". 
  Reply with only ONE of these exact words: very_sad, sad, neutral, good, very_good`;

  let retries = 0;
  while (retries <= MAX_RETRIES) {
    try {
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
          timeout: 8000,
        }
      );

      const mood = response.data.candidates[0].content.parts[0].text
        .trim()
        .toLowerCase();

      const validMoods = ["very_sad", "sad", "neutral", "good", "very_good"];
      const detectedMood =
        validMoods.find((m) => mood.includes(m)) || "neutral";

      return {mood: detectedMood};
    } catch (error) {
      const status = error.response?.status;

      if ((status === 503 || status >= 500) && retries < MAX_RETRIES) {
        retries++;
        const waitTime = await delay(retries);
        continue;
      }

      return {mood: "neutral"};
    }
  }

  return {mood: "neutral"};
};
