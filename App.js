import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaView, StatusBar } from "react-native";
import Login from "./src/panel/User/Navigations/Authentication/Login";
import WaitingForAccess from "./src/panel/User/Navigations/Authentication/WaitingForAccess";
import Header from "./src/panel/Security/Component/Header/Header";
import { Provider } from "react-redux";
import store from "./src/panel/User/Redux/Store";
import Notice from "./src/panel/Security/Navigations/Notice";
import TermsandConditions from "./src/panel/Security/Navigations/TermsandConditions";
import AddVisitors from "./src/panel/Security/Navigations/AddVisitors";
import Cab from "./src/panel/Security/Navigations/AddCab";
import Others from "./src/panel/Security/Navigations/AddOthers";
import ApartmentDetails from "./src/panel/User/Navigations/Authentication/ApartmentDetails";
import ForgotPassword from "./src/panel/User/Navigations/Authentication/ForgotPassword";
import Onboard from "./src/panel/User/Navigations/Authentication/Onboard";
import SignUp from "./src/panel/User/Navigations/Authentication/SignUp";
import Verification from "./src/panel/User/Navigations/Authentication/Verification";
import ResetPassword from "./src/panel/User/Navigations/Authentication/ResetPassword";
import AddService from "./src/panel/Security/Navigations/AddService";
import AddDelivery from "./src/panel/Security/Navigations/AddDelivery";
import AddGuest from "./src/panel/Security/Navigations/AddGuest";
import Tabs from "./src/panel/User/Components/Bottom-tabs/Tabs";
import MaidList from "./src/panel/User/Navigations/Screens/Services/MaidList";
import MaidProfile from "./src/panel/User/Navigations/Screens/Services/MaidProfile";
import MilkManList from "./src/panel/User/Navigations/Screens/Services/MilkManList";
import MilkManProfile from "./src/panel/User/Navigations/Screens/Services/MilkManProfile";
import CookList from "./src/panel/User/Navigations/Screens/Services/CookList";
import CookProfile from "./src/panel/User/Navigations/Screens/Services/CookProfile";
import PaperboyList from "./src/panel/User/Navigations/Screens/Services/PaperboyList";
import PaperBoyProfile from "./src/panel/User/Navigations/Screens/Services/PaperboyProfile";
import DriverList from "./src/panel/User/Navigations/Screens/Services/DriverList";
import DriverProfile from "./src/panel/User/Navigations/Screens/Services/DriverProfile";
import WaterList from "./src/panel/User/Navigations/Screens/Services/WaterList";
import WaterProfile from "./src/panel/User/Navigations/Screens/Services/WaterProfile";
import PlumberList from "./src/panel/User/Navigations/Screens/Services/PlumberList";
import CarpentersList from "./src/panel/User/Navigations/Screens/Services/CarpentersList";
import PaintersList from "./src/panel/User/Navigations/Screens/Services/PaintersList";
import Electrician from "./src/panel/User/Navigations/Screens/Services/Electrician";
import MoversList from "./src/panel/User/Navigations/Screens/Services/MoversList";
import MechanicList from "./src/panel/User/Navigations/Screens/Services/MechanicList";
import ApplianceList from "./src/panel/User/Navigations/Screens/Services/ApplianceList";
import PestControlList from "./src/panel/User/Navigations/Screens/Services/PestControlList";
import RaiseComplaint from "./src/panel/User/Navigations/Screens/GetHelp/RaiseComplaint";
import SubCategories from "./src/panel/User/Navigations/Screens/GetHelp/SubCategories";
import CalltoSecurity from "./src/panel/User/Navigations/Screens/QuickActions/CalltoSecurity";
import ProfileScreen from "./src/panel/User/Navigations/Screens/Profile/ProfileScreen";
import EditProfile1 from "./src/panel/User/Navigations/Screens/Profile/EditProfile";
import ResetPassword1 from "./src/panel/User/Navigations/Screens/Profile/ResetPassword";
import Amenities from "./src/panel/User/Navigations/Screens/Community/Amenities";
import BookingScreen from "./src/panel/User/Navigations/Screens/Community/BookingScreen";
import Documents from "./src/panel/User/Navigations/Screens/Community/Documents";
import Emergency from "./src/panel/User/Navigations/Screens/Community/Emergency";
import Flats from "./src/panel/User/Navigations/Screens/Community/Flats";
import NoticeBoard from "./src/panel/User/Navigations/Screens/Community/NoticeBoard";
import Payment from "./src/panel/User/Navigations/Screens/Community/Payment";
import Resident from "./src/panel/User/Navigations/Screens/Community/Residents";
import Notifications from "./src/panel/User/Navigations/Screens/Notifications/Notifications";
import Sample from "./src/panel/Security/Component/Barcode/Sample";
import PreApproval from "./src/panel/User/Navigations/Screens/QuickActions/PreApprovals/PreApproval";
import Household from "./src/panel/User/Navigations/Screens/Profile/Household";
import Polls from "./src/panel/User/Navigations/Screens/Community/Polls";
import CreateUser from "./src/panel/User/Navigations/Authentication/CreateUser";
import ForgotVerification from "./src/panel/User/Navigations/Authentication/ForgotVerification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ManageDailyHelp from "./src/panel/User/Navigations/Screens/Profile/ManageDailyHelp";
import Events from "./src/panel/User/Navigations/Screens/Community/Events";
import CreateRental from "./src/panel/User/Navigations/Screens/Community/CreateRental";
import InandOut1 from "./src/panel/Security/Component/Header/InandOut1";
import MyDocuments from "./src/panel/User/Navigations/Screens/Profile/MyDocuments";
import MyBills from "./src/panel/User/Navigations/Screens/Profile/MyBills/MyBills";
import Guard from "./src/panel/Security/Component/Header/Guard";
import MyBookings from "./src/panel/User/Navigations/Screens/Profile/MyBookings";
import StaffVisitors from "./src/panel/Security/Navigations/StaffVisitors";
import RentalPropertyType from "./src/panel/User/Navigations/Screens/Community/RentalPropertyType";
import RentalFlatDetails from "./src/panel/User/Navigations/Screens/Community/RentalFlatDetails";
import SocietyBills from "./src/panel/User/Navigations/Screens/Community/SocietyBills";
import EventDetails from "./src/panel/User/Navigations/Screens/Community/EventDetails";
import GetHelp from "./src/panel/User/Navigations/Screens/GetHelp";
import Sidebar from "./src/panel/admin/components/Sidebar";
import AddSecurity from "./src/panel/admin/pages/Security/Add";
import EditSecurity from "./src/panel/admin/pages/Security/Edit";
import ViewSequrity from "./src/panel/admin/pages/Security/View";
import AttendanceForm from "./src/panel/admin/pages/Security/Attendance";
import ViewEvents from "./src/panel/admin/pages/Events/View";
import AddEvents from "./src/panel/admin/pages/Events/Add";
import EditEvent from "./src/panel/admin/pages/Events/Edit";
import ReviewAdd from "./src/panel/admin/pages/Advertisements/ReviewAdd";
import AddAdvertisements from "./src/panel/admin/pages/Advertisements/AddPost";

