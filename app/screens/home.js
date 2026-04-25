// // import React, { useState, useCallback, useEffect } from "react";
// // import {
// //   View,
// //   Text,
// //   TouchableOpacity,
// //   StyleSheet,
// //   FlatList,
// //   ActivityIndicator,
// //   Modal,
// //   TextInput,
// //   KeyboardAvoidingView,
// //   Platform,
// //   ScrollView,
// //   Image,
// //   StatusBar,
// //   Alert,
// // } from "react-native";
// // import { useFocusEffect } from "@react-navigation/native";
// // import { useSafeAreaInsets } from "react-native-safe-area-context";
// // import { Ionicons } from "@expo/vector-icons"; // ← add this
// // import { apiRequest } from "../services/api";
// // import AsyncStorage from "@react-native-async-storage/async-storage";

// // const C = {
// //   bg: "#F5F4F0",
// //   surface: "#FAFAF8",
// //   surfaceAlt: "#FFFFFF",
// //   border: "#E6E4DE",
// //   borderLight: "#EEECE7",
// //   ink: "#1A1916",
// //   inkMid: "#6B6860",
// //   inkLight: "#A8A59E",
// //   accent: "#1A1916",
// //   shadow: "#1A1916",
// // };

// // export default function Home({ navigation }) {
// //   const insets = useSafeAreaInsets();

// //   const [activeTab, setActiveTab] = useState("store");
// //   const [isProfileCompleted, setIsProfileCompleted] = useState(false);
// //   const [businessName, setBusinessName] = useState("");
// //   const [products, setProducts] = useState([]);
// //   const [orders, setOrders] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   // ── edit modal ──────────────────────────────────────────
// //   const [editVisible, setEditVisible] = useState(false);
// //   const [editingProduct, setEditingProduct] = useState(null);
// //   const [editName, setEditName] = useState("");
// //   const [editDescription, setEditDescription] = useState("");
// //   const [editPrice, setEditPrice] = useState("");
// //   const [editQuantity, setEditQuantity] = useState("");
// //   const [editUnit, setEditUnit] = useState("");
// //   const [editCategoryId, setEditCategoryId] = useState(null);
// //   const [saving, setSaving] = useState(false);

// //   // ── categories ──────────────────────────────────────────
// //   const [categories, setCategories] = useState([]);

// //   useEffect(() => {
// //     const loadCategories = async () => {
// //       try {
// //         const res = await apiRequest("/categories", "GET");
// //         if (Array.isArray(res)) setCategories(res);
// //       } catch (err) {
// //         console.log("Categories fetch error:", err);
// //       }
// //     };
// //     loadCategories();
// //   }, []);

// //   const fetchHomeData = async () => {
// //     try {
// //       setLoading(true);
// //       const token = await AsyncStorage.getItem("token");
// //       if (!token) return;

// //       const profileRes = await apiRequest("/wholesaler/profile", "GET", null, token);
// //       if (profileRes?.isProfileCompleted) {
// //         setIsProfileCompleted(true);
// //         if (profileRes?.profile?.businessName) {
// //           setBusinessName(profileRes.profile.businessName);
// //         }
// //       }

// //       const productsRes = await apiRequest("/wholesaler/products", "GET", null, token);
// //       if (Array.isArray(productsRes)) setProducts(productsRes);

// //       try {
// //         const ordersRes = await apiRequest("/wholesaler/orders", "GET", null, token);
// //         if (Array.isArray(ordersRes?.orders)) setOrders(ordersRes.orders);
// //         else if (Array.isArray(ordersRes)) setOrders(ordersRes);
// //       } catch (_) {}
// //     } catch (error) {
// //       console.log("HOME FETCH ERROR 👉", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useFocusEffect(
// //     useCallback(() => {
// //       fetchHomeData();
// //     }, [])
// //   );

// //   const openEdit = (product) => {
// //     setEditingProduct(product);
// //     setEditName(product.name || "");
// //     setEditDescription(product.description || "");
// //     setEditPrice(String(product.price || ""));
// //     setEditQuantity(String(product.quantity || ""));
// //     setEditUnit(product.unit || "");
// //     setEditCategoryId(product.categoryId?._id || null);
// //     setEditVisible(true);
// //   };

// //   const handleSaveProduct = async () => {
// //     if (!editName || !editPrice || !editQuantity || !editUnit) {
// //       Alert.alert("Missing fields", "Please fill all required fields.");
// //       return;
// //     }
// //     try {
// //       setSaving(true);
// //       const token = await AsyncStorage.getItem("token");
// //       if (!token) {
// //         Alert.alert("Session expired", "Please login again.");
// //         return;
// //       }

// //       const res = await apiRequest(
// //         `/wholesaler/products/${editingProduct._id}`,
// //         "PUT",
// //         {
// //           name: editName.trim(),
// //           description: editDescription.trim(),
// //           price: Number(editPrice),
// //           quantity: Number(editQuantity),
// //           unit: editUnit.trim(),
// //           categoryId: editCategoryId,
// //         },
// //         token
// //       );

// //       const updated = res.product || res;
// //       if (!updated || !updated._id) {
// //         await fetchHomeData();
// //         setEditVisible(false);
// //         return;
// //       }
// //       setProducts((prev) =>
// //         prev.map((p) => (p._id === updated._id ? updated : p))
// //       );
// //       setEditVisible(false);
// //     } catch (error) {
// //       console.log("EDIT PRODUCT ERROR 👉", error);
// //       Alert.alert("Error", error.message || "Failed to save changes");
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// //   const handleDeleteProduct = async (productId) => {
// //     Alert.alert(
// //       "Delete product",
// //       "Are you sure you want to delete this product?",
// //       [
// //         { text: "Cancel", style: "cancel" },
// //         {
// //           text: "Delete",
// //           style: "destructive",
// //           onPress: async () => {
// //             try {
// //               const token = await AsyncStorage.getItem("token");
// //               if (!token) return;
// //               await apiRequest(
// //                 `/wholesaler/products/${productId}`,
// //                 "DELETE",
// //                 null,
// //                 token
// //               );
// //               setProducts((prev) => prev.filter((p) => p._id !== productId));
// //             } catch (error) {
// //               console.log("DELETE ERROR 👉", error);
// //               Alert.alert("Error", "Failed to delete product");
// //             }
// //           },
// //         },
// //       ]
// //     );
// //   };

// //   const statusStyle = (status) => {
// //     switch (status?.toLowerCase()) {
// //       case "pending":
// //         return { dot: "#C9943A", label: "Pending" };
// //       case "confirmed":
// //         return { dot: "#4A7C6F", label: "Confirmed" };
// //       case "delivered":
// //         return { dot: "#3A6B3A", label: "Delivered" };
// //       case "cancelled":
// //         return { dot: "#8B3A3A", label: "Cancelled" };
// //       default:
// //         return { dot: C.inkLight, label: status || "Pending" };
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <View style={[s.safe, { paddingTop: insets.top }]}>
// //         <ActivityIndicator style={{ flex: 1 }} size="large" color={C.ink} />
// //       </View>
// //     );
// //   }

// //   // ── PRODUCT CARD ───────────────────────────────────────────
// //   const renderProduct = ({ item }) => {
// //     const firstImage =
// //       Array.isArray(item.images) && item.images.length > 0
// //         ? item.images[0]
// //         : null;

// //     return (
// //       <View style={s.card}>
// //         {/* Image with top-right action buttons */}
// //         <View style={s.imgWrap}>
// //           {firstImage ? (
// //             <Image
// //               source={{ uri: firstImage }}
// //               style={s.productImg}
// //               resizeMode="cover"
// //             />
// //           ) : (
// //             <View style={s.imgPlaceholder}>
// //               <Text style={s.imgPlaceholderText}>📦</Text>
// //             </View>
// //           )}

// //           {/* ── Edit / Delete — top-right corner of image ── */}
// //           <View style={s.cardOverlayActions}>
// //             <TouchableOpacity
// //               style={s.overlayBtn}
// //               onPress={() => openEdit(item)}
// //               activeOpacity={0.75}
// //             >
// //               <Ionicons name="pencil-outline" size={11} color={C.inkMid} />
// //             </TouchableOpacity>
// //             <TouchableOpacity
// //               style={[s.overlayBtn, s.overlayBtnDelete]}
// //               onPress={() => handleDeleteProduct(item._id)}
// //               activeOpacity={0.75}
// //             >
// //               <Ionicons name="trash-outline" size={11} color="#B94040" />
// //             </TouchableOpacity>
// //           </View>
// //         </View>

