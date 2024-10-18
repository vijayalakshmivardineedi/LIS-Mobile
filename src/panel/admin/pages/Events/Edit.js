// EditEvent.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { ActivityIndicator, TextInput, Button } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchEventById, updateEvent } from './EventSlice';
import { ImagebaseURL } from '../../../Security/helpers/axios'; // Adjust the path as needed
import Icon from 'react-native-vector-icons/MaterialIcons';

const EditEvent = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params;
  const event = useSelector(state => state.societyEvents.event || '');
  const status = useSelector((state) => state.societyEvents.status);
  const error = useSelector((state) => state.societyEvents.error);

  useEffect(() => {
    dispatch(fetchEventById(eventId));
  }, [dispatch, eventId]);

  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date(),
    endDate: new Date(),
    activities: [],
  });

  const [pictures, setPictures] = useState([]); // Existing pictures
  const [uploadedImages, setUploadedImages] = useState([]); // Newly selected images
  const [previewImages, setPreviewImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentPickerField, setCurrentPickerField] = useState(null);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        startDate: event.startDate ? new Date(event.startDate) : new Date(),
        endDate: event.endDate ? new Date(event.endDate) : new Date(),
        activities: event.activities
          ? event.activities.map(activity => ({
              type: activity.type || '',
              startDate: activity.startDate ? new Date(activity.startDate) : new Date(),
              endDate: activity.endDate ? new Date(activity.endDate) : new Date(),
            }))
          : [],
      });
      setPictures(event.pictures || []);
      const imagePreviews = event.pictures?.map((pic) => `${ImagebaseURL}${pic.img}`) || [];
      setPreviewImages(imagePreviews);
    }
  }, [event]);

  const handleChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleActivityChange = (index, field, value) => {
    setFormData((prevData) => {
      const updatedActivities = [...prevData.activities];
      updatedActivities[index] = { ...updatedActivities[index], [field]: value };
      return { ...prevData, activities: updatedActivities };
    });
  };

  const addActivity = () => {
    setFormData((prevData) => ({
      ...prevData,
      activities: [...prevData.activities, { type: '', startDate: new Date(), endDate: new Date() }],
    }));
  };

  const removeActivity = (index) => {
    setFormData((prevData) => {
      const updatedActivities = [...prevData.activities];
      updatedActivities.splice(index, 1);
      return { ...prevData, activities: updatedActivities };
    });
  };

  // Corrected Image Picker Function: Adds to uploadedImages and updates previewImages
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
      setUploadedImages((prev) => [...prev, newImage]);
      setPreviewImages((prev) => [...prev, asset.uri]);
    }
    setModalVisible(false);
  };

  // Corrected Take Photo Function: Adds to uploadedImages and updates previewImages
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
      setUploadedImages((prev) => [...prev, newImage]);
      setPreviewImages((prev) => [...prev, asset.uri]);
    }
    setModalVisible(false); 
  };
  


  // Delete Image Function: Removes from either existing pictures or uploadedImages
  const deleteImage = (index, isExisting = false) => {
    if (isExisting) {
      setPictures((prev) => {
        const updatedPictures = [...prev];
        updatedPictures.splice(index, 1);
        // Update previewImages by removing the deleted image
        const updatedPreviews = updatedPictures.map((pic) => `${ImagebaseURL}${pic.img}`);
        setPreviewImages(updatedPreviews.concat(uploadedImages.map((img) => img.uri)));
        return updatedPictures;
      });
    } else {
      setUploadedImages((prev) => {
        const updatedUploadedImages = [...prev];
        updatedUploadedImages.splice(index - pictures.length, 1);
        // Update previewImages by removing the deleted uploaded image
        const updatedPreviews = updatedUploadedImages.map((img) => img.uri);
        setPreviewImages(pictures.map((pic) => `${ImagebaseURL}${pic.img}`).concat(updatedPreviews));
        return updatedUploadedImages;
      });
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    tempErrors.name = formData.name ? '' : 'Name is required.';
    tempErrors.startDate = formData.startDate ? '' : 'Start date is required.';
    tempErrors.endDate = formData.endDate ? '' : 'End date is required.';

    formData.activities.forEach((activity, index) => {
      if (!activity.type) {
        tempErrors[`activity_type_${index}`] = 'Title is required.';
      }
      if (!activity.startDate) {
        tempErrors[`activity_startDate_${index}`] = 'Start date is required.';
      }
      if (!activity.endDate) {
        tempErrors[`activity_endDate_${index}`] = 'End date is required.';
      }
      // Additional validation: startDate should be before endDate
      if (activity.startDate && activity.endDate && activity.startDate > activity.endDate) {
        tempErrors[`activity_date_${index}`] = 'Start date must be before end date.';
      }
    });

    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === '');
  };

  const handleSubmit = async () => {
    console.log('clicked');
    if (validateForm()) {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('startDate', formData.startDate.toISOString());
      data.append('endDate', formData.endDate.toISOString());
      data.append(
        'activities',
        JSON.stringify(
          formData.activities.map((activity) => ({
            type: activity.type,
            startDate: activity.startDate.toISOString(),
            endDate: activity.endDate.toISOString(),
          }))
        )
      );

      // Append only newly uploaded images
      uploadedImages.forEach((image, index) => {
        if (image.uri) {
          data.append('pictures', {
            uri: image.uri,
            name: image.name,
            type: 'image/jpeg',
            
          });
        }
      });

      try {
        const response = await dispatch(updateEvent({ id: eventId, formData: data }));
        if (response.meta.requestStatus === 'fulfilled') {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Successfully Event Updated',
          });
          setTimeout(() => {
            navigation.goBack();
          }, 2000);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Submission Error',
            text2: 'Please fix the errors before submitting.',
          });
        }
      } catch (error) {
        console.error('Submission error:', error); // Handle unexpected errors
        Toast.show({
          type: 'error',
          text1: 'Unexpected Error',
          text2: 'An unexpected error occurred. Please try again later.',
        });
      }
    }
  };

