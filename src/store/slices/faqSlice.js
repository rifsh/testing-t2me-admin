import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import FaqService from "services/FaqService";
import AdCategoryMockData from "mock/data/adCategoryData";
import { ADVERTISEMENT_ALL_CATEGORY_MOCK_API } from "configs/MockConfig";

const initialState = {
  loading: false,
  adCategories: [],
  filteredAdCategories: [],
  responseData: null,
  faqs: [],
  faqSections: [],
  error: null,
  message: null,
  pagination: {},
  editable_status: null,
  singleCategory: null,
};

export const fetchAllFaqs = createAsyncThunk(
  "faqs/fetchAllFaqs",
  async (_, { rejectWithValue }) => {
    try {
      console.log("HELOOOOOOOOOO FAQS");

      const response = await FaqService.getFaqs();
      console.log("-----------Fetching FAQS", response);
      return response;
    } catch (error) {
      console.log(error, "-------------");
      return rejectWithValue("Failed to fetch categories");
    }
  }
);

const FaqSlice = createSlice({
  name: "faqs",
  initialState,
  reducers: {
    // setAdCategoryDialogVisible(state, action) {
    //   state.dialogVisible = action.payload;
    // },
    // setAdCategoryModalLoading(state, action) {
    //   state.modalLoading = action.payload;
    // },
    // filterCategory: (state, action) => {
    //   const { searchTerm, type } = action.payload;
    //   if (type === "category") {
    //     state.filteredAdCategories = state.adCategories.filter((category) =>
    //       category.name.toLowerCase().includes(searchTerm.toLowerCase())
    //     );
    //   }
    // },
    // setSearchTerm: (state, action) => {
    //   state.searchTerm = action.payload;
    //   state.filteredAdCategories = state.adCategories.filter((cat) =>
    //     cat.name.toLowerCase().includes(action.payload.toLowerCase())
    //   );
    // },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchAllFaqs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFaqs.fulfilled, (state, { payload }) => {
        state.loading = false;
        // state.adCategories = payload.items;
        // state.filteredAdCategories = payload.items;
        // state.pagination = payload;
        state.faqs = payload.data;
        state.faqSections = payload.sections;
      })
      .addCase(fetchAllFaqs.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const {
  //   filterCategory,
  //   setAdCategoryDialogVisible,
  //   setAdCategoryModalLoading,
  //   setSelectedAdCategory,
  //   setEditItemId,
  //   setAdCategoryValidationDialogVisible,
} = FaqSlice.actions;

export default FaqSlice.reducer;
