import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Circle, Line } from "react-konva";
import { useSelector, useDispatch } from "react-redux";

import {
  addSeat,
  moveSeat,
  clearSelection,
  toggleSeatSelection,
  toggleGrid,
} from "store/slices/seatSlice";

import Toolbar from "./Toolbar";
import Seat from "./Seat";
import Grid from "./Grid";
import SelectionRectangle from "./SelectionRectangle";
import { SidebarProvider, useSidebar } from "utils/hooks/useSidebar";
import DynamicSidebar from "./DynamicSidebar";
import SeatCurve from "./SeatCurve";
import DrawingTool from "./DrawingTool";
import { SeatUtils } from "./seatUtils";

// Minimum distance between seats (in pixels)
const MIN_SEAT_DISTANCE = 25;

const SeatCanvas = () => {
  // Redux state
  const seats = useSelector((state) => state.seat.seats);
  const scale = useSelector((state) => state.seat.scale);
  const selectedSeats = useSelector((state) => state.seat.selectedSeats);
  const showGrid = useSelector((state) => state.seat.showGrid);
  const drawings = useSelector((state) => state.seat.drawings);
  const categories = useSelector((state) => state.seat.categories);

  const dispatch = useDispatch();
  const stageContainerRef = useRef(null);
  const stageRef = useRef(null);

  // Selection rectangle state
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { openSidebar, closeSidebar } = useSidebar();

  // Multi-drag state
  const [isDraggingMultiple, setIsDraggingMultiple] = useState(false);
  const [dragStartPositions, setDragStartPositions] = useState([]);
  const [dragStartPoint, setDragStartPoint] = useState(null);

  // Tool state management
  const [tool, setTool] = useState("add");
  const renderDrawings = () => {
    return drawings.map((drawing, index) => {
      const category = categories.find((cat) => cat.id === drawing.categoryId);
      const color = category ? category.color : "#000000";

      switch (drawing.type) {
        case "line":
          return (
            <Line
              key={`drawing-${index}`}
              points={drawing.points}
              stroke={color}
              strokeWidth={2}
            />
          );
        case "curve":
          return (
            <Line
              key={`drawing-${index}`}
              points={drawing.points}
              stroke={color}
              strokeWidth={2}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          );
        case "square":
          return (
            <Rect
              key={`drawing-${index}`}
              x={drawing.x}
              y={drawing.y}
              width={drawing.width}
              height={drawing.height}
              stroke={color}
              strokeWidth={2}
              fill="transparent"
            />
          );
        case "circle":
          return (
            <Circle
              key={`drawing-${index}`}
              x={drawing.x}
              y={drawing.y}
              radius={drawing.radius}
              stroke={color}
              strokeWidth={2}
              fill="transparent"
            />
          );
        default:
          return null;
      }
    });
  };

  useEffect(() => {
    setSelectionStart(null);
    setSelectionEnd(null);
    setIsSelecting(false);
    setIsDraggingMultiple(false);
  }, [tool]);

  useEffect(() => {
    if (selectedSeats.length > 0) {
      openSidebar(<SeatCurve />);
    } else {
      closeSidebar();
    }
  }, [selectedSeats, openSidebar, closeSidebar]);
  // Check if a position would cause overlap with existing seats
  const wouldOverlap = (x, y, excludeIndices = []) => {
    for (let i = 0; i < seats.length; i++) {
      if (excludeIndices.includes(i)) continue;

      const distance = Math.sqrt(
        Math.pow(seats[i].x - x, 2) + Math.pow(seats[i].y - y, 2)
      );

      if (distance < MIN_SEAT_DISTANCE) {
        return true;
      }
    }
    return false;
  };

  // Find valid position for a new seat (prevent overlap)
  const findValidPosition = (x, y) => {
    // If the position is already valid, return it unchanged
    if (!wouldOverlap(x, y)) {
      return { x, y };
    }

    // Otherwise, look for a nearby valid position using a spiral search pattern
    const spiralSearch = (centerX, centerY, maxRadius) => {
      for (let radius = MIN_SEAT_DISTANCE; radius <= maxRadius; radius += 5) {
        for (let angle = 0; angle < 360; angle += 15) {
          const radians = angle * (Math.PI / 180);
          const testX = centerX + radius * Math.cos(radians);
          const testY = centerY + radius * Math.sin(radians);

          if (!wouldOverlap(testX, testY)) {
            return { x: testX, y: testY };
          }
        }
      }

      // If no valid position found within maxRadius, return null
      return null;
    };

    // Try to find a valid position within a reasonable radius
    const validPosition = spiralSearch(x, y, 100);
    return validPosition || { x, y }; // Return original if nothing found
  };

  // Handle stage click for adding/selecting seats
  const handleStageClick = (e) => {
    // Skip if we're in selection mode or currently selecting or dragging multiple
    if (tool === "select" || isSelecting || isDraggingMultiple) return;

    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();

    // Convert screen coordinates to world coordinates
    const adjustedX = pointerPos.x / scale;
    const adjustedY = pointerPos.y / scale;

    // Add seat mode
    if (tool === "add") {
      const validPosition = findValidPosition(adjustedX, adjustedY);
      dispatch(addSeat({ x: validPosition.x, y: validPosition.y }));
    }
    // Click select mode
    else if (tool === "clickSelect") {
      const clickedSeatIndex = findClickedSeat(adjustedX, adjustedY);

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
  };

  // Find the index of a seat at the given coordinates
  const findClickedSeat = (x, y) => {
    return seats.findIndex((seat) => {
      const distance = Math.sqrt(
        Math.pow(seat.x - x, 2) + Math.pow(seat.y - y, 2)
      );
      return distance <= 10; // 10 is the radius of the circle
    });
  };

  // Selection rectangle start
  const handleMouseDown = (e) => {
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
    }
  };

  // Update selection rectangle as mouse moves or handle multi-drag
  const handleMouseMove = (e) => {
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
  };

  // Check if the new positions would cause overlaps and adjust if needed
  const validateMultiDragPositions = (deltaX, deltaY) => {
    const newPositions = [];
    const unselectedIndices = seats
      .map((_, index) => index)
      .filter((index) => !selectedSeats.includes(index));

    // First, calculate all the proposed new positions
    for (const { index, startX, startY } of dragStartPositions) {
      newPositions.push({
        index,
        x: startX + deltaX,
        y: startY + deltaY,
      });
    }

    // Now check if any of the new positions would cause overlaps with unselected seats
    let hasOverlap = false;
    for (const unselectedIndex of unselectedIndices) {
      const unselectedSeat = seats[unselectedIndex];

      for (const newPos of newPositions) {
        const distance = Math.sqrt(
          Math.pow(unselectedSeat.x - newPos.x, 2) +
            Math.pow(unselectedSeat.y - newPos.y, 2)
        );

        if (distance < MIN_SEAT_DISTANCE) {
          hasOverlap = true;
          break;
        }
      }

      if (hasOverlap) break;
    }

    // Also check for overlaps between the selected seats themselves
    if (!hasOverlap) {
      for (let i = 0; i < newPositions.length; i++) {
        for (let j = i + 1; j < newPositions.length; j++) {
          const distance = Math.sqrt(
            Math.pow(newPositions[i].x - newPositions[j].x, 2) +
              Math.pow(newPositions[i].y - newPositions[j].y, 2)
          );

          if (distance < MIN_SEAT_DISTANCE) {
            hasOverlap = true;
            break;
          }
        }
        if (hasOverlap) break;
      }
    }

    // If there are overlaps, don't apply the changes
    return !hasOverlap ? newPositions : null;
  };

  // End selection/drag and apply changes
  const handleMouseUp = (e) => {
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
      const validPositions = validateMultiDragPositions(deltaX, deltaY);

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

  // Handle seat drag end for single seat dragging
  const handleSeatDragEnd = (index, e) => {
    if (!e || !e.target) return;

    const newX = e.target.x();
    const newY = e.target.y();

    // Check if the new position would overlap with any other seat
    if (!wouldOverlap(newX, newY, [index])) {
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



  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (stageContainerRef.current.requestFullscreen) {
        stageContainerRef.current.requestFullscreen();
      } else if (stageContainerRef.current.webkitRequestFullscreen) {
        stageContainerRef.current.webkitRequestFullscreen();
      } else if (stageContainerRef.current.msRequestFullscreen) {
        stageContainerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  // Get current stage dimensions
  const getStageDimensions = () => {
    if (isFullscreen) {
      return {
        width: window.innerWidth,
        height: window.innerHeight - 60, // Adjust for toolbar height
      };
    }
    return { width: 800, height: 600 };
  };

  const dimensions = getStageDimensions();

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  // Handle window resize in fullscreen mode
  useEffect(() => {
    const handleResize = () => {
      if (isFullscreen) {
        forceUpdate();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isFullscreen]);

  // Force re-render trick
  const [, updateState] = useState();
  const forceUpdate = () => updateState({});
  return (
    <SidebarProvider>
    <div style={{ position: "relative" }}>
      <Toolbar
        activeTool={tool}
        onToolChange={setTool}
        showGrid={showGrid}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
      <DynamicSidebar />
      <div 
        ref={stageContainerRef} 
        style={{ 
          position: "relative", 
          cursor: SeatUtils.getCursor(tool,isDraggingMultiple) 
        }}
      >
        <Stage
          ref={stageRef}
          width={dimensions.width}
          height={dimensions.height}
          onClick={handleStageClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            border: "1px solid black",
            userSelect: "none",
          }}
          scaleX={scale}
          scaleY={scale}
        >
            <Layer>
              {/* Grid */}
              {showGrid && (
                <Grid
                  width={dimensions.width / scale}
                  height={dimensions.height / scale}
                  size={20}
                />
              )}

              {/* Seats */}
              {seats.map((seat, index) => (
                <Seat
                  key={index}
                  seat={seat}
                  index={index}
                  isSelected={selectedSeats.includes(index)}
                  draggable={
                    tool === "drag" &&
                    (!isDraggingMultiple || !selectedSeats.includes(index))
                  }
                  onDragEnd={(e) => handleSeatDragEnd(index, e)}
                  id={`seat-${index}`}
                />
              ))}

              {/* Previously drawn objects */}
              {renderDrawings()}

              {/* Selection rectangle */}
              {(isSelecting || (selectionStart && selectionEnd)) &&
                tool === "select" && (
                  <SelectionRectangle
                    selectionRect={getSelectionRect()}
                    isSelecting={isSelecting}
                    onSelectionEnd={handleSelectionEnd}
                  />
                )}
            </Layer>
          </Stage>

          {["line", "square", "circle", "curve"].includes(tool) && (
            <DrawingTool
              activeTool={tool}
              scale={scale}
              width={dimensions.width}
              height={dimensions.height}
            />
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SeatCanvas;
