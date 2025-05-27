import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DEFAULT_SEAT_TYPES } from "constants/SeatTypes";
import MovieSeatService from "services/MovieSeatService";
import Utils from "utils";
import { flatToNested } from "utils/seatUtils";
export const initialState = {
  loading: false,
  error: null,
  message: null,
  responseData: null,
  responseMessage: null,
  editable_status: null,
  validationStatus: false,
  pagination: { size: 10, page: 1 },
  editSeatItemId: null,
  responseImpactData: null,
  warningPagination: { size: 10, page: 1 },
  submitPagination: { size: 10, page: 1 },
  selectedSubmitItem: null,
  selectedSeatStructure: null,
  allSeats: [],
  allTrackrequestSeats: [],
  TrackrequestSeatsDetails: [],
  singleSeatStructure: null,

  seatDialogVisible: false,
  seatModalLoading: false,

  //seat state
  rows: 8,
  columns: 12,
  mode: "seatType",
  selectedSeatType: "standard",
  selectedSeats: [],
  isDragging: false,
  startSeat: null,
  currentSeat: null,
  seats: [],
  usedSeatTypes: [],
  seatTypes: DEFAULT_SEAT_TYPES,
  zoomLevel: 100,
};
export const addSeatStructure = createAsyncThunk(
  "movieSeat/add",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await MovieSeatService.addSeatStructure(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error creating seat structure"
      );
    }
  }
);

export const editSeatStructure = createAsyncThunk(
  "movieSeat/edit",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await MovieSeatService.editSeatStructure(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error updating seat structure"
      );
    }
  }
);

export const makeEditSeatStructure = createAsyncThunk(
  "movieSeat/makeEditSeatStructure",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await MovieSeatService.makeEditSeatStructure(data, action);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error updating seat structure"
      );
    }
  }
);

export const editSeatStructureStatus = createAsyncThunk(
  "movieSeat/editStatus",
  async ({ data, action, pageData }, { rejectWithValue }) => {
    try {
      const response = await MovieSeatService.editSeatStructureStatus(
        data,
        action,
        pageData
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error updating seat structure status"
      );
    }
  }
);

export const getMovieSeatStructureDetails = createAsyncThunk(
  "movieSeat/getDetails",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await MovieSeatService.getSeatStructureDetails(pageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching seat structure details"
      );
    }
  }
);

export const getAllSeatStructures = createAsyncThunk(
  "movieSeat/getAllSeats",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await MovieSeatService.getAllSeatStructures(pageData);
      return response.data[0];
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching all seat structure"
      );
    }
  }
);

export const getAllTrackrequestSeatStructures = createAsyncThunk(
  "movieSeat/getAllTrackrequestSeatStructures",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await MovieSeatService.getAllTrackrequestSeatStructures(
        pageData
      );
      return response.data[0];
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching all seat structure"
      );
    }
  }
);

export const addEventSeatStructure = createAsyncThunk(
  "eventSeat/add",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await MovieSeatService.addEventSeatStructure(
        data,
        action
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error creating seat structure"
      );
    }
  }
);

export const editEventSeatStructure = createAsyncThunk(
  "eventSeat/edit",
  async ({ data, action }, { rejectWithValue }) => {
    try {
      const response = await MovieSeatService.editEventSeatStructure(
        data,
        action
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error updating seat structure"
      );
    }
  }
);

export const editEventSeatStructureStatus = createAsyncThunk(
  "eventSeat/editStatus",
  async ({ data, action, pageData }, { rejectWithValue }) => {
    try {
      const response = await MovieSeatService.editEventSeatStructureStatus(
        data,
        action,
        pageData
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error updating seat structure status"
      );
    }
  }
);

export const getEventSeatStructureDetails = createAsyncThunk(
  "eventSeat/getDetails",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await MovieSeatService.getEventSeatStructureDetails(
        pageData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching seat structure details"
      );
    }
  }
);

export const getTrackrequestSeatStructuresDetails = createAsyncThunk(
  "eventSeat/getTrackrequestSeatStructuresDetails",
  async (pageData, { rejectWithValue }) => {
    try {
      const response =
        await MovieSeatService.getTrackrequestSeatStructuresDetails(pageData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching seat structure details"
      );
    }
  }
);

export const getEventAllSeatStructures = createAsyncThunk(
  "eventSeat/getAllSeats",
  async (pageData, { rejectWithValue }) => {
    try {
      const response = await MovieSeatService.getEventAllSeatStructures(
        pageData
      );
      return response.data[0];
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Error fetching all seat structure"
      );
    }
  }
);

