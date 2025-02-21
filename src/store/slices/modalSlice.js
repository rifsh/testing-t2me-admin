import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  loading: false,
  error: null,
  selectedItem: null,
  selectedSubmitItem: null,
  statusDialogVisible: false,
  responseDialogVisible: false,
  modalLoading: false,
  responseData: null,
};

const modalSlice = createSlice({
  name: "modalSlice",
  initialState,
  reducers: {
    resetStatusModalState: () => initialState,
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    setSelectedSubmitItem: (state, action) => {
      state.selectedSubmitItem = action.payload;
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
    setResponseData: (state, action) => {
      state.responseData = action.payload;
    },
  },
});

export const {
  setDialogVisible,
  resetStatusModalState,
  setModalLoading,
  setResponseDialogVisible,
  setSelectedItem,
  setSelectedSubmitItem,
  setResponseData,
} = modalSlice.actions;

export default modalSlice.reducer;
