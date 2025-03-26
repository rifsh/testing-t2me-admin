import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer } from "react-konva";
import { useSelector, useDispatch } from "react-redux";

import { clearSelection } from "store/slices/seatSlice";

import Toolbar from "./Toolbar";
import Seat from "./Seat";
import Grid from "./Grid";
import SelectionRectangle from "./SelectionRectangle";
import { SidebarProvider, useSidebar } from "utils/hooks/useSidebar";
import DynamicSidebar from "./DynamicSidebar";
import { SeatUtils } from "../utils/seatUtils";
import { createMouseUtils } from "../utils/mouseUtils";
import DrawingTool from "./DrawingTool";
import SeatShapeContainer from "./SeatShapeContainer";

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

  // Create mouse utilities with current state
  const mouseUtils = createMouseUtils(
    dispatch, 
    seats, 
    scale, 
    selectedSeats, 
    tool
  );

  // Similar existing useEffect hooks remain unchanged

  // Handle stage click using mouse utils
  const handleStageClick = (e) => {
    mouseUtils.handleStageClick(e);
  };

  // Handle mouse down using mouse utils
  const handleMouseDown = (e) => {
    mouseUtils.handleMouseDown(
      e, 
      setSelectionStart, 
      setSelectionEnd, 
      setIsSelecting,
      setIsDraggingMultiple, 
      setDragStartPoint, 
      setDragStartPositions
    );
  };

  // Handle mouse move using mouse utils
  const handleMouseMove = (e) => {
    mouseUtils.handleMouseMove(
      e, 
      isSelecting, 
      isDraggingMultiple,
      selectionStart, 
      dragStartPoint,
      setSelectionEnd, 
      dragStartPositions
    );
  };

  // Handle mouse up using mouse utils
  const handleMouseUp = (e) => {
    mouseUtils.handleMouseUp(
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
    );
  };

  // Handle seat drag end using mouse utils
  const handleSeatDragEnd = (index, e) => {
    mouseUtils.handleSeatDragEnd(index, e);
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

  // Existing useEffect hooks for fullscreen and sidebar

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
            cursor: SeatUtils.getCursor(tool, isDraggingMultiple),
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

              {SeatUtils.renderDrawings(drawings, categories)}

              {(isSelecting || (selectionStart && selectionEnd)) &&
                tool === "select" && (
                  <SelectionRectangle
                    selectionRect={getSelectionRect()}
                    isSelecting={isSelecting}
                    onSelectionEnd={() => {
                      setSelectionStart(null);
                      setSelectionEnd(null);
                    }}
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

          {/* New SeatShapeContainer for drawSquare and drawCircle tools */}
          {["drawSquare", "drawCircle"].includes(tool) && (
            <SeatShapeContainer
              activeTool={tool}
              scale={scale}
              width={dimensions.width}
              height={dimensions.height}
              onComplete={() => setTool("select")} // Optional: switch back to select tool after drawing
            />
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SeatCanvas;