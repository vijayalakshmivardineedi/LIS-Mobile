import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Modal, Image, Alert } from "react-native";
import {
  Card,
  Button,
  Text,
  Avatar,
  IconButton,
  List,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import { AddDocumentsAsync } from "../../../Redux/Slice/ProfileSlice/DocumentSlice";
import { useDispatch, useSelector } from "react-redux";
import { fetchDocumentsById } from "../../../Redux/Slice/ProfileSlice/GetDocumentSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImagebaseURL } from "../../../../Security/helpers/axios";
import { WebView } from 'react-native-webview';
const initialDocuments = [
  {
    id: "1",
    title: "Image",
    status: "No files added",
    icon: "image",
    fileUri: null,
  },
  {
    id: "2",
    title: "Voter ID",
    status: "No files added",
    icon: "card-account-details",
    fileUri: null,
  },
  {
    id: "3",
    title: "Aadhar",
    status: "No files added",
    icon: "card-account-details",
    fileUri: null,
  },
  {
    id: "4",
    title: "Bonafide Certificate",
    status: "No files added",
    icon: "certificate",
    fileUri: null,
  },
  {
    id: "5",
    title: "Driving License",
    status: "No files added",
    icon: "car",
    fileUri: null,
  },
  {
    id: "6",
    title: "College ID",
    status: "No files added",
    icon: "school",
    fileUri: null,
  },
  {
    id: "7",
    title: "Other Documents",
    status: "No files added",
    icon: "file-document",
    fileUri: null,
  },
  {
    id: "8",
    title: "Estimates/Invoices including all files",
    status: "No files added",
    icon: "file-multiple",
    fileUri: null,
  },
  {
    id: "9",
    title: "Dose 2 Certificate",
    status: "No files added",
    icon: "file-certificate",
    fileUri: null,
  },
];
const DocumentItem = ({
  item,
  onOpenModal,
  onToggleDropdown,
  isDropdownOpen,
}) => {
  const [showWebView, setShowWebView] = useState(false); 
  const fileExtension = item.fileUri ? item.fileUri.split('.').pop() : '';
  const fileUrl = item.fileUri ? `${ImagebaseURL}${item.fileUri}` : null;

  const handleDownload = () => {
    setShowWebView(true); 
  };

  const renderContent = () => {
    switch (fileExtension) {
      case 'pdf':
        return (
          <View style={styles.pdfContainer}>
            <Text>{fileUrl ? fileUrl.split('/').pop() : 'No File'}</Text>
            <Button mode="contained" onPress={handleDownload}>
              View PDF
            </Button>
            {showWebView && (
              <WebView
                style={styles.pdfPreview}
                source={{ uri: fileUrl }}
                onError={(error) => console.error("PDF Load Error:", error)}
                onLoad={() => setShowWebView(false)} 
              />
            )}
          </View>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
        return (
          <>
            <Text>{fileUrl ? fileUrl.split('/').pop() : 'No File'}</Text>
            <Image
              source={{ uri: fileUrl }}
              style={styles.imagePreview}
              onError={(e) => console.error("Image Load Error:", e.nativeEvent.error)}
            />
          </>
        );
      default:
        return <Text>Unsupported file type</Text>;
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Title
        title={item.title}
        subtitle={item.fileUri ? "File added" : item.status}
        left={(props) => (
          <Avatar.Icon {...props} icon={item.icon} style={styles.icon} />
        )}
        right={(props) => (
          <View style={styles.rightSection}>
            <Button
              mode="contained"
              onPress={() => onOpenModal(item)}
              style={styles.button}
            >
              {item.fileUri ? "Change" : "Add"}
            </Button>
            <IconButton
              icon={isDropdownOpen ? "chevron-up" : "chevron-down"}
              onPress={() => onToggleDropdown(item)}
            />
          </View>
        )}
      />
      {isDropdownOpen && item.fileUri && renderContent()}
    </Card>
  );
};

const MyDocuments = () => {
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dispatch = useDispatch();
  const [societyId, setSocietyId] = useState(null);
  const [blockNumber, setBlockNumber] = useState({});
  const [flatNumber, setFlatNumber] = useState({});
  const documentGetted = useSelector(
    (state) => state.documentGetted.getdocuments
  );
  useEffect(() => {
    const getSocietyId = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        const id = JSON.parse(user).societyId;
        const buildingName = JSON.parse(user).buildingName;
        const flatNumber = JSON.parse(user).flatNumber;
        if (id) setSocietyId(id);
        if (buildingName) setBlockNumber(buildingName);
        if (flatNumber) setFlatNumber(flatNumber);
      } catch (error) {
        console.error("Error fetching societyId from AsyncStorage:", error);
      }
    };
    getSocietyId();
  }, []);
  useEffect(() => {
    if (societyId && blockNumber && flatNumber) {
      dispatch(fetchDocumentsById({ societyId, blockNumber, flatNumber }));
    }
  }, [societyId, blockNumber, flatNumber, dispatch]);
  useEffect(() => {
    if (documentGetted.length > 0) {
      const updatedDocuments = initialDocuments.map((doc) => {
        const matchedDoc = documentGetted.find(
          (fetched) => fetched.documentTitle === doc.title
        );
        return {
          ...doc,
          fileUri: matchedDoc ? matchedDoc.pictures : null,
        };
      });
      setDocuments(updatedDocuments);
    }
  }, [documentGetted]);
  const handleOpenModal = (item) => {
    setSelectedDocument(item);
    setModalVisible(true);
  };
  const handleCloseModal = () => {
    setModalVisible(false);
  };
  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });
      if (!result.canceled) {
        const { uri, name, mimeType } = result.assets[0];
        if (uri) {
          const formData = new FormData();
          formData.append("societyId", societyId);
          formData.append("documentTitle", selectedDocument.title);
          formData.append("blockNumber", blockNumber);
          formData.append("flatNumber", flatNumber);
          formData.append("pictures", {
            uri,
            name: name || "document",
            type: mimeType || "application/octet-stream",
          });
          try {
            await dispatch(AddDocumentsAsync(formData))
              .then((response) => {
                handleCloseModal();
                setDropdownOpen(null);
                if (response.meta.requestStatus === "fulfilled") {
                  dispatch(
                    fetchDocumentsById({ societyId, blockNumber, flatNumber })
                  );
                }
              })
              .catch((error) => {
                handleCloseModal();
                setDropdownOpen(null);
                console.error("Error:", error);
              });
          } catch (error) {
            console.error("Upload Error:", error);
          }
        } else {
          Alert.alert("Error", "No file URI found.");
        }
      } else {
        Alert.alert("Cancelled", "Document selection was cancelled.");
      }
    } catch (error) {
      console.error("Document picker error:", error);
      Alert.alert("Error", "An error occurred while picking the document.");
    }
  };

  const handleImagePick = async (type) => {
    try {
      let permissionGranted;
      if (type === "camera") {
        permissionGranted = await ImagePicker.requestCameraPermissionsAsync();
      } else {
        permissionGranted =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
      if (!permissionGranted.granted) {
        Alert.alert(
          "Permission Required",
          "You need to grant permissions to access the camera or gallery."
        );
        return;
      }
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      };
      let result;
      if (type === "camera") {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }
      if (!result.canceled) {
        const uri = result.assets[0]?.uri;
        if (uri) {
          const formData = new FormData();
          formData.append("societyId", societyId);
          formData.append("documentTitle", selectedDocument.title);
          formData.append("blockNumber", blockNumber);
          formData.append("flatNumber", flatNumber);
          formData.append("pictures", {
            uri,
            name: uri.split("/").pop(),
            type: "image/jpeg",
          });
          try {
            await dispatch(AddDocumentsAsync(formData))
              .then((response) => {
                handleCloseModal();
                setDropdownOpen(null);
                if (response.meta.requestStatus === "fulfilled") {
                  dispatch(
                    fetchDocumentsById({ societyId, blockNumber, flatNumber })
                  );
                }
              })
              .catch((error) => {
                handleCloseModal();
                setDropdownOpen(null);
                console.error("Error:", error);
              });
          } catch (error) {
            console.error("Upload Error:", error);
          }
        }
      } else {
        Alert.alert("Cancelled", "Image selection was cancelled.");
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "An error occurred while picking the image.");
    }
  };
  const toggleDropdown = (item) => {
    setDropdownOpen((prevOpen) => (prevOpen === item.id ? null : item.id));
  };
  return (
    <View style={styles.container}>
      <FlatList
        data={documents}
        renderItem={({ item }) => (
          <DocumentItem
            item={item}
            onOpenModal={handleOpenModal}
            onToggleDropdown={toggleDropdown}
            isDropdownOpen={dropdownOpen === item.id}
          />
        )}
        keyExtractor={(item) => item.id}
      />
      <Modal
        visible={modalVisible}
        onRequestClose={handleCloseModal}
        animationType="slide"
        transparent
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={styles.modalTitle}>Select an Option</Text>
              <Icon
                onPress={handleCloseModal}
                name="cancel"
                size={24}
                color="#800336"
              />
            </View>
            <List.Item
              title="Add Document"
              onPress={handleDocumentPick}
              left={() => (
                <Icon name="insert-drive-file" size={24} color="#800336" />
              )}
            />
            <List.Item
              title="Take Photo"
              onPress={() => handleImagePick("camera")}
              left={() => (
                <Icon name="photo-camera" size={24} color="#800336" />
              )}
            />
            <List.Item
              title="Choose from Library"
              onPress={() => handleImagePick("library")}
              left={() => (
                <Icon name="photo-library" size={24} color="#800336" />
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  container1: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 1,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  card: {
    marginVertical: 8,
    backgroundColor: "white",
  },
  icon: {
    backgroundColor: "#F3E1D5",
  },
  button: {
    marginRight: 10,
    backgroundColor: "#800336",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  imagePreview: {
    width: "100%",
    height: 500,
    resizeMode: "cover",
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  closeIcon: {
    fontSize: 20,
    fontWeight: 600,
    color: "#800336",
  },
  pdfContainer: {
    padding: 10,
  },
});
export default MyDocuments;

