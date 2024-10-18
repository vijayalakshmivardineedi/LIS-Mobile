import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, Text, Image, Alert, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { deleteNotice, fetchnotices } from './NoticeSlice'; // Assuming you have a slice set up
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Card, Dialog, Button, Searchbar, Paragraph, Menu, Provider, FAB, Snackbar } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Import Material Icons
import { StyleSheet } from 'react-native';

const NoticeBoard = () => {
    const dispatch = useDispatch();
    const notices = useSelector((state) => state.adminNotices.notice);
    const status = useSelector((state) => state.adminNotices.status);
    const error = useSelector((state) => state.adminNotices.error);
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [anchorPosition, setAnchorPosition] = useState({ x: 0, y: 0 });
    const [snackbarVisible, setSnackbarVisible] = useState(false); // State for Snackbar visibility
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useFocusEffect(
        React.useCallback(() => {
            dispatch(fetchnotices());
            setDialogVisible(false)
        }, [dispatch])
    );
    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const filteredNotices = notices?.length > 0
        ? notices.filter((notice) =>
            notice.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            notice.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    const handleViewNotice = (notice) => {
        setSelectedNotice(notice);
        setDialogVisible(true);
    };

    const handleEditNotice = (notice) => {
        navigation.navigate('Edit Notice', { noticeId: notice._id });
        setMenuVisible(false);
    };

    const renderNotice = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleViewNotice(item)}
            onLongPress={(e) => {
                setAnchorPosition({
                    x: e.nativeEvent.pageX,
                    y: e.nativeEvent.pageY - 50
                });
                setMenuVisible(true);
                setSelectedNotice(item);
            }}
        >
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.cardHeader}>
                        <Paragraph style={styles.noticeTitle}>{item.subject}</Paragraph>
                        <TouchableOpacity
                            onPress={(e) => {
                                setAnchorPosition({
                                    x: e.nativeEvent.pageX,
                                    y: e.nativeEvent.pageY - 50
                                });
                                setMenuVisible(true);
                                setSelectedNotice(item);
                            }}
                            style={styles.moreIcon}
                        >
                            <MaterialIcons name="more-vert" size={24} color="#a7a7a8" />
                        </TouchableOpacity>
                    </View>
                    <Paragraph style={styles.noticeDescription}>{item.description}</Paragraph>
                    <Paragraph style={styles.noticeDate}>{new Date(item.date).toLocaleDateString()}</Paragraph>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );
    if (status === 'loading') {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7d0431" />
            </View>
        );
    }
    if (!notices || notices.length === 0) {
        return (
            <View style={styles.noDataContainer}>
                <Image
                    source={require('../../../../assets/Admin/Imgaes/nodatadound.png')}
                    style={styles.noDataImage}
                    resizeMode="contain"
                />
                <Text style={styles.noDataText}>No Adds Found</Text>
            </View>
        );
    }
    const handleDeleteNotice = () => {
        if (selectedNotice) {
            Alert.alert(
                "Confirm Delete",
                "Are you sure you want to delete this notice?",
                [
                    {
                        text: "Cancel",
                        onPress: () => setMenuVisible(false),
                        style: "cancel"
                    },
                    {
                        text: "Delete",
                        onPress: () => {
                            dispatch(deleteNotice(selectedNotice._id))
                                .then((result) => {
                                    if (result.type === "notice/deleteNotice/fulfilled") {
                                        setSnackbarMessage(`${result.payload.message}`);
                                        setSnackbarVisible(true);
                                        dispatch(fetchnotices());
                                    } else {
                                        setSnackbarMessage("Failed to delete the notice. Please try again.");
                                        setSnackbarVisible(true);
                                    }
                                })
                                .catch(() => {
                                    setSnackbarMessage("An error occurred. Please check your network and try again.");
                                    setSnackbarVisible(true);
                                });
                        }
                    }
                ],
                { cancelable: false }
            );
        }
    };
    return (
        <Provider>
            <View style={styles.container}>
                <TextInput
                    placeholder="Search"
                    value={searchQuery}
                    onChangeText={handleSearch}
                    style={styles.searchbar}
                />
                <FlatList
                    data={filteredNotices}
                    renderItem={renderNotice}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                />
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={{ x: anchorPosition.x, y: anchorPosition.y }}
                    contentStyle={{ backgroundColor: '#fff' }}
                >
                    <Menu.Item onPress={() => handleEditNotice(selectedNotice)} title="Edit" />
                    <Menu.Item onPress={handleDeleteNotice} title="Delete" />
                </Menu>
                <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={{ backgroundColor: "#fff" }} >
                    <Dialog.Title>Notice Details</Dialog.Title>
                    <Dialog.Content>
                        {selectedNotice && (

                            <View >
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>ID</Text>
                                    <Text style={styles.value}>: {selectedNotice._id}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Creator</Text>
                                    <Text style={styles.value}>: {selectedNotice.sender}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Subject</Text>
                                    <Text style={styles.value}>: {selectedNotice.subject}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Description</Text>
                                    <Text style={styles.value}>: {selectedNotice.description}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.label}>Date</Text>
                                    <Text style={styles.value}>: {new Date(selectedNotice.date).toLocaleDateString()}</Text>
                                </View>
                            </View>
                        )}
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button theme={{ colors: { primary: "#7d0431" } }} onPress={() => setDialogVisible(false)}>Close</Button>
                    </Dialog.Actions>
                </Dialog>

                <FAB
                    style={styles.fab}
                    icon="plus"
                    color='#fff'
                    onPress={() => navigation.navigate('Add Notice')}
                />
                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                    style={styles.snackbar}
                >
                    {snackbarMessage}
                </Snackbar>
            </View>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 10,
        paddingHorizontal: 12,
    },
    menuIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
    },
    searchbar: {
        height: 50,
        borderColor: '#7d0431',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        width: '100%',
        backgroundColor: "#fff"
    },
    card: {
        margin: 5,
        borderRadius: 8,
        elevation: 5,
        backgroundColor: "#fff"
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    noticeTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: "#7d0431"
    },
    noticeDescription: {
        fontSize: 14,
        color: '#555',
        paddingTop: 10
    },
    noticeDate: {
        fontSize: 12,
        color: '#aaa',
    },
    listContent: {
        paddingBottom: 20,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#7d0431',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    moreIcon: {
        position: 'absolute',
        top: 5,
        right: 0,
        zIndex: 10,
        backgroundColor: 'transparent',
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
    errorImage: {
        width: 300,
        height: 300,
        resizeMode: 'contain',
        marginBottom: 0
    },
    errorText: {
        fontSize: 18,
        color: '#7d0431',
        fontWeight: "600",
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 5,
    },
    label: {
        fontWeight: '500',
        color: '#222222',
        width: '30%',
    },
    value: {
        color: '#222222',
        width: '70%',
    },

})

export default NoticeBoard;
