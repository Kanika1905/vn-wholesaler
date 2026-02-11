// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
// } from "react-native";
// import { apiRequest } from "../services/api";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export default function Profile() {
//   const [isProfileCompleted, setIsProfileCompleted] = useState(false);

//   // form state
//   const [businessName, setBusinessName] = useState("");
//   const [shopAddress, setShopAddress] = useState("");
//   const [city, setCity] = useState("");
//   const [state, setState] = useState("");
//   const [pincode, setPincode] = useState("");

//   // saved profile (after API success)
//   const [profileData, setProfileData] = useState(null);

//   const handleAddDetails = async () => {
//     const token = await AsyncStorage.getItem("token");
//     console.log("TOKEN FROM STORAGE:", token); // 👈 add this
//     console.log("SENDING TO:", "/wholesaler/complete-profile");
//     if (!businessName || !shopAddress || !city || !state || !pincode) {
//       alert("Please fill all details");
//       return;
//     }

//     try {
//       // 🔐 get token saved during login
//       const token = await AsyncStorage.getItem("token");

//       if (!token) {
//         alert("Login expired. Please login again.");
//         return;
//       }

//       const res = await apiRequest(
//         "/wholesaler/complete-profile",
//         "PUT",
//         {
//           businessName,
//           address: {
//             shopAddress,
//             city,
//             state,
//             pincode,
//           },
//         },
//         token // 👈 VERY IMPORTANT
//       );

//       // ✅ success → switch UI to profile view
//       setProfileData(res);
//       setIsProfileCompleted(true);
//     } catch (error) {
//       console.log("PROFILE UPDATE ERROR 👉", error);
//       alert(error.message || "Failed to update profile");
//     }
//   };

//   const fetchProfile = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       if (!token) return;

//       const res = await apiRequest(
//         "/wholesaler/profile",
//         "GET",
//         null,
//         token
//       );

//       if (res?.isProfileCompleted) {
//         setProfileData(res.profile);
//         setIsProfileCompleted(true);
//       }
//     } catch (error) {
//       console.log("FETCH PROFILE ERROR 👉", error);
//     }
//   };
//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   // ================= PROFILE VIEW =================
//   if (isProfileCompleted && profileData) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.heading}>My Profile</Text>

//         <View style={styles.card}>
//           <Text style={styles.label}>Business Name</Text>
//           <Text style={styles.value}>
//             {profileData.businessName}
//           </Text>

//           <Text style={styles.label}>Shop Address</Text>
//           <Text style={styles.value}>
//             {profileData?.address?.shopAddress || "-"}
//           </Text>

//           <Text style={styles.label}>City</Text>
//           <Text style={styles.value}>
//             {profileData?.address?.city || "-"}
//           </Text>

//           <Text style={styles.label}>State</Text>
//           <Text style={styles.value}>
//             {profileData?.address?.state || "-"}
//           </Text>

//           <Text style={styles.label}>Pincode</Text>
//           <Text style={styles.value}>
//             {profileData?.address?.pincode || "-"}
//           </Text>
//         </View>
//       </View>
//     );
//   }


//   // ================= PROFILE FORM =================
//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.heading}>Complete Your Profile</Text>

//       <TextInput
//         style={styles.input}
//         placeholder="Business Name"
//         value={businessName}
//         onChangeText={setBusinessName}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Shop Address"
//         value={shopAddress}
//         onChangeText={setShopAddress}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="City"
//         value={city}
//         onChangeText={setCity}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="State"
//         value={state}
//         onChangeText={setState}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Pincode"
//         keyboardType="number-pad"
//         value={pincode}
//         onChangeText={setPincode}
//       />

