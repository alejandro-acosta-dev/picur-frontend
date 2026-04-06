import { getAllChats } from "@/services/chatHistory.service";
import { createQuestion } from "@/services/openAi.service";
import { ChatMessage } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator, FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View
} from "react-native";

export default function ChatAIScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // ✅ Cargar historial
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllChats();
        setMessages(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Auto scroll cuando llegan mensajes
  useEffect(() => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages]);

  // ✅ Auto scroll cuando abre teclado
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    });

    return () => showSub.remove();
  }, []);

  const handleQuestion = async () => {
  if (message.trim() === "") return;

  const currentMessage = message;

  const newMessageUser: ChatMessage = {
    role: "user",
    content: currentMessage,
    createdAt: new Date().toISOString(),
  };

  setMessages((prev) => [...prev, newMessageUser]);
  setMessage("");
  setLoading(true);

  try {
    const response = await createQuestion(currentMessage);

    const newMessageAssistant: ChatMessage = {
      role: "assistant",
      content: response,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessageAssistant]);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* 🧠 Header */}
            <View style={styles.header}>
              <Ionicons name="hardware-chip" size={22} color="white" />

              <View>
                <Text style={styles.headerTitle}>FrigoSafe AI</Text>
                <Text style={styles.headerSubtitle}>
                  Asistente térmico inteligente
                </Text>
              </View>
            </View>

            {/* 💬 Mensajes */}
            <FlatList
              ref={flatListRef}
              data={messages}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item, index) =>
                item.createdAt
                  ? item.createdAt + index
                  : index.toString()
              }
              contentContainerStyle={styles.messagesContainer}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              onLayout={() =>
                flatListRef.current?.scrollToEnd({ animated: false })
              }
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.messageBubble,
                    item.role === "assistant"
                      ? styles.aiBubble
                      : styles.userBubble,
                  ]}
                >
                  <Text style={styles.messageText}>{item.content}</Text>
                </View>
              )}
            />

            {loading && (
  <View style={styles.typingBubble}>
    <ActivityIndicator size="small" color="#2563eb" />
  </View>
)}

            {/* ⌨️ Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Mensaje"
                placeholderTextColor="#9ca3af"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={1}
                textAlignVertical="center"
              />

              <Pressable
                style={styles.sendButton}
                onPress={handleQuestion}
              >
                <Ionicons name="send" size={18} color="white" />
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    backgroundColor: "#111827",
  },

  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  headerSubtitle: {
    color: "#9ca3af",
    fontSize: 12,
  },

  messagesContainer: {
    padding: 20,
    gap: 10,
  },

  messageBubble: {
    padding: 14,
    borderRadius: 14,
    maxWidth: "85%",
    marginBottom: 10,
  },

  aiBubble: {
    backgroundColor: "#1f2937",
    alignSelf: "flex-start",
  },

  userBubble: {
    backgroundColor: "#2563eb",
    alignSelf: "flex-end",
  },

  messageText: {
    color: "white",
    fontSize: 15,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#111827",
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
    gap: 10,
  },

  input: {
    flex: 1,
    backgroundColor: "#1f2937",
    color: "white",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    maxHeight: 100,
  },

  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },

  typingBubble: {
  alignSelf: "flex-start",
  backgroundColor: "#1f2937",
  paddingHorizontal: 18,
  paddingVertical: 14,
  borderRadius: 18,
  marginLeft: 20,
  marginBottom: 10,
},
});