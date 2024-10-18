import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../Security/helpers/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchResidentProfile = createAsyncThunk(
  'profile/fetchResidentProfile',
  async () => {
    const societyAdmin = await AsyncStorage.getItem('user');
    const societyId = JSON.parse(societyAdmin)?._id;
    const response = await axiosInstance.get(`/society/profile/${societyId}`);
    return response.data.admins;
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profile: [],
    status: 'idle',
    error: null,
    successMessage: null,
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchResidentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResidentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchResidentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;  
      });
  },
});

export const AdminProfileReducer = profileSlice.reducer;
