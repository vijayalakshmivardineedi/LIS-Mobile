import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../../../../Security/helpers/axios';

export const fetchGuard = createAsyncThunk(
    "settings/fetchGuard",
    async ({societyId, sequrityId}, { rejectWithValue }) => {
        try {
            response = await axiosInstance.get(`/sequrity/getGuardBySocietyIdAndId/${societyId}/${sequrityId}`
        );
        return response.data.sequrity;
        } catch (error) {
            return rejectWithValue(error.response ? error.response.data : error.message);
        }
    }
);

const settingsSlice = createSlice({
    name: "settings",
    initialState: {
        settings: [],
        status: "idle",
        error: null,
        successMessage: null,

    },
    reducers: {
        resetState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGuard.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchGuard.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.settings = action.payload;
                state.successMessage = action.payload.message;
            })
            .addCase(fetchGuard.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload.message;
            });
    },
});

export const { resetState } = settingsSlice.actions;
export default settingsSlice.reducer;