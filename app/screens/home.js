import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiRequest } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
//import { ..., Alert } from "react-native";

// ── Design tokens ──────────────────────────────────────────────
const C = {
  bg: "#F5F4F0",
  surface: "#FAFAF8",
  surfaceAlt: "#FFFFFF",
  border: "#E6E4DE",
  borderLight: "#EEECE7",
  ink: "#1A1916",
  inkMid: "#6B6860",
  inkLight: "#A8A59E",
  accent: "#1A1916",
  shadow: "#1A1916",
};

export default function Home({ navigation }) {
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState("store");
  const [isProfileCompleted, setIsProfileCompleted] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // edit modal
  const [editVisible, setEditVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const profileRes = await apiRequest("/wholesaler/profile", "GET", null, token);
      if (profileRes?.isProfileCompleted) {
        setIsProfileCompleted(true);
        if (profileRes?.profile?.businessName) {
          setBusinessName(profileRes.profile.businessName);
        }
      }

      const productsRes = await apiRequest("/wholesaler/products", "GET", null, token);
      if (Array.isArray(productsRes)) setProducts(productsRes);

      try {
        const ordersRes = await apiRequest("/wholesaler/orders", "GET", null, token);
        if (Array.isArray(ordersRes)) setOrders(ordersRes);
      } catch (_) { }

    } catch (error) {
      console.log("HOME FETCH ERROR 👉", error);
    } finally {
      setLoading(false);
    }
  };

  // useCallback wraps a plain (non-async) function that calls fetchHomeData
  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [])
  );

  const openEdit = (product) => {
    setEditingProduct(product);
    setEditName(product.name || "");
    setEditDescription(product.description || "");
    setEditPrice(String(product.price || ""));
    setEditQuantity(String(product.quantity || ""));
    setEditUnit(product.unit || "");
    setEditVisible(true);
  };

  const handleSaveProduct = async () => {
    if (!editName || !editPrice || !editQuantity || !editUnit) {
      alert("Please fill all required fields");
      return;
    }
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) { alert("Login expired."); return; }

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

      const updated = res.product || res;
      if (!updated || !updated._id) {
        await fetchHomeData();
        setEditVisible(false);
        return;
      }
      setProducts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      setEditVisible(false);
    } catch (error) {
      console.log("EDIT PRODUCT ERROR 👉", error);
      alert(error.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    Alert.alert(
      "Delete product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              if (!token) return;
              await apiRequest(`/wholesaler/products/${productId}`, "DELETE", null, token);
              setProducts((prev) => prev.filter((p) => p._id !== productId));
            } catch (error) {
              console.log("DELETE ERROR 👉", error);
              Alert.alert("Error", "Failed to delete product");
            }
          },
        },
      ]
    );
  };

  const statusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return { dot: "#C9943A", label: "Pending" };
      case "confirmed": return { dot: "#4A7C6F", label: "Confirmed" };
      case "delivered": return { dot: "#3A6B3A", label: "Delivered" };
      case "cancelled": return { dot: "#8B3A3A", label: "Cancelled" };
      default: return { dot: C.inkLight, label: status || "Pending" };
    }
  };

  if (loading) {
    return (
      <View style={[s.safe, { paddingTop: insets.top }]}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color={C.ink} />
      </View>
    );
  }

  // ── PRODUCT CARD ────────────────────────────────────────────
  const renderProduct = ({ item }) => {
    // images is an array from Cloudinary; fall back gracefully
    const firstImage = Array.isArray(item.images) && item.images.length > 0
      ? item.images[0]
      : null;

    return (
      <View style={s.productCard}>
        <View style={s.productCardInner}>

          {/* Image thumbnail */}
          {firstImage ? (
            <Image
              source={{ uri: firstImage }}
              style={s.productThumb}
              resizeMode="cover"
            />
          ) : (
            <View style={s.productThumbPlaceholder}>
              <Text style={s.productThumbPlaceholderText}>📦</Text>
            </View>
          )}

          {/* Text content */}
          <View style={s.productInfo}>
            {/* top row: name + edit */}
            <View style={s.productCardTop}>
              <Text style={s.productName} numberOfLines={1}>{item.name}</Text>
              <View style={s.cardActions}>
                <TouchableOpacity
                  style={s.editChip}
                  onPress={() => openEdit(item)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                >
                  <Text style={s.editChipText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.deleteChip}
                  onPress={() => handleDeleteProduct(item._id)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                >
                  <Text style={s.deleteChipText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* description */}
            {item.description ? (
              <Text style={s.productDesc} numberOfLines={1}>{item.description}</Text>
            ) : null}

            {/* bottom row: qty + price */}
            <View style={s.productCardBottom}>
              <Text style={s.productQty}>{item.quantity} {item.unit}</Text>
              <Text style={s.productPrice}>₹{item.price}</Text>
            </View>
          </View>

        </View>
      </View>
    );
  };

  return (
    <View style={[s.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surfaceAlt} />
      <View style={s.container}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <Text style={s.wordmark} numberOfLines={1}>
              {businessName ? businessName.toUpperCase() : "MY STORE"}
            </Text>
            <Text style={s.headerMeta}>
              {activeTab === "store"
                ? `${products.length} item${products.length !== 1 ? "s" : ""}`
                : `${orders.length} order${orders.length !== 1 ? "s" : ""}`}
            </Text>
          </View>

          {/* Tab pills */}
          <View style={s.tabRow}>
            <TouchableOpacity
              style={[s.tabPill, activeTab === "store" && s.tabPillActive]}
              onPress={() => setActiveTab("store")}
              activeOpacity={0.75}
            >
              <Text style={[s.tabPillText, activeTab === "store" && s.tabPillTextActive]}>
                Products
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.tabPill, activeTab === "orders" && s.tabPillActive]}
              onPress={() => setActiveTab("orders")}
              activeOpacity={0.75}
            >
              <Text style={[s.tabPillText, activeTab === "orders" && s.tabPillTextActive]}>
                Orders
              </Text>
              {orders.length > 0 && (
                <View style={[s.tabBadge, activeTab === "orders" && s.tabBadgeActive]}>
                  <Text style={[s.tabBadgeText, activeTab === "orders" && s.tabBadgeTextActive]}>
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
            <View style={s.emptyWrap}>
              <View style={s.emptyBox}>
                <Text style={s.emptyGlyph}>—</Text>
                <Text style={s.emptyTitle}>No products yet</Text>
                <Text style={s.emptyDesc}>
                  {!isProfileCompleted
                    ? "Complete your profile to start listing products."
                    : "Tap + below to add your first product."}
                </Text>
                {!isProfileCompleted && (
                  <TouchableOpacity
                    style={s.emptyBtn}
                    onPress={() => navigation.navigate("profile")}
                    activeOpacity={0.85}
                  >
                    <Text style={s.emptyBtnText}>Set up profile</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => item._id}
              contentContainerStyle={s.list}
              showsVerticalScrollIndicator={false}
              renderItem={renderProduct}
            />
          )
        )}

        {/* ── ORDERS TAB ── */}
        {activeTab === "orders" && (
          orders.length === 0 ? (
            <View style={s.emptyWrap}>
              <View style={s.emptyBox}>
                <Text style={s.emptyGlyph}>—</Text>
                <Text style={s.emptyTitle}>No orders yet</Text>
                <Text style={s.emptyDesc}>Buyer orders will appear here.</Text>
              </View>
            </View>
          ) : (
            <FlatList
              data={orders}
              keyExtractor={(item) => item._id}
              contentContainerStyle={s.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const st = statusStyle(item.status);
                return (
                  <View style={s.orderCard}>
                    <View style={s.orderCardTop}>
                      <Text style={s.orderId}>#{item._id?.slice(-6).toUpperCase()}</Text>
                      <View style={s.statusRow}>
                        <View style={[s.statusDot, { backgroundColor: st.dot }]} />
                        <Text style={s.statusLabel}>{st.label}</Text>
                      </View>
                    </View>
                    <Text style={s.orderBuyer}>{item.buyerName || "Buyer"}</Text>
                    {Array.isArray(item.items) && item.items.length > 0 && (
                      <View style={s.orderItemsWrap}>
                        {item.items.map((p, idx) => (
                          <Text key={idx} style={s.orderItemRow}>
                            {p.name}
                            <Text style={s.orderItemQty}>  ×{p.quantity}</Text>
                          </Text>
                        ))}
                      </View>
                    )}
                    <View style={s.orderFooter}>
                      <Text style={s.orderDate}>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                          : ""}
                      </Text>
                      <Text style={s.orderTotal}>₹{item.totalAmount}</Text>
                    </View>
                  </View>
                );
              }}
            />
          )
        )}
      </View>

      {/* ── BOTTOM NAV ── */}
      <View style={[s.nav, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={s.navItem} activeOpacity={0.7}>
          <Text style={[s.navIcon, s.navIconActive]}>⌂</Text>
          <Text style={[s.navLabel, s.navLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.navAdd}
          onPress={() => navigation.navigate("addProduct")}
          activeOpacity={0.85}
        >
          <Text style={s.navAddIcon}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.navItem}
          onPress={() => navigation.navigate("profile")}
          activeOpacity={0.7}
        >
          <Text style={s.navIcon}>◎</Text>
          <Text style={s.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* ── EDIT MODAL ── */}
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditVisible(false)}
      >
        <KeyboardAvoidingView
          style={s.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <View style={s.modalHead}>
              <Text style={s.modalTitle}>Edit Product</Text>
              <TouchableOpacity
                style={s.modalClose}
                onPress={() => setEditVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={s.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={s.modalBody}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={s.fieldLabel}>PRODUCT NAME</Text>
              <TextInput
                style={s.field}
                placeholder="Name"
                placeholderTextColor={C.inkLight}
                value={editName}
                onChangeText={setEditName}
              />

              <Text style={s.fieldLabel}>DESCRIPTION</Text>
              <TextInput
                style={[s.field, s.fieldArea]}
                placeholder="Optional"
                placeholderTextColor={C.inkLight}
                value={editDescription}
                onChangeText={setEditDescription}
                multiline
                numberOfLines={3}
              />

              <View style={s.fieldRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.fieldLabel}>PRICE (₹)</Text>
                  <TextInput
                    style={s.field}
                    placeholder="0"
                    placeholderTextColor={C.inkLight}
                    value={editPrice}
                    onChangeText={setEditPrice}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={s.fieldLabel}>QUANTITY</Text>
                  <TextInput
                    style={s.field}
                    placeholder="0"
                    placeholderTextColor={C.inkLight}
                    value={editQuantity}
                    onChangeText={setEditQuantity}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={s.fieldLabel}>UNIT</Text>
              <TextInput
                style={s.field}
                placeholder="kg / litre / piece"
                placeholderTextColor={C.inkLight}
                value={editUnit}
                onChangeText={setEditUnit}
              />

              <TouchableOpacity
                style={[s.saveBtn, saving && { opacity: 0.5 }]}
                onPress={handleSaveProduct}
                activeOpacity={0.85}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.saveBtnText}>Save Changes</Text>
                }
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const NAV_H = 72;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, paddingBottom: NAV_H },

  // ── HEADER ──
  header: {
    backgroundColor: C.surfaceAlt,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  wordmark: { fontSize: 14, fontWeight: "800", letterSpacing: 0.8, color: C.ink },
  headerMeta: { fontSize: 12, color: C.inkLight, letterSpacing: 0.5 },

  cardActions: {
    flexDirection: "row",
    gap: 6,
  },
  deleteChip: {
    borderWidth: 1,
    borderColor: "#F0DADA",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#FDF4F4",
  },
  deleteChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8B3A3A",
    letterSpacing: 0.3,
  },
  // tab pills
  tabRow: { flexDirection: "row", gap: 6, marginBottom: -1 },
  tabPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabPillActive: { borderBottomColor: C.ink },
  tabPillText: { fontSize: 13, fontWeight: "600", color: C.inkLight, letterSpacing: 0.2 },
  tabPillTextActive: { color: C.ink },
  tabBadge: {
    backgroundColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: "center",
  },
  tabBadgeActive: { backgroundColor: C.ink },
  tabBadgeText: { fontSize: 10, fontWeight: "700", color: C.inkMid },
  tabBadgeTextActive: { color: "#fff" },

  // ── EMPTY ──
  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyBox: { alignItems: "center" },
  emptyGlyph: { fontSize: 32, color: C.border, marginBottom: 20, letterSpacing: -2 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: C.ink, marginBottom: 8, letterSpacing: -0.3 },
  emptyDesc: { fontSize: 13, color: C.inkMid, textAlign: "center", lineHeight: 20, marginBottom: 28 },
  emptyBtn: {
    borderWidth: 1.5,
    borderColor: C.ink,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyBtnText: { fontSize: 13, fontWeight: "700", color: C.ink, letterSpacing: 0.5 },

  // ── PRODUCT CARD ──
  list: { padding: 16, gap: 10 },
  productCard: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  productCardInner: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  // thumbnail
  productThumb: {
    width: 88,
    height: 88,
    backgroundColor: C.bg,
  },
  productThumbPlaceholder: {
    width: 88,
    height: 88,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: C.borderLight,
  },
  productThumbPlaceholderText: {
    fontSize: 28,
  },

  // info section next to thumbnail
  productInfo: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  productCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  productName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: C.ink,
    letterSpacing: -0.2,
    marginRight: 10,
  },
  editChip: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: C.bg,
  },
  editChipText: { fontSize: 11, fontWeight: "600", color: C.inkMid, letterSpacing: 0.3 },
  productDesc: { fontSize: 12, color: C.inkLight, lineHeight: 17 },
  productCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
  },
  productQty: { fontSize: 12, color: C.inkMid, fontWeight: "500", letterSpacing: 0.2 },
  productPrice: { fontSize: 17, fontWeight: "800", color: C.ink, letterSpacing: -0.3 },

  // ── ORDER CARD ──
  orderCard: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  orderCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  orderId: { fontSize: 11, fontWeight: "800", color: C.inkLight, letterSpacing: 1.5 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 12, fontWeight: "600", color: C.inkMid },
  orderBuyer: { fontSize: 15, fontWeight: "700", color: C.ink, marginBottom: 12, letterSpacing: -0.2 },
  orderItemsWrap: {
    backgroundColor: C.bg,
    borderRadius: 8,
    padding: 12,
    gap: 5,
    marginBottom: 12,
  },
  orderItemRow: { fontSize: 13, color: C.inkMid, fontWeight: "500" },
  orderItemQty: { color: C.inkLight },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
  },
  orderDate: { fontSize: 11, color: C.inkLight, letterSpacing: 0.3 },
  orderTotal: { fontSize: 17, fontWeight: "800", color: C.ink, letterSpacing: -0.3 },

  // ── BOTTOM NAV ──
  nav: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: C.surfaceAlt,
    borderTopWidth: 1,
    borderTopColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingTop: 6 },
  navIcon: { fontSize: 16, color: C.inkMid, marginBottom: 1 },
  navIconActive: { color: C.ink },
  navLabel: { fontSize: 11, color: C.inkLight, fontWeight: "500", letterSpacing: 0.3 },
  navLabelActive: { color: C.ink, fontWeight: "700" },
  navAdd: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  navAddIcon: { color: "#fff", fontSize: 26, lineHeight: 30, fontWeight: "300" },

  // ── EDIT MODAL ──
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(26,25,22,0.4)",
  },
  modalSheet: {
    backgroundColor: C.surfaceAlt,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "92%",
  },
  modalHandle: {
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  modalHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.borderLight,
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: C.ink, letterSpacing: -0.2 },
  modalClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: { fontSize: 11, fontWeight: "700", color: C.inkMid },
  modalBody: { padding: 24, paddingBottom: 44 },

  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: C.inkLight,
    letterSpacing: 1.2,
    marginBottom: 7,
    marginTop: 4,
  },
  field: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 16,
    fontSize: 14,
    color: C.ink,
  },
  fieldArea: { height: 76, textAlignVertical: "top" },
  fieldRow: { flexDirection: "row" },
  saveBtn: {
    backgroundColor: C.ink,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 4,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 14, letterSpacing: 0.5 },
});