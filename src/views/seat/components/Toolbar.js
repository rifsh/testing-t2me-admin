import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  zoomIn,
  zoomOut,
  fitToScreen,
  deleteSelectedSeats,
  toggleGrid,
  duplicateSelectedSeats,
} from "store/slices/seatSlice";
import { Tooltip } from "antd";
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
} from "@ant-design/icons";
import { PiBezierCurve } from "react-icons/pi";
import AlignmentSelector from "./AlignmentSelector";
import GridSeatButton from "./GridSeatButton";
import CategorySelector from "./CategorySelector";
import { useSidebar } from "utils/hooks/useSidebar";
import SeatCurve from "./SeatCurve";

const buttonStyle = (isActive) => ({
  backgroundColor: isActive ? "#e6f7ff" : "white",
  border: isActive ? "1px solid #1890ff" : "1px solid #d9d9d9",
  padding: "4px 8px",
  cursor: "pointer",
});

// Component for toolbar buttons
const ToolbarButton = ({ tooltip, onClick, active, icon }) => (
  <Tooltip title={tooltip}>
    <button onClick={onClick} style={buttonStyle(active)}>
      {icon}
    </button>
  </Tooltip>
);

// Section divider component
const ToolbarDivider = () => (
  <div style={{ borderRight: "1px solid #eee", marginRight: "10px" }} />
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

  // Get selected seats from Redux store
  const selectedSeats = useSelector((state) => state.seat.selectedSeats);
  // Tool buttons configuration
  const toolButtons = [
    {
      tooltip: "Add Seats",
      tool: "add",
      icon: <PlusCircleOutlined />,
    },
    {
      tooltip: "Select Seats (Rectangle)",
      tool: "select",
      icon: <SelectOutlined />,
    },
    {
      tooltip: "Click Select",
      tool: "clickSelect",
      icon: <AimOutlined />,
    },
    {
      tooltip: "Drag Seats",
      tool: "drag",
      icon: <DragOutlined />,
    },
  ];
  const drawingButtons = [
    {
      tooltip: "Select/Move",
      tool: "move",
      icon: <FormOutlined />,
    },
    {
      tooltip: "Draw Line",
      tool: "line",
      icon: <MinusOutlined />,
    },
    {
      tooltip: "Draw Square",
      tool: "square",
      icon: <BorderOutlined />,
    },
    {
      tooltip: "Draw Circle",
      tool: "circle",
      icon: <SignatureOutlined />,
    },
    {
      tooltip: "Draw Curve",
      tool: "curve",
      icon: <PiBezierCurve />,
    },
  ];
  const handleOpenSeatCurveSidebar = () => {
    openSidebar(<SeatCurve />);
  };
  return (
    <div
      style={{
        marginBottom: "10px",
        display: "flex",
        gap: "10px",
        alignItems: "center",
      }}
    >
      {/* Tool selection section */}
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

      <ToolbarDivider />

      {/* Category selector */}
      <CategorySelector />

      <ToolbarDivider />

      {/* Alignment Selector */}
      <AlignmentSelector />

      <ToolbarDivider />

      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <GridSeatButton />
        <ToolbarButton
          tooltip="Delete Selected"
          onClick={() => dispatch(deleteSelectedSeats())}
          active={false}
          icon={<DeleteOutlined />}
        />{" "}
        <ToolbarButton
          tooltip="Duplicate Selected"
          onClick={() => dispatch(duplicateSelectedSeats())}
          active={false}
          icon={<CopyOutlined />}
        />
      </div>

      <ToolbarDivider />

      {/* Zoom controls section */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <ToolbarButton
          tooltip="Zoom In"
          onClick={() => dispatch(zoomIn())}
          active={false}
          icon={<ZoomInOutlined />}
        />

        <ToolbarButton
          tooltip="Zoom Out"
          onClick={() => dispatch(zoomOut())}
          active={false}
          icon={<ZoomOutOutlined />}
        />

        <ToolbarButton
          tooltip="Fit to Screen"
          onClick={() => dispatch(fitToScreen())}
          active={false}
          icon={<ExpandOutlined />}
        />
      </div>

      <ToolbarDivider />

      {/* Display options section */}
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
      {selectedSeats.length > 0 && (
        <ToolbarButton
          tooltip="Seat Configuration"
          onClick={handleOpenSeatCurveSidebar}
          active={false}
          icon={<MenuUnfoldOutlined />}
        />
      )}
    </div>
  );
};

export default Toolbar;
