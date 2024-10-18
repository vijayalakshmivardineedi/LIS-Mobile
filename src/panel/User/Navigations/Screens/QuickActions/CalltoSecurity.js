import React, { useEffect,  useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList,  } from 'react-native';
import { Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import call from 'react-native-phone-call';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSecurities } from '../../../Redux/Slice/QuickActionsSlice/SecuiritySlice';
import AsyncStorage from '@react-native-async-storage/async-storage';


const CalltoSecurity = () => {
    const dispatch = useDispatch();
    const [societyId, setSocietyId] = useState("");
    const sequrity = useSelector((state) => state.security.security);
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
            dispatch(fetchSecurities(societyId));
        }
    }, [societyId, dispatch]);
    const handleCallPress = (phone) => {
        const args = {
            number: phone,
            prompt: true,
        };
        call(args).catch(console.error);
    };
    const renderItem = ({ item }) => (

        <View style={styles.itemContainer}>
            <Avatar.Image source={{ uri: `https://livinsync.onrender.com${item.pictures}` }} size={60} style={{ backgroundColor: "#ccc" }} />
            <View style={styles.textContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.phone}>{item.phoneNumber}</Text>
            </View>
            <TouchableOpacity onPress={() => handleCallPress(item.phoneNumber)}>
                <Icon name="phone" size={30} color="#c59358" style={styles.callIcon} />
            </TouchableOpacity>
        </View>

    );

    return (
        <View style={styles.container}>
            <FlatList
                data={sequrity.sequrity}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                style={{ marginTop: 20 }}
            />
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        zIndex: 1
    },

    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    switchButtonActive: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    switchTextActive: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 5,
    },
    dropdownContainer: {
        marginTop: 10,
        width: "100%",
    },

    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginHorizontal: 10,
        marginVertical: 5,
    },
    textContainer: {
        marginLeft: 10,
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    phone: {
        fontSize: 14,
        color: '#666',
        marginLeft: 10,
    },
    callIcon: {
        marginLeft: 'auto',
    },
    separator: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 5,

    },
    icon: {
        width: 20,
        height: 20,
        marginLeft: 5,
    },
});

export default CalltoSecurity;