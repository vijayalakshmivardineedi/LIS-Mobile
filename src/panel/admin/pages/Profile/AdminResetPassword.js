import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ensure to install react-native-vector-icons
import { useDispatch } from 'react-redux'; // Import useDispatch from react-redux
import { resetPassword } from './resetPasswordSlice';
import { useNavigation } from '@react-navigation/native';
import { Snackbar } from 'react-native-paper';
const AdminResetPassword = () => {
    const [showPassword, setShowPassword] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });
    const [formErrors, setFormErrors] = useState({});

    const [snackbarVisible, setSnackbarVisible] = useState(false); // Snackbar visibility state
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [formValues, setFormValues] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const dispatch = useDispatch();

    const togglePasswordVisibility = (field) => {
        setShowPassword(prevState => ({
            ...prevState,
            [field]: !prevState[field],
        }));
    };
    const navigation = useNavigation();
    const handleInputChange = (name, value) => {
        setFormValues(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        const errors = {
            currentPassword: formValues.currentPassword === "",
            newPassword: formValues.newPassword === "",
            confirmPassword: formValues.confirmPassword === "",
            passwordMismatch: formValues.newPassword !== formValues.confirmPassword,
        };
        setFormErrors(errors);
        const isValid = !Object.values(errors).some((error) => error);
        try {
            if (!errors.passwordMismatch) {
                if (isValid) {
                    const result = await dispatch(resetPassword({
                        currentPassword: formValues.currentPassword,
                        password: formValues.newPassword,
                    }));
                    if (result.type === "resetPassword/reset/fulfilled") {
                        setFormValues({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                        });
                        setSnackbarMessage(`${result.payload.message}`);
                        setSnackbarVisible(true);

                        setTimeout(() => {
                            setSnackbarVisible(false); // Optionally hide the Snackbar before navigating
                            navigation.goBack();
                        }, 3000); // 3 seconds delay
                    } else {
                        setSnackbarMessage(`${result.payload}`);
                        setSnackbarVisible(true);
                    }

                }
            }
        } catch (error) {
            setSnackbarMessage(`${error}`);
            setSnackbarMessage('An unexpected error occurred.');
            setSnackbarVisible(true);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    secureTextEntry={!showPassword.currentPassword}
                    placeholder="Current Password"
                    onChangeText={(text) => handleInputChange("currentPassword", text)}
                />
                <TouchableOpacity onPress={() => togglePasswordVisibility("currentPassword")}>
                    <Icon
                        name={showPassword.currentPassword ? "visibility-off" : "visibility"}
                        size={24}
                    />
                </TouchableOpacity>

            </View>
            {formErrors.currentPassword && (
                <Text style={styles.errorText}>Current password is required</Text>
            )}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    secureTextEntry={!showPassword.newPassword}
                    placeholder="New Password"
                    onChangeText={(text) => handleInputChange("newPassword", text)}
                />
                <TouchableOpacity onPress={() => togglePasswordVisibility("newPassword")}>
                    <Icon
                        name={showPassword.newPassword ? "visibility-off" : "visibility"}
                        size={24}
                    />
                </TouchableOpacity>

            </View>
            {formErrors.newPassword && (
                <Text style={styles.errorText}>New password is required</Text>
            )}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    secureTextEntry={!showPassword.confirmPassword}
                    placeholder="Confirm New Password"
                    onChangeText={(text) => handleInputChange("confirmPassword", text)}
                />
                <TouchableOpacity onPress={() => togglePasswordVisibility("confirmPassword")}>
                    <Icon
                        name={showPassword.confirmPassword ? "visibility-off" : "visibility"}
                        size={24}
                    />
                </TouchableOpacity>

            </View>
            {formErrors.confirmPassword && (
                <Text style={styles.errorText}>Confirming your new password is required</Text>
            )}
            {formErrors.passwordMismatch && (
                <Text style={styles.errorText}>Passwords do not match</Text>
            )}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
    },
    errorText: {
        color: 'red',
        marginBottom: 4,
        marginLeft: 10,
    },
    submitButton: {
        backgroundColor: '#7d0431',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default AdminResetPassword;
