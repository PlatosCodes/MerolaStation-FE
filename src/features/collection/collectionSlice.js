
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Asynchronous thunk
export const fetchUserCollection = createAsyncThunk(
  'collection/fetchUserCollection',
  async (userId) => {
    const response = await axiosInstance.get(`/users/${userId}/collection`);
    return response.data;
  }
);

const collectionSlice = createSlice({
  name: 'collection',
  initialState: [],
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUserCollection.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});

export default collectionSlice.reducer;