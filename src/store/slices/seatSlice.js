import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  seats: [],
  scale: 1,
  selectedSeats: [],
  showGrid: false,
  categories: [
    { id: "standard", name: "Standard", color: "#ffffff" },
    { id: "premium", name: "Premium", color: "#ffe0b2" },
    { id: "vip", name: "VIP", color: "#ffccbc" },
  ],
  activeCategory: "standard",
};

const seatSlice = createSlice({
  name: "seat",
  initialState,
  reducers: {
    addSeat: (state, action) => {
      const categoryId = action.payload.categoryId || state.activeCategory;
      const category = state.categories.find((cat) => cat.id === categoryId);
      const seatNumber =
        state.seats.filter((s) => s.categoryId === categoryId).length + 1;

      state.seats.push({
        ...action.payload,
        categoryId,
        seatNumber,
        label: `${category.name.charAt(0)}${seatNumber}`,
      });
    },
    moveSeat: (state, action) => {
      const { index, x, y } = action.payload;
      if (index >= 0 && index < state.seats.length) {
        state.seats[index] = { ...state.seats[index], x, y };
      }
    },
    zoomIn: (state) => {
      state.scale = Math.min(state.scale + 0.1, 3);
    },
    zoomOut: (state) => {
      state.scale = Math.max(state.scale - 0.1, 0.5);
    },
    fitToScreen: (state) => {
      state.scale = 1;
    },
    selectSeats: (state, action) => {
      state.selectedSeats = action.payload;
    },
    clearSelection: (state) => {
      state.selectedSeats = [];
    },
    toggleSeatSelection: (state, action) => {
      const seatIndex = action.payload;
      const selectionIndex = state.selectedSeats.indexOf(seatIndex);

      if (selectionIndex === -1) {
        // Add to selection
        state.selectedSeats.push(seatIndex);
      } else {
        // Remove from selection
        state.selectedSeats.splice(selectionIndex, 1);
      }
    },
    deleteSelectedSeats: (state) => {
      if (state.selectedSeats.length === 0) return;

      // Create a new array without the selected seats
      const newSeats = state.seats.filter(
        (_, index) => !state.selectedSeats.includes(index)
      );

      state.seats = newSeats;
      state.selectedSeats = [];
    },
    toggleGrid: (state) => {
      state.showGrid = !state.showGrid;
    },
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
    },
    addCategory: (state, action) => {
      const { name, color } = action.payload;
      const id = name.toLowerCase().replace(/\s+/g, "-");

      // Check if category already exists
      if (!state.categories.some((cat) => cat.id === id)) {
        state.categories.push({ id, name, color });
      }
    },
    updateCategory: (state, action) => {
      const { id, name, color } = action.payload;
      const index = state.categories.findIndex((cat) => cat.id === id);

      if (index !== -1) {
        state.categories[index] = { id, name, color };
      }
    },
    deleteCategory: (state, action) => {
      const categoryId = action.payload;
      // Don't delete if it's the only category
      if (state.categories.length <= 1) return;

      state.categories = state.categories.filter(
        (cat) => cat.id !== categoryId
      );

      // If the active category was deleted, set the first available category as active
      if (state.activeCategory === categoryId) {
        state.activeCategory = state.categories[0].id;
      }

      // Update seats of the deleted category to the active category
      state.seats = state.seats.map((seat) => {
        if (seat.categoryId === categoryId) {
          return { ...seat, categoryId: state.activeCategory };
        }
        return seat;
      });
    },
    updateSeatCategory: (state, action) => {
      const { seatIndices, categoryId } = action.payload;
      const category = state.categories.find((cat) => cat.id === categoryId);

      if (!category) return;

      seatIndices.forEach((index) => {
        if (index >= 0 && index < state.seats.length) {
          // Update the category and renumber the seat
          const seatNumber =
            state.seats.filter((s) => s.categoryId === categoryId).length + 1;
          state.seats[index] = {
            ...state.seats[index],
            categoryId,
            seatNumber,
            label: `${category.name.charAt(0)}${seatNumber}`,
          };
        }
      });
    },
  },
});

export const {
  addSeat,
  moveSeat,
  zoomIn,
  zoomOut,
  fitToScreen,
  selectSeats,
  clearSelection,
  toggleSeatSelection,
  deleteSelectedSeats,
  toggleGrid,
  setActiveCategory,
  addCategory,
  updateCategory,
  deleteCategory,
  updateSeatCategory,
} = seatSlice.actions;

export const getAllSeats = (state) => state.seat.seats;
export const getSelectedSeats = (state) => state.seat.selectedSeats;
export const getActiveCategory = (state) => state.seat.activeCategory;
export const getScale = (state) => state.seat.scale;
export const getShowGrid = (state) => state.seat.showGrid;

export default seatSlice.reducer;
