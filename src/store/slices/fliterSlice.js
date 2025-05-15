import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    searchValue: null,
    globalStatus: null
};

const FilterSlice = createSlice({
    name: "filter",
    initialState,
    reducers: {
        setGlobalSearchValue: (state, action) => {
            state.searchValue = action.payload;
        },
        setGlobalStatusValue: (state, action) => {
            state.globalStatus = action.payload;
        },
        resetSearchValue: (state, action) => {
            state.searchValue = null;
        },
        resetStatusValue: (state, action) => {
            state.globalStatus = null;
        },
    },
});

export const { setGlobalSearchValue, setGlobalStatusValue, resetSearchValue, resetStatusValue } = FilterSlice.actions;

export default FilterSlice.reducer;
