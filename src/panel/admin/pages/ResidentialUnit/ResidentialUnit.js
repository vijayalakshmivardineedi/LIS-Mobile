import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, FlatList, Alert, ScrollView, ActivityIndicator, Image } from "react-native";
import { Searchbar, Avatar, FAB, Snackbar } from "react-native-paper";
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, deleteUser } from './ResidentsSlice';
import { ImagebaseURL } from "../../../Security/helpers/axios";
import { TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from "@react-navigation/native";

const ResidentialUnit = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { users, status, error } = useSelector((state) => state.AdminResidents);
    const [searchQuery, setSearchQuery] = useState('');
    const [anchor, setAnchor] = useState(null);
    const [selectedResident, setSelectedResident] = useState(null);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    const filteredResidents = users.filter((resident) =>
        resident.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleMenuPress = (resident) => {
        setSelectedResident(resident);
        setAnchor(anchor ? null : resident._id);
    };
    const handleEdit = (resident) => {
        navigation.navigate('Edit Resident', { resident: selectedResident })
        setSelectedResident(resident);
        setAnchor(anchor ? null : resident._id);
    };

    const handleDelete = () => {
        if (selectedResident) {
            Alert.alert(
                "Confirm Delete",
                `Are you sure you want to delete ${selectedResident.name}?`,
                [
                    {
                        text: "Cancel",
                        onPress: () => setAnchor(null),
                        style: "cancel"
                    },
                    {
                        text: "Delete",
                        onPress: () => {
                            dispatch(deleteUser({ _id: selectedResident._id })).then(() => {
                                setAnchor(null);
                                setSnackbarMessage(`${selectedResident.name} has been successfully deleted.`);
                                setSnackbarVisible(true);
                                dispatch(fetchUsers());
                            });
                        }
                    }
                ]
            );
        }
    };

    const renderResident = ({ item }) => {
        const chipStyle = item.ownerType === 'Owner' ? styles.ownerChip : styles.tenantChip;

        return (
            <TouchableOpacity style={styles.residentCard} onPress={() => {
                setAnchor(false);
                navigation.navigate("Residents Details", { resident: item })
            }
            }>
                <Avatar.Image source={{ uri: `${ImagebaseURL}${item.profilePicture}` }} size={50} style={{ backgroundColor: "#ccc" }} />
                <View style={styles.residentDetails}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.flatBlock}>Flat: {item.flatNumber}, {item.buildingName}</Text>
                    <Text style={styles.phoneNumber}>Phone: {item.mobileNumber}</Text>
                </View>
                <View style={[styles.ownerTypeChip, chipStyle]}>
                    <Text style={styles.chipLabel}>{item.userType}</Text>
                </View>
                <TouchableOpacity onPress={() => handleMenuPress(item)}>
                    <Icon name="more-vert" size={20} color="#424242" />
                </TouchableOpacity>
                {
                    anchor === item._id && (
                        <ScrollView style={[styles.menuList, { top: 0 }]}>
                            <TouchableOpacity onPress={handleEdit} style={styles.menuItem}>
                                <Text>Edit</Text>
                            </TouchableOpacity>
                            <View style={styles.divider} />
                            <TouchableOpacity onPress={handleDelete} style={styles.menuItem}>
                                <Text>Delete</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    )
                }
            </TouchableOpacity >
        );
    };

    if (status === 'loading') {
        return <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}><ActivityIndicator color="#7d0431" size={50} /></View>;
    }

    if (status === 'failed') {
        return <Text>Error: {error}</Text>;
    }

    if (error || status === 'failed' || filteredResidents?.length === 0) { // Show spinner while loading
        return (
            <View style={styles.noDataContainer}>
                <Image
                    source={require('../../../../assets/Admin/Imgaes/nodatadound.png')}
                    style={styles.noDataImage}
                    resizeMode="contain"
                />
                <Text style={styles.noDataText}>No Adds Found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder="Search"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.search}
                inputStyle={{
                    color: '#424242',
                    fontSize: 13,
                }}
                iconColor="#757575"
                placeholderTextColor="#9e9e9e"
            />

            <FlatList
                data={filteredResidents}
                keyExtractor={(item) => item._id}
                renderItem={renderResident}
            />

            <FAB
                style={styles.fab}
                icon="plus"
                onPress={() => navigation.navigate('Add Residents')}
                color="white"
            />

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                action={{
                    label: 'Dismiss',
                    onPress: () => setSnackbarVisible(false),
                }}>
                {snackbarMessage}
            </Snackbar>
        </View>
    );
};

export default ResidentialUnit;

const styles = StyleSheet.create({
    container: {
        flex: 1,

        paddingHorizontal: 10,
        paddingTop: 10,
        backgroundColor: '#fff',
    },
    search: {
        backgroundColor: '#f6f6f6',
        borderRadius: 10,
        borderColor: '#bdbdbd',
        borderWidth: 1,
        marginBottom: 5,
    },
    residentCard: {
        flexDirection: 'row',
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        borderBottomWidth: 1,
        borderColor: '#e0e0e0',
        position: 'relative',
    },
    residentDetails: {
        justifyContent: 'center',
        marginLeft: 10,
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#424242',
    },
    flatBlock: {
        fontSize: 14,
        color: '#757575',
    },
    phoneNumber: {
        fontSize: 14,
        color: '#757575',
    },
    ownerTypeChip: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        width: 65,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        alignItems: "center"
    },
    ownerChip: {
        backgroundColor: '#7d0431',
        color: '#fff',
    },
    tenantChip: {
        backgroundColor: '#7d0431',
        color: '#fff',
    },
    chipLabel: {
        fontSize: 12,
        color: '#fff',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 18,
        bottom: 0,
        backgroundColor: '#7D0431',

        borderRadius: 50
    },
    menuList: {
        position: 'absolute',
        right: 30,
        backgroundColor: '#fff',
        borderRadius: 5,
        elevation: 3,
        padding: 5,
        zIndex: 10,
        overflow: "visible"
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    menuItem: {
        padding: 10,
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataImage: {
        width: 150,
        height: 150,
        marginBottom: 0,
    },
    noDataText: {
        fontSize: 18,
        color: '#7d0431',
        textAlign: 'center',
    },
});
