import {configureStore} from '@reduxjs/toolkit';
import authSlice from './authSlice.js';
import chatSlice from './chatSlice.js';

const store = configureStore({
    reducer: {
        auth: authSlice,
        chat: chatSlice,
    }
});

export default store;