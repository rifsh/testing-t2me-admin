import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AdvertisementService from "services/AdvertisementService";


const initialState = {
  loading: false,
  createBannerLoading:false,
  adBanner: [],
  filteredAdBanner: [],
  searchTerm: "",
  responseData: null,
  selectedAdBanner: null,
  responseMessage: null,
  selectedAdBannerId: null,
  error: null,
  message: null,
  subPagination: {},
  pagination: {},
  editable_status: null,
  singleAdBanner: null,
};


export const fetchAdBanners = createAsyncThunk(
  "advertisement/fetchAdBanners",
  async (pageData, { rejectWithValue }) => {
    try {

      const response = await AdvertisementService.fetchAdBanners(pageData);
      return response.data[0];

    } catch (error) {
      return rejectWithValue("Failed to fetch categories");
    }
  }
);

export const createAdBanner = createAsyncThunk(
  "advertisement/createAdBanners",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await AdvertisementService.addAdBanner(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Error creating AdBanner");
    }
  }
);

const AdBannerSlice = createSlice({
  name: "advertisement",
  initialState,
  reducers: {
    setAdBannerDialogVisible(state, action) {
      state.dialogVisible = action.payload;
    },
    setAdBannerModalLoading(state, action) {
      state.modalLoading = action.payload;
    },
    setSelectedAdBanner(state, action) {
      state.selectedAdBanner = action.payload;
    },
    filterBanner: (state, action) => {
      const { searchTerm, type } = action.payload;

      if (type === "banner") {
        state.filteredAdBanner = state.adBanner.filter((banner) =>
          banner.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    },

    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.filteredAdBanner = state.adBanner.filter((cat) =>
        cat.name.toLowerCase().includes(action.payload.toLowerCase())
      );
    },
  },
  extraReducers: (builder) => {
    builder
      //   .addCase(addAdCategory.pending, (state) => {
      //     state.loading = true;
      //     state.error = null;
      //   })
      //   .addCase(addAdCategory.fulfilled, (state, action) => {
      //     state.loading = false;
      //     state.error = null;
      //     state.responseData = action.payload.data;
      //     state.responseMessage = action.payload.status.message;
      //   })
      //   .addCase(addAdCategory.rejected, (state, { payload }) => {
      //     state.loading = false;
      //     state.error = payload || "Failed to create category";
      //   })
      .addCase(fetchAdBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdBanners.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.adBanner = payload.items;
        state.filteredAdBanner= payload.items;
        state.pagination = payload;
      })
      .addCase(fetchAdBanners.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(createAdBanner.pending, (state) => {
        state.createBannerLoading = true;
        state.error = null;
      })
      .addCase(createAdBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(createAdBanner.rejected, (state, action) => {
        state.createBannerLoading = false;
        state.error = action.payload.data;
      })
    //   .addCase(updateAdCategory.pending, (state) => {
    //     state.loading = true;
    //     state.error = null;
    //   })
    //   .addCase(updateAdCategory.fulfilled, (state, { payload }) => {
    //     state.loading = false;
    //     if (payload.message) {
    //       state.message = payload.message;
    //       state.editable_status = payload.editable_status;
    //     }
    //   })
    //   .addCase(updateAdCategory.rejected, (state, { payload }) => {
    //     state.loading = false;
    //     state.error = payload || "Failed to edit event";
    //   })

  },
});

export const { filterBanner, setAdBannerDialogVisible,
  setAdBannerModalLoading, setSelectedAdBanner } =
  AdBannerSlice.actions;

export default AdBannerSlice.reducer;
