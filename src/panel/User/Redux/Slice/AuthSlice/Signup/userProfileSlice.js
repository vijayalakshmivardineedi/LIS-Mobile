// userProfileSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../../Security/helpers/axios';
import axios from 'axios';


export const fetchUserProfile = createAsyncThunk(
  'userProfile/fetchUserProfile',
  async ({ id, data }, { rejectWithValue }) => {
    console.log("data", data,id)
    try {
      const response = await axiosInstance.put(`/user/createUserProfile/${id}`, data,{
        headers: { 'Content-Type': 'application/json'}
      })
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || error.message);
    }
  }
);

const initialState = {
  userProfile: null,
  loading: false,
  error: null,
  successMessage: null,
};

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.userProfile = null;
      state.loading = false;
      state.error = null;
    },
    // Add additional reducers as needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action.payload)

        state.userProfile = action.payload.userProfile;
        state.successMessage = action.payload.message;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        console.log(action.payload)
        state.error = action.payload;
      });
  },
});

export const { clearUserProfile } = userProfileSlice.actions;

export default userProfileSlice.reducer;