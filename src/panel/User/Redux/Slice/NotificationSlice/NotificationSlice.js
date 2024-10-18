import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../Security/helpers/axios';

const initialState = {
    notifications: [],
    loading: false,
    error: null,
};

export const fetchNotificationsBySocietyId = createAsyncThunk(
    'notifications/fetchNotificationsBySocietyId',
    async (societyId) => {
        const response = await axiosInstance.get(`/getNotificationsBySocietyId/${societyId}`);
        return response.data;
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        clearNotifications: (state) => {
            state.notifications = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotificationsBySocietyId.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotificationsBySocietyId.fulfilled, (state, action) => {
                state.loading = false;
                console.log(action.payload)
                state.notifications = action.payload;
            })
            .addCase(fetchNotificationsBySocietyId.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    },
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
