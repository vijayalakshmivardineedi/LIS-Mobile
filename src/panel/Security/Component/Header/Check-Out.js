
import React, {  useState } from 'react';
import { View, Text, FlatList, StyleSheet, } from 'react-native';
import { ImagebaseURL } from '../../helpers/axios';
import {  useSelector } from 'react-redux';
import MyDialog from '../../DialogBox/DialogBox';
import { Avatar } from 'react-native-paper'

const CheckOut = ({ data  }) => {

  const successMessage = useSelector(state => state.checkOuting.successMessage);
  const error = useSelector(state => state.checkOuting.error);
  const [showDialog, setShowDialog] = useState(false);




  const renderItem = ({ item }) => {

    return (
      <View style={styles.itemContainer}>
        <View style={styles.imageContainer}>
          <Text style={styles.imageText}>{item.visitorId}</Text>
          {item.pictures ? (
            <Avatar.Image
              source={{ uri: `${ImagebaseURL}${item.pictures}` }}
              style={styles.avatar}
            />
          ) : (
            <Text style={styles.noImageText}>No Image</Text>
          )}
        </View>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemText}>{item.name}</Text>
          <Text style={styles.itemSubText}>{item.role}</Text>
          <Text style={styles.itemSubText}>{item.block}</Text>
          <Text style={styles.itemSubText}>{item.flatNo}</Text>
          <Text style={styles.itemSubText}>{item.phoneNumber}</Text>
        </View>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemSubText}>
            <Text style={{ fontWeight: 'bold', color: 'black' }}>Check In</Text>{'\n'}
            {new Date(item.checkInDateTime).toLocaleDateString()}{'\n'}{new Date(item.checkInDateTime).toLocaleTimeString()}
          </Text>
          <Text style={styles.itemSubText}>
            <Text style={{ fontWeight: 'bold', color: 'black' }}>Check Out</Text>{'\n'}
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
    flex:1,
    backgroundColor:"#fff"
  },
  itemContainer: {
    display: 'flex',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
  },
  avatar: {
    backgroundColor:"#ccc",marginTop:10

  },
  noImageText: {
    marginTop: 15
  },
  imageContainer: {
    flex: 1,
    marginRight: 15,
    alignItems: 'center'
  },
  itemTextContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemSubText: {
    color: '#888',
  },
  imageText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#800336',
    alignItems: 'center'
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
    backgroundColor: 'red',
    width: 70,
    height: 40,
  },
});

export default CheckOut;