// //         {/* Info */}
// //         <View style={s.cardInfo}>
// //           <View style={s.priceRow}>
// //             <View style={s.priceBadge}>
// //               <Text style={s.priceText}>₹{item.price}</Text>
// //             </View>
// //           </View>
// //           <Text style={s.productName} numberOfLines={2}>
// //             {item.name}
// //           </Text>
// //           <Text style={s.qtyText} numberOfLines={1}>
// //             {item.quantity} {item.unit}
// //           </Text>
// //           {item.categoryId?.name ? (
// //             <Text style={s.productCategory} numberOfLines={1}>
// //               {item.categoryId.name}
// //             </Text>
// //           ) : null}
// //         </View>
// //       </View>
// //     );
// //   };

// //   return (
// //     <View style={[s.safe, { paddingTop: insets.top }]}>
// //       <StatusBar barStyle="dark-content" backgroundColor={C.surfaceAlt} />
// //       <View style={s.container}>

// //         {/* ── HEADER ── */}
// //         <View style={s.header}>
// //           <View style={s.headerTop}>
// //             <Text style={s.wordmark} numberOfLines={1}>
// //               {businessName ? businessName.toUpperCase() : "MY STORE"}
// //             </Text>
// //             <Text style={s.headerMeta}>
// //               {activeTab === "store"
// //                 ? `${products.length} item${products.length !== 1 ? "s" : ""}`
// //                 : `${orders.length} order${orders.length !== 1 ? "s" : ""}`}
// //             </Text>
// //           </View>

// //           <View style={s.tabRow}>
// //             <TouchableOpacity
// //               style={[s.tabPill, activeTab === "store" && s.tabPillActive]}
// //               onPress={() => setActiveTab("store")}
// //               activeOpacity={0.75}
// //             >
// //               <Text
// //                 style={[
// //                   s.tabPillText,
// //                   activeTab === "store" && s.tabPillTextActive,
// //                 ]}
// //               >
// //                 Products
// //               </Text>
// //             </TouchableOpacity>

// //             <TouchableOpacity
// //               style={[s.tabPill, activeTab === "orders" && s.tabPillActive]}
// //               onPress={() => setActiveTab("orders")}
// //               activeOpacity={0.75}
// //             >
// //               <Text
// //                 style={[
// //                   s.tabPillText,
// //                   activeTab === "orders" && s.tabPillTextActive,
// //                 ]}
// //               >
// //                 Orders
// //               </Text>
// //               {orders.length > 0 && (
// //                 <View
// //                   style={[
// //                     s.tabBadge,
// //                     activeTab === "orders" && s.tabBadgeActive,
// //                   ]}
// //                 >
// //                   <Text
// //                     style={[
// //                       s.tabBadgeText,
// //                       activeTab === "orders" && s.tabBadgeTextActive,
// //                     ]}
// //                   >
// //                     {orders.length}
// //                   </Text>
// //                 </View>
// //               )}
// //             </TouchableOpacity>
// //           </View>
// //         </View>

// //         {/* ── PRODUCTS TAB ── */}
// //         {activeTab === "store" &&
// //           (products.length === 0 ? (
// //             <View style={s.emptyWrap}>
// //               <View style={s.emptyBox}>
// //                 <Text style={s.emptyGlyph}>—</Text>
// //                 <Text style={s.emptyTitle}>No products yet</Text>
// //                 <Text style={s.emptyDesc}>
// //                   {!isProfileCompleted
// //                     ? "Complete your profile to start listing products."
// //                     : "Tap + below to add your first product."}
// //                 </Text>
// //                 {!isProfileCompleted && (
// //                   <TouchableOpacity
// //                     style={s.emptyBtn}
// //                     onPress={() => navigation.navigate("profile")}
// //                     activeOpacity={0.85}
// //                   >
// //                     <Text style={s.emptyBtnText}>Set up profile</Text>
// //                   </TouchableOpacity>
// //                 )}
// //               </View>
// //             </View>
// //           ) : (
// //             <FlatList
// //               data={products}
// //               keyExtractor={(item) => item._id}
// //               numColumns={3}
// //               columnWrapperStyle={s.row}
// //               contentContainerStyle={s.list}
// //               showsVerticalScrollIndicator={false}
// //               renderItem={renderProduct}
// //             />
// //           ))}

// //         {/* ── ORDERS TAB ── */}
// //         {activeTab === "orders" &&
// //           (orders.length === 0 ? (
// //             <View style={s.emptyWrap}>
// //               <View style={s.emptyBox}>
// //                 <Text style={s.emptyGlyph}>—</Text>
// //                 <Text style={s.emptyTitle}>No orders yet</Text>
// //                 <Text style={s.emptyDesc}>Buyer orders will appear here.</Text>
// //               </View>
// //             </View>
// //           ) : (
// //             <FlatList
// //               data={orders}
// //               keyExtractor={(item) => item._id}
// //               contentContainerStyle={s.list}
// //               showsVerticalScrollIndicator={false}
// //               renderItem={({ item }) => {
// //                 const st = statusStyle(item.status);
// //                 return (
// //                   <View style={s.orderCard}>
// //                     <View style={s.orderCardTop}>
// //                       <Text style={s.orderId}>
// //                         #{item._id?.slice(-6).toUpperCase()}
// //                       </Text>
// //                       <View style={s.statusRow}>
// //                         <View
// //                           style={[
// //                             s.statusDot,
// //                             { backgroundColor: st.dot },
// //                           ]}
// //                         />
// //                         <Text style={s.statusLabel}>{st.label}</Text>
// //                       </View>
// //                     </View>
// //                     <Text style={s.orderBuyer}>
// //                       {item.vendor?.businessName || "Vendor"}
// //                     </Text>
// //                     {item.product && (
// //                       <View style={s.orderItemsWrap}>
// //                         <Text style={s.orderItemRow}>
// //                           {item.product.name}
// //                           <Text style={s.orderItemQty}>
// //                             {"  "}×{item.quantity}
// //                           </Text>
// //                         </Text>
// //                       </View>
// //                     )}
// //                     <View style={s.orderFooter}>
// //                       <Text style={s.orderDate}>
// //                         {item.createdAt
// //                           ? new Date(item.createdAt).toLocaleDateString(
// //                               "en-IN",
// //                               {
// //                                 day: "numeric",
// //                                 month: "short",
// //                                 year: "numeric",
// //                               }
// //                             )
// //                           : ""}
// //                       </Text>
// //                       <Text style={s.orderTotal}>
// //                         ₹
// //                         {item.totalAmount ||
// //                           item.product?.price * item.quantity}
// //                       </Text>
// //                     </View>
// //                   </View>
// //                 );
// //               }}
// //             />
// //           ))}
// //       </View>

// //       {/* ── BOTTOM NAV ── */}
// //       <View style={[s.nav, { paddingBottom: insets.bottom + 10 }]}>
// //         {/* Home */}
// //         <TouchableOpacity style={s.navItem} activeOpacity={0.7}>
// //           <Ionicons
// //             name="home"
// //             size={22}
// //             color={C.ink}
// //           />
// //           <Text style={[s.navLabel, s.navLabelActive]}>Home</Text>
// //         </TouchableOpacity>

// //         {/* Add product FAB */}
// //         <TouchableOpacity
// //           style={s.navAdd}
// //           onPress={() => navigation.navigate("addProduct")}
// //           activeOpacity={0.85}
// //         >
// //           <Ionicons name="add" size={28} color="#fff" />
// //         </TouchableOpacity>

// //         {/* Profile */}
// //         <TouchableOpacity
// //           style={s.navItem}
// //           onPress={() => navigation.navigate("profile")}
// //           activeOpacity={0.7}
// //         >
// //           <Ionicons
// //             name="person-circle-outline"
// //             size={22}
// //             color={C.inkMid}
// //           />
// //           <Text style={s.navLabel}>Profile</Text>
// //         </TouchableOpacity>
// //       </View>

// //       {/* ── EDIT MODAL ── */}
// //       <Modal
// //         visible={editVisible}
// //         animationType="slide"
// //         transparent
// //         onRequestClose={() => setEditVisible(false)}
// //       >
// //         <KeyboardAvoidingView
// //           style={s.modalOverlay}
// //           behavior={Platform.OS === "ios" ? "padding" : "height"}
// //         >
// //           <View style={s.modalSheet}>
// //             <View style={s.modalHandle} />
// //             <View style={s.modalHead}>
// //               <Text style={s.modalTitle}>Edit Product</Text>
// //               <TouchableOpacity
// //                 style={s.modalClose}
// //                 onPress={() => setEditVisible(false)}
// //                 activeOpacity={0.7}
// //               >
// //                 <Ionicons name="close" size={16} color={C.inkMid} />
// //               </TouchableOpacity>
// //             </View>

