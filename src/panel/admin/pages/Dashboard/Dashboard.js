
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fetchComplaints } from '../Complaints/ComplaintSlice';
import { fetchResidentProfile } from '../Advertisements/profileSlice';
import { Card, Button, Snackbar, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { fetchUsers } from '../ResidentialUnit/ResidentsSlice';
import { DeleteRequest, updateRequestStatus } from './DashboardSlice';
import { fetchGatekeepers } from '../Security/GateKeeperSlice';
import { getByMonthAndYear } from '../Maintenance/SocietyMaintainanceSlice';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
const Dashboard = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const fetchedComplaints = useSelector(state => state.adminComplaints.complaints || []);
    const Security = useSelector(state => state.DashBoard.sequrity || []);
    const complaintsCount = fetchedComplaints.length;
    // Approval request 
    const { users, status } = useSelector(state => state.AdminResidents || []);
    // Users
    const fetchedProfile = useSelector(state => state.profile.profile);
    const blocksCount = fetchedProfile.blocks ? fetchedProfile.blocks.length : 0;
    const flatsCount = fetchedProfile?.blocks?.reduce((total, block) => total + block.flats.length, 0);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const expiryDate = fetchedProfile?.expiryDate ? new Date(fetchedProfile?.expiryDate) : null;
    const currentDate = new Date();
    const daysRemaining = expiryDate ? Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24)) : null;
    useFocusEffect(
        React.useCallback(() => {
            const date = new Date()
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            dispatch(fetchComplaints());
            dispatch(fetchResidentProfile());
            dispatch(fetchGatekeepers());
            dispatch(fetchUsers());
            dispatch(getByMonthAndYear(`${year}-${month}`));
        }, [dispatch])
    );

    const handleNavigation = (route) => {
        navigation.navigate(route);
    };

    const maintainances = useSelector((state) => state.adminMaintainance.maintainances) || [];
    const handleApprove = (id) => {
        if (id) {
            dispatch(updateRequestStatus(id))
                .then((result) => {
                    if (result.type === "dashboard/updateRequestStatus/fulfilled") {
                        setSnackbarMessage("Complaint Updated successfully.");
                        setSnackbarVisible(true);
                        dispatch(fetchUsers());
                    } else {
                        setSnackbarMessage("Failed to he updated request. Please try again.");
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
                    if (result.type === "dashboard/DeleteRequest/fulfilled") {
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
    const unverifiedResidents = users?.filter((eachRes) => eachRes.isVerified === false);
    const activeSecurityPersonnel = Security && Security?.filter((security) => {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        return security.attendance.some(attendance => {
            // Check if the attendance date is today
            const attendanceDate = new Date(attendance.date);
            return (
                attendanceDate >= startOfDay &&
                attendanceDate <= endOfDay &&
                attendance.checkInDateTime !== null &&  // Ensures check-in time is present
                attendance.checkOutDateTime === null // Ensures check-out time is absent
            );
        });
    });
    const activeGatekeepers = activeSecurityPersonnel.map(security => {
        const activeAttendance = security?.attendance.find(attendance => {
            const attendanceDate = new Date(attendance.date);
            const today = new Date();
            return attendanceDate.toDateString() === today.toDateString() &&
                attendance.checkInDateTime !== null &&
                attendance.checkOutDateTime === null;
        });
        return {
            name: security.name,
            mobileNumber: security.phoneNumber,
            checkInTime: activeAttendance ? activeAttendance.checkInDateTime : null
        };
    });
    const { monthAndYear, paymentDetails } = maintainances;
    const paidPayments = paymentDetails?.filter(payment => payment.status === 'Paid');


    if (status === "loading") {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7d0431" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.row}>
                <DashboardCard title="Blocks" count={blocksCount} />
                <DashboardCard title="Flats" count={flatsCount ? flatsCount : 0} />
                <DashboardCard title="Complaints" count={complaintsCount} onPress={() => handleNavigation('Complaints')} />
            </View>
            <View>
                {daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 10 && (
                    <Card style={styles.reminderCard}>
                        <Card.Content>
                            <Text style={styles.reminderText}>
                                Your plan expires in {daysRemaining} days. Please renewal your plan to avoid interruption.
                            </Text>
                            <Button
                                mode="contained"
                                onPress={() => handleNavigation('RenewalPage')}
                                style={styles.renewButton}
                            >
                                Renew Now
                            </Button>
                        </Card.Content>
                    </Card>
                )}
            </View>
            <View>
                {unverifiedResidents.length > 0 && (
                    <Text style={styles.ApprovalHeader}>Residential Approval Request</Text>
                )}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 5 }}
                >
                    {unverifiedResidents.slice(0, 3).map((eachRes) => (  // Only display first 3 cards
                        <Card style={styles.Approvalcard} key={eachRes._id}>
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
                    ))}
                    {unverifiedResidents.length > 3 && (
                        <Card style={styles.Viewcard} key="view-more" onPress={() => navigation.navigate('Residential Approvals')}>
                            <Card.Content>
                                <View style={styles.header}>
                                    <Ionicons name="chevron-forward-circle-outline" size={24} color="#7d0431" />
                                    <Text style={styles.ViewMoretitle}>View More</Text>
                                </View>
                            </Card.Content>
                        </Card>
                    )}
                </ScrollView>
            </View>
            <View>
                {activeGatekeepers.length > 0 && (
                    <View>
                        <Text style={styles.attendanceHeader}>Active Security</Text>
                        <ScrollView
                            horizontal={activeGatekeepers.length > 1} // Horizontal scroll only if more than one
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 2 }}
                        >
                            {activeGatekeepers.map((resident) => (
                                <Card
                                    key={resident._id}
                                    style={[styles.attendanceCard, activeGatekeepers.length === 1 ? styles.fullWidthCard : {}]}
                                >
                                    <Card.Content>
                                        <Text style={styles.attendanceName}>Name: {resident.name}</Text>
                                        <Text style={styles.attendanceDetails}>Phone Number: {resident.mobileNumber}</Text>
                                        <Text style={styles.attendanceDetails}>Date/ Time: {new Date(resident.checkInTime).toLocaleDateString()}/ {new Date(resident.checkInTime).toLocaleTimeString()}</Text>
                                    </Card.Content>
                                </Card>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>
            <View>
                {paidPayments?.length > 0 ? (
                    <View>
                        <Text style={styles.monthHeader}>Maintenance Bill: {monthAndYear}</Text>
                        {/* Display only the first two payments */}
                        {paidPayments.slice(0, 2).map(payment => (
                            <Card key={payment._id} style={styles.paymentCard}>
                                <Card.Content style={styles.cardContent}>
                                    <View style={styles.detailsContainer}>
                                        <Text style={styles.attendanceName}>Name: {payment.name}</Text>
                                        <Text style={styles.paymentDetails}>Flat Details: {payment.blockno}/ {payment.flatno}</Text>
                                        <Text style={styles.paymentDetails}>Paid On: {new Date(payment.payedOn).toLocaleDateString()}</Text>
                                    </View>
                                    <View style={styles.iconContainer}>
                                        <MaterialCommunityIcons
                                            name="arrow-bottom-left"
                                            size={30}
                                            color="#4CAF50"
                                        />
                                    </View>
                                </Card.Content>
                            </Card>

                        ))}
                        {/* Show View More only if there are more than 2 payments */}
                        {paidPayments.length > 2 && (
                            <TouchableOpacity onPress={() => navigation.navigate("Maintenance Bills")}>
                                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", }}>
                                    <Text style={styles.viewMoreText}>View More</Text>
                                    <MaterialCommunityIcons
                                        name="arrow-right-circle-outline"
                                        size={22}
                                        color="#7d0431"
                                        style={{
                                            marginTop: 20,
                                            marginLeft: 10
                                        }}
                                    />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    null
                )}
            </View>
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                style={styles.snackbar}
            >
                {snackbarMessage}
            </Snackbar>
        </ScrollView >
    );
};

const DashboardCard = ({ title, count, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardCount}>{count}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '30%',
        marginVertical: 5,
        borderWidth: 2,
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: "#e2e1e3",
        backgroundColor: '#fff',
        elevation: 6,
        shadowColor: "#000",

    },
    cardTitle: {
        fontSize: 15,
        color: '#7d0431',
        fontWeight: '600',
    },
    ApprovalHeader: {
        fontSize: 18,
        color: '#7d0431',
        fontWeight: '700',
        paddingTop: 10
    },
    cardCount: {
        fontSize: 24,
        color: '#7d0431',
        fontWeight: '700',
        marginTop: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    ViewMoretitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
        color: "#7d0431"
    },
    message: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    actions: {
        justifyContent: 'space-between',
    },
    approveButton: {
        backgroundColor: '#7d0431',
        flex: 1,
        marginRight: 8,
    },
    declineButton: {
        flex: 1,
    },
    Approvalcard: {
        marginTop: 10,
        marginBottom: 10,
        marginRight: 15,
        elevation: 4,
        padding: 5,
        backgroundColor: '#fff',
    },
    Viewcard: {
        marginTop: 10,
        marginBottom: 10,
        marginRight: 15,
        elevation: 4,
        padding: 5,
        justifyContent: "center",
        alignItems: "center"
    },
    cardView: {
        flex: 1,
        justifyContent: "flex-start",
        flexDirection: "row",
        alignItems: "center",
    },
    viewMoreButton: {
        backgroundColor: "transparent",
        color: "#7d0431"
    },
    reminderCard: {
        marginTop: 20,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 4,
    },
    reminderText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 12,
    },
    renewButton: {
        backgroundColor: '#7d0431',
    },
    attendanceHeader: {
        fontSize: 18,
        color: '#7d0431',
        fontWeight: '700',
        paddingTop: 10,
    },
    attendanceCard: {
        marginTop: 10,
        marginBottom: 10,
        marginRight: 15,
        elevation: 4,
        padding: 5,
        backgroundColor: '#fff',
        width: 150,
    },
    fullWidthCard: {
        width: '100%',
    },
    attendanceName: {
        fontSize: 16,
        fontWeight: '600',
    },
    attendanceDetails: {
        fontSize: 14,
    },
    monthHeader: {
        fontSize: 18,
        color: '#7d0431',
        fontWeight: '700',
        paddingTop: 10,
    },
    paymentCard: {
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 4,
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        elevation: 1,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailsContainer: {
        flex: 1,
    },
    attendanceName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    paymentDetails: {
        fontSize: 14,
        color: '#555',
    },
    iconContainer: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noPayments: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
    },
    viewMoreText: {
        fontSize: 18,
        fontWeight: "500",
        color: "#525050",
        paddingTop: 15,
        paddingLeft: 10,
        textDecorationLine: "underline",
        textDecorationColor: "#7d0431"
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
export default Dashboard;

