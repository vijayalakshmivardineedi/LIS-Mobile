import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { EditUserProfile } from '../../../Redux/Slice/ProfileSlice/EditProfileSlice';
import { fetchUserProfiles } from "../../../Redux/Slice/ProfileSlice/ProfileSlice";
import * as ImagePicker from 'expo-image-picker';
import { ImagebaseURL } from '../../../../Security/helpers/axios';

const EditProfile = ({ route }) => {
  const dispatch = useDispatch();
  const { profiles, } = useSelector((state) => state.profiles);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState(require("../../../../../assets/User/images/girl.png"));
  const { userId, societyId, id } = route.params;
  useEffect(() => {
    if (userId && societyId) {
      dispatch(fetchUserProfiles({ userId, societyId }));
    }
  }, [dispatch, userId, societyId]);

  useEffect(() => {
    if (profiles.length > 0) {
      const profile = profiles[0];
      setName(profile.name);
      setPhoneNumber(profile.mobileNumber);
      setEmail(profile.email);
      setProfileImage(profile.profilePicture);
    }
  }, [profiles]);
  const handleSaveChanges = async () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('mobileNumber', phoneNumber);
    formData.append('email', email);
    formData.append('id', id);

    if (profileImage) {
      try {
        const uri = profileImage;
        const fileExtension = uri.split('.').pop(); 
        const mimeType = `image/${fileExtension}`; 
        const fileName = `profile.${fileExtension}`; 

        const file = {
          uri,
          type: mimeType,
          name: fileName,
        };

        formData.append('profilePicture', file);
      } catch (error) {
        console.error('Error processing image:', error);
        Alert.alert('Image Processing Failed', 'There was an error processing the image. Please try again.');
        return;
      }
    } else {
      console.log('No image selected');
    }
    try {
      await dispatch(EditUserProfile({ formData, id })).unwrap();
      Alert.alert('Profile Updated', 'Your profile has been updated successfully!');
    } catch (error) {
      Alert.alert('Profile Update Failed', 'There was an error updating your profile. Please try again.');
    }
  };
  const handleChoosePhoto = async (type) => {
    let result;
    if (type === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };
  const chooseImageSource = () => {
    Alert.alert(
      'Select Image Source',
      'Choose an option to pick an image',
      [
        {
          text: 'Camera',
          onPress: () => handleChoosePhoto('camera'),
        },
        {
          text: 'Gallery',
          onPress: () => handleChoosePhoto('gallery'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.profileImageWrapper}>
          <Image source={{ uri: `${ImagebaseURL}${profileImage}` || profileImage }} style={styles.profileImage} />
          <TouchableOpacity style={styles.cameraIconContainer} onPress={chooseImageSource}>
            <Image source={require('../../../../../assets/User/images/camera.png')} style={styles.cameraIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.profileDetails}>
          <Text style={styles.name}>{name}</Text>
          <Text>
            <Text style={styles.idLabel}>ID: </Text>
            <Text style={styles.idValue}>{userId}</Text>
          </Text>
        </View>
      </View>
      <Text style={styles.inputLabel}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" placeholderTextColor="#7A7A7A" />
      <Text style={styles.inputLabel}>Phone Number</Text>
      <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Phone Number" placeholderTextColor="#7A7A7A" keyboardType="phone-pad" />
      <Text style={styles.inputLabel}>Email</Text>
      <TextInput style={styles.input} value={email} placeholder="Email" placeholderTextColor="#7A7A7A" keyboardType="email-address" />
      <TouchableOpacity style={styles.button} onPress={handleSaveChanges}>
        <Text style={styles.buttonText}>Save the Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 5,
  },
  cameraIcon: {
    width: 20,
    height: 20,
  },
  profileDetails: {
    marginLeft: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  idLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  idValue: {
    fontSize: 16,
    color: '#7D0431',
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    backgroundColor: '#7D0431',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditProfile;