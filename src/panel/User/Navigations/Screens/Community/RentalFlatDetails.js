import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";

const RentalFlatDetails = ({ route }) => {
  const { id, apartment } = route.params;

  const advertisement = apartment.advertisements.find((ad) => ad._id === id);
  const handleCallPress = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };
  const totalFlats = apartment.blocks.reduce(
    (total, block) => total + block.flats.length,
    0
  );
  if (!advertisement) {
    return (
      <View style={styles.container}>
        <Text>No advertisement found for the given ID.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageContainer}
        >
          {advertisement.pictures.map((image) => (
            <Image
              key={image._id}
              source={{ uri: `https://livinsync.onrender.com${image.img}` }}
              style={styles.availablePropertyImage}
            />
          ))}
        </ScrollView>

        <View style={styles.propertyContainer}>
          <View style={styles.row}>
            <Text style={styles.propertyText}>Flat No. {advertisement.details.flat_No}</Text>
            <Text style={styles.propertyText}>₹ {advertisement.details.price}</Text>
          </View>
          <Text style={styles.propertySubText}>
            {apartment.societyAdress.addressLine1}, {apartment.societyAdress.addressLine2}, {apartment.societyAdress.state}- {apartment.societyAdress.postalCode}
          </Text>
          <View style={[styles.row, { marginTop: 4 }]}>
            <View style={styles.iconTextContainer}>
              <Image
                source={require("../../../../../assets/User/images/bed.png")}
                style={styles.icon}
              />
              <Text style={styles.propertySubText}>{advertisement.details.rooms} Bed</Text>
            </View>
            <View style={styles.iconTextContainer}>
              <Image
                source={require("../../../../../assets/User/images/shower.png")}
                style={styles.icon}
              />
              <Text style={styles.propertySubText}>{advertisement.details.washrooms} Bath</Text>
            </View>
            <View style={styles.iconTextContainer}>
              <Image
                source={require("../../../../../assets/User/images/ruler.png")}
                style={styles.icon}
              />
              <Text style={styles.propertySubText}>{advertisement.details.flat_Area} sqft</Text>
            </View>
          </View>

        </View>
        <View style={styles.propertyContainer}>
          <Text style={styles.mainTitle}>Society Info</Text>
          <Text style={styles.societyName}>{apartment.societyName}</Text>
          <View style={styles.row}>
            <Text style={styles.propertySubText}>{apartment.blocks.length} Blocks</Text>
            <View style={styles.contactContainer}>

              <Text style={styles.propertySubText}>{apartment.contactNumber}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.propertySubText}>{totalFlats} Flats</Text>
            <View style={styles.contactContainer}>
              <Text style={styles.propertySubText}>
                {apartment.email}
              </Text>
            </View>
          </View>
          <View style={styles.contactContainer}>
            <Text style={styles.propertySubText}>
              {apartment.societyAdress.addressLine1}, {apartment.societyAdress.addressLine2}, {apartment.societyAdress.state}- {apartment.societyAdress.postalCode}
            </Text>
          </View>
        </View>

        <View style={styles.propertyContainer}>
          <Text style={styles.mainTitle}>Owner Details</Text>
          <Text style={styles.ownerText}>
            <Text style={styles.detailLabel}>Name: </Text>
            <Text style={styles.detailValue}>{advertisement.userName}</Text>
          </Text>
          <Text style={styles.ownerText}>
            <Text style={styles.detailLabel}>Contact: </Text>
            <Text style={styles.detailValue}>{advertisement.phoneNumber}</Text>
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleCallPress(advertisement.phoneNumber)}
          >
            <View style={styles.callRow}>
              <Image
                source={require("../../../../../assets/User/images/call.png")}
                style={styles.callIcon}
              />
              <Text style={styles.buttonText}>{advertisement.phoneNumber}</Text>
            </View>
          </TouchableOpacity>
        </View>


      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    marginTop: 5,
  },
  scrollView: {
    alignItems: "center",
    paddingVertical: 10,
  },
  imageContainer: {
    marginHorizontal: 5,
  },
  availablePropertyImage: {
    width: 280,
    height: 180,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  propertyContainer: {
    margin: 5,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    width: "92%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  propertyText: {
    fontSize: 16,
    color: "#484848",
    fontWeight: "bold",
  },
  propertySubText: {
    fontSize: 15,
    color: "#666",

  },
  iconTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 30,
    height: 30,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#484848",
    marginBottom: 10,
  },
  societyName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  contactContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  locationIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  ownerText: {
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: "#192c4c",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 16,
    color: "#666",
  },
  button: {
    borderRadius: 7,
    backgroundColor: "#7D0431",
    height: 45,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  callRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  callIcon: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default RentalFlatDetails;
