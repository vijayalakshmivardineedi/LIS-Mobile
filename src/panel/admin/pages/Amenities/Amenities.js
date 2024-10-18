import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useFocusEffect } from "@react-navigation/native"; 
import { deleteAmenity, getAllAmenityBySocietyId } from "./AmenitiesSlice"; 
import { ImagebaseURL } from "../../../Security/helpers/axios";
import { Ionicons } from "@expo/vector-icons"; 
import { Dialog, Portal, Paragraph, Button, FAB, ActivityIndicator, Snackbar } from "react-native-paper"; 
import { Provider as PaperProvider } from "react-native-paper";
const Amenities = () => {
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false); 
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState(null); // Track which menu is open

  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const amenities = useSelector(
    (state) => state.adminAmenities.amenities || []
  );
  const successMessage = useSelector(
    (state) => state.adminAmenities.successMessage
  );
  const status = useSelector(
    (state) => state.adminAmenities.status
  );


  useFocusEffect(
    React.useCallback(() => {
      dispatch(getAllAmenityBySocietyId());
      setSelectedMenuId(null)
    }, [dispatch])
  );

  const handleDeleteConfirm = async () => {
    console.log(selectedAmenity);
     await dispatch(deleteAmenity({ id: selectedAmenity._id }))
      .then((response) => {
        setDeleteDialogVisible(false);
        setSnackMessage(response.payload.message);

        setSnackVisible(true);
        dispatch(getAllAmenityBySocietyId());
      })
      .catch((error) => {
        setSnackMessage(error.message);
        setSnackVisible(true);
      });
  };
  const hideDeleteDialog = () => setDeleteDialogVisible(false); 
  if (status === "loading") { 
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7d0431" />
      </View>
    );
  }
  if (!amenities) {
    return (
      <View style={styles.noDataContainer}>
        <Image
          source={require('../../../../assets/Admin/Imgaes/nodatadound.png')}
          style={styles.noDataImage}
          resizeMode="contain"
        />
        <Text style={styles.noDataText}>No Amenities Found</Text>
      </View>
    );
  }
  const renderItem = ({ item }) => {
    const isMenuOpen = selectedMenuId === item._id;

    return (
      <View style={styles.itemContainer}>
        {/* Details Section: Left aligned content */}
        <Image
          source={{ uri: `${ImagebaseURL}${item.image}` }}
          style={styles.image}
        />
        <View style={styles.detailsContainer}>
          <View style={styles.detailsColumn}>
            <Text style={styles.text}>Name: {item.amenityName}</Text>
            <Text style={styles.text}>Capacity: {item.capacity || "0"}</Text>
            <Text style={styles.text}>Timings: {item.timings}</Text>
            <Text style={styles.text}>Location: {item.location}</Text>
            <Text style={styles.text}>Cost: {item.cost || "0"}</Text>
          </View>

          {/* Menu Icon in Top Right of the Details Section */}
          <TouchableOpacity
            style={styles.menuIcon}
            onPress={() => setSelectedMenuId(isMenuOpen ? null : item._id)}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#666562" />
          </TouchableOpacity>
        </View>


        {/* Menu Actions */}
        {isMenuOpen && (
          <View style={styles.menu}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Edit Amenity", { id: item._id })}
            >
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("Add Booking", { id: item._id })}
            >
              <Text style={styles.actionText}>Booking</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSelectedAmenity(item);
                setDeleteDialogVisible(true);
                setSelectedMenuId(null);
              }}
            >
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
          <Text style={styles.title}>Amenities</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("Bookings")}
          >
            <Ionicons name="calendar" size={30} color="#7d0431" />
          </TouchableOpacity>
        </View>

        {amenities.length === 0 ? (
       
          <View style={styles.noDataContainer}>
            <Image
              source={require('../../../../assets/Admin/Imgaes/nodatadound.png')}
              style={styles.noDataImage}
              resizeMode="contain"
            />
            <Text style={styles.noDataText}>No Amenities Found</Text>
          </View>
        ) : (
          <FlatList
            data={amenities}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
          />
        )}

        {/* Portal is required for Dialog */}
        <Portal>
          {/* Dialog for Delete Confirmation */}
          <Dialog visible={deleteDialogVisible} onDismiss={hideDeleteDialog}>
            <Dialog.Title>Confirm Delete</Dialog.Title>
            <Dialog.Content>
              <Paragraph>
                Are you sure you want to delete this amenity?
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDeleteDialog}>Cancel</Button>
              <Button onPress={handleDeleteConfirm}>Delete</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* Modal for Success Message */}
        <Modal
          visible={showSuccessDialog}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                {successMessage || "Deleted Successfully!"}
              </Text>
            </View>
          </View>
        </Modal>

        <FAB
          style={styles.fab}
          icon="plus"
          color='#fff'
          onPress={() => navigation.navigate('Add Amenity')}
        />
      </View>
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={3000}
      >
        {snackMessage}
      </Snackbar>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 23,
    fontWeight: "700",
    color: "#7d0431",
    marginBottom: 16,
  },
  addButton: {
    width: 100,
    height: 40,
    borderWidth: 2,
    borderColor: "#7d0431",
    alignItems: "center",
    marginBottom: 16,
    borderRadius: 8,
    paddingVertical: 2,
  },
  itemContainer: {
    padding: 0,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 16,
    height: 320,
    overflow: "hidden",
    position: 'relative', 
  },
  image: {
    width: "100%",
    height: "50%",
  },
  detailsContainer: {
    height: "60%",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 10,
  },
  detailsColumn: {
    flex: 1,
    justifyContent: "flex-start",
  },
  text: {
    fontSize: 15,
    marginBottom: 8,
  },
  menuIcon: {
    position: "absolute",
    top: 10, 
    right: 10, 
    padding: 5,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.5)', 
  },
  menu: {
    position: "absolute",
    bottom: 50,
    right: 45,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionText: {
    color: "#7d0431",
    fontWeight: "600",
    marginBottom: 10,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7d0431",
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#7d0431',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f6f6f6",
  },
});

export default Amenities;

