import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Dimensions,
  Share,
  Alert,
} from "react-native";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Avatar, Checkbox } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import {
  createVisitor,
  resetState,
} from "../../Redux/Slice/Security_Panel/VisitorsSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchUserProfiles } from "../../Redux/Slice/ProfileSlice/ProfileSlice";
import * as ImagePicker from "expo-image-picker";
import { Calendar } from "react-native-calendars";
import { ImagebaseURL } from "../../../Security/helpers/axios";
import socketServices from "../../Socket/SocketServices";
const { width, height } = Dimensions.get("window");

const QuickActions = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isCabModalVisible, setCabModalVisible] = useState(false);
  const [isDeliveryModalVisible, setDeliveryModalVisible] = useState(false);
  const [isInviteModalVisible, setInviteModalVisible] = useState(false);
  const [isHelpModalVisible, setHelpModalVisible] = useState(false);
  const [guestModalVisible, setGuestModalVisible] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAlertModalVisible, setAlertModalVisible] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [societyId, setSocietyId] = useState("");
  const [userId, setUserId] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [role, setRole] = useState("");
  const [qrImageUrl, setQrImageUrl] = useState(null);
  const [visitorId, setVisitorId] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  // Cab entry state
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [company, setCompany] = useState("");
  const [userName, setUserName] = useState("");

  //Delivery
  const [details, setDetails] = useState("");
  const [image, setImage] = useState(null);
  const handleImagePicker = async (type) => {
    let result;
    if (type === "camera") {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });
    }

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const chooseImageSource = () => {
    Alert.alert("Select Image Source", "Choose an option to pick an image", [
      {
        text: "Camera",
        onPress: () => handleImagePicker("camera"),
      },
      {
        text: "Gallery",
        onPress: () => handleImagePicker("gallery"),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const { profiles, } = useSelector((state) => state.profiles);
  const dispatch = useDispatch();
  const resetFields = () => {
    setImage("");
    setName("");
    setPhoneNumber("");
    setVehicleNumber("");
    setCompany("");
    setDetails("");
    setIsCheckboxChecked(false);
    setSelectedDate("");
  };

  useEffect(() => {
    const getUserName = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString !== null) {
          const user = JSON.parse(userString);
          setUserId(user.userId);
          setSocietyId(user.societyId);
          console.log(user)
          setUserName(user.residentName);
        }
      } catch (error) {
        console.error("Failed to fetch the user from async storage", error);
      }
    };
    getUserName();
    socketServices.initializeSocket();
  }, []);

  useEffect(() => {
    if (userId && societyId) {
      dispatch(fetchUserProfiles({ userId, societyId }));
    }
    if (societyId) {
      socketServices.emit("joinSecurityPanel", societyId);
    }
  }, [dispatch, userId, societyId]);
  useEffect(() => {
    if (profiles.length > 0) {
      const profile = profiles[0]; // Assuming you want the first profile, update as necessary
      setBuildingName(profile.buildingName);
      setFlatNumber(profile.flatNumber);
    }
  }, [profiles]);

  const handleSubmitCabEntry = () => {
    const visitorData = {
      userId,
      name,
      phoneNumber,
      vehicleNumber,
      company,
      date: selectedDate,
      societyId,
      block: buildingName,
      flatNo: flatNumber,
      role,
    };

    // Validation: Ensure all fields are filled
    if (
      name === "" ||
      phoneNumber === "" ||
      vehicleNumber === "" ||
      company === "" ||
      selectedDate === ""
    ) {
      // Show error toast if any field is empty
      Alert.alert("Please fill out all fields before submitting.");
    } else {
      // Proceed with submission if all fields are filled
      dispatch(createVisitor(visitorData)).then((result) => {
        if (createVisitor.fulfilled.match(result)) {
          Alert.alert("Success", "Cab entry created successfully");
          const { visitors } = result.payload.data.savedVisitor.society;

          const qrImage = result.payload.data.qrCodeUrl;
          const newVisitor = visitors[visitors.length - 1];
          const { visitorId } = newVisitor;
          setVisitorId(visitorId);
          setQrImageUrl(qrImage);
          setShowQrModal(true);
          resetFields();
          setCabModalVisible(false);
          setInviteModalVisible(true);
        } else {
          Alert.alert("Error", result.payload || "Failed to create cab entry");
        }
      });
    }
  };
  const handleSubmitDeliveryEntry = () => {
    const visitorData = {
      userId,
      name,
      phoneNumber,
      details,
      date: selectedDate,
      company,
      societyId,
      block: buildingName,
      flatNo: flatNumber,
      role,
    };
    if (
      name === "" ||
      phoneNumber === "" ||
      details === "" ||
      company === "" ||
      selectedDate === ""
    ) {
      // Show error toast if any field is empty
      Alert.alert("Please fill out all fields before submitting.");
    } else {
      dispatch(createVisitor(visitorData))
        .then((result) => {
          if (createVisitor.fulfilled.match(result)) {
            Alert.alert("Success", "Delivery entry created successfully");
            const { visitors } = result.payload.data.savedVisitor.society;
            const qrImage = result.payload.data.qrCodeUrl;
            const newVisitor = visitors[visitors.length - 1];
            const { visitorId } = newVisitor;
            setVisitorId(visitorId);
            setQrImageUrl(qrImage);
            setShowQrModal(true);
            resetFields();
            setDeliveryModalVisible(false);
            setInviteModalVisible(true);
          } else {
            Alert.alert(
              "Error",
              result.payload || "Failed to create cab entry"
            );
          }
        })
        .finally(() => {
          dispatch(resetState());
        });
    }
  };

  const handleSubmitGuestEntry = () => {
    const formData = new FormData();

    // Append fields to formData
    formData.append("userId", userId);
    formData.append("name", name);
    formData.append("phoneNumber", phoneNumber);
    formData.append("vehicleNumber", vehicleNumber);
    formData.append("date", selectedDate);
    formData.append("societyId", societyId);
    formData.append("block", buildingName);
    formData.append("flatNo", flatNumber);
    formData.append("role", role);
    formData.append("isFrequent", isCheckboxChecked);

    // Append image if it exists
    if (image) {
      const fileExtension = image.split(".").pop(); // e.g., 'jpeg'
      const mimeType = `image/${fileExtension}`; // e.g., 'image/jpeg'
      const fileName = `photo.${fileExtension}`; // e.g., 'photo.jpeg'

      const file = {
        uri: image,
        type: mimeType,
        name: fileName,
      };
      formData.append("pictures", file);
    }

    // Validation for required fields
    if (!name) {
      Alert.alert("Error", "Name is required");
      return;
    }
    if (!phoneNumber) {
      Alert.alert("Error", "Phone Number is required");
      return;
    }
    if (!vehicleNumber) {
      Alert.alert("Error", "Vehicle Number is required");
      return;
    }
    if (!selectedDate) {
      Alert.alert("Error", "Date is required");
      return;
    }
    if (!image) {
      Alert.alert("Error", "Image is required");
      return;
    }

    dispatch(createVisitor(formData))
      .then((result) => {
        console.log(result);

        if (createVisitor.fulfilled.match(result)) {
          Alert.alert("Success", "Visitor entry created successfully");
          const { visitors } = result.payload.data.savedVisitor.society;
          const qrImage = result.payload.data.qrCodeUrl;
          const newVisitor = visitors[visitors.length - 1];
          const { visitorId } = newVisitor;
          setVisitorId(visitorId);
          setQrImageUrl(qrImage);
          setShowQrModal(true);
          resetFields();
          setGuestModalVisible(false);
          setInviteModalVisible(true);
        } else {
          Alert.alert(
            "Error",
            result.payload || "Failed to create visitor entry"
          );
        }
      })
      .finally(() => {
        dispatch(resetState());
      });
  };

  const handleSubmitServiceEntry = () => {
    const visitorData = {
      userId,
      name,
      date: selectedDate,
      phoneNumber,
      company,
      details,
      vehicleNumber,
      societyId,
      block: buildingName,
      flatNo: flatNumber,
      role,
    };
    if (!name) {
      Alert.alert("Error", "Name is required");
      return;
    }
    if (!phoneNumber) {
      Alert.alert("Error", "Phone Number is required");
      return;
    }
    if (!vehicleNumber) {
      Alert.alert("Error", "Vehicle Number is required");
      return;
    }
    if (!selectedDate) {
      Alert.alert("Error", "Date is required");
      return;
    }
    if (!company) {
      Alert.alert("Error", "Company is required");
      return;
    }

    dispatch(createVisitor(visitorData))
      .then((result) => {
        if (createVisitor.fulfilled.match(result)) {
          Alert.alert("Success", "Service entry created successfully");
          const { visitors } = result.payload.data.savedVisitor.society;
          const qrImage = result.payload.data.qrCodeUrl;
          const newVisitor = visitors[visitors.length - 1];
          const { visitorId } = newVisitor;
          setVisitorId(visitorId);
          setQrImageUrl(qrImage);
          setShowQrModal(true);
          resetFields();
          setDeliveryModalVisible(false);
          setInviteModalVisible(true);
        } else {
          Alert.alert("Error", result.payload || "Failed to create cab entry");
        }
      })
      .finally(() => {
        dispatch(resetState());
      });
  };

  const handleActionPress = (action) => {
    if (action === "Cab") {
      setRole("Cab");
      setCabModalVisible(true);
    } else if (action === "Delivery") {
      setRole("Delivery");
      setDeliveryModalVisible(true);
    } else if (action === "Help") {
      setRole("Service");
      setHelpModalVisible(true);
    } else if (action === "Guest") {
      setRole("Guest");
      setGuestModalVisible(true);
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this entry code!${visitorId}`,
        url: qrImageUrl,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
        } else {
        }
      } else if (result.action === Share.dismissedAction) {
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const toggleAlertModal = () => {
    setAlertModalVisible(!isAlertModalVisible);
  };

  const handleOptionPress = (option) => {
    setSelectedOption(option);
  };

  const handleRaiseAlarm = () => {
    if (!selectedOption) {
      alert("Please select an option before raising an alarm.");
      return;
    }
    console.log(userName, "username")
    const alarmData = {
      option: selectedOption,
      societyId: societyId,
      block: buildingName,
      flatNumber: flatNumber,
      residentName: userName,
    };


    socketServices.emit("Notify-Gate", { alarmData });

    alert("Alarm raised! Security has been notified.");

    toggleModal();
  };


  const renderOption = (option, imageSource, label) => (
    <TouchableOpacity
      style={[
        styles.iconWrapper,
        selectedOption === option && styles.selectedIconWrapper,
      ]}
      onPress={() => handleOptionPress(option)}
    >
      <Image source={imageSource} style={styles.icon} />
      <Text style={styles.iconLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Allow Future Entry</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity
          style={styles.iconWrapper}
          onPress={() => handleActionPress("Cab")}
        >
          <Image
            source={require("../../../../assets/User/images/taxi (2).png")}
            style={styles.icon}
          />
          <Text style={styles.iconLabel}>Cab</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconWrapper}
          onPress={() => handleActionPress("Delivery")}
        >
          <Image
            source={require("../../../../assets/User/images/fast-delivery (1).png")}
            style={styles.icon}
          />
          <Text style={styles.iconLabel}>Delivery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconWrapper}
          onPress={() => handleActionPress("Help")}
        >
          <Image
            source={require("../../../../assets/User/images/policemen.png")}
            style={styles.icon}
          />
          <Text style={styles.iconLabel}>Help</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconWrapper}
          onPress={() => handleActionPress("Guest")}
        >
          <Image
            source={require("../../../../assets/User/images/cake.png")}
            style={styles.icon}
          />
          <Text style={styles.iconLabel}>Guest</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.heading}>Notify Gate</Text>

      <View style={styles.iconContainer}>
        <TouchableOpacity style={styles.iconWrapper} onPress={toggleModal}>
          <Image
            source={require("../../../../assets/User/images/warning (1).png")}
            style={styles.icon}
          />
          <Text style={styles.iconLabel}>Security Alert</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconWrapper}
          onPress={() => navigation.navigate("Call to Security")}
        >
          <Image
            source={require("../../../../assets/User/images/phone1.png")}
            style={styles.icon}
          />
          <Text style={styles.iconLabel}>Call to Security</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconWrapper}
          onPress={() => navigation.navigate("Pre Approval Visitors")}
        >
          <Image
            source={require("../../../../assets/User/images/id.png")}
            style={styles.icon}
          />
          <Text style={styles.iconLabel}>Pre Approval Visitors</Text>
        </TouchableOpacity>
      </View>

      {/* Cab Modal */}
      <Modal
        visible={isCabModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCabModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeIconContainer}
              onPress={() => setCabModalVisible(false)}
            >
              <MaterialCommunityIcons name="close" style={styles.closeIcon} />
            </TouchableOpacity>
            <Avatar.Image
              size={120}
              source={require("../../../../assets/User/images/taxi (2).png")}
              style={styles.modalImage}
            />
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Vehicle Number"
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Company"
              value={company}
              onChangeText={setCompany}
            />
            <TouchableOpacity
              style={styles.input}
              onPress={() => setCalendarModalVisible(true)}
            >
              <TextInput
                placeholder="Select Date"
                value={selectedDate || "Select Date"}
                editable={false}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmitCabEntry}
            >
              <Text style={styles.buttonText}>Invite Cab</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Delivery Modal */}
      <Modal
        visible={isDeliveryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDeliveryModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeIconContainer}
              onPress={() => setDeliveryModalVisible(false)}
            >
              <MaterialCommunityIcons name="close" style={styles.closeIcon} />
            </TouchableOpacity>
            <Avatar.Image
              size={120}
              source={require("../../../../assets/User/images/fast-delivery (1).png")}
              style={styles.modalImage}
            />
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Company"
              value={company}
              onChangeText={setCompany}
            />
            <TextInput
              style={styles.input}
              placeholder="Order ID"
              value={details}
              onChangeText={setDetails}
            />
            <TouchableOpacity
              style={styles.input}
              onPress={() => setCalendarModalVisible(true)}
            >
              <TextInput
                placeholder="Select Date"
                value={selectedDate || "Select Date"}
                editable={false}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmitDeliveryEntry}
            >
              <Text style={styles.buttonText}>Invite Delivery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Help */}
      <Modal
        visible={isHelpModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeIconContainer}
              onPress={() => setHelpModalVisible(false)}
            >
              <MaterialCommunityIcons name="close" style={styles.closeIcon} />
            </TouchableOpacity>
            <Avatar.Image
              size={120}
              source={require("../../../../assets/User/images/policemen.png")}
              style={styles.modalImage}
            />
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Vehicle Number"
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Company"
              value={company}
              onChangeText={setCompany}
            />
            <TextInput
              style={styles.input}
              placeholder="Details"
              value={details}
              onChangeText={setDetails}
            />
            <TouchableOpacity
              style={styles.input}
              onPress={() => setCalendarModalVisible(true)}
            >
              <TextInput
                placeholder="Select Date"
                value={selectedDate || "Select Date"}
                editable={false}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmitServiceEntry}
            >
              <Text style={styles.buttonText}>Invite Service</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Guest */}
      <Modal
        visible={guestModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setGuestModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeIconContainer}
              onPress={() => setGuestModalVisible(false)}
            >
              <MaterialCommunityIcons name="close" style={styles.closeIcon} />
            </TouchableOpacity>
            <View style={styles.profilecontainer}>
              <TouchableOpacity onPress={chooseImageSource}>
                <Avatar.Image
                  size={120}
                  source={
                    image
                      ? { uri: image }
                      : require("../../../../assets/User/images/cake.png")
                  }
                  style={styles.modalImage}
                />
                <TouchableOpacity
                  onPress={chooseImageSource}
                  style={styles.cameraIcon}
                >
                  <Entypo name="camera" size={20} color="#7d0431" />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Vehicle Number"
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
            />
            <TouchableOpacity
              style={styles.input}
              onPress={() => setCalendarModalVisible(true)}
            >
              <TextInput
                placeholder="Select Date"
                value={selectedDate || "Select Date"}
                editable={false}
              />
            </TouchableOpacity>

            <View style={styles.checkboxContainer}>
              <Checkbox
                status={isCheckboxChecked ? "checked" : "unchecked"}
                onPress={() => setIsCheckboxChecked(!isCheckboxChecked)}
                theme={{ colors: { primary: "#7d0431" } }}
              />
              <Text style={{ marginTop: 7 }}>Add to frequent Visitor</Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmitGuestEntry}
            >
              <Text style={styles.buttonText}>Invite Guest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={calendarModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCalendarModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.calendarModalContent}>
            <TouchableOpacity
              style={styles.closeIconContainer}
              onPress={() => setCalendarModalVisible(false)}
            >
              <MaterialCommunityIcons name="close" style={styles.closeIcon} />
            </TouchableOpacity>
            <Calendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setCalendarModalVisible(false);
              }}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                  disableTouchEvent: true,
                  selectedColor: "blue",
                  selectedTextColor: "#fff",
                },
              }}
              theme={{
                arrowColor: "blue",
                monthTextColor: "blue",
              }}
            />
          </View>
        </View>
      </Modal>
      <Modal
        visible={showQrModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowQrModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeIconContainer}
              onPress={() => setShowQrModal(false)}
            >
              <MaterialCommunityIcons name="close" style={styles.closeIcon} />
            </TouchableOpacity>
            {qrImageUrl && (
              <>
                <Image
                  source={{ uri: `${ImagebaseURL}${qrImageUrl}` }}
                  style={styles.qrImage}
                />

                <Text style={{ marginBottom: 5 }}>Visitor ID: {visitorId}</Text>
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={handleShare}
                >
                  <View style={styles.shareButtonContent}>
                    <MaterialCommunityIcons
                      name="share"
                      color="#fff"
                      size={20}
                    />
                    <Text style={styles.shareButtonText}>Share</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
            {!qrImageUrl && <ActivityIndicator size="large" color="#0000ff" />}
          </View>
        </View>
      </Modal>
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleModal}
      >
        <View style={[styles.modalOverlay1]}>
          <View style={styles.modalContent1}>
            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>

            <View style={styles.iconContainer1}>
              {renderOption(
                "Fire",
                require("../../../../assets/User/images/fire.png"),
                "Fire"
              )}
              {renderOption(
                "Stuck in Lift",
                require("../../../../assets/User/images/elevator.png"),
                "Stuck in Lift"
              )}
              {renderOption(
                "Animal Threat",
                require("../../../../assets/User/images/snake.png"),
                "Animal Threat"
              )}
              {renderOption(
                "Visitors Threat",
                require("../../../../assets/User/images/traveler.png"),
                "Visitors Threat"
              )}
            </View>

            <TouchableOpacity
              style={styles.raiseAlarmButton}
              onPress={handleRaiseAlarm}
            >
              <Text style={styles.raiseAlarmButtonText}>Raise Alarm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      <Modal
        visible={isAlertModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleAlertModal}
      >
        <View style={styles.modalOverlay2}>
          <View style={styles.modalContent2}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={toggleAlertModal}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <Image
              source={require("../../../../assets/User/images/alert.png")}
              style={styles.alertIcon}
            />
            <Text style={styles.alertMessage}>
              Alarm Raised for {selectedOption}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "flex-start",
    paddingHorizontal: width * 0.04,
    backgroundColor: "#fff",
    paddingTop: height * 0.03,
  },
  heading: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#484848",
    marginBottom: height * 0.02,
    marginBottom: height * 0.02,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: height * 0.05,
  },
  iconContainer1: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: height * 0.05,
  },
  iconWrapper: {
    alignItems: "center",
    width: width * 0.18,
    height: height * 0.09,
    borderRadius: 50,
    marginRight: width * 0.073,
    borderWidth: 1,
    backgroundColor: "#f7f7f7",
    borderColor: "#f0f3f4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    width: width * 0.11,
    height: height * 0.05,
    marginTop: height * 0.023,
    marginTop: width * 0.03,
  },
  iconLabel: {
    marginTop: 5,
    color: "#222222",
    textAlign: "center",
    marginTop: width * 0.03,
    marginTop: height * 0.03,
    fontSize: 12,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",

    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: width * 0.8,
    alignItems: "center",
  },
  closeIconContainer: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  closeIcon: {
    fontSize: 24,
    color: "#555",
  },
  modalImage: {
    backgroundColor: "#F3E1D5",
    borderColor: "#C59358",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    marginBottom: 20,
    paddingLeft: 10,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#7D0431",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  entryCode: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#192c4c",
    marginBottom: 20,
  },
  qrImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  shareButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#7D0431",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  shareButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  shareButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  container3: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  checkbox: {
    alignSelf: "center",
  },
  label: {
    margin: 8,
  },
  additionalContent: {
    fontSize: 16,
    marginTop: 10,
  },
  modalOverlay1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent1: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: width,
    alignItems: "center",
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: "red",
  },
  raiseAlarmButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "red",
    alignItems: "center",
    borderRadius: 5,
  },
  raiseAlarmButtonText: {
    color: "white",
    fontSize: 16,
  },
  modalOverlay2: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent2: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  alertIcon: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  alertMessage: {
    fontSize: 18,
    fontWeight: "bold",
  },
  selectedIconWrapper: {
    backgroundColor: "#7D0431",
  },
  calendarModalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    alignItems: "center",
  },
  profilecontainer: {
    alignItems: "center",
    position: "relative",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 10,
    right: 5,
    borderRadius: 50,
    backgroundColor: " rgba(0,0,0,0.2)",
    padding: 10,
  },
});

export default QuickActions;
