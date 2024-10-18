import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../Security/helpers/axios';

export const addService = createAsyncThunk('services/addService', async (serviceData) => {
  const response = await axiosInstance.put('/addList', serviceData, {
    headers: { 'Content-Type': 'application/json' }
  });
  return response.data;
});

const addServiceSlice = createSlice({
  name: 'addService',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(addService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addService.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(addService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default addServiceSlice.reducer;
