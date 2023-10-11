import { createSlice } from '@reduxjs/toolkit';


export const userSlice = createSlice({
    name: 'user',
    initialState: {
        userData: JSON.parse(localStorage.getItem('userData')),
        isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
        isChecking: true, 
        isAdmin: false
    },
    
    reducers: {
        loginUser: (state, action) => {
            localStorage.setItem('userData', JSON.stringify(action.payload));
            state.userData = action.payload;
            state.isAuthenticated = true;
            state.isAdmin = action.payload
        },
        logoutUser: (state) => {
            localStorage.removeItem('userData');
            state.userData = null;
            state.isAuthenticated = false;
        },
        startCheck: (state) => {
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