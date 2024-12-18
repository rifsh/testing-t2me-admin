import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
export const initialState = {
  loading: false,
  error: null,
  selectedItem: null,
  message: null,
};

const statusModalSlice = createSlice({
  name: "statusModal",
  initialState,
  reducers: {
    resetStatusModalState(state, action) {
      return initialState;
    },
    setSelectedItem(state, action) {
      state.selectedItem = action.payload;
    },

    setDialogVisible(state, action) {
      state.dialogVisible = action.payload;
    },
    setModalLoading(state, action) {
      state.modalLoading = action.payload;
    },
  },
//   extraReducers: (builder) => {
//     builder;
//   },
});

export const {
  
  setDialogVisible,
  resetStatusModalState,
  setModalLoading,
  setSelectedItem,

} = statusModalSlice.actions;
export const allLocations = (state) => state.statusModal;

export default statusModalSlice.reducer;
