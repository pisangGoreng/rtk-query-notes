import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/dist/query";
import dogsReducer from "../pages/dogs/dogsSlice";

import { api } from "./apiSlice";

export const store = configureStore({
  reducer: {
    dogs: dogsReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

// * otomatis nge fetch ulang ketika user ganti tab (unfocus / focus)
// * otomatis nge fetch ketika koneksi internet nyambung lagi
setupListeners(store.dispatch);
