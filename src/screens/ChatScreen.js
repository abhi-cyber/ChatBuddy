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
  Alert,
} from "react-native";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import {useBottomTabBarHeight} from "@react-navigation/bottom-tabs";
import {LinearGradient} from "expo-linear-gradient";
import {
  processChatbotResponse,
  isApiAvailable,
} from "../services/chatbotService";
import {getCurrentPersona, resetConversation} from "../services/geminiService";
import ChatMessage from "../components/ChatMessage";
import TypingIndicator from "../components/TypingIndicator";

const QUICK_REPLIES = [
  "I'm feeling down today 😞",
  "Just stressed about work 📚",
  "Need someone to talk to 💭",
  "Feeling anxious 😰",
  "Had a great day today! ✨",
  "How can I manage stress? 🧘‍♀️",
];

const ChatScreen = ({onChangePersona}) => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [apiStatus, setApiStatus] = useState("online");
  const [showStatusBanner, setShowStatusBanner] = useState(false);
  const [apiErrorCount, setApiErrorCount] = useState(0);
  const [lastApiCheck, setLastApiCheck] = useState(0);
  const flatListRef = useRef(null);
  const quickRepliesRef = useRef(null);
  const currentPersona = getCurrentPersona();

  useEffect(() => {
    setMessages([
      {
        id: "1",
        text: currentPersona.initialMessage,
        sender: "bot",
      },
    ]);
  }, [currentPersona]);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  }, [messages]);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const now = Date.now();
        if (now - lastApiCheck < 15000) {
          return;
        }

        setLastApiCheck(now);
        const status = await isApiAvailable();

        if (status !== (apiStatus === "online")) {
          setApiStatus(status ? "online" : "offline");
          setShowStatusBanner(!status);

          if (status) {
            setApiErrorCount(0);
          }
        }
      } catch (error) {
        // Keep essential error logging
      }
    };

    checkApiStatus();

    const interval = setInterval(
      checkApiStatus,
      apiStatus === "offline" ? 15000 : 60000
    );

    return () => clearInterval(interval);
  }, [apiStatus, lastApiCheck]);

  const handleRetryConnection = async () => {
    setApiStatus("connecting");
    try {
      const reconnectMessage = {
        id: Date.now().toString(),
        text: "Trying to reconnect to the server... 🔄",
        sender: "bot",
        isSystemMessage: true,
      };
      setMessages((prevMessages) => [...prevMessages, reconnectMessage]);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout")), 6000)
      );

      const checkPromise = isApiAvailable();

      const isAvailable = await Promise.race([checkPromise, timeoutPromise]);

      setApiStatus(isAvailable ? "online" : "offline");
      setShowStatusBanner(!isAvailable);

      if (isAvailable) {
        const reconnectedMessage = {
          id: Date.now().toString() + "-success",
          text: "Connection restored! I'm back online and ready to chat! 🧠✨",
          sender: "bot",
          isSystemMessage: true,
        };
        setMessages((prevMessages) => [...prevMessages, reconnectedMessage]);
      } else {
        const failedMessage = {
          id: Date.now().toString() + "-failed",
          text: "Still having trouble connecting to the server. I'll continue using my backup mode for now. 🧩",
          sender: "bot",
          isSystemMessage: true,
        };
        setMessages((prevMessages) => [...prevMessages, failedMessage]);
      }
    } catch (error) {
      setApiStatus("offline");

      const errorMessage = {
        id: Date.now().toString() + "-error",
        text:
          error.message === "Connection timeout"
            ? "The server is taking too long to respond. I'll keep using my backup brain for now. 🕒"
            : "Sorry, I couldn't reconnect to the server. I'll keep working with my backup brain for now. 🔌",
        sender: "bot",
        isSystemMessage: true,
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  const handleSend = async (text = inputText) => {
    if (text.trim() === "") return;

    const userMessage = {
      id: Date.now().toString(),
      text: text,
      sender: "user",
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText("");

    setIsTyping(true);

    try {
      const startTime = Date.now();
      const {
        response: botResponse,
        usingFallback,
        errorType,
      } = await processChatbotResponse(text);
      const responseTime = Date.now() - startTime;

      if (usingFallback) {
        setApiErrorCount((prev) => prev + 1);

        if (apiStatus !== "offline") {
          setApiStatus("offline");
          setShowStatusBanner(true);
        }

        if (errorType === "service_unavailable" && apiErrorCount === 0) {
          const serviceUnavailableMessage = {
            id: `service-unavailable-${Date.now()}`,
            text: "Looks like my cloud brain is taking a short break. I'll use my backup mode until it's back! 🧠💤",
            sender: "bot",
            isSystemMessage: true,
          };
          setMessages((prev) => [...prev, serviceUnavailableMessage]);
        } else if (apiErrorCount >= 5 && apiErrorCount % 5 === 0) {
          const apiIssueMessage = {
            id: `api-error-${Date.now()}`,
            text: "I'm still having trouble connecting to my main brain. No worries though - my backup mode works great too! 🧠💫",
            sender: "bot",
            isSystemMessage: true,
          };
          setMessages((prev) => [...prev, apiIssueMessage]);
        }
      } else if (apiStatus !== "online") {
        setApiStatus("online");
        setShowStatusBanner(false);
        setApiErrorCount(0);
      }

      const minTypingTime = 800;
      if (responseTime < minTypingTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minTypingTime - responseTime)
        );
      }

      setIsTyping(false);

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        isFallback: usingFallback,
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      // Keep essential error handling

      setIsTyping(false);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having a moment. Can we try again?",
        sender: "bot",
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  };

  const handleQuickReply = (reply) => {
    handleSend(reply);

    if (quickRepliesRef.current) {
      quickRepliesRef.current.scrollTo({x: 0, animated: true});
    }
  };

  const handleChangePersona = () => {
    Alert.alert(
      "Change your companion?",
      "This will reset your current conversation.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Change",
          onPress: () => {
            resetConversation();
            onChangePersona();
          },
        },
      ]
    );
  };

  const getPersonaName = (originalName) => {
    const nameMap = {
      "Best Friend": "Supportive Friend",
      "Empathetic Listener": "Empathetic Listener",
      "Motivational Coach": "Motivational Coach",
    };
    return nameMap[originalName] || originalName;
  };

  const displayPersonaName = getPersonaName(currentPersona.name);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}>
        <LinearGradient
          colors={["#6C5CE7", "#8B5CF6"]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={[styles.header, {paddingTop: Math.max(15, insets.top)}]}>
          <View style={styles.profileContainer}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarEmoji}>
                {displayPersonaName === "Supportive Friend"
                  ? "🤗"
                  : displayPersonaName === "Empathetic Listener"
                  ? "💖"
                  : "💪"}
              </Text>
            </View>
            <View>
              <Text style={styles.botName}>{displayPersonaName}</Text>
              <Text style={styles.botStatus}>
                {apiStatus === "online"
                  ? "Online and ready to chat ✨"
                  : apiStatus === "connecting"
                  ? "Connecting..."
                  : "Using backup mode 🧠"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.changePersonaButton}
            onPress={handleChangePersona}>
            <Text style={styles.changePersonaText}>Change</Text>
          </TouchableOpacity>
        </LinearGradient>

        {showStatusBanner && (
          <TouchableOpacity
            style={[
              styles.statusBanner,
              apiStatus === "connecting"
                ? styles.statusConnecting
                : styles.statusOffline,
            ]}
            onPress={handleRetryConnection}>
            <Text style={styles.statusText}>
              {apiStatus === "connecting"
                ? "Reconnecting to the server..."
                : apiErrorCount > 10
                ? "The server might be down for maintenance. Using backup mode for now."
                : "I'm using my backup brain! Tap to try reconnecting."}
            </Text>
          </TouchableOpacity>
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({item}) => (
            <ChatMessage
              message={item}
              isFallback={item.isFallback}
              isSystemMessage={item.isSystemMessage}
              personaStyles={{
                bubbleColor:
                  item.sender === "bot"
                    ? currentPersona.bubbleColor
                    : undefined,
                textColor:
                  item.sender === "bot" ? currentPersona.textColor : undefined,
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={[
            styles.messageListContent,
            {paddingBottom: insets.bottom},
          ]}
          onLayout={() => flatListRef.current?.scrollToEnd({animated: true})}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />

        <View style={styles.quickRepliesSection}>
          <Text style={styles.quickRepliesLabel}>Suggested topics:</Text>
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
        </View>

        <View
          style={[
            styles.inputSection,
            {
              paddingBottom: Math.max(12, tabBarHeight + insets.bottom),
              paddingLeft: Math.max(12, insets.left),
              paddingRight: Math.max(12, insets.right),
            },
          ]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message here..."
              placeholderTextColor="#A0A0A0"
              multiline
              maxHeight={80}
              returnKeyType="send"
              onSubmitEditing={() => inputText.trim() && handleSend()}
              blurOnSubmit={false}
              accessibilityLabel="Message input field"
              accessibilityHint="Type your message and press send"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim()}
              accessibilityLabel="Send message"
              accessibilityHint="Press to send your message">
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  botName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  botStatus: {
    color: "white",
    fontSize: 12,
    opacity: 0.9,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 15,
    paddingBottom: 20,
  },
  quickRepliesSection: {
    backgroundColor: "#FFFFFF",
    paddingTop: 8,
    paddingBottom: 5,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  quickRepliesLabel: {
    fontSize: 12,
    color: "#666",
    marginLeft: 15,
    marginBottom: 5,
    fontWeight: "500",
  },
  quickRepliesContainer: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    flexDirection: "row",
  },
  quickReplyButton: {
    backgroundColor: "#F0E6FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#6C5CE7",
    marginRight: 10,
  },
  quickReplyText: {
    color: "#6C5CE7",
    fontWeight: "500",
  },
  inputSection: {
    backgroundColor: "white",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    fontSize: 16,
    color: "#333",
    paddingHorizontal: 8,
  },
  sendButton: {
    backgroundColor: "#6C5CE7",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
    elevation: 2,
    shadowColor: "#6C5CE7",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  sendButtonDisabled: {
    backgroundColor: "#A29BFE",
    opacity: 0.7,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "600",
  },
  statusBanner: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    margin: 8,
  },
  statusOffline: {
    backgroundColor: "#FFF3CD",
    borderWidth: 1,
    borderColor: "#FFE69C",
  },
  statusConnecting: {
    backgroundColor: "#D1ECF1",
    borderWidth: 1,
    borderColor: "#BEE5EB",
  },
  statusText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
  changePersonaButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  changePersonaText: {
    color: "white",
    fontSize: 13,
    fontWeight: "500",
  },
});

export default ChatScreen;
