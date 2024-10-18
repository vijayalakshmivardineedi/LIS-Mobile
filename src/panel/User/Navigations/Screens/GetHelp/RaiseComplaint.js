import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { RadioButton } from "react-native-paper";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useDispatch, } from "react-redux";
import { createComplaint, fetchComplaints } from "../../../Redux/Slice/GetHelpSlice/ComplaintsSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RaiseComplaint = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { category } = route.params;
  const [checked, setChecked] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [title, setTitle] = useState("");  // State for the title
  const [userId, setUserId] = useState("");
  const [societyId, setSocietyId] = useState("");
  const [userName, setUserName] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const getUserName = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString !== null) {
          const user = JSON.parse(userString);
          setUserName(user.name);

          setSocietyId(user.societyId);
          setUserId(user.userId);
        }
      } catch (error) {
        console.error("Failed to fetch the user from async storage", error);
      }
    };

    getUserName();
  }, []);

  const handleInputChange = (text) => {
    setInputValue(text);
  };

  const handleTitleChange = (text) => {
    setTitle(text);  // Update title state
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleSubmitPress = () => {
    const complaintData = {
      societyId,
      userId,
      complaintBy: userName,
      complaintCategory: category,
      complaintType: checked,
      complaintTitle: title,
      description: inputValue,
    };
    dispatch(createComplaint(complaintData))
      .unwrap()
      .then(() => {
        dispatch(fetchComplaints(societyId));
        navigation.navigate("GetHelp");
      })
      .catch((error) => {
        console.error("Failed to submit complaint:", error);
        // Handle error (e.g., show an error message)
      });
  };


  return (
    <View style={styles.container}>
      <TextInput
        style={styles.disabledInput}
        value={category}
        editable={false}
      />
      <View style={styles.radioButtonContainer}>
        <RadioButton.Group
          onValueChange={(newValue) => setChecked(newValue)}
          value={checked}
        >
          <View style={styles.radioButtonRow}>
            <View style={styles.radioButton}>
              <RadioButton value="Personal" color="#800336" />
              <Text>Individual</Text>
            </View>
            <View style={styles.radioButton}>
              <RadioButton value="Society" color="#800336" />
              <Text>Community</Text>
            </View>
          </View>
        </RadioButton.Group>
      </View>

      <TextInput
        style={styles.inputField}
        value={title}
        onChangeText={handleTitleChange}
        placeholder="Enter Title"
        underlineColorAndroid="transparent"
      />

      <TextInput
        style={styles.inputField}
        value={inputValue}
        onChangeText={handleInputChange}
        textAlignVertical="top"
        multiline={true}
        numberOfLines={6}
        onFocus={handleFocus}
        onBlur={handleBlur}
        underlineColorAndroid="transparent"
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitPress}>
        <Text style={styles.submitButtonText}>Submit Complaint</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  disabledInput: {
    borderWidth: 1,
    borderColor: "#cacecf",
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    color: "#000",
  },
  radioButtonContainer: {
    marginLeft: 20,
  },
  radioButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  inputField: {
    borderWidth: 1,
    borderColor: "#cacecf",
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: "#800336",
    paddingVertical: 15,
    borderRadius: 5,
    marginTop: 20,
    marginHorizontal: 20,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
 
});

export default RaiseComplaint;
