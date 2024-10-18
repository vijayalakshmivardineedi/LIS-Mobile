import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FAB, Text, IconButton, Badge } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminServices } from './ServicesSlice';

const people = [
    { id: 1, name: 'Milkman', named: 'milkMan', image: require('../../../../assets/Admin/Imgaes/service.png'), count: 0 },
    { id: 2, name: 'Plumber', named: 'plumber', image: require('../../../../assets/Admin/Imgaes/plumber.png'), count: 0 },
    { id: 3, name: 'Maid', named: 'maid', image: require('../../../../assets/Admin/Imgaes/housekeeper.png'), count: 0 },
    { id: 4, name: 'Cook', named: 'cook', image: require('../../../../assets/Admin/Imgaes/cook.png'), count: 0 },
    { id: 5, name: 'Paperboy', named: 'paperBoy', image: require('../../../../assets/Admin/Imgaes/paperboy.png'), count: 0 },
    { id: 6, name: 'Driver', named: 'driver', image: require('../../../../assets/Admin/Imgaes/driving.png'), count: 0 },
    { id: 7, name: 'Water', named: 'water', image: require('../../../../assets/Admin/Imgaes/water.png'), count: 0 },
    { id: 8, name: 'Carpenter', named: 'carpenter', image: require('../../../../assets/Admin/Imgaes/carpenter.png'), count: 0 },
    { id: 9, name: 'Electrician', named: 'electrician', image: require('../../../../assets/Admin/Imgaes/electrician.png'), count: 0 },
    { id: 10, name: 'Painter', named: 'painter', image: require('../../../../assets/Admin/Imgaes/painter.png'), count: 0 },
    { id: 11, name: 'Moving', named: 'moving', image: require('../../../../assets/Admin/Imgaes/delivery.png'), count: 0 },
    { id: 12, name: 'Mechanic', named: 'mechanic', image: require('../../../../assets/Admin/Imgaes/delivery.png'), count: 0 },
    { id: 13, name: 'Appliance', named: 'appliance', image: require('../../../../assets/Admin/Imgaes/electrical-appliances.png'), count: 0 },
    { id: 14, name: 'PestClean', named: 'pestClean', image: require('../../../../assets/Admin/Imgaes/Clean.png'), count: 0 },
];

const Services = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { data, loading, error } = useSelector((state) => state.staff);
    const [servicePeople, setServicePeople] = useState(people);
    useFocusEffect(
        React.useCallback(() => {
            dispatch(fetchAdminServices());
        }, [dispatch]),);

    useEffect(() => {
        if (data && Object.keys(data).length > 0) {
            const updatedPeople = people.map(person => {
                const matchingService = data[person.named];
                const serviceCount = matchingService ? matchingService.length : 0;
                return {
                    ...person,
                    count: serviceCount
                };
            });
            setServicePeople(updatedPeople);
        }
    }, [data]);

    const handleClick = (serviceType) => {
        navigation.navigate('Staff List', { serviceType });
    };

    const handleAdd = () => {
        navigation.navigate('Add Staff');
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleClick(item.named)} style={styles.itemContainer}>
            <Image source={item.image} style={styles.image} />
            <Text style={styles.nameText}>{item.name}</Text>
            <View style={styles.iconContainer}>
                <IconButton
                    icon="chevron-right"
                    size={20}
                    style={styles.icon}
                    onPress={() => handleClick(item.named)}
                />
                <Badge style={styles.badge}>{item.count}</Badge>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7D0431" />
            </View>
        );
    }

    if (!data || !data.length === 0) { // Show spinner while loading
        return (
            <View style={styles.noDataContainer}>
                <Image
                    source={require('../../../../assets/Admin/Imgaes/nodatadound.png')}
                    style={styles.noDataImage}
                    resizeMode="contain"
                />
                <Text style={styles.noDataText}>No Amenities Found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={servicePeople}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
            />
            <FAB
                style={styles.fab}
                icon="plus"
                onPress={handleAdd}
                color="white"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        justifyContent: 'space-between',
    },
    image: {
        height: 35,
        width: 35,
        marginRight: 16,
    },
    nameText: {
        fontSize: 16,
        color: "#202020",
        fontWeight: "600",
        flex: 1,
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginLeft: 10,
    },
    badge: {
        backgroundColor: '#ddd',
        color: 'black',
        fontSize: 12,
        position: 'absolute',
        top: 13,
        right: 50,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        borderRadius: 50,
        backgroundColor: '#7D0431',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
});

export default Services;
