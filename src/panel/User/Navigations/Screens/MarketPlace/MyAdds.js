import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { DeletePost, ResidentsAdds } from '../../../Redux/Slice/MarketPlaceSlice/MarketPlace';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ActivityIndicator, FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ImagebaseURL } from '../../../../Security/helpers/axios';

const MyAdds = () => {
    const [userId, setUserId] = useState("");
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.MarketPlace);
    const Properties = useSelector((state) => state.MarketPlace.Properties || []);

    useEffect(() => {
        const getUserName = async () => {
            try {
                const userString = await AsyncStorage.getItem("user");
                if (userString !== null) {
                    const user = JSON.parse(userString);
                    setUserId(user._id);
                }
            } catch (error) {
                console.error("Failed to fetch the user from async storage", error);
            }
        };
        getUserName();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            if (userId) {
                dispatch(ResidentsAdds(userId));
            }
        }, [userId, dispatch]),
    );

    const renderItem = ({ item }) => (
        <View
            style={styles.card}
        >
            {item.pictures && item.pictures.length > 0 ? (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: `${ImagebaseURL}${item.pictures[0].img}` }}
                        style={styles.image}
                    />
                    <TouchableOpacity onPress={() => handleMenuAction(item._id)} style={styles.menuIcon}>
                        <Icon name="delete-sweep" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            ) : null}
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", }}>
                    <Text style={{ color: "#222" }}> {item.price}</Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                    <Text style={styles.contact}>Price</Text>
                    <Text style={{ color: "#222" }}>: {item.price}</Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                    <Text style={styles.contact}>Contact</Text>
                    <Text style={{ color: "#222" }}>: {item.contactNumber}</Text>
                </View>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        </View>
    );



    const handleMenuAction = (propertyId) => {
        console.log(propertyId, ": post id")
        Alert.alert(
            "Delete Property",
            "Are you sure you want to delete this property?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", onPress: () => {
                        dispatch(DeletePost(propertyId))
                            .then((response) => {
                                if (response.type === "marketPlace/deleteResident/fulfilled") {
                                    dispatch(ResidentsAdds(userId));
                                }
                                else {
                                    console.log("failed")
                                }
                            }).catch((error) => {
                                Alert.alert("Error", "An error occurred while updating the booking.");
                            });

                    }
                },
            ]
        );

    };


    if (loading) {
        return <ActivityIndicator size="large" color="#630000" style={styles.loadingContainer} />;
    }

    if (!Properties || Properties.length === 0) { // Show spinner while loading
        return (
            <View style={styles.noDataContainer}>
                <Image
                    source={require('../../../../../assets/Admin/Imgaes/nodatadound.png')}
                    style={styles.noDataImage}
                    resizeMode="contain"
                />
                <Text style={styles.noDataText}>No Adds Found</Text>
            </View>
        );
    }



    if (error) {
        return (
            <View style={styles.noDataContainer}>
                <Image
                    source={require('../../../../../assets/Admin/Imgaes/nodatadound.png')}
                    style={styles.noDataImage}
                    resizeMode="contain"
                />
                <Text style={styles.noDataText}>No Adds Found</Text>
            </View>)
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={Properties}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.container}
            />
            <FAB
                style={styles.fab}
                icon="plus"
                color='#fff'
                onPress={() => navigation.navigate("Add Property")}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#f8f8f8',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 150,
    },
    menuIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
        padding: 5,
    },
    dropdownMenu: {
        position: 'absolute',
        top: 40,
        right: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        elevation: 4,
        zIndex: 1,
    },
    dropdownItem: {
        padding: 10,
        color: '#333',
    },
    infoContainer: {
        padding: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    contact: {
        width: 70,
        color: "#222",
        fontWeight: "bold",
    },
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#7d0431',
        right: 16,
        bottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MyAdds;
