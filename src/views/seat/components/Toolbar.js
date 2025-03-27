import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  zoomIn,
  zoomOut,
  fitToScreen,
  deleteSelectedSeats,
  toggleGrid,
  duplicateSelectedSeats,
  saveState,
  undo,
  redo,
  resetState,
} from "store/slices/seatSlice";
import { Tooltip } from "antd";
import { RiRectangleLine } from "react-icons/ri";
import {
  ExpandOutlined,
  SelectOutlined,
  PlusCircleOutlined,
  DeleteOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  AimOutlined,
  BorderOutlined,
  DragOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  MenuUnfoldOutlined,
  CopyOutlined,
  SignatureOutlined,
  FormOutlined,
  MinusOutlined,
  BorderlessTableOutlined,
  UndoOutlined,
  RedoOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { IoFilterCircleOutline } from "react-icons/io5";
import { LuSquareMenu } from "react-icons/lu";

import { PiBezierCurve, PiPencilLineBold } from "react-icons/pi";
import AlignmentSelector from "./AlignmentSelector";
import GridSeatButton from "./GridSeatButton";
import CategorySelector from "./CategorySelector";
import { useSidebar } from "utils/hooks/useSidebar";
import SeatCurve from "./SeatCurve";
import { FaRegCircle } from "react-icons/fa";

// Button styling function
const buttonStyle = (isActive) => ({
  backgroundColor: isActive ? "#e6f7ff" : "white",
  border: isActive ? "1px solid #1890ff" : "1px solid #d9d9d9",
  padding: "4px 8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

// Toolbar Button Component
const ToolbarButton = ({
  tooltip,
  onClick,
  active,
  icon,
  disabled = false,
}) => (
  <Tooltip title={tooltip}>
    <button onClick={onClick} style={buttonStyle(active)} disabled={disabled}>
      {icon}
    </button>
  </Tooltip>
);

// Section Divider Component
const ToolbarDivider = () => (
  <div
    style={{
      borderRight: "1px solid #eee",
      height: "24px",
      marginRight: "10px",
    }}
  />
);

const Toolbar = ({
  activeTool,
  onToolChange,
  showGrid,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const dispatch = useDispatch();
  const { openSidebar } = useSidebar();

  // Selectors
  const selectedSeats = useSelector((state) => state.seat.selectedSeats);
  const { past, future } = useSelector((state) => ({
    past: state.seat.past,
    future: state.seat.future,
  }));

  // Tool buttons configuration
  const toolButtons = [
    {
      tooltip: "Add Seats",
      tool: "add",
      icon: <PlusCircleOutlined size={20} />,
    },
    {
      tooltip: "Select Seats (Rectangle)",
      tool: "select",
      icon: <SelectOutlined size={20} />,
    },
    {
      tooltip: "Click Select",
      tool: "clickSelect",
      icon: <AimOutlined size={20} />,
    },
    {
      tooltip: "Drag Seats",
      tool: "drag",
      icon: <DragOutlined size={20} />,
    },
  ];

  const drawingButtons = [
    {
      tooltip: "Select/Move",
      tool: "move",
      icon: <FormOutlined size={20} />,
    },
    {
      tooltip: "Straight Line",
      tool: "line",
      icon: <MinusOutlined size={20} />,
    },
    {
      tooltip: "Freehand Draw",
      tool: "freehand",
      icon: <PiPencilLineBold size={20} v />,
    },
    {
      tooltip: "Draw Square",
      tool: "square",
      icon: <BorderOutlined size={20} />,
    },
    {
      tooltip: "Draw Circle",
      tool: "circle",
      icon: <FaRegCircle size={20} />,
    },
    {
      tooltip: "Draw Curve",
      tool: "curve",
      icon: <PiBezierCurve size={20} />,
    },
    {
      tooltip: "Draw Square with Seats",
      tool: "drawSquare",
      icon: <LuSquareMenu size={20} />,
    },
    {
      tooltip: "Draw Circle with Seats",
      tool: "drawCircle",
      icon: <IoFilterCircleOutline size={20} />,
    },
  ];

  // Handler for opening seat curve sidebar
  const handleOpenSeatCurveSidebar = () => {
    openSidebar(<SeatCurve />);
  };

  // Wrapper for dispatching actions with state saving
  const dispatchWithSave = (action) => {
    dispatch(saveState());
    dispatch(action);
  };

  return (
    <div
      style={{
        marginBottom: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* First Line: Main Tools and Drawing Tools */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center",
        }}
      >
        {/* Tool Selection */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {toolButtons.map(({ tooltip, tool, icon }) => (
            <ToolbarButton
              key={tool}
              tooltip={tooltip}
              onClick={() => onToolChange(tool)}
              active={activeTool === tool}
              icon={icon}
            />
          ))}
        </div>

        {/* Drawing Tools */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {drawingButtons.map(({ tooltip, tool, icon }) => (
            <ToolbarButton
              key={tool}
              tooltip={tooltip}
              onClick={() => onToolChange(tool)}
              active={activeTool === tool}
              icon={icon}
            />
          ))}
        </div>
      </div>

      {/* Second Line: Additional Controls and Advanced Features */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center",
        }}
      >
        {/* Category Selector */}
        <CategorySelector />
        <ToolbarDivider />

        {/* Alignment Selector */}
        <AlignmentSelector />
        <ToolbarDivider />

        {/* Seat Manipulation */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <GridSeatButton />
          <ToolbarButton
            tooltip="Delete Selected"
            onClick={() => dispatchWithSave(deleteSelectedSeats())}
            icon={<DeleteOutlined />}
          />
          <ToolbarButton
            tooltip="Duplicate Selected"
            onClick={() => dispatchWithSave(duplicateSelectedSeats())}
            icon={<CopyOutlined />}
          />
        </div>
        <ToolbarDivider />

        {/* History Management */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <ToolbarButton
            tooltip="Undo"
            onClick={() => dispatch(undo())}
            icon={<UndoOutlined />}
            disabled={past.length === 0}
          />
          <ToolbarButton
            tooltip="Redo"
            onClick={() => dispatch(redo())}
            icon={<RedoOutlined />}
            disabled={future.length === 0}
          />
          <ToolbarButton
            tooltip="Reset Canvas"
            onClick={() => dispatchWithSave(resetState())}
            icon={<ReloadOutlined />}
          />
        </div>
        <ToolbarDivider />

        {/* Zoom Controls */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <ToolbarButton
            tooltip="Zoom In"
            onClick={() => dispatch(zoomIn())}
            icon={<ZoomInOutlined />}
          />
          <ToolbarButton
            tooltip="Zoom Out"
            onClick={() => dispatch(zoomOut())}
            icon={<ZoomOutOutlined />}
          />
          <ToolbarButton
            tooltip="Fit to Screen"
            onClick={() => dispatch(fitToScreen())}
            icon={<ExpandOutlined />}
          />
        </div>
        <ToolbarDivider />

        {/* Grid and Fullscreen */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <ToolbarButton
            tooltip="Toggle Grid"
            onClick={() => dispatch(toggleGrid())}
            active={showGrid}
            icon={<BorderlessTableOutlined />}
          />
          <ToolbarButton
            tooltip={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            onClick={onToggleFullscreen}
            active={isFullscreen}
            icon={
              isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />
            }
          />
        </div>

        {/* Seat Configuration (Conditional) */}
        {selectedSeats.length > 0 && (
          <ToolbarButton
            tooltip="Seat Configuration"
            onClick={handleOpenSeatCurveSidebar}
            icon={<MenuUnfoldOutlined />}
          />
        )}
      </div>
    </div>
  );
};

export default Toolbar;