//       <TouchableOpacity style={styles.button} onPress={handleAddDetails}>
//         <Text style={styles.buttonText}>Add Details</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     padding: 20,
//     backgroundColor: "#fff",
//   },
//   heading: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 14,
//   },
//   button: {
//     backgroundColor: "#000",
//     padding: 14,
//     borderRadius: 8,
//     marginTop: 10,
//   },
//   buttonText: {
//     color: "#fff",
//     textAlign: "center",
//     fontWeight: "bold",
//   },
//   card: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 10,
//     padding: 16,
//   },
//   label: {
//     fontSize: 12,
//     color: "#666",
//     marginTop: 10,
//   },
//   value: {
//     fontSize: 16,
//     fontWeight: "500",
//   },
// });
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { apiRequest } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Profile({ navigation }) {
  const [isProfileCompleted, setIsProfileCompleted] = useState(false);

  // form state
  const [businessName, setBusinessName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // saved profile (after API success)
  const [profileData, setProfileData] = useState(null);

  const handleAddDetails = async () => {
    if (!businessName || !shopAddress || !city || !state || !pincode) {
      alert("Please fill all details");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        alert("Login expired. Please login again.");
        return;
      }

      const res = await apiRequest(
        "/wholesaler/complete-profile",
        "PUT",
        {
          businessName,
          address: { shopAddress, city, state, pincode },
        },
        token
      );

      setProfileData(res);
      setIsProfileCompleted(true);
    } catch (error) {
      console.log("PROFILE UPDATE ERROR 👉", error);
      alert(error.message || "Failed to update profile");
    }
  };

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const res = await apiRequest("/wholesaler/profile", "GET", null, token);

      if (res?.isProfileCompleted) {
        setProfileData(res.profile);
        setIsProfileCompleted(true);
      }
    } catch (error) {
      console.log("FETCH PROFILE ERROR 👉", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ── BOTTOM TAB BAR (shared) ──────────────────────────────────────────────
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

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => {}} // already on profile
        activeOpacity={0.7}
      >
        <Text style={[styles.tabIcon, styles.tabIconActive]}>👤</Text>
        <Text style={[styles.tabLabel, styles.tabLabelActive]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
  // ────────────────────────────────────────────────────────────────────────

  // ================= PROFILE VIEW =================
  if (isProfileCompleted && profileData) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Profile</Text>
            <Text style={styles.headerSub}>Business details</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.card}>
              <Text style={styles.label}>Business Name</Text>
              <Text style={styles.value}>{profileData.businessName}</Text>

              <View style={styles.divider} />

              <Text style={styles.label}>Shop Address</Text>
              <Text style={styles.value}>
                {profileData?.address?.shopAddress || "-"}
              </Text>

              <View style={styles.divider} />

              <Text style={styles.label}>City</Text>
              <Text style={styles.value}>
                {profileData?.address?.city || "-"}
              </Text>

              <View style={styles.divider} />

              <Text style={styles.label}>State</Text>
              <Text style={styles.value}>
                {profileData?.address?.state || "-"}
              </Text>

              <View style={styles.divider} />

              <Text style={styles.label}>Pincode</Text>
              <Text style={styles.value}>
                {profileData?.address?.pincode || "-"}
              </Text>
            </View>
          </ScrollView>
        </View>

        <BottomTabBar />
      </SafeAreaView>
    );
  }

  // ================= PROFILE FORM =================
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Complete Profile</Text>
          <Text style={styles.headerSub}>Fill in your business details</Text>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={styles.input}
            placeholder="Business Name"
            placeholderTextColor="#aaa"
            value={businessName}
            onChangeText={setBusinessName}
          />
          <TextInput
            style={styles.input}
            placeholder="Shop Address"
            placeholderTextColor="#aaa"
            value={shopAddress}
            onChangeText={setShopAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="City"
            placeholderTextColor="#aaa"
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            style={styles.input}
            placeholder="State"
            placeholderTextColor="#aaa"
            value={state}
            onChangeText={setState}
          />
          <TextInput
            style={styles.input}
            placeholder="Pincode"
            placeholderTextColor="#aaa"
            keyboardType="number-pad"
            value={pincode}
            onChangeText={setPincode}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleAddDetails}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Save Details</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <BottomTabBar />
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

  scrollContent: {
    padding: 20,
  },

  // ── PROFILE VIEW CARD ──
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

  // ── FORM ──
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0DC",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    fontSize: 15,
    color: "#111",
  },
  button: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.2,
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
  tabIconActive: {
    opacity: 1,
  },
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