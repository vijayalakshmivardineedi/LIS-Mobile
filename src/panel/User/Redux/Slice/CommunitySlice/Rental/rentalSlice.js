import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../../Security/helpers/axios';

const initialState = {
  properties: [],
  status: 'idle',
  error: null,
};
export const getSocietiesByAdvertisements = createAsyncThunk(
  'rental/getSocietiesByAdvertisements',
  async () => {
    const response = await axiosInstance.get('/getSocietiesByAdvertisements');
    return response.data;
  }
);

const rentalSlice = createSlice({
  name: 'rental',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSocietiesByAdvertisements.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getSocietiesByAdvertisements.fulfilled, (state, action) => {
        state.status = 'succeeded';
        console.log('succeeded', action.payload)
        state.properties = action.payload;
      })
      .addCase(getSocietiesByAdvertisements.rejected, (state, action) => {
        state.status = 'failed';
        console.log('failed', action.payload)
        state.error = action.error.message || 'Failed to fetch properties';
      });
  },
});

export default rentalSlice.reducer;