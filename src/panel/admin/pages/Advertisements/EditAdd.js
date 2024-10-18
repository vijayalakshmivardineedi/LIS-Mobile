import React, { useEffect, useState } from 'react';
import { View, Text, TextInput,  Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { editAdvertisement, getAdvertisementsById } from './AdvertisementSlice';
import { ImagebaseURL } from '../../../Security/helpers/axios';
import * as ImagePicker from "expo-image-picker";
const EditAdd = () => {
    const dispatch = useDispatch();
    const route = useRoute();
    const { id } = route.params; 
    const navigation = useNavigation();

    const advertisement = useSelector(state => state.advertisements.adds);

    const [formData, setFormData] = useState({
        adv: '',
        phoneNumber: '',
        userName: '',
        status: '',
        details: {
            block: '',
            flat_No: '',
            flat_Area: '',
            rooms: '',
            washrooms: '',
            price: "",
            maintainancePrice: "",
            parkingSpace: '',
        },
        pictures: [], 
    });

    const [previewImages, setPreviewImages] = useState([]);
    const [newFilesSelected, setNewFilesSelected] = useState(false);

    useEffect(() => {
        dispatch(getAdvertisementsById(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (advertisement) {
            setFormData({
                adv: advertisement.adv || '',
                phoneNumber: advertisement.phoneNumber || '',
                userName: advertisement.userName || '',
                status: advertisement.status || '',
                details: {
                    block: advertisement.details?.block || '',
                    flat_No: advertisement.details?.flat_No || '',
                    flat_Area: advertisement.details?.flat_Area || '',
                    rooms: advertisement.details?.rooms || '',
                    washrooms: advertisement.details?.washrooms || '',
                    price: advertisement.details?.price || '',
                    maintainancePrice: advertisement.details?.maintainancePrice || '',
                    parkingSpace: advertisement.details?.parkingSpace || '',
                },
                pictures: advertisement.pictures || [],
            });

            const imagePreviews = advertisement.pictures?.map(pic => pic.img) || [];
            setPreviewImages(imagePreviews);
        }
    }, [advertisement]);
    const handleChange = (name, value) => {
        if (name.startsWith('details.')) {
            const detailKey = name.split('.')[1];
            setFormData(prevFormData => ({
                ...prevFormData,
                details: {
                    ...prevFormData.details,
                    [detailKey]: value,
                },
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };


    const handleFileChange = (selectedImages) => {
        const totalImages = formData.pictures.length + selectedImages.length;

        if (totalImages > 5) {
            Alert.alert("Limit Exceeded", "You can only add up to 5 images in total.");
            return;
        }

        const filePreviews = selectedImages.map(asset => asset.uri);
        const newPictures = selectedImages.map(asset => ({
            uri: asset.uri,
            type: asset.type,
            fileName: asset.fileName,
        }));

        setPreviewImages(prevImages => [...prevImages, ...filePreviews]);
        setFormData(prevData => ({
            ...prevData,
            pictures: [...prevData.pictures, ...newPictures],
        }));
        setNewFilesSelected(true);
    };
    const handleRemoveImage = (index) => {
        setPreviewImages(prevImages => prevImages.filter((_, i) => i !== index));
        setFormData(prevData => ({
            ...prevData,
            pictures: prevData.pictures.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = () => {
        const data = new FormData();

        Object.keys(formData).forEach((key) => {
            if (key === 'details') {
                Object.keys(formData[key]).forEach((nestedKey) => {
                    data.append(`details[${nestedKey}]`, formData[key][nestedKey]);
                });
            } else if (key !== 'pictures') {
                data.append(key, formData[key]);
            }
        });

        formData.pictures.forEach((file, index) => {
            if (file.uri) {
                const isExistingImage = !newFilesSelected; 

                data.append('pictures', {
                    uri: file.uri,
                    type: 'image/jpeg', 
                    name: file.fileName || (isExistingImage ? `existingImage${index}.jpg` : `newImage${index}.jpg`), 
                });
            }
        });

        dispatch(editAdvertisement({ id, formData: data }))
            .then((response) => {
                if (response.meta.requestStatus === 'fulfilled') {
                    Alert.alert("Success", "Advertisement updated successfully.");
                    navigation.goBack();
                } else {
                    Alert.alert("Failed", `${response.error.message || 'An error occurred'}`);
                }
            })
            .catch((error) => {
                Alert.alert("Error", "Something went wrong.");
                console.error("Error:", error);
            });
    };

    const handleImagePick = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert("Permission Required", "You need to grant permissions to access the gallery.");
                return;
            }

            const options = {
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                allowsMultipleSelection: true,
            };

            const result = await ImagePicker.launchImageLibraryAsync(options);
            if (!result.canceled) {
                handleFileChange(result.assets);
            } else {
                Alert.alert("Cancelled", "Image selection was cancelled.");
            }
        } catch (error) {
            console.error("Image picker error:", error);
            Alert.alert("Error", "An error occurred while picking the image.");
        }
    };

    return (
        <ScrollView >
            <View style={{ padding: 15 }}>
                <TextInput
                    style={styles.input}
                    placeholder="Advertisement Title"
                    value={formData.adv}
                    onChangeText={(value) => handleChange('adv', value)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="User Name"
                    value={formData.userName}
                    onChangeText={(value) => handleChange('userName', value)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                    value={formData.phoneNumber}
                    onChangeText={(value) => handleChange('phoneNumber', value)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Block"
                    value={formData.details.block}
                    onChangeText={(value) => handleChange('details.block', value)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Flat Number"
                    value={formData.details.flat_No}
                    onChangeText={(value) => handleChange('details.flat_No', value)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Flat Area"
                    value={formData.details.flat_Area}
                    onChangeText={(value) => handleChange('details.flat_Area', value)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Washrooms"
                    value={formData.details.washrooms}
                    onChangeText={(value) => handleChange('details.washrooms', value)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Price"
                    value={formData.details.price}
                    onChangeText={(value) => handleChange('details.price', value)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Maintainance Price"
                    value={formData.details.maintainancePrice}
                    onChangeText={(value) => handleChange('details.maintainancePrice', value)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Parking Space"
                    value={formData.details.parkingSpace}
                    onChangeText={(value) => handleChange('details.parkingSpace', value)}
                />
            </View>
            <ScrollView horizontal style={{ flexDirection: 'row', marginBottom: 20, padding: 20 }}>
                {previewImages.map((image, index) => (
                    <View key={index} style={{ marginRight: 10 }}>
                        <View style={{ position: 'relative' }}>
                            <Image
                                source={{ uri: image.startsWith('/') ? `${ImagebaseURL}${image}` : image }}
                                style={{ width: 80, height: 80, borderRadius: 10 }}
                            />

                            <TouchableOpacity
                                onPress={() => handleRemoveImage(index)}
                                style={styles.removeIcon}
                            >
                                <Text style={{ color: '#fffdfc', fontWeight: 'bold' }}>X</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
            <View style={{ paddingLeft: 10, paddingRight: 10, }}>

                <TouchableOpacity onPress={handleImagePick} style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>Upload Images</Text>
                </TouchableOpacity>
            </View>
            <View style={{ marginTop: 10, marginBottom: 40, padding: 10 }}>
                <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>Update Advertisement</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = {
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
        borderRadius: 5,
    },
    submitButton: {
        backgroundColor: '#7d0431',
        padding: 10,
        borderRadius: 5,
    },
    submitButtonText: {
        color: 'white',
        textAlign: 'center',
        
    },
    removeIcon: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#f7e4e4',
        opacity: 0.8,
        borderRadius: 15,
        width: 25,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
        color: "#e0c9c8",

    },
};

export default EditAdd;
