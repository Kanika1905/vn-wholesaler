// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   Modal,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
// } from "react-native";
// import { apiRequest } from "../services/api";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // ── Design tokens (same as home.js) ───────────────────────────
// const C = {
//   bg:          "#F5F4F0",
//   surfaceAlt:  "#FFFFFF",
//   border:      "#E6E4DE",
//   borderLight: "#EEECE7",
//   ink:         "#1A1916",
//   inkMid:      "#6B6860",
//   inkLight:    "#A8A59E",
//   shadow:      "#1A1916",
// };

// export default function Profile({ navigation }) {
//   const [isProfileCompleted, setIsProfileCompleted] = useState(false);
//   const [profileData, setProfileData] = useState(null);
//   const [pageLoading, setPageLoading] = useState(true);

//   const [businessName, setBusinessName] = useState("");
//   const [shopAddress, setShopAddress]   = useState("");
//   const [city, setCity]                 = useState("");
//   const [state, setState]               = useState("");
//   const [pincode, setPincode]           = useState("");

//   const [editVisible, setEditVisible] = useState(false);
//   const [saving, setSaving]           = useState(false);

//   const fetchProfile = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       if (!token) return;
//       const res = await apiRequest("/wholesaler/profile", "GET", null, token);
//       if (res?.isProfileCompleted) {
//         const p = res.profile;
//         setProfileData(p);
//         setIsProfileCompleted(true);
//         prefillForm(p);
//       }
//     } catch (error) {
//       console.log("FETCH PROFILE ERROR 👉", error);
//     } finally {
//       setPageLoading(false);
//     }
//   };

//   const prefillForm = (p) => {
//     setBusinessName(p?.businessName || "");
//     setShopAddress(p?.address?.shopAddress || "");
//     setCity(p?.address?.city || "");
//     setState(p?.address?.state || "");
//     setPincode(p?.address?.pincode || "");
//   };

//   useEffect(() => { fetchProfile(); }, []);

//   const handleCompleteProfile = async () => {
//     if (!businessName || !shopAddress || !city || !state || !pincode) {
//       alert("Please fill all details");
//       return;
//     }
//     try {
//       setSaving(true);
//       const token = await AsyncStorage.getItem("token");
//       if (!token) { alert("Login expired."); return; }
//       const res = await apiRequest(
//         "/wholesaler/complete-profile", "PUT",
//         { businessName, address: { shopAddress, city, state, pincode } },
//         token
//       );
//       setProfileData(res);
//       setIsProfileCompleted(true);
//     } catch (error) {
//       alert(error.message || "Failed to update profile");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleUpdateProfile = async () => {
//     if (!businessName || !shopAddress || !city || !state || !pincode) {
//       alert("Please fill all details");
//       return;
//     }
//     try {
//       setSaving(true);
//       const token = await AsyncStorage.getItem("token");
//       if (!token) { alert("Login expired."); return; }
//       const res = await apiRequest(
//         "/wholesaler/update-profile", "PUT",
//         { businessName, address: { shopAddress, city, state, pincode } },
//         token
//       );
//       const updated = res.profile;
//       setProfileData(updated);
//       prefillForm(updated);
//       setEditVisible(false);
//     } catch (error) {
//       alert(error.message || "Failed to save changes");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ── Bottom nav (matches home.js) ──────────────────────────────
//   const BottomNav = () => (
//     <View style={s.nav}>
//       <TouchableOpacity
//         style={s.navItem}
//         onPress={() => navigation.navigate("home")}
//         activeOpacity={0.7}
//       >
//         <Text style={s.navIcon}>⌂</Text>
//         <Text style={s.navLabel}>Home</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={s.navAdd}
//         onPress={() => navigation.navigate("addProduct")}
//         activeOpacity={0.85}
//       >
//         <Text style={s.navAddIcon}>+</Text>
//       </TouchableOpacity>

//       <TouchableOpacity style={s.navItem} activeOpacity={0.7}>
//         <Text style={[s.navIcon, s.navIconActive]}>◎</Text>
//         <Text style={[s.navLabel, s.navLabelActive]}>Profile</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   // ── Loading ───────────────────────────────────────────────────
//   if (pageLoading) {
//     return (
//       <SafeAreaView style={s.safe}>
//         <ActivityIndicator style={{ flex: 1 }} size="large" color={C.ink} />
//       </SafeAreaView>
//     );
//   }

