import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvent, deleteEvent } from './EventSlice';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ImagebaseURL } from '../../../Security/helpers/axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';

const Events = () => {
    const dispatch = useDispatch();
    const { status, event } = useSelector(state => state.societyEvents);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [actionMenuVisible, setActionMenuVisible] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const navigation = useNavigation();

    useFocusEffect(
        React.useCallback(() => {
            dispatch(fetchEvent());
        }, [dispatch])
    );


    const handleView = (event) => {
        navigation.navigate('View Events', { eventId: event._id });
        setActionMenuVisible(null);
    };

    const handleEdit = (event) => {
        navigation.navigate('Edit Event', { eventId: event._id });
        setActionMenuVisible(null);
    };

    const handleDelete = (event) => {
        setSelectedEvent(event);
        setDeleteDialogOpen(true);
        setActionMenuVisible(null);
    };

    const confirmDelete = async () => {
        setDeleteDialogOpen(false);
        try {
            const response = await dispatch(deleteEvent(selectedEvent._id));
            setSelectedEvent(null);
            if (response.meta.requestStatus === 'fulfilled') {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Event deleted successfully.',
                });
                setTimeout(() => {
                    dispatch(fetchEvent());
                }, 2000);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to delete the event.',
                });
                console.error('Delete Event Error:', response.error);
            }
        } catch (error) {
            setSelectedEvent(null);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'An unexpected error occurred while deleting the event.',
            });
            console.error('Unexpected Error:', error);
        }
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
    };

    if (status === 'loading') {
        return <ActivityIndicator size="large" color="#630000" style={styles.loader} />;
    }
    console.log(event)
    if (!event || event.length === 0) { // Show spinner while loading
        return (
            <View style={styles.noDataContainer}>
                <Image
                    source={require('../../../../assets/Admin/Imgaes/nodatadound.png')}
                    style={styles.noDataImage}
                    resizeMode="contain"
                />
                <Text style={styles.noDataText}>No Amenities Found</Text>
            </View>
        );
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleView(item)}>
            <View style={styles.row}>
                <Image
                    source={{ uri: `${ImagebaseURL}${item.pictures[0]?.img}` }}
                    style={styles.image}
                />
                <View style={styles.details}>
                    <Text style={styles.detailLabel}>Event</Text>
                    <Text style={styles.detailValue}>{item.name}</Text>
                </View>
                <View style={styles.details}>
                    <Text style={styles.detailLabel}>Start Date</Text>
                    <Text style={styles.detailValue}>{new Date(item.startDate).toLocaleString()}</Text>
                </View>
                <View style={styles.details}>
                    <Text style={styles.detailLabel}>End Date</Text>
                    <Text style={styles.detailValue}>{new Date(item.endDate).toLocaleString()}</Text>
                </View>
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
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={event}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                keyboardShouldPersistTaps="handled"
            />

            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => navigation.navigate('Add Events')}
            >
                <Icon name="add" size={24} color="#fff" />
            </TouchableOpacity>

            <Modal
                isVisible={deleteDialogOpen}
                onBackdropPress={cancelDelete}
                style={styles.modal}
                animationIn="slideInUp"
                animationOut="slideOutDown"
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalMainText}>Delete Confirmation</Text>
                    <Text style={styles.modalText}>Are you sure you want to delete this event?</Text>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity onPress={cancelDelete} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={confirmDelete} style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>Yes</Text>
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
        flex: 1,
        padding: 10,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
    row: {
        flexDirection: 'column',
        padding: 10,
        backgroundColor: '#f9f9f9',
        marginBottom: 10,
        borderRadius: 8,
    },
    image: {
        width: '90%',
        height: 200,
        borderRadius: 8,
        marginBottom: 10,
    },
    details: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    detailLabel: {
        fontWeight: "600",
        flex: 1,
        fontSize: 16,
    },
    detailValue: {
        flex: 2.5,
        fontSize: 16,
        color: '#333',
    },
    dotsButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    actionMenu: {
        position: 'absolute',
        top: 50,
        right: 10,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        elevation: 3,
    },
    menuButton: {
        paddingVertical: 5,
    },
    buttonText: {
        fontSize: 14,
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
    },
    modal: {
        justifyContent: 'center',
        margin: 0,
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalMainText: {
        fontSize: 20,
        marginBottom: 20,
        textAlign: 'center',
        color: '#7D0431',
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
    },
    modalButtonText: {
        color: 'white',
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
export default Events;
