import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../../Security/helpers/axios';

const initialState = {
  loading: false,
  success: false,
  error: null,
};

export const createRental = createAsyncThunk(
  'createRental/createRental',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/createAdvertisements',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);


const createRentalSlice = createSlice({
  name: 'createRental',
  initialState,
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRental.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRental.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createRental.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetState } = createRentalSlice.actions;

export default createRentalSlice.reducer;
