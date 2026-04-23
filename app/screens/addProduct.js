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
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
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

  // Image state: up to 3 images
  const [images, setImages] = useState([null, null, null]);

  // ─── Ask permission helper ───────────────────────────────
  const ensurePermission = async (type) => {
    if (type === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === "granted";
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === "granted";
    }
  };

  // ─── Open camera ─────────────────────────────────────────
  const openCamera = async (slotIndex) => {
    const granted = await ensurePermission("camera");
    if (!granted) {
      Alert.alert("Permission needed", "Please allow camera access in settings.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,           // compress to ~70% — saves upload bandwidth
    });
    if (!result.canceled) {
      placeImage(slotIndex, result.assets[0]);
    }
  };

  // ─── Open gallery ─────────────────────────────────────────
  const openGallery = async (slotIndex) => {
    const granted = await ensurePermission("gallery");
    if (!granted) {
      Alert.alert("Permission needed", "Please allow photo library access in settings.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      placeImage(slotIndex, result.assets[0]);
    }
  };

  // ─── Place picked image into slot ────────────────────────
  const placeImage = (slotIndex, asset) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[slotIndex] = asset;
      return updated;
    });
  };

  // ─── Remove image from slot ───────────────────────────────
  const removeImage = (slotIndex) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[slotIndex] = null;
      return updated;
    });
  };

  // ─── Show bottom sheet (Alert with options) ───────────────
  const showSourcePicker = (slotIndex) => {
    Alert.alert(
      "Add photo",
      "Choose source",
      [
        { text: "📷  Camera",       onPress: () => openCamera(slotIndex)  },
        { text: "🖼️  Photo gallery", onPress: () => openGallery(slotIndex) },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  // ─── Build multipart form data ────────────────────────────
  const buildFormData = () => {
    const formData = new FormData();
    formData.append("name",        name);
    formData.append("price",       parseFloat(price));
    formData.append("quantity",    parseFloat(quantity));
    formData.append("description", description);
    formData.append("unit",        unit);
    formData.append("categoryId",  "000000000000000000000000"); // placeholder

    // Append each selected image
    images.forEach((asset, i) => {
      if (!asset) return;
      const uri      = asset.uri;
      const fileName = uri.split("/").pop();
      const mimeType = asset.mimeType || "image/jpeg";
      formData.append("images", { uri, name: fileName, type: mimeType });
    });

    return formData;
  };

  // ─── Submit ───────────────────────────────────────────────
  const handleAddProduct = async () => {
    if (!name || !price || !quantity || !unit) {
      Alert.alert("Missing fields", "Please fill name, price, quantity and unit.");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Session expired", "Please login again.");
        return;
      }

      const formData = buildFormData();

      // Use fetch directly (not apiRequest) because we need multipart headers
      const BASE_URL = "http://192.168.0.103:5000/api"; // 🔁 replace with your actual API base URL
      const response = await fetch(`${BASE_URL}/wholesaler/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type manually — fetch sets it with boundary for multipart
        },
        body: formData,
      });

      const res = await response.json();

      if (res?.success || res?._id || res?.product) {
        Alert.alert("Success", "Product added!");
        navigation.navigate("home");
      } else {
        Alert.alert("Error", res?.message || "Failed to add product");
      }
    } catch (error) {
      console.log("ADD PRODUCT ERROR 👉", error);
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ─── Single image slot component ─────────────────────────
  const ImageSlot = ({ index, large }) => {
    const asset = images[index];
    return (
      <TouchableOpacity
        style={[styles.imgSlot, large && styles.imgSlotLarge, asset && styles.imgSlotFilled]}
        onPress={() => !asset && showSourcePicker(index)}
        activeOpacity={0.8}
      >
        {asset ? (
          <>
            <Image source={{ uri: asset.uri }} style={styles.imgPreview} />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeImage(index)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.slotIcon}>{index === 0 ? "📷" : "+"}</Text>
            <Text style={styles.slotHint}>
              {index === 0 ? "Main photo" : `Photo ${index + 1}`}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
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
          {/* ── PHOTO UPLOAD ── */}
          <Text style={styles.fieldLabel}>Product Photos</Text>
          <View style={styles.imageGrid}>
            {/* Large main slot */}
            <ImageSlot index={0} large />
            {/* Two small slots stacked */}
            <View style={styles.smallSlotsCol}>
              <ImageSlot index={1} />
              <ImageSlot index={2} />
            </View>
          </View>

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
                <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>
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
  safe:      { flex: 1, backgroundColor: "#F7F7F5" },
  container: { flex: 1 },

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
    width: 38, height: 38,
    borderRadius: 10,
    backgroundColor: "#F2F2F0",
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow:   { fontSize: 20, color: "#111", lineHeight: 24 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#111", letterSpacing: -0.5 },
  headerSub:   { fontSize: 13, color: "#999", marginTop: 1 },

  // ── FORM ──
  form: { padding: 20, paddingBottom: 48 },
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
  textArea: { height: 90, textAlignVertical: "top" },

  // ── IMAGE GRID ──
  imageGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  imgSlot: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#DDD",
    borderStyle: "dashed",
    backgroundColor: "#FAFAF8",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  imgSlotLarge: {
    flex: 2,          // takes 2/3 of width
    aspectRatio: 0.9,
  },
  imgSlotFilled: {
    borderWidth: 0,
    borderStyle: "solid",
  },
  smallSlotsCol: {
    flex: 1,
    gap: 8,
  },
  imgPreview: {
    width: "100%",
    height: "100%",
  },
  slotIcon: { fontSize: 24, color: "#CCC", marginBottom: 6 },
  slotHint: { fontSize: 11, color: "#BBB", fontWeight: "600" },
  removeBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 11,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  // ── UNIT CHIPS ──
  unitRow:         { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  unitChip: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#DDD",
    backgroundColor: "#fff",
  },
  unitChipActive:     { backgroundColor: "#111", borderColor: "#111" },
  unitChipText:       { fontSize: 13, fontWeight: "600", color: "#888" },
  unitChipTextActive: { color: "#fff" },

  // ── BUTTON ──
  button: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 12,
    marginTop: 28,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText:     { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 0.2 },
});