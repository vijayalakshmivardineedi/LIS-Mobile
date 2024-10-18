import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../Security/helpers/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const fetchSocietyId = async () => {
  const storedAdmin = await AsyncStorage.getItem("user");
  const societyAdmin = JSON.parse(storedAdmin) || {};
  return societyAdmin._id || "";
};

export const createAmenity = createAsyncThunk(
  "amenities/createAmenity",
  async (formData) => {
    const response = await axiosInstance.post(`/createAmenity`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
);

export const getAllAmenityBySocietyId = createAsyncThunk(
  "amenities/getAllAmenityBySocietyId",
  async () => {
    const societyId = await fetchSocietyId(); 
    const response = await axiosInstance.get(
      `/getAllAmenityBySocietyId/${societyId}`
    );
    return response.data.society;
  }
);

export const getAmenityById = createAsyncThunk(
  "amenities/getAmenityById",
  async (id) => {
    const response = await axiosInstance.get(`/getAmenityById/${id}`);
    return response.data.amenity;
  }
);

export const updateAmenity = createAsyncThunk(
  "amenities/updateAmenity",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/updateAmenity/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {

      const errorMessage = error.response?.data?.message || "An error occurred while updating the amenity.";
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteAmenity = createAsyncThunk(
  "amenities/deleteAmenity",
  async ({ id }) => {
    const response = await axiosInstance.delete(`/deleteAmenity/${id}`);
    return response.data;
  }
);

const amenitiesSlice = createSlice({
  name: "amenities",
  initialState: {
    amenities: [],
    status: null,
    error: null,
    successMessage: null,
  },

  extraReducers: (builder) => {
    builder
      .addCase(createAmenity.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createAmenity.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.amenities = action.payload;
        state.successMessage = action.payload.message;
      })
      .addCase(createAmenity.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      .addCase(getAllAmenityBySocietyId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getAllAmenityBySocietyId.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.amenities = action.payload;
      })
      .addCase(getAllAmenityBySocietyId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      .addCase(getAmenityById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getAmenityById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.amenities = action.payload;
      })
      .addCase(getAmenityById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      .addCase(updateAmenity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAmenity.fulfilled, (state, action) => {
        state.loading = false;
        state.amenities = action.payload;
        state.successMessage = action.payload.message;
      })
      .addCase(updateAmenity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error;
      })

      .addCase(deleteAmenity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAmenity.fulfilled, (state, action) => {
        state.loading = false;
        state.amenities = action.payload;
        state.successMessage = action.payload.message;
      })
      .addCase(deleteAmenity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error;
      });
  },
});

export const AdminAmenitiesReducer = amenitiesSlice.reducer;
