import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getSequrityPerson, updateSequrity } from './GateKeeperSlice';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Modal, Alert } from 'react-native';
import { ActivityIndicator, Avatar, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { ImagebaseURL } from '../../../Security/helpers/axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';

const EditSecurity = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { sequrityId } = route.params;
  const profile = useSelector((state) => state.gateKeepers.sequrity);
  const successMessage = useSelector((state) => state.gateKeepers.successMessage);
  const error = useSelector((state) => state.gateKeepers.error);
  const [imageUri, setImageUri] = useState(null);
  const status = useSelector((state) => state.gateKeepers.status);
  console.log("profile", profile)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: 'Security',
    aadharNumber: '',
    address: {
      addressLine1: '',
      addressLine2: '',
      state: '',
      postalCode: '',
    },
    pictures: null, // Changed from 'picture' to 'pictures'
  });

  const [previewImage, setPreviewImage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    dispatch(getSequrityPerson(sequrityId));
  }, [dispatch, sequrityId]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phoneNumber: profile.phoneNumber,
        role: profile.role,
        aadharNumber: profile.aadharNumber,
        address: {
          addressLine1: profile.address?.addressLine1 || '',
          addressLine2: profile.address?.addressLine2 || '',
          state: profile.address?.state || '',
          postalCode: profile.address?.postalCode || '',
        },
        pictures: null, // Ensure this is 'pictures'
      });
      setPreviewImage(`${ImagebaseURL}${profile.pictures}`);
    }
  }, [profile]);

  const handleChange = (name, value) => {
    if (name.startsWith('address.')) {
      const addressKey = name.split('.')[1];
      setFormData(prevFormData => ({
        ...prevFormData,
        address: {
          ...prevFormData.address,
          [addressKey]: value,
        },
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleImagePick = async () => {
    Alert.alert(
      'Select Image Source',
      'Choose an option to upload an image:',
      [
        {
          text: 'Camera',
          onPress: () => pickImage(ImagePicker.launchCameraAsync),
        },
        {
          text: 'Gallery',
          onPress: () => pickImage(ImagePicker.launchImageLibraryAsync),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const pickImage = async (launchFunction) => {
    let result = await launchFunction({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      // setPhoto(result.assets[0]); // Remove if not needed
    }
    setModalVisible(false)
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
          setImageUri(uri); // Directly set the URI
          // setImageFile({ uri, name: uri.split("/").pop(), type: "image/jpeg" }); // Remove if not needed
        }
      }
      setModalVisible(false);
    } catch (error) {
      console.error("Error launching camera:", error);
    }
  };

const handleSubmit = async () => {
  const data = new FormData();

  // Append form data to FormData
  Object.keys(formData).forEach(key => {
    if (key === 'address') {
      Object.keys(formData[key]).forEach(nestedKey => {
        data.append(`address[${nestedKey}]`, formData[key][nestedKey]);
      });
    } else if (key === 'pictures' && imageUri) { // Append 'pictures' only if imageUri exists
      data.append('pictures', {
        uri: imageUri,
        name: `security-${Date.now()}.jpeg`,
        type: 'image/jpeg',
      });
    } else if (key !== 'pictures') { // Exclude 'pictures' if imageUri doesn't exist
      data.append(key, formData[key]);
    }
  });

  try {
    // Dispatch the update action
    await dispatch(updateSequrity({ sequrityId, formData: data }));

    // Show success message
    Toast.show({
      text1: 'Success',
      text2: successMessage || 'Security updated successfully!',
      type: 'success',
    });

    // Navigate back after a short delay
    setTimeout(() => {
      navigation.goBack();
    }, 2000);
  } catch (error) {
    console.error("Error updating security:", error);

    // Show error message
    Toast.show({
      text1: 'Error',
      text2: 'Failed to update security. Please try again.',
      type: 'error',
    });
  }
};


  if (status === 'loading') {
    return <ActivityIndicator size="large" color="#630000" style={styles.loader} />;
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={120}
            source={
              imageUri
                ? { uri: imageUri }
                : previewImage
                  ? { uri: previewImage }
                  : { uri: "https://thumbs.dreamstime.com/b/default-avatar-profile-trendy-style-social-media-user-icon-187599373.jpg" } // Fallback to a local image
            }
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.cameraButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.form}>
          <TextInput
            mode="outlined"
            label='Name'
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            theme={{ colors: { primary: "#7d0431" } }}
            style={styles.textInput}
          />

          <TextInput
            mode="outlined"
            label='Email'
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            theme={{ colors: { primary: "#7d0431" } }}
            style={styles.textInput}
          /> 
          <TextInput
            mode="outlined"
            label='Mobile Number'
            value={formData.phoneNumber}
            onChangeText={(value) => handleChange('phoneNumber', value)}
            theme={{ colors: { primary: "#7d0431" } }}
            style={styles.textInput}
            keyboardType="numeric"
          />
          <TextInput
            mode="outlined"
            label='Aadhar Number'
            value={formData.aadharNumber?.toString() || ''}
            onChangeText={(value) => handleChange('aadharNumber', value)}
            theme={{ colors: { primary: "#7d0431" } }}
            style={styles.textInput}
            keyboardType="numeric"
          />

          <TextInput
            mode="outlined"
            label='Address Line 1'
            value={formData.address.addressLine1}
            onChangeText={(value) => handleChange('address.addressLine1', value)}
            theme={{ colors: { primary: "#7d0431" } }}
            style={styles.textInput}
          />
          <TextInput
            mode="outlined"
            label='Address Line 2'
            value={formData.address.addressLine2}
            onChangeText={(value) => handleChange('address.addressLine2', value)}
            theme={{ colors: { primary: "#7d0431" } }}
            style={styles.textInput}
          />
          <TextInput
            mode="outlined"
            label='State'
            value={formData.address.state}
            onChangeText={(value) => handleChange('address.state', value)}
            theme={{ colors: { primary: "#7d0431" } }}
            style={styles.textInput}
          />
          <TextInput
            mode="outlined"
            label='Postal Code'
            value={formData.address.postalCode}
            onChangeText={(value) => handleChange('address.postalCode', value)}
            theme={{ colors: { primary: "#7d0431" } }}
            style={styles.textInput}
          />

          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Update Security Person</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Image Source</Text>
              <TouchableOpacity onPress={() => pickImage(ImagePicker.launchImageLibraryAsync)} style={styles.modalButtonIcon}>
                <Text>Pick from Gallery  </Text>
                <Icon name="photo-library" size={24} color="#7D0431" />
              </TouchableOpacity>
              <TouchableOpacity onPress={takePhoto} style={styles.modalButtonIcon}>
                <Text>Take a Photo  </Text>
                <Icon name="photo-camera" size={24} color="#7D0431" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonCancel} >Cancel</Text>
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
  },
  form: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  imageButtonText: {
    color: 'white',
  },
  imageContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  submitButton: {
    backgroundColor: '#7D0431',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 25,
  },
  submitButtonText: {
    color: 'white',
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
  textInput: {
    marginBottom: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
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

export default EditSecurity;
