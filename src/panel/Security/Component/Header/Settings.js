import React, { useEffect, useState } from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet, Linking, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchGuard } from "../../../User/Redux/Slice/Security_Panel/SettingsSlice";
import { ImagebaseURL } from "../../helpers/axios";
import { Avatar } from "react-native-paper";
import { fetchCommityMembers } from "../../../admin/pages/Profile/committeeSlice";
const Settings = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [societyId, setSocietyId] = useState(null);
    const [sequrityId, setSequrityId] = useState(null);
    const Guard = useSelector((state) => state.setting.settings);
    const commityMember = useSelector(state => state.commityMembers.commityMember || []);
    useEffect(() => {
        const getUserName = async () => {
            try {
                const userString = await AsyncStorage.getItem("user");
                if (userString !== null) {
                    const user = JSON.parse(userString);
                    setSocietyId(user.societyId);
                    setSequrityId(user.sequrityId);
                }
            } catch (error) {
                console.error("Failed to fetch the user from async storage", error);
            }
        };

        getUserName();
    }, []);


    useEffect(() => {
        if (societyId && sequrityId) {
            dispatch(fetchGuard({ societyId, sequrityId }));
            dispatch(fetchCommityMembers(societyId ));
        }
    }, [societyId, sequrityId, dispatch]);

    const handleMessagesPress = () => {
        navigation.navigate("Residents ");
    };

    const handleNoticePress = () => {
        navigation.navigate("Notice");
    };
  
    const handlePhonePress = (phoneNumber) => {
        const dialNumber = `tel:${phoneNumber}`;
        Linking.openURL(dialNumber);
    };
    return (
        <ScrollView>
            <View style={styles.container}>
            <View style={styles.card}>
                <Avatar.Image
                    source={{ uri: `${ImagebaseURL}${Guard.pictures}` } || require("../../../../assets/Security/images/policeman.png")}
                    style={styles.image}
                    size={90} // Larger avatar size for emphasis
                />
                <View style={styles.textContainer}>
                    <Text style={styles.name}>{Guard.name}</Text>

                    <Text style={styles.id}>{Guard.sequrityId}</Text>

                    <Text style={styles.email}>{Guard.email}</Text>

                    <Text style={styles.aadhar}>{Guard.aadharNumber}</Text>

                    {Guard.address && (
                        <View style={styles.addressContainer}>
                            <Text style={styles.address}>
                                {Guard.address.addressLine1}
                                {Guard.address.addressLine2 && <Text>, {Guard.address.addressLine2}</Text>}
                                {Guard.address.state && <Text>, {Guard.address.state}</Text>}
                                {Guard.address.postalCode && <Text> - {Guard.address.postalCode}</Text>}
                            </Text>
                        </View>
                    )}
                </View>
            </View>


            <TouchableOpacity style={styles.rowContent} onPress={handleMessagesPress}>
                <Image
                    source={require("../../../../assets/Security/images/email.png")}
                    style={styles.Image2}
                />
                <View style={styles.imagecontent}>
                    <Text style={styles.rowText}>Residents</Text>
                </View>
                <Icon name="navigate-next" size={25} color="lightgrey" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.rowContent} onPress={handleNoticePress}>
                <Image
                    source={require("../../../../assets/Security/images/notice.png")}
                    style={styles.Image2}
                />
                <View style={styles.imagecontent}>
                    <Text style={styles.rowText}>Notice</Text>
                </View>
                <Icon name="navigate-next" size={25} color="lightgrey" />
            </TouchableOpacity>

            <Text style={{ marginTop: 10, fontSize: 16, fontWeight: "600" ,color:"#777",marginLeft:5,marginBottom:3}}>
                Quick Contacts
            </Text>

            {commityMember.map((contact) => (
                <TouchableOpacity key={contact._id} onPress={() => handlePhonePress(contact.phoneNumber)}>
                    <View style={styles.rowContent}>
                        <Image
                            source={require("../../../../assets/Security/images/telephone.png")}
                            style={styles.Image2}
                        />
                        <View style={styles.imagecontent}>
                            <Text style={styles.rowText}>{contact.name}</Text>
                            <Text style={styles.rowSubText}>{contact.designation}</Text>
                        </View>
                        <Icon name="navigate-next" size={25} color="lightgrey" />
                    </View>
                </TouchableOpacity>
            ))}

             </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex:1,
        paddingHorizontal:16,
        backgroundColor: "white",
        width: "100%",
    },

    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 10,
        marginVertical: 16,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    image: {
        marginRight: 20,
        borderRadius: 50,
        backgroundColor: '#F0F0F0',
        alignSelf:'center'
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#202020', 
    },
    id: {
        fontSize: 15,
        color: '#555', 
    },
    email: {
        fontSize: 15,
        color: '#555',
    },
    aadhar: {
        fontSize: 15,
        color: '#555',
    },
   
    address: {
        fontSize: 14,
        color: '#4F4F4F',
    },
    heading: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    subheadingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    subheading: {
        fontSize: 16,
        color: "grey",
        marginLeft: 5,
    },
    editIconContainer: {
        padding: 10,
        borderRadius: 20,
    },
    rowContent: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderWidth: 1,
        width: "100%",
        borderColor: "lightgrey",
        borderRadius: 10,
        marginVertical:5
    },
    Image2: {
        width: 30,
        height: 30,
        marginRight: 10,
    },
    rowText: {
        fontSize: 16,
        marginRight: 10,
    },
    rowSubText: {
        fontSize: 14,
        marginRight: 10,
        color:"#777"
    },
    imagecontent: {
        flex: 1,
        marginRight: 10,

    },

});

export default Settings;