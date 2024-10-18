import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../Security/helpers/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const fetchSocietyId = async () => {
  const storedAdmin = await AsyncStorage.getItem('user');
  const societyAdmin = JSON.parse(storedAdmin) || {};
  return societyAdmin._id || ""; // Default ID
};

export const fetchVisitors = createAsyncThunk(
  "visitors/fetchVisitors",
  async () => {
    const societyId = await fetchSocietyId();
    const response = await axiosInstance.get(
      `/getAllVisitorsBySocietyId/${societyId}`
    );
    return response.data.visitors;
  }
);

export const deleteEntry = createAsyncThunk(
  "visitors/Delete",
  async ({ block, flatNo, visitorId }) => {
    const societyId = await fetchSocietyId();
    const response = await axiosInstance.delete(
      `/deleteEntryVisitor/${societyId}/${block}/${flatNo}/${visitorId}`
    );
    return response.data;
  }
);

const visitorsSlice = createSlice({
  name: "visitors",
  initialState: {
    visitors: [],
    status: "idle",
    error: null,
    successMessage: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisitors.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchVisitors.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.visitors = action.payload;
        state.successMessage = action.payload.message;
      })
      .addCase(fetchVisitors.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(deleteEntry.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteEntry.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.successMessage = action.payload.message;
      })
      .addCase(deleteEntry.rejected, (state, action) => {
        state.status = "failed";

        state.error = action.error.message;
      });
  },
});

export const AdminEntriesReducer = visitorsSlice.reducer;
