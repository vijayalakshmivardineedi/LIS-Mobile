import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from "../../../Security/helpers/axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const fetchSocietyId = async () => {
    const storedAdmin = await AsyncStorage.getItem('user');
    const societyAdmin = JSON.parse(storedAdmin) || {};
    return societyAdmin._id || ""; // Default ID
};

export const getByMonthAndYear = createAsyncThunk(
    'maintainances/getByMonthAndYear',
    async (monthAndYear) => {
        const societyId = await fetchSocietyId()
        console.log(societyId)
        const response = await axiosInstance.get(`/getByMonthAndYear/${societyId}/${monthAndYear}`);
        return response.data.maintenance.society;
    }
);

export const getOne = createAsyncThunk(
    'maintainancess/getOne',
    async ({ blockno, flatno, monthAndYear }) => {
        const societyId = await fetchSocietyId()
        const response = await axiosInstance.get(`/getOne/${societyId}/${blockno}/${flatno}/${monthAndYear}`);
        return response.data.maintanance;
    }
);

export const createMaintenanceRecords = createAsyncThunk(
    'maintainances/createMaintenanceRecords',
    async (formData, { rejectWithValue }) => {

        try {
            const response = await axios.post('http://192.168.29.151:2000/api/createMaintenanceRecords', formData, {
                headers: {
                    'Content-Type': 'application/json' // Ensure proper content type for FormData
                }
            })

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response ? error.response.data : error.message);
        }
    }
);

export const updatePaymentDetails = createAsyncThunk(
    'maintainances/updatePaymentDetails',
    async ({ formData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put('/updatePaymentDetails', formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response ? error.response.data : error.message);
        }
    }
);

export const updatePaymentStatus = createAsyncThunk(
    "maintainances/updatePaymentStatus",
    async ({ formData }) => {
        const response = await axiosInstance.put(`/updatePaymentStatus`, formData);
        return response.data;
    }
);

const MaintainanceSlice = createSlice({
    name: 'maintainances',
    initialState: {
        maintainances: [],
        status: 'idle',
        error: null,
        successMessage: null,
    },

    reducers: {
    },

    extraReducers: (builder) => {
        builder

            .addCase(getByMonthAndYear.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getByMonthAndYear.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.maintainances = action.payload || [];
            })
            .addCase(getByMonthAndYear.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
                state.maintainances = action.payload || [];
            })
            .addCase(getOne.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getOne.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.maintainances = action.payload;

            })
            .addCase(getOne.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(createMaintenanceRecords.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createMaintenanceRecords.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.maintainances.push(action.payload);
                state.successMessage = action.payload.message;
                console.log(action.payload.message)
            })
            .addCase(createMaintenanceRecords.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload.message;
                console.log(action.payload.message)
            })

            .addCase(updatePaymentDetails.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updatePaymentDetails.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.maintainances = action.payload;
                state.successMessage = action.payload.message;
            })
            .addCase(updatePaymentDetails.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(updatePaymentStatus.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updatePaymentStatus.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.maintainances = action.payload;
                state.successMessage = action.payload.message;
                state.error = null;
            })
            .addCase(updatePaymentStatus.rejected, (state, action) => {
                state.status = 'failed';

                state.error = action.payload ? action.payload : 'Failed to fetch inventory';
            });
    },
});


export const AdminMaintainanceReducer = MaintainanceSlice.reducer;