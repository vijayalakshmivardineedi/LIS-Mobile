// Request.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Request = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        Your request has been sent to admin. Please wait until admin approves.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    padding: 20,
    color: '#333',
  },
});

export default Request;