//   // ── PROFILE VIEW ─────────────────────────────────────────────
//   if (isProfileCompleted && profileData) {
//     return (
//       <SafeAreaView style={s.safe}>
//         <View style={s.container}>

//           {/* Header */}
//           <View style={s.header}>
//             <View style={s.headerTop}>
//               <Text style={s.wordmark}>PROFILE</Text>
//               <TouchableOpacity
//                 style={s.editChip}
//                 onPress={() => { prefillForm(profileData); setEditVisible(true); }}
//                 activeOpacity={0.75}
//               >
//                 <Text style={s.editChipText}>Edit</Text>
//               </TouchableOpacity>
//             </View>
//             <Text style={s.headerName}>{profileData.businessName}</Text>
//           </View>

//           <ScrollView
//             contentContainerStyle={s.scrollContent}
//             showsVerticalScrollIndicator={false}
//           >
//             {/* Address card */}
//             <Text style={s.sectionLabel}>BUSINESS ADDRESS</Text>
//             <View style={s.card}>
//               <Field label="SHOP ADDRESS" value={profileData?.address?.shopAddress} />
//               <Divider />
//               <View style={s.fieldRow}>
//                 <View style={{ flex: 1 }}>
//                   <Field label="CITY" value={profileData?.address?.city} />
//                 </View>
//                 <View style={s.fieldSep} />
//                 <View style={{ flex: 1 }}>
//                   <Field label="STATE" value={profileData?.address?.state} />
//                 </View>
//               </View>
//               <Divider />
//               <Field label="PINCODE" value={profileData?.address?.pincode} />
//             </View>
//           </ScrollView>
//         </View>

//         <BottomNav />

//         {/* Edit modal */}
//         <Modal
//           visible={editVisible}
//           animationType="slide"
//           transparent
//           onRequestClose={() => setEditVisible(false)}
//         >
//           <KeyboardAvoidingView
//             style={s.modalOverlay}
//             behavior={Platform.OS === "ios" ? "padding" : "height"}
//           >
//             <View style={s.modalSheet}>
//               <View style={s.modalHandle} />
//               <View style={s.modalHead}>
//                 <Text style={s.modalTitle}>Edit Profile</Text>
//                 <TouchableOpacity
//                   style={s.modalClose}
//                   onPress={() => setEditVisible(false)}
//                   activeOpacity={0.7}
//                 >
//                   <Text style={s.modalCloseText}>✕</Text>
//                 </TouchableOpacity>
//               </View>

//               <ScrollView
//                 contentContainerStyle={s.modalBody}
//                 keyboardShouldPersistTaps="handled"
//                 showsVerticalScrollIndicator={false}
//               >
//                 <Text style={s.fieldLabel}>BUSINESS NAME</Text>
//                 <TextInput
//                   style={s.input}
//                   placeholder="Business Name"
//                   placeholderTextColor={C.inkLight}
//                   value={businessName}
//                   onChangeText={setBusinessName}
//                 />

//                 <Text style={s.fieldLabel}>SHOP ADDRESS</Text>
//                 <TextInput
//                   style={s.input}
//                   placeholder="Shop Address"
//                   placeholderTextColor={C.inkLight}
//                   value={shopAddress}
//                   onChangeText={setShopAddress}
//                 />

//                 <View style={s.inputRow}>
//                   <View style={{ flex: 1 }}>
//                     <Text style={s.fieldLabel}>CITY</Text>
//                     <TextInput
//                       style={s.input}
//                       placeholder="City"
//                       placeholderTextColor={C.inkLight}
//                       value={city}
//                       onChangeText={setCity}
//                     />
//                   </View>
//                   <View style={{ width: 12 }} />
//                   <View style={{ flex: 1 }}>
//                     <Text style={s.fieldLabel}>STATE</Text>
//                     <TextInput
//                       style={s.input}
//                       placeholder="State"
//                       placeholderTextColor={C.inkLight}
//                       value={state}
//                       onChangeText={setState}
//                     />
//                   </View>
//                 </View>

//                 <Text style={s.fieldLabel}>PINCODE</Text>
//                 <TextInput
//                   style={s.input}
//                   placeholder="Pincode"
//                   placeholderTextColor={C.inkLight}
//                   keyboardType="number-pad"
//                   value={pincode}
//                   onChangeText={setPincode}
//                 />

