import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../Security/helpers/axios';

export const fetchNotices = createAsyncThunk('notices/fetchNotices', async (societyId) => {
  try {
    if (societyId) {
      const response = await axiosInstance.get(`/getAllNotice/${societyId}`);
      return response.data;
    }
  } catch (error) {
    console.error("API call failed:", error); 
    throw error;
  }
});

const noticeSlice = createSlice({
  name: 'notices',
  initialState: {
    notices: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotices.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotices.fulfilled, (state, action) => { 
        state.status = 'succeeded';
        state.notices = action.payload;
      })
      .addCase(fetchNotices.rejected, (state, action) => {
        console.error("Failed to fetch notices:", action.error.message); // Log error for debugging
        state.status = 'failed';
        state.error = action.error.message;
      })
      
  },
});

export const selectNotices = (state) => state.notices.notices;
export const selectLoading = (state) => state.notices.loading;
export const selectError = (state) => state.notices.error;

export default noticeSlice.reducer;
