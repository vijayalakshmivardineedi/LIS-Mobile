import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const WaitingForAccessScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkUserVerification = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const user = JSON.parse(userString);
          const isVerified = user.isVerified;

          // Navigate to Tabs if verified
          console.log(isVerified)
          if (isVerified) {
            navigation.reset({
              index: 0,
              routes: [{ name: "Tabs" }],
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    checkUserVerification();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../../assets/User/images/Waiting-pana.png")}
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={styles.message}>Waiting For Admin Access</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7D0413',
  },
});

export default WaitingForAccessScreen;
