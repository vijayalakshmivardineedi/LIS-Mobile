import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, Image, ScrollView, Alert, StyleSheet, SafeAreaView } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Snackbar } from 'react-native-paper';  
import { useDispatch, useSelector } from 'react-redux';
import { AddProperty } from '../../../Redux/Slice/MarketPlaceSlice/MarketPlace';
import { useNavigation } from '@react-navigation/native';

const AddProductScreen = () => {
  const [societyId, setSocietyId] = useState("");
  const [userId, setUserId] = useState("");
  const [pictures, setPictures] = useState([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false); 
  const [snackbarMessage, setSnackbarMessage] = useState(''); 
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const { loading} = useSelector((state) => state.MarketPlace);
  useEffect(() => {
    const getUserName = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString !== null) {
          const user = JSON.parse(userString);
          setSocietyId(user.societyId);
          setUserId(user._id);
        }
      } catch (error) {
        console.error("Failed to fetch the user from async storage", error);
      }
    };

    getUserName();
    const requestPermissions = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Permission to access media library is required to upload images.');
      }
    };
    requestPermissions();

  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Rent',
    type: 'Flat',
    contactNumber: '',
  });

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    data.append('societyId', societyId);
    data.append('userId', userId);
    pictures.forEach((file) => {
      data.append('pictures', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });
    });
    try {
      dispatch(AddProperty(data))
        .then((response) => {
          if (response) {
            setSnackbarMessage('Product added successfully!');  // Set snackbar message
            setSnackbarVisible(true);  // Show snackbar
            setFormData({
              title: '',
              description: '',
              price: '',
              category: '',
              type: '',
              contactNumber: '',
            });
            setPictures([]);
            setTimeout(() => {
              navigation.goBack()
            }, 2000)

          }

        })
        .catch((error) => {
          console.error('Error while adding product:', error);
          Alert.alert('Product addition failed');
        });

    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error adding product');
    }
  };

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

  const onDismissSnackBar = () => setSnackbarVisible(false); // Dismiss snackbar
  if (loading) {
    return <Text>loading.</Text>;
}
  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={formData.title}
        onChangeText={(text) => handleInputChange('title', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={formData.description}
        onChangeText={(text) => handleInputChange('description', text)}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={formData.price}
        onChangeText={(text) => handleInputChange('price', text)}
        keyboardType="numeric"
      />

    
      <Text style={styles.label}>Category</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.category}
          style={{ height: 50, color: formData.category ? '#222' : '#222' }} 
          onValueChange={(itemValue) => handleInputChange('category', itemValue)}
        >
          <Picker.Item label="Rent" value="Rent" />
          <Picker.Item label="Sale" value="Sale" />
        </Picker>
      </View>

      {/* Dropdown for Type */}
      <Text style={styles.label}>Type</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData.type}
          style={{ height: 50, color: formData.category ? '#222' : '#222' }} 
          onValueChange={(itemValue) => handleInputChange('type', itemValue)}
        >
          <Picker.Item label="Flats" value="Propety" />
          <Picker.Item label="Home Appliances" value="Home Appliances" />
          <Picker.Item label="Electrical" value="Electrical" />
          <Picker.Item label="Plumbing" value="Plumbing" />
          <Picker.Item label="Electronics" value="Electronics" />
          <Picker.Item label="Wood Items" value="Wood Items" />
          <Picker.Item label="Plastic" value="Plastic" />
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        value={formData.contactNumber}
        onChangeText={(text) => handleInputChange('contactNumber', text)}
        keyboardType="phone-pad"
      />
      {pictures.length > 0 && (
        <View style={styles.imagePreview}>
          {pictures.map((picture, index) => (
            <Image key={index} source={{ uri: picture.uri }} style={styles.image} />
          ))}
        </View>
      )}
      <View style={{ marginBottom: 30 }}>
        <Button title="Pick Images" onPress={handleImageUpload} color="#7d0431" />
      </View>

      <View style={{ marginBottom: 50 }}>
        <Button title="Submit" onPress={handleSubmit} color="#7d0431" />
      </View>

      {/* Snackbar for feedback */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={onDismissSnackBar}
        action={{
          label: 'Dismiss',
          onPress: () => {
            onDismissSnackBar();
          },
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 50
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  imagePreview: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default AddProductScreen;
