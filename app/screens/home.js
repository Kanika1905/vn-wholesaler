import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { apiRequest } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home({ navigation }) {
  const [activeTab, setActiveTab] = useState("store");
  const [isProfileCompleted, setIsProfileCompleted] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── edit modal state ──
  const [editVisible, setEditVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchHomeData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const profileRes = await apiRequest("/wholesaler/profile", "GET", null, token);
      if (profileRes?.isProfileCompleted) setIsProfileCompleted(true);

      const productsRes = await apiRequest("/wholesaler/products", "GET", null, token);
      if (Array.isArray(productsRes)) setProducts(productsRes);

      const ordersRes = await apiRequest("/wholesaler/orders", "GET", null, token);
      if (Array.isArray(ordersRes)) setOrders(ordersRes);
    } catch (error) {
      console.log("HOME FETCH ERROR 👉", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(fetchHomeData);

  // ── open edit modal pre-filled ──
  const openEdit = (product) => {
    setEditingProduct(product);
    setEditName(product.name || "");
    setEditDescription(product.description || "");
    setEditPrice(String(product.price || ""));
    setEditQuantity(String(product.quantity || ""));
    setEditUnit(product.unit || "");
    setEditVisible(true);
  };

  // ── save edited product ──
  const handleSaveProduct = async () => {
    if (!editName || !editPrice || !editQuantity || !editUnit) {
      alert("Please fill all required fields");
      return;
    }
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) { alert("Login expired. Please login again."); return; }

      const res = await apiRequest(
        `/wholesaler/products/${editingProduct._id}`,
        "PUT",
        {
          name: editName.trim(),
          description: editDescription.trim(),
          price: Number(editPrice),
          quantity: Number(editQuantity),
          unit: editUnit.trim(),
        },
        token
      );

      // update local state directly — no full refetch needed
      const updated = res.product || res;
      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
      setEditVisible(false);
    } catch (error) {
      console.log("EDIT PRODUCT ERROR 👉", error);
      alert(error.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#111" />
      </SafeAreaView>
    );
  }

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":   return "#F59E0B";
      case "confirmed": return "#3B82F6";
      case "delivered": return "#10B981";
      case "cancelled": return "#EF4444";
      default:          return "#999";
    }
  };
  const statusBg = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":   return "#FEF3C7";
      case "confirmed": return "#DBEAFE";
      case "delivered": return "#D1FAE5";
      case "cancelled": return "#FEE2E2";
      default:          return "#F3F4F6";
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Store</Text>
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              style={[styles.switchTab, activeTab === "store" && styles.switchTabActive]}
              onPress={() => setActiveTab("store")}
              activeOpacity={0.8}
            >
              <Text style={[styles.switchTabText, activeTab === "store" && styles.switchTabTextActive]}>
                Products
              </Text>
              {products.length > 0 && (
                <View style={[styles.badge, activeTab === "store" && styles.badgeActive]}>
                  <Text style={[styles.badgeText, activeTab === "store" && styles.badgeTextActive]}>
                    {products.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchTab, activeTab === "orders" && styles.switchTabActive]}
              onPress={() => setActiveTab("orders")}
              activeOpacity={0.8}
            >
              <Text style={[styles.switchTabText, activeTab === "orders" && styles.switchTabTextActive]}>
                My Orders
              </Text>
              {orders.length > 0 && (
                <View style={[styles.badge, activeTab === "orders" && styles.badgeActive]}>
                  <Text style={[styles.badgeText, activeTab === "orders" && styles.badgeTextActive]}>
                    {orders.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── PRODUCTS TAB ── */}
        {activeTab === "store" && (
          products.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Text style={styles.emptyIcon}>🏪</Text>
              </View>
              <Text style={styles.emptyTitle}>No products yet</Text>
              {!isProfileCompleted ? (
                <>
                  <Text style={styles.emptyDesc}>
                    Set up your profile first, then start adding products to your store.
                  </Text>
                  <TouchableOpacity
                    style={styles.setupBtn}
                    onPress={() => navigation.navigate("profile")}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.setupBtnText}>Set Up Your Profile →</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.emptyDesc}>
                  Tap the + button below to add your first product.
                </Text>
              )}
            </View>
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.productCard}>
                  {/* ✏️ Edit button — top right corner */}
                  <TouchableOpacity
                    style={styles.cardEditBtn}
                    onPress={() => openEdit(item)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  >
                    <Text style={styles.cardEditIcon}>✏️</Text>
                  </TouchableOpacity>

                  <View style={styles.cardBody}>
                    <View style={styles.cardLeft}>
                      <Text style={styles.productName}>{item.name}</Text>
                      {item.description ? (
                        <Text style={styles.productDesc} numberOfLines={1}>
                          {item.description}
                        </Text>
                      ) : null}
                      <Text style={styles.productMeta}>
                        {item.quantity} {item.unit}
                      </Text>
                    </View>
                    <View style={styles.cardRight}>
                      <Text style={styles.productPrice}>₹{item.price}</Text>
                    </View>
                  </View>
                </View>
              )}
            />
          )
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === "orders" && (
          orders.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Text style={styles.emptyIcon}>📦</Text>
              </View>
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptyDesc}>
                Orders placed by buyers will appear here.
              </Text>
            </View>
          ) : (
            <FlatList
              data={orders}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.orderCard}>
                  <View style={styles.orderTop}>
                    <View style={styles.orderLeft}>
                      <Text style={styles.orderId}>
                        Order #{item._id?.slice(-6).toUpperCase()}
                      </Text>
                      <Text style={styles.orderBuyer}>
                        {item.buyerName || "Buyer"}
                      </Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: statusBg(item.status) }]}>
                      <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
                        {item.status || "Pending"}
                      </Text>
                    </View>
                  </View>
                  {Array.isArray(item.items) && item.items.length > 0 && (
                    <View style={styles.orderItems}>
                      {item.items.map((p, idx) => (
                        <Text key={idx} style={styles.orderItemText}>
                          • {p.name}  ×{p.quantity}
                        </Text>
                      ))}
                    </View>
                  )}
                  <View style={styles.orderBottom}>
                    <Text style={styles.orderDate}>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : ""}
                    </Text>
                    <Text style={styles.orderTotal}>₹{item.totalAmount}</Text>
                  </View>
                </View>
              )}
            />
          )
        )}
      </View>

      {/* ── BOTTOM TAB BAR ── */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.bottomTabItem} activeOpacity={0.7}>
          <Text style={[styles.bottomTabIcon, styles.bottomTabIconActive]}>🏠</Text>
          <Text style={[styles.bottomTabLabel, styles.bottomTabLabelActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addTab}
          onPress={() => navigation.navigate("addProduct")}
          activeOpacity={0.85}
        >
          <Text style={styles.addTabIcon}>＋</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomTabItem}
          onPress={() => navigation.navigate("profile")}
          activeOpacity={0.7}
        >
          <Text style={styles.bottomTabIcon}>👤</Text>
          <Text style={styles.bottomTabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* ── EDIT PRODUCT MODAL ── */}
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Product</Text>
              <TouchableOpacity
                onPress={() => setEditVisible(false)}
                style={styles.closeBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.inputLabel}>Product Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Product Name"
                placeholderTextColor="#aaa"
                value={editName}
                onChangeText={setEditName}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Description (optional)"
                placeholderTextColor="#aaa"
                value={editDescription}
                onChangeText={setEditDescription}
                multiline
                numberOfLines={3}
              />

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Price (₹) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#aaa"
                    value={editPrice}
                    onChangeText={setEditPrice}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Quantity *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#aaa"
                    value={editQuantity}
                    onChangeText={setEditQuantity}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Unit *</Text>
              <TextInput
                style={styles.input}
                placeholder="kg / litre / piece etc."
                placeholderTextColor="#aaa"
                value={editUnit}
                onChangeText={setEditUnit}
              />

              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSaveProduct}
                activeOpacity={0.85}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveBtnText}>Save Changes</Text>
                }
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const TAB_HEIGHT = 70;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F7F5" },
  container: { flex: 1, paddingBottom: TAB_HEIGHT },

  // ── HEADER ──
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 0,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E4",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111",
    letterSpacing: -0.5,
    marginBottom: 16,
  },

  // ── TOP TAB SWITCHER ──
  tabSwitcher: { flexDirection: "row", gap: 4 },
  switchTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: -1,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    gap: 6,
  },
  switchTabActive: { borderBottomColor: "#111" },
  switchTabText: { fontSize: 14, fontWeight: "600", color: "#aaa" },
  switchTabTextActive: { color: "#111" },
  badge: {
    backgroundColor: "#ECECEC",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: "center",
  },
  badgeActive: { backgroundColor: "#111" },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#888" },
  badgeTextActive: { color: "#fff" },

  // ── EMPTY STATE ──
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 36,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#F0EDE8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyIcon: { fontSize: 38 },
  emptyTitle: { fontSize: 22, fontWeight: "700", color: "#111", marginBottom: 10, letterSpacing: -0.3 },
  emptyDesc: { fontSize: 14, color: "#888", textAlign: "center", lineHeight: 21, marginBottom: 32 },
  setupBtn: { backgroundColor: "#111", paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12 },
  setupBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 0.2 },

  // ── PRODUCT LIST ──
  list: { padding: 16, gap: 10 },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  // ✏️ absolute top-right inside the card
  cardEditBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
    backgroundColor: "#F3F3F0",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cardEditIcon: { fontSize: 13 },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 36, // prevent text going under edit button
  },
  cardLeft: { flex: 1, marginRight: 12 },
  productName: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 2 },
  productDesc: { fontSize: 13, color: "#999", marginBottom: 4 },
  productMeta: { fontSize: 12, color: "#bbb", fontWeight: "500" },
  cardRight: { alignItems: "flex-end" },
  productPrice: { fontSize: 18, fontWeight: "800", color: "#111" },

  // ── ORDER LIST ──
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  orderTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  orderLeft: { flex: 1, marginRight: 10 },
  orderId: { fontSize: 13, fontWeight: "700", color: "#111", letterSpacing: 0.5, marginBottom: 2 },
  orderBuyer: { fontSize: 13, color: "#888" },
  statusPill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  orderItems: { marginBottom: 10, gap: 2 },
  orderItemText: { fontSize: 13, color: "#555" },
  orderBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F3F3",
    paddingTop: 10,
  },
  orderDate: { fontSize: 12, color: "#bbb" },
  orderTotal: { fontSize: 16, fontWeight: "800", color: "#111" },

  // ── BOTTOM TAB BAR ──
  bottomTabBar: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: TAB_HEIGHT,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E8E8E4",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  bottomTabItem: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 6 },
  bottomTabIcon: { fontSize: 22, opacity: 0.4 },
  bottomTabIconActive: { opacity: 1 },
  bottomTabLabel: { fontSize: 11, color: "#aaa", marginTop: 2, fontWeight: "500" },
  bottomTabLabelActive: { color: "#111", fontWeight: "700" },
  addTab: {
    width: 56, height: 56,
    borderRadius: 28,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  addTabIcon: { color: "#fff", fontSize: 28, lineHeight: 32, fontWeight: "300" },

  // ── EDIT MODAL ──
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0EE",
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#111", letterSpacing: -0.3 },
  closeBtn: {
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0EE",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: { fontSize: 13, fontWeight: "700", color: "#555" },
  modalScroll: { padding: 24, paddingBottom: 40 },

  // ── INPUTS ──
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
    marginBottom: 6,
    marginTop: 4,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#F9F9F7",
    borderWidth: 1,
    borderColor: "#E0E0DC",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    fontSize: 15,
    color: "#111",
  },
  inputMultiline: { height: 80, textAlignVertical: "top" },
  inputRow: { flexDirection: "row", gap: 12 },
  inputHalf: { flex: 1 },
  saveBtn: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 12,
    marginTop: 4,
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15, letterSpacing: 0.2 },
});