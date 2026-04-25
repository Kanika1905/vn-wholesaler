import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Home,
  Plus,
  ClipboardList,
  Phone,
  MapPin,
  User,
  Package,
  ChevronDown,
  Check,
  X,
} from "lucide-react-native";
import { apiRequest } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Palette ───────────────────────────────────────────────────
const C = {
  bg:          "#F0F4F0",          // soft green-tinted background
  surface:     "#F7FAF7",
  surfaceAlt:  "#FFFFFF",
  border:      "#DDE8DD",
  borderLight: "#E8F0E8",
  ink:         "#1A1F1A",
  inkMid:      "#5C6B5C",
  inkLight:    "#9AAA9A",
  accent:      "#2D6A4F",          // deep forest green
  accentLight: "#E8F5EE",          // mint tint
  accentMid:   "#52B788",          // medium green
  shadow:      "#1A2A1A",
};

// ── Status config ─────────────────────────────────────────────
const STATUSES = [
  { key: "pending",         label: "Pending",          dot: "#C9943A", bg: "#FEF6E7", textColor: "#A0720D" },
  { key: "shipped",       label: "Shipped",        dot: "#2D6A4F", bg: "#E8F5EE", textColor: "#2D6A4F" },
  { key: "out_for_delivery",label: "Out for Delivery", dot: "#3A5C8B", bg: "#EAF0F8", textColor: "#3A5C8B" },
  { key: "delivered",       label: "Delivered",        dot: "#3A6B3A", bg: "#EAF3EA", textColor: "#3A6B3A" },
  { key: "cancelled",       label: "Cancelled",        dot: "#8B3A3A", bg: "#F3EAEA", textColor: "#8B3A3A" },
];

const getStatus = (key) =>
  STATUSES.find((s) => s.key === key?.toLowerCase()) ||
  { key: "pending", label: "Pending", dot: "#C9943A", bg: "#FEF6E7", textColor: "#A0720D" };

// ── Status Picker Modal ───────────────────────────────────────
function StatusPicker({ visible, current, onSelect, onClose, loading }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={sp.overlay} onPress={onClose}>
        <Pressable style={sp.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={sp.header}>
            <Text style={sp.title}>Update Status</Text>
            <TouchableOpacity style={sp.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <X size={15} color={C.inkMid} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator style={{ padding: 32 }} color={C.accent} />
          ) : (
            STATUSES.map((st, i) => {
              const isActive = current === st.key;
              return (
                <TouchableOpacity
                  key={st.key}
                  style={[
                    sp.row,
                    i < STATUSES.length - 1 && sp.rowBorder,
                    isActive && sp.rowActive,
                  ]}
                  onPress={() => onSelect(st.key)}
                  activeOpacity={0.75}
                >
                  <View style={[sp.dot, { backgroundColor: st.dot }]} />
                  <Text style={[sp.rowLabel, isActive && { color: C.accent, fontWeight: "700" }]}>
                    {st.label}
                  </Text>
                  {isActive && <Check size={15} color={C.accent} />}
                </TouchableOpacity>
              );
            })
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const sp = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10,20,10,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  sheet: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 18,
    width: "100%",
    overflow: "hidden",
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  title: { fontSize: 15, fontWeight: "800", color: C.ink, letterSpacing: -0.2 },
  closeBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.borderLight },
  rowActive: { backgroundColor: C.accentLight },
  dot: { width: 8, height: 8, borderRadius: 4 },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: "500", color: C.inkMid },
});

