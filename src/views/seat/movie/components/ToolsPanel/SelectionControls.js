import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateSeats,
  updateSeatsRenumber,
  clearSelection,
} from "store/slices/movieSeatSlice";
import { Button, Typography, Space, Badge } from "antd";

const { Text } = Typography;

const SelectionControls = () => {
  const dispatch = useDispatch();
  const { selectedSeats } = useSelector((state) => state.movieSeatSlice);
  const { seats } = useSelector((state) => state.movieSeatSlice);
  const { mode, selectedSeatType, selectedCategory } = useSelector(
    (state) => state.movieSeatSlice
  );

  const applyToSelected = () => {
    if (selectedSeats.length === 0) return;

    const newSeats = JSON.parse(JSON.stringify(seats));
    let needsRenumbering = false;

    selectedSeats.forEach((seatKey) => {
      const [rowIndex, colIndex] = seatKey.split("-").map(Number);

      if (mode === "category") {
        newSeats[rowIndex][colIndex].category = selectedCategory;
      } else {
        const oldType = newSeats[rowIndex][colIndex].type;
        newSeats[rowIndex][colIndex].type = selectedSeatType;

        // Check if renumbering is needed
        if (oldType === "hidden" || selectedSeatType === "hidden") {
          needsRenumbering = true;
        }
      }
    });

    if (needsRenumbering) {
      dispatch(updateSeatsRenumber(newSeats));
    } else {
      dispatch(updateSeats(newSeats));
    }

    dispatch(clearSelection());
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text strong>Selected Seats:</Text>
        <Badge
          count={selectedSeats.length}
          style={{
            backgroundColor: selectedSeats.length > 0 ? "#1890ff" : "#d9d9d9",
          }}
        />
      </div>

      <Button
        type="primary"
        onClick={applyToSelected}
        disabled={selectedSeats.length === 0}
        style={{ width: "100%", marginTop: "8px" }}
      >
        Apply Changes
      </Button>

      <Text
        type="secondary"
        style={{
          fontSize: "12px",
          display: "block",
          textAlign: "center",
          marginTop: "8px",
        }}
      >
        Click and drag to select multiple seats
      </Text>
    </Space>
  );
};

export default SelectionControls;
