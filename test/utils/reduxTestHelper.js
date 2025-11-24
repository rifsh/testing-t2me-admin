import { configureStore } from "@reduxjs/toolkit";

/**
 * Creates a Redux store with the given slice reducer for testing
 * @param {object} reducer - Redux slice reducer
 * @param {object} preloadedState - initial state for the store
 * @returns {object} store
 */
export function createTestStore(reducer, preloadedState = {}) {
    return configureStore({
        reducer: { slice: reducer },
        preloadedState: { slice: preloadedState },
    });
}

/**
 * Helper to test an async thunk
 * @param {object} store - Redux store
 * @param {function} thunk - Redux async thunk
 * @param {object} args - Arguments to pass to thunk
 * @returns {object} { state, action }
 */
export async function testAsyncThunk(store, thunk, args) {
    const action = await store.dispatch(thunk(args));
    const state = store.getState().slice;
    return { state, action };
}