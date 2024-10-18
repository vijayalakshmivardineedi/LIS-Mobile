import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ImagebaseURL } from '../../../Security/helpers/axios';
import Collapsible from 'react-native-collapsible';
import { fetchServicePerson } from '../../../User/Redux/Slice/ProfileSlice/manageServiceSlice';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFrequentVisitors } from '../../../User/Redux/Slice/ProfileSlice/Household/frequentVisitorsSlice';

const ResidentDetails = ({ route }) => {
    const { resident } = route.params;
    const { societyId, buildingName, flatNumber } = resident;
    const dispatch = useDispatch();
    const { servicePerson } = useSelector((state) => state.manageServices);
    const { visitors } = useSelector(state => state.frequentVisitor);
    
    const [expandedSection, setExpandedSection] = useState(null); // Single state to manage expanded section

    const toggleSection = (section) => {
        setExpandedSection(prev => (prev === section ? null : section)); // Toggle section
    };

    useEffect(() => {
        if (societyId && buildingName && flatNumber) {
            dispatch(fetchServicePerson({ societyId, block: buildingName, flatNumber }));
            dispatch(fetchFrequentVisitors({ societyId, block: buildingName, flatNo: flatNumber }));
        }
    }, [dispatch, societyId, buildingName, flatNumber]);

    const serviceType = [
        { id: 'maid', type: 'Maid' },
        { id: 'milkMan', type: 'Milkman' },
        { id: 'cook', type: 'Cook' },
        { id: 'paperBoy', type: 'Paperboy' },
        { id: 'driver', type: 'Driver' },
        { id: 'water', type: 'Water' },
        { id: 'plumber', type: 'Plumber' },
        { id: 'carpenter', type: 'Carpenter' },
        { id: 'electrician', type: 'Electrician' },
        { id: 'painter', type: 'Painter' },
        { id: 'moving', type: 'Moving' },
        { id: 'mechanic', type: 'Mechanic' },
        { id: 'appliance', type: 'Appliance' },
        { id: 'pestClean', type: 'Pest Clean' }
    ];

    const renderServiceList = (serviceCategory, serviceName) => {
        const services = servicePerson?.services[serviceCategory];
        if (!services || services.length === 0) {
            return null;
        }
        return (
            <View key={serviceCategory}>
                {services.map((item) => (
                    <View key={item._id} style={styles.listItem}>
                        <Text style={styles.listTitle}>{item.name} ({serviceName})</Text>
                        <Text style={styles.subText}>Phone: {item.phoneNumber}</Text>
                        <Text style={styles.subText}>Address: {item.address}</Text>
                        <Text style={styles.subText}>Timings: {item.timings}</Text>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            {/* Profile Section */}
            <View style={styles.profileSection}>
                <Avatar.Image
                    source={{ uri: `${ImagebaseURL}${resident.profilePicture}` }}
                    size={110}
                    style={{ backgroundColor: "#ccc" }}
                />
                <View style={styles.profileDetails}>
                    <Text style={styles.name}>{resident.name}</Text>
                    <View style={styles.infoRow}>
                        <Icon name="email" size={18} color="#777" />
                        <Text style={styles.details}>{resident.email}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="phone" size={18} color="#777" />
                        <Text style={styles.details}>{resident.mobileNumber}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="location-city" size={18} color="#777" />
                        <Text style={styles.details}>{resident.buildingName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="home" size={18} color="#777" />
                        <Text style={styles.details}>Flat: {resident.flatNumber}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Icon name="person" size={18} color="#777" />
                        <Text style={styles.details}>{resident.userType}</Text>
                    </View>
                </View>
            </View>

            {/* Family Members Section */}
            <TouchableOpacity onPress={() => toggleSection('family')} style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Family Members</Text>
                <Icon name={expandedSection === 'family' ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="#424242" />
            </TouchableOpacity>
            <Collapsible collapsed={expandedSection !== 'family'}>
                {resident.familyMembers.length > 0 ? (
                    resident.familyMembers.map((item) => (
                        <View key={item._id} style={styles.listItem}>
                            <Text style={styles.listTitle}>{item.name} ({item.Relation})</Text>
                            <Text style={styles.subText}>Age: {item.age}</Text>
                            <Text style={styles.subText}>Gender: {item.gender}</Text>
                            <Text style={styles.subText}>Mobile: {item.mobileNumber}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noData}>No family members found.</Text>
                )}
            </Collapsible>

            {/* Pets Section */}
            <TouchableOpacity onPress={() => toggleSection('pets')} style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pets</Text>
                <Icon name={expandedSection === 'pets' ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="#424242" />
            </TouchableOpacity>
            <Collapsible collapsed={expandedSection !== 'pets'}>
                {resident.pets.length > 0 ? (
                    resident.pets.map((item) => (
                        <View key={item._id} style={styles.listItem}>
                            <Text style={styles.listTitle}>{item.petName} ({item.petType})</Text>
                            <Text style={styles.subText}>Breed: {item.breed}</Text>
                            <Text style={styles.subText}>Age: {item.age}</Text>
                            <Text style={styles.subText}>Gender: {item.gender}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noData}>No pets found.</Text>
                )}
            </Collapsible>

            {/* Vehicles Section */}
            <TouchableOpacity onPress={() => toggleSection('vehicles')} style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Vehicles</Text>
                <Icon name={expandedSection === 'vehicles' ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="#424242" />
            </TouchableOpacity>
            <Collapsible collapsed={expandedSection !== 'vehicles'}>
                {resident.Vehicle.length > 0 ? (
                    resident.Vehicle.map((item) => (
                        <View key={item._id} style={styles.listItem}>
                            <Text style={styles.listTitle}>{item.brand} ({item.type})</Text>
                            <Text style={styles.subText}>Model: {item.modelName}</Text>
                            <Text style={styles.subText}>Vehicle Number: {item.vehicleNumber}</Text>
                            <Text style={styles.subText}>Driver: {item.driverName}</Text>
                            <Text style={styles.subText}>Driver's Mobile: {item.mobileNumber}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noData}>No vehicles found.</Text>
                )}
            </Collapsible>

            {/* Daily Help Section */}
            <TouchableOpacity onPress={() => toggleSection('dailyHelp')} style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Daily Help</Text>
                <Icon name={expandedSection === 'dailyHelp' ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="#424242" />
            </TouchableOpacity>
            <Collapsible collapsed={expandedSection !== 'dailyHelp'}>
                {serviceType.map((service) => renderServiceList(service.id, service.type))}
            </Collapsible>

            {/* Frequent Visitors Section */}
            <TouchableOpacity onPress={() => toggleSection('visitors')} style={[styles.sectionHeader,{marginBottom:30}]}>
                <Text style={styles.sectionTitle}>Frequent Visitors</Text>
                <Icon name={expandedSection === 'visitors' ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="#424242" />
            </TouchableOpacity>
            <Collapsible collapsed={expandedSection !== 'visitors'}>
                {visitors.length > 0 ? (
                    visitors.map((visitor) => (
                        <View key={visitor._id} style={styles.listItem}>
                            <Text style={styles.listTitle}>{visitor.name}</Text>
                            <Text style={styles.subText}>Phone: {visitor.mobileNumber}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noData}>No frequent visitors found.</Text>
                )}
            </Collapsible>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 20,
        backgroundColor: '#f0f0f0',
    },
    profileSection: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'center',
        gap: 15, 
        paddingHorizontal: 10,
    },
    profileDetails: {
        marginLeft: 10,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    details: {
        marginLeft: 5,
        color: '#555',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        marginBottom: 5,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    listItem: {
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        marginBottom: 5,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    subText: {
        fontSize: 14,
        color: '#555',
    },
    noData: {
        padding: 10,
        color: '#888',
        textAlign:"center",
        fontStyle: 'italic',
    },
});

export default ResidentDetails;
