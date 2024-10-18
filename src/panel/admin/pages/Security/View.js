import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSequrityPerson } from './GateKeeperSlice';
import { View, Text, Image, ActivityIndicator, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ImagebaseURL } from '../../../Security/helpers/axios';

const ViewSequrity = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { sequrityId } = route.params;
  const profile = useSelector((state) => state.gateKeepers.sequrity);
  const status = useSelector((state) => state.gateKeepers.status);
  const error = useSelector((state) => state.gateKeepers.error);

  useEffect(() => {
    dispatch(getSequrityPerson(sequrityId));
  }, [dispatch, sequrityId]);

  if (status === 'loading') {
    return <ActivityIndicator size="large" color="#630000" style={styles.loader} />;
  }

  if (status === 'failed') {
    return <Text style={styles.errorText}>Error: {error}</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      {profile ? (
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: `${ImagebaseURL}${profile.pictures}` }}
            style={styles.profileImage}
          />
          <View style={styles.detailContainer}>
            <Text style={styles.bold}>Name</Text>
            <Text style={styles.profileDetail}>{profile.name}</Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.bold}>Email</Text>
            <Text style={styles.profileDetail}>{profile.email}</Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.bold}>Mobile Number</Text>
            <Text style={styles.profileDetail}>{profile.phoneNumber}</Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.bold}>Role</Text>
            <Text style={styles.profileDetail}>{profile.role}</Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.bold}>Aadhar Number</Text>
            <Text style={styles.profileDetail}>{profile.aadharNumber}</Text>
          </View>
          {profile.address && (
            <View style={styles.detailContainer}>
              <Text style={styles.bold}>Address</Text>
              <Text style={styles.profileDetail}>{`${profile.address.addressLine1 || ''}, ${profile.address.addressLine2 || ''}, ${profile.address.state || ''}, ${profile.address.postalCode || ''}`}</Text>
            </View>
          )}

          {profile.attendance && profile.attendance.length > 0 && (
            <View style={styles.attendanceContainer}>
              <Text style={styles.attendanceTitle}>Attendance</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>Date</Text>
                  <Text style={styles.tableHeaderText}>Status</Text>
                  <Text style={styles.tableHeaderText}>Check In</Text>
                  <Text style={styles.tableHeaderText}>Check Out</Text>
                </View>
                {profile.attendance.map((attendanceRecord) => (
                  <View key={attendanceRecord._id} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{new Date(attendanceRecord.date).toLocaleDateString()}</Text>
                    <Text style={styles.tableCell}>{attendanceRecord.status}</Text>
                    <Text style={styles.tableCell}>{attendanceRecord.checkInDateTime ? new Date(attendanceRecord.checkInDateTime).toLocaleTimeString() : '-'}</Text>
                    <Text style={styles.tableCell}>{attendanceRecord.checkOutDateTime ? new Date(attendanceRecord.checkOutDateTime).toLocaleTimeString() : '-'}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      ) : (
        <Text>No profile found.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 23,
    fontWeight: '700',
    color: '#630000',
  },
  profileContainer: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  profileImage: {
    width: 250,
    height: 250,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 30,
  },
  profileName: {
    fontSize: 23,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
  attendanceContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  attendanceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#630000',
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#630000',
  },
  tableHeaderText: {
    flex: 1,
    color: '#fff',
    padding: 10, 
    textAlign: 'center',
    fontWeight: '600',
  }, 
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
  },
  profileDetail: {
    fontSize: 17,
    flex: 1,
    marginVertical: 5,
  },
  bold: {
    fontWeight: "500",
    fontSize: 17,
    flex: 1,
  },
  detailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default ViewSequrity;
