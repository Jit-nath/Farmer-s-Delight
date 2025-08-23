import LoginScreen from "@/app/auth/login";
import { useUser } from "@/context/UserContext";
import React from "react";
import { View, Text, ActivityIndicator } from "react-native";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-yellow-50">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="mt-4 text-green-700 text-lg">Loading AgroAI...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}
