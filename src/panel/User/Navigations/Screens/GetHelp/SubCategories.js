import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const SubCategories = () => {
  const navigation = useNavigation();
  const handleButtonPress = (category) => {
    navigation.navigate("Raise Complaint", { category });
  };

  return (
    <View style={styles.container}>
      {[
        "Electrical",
        "Plumbing",
        "Lift",
        "Common Area",
        "Water",
        "Payment",
        "Car Parking",
        "Others",
      ].map((category) => (
        <TouchableOpacity
          key={category}
          style={styles.categoryButton}
          onPress={() => handleButtonPress(category)}
        >
          <Text style={styles.categoryButtonText}>{category}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  categoryButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#cacecf",
    borderRadius: 5,
  },
  categoryButtonText: {
    fontSize: 16,
    color: "#484848",
    fontWeight: "bold",
  },
});

export default SubCategories;