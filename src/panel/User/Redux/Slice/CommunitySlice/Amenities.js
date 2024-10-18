import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../../../Security/helpers/axios";

export const getAmenitiesBySocietyId = createAsyncThunk(
    'amenities/fetchAmenities',
    async (societyId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/getAllAmenityBySocietyId/${societyId}`);
            return response.data.society; 
        } catch (error) {
            console.error("Error fetching amenities:", error);
            return rejectWithValue(error.response ? error.response.data : error.message);
        }
    }
);
export const bookAmenity = createAsyncThunk(
    'amenities/booking',
    async (BookingData, { rejectWithValue }) => {
        console.log("Booking data",BookingData)
        try {
            const response = await axiosInstance.post(`/bookAmenity/${BookingData.amenityId}`, BookingData.data,{
                headers: { 'Content-Type': 'application/json'}
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching amenities:", error);
            return rejectWithValue(error.response ? error.response.data : error.message); 
        }
    }
);

const initialState = {
    amenities: [],
    status: 'idle',
    error: null,
};

const AmenitiesSlice = createSlice({
    name: "Amenities",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAmenitiesBySocietyId.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getAmenitiesBySocietyId.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.amenities = action.payload; // Successfully fetched amenities
            })
            .addCase(getAmenitiesBySocietyId.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload; // More accurate error message
            })
            .addCase(bookAmenity.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(bookAmenity.fulfilled, (state, action) => {
                state.status = 'succeeded';
            })
            .addCase(bookAmenity.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload; // More accurate error message
            });
    }
});

export default AmenitiesSlice.reducer;