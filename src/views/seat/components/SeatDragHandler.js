// src/components/SeatDragHandler.js
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { moveSeat } from 'store/slices/seatSlice';
import { wouldOverlap, validateMultiDragPositions } from 'utils/seatUtils';

const SeatDragHandler = ({ stageRef, tool, scale }) => {
  const dispatch = useDispatch();
  const seats = useSelector((state) => state.seat.seats);
  const selectedSeats = useSelector((state) => state.seat.selectedSeats);

  // Multi-drag state
  const [isDraggingMultiple, setIsDraggingMultiple] = useState(false);
  const [dragStartPositions, setDragStartPositions] = useState([]);
  const [dragStartPoint, setDragStartPoint] = useState(null);

  useEffect(() => {
    // Reset drag state when tool changes
    setIsDraggingMultiple(false);
    setDragStartPositions([]);
    setDragStartPoint(null);
  }, [tool]);

  // Find the clicked seat index
  const findClickedSeat = (x, y) => {
    return seats.findIndex((seat) => {
      const distance = Math.sqrt(
        Math.pow(seat.x - x, 2) + Math.pow(seat.y - y, 2)
      );
      return distance <= 10; // 10 is the radius of the circle
    });
  };

  // Handle single seat drag end
  const handleSeatDragEnd = (index, e) => {
    if (!e || !e.target) return;

    const newX = e.target.x();
    const newY = e.target.y();

    // Check if the new position would overlap with any other seat
    if (!wouldOverlap(newX, newY, seats, [index])) {
      dispatch(
        moveSeat({
          index,
          x: newX,
          y: newY,
        })
      );
    } else {
      // Reset to original position if there would be an overlap
      e.target.x(seats[index].x);
      e.target.y(seats[index].y);
      e.target.getLayer().batchDraw();
    }
  };

  // Handle mouse down for multi-drag
  const handleMouseDown = (e) => {
    if (tool !== 'drag' || selectedSeats.length === 0) return;

    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();

    // Convert to world coordinates
    const worldX = pointerPos.x / scale;
    const worldY = pointerPos.y / scale;

    const clickedSeatIndex = findClickedSeat(worldX, worldY);

    if (clickedSeatIndex !== -1 && selectedSeats.includes(clickedSeatIndex)) {
      // Start multi-drag operation
      setIsDraggingMultiple(true);
      setDragStartPoint({ x: worldX, y: worldY });

      // Store the initial positions of all selected seats
      const startPositions = selectedSeats.map((index) => ({
        index,
        startX: seats[index].x,
        startY: seats[index].y,
      }));
      setDragStartPositions(startPositions);

      // Prevent default to avoid unwanted behavior
      e.evt.preventDefault();
    }
  };

  // Handle mouse move for multi-drag
  const handleMouseMove = (e) => {
    if (!isDraggingMultiple || tool !== 'drag') return;

    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();

    // Convert to world coordinates
    const worldX = pointerPos.x / scale;
    const worldY = pointerPos.y / scale;

    // Calculate the offset from the drag start point
    const deltaX = worldX - dragStartPoint.x;
    const deltaY = worldY - dragStartPoint.y;

    // Update the position of all selected seats
    // Note: This is a visual update only, we'll dispatch to Redux on mouse up
    const layer = stage.findOne("Layer");

    dragStartPositions.forEach(({ index, startX, startY }) => {
      const seatNode = layer.findOne(`#seat-${index}`);
      if (seatNode) {
        seatNode.x(startX + deltaX);
        seatNode.y(startY + deltaY);
        seatNode.getLayer().batchDraw();
      }
    });
  };

  // Handle mouse up to end multi-drag
  const handleMouseUp = (e) => {
    if (!isDraggingMultiple || tool !== 'drag') return;

    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();

    // Convert to world coordinates
    const worldX = pointerPos.x / scale;
    const worldY = pointerPos.y / scale;

    // Calculate the final offset
    const deltaX = worldX - dragStartPoint.x;
    const deltaY = worldY - dragStartPoint.y;

    // Validate the new positions to ensure no overlaps
    const validPositions = validateMultiDragPositions(
      dragStartPositions,
      deltaX,
      deltaY,
      seats,
      selectedSeats
    );

    if (validPositions) {
      // Apply valid movements
      validPositions.forEach(({ index, x, y }) => {
        dispatch(
          moveSeat({
            index,
            x,
            y,
          })
        );
      });
    } else {
      // Reset to original positions if there would be overlaps
      const layer = stage.findOne("Layer");
      dragStartPositions.forEach(({ index, startX, startY }) => {
        const seatNode = layer.findOne(`#seat-${index}`);
        if (seatNode) {
          seatNode.x(startX);
          seatNode.y(startY);
          seatNode.getLayer().batchDraw();
        }
      });
    }

    // Reset the multi-drag state
    setIsDraggingMultiple(false);
    setDragStartPositions([]);
    setDragStartPoint(null);
  };

  return {
    isDraggingMultiple,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleSeatDragEnd
  };
};

export default SeatDragHandler;