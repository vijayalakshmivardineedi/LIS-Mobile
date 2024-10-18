import React, { useState } from "react";
import { View, StyleSheet, Image, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { TextInput } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { sendForgotPasswordEmail } from "../../Redux/Slice/AuthSlice/Forgot/SendForgotEmail";
import Toast from "react-native-toast-message";

const ForgotPassword = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.senEmailforgotPassword.loading);
  const error = useSelector((state) => state.senEmailforgotPassword.error);
  const [email, setemail] = useState("");
  const [emailError, setEmailError] = useState("");
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const handleContinue = async () => {
    let isValid = true;

    // Email validation
    if (!email) {
      setEmailError("Please enter your email.");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (isValid) {
      try {
        // Dispatch the action to send the forgot password email
        const resultAction = await dispatch(sendForgotPasswordEmail(email));

        // Handle success scenario
        if (resultAction.payload && resultAction.payload.success === true) {
          console.log('Email sent successfully, navigate to verification screen');
          navigation.navigate("Verification", { email });
        } else {
          // Handle error scenario if the result action failed
          Toast.show({
            type: 'error',
            text1: 'Email Sending Failed',
            text2: resultAction.payload.message || 'An error occurred during the password reset process.',
            position: 'top',
            topOffset: 60,
          });
        }
      } catch (error) {
        // Handle any unexpected errors
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'An unexpected error occurred. Please try again later.',
          position: 'top',
          topOffset: 60,
        });
      }
    }
  };

  const handleLoginPage = () => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <Image
            source={require("../../../../assets/User/gif/Forgot password.gif")}
            style={styles.image}
          />
        </View>
        <View style={styles.bottomContainer}>
          <Text style={styles.headerText}>Forgot Password</Text>
          <TextInput
            label="Email"
            value={email}
            onChangeText={(text) => {
              setemail(text.toLowerCase());
              setEmailError("");
            }}
            keyboardType="email-address"
            style={styles.input}
            mode="outlined"
            outlineColor="#CCC"
            theme={{ colors: { primary: "#27272A" } }}
            error={!!emailError}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>
              {loading ? 'Sending...' : 'Continue'}
            </Text>
          </TouchableOpacity>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <Text style={styles.backToSignIn}>
            Back to
            <Text style={styles.highlightText} onPress={handleLoginPage} > Login</Text>
          </Text>
        </View>
      </View>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  topContainer: {
    flex: 1,
    backgroundColor: "#7D0431",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: "#fbf5f1",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  image: {
    width: "90%",
    height: "70%",
    resizeMode: "contain",
  },
  headerText: {
    fontWeight: "600",
    fontSize: 30,
    color: "#7D0431",
    marginBottom: 10,
  },
  highlightText: {
    color: "#7D0431",
  },
  input: {
    width: "100%",
  },
  errorText: {
    color: "red",
  },
  button: {
    width: "100%",
    backgroundColor: "#7D0431",
    padding: 10,
    alignItems: "center",
    borderRadius: 10,
    marginTop: 15,
  },
  buttonText: {
    color: "#F8E9DC",
    fontSize: 24,
    fontWeight: "700",
  },
  backToSignIn: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
  },
});

export default ForgotPassword;