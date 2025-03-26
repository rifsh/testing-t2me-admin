import { Line, Rect, Circle } from 'react-konva';

export class SeatUtils {
  static getCursor(tool, isDraggingMultiple) {
    switch (tool) {
      case "add":
      case "select":
      case "line":
      case "square":
      case "circle":
      case "curve":
        return "crosshair";
      case "clickSelect":
        return "pointer";
      case "drag":
        return isDraggingMultiple ? "grabbing" : "move";
      default:
        return "default";
    }
  }

  static renderDrawings(drawings, categories) {
    return drawings.map((drawing, index) => {
      const category = categories.find((cat) => cat.id === drawing.categoryId);
      const color = drawing.color || (category ? category.color : '#000000');

      switch (drawing.type) {
        case 'line':
          return (
            <Line
              key={`drawing-${index}`}
              points={drawing.points}
              stroke={color}
              strokeWidth={2}
            />
          );
        case 'curve':
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
        case 'square':
          return (
            <Rect
              key={`drawing-${index}`}
              x={drawing.x}
              y={drawing.y}
              width={drawing.width}
              height={drawing.height}
              stroke={color}
              fill={drawing.fill}
              strokeWidth={2}
            />
          );
        case 'circle':
          return (
            <Circle
              key={`drawing-${index}`}
              x={drawing.x}
              y={drawing.y}
              radius={drawing.radius}
              stroke={color}
              fill={drawing.fill}
              strokeWidth={2}
            />
          );
        default:
          return null;
      }
    });
  }

  // Check if a position would cause overlap with existing seats
  static wouldOverlap(seats, x, y, excludeIndices = [], minDistance = 25) {
    for (let i = 0; i < seats.length; i++) {
      if (excludeIndices.includes(i)) continue;

      const distance = Math.sqrt(
        Math.pow(seats[i].x - x, 2) + Math.pow(seats[i].y - y, 2)
      );

      if (distance < minDistance) {
        return true;
      }
    }
    return false;
  }

  // Find valid position for a new seat (prevent overlap)
  static findValidPosition(seats, x, y, minDistance = 25) {
    // If the position is already valid, return it unchanged
    if (!this.wouldOverlap(seats, x, y)) {
      return { x, y };
    }

    // Otherwise, look for a nearby valid position using a spiral search pattern
    const spiralSearch = (centerX, centerY, maxRadius) => {
      for (let radius = minDistance; radius <= maxRadius; radius += 5) {
        for (let angle = 0; angle < 360; angle += 15) {
          const radians = angle * (Math.PI / 180);
          const testX = centerX + radius * Math.cos(radians);
          const testY = centerY + radius * Math.sin(radians);

          if (!this.wouldOverlap(seats, testX, testY)) {
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
  }

  // Find the index of a seat at the given coordinates
  static findClickedSeat(seats, x, y, radius = 10) {
    return seats.findIndex((seat) => {
      const distance = Math.sqrt(
        Math.pow(seat.x - x, 2) + Math.pow(seat.y - y, 2)
      );
      return distance <= radius;
    });
  }

  // Validate multi-drag positions to prevent overlaps
  static validateMultiDragPositions(
    seats, 
    selectedSeats, 
    dragStartPositions, 
    deltaX, 
    deltaY, 
    minDistance = 25
  ) {
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

        if (distance < minDistance) {
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

          if (distance < minDistance) {
            hasOverlap = true;
            break;
          }
        }
        if (hasOverlap) break;
      }
    }

    // If there are overlaps, don't apply the changes
    return !hasOverlap ? newPositions : null;
  }
}