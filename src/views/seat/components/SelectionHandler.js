// src/components/SelectionHandler.js
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { clearSelection, toggleSeatSelection } from 'store/slices/seatSlice';
import { findClickedSeat } from 'utils/seatUtils';

const SelectionHandler = ({ seats, tool, scale }) => {
  const dispatch = useDispatch();
  
  // Selection rectangle state
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    // Reset selection state when tool changes
    setSelectionStart(null);
    setSelectionEnd(null);
    setIsSelecting(false);
  }, [tool]);

  // Handle stage click for seat selection
  const handleStageClick = (e) => {
    // Skip if we're in selection mode or currently selecting
    if (tool !== 'clickSelect' || isSelecting) return;

    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();

    // Convert screen coordinates to world coordinates
    const adjustedX = pointerPos.x / scale;
    const adjustedY = pointerPos.y / scale;

    const clickedSeatIndex = findClickedSeat(adjustedX, adjustedY, seats);

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
  };

  // Selection rectangle start
  const handleMouseDown = (e) => {
    if (tool !== 'select') return;
    
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
  };

  // Update selection rectangle as mouse moves
  const handleMouseMove = (e) => {
    if (!isSelecting || tool !== 'select') return;
    
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();

    // Convert to world coordinates
    setSelectionEnd({
      x: pointerPos.x / scale,
      y: pointerPos.y / scale,
    });
  };

  // End selection and apply changes
  const handleMouseUp = () => {
    if (isSelecting && tool === 'select') {
      setIsSelecting(false);
      // The SelectionRectangle component will handle the actual selection
    }
  };

  // Called when selection is complete to reset state
  const handleSelectionEnd = () => {
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  // Calculate the rectangle coordinates for rendering
  const getSelectionRect = () => {
    if (!selectionStart || !selectionEnd) return null;

    return {
      x: Math.min(selectionStart.x, selectionEnd.x),
      y: Math.min(selectionStart.y, selectionEnd.y),
      width: Math.abs(selectionEnd.x - selectionStart.x),
      height: Math.abs(selectionEnd.y - selectionStart.y),
    };
  };

  return {
    isSelecting,
    selectionStart,
    selectionEnd,
    handleStageClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleSelectionEnd,
    getSelectionRect
  };
};

export default SelectionHandler;