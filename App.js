import "./global.css";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "./app/context/authContext";
import { AppProvider } from "./app/context/appContext";
import AppNavigator from "./app/navigation/appNavigator";

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppProvider>
          <AppNavigator />
          <StatusBar style="light" />
        </AppProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