//                 <TouchableOpacity
//                   style={[s.saveBtn, saving && { opacity: 0.5 }]}
//                   onPress={handleUpdateProfile}
//                   activeOpacity={0.85}
//                   disabled={saving}
//                 >
//                   {saving
//                     ? <ActivityIndicator color="#fff" />
//                     : <Text style={s.saveBtnText}>Save Changes</Text>
//                   }
//                 </TouchableOpacity>
//               </ScrollView>
//             </View>
//           </KeyboardAvoidingView>
//         </Modal>
//       </SafeAreaView>
//     );
//   }

//   // ── FIRST TIME SETUP FORM ─────────────────────────────────────
//   return (
//     <SafeAreaView style={s.safe}>
//       <View style={s.container}>
//         <View style={s.header}>
//           <View style={s.headerTop}>
//             <Text style={s.wordmark}>PROFILE</Text>
//           </View>
//           <Text style={s.headerName}>Complete your profile</Text>
//           <Text style={s.headerSub}>Add your business details to get started</Text>
//         </View>

//         <ScrollView
//           contentContainerStyle={[s.scrollContent, { paddingBottom: 110 }]}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >
//           <Text style={s.sectionLabel}>BUSINESS INFO</Text>
//           <View style={s.card}>
//             <Text style={s.fieldLabel}>BUSINESS NAME</Text>
//             <TextInput
//               style={s.inputInCard}
//               placeholder="e.g. Sharma Traders"
//               placeholderTextColor={C.inkLight}
//               value={businessName}
//               onChangeText={setBusinessName}
//             />
//           </View>

//           <Text style={[s.sectionLabel, { marginTop: 24 }]}>ADDRESS</Text>
//           <View style={s.card}>
//             <Text style={s.fieldLabel}>SHOP ADDRESS</Text>
//             <TextInput
//               style={s.inputInCard}
//               placeholder="Street / Area"
//               placeholderTextColor={C.inkLight}
//               value={shopAddress}
//               onChangeText={setShopAddress}
//             />
//             <Divider />

//             <View style={s.inputRow}>
//               <View style={{ flex: 1 }}>
//                 <Text style={s.fieldLabel}>CITY</Text>
//                 <TextInput
//                   style={s.inputInCard}
//                   placeholder="City"
//                   placeholderTextColor={C.inkLight}
//                   value={city}
//                   onChangeText={setCity}
//                 />
//               </View>
//               <View style={{ width: 20 }} />
//               <View style={{ flex: 1 }}>
//                 <Text style={s.fieldLabel}>STATE</Text>
//                 <TextInput
//                   style={s.inputInCard}
//                   placeholder="State"
//                   placeholderTextColor={C.inkLight}
//                   value={state}
//                   onChangeText={setState}
//                 />
//               </View>
//             </View>
//             <Divider />

//             <Text style={s.fieldLabel}>PINCODE</Text>
//             <TextInput
//               style={s.inputInCard}
//               placeholder="6-digit pincode"
//               placeholderTextColor={C.inkLight}
//               keyboardType="number-pad"
//               value={pincode}
//               onChangeText={setPincode}
//             />
//           </View>

//           <TouchableOpacity
//             style={[s.saveBtn, { marginTop: 28 }, saving && { opacity: 0.5 }]}
//             onPress={handleCompleteProfile}
//             activeOpacity={0.85}
//             disabled={saving}
//           >
//             {saving
//               ? <ActivityIndicator color="#fff" />
//               : <Text style={s.saveBtnText}>Save Details</Text>
//             }
//           </TouchableOpacity>
//         </ScrollView>
//       </View>

//       <BottomNav />
//     </SafeAreaView>
//   );
// }

// // ── Helper sub-components ─────────────────────────────────────
// const Field = ({ label, value }) => (
//   <View style={{ paddingVertical: 2 }}>
//     <Text style={fieldS.label}>{label}</Text>
//     <Text style={fieldS.value}>{value || "—"}</Text>
//   </View>
// );

// const Divider = () => <View style={fieldS.divider} />;

// const fieldS = StyleSheet.create({
//   label: {
//     fontSize: 10,
//     fontWeight: "700",
//     color: C.inkLight,
//     letterSpacing: 1.2,
//     marginBottom: 4,
//     marginTop: 2,
//   },
//   value: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: C.ink,
//     letterSpacing: -0.1,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: C.borderLight,
//     marginVertical: 14,
//   },
// });

