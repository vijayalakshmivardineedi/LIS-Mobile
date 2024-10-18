import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity,  ActivityIndicator } from 'react-native';
import DialpadPin from "../Component/CustomKeypad/DailpadPin";
import DialpadKeypad from "../Component/CustomKeypad/DialpadKeypad";
import {  useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyDialog from "../DialogBox/DialogBox";
import {
  fetchVisitorVerify,
  resetState,
} from "../../User/Redux/Slice/Security_Panel/HomeScreenSlice";
import { FAB, RadioButton } from "react-native-paper";
const { width,  } = Dimensions.get("window");
const dialPadContent = [1, 2, 3, 4, 5, 6, 7, 8, 9, "Y", 0, "X"];
const dialPadSize = width * 0.2;
const dialPadTextSize = dialPadSize * 0.28;
const pinLength = 6;
const pinContainerSize = width / 1.5;
const pinSize = pinContainerSize / pinLength;
const modalDuration = 5000;
const HomeScreen = ({ }) => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [code, setCode] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [pinEnabled, setPinEnabled] = useState(true);
    const [selectedOption, setSelectedOption] = useState('Guest');
    const [societyId, setSocietyId] = useState(null);
    const successMessage = useSelector(state => state.homeScreen.successMessage);
    const status = useSelector(state => state.homeScreen.status);
    const error = useSelector(state => state.homeScreen.error);
    const [showDialog, setShowDialog] = useState(false);
    const [openFab, setOpenFab] = useState(false);
    useEffect(() => {
        if (selectedOption !== null) {
            AsyncStorage.setItem('selectedVisitorOption', selectedOption)
                .then(() => {
                    return AsyncStorage.getItem('selectedVisitorOption');
                })
                .then((value) => console.log('Fetched selectedVisitorOption:', value))
                .catch((error) => console.error('Error handling selectedOption in AsyncStorage:', error));
        }
    }, [selectedOption]);
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
        if (modalVisible) {
            const timer = setTimeout(() => {
                setModalVisible(false);
                setPinEnabled(true);
                setCode([]);
            }, modalDuration);
            return () => clearTimeout(timer);
        }
    }, [modalVisible]);
    const handleEnter = () => {
        if (code.length === pinLength && selectedOption) {
            const payload = {
                societyId,
                id: code.join(''),
                visitorType: selectedOption
            };
            dispatch(fetchVisitorVerify(payload)).then((response) => {
              setCode([]);
                if (response.meta.requestStatus === 'fulfilled') {
                    setPinEnabled(false);
                    setModalVisible(true);
                    setSelectedOption(null);
                    setShowDialog(true);
                    setTimeout(() => {
                        dispatch(resetState());
                        setShowDialog(false);
                    }, 1000);
                } else {
                    setShowDialog(true);
                    
                    setTimeout(() => {
                        dispatch(resetState());
                        setShowDialog(false);
                    }, 1000);
                }
            }).catch((error) => {
                console.error('Error:', error);
            });
        };
    };
    const handleOptionSelect = (option) => {
        setSelectedOption(option); 
    };

    if (status === 'loading') {
      return (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#630000" />
        </View>
      );
    }

    return (
        <View style={styles.container}>
            <View style={styles.pinContainer}>
                <View style={styles.radioContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: "center", alignItems: 'center' }}>
                        <RadioButton
                            value="Guest"
                            status={selectedOption === 'Guest' ? 'checked' : 'unchecked'}  // Compare with "guests"
                            onPress={() => handleOptionSelect('Guest')}  // Pass "guests"
                            color="#7d0431"
                        />
                        <Text style={styles.radioText}>Guests</Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 20 }}>
                        <RadioButton
                            value="Staff"
                            status={selectedOption === 'Staff' ? 'checked' : 'unchecked'}  
                            onPress={() => handleOptionSelect('Staff')}  
                            color="#7d0431"
                        />
                        <Text style={styles.radioText}>Service</Text>
                    </View>
                </View>

        <View style={{ marginTop: -30, marginBottom: 10 }}>
          <DialpadPin
            pinLength={pinLength}
            pinSize={pinSize}
            code={code}
            disabled={!pinEnabled}
          />
        </View>
        <View style={styles.textContainer}>
          <DialpadKeypad
            dialPadContent={dialPadContent}
            pinLength={pinLength}
            setCode={setCode}
            code={code}
            dialPadSize={dialPadSize}
            dialPadTextSize={dialPadTextSize}
            disabled={!pinEnabled}
          />
        </View>
        <TouchableOpacity
          style={[styles.enterButton]}
          onPress={handleEnter}
          disabled={!pinEnabled}
        >
          <Text style={styles.enterButtonText}>Enter</Text>
        </TouchableOpacity>
      </View>

      <MyDialog
        message={successMessage || error}
        showDialog={showDialog}
        onClose={() => setShowDialog(false)}
      />
      <FAB.Group
        open={openFab}
        icon={openFab ? "close" : "plus"}
        actions={[
          {
            icon: "account",
            label: "Add Guest",
            onPress: () => {
              setOpenFab(false);
              navigation.navigate("Add Guest");
            },
            style: { backgroundColor: "#7d0431" }, 
            color: "white",
          },
          {
            icon: "package",
            label: "Add Delivery",
            onPress: () => {
              setOpenFab(false);
              navigation.navigate("Add Delivery");
            },
            style: { backgroundColor: "#7d0431" },
            color: "white",
          },
          {
            icon: "cog",
            label: "Add Service",
            onPress: () => {
              setOpenFab(false);
              navigation.navigate("Add Service");
            },
            style: { backgroundColor: "#7d0431" }, 
            color: "white",
          },
          {
            icon: "car",
            label: "Add Cab",
            onPress: () => {
              setOpenFab(false);
              navigation.navigate("Add Cab");
            },
            style: { backgroundColor: "#7d0431" },
            color: "white",
          },
          {
            icon: "dots-horizontal",
            label: "Add Others",
            onPress: () => {
              setOpenFab(false);
              navigation.navigate("Add Others");
            },
            style: { backgroundColor: "#7d0431" },
            color: "white",
          },
        ]}
        onStateChange={({ open }) => setOpenFab(open)}
        onPress={() => {
          if (openFab) {
            setOpenFab(false);
          }
        }}
        color="white"
        fabStyle={{ backgroundColor: "#7d0431" }}
      />
    </View>
  );
};
export default HomeScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 10,
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'transparent'
    },
    image: {
        width: 80,
        height: 80
    },
    radioContainer: {
        flexDirection: 'row',
        marginVertical: 20,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        backgroundColor: '#F3E1D5',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 10,
    },
    selectedRadioButton: {
        borderBottomWidth: 2,
        borderColor: '#7D0431',
    },
    radioText: {
        fontSize: 20,
        color: '#800336',
        fontWeight: "bold"
    },

    textContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    enterButton: {
        backgroundColor: '#7D0431',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    enterButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        // marginBottom:50
    },
    scrollContainer: {
        width: '100%',
        position: 'absolute',
        bottom: 10,
    },
    horizontalScroll: {
        paddingVertical: 0,
    },
    menuItem: {
        marginHorizontal: 5,
    },
    pinContainer: {
        alignItems: "center"
    },
    menuView: {
        height: 110,
        width: 160,
        backgroundColor: '#F8E9DC',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 10,
    },
    menuText: {
        fontSize: 16,
        fontWeight: '500',
        width: 72,
    },
    menuImage: {
        height: 65,
        width: 65,
    }, fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#7D0431', // Customize the color if needed
    },
});
  