// //             <ScrollView
// //               contentContainerStyle={s.modalBody}
// //               keyboardShouldPersistTaps="handled"
// //               showsVerticalScrollIndicator={false}
// //             >
// //               {/* Category chips */}
// //               <Text style={s.fieldLabel}>CATEGORY</Text>
// //               <View style={s.chipGrid}>
// //                 {categories.map((cat) => {
// //                   const active = editCategoryId === cat._id;
// //                   return (
// //                     <TouchableOpacity
// //                       key={cat._id}
// //                       style={[s.chip, active && s.chipActive]}
// //                       onPress={() => setEditCategoryId(cat._id)}
// //                       activeOpacity={0.75}
// //                     >
// //                       <Text style={[s.chipText, active && s.chipTextActive]}>
// //                         {cat.name}
// //                       </Text>
// //                     </TouchableOpacity>
// //                   );
// //                 })}
// //               </View>

// //               <Text style={s.fieldLabel}>PRODUCT NAME</Text>
// //               <TextInput
// //                 style={s.field}
// //                 placeholder="Name"
// //                 placeholderTextColor={C.inkLight}
// //                 value={editName}
// //                 onChangeText={setEditName}
// //               />

// //               <Text style={s.fieldLabel}>DESCRIPTION</Text>
// //               <TextInput
// //                 style={[s.field, s.fieldArea]}
// //                 placeholder="Optional"
// //                 placeholderTextColor={C.inkLight}
// //                 value={editDescription}
// //                 onChangeText={setEditDescription}
// //                 multiline
// //                 numberOfLines={3}
// //               />

// //               <View style={s.fieldRow}>
// //                 <View style={{ flex: 1 }}>
// //                   <Text style={s.fieldLabel}>PRICE (₹)</Text>
// //                   <TextInput
// //                     style={s.field}
// //                     placeholder="0"
// //                     placeholderTextColor={C.inkLight}
// //                     value={editPrice}
// //                     onChangeText={setEditPrice}
// //                     keyboardType="numeric"
// //                   />
// //                 </View>
// //                 <View style={{ width: 12 }} />
// //                 <View style={{ flex: 1 }}>
// //                   <Text style={s.fieldLabel}>QUANTITY</Text>
// //                   <TextInput
// //                     style={s.field}
// //                     placeholder="0"
// //                     placeholderTextColor={C.inkLight}
// //                     value={editQuantity}
// //                     onChangeText={setEditQuantity}
// //                     keyboardType="numeric"
// //                   />
// //                 </View>
// //               </View>

// //               <Text style={s.fieldLabel}>UNIT</Text>
// //               <TextInput
// //                 style={s.field}
// //                 placeholder="kg / litre / piece"
// //                 placeholderTextColor={C.inkLight}
// //                 value={editUnit}
// //                 onChangeText={setEditUnit}
// //               />

// //               <TouchableOpacity
// //                 style={[s.saveBtn, saving && { opacity: 0.5 }]}
// //                 onPress={handleSaveProduct}
// //                 activeOpacity={0.85}
// //                 disabled={saving}
// //               >
// //                 {saving ? (
// //                   <ActivityIndicator color="#fff" />
// //                 ) : (
// //                   <Text style={s.saveBtnText}>Save Changes</Text>
// //                 )}
// //               </TouchableOpacity>
// //             </ScrollView>
// //           </View>
// //         </KeyboardAvoidingView>
// //       </Modal>
// //     </View>
// //   );
// // }

// // const NAV_H = 72;
// // const CARD_SIZE = "31%";
// // const s = StyleSheet.create({
// //   safe: { flex: 1, backgroundColor: C.bg },
// //   container: { flex: 1, paddingBottom: NAV_H },

// //   // header
// //   header: {
// //     backgroundColor: C.surfaceAlt,
// //     paddingHorizontal: 24,
// //     paddingTop: 28,
// //     paddingBottom: 0,
// //     borderBottomWidth: 1,
// //     borderBottomColor: C.border,
// //   },
// //   headerTop: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "flex-end",
// //     marginBottom: 20,
// //   },
// //   wordmark: {
// //     fontSize: 14,
// //     fontWeight: "800",
// //     letterSpacing: 0.8,
// //     color: C.ink,
// //   },
// //   headerMeta: { fontSize: 12, color: C.inkLight, letterSpacing: 0.5 },

// //   // tab pills
// //   tabRow: { flexDirection: "row", gap: 6, marginBottom: -1 },
// //   tabPill: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     gap: 6,
// //     paddingVertical: 10,
// //     paddingHorizontal: 4,
// //     marginRight: 8,
// //     borderBottomWidth: 2,
// //     borderBottomColor: "transparent",
// //   },
// //   tabPillActive: { borderBottomColor: C.ink },
// //   tabPillText: {
// //     fontSize: 13,
// //     fontWeight: "600",
// //     color: C.inkLight,
// //     letterSpacing: 0.2,
// //   },
// //   tabPillTextActive: { color: C.ink },
// //   tabBadge: {
// //     backgroundColor: C.border,
// //     borderRadius: 10,
// //     paddingHorizontal: 6,
// //     paddingVertical: 1,
// //     minWidth: 18,
// //     alignItems: "center",
// //   },
// //   tabBadgeActive: { backgroundColor: C.ink },
// //   tabBadgeText: { fontSize: 10, fontWeight: "700", color: C.inkMid },
// //   tabBadgeTextActive: { color: "#fff" },

// //   // empty
// //   emptyWrap: {
// //     flex: 1,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     padding: 40,
// //   },
// //   emptyBox: { alignItems: "center" },
// //   emptyGlyph: {
// //     fontSize: 32,
// //     color: C.border,
// //     marginBottom: 20,
// //     letterSpacing: -2,
// //   },
// //   emptyTitle: {
// //     fontSize: 18,
// //     fontWeight: "700",
// //     color: C.ink,
// //     marginBottom: 8,
// //     letterSpacing: -0.3,
// //   },
// //   emptyDesc: {
// //     fontSize: 13,
// //     color: C.inkMid,
// //     textAlign: "center",
// //     lineHeight: 20,
// //     marginBottom: 28,
// //   },
// //   emptyBtn: {
// //     borderWidth: 1.5,
// //     borderColor: C.ink,
// //     paddingVertical: 12,
// //     paddingHorizontal: 24,
// //     borderRadius: 8,
// //   },
// //   emptyBtnText: {
// //     fontSize: 13,
// //     fontWeight: "700",
// //     color: C.ink,
// //     letterSpacing: 0.5,
// //   },

// //   // grid
// //   list: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 100 },
// //   row: { justifyContent: "space-between", marginBottom: 10 },

// //   // card — size unchanged
// //   card: {
// //     width: CARD_SIZE,
// //     backgroundColor: C.surfaceAlt,
// //     borderRadius: 12,
// //     overflow: "hidden",
// //     borderWidth: 0.5,
// //     borderColor: C.border,
// //   },
// //   imgWrap: {
// //     width: "100%",
// //     aspectRatio: 1,
// //     backgroundColor: C.bg,
// //     position: "relative",
// //   },
// //   productImg: { width: "100%", height: "100%" },
// //   imgPlaceholder: {
// //     flex: 1,
// //     alignItems: "center",
// //     justifyContent: "center",
// //     backgroundColor: C.bg,
// //   },
// //   imgPlaceholderText: { fontSize: 28 },

// //   // info
// //   cardInfo: { padding: 6 },
// //   priceRow: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginBottom: 3,
// //   },
// //   priceBadge: {
// //     backgroundColor: "#2E7D32",
// //     borderRadius: 5,
// //     paddingHorizontal: 6,
// //     paddingVertical: 2,
// //   },
// //   priceText: { color: "#fff", fontSize: 11, fontWeight: "700" },
// //   productName: {
// //     fontSize: 11,
// //     fontWeight: "600",
// //     color: C.ink,
// //     marginBottom: 1,
// //     lineHeight: 15,
// //   },
// //   qtyText: { fontSize: 10, color: C.inkLight },
// //   productCategory: {
// //     fontSize: 9,
// //     fontWeight: "700",
// //     color: C.inkLight,
// //     letterSpacing: 0.6,
// //     textTransform: "uppercase",
// //     marginTop: 2,
// //   },

// //   // ── edit / delete — top-right overlay on image ──
// //   cardOverlayActions: {
// //     position: "absolute",
// //     top: 5,
// //     right: 5,
// //     flexDirection: "column",
// //     gap: 4,
// //   },
// //   overlayBtn: {
// //     width: 24,
// //     height: 24,
// //     borderRadius: 6,
// //     backgroundColor: "rgba(255,255,255,0.90)",
// //     borderWidth: 1,
// //     borderColor: C.borderLight,
// //     alignItems: "center",
// //     justifyContent: "center",
// //   },
// //   overlayBtnDelete: {
// //     borderColor: "#F0DADA",
// //     backgroundColor: "rgba(255,245,245,0.92)",
// //   },

