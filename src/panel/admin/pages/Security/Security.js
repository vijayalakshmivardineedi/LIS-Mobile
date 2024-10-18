import React, { useEffect, useState } from "react";
import { TouchableWithoutFeedback, Keyboard } from "react-native";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Button,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchGatekeepers, deleteGatekeepers } from "./GateKeeperSlice";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { ImagebaseURL } from "../../../Security/helpers/axios";
import { useCallback } from "react";
import Toast from "react-native-toast-message";
import Modal from "react-native-modal";
import Icon from "react-native-vector-icons/MaterialIcons";

const Security = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionMenuVisible, setActionMenuVisible] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const sequrity = useSelector((state) => state.gateKeepers.sequrity || []);

  const status = useSelector((state) => state.gateKeepers.status);
  const error = useSelector((state) => state.gateKeepers.error);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchGatekeepers());
    }, [dispatch])
  );

  const handleView = (user) => {
    navigation.navigate("View Security", { sequrityId: user.sequrityId });
    setActionMenuVisible(null);
  };

  const handleEdit = (user) => {
    navigation.navigate("Edit Security", { sequrityId: user.sequrityId });
    setActionMenuVisible(null);
  };

  const handleAttendance = (user) => {
    navigation.navigate("Attendance", { sequrityId: user.sequrityId });
    setActionMenuVisible(null);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
    setActionMenuVisible(null);
  };

  const confirmDelete = () => {
    dispatch(deleteGatekeepers({ id: selectedUser._id }))
      .then(() => {
        Toast.show({
          text1: "Deleted",
          text2: "Security guard deleted successfully!",
          type: "success",
        });
        setTimeout(() => {
          dispatch(fetchGatekeepers());
        }, 2000);
      })
      .catch((error) => {
        console.error("Error:", error);
        Toast.show({
          text1: "Error",
          text2: "Failed to delete security guard.",
          type: "error",
        });
      });
    setModalVisible(false);
  };

  if (status === "loading") {
    return (
      <ActivityIndicator size="large" color="#630000" style={styles.loader} />
    );
  }

  if (error || status === 'failed' || sequrity?.length === 0) { // Show spinner while loading
    return (
      <View style={styles.noDataContainer}>
        <Image
          source={require('../../../../assets/Admin/Imgaes/nodatadound.png')}
          style={styles.noDataImage}
          resizeMode="contain"
        />
        <Text style={styles.noDataText}>No Security Found</Text>
      </View>
    );
  }


  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleView(item)}>
      <View style={styles.row}>
        <Image
          source={{ uri: `${ImagebaseURL}${item.pictures}` }}
          style={styles.image}
        />
        <View style={styles.details}>
          <Text style={styles.detailLabel}>Security ID</Text>
          <Text style={styles.detailValue}>:{item.sequrityId}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.detailLabel}>Name</Text>
          <Text style={styles.detailValue}>:{item.name}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>:{item.email}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.detailLabel}>Mobile</Text>
          <Text style={styles.detailValue}>:{item.phoneNumber}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.detailLabel}>Aadhar</Text>
          <Text style={styles.detailValue}>:{item.aadharNumber}</Text>
        </View>

        {/* Three dots button */}
        <TouchableOpacity
          onPress={() =>
            setActionMenuVisible(
              actionMenuVisible === item._id ? null : item._id
            )
          }
          style={styles.dotsButton}
        >
          <Icon name="more-vert" size={24} color="#7D0431" />
        </TouchableOpacity>

        {/* Action Menu */}
        {actionMenuVisible === item._id && (
          <View style={styles.actionMenu}>
            <TouchableOpacity
              onPress={() => handleAttendance(item)}
              style={styles.menuButton}
            >
              <Text style={styles.buttonText}>Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleEdit(item)}
              style={styles.menuButton}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={styles.menuButton}
            >
              <Text style={[styles.buttonText, { color: "#7D0431" }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={
          Array.isArray(sequrity)
            ? sequrity.filter(
              (user) =>
                user.name.toLowerCase().includes(searchText.toLowerCase()) ||
                user.email.toLowerCase().includes(searchText.toLowerCase())
            )
            : []
        }
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          setActionMenuVisible(null);
          navigation.navigate("Add Security");
        }}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modal for delete confirmation remains unchanged */}
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>
          <Text style={styles.modalMainText}>Delete Confirmation</Text>
          <Text style={styles.modalText}>
            Are you sure you want to delete {selectedUser?.name}?
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              <Text style={styles.modelbuttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={confirmDelete}
              style={styles.modalButton}
            >
              <Text style={styles.modelbuttonText}>Yes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  mainrow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  row: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    flexDirection: "column",
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  detailLabel: {
    fontWeight: "500",
    flex: 1,
    fontSize: 16,
  },
  detailValue: {
    flex: 2,
    fontSize: 16,
    color: "#333",
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 50,
    marginBottom: 10,
    backgroundColor: "#ccc",
  },
  dotsButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
  },
  dotsText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7D0431",
  },
  actionMenu: {
    position: "absolute",
    top: 50,
    right: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    elevation: 3,
  },
  menuButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  buttonText: {
    fontSize: 14,
  },
  modelbuttonText: {
    fontSize: 16,
    color: "white",
  },
  addButton: {
    width: 50,
    backgroundColor: "#7D0431",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalMainText: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    color: "#7D0431",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#7D0431",
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
    color: "White",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#7D0431",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6, // Add shadow on Android
    shadowColor: "#000", // Add shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataImage: {
    width: 150,
    height: 150,
    marginBottom: 0,
  },
  noDataText: {
    fontSize: 18,
    color: '#7d0431',
    textAlign: 'center',
  },
});

export default Security;
