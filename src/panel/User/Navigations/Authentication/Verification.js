import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { verifyOTP, resetVerification, selectLoadingStatus, } from '../../Redux/Slice/AuthSlice/Signup/otpSlice';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchUserProfile } from '../../Redux/Slice/AuthSlice/Signup/userProfileSlice';
import Toast from 'react-native-toast-message';

const Verification = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { name, email, mobileNumber, password, society, societyId, block, flat, userType } = route.params;
  const [countdown, setCountdown] = useState(180);
  const [verificationCode, setVerificationCode] = useState(Array(6).fill(''));
  const loading = useSelector(selectLoadingStatus);
  const refs = useRef([]);
  const successMessage = useSelector((state) => state.user.successMessage);
  console.log(successMessage)
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (refs.current[0]) {
      refs.current[0].focus();
    }
  }, []);

  const handleChangeVerificationCode = (index, value) => {
    const newVerificationCode = [...verificationCode];
    newVerificationCode[index] = value;
    setVerificationCode(newVerificationCode);

    if (value.length === 0 && index > 0 && refs.current[index - 1]) {
      refs.current[index - 1].focus();
    }

    if (value.length === 1 && index < verificationCode.length - 1 && refs.current[index + 1]) {
      refs.current[index + 1].focus();
    }
  };

  const handleResendOTP = () => {
    setCountdown(180);
  };

  const handleContinue = async () => {
    try {
      // Dispatch OTP verification
      const resultAction = await dispatch(verifyOTP({ email: email.toLowerCase(), otp: verificationCode.join('') })).unwrap();

      if (resultAction.success) {
        // Reset verification and fetch user profile
        dispatch(resetVerification());

        const userProfileId = resultAction.userProfile?._id;
        if (userProfileId) {
          const userData = { name, email: email.toLowerCase(), mobileNumber, password, society, societyId, block, flat, userType };
          await dispatch(fetchUserProfile({ id: userProfileId, data: userData })).unwrap();
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: successMessage || 'Successfully Created.',
            position: 'top',
            topOffset: 60,
          });
          setTimeout(() => {
            navigation.navigate('Login');
          }, 2000);
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: resultAction.payload.message || 'An error occurred during OTP verification.',
          position: 'top',
          topOffset: 60,
        });
        navigation.goBack();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error.message || 'An error occurred during OTP verification.',
        position: 'top',
        topOffset: 60,
      });
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.prompt}>Enter the OTP sent to your phone</Text>
        <View style={styles.row}>
          <View style={styles.phoneRow}>
            <Text style={styles.phoneText}>{email}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.otpContainer}>
          {verificationCode.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleChangeVerificationCode(index, value)}
              keyboardType="numeric"
              maxLength={1}
              ref={(input) => (refs.current[index] = input)}
            />
          ))}
        </View>
        <View style={styles.flexibleContainer}>
          <View style={styles.resendRow}>
            <View style={styles.countdownContainer}>
              <MaterialCommunityIcons name="clock" size={20} color="#000" />
              <Text style={styles.countdownText}>{formatTime(countdown)}</Text>
            </View>
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendOTP}
              disabled={countdown > 0}
            >
              <Text
                style={[
                  styles.resendText,
                  countdown > 0 && styles.resendTextDisabled,
                ]}
              >
                Resend OTP
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            disabled={loading || verificationCode.some((digit) => digit === '')}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>
        <Toast />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fbf5f1',
  },
  prompt: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  phoneText: {
    fontStyle: 'italic',
    fontSize: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editText: {
    fontSize: 16,
    marginRight: 5,
    color: '#7D0431',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    borderBottomWidth: 1,
    height: 40,
    width: 40,
    textAlign: 'center',
  },
  flexibleContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  countdownText: {
    fontSize: 16,
    marginLeft: 10,
  },
  resendButton: {
    alignItems: 'flex-end',
  },
  resendText: {
    fontSize: 16,
    color: '#7D0431',
  },
  resendTextDisabled: {
    color: 'grey',
  },
  continueButton: {
    backgroundColor: '#7d0431',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
});

export default Verification;