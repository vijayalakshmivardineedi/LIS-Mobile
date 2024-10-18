import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../../../Security/helpers/axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Function to fetch society ID from AsyncStorage
const fetchSocietyId = async () => {
  const storedAdmin = await AsyncStorage.getItem('user');
  const societyAdmin = JSON.parse(storedAdmin) ;
  return societyAdmin._id ; // Default ID
};

export const fetchComplaints = createAsyncThunk(
  "ComplaintList/fetchComplaints",
  async () => {
    const societyId = await fetchSocietyId(); // Get society ID here
    const response = await axiosInstance.get(`/getAllComplaints/${societyId}`);
    return response.data.Complaints;
  }
);

export const deleteComplaintAsync = createAsyncThunk(
  "Complaint/deleteComplaint",
  async ({ complaintId }) => {
    const societyId = await fetchSocietyId(); // Get society ID here
    const response = await axiosInstance.delete(
      `/deleteComplaint/${societyId}/${complaintId}`
    );
    return { complaintId, message: response.data.message }; // Return complaintId and message
  }
);
export const createComplaint = createAsyncThunk(
  'complaints/createComplaint',
  async (complaintData, thunkAPI) => {
    try {
      const response = await axiosInstance.post('/createComplaint', complaintData,{
        headers: { 'Content-Type': 'application/json'}
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const updateComplaintStatusResolution = createAsyncThunk(
  'complaints/updateComplaintResolution',
  async ({ complaintId, resolution }, thunkAPI) => {
    try {
      const storedAdmin = await AsyncStorage.getItem('user');
      const societyAdmin = JSON.parse(storedAdmin) ;
      const societyId = societyAdmin._id ; // Default ID
      const response = await axiosInstance.put(`/updateComplaintStatus/${societyId}/${complaintId}`, { resolution });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);
const ComplaintSlice = createSlice({
  name: 'ComplaintList',
  initialState: {
    complaints: [],
    status: 'idle',
    error: null,
    successMessage: null,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchComplaints.pending, state => {
        state.status = "loading";
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.complaints = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(deleteComplaintAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteComplaintAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted complaint from the state
        state.complaints = state.complaints.filter(
          complaint => complaint._id !== action.payload.complaintId
        );
        state.successMessage = action.payload.message;
      })
      .addCase(deleteComplaintAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message; // Update to use action.error.message
      })
      .addCase(createComplaint.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.status = "Loading";

      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.status = "Success";
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message; 
        state.status = "Failed";
      })
      .addCase(updateComplaintStatusResolution.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.status = "Loading";

      })
      .addCase(updateComplaintStatusResolution.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.status = "Success";
      })
      .addCase(updateComplaintStatusResolution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.status = "Failed";
      });
  }
});

export const AdminComplaintReducer = ComplaintSlice.reducer;
