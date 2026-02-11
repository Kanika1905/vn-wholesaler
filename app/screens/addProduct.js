import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { apiRequest } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UNITS = ["kg", "litre", "pcs", "box", "dozen"];

export default function AddProduct({ navigation }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("kg");
  const [loading, setLoading] = useState(false);

  const handleAddProduct = async () => {
    if (!name || !price || !quantity || !unit) {
      alert("Please fill name, price, quantity and unit.");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        alert("Login expired. Please login again.");
        return;
      }

      // wholesalerId comes from auth middleware on backend (req.user.id)
      // categoryId — using a placeholder until you build category selection
      const res = await apiRequest(
        "/wholesaler/products",
        "POST",
        {
          name,
          price: parseFloat(price),
          quantity: parseFloat(quantity),
          description,
          unit,
          categoryId: "000000000000000000000000", // placeholder — replace when categories are ready
        },
        token
      );

      if (res?.success || res?._id || res?.product) {
        alert("Product added!");
        navigation.navigate("home");
      } else {
        alert(res?.message || "Failed to add product");
      }
    } catch (error) {
      console.log("ADD PRODUCT ERROR 👉", error);
      alert(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Add Product</Text>
            <Text style={styles.headerSub}>Fill in product details</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name */}
          <Text style={styles.fieldLabel}>Product Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Basmati Rice"
            placeholderTextColor="#bbb"
            value={name}
            onChangeText={setName}
          />

          {/* Price */}
          <Text style={styles.fieldLabel}>Price (₹) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 120"
            placeholderTextColor="#bbb"
            keyboardType="decimal-pad"
            value={price}
            onChangeText={setPrice}
          />

          {/* Quantity */}
          <Text style={styles.fieldLabel}>Quantity *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 50"
            placeholderTextColor="#bbb"
            keyboardType="decimal-pad"
            value={quantity}
            onChangeText={setQuantity}
          />

          {/* Unit selector */}
          <Text style={styles.fieldLabel}>Unit *</Text>
          <View style={styles.unitRow}>
            {UNITS.map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.unitChip, unit === u && styles.unitChipActive]}
                onPress={() => setUnit(u)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}
                >
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <Text style={styles.fieldLabel}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Short product description..."
            placeholderTextColor="#bbb"
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
          />

          {/* Submit */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAddProduct}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Add Product</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F7F5",
  },
  container: {
    flex: 1,
  },

  // ── HEADER ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E4",
    backgroundColor: "#fff",
    gap: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F2F2F0",
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow: {
    fontSize: 20,
    color: "#111",
    lineHeight: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: "#999",
    marginTop: 1,
  },

  // ── FORM ──
  form: {
    padding: 20,
    paddingBottom: 48,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
    marginTop: 14,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0DC",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: "#111",
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
  },

  // ── UNIT CHIPS ──
  unitRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  unitChip: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#DDD",
    backgroundColor: "#fff",
  },
  unitChipActive: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  unitChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
  },
  unitChipTextActive: {
    color: "#fff",
  },

  // ── BUTTON ──
  button: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 12,
    marginTop: 28,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});