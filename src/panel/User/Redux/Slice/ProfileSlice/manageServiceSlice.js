import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../Security/helpers/axios';

const initialState = {
  servicePerson: null,
  loading: false,
  error: null,
};

export const fetchServicePerson = createAsyncThunk(
  'service/fetchServicePerson',
  async ({ societyId, block, flatNumber }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/getAllServicesforFlat/${societyId}/${block}/${flatNumber}`);
      
      return response.data;

    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Something went wrong');
    }
  }
);

export const deleteUserService = createAsyncThunk(
  'manageServices/deleteUserService',
  async ({ societyId, serviceType, userid, userIdToDelete }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete('/deleteUserService', {
        data: {
          societyId,
          serviceType,
          userid,
          userIdToDelete,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateRatingAndReview = createAsyncThunk(
  'service/updateRatingAndReview',
  async ({ societyId, serviceType, userid, updates }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/updateReviewAndRating', {
        societyId,
        serviceType,
        userid,
        updates
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Something went wrong');
    }
  }
);

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServicePerson.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServicePerson.fulfilled, (state, action) => {
        state.loading = false;
        state.servicePerson = action.payload;
      })
      .addCase(fetchServicePerson.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload || 'Failed to fetch services';
      })
      .addCase(deleteUserService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserService.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteUserService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateRatingAndReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRatingAndReview.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateRatingAndReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default serviceSlice.reducer;
