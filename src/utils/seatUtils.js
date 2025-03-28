// src/utils/seatUtils.js
// Utility functions related to seat positioning and overlap detection

// Minimum distance between seats (in pixels)
export const MIN_SEAT_DISTANCE = 25;

/**
 * Checks if a position would cause overlap with existing seats
 * @param {number} x - X coordinate to check
 * @param {number} y - Y coordinate to check
 * @param {Array} seats - Array of all seat objects
 * @param {Array} excludeIndices - Array of seat indices to exclude from overlap check
 * @returns {boolean} - True if position would overlap, false otherwise
 */
export const wouldOverlap = (x, y, seats, excludeIndices = []) => {
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

/**
 * Finds a valid position for a new seat (prevents overlap)
 * @param {number} x - Desired X coordinate
 * @param {number} y - Desired Y coordinate
 * @param {Array} seats - Array of all seat objects
 * @returns {Object} - Valid position {x, y}
 */
export const findValidPosition = (x, y, seats) => {
  // If the position is already valid, return it unchanged
  if (!wouldOverlap(x, y, seats)) {
    return { x, y };
  }

  // Otherwise, look for a nearby valid position using a spiral search pattern
  const spiralSearch = (centerX, centerY, maxRadius) => {
    for (let radius = MIN_SEAT_DISTANCE; radius <= maxRadius; radius += 5) {
      for (let angle = 0; angle < 360; angle += 15) {
        const radians = angle * (Math.PI / 180);
        const testX = centerX + radius * Math.cos(radians);
        const testY = centerY + radius * Math.sin(radians);

        if (!wouldOverlap(testX, testY, seats)) {
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

/**
 * Find the index of a seat at the given coordinates
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Array} seats - Array of all seat objects
 * @returns {number} - Index of found seat or -1 if none found
 */
export const findClickedSeat = (x, y, seats) => {
  return seats.findIndex((seat) => {
    const distance = Math.sqrt(
      Math.pow(seat.x - x, 2) + Math.pow(seat.y - y, 2)
    );
    return distance <= 10; // 10 is the radius of the circle
  });
};

/**
 * Validates positions for multiple seats being dragged to ensure no overlaps
 * @param {Array} dragStartPositions - Array of {index, startX, startY} objects
 * @param {number} deltaX - X movement amount
 * @param {number} deltaY - Y movement amount
 * @param {Array} seats - Array of all seat objects
 * @param {Array} selectedSeats - Array of selected seat indices
 * @returns {Array|null} - Array of valid positions or null if invalid
 */
export const validateMultiDragPositions = (
  dragStartPositions,
  deltaX,
  deltaY,
  seats,
  selectedSeats
) => {
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

  // Check for overlaps with unselected seats
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

  // Check for overlaps between the selected seats themselves
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