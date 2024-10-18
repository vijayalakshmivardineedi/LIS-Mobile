import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const Community = () => {
    const navigation = useNavigation();

    const handleCardPress = () => {
        navigation.navigate("Residents ");
    };
    const handleEmegencyPress = () => {
        navigation.navigate("Emergency");
    };
    const handleDocumentpress = () => {
        navigation.navigate("Society Bills");
    }

    const handleNoticeBoardPress = () => {
        navigation.navigate("Notice Board");
    }
    const handleAminitiesPress = () => {
        navigation.navigate("Amenities");
    };
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Discovery</Text>

            <View style={styles.cardContainer}>
                <TouchableOpacity style={styles.card} onPress={handleCardPress}>
                    <Image
                        style={styles.cardImage}
                        source={require("../../../../assets/User/images/contacts.png")}
                    />
                    <View style={styles.cardContent}>
                        <Text style={styles.cardHeading}>Residents</Text>
                        <Text style={styles.cardSubheading}>
                            Society residents & management
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.card} onPress={handleEmegencyPress}>
                    <Image
                        style={styles.cardImage}
                        source={require("../../../../assets/User/images/ambulance (1).png")}
                    />
                    <View style={styles.cardContent}>
                        <Text style={styles.cardHeading}>Emergency No’s</Text>
                        <Text style={styles.cardSubheading}>
                            Emergency contacts of society
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <Text style={styles.text}>Engage</Text>

            <View style={styles.cardContainer}>

                <TouchableOpacity style={styles.card} onPress={handleAminitiesPress}>
                    <Image
                        style={styles.cardImage}
                        source={require("../../../../assets/User/images/amenities.png")}
                    />
                    <View style={styles.cardContent}>
                        <Text style={styles.cardHeading}>Amenities</Text>
                        <Text style={styles.cardSubheading}>
                            Book facilities in your society
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.card} onPress={() => { navigation.navigate("Polls") }}>
                    <Image
                        style={styles.cardImage}
                        source={require("../../../../assets/User/images/Poll.png")}
                    />
                    <View style={styles.cardContent}>
                        <Text style={styles.cardHeading}>Polls</Text>
                        <Text style={styles.cardSubheading}>
                            Give your decisions
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.cardContainer}>

                <TouchableOpacity style={styles.card} onPress={() => { navigation.navigate("Events") }}>
                    <Image
                        style={styles.cardImage}
                        source={require("../../../../assets/User/images/upload.png")}
                    />
                    <View style={styles.cardContent}>
                        <Text style={styles.cardHeading}>Events</Text>
                        <Text style={styles.cardSubheading}>
                            Community Events
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.card} onPress={handleNoticeBoardPress}>
                    <Image
                        style={styles.cardImage}
                        source={require("../../../../assets/User/images/pinned-notes (1).png")}
                    />
                    <View style={styles.cardContent}>
                        <Text style={styles.cardHeading}>Notice Board</Text>
                        <Text style={styles.cardSubheading}>Society announcement</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <Text style={styles.text}>Bills</Text>
            <TouchableOpacity style={styles.card} onPress={handleDocumentpress}>
                <Image
                    style={styles.cardImage}
                    source={require("../../../../assets/User/images/billdue.png")}
                />
                <View style={styles.cardContent}>
                    <Text style={styles.cardHeading}>Society Bills</Text>
                    <Text style={styles.cardSubheading}>
                        Society and personal documents
                    </Text>
                </View>
            </TouchableOpacity>
            <Text style={styles.text}>Get Help</Text>
            <TouchableOpacity style={styles.card} onPress={() => { navigation.navigate("GetHelp") }}>
                <Image
                    style={styles.cardImage}
                    source={require("../../../../assets/User/images/gethelp.png")}
                />
                <View style={styles.cardContent}>
                    <Text style={styles.cardHeading}>Complaints</Text>
                    <Text style={styles.cardSubheading}>
                        View & Rise issues in flats/society
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: "#f5f5f5",
    },

    text: {
        fontSize: 16,
        color: "#484848",
        fontWeight: "700",
        margin: 5,
    },
    cardContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    card: {
        width: "49%",
        height: 75, 
        backgroundColor: "#f7f7f7",
        borderWidth: 1,
        borderColor: "#f0f3f4",
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        padding: 5,
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
    },
    cardImage: {
        width: 40,
        height: 40,
        marginRight: 12, 
    },
    cardContent: {
        flex: 1,
        
    },
    cardHeading: {
        fontSize: 15,
        fontWeight: "bold",
        marginBottom: 4,
        textAlign: "left", 
        color:"#484848"
    },
    cardSubheading: {
        fontSize: 10,
        color: "#666",
        textAlign: "left",
    },
});

export default Community;