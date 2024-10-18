import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../../../Security/helpers/axios";

const initialState = {
    events: [],
    status: "idle",
    error: null,
};

export const fetchEvents = createAsyncThunk("events/fetchEvents", async (societyId) => {
    const response = await axiosInstance.get(
        `/events/getAllEvents/${societyId}`
    );
    return response.data;
});
const eventsSlice = createSlice({
    name: "events",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchEvents.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchEvents.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.events = action.payload;
            })
            .addCase(fetchEvents.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message;
            });
    },
});

export default eventsSlice.reducer;