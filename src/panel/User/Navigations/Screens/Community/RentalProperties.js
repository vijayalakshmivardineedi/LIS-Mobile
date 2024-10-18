import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ImageBackground, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { getSocietiesByAdvertisements } from '../../../Redux/Slice/CommunitySlice/Rental/rentalSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PropertyItem = ({ property, navigation }) => {
  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('RentalPropertyType', { advertisements: property })}
    >
      <ImageBackground
        source={
          property.societyImage && property.societyImage.length > 0
            ? { uri: `https://livinsync.onrender.com${property.societyImage[0]}` }
            : require("../../../../../assets/User/images/vasanthvihar.jpg")
        }
        style={styles.image}>
        <View style={styles.overlay}>
          <Text style={styles.propertyName}>{property.societyName}</Text>
          <Text style={styles.propertyHouses}>{property.advertisements.length}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity >
  );
};

const RentalProperties = ({ navigation }) => {
  const dispatch = useDispatch();
  const [userType, setUserType] = useState('');
  const { properties } = useSelector((state) => state.rental);
  useEffect(() => {
    const getUserName = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString !== null) {
          const user = JSON.parse(userString);
          setUserType(user.userType);
        }
      } catch (error) {
        console.error("Failed to fetch the user from async storage", error);
      }
    };

    getUserName();
  }, []);
  useEffect(() => {
    dispatch(getSocietiesByAdvertisements());
  }, [dispatch]);

  const handleLeaseTermination = () => {
    navigation.navigate("Create Rental");
  };

  const ListHeader = () => (
    <View style={styles.detailsContainer}>
      <Card style={styles.card}>
        <Card.Cover source={require("../../../../../assets/User/images/house4.jpg")} />
        <Card.Actions style={styles.cardActions}>
          <Text style={styles.instructionText}>
            If you want to rent your flat, click here:
          </Text>
          <Button
            mode="contained"
            onPress={handleLeaseTermination}
            style={styles.leaseButton}
            labelStyle={styles.leaseButtonText}
          >
            Lease
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={userType === 'Owner' ? ListHeader : null}
        data={properties.societies}
        renderItem={({ item }) => <PropertyItem property={item} navigation={navigation} />}
        keyExtractor={(item) => `${item.id}_${Math.random()}`}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },

  listContainer: {
    padding: 16,
  },
  itemContainer: {
    marginBottom: 16,
    marginVertical: 20,
  },
  image: {
    width: '100%',
    height: Dimensions.get('window').width * 0.5,
    justifyContent: 'flex-end',
    borderRadius: 10,
    overflow: 'hidden',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 10,
  },
  propertyName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  propertyHouses: {
    color: '#fff',
    fontSize: 14,
  },
});

export default RentalProperties;
