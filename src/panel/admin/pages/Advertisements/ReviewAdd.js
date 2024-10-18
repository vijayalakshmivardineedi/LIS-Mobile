import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Image, Button, Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, } from '@react-navigation/native';
import { getAdvertisementsById } from './AdvertisementSlice';
import Carousel from 'react-native-reanimated-carousel';
import { ImagebaseURL } from '../../../Security/helpers/axios';
import { fetchCitiesById } from '../../../User/Redux/Slice/AuthSlice/Signup/citySlice';

const ReviewAdd = () => {
    const dispatch = useDispatch();
    const route = useRoute();
    const { id } = route.params;
    const advertisement = useSelector((state) => state.advertisements.adds);
    const status = useSelector((state) => state.advertisements.status);
    const error = useSelector((state) => state.advertisements.error);
    const cities = useSelector((state) => state.citiesState.currentCity);

    useEffect(() => {
        dispatch(getAdvertisementsById(id));
        if (advertisement) {
            dispatch(fetchCitiesById(advertisement.societyId?.city));
        }
    }, [dispatch, id]);

    if (status === 'loading') {
        return <ActivityIndicator size="large" color="#630000" style={styles.spinner} />;
    }

    if (status === 'failed') {
        Alert.alert('Error', error);
        return null;
    }
    const handleCallNow = (phoneNumber) => {
        const url = `tel:${phoneNumber}`;
        Linking.openURL(url).catch((err) => Alert.alert('Error', 'Unable to make a call.'));
    };
    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                {advertisement && (
                    <View>
                        <Carousel
                            data={advertisement.pictures}
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
                                <Text style={styles.detailValue}>: {advertisement.userName}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Mobile Number</Text>
                                <Text style={styles.detailValue}>: {advertisement.phoneNumber}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Type</Text>
                                <Text style={styles.detailValue}>: {advertisement.adv}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Status</Text>
                                <Text style={styles.detailValue}>: {advertisement.status}</Text>
                            </View>
                            {advertisement.societyId?.societyAdress && (
                                <View style={styles.detailRow}>

                                    <Text style={styles.detailLabel}>Address</Text>
                                    <Text style={styles.detailValue}>
                                        : {`${advertisement.societyId?.societyAdress.addressLine1 || ''}, ${advertisement.societyId?.societyAdress.addressLine2 || ''}, ${cities?.name || ''}, ${advertisement.societyId?.societyAdress.state || ''}, ${advertisement.societyId?.societyAdress.postalCode || ''}`}
                                    </Text>
                                </View>
                            )}
                            {advertisement.details?.block && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Block</Text>
                                    <Text style={styles.detailValue}>: {advertisement.details?.block}</Text>
                                </View>
                            )}
                            {advertisement.details?.flat_No && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Flat No</Text>
                                    <Text style={styles.detailValue}>: {advertisement.details?.flat_No}</Text>
                                </View>
                            )}
                            {advertisement.details?.flat_Area && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Flat Area</Text>
                                    <Text style={styles.detailValue}>: {advertisement.details?.flat_Area}</Text>
                                </View>
                            )}
                            {advertisement.details?.rooms && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Rooms</Text>
                                    <Text style={styles.detailValue}>: {advertisement.details?.rooms}</Text>
                                </View>
                            )}
                            {advertisement.details?.washrooms && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Rest-Rooms</Text>
                                    <Text style={styles.detailValue}>: {advertisement.details?.washrooms}</Text>
                                </View>
                            )}
                            {advertisement.details?.price && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Price</Text>
                                    <Text style={styles.detailValue}>: {advertisement.details?.price}</Text>
                                </View>
                            )}
                            {advertisement.details?.maintainancePrice && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Maintenance Price</Text>
                                    <Text style={styles.detailValue}>: {advertisement.details?.maintainancePrice}</Text>
                                </View>
                            )}
                            {advertisement.details?.parkingSpace && (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Parking Space</Text>
                                    <Text style={styles.detailValue}>: {advertisement.details?.parkingSpace}</Text>
                                </View>

                            )}
                            {advertisement.phoneNumber && (
                                <View style={styles.callButton}>
                                    <Button title="Call Now" onPress={() => handleCallNow(advertisement.phoneNumber)} color="#630000" />
                                </View>
                            )}
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
        backgroundColor: '#fff',
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    scrollView: {
        padding: 5,
    },
    carousel: {
        padding: 0
    },
    carouselItem: {
        width: '95%',
        height: '90%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    carouselImage: {
        width: '95%',
        height: '100%',
        borderRadius: 10,
        resizeMode: 'cover',
    },
    detailsContainer: {
        marginTop: 10,

        paddingHorizontal: 10
    },
    detailText: {
        fontSize: 16,
        marginVertical: 5,
    },
    spinner: {
        flex: 1,
        justifyContent: 'center',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5,
    },
    detailLabel: {
        fontWeight: '600',
        fontSize: 16,
        width: 150,
        color: "#222222"
    },
    TitleLabel: {
        fontWeight: '700',
        fontSize: 20,
        color: "#222222"
    },
    detailValue: {
        fontSize: 16,
        flex: 1,
        textAlign: 'left',
    },
    callButton: {
        marginVertical: 10,
    },

});
export default ReviewAdd;



