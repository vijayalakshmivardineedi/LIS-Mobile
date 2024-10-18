import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../../Security/helpers/axios';
export const fetchComplaints = createAsyncThunk(
    'complaints/fetchComplaints',
    async (societyId, thunkAPI) => {
        try {
            const response = await axiosInstance.get(`/getAllComplaints/${societyId}`);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const createComplaint = createAsyncThunk(
    'complaints/createComplaint',
    async (complaintData, thunkAPI) => {
        try {
            const response = await axiosInstance.post('/createComplaint', complaintData, {
                headers: { 'Content-Type': 'application/json' }
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);
export const updateComplaintResolution = createAsyncThunk(
    'complaints/updateComplaintResolution',
    async ({ societyId, complaintId, resolution }, thunkAPI) => {

        try {
            const response = await axiosInstance.put(`/updateComplaintStatus/${societyId}/${complaintId}`, resolution);
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

const complaintsSlice = createSlice({
    name: 'complaints',
    initialState: {
        complaints: [],
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchComplaints.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchComplaints.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.complaints = action.payload;
            })
            .addCase(fetchComplaints.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(createComplaint.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createComplaint.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.complaints = action.payload;
                console.log("success")
            })
            .addCase(createComplaint.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                console.log("failed")
            })
            .addCase(updateComplaintResolution.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateComplaintResolution.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.complaints = action.payload;
                console.log("success")
            })
            .addCase(updateComplaintResolution.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                console.log("failed", action.payload)
            });
    },
});

export default complaintsSlice.reducer;
