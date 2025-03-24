import React from 'react';
import { useDispatch } from 'react-redux';
import { zoomIn, zoomOut, fitToScreen, deleteSelectedSeats, toggleGrid } from 'store/slices/seatSlice';
import { Tooltip } from 'antd';
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
  TableOutlined
} from "@ant-design/icons";

// Import the GridSeatButton component
import GridSeatButton from './GridSeatButton';
import CategorySelector from './CategorySelector';

// Extracted button styling for consistency
const buttonStyle = (isActive) => ({
  backgroundColor: isActive ? "#e6f7ff" : "white",
  border: isActive ? "1px solid #1890ff" : "1px solid #d9d9d9",
  padding: '4px 8px',
  cursor: 'pointer'
});

// Component for toolbar buttons
const ToolbarButton = ({ tooltip, onClick, active, icon }) => (
  <Tooltip title={tooltip}>
    <button 
      onClick={onClick} 
      style={buttonStyle(active)}
    >
      {icon}
    </button>
  </Tooltip>
);

// Section divider component
const ToolbarDivider = () => (
  <div style={{ borderRight: '1px solid #eee', marginRight: '10px' }} />
);

const Toolbar = ({ activeTool, onToolChange, showGrid, isFullscreen, onToggleFullscreen }) => {
  const dispatch = useDispatch();
  
  // Tool buttons configuration
  const toolButtons = [
    { 
      tooltip: "Add Seats", 
      tool: "add", 
      icon: <PlusCircleOutlined /> 
    },
    { 
      tooltip: "Select Seats (Rectangle)", 
      tool: "select", 
      icon: <SelectOutlined /> 
    },
    { 
      tooltip: "Click Select", 
      tool: "clickSelect", 
      icon: <AimOutlined /> 
    },
    { 
      tooltip: "Drag Seats", 
      tool: "drag", 
      icon: <DragOutlined /> 
    }
  ];
  
  return (
    <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
      {/* Tool selection section */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
      
      <ToolbarDivider />
      
      {/* Category selector */}
      <CategorySelector />
      
      <ToolbarDivider />
      
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <GridSeatButton />
        
        <ToolbarButton
          tooltip="Delete Selected"
          onClick={() => dispatch(deleteSelectedSeats())}
          active={false}
          icon={<DeleteOutlined />}
        />
      </div>
      
      <ToolbarDivider />
      
      {/* Zoom controls section */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <ToolbarButton
          tooltip="Toggle Grid"
          onClick={() => dispatch(toggleGrid())}
          active={showGrid}
          icon={<BorderOutlined />}
        />
        
        <ToolbarButton
          tooltip={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          onClick={onToggleFullscreen}
          active={isFullscreen}
          icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
        />
      </div>
    </div>
  );
};

export default Toolbar;