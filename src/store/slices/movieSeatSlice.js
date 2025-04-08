import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DEFAULT_SEAT_TYPES } from "constants/SeatTypes";
import MovieSeatService from "services/MovieSeatService";
import Utils from "utils";

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

export const getSeatStructureDetails = createAsyncThunk(
  "movieSeat/getDetails",
  async (id, { rejectWithValue }) => {
    try {
      const response = await MovieSeatService.getSeatStructureDetails(id);
      return response;
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
        error.response?.data || "Error fetching seat structure details"
      );
    }
  }
);

const movieSeatSlice = createSlice({
  name: "movieSeatSlice",
  initialState: {
    loading: false,
    error: null,
    message: null,
    responseData: null,
    responseMessage: null,
    editable_status: null,
    editItemId: null,
    responseImpactData: null,
    warningPagination: { size: 10, page: 1 },
    submitPagination: { size: 10, page: 1 },
    selectedSubmitItem: null,
    selectedSeatStructure: null,
    allSeats: [],
    validationStatus: false,
    pagination: { size: 10, page: 1 },

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
    seatTypes: DEFAULT_SEAT_TYPES,
    zoomLevel: 100,
  },

  reducers: {
    setSelectedSeatStructure: (state, action) => {
      state.selectedSeatStructure = action.payload;
    },
    initializeSeats: (state, action) => {
      const { rows, columns } = action.payload;
      state.seats = Utils.generateInitialSeats(rows, columns, state.seatTypes);
    },
    loadSeatData: (state, action) => {
      const { seats, seatTypes } = action.payload;
      state.seats = seats || state.seats;
      state.seatTypes = seatTypes || state.seatTypes;
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
    resetState: (state) => {
      state.responseData = null;
      state.responseMessage = null;
      state.selectedSubmitItem = null;
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
      .addCase(editSeatStructure.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.responseData = action.payload.data;
        state.responseMessage = action.payload.status.message;
      })
      .addCase(editSeatStructure.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.data || "Error updating seat structure";
      })

      // Get seat structure details cases
      .addCase(getSeatStructureDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSeatStructureDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        const seatStructure = action.payload.data;
        state.selectedSeatStructure = seatStructure;

        // Load seat data if available
        if (seatStructure?.seat_data) {
          state.seats = seatStructure.seat_data.seats || state.seats;
          state.seatTypes =
            seatStructure.seat_data.seatTypes || state.seatTypes;
          state.rows = seatStructure.total_row || state.rows;
          state.columns = seatStructure.total_column || state.columns;
        }
      })
      .addCase(getSeatStructureDetails.rejected, (state, action) => {
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
          action.payload?.data || "Error fetching seat structure details";
      });
  },
});

export const {
  setSelectedSeatStructure,
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
} = movieSeatSlice.actions;

export default movieSeatSlice.reducer;
