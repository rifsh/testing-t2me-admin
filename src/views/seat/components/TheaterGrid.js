import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  startSelection,
  updateSelection,
  endSelection,
  zoomIn,
  zoomOut,
} from "store/slices/movieSeatSlice";
import { Tooltip, Typography, Card } from "antd";
import { BorderOuterOutlined } from "@ant-design/icons";

const { Text } = Typography;

const TheaterGrid = ({ isPreviewMode, showHiddenSeats, type }) => {
  const dispatch = useDispatch();
  const { seats, selectedSeats, seatTypes, zoomLevel } = useSelector(
    (state) => state.movieSeatSlice
  );
  const gridRef = useRef(null);

  // Helper function to get border color for seat type
  const getSeatBorder = (typeId) => {
    const type = seatTypes.find((t) => t.id === typeId);
    return type ? type.color : "#cccccc";
  };

  // Helper function to get fill color for seat type
  const getSeatFill = (typeId) => {
    const type = seatTypes.find((t) => t.id === typeId);
    return type ? type.color : "#ffffff";
  };

  // Event handlers for mouse interactions
  const handleMouseDown = (rowIndex, colIndex) => {
    if (!isPreviewMode) {
      dispatch(startSelection({ rowIndex, colIndex }));
    }
  };

  const handleMouseMove = (rowIndex, colIndex) => {
    if (!isPreviewMode) {
      dispatch(updateSelection({ rowIndex, colIndex, seats }));
    }
  };

  const handleMouseUp = () => {
    if (!isPreviewMode) {
      dispatch(endSelection());
    }
  };

  // Handle wheel zoom
  useEffect(() => {
    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          dispatch(zoomIn());
        } else {
          dispatch(zoomOut());
        }
      }
    };

    const grid = gridRef.current;
    if (grid) {
      grid.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (grid) {
        grid.removeEventListener("wheel", handleWheel);
      }
    };
  }, [dispatch]);

  // Calculate appropriate seat size based on zoom level
  const getSeatSizeClass = () => {
    const baseSize = Math.max(
      Math.min(24, Math.floor(500 / Math.max(1, seats[0]?.length || 10))),
      16
    );
    return `${baseSize * (zoomLevel / 100)}px`;
  };

  if (seats.length === 0) {
    return (
      <Card>
        <div className="text-center p-8">
          <BorderOuterOutlined style={{ fontSize: "48px", color: "#d9d9d9" }} />
          <Text type="secondary" className="block mt-4 text-lg">
            No seat layout yet
          </Text>
          <Text type="secondary" className="block">
            Please use the Layout tool to generate a layout
          </Text>
        </div>
      </Card>
    );
  }

  const seatSize = getSeatSizeClass();

  return (
    <Card>
      <div className="relative overflow-auto p-4" style={{ height: "70vh" }}>
        {type === "MOVIE" && <ScreenComponent />}

        <div
          className="flex flex-col items-center space-y-2 min-w-max"
          ref={gridRef}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: "top center",
          }}
        >
          {seats.map((row, rowIndex) => {
            const allInvisible = row.every((seat) => !seat.isVisible);

            return (
              <div key={rowIndex} className="flex items-center">
                <div
                  className="flex items-center justify-center font-medium text-gray-600 mr-2"
                  style={{ width: "24px" }}
                >
                  {allInvisible
                    ? ""
                    : row.find((seat) => seat.isVisible)?.rowLabel}
                </div>

                {/* Seats */}
                <div className="flex">
                  {row.map((seat, colIndex) => {
                    // Skip rendering invisible seats if option is turned off
                    if (!seat.isVisible && !showHiddenSeats && !isPreviewMode) {
                      return null;
                    }

                    return (
                      <SeatComponent
                        key={colIndex}
                        seat={seat}
                        rowIndex={rowIndex}
                        colIndex={colIndex}
                        isSelected={selectedSeats.includes(
                          `${rowIndex}-${colIndex}`
                        )}
                        isPreviewMode={isPreviewMode}
                        seatSize={seatSize}
                        getSeatBorder={getSeatBorder}
                        getSeatFill={getSeatFill}
                        handleMouseDown={handleMouseDown}
                        handleMouseMove={handleMouseMove}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        {isPreviewMode && <SeatTypeLegend seatTypes={seatTypes} />}
      </div>
    </Card>
  );
};

// Screen Component
const ScreenComponent = () => (
  <div className="mb-10 sticky top-0 z-10 bg-gradient-to-b from-white pb-4">
    <div
      className="mx-auto relative overflow-hidden bg-gradient-to-b from-gray-300 to-gray-400"
      style={{
        width: "80%",
        height: "10px",
        borderRadius: "100px / 50px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/50"></div>
    </div>
    <Text className="block text-center text-sm mt-2 font-medium text-gray-500">
      SCREEN
    </Text>
  </div>
);

// Seat Component
const SeatComponent = ({
  seat,
  rowIndex,
  colIndex,
  isSelected,
  isPreviewMode,
  seatSize,
  getSeatBorder,
  getSeatFill,
  handleMouseDown,
  handleMouseMove,
}) => {
  const showPreview = isPreviewMode && seat.isVisible;
  const seatLabel = seat.number > 0 ? seat.number : "";
  const seatId = `${seat.rowLabel || ""}${seat.number || "0"}`;

  return (
    <div
      className={`
        relative flex items-center justify-center
        ${!isPreviewMode ? "cursor-pointer" : ""}
        transition-all duration-150
        ${isSelected ? "ring-2 ring-blue-600 scale-110 z-10" : ""}
      `}
      style={{
        width: seatSize,
        height: seatSize,
        margin: "2px",
        opacity: !seat.isVisible ? 0.3 : 1,
        backgroundColor: isSelected
          ? "#e6f7ff"
          : showPreview
          ? getSeatFill(seat.type)
          : "white",
        border: `2px solid ${
          isSelected ? "#1890ff" : getSeatBorder(seat.type)
        }`,
        borderRadius: "4px",
      }}
      onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
      onMouseMove={() => handleMouseMove(rowIndex, colIndex)}
    >
      <Tooltip title={`ID: ${seatId}, Type: ${seat.type}`}>
        <Text
          className="select-none text-xs font-medium"
          style={{
            color:
              showPreview && getSeatFill(seat.type) !== "transparent"
                ? "white"
                : "inherit",
          }}
        >
          {seatLabel}
        </Text>
      </Tooltip>
    </div>
  );
};

// Seat Type Legend Component
const SeatTypeLegend = ({ seatTypes }) => (
  <div className="mt-8 pt-4 border-t border-gray-200 flex flex-wrap gap-3 justify-center">
    {seatTypes.map((type) => (
      <div key={type.id} className="flex items-center">
        <div
          className="w-4 h-4 mr-1 rounded"
          style={{ backgroundColor: type.color }}
        />

        <Text>
          {type.label} - ${type.basePrice.toFixed(2)}
        </Text>
      </div>
    ))}
  </div>
);

export default TheaterGrid;
