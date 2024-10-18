import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBills } from "../../../../Redux/Slice/ProfileSlice/myBillsSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";

const Paidbills = () => {
  const dispatch = useDispatch();
  const [societyId, setSocietyId] = useState("");
  const [flatno, setFlatno] = useState("");
  const [blockno, setBlockno] = useState("");
  const { payments, loading, error } = useSelector(
    (state) => state.mybills.bills
  );

  useEffect(() => {
    const getUserName = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString !== null) {
          const user = JSON.parse(userString);
          setSocietyId(user.societyId);
          setBlockno(user.buildingName);
          setFlatno(user.flatNumber);
        }
      } catch (error) {
        console.error("Failed to fetch the user from async storage", error);
      }
    };

    getUserName();
  }, []);

  useEffect(() => {
    if (societyId) {
      dispatch(fetchBills({ societyId, flatno, blockno }));
    }
  }, [dispatch, societyId, blockno, flatno]);

  const paidBills = Array.isArray(payments)
    ? payments.filter((bill) => bill.status !== "UnPaid")
    : [];

  const renderItem = ({ item }) => (
    <View style={styles.billContainer}>
      <View style={styles.header}>
        <Text style={{ fontSize: 20, fontWeight: "600" }}>
          {item.monthAndYear}
        </Text>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{item.status}</Text>
        </View>
      </View>
      <Text style={{ fontSize: 14, fontWeight: "400", color: "#777" }}>
        {item._id}
      </Text>
      <Text style={styles.billText}>TXN ID: {item.transactionId}</Text>
      <Text style={styles.billText}>TXN Type: {item.transactionType}</Text>
      <Text style={styles.billText}>Paid On: {item.payedOn}</Text>
      <View style={styles.amountContainer}>
        <Text style={{ fontSize: 20, fontWeight: "600" }}>
          ₹{item.paidAmount}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading bills...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error fetching bills: {error}</Text>
      </View>
    );
  }

  // Check if there are no paid bills
  if (paidBills.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Image
          source={require('../../../../../../assets/Admin/Imgaes/nodatadound.png')}
          style={styles.noDataImage}
          resizeMode="contain"
        />
        <Text style={styles.noDataText}>No Bills Found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={paidBills}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  billContainer: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  billText: {
    fontSize: 14,
  },
  chip: {
    backgroundColor: "#4caf50",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  chipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  amountContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataImage: {
    width: 100,
    height: 100,
  },
  noDataText: {
    fontSize: 16,
    marginTop: 10,
  },
});

export default Paidbills;
