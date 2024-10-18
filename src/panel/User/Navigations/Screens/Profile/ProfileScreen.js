import { CommonActions, useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserProfiles } from "../../../Redux/Slice/ProfileSlice/ProfileSlice";
import { useSelector, useDispatch } from "react-redux";
import { logout } from '../../../Redux/Slice/AuthSlice/Login/LoginSlice';
import { Avatar } from "react-native-paper";
import { ImagebaseURL } from "../../../../Security/helpers/axios";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { profiles, status, error } = useSelector((state) => state.profiles);
  const [id, setId] = useState('');
  const [userId, setUserId] = useState("");
  const [societyId, setSocietyId] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [flatNumber, setFlatNumber] = useState("");

  useEffect(() => {
    const getUserName = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString !== null) {
          const user = JSON.parse(userString);
          setUserId(user.userId);
          setSocietyId(user.societyId);
          setId(user._id);
        }
      } catch (error) {
        console.error("Failed to fetch the user from async storage", error);
      }
    };
    getUserName();
  }, []);

  useEffect(() => {
    if (userId && societyId) {
      dispatch(fetchUserProfiles({ userId, societyId }));
    }
  }, [dispatch, userId, societyId]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userToken');
    } catch (e) {
      console.log('Error clearing user from AsyncStorage:', e);
    }
    dispatch(logout());
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }], 
      })
    );
  };

  useEffect(() => {
    if (profiles.length > 0) {
      const profile = profiles[0];
      setBuildingName(profile.buildingName);
      setFlatNumber(profile.flatNumber);
    }
  }, [profiles]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {status === 'loading' && <ActivityIndicator size="large" color="#0000ff" />}
        {status === 'failed' && <Text>Error: {error}</Text>}
        {status === 'succeeded' && profiles.map((profile) => (
          <View key={profile._id} style={styles.profileContainer}>
            <View style={styles.profileImageWrapper}>
              <Avatar.Image size={120} source={{ uri: `${ImagebaseURL}${profile.profilePicture}` }} style={styles.profileImage} />
            </View>
            <View>
              <Text style={styles.name}>{profile.name}</Text>
              <Text>
                <Text style={styles.idLabel}>ID: </Text>
                <Text style={styles.idValue}>{profile.userId}</Text>
              </Text>
              <Text style={styles.Community}>{profile.societyName}</Text>
              <Text style={styles.Block}>{buildingName}</Text>
              <Text style={styles.Block}>{flatNumber}</Text>
            </View>
          </View>
        ))}
        <View>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Edit Profile", { userId, societyId, id })}
          >
            <View style={styles.menuItemContent}>
              <Icon name="person" size={24} color="#7D0431" />
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#818181" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Household", { userId, societyId, id, buildingName, flatNumber })}
          >
            <View style={styles.menuItemContent}>
              <Icon name="family-restroom" size={24} color="#7D0431" />
              <Text style={styles.menuItemText}>House Hold Management</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#818181" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Manage Daily Help", { societyId, userId })}
          >
            <View style={styles.menuItemContent}>
              <Icon name="local-laundry-service" size={24} color="#7D0431" />
              <Text style={styles.menuItemText}>Manage Daily Help</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#818181" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("My Bills")}
          >
            <View style={styles.menuItemContent}>
              <Icon name="payments" size={24} color="#7D0431" />
              <Text style={styles.menuItemText}>My Bills</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#818181" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("My Bookings")}
          >
            <View style={styles.menuItemContent}>
              <Icon name="bookmark-added" size={24} color="#7D0431" />
              <Text style={styles.menuItemText}>My Bookings</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#818181" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("My Adds")}
          >
            <View style={styles.menuItemContent}>
              <Icon name="sell" size={24} color="#7D0431" />
              <Text style={styles.menuItemText}>My Adds</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#818181" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Reset Password ")}
          >
            <View style={styles.menuItemContent}>
              <Icon name="lock-outline" size={24} color="#7D0431" />
              <Text style={styles.menuItemText}>Reset Password </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#818181" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuItemContent}>
              <Icon name="exit-to-app" size={24} color="#7D0431" />
              <Text style={styles.menuItemText}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fbfbfb",
  },
  scrollContainer: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageWrapper: {
    marginRight: 16,
  },
  profileImage: {
    borderRadius: 60,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  idLabel: {
    fontWeight: 'bold',
  },
  idValue: {
    fontWeight: 'normal',
  },
  Community: {
    fontSize: 16,
    color: '#818181',
  },
  Block: {
    fontSize: 14,
    color: '#818181',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
});

export default ProfileScreen;