const movieSeatSlice = createSlice({
  name: "movieSeatSlice",
  initialState,

  reducers: {
    setSelectedSeatStructure: (state, action) => {
      state.selectedSeatStructure = action.payload;
    },
    setEditSeatItemId: (state, action) => {
      state.editSeatItemId = action.payload;
    },
    setSeatDialogVisible: (state, action) => {
      state.seatDialogVisible = action.payload;
    },
    setSeatModalLoading: (state, action) => {
      state.seatModalLoading = action.payload;
    },
    initializeSeats: (state, action) => {
      const { rows, columns } = action.payload;
      state.seats = Utils.generateInitialSeats(rows, columns, state.seatTypes);
      state.usedSeatTypes = [state.seatTypes[1]];
    },
    loadSeatData: (state, action) => {
      const { seats, seatTypes } = action.payload;
      state.seats = seats || state.seats;
      state.seatTypes = state.seatTypes;
      state.usedSeatTypes = seatTypes || state.seatTypes;
      if (seats) {
        state.rows = seats.length;
        state.columns = seats[0]?.length || 0;
      }
    },
    updateSeats: (state, action) => {
      state.seats = action.payload;
    },
    updateSeatsRenumber: (state, action) => {
      state.seats = Utils.updateSeatNumbers(action.payload);
    },
    setRows: (state, action) => {
      state.rows = Math.min(Math.max(action.payload, 1), 40);
    },
    setColumns: (state, action) => {
      state.columns = Math.min(Math.max(action.payload, 1), 50);
    },
    setMode: (state, action) => {
      state.mode = action.payload;
    },
    setSelectedSeatType: (state, action) => {
      state.selectedSeatType = action.payload;
    },
    startSelection: (state, action) => {
      const { rowIndex, colIndex } = action.payload;
      state.isDragging = true;
      state.startSeat = { row: rowIndex, col: colIndex };
      state.currentSeat = { row: rowIndex, col: colIndex };
      state.selectedSeats = [`${rowIndex}-${colIndex}`];
    },
    updateSelection: (state, action) => {
      const { rowIndex, colIndex } = action.payload;

      if (!state.isDragging) return;

      state.currentSeat = { row: rowIndex, col: colIndex };

      const minRow = Math.min(state.startSeat.row, rowIndex);
      const maxRow = Math.max(state.startSeat.row, rowIndex);
      const minCol = Math.min(state.startSeat.col, colIndex);
      const maxCol = Math.max(state.startSeat.col, colIndex);

      const newSelected = [];
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          newSelected.push(`${r}-${c}`);
        }
      }

      state.selectedSeats = newSelected;
    },
    endSelection: (state) => {
      state.isDragging = false;
    },
    clearSelection: (state) => {
      state.selectedSeats = [];
      state.isDragging = false;
      state.startSeat = null;
      state.currentSeat = null;
    },
    addSeatType: (state, action) => {
      const { id, label, basePrice, color } = action.payload;

      if (!state.seatTypes.some((type) => type.id === id)) {
        state.seatTypes.push({ id, label, basePrice, color });
      }
    },
    updateSeatType: (state, action) => {
      const { id, label, basePrice, color } = action.payload;
      const typeIndex = state.seatTypes.findIndex((type) => type.id === id);
      if (typeIndex !== -1) {
        state.seatTypes[typeIndex] = { id, label, basePrice, color };
      }
    },
    removeSeatType: (state, action) => {
      const typeId = action.payload;
      state.seatTypes = state.seatTypes.filter((type) => type.id !== typeId);

      // Need at least one seat type
      if (state.seatTypes.length === 0) {
        state.seatTypes.push(DEFAULT_SEAT_TYPES[0]);
      }

      // If removed type was selected, select first available
      if (state.selectedSeatType === typeId) {
        state.selectedSeatType = state.seatTypes[0].id;
      }
    },
    toggleSeatVisibility: (state, action) => {
      const selectedSeats = action.payload.selectedSeats;
      const newSeats = JSON.parse(JSON.stringify(state.seats));

      selectedSeats.forEach((seatKey) => {
        const [rowIndex, colIndex] = seatKey.split("-").map(Number);
        newSeats[rowIndex][colIndex].isVisible =
          !newSeats[rowIndex][colIndex].isVisible;
      });

      state.seats = Utils.updateSeatNumbers(newSeats);
    },
    applySeatType: (state, action) => {
      const { selectedSeats, selectedSeatType, seatTypes } = action.payload;
      const newSeats = JSON.parse(JSON.stringify(state.seats));

      selectedSeats.forEach((seatKey) => {
        const [rowIndex, colIndex] = seatKey.split("-").map(Number);
        newSeats[rowIndex][colIndex].type = selectedSeatType;

        // Update price based on seat type
        const seatType = seatTypes.find((type) => type.id === selectedSeatType);
        if (seatType) {
          newSeats[rowIndex][colIndex].price = seatType.basePrice;
        }
      });

      state.seats = newSeats;

      // Update used seat types
      state.usedSeatTypes = Utils.updateUsedSeatTypes(newSeats, seatTypes);
    },
    updateUsedSeatTypesState: (state) => {
      state.usedSeatTypes = Utils.updateUsedSeatTypes(
        state.seats,
        state.seatTypes
      );
    },
    // Zoom controls
    setZoomLevel: (state, action) => {
      state.zoomLevel = action.payload;
    },
    zoomIn: (state) => {
      state.zoomLevel = Math.min(state.zoomLevel + 10, 200);
    },
    zoomOut: (state) => {
      state.zoomLevel = Math.max(state.zoomLevel - 10, 50);
    },
    resetZoom: (state) => {
      state.zoomLevel = 100;
    },
    resetState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add seat structure cases
      .addCase(addSeatStructure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSeatStructure.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(addSeatStructure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.data || "Error creating seat structure";
      })

      // Edit seat structure cases
      .addCase(editSeatStructure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editSeatStructure.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        state.responseData = payload.data;
        if (payload.status) {
          state.message = payload.status.message;
          state.responseMessage = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(editSeatStructure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.data || "Error updating seat structure";
      })
      .addCase(makeEditSeatStructure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(makeEditSeatStructure.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        state.responseData = payload.data;
        if (payload.status) {
          state.message = payload.status.message;
          state.responseMessage = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(makeEditSeatStructure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.data || "Error updating seat structure";
      })

      // Edit seat structure status cases
      .addCase(editSeatStructureStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editSeatStructureStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;

        if (payload.status) {
          state.message = payload.status.message;
          state.responseMessage = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(editSeatStructureStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.data || "Error updating seat structure status";
      })

      // Get seat structure details cases
      .addCase(getMovieSeatStructureDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMovieSeatStructureDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const data = action.payload[0];
        const restructuredData = {
          ...data,
          seat_data: {
            seats: flatToNested(data.seat_data.seats),
            seatTypes: data.seat_data.seatTypes,
          },
        };
        console.log(restructuredData, "restructuredData");
        state.singleSeatStructure = restructuredData;
      })
      .addCase(getMovieSeatStructureDetails.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.data || "Error fetching seat structure details";
      })
      .addCase(getAllSeatStructures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllSeatStructures.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.allSeats = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(getAllSeatStructures.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.data || "Error fetching seat all structure";
      })
      .addCase(addEventSeatStructure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addEventSeatStructure.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(addEventSeatStructure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.data || "Error creating seat structure";
      })

      // Edit seat structure cases
      .addCase(editEventSeatStructure.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editEventSeatStructure.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.error = null;
        state.responseData = payload.data;
        if (payload.status) {
          state.message = payload.status.message;
          state.responseMessage = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(editEventSeatStructure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.data || "Error updating seat structure";
      })

      // Edit seat structure status cases
      .addCase(editEventSeatStructureStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editEventSeatStructureStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.responseData = payload.data;

        if (payload.status) {
          state.message = payload.status.message;
          state.responseMessage = payload.status.message;
          state.responseImpactData = payload.status.data?.active_schedules;
          state.editable_status = payload.status?.editable_status;
          state.warningPagination = payload.status?.data?.active_schedules;
        }
      })
      .addCase(editEventSeatStructureStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.data || "Error updating seat structure status";
      })

      // Get seat structure details cases
      .addCase(getEventSeatStructureDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEventSeatStructureDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const data = action.payload[0];
        const restructuredData = {
          ...data,
          seat_data: {
            seats: flatToNested(data.seat_data.seats),
            seatTypes: data.seat_data.seatTypes,
          },
        };
        console.log(restructuredData, "restructuredData");
        state.singleSeatStructure = restructuredData;
      })
      .addCase(getEventSeatStructureDetails.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.data || "Error fetching seat structure details";
      })
      .addCase(getEventAllSeatStructures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEventAllSeatStructures.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.allSeats = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(getEventAllSeatStructures.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.data || "Error fetching seat all structure";
      })
      .addCase(getAllTrackrequestSeatStructures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllTrackrequestSeatStructures.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.allTrackrequestSeats = action.payload.items;
        state.pagination = action.payload;
      })
      .addCase(getAllTrackrequestSeatStructures.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.data || "Error fetching seat all structure";
      })
      .addCase(getTrackrequestSeatStructuresDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getTrackrequestSeatStructuresDetails.fulfilled,
        (state, { payload }) => {
          state.loading = false;
          state.error = null;
          const data = payload[0];
          console.log("seatdatas", data)
          const restructuredData = {
            ...data,
            seat_data: {
              seats: flatToNested(data?.seat_data?.seats),
              seatTypes: data?.seat_data?.seatTypes,
            },
          };
          state.TrackrequestSeatsDetails = restructuredData;
          state.singleSeatStructure = restructuredData;
          state.pagination = payload;
        }
      )
      .addCase(
        getTrackrequestSeatStructuresDetails.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload?.data || "Error fetching seat all structure";
        }
      );
  },
});

export const {
  setSelectedSeatStructure,
  setEditSeatItemId,
  setSeatDialogVisible,
  setSeatModalLoading,
  initializeSeats,
  loadSeatData,
  updateSeats,
  updateSeatsRenumber,
  setRows,
  setColumns,
  setMode,
  setSelectedSeatType,
  startSelection,
  updateSelection,
  endSelection,
  clearSelection,
  addSeatType,
  updateSeatType,
  removeSeatType,
  toggleSeatVisibility,
  applySeatType,
  setZoomLevel,
  zoomIn,
  zoomOut,
  resetZoom,
  resetState,
  updateUsedSeatTypesState,
} = movieSeatSlice.actions;

export default movieSeatSlice.reducer;
