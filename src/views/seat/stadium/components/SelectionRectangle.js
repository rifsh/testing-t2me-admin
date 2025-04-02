import React, { useEffect } from "react";
import { Rect } from "react-konva";
import { useDispatch, useSelector } from "react-redux";
import { selectSeats } from "store/slices/seatSlice";

const SelectionRectangle = ({
  selectionRect,
  isSelecting,
  onSelectionEnd,
  scale,
}) => {
  const dispatch = useDispatch();
  const seats = useSelector((state) => state.seat.seats);

  // More robust seat selection method
  const selectSeatsInRectangle = () => {
    if (
      !selectionRect ||
      selectionRect.width < 5 / scale ||
      selectionRect.height < 5 / scale
    )
      return;

    const seatsInRectangle = seats.reduce((indices, seat, index) => {
      const seatInside =
        seat.x >= selectionRect.x &&
        seat.x <= selectionRect.x + selectionRect.width &&
        seat.y >= selectionRect.y &&
        seat.y <= selectionRect.y + selectionRect.height;

      return seatInside ? [...indices, index] : indices;
    }, []);

    dispatch(selectSeats(seatsInRectangle));

    if (onSelectionEnd) {
      onSelectionEnd();
    }
  };

  // Trigger seat selection when selection ends
  useEffect(() => {
    if (!isSelecting && selectionRect) {
      selectSeatsInRectangle();
    }
  }, [isSelecting, selectionRect]);

  // No rectangle to render
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
      strokeWidth={1 / scale} // Adjust stroke width based on scale
    />
  );
};

export default SelectionRectangle;
