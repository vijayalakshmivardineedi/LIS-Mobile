import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { TextInput } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { userLogin } from "../../Redux/Slice/AuthSlice/Login/LoginSlice";
import Toast from "react-native-toast-message";

const Login = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const status = useSelector((state) => state.userLogin.status);

  // Email Validation Regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const handleLogin = async () => {
    let isValid = true;

    // Validate Email Format
    if (!email) {
      setEmailError("Please enter your email.");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Please enter your password.");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (isValid) {
      try {
        const resultAction = await dispatch(
          userLogin({ email: email.toLowerCase(), password })
        );
        if (resultAction.type === "auth/userLogin/fulfilled") {
          await AsyncStorage.setItem("userToken", resultAction.payload.token);
          const user = resultAction.payload.profile;
          console.log("user", user);
          const userRole = user.role;
          const isVerified = user.isVerified;
          console.log("userRole", userRole);
          setEmail("");
          setPassword("");
          if (userRole === "User") {
            if (isVerified === true) {
              navigation.reset({
                index: 0,
                routes: [{ name: "Tabs" }],
              });
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: "WaitingForAccess" }],
              });
            }
          } else if (userRole === "Sequrity") {
            navigation.reset({
              index: 0,
              routes: [{ name: "SecurityTabs" }],
            });
          } else if (userRole === "SocietyAdmin") {
            navigation.reset({
              index: 0,
              routes: [{ name: "Sidebar" }],
            });
          }
        } else {
          Toast.show({
            type: "error",
            text1: "Login Failed",
            text2:
              resultAction.payload.message || "An error occurred during login.",
            position: "top",
            topOffset: 60,
          });
        }
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Login Error",
          text2: "An error occurred. Please try again later.",
          position: "top",
        });
      }
    }
  };

  const handleSignuppress = () => {
    navigation.navigate("Create User");
  };

  const handleForgotpress = () => {
    navigation.navigate("Forgot Password");
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.halfContainer1}>
        <Image
          source={require("../../../../assets/User/gif/Login.gif")}
          style={styles.video}
          resizeMode="cover"
        />
        <Text style={styles.loginSubtitle}>Experience Seamless Access</Text>
      </View>
      <View style={styles.halfContainer2}>
        <Text style={styles.loginTitle}>Login</Text>
        <TextInput
          style={styles.input}
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError("");
          }}
          keyboardType="email-address"
          mode="outlined"
          outlineColor="#CCC"
          theme={{ colors: { primary: "#27272A" } }}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        <View style={styles.passwordInput}>
          <TextInput
            style={styles.inputTextpass}
            label="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={!showPassword}
            mode="outlined"
            outlineColor="#CCC"
            theme={{ colors: { primary: "#27272A" } }}
          />
          <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
            <Icon
              name={showPassword ? "eye-slash" : "eye"}
              size={15}
              color="#888"
            />
          </TouchableOpacity>
        </View>
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}
        <Text onPress={handleForgotpress} style={styles.forgotPassword}>
          Forgot Password
        </Text>
        <TouchableOpacity style={styles.Button} onPress={handleLogin}>
          {status === "loading" ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          ) : (
            <Text style={styles.signInText}>Sign In</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.signUpPrompt}>
          Don't have an account!
          <Text style={styles.signUpText} onPress={handleSignuppress}>
            {" "}
            Sign Up
          </Text>
        </Text>
      </View>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    alignItems: "center",
    justifyContent: "center",
  },
  halfContainer1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#7D0431",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  halfContainer2: {
    flex: 1,
    paddingTop: 10,
    alignItems: "center",
    backgroundColor: "#fbf5f1",
  },
  video: {
    width: "80%",
    height: "70%",
    marginTop: 10,
  },
  loginSubtitle: {
    fontSize: 16,
    paddingHorizontal: 5,
    paddingVertical: 5,
    color: "#F3E1D5",
  },
  loginTitle: {
    fontWeight: "600",
    fontSize: 30,
    color: "#7D0431",
    marginBottom: 10,
  },
  input: {
    width: "90%",
    marginBottom: 5,
  },
  inputTextpass: {
    width: "80%",
    marginBottom: 5,
  },
  passwordInput: {
    justifyContent: "flex-start",
    width: "90%",
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  eyeIcon: {
    position: "absolute",
    justifyContent: "flex-end",
    right: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderStyle: "solid",
    borderRadius: 5,
    padding: 10,
  },
  forgotPassword: {
    textAlign: "right",
    color: "#7D0431",
    marginTop: 5,
    fontSize: 15,
    fontWeight: "400",
    width: "90%",
  },
  Button: {
    width: "90%",
    backgroundColor: "#7D0431",
    padding: 10,
    alignItems: "center",
    borderRadius: 12,
    marginTop: 15,
    marginBottom: 10,
  },
  signInText: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
  },
  signUpPrompt: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
  },
  signUpText: {
    color: "#7D0431",
    marginTop: 10,
    fontSize: 15,
    fontWeight: "400",
  },
  errorText: {
    color: "red",
    alignSelf: "flex-start",
    fontSize: 12,
    marginLeft: "5%",
  },
});

export default Login;
