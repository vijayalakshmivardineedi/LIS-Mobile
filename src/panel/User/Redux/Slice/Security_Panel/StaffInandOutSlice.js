import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../Security/helpers/axios';

export const fetchStaffVisitors = createAsyncThunk(
    'staffVisitors/fetchStaffVisitors',
    async (societyId) => {
        try {
            const response = await axiosInstance.get(`/getAllStaffRecords/${societyId}`);
            return response.data.staffRecords;
        } catch (error) {
            throw Error('Failed to fetch visitors: ' + error.message);
        }
    }
);

const staffVisitorsSlice = createSlice({
    name: 'staffVisitors',
    initialState: {
        staffVisitors: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        resetState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
            state.successMessage = null;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchStaffVisitors.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchStaffVisitors.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.staffVisitors = action.payload;
            })
            .addCase(fetchStaffVisitors.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export const { resetState } = staffVisitorsSlice.actions;
export default staffVisitorsSlice.reducer;
