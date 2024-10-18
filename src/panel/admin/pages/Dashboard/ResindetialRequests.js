import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { fetchUsers } from '../ResidentialUnit/ResidentsSlice';
import { ScrollView, View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Card, Button, Snackbar } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from "react-redux";
import React, { useState } from "react";
import { updateRequestStatus } from "./DashboardSlice";

const ResindetialRequests = () => {
    const dispatch = useDispatch();
    const { users } = useSelector(state => state.AdminResidents || []);
    const [isModalVisible, setModalVisible] = useState(false); // Modal state
    const [selectedResident, setSelectedResident] = useState(null); // Selected resident
    const [snackbarVisible, setSnackbarVisible] = useState(false); // Snackbar visibility state
    const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message
    useFocusEffect(
        React.useCallback(() => {
            if (users.length === 0) {
                dispatch(fetchUsers());
            }
        }, [dispatch, users])
    );
    const unverifiedResidents = users.filter((eachRes) => eachRes.isVerified === false);
    // Function to handle opening the modal and setting the selected resident
    const openModal = (resident) => {
        setSelectedResident(resident);
        setModalVisible(true);
    };

    // Function to close the modal
    const closeModal = () => {
        setModalVisible(false);
        setSelectedResident(null);
    };
    const handleApprove = (id) => {
        console.log(id)
        if (id, "hello") {
            dispatch(updateRequestStatus(id))
                .then((result) => {
                    console.log()
                    if (result.type === "dashboard/updateRequestStatus/fulfilled") {
                        setSnackbarMessage("Complaint Updated successfully.");
                        setSnackbarVisible(true);
                        dispatch(fetchUsers());
                    } else {
                        setSnackbarMessage("Failed to delete the updated request. Please try again.");
                        setSnackbarVisible(true);
                    }
                })
                .catch(() => {
                    setSnackbarMessage("An error occurred. Please check your network and try again.");
                    setSnackbarVisible(true);
                });
        } else {
            Alert.alert('Request update failed');
        }
    };
    const handleDecline = (id) => {
        if (id) {
            dispatch(DeleteRequest(id))
                .then((result) => {
                    console.log(result.type)
                    if (result.type === "dashboard/DeleteRequest/fulfilled") {
                        console.log(result.type)
                        setSnackbarMessage("Complaint delete successfully.");
                        setSnackbarVisible(true);
                        dispatch(fetchUsers());
                    } else {
                        setSnackbarMessage("Failed to delete request. Please try again.");
                        setSnackbarVisible(true);
                    }
                })
                .catch(() => {
                    setSnackbarMessage("An error occurred. Please check your network and try again.");
                    setSnackbarVisible(true);
                });
        } else {
            Alert.alert('Request update failed');
        }
    };
    return (
        <View style={styles.container}>
            {unverifiedResidents.length > 0 ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                    {unverifiedResidents.map((eachRes) => (
                        <TouchableOpacity onPress={() => openModal(eachRes)} key={eachRes._id}>
                            <Card style={styles.Approvalcard} key={eachRes._id} >
                                <Card.Content>
                                    <View style={styles.header}>
                                        <Ionicons name="person-circle" size={24} color="#7d0431" />
                                        <Text style={styles.title}>{eachRes.name}</Text>
                                    </View>
                                    <Text style={styles.message}>
                                        {`Approval Request from ${eachRes.buildingName} / ${eachRes.flatNumber}`}
                                    </Text>
                                    <Text style={styles.date}>
                                        {new Date(eachRes.updatedAt).toLocaleDateString()}
                                    </Text>
                                </Card.Content>
                                <Card.Actions style={styles.actions}>
                                    <Button
                                        mode="contained"
                                        onPress={() => handleApprove(eachRes._id)}
                                        style={styles.approveButton}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        mode="outlined"
                                        onPress={() => handleDecline(eachRes._id)}
                                        style={styles.declineButton}
                                    >
                                        Decline
                                    </Button>
                                </Card.Actions>
                            </Card>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            ) : (
                <Text style={styles.noRequests}>No pending approval requests.</Text>
            )}

            {/* Modal to show resident details */}
            {selectedResident && (
                <Modal
                    visible={isModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={closeModal} // Close modal on request
                >
                    {console.log(selectedResident)}
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>{selectedResident.name}'s Details</Text>
                            <Text style={styles.modalText}>User Type : {selectedResident.userType}</Text>
                            <Text style={styles.modalText}>Flat Details: {selectedResident.buildingName} / {selectedResident.flatNumber}</Text>
                            <Text style={styles.modalText}>Req At: {new Date(selectedResident.updatedAt).toLocaleDateString()}</Text>
                            <Text style={styles.modalText}>Email: {selectedResident.email}</Text>
                            <Text style={styles.modalText}>Phone: {selectedResident.mobileNumber}</Text>
                            <Button mode="contained" onPress={closeModal} style={styles.closeButton}>
                                Close
                            </Button>
                        </View>
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
        </View>
    )
}
export default ResindetialRequests;
const styles = StyleSheet.create({
    container: {
        padding: 5,
        margin: 5
    },
    Approvalcard: {
        marginVertical: 10,
        marginHorizontal: 5,
        padding: 10,

    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        marginLeft: 10,
        fontWeight: 'bold',
    },
    message: {
        fontSize: 16,
        marginBottom: 5,
    },
    date: {
        fontSize: 14,
        color: 'gray',
    },
    actions: {
        justifyContent: 'flex-end',
    },
    approveButton: {
        backgroundColor: '#7d0431',
        flex: 1,
        marginRight: 8,
    },
    declineButton: {
        flex: 1,
    },
    noRequests: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
        color: 'gray',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // Modal background with opacity
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        margin: 30,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 10,
    },
    closeButton: {
        marginTop: 10,
        backgroundColor: '#7d0431',
    },
});
