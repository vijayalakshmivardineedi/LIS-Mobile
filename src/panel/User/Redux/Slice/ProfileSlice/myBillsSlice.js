import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Api } from '../../../../Security/helpers/axios';

const initialState = {
    bills: [],
    status: 'idle', 
    error: null,
};

export const fetchBills = createAsyncThunk(
    'bills/fetchBills',
    async ({ societyId, blockno, flatno }) => {
        const response = await Api.get(`/getPaymentsOfEach/${societyId}/${blockno}/${flatno}`); 
        return response.data;
    }
);

const billsSlice = createSlice({
    name: 'bills',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchBills.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchBills.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.bills = action.payload;
            })
            .addCase(fetchBills.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export default billsSlice.reducer;
