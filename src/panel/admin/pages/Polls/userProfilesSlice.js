// src/Redux/Slice/userProfilesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../Security/helpers/axios';
export const fetchUserProfilesBySocietyId = createAsyncThunk(
  'userProfiles/fetchBySocietyId',
  async (societyId) => {
    const response = await axiosInstance.get(`/user/getAllUserProfilesBySocietyId/${societyId}`);
    return response.data.userProfiles;
  }
);
const userProfilesSlice = createSlice({
  name: 'userProfiles',
  initialState: {
    profiles: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfilesBySocietyId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfilesBySocietyId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profiles = action.payload;
      })
      .addCase(fetchUserProfilesBySocietyId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const AdminuserProfilesSlice = userProfilesSlice.reducer
