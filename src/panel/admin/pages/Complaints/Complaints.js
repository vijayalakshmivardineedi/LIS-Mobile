import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import {
  fetchComplaints,
  deleteComplaintAsync,
  updateComplaintStatusResolution,
} from "./ComplaintSlice";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { MaterialIcons } from "@expo/vector-icons";
import Snackbar from "react-native-paper/src/components/Snackbar"; // Import Snackbar
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

const PersonalComplaints = ({ complaints, handleEdit, handleDelete }) => (
  <FlatList
    data={complaints}
    renderItem={({ item }) => (
      <ComplaintItem
        item={item}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    )}
    keyExtractor={(item) => item.complaintId.toString()}
  />
);

const SocietyComplaints = ({ complaints, handleEdit, handleDelete }) => (
  <FlatList
    data={complaints}
    renderItem={({ item }) => (
      <ComplaintItem
        item={item}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    )}
    keyExtractor={(item) => item.complaintId.toString()}
  />
);
const ComplaintItem = ({ item, handleEdit, handleDelete }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const handleMenuToggle = () => {
    setMenuVisible(!menuVisible);
  };
  const handleOutsidePress = () => {
    if (menuVisible) {
      setMenuVisible(false);
    }
  };

  const handleDeleteConfirmation = (complaintId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this complaint?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => handleDelete(complaintId) },
      ]
    );
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.header}>
        <Text style={styles.titleText}>{item.complaintCategory}</Text>
        <TouchableOpacity onPress={handleMenuToggle}>
          <MaterialIcons name="more-vert" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>ID</Text>
          <Text style={styles.value}>: {item.complaintId}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Title</Text>
          <Text style={styles.value}>: {item.complaintTitle}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>By</Text>
          <Text style={styles.value}>: {item.complaintBy}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>
            : {new Date(item.dateAndTime).toLocaleString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>: {item.resolution}</Text>
        </View>
      </View>
      {menuVisible && (
        <View style={styles.menuContainer}>
          <TouchableWithoutFeedback onPress={handleOutsidePress}>
            <View style={styles.menu}>
              {item.resolution !== "Resolved" ? (
                <TouchableOpacity
                  onPress={() => {
                    handleEdit(item);
                    setMenuVisible(false);
                  }}
                  style={styles.menuButton}
                >
                  <Text style={styles.menuText}>Edit</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                onPress={() => {
                  handleDeleteConfirmation(item.complaintId);
                  setMenuVisible(false);
                }}
                style={styles.menuButton}
              >
                <Text style={styles.menuText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}
    </View>
  );
};

const Complaints = () => {
  const dispatch = useDispatch();
  const ImmutableComplaints = useSelector(
    (state) => state.adminComplaints.complaints || []
  );
  const error = useSelector((state) => state.adminComplaints.error);
  const status = useSelector((state) => state.adminComplaints.status);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false); // Snackbar visibility state
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message
  const navigate = useNavigation();
  const complaints = [...ImmutableComplaints].reverse();
  useEffect(() => {
    dispatch(fetchComplaints());
  }, [dispatch]);

  const handleEdit = (complaint) => {
    setSelectedComplaint(complaint);
    setModalVisible(true);
  };

  const handleDelete = (complaintId) => {
    dispatch(deleteComplaintAsync({ complaintId }))
      .then((result) => {
        if (result.meta.requestStatus === "fulfilled") {
          setSnackbarMessage("Complaint deleted successfully.");
          setSnackbarVisible(true);
          dispatch(fetchComplaints());
        } else {
          setSnackbarMessage(
            "Failed to delete the complaint. Please try again."
          );
          setSnackbarVisible(true);
        }
      })
      .catch(() => {
        setSnackbarMessage(
          "An error occurred. Please check your network and try again."
        );
        setSnackbarVisible(true);
      });
  };

  const handleStatusChange = () => {
    const resolution = "Resolved";
    if (selectedComplaint) {
      dispatch(
        updateComplaintStatusResolution({
          complaintId: selectedComplaint._id,
          resolution,
        })
      )
        .then((result) => {
          if (result.meta.requestStatus === "fulfilled") {
            setSnackbarMessage("Successfully Updated");
            setSnackbarVisible(true);
            setModalVisible(false);
            dispatch(fetchComplaints());
          } else {
            setSnackbarMessage(error);
            setSnackbarVisible(true);
          }
        })
        .catch(() => {
          setSnackbarMessage(
            "An error occurred. Please check your network and try again."
          );
          setSnackbarVisible(true);
        });
    }
  };

  const personalComplaints = complaints?.filter(
    (complaint) => complaint.complaintType === "Personal"
  );
  const societyComplaints = complaints?.filter(
    (complaint) => complaint.complaintType === "Society"
  );
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "personal", title: "Personal" },
    { key: "society", title: "Society" },
  ]);

  const renderScene = SceneMap({
    personal: () => (
      <PersonalComplaints
        complaints={personalComplaints}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    ),
    society: () => (
      <SocietyComplaints
        complaints={societyComplaints}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    ),
  });

  if (status === "loading") {
    // Show spinner while loading
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7d0431" />
      </View>
    );
  }
  if (!complaints || complaints.length === 0 || status === "error") {
    // Show spinner while loading
    return (
      <View style={styles.noDataContainer}>
        <Image
          source={require("../../../../assets/Admin/Imgaes/nodatadound.png")}
          style={styles.noDataImage}
          resizeMode="contain"
        />
        <Text style={styles.noDataText}>No Amenities Found</Text>
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: 400 }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={{ backgroundColor: "transparent" }}
            indicatorStyle={{ backgroundColor: "#7d0431" }}
            labelStyle={{ color: "#222222", fontWeight: "500" }}
          />
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigate.navigate("Add Complaints")}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Update Status of Complaint</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={handleStatusChange}
              style={[styles.closeButton, { marginRight: 30 }]}
            >
              <Text style={styles.buttonText}>Resolve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#fff",
  },
  itemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  itemText: {
    fontSize: 16,
    marginVertical: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  viewButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
  },
  modalView: {
    margin: 20,
    backgroundColor: "#edebeb",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    left: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: "absolute",
    top: 250,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  cardContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 5,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7D0431",
  },
  menuContainer: {
    position: "absolute",
    top: 45,
    right: 30,
    borderRadius: 8,

  },
  menu: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5
  },
  menuButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuText: {
    fontSize: 16,
  },
  detailsContainer: {
    marginTop: 10,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 5,
  },
  label: {
    fontWeight: "600",
    color: "#222222",
    width: "30%",
  },
  value: {
    color: "#222222",
    width: "70%",
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#7d0431",
    padding: 10,
    borderRadius: 5,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#630000",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  spinner: {
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1, // Use full height and width of the parent
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 18,
    color: "#7d0431",
    textAlign: "center",
  },
});

export default Complaints;
