import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "react-native-paper";
import { fetchEvents } from "../../../Redux/Slice/CommunitySlice/EventSlice";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Events = ({ navigation }) => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events.events);
  const { status, error } = useSelector((state) => state.events);
  const [societyId, setSocietyId] = useState(null);

  useEffect(() => {
    const getSocietyId = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        const id = JSON.parse(user).societyId;
        if (id !== null) {
          setSocietyId(id);
        } else {
          console.error('No societyId found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error fetching societyId from AsyncStorage:', error);
      }
    };
    getSocietyId();
  }, []);

  useEffect(() => {
    if (societyId) {
      dispatch(fetchEvents(societyId));
    }
  }, [dispatch, societyId]);

  let content = null;  // Declare 'content' to be used in rendering

  // Conditional Rendering based on status
  if (status === "loading") {
    return <ActivityIndicator size="large" color="#630000" style={styles.loadingContainer} />;
  } else if (status === "succeeded") {
    // Check if events data is undefined or empty
    if (!events || !events.length) {
      return (
        <View style={styles.noDataContainer}>
          <Image
            source={require('../../../../../assets/Admin/Imgaes/nodatadound.png')}
            style={styles.noDataImage}
            resizeMode="contain"
          />
          <Text style={styles.noDataText}>No Events Found</Text>
        </View>
      );
    }

    // If events exist and have data
    const sortedEvents = [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    content = (
      <>
        {sortedEvents.map((event) => (
          <Card
            style={styles.card}
            key={event._id}
            onPress={() => navigation.navigate('EventDetails', { event })}
          >
            <Card.Content>
              {event.pictures && event.pictures[0] ? (
                <Image
                  source={{ uri: `https://livinsync.onrender.com${event.pictures[0].img}` }}
                  style={styles.pictures}
                />
              ) : (
                <Text style={styles.errorText}>Image not available</Text>
              )}

              <View style={[styles.infoContainer, { marginTop: 10 }]}>
                <Text style={styles.label}>Name </Text>
                <Text style={styles.value}>: {event.name}</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>Start Date</Text>
                <Text style={styles.value}>: {event.startDate.slice(0, 10)}</Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.label}>End Date</Text>
                <Text style={styles.value}>: {event.endDate.slice(0, 10)}</Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </>
    );
  } else if (status === "failed") {
    return (
      <View style={styles.noDataContainer}>
        <Image
          source={require('../../../../../assets/Admin/Imgaes/nodatadound.png')}
          style={styles.noDataImage}
          resizeMode="contain"
        />
        <Text style={styles.noDataText}>No Events Found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f6f6f6" }}>
      <ScrollView contentContainerStyle={styles.scrollView}>{content}</ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  containerSpin: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: "80%"
  },
  horizontalSpin: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  scrollView: {
    paddingHorizontal: 10
  },
  card: {
    width: "100%",
    borderRadius: 10,
    marginVertical: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  pictures: {
    width: "100%",
    height: 150,
    borderRadius: 10,
  },
  text: {
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
  value: {
    flex: 2.5,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataImage: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 18,
    color: '#7d0431',
    textAlign: 'center',
  },
});

export default Events;
