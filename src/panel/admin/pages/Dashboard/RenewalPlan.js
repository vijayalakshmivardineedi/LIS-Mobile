import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import renewal from "../../../../assets/Admin/Imgaes/renewal2.png";
import * as Linking from 'expo-linking';

const PlanRenewalScreen = () => {
    const upiPaymentURL = `upi://pay?pa=7997148737@ibl&pn=MerchantName&am=10&cu=INR&tn=Payment+for+Order&tr=TXN123456`;

    const paymentSuru = async () => {
        try {
            const supported = await Linking.canOpenURL(upiPaymentURL);
            if (supported) {
                await Linking.openURL(upiPaymentURL);
            } else {
                Alert.alert('Error', 'No UPI apps installed to handle the payment.');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to initiate UPI payment.');
            console.error(err);
        }
    };

    useEffect(() => {
        const handleUrl = async (url) => {
            // Parse the URL to check for the payment status
            const { queryParams } = Linking.parse(url);
            if (queryParams) {
                // Check if txnStatus is present in the query params
                const { txnStatus } = queryParams;
                if (txnStatus === 'SUCCESS') {
                    Alert.alert('Payment Successful', 'Your payment was successful.');
                } else if (txnStatus === 'FAILURE') {
                    Alert.alert('Payment Failed', 'Your payment failed.');
                } else {
                    Alert.alert('Unknown Status', 'Unable to determine the payment status.');
                }
            }
        };

        // Listen for incoming links
        const subscription = Linking.addEventListener('url', ({ url }) => {
            handleUrl(url);
        });

        // Clean up the event listener on unmount
        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <View style={styles.container}>
            <Image
                source={renewal}
                style={styles.image}
                resizeMode="contain"
            />
            <Text style={styles.text}>
                Your plan has expired. Please renew the plan by clicking on the button below.
            </Text>
            {/* <TouchableOpacity style={styles.renewButton} onPress={paymentSuru}>
                <Text style={styles.renewButtonText}>Renew Expired Plan</Text>
            </TouchableOpacity> */}
        </View>
    );
};

export default PlanRenewalScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: 20,
    },
    renewButton: {
        backgroundColor: '#7d0431',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 20,
    },
    renewButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    image: {
        width: 300,
        height: 300,
        marginBottom: 20,
    },
    text: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
});
