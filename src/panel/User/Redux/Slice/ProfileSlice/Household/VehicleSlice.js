import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance, { Api } from '../../../../../Security/helpers/axios';
export const addVehicleAsync = createAsyncThunk(
    'houseHolds/addVehicle',
    async (updatedProfile, thunkAPI) => {
        const { societyId, userId, vehicleData } = updatedProfile;
        try {
            const response = await Api.post(
                `/addVehicle/${societyId}/${userId}`,
                vehicleData
            );
            return response.data.userProfiles;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);
export const deleteVehicleAsync = createAsyncThunk(
    'houseHolds/deleteVehicle',
    async ({ societyId, userId, id }, thunkAPI) => {
        try {
            const response = await axiosInstance.delete(
                `/deleteVehicle/${societyId}/${userId}/${id}`
            );
            return response.data.userProfiles;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)
const initialState = {
    vehicleData: [],
    status: 'idle',
    error: null,
}
const addVehicleSlice = createSlice({
    name: 'addFamilyMember',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addVehicleAsync.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(addVehicleAsync.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.error = null;
            })
            .addCase(addVehicleAsync.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(deleteVehicleAsync.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteVehicleAsync.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.error = null;
            })
            .addCase(deleteVehicleAsync.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default addVehicleSlice.reducer;
