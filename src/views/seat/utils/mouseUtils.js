import {
  addSeat,
  moveSeat,
  clearSelection,
  toggleSeatSelection,
} from "store/slices/seatSlice";
import { SeatUtils } from "./seatUtils";

export const createMouseUtils = (
  dispatch,
  seats,
  scale,
  selectedSeats,
  tool
) => {
  return {
    handleStageClick: (e) => {
      // Skip if we're in selection mode or currently selecting or dragging multiple
      if (tool === "select" || e.isSelecting || e.isDraggingMultiple) return;

      const stage = e.target.getStage();
      const pointerPos = stage.getPointerPosition();

      // Convert screen coordinates to world coordinates
      const adjustedX = pointerPos.x / scale;
      const adjustedY = pointerPos.y / scale;

      // Add seat mode
      if (tool === "add") {
        const validPosition = SeatUtils.findValidPosition(
          seats,
          adjustedX,
          adjustedY
        );
        dispatch(addSeat({ x: validPosition.x, y: validPosition.y }));
      }
      // Click select mode
      else if (tool === "clickSelect") {
        const clickedSeatIndex = SeatUtils.findClickedSeat(
          seats,
          adjustedX,
          adjustedY
        );

        if (clickedSeatIndex !== -1) {
          // If holding shift, toggle this seat's selection
          if (e.evt.shiftKey) {
            dispatch(toggleSeatSelection(clickedSeatIndex));
          } else {
            // Otherwise, clear selection and select only this seat
            dispatch(clearSelection());
            dispatch(toggleSeatSelection(clickedSeatIndex));
          }
        } else if (!e.evt.shiftKey) {
          // Clicking on empty space without shift clears selection
          dispatch(clearSelection());
        }
      }
    },

    handleMouseDown: (
      e,
      setSelectionStart,
      setSelectionEnd,
      setIsSelecting,
      setIsDraggingMultiple,
      setDragStartPoint,
      setDragStartPositions,
    ) => {
      if (tool === "select") {
        const stage = e.target.getStage();
        const pointerPos = stage.getPointerPosition();

        // Convert to world coordinates
        const worldX = pointerPos.x / scale;
        const worldY = pointerPos.y / scale;

        setSelectionStart({ x: worldX, y: worldY });
        setSelectionEnd({ x: worldX, y: worldY });
        setIsSelecting(true);

        // Only clear selection if not holding shift
        if (!e.evt.shiftKey) {
          dispatch(clearSelection());
        }
      } else if (tool === "drag" && selectedSeats.length > 0) {
        // Check if we clicked on a selected seat to start multi-drag
        const stage = e.target.getStage();
        const pointerPos = stage.getPointerPosition();

        // Convert to world coordinates
        const worldX = pointerPos.x / scale;
        const worldY = pointerPos.y / scale;

        const clickedSeatIndex = SeatUtils.findClickedSeat(
          seats,
          worldX,
          worldY
        );

        if (
          clickedSeatIndex !== -1 &&
          selectedSeats.includes(clickedSeatIndex)
        ) {
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
      }
    },

    handleMouseMove: (
      e,
      isSelecting,
      isDraggingMultiple,
      selectionStart,
      dragStartPoint,
      setSelectionEnd,
      dragStartPositions
    ) => {
      if (isSelecting && tool === "select") {
        const stage = e.target.getStage();
        const pointerPos = stage.getPointerPosition();

        // Convert to world coordinates
        setSelectionEnd({
          x: pointerPos.x / scale,
          y: pointerPos.y / scale,
        });
      } else if (isDraggingMultiple && tool === "drag") {
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
      }
    },

    handleMouseUp: (
      e,
      isSelecting,
      isDraggingMultiple,
      dragStartPoint,
      dragStartPositions,
      setIsSelecting,
      setIsDraggingMultiple,
      setDragStartPositions,
      setDragStartPoint,
      setSelectionStart,
      setSelectionEnd
    ) => {
      if (isSelecting && tool === "select") {
        setIsSelecting(false);
        // The SelectionRectangle component will handle the actual selection
      } else if (isDraggingMultiple && tool === "drag") {
        const stage = e.target.getStage();
        const pointerPos = stage.getPointerPosition();

        // Convert to world coordinates
        const worldX = pointerPos.x / scale;
        const worldY = pointerPos.y / scale;

        // Calculate the final offset
        const deltaX = worldX - dragStartPoint.x;
        const deltaY = worldY - dragStartPoint.y;

        // Validate the new positions to ensure no overlaps
        const validPositions = SeatUtils.validateMultiDragPositions(
          seats,
          selectedSeats,
          dragStartPositions,
          deltaX,
          deltaY
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
      }
    },

    handleSeatDragEnd: (index, e) => {
      if (!e || !e.target) return;

      const newX = e.target.x();
      const newY = e.target.y();

      // Check if the new position would overlap with any other seat
      if (!SeatUtils.wouldOverlap(seats, newX, newY, [index])) {
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
    },
  };
};
