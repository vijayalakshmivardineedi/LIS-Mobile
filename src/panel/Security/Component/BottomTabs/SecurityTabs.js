import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Avatar } from "react-native-paper";
import HomeScreen from "../../Navigations/HomeScreen";
import Settings from "../Header/Settings";
import InandOut1 from "../Header/InandOut1";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchGuard } from "../../../User/Redux/Slice/Security_Panel/SettingsSlice";
import { ImagebaseURL } from "../../helpers/axios";
import { fetchSocietyById } from "../../../User/Redux/Slice/Security_Panel/SocietyByIdSlice";
import { logout } from "../../../User/Redux/Slice/AuthSlice/Login/LoginSlice";
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import StaffVisitors from "../../Navigations/StaffVisitors";
import socketServices from "../../../User/Socket/SocketServices";
import { Audio } from "expo-av";

const Tab = createBottomTabNavigator();

function SecurityTabs() {
  const dispatch = useDispatch();
  const [societyId, setSocietyId] = useState(null);
  const Guard = useSelector((state) => state.setting.settings);
  const { society } = useSelector((state) => state.societyById);
  const [sequrityId, setSequrityId] = useState(null);
  const [verifySecurityId, setVerifySecurityId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [alertData, setAlertData] = useState(null);
  const [sound, setSound] = useState();

  useEffect(() => {
    const getUserName = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");

        if (userString) {
          const user = JSON.parse(userString);
          console.log(user._id, "security id");
          setSocietyId(user.societyId);
          setSequrityId(user.sequrityId); // Assuming this is fetched as securityId
          setVerifySecurityId(user._id);
        }
      } catch (error) {
        console.error("Failed to fetch the user from async storage", error);
      }
    };

    getUserName();
  }, []);

  const navigation = useNavigation();

  useEffect(() => {
    if (societyId) {
      dispatch(fetchSocietyById(societyId));
    }
  }, [societyId, dispatch]);

  useEffect(() => {
    if (societyId && sequrityId) {
      dispatch(fetchGuard({ societyId, sequrityId }));
    }
  }, [societyId, sequrityId, dispatch]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("userToken");
    } catch (e) {
      console.error("Error clearing user from AsyncStorage:", e);
    }
    dispatch(logout());
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Login" }],
      })
    );
  };

  const playAlertSound = async () => {
    const { sound: newSound } = await Audio.Sound.createAsync(
      require("../../assets/alert-33762.mp3")
    );
    setSound(newSound);
    await newSound.playAsync();

    const status = await newSound.getStatusAsync();

    if (!status.isPlaying) {
      newSound.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (playbackStatus.didJustFinish) {
          newSound.replayAsync();
        }
      });
    }
  };

  useEffect(() => {
    const getUserName = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");

        if (userString) {
          const user = JSON.parse(userString);
          console.log(user._id, "security id");
          setSocietyId(user.societyId);
          setSequrityId(user.sequrityId);
          setVerifySecurityId(user._id);
        }
      } catch (error) {
        console.error("Failed to fetch the user from async storage", error);
      }
    };

    getUserName();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      socketServices.initializeSocket();

      if (societyId) {
        socketServices.emit("joinSecurityPanel", societyId);
      }

      const handleGateAlertReceived = (data) => {
        console.log("Received Gate Alert:", data);
        setAlertData(data);
        setModalVisible(true);
        playAlertSound();
      };

      socketServices.on("Gate_alert_received", handleGateAlertReceived);

      const handleresponseRecieved = async (data) => {
        // Check and ensure the verifySecurityId is fetched before comparing
        if (!verifySecurityId) {
          const userString = await AsyncStorage.getItem("user");
          if (userString) {
            const user = JSON.parse(userString);
            setVerifySecurityId(user._id);
          }
        }

        // Log the IDs for debugging
        console.log(verifySecurityId, "verifySecurityId after AsyncStorage check");
        console.log(data.securityId, "data.securityId");

        // Proceed with the comparison only if both IDs are available
        if (!data?.securityId || !verifySecurityId) {
          console.error("Invalid data received or verifySecurityId is null:", data);
          return;
        }

        if (data?.securityId === verifySecurityId) {
          const message = `
            Flat Details: ${data.buildingName}/ ${data.flatNumber || "N/A"}
            Flat Number: ${data.flatNumber || "N/A"}
            Visitor Name: ${data.visitorName || "N/A"}
            Resident Name: ${data.residentName || "N/A"}
            Response: ${data.response || "N/A"}
          `;
          Alert.alert(
            "Alert Details",
            message.trim(),
            [{ text: "OK", onPress: () => console.log("OK Pressed") }]
          );
        }
      };

      socketServices.on("Visitor_Response_Notification", handleresponseRecieved);

      return () => {
        socketServices.removeListener("Gate_alert_received", handleGateAlertReceived);
        socketServices.removeListener("Visitor_Response_Notification", handleresponseRecieved);
        if (sound) {
          sound.stopAsync();
        }
      };
    }, [societyId, verifySecurityId, sound])
  );

  const closeModal = async () => {
    setModalVisible(false);
    if (sound) {
      await sound.stopAsync();
    }
  };

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "Home") {
              iconName = "home-outline";
            } else if (route.name === "Visitors Entries") {
              iconName = "log-in-outline";
            } else if (route.name === "Staff Entries") {
              iconName = "people-outline";
            } else if (route.name === "Settings") {
              iconName = "settings-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#7d0431",
          tabBarInactiveTintColor: "gray",
          headerTitle: () => null,
          headerStyle: {
            backgroundColor: "#7d0431",
          },
          headerLeft: () => (
            <View style={styles.headerLeftContainer}>
              <Avatar.Image
                size={40}
                source={{ uri: `${ImagebaseURL}${Guard.pictures}` }}
              />
              <View style={styles.nameContainer}>
                <Text style={styles.nameText}>{Guard.name}</Text>
                <Text style={styles.societyText}>
                  {society ? society.societyName : "..."}
                </Text>
              </View>
            </View>
          ),
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.notificationIcon}
              >
                <Ionicons name="log-out" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Visitors Entries" component={InandOut1} />
        <Tab.Screen name="Staff Entries" component={StaffVisitors} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>

      {/* Modal for Alert Notifications */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alert Notification</Text>
            {alertData && (
              <>
                <Text style={styles.modalText}>Alert: {alertData.alert}</Text>
                <Text style={styles.modalText}>Block: {alertData.block}</Text>
                <Text style={styles.modalText}>
                  Flat Number: {alertData.flatNumber}
                </Text>
                <Text style={styles.modalText}>
                  Resident Name: {alertData.residentName}
                </Text>
                <Text style={styles.modalText}>
                  Time: {new Date(alertData.alertTime).toLocaleString()}
                </Text>
              </>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#7d0431",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  headerLeftContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 15,
  },
  nameContainer: {
    marginLeft: 10,
  },
  nameText: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#FFFFFF",
  },
  societyText: {
    fontSize: 14,
    color: "#E0E0E0",
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  notificationIcon: {
    marginLeft: 15,
  },
});

export default SecurityTabs;