// const NAV_H = 72;

// const s = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: C.bg },
//   container: { flex: 1, paddingBottom: NAV_H },

//   // ── HEADER ──
//   header: {
//     backgroundColor: C.surfaceAlt,
//     paddingHorizontal: 24,
//     paddingTop: 28,
//     paddingBottom: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: C.border,
//   },
//   headerTop: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   wordmark: {
//     fontSize: 11,
//     fontWeight: "800",
//     letterSpacing: 3,
//     color: C.inkLight,
//   },
//   headerName: {
//     fontSize: 22,
//     fontWeight: "800",
//     color: C.ink,
//     letterSpacing: -0.4,
//   },
//   headerSub: {
//     fontSize: 13,
//     color: C.inkMid,
//     marginTop: 3,
//   },

//   // edit chip
//   editChip: {
//     borderWidth: 1,
//     borderColor: C.border,
//     borderRadius: 6,
//     paddingHorizontal: 12,
//     paddingVertical: 5,
//     backgroundColor: C.bg,
//   },
//   editChipText: {
//     fontSize: 11,
//     fontWeight: "600",
//     color: C.inkMid,
//     letterSpacing: 0.3,
//   },

//   scrollContent: { padding: 20 },

//   sectionLabel: {
//     fontSize: 10,
//     fontWeight: "700",
//     color: C.inkLight,
//     letterSpacing: 1.5,
//     marginBottom: 10,
//     marginLeft: 2,
//   },

//   // ── CARD ──
//   card: {
//     backgroundColor: C.surfaceAlt,
//     borderRadius: 12,
//     padding: 18,
//     borderWidth: 1,
//     borderColor: C.border,
//     shadowColor: C.shadow,
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.04,
//     shadowRadius: 4,
//     elevation: 1,
//   },

//   fieldRow: { flexDirection: "row" },
//   fieldSep: { width: 1, backgroundColor: C.borderLight, marginHorizontal: 16 },

//   // ── FIELD LABEL (in modal / setup form) ──
//   fieldLabel: {
//     fontSize: 10,
//     fontWeight: "700",
//     color: C.inkLight,
//     letterSpacing: 1.2,
//     marginBottom: 7,
//     marginTop: 4,
//   },

//   // ── INPUTS (modal) ──
//   input: {
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
//   // inputs inside white card (setup form)
//   inputInCard: {
//     fontSize: 14,
//     color: C.ink,
//     paddingVertical: 6,
//     paddingHorizontal: 0,
//     marginBottom: 4,
//     borderBottomWidth: 0,
//   },
//   inputRow: { flexDirection: "row" },

//   saveBtn: {
//     backgroundColor: C.ink,
//     paddingVertical: 15,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   saveBtnText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 14,
//     letterSpacing: 0.5,
//   },

//   // ── MODAL ──
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
//   modalCloseText: { fontSize: 11, fontWeight: "700", color: C.inkMid },
//   modalBody: { padding: 24, paddingBottom: 44 },

//   // ── BOTTOM NAV ──
//   nav: {
//     position: "absolute",
//     bottom: 0, left: 0, right: 0,
//     height: NAV_H,
//     backgroundColor: C.surfaceAlt,
//     borderTopWidth: 1,
//     borderTopColor: C.border,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-around",
//     paddingBottom: 10,
//     paddingHorizontal: 20,
//   },
//   navItem: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 4,
//     paddingTop: 6,
//   },
//   navIcon: {
//     fontSize: 16,
//     color: C.inkMid,
//     marginBottom: 1,
//   },
//   navIconActive: { color: C.ink },
//   navLabel: { fontSize: 11, color: C.inkLight, fontWeight: "500", letterSpacing: 0.3 },
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
//   navAddIcon: { color: "#fff", fontSize: 26, lineHeight: 30, fontWeight: "300" },
// });

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Home as HomeIcon,
  Plus,
  ClipboardList,
  Pencil,
  MapPin,
  Building2,
  Hash,
  ChevronRight,
  X,
  CheckCircle2,
} from "lucide-react-native";
import { apiRequest } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const C = {
  bg:          "#F5F4F0",
  surfaceAlt:  "#FFFFFF",
  surface:     "#FAFAF8",
  border:      "#E6E4DE",
  borderLight: "#EEECE7",
  ink:         "#1A1916",
  inkMid:      "#6B6860",
  inkLight:    "#A8A59E",
  shadow:      "#1A1916",
  green:       "#2E7D32",
  greenLight:  "#EAF3EA",
};