// //   // order card
// //   orderCard: {
// //     backgroundColor: C.surfaceAlt,
// //     borderRadius: 12,
// //     padding: 18,
// //     borderWidth: 1,
// //     borderColor: C.border,
// //     shadowColor: C.shadow,
// //     shadowOffset: { width: 0, height: 1 },
// //     shadowOpacity: 0.04,
// //     shadowRadius: 4,
// //     elevation: 1,
// //   },
// //   orderCardTop: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginBottom: 4,
// //   },
// //   orderId: {
// //     fontSize: 11,
// //     fontWeight: "800",
// //     color: C.inkLight,
// //     letterSpacing: 1.5,
// //   },
// //   statusRow: { flexDirection: "row", alignItems: "center", gap: 5 },
// //   statusDot: { width: 6, height: 6, borderRadius: 3 },
// //   statusLabel: { fontSize: 12, fontWeight: "600", color: C.inkMid },
// //   orderBuyer: {
// //     fontSize: 15,
// //     fontWeight: "700",
// //     color: C.ink,
// //     marginBottom: 12,
// //     letterSpacing: -0.2,
// //   },
// //   orderItemsWrap: {
// //     backgroundColor: C.bg,
// //     borderRadius: 8,
// //     padding: 12,
// //     gap: 5,
// //     marginBottom: 12,
// //   },
// //   orderItemRow: { fontSize: 13, color: C.inkMid, fontWeight: "500" },
// //   orderItemQty: { color: C.inkLight },
// //   orderFooter: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     paddingTop: 12,
// //     borderTopWidth: 1,
// //     borderTopColor: C.borderLight,
// //   },
// //   orderDate: { fontSize: 11, color: C.inkLight, letterSpacing: 0.3 },
// //   orderTotal: {
// //     fontSize: 17,
// //     fontWeight: "800",
// //     color: C.ink,
// //     letterSpacing: -0.3,
// //   },

// //   // bottom nav
// //   nav: {
// //     position: "absolute",
// //     bottom: 0,
// //     left: 0,
// //     right: 0,
// //     backgroundColor: C.surfaceAlt,
// //     borderTopWidth: 1,
// //     borderTopColor: C.border,
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-around",
// //     paddingTop: 10,
// //     paddingHorizontal: 20,
// //   },
// //   navItem: {
// //     flex: 1,
// //     alignItems: "center",
// //     justifyContent: "center",
// //     gap: 3,
// //     paddingTop: 6,
// //   },
// //   navLabel: {
// //     fontSize: 11,
// //     color: C.inkLight,
// //     fontWeight: "500",
// //     letterSpacing: 0.3,
// //   },
// //   navLabelActive: { color: C.ink, fontWeight: "700" },
// //   navAdd: {
// //     width: 50,
// //     height: 50,
// //     borderRadius: 25,
// //     backgroundColor: C.ink,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     marginBottom: 10,
// //     shadowColor: C.shadow,
// //     shadowOffset: { width: 0, height: 4 },
// //     shadowOpacity: 0.25,
// //     shadowRadius: 10,
// //     elevation: 6,
// //   },

// //   // edit modal
// //   modalOverlay: {
// //     flex: 1,
// //     justifyContent: "flex-end",
// //     backgroundColor: "rgba(26,25,22,0.4)",
// //   },
// //   modalSheet: {
// //     backgroundColor: C.surfaceAlt,
// //     borderTopLeftRadius: 20,
// //     borderTopRightRadius: 20,
// //     maxHeight: "92%",
// //   },
// //   modalHandle: {
// //     width: 36,
// //     height: 3,
// //     borderRadius: 2,
// //     backgroundColor: C.border,
// //     alignSelf: "center",
// //     marginTop: 12,
// //     marginBottom: 4,
// //   },
// //   modalHead: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     paddingHorizontal: 24,
// //     paddingVertical: 16,
// //     borderBottomWidth: 1,
// //     borderBottomColor: C.borderLight,
// //   },
// //   modalTitle: {
// //     fontSize: 16,
// //     fontWeight: "800",
// //     color: C.ink,
// //     letterSpacing: -0.2,
// //   },
// //   modalClose: {
// //     width: 30,
// //     height: 30,
// //     borderRadius: 15,
// //     backgroundColor: C.bg,
// //     borderWidth: 1,
// //     borderColor: C.border,
// //     justifyContent: "center",
// //     alignItems: "center",
// //   },
// //   modalBody: { padding: 24, paddingBottom: 44 },

// //   fieldLabel: {
// //     fontSize: 10,
// //     fontWeight: "700",
// //     color: C.inkLight,
// //     letterSpacing: 1.2,
// //     marginBottom: 7,
// //     marginTop: 4,
// //   },
// //   field: {
// //     backgroundColor: C.bg,
// //     borderWidth: 1,
// //     borderColor: C.border,
// //     borderRadius: 8,
// //     paddingHorizontal: 14,
// //     paddingVertical: 13,
// //     marginBottom: 16,
// //     fontSize: 14,
// //     color: C.ink,
// //   },
// //   fieldArea: { height: 76, textAlignVertical: "top" },
// //   fieldRow: { flexDirection: "row" },
// //   saveBtn: {
// //     backgroundColor: C.ink,
// //     paddingVertical: 15,
// //     borderRadius: 10,
// //     marginTop: 4,
// //     alignItems: "center",
// //   },
// //   saveBtnText: {
// //     color: "#fff",
// //     fontWeight: "700",
// //     fontSize: 14,
// //     letterSpacing: 0.5,
// //   },

// //   // category chips
// //   chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
// //   chip: {
// //     paddingHorizontal: 12,
// //     paddingVertical: 6,
// //     borderRadius: 16,
// //     borderWidth: 1.5,
// //     borderColor: C.border,
// //     backgroundColor: C.bg,
// //   },
// //   chipActive: { backgroundColor: C.ink, borderColor: C.ink },
// //   chipText: { fontSize: 12, fontWeight: "600", color: C.inkMid },
// //   chipTextActive: { color: "#fff" },
// // });

// import React, { useState, useCallback, useEffect } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   Modal,
//   TextInput,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   Image,
//   StatusBar,
//   Alert,
// } from "react-native";
// import { useFocusEffect } from "@react-navigation/native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { apiRequest } from "../services/api";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const C = {
//   bg: "#F5F4F0",
//   surface: "#FAFAF8",
//   surfaceAlt: "#FFFFFF",
//   border: "#E6E4DE",
//   borderLight: "#EEECE7",
//   ink: "#1A1916",
//   inkMid: "#6B6860",
//   inkLight: "#A8A59E",
//   accent: "#1A1916",
//   shadow: "#1A1916",
// };

// export default function Home({ navigation }) {
//   const insets = useSafeAreaInsets();

//   const [activeTab, setActiveTab] = useState("store");
//   const [isProfileCompleted, setIsProfileCompleted] = useState(false);
//   const [businessName, setBusinessName] = useState("");
//   const [products, setProducts] = useState([]);
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // ── edit modal ──────────────────────────────────────────
//   const [editVisible, setEditVisible] = useState(false);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [editName, setEditName] = useState("");
//   const [editDescription, setEditDescription] = useState("");
//   const [editPrice, setEditPrice] = useState("");
//   const [editQuantity, setEditQuantity] = useState("");
//   const [editUnit, setEditUnit] = useState("");
//   const [editCategoryId, setEditCategoryId] = useState(null);
//   const [saving, setSaving] = useState(false);

//   // ── categories ──────────────────────────────────────────
//   const [categories, setCategories] = useState([]);

//   useEffect(() => {
//     const loadCategories = async () => {
//       try {
//         const res = await apiRequest("/categories", "GET");
//         if (Array.isArray(res)) setCategories(res);
//       } catch (err) {
//         console.log("Categories fetch error:", err);
//       }
//     };
//     loadCategories();
//   }, []);

//   const fetchHomeData = async () => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem("token");
//       if (!token) return;

//       const profileRes = await apiRequest("/wholesaler/profile", "GET", null, token);
//       if (profileRes?.isProfileCompleted) {
//         setIsProfileCompleted(true);
//         if (profileRes?.profile?.businessName) {
//           setBusinessName(profileRes.profile.businessName);
//         }
//       }

//       const productsRes = await apiRequest("/wholesaler/products", "GET", null, token);
//       if (Array.isArray(productsRes)) setProducts(productsRes);

//       // ── Fetch orders ──────────────────────────────────────
//       try {
//         const ordersRes = await apiRequest("/wholesaler/orders", "GET", null, token);
//         console.log("ORDERS RES 👉", JSON.stringify(ordersRes));
//         if (Array.isArray(ordersRes?.orders)) {
//           setOrders(ordersRes.orders);
//         } else if (Array.isArray(ordersRes)) {
//           setOrders(ordersRes);
//         } else {
//           setOrders([]);
//         }
//       } catch (orderErr) {
//         console.log("ORDERS FETCH ERROR 👉", orderErr);
//         setOrders([]);
//       }
//     } catch (error) {
//       console.log("HOME FETCH ERROR 👉", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchHomeData();
//     }, [])
//   );

