import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Avatar } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { fetchServices } from "../../../Redux/Slice/ServiceSlice/ServiceSlice";
import { Image } from "react-native";

const WaterList = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.services);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate("Water Profile", { id: item._id, userid: item.userid })}
    >
      <Avatar.Image
        source={{ uri: `https://livinsync.onrender.com${item.pictures}` }}
        size={50}
        style={styles.avatarContainer}
      />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.phone}>{item.phoneNumber}</Text>
      </View>
      <MaterialIcons
        name="arrow-forward-ios"
        size={18}
        color="#7d0431"
        style={styles.icon}
      />
    </TouchableOpacity>
  );

  const ItemSeparator = () => <View style={styles.separator} />;
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7d0431" />
      </View>
    );
  }

  if (error) {
    return (
      <View syle={styles.noDataContainer}>
        <Image
          source={require('../../../../../assets/Admin/Imgaes/nodatadound.png')}
          style={styles.noDataImage}
          resizeMode="contain"
        />
        <Text style={styles.noDataText}>No Services Found</Text>
      </View>
    );
  }


  if (!data || data.water?.length === 0) { // Show spinner while loading
    return (
      <View style={styles.noDataContainer}>
        <Image
          source={require('../../../../../assets/Admin/Imgaes/nodatadound.png')}
          style={styles.noDataImage}
          resizeMode="contain"
        />
        <Text style={styles.noDataText}>No Services Found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data.water}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fcf6f0",
    paddingHorizontal: 15,
    paddingTop: 10
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6b08b",

  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
  },
  phone: {
    fontSize: 14,
    color: "#666",
    marginLeft: 15,
  },
  avatarContainer: {
    borderWidth: 1,
    backgroundColor: "#dddee0",
    borderColor: "white",
  },
  icon: {
    marginLeft: "auto",
  },
  separator: {
    height: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default WaterList;
