import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../../../../Security/helpers/axios';
const fetchSocietyId = async () => {
  const storedAdmin = await AsyncStorage.getItem("user");
  const societyAdmin = JSON.parse(storedAdmin);
  return societyAdmin.societyId;
};

export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async () => {
    try {
      const societyId = await fetchSocietyId();
      const response = await axiosInstance.get(`/getAllServicePersons/${societyId}`);
      console.log(response.data)
      return response.data.service.society;
    } catch (error) {
      throw error;
    }
  }
);
const serviceSlice = createSlice({
  name: 'services',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        console.log(action.payload, "RESPOSE")
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default serviceSlice.reducer;
