import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchGuard } from "../../../User/Redux/Slice/Security_Panel/SettingsSlice";
import { ImagebaseURL } from "../../helpers/axios";
import {Avatar} from "react-native-paper";

const Guard = () => {
    const dispatch = useDispatch();
    const [societyId, setSocietyId] = useState(null);
    const [sequrityId, setSequrityId] = useState(null);
    const Guard = useSelector((state) => state.setting.settings);

    useEffect(() => {
        const getAllAsyncStorageData = async () => {
            try {
                const keys = await AsyncStorage.getAllKeys();
                if (keys.length > 0) {
                    const result = await AsyncStorage.multiGet(keys);
                    const data = result.map(([key, value]) => {
                        try {
                            return { [key]: JSON.parse(value) };
                        } catch (error) {
                            return { [key]: value };
                        }
                    });

                    const userString = data.find(item => item.user)?.user;
                    if (userString) {
                        setSocietyId(userString.societyId);
                        setSequrityId(userString.sequrityId);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch all data from AsyncStorage", error);
            }
        };
        getAllAsyncStorageData();
    }, []);

    useEffect(() => {
        if (societyId && sequrityId) {
            dispatch(fetchGuard({ societyId, sequrityId }));
        }
    }, [societyId, sequrityId, dispatch]);

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Avatar.Image
                    source={{ uri: `${ImagebaseURL}${Guard.pictures}` } || require("../../../../assets/Security/images/policeman.png")}
                    style={styles.image}
                    size={100}
                />
            </View>
            <View style={styles.detailsWrapper}>
                <Text style={styles.label}>Details:</Text>
                <View style={styles.card}>
                    <View style={styles.textContainer}>
                        <Text style={styles.heading}>{Guard.sequrityId}</Text>
                        <Text style={styles.heading}>{Guard.name}</Text>
                        <Text style={styles.heading}>{Guard.email}</Text>
                        <Text style={styles.heading}>{Guard.aadharNumber}</Text>
                    </View>
                </View>
            </View>
            {Guard.address && (
                <View style={styles.addressWrapper}>
                    <Text style={styles.label}>Address:</Text>
                    <View style={styles.card}>
                        <View style={styles.addressContainer}>
                            {Guard.address.addressLine1 && <Text style={styles.address}>{Guard.address.addressLine1}</Text>}
                            {Guard.address.addressLine2 && <Text style={styles.address}>{Guard.address.addressLine2}</Text>}
                            {Guard.address.state && <Text style={styles.address}>{Guard.address.state}</Text>}
                            {Guard.address.postalCode && <Text style={styles.address}>{Guard.address.postalCode}</Text>}
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "white",
    },
    detailsWrapper: {
        marginBottom: 20,  
    },
    card: {
        backgroundColor: "#F3E1D5",
        borderRadius: 10,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageContainer: {
        borderRadius: 90,
        padding: 10,
        alignItems: "center",
        marginBottom: 15,
    },
    image: {
        borderRadius: 50,
    },
    textContainer: {
        alignItems: "flex-start",
        padding: 10,
    },
    heading: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,

    },
    addressWrapper: {
        marginTop: 20,
    },
    addressContainer: {
        borderRadius: 10,
        padding: 10,
    },
    label: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#800336",
        marginBottom: 10,
    },
    address: {
        fontSize: 18,
        fontWeight: "bold",
        marginRight: 10,  
    },
});

export default Guard; 