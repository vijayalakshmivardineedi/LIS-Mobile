import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchVisitors } from '../../../User/Redux/Slice/Security_Panel/InandOutSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import CheckIn from './Check-In';
import CheckOut from './Check-Out';
import Waiting from './Waiting';

const Tab = createMaterialTopTabNavigator();

const InandOut1 = () => {
    const dispatch = useDispatch();
    const [societyId, setSocietyId] = useState(null);
    const { visitors = [], status } = useSelector((state) => state.visitors);

    useEffect(() => {
        const getSocietyId = async () => {
            try {
                const user = await AsyncStorage.getItem('user');
                const id = JSON.parse(user).societyId;
                if (id !== null) {
                    setSocietyId(id);
                } else {
                    console.error('No societyId found in AsyncStorage');
                }
            } catch (error) {
                console.error('Error fetching societyId from AsyncStorage:', error);
            }
        };
        getSocietyId();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            if (societyId) {
                dispatch(fetchVisitors(societyId));
            }
        }, [dispatch, societyId])
    );
    const checkInData = visitors.filter((visitor) => visitor.status === 'Check In');
    const checkOutData = visitors.filter((visitor) => visitor.status === 'Check Out');
    const waitingData = visitors.filter((visitor) => visitor.status === 'Waiting');

    if (status === 'loading') {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7d0431" />
            </View>
        );
    }

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#800336',
                tabBarLabelStyle: { fontWeight: 'bold' },
                tabBarIndicatorStyle: { backgroundColor: '#800336' },
                tabBarStyle: { backgroundColor: '#f6f6f6' },
            }}
        >
            <Tab.Screen name="Check In">
                {() => <CheckIn data={checkInData} />}
            </Tab.Screen>
            <Tab.Screen name="Waiting">
                {() => <Waiting data={waitingData} />}
            </Tab.Screen>
            <Tab.Screen name="Check Out">
                {() => <CheckOut data={checkOutData} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
};

export default InandOut1;

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
