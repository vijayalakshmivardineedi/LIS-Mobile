import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { createBill } from './SocietyBillsSlice';
import { Picker } from '@react-native-picker/picker';
import { TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const AddSocietyBills = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const getSocietyId = async () => {
    try {
      const societyAdminString = await AsyncStorage.getItem("societyAdmin");
      const data = societyAdminString ? JSON.parse(societyAdminString) : {};
      return data._id || "6683b57b073739a31e8350d0";
    } catch (error) {
      console.error("Error fetching societyId:", error);
      return "6683b57b073739a31e8350d0";
    }
  };

  const societyId = "6683b57b073739a31e8350d0";

  const [formState, setFormState] = useState({
    societyId,
    name: '',
    status: 'Unpaid',
    amount: '',
    monthAndYear: '',
    pictures: null,
  });
  const [fileName, setFileName] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [modalVisible, setModalVisible] = useState(false);
  const error = useSelector((state) => state.adminSocietyBills.error);
  const [errors, setErrors] = useState({});

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setFormState({ ...formState, pictures: asset.uri });
      setFileName(asset.fileName || asset.uri.split('/').pop());
    }
    setModalVisible(false);
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setFormState({ ...formState, pictures: asset.uri });
      setFileName(asset.fileName || asset.uri.split('/').pop());
    }
    setModalVisible(false); 
  };

  const handleAdd = async () => {
    const newErrors = {};
    const { name, status, amount } = formState;

    if (!name.trim()) newErrors.name = 'Bill name is required';
    if (!amount.trim()) newErrors.amount = 'Amount is required';
    if (!status.trim()) newErrors.status = 'Status is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill all required fields.',
      });
      return;
    }

    const month = selectedMonth.toString().padStart(2, '0');
    const year = selectedYear.toString();
    const monthAndYear = `${year}-${month}`;

    const formDataToAdd = new FormData();
    formDataToAdd.append('societyId', formState.societyId);
    formDataToAdd.append('name', formState.name);
    formDataToAdd.append('status', formState.status);
    formDataToAdd.append('amount', formState.amount);
    formDataToAdd.append('monthAndYear', monthAndYear);

    if (formState.pictures) {
      formDataToAdd.append('pictures', {
        uri: formState.pictures,
        name: fileName,
        type: 'image/jpeg',
      });
    }


    const response = await dispatch(createBill(formDataToAdd));
    if (response.meta.requestStatus === 'fulfilled') {
      setFormState({
        societyId,
        name: '',
        status: 'Unpaid',
        amount: '',
        monthAndYear: '',
        pictures: null,
      });
      setFileName('');
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: "Successfully Bill Created",
      });

      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
      });
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>

        <TextInput
          mode="outlined"
          label="Bill Name"
          theme={{ colors: { primary: "#7d0431" } }}
          value={formState.name}
          onChangeText={(text) => setFormState({ ...formState, name: text })}
          style={[styles.input, { backgroundColor: '#fff' }]}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <TextInput
          mode="outlined"
          label="Amount"
          theme={{ colors: { primary: "#7d0431" } }}
          value={formState.amount}
          onChangeText={(text) => setFormState({ ...formState, amount: text })}
          style={[styles.input, { backgroundColor: '#fff' }]}
          keyboardType='numeric'
        />
        {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedYear}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
            mode="dropdown"
          >
            {Array.from({ length: 15 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return <Picker.Item key={year} label={`${year}`} value={year} />;
            })}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            mode="dropdown"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <Picker.Item key={i + 1} label={`Month ${i + 1}`} value={i + 1} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formState.status}
            onValueChange={(itemValue) => setFormState({ ...formState, status: itemValue })}
            mode="dropdown"
          >
            <Picker.Item label="Paid" value="Paid" />
            <Picker.Item label="Unpaid" value="Unpaid" />
          </Picker>
        </View>
        {errors.status && <Text style={styles.errorText}>{errors.status}</Text>}

        {formState.pictures ? (
          <View style={styles.imagePreviewContainer}>
            <Text style={styles.fileTitle}>Image</Text>
            <Image source={{ uri: formState.pictures }} style={styles.imagePreview} />
          </View>
        ) : null}
        {fileName ? <Text style={styles.fileName}>{fileName}</Text> : null}

        <TouchableOpacity style={styles.uploadButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.uploadButtonText}>Upload Image</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleAdd}>
          <Text style={styles.submitButtonText}>Add</Text>
        </TouchableOpacity>

        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Image Source</Text>
              <TouchableOpacity onPress={pickImage} style={styles.modalButtonIcon}>
                <Text>Pick from Gallery  </Text>
                <Icon name="photo-library" size={24} color="#7D0431" />
              </TouchableOpacity>
              <TouchableOpacity onPress={takePhoto} style={styles.modalButtonIcon}>
                <Text>Take a Photo  </Text>
                <Icon name="photo-camera" size={24} color="#7D0431" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Toast />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  input: {
    marginBottom: 8,
  },
  pickerContainer: {
    borderColor: '#7d0431',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 8,
    overflow: 'hidden',
  },
  imagePreviewContainer: {
    width: '100%',
    marginTop: 15,
    marginBottom: 15,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 5,
  },
  fileTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: "#7d0431",
  },
  fileName: {
    fontSize: 14,
    marginBottom: 10,
    color: "#7d0431",
  },
  uploadButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 15,
    marginBottom: 15,
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#7D0431",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 15,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  selectedDate: {
    marginTop: 10,
    fontSize: 14,
    color: "#7d0431",
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: "#7D0431"
  },
  modalButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#7d0431',
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonCancel: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalButtonIcon: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 5,
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
});

export default AddSocietyBills; 