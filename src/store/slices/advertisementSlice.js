import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AdvertisementService from "services/AdvertisementService";

const initialState = {
  loading: false,
  createBannerLoading: false,
  createScheduleLoading: false,
  adBanner: [],
  adSchedules: [],
  filteredAdBanner: [],
  filteredAdSchedules: [],
  draggedFile: null,
  isVideoPlaying: false,
  searchTerm: "",
  responseData: null,
  selectedAdBanner: null,
  selectedAdSchedule: null,
  selectedDroppedFile: null,
  responseMessage: null,
  selectedAdBannerId: null,
  selectedAdScheduleId: null,
  error: null,
  message: null,
  singleSchedule: null,
  subPagination: {},
  pagination: {},
  editable_status: null,
  singleAdBanner: null,
  singleAdSchedule: null,
  warningPagination: { size: 10, page: 1 },
  modalVisible: false,
  selectedMedia: null,
  editItemId: null,
  responseImpactData: null,
};

export const setDraggedFile = createAsyncThunk(
  "advertisement/setDraggedFile",
  async (file) => {
    return file;
  }
);
export const getSingleSchedule = createAsyncThunk(
  "advertisement/getSingleSchedule",
  async (scheduleId, { rejectWithValue }) => {
    try {
      const response = await AdvertisementService.getSingleSchedule(scheduleId);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch places");
    }
  }
);

export const setSelectedDroppedFile = createAsyncThunk(
  "advertisement/setSelectedDroppedFile",
  async (file) => {
    return file;
  }
);

export const setVideoPlayingStatus = createAsyncThunk(
  "advertisement/setVideoPlayingStatus",
  async (status) => {
    return status;
  }
);

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
export const fetchAdBanner = createAsyncThunk(
  "advertisement/fetchAdBanner",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await AdvertisementService.fetchAdBanner(pageData);
      return response.data[0];
    } catch (error) {
      return rejectWithValue("Failed to fetch categories");
    }
  }
);

