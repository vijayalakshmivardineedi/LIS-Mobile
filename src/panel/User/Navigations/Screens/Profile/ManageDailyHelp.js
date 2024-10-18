
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, FlatList, TextInput, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUserService, fetchServicePerson, updateRatingAndReview } from '../../../Redux/Slice/ProfileSlice/manageServiceSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Rating } from 'react-native-ratings';
import { Avatar } from "react-native-paper";
import { ImagebaseURL } from '../../../../Security/helpers/axios';
const ManageDailyHelp = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(null);
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const dispatch = useDispatch();
  const { loading, error, servicePerson } = useSelector((state) => state.manageServices);
  const { services } = servicePerson || {};
  const serviceType = [
    { id: 'maid', type: 'Maid' },
    { id: 'milkMan', type: 'Milkman' },
    { id: 'cook', type: 'Cook' },
    { id: 'paperBoy', type: 'Paperboy' },
    { id: 'driver', type: 'Driver' },
    { id: 'water', type: 'Water' },
    { id: 'plumber', type: 'Plumber' },
    { id: 'carpenter', type: 'Carpenter' },
    { id: 'electrician', type: 'Electrician' },
    { id: 'painter', type: 'Painter' },
    { id: 'moving', type: 'Moving' },
    { id: 'mechanic', type: 'Mechanic' },
    { id: 'appliance', type: 'Appliance' },
    { id: 'pestClean', type: 'Pest Clean' }
  ];

  const [block, setBlock] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [societyId, setSocietyId] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [userId, setUserId] = useState("");
  const [rating, setRating] = useState("");

  useEffect(() => {
    const getUserName = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString !== null) {
          const user = JSON.parse(userString);
          setBlock(user.buildingName);
          setSocietyId(user.societyId);
          setFlatNumber(Number(user.flatNumber));
          setUserId(user.userId);
        }
      } catch (error) {
        console.error("Failed to fetch the user from async storage", error);
      }
    };
    getUserName();
  }, []);

  useEffect(() => {
    if (societyId && block && flatNumber) {
      dispatch(fetchServicePerson({ societyId, block, flatNumber }));
    }
  }, [dispatch, societyId, block, flatNumber]);

  const handleDelete = (service, type) => {
    setSelectedService(service);
    setSelectedServiceType(type);
    setShowModal(true);
  };

  ;

  const submitFeedback = async () => {
    if (selectedService && selectedServiceType) {
      try {
        const flatNumberAsNumber = Number(flatNumber);
        const result = await dispatch(
          updateRatingAndReview({
            societyId,
            serviceType: selectedServiceType,
            userid: selectedService.item.userid,
            updates: {
              userId,
              Block: block,
              flatNumber: flatNumberAsNumber,
              rating,
              reviews: reviewText,
            },
          })
        );

        if (result.type === 'service/updateRatingAndReview/fulfilled') {
          setShowFeedbackModal(false);
          setRating('');
          setReviewText('');
        } else {
          console.error('Failed to update rating and review. Please try again.');
        }
      } catch (error) {
        console.error('Error updating rating and review:', error);
      }
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (selectedService && selectedServiceType) {
        const result = await dispatch(
          deleteUserService({
            societyId,
            serviceType: selectedServiceType,
            userid: selectedService.item.userid,
            userIdToDelete: userId,
          })
        );

        if (result.type === "manageServices/deleteUserService/fulfilled") {
          setShowModal(false);
          dispatch(fetchServicePerson({ societyId, block, flatNumber }));
        } else {
          console.error("Failed to delete service. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
  };
  const renderServiceItem = ({ item, type }) => {
    const blockValue = block;
    const flatNumberValue = Number(flatNumber);
    const matchedList = item.item.list.find(
      (entry) => entry.Block === blockValue && Number(entry.flatNumber) === flatNumberValue
    );

    let timings = 'N/A';
    if (matchedList) {
      if (Array.isArray(matchedList.timings)) {
        timings = matchedList.timings.join(', ');
      } else if (typeof matchedList.timings === 'string') {
        timings = matchedList.timings;
      }

      if (typeof timings === 'string') {
        timings = timings.replace(/[\[\]"]/g, '');
      }
    }

    return (
      <View style={styles.row}>
        <Avatar.Image
          source={{ uri: `${ImagebaseURL}${item.pictures}` || 'https://img.freepik.com/premium-photo/male-female-profile-avatar-user-avatars-gender-icons_1020867-74940.jpg' }}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{item.item.name || 'Name'}</Text>
          <Text style={styles.occupation}>Phone: {item.item.phoneNumber || 'N/A'}</Text>
          <Text style={styles.occupation}>Address: {item.item.address || 'N/A'}</Text>
          <Text style={styles.timing}>Timing: {timings || 'N/A'}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.deleteIcon} onPress={() => handleDelete(item, type)}>
            <Icon name="trash" size={20} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  if (loading) {
    return <ActivityIndicator size="large" color="#630000" style={styles.loadingContainer} />;
  }

  if (!servicePerson || servicePerson.length === 0) { // Show spinner while loading
    return (
      <View style={styles.noDataContainer}>
        <Image
          source={require('../../../../../assets/Admin/Imgaes/nodatadound.png')}
          style={styles.noDataImage}
          resizeMode="contain"
        />
        <Text style={styles.noDataText}>No DailyHelp Found</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.noDataContainer}>
        <Image
          source={require('../../../../../assets/Admin/Imgaes/nodatadound.png')}
          style={styles.noDataImage}
          resizeMode="contain"
        />
        <Text style={styles.noDataText}>No DailyHelp Found</Text>
      </View>)
  }
  return (
    <View>
      {error && <Text style={styles.error}>{error}</Text>}
      {!loading && !error && services && serviceType.map((typeObj) => {
        const { id, type } = typeObj;
        const serviceList = services[id] || [];
        return (
          serviceList.length > 0 && (
            <View style={styles.card} key={id}>
              <Text style={styles.header}>{type}</Text>
              <FlatList
                data={serviceList}
                renderItem={(item) => renderServiceItem({ item, type })}
                keyExtractor={(item) => item._id}
              />
            </View>
          )
        );
      })}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to delete this?</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleConfirmDelete}>
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleCancelDelete}>
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showFeedbackModal}
        onRequestClose={() => setShowFeedbackModal(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Rate and Review</Text>
            <Rating
              ratingCount={5}
              imageSize={30}
              onFinishRating={(rating) => setRating(rating)}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Write your review here..."
              multiline
              value={reviewText}
              onChangeText={(text) => setReviewText(text)}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={submitFeedback}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => setShowFeedbackModal(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
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
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  occupation: {
    fontSize: 14,
    color: '#666',
  },
  timing: {
    fontSize: 14,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    marginRight: 10,
  },
  feedbackText: {
    color: '#fff',
    fontSize: 12,
  },
  deleteIcon: {
    padding: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  error: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginVertical: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 4,
    height: 100,
    marginBottom: 10,
    textAlignVertical: 'top',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
},
});

export default ManageDailyHelp;
