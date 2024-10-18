import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from "react-native";
import { fetchResidentProfile } from "./profileSlice";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ImagebaseURL } from "../../../Security/helpers/axios";
import { fetchCitiesById } from "../../../User/Redux/Slice/AuthSlice/Signup/citySlice";
import { fetchCommityMembers } from "./committeeSlice";
import { ActivityIndicator } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
const Profile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const resident = useSelector((state) => state.profile.profile);
  const status = useSelector((state) => state.profile.status);
  const loading = useSelector((state) => state.profile.loading);

  const city = useSelector((state) => state.citiesState.currentCity || null);

  const [societyId, setSocietyId] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [gates, setGates] = useState([]);
  const [documents, setDocuments] = useState([]);
  const commityMember = useSelector(
    (state) => state.commityMembers.commityMember || []
  );
  const [cityName, setCityName] = useState("");
 
  useEffect(() => {
    const getSocietyId = async () => {
      try {
        const storedSocietyId = await AsyncStorage.getItem("user");
        const societyAdmin = JSON.parse(storedSocietyId) ;
        if (societyAdmin) {
          setSocietyId(societyAdmin._id);
          dispatch(fetchResidentProfile(societyAdmin._id));
          dispatch(fetchCommityMembers(societyAdmin._id));
        }
      } catch (error) {
        console.error("Error fetching societyId from AsyncStorage", error);
      }
    };

    getSocietyId();
  }, [dispatch]);
  useEffect(() => {
    if (resident) {
      setBlocks(resident.blocks || []);
      setGates(resident.gates || []);
      setDocuments(resident.documents || []);
      if (!selectedBlock && resident.blocks?.length > 0) {
        setSelectedBlock(resident.blocks[0]._id);
      }
      if (resident.city) {
        dispatch(fetchCitiesById({ cityId: resident.city })).then((action) => {
          if (action.payload) {
            setCityName(action.payload.name);
          }
        });
      }
    }
  }, [resident, selectedBlock, dispatch]);
  if (!resident) return <Text>No resident data available.</Text>;
  const totalBlocks = blocks?.length;
  let totalFlats = 0;
  blocks.forEach((block) => {
    totalFlats += block.flats?.length;
  });

  const totalGates = gates?.length;

  if (loading === true) {
    return (
      <ActivityIndicator size="large" color="#630000" style={styles.loader} />
    );
  }

  if (!resident || !resident.length === 0) {
    // Show spinner while loading
    return (
      <View style={styles.noDataContainer}>
        <Image
          source={require("../../../../assets/Admin/Imgaes/nodatadound.png")}
          style={styles.noDataImage}
          resizeMode="contain"
        />
        <Text style={styles.noDataText}>No Amenities Found</Text>
      </View>
    );
  }
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {resident.societyImage && resident.societyImage[0] ? (
          <Image
            source={{ uri: `${ImagebaseURL}${resident.societyImage[0]}` }}
            style={styles.societyImage}
          />
        ) : (
          <Text>No image available</Text>
        )}

        <Text style={styles.sectionTitle}>Society Details</Text>
        <View style={styles.Row}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Society Name</Text>
            <Text style={styles.value}>{resident.societyName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>City</Text>
            <Text style={styles.value}>{cityName || "Loading..."}</Text>
          </View>
        </View>

        <View style={styles.Row}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{resident.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Society Number</Text>
            <Text style={styles.value}>{resident.societyMobileNumber}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Society Address</Text>
          <Text style={styles.value}>
            {resident.societyAdress?.addressLine1}
          </Text>
          <Text style={styles.value}>
            {resident.societyAdress?.addressLine2}
          </Text>
          <Text
            style={styles.value}
          >{`${resident.societyAdress?.state}, ${resident.societyAdress?.postalCode}`}</Text>
        </View>

        <View style={styles.Row}>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text
                style={[styles.label, { textAlign: "center", fontSize: 28 }]}
              >
                {" "}
                {totalBlocks}
              </Text>
              <Text style={styles.label}>
                {" "}
                <Icon name="office-building" size={20} color="#000" />
                Blocks
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text
                style={[styles.label, { textAlign: "center", fontSize: 28 }]}
              >
                {totalFlats}
              </Text>

              <Text style={styles.label}>
                {" "}
                <Icon name="home-city" size={20} color="#000" /> Flats
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text
                style={[styles.label, { textAlign: "center", fontSize: 28 }]}
              >
                {totalGates}
              </Text>

              <Text style={styles.label}>
                {" "}
                <Icon name="gate" size={20} color="#000" /> Gates
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Committee Members</Text>
        {commityMember?.length > 0 ? (
          commityMember.map((member, index) => (
            <View key={index} style={styles.infoRow}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flexDirection: "column" }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Icon
                      name="account"
                      size={20}
                      color="#000"
                      style={styles.icon}
                    />
                    <Text style={styles.label}>{member.name}</Text>
                  </View>
                  <Text style={styles.memberRole}>
                    {member.designation} - {member.phoneNumber}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${member.phoneNumber}`)}
                    style={styles.iconButton}
                  >
                    <Icon
                      name="phone"
                      size={20}
                      color="green"
                      style={styles.icon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text>No committee members available.</Text>
        )}
        <Text style={styles.sectionTitle}>License Details</Text>
        <View style={styles.Row}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>License</Text>
            <Text style={styles.value}>{resident.license}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Membership</Text>
            <Text style={styles.value}>{resident.memberShip}</Text>
          </View>
        </View>
        <View style={styles.Row}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Start Date</Text>
            <Text style={styles.value}>
              {new Date(resident.startDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Expiry Date</Text>
            <Text style={styles.value}>
              {new Date(resident.expiryDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
        {new Date(resident.expiryDate) < new Date() && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              console.log("Renewal button pressed");
            }}
          >
            <Text style={styles.buttonText}>
              Renewal Now with {resident.price}/-
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#7d0431",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "lightgrey",
    paddingBottom: 5,
  },
  Row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  content: {
    padding: 10,
    borderRadius: 5,
    borderColor: "lightgrey",
    borderWidth: 1,
    marginBottom: 30,
  },
  societyImage: {
    width: 200,
    height: 200,
    borderRadius: 5,
    marginBottom: 20,
  },
  infoRow: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
  value: {
    fontSize: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    elevation: 3,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 18,
    color: "#7d0431",
    textAlign: "center",
  },
});

export default Profile;
