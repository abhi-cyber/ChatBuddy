import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import {useAuth} from "../context/AuthContext";

const ProfileScreen = () => {
  const {user, signOut} = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <Image
            source={
              user?.photoURL
                ? {uri: user.photoURL}
                : require("../assets/default-avatar.png")
            }
            style={styles.profileImage}
          />
          <Text style={styles.userName}>
            {user?.displayName || "Awesome User"}
          </Text>
          <Text style={styles.userEmail}>{user?.email || ""}</Text>
        </View>

        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsButtonText}>Notification Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsButton}>
            <Text style={styles.settingsButtonText}>Privacy Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>GenZ Therapist v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  settingsContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  settingsButton: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingsButtonText: {
    fontSize: 16,
    color: "#333",
  },
  signOutButton: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#FFE9ED",
    borderRadius: 12,
    alignItems: "center",
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B8A",
  },
  versionText: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginBottom: 20,
  },
});

export default ProfileScreen;
