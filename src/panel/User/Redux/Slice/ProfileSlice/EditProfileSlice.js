import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../Security/helpers/axios';

const initialState = {
  profiles: [],
  status: 'idle',
  error: null,
};

export const EditUserProfile = createAsyncThunk(
  'profiles/EditUserProfile',
  async ({ formData, id }, thunkAPI) => {
    try {
      console.log(formData, id)
      const response = await axiosInstance.put(
        `/user/updateUserProfile/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log(error)
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const profileEditSlice = createSlice({
  name: 'profileEdit',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(EditUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(EditUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profiles = action.payload;
      })
      .addCase(EditUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default profileEditSlice.reducer;