import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getSequrityPerson, sequrityCheckIn, sequrityCheckOut } from './GateKeeperSlice';
import Toast from 'react-native-toast-message';
import { useRoute } from '@react-navigation/native';

const AttendanceForm = () => {
  const dispatch = useDispatch();
  const route = useRoute();
  const { sequrityId } = route.params;
  const data = useSelector((state) => state.gateKeepers.sequrity);
  const sequrityAttendance = data?.attendance?.slice(-1)[0] || '';

  const [attendance, setAttendance] = useState({
    date: new Date().toISOString().slice(0, 10),
    status: '',
    checkInDateTime: '',
    checkOutDateTime: '',
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    dispatch(getSequrityPerson(sequrityId));
  }, [dispatch, sequrityId]);

  const handleAttendanceChange = (name, value) => {
    setAttendance((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (error) {
      setError(false);
    }
  };

  const handleCheckin = async () => {

    if (!attendance.status) {
      setError(true);
      return;
    }

    try {
      let formData = {
        date: attendance.date,
        status: attendance.status,
      };

      if (attendance.status === 'present') {
        formData.checkInDateTime = new Date().toISOString();
      }

      const response = await dispatch(sequrityCheckIn({ sequrityId, formData }));

      if (response.meta.requestStatus === 'fulfilled') {
        Toast.show({
          text1: 'Check-in Successful',
          text2: 'Successfully Added',
          type: 'success',
          autoHide: true,
          visibilityTime: 1000,
        });

        setAttendance((prevState) => ({
          ...prevState,
          status: '',
        }));

        await dispatch(getSequrityPerson(sequrityId));
      } else {
        Toast.show({
          text1: 'Check-in Failed',
          text2: 'An error occurred during check-in.',
          type: 'error',
          autoHide: true,
          visibilityTime: 1000,
        });
      }
    } catch (error) {
      console.error('Error during check-in:', error);
      Toast.show({
        text1: 'Check-in Failed',
        text2: 'An error occurred during check-in.',
        type: 'error',
        autoHide: true,
        visibilityTime: 1000,
      });
    }
  };

  const handleCheckout = async () => {
    const attendanceId = sequrityAttendance._id;
    try {
      await dispatch(sequrityCheckOut({ sequrityId, attendanceId }));
      Toast.show({
        text1: 'Check-out Successful',
        text2: 'You have checked out successfully.',
        type: 'success',
        autoHide: true,
        visibilityTime: 1000,
      });
      dispatch(getSequrityPerson(sequrityId));
    } catch (error) {
      console.error('Error during check-out:', error);
      Toast.show({
        text1: 'Check-out Failed',
        text2: 'An error occurred during check-out.',
        type: 'error',
        autoHide: true,
        visibilityTime: 1000,
      });
    }
  };

  const handleSelectStatus = (status) => {
    handleAttendanceChange('status', status);
    setShowDropdown(false);
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  return (
    <View style={styles.container}>

      <View style={styles.record}>
        <View style={styles.detailContainer}>
          <Text style={styles.bold}>Sequrity Id:</Text>
          <Text style={styles.profileDetail}>
            {data.sequrityId}
          </Text>
        </View>

        <View style={styles.detailContainer}>
          <Text style={styles.bold}>Name:</Text>
          <Text style={styles.profileDetail}>{data.name}</Text>
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.bold}>Email:</Text>
          <Text style={styles.profileDetail}>{data.email}</Text>
        </View>
      </View> 

      {sequrityAttendance ? (
        <View style={styles.record}>
          <Text style={styles.recordTitle}>Last Attendance Record</Text>

          <View style={styles.detailContainer}>
            <Text style={styles.bold}>Date:</Text>
            <Text style={styles.profileDetail}>
              {new Date(sequrityAttendance.date).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.bold}>Status:</Text>
            <Text style={styles.profileDetail}>{sequrityAttendance.status}</Text>
          </View>

          {sequrityAttendance.checkInDateTime && (
            <View style={styles.detailContainer}>
              <Text style={styles.bold}>Check-in Time:</Text>
              <Text style={styles.profileDetail}>
                {new Date(sequrityAttendance.checkInDateTime).toLocaleString([], {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}

          {sequrityAttendance.checkOutDateTime && (
            <View style={styles.detailContainer}>
              <Text style={styles.bold}>Check-out Time:</Text>
              <Text style={styles.profileDetail}>
                {new Date(sequrityAttendance.checkOutDateTime).toLocaleString([], {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.record}>
          <Text style={styles.recordTitle}>Last Attendance Record</Text>
          <Text style={styles.noRecord}>No Attendance Record Found</Text>
        </View>
      )}

      {sequrityAttendance.checkOutDateTime !== null && (
        <View style={styles.dropdown}>
          <TouchableOpacity onPress={() => setShowDropdown(!showDropdown)}>
            <Text style={styles.dropdownText}>{capitalizeFirstLetter(attendance.status) || 'Select Status'}</Text>
          </TouchableOpacity>
          {showDropdown && (
            <View style={styles.dropdownOptions}>
              <TouchableOpacity onPress={() => handleSelectStatus('present')} style={styles.option}>
                <Text style={styles.optionText}>Present</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleSelectStatus('leave')} style={styles.option}>
                <Text style={styles.optionText}>Leave</Text>
              </TouchableOpacity>
            </View>
          )}
          {error && <Text style={styles.errorText}>Please select a status before checking in.</Text>}
        </View>
      )}

{(!sequrityAttendance.checkInDateTime || sequrityAttendance.checkOutDateTime !== null ) && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.buttonCheck} onPress={handleCheckin}>
              <Text style={styles.addButtonText}>Check-in</Text>
            </TouchableOpacity>
          </View>
        )}

      {sequrityAttendance.checkOutDateTime === null && (
        <View style={styles.buttonContainer}>
          <Text style={styles.buttonText}>Already Check-In</Text>
          <TouchableOpacity style={styles.buttonCheck} onPress={handleCheckout}>
            <Text style={styles.addButtonText}>Check Out</Text>
          </TouchableOpacity>
        </View>
      )}

      {sequrityAttendance === 'Already Checkout' && (
        <View style={styles.buttonContainer}>
          <Text style={styles.buttonText}>Re-Entry</Text>
          <TouchableOpacity style={styles.buttonCheck} onPress={handleCheckin}>
            <Text style={styles.addButtonText}>Check-in Again</Text>
          </TouchableOpacity>
        </View>
      )}

      <Toast />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  record: {
    marginVertical: 20,
    padding: 10,
    borderColor: '#7D0431',
    borderWidth: 1,
    borderRadius: 5,
  },
  recordTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#630000',
    alignSelf: "center",
    marginBottom: 8
  },
  dropdown: {
    borderColor: '#7D0431',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  dropdownText: {
    color: '#333',
    marginBottom: 5,
  },
  dropdownOptions: {
    borderColor: '#7D0431',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  option: {
    padding: 10,
  },
  optionText: {
    color: '#333',
  },
  buttonContainer: {
    marginVertical: 10,
  },
  buttonCheck: {
    backgroundColor: '#7D0431',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  profileDetail: {
    fontSize: 17,
    flex: 1,
    marginVertical: 5,
  },
  bold: {
    fontWeight: 'bold',
    fontSize: 18,
    flex: 1,
  },
  detailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noRecord: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
});

export default AttendanceForm;
