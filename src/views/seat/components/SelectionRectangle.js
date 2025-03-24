import React, { useEffect } from "react";
import { Rect } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import { selectSeats } from "store/slices/seatSlice";

const SelectionRectangle = ({ selectionRect, isSelecting, onSelectionEnd }) => {
  const dispatch = useDispatch();
  const seats = useSelector((state) => state.seat.seats);
  const selectedSeats = useSelector((state) => state.seat.selectedSeats);
  
  // Function to select seats within rectangle
  const selectSeatsInRectangle = () => {
    if (!selectionRect || selectionRect.width < 5 || selectionRect.height < 5) return;
    
    // Find seats that are within the selection rectangle
    const seatsInRectangle = seats.reduce((indices, seat, index) => {
      if (
        seat.x >= selectionRect.x &&
        seat.x <= selectionRect.x + selectionRect.width &&
        seat.y >= selectionRect.y &&
        seat.y <= selectionRect.y + selectionRect.height
      ) {
        indices.push(index);
      }
      return indices;
    }, []);
    
    // Dispatch the action to select these seats
    dispatch(selectSeats(seatsInRectangle));
    
    // Notify parent that selection is complete
    if (onSelectionEnd) {
      onSelectionEnd();
    }
  };
  
  // When selection ends, select the seats in the rectangle
  useEffect(() => {
    if (!isSelecting && selectionRect) {
      selectSeatsInRectangle();
    }
  }, [isSelecting, selectionRect]);

  // Don't render anything if there's no rectangle
  if (!selectionRect) {
    return null;
  }

  return (
    <Rect
      x={selectionRect.x}
      y={selectionRect.y}
      width={selectionRect.width}
      height={selectionRect.height}
      fill="rgba(0, 161, 255, 0.3)"
      stroke="rgba(0, 161, 255, 0.8)"
      strokeWidth={1}
    />
  );
};

export default SelectionRectangle;