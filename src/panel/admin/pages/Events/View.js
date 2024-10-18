import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { ImagebaseURL } from '../../../Security/helpers/axios';

const ViewEvents = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { eventId } = route.params;

    const events = useSelector(state => state.societyEvents.event); 
    const event = events.find((event) => event._id === eventId); 
    if (!event) {
        return <View style={styles.container}><Text>Event not found.</Text></View>;
    }

    const picturesCount = event.pictures.length;
    const isSinglePicture = picturesCount === 1;

    return (
        <ScrollView>
            <View style={styles.card}>
                <Carousel
                    loop={!isSinglePicture} 
                    width={300}
                    height={200}
                    autoPlay={!isSinglePicture} 
                    data={event.pictures}
                    renderItem={({ item }) => (
                        <Image
                            key={item._id}
                            source={{ uri: `${ImagebaseURL}${item.img}` }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    )}
                    style={styles.carousel}
                    animationDuration={isSinglePicture ? 0 : 2000} 
                />
                <Text style={styles.sectionTitle}>Society Profile Details:</Text>
                <View style={styles.detailsContainer}>
                    <View style={styles.details}>
                        <Text style={styles.textLabel}>Name</Text>
                        <Text style={styles.textValue}>{event.name}</Text>
                    </View>
                    <View style={styles.details}>
                        <Text style={styles.textLabel}>Start Date</Text>
                        <Text style={styles.textValue}>{new Date(event.startDate).toLocaleString()}</Text>
                    </View>
                    <View style={styles.details}>
                        <Text style={styles.textLabel}>End Date</Text>
                        <Text style={styles.textValue}>{new Date(event.endDate).toLocaleString()}</Text>
                    </View>
                </View>

                {/* Activities Section */}
                {event.activities && event.activities.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Activities:</Text>
                        <View style={styles.detailsContainer}>
                            {event.activities.map((activity) => (
                                <View key={activity._id} style={styles.details}>
                                    <Text style={styles.textLabel}>Activity Type:</Text>
                                    <Text style={styles.textValue}>{activity.type}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Registrations Section */}
                {event.registrations && event.registrations.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Registrations:</Text>
                        <View style={styles.detailsContainer}>
                            <View style={styles.tableHeader}>
                                <Text style={styles.tableHeaderText}>Participant ID</Text>
                                <Text style={styles.tableHeaderText}>Name</Text>
                                <Text style={styles.tableHeaderText}>Activities</Text>
                            </View>
                            {event.registrations.map((registration) => (
                                <View key={registration._id} style={styles.tableRow}>
                                    <Text style={styles.tableCell}>{registration.participantId}</Text>
                                    <Text style={styles.tableCell}>{registration.participantName}</Text>
                                    <Text style={styles.tableCell}>
                                        {registration.activity.join(", ")} {/* Join activities in a string */}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

            </View>
        </ScrollView>
    );
};

// Styles for your component
const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    card: {
        padding: 20,
        marginBottom: 20,
    },
    carousel: {
        marginBottom: 20,
        borderRadius: 10,
        overflow: 'hidden',
        alignSelf: "center",
    },
    image: {
        width: '100%',
        height: '100%',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: "#7D0431",
        marginVertical: 10,
    },
    detailsContainer: {
        borderColor: '#7D0431',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomColor: '#7D0431',
        borderBottomWidth: 1,
        paddingVertical: 10,
    },
    tableHeaderText: {
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    tableCell: {
        flex: 1,
        textAlign: 'center',
    },
    detailItem: {
        marginBottom: 10,
    },
    detailLabel: {
        fontSize: 18,
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 16,
    },
    details: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    textValue: {
        flex: 3,
        fontSize: 16,
        color: '#333',
    },
    textLabel: {
        flex: 2,
        fontSize: 16,
        color: '#333',
        fontWeight: "600",
    },
});

export default ViewEvents;
