import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MyDialog from '../DialogBox/DialogBox';
import { fetchStaffVisitors } from '../../User/Redux/Slice/Security_Panel/StaffInandOutSlice';
import { fetchCheckOut } from '../../User/Redux/Slice/Security_Panel/CheckOutSlice';

const CheckIn = ({ data, setActiveTab }) => {
  const [responses, setResponses] = useState({});
  const [societyId, setSocietyId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const dispatch = useDispatch();
  const successMessage = useSelector(state => state.checkOuting.successMessage);
  const error = useSelector(state => state.checkOuting.error);

  useEffect(() => {
    const getSocietyId = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        const id = JSON.parse(user).societyId;
        if (id) {
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

  const handleCheckOut = (id) => {
    const payload = {
      societyId,
      id:id._id,
      userId:id.userId,
      visitorType: "Staff"
    };
    dispatch(fetchCheckOut(payload)).then((response) => {
      console.log(response)
      if (response.meta.requestStatus === 'fulfilled') {
        setShowDialog(true);
        setTimeout(() => {
          dispatch(fetchStaffVisitors(societyId));
          setShowDialog(false);
        }, 2000);
      } else {
        setShowDialog(true);
        setTimeout(() => {
          dispatch(fetchStaffVisitors(societyId));
          setShowDialog(false);
        }, 2000);
      }
    }).catch((error) => {
      console.error('Error:', error);
    });
  };

  const renderItem = ({ item }) => {
    const response = responses[item._id];

    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemTextContainer}>
        <Text style={styles.itemname}>{item.userId}</Text>
          <Text style={styles.itemText}>{item.name}</Text>
        
          <Text style={styles.itemSubText}>{item.serviceType}</Text>
        </View>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemSubText}>
            <Text style={{ fontWeight: 'bold', color: 'black' }}>Check In</Text>{'\n'}
            {new Date(item.checkInDateTime).toLocaleDateString()}{'\n'}{new Date(item.checkInDateTime).toLocaleTimeString()}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          {!response && (
            <TouchableOpacity
              style={[styles.button, styles.redButton]}
              onPress={() => handleCheckOut(item)}
            >
              <Text style={{ color: '#fff', fontSize: 10 }}>Check Out</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const sortedData = data.sort((a, b) => new Date(b.checkInDateTime) - new Date(a.checkInDateTime));

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedData}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        style={styles.list}
      />
      <MyDialog
        message={successMessage || error}
        showDialog={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container:{
    flex:1,
backgroundColor:"#fff"
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemname: {
    fontSize: 18,
    fontWeight: '600',
    color:"#800336"
  },

  itemSubText: {
    fontSize: 13,
    color: '#888',
  },
  list: {
    paddingHorizontal: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redButton: {
    backgroundColor: '#7D0431',
    width: 70,
    height: 40,
  },
});

export default CheckIn;
