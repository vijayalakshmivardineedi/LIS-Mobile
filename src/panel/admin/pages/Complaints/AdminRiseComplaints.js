import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
} from "react-native";
import { RadioButton, Snackbar } from "react-native-paper"; // Import Snackbar
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { createComplaint, fetchComplaints } from "./ComplaintSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker"; // Import the Picker component

const AdminRiseComplaints = () => {
    const dispatch = useDispatch();
    const [checked, setChecked] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [title, setTitle] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [category, setCategory] = useState(""); // State for selected category
    const successMessage = useSelector((state) => state.adminComplaints.successMessage);
    const error = useSelector((state) => state.adminComplaints.error);
    const navigation = useNavigation();
    const [finalData, setFinalData] = useState(""); // Default ID

    // Snackbar state
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    
    useEffect(() => {
        const getSocietyAdmin = async () => {
            try {
                const storedAdmin = await AsyncStorage.getItem('user');
                if (storedAdmin) {
                    const societyAdmin = JSON.parse(storedAdmin);
                    setFinalData(societyAdmin._id || "");
                }
            } catch (error) {
                console.error("Error retrieving society admin data:", error);
            }
        };
        getSocietyAdmin();
    }, []);

    const handleInputChange = (text) => {
        setInputValue(text);
    };

    const handleTitleChange = (text) => {
        setTitle(text);
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleSubmitPress = () => {
        const complaintData = {
            societyId: finalData,
            userId: finalData,
            complaintBy: "Admin",
            complaintCategory: category,
            complaintType: checked,
            complaintTitle: title,
            description: inputValue,
        };
        dispatch(createComplaint(complaintData))
            .then((result) => {
                if (result.meta.requestStatus === "fulfilled") {
                    setSnackbarMessage(successMessage);
                    setSnackbarVisible(true);  // Show the Snackbar
                    dispatch(fetchComplaints());
                    navigation.goBack();
                } else {
                    setSnackbarMessage(error || "Error creating complaint.");
                    setSnackbarVisible(true);  // Show the Snackbar with error message
                }
            })
            .catch((error) => {
                console.error("Failed to submit complaint:", error);
                setSnackbarMessage("Failed to submit complaint.");
                setSnackbarVisible(true);
            });
    };

    return (
        <View style={styles.container}>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={category}
                    style={styles.picker}
                    onValueChange={(itemValue) => setCategory(itemValue)}
                >
                    <Picker.Item label="Select a Category" value="" />
                    <Picker.Item label="Plumbing" value="Plumbing" />
                    <Picker.Item label="Electricity" value="Electricity" />
                    <Picker.Item label="Maintenance" value="Maintenance" />
                    <Picker.Item label="Security" value="Security" />
                    <Picker.Item label="Other" value="Other" />
                </Picker>
            </View>

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

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                action={{
                    label: "OK",
                    onPress: () => {
                        setSnackbarVisible(false);
                    },
                }}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    picker: {
        height: 50,
        borderColor: "#cacecf",
        borderWidth: 1,
        borderRadius: 5,
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
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#cacecf",
        borderRadius: 5,
        marginHorizontal: 20,
        marginVertical: 10,
    },
});

export default AdminRiseComplaints;
