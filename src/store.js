import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/user/userSlice';
import trainReducer from './features/train/trainSlice';


export const store = configureStore({
    reducer: {
        user: userReducer,
        trains: trainReducer
    }
});

