import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createRental,  } from '../../../Redux/Slice/CommunitySlice/Rental/createRentalSlice';
import { StyleSheet, View, Text,  ScrollView, TextInput, TouchableOpacity, Alert, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSocietiesByAdvertisements } from '../../../Redux/Slice/CommunitySlice/Rental/rentalSlice';
import { Modal, ActivityIndicator } from 'react-native';
const CreateRental = () => {
  const [loadingsubmittion, setLoadingsubmission] = useState(false);
  const navigation = useNavigation();
  const [block, setBlock] = useState('');
  const [flatArea, setFlatArea] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [maintenancePrice, setMaintenancePrice] = useState('');
  const [price, setPrice] = useState('');
  const [rooms, setRooms] = useState('');
  const [washrooms, setWashrooms] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pictures, setPictures] = useState([]);
  const [societyId, setSocietyId] = useState('');
  const [status, setStatus] = useState('Unoccupied');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const getUserName = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString !== null) {
          const user = JSON.parse(userString);
          setUserName(user.name);
          setSocietyId(user.societyId);
          setUserId(user.userId);
          setBlock(user.buildingName);
          setFlatNo(user.flatNumber);
        }
      } catch (error) {
        console.error("Failed to fetch the user from async storage", error);
      }
    };

    getUserName();
  }, []);
  const dispatch = useDispatch();
  const createRentalState = useSelector((state) => state.createRental);

  const handleSubmit = async () => {

    try {
      const formData = new FormData();
      const details = JSON.stringify({
        block,
        flat_No: flatNo,
        flat_Area: flatArea,
        rooms,
        washrooms,
        price,
        maintainancePrice: maintenancePrice,
      });

      formData.append('societyId', societyId);
      formData.append('status', status);
      formData.append('userId', userId);
      formData.append('userName', userName);
      formData.append('phoneNumber', phoneNumber);
      formData.append('adv', 'Rent');
      formData.append('details', details);

      pictures.forEach((file) => {
        formData.append('pictures', {
          uri: file.uri,
          type: file.type,
          name: file.name,
        });
      });
      if (!flatArea) {
        Alert.alert('Error', "Please enter flatArea")
        return;
      }
      if (!maintenancePrice) {
        Alert.alert('Error', 'Please enter maintenancePrice');
        return;
      }
      if (!price) {
        Alert.alert('Error', "Please enter price")
        return;
      }
      if (!rooms) {
        Alert.alert('Error', 'Please enter room');
        return;
      }
      if (!washrooms) {
        Alert.alert('Error', 'Please enter washrooms');
        return;
      }
      if (!phoneNumber) {
        Alert.alert('Error', 'Date is required');
        return;
      }
      if (!pictures) {
        Alert.alert('Error', 'Please add pictures');
        return;
      }
      setLoadingsubmission(true)
      const result = await dispatch(createRental(formData));
      if (result.type === 'createRental/createRental/fulfilled') {
        dispatch(getSocietiesByAdvertisements());
        setLoadingsubmission(true)
        navigation.navigate('Tabs', { screen: "Social" })
      }
    }
    catch (error) {
      console.error(error)
    }
  };
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Permission to access media library is required to upload images.');
      }
    };
    requestPermissions();
  }, []);
  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const { uri } = result.assets[0];
      const fileName = uri.split('/').pop();
      const fileType = uri.match(/\.(\w+)$/) ? `image/${uri.match(/\.(\w+)$/)[1]}` : `image`;

      setPictures([...pictures, { uri, type: fileType, name: fileName }]);
    }
  };
  const handleNumberInput = (value, setter) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setter(numericValue);
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.ScrollViewcontainer}>
        <Text style={styles.heading}>Create Property</Text>
        <TextInput
          style={styles.input}
          placeholder="Block"
          value={block}
          onChangeText={setBlock}
          placeholderTextColor="#800336"
        />
        <TextInput
          style={styles.input}
          placeholder="Flat Area"
          value={flatArea}
          onChangeText={setFlatArea}
          placeholderTextColor="#800336"
        />
        <TextInput
          style={styles.input}
          placeholder="Flat No"
          value={flatNo}
          onChangeText={setFlatNo}
          placeholderTextColor="#800336"
        />
        <TextInput
          style={styles.input}
          placeholder="Maintenance Price"
          value={maintenancePrice}
          onChangeText={(value) => handleNumberInput(value, setMaintenancePrice)}
          keyboardType="numeric"
          placeholderTextColor="#800336"
        />
        <TextInput
          style={styles.input}
          placeholder="Price"
          value={price}
          onChangeText={(value) => handleNumberInput(value, setPrice)}
          keyboardType="numeric"
          placeholderTextColor="#800336"
        />
        <TextInput
          style={styles.input}
          placeholder="Rooms"
          value={rooms}
          onChangeText={setRooms}
          placeholderTextColor="#800336"
        />
        <TextInput
          style={styles.input}
          placeholder="Washrooms"
          value={washrooms}
          onChangeText={(value) => handleNumberInput(value, setWashrooms)}
          keyboardType="numeric"
          placeholderTextColor="#800336"
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={(value) => handleNumberInput(value, setPhoneNumber)}
          keyboardType="phone-pad"
          placeholderTextColor="#800336"
        />
        <TextInput
          style={styles.input}
          placeholder="Society ID"
          value={societyId}
          onChangeText={setSocietyId}
          placeholderTextColor="#800336"
        />
        <TextInput
          style={styles.input}
          placeholder="Status"
          value={status}
          onChangeText={setStatus}
          placeholderTextColor="#800336"
        />
        <TextInput
          style={styles.input}
          placeholder="User ID"
          value={userId}
          onChangeText={setUserId}
          placeholderTextColor="#800336"
        />
        <TextInput
          style={styles.input}
          placeholder="User Name"
          value={userName}
          onChangeText={setUserName}
          placeholderTextColor="#800336"
        />
        <TouchableOpacity style={styles.imageUploadButton} onPress={handleImageUpload}>
          <Text style={styles.buttonText}>Upload Image</Text>
        </TouchableOpacity>
        {pictures.length > 0 && (
          <View style={styles.imagePreview}>
            {pictures.map((picture, index) => (
              <Image key={index} source={{ uri: picture.uri }} style={styles.image} />
            ))}
          </View>
        )}
        <TouchableOpacity onPress={handleSubmit} disabled={loadingsubmittion} style={styles.imageUploadButton}>
          <Text style={styles.buttonText}>{loadingsubmittion ? 'Submitting...' : 'Submit'}</Text>
        </TouchableOpacity>
        <Modal transparent={true} animationType="none" visible={loadingsubmittion}>
          <View style={styles.modalBackground}>
            <View style={styles.activityIndicatorWrapper}>
              <ActivityIndicator size="large" color="#800336" />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#fff',
  },
  ScrollViewcontainer: {
    paddingHorizontal: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#800336',
  },
  input: {
    height: 40,
    borderColor: '#800336',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  imageUploadButton: {
    backgroundColor: '#800336',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  imagePreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 8,
    marginBottom: 8,
  },

});

export default CreateRental;
