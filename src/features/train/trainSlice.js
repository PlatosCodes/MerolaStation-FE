import { createSlice } from '@reduxjs/toolkit';

const trainSlice = createSlice({
    name: 'trains',
    initialState: [],
    reducers: {
        // Potentially add local state modifications here
    },
    // Removed extraReducers as data fetching is now handled by React-Query
});

export default trainSlice.reducer;