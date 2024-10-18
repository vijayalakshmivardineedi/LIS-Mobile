import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../../Security/helpers/axios";
const initialState = {
  Documents: [],
  status: "idle",
  error: null,
};

export const AddDocumentsAsync = createAsyncThunk(
  "documents/AddDocuments",
  async (formData, thunkAPI) => {
    try {
      const response = await axiosInstance.post('/createDocuments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error from backend:", error.response.data);
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const AddDocumentSlice = createSlice({
  name: "documentsadd",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(AddDocumentsAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(AddDocumentsAsync.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.Documents = action.payload;
      })
      .addCase(AddDocumentsAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default AddDocumentSlice.reducer;
