import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layer, Stage, Line, Rect, Circle } from "react-konva";
import { ChromePicker } from "react-color";
import {
  addDrawing,
  updateDrawing,
  deleteDrawing,
} from "store/slices/seatSlice";

const AdvancedColorPicker = ({
  selectedColor,
  onColorChange,
  showPicker = true,
}) => {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [color, setColor] = useState(selectedColor);

  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
    onColorChange(newColor.hex);
  };

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const popover = {
    position: "absolute",
    zIndex: 2,
    right: 0,
    top: "100%",
  };

  const cover = {
    position: "fixed",
    top: "0px",
    right: "0px",
    bottom: "0px",
    left: "0px",
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "4px",
          background: color,
          border: "1px solid #d9d9d9",
          cursor: "pointer",
        }}
        onClick={handleClick}
      />

      {displayColorPicker && showPicker ? (
        <div style={popover}>
          <div style={cover} onClick={handleClose} />
          <ChromePicker
            color={color}
            onChange={handleColorChange}
            disableAlpha
          />
        </div>
      ) : null}
    </div>
  );
};

const DrawingTool = ({ activeTool, scale, width, height }) => {
  const dispatch = useDispatch();
  const activeCategory = useSelector((state) => state.seat.activeCategory);
  const categories = useSelector((state) => state.seat.categories);
  const drawings = useSelector((state) => state.seat.drawings);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [fillEnabled, setFillEnabled] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const stageRef = useRef(null);

  // Reset drawing state when tool changes
  useEffect(() => {
    if (
      !["line", "square", "circle", "curve", "freehand", "select"].includes(
        activeTool
      )
    ) {
      setIsDrawing(false);
      setCurrentDrawing(null);
      setSelectedDrawing(null);
    }
  }, [activeTool]);

  const convertCoordinates = (e) => {
    const stage = e.target.getStage();
    const pointerPos = stage.getPointerPosition();
    return {
      worldX: pointerPos.x / scale,
      worldY: pointerPos.y / scale,
    };
  };

  const handleMouseDown = (e) => {
    const { worldX, worldY } = convertCoordinates(e);

    if (activeTool === "select") {
      // Find if a drawing was clicked
      const clickedDrawing = drawings.findIndex((drawing) => {
        switch (drawing.type) {
          case "line":
          case "freehand":
          case "curve":
            return drawing.points.some((p, i) => {
              if (i % 2 === 0) {
                const x = p;
                const y = drawing.points[i + 1];
                return Math.abs(x - worldX) < 10 && Math.abs(y - worldY) < 10;
              }
              return false;
            });
          case "square":
            return (
              worldX >= drawing.x &&
              worldX <= drawing.x + drawing.width &&
              worldY >= drawing.y &&
              worldY <= drawing.y + drawing.height
            );
          case "circle":
            const dx = worldX - drawing.x;
            const dy = worldY - drawing.y;
            return Math.sqrt(dx * dx + dy * dy) <= drawing.radius;
          default:
            return false;
        }
      });

      if (clickedDrawing !== -1) {
        setSelectedDrawing(clickedDrawing);
      } else {
        setSelectedDrawing(null);
      }
      return;
    }

    // Regular drawing logic
    if (!["line", "square", "circle", "curve", "freehand"].includes(activeTool))
      return;

    setIsDrawing(true);

    switch (activeTool) {
      case "line":
      case "curve":
        setCurrentDrawing({
          points: [worldX, worldY],
          color: selectedColor,
          type: activeTool,
          fill: fillEnabled ? selectedColor : "transparent",
          strokeWidth,
        });
        break;
      case "freehand":
        setCurrentDrawing({
          points: [worldX, worldY],
          color: selectedColor,
          type: "freehand",
          fill: fillEnabled ? selectedColor : "transparent",
          strokeWidth,
        });
        break;
      case "square":
        setCurrentDrawing({
          x: worldX,
          y: worldY,
          width: 0,
          height: 0,
          color: selectedColor,
          type: "square",
          fill: fillEnabled ? selectedColor : "transparent",
          strokeWidth,
        });
        break;
      case "circle":
        setCurrentDrawing({
          x: worldX,
          y: worldY,
          radius: 0,
          color: selectedColor,
          type: "circle",
          fill: fillEnabled ? selectedColor : "transparent",
          strokeWidth,
        });
        break;
      default:
        break;
    }
  };

  const handleMouseMove = (e) => {
    if (activeTool === "select" && selectedDrawing !== null) {
      const { worldX, worldY } = convertCoordinates(e);

      // Dispatch update for the selected drawing
      dispatch(
        updateDrawing({
          index: selectedDrawing,
          updates: {
            x: worldX,
            y: worldY,
          },
        })
      );
      return;
    }

    if (!isDrawing || !currentDrawing) return;

    const { worldX, worldY } = convertCoordinates(e);

    switch (currentDrawing.type) {
      case "line":
        // For line, only use two points
        setCurrentDrawing((prev) => ({
          ...prev,
          points: [prev.points[0], prev.points[1], worldX, worldY],
        }));
        break;
      case "freehand":
        setCurrentDrawing((prev) => ({
          ...prev,
          points: [...prev.points, worldX, worldY],
        }));
        break;
      case "curve":
        // For curves, use control points for Bezier curves
        setCurrentDrawing((prev) => {
          const newPoints = [...prev.points];
          // First point is start, last two are control points
          if (newPoints.length < 6) {
            // Add first control point
            newPoints.push(worldX, worldY);
          } else if (newPoints.length < 8) {
            // Add second control point and end point
            newPoints.push(worldX, worldY, worldX, worldY);
          } else {
            // Update the last point (end point)
            newPoints[6] = worldX;
            newPoints[7] = worldY;
          }
          return { ...prev, points: newPoints };
        });
        break;
      case "square":
        setCurrentDrawing((prev) => ({
          ...prev,
          width: worldX - prev.x,
          height: worldY - prev.y,
        }));
        break;
      case "circle":
        const radius = Math.sqrt(
          Math.pow(worldX - currentDrawing.x, 2) +
            Math.pow(worldY - currentDrawing.y, 2)
        );
        setCurrentDrawing((prev) => ({
          ...prev,
          radius,
        }));
        break;
      default:
        break;
    }
  };

  const handleMouseUp = () => {
    if (activeTool === "select") return;

    if (!isDrawing || !currentDrawing) return;

    // Validate drawing before dispatching
    let validDrawing = null;
    switch (currentDrawing.type) {
      case "line":
        // Ensure line has two distinct points
        validDrawing =
          currentDrawing.points.length === 4 &&
          Math.abs(currentDrawing.points[0] - currentDrawing.points[2]) > 2 &&
          Math.abs(currentDrawing.points[1] - currentDrawing.points[3]) > 2
            ? currentDrawing
            : null;
        break;
      case "freehand":
        // Ensure at least two points with some movement
        validDrawing = currentDrawing.points.length > 2 ? currentDrawing : null;
        break;
      case "curve":
        // Ensure all points are set
        validDrawing =
          currentDrawing.points.length === 8 ? currentDrawing : null;
        break;
      case "square":
        // Ensure some width and height
        validDrawing =
          Math.abs(currentDrawing.width) > 5 &&
          Math.abs(currentDrawing.height) > 5
            ? currentDrawing
            : null;
        break;
      case "circle":
        // Ensure a minimum radius
        validDrawing = currentDrawing.radius > 5 ? currentDrawing : null;
        break;
      default:
        break;
    }

    // Dispatch the completed drawing to Redux if valid
    if (validDrawing) {
      dispatch(
        addDrawing({
          ...validDrawing,
          categoryId: activeCategory,
        })
      );
    }

    setIsDrawing(false);
    setCurrentDrawing(null);
  };

  // Delete selected drawing
  const handleDeleteDrawing = () => {
    if (selectedDrawing !== null) {
      dispatch(deleteDrawing(selectedDrawing));
      setSelectedDrawing(null);
    }
  };

  // Toggle fill functionality
  const toggleFill = () => {
    setFillEnabled(!fillEnabled);
  };

  // Color selection rendering
  const renderColorControls = () => {
    return (
      <div
        style={{
          position: "absolute",
          top: "50px",
          right: "10px",
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
          border: "1px solid #d9d9d9",
          padding: "5px",
          gap: "10px",
        }}
      >
        <AdvancedColorPicker
          selectedColor={selectedColor}
          onColorChange={(color) => setSelectedColor(color)}
        />

        {/* Stroke Width Control */}
        <div>
          <label>Stroke Width:</label>
          <input
            type="range"
            min="1"
            max="10"
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
          />
        </div>
      </div>
    );
  };

  if (
    !["line", "square", "circle", "curve", "freehand", "select"].includes(
      activeTool
    )
  ) {
    return null;
  }

  return (
    <>
      {/* Fill toggle button */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 20,
          backgroundColor: fillEnabled ? selectedColor : "white",
          color: fillEnabled ? "white" : "black",
          border: "1px solid #d9d9d9",
          padding: "5px 10px",
          cursor: "pointer",
        }}
        onClick={toggleFill}
      >
        {fillEnabled ? "Fill ON" : "Fill OFF"}
      </div>

      {/* Color Controls */}
      {renderColorControls()}

      {/* Delete Drawing Button */}
      {selectedDrawing !== null && (
        <button
          style={{
            position: "absolute",
            top: "90px",
            right: "10px",
            zIndex: 20,
            backgroundColor: "red",
            color: "white",
            border: "none",
            padding: "5px 10px",
            cursor: "pointer",
          }}
          onClick={handleDeleteDrawing}
        >
          Delete Drawing
        </button>
      )}

      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        scaleX={scale}
        scaleY={scale}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "auto",
          zIndex: 10,
        }}
      >
        <Layer>
          {/* Render current drawing in progress */}
          {currentDrawing && (
            <>
              {currentDrawing.type === "line" && (
                <Line
                  points={currentDrawing.points}
                  stroke={currentDrawing.color}
                  strokeWidth={currentDrawing.strokeWidth}
                  tension={0}
                  lineCap="round"
                  lineJoin="round"
                />
              )}
              {currentDrawing.type === "freehand" && (
                <Line
                  points={currentDrawing.points}
                  stroke={currentDrawing.color}
                  strokeWidth={currentDrawing.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                />
              )}
              {currentDrawing.type === "curve" && (
                <Line
                  points={currentDrawing.points}
                  stroke={currentDrawing.color}
                  strokeWidth={currentDrawing.strokeWidth}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                />
              )}
              {currentDrawing.type === "square" && (
                <Rect
                  x={currentDrawing.x}
                  y={currentDrawing.y}
                  width={currentDrawing.width}
                  height={currentDrawing.height}
                  stroke={currentDrawing.color}
                  fill={currentDrawing.fill}
                  strokeWidth={currentDrawing.strokeWidth}
                />
              )}
              {currentDrawing.type === "circle" && (
                <Circle
                  x={currentDrawing.x}
                  y={currentDrawing.y}
                  radius={currentDrawing.radius}
                  stroke={currentDrawing.color}
                  fill={currentDrawing.fill}
                  strokeWidth={currentDrawing.strokeWidth}
                />
              )}
            </>
          )}
        </Layer>
      </Stage>
    </>
  );
};

export default DrawingTool;
