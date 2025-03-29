import { createSlice } from "@reduxjs/toolkit";
import {
  generateInitialSeats,
  updateSeatNumbers,
} from "views/seat/movie/utils/seatUtils";

const moveSeatSlice = createSlice({
  name: "moveSeatSlice",
  initialState: {
    rows: 5,
    columns: 10,
    mode: "seatType",
    selectedSeatType: "standard",
    selectedCategory: "front",
    selectedSeats: [], // Changed from Set to array for consistency
    isDragging: false,
    startSeat: null,
    currentSeat: null,
    seats: [],
  },
  reducers: {
    initializeSeats: (state, action) => {
      const { rows, columns } = action.payload;
      state.seats = generateInitialSeats(rows, columns);
    },
    updateSeats: (state, action) => {
      state.seats = action.payload;
    },
    updateSeatsRenumber: (state, action) => {
      state.seats = updateSeatNumbers(action.payload);
    },
    setRows: (state, action) => {
      state.rows = Math.min(Math.max(action.payload, 1), 30);
    },
    setColumns: (state, action) => {
      state.columns = Math.min(Math.max(action.payload, 1), 30);
    },
    setMode: (state, action) => {
      state.mode = action.payload;
    },
    setSelectedSeatType: (state, action) => {
      state.selectedSeatType = action.payload;
      state.mode = "seatType";
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.mode = "category";
    },
    startSelection: (state, action) => {
      const { rowIndex, colIndex } = action.payload;
      state.isDragging = true;
      state.startSeat = { row: rowIndex, col: colIndex };
      state.currentSeat = { row: rowIndex, col: colIndex };

      // Clear and set initial selection as array
      state.selectedSeats = [`${rowIndex}-${colIndex}`];
    },
    updateSelection: (state, action) => {
      const { rowIndex, colIndex, seats } = action.payload;

      if (!state.isDragging) return;

      state.currentSeat = { row: rowIndex, col: colIndex };

      // Calculate selection rectangle
      const minRow = Math.min(state.startSeat.row, rowIndex);
      const maxRow = Math.max(state.startSeat.row, rowIndex);
      const minCol = Math.min(state.startSeat.col, colIndex);
      const maxCol = Math.max(state.startSeat.col, colIndex);

      // Build new selection array
      const newSelected = [];
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          // Skip hidden seats
          if (seats[r][c].type !== "hidden") {
            newSelected.push(`${r}-${c}`);
          }
        }
      }

      state.selectedSeats = newSelected;
    },
    endSelection: (state) => {
      state.isDragging = false;
    },
    clearSelection: (state) => {
      state.selectedSeats = []; // Changed from Set to empty array
      state.isDragging = false;
      state.startSeat = null;
      state.currentSeat = null;
    },
  },
});

export const {
  setRows,
  initializeSeats,
  updateSeats,
  updateSeatsRenumber,
  setColumns,
  setMode,
  setSelectedSeatType,
  setSelectedCategory,
  startSelection,
  updateSelection,
  endSelection,
  clearSelection,
} = moveSeatSlice.actions;
export default moveSeatSlice.reducer;
