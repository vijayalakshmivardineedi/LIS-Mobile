import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Text, Image, ScrollView, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getPropertyById } from '../../../Redux/Slice/MarketPlaceSlice/MarketPlace';
import { useDispatch, useSelector } from 'react-redux';

const EditProductScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { productId } = route.params;
  const dispatch = useDispatch();
  const [productDetails, setProductDetails] = useState(null);
  const [pictures, setPictures] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Rent',
    type: 'Flat',
    contactNumber: '',
  });

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await dispatch(getPropertyById(productId));
        if (response.payload) {
          setProductDetails(response.payload);
          setFormData({
            title: response.payload.title,
            description: response.payload.description,
            price: response.payload.price.toString(),
            category: response.payload.category,
            type: response.payload.type,
            contactNumber: response.payload.contactNumber,
          });
          setPictures(response.payload.pictures || []); // Set existing images
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        Alert.alert('Error fetching product details');
      }
    };

    fetchProductDetails();
  }, [dispatch, productId]);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }
    pictures.forEach((file) => {
      data.append('pictures', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });
    });
    try {
      const response = await axios.put(`/api/products/${productId}`, data); // Adjust the URL to your backend endpoint
      if (response.data.success) {
        Alert.alert('Product updated successfully');
        navigation.goBack();
      } else {
        Alert.alert('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error updating product');
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

  const handleRemoveImage = (index) => {
    const updatedPictures = pictures.filter((_, i) => i !== index);
    setPictures(updatedPictures);
  };

  if (!productDetails) {
    return <Text>Loading...</Text>; 
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
      <TextInput
        style={styles.input}
        placeholder="Contact Number"
        value={formData.contactNumber}
        onChangeText={(text) => handleInputChange('contactNumber', text)}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Current Images:</Text>
      <View style={styles.imagePreview}>
        {pictures.map((picture, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: picture.uri }} style={styles.image} />
            <Button title="Remove" onPress={() => handleRemoveImage(index)} />
          </View>
        ))}
      </View>

      <Button title="Pick New Image" onPress={handleImageUpload} color="#7d0431" />
      <Button title="Submit Changes" onPress={handleSubmit} color="#7d0431" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
  imagePreview: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageContainer: {
    marginRight: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
});

export default EditProductScreen;
