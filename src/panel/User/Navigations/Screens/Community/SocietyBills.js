import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSocietyBills } from '../../../Redux/Slice/CommunitySlice/SocietyBillsSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { ActivityIndicator } from 'react-native-paper';
const SocietyBills = () => {
    const dispatch = useDispatch();
    const [societyId, setSocietyId] = useState('');
    const { society } = useSelector((state) => state.societyBills.societyBills);
    const { loading, error } = useSelector((state) => state.societyBills);
    useEffect(() => {
        const getUserName = async () => {
            try {
                const userString = await AsyncStorage.getItem("user");
                if (userString !== null) {
                    const user = JSON.parse(userString);
                    setSocietyId(user.societyId);
                }
            } catch (error) {
                console.error("Failed to fetch the user from async storage", error);
            }
        };

        getUserName();
    }, []);

    useEffect(() => {
        if (societyId) {
            dispatch(fetchSocietyBills(societyId));
        }
    }, [dispatch, societyId]);



    const downloadFile = async (relativeUrl) => {
        try {
            const baseUrl = "https://livinsync.onrender.com";
            const fullUrl = `${baseUrl}${relativeUrl}`;
            const fileName = relativeUrl.split('/').pop();
            const fileUri = FileSystem.documentDirectory + fileName;

            console.log('Attempting to download file from:', fullUrl);
            const { uri } = await FileSystem.downloadAsync(fullUrl, fileUri);
            console.log('File downloaded to:', uri);

            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant access to your media library.');
                return;
            }

            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (!fileInfo.exists) {
                Alert.alert('Error', 'File not found.');
                return;
            }
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                console.log('Sharing is not available on this platform.');
            }
        } catch (error) {
            console.error('File download error:', error.message);
            Alert.alert('Error', 'Failed to download the file.');
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.billContainer}>
            <View style={{ width: "100%", position: 'relative' }}>
                {console.log(item.pictures)}
                <Image
                    source={{ uri: `https://livinsync.onrender.com${item.pictures}` }}
                    style={styles.billImage}
                    resizeMode="contain"
                />
                <View style={styles.chip}>
                    <Text style={styles.chipText}>{item.status}</Text>
                </View>

                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={() => downloadFile(item.pictures)}
                >
                    <Ionicons name="share-social-outline" size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.header}>
                <Text style={{ fontSize: 20, fontWeight: '600', color: "#202020" }}>{item.monthAndYear}</Text>
            </View>

            <View style={styles.amountContainer}>
                <View>
                    <Text style={{ fontSize: 16, fontWeight: '400', color: "#777" }}>{item.name}</Text>
                    <Text style={{ fontSize: 14, fontWeight: '400', color: "#777" }}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '600' }}>₹{item.amount}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#7d0431" />
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
                <Text style={styles.noDataText}>No Bills Found</Text>
            </View>
        );
    }

    if (!society || society.length === 0) { // Show spinner while loading
        return (
            <View style={styles.noDataContainer}>
                <Image
                    source={require('../../../../../assets/Admin/Imgaes/nodatadound.png')}
                    style={styles.noDataImage}
                    resizeMode="contain"
                />
                <Text style={styles.noDataText}>No Bills Found</Text>
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <FlatList
                data={society?.bills || []}
                renderItem={renderItem}
                keyExtractor={item => item._id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    containerSpin: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: "80%"
    },
    horizontalSpin: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
    container: {
        flex: 1,
        backgroundColor: "#f6f6f6",
        marginHorizontal: 10,
    },
    billContainer: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#fff',
        elevation: 2,
        marginTop: 10,
    },
    billImage: {
        height: 150,
        width: "100%",
        backgroundColor: "#ddd",
        borderRadius: 10,
    },
    chip: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: '#4caf50',
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 8,
        zIndex: 1,
    },
    shareButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
        padding: 8,
        borderRadius: 20,
    },
    chipText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    amountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center",
    },
    loadingContainer: {
        flex: 1,
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
});
export default SocietyBills;
