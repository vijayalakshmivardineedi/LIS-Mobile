import React, { useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Button, Linking } from 'react-native';
import Carousel from 'react-native-reanimated-carousel'; 
import { useDispatch, useSelector } from 'react-redux';
import { getPropertyById } from '../../../Redux/Slice/MarketPlaceSlice/MarketPlace';
import { ActivityIndicator } from 'react-native-paper';
import { ImagebaseURL } from '../../../../Security/helpers/axios';

const PropertyDetails = ({ route }) => {
    const { id } = route.params;
    const dispatch = useDispatch()
    useEffect(() => {
        console.log(id)
        if (id) {
            dispatch(getPropertyById(id))
        }
    }, [])
    const { loading, error } = useSelector((state) => state.MarketPlace);
    const Properties = useSelector((state) => state.MarketPlace.Properties || []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7d0431" />
            </View>
        );
    }
    const handleCallNow = (phoneNumber) => {
        // Implement call functionality here
        const url = `tel:${phoneNumber}`;
        Linking.openURL(url).catch((err) => Alert.alert('Error', 'Unable to make a call.'));
    };
    const userData = Properties?.userId
    const societyData = Properties?.societyId
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                {Properties && (
                    <View>
                        <Carousel
                            data={Properties.pictures}
                            renderItem={({ item }) => (
                                <View style={styles.carouselItem}>
                                    <Image
                                        source={{ uri: `${ImagebaseURL}${item.img}` }}
                                        style={styles.carouselImage}
                                    />
                                </View>
                            )}
                            width={400}
                            height={200}
                            autoPlay={true}
                            loop={true}
                            style={styles.carousel}
                        />
                        <View style={styles.detailsContainer}>
                            <Text style={styles.TitleLabel}>DETAILS</Text>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Name</Text>
                                <Text style={styles.detailValue}>: {Properties?.title}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Category</Text>
                                <Text style={styles.detailValue}>: {Properties?.category}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Property Type</Text>
                                <Text style={styles.detailValue}>: {Properties?.type}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Owner Name</Text>
                                <Text style={styles.detailValue}>: {userData?.name}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Mobile Number</Text>
                                <Text style={styles.detailValue}>: {userData?.mobileNumber}</Text>
                            </View>
                            {societyData && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Address</Text>
                                    <Text style={styles.detailValue}>
                                        : {`${societyData?.societyName || ''},${societyData?.societyAdress.addressLine1 || ''}, ${societyData?.societyAdress.addressLine2 || ''}, ${societyData?.societyAdress.state || ''}, ${societyData?.societyAdress.postalCode || ''}`}
                                    </Text>
                                </View>
                            )}
                            {societyData && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Block</Text>
                                    <Text style={styles.detailValue}>: {userData.buildingName}</Text>
                                </View>
                            )}
                            {userData && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Flat No</Text>
                                    <Text style={styles.detailValue}>: {userData.flatNumber}</Text>
                                </View>
                            )}
                            {Properties && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Price</Text>
                                    <Text style={styles.detailValue}>: {Properties.price}</Text>
                                </View>
                            )}
                            {Properties && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Description</Text>
                                    <Text style={styles.detailValue}>: {Properties.description}</Text>
                                </View>
                            )}
                            <View style={{ marginTop: 30 }}>
                                <Button
                                    title="Are you Interested"
                                    onPress={() => handleCallNow(Properties.contactNumber)}
                                    color="#7d0431"
                                />
                            </View>

                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        padding: 0,
    },
    carouselItem: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    carouselImage: {
        width: '100%',
        height: '100%',
    },
    detailsContainer: {
        marginTop: 20,
        padding: 10
    },
    TitleLabel: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: "#7d0431"
    },
    detailRow: {
        flexDirection: 'row',
        marginVertical: 5,
    },
    detailLabel: {
        fontWeight: 'bold',
        flex: 1,
        color: "#222"
    },
    detailValue: {
        flex: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#f6f6f6",
    },
});

export default PropertyDetails;
