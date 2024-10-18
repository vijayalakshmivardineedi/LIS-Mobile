import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { ActivityIndicator, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { DeleteNotifications, fetchNotifications } from './DashboardSlice'; // Import actions
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const AdminNotifications = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation(); 

    useFocusEffect(
        React.useCallback(() => {
            dispatch(fetchNotifications());
        }, [dispatch])
    );

    const notifications = useSelector(state => state.DashBoard.Notification || []);
    const status = useSelector(state => state.DashBoard.status || "");

    if (status === "loading") {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7d0431" />
            </View>
        );
    }

    const dismissNotification = (id) => {
        console.log(id);
        dispatch(DeleteNotifications(id)).then((response) => {
            if (response.type === "admin/deleteNotification/fulfilled") {
                dispatch(fetchNotifications());
            } else {
                dispatch(fetchNotifications());
            }
        });
    };
    const handleNotificationPress = (notif) => {
        switch (notif.category) {
            case 'event_registration':
                navigation.navigate('Events');
                break;
            case 'complaint':
                navigation.navigate('Complaints');
                break;
            case 'resident_approval_request':
                navigation.navigate('Residential Approvals');
                break;
            case 'Adds_notification':
                navigation.navigate('Advertisements');
                break;
            case 'amenietyBooking':
                navigation.navigate('Bookings');
                break;
            case 'maintenance_payment':
                navigation.navigate('Maintenance Bills');
                break;
            // Add more cases as necessary
            default:
                console.warn('Unknown category:');
        }
    };

    return (
        <View style={styles.container}>
            {/* Notifications List */}
            <ScrollView style={styles.notificationsList}>
                {notifications.map((notif) => (
                    <View key={notif._id} style={styles.notificationCard}>
                        <TouchableOpacity onPress={() => handleNotificationPress(notif)}>
                            <View style={styles.notificationItem}>
                                <View style={styles.notificationText}>
                                    <Text style={styles.notificationName}>
                                        {notif.title}
                                    </Text>
                                    <Text style={styles.notificationMessage}>
                                        {notif.message}
                                    </Text>
                                    <Text style={styles.notificationTime}>
                                        {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString()}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => dismissNotification(notif._id)}
                                    style={styles.closeButton}
                                >
                                    <MaterialCommunityIcons
                                        name="close"
                                        size={24}
                                        color="#000"
                                    />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                        <Divider />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default AdminNotifications;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    notificationsList: {
        marginTop: 10,
        maxHeight: Dimensions.get('window').height * 1,
    },
    notificationCard: {
        borderRadius: 10,
        backgroundColor: 'white',
        padding: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    notificationText: {
        marginLeft: 10,
        flex: 1,
    },
    notificationName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    notificationMessage: {
        fontSize: 14,
        color: '#333',
    },
    notificationTime: {
        fontSize: 12,
        color: '#666',
    },
    closeButton: {
        padding: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
