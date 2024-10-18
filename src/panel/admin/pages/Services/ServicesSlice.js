import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../Security/helpers/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const fetchSocietyId = async () => {
    const storedAdmin = await AsyncStorage.getItem('user');
    const societyAdmin = JSON.parse(storedAdmin) || {};
    return societyAdmin._id; // Default ID
};
export const createService = createAsyncThunk(
    'staff/createService',
    async (formData) => {
        try {
            const response = await axiosInstance.post('/createService', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating service:', error);
            if (error.response) {
                console.error('Error details:', error.response.data);
            }
            throw error; // Propagate the error to handle it elsewhere
        }
    }
);

export const getAllServicePersons = createAsyncThunk(
    'staff/getAllServicePersons',
    async () => {
        const societyId = await fetchSocietyId()
        const response = await axiosInstance.get(`/getAllServicePersons/${societyId}`);
        return response.data.service.society;
    });

export const fetchAllServiceTypes = createAsyncThunk(
    'staff/fetchAllServiceTypes',
    async (serviceType) => {
        const societyId = await fetchSocietyId()
        const response = await axiosInstance.get(`/getAllServiceTypes/${societyId}/${serviceType}`);
        return response.data.providers;
    });


export const fetchServicePersonById = createAsyncThunk(
    'staff/fetchServicePersonById',
    async ({ serviceType, userid }) => {
        const societyId = await fetchSocietyId()
        const response = await axiosInstance.get(`/getServicePersonById/${societyId}/${serviceType}/${userid}`);
        return response.data.ServicePerson;
    }
);

export const updateServicePerson = createAsyncThunk(
    'staff/updateServicePerson',
    async (formData) => {
        const response = await axiosInstance.put('/updateServicePerson', formData, {
            headers: {
                'Content-Type': 'multipart/form-data' // Ensure proper content type for FormData
            }
        });
        return response.data;
    });

// router.delete('/deleteServicePerson', deleteServicePerson);
export const deleteServicePerson = createAsyncThunk(
    'user/deleteServicePerson',
    async ({ userid, serviceType, societyId }) => {

        try {
            const societyId = await fetchSocietyId()
            const response = await axiosInstance.delete('/deleteServicePerson', {
                data: { societyId, serviceType, userid },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw error; // Handle as needed
        }
    }
);

export const deleteUserService = createAsyncThunk(
    'staff/deleteUserService',
    async ({ serviceType, userid, userIdToDelete }) => {
        try {
            const societyId = await fetchSocietyId()
            const response = await axiosInstance.delete('/deleteUserService', {
                data: { societyId, serviceType, userid, userIdToDelete }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
);

export const fetchAdminServices = createAsyncThunk(
    'services/fetchAdminServices',
    async () => {
        try {
            const societyId = await fetchSocietyId();
            const response = await axiosInstance.get(`/getAllServicePersons/${societyId}`);
            return response.data.service.society;
        } catch (error) {
            throw error;
        }
    }
)
const staffSlice = createSlice({
    name: 'staff',
    initialState: {
        data: [],
        status: 'idle',
        error: null,
        successMessage: null,
        loading: false,
    },
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            //createService
            .addCase(createService.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createService.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.successMessage = action.payload.message;
                console.log("hello success")
            })
            .addCase(createService.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
                console.log("hello failed")
            })

            //getAllServicePersons
            .addCase(getAllServicePersons.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getAllServicePersons.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(getAllServicePersons.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            //fetchAllServiceTypes
            .addCase(fetchAllServiceTypes.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllServiceTypes.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(fetchAllServiceTypes.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            //fetchServicePersonById
            .addCase(fetchServicePersonById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchServicePersonById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(fetchServicePersonById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            //updateServicePerson
            .addCase(updateServicePerson.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateServicePerson.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.successMessage = action.payload.message;
            })
            .addCase(updateServicePerson.rejected, (state, action) => {
                state.status = 'failed';

                state.error = action.error.message;
            })

            //deleteServicePerson
            .addCase(deleteServicePerson.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteServicePerson.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
                state.successMessage = action.payload.message;
            })
            .addCase(deleteServicePerson.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })


            .addCase(deleteUserService.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteUserService.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.successMessage = action.payload.message;
            })
            .addCase(deleteUserService.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchAdminServices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminServices.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchAdminServices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const staffReducer = staffSlice.reducer;
