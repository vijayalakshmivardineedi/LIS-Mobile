import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    Modal,
    Pressable,
    StyleSheet,
    Alert,
} from 'react-native';
import { fetchVisitors, deleteVisitor, deleteEntry } from './EntrySlice'; // Assuming you have a deleteVisitor action
import { ImagebaseURL } from '../../../Security/helpers/axios';
import dummyAvatar from '../../../../assets/Admin/Imgaes/dummyProfile.png'; // Import your dummy avatar image
import { Dialog, Paragraph, Button, Snackbar, ActivityIndicator } from 'react-native-paper';
const VisitorManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const dispatch = useDispatch();
    const visitors = useSelector(state => state.adiminEntries.visitors);
    const status = useSelector(state => state.adiminEntries.status);
    const error = useSelector(state => state.adiminEntries.error);
    const [selectedVisitor, setSelectedVisitor] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);// State for delete confirmation
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState("")
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    useEffect(() => {
        dispatch(fetchVisitors());
    }, [dispatch]);




    const filteredVisitors = Array.isArray(visitors)
        ? visitors.filter(visitor =>
            visitor.name && visitor.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const handleViewClick = visitor => {
        setSelectedVisitor(visitor);
        setModalVisible(true);
    };

    const showDeleteDialog = (enntryId) => {
        setSelectedEntry(enntryId);
        setDeleteDialogVisible(true);
    };
    const hideDeleteDialog = () => {
        setDeleteDialogVisible(false);
    };
    const handleDeleteNotice = () => {
        setDeleteDialogVisible(false);
        if (selectedEntry) {

            dispatch(deleteEntry({ block: selectedEntry.block, flatNo: selectedEntry.flatNo, visitorId: selectedEntry._id }))
                .then((result) => {
                    if (result.meta.requestStatus === "fulfilled") {
                        setSnackbarMessage("Notice deleted successfully.");
                        dispatch(fetchVisitors());
                        setSnackbarVisible(true);
                    } else {
                        setSnackbarMessage("Failed to delete the No. Please try again.");
                        dispatch(fetchVisitors());
                        setSnackbarVisible(true);
                    }
                })
                .catch(() => {
                    setSnackbarMessage("An error occurred. Please check your network and try again.");
                    setSnackbarVisible(true);
                });


        }
    };
    if (status === "loading") {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7d0431" />
            </View>
        );
    }

    if (!filteredVisitors || filteredVisitors.length === 0) {
        return (<View style={styles.noDataContainer}>
            <Image
                source={require('../../../../assets/Admin/Imgaes/nodatadound.png')}
                style={styles.noDataImage}
                resizeMode="contain"
            />
            <Text style={styles.noDataText}>No visitors Found</Text>
        </View>);
    }
    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleViewClick(item)}>
            <View style={styles.card}>
                {/* Image Section */}
                <Image
                    source={item.pictures ? { uri: `${ImagebaseURL}${item.pictures}` } : dummyAvatar}
                    style={styles.image}
                />

                {/* Card Content Section */}
                <View style={styles.cardContent}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Name</Text>
                        <Text style={styles.value}>: {item.name}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Role</Text>
                        <Text style={styles.value}>: {item.role}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Phone</Text>
                        <Text style={styles.value}>: {item.phoneNumber}</Text>
                    </View>
                </View>

                {/* Delete Icon in Top Right Corner */}
                <TouchableOpacity
                    style={styles.deleteIcon}
                    onPress={() => showDeleteDialog(item)}
                >
                    <Text style={styles.deleteText}>🗑️</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredVisitors}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.list}
            />
            {selectedVisitor && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(!modalVisible)}
                >
                    <View style={styles.modalView}>
                        {console.log(selectedVisitor)}
                        {/* Centered Image */}
                        <Image
                            source={selectedVisitor?.pictures ? { uri: ` ${ImagebaseURL}${selectedVisitor.pictures}` } : dummyAvatar}
                            style={styles.modalImage}
                        />
                        {/* Centered Title */}
                        <Text style={styles.modalTitle}>Visitor Details</Text>

                        {/* Visitor Information in Centered Columns */}
                        <View style={styles.detailsContainer}>
                            <View style={styles.row}>
                                <Text style={styles.label}>Name:</Text>
                                <Text style={styles.value}>: {selectedVisitor.name}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Role</Text>
                                <Text style={styles.value}>: {selectedVisitor.role}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Phone</Text>
                                <Text style={styles.value}>: {selectedVisitor.phoneNumber}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Block</Text>
                                <Text style={styles.value}>: {selectedVisitor.block}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Flat No</Text>
                                <Text style={styles.value}>: {selectedVisitor.flatNo}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Check In:</Text>
                                <Text style={styles.value}>
                                    : {selectedVisitor.checkInDateTime
                                        ? new Date(selectedVisitor.checkInDateTime).toLocaleString()
                                        : '----'}
                                </Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Check Out</Text>
                                <Text style={styles.value}>
                                    : {selectedVisitor.checkOutDateTime
                                        ? new Date(selectedVisitor.checkOutDateTime).toLocaleString()
                                        : '----'}
                                </Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Status</Text>
                                <Text style={styles.value}>: {selectedVisitor.status}</Text>
                            </View>
                        </View>
                        {/* Close Button */}
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Text style={styles.buttonText}>Close</Text>
                        </Pressable>
                    </View>
                </Modal>
            )}
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                style={styles.snackbar}
            >
                {snackbarMessage}
            </Snackbar>
            {/* Delete Confirmation Modal */}
            <Dialog visible={deleteDialogVisible} onDismiss={hideDeleteDialog}>
                <Dialog.Title>Confirm Delete</Dialog.Title>
                <Dialog.Content>
                    <Paragraph>Are you sure you want to delete this notice?</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={hideDeleteDialog}>Cancel</Button>
                    <Button onPress={handleDeleteNotice}>Delete</Button>
                </Dialog.Actions>
            </Dialog>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 23,
        fontWeight: '700',
        color: '#630000',
        marginBottom: 16,
    },
    list: {
        paddingBottom: 100,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        elevation: 3,
        margin: 5,
        padding: 16,
    },
    cardContent: {
        flex: 1,
        marginLeft: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    cardDetail: {
        fontSize: 14,
        marginBottom: 3,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    button: {
        backgroundColor: '#fb0707',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        color: '#7D0431',
        fontWeight: 'bold',
    },
    buttonDelete: {
        backgroundColor: '#fff',
        color: "#7d0431"
    },

    buttonClose: {
        backgroundColor: '#fff',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontWeight: '600',
        color: "#222",
        width: 100,
    },
    value: {
        flex: 1,
        textAlign: 'left',
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent background
        padding: 20,
    },
    modalImage: {
        width: 100,
        height: 100, // circular image
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#fff',
    },
    detailsContainer: {
        width: '100%', // adjust width as per need
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        marginTop: 20,
        backgroundColor: '#2196F3',
        borderRadius: 10,
        padding: 10,
        width: '80%',
        alignItems: 'center',
    },
    deleteIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
    },
    deleteText: {
        fontSize: 20,
        color: 'red',
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
    },

});

export default VisitorManagement;
