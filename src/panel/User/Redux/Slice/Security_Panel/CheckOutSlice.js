import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../../../../Security/helpers/axios';
import axios from "axios";

export const fetchCheckOut = createAsyncThunk(
  "checkOut/fetchCheckOut",
  async (payload, {rejectWithValue }) => {
    try {
      const { societyId, id,userId, visitorType } = payload;
      let response;
      const endpoint = visitorType === "Guest" ? "checkoutVisitor" : "checkOutStaff";
      if (visitorType === "Guest") {
        response = await axiosInstance.put(`/${endpoint}`, {
          societyId,
          id,
        },
        {
          headers: { 'Content-Type': "application/json" }
        });
      } else {
        response = await axiosInstance.put(`/${endpoint}`, {
          societyId,
           id,
           userId
        },{
          headers: { 'Content-Type': "application/json" }
        });
      }
      console.log(response)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : error.message);
    }
  }
);


const checkOutSlice = createSlice({
  name: "checkOut",
  initialState: {
    checkOut: [],
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
      .addCase(fetchCheckOut.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCheckOut.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.checkOut = action.payload.userProfiles;
        state.successMessage = action.payload.message;
      })
      .addCase(fetchCheckOut.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload.message;
      });
  },
});
export const { resetState } = checkOutSlice.actions;
export default checkOutSlice.reducer;