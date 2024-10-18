import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../../Security/helpers/axios';
import axios from 'axios';


export const fetchCities = createAsyncThunk('cities/fetchCities', async () => {
    const response = await axiosInstance.fetch('getAllCities');
    if (!response.ok) {
        throw new Error('Failed to fetch cities');
    }
    const cities = await response.json();
    return cities;
});

// router.get('/getCity/:cityId', getCityById);

export const fetchCitiesById = createAsyncThunk(
    'fetchCities/fetchCitiesById',
    async ({ cityId }) => {
        try {
            const response = await axiosInstance.get(`/getCity/${cityId}`);
            return response.data;
        } catch (error) {
            throw Error('Failed to fetch visitors: ' + error.message);
        }
    }
);

const citySlice = createSlice({
    name: 'cities',
    initialState: {
        cities: [],
        currentCity: null,
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCities.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCities.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.cities = action.payload.cities;
            })
            .addCase(fetchCities.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(fetchCitiesById.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCitiesById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentCity = action.payload;
            })
            .addCase(fetchCitiesById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});





export default citySlice.reducer;
