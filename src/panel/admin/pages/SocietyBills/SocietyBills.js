import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    Linking,
    ActivityIndicator,
    TouchableOpacity,
    Image,
} from 'react-native';
import {
    Card,
    Dialog,
    Paragraph,
    Text,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { deleteBill, fetchBillsBySocietyId } from './SocietyBillsSlice';
import { ImagebaseURL } from '../../../Security/helpers/axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';

const SocietyBills = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { status, error, successMessage } = useSelector((state) => state.adminSocietyBills);
    const bills = useSelector((state) => Array.isArray(state.adminSocietyBills.bills) ? state.adminSocietyBills.bills : []);
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogVisible, setDialogVisible] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [actionMenuVisible, setActionMenuVisible] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            dispatch(fetchBillsBySocietyId());
        }, [dispatch])
    );
    useFocusEffect(
        React.useCallback(() => {
            setActionMenuVisible(null);
        }, [])
    );

    useEffect(() => {
        if (successMessage) {
            setShowSuccessDialog(true);
            setTimeout(() => {
                setShowSuccessDialog(false);
            }, 2000);
        }
    }, [successMessage]);

    const handleView = (bill) => {
        setSelectedBill(bill);
        setDialogVisible(true);
    };

    const handleEdit = (bill) => {
        if (bill) {
            setActionMenuVisible(null);
            navigation.navigate('Edit Society Bills', { id: bill._id });
        }
    };

    const handleDelete = (bill) => {
        setSelectedBill(bill);
        setActionMenuVisible(null);
        setModalVisible(true);
    };

    const confirmDelete = () => {
        if (selectedBill) {
            dispatch(deleteBill({ id: selectedBill._id }))
                .then(() => {
                    Toast.show({
                        text1: 'Deleted',
                        text2: 'Bill deleted successfully!',
                        type: 'success',
                    });
                    setTimeout(() => {
                        dispatch(fetchBillsBySocietyId());
                    }, 1500);
                })
                .catch((error) => {
                    console.error('Error:', error);
                    Toast.show({
                        text1: 'Error',
                        text2: 'Failed to delete the bill.',
                        type: 'error',
                    });
                });
            setSelectedBill(null);
            setModalVisible(false);
        }
    };

    const filteredBills = bills.filter((bill) => {
        const { sender = '', Subject = '', Description = '', Date = '', Status = '' } = bill;
        return (
            sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
            Subject.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
            Description.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
            Date.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (Status && Status.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).replace(',', '');
    };

    const renderItem = ({ item }) => (
        <Card style={styles.card} onPress={() => handleView(item)}>
            <View style={styles.titleContainer}>
                <Text style={styles.cardTitle}>{item.name}</Text>

                <TouchableOpacity
                    onPress={() => setActionMenuVisible(actionMenuVisible === item._id ? null : item._id)}
                    style={styles.dotsButton}
                >
                    <Icon name="more-vert" size={24} color="#7D0431" />
                </TouchableOpacity>

                {actionMenuVisible === item._id && (
                    <View style={styles.actionMenu}>
                        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.menuButton}>
                            <Text style={styles.buttonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.menuButton}>
                            <Text style={[styles.buttonText, { color: "#7D0431" }]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <Card.Content>
                <View style={styles.details}>
                    <Text style={styles.detailLabel}>Month & Year:</Text>
                    <Text style={styles.detailValue}>{item.monthAndYear}</Text>
                </View>
                <View style={styles.details}>
                    <Text style={styles.detailLabel}>Amount:</Text>
                    <Text style={styles.detailValue}>{item.amount}</Text>
                </View>
                <View style={styles.details}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <Text style={styles.detailValue}>{item.status}</Text>
                </View>
                <View style={styles.details}>
                    <Text style={styles.detailLabel}>Date:</Text>
                    <Text style={styles.detailValue}>{formatDate(item.date)}</Text>
                </View>
                {item.pictures ? (
                    <TouchableOpacity
                        style={styles.downloadButton}
                        onPress={() => Linking.openURL(`${ImagebaseURL}${item.pictures}`)}
                    >
                        <Icon name="file-download" size={20} color="#7D0431" />
                        <Text style={styles.downloadText}>Download Document</Text>
                    </TouchableOpacity>
                ) : (
                    <Text>No Document</Text>
                )}
            </Card.Content>
        </Card>
    );
    if (status === "loading") { // Show spinner while loading
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7d0431" />
            </View>
        );
    }
    if (status === 'failed') {
        return (
            <View style={styles.noDataContainer}>
                <Image
                    source={require('../../../../assets/Admin/Imgaes/nodatadound.png')}
                    style={styles.noDataImage}
                    resizeMode="contain"
                />
                <Text style={styles.noDataText}>No visitors Found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {filteredBills?.length !== 0 ?
                <FlatList
                    data={filteredBills}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}

                />
                : <View style={styles.noDataContainer}>
                    <Image
                        source={require('../../../../assets/Admin/Imgaes/nodatadound.png')}
                        style={styles.noDataImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.noDataText}>No visitors Found</Text>
                </View>}


            <Dialog
                visible={dialogVisible}
                onDismiss={() => setDialogVisible(false)}
            >
                <Dialog.Title style={styles.dialogTitle}>Details</Dialog.Title>
                <Dialog.Content>
                    {selectedBill ? (
                        <>
                            <View style={styles.selectDetails}>
                                <Text style={styles.selectDetailLabel}>ID</Text>
                                <Text style={styles.selectDetailValue}>{selectedBill._id}</Text>
                            </View>
                            <View style={styles.selectDetails}>
                                <Text style={styles.selectDetailLabel}>Bill</Text>
                                <Text style={styles.selectDetailValue}>{selectedBill.name}</Text>
                            </View>
                            <View style={styles.selectDetails}>
                                <Text style={styles.selectDetailLabel}>Amount</Text>
                                <Text style={styles.selectDetailValue}>{selectedBill.amount}</Text>
                            </View>
                            <View style={styles.selectDetails}>
                                <Text style={styles.selectDetailLabel}>Date</Text>
                                <Text style={styles.selectDetailValue}>{formatDate(selectedBill.date)}</Text>
                            </View>
                        </>
                    ) : (
                        <Paragraph>No details available.</Paragraph>
                    )}
                </Dialog.Content>
                <Dialog.Actions>
                    <TouchableOpacity
                        style={styles.dialogButton}
                        onPress={() => setDialogVisible(false)}
                    >
                        <Text style={styles.dialogButtonText}>Close</Text>
                    </TouchableOpacity>
                </Dialog.Actions>
            </Dialog>

            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => {
                    navigation.navigate('Add Society Bills');
                }}
            >
                <Icon name="add" size={24} color="#fff" />
            </TouchableOpacity>

            <Modal isVisible={isModalVisible}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalMainText}>Delete Confirmation</Text>
                    <Text style={styles.modalText}>Are you sure you want to delete {selectedBill?.name}?</Text>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                            <Text style={styles.modelbuttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={confirmDelete} style={styles.modalButton}>
                            <Text style={styles.modelbuttonText}>Yes</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Toast />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 15,
        backgroundColor: "#fff",
    },
    list: {
        paddingHorizontal: 10,
    },
    card: {
        marginVertical: 5,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: 15,
    },
    cardTitle: {
        fontWeight: '700',
        fontSize: 18,
        color: '#7D0431',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
    center: {
        alignItems: 'center',
        marginTop: 20,
    },
    dialogTitle: {
        fontSize: 21,
        fontWeight: '700',
        color: '#630000',
        alignSelf: 'center'
    },
    dialogButton: {
        padding: 10,
        backgroundColor: '#7D0431',
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 10,
    },
    dialogButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 12,
    },
    downloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        alignSelf: 'center',
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        marginTop: 10,
    },
    downloadText: {
        color: '#7D0431',
        marginLeft: 5,
        fontSize: 16,
    },
    floatingButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#7D0431',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    details: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    detailLabel: {
        fontWeight: "700",
        flex: 1.5,
        fontSize: 16,
        color: 'gray'
    },
    detailValue: {
        flex: 2,
        fontSize: 16,
        color: '#555',
    },
    selectDetails: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 5,
    },
    selectDetailLabel: {
        fontWeight: "700",
        flex: 1,
        fontSize: 15,
    },
    selectDetailValue: {
        flex: 3,
        fontSize: 15,
        color: '#555',
    },
    actionMenu: {
        position: 'absolute',
        top: 40,
        right: 0,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 1,
    },
    menuButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    buttonText: {
        fontSize: 16,
    },
    dotsButton: {
        padding: 5,
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalMainText: {
        fontSize: 20,
        marginBottom: 20,
        textAlign: 'center',
        color: '#7D0431'
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        backgroundColor: '#7D0431',
        padding: 10,
        borderRadius: 5,
        width: '45%',
        alignItems: 'center',
        color: 'White',
    },
    modelbuttonText: {
        fontSize: 16,
        color: "white",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 300
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

});

export default SocietyBills;
