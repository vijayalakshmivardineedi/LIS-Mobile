import React, { useEffect, useState } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, Modal, StyleSheet, TextInput, Image, ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createMaintenanceRecords, getByMonthAndYear } from './SocietyMaintainanceSlice';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ImagebaseURL } from '../../../Security/helpers/axios';
import { FAB, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Maintenance = ({ navigation }) => {
    const dispatch = useDispatch();
    const { status, } = useSelector((state) => state.adminMaintainance);
    const maintainances = useSelector((state) => state.adminMaintainance.maintainances) || [];
    const [date, setDate] = useState(new Date());
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [selectedMenuId, setSelectedMenuId] = useState(null);
    const [fabModalVisible, setFabModalVisible] = useState(false)
    const [societyId, setSocietyId] = useState("");

    useEffect(() => {
        const getSocietyAdmin = async () => {
            try {
                const storedAdmin = await AsyncStorage.getItem('user');
                if (storedAdmin) {
                    const societyAdmin = JSON.parse(storedAdmin);
                    if (societyAdmin?._id) {
                        setSocietyId(societyAdmin._id || "");
                        setInventoryData(prev => ({ ...prev, societyId: societyAdmin?._id }))
                    }

                }
            } catch (error) {
                console.error("Error retrieving society admin data:", error);
            }
        };
        getSocietyAdmin();
    }, []);
    const [inventoryData, setInventoryData] = useState({
        societyId: "",
        amount: '',
        monthAndYear: ''
    });
    const DateAndMonth = (dateStr) => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    useFocusEffect(
        React.useCallback(() => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            dispatch(getByMonthAndYear(`${year}-${month}`));
            setModalVisible(false)
            setSelectedMenuId(null)
        }, [dispatch, date])
    );

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedUser(null);
    };

    const handleMenuClick = (userId) => {
        setSelectedMenuId(userId === selectedMenuId ? null : userId);
    };

    const filteredMaintainances = maintainances?.paymentDetails?.filter((item) => {
        const name = item.name?.toLowerCase() || '';
        return name.includes(searchText.toLowerCase());
    });

    const onDateChange = (event, selectedDate) => {
        if (selectedDate) {
            setDate(selectedDate);
            setShowPicker(false);
        }

    };
    const handleChange = (name, value) => {
        setInventoryData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    const [selectedDate, setSelectedDate] = useState(new Date()); // State for selected date

    const onDateAddChange = (event, date) => {
        if (date) {
            setSelectedDate(date);
            const month = date.getMonth() + 1; // Month is 0-indexed
            const year = date.getFullYear();
            handleChange('monthAndYear', `${year}-${month < 10 ? `0${month}` : month}`); // Format as YYYY-MM
            setShowPicker(false);
        }
    };
    const handleBillSubmit = async () => {
        if (!inventoryData.amount || !inventoryData.monthAndYear || !inventoryData.societyId) {
            setSnackbarMessage("Please fill out all fields");
            setSnackbarVisible(true);
            setFabModalVisible(false)
            return;
        }
        try {
            const response = await dispatch(createMaintenanceRecords(inventoryData));
            if (response.type === 'maintainances/createMaintenanceRecords/fulfilled') {
                setSnackbarMessage(`${response.payload.message}`);
                setSnackbarVisible(true);
                setFabModalVisible(false);
                dispatch(getByMonthAndYear(`${inventoryData.monthAndYear}`));
                setTimeout(() => {
                    setInventoryData({
                        societyId: "",
                        amount: '',
                        monthAndYear: '',
                    });
                }, 2000);

            } else if (response.error) {
                setSnackbarMessage(`Failed to add inventory: ${response.error.message}`);
                setSnackbarVisible(true);
            }
        } catch (error) {
            console.error("Error:", error);
            setSnackbarMessage(`Error: ${error.message || 'Something went wrong'}`);
            setSnackbarVisible(true);
        }
    };
    const renderMenu = (item) => {
        if (selectedMenuId !== item._id) return null;
        return (
            <View style={styles.menu}>
                <TouchableOpacity onPress={() => navigation.navigate("Edit Maintenance", { blockno: item.blockno, flatno: item.flatno, monthAndYear: maintainances.monthAndYear, })}>
                    <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
            </View>
        );
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
            <TextInput
                style={styles.input}
                placeholder="Enter name to search"
                value={searchText}
                onChangeText={setSearchText}
            />
            <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
                <Text style={styles.dateButtonText}>Select Month and Year</Text>
            </TouchableOpacity>
            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}

                />
            )}
            {!maintainances || !maintainances.paymentDetails || maintainances.paymentDetails.length === 0 ? (
                <View style={styles.noDataContainer}>
                    <Image
                        source={require('../../../../assets/Admin/Imgaes/nodatadound.png')}
                        style={styles.noDataImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.noDataText}>No Bills Found in this</Text>
                </View>
            ) : filteredMaintainances.length === 0 ? (
                <View style={styles.noDataContainer}>
                    <Image
                        source={require('../../../../assets/Admin/Imgaes/nodatadound.png')}
                        style={styles.noDataImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.noDataText}>No Bills Found for the Selected Month</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredMaintainances}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleViewDetails(item)}>
                            <View style={styles.itemContainer}>
                                <View style={styles.infoContainer}>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.label}>Month</Text>
                                        <Text style={styles.value}>: {DateAndMonth(maintainances.monthAndYear)}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.label}>Name</Text>
                                        <Text style={styles.value}>: {item.name}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={styles.label}>Details</Text>
                                        <Text style={styles.value}>: {item.blockno}/ {item.flatno}</Text>
                                    </View>
                                    {item.status === "Paid" ? "" : <View style={styles.infoRow}>
                                        <Text style={styles.label}>Status</Text>
                                        <Text style={styles.value}>: {item.status}</Text>
                                    </View>}
                                </View>
                                <TouchableOpacity style={styles.menuIcon} onPress={() => handleMenuClick(item._id)}>
                                    <Icon name="ellipsis-vertical" size={24} color="#630000" />
                                </TouchableOpacity>
                                {renderMenu(item)}
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
            <FAB
                style={styles.fab}
                icon="plus"
                color='#fff'
                onPress={() => setFabModalVisible(true)}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={fabModalVisible}
                onRequestClose={() => setFabModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add Bill</Text>
                            <TouchableOpacity onPress={() => setFabModalVisible(false)}>
                                <MaterialCommunityIcons name="close" size={24} color="#630000" />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Amount"
                            value={inventoryData.amount}
                            keyboardType="numeric"
                            onChangeText={(value) => handleChange("amount", value)}
                        />
                        <TouchableOpacity
                            style={styles.inputDatePicker}
                            onPress={() => setShowPicker(true)}
                        >
                            <Text style={styles.datePickerText}>
                                {inventoryData.monthAndYear || 'Select Month and Year'}
                            </Text>
                        </TouchableOpacity>
                        {showPicker && (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="default"
                                onChange={onDateAddChange}
                            />
                        )}
                        <TouchableOpacity style={styles.submitButton} onPress={handleBillSubmit}>
                            <Text style={styles.submitButtonText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {selectedUser && (
                <Modal visible={modalVisible} animationType="slide" transparent={true}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            {console.log(`${ImagebaseURL}${selectedUser.pictures}`)}
                            <Image source={{ uri: `${ImagebaseURL}${selectedUser.pictures}` }} alt='No Bill Updated' style={styles.modalImage} resizeMode="cover" />
                            <View style={styles.infoContainer}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Name</Text>
                                    <Text style={styles.value}>: {selectedUser.name || "---"}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Block</Text>
                                    <Text style={styles.value}>: {selectedUser.blockno || "---"}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Flat No</Text>
                                    <Text style={styles.value}>: {selectedUser.flatno || "---"}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>TX Mode</Text>
                                    <Text style={styles.value}>: {selectedUser.transactionType || "---"}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Amount</Text>
                                    <Text style={styles.value}>: {selectedUser.amount || "---"}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Paid Date</Text>
                                    <Text style={styles.value}>: {selectedUser.payedOn ? new Date(selectedUser.payedOn).toLocaleDateString() : "---"}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Time</Text>
                                    <Text style={styles.value}>: {selectedUser.payedOn ? new Date(selectedUser.payedOn).toLocaleTimeString() : "---"}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>Status</Text>
                                    <Text style={styles.value}>: {selectedUser.status || "---"}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                action={{
                    label: 'Close',
                    onPress: () => {
                        setSnackbarVisible(false);
                    },
                }}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    itemContainer: {
        padding: 15,
        backgroundColor: '#f9f9f9',
        marginBottom: 10,
        borderRadius: 5,
        position: 'relative',
    },
    menu: {
        position: "absolute",
        top: 0,
        right: 40,
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        padding: 2,
    },
    actionText: {
        paddingVertical: 7,
        paddingHorizontal: 10,
        fontSize: 16,
        color: "#222"
    },
    addButton: {
        backgroundColor: '#7d0431',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 16
    },
    addButtonText: {
        color: '#fff'
    },
    dateButton: {
        backgroundColor: '#7d0431',
        padding: 10,
        borderRadius: 5,
        marginBottom: 16
    },
    dateButtonText: {
        color: '#fff',
        textAlign: 'center'
    },
    menuIcon: {
        position: 'absolute',
        top: 15,
        right: 15,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 15,
    },
    modalText: {
        fontSize: 16,
        marginVertical: 5,
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: '#630000',
        padding: 10,
        borderRadius: 5,
        width: 80,
        height: 40
    },
    closeButtonText: {
        color: '#fff',
        textAlign: 'center',
    },
    closeIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    infoContainer: {
        width: '100%',
        marginTop: 15,
        alignItems: "center"
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 2,
    },
    label: {
        fontWeight: '500',
        width: '30%',
        color: "#222"
    },
    value: {
        width: '70%',
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
        padding: 20,
    },
    noDataImage: {
        width: 150,
        height: 150,
        alignItems: "center",
    },
    noDataText: {
        fontSize: 16,
        color: '#7D0431',
        fontWeight: '700',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#7d0431',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
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
    inputDatePicker: {
        height: 50,
        borderColor: '#630000',
        borderWidth: 1,
        borderRadius: 5,
        padding: 15,
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
    datePickerText: {
        color: "#757573",
    }
});

export default Maintenance;
