import { configureStore } from "@reduxjs/toolkit"; // Adjust the import as necessary
import AuthSlice from "./AuthSlice"; // Adjust the import as necessary
import { persistReducer, persistStore } from "redux-persist"; // Adjust the import as necessary
import storage from "redux-persist/lib/storage"; // Adjust the import as necessary

const persistConfig = {
    key: 'root',
    storage,
};

const persistedReducer = persistReducer(persistConfig, AuthSlice);

export const store = configureStore({
    reducer: {
        Auth: persistedReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
});

export const persistor = persistStore(store);
