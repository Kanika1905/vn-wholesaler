import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { apiRequest } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home({ navigation }) {
  const [isProfileCompleted, setIsProfileCompleted] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // useFocusEffect re-fetches every time user lands on Home
  // (e.g. after adding a product and navigating back)
  const fetchHomeData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      // fetch profile status
      const profileRes = await apiRequest("/wholesaler/profile", "GET", null, token);
      if (profileRes?.isProfileCompleted) {
        setIsProfileCompleted(true);
      }

      // fetch products
      const productsRes = await apiRequest("/wholesaler/products", "GET", null, token);
      if (Array.isArray(productsRes)) {
        setProducts(productsRes);
      }
    } catch (error) {
      console.log("HOME FETCH ERROR 👉", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(fetchHomeData);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#111" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Store</Text>
          <Text style={styles.headerSub}>
            {products.length} product{products.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Content */}
        {products.length === 0 ? (
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
                {/* Left: name + description */}
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
                {/* Right: price */}
                <View style={styles.cardRight}>
                  <Text style={styles.productPrice}>₹{item.price}</Text>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <Text style={[styles.tabIcon, styles.tabIconActive]}>🏠</Text>
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addTab}
          onPress={() => navigation.navigate("addProduct")}
          activeOpacity={0.85}
        >
          <Text style={styles.addTabIcon}>＋</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("profile")}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const TAB_HEIGHT = 70;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F7F5",
  },
  container: {
    flex: 1,
    paddingBottom: TAB_HEIGHT,
  },

  // ── HEADER ──
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E4",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
    letterSpacing: 0.3,
  },

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
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptyDesc: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 32,
  },
  setupBtn: {
    backgroundColor: "#111",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  setupBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // ── PRODUCT LIST ──
  list: {
    padding: 16,
    gap: 10,
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  cardLeft: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 2,
  },
  productDesc: {
    fontSize: 13,
    color: "#999",
    marginBottom: 4,
  },
  productMeta: {
    fontSize: 12,
    color: "#bbb",
    fontWeight: "500",
  },
  cardRight: {
    alignItems: "flex-end",
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },

  // ── BOTTOM TAB BAR ──
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.4,
  },
  tabIconActive: { opacity: 1 },
  tabLabel: {
    fontSize: 11,
    color: "#aaa",
    marginTop: 2,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: "#111",
    fontWeight: "700",
  },
  addTab: {
    width: 56,
    height: 56,
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
  addTabIcon: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "300",
  },
});