// ── Main Screen ───────────────────────────────────────────────
export default function Orders({ navigation }) {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // status picker state
  const [pickerOrderId, setPickerOrderId] = useState(null);
  const [pickerCurrent, setPickerCurrent] = useState(null);
  const [pickerLoading, setPickerLoading] = useState(false);

  // ── Fetch ───────────────────────────────────────────────────
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const res = await apiRequest("/wholesaler/orders", "GET", null, token);
      console.log("ORDERS RAW 👉", JSON.stringify(res));
      if (Array.isArray(res?.orders)) setOrders(res.orders);
      else if (Array.isArray(res)) setOrders(res);
      else setOrders([]);
    } catch (err) {
      console.log("ORDERS FETCH ERROR 👉", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchOrders(); }, []));

  // ── Status update ───────────────────────────────────────────
  const openPicker = (orderId, currentStatus) => {
    setPickerOrderId(orderId);
    setPickerCurrent(currentStatus);
  };

  const handleStatusSelect = async (newStatus) => {
    if (newStatus === pickerCurrent) {
      setPickerOrderId(null);
      return;
    }
    try {
      setPickerLoading(true);
      const token = await AsyncStorage.getItem("token");
      await apiRequest(
        `/wholesaler/orders/${pickerOrderId}/status`,
        "PUT",
        { status: newStatus },
        token
      );
      // optimistic update
      setOrders((prev) =>
        prev.map((o) =>
          o._id === pickerOrderId ? { ...o, status: newStatus } : o
        )
      );
      setPickerOrderId(null);
    } catch (err) {
      console.log("STATUS UPDATE ERROR 👉", err);
    } finally {
      setPickerLoading(false);
    }
  };

  // ── Order card ──────────────────────────────────────────────
  const renderOrder = ({ item }) => {
    const st = getStatus(item.status);
    const productImage =
      Array.isArray(item.product?.images) && item.product.images.length > 0
        ? item.product.images[0]
        : null;

    const vendorAddr = item.vendor?.address;
    const addressStr = vendorAddr
      ? typeof vendorAddr === "object"
        ? [vendorAddr.shopAddress, vendorAddr.city, vendorAddr.state]
            .filter(Boolean).join(", ")
        : vendorAddr
      : null;

    return (
      <View style={s.card}>

        {/* ── Card top stripe: order ID + status badge ── */}
        <View style={s.cardTop}>
          <Text style={s.orderId}>#{item._id?.slice(-6).toUpperCase()}</Text>
          <View style={[s.statusBadge, { backgroundColor: st.bg }]}>
            <View style={[s.statusDot, { backgroundColor: st.dot }]} />
            <Text style={[s.statusLabel, { color: st.textColor }]}>{st.label}</Text>
          </View>
        </View>

        {/* ── Product row ── */}
        {item.product && (
          <View style={s.productRow}>
            {/* Image */}
            <View style={s.productThumbWrap}>
              {productImage ? (
                <Image
                  source={{ uri: productImage }}
                  style={s.productThumb}
                  resizeMode="cover"
                />
              ) : (
                <View style={s.productThumbPlaceholder}>
                  <Package size={18} color={C.inkLight} />
                </View>
              )}
            </View>
            {/* Info */}
            <View style={s.productInfo}>
              <Text style={s.productName} numberOfLines={1}>
                {item.product.name}
              </Text>
              <Text style={s.productMeta}>
                Qty: {item.quantity}
                {item.product.price ? `  ·  ₹${item.product.price} / unit` : ""}
              </Text>
            </View>
            {/* Price */}
            <View style={s.totalPill}>
              <Text style={s.totalText}>
                ₹{item.totalAmount ?? (item.product?.price ?? 0) * (item.quantity ?? 1)}
              </Text>
            </View>
          </View>
        )}

        {/* ── Divider ── */}
        <View style={s.divider} />

        {/* ── Vendor details ── */}
        <View style={s.vendorSection}>
          <View style={s.vendorRow}>
            <User size={12} color={C.inkLight} />
            <Text style={s.vendorName}>
              {item.vendor?.businessName || "Vendor"}
            </Text>
          </View>
          {item.vendor?.phone && (
            <View style={s.vendorDetailRow}>
              <Phone size={11} color={C.inkLight} />
              <Text style={s.vendorDetailText}>{item.vendor.phone}</Text>
            </View>
          )}
          {addressStr && (
            <View style={s.vendorDetailRow}>
              <MapPin size={11} color={C.inkLight} />
              <Text style={s.vendorDetailText} numberOfLines={1}>{addressStr}</Text>
            </View>
          )}
        </View>

        {/* ── Footer: date + update status ── */}
        <View style={s.cardFooter}>
          <Text style={s.orderDate}>
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })
              : ""}
          </Text>

          {/* Status update button */}
          <TouchableOpacity
            style={s.updateBtn}
            onPress={() => openPicker(item._id, item.status)}
            activeOpacity={0.8}
          >
            <Text style={s.updateBtnText}>Update Status</Text>
            <ChevronDown size={13} color={C.accent} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ── Render ──────────────────────────────────────────────────
  return (
    <View style={[s.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surfaceAlt} />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerEyebrow}>INCOMING</Text>
          <Text style={s.headerTitle}>Orders</Text>
        </View>
        <View style={s.headerCountWrap}>
          <Text style={s.headerCount}>{orders.length}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={s.container}>
        {loading ? (
          <ActivityIndicator style={{ flex: 1 }} size="large" color={C.accent} />
        ) : orders.length === 0 ? (
          <View style={s.emptyWrap}>
            <View style={s.emptyIconWrap}>
              <ClipboardList size={36} color={C.inkLight} />
            </View>
            <Text style={s.emptyTitle}>No orders yet</Text>
            <Text style={s.emptyDesc}>
              Incoming orders from vendors will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item._id}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            renderItem={renderOrder}
          />
        )}
      </View>

      {/* Bottom Nav */}
      <View style={[s.nav, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity
          style={s.navItem}
          onPress={() => navigation.navigate("home")}
          activeOpacity={0.7}
        >
          <Home size={22} color={C.inkMid} />
          <Text style={s.navLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.navAdd}
          onPress={() => navigation.navigate("addProduct")}
          activeOpacity={0.85}
        >
          <Plus size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={s.navItem} activeOpacity={0.7}>
          <ClipboardList size={22} color={C.accent} />
          <Text style={[s.navLabel, s.navLabelActive]}>Orders</Text>
        </TouchableOpacity>
      </View>

      {/* Status Picker */}
      <StatusPicker
        visible={!!pickerOrderId}
        current={pickerCurrent}
        onSelect={handleStatusSelect}
        onClose={() => setPickerOrderId(null)}
        loading={pickerLoading}
      />
    </View>
  );
}

