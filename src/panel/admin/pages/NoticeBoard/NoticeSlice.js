import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../Security/helpers/axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';


const fetchSocietyId = async () => {
    const storedAdmin = await AsyncStorage.getItem("user");
    const societyAdmin = JSON.parse(storedAdmin) || {};
    return societyAdmin._id || "";
  };
export const fetchnotices = createAsyncThunk(
    'notice/fetchnotice',
    async () => {
        const societyId = await fetchSocietyId();
        const response = await axiosInstance.get(`/getNotice/${societyId}`);
        return response.data.notices;
    }
);

export const fetchnoticeById = createAsyncThunk(
    'notice/fetchnoticeById',
    async () => {
        const societyId = await fetchSocietyId();
        const response = await axiosInstance.get(`/getAllNotice/${societyId}`);
        return response.data.notices;
    }
);

export const getNoticeById = createAsyncThunk(
    'notice/getNoticeById',
    async (id) => {
        const response = await axiosInstance.get(`/getNoticeById/${id}`);
        return response.data.notices;
    }
);

export const createNotice = createAsyncThunk(
    'notice/createNotice',
    async (formData) => {
        const response = await axiosInstance.post('/createNotice', formData, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    }
);

export const editNotice = createAsyncThunk(
    'notice/editNotice',
    async ({ noticeId, formData }) => {
        const response = await axiosInstance.put(`/editNotice/${noticeId}`, formData, {
            headers: { 'Content-Type': 'application/json' }
        }
        );
        return response.data;
    }
);

export const deleteNotice = createAsyncThunk(
    "notice/deleteNotice",
    async (id) => {
        const response = await axiosInstance.delete(`/deleteNotice/${id}`);
        return response.data;
    }
);

const NoticeSlice = createSlice({
    name: 'notice',
    initialState: {
        notice: [],
        status: 'idle',
        error: null,
        successMessage: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchnotices.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchnotices.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.notice = action.payload;
            })
            .addCase(fetchnotices.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchnoticeById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchnoticeById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.notice = action.payload;
            })
            .addCase(fetchnoticeById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(getNoticeById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getNoticeById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.notice = action.payload;
            })
            .addCase(getNoticeById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(createNotice.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createNotice.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.notice.push(action.payload);
                state.successMessage = action.payload.message;
            })
            .addCase(createNotice.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(editNotice.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(editNotice.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.successMessage = action.payload.message;
            })
            .addCase(editNotice.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(deleteNotice.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteNotice.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.successMessage = action.payload.message;
                state.error = null;
            })
            .addCase(deleteNotice.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload ? action.payload : 'Failed to fetch inventory';
            });
    },
});

export const AdminNoticeReducer = NoticeSlice.reducer;
