import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../../Security/helpers/axios';

export const sendForgotPasswordEmail = createAsyncThunk(
  'forgotPassword/sendForgotPasswordEmail',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/user/sendForgotVerificationEmail`, { email });
      return response.data;

    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const forgotPasswordemailSlice = createSlice({
  name: 'forgotPassword',
  initialState: {
    loading: false,
    success: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendForgotPasswordEmail.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(sendForgotPasswordEmail.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(sendForgotPasswordEmail.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export default forgotPasswordemailSlice.reducer;
