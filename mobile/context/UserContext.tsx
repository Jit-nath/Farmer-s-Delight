import React, { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
interface User {
  id: number;
  user_id: string;
  name: string;
  role: string;
  created_at: string;
}

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UserContextType extends UserState {
  login: (userId: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Actions
type UserAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "RESTORE_USER"; payload: User };

// Initial state
const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true to check stored user
  error: null,
};

// Reducer
function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "RESTORE_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    default:
      return state;
  }
}

// Context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider component
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // API base URL - replace with your server IP
  const API_BASE = process.env.EXPO_PUBLIC_BASE_URL;

  // Load user from storage on app start
  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        dispatch({ type: "RESTORE_USER", payload: user });
      } else {
        dispatch({ type: "LOGOUT" }); // No stored user, set loading to false
      }
    } catch (error) {
      console.error("Error loading stored user:", error);
      dispatch({ type: "LOGOUT" });
    }
  };

  const login = async (userId: string) => {
    dispatch({ type: "LOGIN_START" });

    try {
      const response = await fetch(`${API_BASE}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();

      if (data.success && data.user) {
        // Store user in AsyncStorage
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        dispatch({ type: "LOGIN_SUCCESS", payload: data.user });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      dispatch({ type: "LOGIN_FAILURE", payload: error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      dispatch({ type: "LOGOUT" });
    } catch (error) {
      console.error("Error during logout:", error);
      dispatch({ type: "LOGOUT" }); // Logout anyway
    }
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  return (
    <UserContext.Provider
      value={{
        ...state,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Hook to use the context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
