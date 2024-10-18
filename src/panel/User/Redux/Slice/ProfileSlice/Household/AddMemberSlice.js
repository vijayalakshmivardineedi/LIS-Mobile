import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance, { Api } from '../../../../../Security/helpers/axios';
export const addFamilyMemberAsync = createAsyncThunk(
    'houseHolds/addFamilyMember',
    async (updatedProfile, thunkAPI) => {
        const { societyId, userId, memberData } = updatedProfile;
        try {
            const response = await Api.post(
                `/addFamilyMember/${societyId}/${userId}`,
                memberData
            );
            return response.data.userProfiles;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);
export const getFamilyMembersAsync = createAsyncThunk(
    'houseHolds/getFamilyMembers',
    async ({ societyId, userId }, thunkAPI) => {

        try {
            const response = await axiosInstance.get(
                `/user/getUserProfiles/${userId}/${societyId}`
            );
            return response.data.userProfiles;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)
export const deleteFamilyMemberAsync = createAsyncThunk(
    'houseHolds/deleteFamilyMembers',
    async ({ societyId, userId, id }, thunkAPI) => {
        try {
            const response = await axiosInstance.delete(
                `/deleteFamilyMember/${societyId}/${userId}/${id}`
            );
            return response.data.userProfiles;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
)
const initialState = {
    data: [],
    status: 'idle',
    error: null,
}
const addFamilyMemberSlice = createSlice({
    name: 'addFamilyMember',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addFamilyMemberAsync.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(addFamilyMemberAsync.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.error = null;
                // state.data.push(action.payload);
            })
            .addCase(addFamilyMemberAsync.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(getFamilyMembersAsync.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getFamilyMembersAsync.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.error = null;
                state.data = action.payload;
            })
            .addCase(getFamilyMembersAsync.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(deleteFamilyMemberAsync.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteFamilyMemberAsync.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.error = null;
                // state.data = action.payload;
            })
            .addCase(deleteFamilyMemberAsync.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default addFamilyMemberSlice.reducer;
