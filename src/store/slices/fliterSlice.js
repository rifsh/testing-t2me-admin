import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    searchValue: null
};

const FilterSlice = createSlice({
    name: "filter",
    initialState,
    reducers: {
        setGlobalSearchValue: (state, action) => {
            state.searchValue = action.payload;
        },
        resetSearchValue: (state, action) => {
            state.searchValue = null;
        },
    },
});

export const { setGlobalSearchValue, resetSearchValue } = FilterSlice.actions;

export default FilterSlice.reducer;
