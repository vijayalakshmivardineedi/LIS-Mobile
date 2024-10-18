import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from 'react-native';
import { ProgressBar, RadioButton } from 'react-native-paper';
import ProgressBar1 from "./ProgressBar";
import socketServices from '../../../Socket/SocketServices';
import AsyncStorage from "@react-native-async-storage/async-storage";

const Polls = () => {
    const [polls, setPolls] = useState([]);
    const [userId, setUserId] = useState("");
    const [societyId, setSocietyId] = useState("");
    const [checkedOption, setCheckedOption] = useState({});

    useEffect(() => {
        const getUserName = async () => {
            try {
                const userString = await AsyncStorage.getItem("user");
                if (userString !== null) {
                    const user = JSON.parse(userString);
                    setSocietyId(user.societyId);
                    setUserId(user.userId);
                }
            } catch (error) {
                console.error("Failed to fetch the user from async storage", error);
            }
        };
        getUserName();
    }, []);

    useEffect(() => {
        socketServices.initializeSocket();
        if (societyId) {
            socketServices.emit('joinSecurityPanel', societyId);
        }
        socketServices.emit('get_polls_by_society_id', { societyId });
        const handlePollsBySocietyId = (fetchedPolls) => {
            setPolls(fetchedPolls);

            const now = new Date();
            const activePolls = fetchedPolls.filter(poll => {
                if (poll && poll.poll && poll.poll.expDate) {
                    const expDate = new Date(poll.poll.expDate);
                    return expDate > now;
                }
                return false;
            });

            const userVotes = {};
            activePolls.forEach(poll => {
                if (poll.poll && Array.isArray(poll.poll.votes)) {
                    const userVote = poll.poll.votes.find(vote => vote.userId === userId);
                    if (userVote) {
                        userVotes[poll._id] = userVote.selectedOption;
                    }
                }
            });

            setCheckedOption(userVotes);

        };

        const handleVoteUpdate = (data) => {
            alert(data.message);
            socketServices.on('polls_by_society_id', handlePollsBySocietyId);

            // Find the user's vote from the data
            const userVote = data.votes.poll.votes.find(vote => vote.userId === userId);

            if (userVote) {
                console.log("User's Vote:", userVote);
            } else {
                console.log("User has not voted or vote not found.");
            }

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

            setCheckedOption(prevState => ({ ...prevState, [data.votes._id]: null }));
        };
        const handleNewPollCreated = (newPoll) => {
            setPolls(prevPolls => [newPoll, ...prevPolls]);
        };

        const handleVoteError = (error) => {
            alert(error.message);
        };

        socketServices.on('polls_by_society_id', handlePollsBySocietyId);
        socketServices.on('vote_update', handleVoteUpdate);
        socketServices.on('new_poll_created', handleNewPollCreated);
        socketServices.on('vote_error', handleVoteError);

        return () => {
            socketServices.removeListener('polls_by_society_id', handlePollsBySocietyId);
            socketServices.removeListener('new_poll_created', handleNewPollCreated);
            socketServices.removeListener('vote_update', handleVoteUpdate);
            socketServices.removeListener('vote_error', handleVoteError);
        };
    }, [societyId, userId]);

    const handleRadioButtonPress = (optionValue, pollId) => {
        setCheckedOption(prevState => ({ ...prevState, [pollId]: optionValue }));
        const data = {
            userId: userId,
            pollId: pollId,
            selectedOption: optionValue
        };
        socketServices.emit('vote_for__polls_by_UserID', data);
        socketServices.emit('get_polls_by_society_id', { societyId });
    };

    const calculateVotePercentage = (votes, option) => {
        const totalVotes = votes.length;
        const optionVotes = votes.filter(vote => vote.selectedOption === option).length;
        return totalVotes === 0 ? 0 : (optionVotes / totalVotes);
    };

    const isPollExpired = (expDate) => {
        const currentDate = new Date();
        const expirationDate = new Date(expDate);
        return currentDate > expirationDate;
    };
    const reversedPolls = [...polls].reverse()
    return (
        <View style={{ flex: 1, paddingHorizontal: 10, backgroundColor: "#f6f6f6" }}>
            <ScrollView >
                {reversedPolls.map((item) => {
                    const isExpired = isPollExpired(item.poll.expDate);
                    return (
                        <View key={item._id} style={{ paddingHorizontal: 10, paddingVertical: 5, marginVertical: 5, borderWidth: 1, borderColor: "#ccc", backgroundColor: "#fff", borderRadius: 8, elevation: 2 }}>
                            <View>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <Text style={{ fontWeight: 700, fontSize: 18 }}>
                                        {item.poll.question} <Text style={{ fontSize: 12, fontWeight: 400, color: "#777" }}>({item.poll.votes.length} Votes)</Text>
                                    </Text>
                                    <View style={{
                                        padding: 5,
                                        backgroundColor: isExpired ? "#fee2e2" : "#dcfce7",
                                        borderRadius: 10,
                                        marginTop: 10,
                                        borderWidth: 1,
                                        borderColor: isExpired ? "#dc2626" : "#22c55e"
                                    }}>
                                        <Text style={{ color: isExpired ? "#dc2626" : "#22c55e", fontWeight: 500, fontSize: 12 }}>
                                            {isExpired ? "Closed" : "Active"}
                                        </Text>
                                    </View>
                                </View>
                                {item.poll.Description.split('\n').length > 2 ? (
                                    <Text style={{ fontWeight: 400, fontSize: 14 }}>
                                        {item.poll.Description} <Text style={{ fontWeight: 400, fontSize: 14, color: "#777" }}>Read More</Text>
                                    </Text>
                                ) : (
                                    <Text style={{ fontWeight: 400, fontSize: 14 }}>{item.poll.Description}</Text>
                                )}
                                {!isExpired ? (
                                    item.poll.options.map((option, index) => (
                                        <View key={index} style={{ flexDirection: 'row', paddingVertical: 6 }}>

                                            <RadioButton
                                                value={option}
                                                status={checkedOption[item._id] === option ? 'checked' : 'unchecked'}
                                                onPress={() => handleRadioButtonPress(option, item)}
                                                theme={{ colors: { primary: "#7D0431" } }}
                                            />
                                            <View style={{ flexDirection: "column", justifyContent: "center", gap: 5, width: "85%" }}>
                                                <Text style={{ fontWeight: 400, fontSize: 18 }}>{option}</Text>
                                                <ProgressBar progress={calculateVotePercentage(item.poll.votes, option)} theme={{ colors: { primary: "#7D0431" } }} />
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    item.poll.options.map((option, index) => (
                                        <View key={index} style={{ flexDirection: 'row', paddingVertical: 6 }}>
                                            <View style={{ flexDirection: "column", width: "100%" }}>
                                                <ProgressBar1 value={calculateVotePercentage(item.poll.votes, option) * 100} option={option} />
                                            </View>
                                        </View>
                                    ))
                                )}
                            </View>
                            <View style={{ borderTopWidth: 1, borderColor: "#ccc", marginVertical: 5 }} />
                            <Text style={{ fontSize: 12, fontWeight: 400, color: "#777" }}>
                                Posted On: {new Date(item.poll.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}, {new Date(item.poll.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

export default Polls;