// ── Reusable info row ─────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value, last }) => (
  <View style={[ir.wrap, !last && ir.border]}>
    <View style={ir.iconWrap}>
      <Icon size={15} color={C.inkLight} />
    </View>
    <View style={ir.body}>
      <Text style={ir.label}>{label}</Text>
      <Text style={ir.value}>{value || "—"}</Text>
    </View>
  </View>
);

const ir = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    gap: 14,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEECE7",
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  body: { flex: 1 },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: C.inkLight,
    letterSpacing: 1.1,
    marginBottom: 3,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: C.ink,
    lineHeight: 20,
  },
});

// ── Field label ───────────────────────────────────────────────
const FieldLabel = ({ text }) => (
  <Text style={fs.label}>{text}</Text>
);

const fs = StyleSheet.create({
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: C.inkLight,
    letterSpacing: 1.2,
    marginBottom: 7,
    marginTop: 4,
  },
});

export default function Profile({ navigation }) {
  const insets = useSafeAreaInsets();

  const [isProfileCompleted, setIsProfileCompleted] = useState(false);
  const [profileData, setProfileData]               = useState(null);
  const [pageLoading, setPageLoading]               = useState(true);

  const [businessName, setBusinessName] = useState("");
  const [shopAddress, setShopAddress]   = useState("");
  const [city, setCity]                 = useState("");
  const [state, setState]               = useState("");
  const [pincode, setPincode]           = useState("");

  const [editVisible, setEditVisible] = useState(false);
  const [saving, setSaving]           = useState(false);

  // ── Data ─────────────────────────────────────────────────────
  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const res = await apiRequest("/wholesaler/profile", "GET", null, token);
      if (res?.isProfileCompleted) {
        const p = res.profile;
        setProfileData(p);
        setIsProfileCompleted(true);
        prefillForm(p);
      }
    } catch (err) {
      console.log("FETCH PROFILE ERROR 👉", err);
    } finally {
      setPageLoading(false);
    }
  };

  const prefillForm = (p) => {
    setBusinessName(p?.businessName || "");
    setShopAddress(p?.address?.shopAddress || "");
    setCity(p?.address?.city || "");
    setState(p?.address?.state || "");
    setPincode(p?.address?.pincode || "");
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleCompleteProfile = async () => {
    if (!businessName || !shopAddress || !city || !state || !pincode) {
      alert("Please fill all details");
      return;
    }
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) { alert("Login expired."); return; }
      const res = await apiRequest(
        "/wholesaler/complete-profile", "PUT",
        { businessName, address: { shopAddress, city, state, pincode } },
        token
      );
      setProfileData(res);
      setIsProfileCompleted(true);
    } catch (err) {
      alert(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!businessName || !shopAddress || !city || !state || !pincode) {
      alert("Please fill all details");
      return;
    }
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) { alert("Login expired."); return; }
      const res = await apiRequest(
        "/wholesaler/update-profile", "PUT",
        { businessName, address: { shopAddress, city, state, pincode } },
        token
      );
      const updated = res.profile;
      setProfileData(updated);
      prefillForm(updated);
      setEditVisible(false);
    } catch (err) {
      alert(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // ── Bottom nav ────────────────────────────────────────────────
  const BottomNav = () => (
    <View style={[s.nav, { paddingBottom: insets.bottom + 10 }]}>
      <TouchableOpacity
        style={s.navItem}
        onPress={() => navigation.navigate("home")}
        activeOpacity={0.7}
      >
        <HomeIcon size={22} color={C.inkMid} />
        <Text style={s.navLabel}>Home</Text>
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
  );

  // ── Loading ───────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <View style={[s.safe, { paddingTop: insets.top }]}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color={C.ink} />
      </View>
    );
  }

  // ── EDIT MODAL (shared by both views) ─────────────────────────
  const EditModal = () => (
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

          {/* Modal header */}
          <View style={s.modalHead}>
            <Text style={s.modalTitle}>Edit Profile</Text>
            <TouchableOpacity
              style={s.modalClose}
              onPress={() => setEditVisible(false)}
              activeOpacity={0.7}
            >
              <X size={15} color={C.inkMid} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={s.modalBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <FieldLabel text="BUSINESS NAME" />
            <TextInput
              style={s.input}
              placeholder="Business Name"
              placeholderTextColor={C.inkLight}
              value={businessName}
              onChangeText={setBusinessName}
            />

            <FieldLabel text="SHOP ADDRESS" />
            <TextInput
              style={s.input}
              placeholder="Shop Address"
              placeholderTextColor={C.inkLight}
              value={shopAddress}
              onChangeText={setShopAddress}
            />

            <View style={s.inputRow}>
              <View style={{ flex: 1 }}>
                <FieldLabel text="CITY" />
                <TextInput
                  style={s.input}
                  placeholder="City"
                  placeholderTextColor={C.inkLight}
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <FieldLabel text="STATE" />
                <TextInput
                  style={s.input}
                  placeholder="State"
                  placeholderTextColor={C.inkLight}
                  value={state}
                  onChangeText={setState}
                />
              </View>
            </View>

            <FieldLabel text="PINCODE" />
            <TextInput
              style={s.input}
              placeholder="Pincode"
              placeholderTextColor={C.inkLight}
              keyboardType="number-pad"
              value={pincode}
              onChangeText={setPincode}
            />

            <TouchableOpacity
              style={[s.saveBtn, saving && { opacity: 0.5 }]}
              onPress={handleUpdateProfile}
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
  );

  // ── PROFILE COMPLETE VIEW ─────────────────────────────────────
  if (isProfileCompleted && profileData) {
    const addr = profileData?.address;
    const fullAddress = [addr?.city, addr?.state].filter(Boolean).join(", ");

    return (
      <View style={[s.safe, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor={C.surfaceAlt} />

        {/* Hero header */}
        <View style={s.hero}>
          {/* Avatar */}
          <View style={s.avatarWrap}>
            <View style={s.avatar}>
              <Text style={s.avatarLetter}>
                {(profileData.businessName || "?")[0].toUpperCase()}
              </Text>
            </View>
            {/* Verified badge */}
            <View style={s.verifiedBadge}>
              <CheckCircle2 size={16} color={C.green} fill={C.greenLight} />
            </View>
          </View>

          {/* Name + location */}
          <View style={s.heroText}>
            <Text style={s.heroName} numberOfLines={1}>
              {profileData.businessName}
            </Text>
            {fullAddress ? (
              <View style={s.heroLocation}>
                <MapPin size={12} color={C.inkLight} />
                <Text style={s.heroLocationText}>{fullAddress}</Text>
              </View>
            ) : null}
          </View>

          {/* Edit button */}
          <TouchableOpacity
            style={s.editBtn}
            onPress={() => { prefillForm(profileData); setEditVisible(true); }}
            activeOpacity={0.75}
          >
            <Pencil size={14} color={C.ink} />
            <Text style={s.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Address card */}
          <Text style={s.sectionLabel}>BUSINESS ADDRESS</Text>
          <View style={s.card}>
            <InfoRow
              icon={MapPin}
              label="SHOP ADDRESS"
              value={addr?.shopAddress}
            />
            <InfoRow
              icon={Building2}
              label="CITY & STATE"
              value={fullAddress}
            />
            <InfoRow
              icon={Hash}
              label="PINCODE"
              value={addr?.pincode}
              last
            />
          </View>

          {/* Account section */}
          <Text style={[s.sectionLabel, { marginTop: 28 }]}>ACCOUNT</Text>
          <View style={s.card}>
            <TouchableOpacity
              style={s.menuRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("home")}
            >
              <HomeIcon size={16} color={C.inkMid} />
              <Text style={s.menuRowText}>Go to Store</Text>
              <ChevronRight size={16} color={C.inkLight} />
            </TouchableOpacity>
            <View style={s.menuDivider} />
            <TouchableOpacity
              style={s.menuRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("orders")}
            >
              <ClipboardList size={16} color={C.inkMid} />
              <Text style={s.menuRowText}>View Orders</Text>
              <ChevronRight size={16} color={C.inkLight} />
            </TouchableOpacity>
          </View>
        </ScrollView>

        <BottomNav />
        <EditModal />
      </View>
    );
  }

  // ── FIRST TIME SETUP ──────────────────────────────────────────
  return (
    <View style={[s.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.surfaceAlt} />

      <View style={s.setupHeader}>
        <Text style={s.setupHeaderLabel}>SETUP</Text>
        <Text style={s.setupHeaderTitle}>Complete your profile</Text>
        <Text style={s.setupHeaderSub}>
          Add your business details to start listing products
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[s.scrollContent, { paddingBottom: 120 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Step indicator */}
        <View style={s.stepRow}>
          <View style={s.stepDot} />
          <View style={s.stepLine} />
          <View style={[s.stepDot, { backgroundColor: C.border }]} />
        </View>

        <Text style={s.sectionLabel}>BUSINESS INFO</Text>
        <View style={s.card}>
          <FieldLabel text="BUSINESS NAME" />
          <TextInput
            style={s.inputFlat}
            placeholder="e.g. Sharma Traders"
            placeholderTextColor={C.inkLight}
            value={businessName}
            onChangeText={setBusinessName}
          />
        </View>

        <Text style={[s.sectionLabel, { marginTop: 24 }]}>ADDRESS</Text>
        <View style={s.card}>
          <FieldLabel text="SHOP ADDRESS" />
          <TextInput
            style={s.inputFlat}
            placeholder="Street / Area"
            placeholderTextColor={C.inkLight}
            value={shopAddress}
            onChangeText={setShopAddress}
          />

          <View style={s.cardDivider} />

          <View style={s.inputRow}>
            <View style={{ flex: 1 }}>
              <FieldLabel text="CITY" />
              <TextInput
                style={s.inputFlat}
                placeholder="City"
                placeholderTextColor={C.inkLight}
                value={city}
                onChangeText={setCity}
              />
            </View>
            <View style={{ width: 20 }} />
            <View style={{ flex: 1 }}>
              <FieldLabel text="STATE" />
              <TextInput
                style={s.inputFlat}
                placeholder="State"
                placeholderTextColor={C.inkLight}
                value={state}
                onChangeText={setState}
              />
            </View>
          </View>

          <View style={s.cardDivider} />

          <FieldLabel text="PINCODE" />
          <TextInput
            style={s.inputFlat}
            placeholder="6-digit pincode"
            placeholderTextColor={C.inkLight}
            keyboardType="number-pad"
            value={pincode}
            onChangeText={setPincode}
          />
        </View>

        <TouchableOpacity
          style={[s.saveBtn, { marginTop: 28 }, saving && { opacity: 0.5 }]}
          onPress={handleCompleteProfile}
          activeOpacity={0.85}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.saveBtnText}>Save & Continue</Text>
          }
        </TouchableOpacity>
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const NAV_H = 72;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // ── HERO (completed profile) ──
  hero: {
    backgroundColor: C.surfaceAlt,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: C.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: C.surfaceAlt,
    borderRadius: 10,
    padding: 1,
  },
  heroText: { flex: 1 },
  heroName: {
    fontSize: 17,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heroLocationText: {
    fontSize: 12,
    color: C.inkLight,
    fontWeight: "500",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.bg,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.ink,
    letterSpacing: 0.2,
  },

  // ── SETUP HEADER ──
  setupHeader: {
    backgroundColor: C.surfaceAlt,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  setupHeaderLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: C.inkLight,
    letterSpacing: 3,
    marginBottom: 8,
  },
  setupHeaderTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  setupHeaderSub: {
    fontSize: 13,
    color: C.inkMid,
    lineHeight: 18,
  },

  // step dots
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 0,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.ink,
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 6,
  },

  scrollContent: { padding: 20, paddingBottom: 100 },

  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: C.inkLight,
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 2,
  },

  card: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: C.borderLight,
    marginVertical: 14,
  },

  // menu rows inside card
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  menuRowText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: C.ink,
  },
  menuDivider: {
    height: 1,
    backgroundColor: C.borderLight,
  },

  // flat inputs (inside white card, setup form)
  inputFlat: {
    fontSize: 14,
    color: C.ink,
    paddingVertical: 6,
    paddingHorizontal: 0,
    marginBottom: 4,
  },
  inputRow: { flexDirection: "row" },

  // bordered inputs (modal)
  input: {
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

  saveBtn: {
    backgroundColor: C.ink,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },

  // ── MODAL ──
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
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.2,
  },
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
  modalBody: { padding: 24, paddingBottom: 44 },

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
});