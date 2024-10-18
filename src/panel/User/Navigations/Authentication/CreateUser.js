import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { fetchSocietyByLicence } from "../../Redux/Slice/AuthSlice/Signup/licenceSlice";
import { fetchCitiesById } from "../../Redux/Slice/AuthSlice/Signup/citySlice";
import { sendVerificationEmail } from "../../Redux/Slice/AuthSlice/Signup/SendEmailVerification";
import Toast from "react-native-toast-message";

const CreateUser = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [societyLicense, setSocietyLicense] = useState("LIS-");
    const [isLicenseValid, setIsLicenseValid] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [email, setEmail] = useState("");
    const [mobileNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [retypePassword, setRetypePassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [name, setName] = useState("");
    const [block, setBlock] = useState("");
    const [flat, setFlat] = useState("");
    const [userType, setUserType] = useState("");
    const [emailError, setEmailError] = useState("");
    const [nameError, setNameError] = useState("");
    const [mobileNumberError, setMobileNumberError] = useState("");
    const [blockError, setBlockError] = useState("");
    const [flatError, setFlatError] = useState("");
    const [userTypeError, setUserTypeError] = useState("");
    const [showBlockMenu, setShowBlockMenu] = useState(false);
    const [showFlatMenu, setShowFlatMenu] = useState(false);
    const [showUserTypeMenu, setShowUserTypeMenu] = useState(false);

    const society = useSelector(state => state.societyLis.societyByLicence || null);
    const city = useSelector(state => state.citiesState.currentCity || null);

    const blocksForSelectedSociety = society?.blocks || [];
    const flatsForSelectedBlock = blocksForSelectedSociety.find(b => b.blockName === block)?.flats || [];
    const userTypes = ["Tenant", "Owner"];

    useEffect(() => {
        if (society && society.city) {
            dispatch(fetchCitiesById({ cityId: society.city }));
        }
    }, [society, dispatch]);

    const handleLicenseInputChange = (value) => {
        const digits = value.replace("LIS-", "");
        if (/^\d{0,6}$/.test(digits)) {
            setSocietyLicense(`LIS-${digits}`);
            setIsLicenseValid(digits.length === 6);
        }
    };

    const handleSubmit = async () => {
        if (isLicenseValid) {
            try {
                const result = await dispatch(fetchSocietyByLicence({ societyLicense })).unwrap();

                setShowDetails(true);

                if (result.city) {
                    await dispatch(fetchCitiesById({ cityId: result.city }));
                } else {
                    throw new Error('City ID not found in society data');
                }
            } catch (error) {
                setSocietyLicense("LIS-")
                Toast.show({
                    type: 'error',
                    text1: 'License Invalid',
                    text2: error.message || 'An error occurred during the fetch process.',
                    position: 'top',
                    topOffset: 60,
                    zIndex: 1000,
                });
            }
        }
    };

  

    const handleCreateUser = async () => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const mobileNumberRegex = /^\d{10}$/;
        let isValid = true;

        if (!email) {
            setEmailError("Please enter your email.");
            isValid = false;
        } else if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email address.");
            isValid = false;
        } else {
            setEmailError("");
        }

        if (!password) {
            setPasswordError("Password is required");
            isValid = false;
        } else if (password !== retypePassword) {
            setPasswordError("Passwords do not match.");
            isValid = false;
        } else {
            setPasswordError("");
        }

        if (!name) {
            setNameError("Name is required");
            isValid = false;
        } else {
            setNameError("");
        }

        if (!mobileNumber) {
            setMobileNumberError("Phone number is required");
            isValid = false;
        } else if (!mobileNumberRegex.test(mobileNumber)) {
            setMobileNumberError("Phone number must be exactly 10 digits");
            isValid = false;
        } else {
            setMobileNumberError("");
        }

        if (!block) {
            setBlockError("Block is required");
            isValid = false;
        } else {
            setBlockError("");
        }

        if (!flat) {
            setFlatError("Flat is required");
            isValid = false;
        } else {
            setFlatError("");
        }

        if (!userType) {
            setUserTypeError("User Type is required");
            isValid = false;
        } else {
            setUserTypeError("");
        }

        if (!isValid) {
            return;
        }

        const societyId = society?._id;
        const societyName = society?.societyName;

        try {
            const resultAction = await dispatch(sendVerificationEmail(email.toLowerCase())).unwrap();
            console.log(resultAction)
            navigation.navigate("Verification", {
                name,
                email,
                mobileNumber,
                password,
                societyId,
                society: societyName,
                block,
                flat,
                userType,
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Verification Email Failed',
                text2: error.message || 'An error occurred while sending the verification email.',
                position: 'top',
                topOffset: 60,
            });
        }
    };

    const toggleBlockMenu = () => {
        setShowBlockMenu(!showBlockMenu);
        if (showFlatMenu) setShowFlatMenu(false);
    };

    const toggleFlatMenu = () => {
        setShowFlatMenu(!showFlatMenu);
        if (showBlockMenu) setShowBlockMenu(false);
    };

    const toggleUserTypeMenu = () => {
        setShowUserTypeMenu(!showUserTypeMenu);
    };

    return (

        <View style={styles.container}>

            <Text style={styles.maintitle}>Registration</Text>
            {!showDetails ? (
                <>
                    <Text style={styles.title}>Enter Society License</Text>
                    <TextInput
                        theme={{ colors: { primary: "#7D0431" } }}
                        mode="outlined"
                        style={styles.input}
                        label="Society License"
                        value={societyLicense}
                        onChangeText={handleLicenseInputChange}
                        keyboardType="numeric"
                    />
                    <View style={styles.buttonContainer}>
                        <Button
                            mode="contained"
                            theme={{ colors: { primary: '#7D0431' } }}
                            onPress={handleSubmit}
                            disabled={!isLicenseValid}
                        >
                            Submit
                        </Button>
                    </View>
                </>
            ) : (
                <>
                    <View style={styles.societyContainer}>
                        <Text style={styles.title}>Society Details</Text>
                        {society && (
                            <>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Name:</Text>
                                    <Text style={styles.value}>{society.societyName}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Address:</Text>
                                    <Text style={styles.value}>{society.societyAdress.addressLine1}, {society.societyAdress.addressLine2}</Text>
                                </View>
                            </>
                        )}
                        {city && (
                            <>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>City:</Text>
                                    <Text style={styles.value}>{city.name}</Text>
                                </View>
                            </>
                        )}
                    </View>
                    <ScrollView style={styles.detailsContainer}>
                        <View>
                            {/* Block Dropdown */}
                            <View style={styles.dropdownContainer}>
                                <TouchableOpacity
                                    onPress={toggleBlockMenu}
                                    style={[styles.dropdown, showBlockMenu && styles.dropdownActive]}
                                    disabled={!society}
                                >
                                    <Text>{block ? block : "Select Block"}</Text>
                                </TouchableOpacity>
                                {showBlockMenu && (
                                    <View style={styles.menu}>
                                        {blocksForSelectedSociety.map((item) => (
                                            <TouchableOpacity
                                                key={item._id}
                                                onPress={() => {
                                                    setBlock(item.blockName);
                                                    setShowBlockMenu(false);
                                                    setFlat("");
                                                }}
                                                style={styles.menuItem}
                                                disabled={!society}
                                            >
                                                <Text>{item.blockName}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                                {blockError ? <Text style={styles.errorText}>{blockError}</Text> : null}
                            </View>

                           
                            <View style={styles.dropdownContainer}>
                                <TouchableOpacity
                                    onPress={toggleFlatMenu}
                                    style={[styles.dropdown, showFlatMenu && styles.dropdownActive]}
                                    disabled={!society}
                                >
                                    <Text>{flat ? flat : "Select Flat"}</Text>
                                </TouchableOpacity>
                                {showFlatMenu && (
                                    <View style={styles.menu}>
                                        {flatsForSelectedBlock.map((item) => (
                                            <TouchableOpacity
                                                key={item._id}
                                                onPress={() => {
                                                    setFlat(item.flatNumber);
                                                    setShowFlatMenu(false);
                                                }}
                                                style={styles.menuItem}
                                                disabled={!society}
                                            >
                                                <Text>{item.flatNumber}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                                {flatError ? <Text style={styles.errorText}>{flatError}</Text> : null}

                            </View>
                            <View style={styles.dropdownContainer}>
                                <TouchableOpacity
                                    onPress={toggleUserTypeMenu}
                                    style={[styles.dropdown, showUserTypeMenu && styles.dropdownActive]}
                                >
                                    <Text>{userType ? userType : "Select User Type"}</Text>
                                </TouchableOpacity>
                                {showUserTypeMenu && (
                                    <View style={styles.menu}>
                                        {userTypes.map((type) => (
                                            <TouchableOpacity
                                                key={type}
                                                onPress={() => {
                                                    setUserType(type);
                                                    setShowUserTypeMenu(false);
                                                }}
                                                style={styles.menuItem}
                                            >
                                                <Text>{type}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                                {userTypeError ? <Text style={styles.errorText}>{userTypeError}</Text> : null}
                            </View>
                            {/* Additional fields */}
                            <View style={styles.subContainer}>
                                <TextInput
                                    theme={{ colors: { primary: "#7D0431" } }}
                                    mode="outlined"
                                    style={styles.input}
                                    label="Name"
                                    value={name}
                                    onChangeText={setName}
                                />
                                {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
                            </View>
                            <View style={styles.subContainer}>
                                <TextInput
                                    theme={{ colors: { primary: "#7D0431" } }}
                                    mode="outlined"
                                    style={styles.input}
                                    label="Email"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setEmailError("");
                                    }}
                                    error={!!emailError}
                                />
                                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                            </View>
                            <View style={styles.subContainer}>
                                <TextInput
                                    theme={{ colors: { primary: "#7D0431" } }}
                                    mode="outlined"
                                    style={styles.input}
                                    label="Phone Number"
                                    value={mobileNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="numeric"
                                />
                                {mobileNumberError ? <Text style={styles.errorText}>{mobileNumberError}</Text> : null}
                            </View>
                        </View>
                        <View style={styles.subContainer}>
                            <TextInput
                                theme={{ colors: { primary: "#7D0431" } }}
                                mode="outlined"
                                style={styles.input}
                                label="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                        </View>
                        <View style={styles.subContainer}>
                            <TextInput
                                theme={{ colors: { primary: "#7D0431" } }}
                                mode="outlined"
                                style={styles.input}
                                label="Re-type Password"
                                value={retypePassword}
                                onChangeText={(text) => {
                                    setRetypePassword(text);
                                    setPasswordError("");
                                }}
                                secureTextEntry
                            />
                            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                        </View>
                        <Button
                            mode="contained"
                            theme={{ colors: { primary: '#7D0431' } }}
                            onPress={handleCreateUser}
                            style={styles.buttonContainer}
                        >
                            Create User
                        </Button>
                    </ScrollView>
                </>
            )}
            <Toast />
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 20,
        backgroundColor: "#fcf6f0",
    },
    maintitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#7D0431',
        textAlign: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#7D0431',
        marginBottom: 10,
    },
    input: {
        fontSize: 15,
    },
    buttonContainer: {
        marginTop: 20,
        marginBottom: 20,
    },
    detailsContainer: {
        flex: 1,
        padding: 15,
    },
    societyContainer: {
        borderWidth: 1,
        borderColor: "gray",
        borderStyle: "solid",
        borderRadius: 5,
        padding: 10
    },

    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        width: 70, // Set a fixed width for the label
    },
    value: {
        fontSize: 16,
        color: '#800336',
        flex: 1,  // Let the value take the remaining space
    },
    dropdownContainer: {
        marginBottom: 15,
    },
    subContainer: {
        marginBottom: 15,
    },
    dropdown: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#7D0431',
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    dropdownActive: {
        backgroundColor: '#f1f1f1',
    },
    menu: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        marginTop: 5,
        backgroundColor: '#fff',
        position: 'absolute',
        zIndex: 999,
        width: '100%',
        fontSize: 15,
    },
    menuItem: {
        padding: 10,
    },
    errorText: {
        color: 'red',
        fontSize: 14,
    },
});

export default CreateUser;
