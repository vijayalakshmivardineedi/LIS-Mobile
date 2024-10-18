import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createEvent } from './EventSlice';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';

const AddEvent = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date());
  const [activities, setActivities] = useState([{ type: '', startDate: new Date(), endDate: new Date() }]);

  // Updated State Variables
  const [uploadedImages, setUploadedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const status = useSelector((state) => state.societyEvents.status);
  const [modalVisible, setModalVisible] = useState(false);

  // Date and Time Picker Handlers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentPickerField, setCurrentPickerField] = useState(null); 
  const [currentActivityIndex, setCurrentActivityIndex] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());

  const handleSubmit = async () => {
    if (!name || !startDateTime || !endDateTime) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    const newEvent = new FormData();
    newEvent.append('societyId', '6683b57b073739a31e8350d0');
    newEvent.append('name', name);
    newEvent.append('startDate', startDateTime.toISOString());
    newEvent.append('endDate', endDateTime.toISOString());

    uploadedImages.forEach((image, index) => {
      if (image.uri) {
        newEvent.append('pictures', {
          uri: image.uri,
          name: image.name,
          type: 'image/jpeg',

        });
      }
    });

    newEvent.append('activities', JSON.stringify(activities));

    try {
      const response = await dispatch(createEvent(newEvent));
      if (response.type === 'event/AddEvent/fulfilled') {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: "Event Created Successfully!",
        });

        setName('');
        setStartDateTime(new Date());
        setEndDateTime(new Date());
        setActivities([{ type: '', startDate: new Date(), endDate: new Date() }]);
        setUploadedImages([]);
        setPreviewImages([]);
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: "Failed to create event!",
        });
      }
    } catch (err) {
      console.error('Error:', err);
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: "An unexpected error occurred.",
      });
    }
  };

  const handleActivityChange = (index, field, value) => {
    const newActivities = [...activities];
    newActivities[index][field] = value;
    setActivities(newActivities);
  };

  const addActivity = () => {
    if (activities.some(activity => !activity.type || !activity.startDate || !activity.endDate)) {
      Alert.alert('Validation Error', 'Please fill in all fields before adding a new activity.');
      return;
    }
    setActivities([...activities, { type: '', startDate: new Date(), endDate: new Date() }]);
  };

  const removeActivity = index => {
    const newActivities = activities.filter((_, i) => i !== index);
    setActivities(newActivities);
  };

  // Updated pickImage Function
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const newImage = {
        uri: asset.uri,
        name: asset.fileName || asset.uri.split('/').pop(),
        type: asset.type || 'image/jpeg',
      };
      setUploadedImages(prev => [...prev, newImage]);
      setPreviewImages(prev => [...prev, asset.uri]);
    }
    setModalVisible(false);
  };

  // Updated takePhoto Function
  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];

      const newImage = {
        uri: asset.uri,
        name: asset.fileName || asset.uri.split('/').pop(),
        type: asset.type || 'image/jpeg', // Adjust type if necessary
      };
      setUploadedImages(prev => [...prev, newImage]);
      setPreviewImages(prev => [...prev, asset.uri]);
    }
    setModalVisible(false);
  };

  const onChangeDate = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }

    const currentDate = selectedDate || tempDate;
    setTempDate(currentDate);
    setShowDatePicker(false);
    setShowTimePicker(true); // Automatically show time picker after date selection
  };

  const onChangeTime = (event, selectedTime) => {
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }

    const currentTime = selectedTime || tempDate;
    const combinedDate = new Date(tempDate);
    combinedDate.setHours(currentTime.getHours());
    combinedDate.setMinutes(currentTime.getMinutes());

    setFieldDate(combinedDate);
    setShowTimePicker(false);
  };

  const setFieldDate = (date) => {
    if (currentPickerField === 'startDate') {
      setStartDateTime(date);
    } else if (currentPickerField === 'endDate') {
      setEndDateTime(date);
    } else if (currentPickerField === 'activity_start' && currentActivityIndex !== null) {
      const updatedActivities = [...activities];
      updatedActivities[currentActivityIndex].startDate = date;
      setActivities(updatedActivities);
    } else if (currentPickerField === 'activity_end' && currentActivityIndex !== null) {
      const updatedActivities = [...activities];
      updatedActivities[currentActivityIndex].endDate = date;
      setActivities(updatedActivities);
    }
  };

  const openPicker = (field, activityIndex = null) => {
    setCurrentPickerField(field);
    setCurrentActivityIndex(activityIndex);
    setShowTimePicker(false);
    setShowDatePicker(true);
  };

  if (status === 'loading') {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#630000" />
      </View>
    );
  }

  if (status === 'failed') {
    return (
      <View style={styles.center}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView >
      <View style={styles.container}>
        <TextInput
          mode="outlined"
          label="Event Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
          theme={{ colors: { primary: "#7d0431" } }}
        />

        {/* Date Pickers */}
        <TouchableOpacity onPress={() => openPicker('startDate')} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>Start Date: {startDateTime.toLocaleString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openPicker('endDate')} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>End Date: {endDateTime.toLocaleString()}</Text>
        </TouchableOpacity>

        {/* DateTimePicker */}
        {showDatePicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={tempDate}
            mode="time"
            display="default"
            onChange={onChangeTime}
          />
        )}

        {/* Image Previews */}
        <View style={styles.imagePreviewContainer}>
          {previewImages.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.imagePreview} />
          ))}
        </View>

        {/* Image Upload */}
        <TouchableOpacity style={styles.uploadButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.uploadButtonText}>Upload Pictures</Text>
        </TouchableOpacity>



        {/* Activities */}
        {activities.map((activity, index) => (
          <View key={index} style={styles.activityContainer}>
            <TextInput
              mode="outlined"
              label="Activity Type"
              style={styles.input}
              value={activity.type}
              onChangeText={value => handleActivityChange(index, 'type', value)}
              theme={{ colors: { primary: "#7d0431" } }}
            />
            <TouchableOpacity onPress={() => openPicker('activity_start', index)} style={styles.datePickerButton}>
              <Text style={styles.datePickerText}>Activity Start: {activity.startDate.toLocaleString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openPicker('activity_end', index)} style={styles.datePickerButton}>
              <Text style={styles.datePickerText}>Activity End: {activity.endDate.toLocaleString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeActivity(index)} style={styles.removeActivityButton}>
              <Icon name="delete" size={25} color="red" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addActivityButton} onPress={addActivity}>
          <Text style={styles.addActivityButtonText}>Add Activity</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Event</Text>
        </TouchableOpacity>

        {/* {isLoading && <ActivityIndicator size="large" color="#7d0431" />} */}

        {/* Modal for Image Picker */}
        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Image Source</Text>
              <TouchableOpacity onPress={pickImage} style={styles.modalButtonIcon}>
                <Text>Pick from Gallery  </Text>
                <Icon name="photo-library" size={24} color="#7D0431" />
              </TouchableOpacity>
              <TouchableOpacity onPress={takePhoto} style={styles.modalButtonIcon}>
                <Text>Take a Photo  </Text>
                <Icon name="photo-camera" size={24} color="#7D0431" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Toast />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    marginTop: 20,
  },
  input: {
    marginBottom: 16,
  },
  datePickerButton: {
    marginBottom: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  activityContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
  },
  uploadButton: {
    backgroundColor: '#7D0431',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  imagePreview: {
    width: 80,
    height: 80,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  activitiesHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    padding: 8,
    borderRadius: 4,
    marginTop: 10,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
  },
  addActivityButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addActivityButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#7D0431',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: "#7D0431"
  },
  modalButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#7d0431',
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonCancel: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalButtonIcon: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
  },
  removeActivityButton: {
    alignSelf: 'flex-end'
  }
});

export default AddEvent;
