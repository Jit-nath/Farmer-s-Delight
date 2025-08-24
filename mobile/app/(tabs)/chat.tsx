import React, { useState, useCallback, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useUser } from "@/context/UserContext";
import { useRouter } from "expo-router";
import MessageBubble from "@/components/MessageBubble";

// Types
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

const API_BASE = process.env.EXPO_PUBLIC_BASE_URL;

// Socket connection
let socket: Socket | null = null;

// Connect to Flask-SocketIO server
const initializeSocket = () => {
  if (!socket) {
    socket = io(`${API_BASE}/chat`, {
      transports: ["polling", "websocket"], // Fallback to polling if websocket fails
      upgrade: false,
      rememberUpgrade: false,
      forceNew: true,
      autoConnect: true,
      timeout: 30000,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      console.log("✅ Connected to Flask-SocketIO /chat namespace");
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from Flask-SocketIO:", reason);
    });

    socket.on("connect_error", (err: any) => {
      // console.error("⚠️ Socket.IO connection error:", err);

      console.error("⚠️ Connection failed:", {
        message: err.message,
        type: err.type,
        description: err.description,
      });
    });

    socket.on("connection_response", (data) => {
      console.log("Connection response:", data);
    });
  }
  return socket;
};


// Main Chat Component
export default function Chat() {
  const { user, logout } = useUser();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState<string>("connecting");
  // const [sessionId, setSessionId] = useState<string>("");
  const scrollViewRef = useRef<ScrollView>(null);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // API Service
  const sendMessageToFlask = useCallback(
    async (
      message: string
      // sessionId?: string
    ): Promise<any> => {
      return new Promise((resolve, reject) => {
        const socketInstance = initializeSocket();

        if (!socketInstance.connected) {
          reject(new Error("Socket.IO not connected"));
          return;
        }

        // Set up one-time listener for response
        const responseHandler = (data: string) => {
          try {
            const response = typeof data === "string" ? JSON.parse(data) : data;
            resolve(response);
          } catch (err) {
            reject(err);
          } finally {
            socketInstance.off("message", responseHandler);
          }
        };

        // Listen for response
        socketInstance.on("message", responseHandler);

        // Set timeout
        const timeout = setTimeout(() => {
          socketInstance.off("message", responseHandler);
          reject(new Error("Request timeout"));
        }, 30000); // 30 seconds timeout

        // Clear timeout when response is received
        socketInstance.on("message", () => clearTimeout(timeout));

        // Send data to backend
        socketInstance.emit("message", {
          userID: user?.user_id || "unknown", // Replace with actual user ID
          // sessionId: sessionId || "new_session",
          context: message,
        });
      });
    },
    [user?.user_id]
  );

  // Initialize chat with welcome message
  useEffect(() => {
    const socketInstance = initializeSocket();

    // Update connection status
    socketInstance.on("connect", () => setConnectionStatus("connected"));
    socketInstance.on("disconnect", () => setConnectionStatus("disconnected"));
    socketInstance.on("connect_error", () => setConnectionStatus("error"));

    const welcomeMessage: Message = {
      id: "welcome",
      text: `Hello ${user?.name || user?.user_id
        }! I'm your AI Farming Assistant 🌾\n\nI can help you with:\n• Crop care and cultivation\n• Pest and disease control\n• Soil management and testing\n• Fertilizers and nutrients\n• Weather and irrigation guidance\n• Market insights and pricing\n\nWhat farming question can I help you with today?`,
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    // setSessionId(`session_${Date.now()}`);
    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
      socket = null;
    };
  }, [user]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({
      message,
    }: // sessionId,
      {
        message: string;
        // sessionId: string;
      }) => sendMessageToFlask(message /*,sessionId*/),
    onSuccess: (response) => {
      setMessages((prev) => {
        const withoutLoading = prev.filter((msg) => !msg.isLoading);
        return [
          ...withoutLoading,
          {
            id: `bot_${Date.now()}`,
            text:
              typeof response.answer === "object"
                ? response.answer.context
                : response.answer ||
                response.response ||
                "I apologize, but I had trouble understanding that. Could you please rephrase your question?",
            isUser: false,
            timestamp: new Date(),
          },
        ];
      });
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      // Remove loading message and add error message
      setMessages((prev) => {
        const withoutLoading = prev.filter((msg) => !msg.isLoading);
        return [
          ...withoutLoading,
          {
            id: `error_${Date.now()}`,
            text: "Sorry, I'm experiencing some technical difficulties. Please try again in a moment.",
            isUser: false,
            timestamp: new Date(),
          },
        ];
      });
    },
  });

  // Handle send message
  const handleSendMessage = useCallback(() => {
    if (inputText.trim().length === 0) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    const loadingMessage: Message = {
      id: `loading_${Date.now()}`,
      text: "",
      isUser: false,
      timestamp: new Date(),
      isLoading: true,
    };

    // Add user message and loading message
    setMessages((prev) => [...prev, userMessage, loadingMessage]);

    // Send to Flask API
    sendMessageMutation.mutate({
      message: inputText.trim(),
      // sessionId,
    });

    // Clear input
    setInputText("");

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [inputText, /*sessionId,*/ sendMessageMutation]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // adjust for header height
      >
        {/* Header */}
        <View className="bg-green-500 px-4 py-4 border-b border-green-600">
          <View className="flex-row items-center justify-center">
            <View
              className={`w-3 h-3 rounded-full mr-2 ${connectionStatus === "connected"
                  ? "bg-green-300"
                  : connectionStatus === "connecting"
                    ? "bg-yellow-300"
                    : "bg-red-300"
                }`}
            />
            <Text className="text-white text-lg font-bold">
              🤖 AI Farming Assistant
            </Text>
            <TouchableOpacity onPress={handleLogout} className="p-2">
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-green-100 text-center text-sm mt-1">
            {connectionStatus === "connected"
              ? `${user?.name}'s personal agricultural advisor`
              : `Status: ${connectionStatus}`}
          </Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </ScrollView>

        {/* Input Area */}
        <View className="border-t border-gray-200 bg-white px-4 py-3">
          <View className="flex-row items-center gap-2 space-x-3">
            <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-3">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask me anything about farming..."
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={500}
                className="text-gray-800 text-base max-h-24"
                onSubmitEditing={handleSendMessage}
                submitBehavior="blurAndSubmit"
              />
            </View>

            <View>
              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={
                  inputText.trim().length === 0 || sendMessageMutation.isPending
                }
                className={`w-12 h-12 rounded-full items-center justify-center ${inputText.trim().length > 0 && !sendMessageMutation.isPending
                    ? "bg-green-500"
                    : "bg-gray-300"
                  }`}
              >
                {sendMessageMutation.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="send" size={20} color="white" />
                )}
              </TouchableOpacity>
              {/* Character count */}
              <Text className="text-xs text-gray-400 text-center">
                {inputText.length}/500
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}