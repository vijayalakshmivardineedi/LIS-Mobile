import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  Image,
} from "react-native";
import { Avatar, TextInput } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import {
  createVisitor,
  resetState,
} from "../../User/Redux/Slice/Security_Panel/VisitorsSlice";
import { fetchSocietyById } from "../../User/Redux/Slice/Security_Panel/SocietyByIdSlice";
import MyDialog from "../DialogBox/DialogBox";
import * as ImagePicker from "expo-image-picker";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, Entypo, MaterialIcons } from "@expo/vector-icons";
import socketServices from "../../User/Socket/SocketServices";
import { fetchresidents } from "../../User/Redux/Slice/CommunitySlice/residentsSlice";

const AddService = ({ route, navigation }) => {
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [nameError, setNameError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [company, setCompany] = useState("");
  const [companyError, setCompanyError] = useState("");
  const [details, setDetails] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [block, setBlock] = useState("");
  const [blockError, setBlockError] = useState("");
  const [user, setuser] = useState("");
  const [userId, setuserId] = useState("");
  const [usersInFlat, setUsersInFlat] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [flatNo, setFlatNo] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [buildings, setBuildings] = useState();
  const [flatsForSelectedBlock, setFlatsForSelectedBlock] = useState([]);
  const [flatNoError, setFlatNoError] = useState("");
  const [showBuildingDropdown, setShowBuildingDropdown] = useState(false);
  const [showFlatNoDropdown, setShowFlatNoDropdown] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const error = useSelector((state) => state.visitor.error);
  const successMessage = useSelector((state) => state.visitor.successMessage);
  const [showModal, setShowModal] = useState(false);
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const dispatch = useDispatch();

  
  const [societyId, setSocietyId] = useState(null);
  const [securityId, setSecurityId] = useState(null);
  const { userProfiles } = useSelector((state) => state.userResidents);
  useEffect(() => {
    const getSocietyId = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        const id = JSON.parse(user);
        console.log(user, "security");
        if (id !== null) {
          setSocietyId(id.societyId);
          setSecurityId(id._id);
        } else {
          console.error("No societyId found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching societyId from AsyncStorage:", error);
      }
    };
    getSocietyId();
    socketServices.initializeSocket();
  }, []);
  const { society } = useSelector((state) => state.societyById);
  console.log(successMessage);

  useEffect(() => {
    if (society) {
      setBuildings(society.blocks);
    }
  }, [society]);
  useEffect(() => {
    if (societyId) {
      dispatch(fetchresidents(societyId)).then((response) => {
        if (response.type === "residents/fetchResidents/fulfilled") {
          console.log(response.payload); // Set all residents here
        }
      });
    }
  }, [dispatch, societyId]);
  useEffect(() => {
    if (societyId) {
      dispatch(fetchSocietyById(societyId));
      socketServices.emit("joinSecurityPanel", societyId);
    }
  }, [dispatch, societyId]);

  const selectBuilding = (building) => {
    setBlock(building.blockName);
    setShowBuildingDropdown(false);
    const fetchedFlats = fetchFlatsForBlock(building.blockName);
    setFlatsForSelectedBlock(fetchedFlats);
  };
  const fetchFlatsForBlock = (block) => {
    const flats =
      buildings.find((item) => item.blockName === block)?.flats || [];
    return flats;
  };
  const filterResidents = (selectedBlock, selectedFlat) => {
    return userProfiles.filter((resident) => {
      return (
        resident.buildingName === selectedBlock &&
        resident.flatNumber === selectedFlat
      );
    });
  };
  const selectFlatNo = (flat) => {
    setFlatNo(flat.flatNumber);
    setShowFlatNoDropdown(false);
    // Filter residents based on selected block and flat
    const filteredResidents = filterResidents(block, flat.flatNumber);

    setUsersInFlat(filteredResidents); // Update usersInFlat with filtered residents
    setShowUserDropdown(true); // Show the user dropdown
  };
  const selectuser = (user) => {
    setuser(user.name);
    setuserId(user._id);
    setShowUserDropdown(false);
  };
  const validateInputs = () => {
    let isValid = true;
    if (!name) {
      setNameError("Please enter your Name.");
      isValid = false;
    } else {
      setNameError("");
    }

    if (!phoneNumber) {
      setPhoneNumberError("Please enter your phone number.");
      isValid = false;
    } else {
      const phonePattern = /^[0-9]{10}$/;
      if (!phonePattern.test(phoneNumber)) {
        setPhoneNumberError("Please enter a valid phone number.");
        isValid = false;
      } else {
        setPhoneNumberError("");
      }
    }
    if (!company) {
      setCompanyError("Please enter your Company.");
      isValid = false;
    } else {
      setCompanyError("");
    }

    if (!details) {
      setDetailsError("Please enter your Details.");
      isValid = false;
    } else {
      setDetailsError("");
    }

    if (!block) {
      setBlockError("Block selection is required");
      isValid = false;
    } else {
      setBlockError("");
    }

    if (!flatNo) {
      setFlatNoError("Flat number is required");
      isValid = false;
    } else {
      setFlatNoError("");
    }
    return isValid;
  };

  const handleConfirm = async () => {
    if (validateInputs()) {
      setLoading(true);
      const status = "Waiting";
      const role = "Service";
      const date = new Date().toISOString();
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phoneNumber", phoneNumber);
      formData.append("details", details);
      formData.append("company", company);
      formData.append("societyId", societyId);
      formData.append("status", status);
      formData.append("role", role);
      formData.append("block", block);
      formData.append("flatNo", flatNo);
      formData.append("date", date);
      if (imageFile) {
        formData.append("pictures", {
          uri: imageFile.uri,
          name: imageFile.name,
          type: imageFile.type,
        });
      }
      try {
        const response = await dispatch(createVisitor(formData));
        if (response.meta.requestStatus === "fulfilled") {
          const data = {
            visitorName: name,
            flatNumber: flatNo,
            buildingName: block,
            societyId: societyId,
            action: "approve or decline",
            securityId: securityId,
          };
          socketServices.emit("AddVisitor", { data });
          setName("");
          setPhoneNumber("");
          setDetails("");
          setCompany("");
          setBlock("");
          setFlatNo("");
          setImageFile(null);
          setImagePreview(null);
          setDialogMessage(response.payload.message);
          setShowDialog(true);
          setTimeout(() => {
            setShowDialog(false);
            dispatch(resetState());
            navigation.navigate("SecurityTabs", { screen: "Visitors Entries" });
          }, 1000);
        } else {
          setDialogMessage(response.payload.message || "An error occurred");
          setShowDialog(true);
          setTimeout(() => {
            setShowDialog(false);
          }, 1000);
        }
      } catch (error) {
        console.error(error);
        setDialogMessage("An error occurred while creating the visitor.");
        setShowDialog(true);
        setTimeout(() => {
          setShowDialog(false);
        }, 1000);
      } finally {
        setLoading(false);
      }
    }
  };
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0]?.uri;
      if (uri) {
        setImageFile({ uri, name: uri.split("/").pop(), type: "image/jpeg" });
        setImagePreview(uri);
        setShowModal(false);
      }
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets && result.assets[0]?.uri;
        if (uri) {
          setImageFile({ uri, name: uri.split("/").pop(), type: "image/jpeg" });
          setImagePreview(uri);
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error("Error launching camera:", error);
    }
  };

  const deletePhoto = () => {
    Alert.alert(
      "Remove Profile Photo",
      "Are you sure you want to remove the profile photo?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: () => {
            setImageFile(null);
            setImagePreview(null);
            setShowModal(false);
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const closeCross = () => {
    setShowModal(false);
  };
  const handleAvatarPress = () => {
    if (imagePreview) {
      setImageModalVisible(true);
    } else {
      Alert.alert("No Image", "Please upload an image.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        vertical={true}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarWrapper}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleAvatarPress}
          >
            {imagePreview ? (
              <Avatar.Image
                style={styles.avatar}
                resizeMode="cover"
                size={174}
                source={{ uri: imagePreview }}
              />
            ) : (
              <Avatar.Image
                size={174}
                style={styles.avatar}
                color="#fff"
                source={require("../../../assets/Security/images/user.png")}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cameraIconContainer}
            onPress={handleOpenModal}
          >
            <MaterialCommunityIcons
              name="camera-outline"
              size={25}
              color="#ddd"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContent}>
          <TextInput
            style={[styles.inputBlock, nameError && { borderColor: "red" }]}
            label="Name *"
            value={name}
            mode="outlined"
            outlineColor={nameError ? "red" : "#ccc"}
            theme={{ colors: { primary: nameError ? "red" : "#800336" } }}
            // error={!!nameError}
            onChangeText={setName}
          />
          {nameError ? (
            <Text style={styles.errorMessage}>{nameError}</Text>
          ) : null}

          <TextInput
            style={[
              styles.inputBlock,
              { marginTop: 10 },
              phoneNumberError && { borderColor: "red" },
            ]}
            label="Phone Number *"
            value={phoneNumber}
            keyboardType="phone-pad"
            mode="outlined"
            outlineColor={phoneNumberError ? "red" : "#CCC"}
            theme={{
              colors: { primary: phoneNumberError ? "red" : "#800336" },
            }}
            // error={!!phoneNumberError}
            onChangeText={(text) => {
              setPhoneNumber(text);
              setPhoneNumberError("");
            }}
          />
          {phoneNumberError ? (
            <Text style={styles.errorMessage}>{phoneNumberError}</Text>
          ) : null}

          <TextInput
            style={[
              styles.inputBlock,
              { marginTop: 10 },
              companyError && { borderColor: "red" },
            ]}
            label="Company *"
            value={company}
            mode="outlined"
            outlineColor={companyError ? "red" : "#CCC"}
            theme={{ colors: { primary: companyError ? "red" : "#800336" } }}
            // error={!!companyError}
            onChangeText={setCompany}
          />
          {companyError ? (
            <Text style={styles.errorMessage}> {companyError}</Text>
          ) : null}

          <TextInput
            style={[
              styles.inputBlock,
              { marginTop: 10 },
              detailsError && { borderColor: "red" },
            ]}
            label="Details *"
            value={details}
            mode="outlined"
            outlineColor={detailsError ? "red" : "#CCC"}
            theme={{ colors: { primary: detailsError ? "red" : "#800336" } }}
            // error={!!detailsError}
            onChangeText={(text) => setDetails(text)}
          />
          {detailsError ? (
            <Text style={styles.errorMessage}>{detailsError}</Text>
          ) : null}

          <View>
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                showBuildingDropdown && styles.dropdownActive,
                { marginTop: 15 },
                blockError && { borderColor: "red" },
              ]}
              onPress={() => setShowBuildingDropdown(!showBuildingDropdown)}
            >
              <Text style={styles.dropdownButtonText}>
                {" "}
                {block ? `${block}` : "Select Block *"}{" "}
              </Text>
              <Text>
                <MaterialIcons
                  name={
                    showBuildingDropdown ? "arrow-drop-up" : "arrow-drop-down"
                  }
                  size={20}
                  color="#000"
                  style={{ marginRight: 5 }}
                />
              </Text>
            </TouchableOpacity>
            {showBuildingDropdown && (
              <View style={styles.dropdownMenu}>
                {buildings.map((building) => (
                  <TouchableOpacity
                    key={building.blockName}
                    style={styles.dropdownItem}
                    onPress={() => selectBuilding(building)}
                  >
                    <Text style={styles.dropdownItemText}>
                      {building.blockName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          {blockError ? (
            <Text style={styles.errorMessage}>{blockError}</Text>
          ) : null}

          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                showFlatNoDropdown && styles.dropdownActive,
                { marginTop: 15 },
                flatNoError && { borderColor: "red" },
              ]}
              onPress={() => setShowFlatNoDropdown(!showFlatNoDropdown)}
            >
              <Text style={styles.dropdownButtonText}>
                {" "}
                {flatNo ? `${flatNo}` : "Select Flat Number *"}{" "}
              </Text>
              <Text>
                <MaterialIcons
                  name={
                    showFlatNoDropdown ? "arrow-drop-up" : "arrow-drop-down"
                  }
                  size={20}
                  color="#000"
                  style={{ marginRight: 5 }}
                />
              </Text>
            </TouchableOpacity>
            {showFlatNoDropdown && (
              <View style={styles.dropdownMenu}>
                {flatsForSelectedBlock.map((flat) => (
                  <TouchableOpacity
                    key={flat.flatNumber}
                    style={styles.dropdownItem}
                    onPress={() => selectFlatNo(flat)}
                  >
                    <Text style={styles.dropdownItemText}>
                      {flat.flatNumber}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {flatNoError ? (
            <Text style={styles.errorMessage}>{flatNoError}</Text>
          ) : null}
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              showUserDropdown && styles.dropdownActive,
              { marginTop: 15 },
              flatNoError && { borderColor: "red" },
            ]}
            onPress={() => setShowUserDropdown(!showUserDropdown)}
          >
            <Text style={styles.dropdownButtonText}>
              {user ? `${user}` : "Select User *"}
            </Text>
            <Text>
              <MaterialIcons
                name={showUserDropdown ? "arrow-drop-up" : "arrow-drop-down"}
                size={20}
                color="#000"
                style={{ marginRight: 5 }}
              />
            </Text>
          </TouchableOpacity>
          {showUserDropdown && usersInFlat.length > 0 && (
            <View style={styles.dropdownMenu}>
              {usersInFlat.map((user) => (
                <TouchableOpacity
                  key={user._id}
                  style={styles.dropdownItem}
                  onPress={() => selectuser(user)}
                >
                  <Text style={styles.dropdownItemText}>{user.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          disabled={loading}
        >
          <Text style={styles.confirmButtonText}>Add</Text>
        </TouchableOpacity>
      </ScrollView>
      <MyDialog
        message={dialogMessage || error}
        showDialog={showDialog}
        onClose={() => setShowDialog(false)}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={{ fontSize: 22, fontWeight: "700" }}>
                Profile Photo
              </Text>
              <TouchableOpacity style={{ position: "absolute", right: 0 }}>
                <Entypo
                  name="circle-with-cross"
                  size={27}
                  color="#800336"
                  onPress={closeCross}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.icons}>
              <View style={styles.camera}>
                <TouchableOpacity onPress={takePhoto}>
                  <MaterialCommunityIcons
                    name="camera-outline"
                    size={27}
                    color="#800336"
                  />
                  <Text style={styles.camText}>Camera</Text>
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity onPress={pickImage}>
                  <MaterialCommunityIcons
                    name="view-gallery-outline"
                    size={27}
                    color="#800336"
                  />
                  <Text style={styles.camText}>Gallery</Text>
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity onPress={deletePhoto}>
                  <AntDesign name="delete" size={27} color="#800336" />
                  <Text style={styles.camText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.fullScreenImageContainer}>
          <View style={styles.profileHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => setImageModalVisible(false)}>
                <AntDesign name="arrowleft" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.profileText}>Profile Photo</Text>
            </View>
            <TouchableOpacity onPress={() => setShowModal(true)}>
              <MaterialIcons name="edit" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <Image
            source={{ uri: imagePreview }}
            style={styles.fullScreenImage}
            resizeMode="cover"
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  avatarWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#ccc",
  },
  cameraIconContainer: {
    bottom: 60,
    right: -60,
    backgroundColor: "#800336",
    borderRadius: 30,
    padding: 10,
  },
  inputContent: {
    marginBottom: 20,
  },
  inputBlock: {
    marginBottom: 2,
    backgroundColor: "#fff",
  },

  errorMessage: {
    color: "red",
    fontSize: 12,
  },
  dropdownButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    borderRadius: 4,
    marginBottom: 2,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdownMenu: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    marginTop: 13,
  },
  dropdownActive: {
    borderColor: "#800336",
    borderWidth: 2,
  },
  dropdownItem: {
    padding: 15,
  },
  dropdownItemText: {
    color: "#192c4c",
  },

  confirmButton: {
    backgroundColor: "#800336",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 3,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  modalBackground: {
    backgroundColor: "rgba(0,0,0,0.4)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    position: "absolute",
    bottom: 0,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    height: "auto",
    width: "100%",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  modalHeader: {
    paddingTop: 7,
    flexDirection: "row",
    alignItems: "center",
  },
  icons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  camera: {
    padding: 10,
  },
  camText: {
    marginTop: 10,
  },
  fullScreenImageContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  fullScreenImage: {
    width: "100%",
    height: "50%",
    justifyContent: "center",
    marginTop: 150,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  profileText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 25,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
});

export default AddService;
