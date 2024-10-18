import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '../../../Security/helpers/axios';

export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventoryList',
  async (societyId) => {
    const response = await axiosInstance.get(`/getAllInventory/${societyId}`)
    return response.data.inventory
  }
);

export const getInventoryById = createAsyncThunk(
  'inventory/getInventoryById',
  async ({ id }) => {
    const response = await axiosInstance.get(`/getInventoryById/${id}`)
    return response.data.inventory
  }
);

export const fetchaddInventory = createAsyncThunk(
  'inventory/fetchaddInventory',
  async (inventoryData) => {
    console.log(inventoryData)
    const response = await axiosInstance.post(
      'createInventory',
      inventoryData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }
);

export const fetchEditInventoryAsync = createAsyncThunk(
  'inventory/EditInventoryData',
  async ({ id, editInventoryData }) => {
    const response = await axiosInstance.put(`/updateInventory/${id}`,
      editInventoryData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }
);

export const deleteInventoryAsync = createAsyncThunk(
  'inventory/deleteInventory',
  async ({ id }) => {
    const response = await axiosInstance.delete(`/deleteInventory/${id}`)
    return response.data
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    inventoryItems: [],
    status: 'idle',
    error: null,
    successMessage: null,
  },

  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchInventory.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.inventoryItems = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      .addCase(getInventoryById.pending, state => {
        state.status = 'loading';
      })
      .addCase(getInventoryById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.inventoryItems = action.payload;
      })
      .addCase(getInventoryById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })

      .addCase(fetchaddInventory.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchaddInventory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.inventoryItems = action.payload;
        state.successMessage = action.payload.message;
      })
      .addCase(fetchaddInventory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchEditInventoryAsync.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchEditInventoryAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.inventoryItems = action.payload;
        state.successMessage = action.payload.message;
      })
      .addCase(fetchEditInventoryAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(deleteInventoryAsync.pending, state => {
        state.status = 'loading';
      })
      .addCase(deleteInventoryAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.inventoryItems = action.payload;
        state.successMessage = action.payload.message;
      })
      .addCase(deleteInventoryAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const inventoryReducer = inventorySlice.reducer
