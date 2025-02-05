// src/ResetPassword.js
import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Text, ScrollView, Alert } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserData } from '../../../Redux/Slice/ProfileSlice/resetSlice';
import { TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchUserProfiles } from "../../../Redux/Slice/ProfileSlice/ProfileSlice";

const ResetPassword = ({ navigation }) => {
  const dispatch = useDispatch();
  const { error } = useSelector(state => state.userResetPassword);

  const [password, setPassword] = useState("");
  const [societyId, setSocietyId] = useState("");
  const [userId, setUserId] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  useEffect(() => {
    const getUserName = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString !== null) {
          const user = JSON.parse(userString);
          console.log("User data:", user);
          setSocietyId(user.societyId);
          setUserId(user._id);
        }
      } catch (error) {
        console.error("Failed to fetch the user from async storage", error);
      }
    };

    getUserName();
  }, []);

  const handleSave = async () => {
    if (!password) {
      setPasswordError("Password cannot be empty");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    try {
      const userData = {
        userId,
        currentPassword,
        password
      };
      const result = await dispatch(fetchUserData(userData));

      if (result.type === "password/fetchUserData/fulfilled") {
        dispatch(fetchUserProfiles({ userId, societyId }));
        navigation.navigate('Profile');
      } else {
        console.log(result.error)
        Alert.alert("Unable to Reset Password", String(result.error.message === "Rejected" ? "Reset password Failed" : ""));
      }
    } catch (error) {
      console.error('Error retrieving userId from AsyncStorage:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <TextInput
          mode="outlined"
          label="Current Password"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
          style={styles.input}
          outlineColor="#CCC"
          theme={{ colors: { primary: "#27272A" } }}
          error={error !== null}
        />
        {error && (
          <Text style={styles.errorText}>{String(error)}</Text>
        )}
        <TextInput
          mode="outlined"
          label="New Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          outlineColor="#CCC"
          theme={{ colors: { primary: "#27272A" } }}
          error={passwordError !== ""}
        />
        {passwordError !== "" && (
          <Text style={styles.errorText}>{passwordError}</Text>
        )}
        <TextInput
          mode="outlined"
          label="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          outlineColor="#CCC"
          theme={{ colors: { primary: "#27272A" } }}
          error={confirmPasswordError !== ""}
        />
        {confirmPasswordError !== "" && (
          <Text style={styles.errorText}>{confirmPasswordError}</Text>
        )}
      </ScrollView>
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={{ color: "white", fontSize: 24, fontWeight: "700" }}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#fbf5f1",
    justifyContent: "space-between",
  },
  button: {
    width: "100%",
    backgroundColor: "#7D0431",
    padding: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  input: {
    marginTop: 20,
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
});

export default ResetPassword;
