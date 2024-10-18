
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../Security/helpers/axios';

export const fetchAmenityBookings = createAsyncThunk(
    'amenityBooking/fetchAmenityBookings',
    async ({ id, userId }) => {
        try {
            const response = await axiosInstance.get(`/getAmenityByIdAndUserId/${id}/${userId}`);
            return response.data;
        } catch (error) {
            throw error; 
        }
    }
);

const amenityBookingSlice = createSlice({
    name: 'amenityBooking',
    initialState: {
        bookings: [],
        loading: false,
        status: null,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAmenityBookings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAmenityBookings.fulfilled, (state, action) => {
                state.loading = false;
                console.log(action.payload)
                state.bookings = action.payload;
            })
            .addCase(fetchAmenityBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
    },
});

export const userAmenintyBookingReducer= amenityBookingSlice.reducer;
