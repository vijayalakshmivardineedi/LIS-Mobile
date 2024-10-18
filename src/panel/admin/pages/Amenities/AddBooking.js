import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { bookAmenity } from './BookingSlice';
import { Snackbar } from 'react-native-paper'; // Import Snackbar

const AddBooking = () => {
  const dispatch = useDispatch();
  const route = useRoute();
  const { id } = route.params;
  const [formData, setFormData] = useState({
    userId: '',
    payed: '',
    pending: '',
    dateOfBooking: new Date(), // Set initial date
    status: '',
  });

  const [errors, setErrors] = useState({});
  const navigation = useNavigation();
  const [showDialog, setShowDialog] = useState(false);
  const successMessage = useSelector((state) => state.adminBooking.successMessage);
  const [showDatePicker, setShowDatePicker] = useState(false); 
  const [snackVisible, setSnackVisible] = useState(false); 
  const [snackMessage, setSnackMessage] = useState(''); 
  const statusOptions = ["InProgress", "Completed", "Cancelled"];

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.dateOfBooking;
    setShowDatePicker(false);
    setFormData({ ...formData, dateOfBooking: currentDate });
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
    try {
      const response = await dispatch(bookAmenity({ id, formData }));
      if (response.type === 'booking/bookAmenity/fulfilled') {
        setFormData({
          userId: '',
          payed: '',
          pending: '',
          dateOfBooking: new Date(),
          status: '',
        });
        setShowDialog(true);
        setSnackMessage('Amenity added successfully!');
        setSnackVisible(true); // Show Snackbar
        setTimeout(() => {
          setShowDialog(false);
          navigation.navigate("Bookings");
        }, 2000);
      } else {
        Alert.alert("Error", "Add booking failed, try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "An error occurred while booking the amenity.");
    }
  };

  const handleDismissSnack = () => setSnackVisible(false); // Function to dismiss Snackbar

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder='User Id'
          value={formData.userId}
          onChangeText={(value) => handleChange('userId', value)}
        />
        {errors.userId && <Text style={styles.errorText}>{errors.userId}</Text>}
        <TextInput
          style={styles.input}
          placeholder='Paid Amount'
          value={formData.payed}
          onChangeText={(value) => handleChange('payed', value)}
          keyboardType='numeric'
        />
        {errors.payed && <Text style={styles.errorText}>{errors.payed}</Text>}

        <TextInput
          style={styles.input}
          placeholder='Pending Amount'
          value={formData.pending}
          onChangeText={(value) => handleChange('pending', value)}
          keyboardType='numeric'
        />
        {errors.pending && <Text style={styles.errorText}>{errors.pending}</Text>}

        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
          <Text style={styles.dateText}>
            {formData.dateOfBooking.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        {errors.dateOfBooking && <Text style={styles.errorText}>{errors.dateOfBooking}</Text>}

        {showDatePicker && (
          <DateTimePicker
            value={new Date(formData.dateOfBooking) || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        <View style={styles.selectContainer}>
          <Text style={styles.selectLabel}>Status</Text>
          <Picker
            selectedValue={formData.status}
            style={styles.picker}
            onValueChange={(value) => handleChange('status', value)}>
            {statusOptions.map((status) => (
              <Picker.Item key={status} label={status} value={status} />
            ))}
          </Picker>
          {errors.status && <Text style={styles.errorText}>{errors.status}</Text>}
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Add</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        transparent={true}
        visible={showDialog}
        animationType="slide"
        onRequestClose={() => setShowDialog(false)}
      >
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogText}>{successMessage}</Text>
            <Button title="OK" onPress={() => setShowDialog(false)} />
          </View>
        </View>
      </Modal>

      <Snackbar
        visible={snackVisible}
        onDismiss={handleDismissSnack}
        duration={3000}
        style={styles.snackbar}
      >
        {snackMessage}
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
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#7d0431',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7d0431',
  },
  formContainer: {
    paddingVertical: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  selectContainer: {
    marginBottom: 10,
  },
  selectLabel: {
    marginBottom: 5,
  },
  picker: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#7d0431',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
  dialogOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dialogBox: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  dialogText: {
    marginBottom: 15,
    fontSize: 18,
    textAlign: 'center',
  },
  snackbar: {
    backgroundColor: '#7d0431', // Snackbar color
  },
});

export default AddBooking;
