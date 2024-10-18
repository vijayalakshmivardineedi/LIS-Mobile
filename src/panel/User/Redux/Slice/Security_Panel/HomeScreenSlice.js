import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../../../../Security/helpers/axios';

export const fetchVisitorVerify = createAsyncThunk(
  "visitorVerify/fetchVisitorVerify",
  async (payload, { rejectWithValue }) => {
    try {
      const { societyId, id, visitorType } = payload;
      let response;
      const endpoint = visitorType === "Guest" ? "checkInVisitor" : "checkInStaff";
      if (visitorType === "Guest") {
        response = await axiosInstance.put(`/${endpoint}`, {
          societyId,
          visitorId: id,
        }, {
          headers: { 'Content-Type': "application/json" }
        });

      } else {
        response = await axiosInstance.post(`/${endpoint}`, {
          societyId,
          userid: id,
        }, {
          headers: { 'Content-Type': "application/json" }
        });
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);


const visitorVerifySlice = createSlice({
  name: "visitorVerify",
  initialState: {
    visitorVerify: [],
    status: "idle",
    error: null,
    successMessage: null,

  },
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisitorVerify.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchVisitorVerify.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.visitorVerify = action.payload.userProfiles;
        state.successMessage = action.payload.message;
      })
      .addCase(fetchVisitorVerify.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload.message;
      });
  },
});
export const { resetState } = visitorVerifySlice.actions;
export default visitorVerifySlice.reducer;