import React, { useEffect, useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { createAmenity } from "./AmenitiesSlice";
import * as ImagePicker from "expo-image-picker";
import { Snackbar } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AddAmenity = () => {
  const [societyId, setSocietyId] = useState("");
  useEffect(() => {
    const getUserName = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString !== null) {
          const user = JSON.parse(userString);
          setSocietyId(user._id);
        }
      } catch (error) {
        console.error("Failed to fetch the user from async storage", error);
      }
    };
    getUserName();
  }, []);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    societyId: "",
    amenityName: "",
    capacity: "",
    timings: "",
    location: "",
    cost: "",
    status: "",
    image: null,
    picturePreview: null,
  });

  const [errors, setErrors] = useState({});
  const [snackbarVisible, setSnackbarVisible] = useState(false); // Snackbar visibility state
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message state
  const successMessage = useSelector(
    (state) => state.adminAmenities.successMessage || state.adminAmenities.error
  );

  const statusOptions = ["Available", "Booked"];

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      const selectedImage = result.assets[0];
      setFormData((prevFormData) => ({
        ...prevFormData,
        image: selectedImage.uri,
        picturePreview: selectedImage.uri,
      }));
    }
  };

  const handleSubmit = async () => {


    const submissionData = new FormData();
    submissionData.append("societyId", societyId);
    submissionData.append("amenityName", formData.amenityName);
    submissionData.append("capacity", formData.capacity);
    submissionData.append("timings", formData.timings);
    submissionData.append("location", formData.location);
    submissionData.append("status", formData.status);
    if (formData.cost) {
      submissionData.append("cost", formData.cost);
    }
    if (formData.image) {
      submissionData.append("image", {
        uri: formData.image,
        type: "image/jpeg",
        name: "amenity_image.jpg",
      });
    }
    console.log("getting")
    await dispatch(createAmenity(submissionData))

      .then((response) => {
        if (response.type === "amenities/createAmenity/fulfilled") {
          setFormData({
            societyId: "",
            amenityName: "",
            capacity: "",
            timings: "",
            location: "",
            cost: "",
            status: "",
            image: null,
            picturePreview: null,
          });
          setSnackbarMessage(response.payload.message);
          setSnackbarVisible(true);
          // Show Snackbar on success
          setTimeout(() => {
            navigation.goBack();
          }, 2000);
        } else {
          setSnackbarMessage("Failed Aminiety Creation");
          setSnackbarVisible(true); // Show Snackbar on error
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setSnackbarMessage("There was an error creating the amenity.");
        setSnackbarVisible(true); // Show Snackbar on error
      });
  };

  const handleDismissSnackbar = () => setSnackbarVisible(false); // Dismiss Snackbar

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Amenity Name"
        value={formData.amenityName}
        onChangeText={(value) => handleChange("amenityName", value)}
      />
      {errors.amenityName && (
        <Text style={styles.error}>{errors.amenityName}</Text>
      )}
      <TextInput
        style={styles.input}
        placeholder="Capacity"
        keyboardType="numeric"
        value={formData.capacity}
        keyboardAppearance="numaric"
        onChangeText={(value) => handleChange("capacity", value)}
      />
      {errors.capacity && <Text style={styles.error}>{errors.capacity}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Timings"
        value={formData.timings}
        onChangeText={(value) => handleChange("timings", value)}
      />
      {errors.timings && <Text style={styles.error}>{errors.timings}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={formData.location}
        onChangeText={(value) => handleChange("location", value)}
      />
      {errors.location && <Text style={styles.error}>{errors.location}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Cost"
        value={formData.cost}
        onChangeText={(value) => handleChange("cost", value)}
      />
      {errors.cost && <Text style={styles.error}>{errors.cost}</Text>}
      <Text style={styles.label}>Status</Text>
      {statusOptions.map((status) => (
        <TouchableOpacity
          key={status}
          style={styles.option}
          onPress={() => handleChange("status", status)}
        >
          <Text
            style={
              formData.status === status
                ? styles.selectedOption
                : styles.optionText
            }
          >
            {status}
          </Text>
        </TouchableOpacity>
      ))}
      {errors.status && <Text style={styles.error}>{errors.status}</Text>}
      {formData.picturePreview && (
        <Image
          source={{ uri: formData.picturePreview }}
          style={styles.imagePreview}
        />
      )}
      <TouchableOpacity style={styles.submitButton} onPress={handleFileChange}>
        <Text
          theme={{ colors: { primary: "#7d0431" } }}
          style={styles.buttonText}
        >
          UPLOAD IMAGE
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text
          theme={{ colors: { primary: "#7d0431" } }}
          style={styles.buttonText}
        >
          SUBMIT
        </Text>
      </TouchableOpacity>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={handleDismissSnackbar}
        duration={3000}
        action={{
          label: "Close",
          onPress: () => {
            handleDismissSnackbar();
          },
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7d0431",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  error: {
    color: "red",
    fontSize: 12,
  },
  label: {
    fontWeight: "bold",
    marginVertical: 10,
  },
  option: {
    padding: 10,
    backgroundColor: "#dedede",
    marginBottom: 5,
    borderRadius: 4,
  },
  selectedOption: {
    backgroundColor: "#7d0431",
    color: "#fff",
    padding: 10,
  },
  optionText: {
    color: "#7d0431",
  },
  imagePreview: {
    width: 250,
    height: 200,
    marginVertical: 10,
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: "#7d0431",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#fff",
  },
});

export default AddAmenity;
