import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../Security/helpers/axios';

export const fetchFrequentVisitors = createAsyncThunk(
  'staff/fetchFrequentVisitors',
  async ({societyId, serviceType}, {rejectWithValue })=> {
    try{
      const response = await axiosInstance.get(`/getAllServiceTypes/${societyId}/${serviceType}`);
      return response.data.providers;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  });

const frequentVisitorSlice = createSlice({
  name: 'frequentVisitors',
  initialState: {
    visitors: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFrequentVisitors.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFrequentVisitors.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.visitors = action.payload;
      })
      .addCase(fetchFrequentVisitors.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default frequentVisitorSlice.reducer;