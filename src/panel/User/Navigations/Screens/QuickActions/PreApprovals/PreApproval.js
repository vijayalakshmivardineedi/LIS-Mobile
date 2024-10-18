import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

import { ActivityIndicator, Avatar } from "react-native-paper";
import { Entypo } from "@expo/vector-icons";
import { fetchPreApprovals } from "../../../../Redux/Slice/Home/PreapprovalSlice";
import { fetchUserProfiles } from "../../../../Redux/Slice/ProfileSlice/ProfileSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImagebaseURL } from "../../../../../Security/helpers/axios";

const PreApproval = () => {
  const [userId, setUserId] = useState("");
  const [societyId, setSocietyId] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const dispatch = useDispatch();

  const { profiles } = useSelector((state) => state.profiles);
  useEffect(() => {
    const getUserName = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString !== null) {
          const user = JSON.parse(userString);
          setSocietyId(user.societyId);
          setUserId(user.userId);
        }
      } catch (error) {
        console.error("Failed to fetch the user from async storage", error);
      }
    };
    getUserName();
  }, []);

  useEffect(() => {
    if (userId && societyId) {
      dispatch(fetchUserProfiles({ userId, societyId }));
    }
  }, [dispatch, userId, societyId]);

  useEffect(() => {
    if (profiles.length > 0) {
      const profile = profiles[0];
      setBuildingName(profile.buildingName);
      setFlatNumber(profile.flatNumber);
    }
  }, [profiles]);

  const { preApprovals, status, error } = useSelector(
    (state) => state.preApprovals
  );

  useEffect(() => {
    if (societyId && buildingName && flatNumber) {
      dispatch(
        fetchPreApprovals({
          societyId,
          block: buildingName,
          flatNo: flatNumber,
        })
      );
    }
  }, [societyId, buildingName, flatNumber, dispatch]);
  const handleShare = async (visitorId, imageUrl) => {
    try {
      const localUri = FileSystem.documentDirectory + "image.jpg"; // Name your image file
      const response = await FileSystem.downloadAsync(imageUrl, localUri);

      const message = `Check out this visitor's pin: ${visitorId}`;

      const messageUri = FileSystem.documentDirectory + "visitor_id.txt";
      await FileSystem.writeAsStringAsync(messageUri, message);

      await Sharing.shareAsync(response.uri, {
        dialogTitle: message,
        UTI: "public.image",
      });

    } catch (error) {
      Alert.alert("Error sharing", error.message);
    }
  };

  if (status === "loading") {
    return (
      <View style={{ alignItems: "center", flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#7d0431" />
      </View>
    );
  }

  if (status === "failed") {
    return <Text>Error: {error}</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView vertical={true}>
        <View style={styles.cards}>
          {preApprovals
            .slice()
            .reverse()
            .map((preApproval) => (
              <View key={preApproval._id} style={styles.eachCard}>
                <View style={styles.imageText}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    <Avatar.Image
                      resizeMode="cover"
                      size={60}
                      style={{
                        justifyContent: "center",
                        backgroundColor: "#ccc",
                      }}
                      source={{ uri: `${ImagebaseURL}${preApproval.pictures}` }}
                    />
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                        {preApproval.name}
                      </Text>
                      <Text style={{ fontSize: 13, color: "grey" }}>
                        {preApproval.phoneNumber}
                      </Text>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: "bold",
                          color: "#7d0431",
                        }}
                      >
                        {preApproval.visitorId}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      handleShare(
                        preApproval.visitorId,
                        `${ImagebaseURL}${preApproval.qrImage}`
                      )
                    }
                  >
                    <View style={styles.share}>
                      <Entypo name="share" size={22} color="#c59358" />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  cards: {
    paddingHorizontal: 10,
  },
  eachCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 2,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginVertical: 10,
  },
  imageText: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  share: {
    backgroundColor: "#fff",
    borderRadius: 50,
    flexDirection: "row",
    borderColor: "#c59358",
    borderWidth: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
  },
});

export default PreApproval;
