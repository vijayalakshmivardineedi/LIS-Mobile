import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Text,
  Image,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { editBill, getBillById } from "./SocietyBillsSlice";
import * as ImagePicker from "expo-image-picker";
import { TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ImagebaseURL } from "../../../Security/helpers/axios";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from 'react-native-toast-message';

const Edit = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  const dispatch = useDispatch();
  const bills = useSelector((state) => state.adminSocietyBills.bills);
  const [errors, setErrors] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [fileName, setFileName] = useState("");
  const [formState, setFormState] = useState({
    name: "",
    amount: "",
    status: "",
    monthAndYear: "",
    pictures: null,
    selectedMonth: new Date().getMonth() + 1,
    selectedYear: new Date().getFullYear(),
  });

  const [existingFileName, setExistingFileName] = useState("");

  const statusOptions = [
    { label: "Paid", value: "Paid" },
    { label: "Unpaid", value: "Unpaid" },
  ];

  useEffect(() => {
    dispatch(getBillById({ id }));
  }, [dispatch, id]);

  useEffect(() => {
    if (bills && bills.length > 0) {
      const bill = bills[0];
      setFormState((prev) => ({
        ...prev,
        name: bill.name || "",
        amount: bill.amount || "",
        status: bill.status || "",
        selectedMonth: bill.monthAndYear ? new Date(bill.monthAndYear).getMonth() + 1 : new Date().getMonth() + 1,
        selectedYear: bill.monthAndYear ? new Date(bill.monthAndYear).getFullYear() : new Date().getFullYear(),
      }));
      setExistingFileName(bill.pictures ? bill.pictures.split("/").pop() : "");
    }
  }, [bills]);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert("Permissions Required", "Sorry, we need camera and media library permissions to make this work!");
      }
    })();
  }, []);

  const handleInputChange = (name, value) => {
    setFormState({ ...formState, [name]: value });
  };

  const handleImagePick = () => {
    setModalVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
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
    const result = await ImagePicker.launchCameraAsync({
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


  const validateForm = () => {
    const newErrors = {};
    if (!formState.name.trim()) newErrors.name = "Name is required.";
    if (!formState.amount.trim()) newErrors.amount = "Amount is required.";
    if (!formState.status) newErrors.status = "Status is required.";
    if (!formState.selectedMonth || !formState.selectedYear) newErrors.monthAndYear = "Month and Year are required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const { selectedMonth, selectedYear, pictures, ...rest } = formState;

    const monthAndYear = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

    if (validateForm()) {
      const updateData = new FormData();

      updateData.append("name", rest.name);
      updateData.append("amount", rest.amount);
      updateData.append("status", rest.status);
      updateData.append("monthAndYear", monthAndYear);


      if (formState.pictures) {
        updateData.append('pictures', {
          uri: formState.pictures,
          name: fileName,
          type: 'image/jpeg',
        });
      }

      try {
        const response = await dispatch(editBill({ id, formData: updateData }));

        if (response.meta.requestStatus === 'fulfilled') {
          setFormState({
            name: '',
            status: 'Unpaid',
            amount: '',
            monthAndYear: '',
            pictures: null,
            selectedMonth: new Date().getMonth() + 1,
            selectedYear: new Date().getFullYear(),
          });
          setFileName('');
          setExistingFileName('');
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: "Successfully Bill Updated",
          });

          setTimeout(() => {
            navigation.goBack();
          }, 2000);
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || "An error occurred while updating the bill.",
        });
      }
    }
  };



  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <TextInput
          mode="outlined"
          label="Bill Name"
          style={styles.input}
          value={formState.name}
          onChangeText={(text) => handleInputChange("name", text)}
          theme={{ colors: { primary: "#7d0431" } }}
          error={!!errors.name}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <TextInput
          mode="outlined"
          label="Amount"
          style={styles.input}
          value={formState.amount}
          onChangeText={(text) => handleInputChange("amount", text)}
          theme={{ colors: { primary: "#7d0431" } }}
          keyboardType="numeric"
          error={!!errors.amount}
        />
        {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}


        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formState.selectedYear}
            onValueChange={(itemValue) => handleInputChange("selectedYear", itemValue)}
          >
            {Array.from({ length: 15 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return <Picker.Item key={year} label={`${year}`} value={year} />;
            })}
          </Picker>
        </View>
        {errors.monthAndYear && <Text style={styles.errorText}>{errors.monthAndYear}</Text>}

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formState.selectedMonth}
            onValueChange={(itemValue) => handleInputChange("selectedMonth", itemValue)}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <Picker.Item key={i + 1} label={`Month ${i + 1}`} value={i + 1} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formState.status}
            onValueChange={(itemValue) => handleInputChange("status", itemValue)}
          >
            {statusOptions.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </View>
        {errors.status && <Text style={styles.errorText}>{errors.status}</Text>}

        <Text style={styles.label}>Upload File</Text>

        {!formState.pictures && existingFileName && bills && bills.length > 0 && bills[0].pictures && (
          <View style={styles.existingImageContainer}>
            <Image
              source={{ uri: `${ImagebaseURL}${bills[0].pictures}` }}
              style={styles.existingImage}
              resizeMode="cover"
            />
            <Text style={styles.fileName}>
              <Text style={{fontWeight: '700'}}>Existing File:</Text>
              {existingFileName}
              </Text>
          </View>
        )}

        {formState.pictures && (
          <View style={styles.newImageContainer}>

            <Image
              source={{ uri: formState.pictures }}
              style={styles.newImage}
              resizeMode="cover"
            />
            <Text style={styles.fileName}>
            <Text style={{fontWeight: '700'}}>New File:</Text> 
            {fileName}
            </Text>
            <TouchableOpacity style={styles.DeleteIconCont} onPress={() => setFormState({ ...formState, pictures: null })}>
              <Icon name="delete" size={24} color="red" />
              <Text style={styles.removeText}>Remove Image</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.uploadButton} onPress={handleImagePick}>
          <View style={styles.uploadButtonContent}>
            <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
            <Text style={styles.uploadButtonText}>Upload</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Update Bill</Text>
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
    padding: 15,
    backgroundColor: "#fff",
  },
  header: {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#630000",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  form: {
    flex: 1,
  },
  label: {
    marginTop: 15,
    marginBottom: 5,
    fontSize: 16,
    color: "#7D0431",
    fontWeight: "600",
  },
  input: {
    marginBottom: 8,
  },
  existingImageContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  existingImage: {
    width: "100%",
    height: 200,
    borderRadius: 5,
    marginBottom: 15,
  },
  newImageContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  newImage: {
    width: "100%",
    height: 200,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  fileName: {
    fontSize: 14,
    color: "#555",
  },
  removeText: {
    color: "#FF0000",
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: "#630000",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  modalText: {
    fontSize: 18,
    color: "#630000",
    textAlign: "center",
  },
  pickerContainer: {
    borderColor: '#7d0431',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 8,
    overflow: 'hidden',
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
  uploadButton: {
    height: 45,
    backgroundColor: "#4CAF50",
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  uploadButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  uploadButtonText: {
    color: "#FFF",
    marginLeft: 5,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
    marginLeft: 4,
  },
  DeleteIconCont: {
    flexDirection: 'row',
    alignContent: 'center',
    alignSelf: 'flex-end',
    color: 'red',
    marginBottom: 8,
    marginLeft: 4,
  },
});

export default Edit;
