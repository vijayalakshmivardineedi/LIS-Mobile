import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVisitorVerify, resetState} from '../../../User/Redux/Slice/Security_Panel/HomeScreenSlice';
import MyDialog from '../../DialogBox/DialogBox';

export default function Sample() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [societyId, setSocietyId] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [showDialog, setShowDialog] = useState(false);
  const successMessage = useSelector(state => state.homeScreen.successMessage);
  const error = useSelector(state => state.homeScreen.error);

  console.log(selectedOption)
  console.log(societyId)


  useEffect(() => {
    const getStoredData = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          const id = parsedUser.societyId;
          const option = await AsyncStorage.getItem('selectedVisitorOption');

          if (id !== null) {
            setSocietyId(id);
          } else {
            console.error('No societyId found in AsyncStorage');
          }

          if (option !== null) {
            setSelectedOption(option);
          } else {
            console.error('No selectedVisitorOption found in AsyncStorage');
          }
        } else {
          console.error('No user data found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching data from AsyncStorage:', error);
      }
    };
    getStoredData();
  }, []);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };
    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
  console.log(data)

    const payload = {
      societyId,
      id: data,
      visitorType: selectedOption
    };
    dispatch(fetchVisitorVerify(payload)).then((response) => {
      console.log("Heelo",payload)
      if (response.meta.requestStatus === 'fulfilled') {
        setShowDialog(true);
        setTimeout(() => {
          dispatch(resetState());
          navigation.navigate('SecurityTabs');

          setShowDialog(false);
        }, 2000);
      } else {
        setShowDialog(true);
        setTimeout(() => {
          dispatch(resetState());
          navigation.navigate('SecurityTabs');
          setShowDialog(false);
        }, 2000);
      }
    }).catch((error) => {
      console.error('Error:', error);
    });
  };




  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <MyDialog
        message={successMessage || error}
        showDialog={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
