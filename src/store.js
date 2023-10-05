import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/user/userSlice';
import trainReducer from './features/train/trainSlice';
import collectionSliceReducer from './features/collection/collectionSlice';
import wishlistSliceReducer from './features/wishlist/wishlistSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        trains: trainReducer,
        collection: collectionSliceReducer, 
        wishlist: wishlistSliceReducer, 
    }
});