//   const openEdit = (product) => {
//     setEditingProduct(product);
//     setEditName(product.name || "");
//     setEditDescription(product.description || "");
//     setEditPrice(String(product.price || ""));
//     setEditQuantity(String(product.quantity || ""));
//     setEditUnit(product.unit || "");
//     setEditCategoryId(product.categoryId?._id || null);
//     setEditVisible(true);
//   };

//   const handleSaveProduct = async () => {
//     if (!editName || !editPrice || !editQuantity || !editUnit) {
//       Alert.alert("Missing fields", "Please fill all required fields.");
//       return;
//     }
//     try {
//       setSaving(true);
//       const token = await AsyncStorage.getItem("token");
//       if (!token) {
//         Alert.alert("Session expired", "Please login again.");
//         return;
//       }

//       const res = await apiRequest(
//         `/wholesaler/products/${editingProduct._id}`,
//         "PUT",
//         {
//           name: editName.trim(),
//           description: editDescription.trim(),
//           price: Number(editPrice),
//           quantity: Number(editQuantity),
//           unit: editUnit.trim(),
//           categoryId: editCategoryId,
//         },
//         token
//       );

//       const updated = res.product || res;
//       if (!updated || !updated._id) {
//         await fetchHomeData();
//         setEditVisible(false);
//         return;
//       }
//       setProducts((prev) =>
//         prev.map((p) => (p._id === updated._id ? updated : p))
//       );
//       setEditVisible(false);
//     } catch (error) {
//       console.log("EDIT PRODUCT ERROR 👉", error);
//       Alert.alert("Error", error.message || "Failed to save changes");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDeleteProduct = async (productId) => {
//     Alert.alert(
//       "Delete product",
//       "Are you sure you want to delete this product?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               const token = await AsyncStorage.getItem("token");
//               if (!token) return;
//               await apiRequest(
//                 `/wholesaler/products/${productId}`,
//                 "DELETE",
//                 null,
//                 token
//               );
//               setProducts((prev) => prev.filter((p) => p._id !== productId));
//             } catch (error) {
//               console.log("DELETE ERROR 👉", error);
//               Alert.alert("Error", "Failed to delete product");
//             }
//           },
//         },
//       ]
//     );
//   };

//   const statusStyle = (status) => {
//     switch (status?.toLowerCase()) {
//       case "pending":
//         return { dot: "#C9943A", label: "Pending" };
//       case "confirmed":
//         return { dot: "#4A7C6F", label: "Confirmed" };
//       case "delivered":
//         return { dot: "#3A6B3A", label: "Delivered" };
//       case "cancelled":
//         return { dot: "#8B3A3A", label: "Cancelled" };
//       default:
//         return { dot: C.inkLight, label: status || "Pending" };
//     }
//   };

//   if (loading) {
//     return (
//       <View style={[s.safe, { paddingTop: insets.top }]}>
//         <ActivityIndicator style={{ flex: 1 }} size="large" color={C.ink} />
//       </View>
//     );
//   }

//   // ── PRODUCT CARD ───────────────────────────────────────────
//   const renderProduct = ({ item }) => {
//     const firstImage =
//       Array.isArray(item.images) && item.images.length > 0
//         ? item.images[0]
//         : null;

//     return (
//       <View style={s.card}>
//         {/* Image with top-right action buttons */}
//         <View style={s.imgWrap}>
//           {firstImage ? (
//             <Image
//               source={{ uri: firstImage }}
//               style={s.productImg}
//               resizeMode="cover"
//             />
//           ) : (
//             <View style={s.imgPlaceholder}>
//               <Text style={s.imgPlaceholderText}>📦</Text>
//             </View>
//           )}

//           {/* ── Edit / Delete — top-right corner of image ── */}
//           <View style={s.cardOverlayActions}>
//             <TouchableOpacity
//               style={s.overlayBtn}
//               onPress={() => openEdit(item)}
//               activeOpacity={0.75}
//             >
//               <Ionicons name="pencil-outline" size={11} color={C.inkMid} />
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[s.overlayBtn, s.overlayBtnDelete]}
//               onPress={() => handleDeleteProduct(item._id)}
//               activeOpacity={0.75}
//             >
//               <Ionicons name="trash-outline" size={11} color="#B94040" />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Info */}
//         <View style={s.cardInfo}>
//           <View style={s.priceRow}>
//             <View style={s.priceBadge}>
//               <Text style={s.priceText}>₹{item.price}</Text>
//             </View>
//           </View>
//           <Text style={s.productName} numberOfLines={2}>
//             {item.name}
//           </Text>
//           <Text style={s.qtyText} numberOfLines={1}>
//             {item.quantity} {item.unit}
//           </Text>
//           {item.categoryId?.name ? (
//             <Text style={s.productCategory} numberOfLines={1}>
//               {item.categoryId.name}
//             </Text>
//           ) : null}
//         </View>
//       </View>
//     );
//   };

//   // ── ORDER CARD ─────────────────────────────────────────────
//   const renderOrder = ({ item }) => {
//     const st = statusStyle(item.status);
//     return (
//       <View style={s.orderCard}>
//         <View style={s.orderCardTop}>
//           <Text style={s.orderId}>
//             #{item._id?.slice(-6).toUpperCase()}
//           </Text>
//           <View style={s.statusRow}>
//             <View style={[s.statusDot, { backgroundColor: st.dot }]} />
//             <Text style={s.statusLabel}>{st.label}</Text>
//           </View>
//         </View>

//         {/* Vendor name */}
//         <Text style={s.orderBuyer}>
//           {item.vendor?.businessName || "Vendor"}
//         </Text>

//         {/* Product info */}
//         {item.product && (
//           <View style={s.orderItemsWrap}>
//             <Text style={s.orderItemRow}>
//               {item.product.name}
//               <Text style={s.orderItemQty}>{"  "}×{item.quantity}</Text>
//             </Text>
//           </View>
//         )}

//         {/* Vendor contact details */}
//         {(item.vendor?.phone || item.vendor?.address) && (
//           <View style={s.vendorDetails}>
//             {item.vendor?.phone ? (
//               <View style={s.vendorDetailRow}>
//                 <Ionicons name="call-outline" size={12} color={C.inkLight} />
//                 <Text style={s.vendorDetailText}>{item.vendor.phone}</Text>
//               </View>
//             ) : null}
//             {item.vendor?.address ? (
//               <View style={s.vendorDetailRow}>
//                 <Ionicons name="location-outline" size={12} color={C.inkLight} />
//                 <Text style={s.vendorDetailText} numberOfLines={1}>
//                   {item.vendor.address}
//                 </Text>
//               </View>
//             ) : null}
//           </View>
//         )}

//         <View style={s.orderFooter}>
//           <Text style={s.orderDate}>
//             {item.createdAt
//               ? new Date(item.createdAt).toLocaleDateString("en-IN", {
//                   day: "numeric",
//                   month: "short",
//                   year: "numeric",
//                 })
//               : ""}
//           </Text>
//           <Text style={s.orderTotal}>
//             ₹{item.totalAmount ?? (item.product?.price ?? 0) * (item.quantity ?? 1)}
//           </Text>
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={[s.safe, { paddingTop: insets.top }]}>
//       <StatusBar barStyle="dark-content" backgroundColor={C.surfaceAlt} />
//       <View style={s.container}>

//         {/* ── HEADER ── */}
//         <View style={s.header}>
//           <View style={s.headerTop}>
//             <Text style={s.wordmark} numberOfLines={1}>
//               {businessName ? businessName.toUpperCase() : "MY STORE"}
//             </Text>

//             <View style={s.headerRight}>
//               <Text style={s.headerMeta}>
//                 {activeTab === "store"
//                   ? `${products.length} item${products.length !== 1 ? "s" : ""}`
//                   : `${orders.length} order${orders.length !== 1 ? "s" : ""}`}
//               </Text>
//               {/* ── Profile icon top-right ── */}
//               <TouchableOpacity
//                 style={s.profileIconBtn}
//                 onPress={() => navigation.navigate("profile")}
//                 activeOpacity={0.7}
//               >
//                 <Ionicons name="person-circle-outline" size={26} color={C.inkMid} />
//               </TouchableOpacity>
//             </View>
//           </View>

