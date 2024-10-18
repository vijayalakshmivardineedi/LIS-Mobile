import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, TextInput, TouchableOpacity, Button, StyleSheet, Alert, Modal } from 'react-native';
import { createNotice, fetchnotices } from './NoticeSlice';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Snackbar } from 'react-native-paper'; // Import Snackbar

const AddNotice = ({ navigation }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        societyId: "", // Initialize as empty, will set later
        sender: '',
        subject: '',
        description: '',
        date: new Date(),
    });

    const [errors, setErrors] = useState({});
    const successMessage = useSelector((state) => state.adminNotices.successMessage);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false); // State for Snackbar visibility
    const [snackbarMessage, setSnackbarMessage] = useState(''); // State for Snackbar message

    useEffect(() => {
        const fetchSocietyId = async () => {
            const storedAdmin = await AsyncStorage.getItem('user');
            const societyAdmin = JSON.parse(storedAdmin) || {};
            const societyId = societyAdmin._id || ""; // Default ID

            // Update formData with the fetched societyId
            setFormData(prevFormData => ({
                ...prevFormData,
                societyId: societyId,
            }));
        };

        fetchSocietyId();
    }, []); // Run once on mount

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async () => {
        const newErrors = {};
        Object.keys(formData).forEach(key => {
            if (!formData[key]) {
                newErrors[key] = 'This field is required';
            }
        });
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        dispatch(createNotice(formData)).then((response) => {
            if (response.meta.requestStatus === 'fulfilled') {
                setFormData({
                    societyId: formData.societyId, // Keep the societyId the same
                    sender: '',
                    subject: '',
                    description: '',
                    date: new Date(),
                });
                setSnackbarMessage("Notice added successfully!"); // Set success message
                setSnackbarVisible(true); // Show Snackbar
                dispatch(fetchnotices())
                setTimeout(() => {
                    navigation.goBack()
                }, 2000);
            }
        }).catch((error) => {
            Alert.alert("Error", "Failed to create notice");
            setSnackbarMessage("Failed to add notice!"); // Set error message
            setSnackbarVisible(true); // Show Snackbar
        });
    };

    const showDatePickerHandler = () => {
        setShowDatePicker(true);
    };

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || formData.date;
        setShowDatePicker(false);
        handleChange('date', currentDate);
    };

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder='Sender'
                    value={formData.sender}
                    onChangeText={(value) => handleChange('sender', value)}
                />
                {errors.sender && <Text style={styles.errorText}>{errors.sender}</Text>}

                <TextInput
                    style={styles.input}
                    placeholder='Subject'
                    value={formData.subject}
                    onChangeText={(value) => handleChange('subject', value)}
                />
                {errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}

                <TouchableOpacity style={styles.input} onPress={showDatePickerHandler}>
                    <View style={styles.row}>
                        <MaterialIcons name="calendar-today" size={24} color="#aaa" />
                        <Text style={{ color: formData.date ? '#000' : '#aaa', marginLeft: 8 }}>
                            {formData.date ? formData.date.toLocaleDateString() : 'Select Date'}
                        </Text>
                    </View>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={formData.date}
                        mode='date'
                        display='default'
                        onChange={onChange}
                    />
                )}
                {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}

                <TextInput
                    style={styles.input}
                    placeholder='Description'
                    value={formData.description}
                    onChangeText={(value) => handleChange('description', value)}
                    multiline
                    numberOfLines={2}
                />
                {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Add Notice</Text>
                </TouchableOpacity>
            </View>

            {/* Snackbar Component */}
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                style={styles.snackbar}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#7d0431',
        marginLeft: 10,
    },
    formContainer: {
        flex: 1,
    },
    input: {
        height: 50,
        borderColor: '#3b0506',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: "#800336",
        paddingVertical: 15,
        borderRadius: 5,
        marginTop: 50,
        marginHorizontal: 10,
        alignItems: "center",
    },
    submitButtonText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default AddNotice;
