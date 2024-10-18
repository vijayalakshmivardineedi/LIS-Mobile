import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { registerParticipant } from "../../../Redux/Slice/CommunitySlice/EventRegistrationSlice";

const EventDetails = ({ route }) => {
  const { event } = route.params;
  const dispatch = useDispatch();
  const [participantName, setParticipantName] = useState("");
  const [participantNameError, setParticipantNameError] = useState("");
  const [activityName, setActivityName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [societyId, setSocietyId] = useState("");
  const [userId, setUserId] = useState("");
  const eventId = event._id

  useEffect(() => {
    const getSocietyId = async () => {
      try {
        const user = await AsyncStorage.getItem("user");

        if (user) {
          const parsedUser = JSON.parse(user);
          const id = parsedUser.societyId;
          const userId = parsedUser.userId;

          if (id !== null) {
            setSocietyId(id);
          } else {
            console.error("No societyId found in AsyncStorage");
          }

          if (userId !== null) {
            setUserId(userId);
          } else {
            console.error("No userId found in AsyncStorage");
          }
        } else {
          console.error("No user data found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching data from AsyncStorage:", error);
      }
    };

    getSocietyId();
  }, []);

  const validateInput = () => {
    let isValid = true;
    if (!participantName) {
      setParticipantNameError("Please enter a Valid Name.");
      isValid = false;
    } else {
      setParticipantNameError("");
    }
    return isValid;
  };

  const handleOpenModal = (name) => {
    setActivityName(name);
    setShowModal(true);
  };

  const closeCross = () => {
    setShowModal(false);
  };

  const handleCloseModal = async () => {
    if (validateInput()) {
      setLoading(true);
      dispatch(registerParticipant({ societyId, participantId: userId, participantName, activities: activityName, eventId }));
    }
  };
  function formatDate(inputDate) {
    const date = new Date(inputDate);
    const formattedDate = date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
    return formattedDate;
  }

  const isRegistrationClosed = (date) => {
    const currentDate = new Date();
    const endDate = new Date(date);
    return currentDate > endDate;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageContainer}
        >
          {event.pictures && event.pictures.length > 0 ? (
            event.pictures.map((picture, index) => (
              <Image
                key={index}
                source={{ uri: `https://livinsync.onrender.com${picture.img}` }}
                style={styles.availablePropertyImage}
              />
            ))
          ) : (
            <Text style={styles.errorText}>No images available</Text>
          )}
        </ScrollView>
        <View style={styles.propertyContainer}>
          <View style={styles.row}>
            <Text style={styles.propertyText}>Event Name</Text>
            <Text style={styles.propertyText1}>: {event.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.propertyText}>Start Date</Text>
            <Text style={styles.propertyText1}>: {formatDate(event.startDate)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.propertyText}>End Date</Text>
            <Text style={styles.propertyText1}>: {formatDate(event.endDate)}
            </Text>
          </View>
        </View>
        <Text style={styles.mainTitle}>Activities</Text>
        {event.activities && event.activities.length > 0 ? (
          event.activities.map((activity, index) => (
            <View key={index} style={styles.propertyContainer}>
              <View style={styles.row}>
                <Text style={styles.propertyText}>Activity Name</Text>
                <Text style={styles.propertyText1}>: {activity.type}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.propertyText}>Start Date</Text>
                <Text style={styles.propertyText1}>: {formatDate(activity.startDate)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.propertyText}>End Date</Text>
                <Text style={styles.propertyText1}>: {formatDate(activity.endDate)}
                </Text>
              </View>
              {isRegistrationClosed(activity.endDate) ? (
                <Text></Text>
              ) : (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleOpenModal(activity.type)}
                >
                  <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.errorText}>No activities available</Text>
        )}
      </ScrollView>
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text
                style={{ fontSize: 22, fontWeight: "700", color: "#800336" }}
              >
                Registration Form
              </Text>
              <TouchableOpacity style={{ position: "absolute", right: 0 }}>
                <Entypo
                  name="circle-with-cross"
                  size={27}
                  color="#800336"
                  onPress={closeCross}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.inputContent}>
              <TextInput
                label="Activity Name"
                value={activityName}
                mode="outlined"
                style={[styles.inputBlock, { marginTop: 10 }]}
                outlineColor="#ccc"
                theme={{ colors: { primary: "#800336" } }}
                editable={false}
              />
              <TextInput
                label="Participant Name"
                value={participantName}
                mode="outlined"
                style={[
                  styles.inputBlock,
                  { marginTop: 10 },
                  participantNameError && { borderColor: "red" },
                ]}
                outlineColor={participantNameError ? "red" : "#CCC"}
                theme={{
                  colors: { primary: participantNameError ? "red" : "#800336" },
                }}
                onChangeText={setParticipantName}
              />
              {participantNameError ? (
                <Text style={styles.errorMessage}>{participantNameError}</Text>
              ) : null}
              <TouchableOpacity
                style={styles.button1}
                onPress={handleCloseModal}
              >
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginLeft: 5,
    marginRight: 5,
  },
  availablePropertyImage: {
    width: 280,
    height: 220,
    borderRadius: 10,
    margin: 5,
  },
  propertyContainer: {
    margin: 5,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "92%",
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
    alignItems: 'center',
  },
  propertyText: {
    fontSize: 16,
    color: "#202020",
    fontWeight: "700",
    width: 120, 
    flexShrink: 1,
  },
  propertyText1: {
    fontSize: 16,
    color: "#333",
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 5,
    color: "#7D0431",
  },
  button: {
    backgroundColor: "#800336",
    borderRadius: 10,
    width: 100,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  button1: {
    backgroundColor: "#800336",
    borderRadius: 10,
    width: 130,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBackground: {
    backgroundColor: "rgba(0,0,0,0.4)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    position: "absolute",
    bottom: 0,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    height: "auto",
    width: "100%",
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  modalHeader: {
    paddingTop: 7,
    flexDirection: "row",
    alignItems: "center",
  },
  inputContent: {
    marginBottom: 20,
  },
  inputBlock: {
    marginBottom: 2,
    backgroundColor: "#fff",
  },
  errorMessage: {
    color: "red",
    fontSize: 12,
  },
});
export default EventDetails;
