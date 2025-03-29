import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  startSelection,
  updateSelection,
  endSelection,
} from "store/slices/movieSeatSlice";
import { SEAT_CATEGORIES, SEAT_TYPES } from "constants/SeatTypes";
import Legend from "./Legend";
import { Card, Typography } from "antd";

const TheaterGrid = () => {
  const dispatch = useDispatch();
  const { seats } = useSelector((state) => state.movieSeatSlice);
  const { selectedSeats } = useSelector((state) => state.movieSeatSlice);

  // Helper function to get border color for category
  const getCategoryBorder = (category) => {
    const cat = SEAT_CATEGORIES.find((cat) => cat.id === category);
    return cat ? cat.borderColor : "gray";
  };

  // Event handlers for mouse interactions
  const handleMouseDown = (rowIndex, colIndex) => {
    dispatch(startSelection({ rowIndex, colIndex }));
  };

  const handleMouseMove = (rowIndex, colIndex) => {
    dispatch(updateSelection({ rowIndex, colIndex, seats }));
  };

  const handleMouseUp = () => {
    dispatch(endSelection());
  };

  // Group seats by category to add spacing between sections
  const groupSeatsByCategory = () => {
    // Create a map of categories for each column in each row
    const categoryMap = [];

    for (let rowIndex = 0; rowIndex < seats.length; rowIndex++) {
      categoryMap[rowIndex] = [];
      let currentCategory = null;
      let currentGroup = [];

      for (let colIndex = 0; colIndex < seats[rowIndex].length; colIndex++) {
        const seat = seats[rowIndex][colIndex];

        if (seat.category !== currentCategory) {
          if (currentGroup.length > 0) {
            categoryMap[rowIndex].push({
              category: currentCategory,
              seats: currentGroup,
            });
          }
          currentCategory = seat.category;
          currentGroup = [{ seat, colIndex }];
        } else {
          currentGroup.push({ seat, colIndex });
        }
      }

      if (currentGroup.length > 0) {
        categoryMap[rowIndex].push({
          category: currentCategory,
          seats: currentGroup,
        });
      }
    }

    return categoryMap;
  };

  if (seats.length === 0) {
    return null;
  }

  const categoryGroups = groupSeatsByCategory();

  return (
    <Card
      style={{ marginBottom: "16px" }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        style={{
          marginBottom: "32px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "50%",
            height: "16px",
            backgroundColor: "#d9d9d9",
            margin: "0 auto 32px",
            borderRadius: "4px",
          }}
        >
          <Typography.Text style={{ fontSize: "12px" }}>SCREEN</Typography.Text>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {categoryGroups.map((row, rowIndex) => (
            <div
              key={rowIndex}
              style={{ display: "flex", gap: "4px", alignItems: "center" }}
            >
              <div style={{ width: "24px", fontWeight: "bold" }}>
                {String.fromCharCode(65 + rowIndex)}
              </div>

              {row.map((group, groupIndex) => (
                <React.Fragment key={`${rowIndex}-${groupIndex}`}>
                  {/* Add spacing between different category groups */}
                  {groupIndex > 0 && <div style={{ width: "12px" }} />}

                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      padding: "4px",
                      borderRadius: "4px",
                      border: `1px dashed ${getCategoryBorder(group.category)}`,
                    }}
                  >
                    {group.seats.map(({ seat, colIndex }) => {
                      const isSelected = selectedSeats.includes(
                        `${rowIndex}-${colIndex}`
                      );
                      const isHidden = seat.type === "hidden";

                      return (
                        <div
                          key={colIndex}
                          onMouseDown={() =>
                            handleMouseDown(rowIndex, colIndex)
                          }
                          onMouseOver={() =>
                            handleMouseMove(rowIndex, colIndex)
                          }
                          style={{
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "4px",
                            backgroundColor: "transparent",
                            border: `2px solid ${getCategoryBorder(
                              seat.category
                            )}`,
                            opacity: isHidden ? 0.3 : 1,
                            cursor: isHidden ? "default" : "pointer",
                            userSelect: "none",
                            boxShadow: isSelected ? "0 0 0 2px black" : "none",
                          }}
                          title={`${seat.id} - Type: ${seat.type}, Category: ${seat.category}`}
                        >
                          {!isHidden && seat.visualNumber}
                        </div>
                      );
                    })}
                  </div>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Legend />
    </Card>
  );
};

export default TheaterGrid;
