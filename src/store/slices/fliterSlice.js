import { createSlice } from "@reduxjs/toolkit";
import { TextConstants } from "constants/TextConstant";

const initialState = {
    searchValue: null,
    globalStatus: null,
    statusState: null
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
        resetNormalStatus: (state, action) => {
            state.statusState = action.payload;
        },
    },
});

export const { setGlobalSearchValue, setGlobalStatusValue, resetSearchValue, resetStatusValue, resetNormalStatus } = FilterSlice.actions;

export default FilterSlice.reducer;
