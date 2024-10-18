import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createMaintenanceRecords } from './SocietyMaintainanceSlice';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker

const AddMaintenanceBill = () => {
  const dispatch = useDispatch();

  const [errors, setErrors] = useState({});
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const successMessage = useSelector((state) => state.adminMaintainance.successMessage || state.adminMaintainance.error);
  const navigation = useNavigation();

  // State for Date Picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [societyId, setSocietyId] = useState("");
  const [formData, setFormData] = useState({
    societyId: societyId,
    amount: '',
    monthAndYear: '',
  });
  useEffect(() => {
    const getSocietyAdmin = async () => {
      try {
        const storedAdmin = await AsyncStorage.getItem('user');
        if (storedAdmin) {
          const societyAdmin = JSON.parse(storedAdmin);
          console.log(societyAdmin)
          if (societyAdmin._id) {
            setSocietyId(societyAdmin._id);
          }

        }
      } catch (error) {
        console.error("Error retrieving society admin data:", error);
      }
    };
    getSocietyAdmin();
  }, []);
  const handleChange = (name, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleAdd = async () => {

    try {
      const response = await dispatch(createMaintenanceRecords(formDataToAdd))
      console.log(response)
      if (response) {
        setFormData({
          societyId: societyId,
          amount: '',
          monthAndYear: '',
        });
        setDialogMessage(successMessage || 'Maintenance record added successfully.');
        setShowDialog(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setDialogMessage('Failed to add maintenance record.'); // Custom error message
      setShowDialog(true);
    }
  };

  useEffect(() => {
    if (showDialog) {
      const timer = setTimeout(() => {
        setShowDialog(false);
        navigation.navigate("SocietyAdminMaintainance"); // Use the correct screen name here
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showDialog, navigation]);

  // Function to handle date change
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    // Format the date to 'YYYY-MM'
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Get month (01-12)
    const formattedDate = `${year}-${month}`; // Format as 'YYYY-MM'
    setFormData({ ...formData, monthAndYear: formattedDate });
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        {/* Month and Year Picker */}
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>
            {formData.monthAndYear || 'Select Month and Year'}
          </Text>
        </TouchableOpacity>
        {errors.monthAndYear && <Text style={styles.errorText}>{errors.monthAndYear}</Text>}

        <TextInput
          style={styles.input}
          placeholder='Amount'
          value={formData.amount}
          onChangeText={(value) => handleChange('amount', value)}
          error={!!errors.amount}
          placeholderTextColor="#aaa"
        />
        {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {/* Dialog Box */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={showDialog}
        onRequestClose={() => setShowDialog(false)}
      >
        <View style={styles.dialogContainer}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogMessage}>{dialogMessage}</Text>
            <TouchableOpacity style={styles.dialogButton} onPress={() => setShowDialog(false)}>
              <Text style={styles.dialogButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  backButton: {
    marginRight: 10,
  },
  backIcon: {
    fontSize: 24,
    color: '#630000',
  },
  title: {
    fontSize: 23,
    fontWeight: '700',
    color: '#630000',
  },
  formContainer: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerText: {
    color: '#aaa',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#630000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
  },
  dialogContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dialogBox: {
    width: 300,
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dialogMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  dialogButton: {
    backgroundColor: '#630000',
    padding: 10,
    borderRadius: 5,
  },
  dialogButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AddMaintenanceBill;