//           <View style={s.tabRow}>
//             <TouchableOpacity
//               style={[s.tabPill, activeTab === "store" && s.tabPillActive]}
//               onPress={() => setActiveTab("store")}
//               activeOpacity={0.75}
//             >
//               <Text
//                 style={[
//                   s.tabPillText,
//                   activeTab === "store" && s.tabPillTextActive,
//                 ]}
//               >
//                 Products
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[s.tabPill, activeTab === "orders" && s.tabPillActive]}
//               onPress={() => setActiveTab("orders")}
//               activeOpacity={0.75}
//             >
//               <Text
//                 style={[
//                   s.tabPillText,
//                   activeTab === "orders" && s.tabPillTextActive,
//                 ]}
//               >
//                 Orders
//               </Text>
//               {orders.length > 0 && (
//                 <View
//                   style={[
//                     s.tabBadge,
//                     activeTab === "orders" && s.tabBadgeActive,
//                   ]}
//                 >
//                   <Text
//                     style={[
//                       s.tabBadgeText,
//                       activeTab === "orders" && s.tabBadgeTextActive,
//                     ]}
//                   >
//                     {orders.length}
//                   </Text>
//                 </View>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* ── PRODUCTS TAB ── */}
//         {activeTab === "store" &&
//           (products.length === 0 ? (
//             <View style={s.emptyWrap}>
//               <View style={s.emptyBox}>
//                 <Text style={s.emptyGlyph}>—</Text>
//                 <Text style={s.emptyTitle}>No products yet</Text>
//                 <Text style={s.emptyDesc}>
//                   {!isProfileCompleted
//                     ? "Complete your profile to start listing products."
//                     : "Tap + below to add your first product."}
//                 </Text>
//                 {!isProfileCompleted && (
//                   <TouchableOpacity
//                     style={s.emptyBtn}
//                     onPress={() => navigation.navigate("profile")}
//                     activeOpacity={0.85}
//                   >
//                     <Text style={s.emptyBtnText}>Set up profile</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             </View>
//           ) : (
//             <FlatList
//               data={products}
//               keyExtractor={(item) => item._id}
//               numColumns={3}
//               columnWrapperStyle={s.row}
//               contentContainerStyle={s.list}
//               showsVerticalScrollIndicator={false}
//               renderItem={renderProduct}
//             />
//           ))}

//         {/* ── ORDERS TAB ── */}
//         {activeTab === "orders" &&
//           (orders.length === 0 ? (
//             <View style={s.emptyWrap}>
//               <View style={s.emptyBox}>
//                 <Text style={s.emptyGlyph}>—</Text>
//                 <Text style={s.emptyTitle}>No orders yet</Text>
//                 <Text style={s.emptyDesc}>Buyer orders will appear here.</Text>
//               </View>
//             </View>
//           ) : (
//             <FlatList
//               data={orders}
//               keyExtractor={(item) => item._id}
//               contentContainerStyle={s.list}
//               showsVerticalScrollIndicator={false}
//               renderItem={renderOrder}
//             />
//           ))}
//       </View>

//       {/* ── BOTTOM NAV ── */}
//       <View style={[s.nav, { paddingBottom: insets.bottom + 10 }]}>
//         {/* Home */}
//         <TouchableOpacity style={s.navItem} activeOpacity={0.7}>
//           <Ionicons name="home" size={22} color={C.ink} />
//           <Text style={[s.navLabel, s.navLabelActive]}>Home</Text>
//         </TouchableOpacity>

//         {/* Add product FAB */}
//         <TouchableOpacity
//           style={s.navAdd}
//           onPress={() => navigation.navigate("addProduct")}
//           activeOpacity={0.85}
//         >
//           <Ionicons name="add" size={28} color="#fff" />
//         </TouchableOpacity>

//         {/* Orders tab in bottom nav */}
//         <TouchableOpacity
//           style={s.navItem}
//           onPress={() => setActiveTab("orders")}
//           activeOpacity={0.7}
//         >
//           <View style={s.navOrderIconWrap}>
//             <Ionicons
//               name="receipt-outline"
//               size={22}
//               color={activeTab === "orders" ? C.ink : C.inkMid}
//             />
//             {orders.length > 0 && (
//               <View style={s.navBadge}>
//                 <Text style={s.navBadgeText}>
//                   {orders.length > 99 ? "99+" : orders.length}
//                 </Text>
//               </View>
//             )}
//           </View>
//           <Text style={[s.navLabel, activeTab === "orders" && s.navLabelActive]}>
//             Orders
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* ── EDIT MODAL ── */}
//       <Modal
//         visible={editVisible}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setEditVisible(false)}
//       >
//         <KeyboardAvoidingView
//           style={s.modalOverlay}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//           <View style={s.modalSheet}>
//             <View style={s.modalHandle} />
//             <View style={s.modalHead}>
//               <Text style={s.modalTitle}>Edit Product</Text>
//               <TouchableOpacity
//                 style={s.modalClose}
//                 onPress={() => setEditVisible(false)}
//                 activeOpacity={0.7}
//               >
//                 <Ionicons name="close" size={16} color={C.inkMid} />
//               </TouchableOpacity>
//             </View>

//             <ScrollView
//               contentContainerStyle={s.modalBody}
//               keyboardShouldPersistTaps="handled"
//               showsVerticalScrollIndicator={false}
//             >
//               {/* Category chips */}
//               <Text style={s.fieldLabel}>CATEGORY</Text>
//               <View style={s.chipGrid}>
//                 {categories.map((cat) => {
//                   const active = editCategoryId === cat._id;
//                   return (
//                     <TouchableOpacity
//                       key={cat._id}
//                       style={[s.chip, active && s.chipActive]}
//                       onPress={() => setEditCategoryId(cat._id)}
//                       activeOpacity={0.75}
//                     >
//                       <Text style={[s.chipText, active && s.chipTextActive]}>
//                         {cat.name}
//                       </Text>
//                     </TouchableOpacity>
//                   );
//                 })}
//               </View>

//               <Text style={s.fieldLabel}>PRODUCT NAME</Text>
//               <TextInput
//                 style={s.field}
//                 placeholder="Name"
//                 placeholderTextColor={C.inkLight}
//                 value={editName}
//                 onChangeText={setEditName}
//               />

//               <Text style={s.fieldLabel}>DESCRIPTION</Text>
//               <TextInput
//                 style={[s.field, s.fieldArea]}
//                 placeholder="Optional"
//                 placeholderTextColor={C.inkLight}
//                 value={editDescription}
//                 onChangeText={setEditDescription}
//                 multiline
//                 numberOfLines={3}
//               />

//               <View style={s.fieldRow}>
//                 <View style={{ flex: 1 }}>
//                   <Text style={s.fieldLabel}>PRICE (₹)</Text>
//                   <TextInput
//                     style={s.field}
//                     placeholder="0"
//                     placeholderTextColor={C.inkLight}
//                     value={editPrice}
//                     onChangeText={setEditPrice}
//                     keyboardType="numeric"
//                   />
//                 </View>
//                 <View style={{ width: 12 }} />
//                 <View style={{ flex: 1 }}>
//                   <Text style={s.fieldLabel}>QUANTITY</Text>
//                   <TextInput
//                     style={s.field}
//                     placeholder="0"
//                     placeholderTextColor={C.inkLight}
//                     value={editQuantity}
//                     onChangeText={setEditQuantity}
//                     keyboardType="numeric"
//                   />
//                 </View>
//               </View>

//               <Text style={s.fieldLabel}>UNIT</Text>
//               <TextInput
//                 style={s.field}
//                 placeholder="kg / litre / piece"
//                 placeholderTextColor={C.inkLight}
//                 value={editUnit}
//                 onChangeText={setEditUnit}
//               />

//               <TouchableOpacity
//                 style={[s.saveBtn, saving && { opacity: 0.5 }]}
//                 onPress={handleSaveProduct}
//                 activeOpacity={0.85}
//                 disabled={saving}
//               >
//                 {saving ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <Text style={s.saveBtnText}>Save Changes</Text>
//                 )}
//               </TouchableOpacity>
//             </ScrollView>
//           </View>
//         </KeyboardAvoidingView>
//       </Modal>
//     </View>
//   );
// }

// const NAV_H = 72;
// const CARD_SIZE = "31%";
// const s = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: C.bg },
//   container: { flex: 1, paddingBottom: NAV_H },

//   // header
//   header: {
//     backgroundColor: C.surfaceAlt,
//     paddingHorizontal: 24,
//     paddingTop: 28,
//     paddingBottom: 0,
//     borderBottomWidth: 1,
//     borderBottomColor: C.border,
//   },
//   headerTop: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   wordmark: {
//     fontSize: 14,
//     fontWeight: "800",
//     letterSpacing: 0.8,
//     color: C.ink,
//     flex: 1,
//   },
//   headerRight: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//   },
//   headerMeta: { fontSize: 12, color: C.inkLight, letterSpacing: 0.5 },
//   profileIconBtn: {
//     padding: 2,
//   },

