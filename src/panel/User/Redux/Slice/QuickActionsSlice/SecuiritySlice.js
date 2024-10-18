import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../Security/helpers/axios';

const initialState = {
    security: [],
    status: 'idle',
    error: null,
};

export const fetchSecurities = createAsyncThunk(
    'securities/fetchSecurities',
    async (societyId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/sequrity/getSequrityBySocietyId/${societyId}`);
            return response.data;
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                return rejectWithValue(err.response.data.message);
            } else {
                return rejectWithValue(err.message);
            }
        }
    }
);

const securitySlice = createSlice({
    name: 'security',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSecurities.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSecurities.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.security = action.payload;
            })
            .addCase(fetchSecurities.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            });
    },
});

export default securitySlice.reducer;
