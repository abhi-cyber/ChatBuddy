import React, {useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import {useAuth} from "../context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import {updateUserProfile} from "../services/authService";

const ProfileScreen = () => {
  const {user, signOut, refreshUser} = useAuth();
  const insets = useSafeAreaInsets();
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleAvatarPress = () => {
    setModalVisible(true);
  };

  const handleRemovePhoto = async () => {
    setUploading(true);
    try {
      await updateUserProfile({
        photoURL:
          "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
      });
      await refreshUser();
      Alert.alert("Success", "Profile picture removed successfully");
    } catch (error) {
      console.error("Error removing profile picture:", error);
      Alert.alert("Error", "Failed to remove profile picture");
    } finally {
      setUploading(false);
      setModalVisible(false);
    }
  };

  const pickImage = async (useCamera) => {
    try {
      setModalVisible(false);
      if (useCamera) {
        const {status} = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Needed",
            "Camera permission is required to take photos"
          );
          return;
        }
      } else {
        const {status} =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Needed",
            "Media library permission is required to select photos"
          );
          return;
        }
      }

      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      };

      const result = useCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploading(true);
        try {
          await updateUserProfile({photoURL: result.assets[0].uri});
          await refreshUser();
          Alert.alert("Success", "Profile picture updated successfully");
        } catch (error) {
          console.error("Error updating profile picture:", error);
          Alert.alert("Error", "Failed to update profile picture");
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Something went wrong while selecting the image");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(20, insets.top),
            paddingBottom: Math.max(20, insets.bottom),
            paddingLeft: Math.max(20, insets.left),
            paddingRight: Math.max(20, insets.right),
          },
        ]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <TouchableOpacity
            onPress={handleAvatarPress}
            style={styles.avatarContainer}
            disabled={uploading}>
            <Image
              source={
                user?.photoURL
                  ? {uri: user.photoURL}
                  : {
                      uri: "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
                    }
              }
              style={styles.profileImage}
            />
            {uploading ? (
              <View style={styles.uploadingOverlay}>
                <Text style={styles.uploadingText}>Updating...</Text>
              </View>
            ) : (
              <View style={styles.editIconContainer}>
                <Text style={styles.editIcon}>✏️</Text>
              </View>
            )}
          </TouchableOpacity>
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

        <Text style={styles.versionText}>Chat Buddy v1.0.0</Text>
      </ScrollView>

      {/* Modernized Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Profile Picture</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => pickImage(true)}>
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => pickImage(false)}>
              <Text style={styles.modalButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.destructiveButton]}
              onPress={handleRemovePhoto}>
              <Text style={styles.modalButtonText}>Remove Image</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    flexGrow: 1,
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
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#6C5CE7",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  editIcon: {
    fontSize: 14,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
  },
  modalButton: {
    width: "100%",
    paddingVertical: 15,
    backgroundColor: "#6C5CE7",
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#6C5CE7",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  destructiveButton: {
    backgroundColor: "#FF6B6B",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
});

export default ProfileScreen;
