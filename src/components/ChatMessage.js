import React from "react";
import {View, Text, StyleSheet, Image} from "react-native";

const ChatMessage = ({
  message,
  isFallback,
  isSystemMessage,
  personaStyles = {},
}) => {
  const isBot = message.sender === "bot";

  return (
    <View
      style={[
        styles.messageContainer,
        isBot ? styles.botMessageContainer : styles.userMessageContainer,
      ]}>
      {isBot && (
        <Image
          source={require("../assets/bot-avatar.png")}
          style={styles.avatarSmall}
          defaultSource={require("../assets/default-avatar.png")}
        />
      )}

      <View
        style={[
          styles.messageBubble,
          isBot ? styles.botBubble : styles.userBubble,
          isSystemMessage && styles.systemMessageBubble,
          isFallback && styles.fallbackBubble,
          // Add persona-specific styles if provided
          isBot &&
            personaStyles.bubbleColor && {
              backgroundColor: personaStyles.bubbleColor,
            },
        ]}>
        <Text
          style={[
            styles.messageText,
            isBot ? styles.botText : styles.userText,
            isSystemMessage && styles.systemMessageText,
            // Add persona-specific text color if provided
            isBot &&
              personaStyles.textColor && {color: personaStyles.textColor},
          ]}>
          {message.text}
          {isFallback && !message.text.includes("backup") && (
            <Text style={styles.fallbackIndicator}> 🤔</Text>
          )}
        </Text>

        <View style={styles.messageTimeContainer}>
          <Text style={styles.messageTime}>
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {isFallback && (
              <Text style={styles.fallbackTag}> · Backup Mode</Text>
            )}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  botMessageContainer: {
    justifyContent: "flex-start",
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: "75%",
  },
  botBubble: {
    backgroundColor: "#F0F0F0",
    borderBottomLeftRadius: 4,
    marginLeft: 8,
  },
  userBubble: {
    backgroundColor: "#FF6B8A",
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  botText: {
    color: "#333333",
  },
  userText: {
    color: "#FFFFFF",
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFC1D2", // Fallback color
  },
  messageTimeContainer: {
    alignItems: "flex-end",
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    color: "#999999",
  },
  fallbackBubble: {
    backgroundColor: "#FFF8E1",
  },
  fallbackIndicator: {
    fontSize: 14,
  },
  fallbackTag: {
    fontSize: 9,
    fontStyle: "italic",
    color: "#FF9800",
  },
  systemMessageBubble: {
    backgroundColor: "#E3F2FD",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#90CAF9",
  },
  systemMessageText: {
    color: "#1976D2",
    fontStyle: "italic",
  },
});

export default ChatMessage;
