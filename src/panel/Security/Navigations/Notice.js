

import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotices, selectError, selectLoading, selectNotices } from '../../User/Redux/Slice/CommunitySlice/NoticeSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Notice = () => {
  const dispatch = useDispatch();
  const [societyId, setSocietyId] = useState("");

  const notices = useSelector(selectNotices);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    const getUserName = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString !== null) {
          const user = JSON.parse(userString);
          setSocietyId(user.societyId);
        }
      } catch (error) {
        console.error("Failed to fetch the user from async storage", error);
      }
    };

    getUserName();
  }, []);

  useEffect(() => {
    if (societyId) {
      dispatch(fetchNotices(societyId));
    }
  }, [dispatch, societyId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#7do431" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  const sortedNotices = notices?.notices ? [...notices.notices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedNotices}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.MainContainer}>
            <View style={styles.header}>
              <Image
                source={require("../../../assets/Security/images/message-board.png")}
                style={styles.image}
                resizeMode="contain"
              />
              <Text style={styles.headerText}>{item.subject}</Text>
              <Text style={styles.time}>
                {new Date(item.createdAt).toLocaleString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Text>
            </View>
            <Text style={styles.mainText}>{item.subject}</Text>
            <Text style={styles.paragraph}>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f6",
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  MainContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f6f6f6",
    elevation: 2,
    padding: 10,
    width: "95%",
    marginLeft: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  image: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
    color: "#800336",
  },
  time: {
    fontSize: 14,
    color: "grey",
  },
  mainText: {
    fontSize: 16,
    fontWeight: "500",
  },
  paragraph: {
    fontSize: 14,
    letterSpacing: 0.5,
    color: "grey",
  },
});

export default Notice;