import EditResidents from "./src/panel/admin/pages/ResidentialUnit/EditResidents";
import AddResidents from "./src/panel/admin/pages/ResidentialUnit/AddResidents";
import AdminAddService from "./src/panel/admin/pages/Services/AddService";
import ResidentDetails from "./src/panel/admin/pages/ResidentialUnit/ResidentsDetails";
import ServicesList from "./src/panel/admin/pages/Services/ServicesList";
import EditService from "./src/panel/admin/pages/Services/EditService";
import AdminRiseComplaints from "./src/panel/admin/pages/Complaints/AdminRiseComplaints";
import EditAdd from "./src/panel/admin/pages/Advertisements/EditAdd";
import AddNotice from "./src/panel/admin/pages/NoticeBoard/AddNotice";
import EditNotice from "./src/panel/admin/pages/NoticeBoard/EditNotice";
import CreatePoll from "./src/panel/admin/pages/Polls/CreatePoll";
import EditPoll from "./src/panel/admin/pages/Polls/EditPoll";
import EditAmenity from "./src/panel/admin/pages/Amenities/EditAmenity";
import AddAmenity from "./src/panel/admin/pages/Amenities/AddAmenity";
import AmenityBookingsList from "./src/panel/admin/pages/Amenities/Bookings";
import EditBooking from "./src/panel/admin/pages/Amenities/EditBooking";
import AddBooking from "./src/panel/admin/pages/Amenities/AddBooking";
import SecurityTabs from "./src/panel/Security/Component/BottomTabs/SecurityTabs";
import Profile from "./src/panel/admin/pages/Profile/Profile";
import EditAdminMaintaince from "./src/panel/admin/pages/Maintenance/EditBill";
import AdminResetPassword from "./src/panel/admin/pages/Profile/AdminResetPassword";
import AddMaintenanceBill from "./src/panel/admin/pages/Maintenance/AddMaintenanceBill";
import ResindetialRequests from "./src/panel/admin/pages/Dashboard/ResindetialRequests";
import AddMember from "./src/panel/admin/pages/EmergencyContacts/AddMember";
import EditMember from "./src/panel/admin/pages/EmergencyContacts/EditMember";
import PlanRenewalScreen from "./src/panel/admin/pages/Dashboard/RenewalPlan";
import AdminNotifications from "./src/panel/admin/pages/Dashboard/Notification";

