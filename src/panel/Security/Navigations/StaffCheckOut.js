import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import MyDialog from '../DialogBox/DialogBox';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CheckOut = ({ data, setActiveTab }) => {
  const [societyId, setSocietyId] = useState(null);
  const dispatch = useDispatch();
  const successMessage = useSelector(state => state.checkOuting.successMessage);
  const error = useSelector(state => state.checkOuting.error);
  const [showDialog, setShowDialog] = useState(false);

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

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemText}>{item.userId}</Text>
          <Text style={styles.itemSubTextBold}>{item.name}</Text>
          <Text style={styles.itemSubText}>{item.serviceType}</Text>
        </View>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemSubText}>
            <Text style={styles.boldText}>Check In</Text>{'\n'}
            {new Date(item.checkInDateTime).toLocaleDateString()}{'\n'}{new Date(item.checkInDateTime).toLocaleTimeString()}
          </Text>
        </View>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemSubText}>
            <Text style={styles.boldText}>Check Out</Text>{'\n'}
            {new Date(item.checkOutDateTime).toLocaleDateString()}{'\n'}{new Date(item.checkOutDateTime).toLocaleTimeString()}
          </Text>
        </View>
        <MyDialog
          message={successMessage || error}
          showDialog={showDialog}
          onClose={() => setShowDialog(false)}
        />
      </View>
    );
  };

  const sortedData = data.sort((a, b) => new Date(b.checkOutDateTime) - new Date(a.checkOutDateTime));

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedData}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 10,
  },
  itemTextContainer: {
    flex: 1,
    justifyContent: "space-between",
    marginHorizontal: 5,
  },
  itemText: {
    fontSize: 18,
    fontWeight: '600',
    color: "#800336",
  },
  itemSubText: {
    color: '#888',
  },
  itemSubTextBold: {
    color: 'black',
    fontWeight: '600',
  },
  boldText: {
    fontWeight: 'bold',
    color: 'black',
  },
  list: {
    paddingHorizontal: 15,
  },
});

export default CheckOut;
