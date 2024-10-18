import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { RadioButton, Snackbar, TextInput } from "react-native-paper";
import { sendVerificationEmail } from "../../../User/Redux/Slice/AuthSlice/Signup/SendEmailVerification";
import { useDispatch, useSelector } from "react-redux";
import { verifyOTP } from "../../../User/Redux/Slice/AuthSlice/Signup/otpSlice";
import { fetchUserProfile } from "../../../User/Redux/Slice/AuthSlice/Signup/userProfileSlice";
import { fetchSocietyById } from "../../../User/Redux/Slice/Security_Panel/SocietyByIdSlice";
import { useNavigation } from "@react-navigation/native";
import { fetchUsers } from "./ResidentsSlice";

const AddResidents = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { society } = useSelector((state) => state.societyById);

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apartmentId, setApartmentId] = useState("6683b57b073739a31e8350d0");
  const [block, setBlock] = useState("");
  const [userType, setUserType] = useState("");
  const [userProfileId, setUserProfileId] = useState("");
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [flat, setFlat] = useState("");

  const [showFlatMenu, setShowFlatMenu] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [blockError, setBlockError] = useState("");
  const [flatNumberError, setFlatNumberError] = useState("");
  const [userTypeError, setUserTypeError] = useState("");

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isOtpVisible, setIsOtpVisible] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [societyLicence, setSocietyLicense] = useState("Diksha Enclave");

  const validateEmail = (input) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailPattern.test(input)) {
      setEmailError("");
      setIsEmailValid(true);
    } else {
      setEmailError("Please enter a valid email address.");
      setIsEmailValid(false);
    }
    setEmail(input);
  };

  const validatePhoneNumber = (input) => {
    const phonePattern = /^\d{10}$/;
    if (phonePattern.test(input)) {
      setPhoneError("");
    } else {
      setPhoneError("Please enter a valid 10-digit phone number.");
    }
    setPhoneNumber(input);
  };
  const toggleBlockMenu = () => {
    setShowBlockMenu(!showBlockMenu);
    if (showFlatMenu) setShowFlatMenu(false);
  };

  const toggleFlatMenu = () => {
    setShowFlatMenu(!showFlatMenu);
    if (showBlockMenu) setShowBlockMenu(false);
  };
  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];

    if (text === "") {
      if (index > 0) {
        const prevInput = index;
        newOtp[prevInput] = "";
        inputs[prevInput].focus();
      }
    } else {
      newOtp[index] = text.replace(/[^0-9]/g, "");
      if (text && index < otp.length - 1) {
        const nextInput = index + 1;
        if (nextInput < otp.length) {
          inputs[nextInput].focus();
        }
      }
    }

    setOtp(newOtp);
  };
  useEffect(() => {
    if (apartmentId) {
      dispatch(fetchSocietyById(apartmentId));
    }
  }, [dispatch, apartmentId]);
  const handleSubmit = async () => {
    let valid = true;

    if (!name) {
      setNameError("Name is required.");
      valid = false;
    } else {
      setNameError("");
    }

    if (!phoneNumber) {
      setPhoneError("Phone number is required.");
      valid = false;
    } else if (!/^\d{10}$/.test(phoneNumber)) {
      setPhoneError("Please enter a valid 10-digit phone number.");
      valid = false;
    } else {
      setPhoneError("");
    }

    if (!email) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!block) {
      setBlockError("Block is required.");
      valid = false;
    } else {
      setBlockError("");
    }

    if (!flat) {
      setFlatNumberError("Flat number is required.");
      valid = false;
    } else {
      setFlatNumberError("");
    }

    if (!userType) {
      setUserTypeError("User type is required.");
      valid = false;
    } else {
      setUserTypeError("");
    }

    if (valid) {
      if (userProfileId) {
        const userData = {
          name,
          email: email,
          mobileNumber: phoneNumber,
          password,
          society: societyLicence,
          societyId: apartmentId,
          block,
          flat,
          userType,
        };

        try {
          const result = await dispatch(
            fetchUserProfile({ id: userProfileId, data: userData })
          ).unwrap();
          setSnackbarMessage(`${result.message}`);
          setSnackbarVisible(true);
          setName("");
          setPhoneNumber("");
          setEmail("");
          setPassword("");
          setApartmentId("");
          setBlock("");
          setFlat("");
          setUserType("");
          setOtp(["", "", "", "", "", ""]);
          setIsOtpVisible(false);
          setIsVerified(false);
          await dispatch(fetchUsers());
          navigation.navigate("Residential Management");
        } catch (error) {
          setSnackbarMessage(`${error.message}`);
          setSnackbarVisible(true);
        }
      }
    }
  };

  const blocksForSelectedSociety = society?.blocks || [];
  const flatsForSelectedBlock =
    blocksForSelectedSociety.find((b) => b.blockName === block)?.flats || [];

  const handleVerifyOtp = async () => {
    try {
      const otpValue = otp.join("");
      const resultAction = await dispatch(
        verifyOTP({ email, otp: otpValue })
      ).unwrap();
      setUserProfileId(resultAction.userProfile?._id);

      setIsOtpVisible(false);
      setSnackbarMessage(`${resultAction.message}`);
      setSnackbarVisible(true);
      setIsVerified(true);
    } catch (error) {
      setSnackbarMessage(`${error.message}`);
      setSnackbarVisible(true);
    }
  };
  const inputs = [];
  const handleVerifyPress = async () => {
    try {
      setIsEmailValid(false);
      const resultAction = await dispatch(
        sendVerificationEmail(email)
      ).unwrap();
      setIsOtpVisible(true);
      setSnackbarMessage(`${resultAction.message}`);
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarMessage(`${error.message}`);
      setSnackbarVisible(true);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={styles.form}>
          <TextInput
            mode="outlined"
            label="Apartment"
            value={societyLicence}
            theme={{ colors: { primary: "#7d0431" } }}
            disabled={true}
          />

          <TextInput
            mode="outlined"
            label="Name"
            value={name}
            theme={{ colors: { primary: "#7d0431" } }}
            onChangeText={setName}
          />
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

          <TextInput
            mode="outlined"
            label="Phone Number"
            value={phoneNumber}
            theme={{ colors: { primary: "#7d0431" } }}
            onChangeText={(text) =>
              validatePhoneNumber(text.replace(/[^0-9]/g, ""))
            }
            keyboardType="phone-pad"
            maxLength={10}
          />
          {phoneError ? (
            <Text style={styles.errorText}>{phoneError}</Text>
          ) : null}

          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={validateEmail}
            theme={{ colors: { primary: "#7d0431" } }}
            keyboardType="email-address"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect={false}
            error={!!emailError}
            editable={!isVerified}
            style={styles.textInput}
          />
          {isEmailValid && (
            <Text style={styles.verifyText} onPress={handleVerifyPress}>
              Verify
            </Text>
          )}
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}
          {isVerified && (
            <Text style={{ color: "green", marginLeft: 10 }}>Verified</Text>
          )}
          {isOtpVisible && (
            <>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    mode="outlined"
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    theme={{ colors: { primary: "#7d0431" } }}
                    keyboardType="numeric"
                    maxLength={1}
                    style={styles.otpInput}
                    ref={(input) => (inputs[index] = input)}
                  />
                ))}
              </View>
              <TouchableOpacity
                style={styles.verifyText}
                onPress={handleVerifyOtp}
              >
                <Text style={styles.verifyText}>Verify OTP</Text>
              </TouchableOpacity>
            </>
          )}
          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            theme={{ colors: { primary: "#7d0431" } }}
            onChangeText={setPassword}
            secureTextEntry
          />
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}

          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              onPress={toggleBlockMenu}
              style={[styles.dropdown, showBlockMenu && styles.dropdownActive]}
              disabled={!society}
            >
              <Text>{block ? block : "Select Block"}</Text>
            </TouchableOpacity>
            {showBlockMenu && (
              <View style={styles.menu}>
                {blocksForSelectedSociety.map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    onPress={() => {
                      setBlock(item.blockName);
                      setShowBlockMenu(false);
                      setFlat("");
                    }}
                    style={styles.menuItem}
                    disabled={!society}
                  >
                    <Text>{item.blockName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {blockError ? (
              <Text style={styles.errorText}>{blockError}</Text>
            ) : null}
          </View>

          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              onPress={toggleFlatMenu}
              style={[styles.dropdown, showFlatMenu && styles.dropdownActive]}
              disabled={!society}
            >
              <Text>{flat ? flat : "Select Flat"}</Text>
            </TouchableOpacity>
            {showFlatMenu && (
              <ScrollView style={styles.menu}>
                {flatsForSelectedBlock.map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    onPress={() => {
                      setFlat(item.flatNumber);
                      setShowFlatMenu(false);
                    }}
                    style={styles.menuItem}
                    disabled={!society}
                  >
                    <Text>{item.flatNumber}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            {flatNumberError ? (
              <Text style={styles.errorText}>{flatNumberError}</Text>
            ) : null}
          </View>
          <View style={styles.radioContainer}>
            <RadioButton.Group onValueChange={setUserType} value={userType}>
              <View style={styles.radioButtonRow}>
                <RadioButton.Item
                  label="Tenant"
                  value="Tenant"
                  theme={{ colors: { primary: "#7d0431" } }}
                />
                <RadioButton.Item
                  label="Owner"
                  value="Owner"
                  theme={{ colors: { primary: "#7d0431" } }}
                />
              </View>
            </RadioButton.Group>
          </View>
          {userTypeError ? (
            <Text style={styles.errorText}>{userTypeError}</Text>
          ) : null}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, !isVerified && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!isVerified}
          >
            <Text style={styles.buttonText}>Add Resident</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => {
            setSnackbarVisible(false);
          },
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: "#fff",
    gap: 10,
  },
  form: {
    gap: 10,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  radioContainer: {
    flexDirection: "row",
    marginBottom: 12,
    paddingBottom: 40,
  },
  radioButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
  },
  button: {
    backgroundColor: "#7d0431",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  errorText: {
    color: "red",
  },
  verifyText: {
    color: "#7d0431",
    textAlign: "right",
    marginRight: 10,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: "12%",
    marginRight: 5,
  },
  dropdown: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#7D0431",
    borderRadius: 4,
    height: 50,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  dropdownActive: {
    backgroundColor: "#f1f1f1",
  },
  menu: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    marginTop: 5,
    backgroundColor: "#fff",
    position: "absolute",
    zIndex: 999,
    top: 50,
    maxHeight: 110,
    width: "100%",
    fontSize: 15,
  },
  menuItem: {
    padding: 10,
  },
  dropdownContainer: {
    marginVertical: 5,
  },
});

export default AddResidents;
