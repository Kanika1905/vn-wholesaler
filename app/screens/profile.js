import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { apiRequest } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Profile({ navigation }) {
  const [isProfileCompleted, setIsProfileCompleted] = useState(false);
  const [profileData, setProfileData]   = useState(null);
  const [pageLoading, setPageLoading]   = useState(true);

  // ── form state (shared between complete-profile & edit) ──
  const [businessName, setBusinessName] = useState("");
  const [shopAddress, setShopAddress]   = useState("");
  const [city, setCity]                 = useState("");
  const [state, setState]               = useState("");
  const [pincode, setPincode]           = useState("");

  // ── edit modal ──
  const [editVisible, setEditVisible]   = useState(false);
  const [saving, setSaving]             = useState(false);

  // ─────────────────────────────────────────────────────────────
  // Fetch profile on mount
  // ─────────────────────────────────────────────────────────────
  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await apiRequest("/wholesaler/profile", "GET", null, token);

      if (res?.isProfileCompleted) {
        const p = res.profile;
        setProfileData(p);
        setIsProfileCompleted(true);
        // pre-fill edit form with current values
        prefillForm(p);
      }
    } catch (error) {
      console.log("FETCH PROFILE ERROR 👉", error);
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

  // ─────────────────────────────────────────────────────────────
  // Complete profile (first time)
  // ─────────────────────────────────────────────────────────────
  const handleCompleteProfile = async () => {
    if (!businessName || !shopAddress || !city || !state || !pincode) {
      alert("Please fill all details");
      return;
    }
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) { alert("Login expired. Please login again."); return; }

      const res = await apiRequest(
        "/wholesaler/complete-profile",
        "PUT",
        { businessName, address: { shopAddress, city, state, pincode } },
        token
      );

      setProfileData(res);
      setIsProfileCompleted(true);
    } catch (error) {
      console.log("PROFILE UPDATE ERROR 👉", error);
      alert(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Update profile (edit)
  // ─────────────────────────────────────────────────────────────
  const handleUpdateProfile = async () => {
    if (!businessName || !shopAddress || !city || !state || !pincode) {
      alert("Please fill all details");
      return;
    }
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) { alert("Login expired. Please login again."); return; }

      const res = await apiRequest(
        "/wholesaler/update-profile",
        "PUT",
        { businessName, address: { shopAddress, city, state, pincode } },
        token
      );

      // res.profile has the fresh data from DB
      const updated = res.profile;
      setProfileData(updated);
      prefillForm(updated);
      setEditVisible(false);
    } catch (error) {
      console.log("PROFILE EDIT ERROR 👉", error);
      alert(error.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Bottom tab bar
  // ─────────────────────────────────────────────────────────────
  const BottomTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate("home")}
        activeOpacity={0.7}
      >
        <Text style={styles.tabIcon}>🏠</Text>
        <Text style={styles.tabLabel}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.addTab}
        onPress={() => navigation.navigate("addProduct")}
        activeOpacity={0.85}
      >
        <Text style={styles.addTabIcon}>＋</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
        <Text style={[styles.tabIcon, styles.tabIconActive]}>👤</Text>
        <Text style={[styles.tabLabel, styles.tabLabelActive]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );

  // ─────────────────────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#111" />
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // PROFILE VIEW (completed)
  // ─────────────────────────────────────────────────────────────
  if (isProfileCompleted && profileData) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.headerTitle}>My Profile</Text>
                <Text style={styles.headerSub}>Business details</Text>
              </View>
              {/* ✏️ Edit button */}
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => {
                  prefillForm(profileData); // always fresh values
                  setEditVisible(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.editBtnIcon}>✏️</Text>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
              <Row label="Business Name" value={profileData.businessName} />
              <View style={styles.divider} />
              <Row label="Shop Address"  value={profileData?.address?.shopAddress} />
              <View style={styles.divider} />
              <Row label="City"          value={profileData?.address?.city} />
              <View style={styles.divider} />
              <Row label="State"         value={profileData?.address?.state} />
              <View style={styles.divider} />
              <Row label="Pincode"       value={profileData?.address?.pincode} />
            </View>
          </ScrollView>
        </View>

        <BottomTabBar />

        {/* ── EDIT MODAL ── */}
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
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
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
                <Text style={styles.inputLabel}>Business Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Business Name"
                  placeholderTextColor="#aaa"
                  value={businessName}
                  onChangeText={setBusinessName}
                />

                <Text style={styles.inputLabel}>Shop Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Shop Address"
                  placeholderTextColor="#aaa"
                  value={shopAddress}
                  onChangeText={setShopAddress}
                />

                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  placeholderTextColor="#aaa"
                  value={city}
                  onChangeText={setCity}
                />

                <Text style={styles.inputLabel}>State</Text>
                <TextInput
                  style={styles.input}
                  placeholder="State"
                  placeholderTextColor="#aaa"
                  value={state}
                  onChangeText={setState}
                />

                <Text style={styles.inputLabel}>Pincode</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Pincode"
                  placeholderTextColor="#aaa"
                  keyboardType="number-pad"
                  value={pincode}
                  onChangeText={setPincode}
                />

                <TouchableOpacity
                  style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                  onPress={handleUpdateProfile}
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

  // ─────────────────────────────────────────────────────────────
  // PROFILE FORM (first time setup)
  // ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Complete Profile</Text>
          <Text style={styles.headerSub}>Fill in your business details</Text>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.inputLabel}>Business Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Business Name"
            placeholderTextColor="#aaa"
            value={businessName}
            onChangeText={setBusinessName}
          />

          <Text style={styles.inputLabel}>Shop Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Shop Address"
            placeholderTextColor="#aaa"
            value={shopAddress}
            onChangeText={setShopAddress}
          />

          <Text style={styles.inputLabel}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="City"
            placeholderTextColor="#aaa"
            value={city}
            onChangeText={setCity}
          />

          <Text style={styles.inputLabel}>State</Text>
          <TextInput
            style={styles.input}
            placeholder="State"
            placeholderTextColor="#aaa"
            value={state}
            onChangeText={setState}
          />

          <Text style={styles.inputLabel}>Pincode</Text>
          <TextInput
            style={styles.input}
            placeholder="Pincode"
            placeholderTextColor="#aaa"
            keyboardType="number-pad"
            value={pincode}
            onChangeText={setPincode}
          />

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleCompleteProfile}
            activeOpacity={0.85}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>Save Details</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </View>

      <BottomTabBar />
    </SafeAreaView>
  );
}

// ── Small helper component ──
const Row = ({ label, value }) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "-"}</Text>
  </View>
);

const TAB_HEIGHT = 70;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F7F5" },
  container: { flex: 1, paddingBottom: TAB_HEIGHT },

  // ── HEADER ──
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E4",
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

  // ✏️ Edit button
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F3F3F0",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  editBtnIcon: { fontSize: 14 },
  editBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
  },

  scrollContent: { padding: 20 },

  // ── PROFILE CARD ──
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  label: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0EE",
    marginVertical: 12,
  },

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
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0DC",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    fontSize: 15,
    color: "#111",
  },
  saveBtn: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 12,
    marginTop: 4,
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.2,
  },

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
    maxHeight: "90%",
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0EE",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
  },
  modalScroll: {
    padding: 24,
    paddingBottom: 40,
  },

  // ── BOTTOM TAB BAR ──
  tabBar: {
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
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
  },
  tabIcon: { fontSize: 22, opacity: 0.4 },
  tabIconActive: { opacity: 1 },
  tabLabel: { fontSize: 11, color: "#aaa", marginTop: 2, fontWeight: "500" },
  tabLabelActive: { color: "#111", fontWeight: "700" },
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
});