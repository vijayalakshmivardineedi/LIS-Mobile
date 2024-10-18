import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Image, Modal, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getOne, updatePaymentDetails } from './SocietyMaintainanceSlice';
import { ImagebaseURL } from '../../../Security/helpers/axios';
import { launchImageLibrary } from 'react-native-image-picker';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import * as ImagePicker from "expo-image-picker";
import { Picker } from '@react-native-picker/picker';

const EditAdminMaintaince = () => {
    const route = useRoute();
    const { blockno, flatno, monthAndYear } = route.params;
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { status, error } = useSelector((state) => state.adminMaintainance);
    const maintainance = useSelector(state => state.adminMaintainance.maintainances);
    const successMessage = useSelector(state => state.adminMaintainance.successMessage);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [showDialog, setShowDialog] = useState(false);
    const [societyId, setSocietyId] = useState("");
 
    useEffect(() => {
        const getSocietyAdmin = async () => {
          try {
            const storedAdmin = await AsyncStorage.getItem('user');
            if (storedAdmin) {
              const societyAdmin = JSON.parse(storedAdmin);
              setSocietyId(societyAdmin._id || "");
            }
          } catch (error) {
            console.error("Error retrieving society admin data:", error);
          }
        };
        getSocietyAdmin();
      }, []);
    const [previewImage, setPreviewImage] = useState('');
    const [formState, setFormState] = useState({
        societyId: societyId,
        userId: '',
        name: '',
        blockno: '',
        flatno: '',
        paidAmount: '',
        transactionType: 'Cash',
        status: 'Confirm', // Default status
        monthAndYear: monthAndYear,
        pictures: null,
    });

    // Available options for status
    const allOptions = [
        { label: "Confirm", value: "Confirm" },
        { label: "Pending", value: "Pending" },
        { label: "UnPaid", value: "UnPaid" },
        { label: "Paid", value: "Paid" },
    ];

    // Filtered options based on current status
    const filteredOptions = allOptions.filter(option => option.value !== formState.status);

    useEffect(() => {
        dispatch(getOne({ blockno, flatno, monthAndYear }));
    }, [dispatch, blockno, flatno, monthAndYear]);

    useEffect(() => {
        if (maintainance) {
            setFormState(prevState => ({
                ...prevState,
                userId: maintainance.userId || '',
                name: maintainance.name || '',
                blockno: maintainance.blockno || '',
                flatno: maintainance.flatno || '',
                paidAmount: maintainance.paidAmount || '',
                status: maintainance.status || 'Confirm', // Use the current status
                pictures: null,
            }));
            setPreviewImage(maintainance.pictures);
        }
    }, [maintainance]);

    const handleInputChange = (name, value) => {
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };

    const validateForm = () => {
        let tempErrors = {};
        tempErrors.userId = formState.userId ? "" : "User Id is required.";
        tempErrors.name = formState.name ? "" : "Name is required.";
        tempErrors.paidAmount = formState.paidAmount ? "" : "Amount is required.";
        tempErrors.monthAndYear = formState.monthAndYear ? "" : "Month and Year are required.";
        setErrors(tempErrors);
        return Object.values(tempErrors).every(x => x === "");
    };

    const handleSubmit = () => {
        if (validateForm()) {
            const { pictures, ...formData } = formState;
            const updateData = new FormData();

            for (const key in formData) {
                updateData.append(key, formData[key]);
            }

            if (pictures && pictures.uri) {
                updateData.append('pictures', {
                    uri: pictures.uri,
                    type: 'image/jpeg',
                    name: pictures.name || 'image.jpg',
                });
            }

            dispatch(updatePaymentDetails({ formData: updateData }))
                .then((response) => {
                    if (response.type === "maintainances/updatePaymentDetails/fulfilled") {
                        setShowDialog(true);
                        setSnackbarMessage('Maintenance bill updated successfully!');
                        setSnackbarVisible(true);
                        dispatch(getOne({ blockno, flatno, monthAndYear }));
                        setTimeout(() => {
                            setShowDialog(false);
                            navigation.goBack();
                        }, 2000);
                    } else {
                        setSnackbarMessage('Failed to update maintenance.');
                        setSnackbarVisible(true);
                    }
                })
                .catch(error => {
                    console.error("Error:", error.response ? error.response.data : error.message);
                    setSnackbarMessage('An error occurred. Please try again.');
                    setSnackbarVisible(true);
                });
        }
    };

    const handleFileChange = (selectedImages) => {
        if (!selectedImages || selectedImages.length === 0) {
            Alert.alert("No Images Selected", "Please select an image.");
            return;
        }

        const newPicture = {
            uri: selectedImages[0].uri,
            type: selectedImages[0].type,
            fileName: selectedImages[0].fileName,
        };

        setPreviewImage(newPicture.uri);
        setFormState(prevData => ({
            ...prevData,
            pictures: newPicture,
        }));
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
            if (!result.canceled && result.assets) {
                handleFileChange(result.assets);
            } else {
                Alert.alert("Cancelled", "Image selection was cancelled.");
            }
        } catch (error) {
            console.error("Image picker error:", error);
            Alert.alert("Error", "An error occurred while picking the image.");
        }
    };

    if (status === "loading") {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7d0431" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <View style={{ flex: 1, padding: 20 }}>

                    <View style={{ marginBottom: 20 }}>

                        {previewImage ? (
                            <Image
                                source={{ uri: previewImage.startsWith('file:') ? previewImage : `${ImagebaseURL}${previewImage}` }}
                                style={{ width: '100%', height: 200, borderRadius: 10, marginTop: 10 }}
                            />
                        ) : null}
                        <TouchableOpacity onPress={handleImagePick}>
                            <View style={{ marginTop: 10 }}>
                                <Button onPress={handleImagePick} title="Upload Image" color="#630000" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        placeholder="User Id"
                        value={formState.userId}
                        onChangeText={(text) => handleInputChange('userId', text)}
                        style={styles.input}
                    />
                    {errors.userId && <Text style={{ color: 'red' }}>{errors.userId}</Text>}
                    <TextInput
                        placeholder="Name"
                        value={formState.name}
                        onChangeText={(text) => handleInputChange('name', text)}
                        style={styles.input}
                    />
                    {errors.name && <Text style={{ color: 'red' }}>{errors.name}</Text>}
                    <TextInput
                        placeholder="Month And Year"
                        value={formState.monthAndYear}
                        onChangeText={(text) => handleInputChange('monthAndYear', text)}
                        style={styles.input}
                        editable={false}
                    />
                    {errors.monthAndYear && <Text style={{ color: 'red' }}>{errors.monthAndYear}</Text>}
                    <TextInput
                        placeholder="Block-No"
                        value={formState.blockno}
                        onChangeText={(text) => handleInputChange('blockno', text)}
                        style={styles.input}
                        editable={false}
                    />
                    <TextInput
                        placeholder="Flat-No"
                        value={formState.flatno}
                        onChangeText={(text) => handleInputChange('flatno', text)}
                        style={styles.input}
                        editable={false}
                    />
                    <TextInput
                        placeholder="Paid Amount"
                        value={formState.paidAmount}
                        onChangeText={(text) => handleInputChange('paidAmount', text)}
                        style={styles.input}
                    />
                    {errors.paidAmount && <Text style={{ color: 'red' }}>{errors.paidAmount}</Text>}

                    {/* Picker for status */}
                    <Text style={{ marginVertical: 10 }}>Status</Text>
                    <View style={styles.picker}>
                        <Picker
                            selectedValue={formState.status}
                            onValueChange={(itemValue) => handleInputChange('status', itemValue)}

                        >
                            <Picker.Item label="UnPaid" value="UnPaid" />
                            <Picker.Item label="Paid" value="Paid" />
                            <Picker.Item label="Confirm" value="Confirm" />
                            <Picker.Item label="Pending" value="Pending" />
                        </Picker>
                    </View >
                    <View style={{ marginTop: 20 }}>
                        <Button title="Submit" onPress={handleSubmit} color="#630000" />
                    </View>
                </View>

                {/* Snackbar for feedback */}
                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                    style={styles.snackbar}
                >
                    {snackbarMessage}
                </Snackbar>

                {/* Modal for dialog */}
                <Modal visible={showDialog} animationType="slide" transparent={true}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>Maintenance bill updated successfully!</Text>
                            <Button title="Close" onPress={() => setShowDialog(false)} color="#630000" />
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    snackbar: {
        backgroundColor: '#630000',
        borderRadius: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
    },
    modalText: {
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    picker: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    container: {
        padding: 0,
    },
    scrollViewContainer: {
        paddingBottom: 40,
    },
});

export default EditAdminMaintaince;