// Date Picker Handler
  const onChangeDate = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }

    const currentDate = selectedDate || tempDate;
    setTempDate(currentDate);
    setShowDatePicker(false);

    // Open time picker after a small delay to avoid flicker
    setTimeout(() => setShowTimePicker(true), 100);
  };

  // Time Picker Handler
  const onChangeTime = (event, selectedTime) => {
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }

    const currentTime = selectedTime || tempDate;
    setShowTimePicker(false);

    // Combine date and time
    const combinedDate = new Date(tempDate);
    combinedDate.setHours(currentTime.getHours());
    combinedDate.setMinutes(currentTime.getMinutes());

    // Set the combined date to the correct field based on the current picker field
    setFieldDate(combinedDate);
  };

  const setFieldDate = (date) => {
    if (currentPickerField === 'startDate') {
      setFormData(prevData => ({
        ...prevData,
        startDate: date,
      }));
    } else if (currentPickerField === 'endDate') {
      setFormData(prevData => ({
        ...prevData,
        endDate: date,
      }));
    } else if (currentPickerField === 'activity_start') {
      const updatedActivities = [...formData.activities];
      updatedActivities[currentActivityIndex].startDate = date;
      setFormData({ ...formData, activities: updatedActivities });
    } else if (currentPickerField === 'activity_end') {
      const updatedActivities = [...formData.activities];
      updatedActivities[currentActivityIndex].endDate = date;
      setFormData({ ...formData, activities: updatedActivities });
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
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.form}>
          {/* Event Name */}
          <TextInput
            mode="outlined"
            label="Event Name *"
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            style={styles.textInput}
            theme={{ colors: { primary: '#7d0431' } }}
            error={!!errors.name}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          {/* Start Date */}
          <TouchableOpacity onPress={() => openPicker('startDate')} style={styles.datePickerButton}>
            <Text style={styles.datePickerText}>Start Date *</Text>
            <Text style={styles.selectedDateText}>{formData.startDate.toLocaleString()}</Text>
          </TouchableOpacity>
          {errors.startDate && <Text style={styles.errorText}>{errors.startDate}</Text>}

          {/* End Date */}
          <TouchableOpacity onPress={() => openPicker('endDate')} style={styles.datePickerButton}>
            <Text style={styles.datePickerText}>End Date *</Text>
            <Text style={styles.selectedDateText}>{formData.endDate.toLocaleString()}</Text>
          </TouchableOpacity>
          {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}

          {/* Activities */}
          <Text style={styles.activitiesHeader}>Activities</Text>
          {formData.activities.map((activity, index) => (
            <View key={index} style={styles.activityContainer}>
              <TextInput
                mode="outlined"
                label={`Activity Title *`}
                value={activity.type}
                onChangeText={(value) => handleActivityChange(index, 'type', value)}
                style={styles.textInput}
                error={!!errors[`activity_type_${index}`]}
                theme={{ colors: { primary: '#7d0431' } }}
              />
              {errors[`activity_type_${index}`] && (
                <Text style={styles.errorText}>{errors[`activity_type_${index}`]}</Text>
              )}

              <TouchableOpacity onPress={() => openPicker('activity_start', index)} style={styles.datePickerButton}>
                <Text style={styles.datePickerText}>Activity Start Date *</Text>
                <Text style={styles.selectedDateText}>{activity.startDate.toLocaleString()}</Text>
              </TouchableOpacity>
              {errors[`activity_startDate_${index}`] && (
                <Text style={styles.errorText}>{errors[`activity_startDate_${index}`]}</Text>
              )}

              <TouchableOpacity onPress={() => openPicker('activity_end', index)} style={styles.datePickerButton}>
                <Text style={styles.datePickerText}>Activity End Date *</Text>
                <Text style={styles.selectedDateText}>{activity.endDate.toLocaleString()}</Text>
              </TouchableOpacity>
              {errors[`activity_endDate_${index}`] && (
                <Text style={styles.errorText}>{errors[`activity_endDate_${index}`]}</Text>
              )}

              {errors[`activity_date_${index}`] && (
                <Text style={styles.errorText}>{errors[`activity_date_${index}`]}</Text>
              )}

              <TouchableOpacity onPress={() => removeActivity(index)} style={styles.removeActivityButton}>
                <Icon name="delete" size={24} color="red" />
              </TouchableOpacity>

            </View>
          ))}

          <TouchableOpacity onPress={addActivity} style={styles.addActivityButton}>
            <Text style={styles.addActivityText}>Add Activity</Text>
          </TouchableOpacity>

          {/* Images Section */}
          <Text style={styles.sectionTitle}>Images</Text>
          <FlatList
            data={previewImages}
            horizontal
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: item }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => deleteImage(index, index < pictures.length)}
                >
                  <Icon name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          />
          {previewImages.length < 5 && (
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addImageButton}>
              <Text style={styles.addImageText}>Upload Images</Text>
            </TouchableOpacity>
          )}

          {/* Submit Button */}
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Update Event</Text>
          </TouchableOpacity>
        </View>

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


        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeDate}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={tempDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeTime}
          />
        )}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#630000',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },
  form: {
    flex: 1,
  },
  textInput: {
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  activitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    color: '#7D0431',
    fontWeight: '700',
    fontSize: 18,
  },
  activitiesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#630000',
  },
  addButton: {
    backgroundColor: '#7D0431',
  },
  activityContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    position: 'relative',
  },
  activityLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#630000',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#630000',
    marginVertical: 10,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'red',
    borderRadius: 15,
    padding: 2,
  },
  addImageButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  addImageText: {
    color: '#fff',
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#7D0431',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  datePickerButton: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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

  addActivityButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7D0431',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  addActivityText: {
    color: '#fff',
    fontWeight: '700',
  },
  removeActivityButton: {
    alignSelf: 'flex-end'
  }
});
export default EditEvent;
