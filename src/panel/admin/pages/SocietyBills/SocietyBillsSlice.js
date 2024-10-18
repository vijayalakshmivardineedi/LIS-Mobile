import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from "../../../Security/helpers/axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const fetchSocietyId = async () => {
    const storedAdmin = await AsyncStorage.getItem('user');
    const societyAdmin = JSON.parse(storedAdmin) || {};
    return societyAdmin._id || ""; // Default ID
};

export const fetchBillsBySocietyId = createAsyncThunk(
    'bills/fetchBillsBySocietyId',
    async () => {
        const societyId = await fetchSocietyId();
        const response = await axiosInstance.get(`/getBillsBySocietyId/${societyId}`);
        return response.data.society.bills;
    }
);

export const getBillById = createAsyncThunk(
    'bills/getBillById',
    async ({ id }) => {
        const societyId = await fetchSocietyId();
        const response = await axiosInstance.get(`/getBillById/${societyId}/${id}`);
        return response.data.bill;
    }
);

export const createBill = createAsyncThunk(
    'bills/createBill',
    async (formData) => {
        console.log("CreateformData", formData)
        const response = await axiosInstance.post('/createBill', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
);

export const editBill = createAsyncThunk(
    'bills/editBill',
    async ({ id, formData }, { rejectWithValue }) => {
        try {
            const societyId = await fetchSocietyId();
            const response = await axiosInstance.put(
                `/editBill/${societyId}/${id}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response ? error.response.data : error.message);
        }
    }
);


export const deleteBill = createAsyncThunk(
    "bills/deleteBill",
    async ({ id }) => {
        const societyId = await fetchSocietyId();
        const response = await axiosInstance.delete(`/deleteBill/${societyId}/${id}`);
        return response.data;
    }
);

const SocietyBillsSlice = createSlice({
    name: 'bills',
    initialState: {
        bills: [],
        status: 'idle',
        error: null,
        successMessage: null,
    },

    reducers: {
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchBillsBySocietyId.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchBillsBySocietyId.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.bills = action.payload;
            })
            .addCase(fetchBillsBySocietyId.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(getBillById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getBillById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.bills = [action.payload];
            })
            .addCase(getBillById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(createBill.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createBill.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.bills.push(action.payload);
                state.successMessage = action.payload.message;
            })
            .addCase(createBill.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(editBill.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(editBill.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.bills = action.payload;
                state.successMessage = action.payload.message;
            })
            .addCase(editBill.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(deleteBill.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteBill.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.bills = action.payload;
                state.successMessage = action.payload.message;
                state.error = null;
            })
            .addCase(deleteBill.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload ? action.payload : 'Failed to fetch inventory';
            });
    },
});

export const societyBillsReducer = SocietyBillsSlice.reducer;
