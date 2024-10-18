import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmergencyContacts } from '../../../Redux/Slice/CommunitySlice/EmergencyContactSlice';
import Icon from 'react-native-vector-icons/Ionicons';

import AsyncStorage from '@react-native-async-storage/async-storage';
const EmergencyContacts = () => {
  const dispatch = useDispatch();
  const contacts = useSelector((state) => state.emergencyContacts.contacts);
  const status = useSelector((state) => state.emergencyContacts.status);
  const error = useSelector((state) => state.emergencyContacts.error);
  const [societyId, setSocietyId] = useState(null);

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
  useEffect(() => {
    if (societyId) {
      dispatch(fetchEmergencyContacts(societyId))
    }
  }, [dispatch, societyId]);
  const handleCall = (phone) => {
    const url = `tel:${phone}`;
    Linking.openURL(url).catch((err) => Alert.alert('Error', 'Failed to open dialer'));
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.contactItem}>
        <View style={styles.contactInfo}>
          <Text style={styles.name}>{item.profession}</Text>
          <Text style={styles.phone}>{item.name}</Text>
          <Text style={styles.phone}>{item.phoneNumber}</Text>
        </View>
        <TouchableOpacity style={styles.callButton} onPress={() => handleCall(item.phoneNumber)}>
          <Icon name="call-outline" size={24} color="#7d0431" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (status === 'loading') {
    return <ActivityIndicator size="large" color="#630000" style={styles.loadingContainer} />;
  }

  if (status === 'failed') {
    return (<View style={styles.noDataContainer}>
      <Image
        source={require('../../../../../assets/Admin/Imgaes/nodatadound.png')}
        style={styles.noDataImage}
        resizeMode="contain"
      />
      <Text style={styles.noDataText}>No Contacts Found</Text>
    </View>);
  }

  if (!contacts || contacts.length === 0) { // Show spinner while loading
    return (
      <View style={styles.noDataContainer}>
        <Image
          source={require('../../../../../assets/Admin/Imgaes/nodatadound.png')}
          style={styles.noDataImage}
          resizeMode="contain"
        />
        <Text style={styles.noDataText}>No Contacts Found</Text>
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
        <Text style={styles.noDataText}>No Amenities Found</Text>
      </View>)
  }
  return (
    <View style={styles.container}>
      <FlatList
        data={contacts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({

  containerSpin: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontalSpin: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },


  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    backgroundColor: '#fff',
    elevation: 2,
    borderColor: '#ccc',
    borderRadius: 12,
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: 'center',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#C59358',
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#484848"
  },
  phone: {
    fontSize: 16,
    color: '#777',
  },
  callButton: {
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

export default EmergencyContacts;
