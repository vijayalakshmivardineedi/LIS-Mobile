import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Avatar, RadioButton } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfiles } from "../../Redux/Slice/ProfileSlice/ProfileSlice";
import { ImagebaseURL } from "../../../Security/helpers/axios";
import { Dimensions } from "react-native";
import { fetchEvents } from "../../Redux/Slice/CommunitySlice/EventSlice";
import * as Linking from "expo-linking";
import {
  fetchNotices,
  selectNotices,
} from "../../Redux/Slice/CommunitySlice/NoticeSlice";
import socketServices from "../../Socket/SocketServices";
import { fetchBills } from "../../Redux/Slice/ProfileSlice/myBillsSlice";
const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  const dispatch = useDispatch();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState("");
  const [societyId, setSocietyId] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const notices = useSelector(selectNotices);
  const [polls, setPolls] = useState([]);
  const [checkedOption, setCheckedOption] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const { profiles } = useSelector((state) => state.profiles);
  const [expanded, setExpanded] = useState(false);
  const [expandedPollId, setExpandedPollId] = useState(null);
  const [verified, setVerified] = useState(null);

  const [upiId, setUpiId] = useState('7997148737@ibl');
  const [payeeName, setPayeeName] = useState('');
  // const [amount, setAmount] = useState('1');
  const [transactionNote, setTransactionNote] = useState("Maintenance");
  const [SelectedMonthPayment, setSelectedMonthPayment] = useState(null);


  const generateUpiUrl = (upiId, payeeName, amount, transactionNote) => {
    const currency = "INR";
    const encodedPayeeName = encodeURIComponent(payeeName);
    const encodedTransactionNote = encodeURIComponent(transactionNote);
    return `upi://pay?pa=${upiId}&pn=${encodedPayeeName}&am=${amount}&cu=${currency}&tn=${encodedTransactionNote}`;
  };
  const initiateUpiPayment = async (data) => {
    const upiUrl = generateUpiUrl(upiId, payeeName, data.amount, transactionNote);
    setSelectedMonthPayment(data.monthAndYear)

    try {
      const supported = await Linking.canOpenURL(upiUrl);
      if (supported) {
        await Linking.openURL(upiUrl);
      } else {
        Alert.alert("Error", "No UPI apps installed to handle the payment.");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to initiate UPI payment.");
      console.error(err);
    }
  };

  const toggleExpand = (pollId) => {
    setExpandedPollId((prevId) => (prevId === pollId ? null : pollId));
  };
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  const events = useSelector((state) => state.events.events);
  useFocusEffect(
    React.useCallback(() => {
      socketServices.initializeSocket();

      if (societyId) {
        socketServices.emit("joinSecurityPanel", societyId);
      }

      socketServices.on("Visitor_Request", async (data) => {

        // Fetch the NotifyUser if it's not already set
        if (!NotifyUser) {
          const userString = await AsyncStorage.getItem("user");
          if (userString !== null) {
            const user = JSON.parse(userString);
            console.log(user)
            if (user._id) {
              setNotifyUser(user._id);
            }
          }
        }
        if (data?.userId && NotifyUser) {
          console.log("Comparing User IDs:", data.userId, NotifyUser);
          if (data.userId === NotifyUser) {
            console.log("Matching visitor request data received:", data);
            const visitorName = data.visitorName || "Unknown Visitor";
            const flatNumber = data.flatNumber || "Unknown Flat";
            const buildingName = data.buildingName || "Unknown Building";
            const securityId = data.securityId || "Unknown Security ID";
            Alert.alert(
              `Visitor Request`,
              `Visitor ${visitorName} is requesting access to your flat ${flatNumber} in ${buildingName}. Do you want to approve?`,
              [
                {
                  text: "Decline",
                  onPress: () => {
                    socketServices.emit("Visitor_Response", {
                      visitorName,
                      response: "declined",
                      flatNumber,
                      buildingName,
                      residentName: payeeName,
                      societyId,
                      userId,
                      securityId,
                    });
                  },
                },
                {
                  text: "Approve",
                  onPress: () => {
                    socketServices.emit("Visitor_Response", {
                      visitorName,
                      response: "approved",
                      flatNumber,
                      buildingName,
                      residentName: payeeName,
                      societyId,
                      userId,
                      securityId,
                    });
                  },
                },
              ],
              { cancelable: false }
            );
          } else {
            console.log("UserId does not match the NotifyUser or incomplete data received.");
          }
        } else {
          console.error("Invalid data received for Visitor Request or NotifyUser not set:", data);
        }
      });

      return () => {
        socketServices.removeListener("Visitor_Request");
      };
    }, [societyId, userId])
  );
  useEffect(() => {
    const getUserName = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString !== null) {
          const user = JSON.parse(userString);
          setSocietyId(user.societyId);
          setUserId(user.userId);
          setVerified(user.isVerified);
          setPayeeName(user?.name)
        }
      } catch (error) {
        console.error("Failed to fetch the user from async storage", error);
      }
    };
    getUserName();
  }, []);
  useEffect(() => {
    if (verified === false) {
      navigation.reset({
        index: 0,
        routes: [{ name: "WaitingForAccess" }],
      });
    }
    if (userId && societyId) {
      dispatch(fetchUserProfiles({ userId, societyId }));
      dispatch(fetchEvents(societyId));
      dispatch(fetchNotices(societyId));
    }
    if (societyId && flatNumber && buildingName) {
      dispatch(
        fetchBills({ societyId, flatno: flatNumber, blockno: buildingName })
      );
    }
  }, [dispatch, userId, societyId, flatNumber, buildingName]);
  const { payments } = useSelector((state) => state.mybills.bills);

  useEffect(() => {
    if (profiles.length > 0) {
      const profile = profiles[0];
      setUserName(profile.name);
      setBuildingName(profile.buildingName);
      setFlatNumber(profile.flatNumber);
      setProfileImage(profile.profilePicture);
    }
  }, [profiles]);
  const navigation = useNavigation();

  const handleRadioButtonPress = (optionValue, pollId) => {
    setCheckedOption((prevState) => ({ ...prevState, [pollId]: optionValue }));
    const data = {
      userId: userId,
      pollId: pollId,
      selectedOption: optionValue,
    };
    socketServices.emit("vote_for__polls_by_UserID", data);
    socketServices.emit("get_polls_by_society_id", { societyId });
  };
  const unpaidBills = Array.isArray(payments)
    ? payments.filter((bill) => bill.status !== "Paid")
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading2}>{userName}</Text>
          <Text style={styles.subtitle}>
            {" "}
            {buildingName}-{flatNumber}
          </Text>
        </View>
        <View style={styles.iconAvatar}>
          <TouchableOpacity onPress={() => navigation.navigate("Notification")}>
            <Ionicons name="notifications" size={30} color="#DDDEE0" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Avatar.Image
              style={styles.avatar}
              resizeMode="cover"
              size={52}
              source={
                profileImage
                  ? { uri: `${ImagebaseURL}${profileImage}` }
                  : require("../../../../assets/User/images/man.png")
              }
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView vertical={true} style={styles.mainContainer}>
        {unpaidBills.length !== 0 ? <View style={styles.postContainer}>
          <View style={[styles.row, { justifyContent: "space-between" }]}>
            <View style={styles.row}>
              <Image
                source={require("../../../../assets/User/images/billdue.png")}
                style={styles.logo}
              />
              <Text style={styles.logoTitle}>Payment Due</Text>
            </View>
          </View>
          {unpaidBills.map((bill) => (
            <View w key={bill._id}>
              <View style={styles.divider} />
              <Text style={styles.description}>
                Your maintenance bill of{" "}
                <Text style={styles.logoTitle}>Rs. {bill.amount}</Text> for{" "}
                <Text style={styles.logoTitle}>{bill.monthAndYear}</Text> is
                due. Please make the payment.
              </Text>
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => initiateUpiPayment(bill)}
              >
                <Text style={styles.payButtonText}>Make Payment</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View> : null}

        {events && events.events && events.events.length > 0 ? (
          <View style={styles.postContainer}>
            <>
              <View style={[styles.row, { justifyContent: "space-between" }]}>
                <View style={styles.row}>
                  <Image
                    source={require("../../../../assets/User/images/hashtag.png")}
                    style={styles.logo}
                  />
                  <Text style={styles.logoTitle}>Events</Text>
                </View>
                <Text style={[styles.description, { color: "#777" }]}>
                  {new Date(
                    events.events[events.events.length - 1].createdAt
                  ).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                  })}
                </Text>
              </View>
              <View style={styles.divider} />

              <View>
                <Text style={styles.logoTitle}>
                  {events.events[events.events.length - 1].name}
                </Text>
                <Text>
                  {new Date(
                    events.events[events.events.length - 1].startDate
                  ).toLocaleDateString()}{" "}
                  -
                  {new Date(
                    events.events[events.events.length - 1].endDate
                  ).toLocaleDateString()}
                </Text>

                {expanded && (
                  <>
                    <View>
                      {events.events[events.events.length - 1].activities.map(
                        (activity, index) => (
                          <Text key={index}>{activity.type}</Text>
                        )
                      )}
                    </View>

                    <View
                      style={{ width: "auto", height: "auto", marginTop: 10 }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          justifyContent: "space-between",
                        }}
                      >
                        {events.events[events.events.length - 1].pictures.map(
                          (image, index) => (
                            <Image
                              key={index}
                              source={{ uri: `${ImagebaseURL}${image.img}` }}
                              style={{
                                width:
                                  events.events[events.events.length - 1]
                                    .pictures.length === 1 ||
                                  (events.events[events.events.length - 1]
                                    .pictures.length %
                                    2 !==
                                    0 &&
                                    index ===
                                      events.events[events.events.length - 1]
                                        .pictures.length -
                                        1)
                                    ? "100%"
                                    : "49%",
                                height: 100,
                                borderRadius: 4,
                                marginBottom: 10,
                              }}
                              resizeMode="cover"
                            />
                          )
                        )}
                      </View>
                    </View>
                  </>
                )}

                <TouchableOpacity onPress={toggleExpanded}>
                  <Text
                    style={[
                      styles.description,
                      { fontSize: 12, color: "#7d0431" },
                    ]}
                  >
                    {expanded ? "See Less..." : "See More..."}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          </View>
        ) : null}
        {notices && notices.notices && notices.notices.length > 0 ? (
          <View style={styles.postContainer}>
            <>
              <View style={[styles.row, { justifyContent: "space-between" }]}>
                <View style={styles.row}>
                  <Image
                    source={require("../../../../assets/User/images/megaphone (1).png")}
                    style={styles.logo}
                  />
                  <Text style={styles.logoTitle}>Notice</Text>
                </View>
                <Text style={[styles.description, { color: "#777" }]}>
                  {new Date(
                    notices.notices[notices.notices.length - 1].createdAt
                  ).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                  })}
                </Text>
              </View>
              <View style={styles.divider} />
              <Text style={styles.logoTitle}>
                {notices.notices[notices.notices.length - 1].subject}
              </Text>
              <Text style={styles.description}>
                {notices.notices[notices.notices.length - 1].description}
              </Text>
            </>
          </View>
        ) : null}
        {polls.length > 0 &&
          polls.map((pollItem, index) => (
            <View key={index} style={styles.postContainer}>
              <View>
                <View style={[styles.row, { justifyContent: "space-between" }]}>
                  <View style={styles.row}>
                    <Image
                      source={require("../../../../assets/User/images/poll (1).png")}
                      style={styles.logo}
                    />
                    <Text style={styles.logoTitle}>Polls</Text>
                  </View>
                  <Text style={[styles.description, { color: "#777" }]}>
                    {new Date(pollItem.poll.date).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                    })}
                  </Text>
                </View>
                <View style={styles.divider} />
                <Text style={styles.logoTitle}>{pollItem.poll.question}</Text>

                {/* Description and expand/collapse toggle */}
                <Text style={styles.description}>
                  {expandedPollId === pollItem._id
                    ? pollItem.poll.Description
                    : `${pollItem.poll.Description.substring(0, 100)}...`}
                </Text>

                {expandedPollId === pollItem._id && (
                  <>
                    {/* Options */}
                    {pollItem.poll.options.map((option, optionIndex) => (
                      <View key={optionIndex} style={styles.radioOption}>
                        <RadioButton
                          value={option}
                          status={
                            checkedOption[pollItem._id] === option
                              ? "checked"
                              : "unchecked"
                          }
                          theme={{ colors: { primary: "#7D0431" } }}
                          onPress={() =>
                            handleRadioButtonPress(option, pollItem)
                          }
                        />
                        <Text style={styles.radioLabel}>{option}</Text>
                      </View>
                    ))}

                    <View style={styles.divider} />
                    <View
                      style={[styles.row, { justifyContent: "space-between" }]}
                    >
                      <Text style={styles.description}>
                        Expires by:{" "}
                        {new Date(pollItem.poll.expDate).toLocaleDateString(
                          "en-US",
                          {
                            day: "2-digit",
                            month: "short",
                          }
                        )}{" "}
                        at{" "}
                        {new Date(pollItem.poll.expDate).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </Text>
                      <Text
                        style={styles.description}
                        onPress={() => navigation.navigate("Polls")}
                      >
                        <MaterialIcons
                          name="navigate-next"
                          size={22}
                          color="black"
                        />
                      </Text>
                    </View>
                  </>
                )}

                {/* See More / See Less Toggle */}
                <TouchableOpacity onPress={() => toggleExpand(pollItem._id)}>
                  <Text
                    style={[
                      styles.description,
                      { fontSize: 12, color: "#7d0431" },
                    ]}
                  >
                    {expandedPollId === pollItem._id ? "See less" : "See more"}
                    ...
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6f",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#7D0431",
    paddingVertical: height * 0.02,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: width * 0.05,
  },
  heading: {
    fontSize: width * 0.04,
    fontWeight: "400",
  },
  heading2: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    color: "#C59358",
  },
  subtitle: {
    color: "#FFFFFF",
    fontWeight: "300",
    fontSize: width * 0.036,
  },
  iconAvatar: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    marginLeft: width * 0.05,
  },
  mainContainer: {
    // paddingHorizontal: 10,
    paddingTop: 5,
    flex: 1,
  },
  postContainer: {
    borderWidth: 1,
    width: "95%",
    marginLeft: 10,
    borderColor: "#f6f6f6",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 5,
    marginVertical: 5,
    marginBottom: 20,
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 20,
    height: 20,
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    fontSize: 12,
    fontWeight: "400",
    marginTop: 5,
    letterSpacing: 0.2,
  },
  payButton: {
    alignItems: "flex-end",
    marginTop: 5,
  },
  payButtonText: {
    color: "#7d0431",
    paddingHorizontal: 8,
    fontWeight: "500",
    paddingVertical: 5,
    borderRadius: 3,
    fontSize: 12,
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginVertical: 5,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioLabel: {
    fontSize: 14,
    color: "#333",
    marginLeft: 5,
  },
});

export default HomeScreen;
