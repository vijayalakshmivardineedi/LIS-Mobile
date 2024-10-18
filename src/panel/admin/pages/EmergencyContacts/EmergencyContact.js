// EmergencyContact.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, ScrollView, Alert, TextInput, Image } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useDispatch, useSelector } from 'react-redux';
import { createEmergencyContact, deleteEmergencyContact, fetchEmergencyContacts, updateEmergencyContact } from '../../../User/Redux/Slice/CommunitySlice/EmergencyContactSlice';
import { deletecommityMembers, fetchCommityMembers } from '../Profile/committeeSlice';
import { ActivityIndicator, Avatar, FAB, IconButton, Snackbar } from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ImagebaseURL } from '../../../Security/helpers/axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Tab = createMaterialTopTabNavigator();

const ContactsTab = ({ fetchContacts, contacts, renderItem, snackbarVisible, setSnackbarVisible, snackbarMessage }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [societyId, setSocietyId] = useState('')
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
    const status =
        useFocusEffect(
            React.useCallback(() => {
                if (societyId) {
                    dispatch(fetchContacts(societyId));
                }
            }, [dispatch, fetchContacts, societyId])
        );
    if (status === "loading") {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7d0431" />
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <FlatList
                data={contacts}
                keyExtractor={item => item.id?.toString() || item._id?.toString()}
                renderItem={renderItem}
            />
            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => navigation.navigate("Add Committee Member")}
                color='white'
            />
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
};

