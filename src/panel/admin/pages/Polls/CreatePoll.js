import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import socketServices from '../../../User/Socket/SocketServices';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreatePoll = ({ navigation }) => {
    const [formData, setFormData] = useState({
        question: '',
        description: '',
        option: [''],
        endDate: '',
        time: '',
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [societyId, setSocietyId] = useState("")
    useEffect(() => {
        socketServices.initializeSocket();
        const getAdminiD = async () => {
            const societyAdmin = await AsyncStorage.getItem('user');
            const parsedAdmin = societyAdmin ? JSON.parse(societyAdmin) : {};
            setSocietyId(parsedAdmin._id || "");
        }
        getAdminiD()

    }, []);

    const handleFormChange = (name, value, index) => {
        if (name === 'option') {
            const updatedOptions = [...formData.option];
            updatedOptions[index] = value;
            setFormData({ ...formData, option: updatedOptions });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleAddOption = () => {
        setFormData(prevData => ({
            ...prevData,
            option: [...prevData.option, ''], // Add a new empty option
        }));
    };

    const handleRemoveOption = (index) => {
        const updatedOptions = formData.option.filter((_, i) => i !== index);
        setFormData({ ...formData, option: updatedOptions });
    };

    // Handle form submission
    const handleFormSubmit = async () => {

        const poll = {
            question: formData.question,
            Description: formData.description,
            options: formData.option,
            endDate: formData.endDate,
            date: Date.now(),
            time: formData.time,
            pollType: "Individual",
        };
        socketServices.emit('create_poll', { poll, societyId });
        socketServices.emit('get_polls_by_society_id', { societyId });
        setTimeout(() => {
            navigation.goBack();
        }, 2000);
    };

    // Date picker handler
    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setSelectedDate(selectedDate);
            setFormData({ ...formData, endDate: selectedDate.toDateString() });
        }
    };

    // Time picker handler
    const onChangeTime = (event, selectedTime) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            setSelectedTime(selectedTime);
            setFormData({ ...formData, time: selectedTime.toLocaleTimeString() });
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Create New Poll</Text>
            <TextInput
                placeholder="Poll Question"
                value={formData.question}
                onChangeText={text => handleFormChange('question', text)}
                style={styles.input}
            />
            <TextInput
                placeholder="Poll Description"
                value={formData.description}
                onChangeText={text => handleFormChange('description', text)}
                style={styles.input}
            />
            {formData.option.map((opt, index) => (
                <View key={index} style={styles.optionContainer}>
                    <TextInput
                        placeholder={`Option ${index + 1}`}
                        value={opt}
                        onChangeText={text => handleFormChange('option', text, index)}
                        style={styles.input}
                    />
                    <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveOption(index)}>
                        <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={handleAddOption}>
                <Text style={styles.addButtonText}>Add Option</Text>
            </TouchableOpacity>

            {/* End Date Field */}
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                <Text>{formData.endDate || "Select End Date"}</Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                />
            )}

            {/* Time Field */}
            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
                <Text>{formData.time || "Select Time"}</Text>
            </TouchableOpacity>
            {showTimePicker && (
                <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    display="default"
                    onChange={onChangeTime}
                />
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.submitButton} onPress={handleFormSubmit}>
                    <Text style={styles.submitButtonText}>Create Poll</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
        padding: 10,
        borderRadius: 5,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        height: 50,
    },
    removeButton: {
        backgroundColor: '#7d0431',
        padding: 10,
        borderRadius: 5,
    },
    removeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#7d0431',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginVertical: 10,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    submitButton: {
        backgroundColor: '#7d0431',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 10,
    },
    submitButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#7d0431',
        padding: 10,
        borderRadius: 5,
        flex: 1,
    },
    cancelButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default CreatePoll;
