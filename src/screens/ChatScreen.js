import React, {useState, useRef, useEffect} from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import {processChatbotResponse} from "../services/chatbotService";
import ChatMessage from "../components/ChatMessage";
import TypingIndicator from "../components/TypingIndicator";

const QUICK_REPLIES = [
  "I'm not vibing rn 😞",
  "Just stressed about school 📚",
  "Need someone to talk to 💭",
  "Having anxiety today 😰",
];

const ChatScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hey bestie! I'm here to vibe with you and chat about whatever's on your mind. How are you feeling today? 💫",
      sender: "bot",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);
  const quickRepliesRef = useRef(null);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  }, [messages]);

  const handleSend = (text = inputText) => {
    if (text.trim() === "") return;

    const userMessage = {
      id: Date.now().toString(),
      text: text,
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText("");

    // Show typing indicator
    setIsTyping(true);

    // Random delay between 1.2 and 2.5 seconds to simulate typing
    const typingDelay = Math.random() * 1300 + 1200;

    setTimeout(() => {
      const botResponse = processChatbotResponse(text);
      setIsTyping(false);

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    }, typingDelay);
  };

  const handleQuickReply = (reply) => {
    handleSend(reply);

    // Scroll the quick replies to the start
    if (quickRepliesRef.current) {
      quickRepliesRef.current.scrollTo({x: 0, animated: true});
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}>
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Image
            source={require("../assets/bot-avatar.png")}
            style={styles.avatar}
            defaultSource={require("../assets/default-avatar.png")}
          />
          <View>
            <Text style={styles.botName}>GenZ Therapist</Text>
            <Text style={styles.botStatus}>Always here to vibe ✨</Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({item}) => <ChatMessage message={item} />}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        onLayout={() => flatListRef.current.scrollToEnd({animated: true})}
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
      />

      <ScrollView
        ref={quickRepliesRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickRepliesContainer}>
        {QUICK_REPLIES.map((reply, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickReplyButton}
            onPress={() => handleQuickReply(reply)}>
            <Text style={styles.quickReplyText}>{reply}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Message your bestie..."
          placeholderTextColor="#A0A0A0"
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={() => handleSend()}
          disabled={!inputText.trim()}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#FF6B8A",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#FFC1D2", // Fallback color
  },
  botName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  botStatus: {
    color: "white",
    fontSize: 12,
    opacity: 0.8,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 15,
    paddingBottom: 20,
  },
  quickRepliesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
  quickReplyButton: {
    backgroundColor: "#FFF0F5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FF6B8A",
    marginRight: 10,
  },
  quickReplyText: {
    color: "#FF6B8A",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "white",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#FF6B8A",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: "#FFBFCD",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ChatScreen;
