import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { apiRequest } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function Login({ navigation }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  if (!phone) {
    alert("Enter phone number");
    return;
  }

  try {
    setLoading(true);

    const res = await apiRequest("/auth/wholesaler/login", "POST", { phone });

    console.log("LOGIN RESPONSE 👉", res);

    // save auth data
    await AsyncStorage.setItem("token", res.token);
    await AsyncStorage.setItem("wholesalerId", res.wholesalerId);

    // redirect logic
    if (res.isProfileCompleted) {
      navigation.replace("home");
    } else {
      navigation.replace("profile");
    }

  } catch (error) {
    console.log("LOGIN ERROR 👉", error);
    alert(error?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wholesaler Login</Text>

      <TextInput
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
