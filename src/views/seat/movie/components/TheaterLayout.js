import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearSelection, applySeatType, toggleSeatVisibility } from "store/slices/movieSeatSlice";
import { Modal, Card } from "antd";
import LayoutToolbar from "./LayoutToolbar";
import TheaterGrid from "./TheaterGrid";

const TheaterLayout = () => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showHiddenSeats, setShowHiddenSeats] = useState(true);

  const dispatch = useDispatch();
  const { selectedSeats, selectedSeatType, seatTypes } = useSelector((state) => state.movieSeatSlice);

  const handleApplyChanges = () => {
    if (selectedSeats.length === 0) return;

    dispatch(
      applySeatType({
        selectedSeats,
        selectedSeatType,
        seatTypes,
      })
    );

    dispatch(clearSelection());

    Modal.success({
      title: "Changes Applied",
      content: "Your seat changes have been applied successfully.",
    });
  };

  const handleSaveLayout = () => {
    Modal.success({
      title: "Layout Saved",
      content: "Your theater layout has been saved successfully.",
    });
  };

  const handleToggleVisibility = () => {
    if (selectedSeats.length === 0) return;

    dispatch(
      toggleSeatVisibility({
        selectedSeats,
      })
    );

    dispatch(clearSelection());
  };

  return (
    <div className="bg-gray-50 flex flex-col">
      <Card>
        <LayoutToolbar 
          isPreviewMode={isPreviewMode}
          setIsPreviewMode={setIsPreviewMode}
          showHiddenSeats={showHiddenSeats}
          setShowHiddenSeats={setShowHiddenSeats}
          selectedSeats={selectedSeats}
          handleToggleVisibility={handleToggleVisibility}
          handleApplyChanges={handleApplyChanges}
          handleSaveLayout={handleSaveLayout}
        />
      </Card>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto">
          <TheaterGrid
            isPreviewMode={isPreviewMode}
            showHiddenSeats={showHiddenSeats}
          />
        </div>
      </div>
    </div>
  );
};

export default TheaterLayout;