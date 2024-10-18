import React, { useEffect, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Rating } from 'react-native-ratings';
import { Avatar } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { fetchServices } from "../../../Redux/Slice/ServiceSlice/ServiceSlice";
import { addService } from "../../../Redux/Slice/ServiceSlice/AddServiceSlice";
const MaidProfile = ({ route }) => {
  const dispatch = useDispatch();
  const { id, userid } = route.params;
  const { data, } = useSelector((state) => state.services);
  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);
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
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const handleAddPress = () => {
    if (selectedSlot) {
      setModalVisible(true);
    } else {
      Alert.alert("Please select a time slot.");
    }
  };
  const selectSlot = (slot) => {
    setSelectedSlot(slot);
  };

  const handleContinuePress = async () => {
    try {
      const serviceData = {
        societyId: societyId,
        serviceType: "maid",
        userid: userid,
        list: [
          {
            userId: userId,
            Block: blockName,
            flatNumber: flatNumber,
            timings: selectedSlot,
          },
        ],
      };
      const result = await dispatch(addService(serviceData));
      console.log(result)
      if (result.type === "services/addService/fulfilled") {

        console.log("success")
        setModalVisible(false);
        Alert.alert(result.payload.message);
      }
    } catch (error) {
      console.error(error)
    }
  };

  const filteredMaid = data?.maid.find(maid => maid._id === id);

  if (!filteredMaid) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7d0431" />
      </View>
    );
  }
  const filterData = [...filteredMaid?.timings].reverse();
  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View key={filteredMaid.userid} style={styles.container}>
        <View style={styles.card}>
          <Avatar.Image source={{ uri: `https://livinsync.onrender.com${filteredMaid.pictures}` }} size={100} style={styles.avatarContainer} />

          <View style={styles.content}>
            <Text style={styles.cardTitle}>{filteredMaid.name}</Text>
            <View style={styles.locationContainer}>
              <Ionicons
                name="call"
                size={14}
                color="#C59358"
                style={styles.locationIcon}
              />
              <Text style={styles.cardSubText1}>{filteredMaid.phoneNumber}</Text>
            </View>
            <View style={styles.locationContainer}>
              <Ionicons
                name="location"
                size={14}
                color="#C59358"
                style={styles.locationIcon}
              />
              <Text style={styles.cardSubText1}>
                {filteredMaid.address}
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
                  startingValue={filteredMaid.list.rating}
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
        {/* New Card */}
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
              source={require("../../../../../assets/User/images/medal.png")}
              style={styles.newCardImage}
            />
            <Text style={styles.newCardNumber}>4.8</Text>
            <Text style={styles.newCardText}>Exceptional</Text>
            <Text style={styles.newCardSubText}>Service</Text>
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
        <Text style={{ fontWeight: "600", fontSize: 18, padding: 15 }}>
          Available Time Slots
        </Text>
        <View style={styles.morningSectionCard}>
          <View style={styles.timeSlotsContainer}>
            {filterData.map((time, index) => (
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

      </View >
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
                source={{ uri: `https://livinsync.onrender.com${filteredMaid.pictures}` }}
                style={[styles.avatarContainer, { marginRight: 10 }]}
              />
              <View style={{ flexDirection: "column" }}>
                <Text style={styles.Name}>{filteredMaid.name}</Text>
                <Text style={styles.modalText1}>{filteredMaid.phoneNumber}</Text>
                <Text style={styles.modalText3}>{filteredMaid.address}</Text>
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
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fcf6f0",
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 10,
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
    marginLeft: 16,
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
    marginTop: 20,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    justifyContent: "space-between",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  newCardItem: {
    alignItems: "center",
    marginBottom: 20,
  },
  newCardImage: {
    width: 40,
    height: 40,
    marginTop: 20,
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
  morningSectionCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },

  timeSlotsContainer: {
    flexDirection: "row",
    justifyContent: "space-even",
  },
  timeSlot: {
    backgroundColor: "#D8D9E0",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
    marginRight: 10,
    width: 105
  },
  timeSlotText: {
    fontSize: 10,
    fontWeight: "500",
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
    alignSelf: "flex-start",
    marginTop: 5,
    width: 130,
    fontWeight: "500",
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
    fontSize: 18,
    fontWeight: "500",
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
  }, avatarContainer: {
    borderWidth: 1,
    backgroundColor: "#dddee0",
    borderColor: "white",
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MaidProfile;
