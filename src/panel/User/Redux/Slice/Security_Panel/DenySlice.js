import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../../../../Security/helpers/axios';

export const denyEntry = createAsyncThunk(
    "deny/denyEntry",
    async ({societyId, visitorId}, { rejectWithValue }) => {
        try {
            console.log ( societyId, visitorId ) ;
            response = await axiosInstance.put(`/denyVisitor`, {
                societyId,
                visitorId,
            }
        );
        return response.data;
        } catch (error) {
            return rejectWithValue(error.response ? error.response.data : error.message);
        }
    }
);
const denySlice = createSlice({
    name: "deny",
    initialState: {
        deny: [],
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
            .addCase(denyEntry.pending, (state) => {
                state.status = "loading";
            })
            .addCase(denyEntry.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.deny = action.payload;
                state.successMessage = action.payload.message;
            })
            .addCase(denyEntry.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload.message;
            });
    },
});
export const { resetState } = denySlice.actions;
export default denySlice.reducer;