import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TouchableWithoutFeedback, } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdvertisements, deleteAdvertisement } from './AdvertisementSlice';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ImagebaseURL } from '../../../Security/helpers/axios';

const Advertisements = () => {
  const [menuVisible, setMenuVisible] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigation();

  const adds = useSelector(state => state.advertisements.adds || []);
  const successMessage = useSelector(state => state.advertisements.successMessage);
  const status = useSelector(state => state.advertisements.status);
  const error = useSelector(state => state.advertisements.error);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchAdvertisements());
    }, [dispatch])
  );

  const handleView = (item) => {
    navigate.navigate('View Details', { id: item._id });
    setMenuVisible(false)
  };

  const handleEdit = (item) => {
    navigate.navigate('Edit Post', { id: item._id });
    setMenuVisible(false)
  };

  const handleDelete = (item) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this Advertisement?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteAdvertisement({ id: item._id })).then(() => {
              Alert.alert('Success', successMessage);
              dispatch(fetchAdvertisements());
            }).catch((error) => {
              console.error('Error:', error);
            });
          },
        },
      ]
    );
  };

  const toggleMenu = (itemId) => {
    setMenuVisible(menuVisible === itemId ? null : itemId);
  };

  const handleOutsidePress = () => {
    setMenuVisible(null);
  };

  const renderAddItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleView(item)}>
      <View style={styles.card}>
        <Image
          source={item.pictures[0]?.img ? { uri: `${ImagebaseURL}${item.pictures[0].img}` } : require('../../../../assets/Admin/Imgaes/ad.jpg')}
          style={styles.image}
        />
        <View style={styles.detailsContainer}>
          <Text style={styles.text}>{item.userName}</Text>
          <Text style={styles.text}>{item.phoneNumber}</Text>
          <Text style={styles.text}>{item.details.block}</Text>
          <Text style={styles.text}>Flat No: {item.details.flat_No}</Text>
        </View>
        <TouchableOpacity style={styles.menuIcon} onPress={() => toggleMenu(item._id)}>
          <Icon name="more-vert" size={25} color="#aaadab" />
        </TouchableOpacity>
        {menuVisible === item._id && (
          <TouchableWithoutFeedback>
            <View style={styles.actionMenu}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Text style={styles.menuItem}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)}>
                <Text style={styles.menuItem}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    </TouchableOpacity>
  );


  if (error || adds?.length === 0) { // Show spinner while loading
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
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.container}>
        {status === "loading" ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7d0431" />
          </View>
        ) : (
          <FlatList
            data={adds}
            renderItem={renderAddItem}
            keyExtractor={(item, index) => item._id || index.toString()} // Use item._id if available
            ListEmptyComponent={<Text>No data found</Text>}
          />
        )}

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigate.navigate('Add Post')}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  image: {
    width: 150,
    height: 100,
    borderRadius: 10,
    marginRight: 20,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    maxWidth: '99%',
    alignSelf: 'center',

  },
  detailsContainer: {
    flex: 1,
  },
  menuIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  spinner: {
    marginTop: 20,
  },
  actionMenu: {
    position: 'absolute',
    top: 10,
    right: 30,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1.5,
    padding: 10,
  },
  menuItem: {
    paddingVertical: 3,
    color: '#630000',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#630000',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
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

export default Advertisements;
