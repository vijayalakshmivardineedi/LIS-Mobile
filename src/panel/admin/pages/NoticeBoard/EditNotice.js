import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, Modal, TouchableOpacity, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { editNotice, getNoticeById, fetchnotices } from "./NoticeSlice";
import DateTimePicker from '@react-native-community/datetimepicker';
import { ActivityIndicator, Snackbar } from "react-native-paper";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const EditNotice = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { noticeId } = route.params; // Getting ID from params
    const dispatch = useDispatch();
    const notice = useSelector((state) => state.adminNotices.notice);
    const successMessage = useSelector((state) => state.adminNotices.successMessage);
    const [errors, setErrors] = useState({});
    const [showDialog, setShowDialog] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const status = useSelector((state) => state.adminNotices.status);
    const [snackbarVisible, setSnackbarVisible] = useState(false); // State for Snackbar visibility
    const [snackbarMessage, setSnackbarMessage] = useState(''); // State for Snackbar message

    const [formState, setFormState] = useState({
        sender: '',
        subject: '',
        description: '',
        date: '',
    });

    useEffect(() => {
        if (noticeId) {
            dispatch(getNoticeById(noticeId));
        }
    }, [dispatch, noticeId]);

    useEffect(() => {
        if (notice) {
            setFormState({
                sender: notice.sender || '',
                subject: notice.subject || '',
                description: notice.description || '',
                date: notice.date || '',
            });
        }
    }, [notice]);

    const handleInputChange = (name, value) => {
        setFormState({ ...formState, [name]: value });
    };

    const validateForm = () => {
        let tempErrors = {};
        tempErrors.sender = formState.sender ? "" : "Sender is required.";
        tempErrors.subject = formState.subject ? "" : "Subject is required.";
        tempErrors.description = formState.description ? "" : "Description is required.";
        tempErrors.date = formState.date ? "" : "Date is required.";
        setErrors(tempErrors);
        return Object.values(tempErrors).every((x) => x === "");
    };
    const handleSubmit = () => {
        if (validateForm()) {
            const { ...formData } = formState;
            dispatch(editNotice({ noticeId, formData }))
                .then((response) => {
                    if (response.type === 'notice/editNotice/fulfilled') {
                        setFormState({
                            sender: '',
                            subject: '',
                            description: '',
                            date: new Date(),
                        });
                        setSnackbarMessage("Notice Updated successfully!"); // Set success message
                        setSnackbarVisible(true); // Show Snackbar
                        dispatch(fetchnotices())
                        setTimeout(() => {
                            navigation.goBack()
                        }, 2000);
                    }
                }).catch((error) => {
                    Alert.alert("Error", "Failed to Update notice");
                    setSnackbarMessage("Failed to add notice!"); // Set error message
                    setSnackbarVisible(true); // Show Snackbar
                });
        }
    };


    const handleDateChange = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setShowDatePicker(false);
            return;
        }
        if (selectedDate) {
            const currentDate = selectedDate || formState.date;
            setShowDatePicker(false);
            setFormState({ ...formState, date: currentDate }); 
        }
    };

    if (status === 'loading') {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7d0431" />
            </View>
        );
    }
    if (!notice || notice.length === 0) {
        return (
            <View style={styles.errorContainer}>
                <Image
                    source={require('../../../../assets/Admin/Imgaes/nodatadound.png')} // Update this path
                    style={styles.errorImage}
                    alt="No Data Found"
                />
            </View>
        );
    }
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Sender*"
                    value={formState.sender}
                    onChangeText={(value) => handleInputChange("sender", value)}
                    errorMessage={errors.sender}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Subject*"
                    value={formState.subject}
                    onChangeText={(value) => handleInputChange("subject", value)}
                    errorMessage={errors.subject}
                />
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <TextInput
                        style={styles.input}
                        placeholder="Date and Time*"
                        value={new Date(formState.date).toLocaleDateString() || ""}
                    />
                </TouchableOpacity>
                {showDatePicker && (
                    <View>
                        <MaterialIcons name="calendar-today" size={24} color="#aaa" />
                        <DateTimePicker
                            value={new Date(formState.date) || new Date()} // Ensure this value is valid
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                        />
                    </View>
                )}
                <TextInput
                    style={[styles.input,]}
                    placeholder="Description*"
                    value={formState.description}
                    onChangeText={(value) => handleInputChange("description", value)}
                    errorMessage={errors.description}
                    multiline
                />
                <Button title="Update" onPress={handleSubmit} color="#7d0431" />
            </View>
            {/* Success Dialog */}
            <Modal
                visible={showDialog}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDialog(false)}
            >
                <View style={styles.dialogContainer}>
                    <View style={styles.dialogBox}>
                        <Text>{successMessage}</Text>
                    </View>
                </View>
            </Modal>
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                style={styles.snackbar}
            >
                {snackbarMessage}
            </Snackbar>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flexGrow: 1,
        backgroundColor: '#fff',
    },
    form: {
        flexGrow: 1,
    },
    input: {
        borderWidth: 1,
        borderColor: '#7d0431',
        paddingVertical: 10,
        marginBottom: 20,padding:10
    },
    dialogContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    dialogBox: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        elevation: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default EditNotice;
