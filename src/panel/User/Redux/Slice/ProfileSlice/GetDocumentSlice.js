import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../../Security/helpers/axios";

export const fetchDocumentsById = createAsyncThunk(
    "documents/fetchDocumentsById",
    async ({societyId, blockNumber, flatNumber}, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.get(`/documents/${societyId}/${blockNumber}/${flatNumber}`);
        return response.data.documents;
      } catch (error) {
        return rejectWithValue(error.response.data);
      }
    }
  );


const getdocumentSlice = createSlice({
  name: "getdocuments",
  initialState: {
    getdocuments: [],
    status: "idle",
    error: null,
  },
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocumentsById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDocumentsById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.getdocuments = action.payload;
      })
      .addCase(fetchDocumentsById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default getdocumentSlice.reducer;