const NAV_H = 72;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, paddingBottom: NAV_H },

  // ── Header ──
  header: {
    backgroundColor: C.surfaceAlt,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: C.inkLight,
    letterSpacing: 2,
    marginBottom: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.5,
  },
  headerCountWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.accentLight,
    borderWidth: 1,
    borderColor: "#B7DFCA",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCount: {
    fontSize: 16,
    fontWeight: "800",
    color: C.accent,
  },

  list: { padding: 16, paddingBottom: 100 },

  // ── Empty ──
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.ink,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptyDesc: {
    fontSize: 13,
    color: C.inkMid,
    textAlign: "center",
    lineHeight: 20,
  },

  // ── Card ──
  card: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  orderId: {
    fontSize: 11,
    fontWeight: "800",
    color: C.inkLight,
    letterSpacing: 1.5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 11, fontWeight: "700" },

  // ── Product row ──
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
  },
  productThumbWrap: {
    width: 52,
    height: 52,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  productThumb: { width: "100%", height: "100%" },
  productThumbPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
  },
  productInfo: { flex: 1 },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: C.ink,
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  productMeta: {
    fontSize: 12,
    color: C.inkMid,
    fontWeight: "500",
  },
  totalPill: {
    backgroundColor: C.accentLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#B7DFCA",
  },
  totalText: {
    fontSize: 13,
    fontWeight: "800",
    color: C.accent,
  },

  divider: {
    height: 1,
    backgroundColor: C.borderLight,
    marginHorizontal: 16,
  },

  // ── Vendor ──
  vendorSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    gap: 5,
  },
  vendorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  vendorName: {
    fontSize: 13,
    fontWeight: "700",
    color: C.ink,
  },
  vendorDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  vendorDetailText: {
    fontSize: 12,
    color: C.inkLight,
    flex: 1,
    fontWeight: "500",
  },

  // ── Footer ──
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: C.borderLight,
  },
  orderDate: {
    fontSize: 11,
    color: C.inkLight,
    letterSpacing: 0.3,
    fontWeight: "500",
  },
  updateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: C.accentLight,
    borderWidth: 1,
    borderColor: "#B7DFCA",
  },
  updateBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.accent,
    letterSpacing: 0.1,
  },

  // ── Bottom nav ──
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
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingTop: 6,
  },
  navLabel: {
    fontSize: 11,
    color: C.inkLight,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  navLabelActive: { color: C.accent, fontWeight: "700" },
  navAdd: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: C.accent,
    justifyContent: "center", alignItems: "center",
    marginBottom: 10,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10,
    elevation: 6,
  },
});