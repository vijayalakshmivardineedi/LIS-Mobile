import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    StyleSheet,
    Alert,
    ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { deleteServicePerson, fetchAllServiceTypes } from './ServicesSlice';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { ImagebaseURL } from '../../../Security/helpers/axios';
import { Modal, Snackbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
const ServicesList = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const route = useRoute();
    const { serviceType } = route.params;
    const [societyId, setSocietyId] = useState("");
    const staff = useSelector((state) => state.staff.data);
    const [anchor, setAnchor] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedservicePerson, setSelectedservicePerson] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [snackbarVisible, setSnackbarVisible] = useState(false); // Snackbar visibility state
    const [snackbarMessage, setSnackbarMessage] = useState(''); // Snackbar message state
    useEffect(() => {
        const getUserName = async () => {
            try {
                const userString = await AsyncStorage.getItem("user");
                const societyAdmin = await AsyncStorage.getItem('user');
                const parsedAdmin = societyAdmin ? JSON.parse(societyAdmin) : {};
                setSocietyId(parsedAdmin._id || "");
                if (userString !== null) {
                    const user = JSON.parse(userString);
                    setSocietyId(user.societyId);
                }
            } catch (error) {
                console.error("Failed to fetch the user from async storage", error);
            }
        };
        getUserName();
    }, []);
    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                setLoading(true);
                await dispatch(fetchAllServiceTypes(serviceType));
                setLoading(false);
            };

            fetchData();
            return () => {
            };
        }, [dispatch, serviceType])
    );

    const filteredStaff = Array.isArray(staff) ? staff.filter((member) => {
        const name = member.name ? member.name : '';
        const email = member.email ? member.email : '';
        return (
            name.toLowerCase().includes(searchText.toLowerCase()) ||
            email.toLowerCase().includes(searchText.toLowerCase())
        );
    }) : [];

    const handleDelete = () => {
        if (selectedservicePerson) {
            Alert.alert(
                "Confirm Delete",
                `Are you sure you want to delete this ${selectedservicePerson.name}?`,
                [
                    {
                        text: "Cancel",
                        style: "cancel"
                    },
                    {
                        text: "Yes",
                        onPress: () => {
                            setLoading(true); // Set loading to true before deleting
                            dispatch(deleteServicePerson({ userid: selectedservicePerson.userid, serviceType, societyId }))
                                .then((response) => {
                                    setAnchor(false);
                                    if (response.type === "user/deleteServicePerson/fulfilled") {
                                        setSnackbarMessage(`${response.payload.message}`);
                                        setSnackbarVisible(true);
                                        // Fetch service types again after successful deletion
                                        dispatch(fetchAllServiceTypes(serviceType)).finally(() => {
                                            setLoading(false); // Set loading to false after fetch is complete
                                        });
                                    } else {
                                        setSnackbarMessage("Error deleting service person.");
                                        setSnackbarVisible(true);
                                        setLoading(false); // Set loading to false if deletion fails
                                    }
                                });
                        }
                    }
                ]
            );
        }
    };

    const handleEdit = (userId) => {
        setSelectedservicePerson(userId);
        console.log(selectedservicePerson)
        navigation.navigate('Edit Service', { userid: selectedservicePerson.userid, serviceType })
        setAnchor(anchor ? null : userId._id);
    };

    const handleMenuPress = (userId) => {
        setSelectedservicePerson(userId);
        setAnchor(anchor ? null : userId._id);
    };
    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handlePress(item)} style={styles.row}>
            <Image
                source={{ uri: item.image ? item.image : `${ImagebaseURL}${item.pictures}` }}
                style={styles.image}
            />
            <View style={styles.details}>
                <Text style={styles.name}>{item.name}</Text>
                <Text>{item.phoneNumber}</Text>
                <Text>{item.userid}</Text>
            </View>
            <TouchableOpacity onPress={() => handleMenuPress(item)}>
                <Icon name="more-vert" size={20} color="#424242" />
            </TouchableOpacity>
            {anchor === item._id && (
                <ScrollView style={[styles.menuList, { top: 3 }]}>
                    <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
                        <Text>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete} style={styles.menuItem}>
                        <Text>Delete</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}
        </TouchableOpacity>
    );
    const handlePress = (item) => {
        setSelectedservicePerson(item);
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#7d0431" />
            ) : (
                <>
                    <Text style={styles.header}>{serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}</Text>
                    <FlatList
                        data={filteredStaff}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.userid}
                    />
                </>
            )}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    {selectedservicePerson && (
                        <View style={styles.modalContent}>
                            <View style={styles.rowContainer}>
                                {/* Profile Picture */}
                                <Image
                                    source={{ uri: `${ImagebaseURL}${selectedservicePerson.pictures}` }}
                                    style={styles.profileImage}
                                />

                                {/* Name and Contact in a column */}
                                <View style={styles.detailsContainer}>
                                    <Text style={styles.modalTitle}>{selectedservicePerson.name}</Text>
                                    <View style={styles.contactContainer}>
                                        <Icon name="phone" size={16} color="#777" />
                                        <Text style={styles.modalText}>{selectedservicePerson.phoneNumber}</Text>
                                    </View>
                                    <View style={styles.contactContainer}>
                                        <Icon name="home" size={16} color="#777" />
                                        <Text style={styles.modalText}>{selectedservicePerson.address}</Text>
                                    </View>
                                </View>
                            </View>

                            {selectedservicePerson.timings && selectedservicePerson.timings.length > 0 && (
                                <>
                                    <View style={styles.divider} />
                                    {/* Timings */}
                                    <Text style={styles.modalText}>Available Timings</Text>
                                    {selectedservicePerson.timings.map((time, index) => (
                                        <Text key={index} style={styles.modalTextSmall}>
                                            {time}
                                        </Text>
                                    ))}
                                </>
                            )}

                            {/* Flats/Blocks Info */}
                            {selectedservicePerson.list && selectedservicePerson.list.length > 0 && (
                                <>
                                    <View style={styles.divider} />
                                    <Text style={styles.modalText}>Work In</Text>
                                    {selectedservicePerson.list.map((item) => (
                                        <Text key={item._id} style={styles.modalTextSmall}>
                                            {item.Block}, Flat: {item.flatNumber}
                                        </Text>
                                    ))}
                                </>
                            )}

                            {/* QR Image */}
                            <Image
                                source={{ uri: `${ImagebaseURL}${selectedservicePerson.qrImages}` }}
                                style={styles.qrImage}
                            />

                            {/* Close Button */}
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButtonContainer}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Modal>


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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 10,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#630000',
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    divider: {
        marginTop: 10,
        borderBottomColor: "#ccc",
        borderBottomWidth: 1, marginBottom: 10
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
        backgroundColor: "#f6f6f6"
    },
    details: {
        flex: 1,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    menuItem: {
        padding: 7,
    },
    menuList: {
        position: 'absolute',
        right: 35,
        backgroundColor: '#fff',
        borderRadius: 5,
        elevation: 3,
        padding: 2,
        zIndex: 10,
        overflow: 'hidden',
        marginBottom: 50
    },
    modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 20,
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 15,
    },
    detailsContainer: {
        flex: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    modalText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 2,
    },
    modalTextSmall: {
        fontSize: 14,
        color: '#777',
        alignItems: "center"
    },
    qrImage: {
        width: 100,
        height: 100,
        marginTop: 20,
        marginBottom: 15,
        alignSelf: "center"

    },
    closeButtonContainer: {
        backgroundColor: '#7d0431',
        paddingVertical: 8,
        paddingHorizontal: 25,
        borderRadius: 20,
        marginTop: 15,
        alignSelf: "center"
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    contactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5, // Space between each contact item
    },
});

export default ServicesList;
