import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../../Security/helpers/axios";

const initialState = {
    userProfiles: [],
    status: "idle",
    error: null,
};

export const fetchresidents = createAsyncThunk(
    "community/fetchresidents",
    async (societyId) => {
        const response = await axiosInstance.get(
            `/user/getAllUserProfilesBySocietyId/${societyId}`
        );
        return response.data.userProfiles;
    }
);
const residentsSlice = createSlice({
    name: "userProfiles",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchresidents.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchresidents.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.userProfiles = action.payload;
            })
            .addCase(fetchresidents.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            });
    },
});

export default residentsSlice.reducer;