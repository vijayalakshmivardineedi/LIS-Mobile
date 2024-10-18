import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../Security/helpers/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const fetchSocietyId = async () => {
    const storedAdmin = await AsyncStorage.getItem('user');
    const societyAdmin = JSON.parse(storedAdmin) ;
    console.log("societyID Slice",societyAdmin._id)
    return societyAdmin._id ; // Default ID
};
export const fetchUsers = createAsyncThunk(
    'user/fetchUsers',
    async () => {
        const societyId = await fetchSocietyId()
        const response = await axiosInstance.get(`/user/getAllUserProfilesBySocietyId/${societyId}`);
        return response.data.userProfiles;
    }
);
export const getAllOwners = createAsyncThunk(
    'user/getAllOwners',
    async () => {
        const societyId = await fetchSocietyId()
        const response = await axiosInstance.get(`/user/getAllOwners/${societyId}`);
        return response.data.userProfiles;
    }
);
export const fetchUserProfiles = createAsyncThunk(
    'user/fetchUserProfiles',
    async ({ userId }) => {
        const societyId = await fetchSocietyId()
        const response = await axiosInstance.get(`/user/getUserProfiles/${userId}/${societyId}`);
        return response.data.userProfiles;
    }
);
export const deleteUser = createAsyncThunk(
    'user/deleteUser',
    async ({ _id }) => {
        const response = await axiosInstance.delete(`/user/deleteUserProfile/${_id}`);
        return response.data;
    }
);
export const fetchResidentProfile = createAsyncThunk(
    'profile/fetchResidentProfile',
    async () => {
        const societyId = await fetchSocietyId()
        console, log(societyId)
        const response = await axiosInstance.get(`/society/profile/${societyId}`);
        console.log(response.data)
        return response.data.admins;

    }
);
const ResidentsSlice = createSlice({
    name: 'user',
    initialState: {
        users: [],
        profiles: [],
        profile: [],
        status: 'idle',
        error: null,
        successMessage: null,
    },
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(getAllOwners.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getAllOwners.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.users = action.payload;
            })
            .addCase(getAllOwners.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(fetchUserProfiles.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserProfiles.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.profiles = action.payload;
            })
            .addCase(fetchUserProfiles.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(deleteUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.profiles = action.payload;
                state.successMessage = action.payload.message;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchResidentProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchResidentProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profiles = action.payload;
                state.error = null;
            })
            .addCase(fetchResidentProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    }
});

export const residentsReducer = ResidentsSlice.reducer;
