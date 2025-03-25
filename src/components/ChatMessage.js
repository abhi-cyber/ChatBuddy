import React from "react";
import {View, Text, StyleSheet, Image} from "react-native";

const ChatMessage = ({message}) => {
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
        ]}>
        <Text
          style={[
            styles.messageText,
            isBot ? styles.botText : styles.userText,
          ]}>
          {message.text}
        </Text>

        <View style={styles.messageTimeContainer}>
          <Text style={styles.messageTime}>
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
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
});

export default ChatMessage;
