import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchComplaints,
  updateComplaintResolution,
} from "../../Redux/Slice/GetHelpSlice/ComplaintsSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from '@expo/vector-icons/Ionicons';
import { FAB } from "react-native-paper";
import { Image } from "react-native";
const GetHelp = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { loading, complaints, error } = useSelector((state) => state.complaints);
  const [societyId, setSocietyId] = useState("");
  const [userId, setUserId] = useState("");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [showCateDropdown, setShowCateDropdown] = useState(false);
  const [selectedCate, setSelectedCate] = useState(null);
  const [showStatuDropdown, setShowStatuDropdown] = useState(false);
  const [selectedStatu, setSelectedStatu] = useState(null);

  const Types = ["All", "Society", "Personal"];
  const Cates = [
    "All",
    "Electrical",
    "Plumbing",
    "Lift",
    "Common Area",
    "Payment",
    "Car Parking",
    "Water",
    "Others",
  ];
  const Status = ["All", "Resolved", "Pending"];

  useEffect(() => {
    const getUserName = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString !== null) {
          const user = JSON.parse(userString);
          setSocietyId(user.societyId);
          setUserId(user.userId);
        }
      } catch (error) {
        console.error("Failed to fetch the user from async storage", error);
      }
    };
    getUserName();
  }, []);

  useEffect(() => {
    if (societyId) {
      dispatch(fetchComplaints(societyId));
    }
  }, [dispatch, societyId]);

  const selectType = (Type) => {
    setSelectedType(Type);
    setShowTypeDropdown(false);
  };
  const selectCate = (Cate) => {
    setSelectedCate(Cate);
    setShowCateDropdown(false);
  };
  const selectStatu = (Statu) => {
    setSelectedStatu(Statu);
    setShowStatuDropdown(false);
  };

  const toggleDropdown = (dropdown) => {
    if (dropdown === "type") {
      setShowTypeDropdown(!showTypeDropdown);
      setShowCateDropdown(false);
      setShowStatuDropdown(false);
    } else if (dropdown === "cate") {
      setShowCateDropdown(!showCateDropdown);
      setShowTypeDropdown(false);
      setShowStatuDropdown(false);
    } else if (dropdown === "statu") {
      setShowStatuDropdown(!showStatuDropdown);
      setShowTypeDropdown(false);
      setShowCateDropdown(false);
    }
  };

  const handlebuttonPress = () => {
    navigation.navigate("Select the Category");
  };

  const filteredTickets = Array.isArray(complaints?.Complaints)
    ? complaints.Complaints.filter((ticket) => {
      const matchesType =
        selectedType && selectedType !== "All"
          ? ticket.complaintType === selectedType
          : true;

      const matchesCategory =
        selectedCate && selectedCate !== "All"
          ? ticket.complaintCategory === selectedCate
          : true;

      const matchesStatus =
        selectedStatu && selectedStatu !== "All"
          ? ticket.resolution === selectedStatu
          : true;

      const matchesUser =
        ticket.complaintType === "Society" ||
        (ticket.complaintType === "Personal" && ticket.userId === userId);

      return matchesType && matchesCategory && matchesStatus && matchesUser;
    })
    : [];

  const markAsResolved = async (complaintId) => {
    try {
      const result = await dispatch(
        updateComplaintResolution({
          societyId,
          complaintId,
          resolution: "Resolved",
        })
      );
      if (result.type === "complaints/updateComplaintResolution/fulfilled") {
        dispatch(fetchComplaints(societyId));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7d0431" />
      </View>
    );
  }
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toISOString().slice(0, 10);
    } catch (error) {
      return "Invalid Date";
    }
  };
  const sortComplaints = (tickets) => {
    return tickets.sort((a, b) => {
      if (a.resolution === "Pending" && b.resolution === "Resolved") {
        return -1;
      }
      if (a.resolution === "Resolved" && b.resolution === "Pending") {
        return 1;
      }

      const dateA = new Date(a.dateAndTime);
      const dateB = new Date(b.dateAndTime);
      return dateB - dateA;  // Most recent first
    });
  };




  if (error) {
    return (
      <View style={styles.noDataContainer}>
        <Image
          source={require('../../../../assets/Admin/Imgaes/nodatadound.png')}
          style={styles.noDataImage}
          resizeMode="contain"
        />
        <Text style={styles.noDataText}>No Tickets Found</Text>
      </View>
    );
  }

  if (!sortedTickets || sortedTickets.length === 0) { // Show spinner while loading
    return (
      <View style={styles.noDataContainer}>
        <Image
          source={require('../../../../assets/Admin/Imgaes/nodatadound.png')}
          style={styles.noDataImage}
          resizeMode="contain"
        />
        <Text style={styles.noDataText}>No Tickets Found</Text>
      </View>
    );
  }
  const sortedTickets = sortComplaints(filteredTickets);
  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => toggleDropdown("type")}
          >
            <Text style={styles.fontWeightBold}>{selectedType || "Type"}</Text>
            <Icon
              name={showTypeDropdown ? "angle-up" : "angle-down"}
              size={20}
              color="#000"
              style={{ marginLeft: 5 }}
            />
          </TouchableOpacity>
          {showTypeDropdown && (
            <View style={styles.dropdownList}>
              {Types.map((Type, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => selectType(Type)}
                  style={styles.dropdownItem}
                >
                  <Text>{Type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => toggleDropdown("cate")}
          >
            <Text style={styles.fontWeightBold}>
              {selectedCate || "Category"}
            </Text>
            <Icon
              name={showCateDropdown ? "angle-up" : "angle-down"}
              size={20}
              color="#000"
              style={{ marginLeft: 5 }}
            />
          </TouchableOpacity>
          {showCateDropdown && (
            <View style={styles.dropdownList}>
              {Cates.map((Cate, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => selectCate(Cate)}
                  style={styles.dropdownItem}
                >
                  <Text>{Cate}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => toggleDropdown("statu")}
          >
            <Text style={styles.fontWeightBold}>
              {selectedStatu || "Status"}
            </Text>
            <Icon
              name={showStatuDropdown ? "angle-up" : "angle-down"}
              size={20}
              color="#000"
              style={{ marginLeft: 5 }}
            />
          </TouchableOpacity>
          {showStatuDropdown && (
            <View style={styles.dropdownList}>
              {Status.map((Statu, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => selectStatu(Statu)}
                  style={styles.dropdownItem}
                >
                  <Text>{Statu}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={sortedTickets} // Use sortedTickets here
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.ticketContainer}>
            <View style={styles.header}>
              <Text style={styles.type}>
                {item.complaintType} - {item.complaintCategory}
              </Text>
              {item.resolution === "Resolved" ? (
                <Ionicons name="checkmark-done-sharp" size={24} color="#16a34a" />
              ) : item.resolution === "Pending" ? (
                <Ionicons name="warning" size={24} color="#facc15" />
              ) : null}
            </View>

            <Text style={styles.date}>{item.complaintTitle}</Text>
            <Text style={styles.date}>{item.description}</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Complaint Date</Text>
              <Text style={styles.value}>: {formatDate(item.dateAndTime)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Complaint By</Text>
              <Text style={styles.value}>: {item.complaintBy}</Text>
            </View>

            {item.resolution === "Pending" && (
              <TouchableOpacity
                style={styles.resolveButton}
                onPress={() => markAsResolved(item._id)}
              >
                <Text style={styles.resolveButtonText}>Resolved</Text>
              </TouchableOpacity>
            )}
            {item.resolution === "Resolved" && (
              <View style={styles.row}>
                <Text style={styles.label}>Resolved Date</Text>
                <Text style={styles.value}>: {formatDate(item.updatedAt)}</Text>
              </View>
            )}
          </View>
        )}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        color="#7d0431"
        backgroundColor="#F3E1D5"
        onPress={handlebuttonPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,

  },
  dropdownContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: "#fff",
    position: "absolute",
    width: "100%",
    zIndex: 1,
  },
  dropdownItem: {
    padding: 10,
  },
  fontWeightBold: {
    fontSize: 12,
    fontWeight: "400",
  },
  ticketContainer: {
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  type: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#484848"
  },
  status: {
    padding: 5,
    borderRadius: 5,
    color: "#fff",
  },
  date: {
    fontSize: 12,
    color: "#777",
  },

  container1: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  issue: {
    marginLeft: 10,
    flex: 1,
  },
  paymentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  text: {
    marginLeft: 10,
    flex: 1,
  },
  ratingButton: {
    backgroundColor: "#800336",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  ratingButtonText: {
    color: "#fff",
  },
  resolveButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  resolveButtonText: {
    color: "#fff",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rating: {
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: "#800336",
    padding: 10,
    borderRadius: 5,
  },
  submitButtonText: {
    color: "#fff",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#800336",
    borderRadius: 50,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  label: {
    fontWeight: '400',
    width: 105,
    color: '#333',
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    color: '#555',
  },
  reqId: {
    marginTop: 5,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 18,
    color: '#7d0431',
    textAlign: 'center',
  },
});

export default GetHelp;