const EmergencyContactsTab = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisible1, setModalVisible1] = useState(false);
    const [anchor, setAnchor] = useState(null);
    const dispatch = useDispatch();
    const contacts = useSelector(state => state.emergencyContacts.contacts);
    const { error } = useSelector(state => state.emergencyContacts);
    const [editContact, setEditContact] = useState({ name: '', profession: '', phoneNumber: '', serviceType: "" });
    const [newContact, setNewContact] = useState({ name: '', profession: '', phoneNumber: '', serviceType: "" });
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const handleMenuPress = (resident) => {
        setAnchor(anchor ? null : resident._id);
    };
    const handleCreateContact = async () => {
        const contactToCreate = { ...newContact, societyId };

        const result = await dispatch(createEmergencyContact(contactToCreate));

        if (result.type === "emergencyContacts/createContact/fulfilled") {
            console.log(result)
            setSnackbarMessage(`${result.payload.message}`);
            setSnackbarVisible(true);
            setNewContact({ name: '', profession: '', phoneNumber: '', serviceType: '' });
            setModalVisible(false);
            dispatch(fetchEmergencyContacts(societyId));
        } else {
            setSnackbarMessage(`${result.payload.message}`);
            setSnackbarVisible(true);
        }
    };
    const handleDelete = (id) => {
        Alert.alert(
            "Delete Member",
            "Are you sure you want to delete this member?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        const result = await dispatch(deleteEmergencyContact(id));
                        if (result.type === "emergencyContacts/deleteContact/fulfilled") {
                            setSnackbarMessage(`${result.payload.message}`);
                            setSnackbarVisible(true);
                            dispatch(fetchEmergencyContacts(societyId));
                        } else {
                            setSnackbarMessage('Failed to delete member.');
                            setSnackbarVisible(true);
                        }
                    }
                }
            ]
        );
    };
    const handleEditSubmit = async () => {
        const result = await dispatch(updateEmergencyContact({
            id: editContact._id,
            name: editContact.name,
            phoneNumber: editContact.phoneNumber,
            profession: editContact.profession,
            serviceType: editContact.serviceType,
            societyId
        }));
        if (result.type === "emergencyContacts/updateContact/fulfilled") {
            setSnackbarMessage(`${result.payload.message}`);
            setSnackbarVisible(true);
            setModalVisible1(false);
            dispatch(fetchEmergencyContacts(societyId));
        } else {
            setSnackbarMessage('Failed to update contact.');
            setSnackbarVisible(true);
        }
    };
    const renderContactItem = ({ item }) => (
        <View style={styles.contactCard}>
            {item || !error ? <View> <View style={styles.column}>
                <Text style={{ fontSize: 16, fontWeight: 600 }}>{item.name}</Text>
                <Text style={{ fontSize: 14, fontWeight: 400, color: "gray" }}>{item.profession}</Text>
                <Text>{item.phoneNumber}</Text>
            </View>
                <IconButton
                    icon="dots-vertical"
                    onPress={() => handleMenuPress(item)}
                    size={20}
                    style={styles.iconButton}
                /> </View> :
                <View style={styles.noDataContainer}>
                    <Image
                        source={require('../../../../assets/Admin/Imgaes/nodatadound.png')}
                        style={styles.noDataImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.noDataText}>No Amenities Found</Text>
                </View>
            }

            {anchor === item._id && (
                <ScrollView style={[styles.menuList, { top: 0 }]}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => {
                        setAnchor(null);
                        setEditContact(item);
                        setModalVisible1(true)
                    }}>
                        <Text>Edit</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.menuItem} onPress={() => {
                        setAnchor(null);

                        handleDelete(item._id)
                    }}>
                        <Text>Delete</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}
        </View>
    );


    return (
        <>
            <ContactsTab fetchContacts={fetchEmergencyContacts} contacts={contacts} renderItem={renderContactItem} snackbarVisible={snackbarVisible}
                setSnackbarVisible={setSnackbarVisible}
                snackbarMessage={snackbarMessage} />
            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => setModalVisible(true)}
                color='white'
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Emergency Contact</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#630000" />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            value={newContact.name}
                            onChangeText={(text) => setNewContact({ ...newContact, name: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Profession"
                            value={newContact.profession}
                            onChangeText={(text) => setNewContact({ ...newContact, profession: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Service Type"
                            value={newContact.serviceType}
                            onChangeText={(text) => setNewContact({ ...newContact, serviceType: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            value={newContact.phoneNumber}
                            keyboardType='numeric'
                            onChangeText={(text) => setNewContact({ ...newContact, phoneNumber: text })}
                        />
                        <TouchableOpacity style={styles.submitButton}
                            onPress={handleCreateContact}
                        >
                            <Text style={styles.submitButtonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible1}
                onRequestClose={() => setModalVisible1(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Emergency Contact</Text>
                            <TouchableOpacity onPress={() => setModalVisible1(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#630000" />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Name"
                            value={editContact.name}
                            onChangeText={(text) => setEditContact({ ...editContact, name: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Profession"
                            value={editContact.profession}
                            onChangeText={(text) => setEditContact({ ...editContact, profession: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Service Type"
                            value={editContact.serviceType}
                            onChangeText={(text) => setEditContact({ ...editContact, serviceType: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            value={editContact.phoneNumber}
                            keyboardType='numeric'
                            onChangeText={(text) => setEditContact({ ...editContact, phoneNumber: text })}
                        />
                        <TouchableOpacity style={styles.submitButton}
                            onPress={handleEditSubmit}
                        >
                            <Text style={styles.submitButtonText}>Update</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const CommitteeMembersTab = () => {
    const [anchor1, setAnchor1] = useState(null);
    const members = useSelector(state => state.commityMembers.commityMember || []);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const handleMenuPress1 = (resident) => {
        setAnchor1(anchor1 ? null : resident._id);
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Delete Member",
            "Are you sure you want to delete this member?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        const result = await dispatch(deletecommityMembers({ id }));
                        if (result.type === "deletecommityMembers/fulfilled") {
                            setSnackbarMessage(`${result.payload.message}`);
                            setSnackbarVisible(true);
                            dispatch(fetchCommityMembers(societyId));
                        } else {
                            setSnackbarMessage('Failed to delete member.');
                            setSnackbarVisible(true);
                        }
                    }
                }
            ]
        );
    };

    const renderContactItem = ({ item }) => (
        <View style={styles.contactCard}>
            <View style={styles.contactInfo}>
                <Avatar.Image
                    size={80}
                    source={
                        item.pictures
                            ? { uri: `${ImagebaseURL}${item.pictures}` }
                            : { uri: "https://thumbs.dreamstime.com/b/default-avatar-profile-trendy-style-social-media-user-icon-187599373.jpg" } // Fallback to a local image
                    }
                    style={{ backgroundColor: "#ddd" }}
                />
                <View style={styles.column}>
                    <Text style={{ fontSize: 16, fontWeight: 600 }}>{item.name}</Text>
                    <Text style={{ fontSize: 14, fontWeight: 400, color: "gray" }}>{item.designation}</Text>
                    <View style={styles.chipContainer}>
                        <View style={styles.chip}>
                            <Text style={styles.chipText}>{item.flatNumber}</Text>
                        </View>
                        <View style={styles.chip}>
                            <Text style={styles.chipText}>{item.blockNumber}</Text>
                        </View>
                    </View>
                    <Text>{item.phoneNumber}</Text>
                </View>

            </View>
            <IconButton
                icon="dots-vertical"
                onPress={() => handleMenuPress1(item)}
                size={20}
                style={styles.iconButton}
            />
            {anchor1 === item._id && (
                <ScrollView style={[styles.menuList, { top: 5 }]}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => {
                        setAnchor1(null);
                        navigation.navigate("Edit Committee Member", { member: item });
                    }}>
                        <Text>Edit</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            setAnchor1(null);
                            handleDelete(item._id)
                        }}
                    >
                        <Text>Delete</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}
        </View>
    );

    return (
        <ContactsTab
            fetchContacts={fetchCommityMembers}
            contacts={members}
            renderItem={renderContactItem}
            snackbarVisible={snackbarVisible}
            setSnackbarVisible={setSnackbarVisible}
            snackbarMessage={snackbarMessage}
        />
    );
};

const EmergencyContact = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#7d0431',
                tabBarLabelStyle: { fontSize: 14, fontWeight: 500 },
                tabBarStyle: { backgroundColor: '#ffffff' },
                tabBarIndicatorStyle: {
                    backgroundColor: '#7d0431',
                    height: 2,
                },
            }}
        >
            <Tab.Screen
                name="Contacts"
                component={EmergencyContactsTab}
            />
            <Tab.Screen
                name="Committee Members"
                component={CommitteeMembersTab}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    contactCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    contactInfo: {
        flexDirection: "row",
        gap: 10, alignItems: 'center'
    },
    column: {
        flexDirection: "column",
    },
    iconButton: {
        marginLeft: 10,
    },
    menuList: {
        position: 'absolute',
        right: 40,
        backgroundColor: '#fff',
        borderRadius: 5,
        elevation: 3,
        padding: 5,
        zIndex: 10,
        overflow: "visible",
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    menuItem: {
        padding: 10,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: "#7d0431",
        borderRadius: 50,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10
    },
    chip: {
        backgroundColor: '#e0e0e0',
        borderRadius: 16,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    chipText: {
        color: '#333',
        fontSize: 10,
        fontWeight: '500',
    },

    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#630000',
    },
    modalContent: {
        width: '100%',
        backgroundColor: 'white',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    input: {
        height: 50,
        borderColor: '#630000',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 20,
        width: '100%',
    },
    submitButton: {
        backgroundColor: '#630000',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataImage: {
        width: 150,
        height: 150,
        marginBottom: 16,
    },
    noDataText: {
        fontSize: 18,
        color: '#7d0431',
        textAlign: 'center',
    },
});

export default EmergencyContact;
