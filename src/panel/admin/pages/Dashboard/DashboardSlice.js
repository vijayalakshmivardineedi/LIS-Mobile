import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../Security/helpers/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const fetchSocietyId = async () => {
    const storedAdmin = await AsyncStorage.getItem('user');
    const societyAdmin = JSON.parse(storedAdmin) || {};
    return societyAdmin._id || ""; // Default ID
};
export const updateRequestStatus = createAsyncThunk(
    'dashboard/updateRequestStatus',
    async (id) => {
        console.log(id, "hai")
        const response = await axiosInstance.put(`/user/updateVerificationBy/${id}`);
        return response.data;
    }
);
export const DeleteRequest = createAsyncThunk(
    'dashboard/DeleteRequest',
    async (id) => {
        const socketID = await fetchSocietyId()
        const response = await axiosInstance.delete(`/user/deleteREquest/${id}/${socketID}`);
        return response.data;
    }
);
export const fetchGatekeepers = createAsyncThunk(
    'sequrity/fetchGatekeepers',
    async () => {
        const societyId = await fetchSocietyId();
        const response = await axiosInstance.get(`/sequrity/getSequrityBySocietyId/${societyId}`);
        return response.data.sequrity;
    }
);
export const fetchNotifications = createAsyncThunk(
    'admin/fetchNotification',
    async () => {
        const societyId = await fetchSocietyId();
        const response = await axiosInstance.get(`/adminNotificationsBy/${societyId}`);
        return response.data.notifications;
    }
);
export const DeleteNotifications = createAsyncThunk(
    'admin/deleteNotification',
    async (id) => {
        const response = await axiosInstance.delete(`/deleteNotifications/${id}`);
        return response.data;
    }
);
const DashboardSlice = createSlice({
    name: 'dashboard',
    initialState: {
        dashboard: [],
        profile: [],
        Notification: [],
        status: 'idle',
        error: null,
        sequrity: [],
        successMessage: null,
    },
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateRequestStatus.pending, (state) => {
                state.status = 'loading';
                state.error = null
            })
            .addCase(updateRequestStatus.fulfilled, (state,) => {
                state.status = 'succeeded';
                state.error = null
                console.log("succeeded")
            })
            .addCase(updateRequestStatus.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
                console.log("failed")
            })
            .addCase(fetchGatekeepers.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchGatekeepers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.sequrity = action.payload;
            })
            .addCase(fetchGatekeepers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchNotifications.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.Notification = action.payload;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(DeleteNotifications.pending, (state) => {
                state.status = 'loading';
                state.error = null; // Clear any existing error
            })
            .addCase(DeleteNotifications.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Optionally handle success message or any state update
                // For example, you can filter out the deleted notification from the state:
                state.Notification = state.Notification.filter(notif => notif._id !== action.payload.id);
            })
            .addCase(DeleteNotifications.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message; // Store error message
            });
    },
});


export const DashboardReducer = DashboardSlice.reducer;