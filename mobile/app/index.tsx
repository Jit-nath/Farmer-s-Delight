import { Redirect } from "expo-router";
import { useUser } from "@/context/UserContext";
import { ActivityIndicator, View, Text } from "react-native";

export default function Index() {
  const { isAuthenticated, isLoading } = useUser();

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-yellow-50">
        <ActivityIndicator size="large" color="#16a34a" />
        <Text className="mt-4 text-green-700 text-lg">Loading AgroAI...</Text>
      </View>
    );
  }

  // Redirect based on auth status
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/chat" />;
  } else {
    return <Redirect href="/auth/login" />;
  }
}
