import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Avatar, Snackbar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { EditUserProfile } from '../../../User/Redux/Slice/ProfileSlice/EditProfileSlice';
import { Ionicons } from '@expo/vector-icons';
import { ImagebaseURL } from '../../../Security/helpers/axios';
import { useNavigation } from '@react-navigation/native';
import { fetchUsers } from './ResidentsSlice';

const EditResidents = ({ route }) => {
    const { resident } = route.params;
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { users } = useSelector((state) => state.AdminResidents);

    // Initialize state for resident details
    const [name, setName] = useState('');
    const [photo, setPhoto] = useState('');
    const [phone, setPhone] = useState('');
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [email, setEmail] = useState('');
    const [block, setBlock] = useState('');
    const [flat, setFlat] = useState('');
    const [apartment, setApartment] = useState('');
    const [imageUri, setImageUri] = useState(null); // State to hold image URI
    const [snackbarVisible, setSnackbarVisible] = useState(false); // State for Snackbar visibility

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    useEffect(() => {
        const foundResident = users.find(user => user._id === resident._id);
        if (foundResident) {
            setName(foundResident.name);
            setPhoto(foundResident.profilePicture);
            setPhone(foundResident.mobileNumber);
            setEmail(foundResident.email);
            setBlock(foundResident.buildingName);
            setFlat(foundResident.flatNumber);
            setApartment(foundResident.societyName);
            setImageUri(foundResident.profilePicture ? `${ImagebaseURL}${foundResident.profilePicture}` : null); // Set image URI for Avatar
        }
    }, [users, resident._id]);

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
            setPhoto(result.assets[0]);
        }
    };

   const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('mobileNumber', phone);
    formData.append('email', email);
    formData.append('block', block);
    formData.append('flat', flat);
    formData.append('apartment', apartment);

    // Only append the image if it was changed
    if (imageUri) {
        formData.append('profilePicture', {
            uri: imageUri,
            name: `profile-${Date.now()}.jpeg`,
            type: 'image/jpeg',
        });
    }
    const updatedResident = { formData, id: resident._id };

    try {
        const response = await dispatch(EditUserProfile(updatedResident));
        console.log(response); // Log the response

        if (response.type === "profiles/EditUserProfile/fulfilled") {
            setSnackbarMessage(`${response.payload.message}`);
            setSnackbarVisible(true);
            dispatch(fetchUsers());
            setTimeout(() => {
                navigation.navigate('Residential Management');
            }, 2000);
        }
    } catch (error) {
        console.error('Error during profile update:', error);
        setSnackbarMessage(`Error: ${error.message}`);
        setSnackbarVisible(true);
    }
};


    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <View style={styles.avatarContainer}>
                <Avatar.Image
                    size={120}
                    source={imageUri ? { uri: imageUri } : { uri: `${ImagebaseURL}${resident.profilePicture}` }}
                    style={styles.avatar}
                />
                <TouchableOpacity style={styles.cameraButton} onPress={handleImagePick}>
                    <Ionicons name="camera" size={20} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    label="Name"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    mode="outlined"
                />
                <TextInput
                    label="Phone"
                    value={phone}
                    onChangeText={setPhone}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="phone-pad"
                />
                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="email-address"
                    disabled={true}
                />
                <TextInput
                    label="Block"
                    value={block}
                    onChangeText={setBlock}
                    style={styles.input}
                    mode="outlined"
                    disabled={true}
                />
                <TextInput
                    label="Flat"
                    value={flat}
                    onChangeText={setFlat}
                    style={styles.input}
                    mode="outlined"
                    disabled={true}
                />
                <TextInput
                    label="Apartment"
                    value={apartment}
                    onChangeText={setApartment}
                    style={styles.input}
                    mode="outlined"
                    disabled={true}
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                action={{
                    label: 'OK',
                    onPress: () => {
                        setSnackbarVisible(false);
                    },
                }}
            >
                {snackbarMessage}
            </Snackbar>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between', // Ensure space between items
    },
    avatarContainer: {
        alignSelf: 'center',
        marginBottom: 20,
        position: 'relative',
        // Needed for positioning camera button
    },
    avatar: {
        alignSelf: 'center',
         backgroundColor:"#ccc",
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Your primary color
        borderRadius: 50,
        padding: 5,
    },
    inputContainer: {
        flex: 1, // Take remaining space for inputs
    },
    input: {
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#7d0431', // Your primary color
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff', // Text color
        fontSize: 16,
        fontWeight: '500',
    },
});

export default EditResidents;
