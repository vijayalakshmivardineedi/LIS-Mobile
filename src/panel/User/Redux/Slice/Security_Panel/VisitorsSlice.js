import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../Security/helpers/axios';

export const createVisitor = createAsyncThunk(
  'visitor/createVisitor',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/createVisitors', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const visitorSlice = createSlice({
  name: 'visitor',
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createVisitor.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createVisitor.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createVisitor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetState } = visitorSlice.actions;
export default visitorSlice.reducer;


