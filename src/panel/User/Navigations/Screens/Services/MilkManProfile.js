import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Rating } from 'react-native-ratings';
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchServices } from "../../../Redux/Slice/ServiceSlice/ServiceSlice";
import { Avatar } from "react-native-paper";
import { addService } from "../../../Redux/Slice/ServiceSlice/AddServiceSlice";

const MilkManProfile = ({ route }) => {
  const dispatch = useDispatch();

  const { id, userid } = route.params;
  const { data, } = useSelector((state) => state.services);
  const [userId, setUserId] = useState(null);
  const [flatNumber, setFlatNumber] = useState(null);
  const [blockName, setblockName] = useState(null);
  const [societyId, setSocietyId] = useState(null);
  useEffect(() => {
    const getuser = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        if (userString !== null) {
          const user = JSON.parse(userString);
          setUserId(user.userId);
          setblockName(user.buildingName);
          setFlatNumber(user.flatNumber);
          setSocietyId(user.societyId);
        } else {
          console.error('No societyId found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching societyId from AsyncStorage:', error);
      }
    };
    getuser();
  }, []);
  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(null);

  const handleAddPress = () => {
    if (selectedSlot && selectedQuantity) {
      setModalVisible(true);
    } else {
      Alert.alert("Please select time slot.");
    }
  };

  const selectSlot = (slot) => {
    setSelectedSlot(slot);
  };

  const handleContinuePress = async () => {
    try {
      const serviceData = {
        societyId: societyId,
        serviceType: "milkMan",
        userid: userid,
        list: [
          {
            userId: userId,
            Block: blockName,
            flatNumber: flatNumber,
            timings: selectedSlot,
            liters: selectedQuantity
          },
        ],
      };
      const result = await dispatch(addService(serviceData));
      if (result.type === "services/addService/fulfilled") {
        setModalVisible(false);
        Alert.alert(result.payload.message);
      }
    } catch (error) {
      console.error(error)
    }
  };

  const filteredMilkMan = data.milkMan.find(milkMan => milkMan._id === id);

  if (!filteredMilkMan) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.container}>
          <View style={styles.card}>
            <Avatar.Image source={{ uri: `https://livinsync.onrender.com${filteredMilkMan.pictures}` }} size={100} style={styles.avatarContainer} />

            <View style={styles.content}>
              <Text style={styles.cardTitle}>{filteredMilkMan.name}</Text>
              <View style={styles.locationContainer}>
                <Ionicons
                  name="call"
                  size={16}
                  color="#C59358"
                  style={styles.locationIcon}
                />
                <Text style={styles.cardSubText1}>{filteredMilkMan.phoneNumber}</Text>
              </View>
              <View style={styles.locationContainer}>
                <Ionicons
                  name="location"
                  size={16}
                  color="#C59358"
                  style={styles.locationIcon}
                />
                <Text style={styles.cardSubText1}>
                  {filteredMilkMan.address}
                </Text>
              </View>
              <View
                style={{ flexDirection: "row", justifyContent: "space-between" }}
              >
                <View style={styles.reviewContainer}>
                  <Rating
                    type='star'
                    ratingCount={5}
                    imageSize={20}
                    startingValue={filteredMilkMan.list.rating}
                    readonly
                    ratingColor="#C59358"
                  />
                </View>
                <TouchableOpacity onPress={handleAddPress}>
                  <Text style={styles.newCardNumber1}>ADD</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.newCard}>
            <View style={styles.newCardItem}>
              <Image
                source={require("../../../../../assets/User/images/punctuality.png")}
                style={styles.newCardImage}
              />
              <Text style={styles.newCardNumber}>4.75</Text>
              <Text style={styles.newCardText}>Time</Text>
              <Text style={styles.newCardSubText}>Punctual</Text>
            </View>
            <View style={styles.newCardItem}>
              <Image
                source={require("../../../../../assets/User/images/schedule.png")}
                style={styles.newCardImage}
              />
              <Text style={styles.newCardNumber}>4.5</Text>
              <Text style={styles.newCardText}>Quite</Text>
              <Text style={styles.newCardSubText}>Regular</Text>
            </View>

            <View style={styles.newCardItem}>
              <Image
                source={require("../../../../../assets/User/images/attitude.png")}
                style={styles.newCardImage}
              />
              <Text style={styles.newCardNumber}>4.9</Text>
              <Text style={styles.newCardText}>Good</Text>
              <Text style={styles.newCardSubText}>Behaviors</Text>
            </View>
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 10 }}>Quantity of Milk</Text>
            <View style={[styles.timeSlotsContainer,
            { borderRadius: 10, padding: 10, marginTop: 10, backgroundColor: "#fff" }]}>
              <TouchableOpacity
                style={[
                  styles.timeSlot,
                  selectedQuantity === "0.5 Liters" && styles.selectedSlot,
                ]}
                onPress={() => setSelectedQuantity("0.5 Liters")}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedQuantity === "0.5 Liters" && styles.selectedSlotText,
                  ]}
                >
                  0.5 Liters
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.timeSlot,
                  selectedQuantity === "1 Liter" && styles.selectedSlot,
                ]}
                onPress={() => setSelectedQuantity("1 Liter")}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedQuantity === "1 Liter" && styles.selectedSlotText,
                  ]}
                >
                  1 Liter
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.timeSlot,
                  selectedQuantity === "2 Liters" && styles.selectedSlot,
                ]}
                onPress={() => setSelectedQuantity("2 Liters")}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedQuantity === "2 Liters" && styles.selectedSlotText,
                  ]}
                >
                  2 Liters
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={{ fontWeight: "600", fontSize: 18, marginTop: 10, padding: 10 }}>
            Available Time Slots
          </Text>

          <View style={styles.morningSectionCard}>
            <View style={styles.timeSlotsContainer}>
              {filteredMilkMan.timings.map((time, index) => (

                <TouchableOpacity

                  key={index}
                  style={[
                    styles.timeSlot,
                    selectedSlot === time && styles.selectedSlot,
                  ]}
                  onPress={() => selectSlot(time)}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      selectedSlot === time && styles.selectedSlotText,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>

              ))}
            </View>
          </View>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalColumn}>
                <Text style={styles.modalText}>Review</Text>
              </View>
              <View style={styles.modalRow}>
                <Avatar.Image
                  source={{ uri: `https://livinsync.onrender.com${filteredMilkMan.pictures}` }}
                  style={[styles.avatarContainer, { marginRight: 10 }]}
                />
                <View style={{ flexDirection: "column" }}>
                  <Text style={styles.Name}>{filteredMilkMan.name}</Text>
                  <Text style={styles.modalText1}>{filteredMilkMan.phoneNumber}</Text>
                  <Text style={styles.modalText3}>{filteredMilkMan.address}</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", marginTop: 10, alignItems: "center" }}>
                <Text style={[styles.Slot, { paddingRight: 20, textDecorationLine: "none" }]}>Selected Timings :</Text>
                <Text style={styles.modalSlot}>{selectedSlot}</Text>
              </View>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.continueButton]}
                  onPress={handleContinuePress}
                >
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView >
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: "#fcf6f0",
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  content: {
    flex: 1,
    marginLeft: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7d0431"
  },
  cardSubText1: {
    fontSize: 13,
    marginTop: 4,
    color: "#7C7C7C",
    fontWeight: "400",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: {
    marginRight: 4,
  },
  reviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  starIcon: {
    marginRight: 2,
  },
  newCard: {
    backgroundColor: "white",
    marginTop: 10,
    borderRadius: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  newCardItem: {
    alignItems: "center",
    padding: 12
  },
  newCardImage: {
    width: 40,
    height: 40,
  },
  newCardNumber: {
    fontSize: 14,
    marginTop: 8,
    backgroundColor: "#DDDEE0",
    padding: 4,
    borderRadius: 10,
    width: 50,
    textAlign: "center",
    color: "#7d0431",
    fontWeight: "600",
  },
  newCardText: {
    fontSize: 12,
    marginTop: 4,
  },
  newCardSubText: {
    fontSize: 12,
  },
  MilkCard: {

  },
  SectionTitle: {
    fontSize: 18,
    fontWeight: "600"
  },
  morningSectionCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },

  morningSectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#444444",
  },

  timeSlotsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeSlot: {
    backgroundColor: "#D8D9E0",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    marginRight: 10,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: "400",
  },
  horizontalScrollView: {
    paddingHorizontal: 16,
  },
  reviewCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowRadius: 5,
    elevation: 2,
    width: "95%",
    marginTop: 1,
  }, avatarContainer: {
    borderWidth: 1,
    backgroundColor: "#dddee0",
    borderColor: "white",
  },
  reviewSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  imageSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 16,
  },
  reviewImage: {
    width: 20,
    height: 20,
  },
  reviewText: {
    fontSize: 12,
    marginTop: 4,
  },
  newCardNumber1: {
    fontSize: 14,
    backgroundColor: "#7d0431",
    borderRadius: 10,
    width: 60,
    height: 30,
    padding: 5,
    marginTop: 10,
    textAlign: "center",
    color: "#fff",
    fontWeight: "900",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",

    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",

    padding: 20,
    width: "100%",
    paddingHorizontal: 30,
    borderTopRightRadius: 60,
    borderTopLeftRadius: 60,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  modalImage: {
    width: 60,
    height: 60,
    borderRadius: 20,
    marginRight: 10,
  },
  modalText: {
    fontSize: 20,
    fontWeight: "600",
    marginRight: 10,
  },
  modalText2: {
    fontSize: 18,
    fontWeight: "500",
    marginRight: 10,
    color: "#515151",
  },
  modalText3: {
    fontSize: 16,
    fontWeight: "400",
    marginRight: 10,
    color: "#797979",
  },
  modalText1: {
    fontSize: 16,
    color: "#515151",
  },
  modalSlot: {
    backgroundColor: "#D8D9E0",
    borderRadius: 7,
    paddingVertical: 5,
    paddingHorizontal: 15,
    alignItems: "center",
    marginTop: 10,
    fontWeight: "800",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#7d0431",
  },
  continueButton: {
    backgroundColor: "#7d0431",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  modalColumn: {
    alignItems: "center",
  },
  Name: {
    fontSize: 18,
    fontWeight: "500",
  },
  Slot: {
    textDecorationLine: "underline",
    fontSize: 18,
    fontWeight: "500",
  },
  modalRow1: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "space-between",
  },
  secondModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  secondModalContent: {
    backgroundColor: "#E0D8FF",
    padding: 20,
    width: "100%",
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
  },
  secondModalHeading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    paddingVertical: 10, // Add padding
    marginLeft: "30%",
  },
  secondModalButtonContainer: {
    alignItems: "center",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7d0431",
    padding: 10,
    borderRadius: 5,
  },
  shareButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
  code: {
    backgroundColor: "white",
    padding: 10,
    width: 80,
    marginLeft: "35%",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  selectedSlot: {
    backgroundColor: "#7d0431",
  },
  selectedSlotText: {
    color: "white",
  },
});

export default MilkManProfile;