import UpiPayment from "./src/panel/admin/pages/Dashboard/Payment";

import AdminAddSocietyBills from "./src/panel/admin/pages/SocietyBills/Add";
import AdminEditSocietyBills from "./src/panel/admin/pages/SocietyBills/Edit";
import AddProductScreen from "./src/panel/User/Navigations/Screens/MarketPlace/AddProductScreen";
import ListPage from "./src/panel/User/Navigations/Screens/MarketPlace/ListPage";
import PropertyDetails from "./src/panel/User/Navigations/Screens/MarketPlace/PropertyDetails";
import MyAdds from "./src/panel/User/Navigations/Screens/MarketPlace/MyAdds";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState("Onboard");
  useEffect(() => {
    const checkTokenExpiry = async () => {
      try {
        const token = await AsyncStorage.getItem("jwt_token");
        if (token) {
          const decodedToken = jwt_decode(token);
          const exp = decodedToken.exp * 1000;

          const currentTime = Date.now();
          if (currentTime >= exp) {
            await AsyncStorage.clear();
            console.log("Token expired. Cleared AsyncStorage.");
          }
        }
      } catch (error) {
        console.error("Error checking token expiry:", error);
      }
    };
    checkTokenExpiry();
  }, []);
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        const userToken = await AsyncStorage.getItem("userToken");
        const userRole = JSON.parse(user).role;
        const isVerified = JSON.parse(user).isVerified;
        if (user !== null && userToken !== null) {
          if (userRole === "Sequrity") {
            setInitialRoute("SecurityTabs");
          } else if (userRole === "User" && isVerified === true) {
            setInitialRoute("Tabs");
          } else if (userRole === "SocietyAdmin") {
            setInitialRoute("Sidebar");
          } else {
            setInitialRoute("Login");
          }
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <Provider store={store}>
      <NavigationContainer>
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar barStyle="light-content" backgroundColor="#000" />
          <Stack.Navigator
            initialRouteName={initialRoute}
            // initialRouteName="Property List"
            screenOptions={{
              headerStyle: {
                backgroundColor: "#7D0431",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          >
            <Stack.Screen
              name="Login"
              component={Login}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Create User"
              component={CreateUser}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen
              name="WaitingForAccess"
              component={WaitingForAccess}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Apartment Details"
              component={ApartmentDetails}
            />
            <Stack.Screen name="Polls" component={Polls} />
            <Stack.Screen
              name="Tabs"
              component={Tabs}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Forgot Password"
              component={ForgotPassword}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen name="Verification" component={Verification} />
            <Stack.Screen
              name="SecurityTabs"
              component={SecurityTabs}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen name="Verification " component={ForgotVerification} />
            <Stack.Screen name="Reset Password" component={ResetPassword} />
            <Stack.Screen
              name="SignUp"
              component={SignUp}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Onboard"
              component={Onboard}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Header"
              component={Header}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Manage Daily Help"
              component={ManageDailyHelp}
            />
            <Stack.Screen name="Add Service" component={AddService} />
            <Stack.Screen name="Add Delivery" component={AddDelivery} />
            <Stack.Screen name="Add Guest" component={AddGuest} />
            <Stack.Screen name="Notice" component={Notice} />
            <Stack.Screen name="Edit Profile" component={EditProfile1} />

            <Stack.Screen
              name="Terms and Conditions"
              component={TermsandConditions}
            />

            <Stack.Screen name="Add Visitor" component={AddVisitors} />
            <Stack.Screen name="Add Cab" component={Cab} />
            <Stack.Screen name="Add Others" component={Others} />

            <Stack.Screen name="Staff" component={StaffVisitors} />
            <Stack.Screen name="Maids" component={MaidList} />
            <Stack.Screen name="Maid Profile" component={MaidProfile} />
            <Stack.Screen name="Milk Man" component={MilkManList} />
            <Stack.Screen name="Milk Man Profile" component={MilkManProfile} />
            <Stack.Screen name="Cook" component={CookList} />
            <Stack.Screen name="Cook Profile" component={CookProfile} />
            <Stack.Screen name="Paper Boy" component={PaperboyList} />
            <Stack.Screen
              name="Scanner"
              component={Sample}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Paper Boy Profile"
              component={PaperBoyProfile}
            />
            <Stack.Screen name="Driver" component={DriverList} />
            <Stack.Screen name="Driver Profile" component={DriverProfile} />
            <Stack.Screen name="Water" component={WaterList} />
            <Stack.Screen name="Water Profile" component={WaterProfile} />
            <Stack.Screen name="Plumber" component={PlumberList} />
            <Stack.Screen name="Carpenter" component={CarpentersList} />
            <Stack.Screen name="Painter" component={PaintersList} />
            <Stack.Screen name="My Documents" component={MyDocuments} />
            <Stack.Screen name="Electrician" component={Electrician} />
            <Stack.Screen name="Movers" component={MoversList} />
            <Stack.Screen name="Events" component={Events} />
            <Stack.Screen name="Mechanic" component={MechanicList} />
            <Stack.Screen name="Appliance" component={ApplianceList} />
            <Stack.Screen name="Pest Control" component={PestControlList} />
            <Stack.Screen name="Raise Complaint" component={RaiseComplaint} />
            <Stack.Screen
              name="Select the Category"
              component={SubCategories}
            />
            <Stack.Screen name="Call to Security" component={CalltoSecurity} />
            <Stack.Screen name="InandOut1" component={InandOut1} />
            <Stack.Screen name="Security" component={Guard} />
            <Stack.Screen name="My Bills" component={MyBills} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Reset Password " component={ResetPassword1} />
            <Stack.Screen name="Amenities" component={Amenities} />
            <Stack.Screen name="Booking Screen" component={BookingScreen} />
            <Stack.Screen name="Documents" component={Documents} />
            <Stack.Screen name="Emergency" component={Emergency} />
            <Stack.Screen name="Flats" component={Flats} />
            <Stack.Screen name="Notice Board" component={NoticeBoard} />
            <Stack.Screen name="Payment" component={Payment} />
            <Stack.Screen name="Residents " component={Resident} />
            <Stack.Screen name="Notification" component={Notifications} />
            <Stack.Screen
              name="Pre Approval Visitors"
              component={PreApproval}
            />
            <Stack.Screen name="Household" component={Household} />
            <Stack.Screen name="GetHelp" component={GetHelp} />
            <Stack.Screen name="Create Rental" component={CreateRental} />
            <Stack.Screen
              name="RentalPropertyType"
              component={RentalPropertyType}
            />
            <Stack.Screen
              name="RentalFlat Details"
              component={RentalFlatDetails}
            />
            <Stack.Screen name="Society Bills" component={SocietyBills} />
            <Stack.Screen name="EventDetails" component={EventDetails} />
            <Stack.Screen name="My Bookings" component={MyBookings} />

            {/* Admin */}

            <Stack.Screen
              name="Sidebar"
              component={Sidebar}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen name="AdminProfile" component={Profile} />
            <Stack.Screen name="Resetpassword" component={AdminResetPassword} />
            <Stack.Screen name="Add Residents" component={AddResidents} />
            <Stack.Screen
              name="Residents Details"
              component={ResidentDetails}
            />
            <Stack.Screen name="Edit Resident" component={EditResidents} />
            <Stack.Screen name="Add Staff" component={AdminAddService} />
            <Stack.Screen name="Staff List" component={ServicesList} />
            <Stack.Screen name="Edit Service" component={EditService} />
            <Stack.Screen name="Add Security" component={AddSecurity} />
            <Stack.Screen name="Edit Security" component={EditSecurity} />
            <Stack.Screen name="View Security" component={ViewSequrity} />
            <Stack.Screen name="Attendance" component={AttendanceForm} />
            <Stack.Screen name="View Events" component={ViewEvents} />
            <Stack.Screen name="Add Events" component={AddEvents} />
            <Stack.Screen name="Edit Event" component={EditEvent} />
            <Stack.Screen name="View Details" component={ReviewAdd} />
            <Stack.Screen name="Add Post" component={AddAdvertisements} />
            <Stack.Screen name="Edit Post" component={EditAdd} />
            <Stack.Screen
              name="Add Complaints"
              component={AdminRiseComplaints}
            />
            <Stack.Screen name="Add Notice" component={AddNotice} />
            <Stack.Screen name="Edit Notice" component={EditNotice} />
            <Stack.Screen name="Create Poll" component={CreatePoll} />
            <Stack.Screen name="Edit Poll" component={EditPoll} />
            <Stack.Screen name="Edit Amenity" component={EditAmenity} />
            <Stack.Screen name="Add Amenity" component={AddAmenity} />
            <Stack.Screen name="Bookings" component={AmenityBookingsList} />
            <Stack.Screen name="Edit Booking" component={EditBooking} />
            <Stack.Screen name="Add Booking" component={AddBooking} />
            <Stack.Screen
              name="Edit Maintenance"
              component={EditAdminMaintaince}
            />
            <Stack.Screen
              name="Add Maintenance Bill"
              component={AddMaintenanceBill}
            />
            <Stack.Screen
              name="Residential Approvals"
              component={ResindetialRequests}
            />
            <Stack.Screen name="Add Committee Member" component={AddMember} />
            <Stack.Screen name="Edit Committee Member" component={EditMember} />
            <Stack.Screen
              name="Renewal Plan"
              component={PlanRenewalScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Admin Notifications"
              component={AdminNotifications}
            />
            <Stack.Screen name="UpiPayment" component={UpiPayment} />
            <Stack.Screen
              name="Add Society Bills"
              component={AdminAddSocietyBills}
            />
            <Stack.Screen
              name="Edit Society Bills"
              component={AdminEditSocietyBills}
            />
            <Stack.Screen name="Add Property" component={AddProductScreen} />
            <Stack.Screen name="Property List" component={ListPage} />
            <Stack.Screen name="Property Details" component={PropertyDetails} />
            <Stack.Screen name="My Adds" component={MyAdds} />
          </Stack.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </Provider>
  );
}
