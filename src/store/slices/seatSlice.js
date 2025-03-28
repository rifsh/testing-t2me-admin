import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  seats: [],
  scale: 1,
  selectedSeats: [],
  showGrid: false,
  drawings: [],
  categories: [
    { id: "standard", name: "Standard", color: "#ffffff" },
    { id: "premium", name: "Premium", color: "#ffe0b2" },
    { id: "vip", name: "VIP", color: "#ffccbc" },
  ],
  activeCategory: "standard",
  past: [],
  present: null,
  future: [],
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
        label: `${category.name.charAt(0)}`,
        // label: `${category.name.charAt(0)}${seatNumber}`,
      });
    },
    moveSeat: (state, action) => {
      const { index, x, y } = action.payload;
      if (index >= 0 && index < state.seats.length) {
        state.seats[index] = { ...state.seats[index], x, y };
      }
    },
    zoomIn: (state) => {
      // Limit zoom in to 5x
      state.scale = Math.min(state.scale * 1.1, 5);
    },
    zoomOut: (state) => {
      // Limit zoom out to 0.2x
      state.scale = Math.max(state.scale / 1.1, 0.2);
    },
    fitToScreen: (state) => {
      // Reset to default zoom
      state.scale = 1;
    },
    selectSeats: (state, action) => {
      state.selectedSeats = action.payload;
    },
    clearSelection: (state) => {
      state.selectedSeats = [];
    },moveSeatsByOffset: (state, action) => {
      const { dx, dy } = action.payload;
      
      // Move all seats by the specified offset
      state.seats = state.seats.map(seat => ({
        ...seat,
        x: seat.x + dx,
        y: seat.y + dy
      }));
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
    alignSeats: (state, action) => {
      const { alignType } = action.payload;

      // Ensure we have at least 2 selected seats to align
      if (state.selectedSeats.length < 2) return;

      // Get the selected seats
      const selectedSeatObjects = state.selectedSeats.map(
        (index) => state.seats[index]
      );

      switch (alignType) {
        case "left": {
          // Align to the leftmost x-coordinate
          const leftmostX = Math.min(
            ...selectedSeatObjects.map((seat) => seat.x)
          );
          state.selectedSeats.forEach((index) => {
            state.seats[index].x = leftmostX;
          });
          break;
        }
        case "center": {
          // Align to the average x-coordinate
          const avgX =
            selectedSeatObjects.reduce((sum, seat) => sum + seat.x, 0) /
            selectedSeatObjects.length;
          state.selectedSeats.forEach((index) => {
            state.seats[index].x = avgX;
          });
          break;
        }
        case "right": {
          // Align to the rightmost x-coordinate
          const rightmostX = Math.max(
            ...selectedSeatObjects.map((seat) => seat.x)
          );
          state.selectedSeats.forEach((index) => {
            state.seats[index].x = rightmostX;
          });
          break;
        }
        case "top": {
          // Align to the topmost y-coordinate
          const topmostY = Math.min(
            ...selectedSeatObjects.map((seat) => seat.y)
          );
          state.selectedSeats.forEach((index) => {
            state.seats[index].y = topmostY;
          });
          break;
        }
        case "bottom": {
          // Align to the bottommost y-coordinate
          const bottommostY = Math.max(
            ...selectedSeatObjects.map((seat) => seat.y)
          );
          state.selectedSeats.forEach((index) => {
            state.seats[index].y = bottommostY;
          });
          break;
        }
        case "distribute": {
          // Distribute selected seats evenly along x-axis
          if (state.selectedSeats.length < 3) return;

          // Sort selected seats by x-coordinate
          const sortedIndices = [...state.selectedSeats].sort(
            (a, b) => state.seats[a].x - state.seats[b].x
          );

          // Get first and last seat x-coordinates
          const firstX = state.seats[sortedIndices[0]].x;
          const lastX = state.seats[sortedIndices[sortedIndices.length - 1]].x;

          // Calculate even spacing
          const spacing = (lastX - firstX) / (sortedIndices.length - 1);

          // Redistribute x-coordinates
          sortedIndices.forEach((index, position) => {
            state.seats[index].x = firstX + position * spacing;
          });
          break;
        }
        default:
          return;
      }
    },
    duplicateSelectedSeats: (state) => {
      if (state.selectedSeats.length === 0) return;

      // Create duplicates with slight offset
      const duplicatedSeats = state.selectedSeats.map((index) => {
        const originalSeat = state.seats[index];
        const duplicatedSeat = {
          ...originalSeat,
          x: originalSeat.x + 20, // Offset by 20 pixels
          y: originalSeat.y + 20,
          label: `${originalSeat.label}`, // Modify label to indicate it's a copy
        };
        return duplicatedSeat;
      });

      // Add duplicated seats to the state
      state.seats.push(...duplicatedSeats);

      // Update selected seats to the new duplicates
      state.selectedSeats = duplicatedSeats.map((seat) =>
        state.seats.indexOf(seat)
      );
    },
    addDrawing: (state, action) => {
      state.drawings.push(action.payload);
    },
    clearDrawings: (state) => {
      state.drawings = [];
    },
    deleteDrawing: (state, action) => {
      state.drawings = state.drawings.filter(
        (_, index) => index !== action.payload
      );
    },
    updateDrawing: (state, action) => {
      const { index, updates } = action.payload;
      if (index >= 0 && index < state.drawings.length) {
        // Merge the updates with the existing drawing
        state.drawings[index] = {
          ...state.drawings[index],
          ...updates,
        };
      }
    },
    updateDrawingColor: (state, action) => {
      const { index, color, fill } = action.payload;
      if (index >= 0 && index < state.drawings.length) {
        state.drawings[index] = {
          ...state.drawings[index],
          color,
          fill: fill ? color : state.drawings[index].fill,
        };
      }
    },
    saveState: (state) => {
      // Create a snapshot of the current state
      const stateCopy = {
        seats: [...state.seats],
        scale: state.scale,
        selectedSeats: [...state.selectedSeats],
        showGrid: state.showGrid,
        drawings: [...state.drawings],
        categories: [...state.categories],
        activeCategory: state.activeCategory,
      };

      // Add current state to past if it's not the first state
      if (state.present !== null) {
        state.past.push(state.present);
      }

      // Set current state as present and clear future
      state.present = stateCopy;
      state.future = [];

      // Limit history to prevent memory issues
      if (state.past.length > 20) {
        state.past.shift();
      }
    },
    undo: (state) => {
      // If no past states, do nothing
      if (state.past.length === 0) return;

      // Move current state to future
      state.future.unshift(state.present);

      // Get the last state from past and make it present
      const previousState = state.past.pop();
      state.present = previousState;

      // Restore state properties
      state.seats = [...previousState.seats];
      state.scale = previousState.scale;
      state.selectedSeats = [...previousState.selectedSeats];
      state.showGrid = previousState.showGrid;
      state.drawings = [...previousState.drawings];
      state.categories = [...previousState.categories];
      state.activeCategory = previousState.activeCategory;
    },
    redo: (state) => {
      // If no future states, do nothing
      if (state.future.length === 0) return;

      // Move current state to past
      state.past.push(state.present);

      // Get the first state from future and make it present
      const nextState = state.future.shift();
      state.present = nextState;

      // Restore state properties
      state.seats = [...nextState.seats];
      state.scale = nextState.scale;
      state.selectedSeats = [...nextState.selectedSeats];
      state.showGrid = nextState.showGrid;
      state.drawings = [...nextState.drawings];
      state.categories = [...nextState.categories];
      state.activeCategory = nextState.activeCategory;
    },
    resetState: (state) => {
      // Reset to initial state, keeping history
      const resetState = { ...initialState };

      // Save current state to past before resetting
      if (state.present !== null) {
        state.past.push(state.present);
      }

      state.present = resetState;
      state.future = [];
      state.seats = resetState.seats;
      state.scale = resetState.scale;
      state.selectedSeats = resetState.selectedSeats;
      state.showGrid = resetState.showGrid;
      state.drawings = resetState.drawings;
      state.categories = resetState.categories;
      state.activeCategory = resetState.activeCategory;
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
  alignSeats,
  duplicateSelectedSeats,
  addDrawing,
  clearDrawings,
  deleteDrawing,  moveSeatsByOffset,
  updateDrawing,
  updateDrawingColor,
  saveState,
  undo,
  redo,
  resetState,
} = seatSlice.actions;

export const getAllSeats = (state) => state.seat.seats;
export const getSelectedSeats = (state) => state.seat.selectedSeats;
export const getActiveCategory = (state) => state.seat.activeCategory;
export const getScale = (state) => state.seat.scale;
export const getShowGrid = (state) => state.seat.showGrid;

export default seatSlice.reducer;