//   // tab pills
//   tabRow: { flexDirection: "row", gap: 6, marginBottom: -1 },
//   tabPill: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//     paddingVertical: 10,
//     paddingHorizontal: 4,
//     marginRight: 8,
//     borderBottomWidth: 2,
//     borderBottomColor: "transparent",
//   },
//   tabPillActive: { borderBottomColor: C.ink },
//   tabPillText: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: C.inkLight,
//     letterSpacing: 0.2,
//   },
//   tabPillTextActive: { color: C.ink },
//   tabBadge: {
//     backgroundColor: C.border,
//     borderRadius: 10,
//     paddingHorizontal: 6,
//     paddingVertical: 1,
//     minWidth: 18,
//     alignItems: "center",
//   },
//   tabBadgeActive: { backgroundColor: C.ink },
//   tabBadgeText: { fontSize: 10, fontWeight: "700", color: C.inkMid },
//   tabBadgeTextActive: { color: "#fff" },

//   // empty
//   emptyWrap: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 40,
//   },
//   emptyBox: { alignItems: "center" },
//   emptyGlyph: {
//     fontSize: 32,
//     color: C.border,
//     marginBottom: 20,
//     letterSpacing: -2,
//   },
//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: C.ink,
//     marginBottom: 8,
//     letterSpacing: -0.3,
//   },
//   emptyDesc: {
//     fontSize: 13,
//     color: C.inkMid,
//     textAlign: "center",
//     lineHeight: 20,
//     marginBottom: 28,
//   },
//   emptyBtn: {
//     borderWidth: 1.5,
//     borderColor: C.ink,
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//   },
//   emptyBtnText: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: C.ink,
//     letterSpacing: 0.5,
//   },

//   // grid
//   list: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 100 },
//   row: { justifyContent: "space-between", marginBottom: 10 },

//   // card
//   card: {
//     width: CARD_SIZE,
//     backgroundColor: C.surfaceAlt,
//     borderRadius: 12,
//     overflow: "hidden",
//     borderWidth: 0.5,
//     borderColor: C.border,
//   },
//   imgWrap: {
//     width: "100%",
//     aspectRatio: 1,
//     backgroundColor: C.bg,
//     position: "relative",
//   },
//   productImg: { width: "100%", height: "100%" },
//   imgPlaceholder: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: C.bg,
//   },
//   imgPlaceholderText: { fontSize: 28 },

//   // info
//   cardInfo: { padding: 6 },
//   priceRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 3,
//   },
//   priceBadge: {
//     backgroundColor: "#2E7D32",
//     borderRadius: 5,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//   },
//   priceText: { color: "#fff", fontSize: 11, fontWeight: "700" },
//   productName: {
//     fontSize: 11,
//     fontWeight: "600",
//     color: C.ink,
//     marginBottom: 1,
//     lineHeight: 15,
//   },
//   qtyText: { fontSize: 10, color: C.inkLight },
//   productCategory: {
//     fontSize: 9,
//     fontWeight: "700",
//     color: C.inkLight,
//     letterSpacing: 0.6,
//     textTransform: "uppercase",
//     marginTop: 2,
//   },

//   // overlay actions on product card
//   cardOverlayActions: {
//     position: "absolute",
//     top: 5,
//     right: 5,
//     flexDirection: "column",
//     gap: 4,
//   },
//   overlayBtn: {
//     width: 24,
//     height: 24,
//     borderRadius: 6,
//     backgroundColor: "rgba(255,255,255,0.90)",
//     borderWidth: 1,
//     borderColor: C.borderLight,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   overlayBtnDelete: {
//     borderColor: "#F0DADA",
//     backgroundColor: "rgba(255,245,245,0.92)",
//   },

//   // order card
//   orderCard: {
//     backgroundColor: C.surfaceAlt,
//     borderRadius: 12,
//     padding: 18,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: C.border,
//     shadowColor: C.shadow,
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.04,
//     shadowRadius: 4,
//     elevation: 1,
//   },
//   orderCardTop: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   orderId: {
//     fontSize: 11,
//     fontWeight: "800",
//     color: C.inkLight,
//     letterSpacing: 1.5,
//   },
//   statusRow: { flexDirection: "row", alignItems: "center", gap: 5 },
//   statusDot: { width: 6, height: 6, borderRadius: 3 },
//   statusLabel: { fontSize: 12, fontWeight: "600", color: C.inkMid },
//   orderBuyer: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: C.ink,
//     marginBottom: 12,
//     letterSpacing: -0.2,
//   },
//   orderItemsWrap: {
//     backgroundColor: C.bg,
//     borderRadius: 8,
//     padding: 12,
//     gap: 5,
//     marginBottom: 10,
//   },
//   orderItemRow: { fontSize: 13, color: C.inkMid, fontWeight: "500" },
//   orderItemQty: { color: C.inkLight },

//   // vendor contact details
//   vendorDetails: {
//     gap: 4,
//     marginBottom: 10,
//   },
//   vendorDetailRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 5,
//   },
//   vendorDetailText: {
//     fontSize: 12,
//     color: C.inkLight,
//     flex: 1,
//   },

//   orderFooter: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: C.borderLight,
//   },
//   orderDate: { fontSize: 11, color: C.inkLight, letterSpacing: 0.3 },
//   orderTotal: {
//     fontSize: 17,
//     fontWeight: "800",
//     color: C.ink,
//     letterSpacing: -0.3,
//   },

//   // bottom nav
//   nav: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: C.surfaceAlt,
//     borderTopWidth: 1,
//     borderTopColor: C.border,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-around",
//     paddingTop: 10,
//     paddingHorizontal: 20,
//   },
//   navItem: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 3,
//     paddingTop: 6,
//   },
//   navLabel: {
//     fontSize: 11,
//     color: C.inkLight,
//     fontWeight: "500",
//     letterSpacing: 0.3,
//   },
//   navLabelActive: { color: C.ink, fontWeight: "700" },
//   navAdd: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: C.ink,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 10,
//     shadowColor: C.shadow,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 10,
//     elevation: 6,
//   },
//   navOrderIconWrap: {
//     position: "relative",
//   },
//   navBadge: {
//     position: "absolute",
//     top: -4,
//     right: -8,
//     backgroundColor: "#C9943A",
//     borderRadius: 8,
//     minWidth: 16,
//     height: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 3,
//   },
//   navBadgeText: {
//     fontSize: 9,
//     fontWeight: "800",
//     color: "#fff",
//   },

//   // edit modal
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "flex-end",
//     backgroundColor: "rgba(26,25,22,0.4)",
//   },
//   modalSheet: {
//     backgroundColor: C.surfaceAlt,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: "92%",
//   },
//   modalHandle: {
//     width: 36,
//     height: 3,
//     borderRadius: 2,
//     backgroundColor: C.border,
//     alignSelf: "center",
//     marginTop: 12,
//     marginBottom: 4,
//   },
//   modalHead: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 24,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: C.borderLight,
//   },
//   modalTitle: {
//     fontSize: 16,
//     fontWeight: "800",
//     color: C.ink,
//     letterSpacing: -0.2,
//   },
//   modalClose: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: C.bg,
//     borderWidth: 1,
//     borderColor: C.border,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalBody: { padding: 24, paddingBottom: 44 },

//   fieldLabel: {
//     fontSize: 10,
//     fontWeight: "700",
//     color: C.inkLight,
//     letterSpacing: 1.2,
//     marginBottom: 7,
//     marginTop: 4,
//   },
//   field: {
//     backgroundColor: C.bg,
//     borderWidth: 1,
//     borderColor: C.border,
//     borderRadius: 8,
//     paddingHorizontal: 14,
//     paddingVertical: 13,
//     marginBottom: 16,
//     fontSize: 14,
//     color: C.ink,
//   },
//   fieldArea: { height: 76, textAlignVertical: "top" },
//   fieldRow: { flexDirection: "row" },
//   saveBtn: {
//     backgroundColor: C.ink,
//     paddingVertical: 15,
//     borderRadius: 10,
//     marginTop: 4,
//     alignItems: "center",
//   },
//   saveBtnText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 14,
//     letterSpacing: 0.5,
//   },

//   // category chips
//   chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
//   chip: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//     borderWidth: 1.5,
//     borderColor: C.border,
//     backgroundColor: C.bg,
//   },
//   chipActive: { backgroundColor: C.ink, borderColor: C.ink },
//   chipText: { fontSize: 12, fontWeight: "600", color: C.inkMid },
//   chipTextActive: { color: "#fff" },
// });

import React, { useState, useCallback, useEffect } from "react";
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
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Home as HomeIcon,
  Plus,
  ClipboardList,
  Pencil,
  Trash2,
  X,
  UserCircle,
} from "lucide-react-native";
import { apiRequest } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const C = {
  bg: "#F5F4F0",
  surface: "#FAFAF8",
  surfaceAlt: "#FFFFFF",
  border: "#E6E4DE",
  borderLight: "#EEECE7",
  ink: "#1A1916",
  inkMid: "#6B6860",
  inkLight: "#A8A59E",
  shadow: "#1A1916",
};