export const fetchAdSchedules = createAsyncThunk(
  "advertisement/fetchAdSchedules",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await AdvertisementService.fetchAdSchedules(pageData);
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
export const createAdSchedule = createAsyncThunk(
  "advertisement/createAdSchedule",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      console.log("inside-=-------------------");
      console.log(data, "030303030303030");
      const response = await AdvertisementService.addAdSchedule(data, action);
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);

      return rejectWithValue(error.response?.data || "Error creating AdBanner");
    }
  }
);
export const updateAdBanner = createAsyncThunk(
  "advertisement/updateAdBanners",
  async ({ data, action, pageData }, { rejectWithValue }) => {
    try {
      console.log("DATA IN SLICE-----", data);

      const response = await AdvertisementService.updateAdBanner(
        data,
        action,
        pageData
      );

      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update Banner");
    }
  }
);
export const editAdSchedule = createAsyncThunk(
  "advertisement/editAdSchedule",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await AdvertisementService.editSchedule(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);
export const updateAdBannerStatus = createAsyncThunk(
  "advertisement/updateAdBannerStatus",
  async ({ data, action, pageData }, { rejectWithValue }) => {
    try {
      const response = await AdvertisementService.updateBannerStatus(
        data,
        action,
        pageData
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to edit event");
    }
  }
);

const AdvertisementSlice = createSlice({
  name: "advertisement",
  initialState,
  reducers: {
    setSelectedDroppedFileState: (state, action) => {
      state.selectedDroppedFile = action.payload;
    },
    setModalVisible(state, action) {
      state.modalVisible = action.payload;
    },
    setSelectedMedia(state, action) {
      state.selectedMedia = action.payload;
    },
    setDraggedFileState: (state, action) => {
      state.draggedFile = action.payload;
    },
    setVideoPlayingState: (state, action) => {
      state.isVideoPlaying = action.payload;
    },
    setAdBannerDialogVisible(state, action) {
      state.dialogVisible = action.payload;
    },
    setAdScheduleDialogVisible(state, action) {
      state.dialogVisible = action.payload;
    },
    setAdBannerModalLoading(state, action) {
      state.modalLoading = action.payload;
    },
    setAdScheduleModalLoading(state, action) {
      state.modalLoading = action.payload;
    },
    setEditItemId: (state, action) => {
      state.editItemId = action.payload;
    },
    setSelectedAdBanner(state, action) {
      state.selectedAdBanner = action.payload;
    },
    setSelectedAdSchedule(state, action) {
      state.selectedAdSchedule = action.payload;
    },
    filterBanner: (state, action) => {
      const { searchTerm, type } = action.payload;

      if (type === "banner") {
        state.filteredAdBanner = state.adBanner.filter((banner) =>
          banner.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    },
    filterSchedule: (state, action) => {
      const { searchTerm, type } = action.payload;

      state.filteredAdSchedules = state.adSchedules.filter((schedule) =>
        schedule.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
      .addCase(editAdSchedule.pending, (state) => {
        state.loading = true;
      })
      .addCase(editAdSchedule.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;
        if (payload.status) {
          state.message = payload.status.message;
          // state.responseImpactData = payload.status.data?.active_schedules;
          // state.editable_status = payload.status?.editable_status;
          // state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(editAdSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getSingleSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSingleSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.singleSchedule = action.payload;
      })
      .addCase(getSingleSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(setDraggedFile.fulfilled, (state, action) => {
        state.draggedFile = action.payload;
      })
      .addCase(setSelectedDroppedFile.fulfilled, (state, action) => {
        state.selectedDroppedFile = action.payload;
      })
      .addCase(setVideoPlayingStatus.fulfilled, (state, action) => {
        state.isVideoPlaying = action.payload;
      })
      .addCase(fetchAdBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdBanners.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.adBanner = payload.items;
        state.filteredAdBanner = payload.items;
        state.pagination = payload;
      })
      .addCase(fetchAdBanners.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchAdSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdSchedules.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.adSchedules = payload.items;
        state.filteredAdSchedules = payload.items;
        state.pagination = payload;
      })
      .addCase(fetchAdSchedules.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(createAdBanner.pending, (state) => {
        state.createBannerLoading = true;
        state.error = null;
      })
      .addCase(createAdBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.createBannerLoading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(createAdBanner.rejected, (state, action) => {
        state.createBannerLoading = false;
        state.loading = false;
        state.error = action.payload.data;
      })
      .addCase(createAdSchedule.pending, (state) => {
        state.loading = true;
        state.createScheduleLoading = true;
        state.error = null;
      })
      .addCase(createAdSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.createScheduleLoading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(createAdSchedule.rejected, (state, action) => {
        state.loading = false;
        state.createScheduleLoading = false;
        state.error = action.payload.data;
      })
      .addCase(updateAdBannerStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdBannerStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;

        if (payload.status) {
          state.message = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(updateAdBannerStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload || "Failed to edit event";
      })
      .addCase(updateAdBanner.pending, (state) => {
        state.loading = true;
        state.createBannerLoading = true;
        state.error = null;
      })
      .addCase(updateAdBanner.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.createBannerLoading = false;
        state.responseData = payload.data;
        if (payload.status) {
          state.message = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(updateAdBanner.rejected, (state, { payload }) => {
        state.loading = false;
        state.createBannerLoading = false;
        state.error = payload || "Failed to edit event";
      });
  },
});

export const {
  setDraggedFileState,
  setVideoPlayingState,
  filterBanner,
  filterSchedule,
  setAdScheduleDialogVisible,
  setAdScheduleModalLoading,
  setSelectedAdSchedule,
  setAdBannerDialogVisible,
  setAdBannerModalLoading,
  setSelectedAdBanner,
  setModalVisible,
  setSelectedMedia,
  setSelectedDroppedFileState,
  setEditItemId,
} = AdvertisementSlice.actions;

export default AdvertisementSlice.reducer;
