import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { ActivityIndicator, FAB, IconButton, Menu, ProgressBar, } from 'react-native-paper';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import socketServices from '../../../User/Socket/SocketServices';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dimensions } from 'react-native';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Provider as PaperProvider } from 'react-native-paper';
const Polls = () => {
    const [polls, setPolls] = useState([]);
    const [societyId, setSocietyId] = useState("");
    const [index, setIndex] = useState(0);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false); // Add loading state
    const [routes] = useState([
        { key: 'active', title: 'Active Polls' },
        { key: 'closed', title: 'Closed Polls' },
    ]);

    useEffect(() => {
        const getUserName = async () => {
            try {
                const societyAdmin = await AsyncStorage.getItem('user');
                const parsedAdmin = societyAdmin ? JSON.parse(societyAdmin) : {};
                setSocietyId(parsedAdmin._id || "");
            } catch (error) {
                console.error("Failed to fetch the user from async storage", error);
            }
        };
        getUserName();
    }, []);


    useFocusEffect(
        React.useCallback(() => {
            socketServices.initializeSocket();
            if (societyId) {
                socketServices.emit('joinSecurityPanel', societyId);
                socketServices.emit('get_polls_by_society_id', { societyId });
            }
            const handlePollsBySocietyId = (fetchedPolls) => {
                setPolls(fetchedPolls);
                setLoading(false);
            };

            const handleVoteUpdate = (data) => {
                alert(data.message);
                setPolls(prevPolls => {
                    const updatedPollIndex = prevPolls.findIndex(poll => poll._id === data.votes._id);
                    if (updatedPollIndex !== -1) {
                        const updatedPolls = [...prevPolls];
                        updatedPolls[updatedPollIndex] = data.votes;
                        return updatedPolls;
                    } else {
                        return prevPolls;
                    }
                });
            };

            const handlePollDeleted = (pollId) => {
                setPolls(prevPolls => prevPolls.filter(poll => poll._id !== pollId));
                setLoading(false);
            };
            const handlePollEdited = (fetchedPolls) => {
                setPolls(fetchedPolls);
                setLoading(false);
            };

            const handleNewPollCreated = (newPoll) => {
                setPolls(prevPolls => [newPoll, ...prevPolls]);
            };

            socketServices.on('polls_by_society_id', handlePollsBySocietyId);
            socketServices.on('vote_update', handleVoteUpdate);
            socketServices.on('new_poll_created', handleNewPollCreated);
            socketServices.on('poll_deleted', handlePollDeleted);
            socketServices.on('pollsUpdated', handlePollEdited);

            return () => {
                socketServices.removeListener('polls_by_society_id', handlePollsBySocietyId);
                socketServices.removeListener('new_poll_created', handleNewPollCreated);
                socketServices.removeListener('vote_update', handleVoteUpdate);
                socketServices.removeListener('poll_deleted', handlePollDeleted);
                socketServices.removeListener('pollsUpdated', handlePollEdited);
            };
        }, [societyId]) // Dependencies to re-run the effect
    );
    const calculateVotePercentage = (votes, option) => {
        const totalVotes = votes.length;
        const optionVotes = votes.filter(vote => vote.selectedOption === option).length;
        return totalVotes === 0 ? 0 : (optionVotes / totalVotes);
    };

    const handleCreatePoll = () => {
        navigation.navigate('Create Poll'); // Adjust this to your Create Poll screen name
    };

    const isPollExpired = (expDate) => {
        const currentDate = new Date();
        return currentDate > new Date(expDate);
    };

    const ActivePolls = () => {
        const activePolls = polls.filter(item => !isPollExpired(item.poll?.expDate));
        if (loading) { // Show spinner while loading
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7d0431" />
                </View>
            );
        }
        const activerReversedPoll = [...activePolls].reverse()
        return (
            <ScrollView>
                {activerReversedPoll.length === 0 ? (
                    <View style={styles.noDataContainer}>

                        <Image
                            source={require('../../../../assets/Admin/Imgaes/nodatadound.png')}
                            style={styles.noDataImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.noDataText}>No More Active Polls</Text>
                    </View>
                ) : (
                    activerReversedPoll.map((item) => (
                        <PollItem key={item._id} item={item} isExpired={false} />
                    ))
                )}
            </ScrollView>
        );
    };

    const ClosedPolls = () => {
        const closedPolls = polls.filter(item => isPollExpired(item.poll?.expDate));
        if (loading) { // Show spinner while loading
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7d0431" />
                </View>
            );
        }
        const closedReversedPolls = [...closedPolls].reverse()
        return (
            <ScrollView>
                {closedReversedPolls.length === 0 ? (
                    <View style={styles.noDataContainer}>
                        <Image
                            source={require('../../../../assets/Admin/Imgaes/nodatadound.png')}
                            style={styles.noDataImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.noDataText}>No More Closed Polls</Text>
                    </View>
                ) : (
                    closedReversedPolls.map((item) => (
                        <PollItem key={item._id} item={item} isExpired={true} />
                    ))
                )}
            </ScrollView>
        );
    };

    const PollItem = ({ item, isExpired }) => {
        const [menuVisible, setMenuVisible] = useState(false);
        const openMenu = () => setMenuVisible(true);
        const closeMenu = () => setMenuVisible(false);
        const openDeleteModal = (id) => {
            const pollId = id
            socketServices.emit('deletePoll', { pollId });
            socketServices.emit('get_polls_by_society_id', { societyId });
        };
        const handleEdit = () => {
            closeMenu();
            navigation.navigate('Edit Poll', { pollData: item });
        };
        return (
            <View style={styles.pollContainer}>
                <View style={styles.pollHeader}>
                    <Text style={styles.pollQuestion}>

                        {item.poll?.question} <Text style={styles.voteCount}>({item.poll?.votes.length} Votes)</Text>
                    </Text>
                    <Menu
                        visible={menuVisible}
                        onDismiss={closeMenu}
                        anchor={<IconButton icon="dots-vertical" size={20} onPress={openMenu} />}
                    >
                        <Menu.Item onPress={() => handleEdit(item)} title="Edit" />
                        {/* Fixed the invocation issue here */}
                        <Menu.Item onPress={() => openDeleteModal(item._id)} title="Delete" />
                    </Menu>
                </View>

                {/* Poll Options and Details */}
                <Text style={styles.pollDescription}>{item.poll?.Description}</Text>
                {item.poll?.options.map((option, index) => (
                    <View key={index} style={styles.optionContainer}>
                        <View style={styles.optionDetails}>
                            <ProgressBar
                                progress={calculateVotePercentage(item.poll?.votes, option)}
                                theme={{ colors: { primary: "#7D0431" } }}
                                style={styles.progressBar}
                            />
                            <Text style={styles.optionText}>{option}</Text>
                        </View>
                    </View>
                ))}

                <View style={styles.separator} />
                <Text style={styles.dateText}>
                    Posted On: {new Date(item.poll?.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}, {new Date(item.poll?.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };
    return (
        <PaperProvider>
            <View style={styles.container}>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={SceneMap({
                        active: ActivePolls,
                        closed: ClosedPolls,
                    })}
                    onIndexChange={setIndex}
                    initialLayout={{ width: Dimensions.get('window').width }}
                    renderTabBar={(props) => (
                        <TabBar
                            {...props}
                            style={{ backgroundColor: "transparent" }}
                            indicatorStyle={{ backgroundColor: "#7d0431" }}
                            labelStyle={{ color: "#222222", fontWeight: "500" }}
                        />
                    )}
                />
                <FAB
                    style={styles.fab}
                    icon="plus"
                    color='#fff'
                    onPress={handleCreatePoll}
                />
            </View>
        </PaperProvider>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
        backgroundColor: "#f6f6f6",
    },
    pollContainer: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "#fff",
        borderRadius: 8,
        elevation: 2,
    },
    pollHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    pollQuestion: {
        fontWeight: '700',
        fontSize: 18,
    },
    voteCount: {
        fontSize: 12,
        fontWeight: '400',
        color: "#777",
    },
    statusBadge: {
        padding: 5,
        borderRadius: 10,
        marginTop: 10,
        borderWidth: 1,
    },
    pollDescription: {
        fontWeight: '400',
        fontSize: 14,
    },
    optionContainer: {
        flexDirection: 'row',
        paddingVertical: 6,
    },
    optionDetails: {
        flexDirection: "column",
        justifyContent: "center",
        marginLeft: 10,
        flex: 1,
    },
    optionText: {

        fontSize: 14,
    },
    progressBar: {
        height: 5,
        borderRadius: 5,
        marginTop: 5,
    },
    separator: {
        height: 1,
        backgroundColor: "#eaeaea",
        marginVertical: 10,
    },
    dateText: {
        fontSize: 12,
        color: "#777",
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noDataImage: {
        width: 150,
        height: 150,
        marginTop: 100,
        alignItems: "center",
    },
    noDataText: {
        fontSize: 16,
        color: '#7D0431',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#630000',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#f6f6f6",
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
    },
    confirmDeleteButton: {
        marginTop: 10,
    },
});


export default Polls;
