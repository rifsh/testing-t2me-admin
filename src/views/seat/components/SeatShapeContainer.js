import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Stage, Layer, Rect, Circle, Text } from "react-konva";
import { addDrawing, addSeat } from "store/slices/seatSlice";

const SeatShapeContainer = ({
  activeTool,
  scale,
  width,
  height,
  onComplete,
}) => {
  const dispatch = useDispatch();
  const seats = useSelector((state) => state.seat.seats);
  const activeCategory = useSelector((state) => state.seat.activeCategory);
  const categories = useSelector((state) => state.seat.categories);

  const [startPoint, setStartPoint] = useState(null);
  const [currentShape, setCurrentShape] = useState(null);
  const [containedSeats, setContainedSeats] = useState([]);
  const stageRef = useRef(null);

  // Improved function to check if a seat is within a shape
  const isSeatInShape = (seat, shape, tool) => {
    // Check for rectangular shape
    if (tool === "drawSquare") {
      return (
        seat.x >= shape.x &&
        seat.x <= shape.x + shape.width &&
        seat.y >= shape.y &&
        seat.y <= shape.y + shape.height
      );
    }

    // Check for circular shape
    if (tool === "drawCircle") {
      const centerX = shape.x + shape.width / 2;
      const centerY = shape.y + shape.height / 2;
      const radius = Math.max(shape.width, shape.height) / 2;

      // Calculate distance from seat to circle center
      const dx = seat.x - centerX;
      const dy = seat.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return distance <= radius;
    }

    return false;
  };

  const handleMouseDown = (e) => {
    if (!["drawSquare", "drawCircle"].includes(activeTool)) return;

    const stage = stageRef.current;
    const pointerPos = stage.getPointerPosition();
    setStartPoint({
      x: pointerPos.x / scale,
      y: pointerPos.y / scale,
    });
    // Reset contained seats
    setContainedSeats([]);
  };

  const handleMouseMove = (e) => {
    if (!startPoint || !["drawSquare", "drawCircle"].includes(activeTool))
      return;

    const stage = stageRef.current;
    const pointerPos = stage.getPointerPosition();
    const currentPos = {
      x: pointerPos.x / scale,
      y: pointerPos.y / scale,
    };

    const width = Math.abs(currentPos.x - startPoint.x);
    const height = Math.abs(currentPos.y - startPoint.y);
    const x = Math.min(startPoint.x, currentPos.x);
    const y = Math.min(startPoint.y, currentPos.y);

    const shape = { x, y, width, height };
    setCurrentShape(shape);

    // Find contained seats in real-time
    const contained = seats.reduce((indices, seat, index) => {
      if (isSeatInShape(seat, shape, activeTool)) {
        indices.push(index);
      }
      return indices;
    }, []);

    setContainedSeats(contained);
  };

  const handleMouseUp = () => {
    if (!startPoint || !currentShape) return;

    // Dispatch drawing with seat indices
    const drawingPayload = {
      type: activeTool === "drawSquare" ? "rectangle" : "circle",
      x: currentShape.x,
      y: currentShape.y,
      width: currentShape.width,
      height: currentShape.height,
      color: "rgba(0, 128, 255, 0.3)",
      fill: "rgba(0, 128, 255, 0.1)",
      categoryId: activeCategory,
      containedSeats: containedSeats,
    };

    dispatch(addDrawing(drawingPayload));

    // If no seats are found, create seats within the shape
    if (containedSeats.length === 0) {
      const category =
        categories.find((cat) => cat.id === activeCategory) || categories[0];
      const seatsToCreate = [];

      // Create a grid of seats within the shape
      const spacing = 30; // Adjust this value to change seat density
      for (
        let x = currentShape.x;
        x < currentShape.x + currentShape.width;
        x += spacing
      ) {
        for (
          let y = currentShape.y;
          y < currentShape.y + currentShape.height;
          y += spacing
        ) {
          // Only create seat if it's within the shape
          if (
            activeTool === "drawSquare" ||
            (activeTool === "drawCircle" &&
              isSeatInShape({ x, y }, currentShape, activeTool))
          ) {
            seatsToCreate.push({
              x,
              y,
              categoryId: activeCategory,
            });
          }
        }
      }

      // Dispatch seats to be created
      seatsToCreate.forEach((seatData) => {
        dispatch(addSeat(seatData));
      });
    }

    // Reset state
    setStartPoint(null);
    setCurrentShape(null);
    setContainedSeats([]);

    // Optional callback
    if (onComplete) onComplete();
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: ["drawSquare", "drawCircle"].includes(activeTool)
          ? "auto"
          : "none",
      }}
    >
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        scaleX={scale}
        scaleY={scale}
        style={{
          cursor: ["drawSquare", "drawCircle"].includes(activeTool)
            ? "crosshair"
            : "default",
        }}
      >
        <Layer>
          {currentShape && activeTool === "drawSquare" && (
            <Rect
              x={currentShape.x}
              y={currentShape.y}
              width={currentShape.width}
              height={currentShape.height}
              stroke="blue"
              strokeWidth={2}
              fill="rgba(0, 128, 255, 0.1)"
            />
          )}
          {currentShape && activeTool === "drawCircle" && (
            <Circle
              x={currentShape.x + currentShape.width / 2}
              y={currentShape.y + currentShape.height / 2}
              radius={Math.max(currentShape.width, currentShape.height) / 2}
              stroke="blue"
              strokeWidth={2}
              fill="rgba(0, 128, 255, 0.1)"
            />
          )}

          {/* Display number of contained or created seats */}
          {currentShape && (
            <Text
              x={currentShape.x}
              y={currentShape.y - 20}
              text={`Seats: ${
                containedSeats.length > 0
                  ? containedSeats.length
                  : "Will be created"
              }`}
              fontSize={12}
              fill="blue"
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default SeatShapeContainer;
