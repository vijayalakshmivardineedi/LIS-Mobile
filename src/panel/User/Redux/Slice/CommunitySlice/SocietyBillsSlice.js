
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../Security/helpers/axios';


const initialState = {
  societyBills: [],
  loading: false,
  error: null,
};


export const fetchSocietyBills = createAsyncThunk(
  'societyBills/fetchSocietyBills',
  async (societyId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/getBillsBySocietyId/${societyId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);


const societyBillsSlice = createSlice({
  name: 'societyBills',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSocietyBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSocietyBills.fulfilled, (state, action) => {
        state.loading = false;
        state.societyBills = action.payload;
      })
      .addCase(fetchSocietyBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default societyBillsSlice.reducer;
