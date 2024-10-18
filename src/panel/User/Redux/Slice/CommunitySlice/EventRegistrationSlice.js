import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../Security/helpers/axios';



export const registerParticipant = createAsyncThunk(
  'registration/registerParticipant',
  async ({ societyId, participantId, activities, participantName, eventId }, { rejectWithValue }) => {
    console.log("Starting request",  societyId, participantId, activities, participantName, eventId);  // Log before request starts
    try {
      const response = await axiosInstance.post(
        `/events/register/${eventId}`,
        { societyId, participantId, activities, participantName }
      );
      console.log("Request successful:", response.data);
      return response.data;
    } catch (error) {
      console.log("Request failed:", error.message);
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);

const registrationSlice = createSlice({
  name: 'registration',
  initialState: {
    loading: false,
    successMessage: null,
    error: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.successMessage = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerParticipant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerParticipant.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(registerParticipant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearMessages } = registrationSlice.actions;

export default registrationSlice.reducer;