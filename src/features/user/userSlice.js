import { createSlice } from '@reduxjs/toolkit';


export const userSlice = createSlice({
    name: 'user',
    initialState: {
        userData: null,
        isAuthenticated: false,
    },
    reducers: {
        loginUser: (state, action) => {
            state.userData = action.payload;
            state.isAuthenticated = true;
        },
        logoutUser: (state) => {
            state.userData = null;
            state.isAuthenticated = false;
        },startCheck: (state) => {
            state.isChecking = true;
        },
        endCheck: (state) => {
            state.isChecking = false;
        },
    }
});

export const { loginUser, logoutUser, startCheck, endCheck } = userSlice.actions;
export const selectUser = (state) => state.user.userData;
export const selectAuthenticated = (state) => state.user.isAuthenticated;
export default userSlice.reducer;