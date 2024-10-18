import React, {  useState } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ScrollView, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useDispatch } from "react-redux";
import { editCommityMembers, fetchCommityMembers } from "../Profile/committeeSlice";
import { Avatar, Snackbar } from "react-native-paper";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { ImagebaseURL } from "../../../Security/helpers/axios";

const EditMember = ({ route }) => {
    const { member } = route.params;
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const [imageFile, setImageFile] = useState(member.pictures || null);
    const [newPicturesFile, setNewPicturesFile] = useState(null);
    const [name, setName] = useState(member.name);
    const [designation, setDesignation] = useState(member.designation);
    const [email, setEmail] = useState(member.email);
    const [phoneNumber, setPhoneNumber] = useState(member.phoneNumber);
    const [block, setBlock] = useState(member.blockNumber);
    const [flat, setFlat] = useState(member.flatNumber);
    const [snackVisible, setSnackVisible] = useState(false);
    const [snackMessage, setSnackMessage] = useState('');

    const selectImage = async () => {
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
            setNewPicturesFile(result.assets[0].uri); 
            setNewPicturesFile(result.assets[0]); 
        }
    };

    const handleSubmit = () => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('designation', designation);
        formData.append('email', email);
        formData.append('phoneNumber', phoneNumber);
        formData.append('block', block);
        formData.append('flat', flat);

        if (newPicturesFile) {
            const fileToUpload = {
                uri: newPicturesFile.uri,
                name: 'picture.jpg',
                type: 'image/jpeg',
            };
            formData.append('pictures', fileToUpload);
        }
        dispatch(editCommityMembers({ id: member._id, formData }))
            .then(response => {
                if (response.type === "editCommityMembers/fulfilled") {
                    setSnackMessage(`${response.payload.message}`);
                    setSnackVisible(true);
                    dispatch(fetchCommityMembers(member.societyId));
                    navigation.goBack();
                }
            })
            .catch(error => {
                setSnackMessage(error.message);
                setSnackVisible(true);
            });
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
            
                <View style={styles.avatarContainer}>
                    <Avatar.Image
                        size={120}
                        source={{ uri: newPicturesFile ? newPicturesFile : `${ImagebaseURL}${member.pictures}` }}
                        style={styles.avatar}
                    />
                    <TouchableOpacity style={styles.cameraButton} onPress={selectImage}>
                        <Ionicons name="camera" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
                <TextInput style={styles.input} placeholder="Designation" value={designation} onChangeText={setDesignation} />
                <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
                <TextInput style={styles.input} placeholder="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
                <TextInput style={styles.input} placeholder="Block" value={block} onChangeText={setBlock} />
                <TextInput style={styles.input} placeholder="Flat" value={flat} onChangeText={setFlat} />
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Update Member</Text>
                </TouchableOpacity>
            </View>
            <Snackbar
                visible={snackVisible}
                onDismiss={() => setSnackVisible(false)}
                duration={3000}
            >
                {snackMessage}
            </Snackbar>
        </View>
    );
};

export default EditMember;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContainer: {
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 100,
    },

    input: {
        height: 50,
        borderColor: '#BDBDBD',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 15,
        borderRadius: 5,
        backgroundColor: '#FFFFFF',
        elevation: 1,
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingBottom: 10,
        paddingTop: 10,
    },
    button: {
        backgroundColor: '#7d0431',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    avatarContainer: {
        alignSelf: 'center',
        marginBottom: 20,
        position: 'relative', // Needed for positioning camera button
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
