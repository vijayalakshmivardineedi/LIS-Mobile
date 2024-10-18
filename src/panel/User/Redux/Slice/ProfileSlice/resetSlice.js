import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../Security/helpers/axios';

export const fetchUserData = createAsyncThunk(
    'password/fetchUserData',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post('/user/resetPassword', userData, {
                headers: { 'Content-Type': 'application/json' }
            });
            console.log(response.data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data.message || error.message);
        }
    }
);

const passwordSlice = createSlice({
    name: 'password',
    initialState: {
        currentPassword: '',
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserData.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentPassword = action.payload.currentPassword;
            })
            .addCase(fetchUserData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default passwordSlice.reducer;
