import React, { useState, useEffect } from "react";
import { View, TextInput, Button, StyleSheet, Text, Alert, ScrollView, Modal, Platform, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from "react-redux";
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAmenityByIdAndUserId, updateAmenityBooking } from "./BookingSlice";
import { Snackbar } from 'react-native-paper'; // Import Snackbar

const EditBooking = () => {
  const route = useRoute();
  const { id, userId } = route.params;
  const dispatch = useDispatch();
  const successMessage = useSelector((state) => state.adminBooking.successMessage);
  const booking = useSelector((state) => state.adminBooking.booking);
  const statusOptions = ["InProgress", "Completed", "Cancelled"];
  const [errors, setErrors] = useState({});
  const navigation = useNavigation();
  const [showDialog, setShowDialog] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [initialDate, setInitialDate] = useState(new Date());
  const [snackVisible, setSnackVisible] = useState(false); // State for Snackbar visibility

  const [formState, setFormState] = useState({
    payed: '',
    pending: '',
    dateOfBooking: new Date(),
    status: '',
  });

  useEffect(() => {
    dispatch(getAmenityByIdAndUserId({ userId }));
  }, [dispatch]);

  useEffect(() => {
    if (booking && booking?.list) {
      const matchedBookings = booking.list?.filter((booking) => booking._id === id);
      if (matchedBookings.length > 0) {
        setFormState({
          payed: matchedBookings[0].payed || '',
          pending: matchedBookings[0].pending || '',
          dateOfBooking: new Date(matchedBookings[0].dateOfBooking) || new Date(),
          status: matchedBookings[0].status || '',
        });
        setInitialDate(new Date(matchedBookings[0].dateOfBooking) || new Date());
      }
    }
  }, [booking, id]);

  const handleInputChange = (name, value) => {
    setFormState({ ...formState, [name]: value });
  };

  const validateForm = () => {
    let tempErrors = {};
    tempErrors.payed = formState.payed ? "" : "Payed is required.";
    tempErrors.pending = formState.pending ? "" : "Pending is required.";
    tempErrors.dateOfBooking = formState.dateOfBooking ? "" : "Date is required.";
    tempErrors.status = formState.status ? "" : "Status is required.";
    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === "");
  };

  const handleSubmit = async () => {
    if (validateForm()) { // Assuming you have this function elsewhere
      const { ...formData } = formState;
      console.log(formData)
      dispatch(updateAmenityBooking({ userId, formData }))
        .then((response) => {
          if (response.type === "booking/updateAmenityBooking/fulfilled") {
            setSnackVisible(true); // Show Snackbar on successful update
            setTimeout(() => {
              navigation.goBack();
            }, 2000);
          } else {
            Alert.alert("Error", "Failed to update booking");
          }
        })
        .catch(() => {
          Alert.alert("Error", "An error occurred while updating the booking.");
        });
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formState.dateOfBooking;
    setShowDatePicker(Platform.OS === 'ios');
    setFormState({ ...formState, dateOfBooking: currentDate });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Paid*"
          value={formState.payed}
          onChangeText={(value) => handleInputChange('payed', value)}
        />
        {errors.payed && <Text style={styles.errorText}>{errors.payed}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Pending*"
          value={formState.pending}
          onChangeText={(value) => handleInputChange('pending', value)}
        />
        {errors.pending && <Text style={styles.errorText}>{errors.pending}</Text>}

        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <TextInput
            style={styles.input}
            placeholder="Date and Time*"
            value={formState.dateOfBooking.toLocaleString()}
            editable={false}
          />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={formState.dateOfBooking}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {errors.dateOfBooking && <Text style={styles.errorText}>{errors.dateOfBooking}</Text>}
        <View style={styles.pickerContain}>
          <Picker
            selectedValue={formState.status}
            style={styles.picker}
            onValueChange={(value) => handleInputChange('status', value)}
          >
            {statusOptions.map((status) => (
              <Picker.Item key={status} label={status} value={status} />
            ))}
          </Picker>
        </View>

        {errors.status && <Text style={styles.errorText}>{errors.status}</Text>}

        <Button title="Update" onPress={handleSubmit} color="#7d0431" />
      </View>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={2000}
      >
        {successMessage || "Booking updated successfully!"}
      </Snackbar>

      <Modal
        visible={showDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDialog(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.dialog}>
            <Text style={styles.dialogText}>{successMessage || "Booking updated successfully!"}</Text>
            <Button title="OK" onPress={() => setShowDialog(false)} color="#7d0431" />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  formContainer: {
    marginVertical: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  picker: {
    height: 40,
    marginBottom: 10,
    borderWidth: 1
  },
  pickerContain: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom:10
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dialog: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  dialogText: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default EditBooking;
