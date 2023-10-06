
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchUserCollection = createAsyncThunk(
  'collection/fetchUserCollection',
  async ({ userId, pageSize, pageId }) => { // <-- Destructure properties here
    const response = await axiosInstance.get(`/users/${userId}/collection?page_id=${pageId}&page_size=${pageSize}`);
    if (response.status === 204) return []; 
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