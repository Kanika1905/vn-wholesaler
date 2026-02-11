import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "../screens/login";
import Home from "../screens/home";
import Profile from "../screens/profile";
import AddProduct from "../screens/addProduct";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="login" component={Login} />
      <Stack.Screen name="home" component={Home} />
      <Stack.Screen name="profile" component={Profile} />
      <Stack.Screen name="addProduct" component={AddProduct} />
    </Stack.Navigator>
  );
}