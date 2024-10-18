
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../../../Security/helpers/axios";

// Fetch emergency contacts by society ID
export const fetchEmergencyContacts = createAsyncThunk(
  'emergencyContacts/fetchContacts',
  async (societyId, { rejectWithValue }) => {
    if (!societyId) {
      return rejectWithValue({ message: "Invalid society ID" });
    }
    try {
      const response = await axiosInstance.get(`/getEmergencyContactBySocietyId/${societyId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : { message: "Network error" });
    }
  }
);

export const createEmergencyContact = createAsyncThunk(
  'emergencyContacts/createContact',
  async (contactToCreate, { rejectWithValue }) => {
    console.log(contactToCreate);
    try {
      const response = await axiosInstance.post('/createEmergencyContact', contactToCreate, {
        headers: {
          'Content-Type': 'application/json',

        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response ? error.response.data : { message: "Network error" });
    }
  }
);

// Update an emergency contact
export const updateEmergencyContact = createAsyncThunk(
  'emergencyContacts/updateContact',
  async ({ id, name, phoneNumber, profession, serviceType, societyId }, { rejectWithValue }) => {
    console.log(id, name, phoneNumber, profession, serviceType, societyId)
    try {
      const response = await axiosInstance.put(`/updateEmergencyContact/${id}`, {
        name,
        phoneNumber,
        profession,
        serviceType,
        societyId
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error updating emergency contact:", error);
      return rejectWithValue(error.response ? error.response.data : { message: "Network error" });
    }
  }
);


export const deleteEmergencyContact = createAsyncThunk(
  'emergencyContacts/deleteContact',
  async (id, { rejectWithValue }) => {
    console.log(id)
    try {
      const response = await axiosInstance.delete(`/deleteEmergencyContact/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting emergency contact:", error);
      return rejectWithValue(error.response ? error.response.data : { message: "Network error" });
    }
  }
);

const initialState = {
  contacts: [],
  status: 'idle',
  error: null,
};


const emergencyContactsSlice = createSlice({
  name: 'emergencyContacts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmergencyContacts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEmergencyContacts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.contacts = action.payload;
      })
      .addCase(fetchEmergencyContacts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Failed to fetch contacts";
        console.log(action.payload)
      })
      .addCase(createEmergencyContact.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createEmergencyContact.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.contacts.push(action.payload);
      })
      .addCase(createEmergencyContact.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Failed to create contact";
      })
      .addCase(updateEmergencyContact.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateEmergencyContact.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.contacts.findIndex(contact => contact._id === action.payload._id);
        if (index !== -1) {
          state.contacts[index] = action.payload;
        }
      })
      .addCase(updateEmergencyContact.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Failed to update contact";
      })
      .addCase(deleteEmergencyContact.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteEmergencyContact.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.contacts = action.payload;


      })
      .addCase(deleteEmergencyContact.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message;
      });
  },
});

export default emergencyContactsSlice.reducer;