export default function Home({ navigation }) {
  const insets = useSafeAreaInsets();

  const [isProfileCompleted, setIsProfileCompleted] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // edit modal
  const [editVisible, setEditVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await apiRequest("/categories", "GET");
        if (Array.isArray(res)) setCategories(res);
      } catch (err) {
        console.log("Categories fetch error:", err);
      }
    };
    loadCategories();
  }, []);

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
    } catch (error) {
      console.log("HOME FETCH ERROR 👉", error);
    } finally {
      setLoading(false);
    }
  };

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
    setEditCategoryId(product.categoryId?._id || null);
    setEditVisible(true);
  };

  const handleSaveProduct = async () => {
    if (!editName || !editPrice || !editQuantity || !editUnit) {
      Alert.alert("Missing fields", "Please fill all required fields.");
      return;
    }
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Session expired", "Please login again.");
        return;
      }
      const res = await apiRequest(
        `/wholesaler/products/${editingProduct._id}`,
        "PUT",
        {
          name: editName.trim(),
          description: editDescription.trim(),
          price: Number(editPrice),
          quantity: Number(editQuantity),
          unit: editUnit.trim(),
          categoryId: editCategoryId,
        },
        token
      );
      const updated = res.product || res;
      if (!updated || !updated._id) {
        await fetchHomeData();
        setEditVisible(false);
        return;
      }
      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );
      setEditVisible(false);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to save changes");
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
              await apiRequest(
                `/wholesaler/products/${productId}`,
                "DELETE",
                null,
                token
              );
              setProducts((prev) => prev.filter((p) => p._id !== productId));
            } catch {
              Alert.alert("Error", "Failed to delete product");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[s.safe, { paddingTop: insets.top }]}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color={C.ink} />
      </View>
    );
  }

  const renderProduct = ({ item }) => {
    const firstImage =
      Array.isArray(item.images) && item.images.length > 0
        ? item.images[0]
        : null;

    return (
      <View style={s.card}>
        <View style={s.imgWrap}>
          {firstImage ? (
            <Image
              source={{ uri: firstImage }}
              style={s.productImg}
              resizeMode="cover"
            />
          ) : (
            <View style={s.imgPlaceholder}>
              <Text style={s.imgPlaceholderText}>📦</Text>
            </View>
          )}

          <View style={s.cardOverlayActions}>
            <TouchableOpacity
              style={s.overlayBtn}
              onPress={() => openEdit(item)}
              activeOpacity={0.75}
            >
              <Pencil size={11} color={C.inkMid} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.overlayBtn, s.overlayBtnDelete]}
              onPress={() => handleDeleteProduct(item._id)}
              activeOpacity={0.75}
            >
              <Trash2 size={11} color="#B94040" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.cardInfo}>
          <View style={s.priceRow}>
            <View style={s.priceBadge}>
              <Text style={s.priceText}>₹{item.price}</Text>
            </View>
          </View>
          <Text style={s.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={s.qtyText} numberOfLines={1}>
            {item.quantity} {item.unit}
          </Text>
          {item.categoryId?.name ? (
            <Text style={s.productCategory} numberOfLines={1}>
              {item.categoryId.name}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={[s.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surfaceAlt} />
      <View style={s.container}>

        {/* HEADER */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <Text style={s.wordmark} numberOfLines={1}>
              {businessName ? businessName.toUpperCase() : "MY STORE"}
            </Text>
            <View style={s.headerRight}>
              <Text style={s.headerMeta}>
                {products.length} item{products.length !== 1 ? "s" : ""}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("profile")}
                activeOpacity={0.7}
                style={s.profileBtn}
              >
                <UserCircle size={26} color={C.inkMid} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* PRODUCTS */}
        {products.length === 0 ? (
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
            numColumns={3}
            columnWrapperStyle={s.row}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
            renderItem={renderProduct}
          />
        )}
      </View>

      {/* BOTTOM NAV */}
      <View style={[s.nav, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={s.navItem} activeOpacity={0.7}>
          <HomeIcon size={22} color={C.ink} />
          <Text style={[s.navLabel, s.navLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.navAdd}
          onPress={() => navigation.navigate("addProduct")}
          activeOpacity={0.85}
        >
          <Plus size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={s.navItem}
          onPress={() => navigation.navigate("orders")}
          activeOpacity={0.7}
        >
          <ClipboardList size={22} color={C.inkMid} />
          <Text style={s.navLabel}>Orders</Text>
        </TouchableOpacity>
      </View>

      {/* EDIT MODAL */}
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
                <X size={16} color={C.inkMid} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={s.modalBody}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={s.fieldLabel}>CATEGORY</Text>
              <View style={s.chipGrid}>
                {categories.map((cat) => {
                  const active = editCategoryId === cat._id;
                  return (
                    <TouchableOpacity
                      key={cat._id}
                      style={[s.chip, active && s.chipActive]}
                      onPress={() => setEditCategoryId(cat._id)}
                      activeOpacity={0.75}
                    >
                      <Text style={[s.chipText, active && s.chipTextActive]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

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
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const NAV_H = 72;
const CARD_SIZE = "31%";

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, paddingBottom: NAV_H },

  header: {
    backgroundColor: C.surfaceAlt,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wordmark: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: C.ink,
    flex: 1,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerMeta: { fontSize: 12, color: C.inkLight, letterSpacing: 0.5 },
  profileBtn: { padding: 2 },

  list: { paddingHorizontal: 10, paddingTop: 10, paddingBottom: 100 },
  row: { justifyContent: "space-between", marginBottom: 10 },

  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyBox: { alignItems: "center" },
  emptyGlyph: { fontSize: 32, color: C.border, marginBottom: 20, letterSpacing: -2 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: C.ink, marginBottom: 8, letterSpacing: -0.3 },
  emptyDesc: { fontSize: 13, color: C.inkMid, textAlign: "center", lineHeight: 20, marginBottom: 28 },
  emptyBtn: { borderWidth: 1.5, borderColor: C.ink, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  emptyBtnText: { fontSize: 13, fontWeight: "700", color: C.ink, letterSpacing: 0.5 },

  card: {
    width: CARD_SIZE,
    backgroundColor: C.surfaceAlt,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: C.border,
  },
  imgWrap: { width: "100%", aspectRatio: 1, backgroundColor: C.bg, position: "relative" },
  productImg: { width: "100%", height: "100%" },
  imgPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.bg },
  imgPlaceholderText: { fontSize: 28 },
  cardInfo: { padding: 6 },
  priceRow: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  priceBadge: { backgroundColor: "#2E7D32", borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  priceText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  productName: { fontSize: 11, fontWeight: "600", color: C.ink, marginBottom: 1, lineHeight: 15 },
  qtyText: { fontSize: 10, color: C.inkLight },
  productCategory: { fontSize: 9, fontWeight: "700", color: C.inkLight, letterSpacing: 0.6, textTransform: "uppercase", marginTop: 2 },

  cardOverlayActions: { position: "absolute", top: 5, right: 5, flexDirection: "column", gap: 4 },
  overlayBtn: {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.90)",
    borderWidth: 1, borderColor: C.borderLight,
    alignItems: "center", justifyContent: "center",
  },
  overlayBtnDelete: { borderColor: "#F0DADA", backgroundColor: "rgba(255,245,245,0.92)" },

  nav: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: C.surfaceAlt,
    borderTopWidth: 1, borderTopColor: C.border,
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 10, paddingHorizontal: 20,
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, paddingTop: 6 },
  navLabel: { fontSize: 11, color: C.inkLight, fontWeight: "500", letterSpacing: 0.3 },
  navLabelActive: { color: C.ink, fontWeight: "700" },
  navAdd: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: C.ink, justifyContent: "center", alignItems: "center",
    marginBottom: 10,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 6,
  },

  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(26,25,22,0.4)" },
  modalSheet: { backgroundColor: C.surfaceAlt, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "92%" },
  modalHandle: { width: 36, height: 3, borderRadius: 2, backgroundColor: C.border, alignSelf: "center", marginTop: 12, marginBottom: 4 },
  modalHead: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 24, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: C.borderLight,
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: C.ink, letterSpacing: -0.2 },
  modalClose: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
    justifyContent: "center", alignItems: "center",
  },
  modalBody: { padding: 24, paddingBottom: 44 },
  fieldLabel: { fontSize: 10, fontWeight: "700", color: C.inkLight, letterSpacing: 1.2, marginBottom: 7, marginTop: 4 },
  field: {
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border,
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 13,
    marginBottom: 16, fontSize: 14, color: C.ink,
  },
  fieldArea: { height: 76, textAlignVertical: "top" },
  fieldRow: { flexDirection: "row" },
  saveBtn: { backgroundColor: C.ink, paddingVertical: 15, borderRadius: 10, marginTop: 4, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 14, letterSpacing: 0.5 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg },
  chipActive: { backgroundColor: C.ink, borderColor: C.ink },
  chipText: { fontSize: 12, fontWeight: "600", color: C.inkMid },
  chipTextActive: { color: "#fff" },
});