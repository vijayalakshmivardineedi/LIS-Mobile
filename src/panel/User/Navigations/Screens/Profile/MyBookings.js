import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchAmenityBookings } from "../../../Redux/Slice/ProfileSlice/MyBookingSlice";

const MyBookings = () => {
    const dispatch = useDispatch();
    const [userId, setUserId] = useState("");
    const [societyId, setSocietyId] = useState("");
    const Allbookings = useSelector(state => state.myBookings.bookings);
    const bookings = Allbookings?.bookings;

    useEffect(() => {
        if (societyId && userId) {
            dispatch(fetchAmenityBookings({ id: societyId, userId }));
        }
    }, [dispatch, societyId, userId]);

    useEffect(() => {
        const getUserName = async () => {
            try {
                const userString = await AsyncStorage.getItem("user");
                if (userString !== null) {
                    const user = JSON.parse(userString);
                    setUserId(user.userId);
                    setSocietyId(user.societyId);
                }
            } catch (error) {
                console.error("Failed to fetch the user from async storage", error);
            }
        };

        getUserName();
    }, []);

    return (
        <ScrollView style={styles.container}>
            {bookings && bookings.length > 0 ? (
                bookings.map((booking) => (
                    <View key={booking._id} style={styles.card}>
                        <View>
                            <Text style={styles.amenityName}>{Allbookings.amenityName}</Text>
                        </View>

                        <View
                            style={[
                                styles.statusChip,
                                {
                                    backgroundColor:
                                        booking.status === "Completed"
                                            ? "#4caf50"
                                            : booking.status === "InProgress"
                                                ? "#ff9800"
                                                : "#f44336",
                                },
                            ]}
                        >
                            <Text style={styles.statusText}>{booking.status}</Text>
                        </View>

                        {/* Booking Details */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Booked Date:</Text>
                            <Text style={styles.value}>{new Date(booking.bookedDate).toDateString()}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Date of Booking:</Text>
                            <Text style={styles.value}>{new Date(booking.dateOfBooking).toDateString()}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Paid:</Text>
                            <Text style={styles.value}>{booking.payed}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Pending:</Text>
                            <Text style={styles.value}>{booking.pending}</Text>
                        </View>
                        {booking.pending === 0 && (
                            <>
                                <View style={styles.row}>
                                    <Text style={styles.label}>Pending:</Text>
                                    <Text style={styles.value}>{booking.pending}</Text>
                                </View>
                                {booking.paymentDetails && (
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Total Amount:</Text>
                                        <Text style={styles.value}>{booking.paymentDetails.amount}</Text>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                ))
            ) : (
                <View style={styles.noDataContainer}>
                    <Image
                        source={require('../../../../../assets/Admin/Imgaes/nodatadound.png')}
                        style={styles.noDataImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.noDataText}>No Booking Found</Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f9f9f9",
    },
    card: {
        padding: 20,
        marginBottom: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        position: "relative",
    },
    statusChip: {
        position: "absolute",
        top: 12,
        right: 12,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    statusText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    amenityName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        color: "#777",
        fontWeight: "500",
    },
    value: {
        fontSize: 14,
        color: "#000",
        fontWeight: "600",
    },
    noBookingsText: {
        fontSize: 16,
        color: "#999",
        textAlign: "center",
        marginTop: 20,
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

export default MyBookings;
