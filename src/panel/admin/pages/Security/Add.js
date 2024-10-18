import * as ImagePicker from "expo-image-picker";
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Modal, Alert } from 'react-native'
import { ActivityIndicator, Avatar, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { createSequrity } from './GateKeeperSlice';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { Ionicons } from '@expo/vector-icons';
const AddSecurity = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { status } = useSelector((state) => state.gateKeepers);
  const [formData, setFormData] = useState({
    societyId: '6683b57b073739a31e8350d0',
    name: '',
    email: '',
    phoneNumber: '',
    role: 'Sequrity',
    details: '',
    aadharNumber: '',
    address: {
      addressLine1: '',
      addressLine2: '',
      state: '',
      postalCode: '',
    },
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const successMessage = useSelector((state) => state.gateKeepers.successMessage);
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (name, value) => {
    if (name.startsWith('address.')) {
      const addressKey = name.split('.')[1];
      setFormData((prevFormData) => ({
        ...prevFormData,
        address: {

          ...prevFormData.address,
          [addressKey]: value,
        },
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0]?.uri;
      if (uri) {
        setImageFile({ uri, name: uri.split("/").pop(), type: "image/jpeg" });
      }
      setModalVisible(false);
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0]?.uri;
        if (uri) {
          setImageFile({ uri, name: uri.split("/").pop(), type: "image/jpeg" });
        }
      }
      setModalVisible(false);
    } catch (error) {
      console.error("Error launching camera:", error);
    }
  };

  const deletePhoto = () => {
    setImageFile(null);
  };


  const handleAdd = async () => {
    const newErrors = {};

    // Required field validation
    Object.keys(formData).forEach((key) => {
      if (!formData[key] && key !== 'details') {
        newErrors[key] = 'This field is required';
      }
    });

    // Address field validation
    Object.keys(formData.address).forEach((key) => {
      if (!formData.address[key]) {
        newErrors[`address.${key}`] = 'This field is required';
      }
    });

    // Email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Mobile number format validation
    const mobileNumberRegex = /^\d{10}$/;
    if (formData.phoneNumber && !mobileNumberRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Mobile number must be 10 digits';
    }

    // Aadhar number format validation
    const aadharNumberRegex = /^\d{12}$/;
    if (formData.aadharNumber && !aadharNumberRegex.test(formData.aadharNumber)) {
      newErrors.aadharNumber = 'Aadhar Number must be 12 digits';
    }

    // Check for errors
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare submission data
    const submissionData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== 'address') {
        submissionData.append(key, formData[key]);
      }
    });
    Object.keys(formData.address).forEach((key) => {
      submissionData.append(`address[${key}]`, formData.address[key]);
    });

    if (imageFile) {
      submissionData.append('pictures', {
        uri: imageFile.uri,
        name: imageFile.name,
        type: imageFile.type,
      });
    }

    try {
      const response = await dispatch(createSequrity(submissionData));
      console.log(response)
      if (response.meta.requestStatus === 'fulfilled') {
        Toast.show({
          text1: 'Success',
          text2: 'Security added successfully!',
          type: 'success',
        });

        setTimeout(() => {
          navigation.goBack();
        }, 2000);

        setFormData({
          societyId: '',
          name: '',
          email: '',
          phoneNumber: '',
          role: 'Sequrity',
          details: '',
          aadharNumber: '',
          address: {
            addressLine1: '',
            addressLine2: '',
            state: '',
            postalCode: '',
          },
          password: '',
        });
        setErrors({});
        setImageFile(null);
      }
      else {
        Alert.alert("failed")
      }
    } catch (error) {
      console.error('Error:', error);
      Toast.show({
        text1: 'Error',
        text2: 'Failed to add security. Please try again.',
        type: 'error',
      });
    }
  };


  if (status === 'loading') {
    return (

      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#630000" />
      </View>
    );
  }

  // if (status === 'failed') {
  //     return <Text style={styles.errorText}>Error: {error}</Text>;
  // }

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={120}
            source={
              imageFile
                ? { uri: imageFile.uri }
                : { uri: "https://thumbs.dreamstime.com/b/default-avatar-profile-trendy-style-social-media-user-icon-187599373.jpg" } // Fallback to a local image
            }
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.cameraButton} onPress={() => setModalVisible(true)} >
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.form}>

          <View style={styles.textInputFields}>

            <TextInput
              mode="outlined"
              label="Name"
              value={formData.name}
              onChangeText={(value) => handleChange('name', value)}
              theme={{ colors: { primary: "#7d0431" } }}
              style={styles.textInput}
            />
            {errors.name && <Text style={styles.error}>{errors.name}</Text>}

               <TextInput
              mode="outlined"
              label="Email"
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              theme={{ colors: { primary: "#7d0431" } }}
              style={styles.textInput}
              keyboardType="email-address"
              autoCapitalize="none" // Prevent automatic capitalization
              autoCorrect={false}
            />
            {errors.email && <Text style={styles.error}>{errors.email}</Text>}

            <TextInput
              mode="outlined"
              label="Phone Number"
              value={formData.phoneNumber}
              onChangeText={(value) => handleChange('phoneNumber', value)}
              theme={{ colors: { primary: "#7d0431" } }}
              style={styles.textInput}
              keyboardType="numeric"
            />
            {errors.phoneNumber && <Text style={styles.error}>{errors.phoneNumber}</Text>}

            <TextInput
              mode="outlined"
              label="Aadhar Number"
              value={formData.aadharNumber}
              onChangeText={(value) => handleChange('aadharNumber', value)}
              theme={{ colors: { primary: "#7d0431" } }}
              keyboardType="numeric"
              style={styles.textInput}
            />
            {errors.aadharNumber && <Text style={styles.error}>{errors.aadharNumber}</Text>}

            {/* Address Fields */}
            <TextInput
              mode="outlined"
              label="Address Line 1"
              value={formData.address.addressLine1}
              onChangeText={(value) => handleChange('address.addressLine1', value)}
              theme={{ colors: { primary: "#7d0431" } }}
              style={styles.textInput}
            />
            {errors['address.addressLine1'] && <Text style={styles.error}>{errors['address.addressLine1']}</Text>}

            <TextInput
              mode="outlined"
              label="Address Line 2"
              value={formData.address.addressLine2}
              onChangeText={(value) => handleChange('address.addressLine2', value)}
              theme={{ colors: { primary: "#7d0431" } }}
              style={styles.textInput}
            />
            {errors['address.addressLine2'] && <Text style={styles.error}>{errors['address.addressLine2']}</Text>}

            <TextInput
              mode="outlined"
              label="State"
              value={formData.address.state}
              onChangeText={(value) => handleChange('address.state', value)}
              theme={{ colors: { primary: "#7d0431" } }}
              style={styles.textInput}
            />
            {errors['address.state'] && <Text style={styles.error}>{errors['address.state']}</Text>}

            <TextInput
              mode="outlined"
              label="Postal Code"
              value={formData.address.postalCode}
              onChangeText={(value) => handleChange('address.postalCode', value)}
              theme={{ colors: { primary: "#7d0431" } }}
              keyboardType="numeric"
              style={styles.textInput}
            />
            {errors['address.postalCode'] && <Text style={styles.error}>{errors['address.postalCode']}</Text>}

            <TextInput
              mode="outlined"
              label="Password"
              value={formData.password}
              onChangeText={(value) => handleChange('password', value)}
              secureTextEntry={true}
              theme={{ colors: { primary: "#7d0431" } }}
              style={styles.textInput}
            />
            {errors.password && <Text style={styles.error}>{errors.password}</Text>}
          </View>
          <TouchableOpacity onPress={handleAdd} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Add Security</Text>
          </TouchableOpacity>
        </View>
        {/* Image Selection Modal */}
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
  form: {
    marginBottom: 20,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  imagePreview: {
    marginBottom: 10,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeImageButton: {
    marginTop: 5,
    padding: 5,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  removeImageText: {
    color: 'white',
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#7D0431',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
    alignItems: 'center', // Ensure text and icon are vertically aligned
  },

  textInputFields: {
    marginBottom: 20,
  },
  textInput: {
    marginBottom: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    alignSelf: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Your primary color
    borderRadius: 50,
    padding: 5,
  },
});

export default AddSecurity; 