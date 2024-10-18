import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../Security/helpers/axios';

const initialState = {
    preApprovals: [],
    status: 'idle',
    error: null,
};

export const fetchPreApprovals = createAsyncThunk(
    'preApprovals/fetchPreApprovals',
    async ({ societyId, block, flatNo }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/getPreApprovedVisitors/${societyId}/${block}/${flatNo}`);
            return response.data.preApprovedVisitors;
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

const preApprovalSlice = createSlice({
    name: 'preApprovals',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPreApprovals.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPreApprovals.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.preApprovals = action.payload;
            })
            .addCase(fetchPreApprovals.rejected, (state, action) => {
                state.status = 'failed';
                // Use action.payload for the custom error message
                state.error = action.payload || action.error.message;
            });
    },
});

export default preApprovalSlice.reducer;
