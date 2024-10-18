import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import CheckIn from './StaffCheckin';
import CheckOut from './StaffCheckOut';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchStaffVisitors } from '../../User/Redux/Slice/Security_Panel/StaffInandOutSlice';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

const StaffVisitors = () => {
    const dispatch = useDispatch();
    const [societyId, setSocietyId] = useState(null);
    const { status } = useSelector((state) => state.staffVisitor);
    const staffVisitors = useSelector((state) => state.staffVisitor.staffVisitors);
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
                dispatch(fetchStaffVisitors(societyId));
            }
        }, [dispatch, societyId])
    );

    const checkInData = staffVisitors.filter(visitor => visitor.checkInDateTime && !visitor.checkOutDateTime);
    const checkOutData = staffVisitors.filter(visitor => visitor.checkOutDateTime);

    if (status === 'loading') {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7d0431" />
            </View>
        );
    }

    return (
            <SafeAreaView style={styles.container}>
                <Tab.Navigator
                    screenOptions={{
                        tabBarLabelStyle: { fontWeight: 'bold' },
                        tabBarActiveTintColor: '#800336',
                        tabBarInactiveTintColor: 'black',
                        tabBarIndicatorStyle: { backgroundColor: '#800336' },
                        tabBarStyle: { backgroundColor: '#f6f6f6' },
                    }}
                >
                    <Tab.Screen name="Check In">
                        {() => <CheckIn data={checkInData} />}
                    </Tab.Screen>
                    <Tab.Screen name="Check Out">
                        {() => <CheckOut data={checkOutData} />}
                    </Tab.Screen>
                </Tab.Navigator>
            </SafeAreaView>
    );
};

export default StaffVisitors;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
