
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Asynchronous thunk
export const fetchUserWishlist = createAsyncThunk(
  'wishlist/fetchUserWishlist',
  async (userId) => {
    const response = await axiosInstance.get(`/users/${userId}/wishlist`);
    return response.data;
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: [],
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUserWishlist.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});

export default wishlistSlice.reducer;