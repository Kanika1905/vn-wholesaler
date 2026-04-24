import React, { useState, useEffect } from "react";
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
  Alert, Modal, FlatList, Platform
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { apiRequest } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UNITS = ["kg", "litre", "pcs", "box", "dozen"];

export default function AddProduct({ navigation }) {
  const [name, setName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("kg");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([null, null, null]);

  // ── Category state ──────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [catLoading, setCatLoading] = useState(true);

  // ── Fetch categories on mount ───────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiRequest("/categories", "GET");
        const cats = res?.categories || res;
        if (Array.isArray(cats)) setCategories(cats);
      } catch (err) {
        console.log("Category fetch error:", err);
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // ── Permission helper ───────────────────────────────────
  const ensurePermission = async (type) => {
    if (type === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === "granted";
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === "granted";
    }
  };

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
      quality: 0.7,
    });
    if (!result.canceled) placeImage(slotIndex, result.assets[0]);
  };

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
    if (!result.canceled) placeImage(slotIndex, result.assets[0]);
  };

  const placeImage = (slotIndex, asset) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[slotIndex] = asset;
      return updated;
    });
  };

  const removeImage = (slotIndex) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[slotIndex] = null;
      return updated;
    });
  };

  const showSourcePicker = (slotIndex) => {
    Alert.alert(
      "Add photo", "Choose source",
      [
        { text: "📷  Camera", onPress: () => openCamera(slotIndex) },
        { text: "🖼️  Photo gallery", onPress: () => openGallery(slotIndex) },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  // ── Build form data ─────────────────────────────────────
  const buildFormData = () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", parseFloat(price));
    formData.append("quantity", parseFloat(quantity));
    formData.append("description", description);
    formData.append("unit", unit);
    formData.append("categoryId", selectedCategory._id);   // ← real category now

    images.forEach((asset) => {
      if (!asset) return;
      const uri = asset.uri;
      const fileName = uri.split("/").pop();
      const mimeType = asset.mimeType || "image/jpeg";
      formData.append("images", { uri, name: fileName, type: mimeType });
    });

    return formData;
  };

  // ── Submit ──────────────────────────────────────────────
  const handleAddProduct = async () => {
    if (!name || !price || !quantity || !unit) {
      Alert.alert("Missing fields", "Please fill name, price, quantity and unit.");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Missing category", "Please select a category for this product.");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) { Alert.alert("Session expired", "Please login again."); return; }

      const formData = buildFormData();
      const BASE_URL = "http://10.171.227.5:5000/api";
      const response = await fetch(`${BASE_URL}/wholesaler/products`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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

  // ── Image slot ──────────────────────────────────────────
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

        {/* ── HEADER ── */}
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
          {/* ── PHOTOS ── */}
          <Text style={styles.fieldLabel}>Product Photos</Text>
          <View style={styles.imageGrid}>
            <ImageSlot index={0} large />
            <View style={styles.smallSlotsCol}>
              <ImageSlot index={1} />
              <ImageSlot index={2} />
            </View>
          </View>

          {/* ── CATEGORY ── */}
          <Text style={styles.fieldLabel}>Category *</Text>
          {catLoading ? (
            <ActivityIndicator size="small" color="#111" style={{ marginVertical: 12 }} />
          ) : (
            <>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setDropdownOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={selectedCategory ? styles.dropdownSelected : styles.dropdownPlaceholder}>
                  {selectedCategory ? selectedCategory.name : "Select a category"}
                </Text>
                <Text style={styles.dropdownArrow}>{dropdownOpen ? "▲" : "▼"}</Text>
              </TouchableOpacity>

              <Modal
                visible={dropdownOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setDropdownOpen(false)}
              >
                {/* Backdrop: separate pressable view, not wrapping the sheet */}
                <View style={styles.modalOverlay}>
                  <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={() => setDropdownOpen(false)}
                  />

                  <View style={styles.modalSheet}>
                    <View style={styles.modalHandle} />
                    <Text style={styles.modalTitle}>Select Category</Text>

                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{ paddingBottom: 40 }}
                      keyboardShouldPersistTaps="handled"
                    >
                      {Object.entries(
                        categories.reduce((acc, cat) => {
                          const g = cat.group || "Other";
                          if (!acc[g]) acc[g] = [];
                          acc[g].push(cat);
                          return acc;
                        }, {})
                      ).map(([group, cats]) => (
                        <View key={group}>
                          <Text style={styles.groupHeader}>{group}</Text>
                          {cats.map((cat) => {
                            const active = selectedCategory?._id === cat._id;
                            return (
                              <TouchableOpacity
                                key={cat._id}
                                style={[styles.modalOption, active && styles.modalOptionActive]}
                                onPress={() => {
                                  setSelectedCategory(cat);
                                  setDropdownOpen(false);
                                }}
                                activeOpacity={0.75}
                              >
                                <View style={styles.modalOptionLeft}>
                                  <Text style={styles.catEmoji}>{cat.emoji || "📦"}</Text>
                                  <Text style={[styles.modalOptionText, active && styles.modalOptionTextActive]}>
                                    {cat.name}
                                  </Text>
                                </View>
                                {active && <Text style={styles.checkmark}>✓</Text>}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            </>
          )}

          {/* ── NAME ── */}
          <Text style={styles.fieldLabel}>Product Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Basmati Rice"
            placeholderTextColor="#bbb"
            value={name}
            onChangeText={setName}
          />

          {/* ── PRICE ── */}
          <Text style={styles.fieldLabel}>Price (₹) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 120"
            placeholderTextColor="#bbb"
            keyboardType="decimal-pad"
            value={price}
            onChangeText={setPrice}
          />

          {/* ── QUANTITY ── */}
          <Text style={styles.fieldLabel}>Quantity *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 50"
            placeholderTextColor="#bbb"
            keyboardType="decimal-pad"
            value={quantity}
            onChangeText={setQuantity}
          />

          {/* ── UNIT ── */}
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

          {/* ── DESCRIPTION ── */}
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

          {/* ── SUBMIT ── */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAddProduct}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Add Product</Text>}
          </TouchableOpacity>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F7F5" },
  container: { flex: 1 },

  // header
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: "#E8E8E4",
    backgroundColor: "#fff", gap: 14,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "#F2F2F0",
    justifyContent: "center", alignItems: "center",
  },
  backArrow: { fontSize: 20, color: "#111", lineHeight: 24 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#111", letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: "#999", marginTop: 1 },

  // form
  form: { padding: 20, paddingBottom: 48 },
  fieldLabel: {
    fontSize: 13, fontWeight: "600", color: "#555",
    marginBottom: 6, marginTop: 14, letterSpacing: 0.2,
  },
  input: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#E0E0DC",
    borderRadius: 10, padding: 14, fontSize: 15, color: "#111",
  },
  textArea: { height: 90, textAlignVertical: "top" },

  // image grid
  imageGrid: { flexDirection: "row", gap: 8, marginTop: 4 },
  imgSlot: {
    flex: 1, aspectRatio: 1, borderRadius: 12,
    borderWidth: 2, borderColor: "#DDD", borderStyle: "dashed",
    backgroundColor: "#FAFAF8", alignItems: "center",
    justifyContent: "center", overflow: "hidden",
  },
  imgSlotLarge: { flex: 2, aspectRatio: 0.9 },
  imgSlotFilled: { borderWidth: 0, borderStyle: "solid" },
  smallSlotsCol: { flex: 1, gap: 8 },
  imgPreview: { width: "100%", height: "100%" },
  slotIcon: { fontSize: 24, color: "#CCC", marginBottom: 6 },
  slotHint: { fontSize: 11, color: "#BBB", fontWeight: "600" },
  removeBtn: {
    position: "absolute", top: 6, right: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 11, width: 22, height: 22,
    alignItems: "center", justifyContent: "center",
  },
  removeBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  // category chips
  // dropdown
  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0DC",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownSelected: { fontSize: 15, color: "#111", fontWeight: "600" },
  dropdownPlaceholder: { fontSize: 15, color: "#BBB" },
  dropdownArrow: { fontSize: 12, color: "#888" },

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  modalTitle: {
    fontSize: 16, fontWeight: "800", color: "#111",
    marginBottom: 14, letterSpacing: -0.3,
  },
  modalOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalOptionActive: {},
  modalOptionText: { fontSize: 15, color: "#555", fontWeight: "500" },
  modalOptionTextActive: { color: "#111", fontWeight: "700" },
  checkmark: { fontSize: 16, color: "#111", fontWeight: "700" },

  // unit chips
  unitRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  unitChip: {
    paddingVertical: 8, paddingHorizontal: 18,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: "#DDD", backgroundColor: "#fff",
  },
  unitChipActive: { backgroundColor: "#111", borderColor: "#111" },
  unitChipText: { fontSize: 13, fontWeight: "600", color: "#888" },
  unitChipTextActive: { color: "#fff" },

  // button
  button: {
    backgroundColor: "#111", padding: 16,
    borderRadius: 12, marginTop: 28, alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 0.2 },

  // Replace old modalOverlay and modalSheet
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: "75%",   // ← so it doesn't fill whole screen
  },
  modalHandle: {
    width: 36, height: 3, borderRadius: 2,
    backgroundColor: "#DDD", alignSelf: "center",
    marginBottom: 16,
  },
  groupHeader: {
    fontSize: 11, fontWeight: "800", color: "#999",
    letterSpacing: 1, textTransform: "uppercase",
    paddingTop: 16, paddingBottom: 6,
    borderBottomWidth: 1, borderBottomColor: "#F0F0EE",
    marginBottom: 4,
  },
  modalOptionLeft: {
    flexDirection: "row", alignItems: "center", gap: 10,
  },
  catEmoji: { fontSize: 20 },
});