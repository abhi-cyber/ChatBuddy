import React from "react";
import {View, Text, StyleSheet} from "react-native";

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
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{isSystemMessage ? "🔔" : "🤖"}</Text>
        </View>
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
    paddingVertical: 12,
    maxWidth: "75%",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  botBubble: {
    backgroundColor: "#F0F0F0",
    borderBottomLeftRadius: 4,
    marginLeft: 8,
  },
  userBubble: {
    backgroundColor: "#6C5CE7",
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
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E4E0FF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
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
