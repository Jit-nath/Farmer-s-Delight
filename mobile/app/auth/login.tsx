import { useUser } from "@/context/UserContext";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { z } from "zod";

const userIdSchema = z
  .string()
  .min(4, "User ID must be at least 4 characters")
  .max(20, "Max 20 chars")
  .regex(/^TEST\d{3,}/, "ID must start with TEST and digits");

export default function LoginScreen() {
  const [userId, setUserId] = useState("");
  const [localError, setLocalError] = useState("");
  const { login, isLoading, error, clearError, isAuthenticated } = useUser();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)/chat");
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    // Clear previous errors
    setLocalError("");
    clearError();
    // Validate format
    const validation = userIdSchema.safeParse(userId.trim().toUpperCase());
    if (!validation.success) {
      setLocalError(validation.error.issues.map((e) => e.message).join("\n"));
      return;
    }

    try {
      await login(validation.data);
      // Router will automatically redirect via useEffect above
    } catch (error: any) {
      // Error is already set in context, but we can show an alert too
      Alert.alert("Login Failed", error.message);
    }
  };

  const displayError = localError || error;

  return (
    <View className="flex-1 bg-yellow-50 justify-center items-center px-6">
      {/* <Image
        source={require("@/assets/images/icon.png")}
        className="w-20 h-20 mb-6"
      /> */}
      <Text className="text-3xl text-center font-bold text-green-700 mb-2">
        Welcome to FarmDelight
      </Text>
      <Text className="text-base text-brown-600 mb-6">
        Enter your User ID to continue
      </Text>
      <TextInput
        className="h-auto w-11/12 border border-green-500 bg-white rounded-lg text-lg px-4 mb-2"
        placeholder="Enter User ID (e.g., TEST001)"
        value={userId}
        onChangeText={(text) => {
          setUserId(text);
          setLocalError(""); // Clear error when user types
          clearError();
        }}
        autoCapitalize="characters"
        autoCorrect={false}
        keyboardType="default"
        placeholderTextColor="#A1887F"
        editable={!isLoading}
      />
      {displayError && (
        <Text className="text-red-500 w-11/12 text-left mb-2 text-sm">
          {displayError}
        </Text>
      )}
      <TouchableOpacity
        className={`rounded-lg py-3 px-8 mt-2 shadow-sm ${
          isLoading ? "bg-gray-400" : "bg-green-600"
        }`}
        onPress={handleLogin}
        disabled={isLoading || !userId.trim()}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-lg font-bold tracking-wide">
            Login
          </Text>
        )}
      </TouchableOpacity>
      <View className="absolute bottom-6 left-0 right-0 items-center">
        <Text className="text-brown-700 text-sm italic">
          🌱 Powered by Smart Farming Tech 🌾
        </Text>
      </View>
    </View>
  );
}
