import { createSlice } from "@reduxjs/toolkit";

// Function to generate initial seats with unique IDs and visibility
const generateInitialSeats = (rows, columns, seatTypes) => {
  const seats = [];
  let globalId = 1;

  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < columns; j++) {
      row.push({
        id: globalId++,
        rowLabel: String.fromCharCode(65 + i),
        colIndex: j,
        type: "standard",
        price: seatTypes.find((type) => type.id === "standard").basePrice,
        isVisible: true,
        number: j + 1, // Initial number, will be recalculated when visibility changes
      });
    }
    seats.push(row);
  }

  return updateSeatNumbers(seats);
};

// Function to update seat numbers based on visibility
const updateSeatNumbers = (seats) => {
  for (let i = 0; i < seats.length; i++) {
    let visibleSeatCount = 0;
    for (let j = 0; j < seats[i].length; j++) {
      if (seats[i][j].isVisible) {
        visibleSeatCount++;
        seats[i][j].number = visibleSeatCount;
      } else {
        seats[i][j].number = 0;
      }
    }
  }
  return seats;
};

const DEFAULT_SEAT_TYPES = [
  { id: "desabled", label: "Desabled", basePrice: 0, color: "#e5e7eb" },
  { id: "standard", label: "Standard", basePrice: 10.0, color: "#52c41a" },
  { id: "premium", label: "Premium", basePrice: 15.0, color: "#1890ff" },
  { id: "vip", label: "VIP", basePrice: 20.0, color: "#722ed1" },
];

const movieSeatSlice = createSlice({
  name: "movieSeatSlice",
  initialState: {
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
    initializeSeats: (state, action) => {
      const { rows, columns } = action.payload;
      state.seats = generateInitialSeats(rows, columns, state.seatTypes);
    },
    updateSeats: (state, action) => {
      state.seats = action.payload;
    },
    updateSeatsRenumber: (state, action) => {
      state.seats = updateSeatNumbers(action.payload);
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
      const { rowIndex, colIndex, seats } = action.payload;

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

      state.seats = updateSeatNumbers(newSeats);
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
} = movieSeatSlice.actions;

export default movieSeatSlice.reducer;
