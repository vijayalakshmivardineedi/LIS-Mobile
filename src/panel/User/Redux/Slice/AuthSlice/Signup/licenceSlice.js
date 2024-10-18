import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../../Security/helpers/axios';
import axios from 'axios';

export const fetchSocietyByLicence = createAsyncThunk(
    'societyByLicence/fetchSocietyByLicence',
    async ({societyLicense}) => {
        try {
            const response = await axiosInstance.get(`/society/getSocietyByLicenceId/${societyLicense}`);
            return response.data.society;
        } catch (error) {
            throw Error('Failed to fetch visitors: ' + error.message);
        }
    }
);

const SocietyByLicenceSlice = createSlice({
    name: 'societyByLicence',
    initialState: {
        societyByLicence: [],
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
            .addCase(fetchSocietyByLicence.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSocietyByLicence.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.societyByLicence = action.payload;
            })
            .addCase(fetchSocietyByLicence.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export const { resetState } = SocietyByLicenceSlice.actions;
export default SocietyByLicenceSlice.reducer;
