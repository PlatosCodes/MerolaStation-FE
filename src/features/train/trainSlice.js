import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Axios from 'axios';

export const fetchTrains = createAsyncThunk('trains/fetchTrains', async () => {
    const response = await Axios.get('/trains');
    return response.data;
});

const trainSlice = createSlice({
    name: 'trains',
    initialState: [],
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchTrains.fulfilled, (state, action) => {
            return action.payload;
        });
    },
});

export default trainSlice.reducer;
