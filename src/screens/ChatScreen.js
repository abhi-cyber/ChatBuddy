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
  SafeAreaView,
  Alert,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useBottomTabBarHeight} from "@react-navigation/bottom-tabs";
import {LinearGradient} from "expo-linear-gradient";
import {
  processChatbotResponse,
  isApiAvailable,
} from "../services/chatbotService";
import {getCurrentPersona, resetConversation} from "../services/geminiService";
import ChatMessage from "../components/ChatMessage";
import TypingIndicator from "../components/TypingIndicator";

// Enhanced quick replies that cover common mental health topics
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
  const [apiStatus, setApiStatus] = useState("online"); // possible values: "online", "offline", "connecting"
  const [showStatusBanner, setShowStatusBanner] = useState(false);
  const [apiErrorCount, setApiErrorCount] = useState(0);
  const [lastApiCheck, setLastApiCheck] = useState(0);
  const flatListRef = useRef(null);
  const quickRepliesRef = useRef(null);
  const currentPersona = getCurrentPersona();

  // Initialize messages with the current persona's greeting
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

  // Check API status periodically
  useEffect(() => {
    // Function to check API status
    const checkApiStatus = async () => {
      try {
        // Only check every 15 seconds at most to avoid excessive calls
        const now = Date.now();
        if (now - lastApiCheck < 15000) {
          return;
        }

        setLastApiCheck(now);
        const status = await isApiAvailable();

        // If status changed, update UI
        if (status !== (apiStatus === "online")) {
          setApiStatus(status ? "online" : "offline");
          setShowStatusBanner(!status);

          // Reset error count when API comes back online
          if (status) {
            setApiErrorCount(0);
          }
        }
      } catch (error) {
        console.error("Error checking API status:", error);
      }
    };

    // Check immediately on mount
    checkApiStatus();

    // Then check periodically - more frequently when we know there are issues
    const interval = setInterval(
      checkApiStatus,
      apiStatus === "offline" ? 15000 : 60000 // Check more often when offline
    );

    return () => clearInterval(interval);
  }, [apiStatus, lastApiCheck]);

  // Handle retry when API is down
  const handleRetryConnection = async () => {
    setApiStatus("connecting");
    try {
      // Show feedback to user about the retry
      const reconnectMessage = {
        id: Date.now().toString(),
        text: "Trying to reconnect to the server... 🔄",
        sender: "bot",
        isSystemMessage: true,
      };
      setMessages((prevMessages) => [...prevMessages, reconnectMessage]);

      // Use a shorter timeout for the retry attempt
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout")), 6000)
      );

      // Create the actual check promise
      const checkPromise = isApiAvailable();

      // Race them to handle timeouts more gracefully
      const isAvailable = await Promise.race([checkPromise, timeoutPromise]);

      setApiStatus(isAvailable ? "online" : "offline");
      setShowStatusBanner(!isAvailable);

      if (isAvailable) {
        // Show success message
        const reconnectedMessage = {
          id: Date.now().toString() + "-success",
          text: "Connection restored! I'm back online and ready to chat! 🧠✨",
          sender: "bot",
          isSystemMessage: true,
        };
        setMessages((prevMessages) => [...prevMessages, reconnectedMessage]);
      } else {
        // Show failure message
        const failedMessage = {
          id: Date.now().toString() + "-failed",
          text: "Still having trouble connecting to the server. I'll continue using my backup mode for now. 🧩",
          sender: "bot",
          isSystemMessage: true,
        };
        setMessages((prevMessages) => [...prevMessages, failedMessage]);
      }
    } catch (error) {
      console.error("Error retrying connection:", error);
      setApiStatus("offline");

      // Show error message - customize based on error type
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

    // Show typing indicator with realistic timing
    setIsTyping(true);

    try {
      // Add more detailed logging for debugging
      console.log(
        "Sending message to chatbot:",
        text.substring(0, 50) + (text.length > 50 ? "..." : "")
      );

      // Process the message with updated Gemini API
      const startTime = Date.now();
      const {
        response: botResponse,
        usingFallback,
        errorType,
      } = await processChatbotResponse(text);
      const responseTime = Date.now() - startTime;

      console.log(
        `Response received in ${responseTime}ms:`,
        botResponse.substring(0, 50) + (botResponse.length > 50 ? "..." : "")
      );

      // Update API status if we got a fallback response
      if (usingFallback) {
        // Increment error count for consecutive failures
        setApiErrorCount((prev) => prev + 1);

        if (apiStatus !== "offline") {
          setApiStatus("offline");
          setShowStatusBanner(true);
        }

        // If we have specific 503 errors, show a more informative system message
        if (errorType === "service_unavailable" && apiErrorCount === 0) {
          const serviceUnavailableMessage = {
            id: `service-unavailable-${Date.now()}`,
            text: "Looks like my cloud brain is taking a short break. I'll use my backup mode until it's back! 🧠💤",
            sender: "bot",
            isSystemMessage: true,
          };
          setMessages((prev) => [...prev, serviceUnavailableMessage]);
        }
        // If we've seen 5+ consecutive errors, show a more prominent notice
        else if (apiErrorCount >= 5 && apiErrorCount % 5 === 0) {
          // This will create a distinct system message every 5 errors
          const apiIssueMessage = {
            id: `api-error-${Date.now()}`,
            text: "I'm still having trouble connecting to my main brain. No worries though - my backup mode works great too! 🧠💫",
            sender: "bot",
            isSystemMessage: true,
          };
          // Insert this message before the actual response
          setMessages((prev) => [...prev, apiIssueMessage]);
        }
      } else if (apiStatus !== "online") {
        setApiStatus("online");
        setShowStatusBanner(false);
        setApiErrorCount(0);
      }

      // Add a minimum delay to make typing seem natural
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
      console.error("Error in chat handling:", error);

      // Log more details about the error
      if (error.response) {
        console.error("API Error Status:", error.response.status);
        console.error("API Error Data:", JSON.stringify(error.response.data));
      }

      // Handle errors gracefully
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

    // Scroll the quick replies to the start
    if (quickRepliesRef.current) {
      quickRepliesRef.current.scrollTo({x: 0, animated: true});
    }
  };

  // Add new function to handle persona change
  const handleChangePersona = () => {
    // Ask for confirmation before changing
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
            // Reset the conversation for the current persona before changing
            resetConversation();
            onChangePersona();
          },
        },
      ]
    );
  };

  // Map persona names to match home screen
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}>
        <LinearGradient
          colors={["#6C5CE7", "#8B5CF6"]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.header}>
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

        {/* API Status Banner */}
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
          contentContainerStyle={styles.messageListContent}
          onLayout={() => flatListRef.current?.scrollToEnd({animated: true})}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />

        {/* Quick replies section */}
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

        {/* Enhanced message input section */}
        <View
          style={[
            styles.inputSection,
            {
              paddingBottom: tabBarHeight,
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
