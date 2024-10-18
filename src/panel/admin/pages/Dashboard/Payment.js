import React, { useState, useEffect, useRef } from 'react';
import { Button, Alert, TextInput, View, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import ViewShot from 'react-native-view-shot';
import axios from 'axios';

const UpiPayment = () => {
    const [upiId, setUpiId] = useState('7997148737@ibl');
    const [payeeName, setPayeeName] = useState('Society');
    const [amount, setAmount] = useState('1');
    const [transactionNote, setTransactionNote] = useState('Maintenance');
    const [transactionDetails, setTransactionDetails] = useState(null);
    const viewShotRef = useRef(); // Reference for ViewShot

    const generateUpiUrl = (upiId, payeeName, amount, transactionNote) => {
        const currency = 'INR';
        const encodedPayeeName = encodeURIComponent(payeeName);
        const encodedTransactionNote = encodeURIComponent(transactionNote);

        return `upi://pay?pa=${upiId}&pn=${encodedPayeeName}&am=${amount}&cu=${currency}&tn=${encodedTransactionNote}`;
    };

    const initiateUpiPayment = async () => {
        const upiUrl = generateUpiUrl(upiId, payeeName, amount, transactionNote);

        try {
            const supported = await Linking.canOpenURL(upiUrl);

            if (supported) {
                await Linking.openURL(upiUrl);
            } else {
                Alert.alert('Error', 'No UPI apps installed to handle the payment.');
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to initiate UPI payment.');
            console.error(err);
        }
    };

    const handleUpiResponse = async (url) => {
        const { queryParams } = Linking.parse(url);
        const txnId = queryParams.txnId || 'N/A';
        const paidAmount = queryParams.am || amount;
        const transactionDate = new Date().toLocaleString();
        const status = queryParams.Status || 'N/A';

        if (status === 'SUCCESS') {
            Alert.alert('Payment Success', `Payment completed successfully.\nTransaction ID: ${txnId}`);
            setTransactionDetails({
                txnId,
                paidAmount,
                transactionDate,
                status,
            });

            // Capture screenshot and send to backend
            const uri = await captureScreenshot(txnId, paidAmount, transactionDate);
            await sendPaymentDetails(uri, { txnId, paidAmount, transactionDate, status });
        } else {
            Alert.alert('Payment Failed', 'Payment was either canceled or failed.');
        }
    };

    const captureScreenshot = async () => {
        try {
            const uri = await viewShotRef.current.capture();
            console.log('Screenshot captured:', uri);
            return uri;
        } catch (error) {
            console.error('Failed to capture screenshot:', error);
            return null;
        }
    };

    const sendPaymentDetails = async (uri, paymentDetails) => {
        if (!uri) {
            Alert.alert('Error', 'Screenshot not captured.');
            return;
        }

        const formData = new FormData();
        formData.append('file', {
            uri,
            name: `payment_screenshot_${paymentDetails.txnId}.png`,
            type: 'image/png',
        });
        formData.append('txnId', paymentDetails.txnId);
        formData.append('paidAmount', paymentDetails.paidAmount);
        formData.append('transactionDate', paymentDetails.transactionDate);
        formData.append('status', paymentDetails.status);

        try {
            const response = await axios.post('YOUR_BACKEND_API_ENDPOINT', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Payment details sent:', response.data);
            Alert.alert('Success', 'Payment details saved successfully.');
        } catch (error) {
            console.error('Error sending payment details:', error);
            Alert.alert('Error', 'Failed to save payment details.');
        }
    };

    useEffect(() => {
        const subscription = Linking.addEventListener('url', (event) => {
            const { url } = event;
            handleUpiResponse(url);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <View style={styles.container}>
            <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
                <View style={styles.transactionDetails}>
                    {transactionDetails && (
                        <>
                            <Text style={styles.transactionText}>Transaction ID: {transactionDetails.txnId}</Text>
                            <Text style={styles.transactionText}>Amount Paid: ₹{transactionDetails.paidAmount}</Text>
                            <Text style={styles.transactionText}>Date & Time: {transactionDetails.transactionDate}</Text>
                            <Text style={styles.transactionText}>Status: {transactionDetails.status}</Text>
                        </>
                    )}
                </View>
            </ViewShot>

            <TextInput
                style={styles.input}
                placeholder="Enter UPI ID (e.g., name@bank)"
                value={upiId}
                onChangeText={setUpiId}
            />
            <TextInput
                style={styles.input}
                placeholder="Enter Payee Name"
                value={payeeName}
                onChangeText={setPayeeName}
            />
            <TextInput
                style={styles.input}
                placeholder="Enter Amount"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
            />
            <TextInput
                style={styles.input}
                placeholder="Transaction Note (optional)"
                value={transactionNote}
                onChangeText={setTransactionNote}
            />

            <Button title="Pay via UPI" onPress={initiateUpiPayment} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
    },
    transactionDetails: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        elevation: 2,
    },
    transactionText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
    },
});

export default UpiPayment;
