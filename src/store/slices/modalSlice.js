import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  loading: false,
  error: null,
  selectedItem: null,
  statusDialogVisible: false,
  responseDialogVisible: false,
  modalLoading: false,
};

const modalSlice = createSlice({
  name: "modalSlice",
  initialState,
  reducers: {
    resetStatusModalState: () => initialState,
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    setDialogVisible: (state, action) => {
      state.statusDialogVisible = action.payload;
    },
    setResponseDialogVisible: (state, action) => {
      state.responseDialogVisible = action.payload;
    },
    setModalLoading: (state, action) => {
      state.modalLoading = action.payload;
    },
  },
});

export const {
  setDialogVisible,
  resetStatusModalState,
  setModalLoading,
  setResponseDialogVisible,
  setSelectedItem,
} = modalSlice.actions;

export default modalSlice.reducer;
