import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
const RentalPropertyType = ({ route }) => {
  const navigation = useNavigation();
  const { advertisements } = route.params;
  const renderPropertyItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("RentalFlat Details", { id: item._id, apartment: advertisements })}>
      <View style={styles.propertyContainer}>
        {item.pictures[0] ? (
          <Image
            source={{ uri: `https://livinsync.onrender.com${item.pictures[0].img}` }}
            style={styles.availablePropertyImage}
          />
        ) : (
          <Text style={styles.errorText}>Image not available</Text>
        )}
        <View style={[styles.row, { marginTop: 4 }]}>
          <Text style={styles.detailText}>Flat No: {item.details.flat_No}</Text>
          <Text style={styles.detailText}>₹ {item.details.price}</Text>
        </View>
        <View style={[styles.row, { marginTop: 4 }]}>
          <View style={styles.row}>
            <Image
              source={require("../../../../../assets/User/images/bed.png")}
              style={styles.availablePropertyImage2}
            />
            <Text style={styles.alternatingText}>{item.details.rooms}</Text>
          </View>
          <View style={styles.row}>
            <Image
              source={require("../../../../../assets/User/images/shower.png")}
              style={styles.availablePropertyImage2}
            />
            <Text style={styles.alternatingText}>{item.details.washrooms}</Text>
          </View>
          <View style={styles.row}>
            <Image
              source={require("../../../../../assets/User/images/ruler.png")}
              style={styles.availablePropertyImage2}
            />
            <Text style={styles.alternatingText}>{item.details.flat_Area} sqft</Text>
          </View>

        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      <View style={styles.availablePropertiesContainer}>

        <FlatList
          data={advertisements.advertisements}
          renderItem={renderPropertyItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.flatListContainer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    marginTop: 10,
  },
  scrollView: {
    paddingVertical: 10,
  },
  dropdownContainer: {
    margin: 10,
  },
  inputBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 16,
    color: "#000",
  },
  dropdownIcon: {
    marginRight: 5,
    color: "#800336"
  },
  dropdownList: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
  availablePropertiesContainer: {
    padding: 15,
  },
  flatListContainer: {
    paddingTop: 10,
  },
  propertyContainer: {
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#800336",
    marginTop: 10,
    padding: 10,
  },
  availablePropertyImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailText: {
    fontSize: 16,
    color: "#484848",
    fontWeight: "700",
  },
  detailText2: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
    marginBottom: 5,
  },
  alternatingText: {
    fontSize: 14,
    color: "#333",
    marginHorizontal: 5,
    textAlign: "left",
  },
  availablePropertyImage2: {
    width: 30,
    height: 30,
  },
});

export default RentalPropertyType;
