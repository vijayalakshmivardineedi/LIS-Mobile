import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/FontAwesome';
import Dashboard from '../pages/Dashboard/Dashboard';
import Advertisements from '../pages/Advertisements/Advertisements';
import ResidentialUnit from '../pages/ResidentialUnit/ResidentialUnit';
import Events from '../pages/Events/Events';
import Polls from '../pages/Polls/Polls';
import VisitorManagement from '../pages/VisistorManagement/VisistorManagement';
import Amenities from '../pages/Amenities/Amenities';
import Inventory from '../pages/Inventory/Inventory';
import Complaints from '../pages/Complaints/Complaints';
import SocietyBills from '../pages/SocietyBills/SocietyBills';
import Security from '../pages/Security/Security';
import Services from '../pages/Services/Services';
import Maintenance from '../pages/Maintenance/Maintenance';
import NoticeBoard from '../pages/NoticeBoard/NoticeBoard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../../User/Redux/Slice/AuthSlice/Login/LoginSlice';
import { useDispatch, useSelector } from 'react-redux';
import { CommonActions, useNavigation } from '@react-navigation/native';
import EmergencyContact from '../pages/EmergencyContacts/EmergencyContact';
import { fetchResidentProfile } from '../pages/Advertisements/profileSlice';
import { fetchNotifications } from '../pages/Dashboard/DashboardSlice';
const Drawer = createDrawerNavigator();

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const fetchedProfile = useSelector(state => state.profile.profile);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const expiryDate = fetchedProfile?.expiryDate ? new Date(fetchedProfile?.expiryDate) : null;
  const currentDate = new Date();
  const daysRemaining = expiryDate ? Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24)) : null;
  const notifications = useSelector(state => state.DashBoard.Notification || []);
  useEffect(() => {
    dispatch(fetchResidentProfile());
    dispatch(fetchNotifications());
  }, [])

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleProfile = () => {
    navigation.navigate("AdminProfile")
    toggleDropdown();
  };
  const handlePassword = () => {
    navigation.navigate("Resetpassword")
    toggleDropdown();
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userToken');
    } catch (e) {
      console.log('Error clearing user from AsyncStorage:', e);
    }
    dispatch(logout());
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
  };
  
  if (daysRemaining !== null && daysRemaining <= 0) {
          navigation.navigate("Renewal Plan")
      }

  return (
    <View style={{ flex: 1 }}>
      <Drawer.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: "center", gap: 15, marginRight: 10 }}>
              <TouchableOpacity onPress={(() => navigation.navigate("Admin Notifications"))}>
                <Icon name="bell-o" size={25} color="#7d0431" />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notifications?.length > 0 ? notifications.length : null}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleDropdown}>
                <Icon name="user-circle-o" size={25} color="#7d0431" />
              </TouchableOpacity>
              {dropdownVisible && (
                <View style={styles.dropdown}>
                  <TouchableOpacity onPress={handleProfile} style={styles.menuItem}>
                    <Text style={styles.menuText}>Profile</Text>
                  </TouchableOpacity>
                  <View style={{ borderBottomWidth: 1, borderColor: "#ccc" }} />
                  <TouchableOpacity onPress={handlePassword} style={styles.menuItem}>
                    <Text style={styles.menuText}>Reset Password</Text>
                  </TouchableOpacity>
                  <View style={{ borderBottomWidth: 1, borderColor: "#ccc" }} />

                  <TouchableOpacity onPress={handleLogout} style={styles.menuItem}>
                    <Text style={styles.menuText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ),
          drawerActiveTintColor: '#7d0431',
          drawerInactiveTintColor: 'gray',
        }}

      >
        <Drawer.Screen name="Dashboard" component={Dashboard} />
        <Drawer.Screen name="Advertisements" component={Advertisements} />
        <Drawer.Screen name="Residential Management" component={ResidentialUnit} />
        <Drawer.Screen name="Security" component={Security} />
        <Drawer.Screen name="Services" component={Services} />
        <Drawer.Screen name="Complaints" component={Complaints} />
        <Drawer.Screen name="Notice Board" component={NoticeBoard} />
        <Drawer.Screen name="Events" component={Events} />
        <Drawer.Screen name="Polls" component={Polls} />
        <Drawer.Screen name="Visitor Management" component={VisitorManagement} />
        <Drawer.Screen name="Amenities" component={Amenities} />
        <Drawer.Screen name="Inventory" component={Inventory} />
        <Drawer.Screen name="Society Bills" component={SocietyBills} />
        <Drawer.Screen name="Maintenance Bills" component={Maintenance} />
        <Drawer.Screen name="Quick Contacts" component={EmergencyContact} />
      </Drawer.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: 30,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    padding: 10,
    width: 120,
    zIndex: 1,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 16
  },
});
