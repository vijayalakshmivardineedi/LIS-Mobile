import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet, ScrollView,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { deleteAmenityBooking, getAmenityOfCommunityHal } from './BookingSlice';
import { Ionicons } from "@expo/vector-icons";
import { ImagebaseURL } from '../../../Security/helpers/axios';
import { ActivityIndicator, Modal } from 'react-native-paper';

const AmenityBookingsList = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const status = useSelector((state) => state.adminBooking.status);
  const Allbooking = useSelector((state) => state.adminBooking.booking);
  const booking = Allbooking && Allbooking.list ? Allbooking.list : [];
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [anchor, setAnchor] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(getAmenityOfCommunityHal());
      setAnchor(false)
    }, [dispatch])
  );
  const confirmDelete = (item) => {
    const userId = item?.userId
    dispatch(deleteAmenityBooking(userId))
      .then((response) => {
        console.log(response.type, "respo")
        if (response.type === "booking/deleteAmenityBooking/fulfilled") {
          dispatch(getAmenityOfCommunityHal());
          Alert.alert("Success", "deleted")
        } else {
          dispatch(getAmenityOfCommunityHal());
          Alert.alert("error", "failed")
        }
      })
      .catch((error) => {
        Alert.alert("Error", "An error occurred while updating the booking.");
      });
  };

 

  const handleMenuPress = (item) => {
    ;
    setAnchor(anchor ? null : item._id);
  };
  const renderBookingCard = (item) => (
    <View style={styles.bookingCard}>
      <Text style={styles.bookingId}>{item._id}</Text>
      <Text>{new Date(item.dateOfBooking).toLocaleString()}</Text>
      <Text>{item.payed}</Text>
      <Text>{item.pending}</Text>
      <Text>{item.status}</Text>

      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => handleMenuPress(item)}
      >
        <Ionicons name="ellipsis-vertical" size={24} color="#666562" />
      </TouchableOpacity>
      {anchor === item._id && (
        <ScrollView style={[styles.menuList, { top: 0 }]}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Edit Booking", ({ id: item._id, userId: item.userId }))}>
            <Text>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.menuItem}>
            <Text>Delete</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );

  if (status === "loading") { 
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7d0431" />
      </View>
    );
  }
  if (!booking || !Allbooking && Allbooking?.list.length === 0) { 
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

  const BookingData = [...booking].reverse();
  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={() => (
          <View style={styles.amenityCard}>
            <Image
              source={{ uri: `${ImagebaseURL}${Allbooking?.image}` || "" }}
              style={styles.amenityImage}
            />
            <Text style={styles.amenityName}>{Allbooking?.amenityName}</Text>
            <Text style={styles.capacityText}>
              <Text style={styles.boldText}>Capacity:</Text> {Allbooking?.capacity}
            </Text>
            <Text style={styles.chargeText}>
              <Text style={styles.boldText}>Total Charge:</Text> {Allbooking?.cost}
            </Text>
          </View>
        )}
        data={BookingData}
        renderItem={({ item }) => renderBookingCard(item)}
        keyExtractor={item => item._id}
        ListEmptyComponent={<Text>No bookings found</Text>}
      />
      <Modal
        transparent={true}
        animationType="slide"
        visible={deleteDialogVisible}
        onRequestClose={() => setDeleteDialogVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to delete this booking?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setDeleteDialogVisible(false)} style={styles.cancelButton}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete} style={styles.confirmButton}>
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  addButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1, 
  },
  amenityCard: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  amenityImage: {
    width: '100%',
    height: 150,
    borderRadius: 5,
    marginBottom: 10,
  },
  amenityName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bookingCard: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#fff',
    elevation: 1, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bookingId: {
    fontWeight: 'bold',
  },
  menuButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  menu: {
    position: 'absolute',
    top: 10,
    left: -120, 
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    zIndex: 1,
  },
  actionText: {
    fontSize: 18,
    marginVertical: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  capacityText: {
    marginTop: 5,
  },
  chargeText: {
    marginTop: 5,
  },
  boldText: {
    fontWeight: 'bold',
  },
  addBookingButton: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: "#7d0431",
    justifyContent: "flex-end",
    alignItems: "center",
    alignSelf: "flex-end",
    marginBottom: 16,
    borderRadius: 8,
    paddingVertical: 2
  }, menuItem: {
    padding: 10,
  },
  menuList: {
    position: 'absolute',
    right: 35,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 3,
    padding: 5,
    zIndex: 10,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f6f6f6",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataImage: {
    width: 300,
    height: 300,
    marginTop: 100,
    alignItems: "center",
  },
  noDataText: {
    fontSize: 16,
    color: '#7D0431',
    fontWeight: '700',
  },
  scrollViewContainer: {
    paddingBottom: 40,
  },
});
export default AmenityBookingsList;
