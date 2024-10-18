import React, { useEffect, useState } from "react";
import { StyleSheet, View, TextInput, Button, Image, TouchableOpacity, Text, ScrollView, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from "react-redux";
import { fetchSocietyById } from "../../../User/Redux/Slice/Security_Panel/SocietyByIdSlice";
import { createCommityMembers, fetchCommityMembers } from "../Profile/committeeSlice"; // Adjust the import path accordingly
import { Avatar, Snackbar } from "react-native-paper";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";

const AddMember = () => {
    const dispatch = useDispatch();
    const { society } = useSelector((state) => state.societyById);
    const [imageFile, setImageFile] = useState(null);
    const [name, setName] = useState("");
    const [designation, setDesignation] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [role, setRole] = useState("CommityMember");
    const societyId = "6683b57b073739a31e8350d0";
    const [showBlockMenu, setShowBlockMenu] = useState(false);
    const [showFlatMenu, setShowFlatMenu] = useState(false);
    const [block, setBlock] = useState('');
    const [flat, setFlat] = useState("");
    const [snackVisible, setSnackVisible] = useState(false); 
    const [snackMessage, setSnackMessage] = useState(''); 

    const [blockError, setBlockError] = useState('');
    const [flatNumberError, setFlatNumberError] = useState('');
    const navigation = useNavigation();
    useEffect(() => {
        if (societyId) {
            dispatch(fetchSocietyById(societyId));
        }
    }, [dispatch, societyId]);

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
            setImageFile(result.assets[0].uri);
            setImageFile(result.assets[0]);
        }
    };

    const toggleBlockMenu = () => {
        setShowBlockMenu(!showBlockMenu);
        if (showFlatMenu) setShowFlatMenu(false);
    };

    const toggleFlatMenu = () => {
        setShowFlatMenu(!showFlatMenu);
        if (showBlockMenu) setShowBlockMenu(false);
    };

    const blocksForSelectedSociety = society?.blocks || [];
    const flatsForSelectedBlock = blocksForSelectedSociety.find(b => b.blockName === block)?.flats || [];

    const handleSubmit = () => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('societyId', societyId);
        formData.append('designation', designation);
        formData.append('email', email);
        formData.append('phoneNumber', phoneNumber);
        formData.append('role', role);
        formData.append('blockNumber', block);
        formData.append('flatNumber', flat);

        if (imageFile) {
            const imageName = imageFile.uri.split('/').pop();
            const imageType = imageFile.uri.split('.').pop();

            formData.append('pictures', {
                uri: imageFile.uri,
                name: imageName,
                type: `image/${imageType}`,
            });
        }

        dispatch(createCommityMembers(formData))
            .then(response => {
                if (response.type === "createCommityMembers/fulfilled") {
                    console.log(response)
                    setSnackMessage(response.payload.message); 
                    navigation.navigate("Quick Contacts", { screen: "Committee Members" });
                    dispatch(fetchCommityMembers(societyId));
                    setSnackVisible(true);
                    setImageFile(null);
                    setName("");
                    setDesignation("");
                    setEmail("");
                    setPhoneNumber("");
                    setBlock("");
                    setFlat("");
                }
            })
            .catch(error => {
                setSnackMessage( error.message); 
                setSnackVisible(true);
            });
    };


    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.avatarContainer}>
                    <Avatar.Image
                        size={120}
                        source={
                            imageFile
                                ? { uri: imageFile }
                                : { uri: "https://thumbs.dreamstime.com/b/default-avatar-profile-trendy-style-social-media-user-icon-187599373.jpg" } // Fallback to a local image
                        }
                        style={styles.avatar}
                    />
                    <TouchableOpacity style={styles.cameraButton} onPress={selectImage}>
                        <Ionicons name="camera" size={20} color="white" />
                    </TouchableOpacity>
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Name"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Designation"
                    value={designation}
                    onChangeText={setDesignation}
                    autoCapitalize="words"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Role"
                    value={role}
                    editable={false}
                    onChangeText={setRole}
                    autoCapitalize="words"
                />
                <View style={styles.dropdownContainer}>
                    <TouchableOpacity
                        onPress={toggleBlockMenu}
                        style={[styles.dropdown, showBlockMenu && styles.dropdownActive]}
                        disabled={!society}
                    >
                        <Text>{block ? block : "Select Block"}</Text>
                    </TouchableOpacity>
                    {showBlockMenu && (
                        <View style={styles.menu}>
                            {blocksForSelectedSociety.map((item) => (
                                <TouchableOpacity
                                    key={item._id}
                                    onPress={() => {
                                        setBlock(item.blockName);
                                        setShowBlockMenu(false);
                                        setFlat("");
                                    }}
                                    style={styles.menuItem}
                                    disabled={!society}
                                >
                                    <Text>{item.blockName}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                    {blockError ? <Text style={styles.errorText}>{blockError}</Text> : null}
                </View>

                <View style={styles.dropdownContainer}>
                    <TouchableOpacity
                        onPress={toggleFlatMenu}
                        style={[styles.dropdown, showFlatMenu && styles.dropdownActive]}
                        disabled={!society}
                    >
                        <Text>{flat ? flat : "Select Flat"}</Text>
                    </TouchableOpacity>
                    {showFlatMenu && (
                        <ScrollView nestedScrollEnabled={true} style={styles.menu}>
                            {flatsForSelectedBlock.map((item) => (
                                <TouchableOpacity
                                    key={item._id}
                                    onPress={() => {
                                        setFlat(item.flatNumber);
                                        setShowFlatMenu(false);
                                    }}
                                    style={styles.menuItem}
                                    disabled={!society}
                                >
                                    <Text>{item.flatNumber}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                    {flatNumberError ? <Text style={styles.errorText}>{flatNumberError}</Text> : null}
                </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleSubmit}
                >
                    <Text style={styles.buttonText}>Add Member</Text>
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

export default AddMember;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContainer: {
        paddingHorizontal: 10,
        paddingTop: 10, paddingBottom: 100
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#4CAF50',
        marginBottom: 10,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#BDBDBD',
    },
    placeholderText: {
        color: '#757575',
        fontWeight: 'bold',
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
    dropdown: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#7D0431',
        borderRadius: 4,
        height: 50,
        justifyContent: "center",
        backgroundColor: '#fff',
    },
    dropdownActive: {
        backgroundColor: '#f1f1f1',

    },
    menu: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        marginTop: 5,
        backgroundColor: '#fff',
        position: 'absolute',
        zIndex: 999,
        top: 50,
        maxHeight: 70,
        width: '100%',
        fontSize: 15,
    },
    menuItem: {
        padding: 10,
    },
    dropdownContainer: {
        marginVertical: 5,
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingBottom: 10,
        paddingTop: 10
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
        position: 'relative',
    },
    avatar: {
        alignSelf: 'center',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: 50,
        padding: 5,
    },
});
