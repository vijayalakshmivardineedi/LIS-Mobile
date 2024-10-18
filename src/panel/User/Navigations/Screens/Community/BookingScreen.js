import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/FontAwesome";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { bookAmenity } from "../../../Redux/Slice/CommunitySlice/Amenities";

export default function App() {
  const [date, setDate] = useState(new Date());
  const route = useRoute();
  const { navigateData } = route.params;
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState("date");
  const [arrivalTime, setArrivalTime] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [numGuests, setNumGuests] = useState("");
  const [eventName, setEventName] = useState("");
  const [category, setCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const navigation = useNavigation();
  const [showPopup, setShowPopup] = useState(false);
  const [showOptions, setShowOptions] = useState({
    arrivalTime: false,
    departureTime: false,
    category: false,
    paymentMethod: false,
  });
  const dispatch = useDispatch();

  useEffect(() => {
    const currentDate = new Date();
    setSelectedDate(currentDate.toLocaleDateString());
  }, []);

  const communityHall = navigateData.find(
    (eachAme) => eachAme.amenityName === "Community Hall"
  );

  const onChange = (event, selectedDateValue) => {
    if (event.type === "set") { // Ensure the user didn't cancel the picker
      const currentDate = selectedDateValue || date;
      setShow(Platform.OS === "ios");
      setDate(currentDate);
      setSelectedDate(currentDate.toLocaleDateString());
    } else {
      setShow(false);
    }
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const handleConfirm = () => {
    if (
      !eventName ||
      !category ||
      !selectedDate ||
      !arrivalTime ||
      !departureTime ||
      !numGuests ||
      !paymentMethod
    ) {
      Alert.alert("Missing Fields", "Please fill in all the fields.");
      return;
    }

    const BookingData = {
      amenityId: communityHall._id,
      data: {
        userId: "3Z6S5JTx2",
        dateOfBooking: selectedDate,
        eventName,
        arrivalTime,
        departureTime,
        venue: communityHall.amenityName,
        numberOfGuests: numGuests,
        eventType: category,
        payed: "25000",
        pending: "0",
        paymentDetails: {
          paymentMethod: paymentMethod,
          paymentStatus: paymentMethod === "ONLINE" ? "Completed" : "Pending",
          amount: "25000",
          paymentDate: paymentMethod === "ONLINE" ? selectedDate : "",
        },
      },
    };

    dispatch(bookAmenity(BookingData))
      .unwrap()
      .then((response) => {
        if (response.success === true) {
          Alert.alert(
            "Booking Placed",
            "Your booking has been confirmed within a few minutes!",
            [
              {
                text: "OK",
                onPress: () => {
                  navigation.navigate("Amenities");
                },
              },
            ],
            { cancelable: false }
          );
        }
      })
      .catch((error) => {
        console.error("Error booking amenity:", error);
        Alert.alert("Booking Failed", "There was an error processing your booking.");
      });
  };

  const toggleDropdown = (field) => {
    setShowOptions((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSelect = (field, value) => {
    if (field === "arrivalTime") setArrivalTime(value);
    if (field === "departureTime") setDepartureTime(value);
    if (field === "category") setCategory(value);
    if (field === "paymentMethod") setPaymentMethod(value);
    toggleDropdown(field);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View>
          {/* Event Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Event Name</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.input}
                placeholder="Event Name"
                value={eventName}
                onChangeText={setEventName}
                keyboardType="default"
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.inputWithIcon}>
              <TouchableOpacity
                onPress={() => toggleDropdown("category")}
                style={{ flex: 1 }}
              >
                <Text
                  style={[
                    styles.input,
                    category ? styles.selectedText : styles.placeholderText,
                  ]}
                >
                  {category || "Select Category"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleDropdown("category")}
                style={styles.iconContainer}
              >
                <AntDesign
                  name="caretdown"
                  size={12}
                  color="#777"
                  style={styles.iconInside}
                />
              </TouchableOpacity>
            </View>
            {showOptions.category && (
              <View style={styles.dropdown}>
                <ScrollView>
                  {["Business", "Casual", "Formal"].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => handleSelect("category", cat)}
                      style={styles.dropdownItem}
                    >
                      <Text>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Date Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date</Text>
            <View style={styles.inputWithIcon}>
              <TouchableOpacity onPress={showDatepicker} style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.input,
                    selectedDate ? styles.selectedText : styles.placeholderText,
                  ]}
                >
                  {selectedDate || "Select Date"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={showDatepicker} style={styles.iconContainer}>
                <Icon
                  name="calendar"
                  size={20}
                  color="#c59358"
                  style={styles.iconInside}
                />
              </TouchableOpacity>
            </View>
            {show && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={mode}
                is24Hour={false}
                display="default"
                onChange={onChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          {/* Arrival and Departure Time */}
          <View style={styles.rowContainer}>
            {/* Arrival Time */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Arrival Time</Text>
              <View style={styles.inputWithIcon}>
                <TouchableOpacity
                  onPress={() => toggleDropdown("arrivalTime")}
                  style={{ flex: 1 }}
                >
                  <Text
                    style={[
                      styles.input,
                      arrivalTime ? styles.selectedText : styles.placeholderText,
                    ]}
                  >
                    {arrivalTime || "Select Arrival Time"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => toggleDropdown("arrivalTime")}
                  style={styles.iconContainer}
                >
                  <AntDesign
                    name="caretdown"
                    size={12}
                    color="#777"
                    style={styles.iconInside}
                  />
                </TouchableOpacity>
              </View>
              {showOptions.arrivalTime && (
                <View style={styles.dropdown}>
                  <ScrollView>
                    {[
                      "1:00 AM",
                      "3:00 AM",
                      "5:00 AM",
                      "7:00 AM",
                      "9:00 AM",
                      "11:00 AM",
                      "1:00 PM",
                      "3:00 PM",
                      "5:00 PM",
                      "7:00 PM",
                      "9:00 PM",
                      "11:00 PM",
                    ].map((time) => (
                      <TouchableOpacity
                        key={time}
                        onPress={() => handleSelect("arrivalTime", time)}
                        style={styles.dropdownItem}
                      >
                        <Text>{time}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Departure Time */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Departure Time</Text>
              <View style={styles.inputWithIcon}>
                <TouchableOpacity
                  onPress={() => toggleDropdown("departureTime")}
                  style={{ flex: 1 }}
                >
                  <Text
                    style={[
                      styles.input,
                      departureTime ? styles.selectedText : styles.placeholderText,
                    ]}
                  >
                    {departureTime || "Select Departure Time"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => toggleDropdown("departureTime")}
                  style={styles.iconContainer}
                >
                  <AntDesign
                    name="caretdown"
                    size={12}
                    color="#777"
                    style={styles.iconInside}
                  />
                </TouchableOpacity>
              </View>
              {showOptions.departureTime && (
                <View style={styles.dropdown}>
                  <ScrollView>
                    {[
                      "1:00 AM",
                      "3:00 AM",
                      "5:00 AM",
                      "7:00 AM",
                      "9:00 AM",
                      "11:00 AM",
                      "1:00 PM",
                      "3:00 PM",
                      "5:00 PM",
                      "7:00 PM",
                      "9:00 PM",
                      "11:00 PM",
                    ].map((time) => (
                      <TouchableOpacity
                        key={time}
                        onPress={() => handleSelect("departureTime", time)}
                        style={styles.dropdownItem}
                      >
                        <Text>{time}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          {/* Number of Guests */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Number of Guests</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={styles.input}
                placeholder="Enter number of guests"
                value={numGuests}
                onChangeText={setNumGuests}
                keyboardType="numeric"
                returnKeyType="done"
              />
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.inputWithIcon}>
              <TouchableOpacity
                onPress={() => toggleDropdown("paymentMethod")}
                style={{ flex: 1 }}
              >
                <Text
                  style={[
                    styles.input,
                    paymentMethod ? styles.selectedText : styles.placeholderText,
                  ]}
                >
                  {paymentMethod || "Select Payment Method"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleDropdown("paymentMethod")}
                style={styles.iconContainer}
              >
                <AntDesign
                  name="caretdown"
                  size={12}
                  color="#777"
                  style={styles.iconInside}
                />
              </TouchableOpacity>
            </View>
            {showOptions.paymentMethod && (
              <View style={styles.dropdown}>
                <ScrollView>
                  {["CASH", "ONLINE"].map((method) => (
                    <TouchableOpacity
                      key={method}
                      onPress={() => handleSelect("paymentMethod", method)}
                      style={styles.dropdownItem}
                    >
                      <Text>{method}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Confirm Button */}
          <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>

        {/* Popup Modal (Optional) */}
        <Modal
          visible={showPopup}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPopup(false)}
        >
          <View style={styles.popupContainer}>
            <View style={styles.popup}>
              <Text>Booking Successful!</Text>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  inputContainer: {
    flex: 1,
    marginRight: 10,
    marginBottom: 20,
    position: "relative",
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 4,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    flex: 1,
  },
  selectedText: {
    color: "#000",
  },
  placeholderText: {
    color: "#777",
  },
  inputWithIcon: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
  },
  dropdown: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: "#fff",
    position: "absolute",
    top: 80, 
    width: "100%",
    zIndex: 1000, 
    maxHeight: 150, 
  },
  dropdownItem: {
    padding: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  confirmButton: {
    backgroundColor: "#192c4c",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  iconContainer: {
    position: "absolute",
    right: 10,
  },
  iconInside: {
    // 
  },
  popupContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  popup: {
    width: 200,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
});
