// LayoutToolbar.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearSelection, zoomIn, zoomOut, resetZoom } from "store/slices/movieSeatSlice";
import { Button, Tooltip, Switch, Badge, Popover } from "antd";
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  UndoOutlined,
  SaveOutlined,
  SettingOutlined,
  AppstoreOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import ConfigPanel from "./ConfigPanel";
import TypeManager from "./TypeManager";

const LayoutToolbar = ({
  isPreviewMode,
  setIsPreviewMode,
  showHiddenSeats,
  setShowHiddenSeats,
  selectedSeats,
  handleToggleVisibility,
  handleApplyChanges,
  handleSaveLayout,
}) => {
  const dispatch = useDispatch();
  const { selectedSeatType, seatTypes, zoomLevel } = useSelector(
    (state) => state.movieSeatSlice
  );
  

  const handleZoomIn = () => {
    dispatch(zoomIn());
  };

  const handleZoomOut = () => {
    dispatch(zoomOut());
  };

  const handleResetZoom = () => {
    dispatch(resetZoom());
  };

  // Config panel content
  const configContent = <ConfigPanel />;

  // Type manager content
  const typeManagerContent = (
    <div style={{ width: 300 }}>
      <TypeManager />
    </div>
  );

  // Get the currently selected seat type object
  const getSelectedSeatTypeObject = () => {
    return (
      seatTypes.find((type) => type.id === selectedSeatType) || seatTypes[0]
    );
  };

  const selectedType = getSelectedSeatTypeObject();

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-2">
          {/* Layout Setup */}
          <Popover
            content={configContent}
            title="Layout Setup"
            trigger="click"
            placement="bottomLeft"
            overlayStyle={{ width: "300px" }}
          >
            <Button icon={<SettingOutlined />}>Layout</Button>
          </Popover>

          {/* Seat Types */}
          <Popover
            content={typeManagerContent}
            title="Seat Types"
            trigger="click"
            placement="bottomLeft"
          >
            <Button icon={<AppstoreOutlined />}>
              <Badge color={selectedType.color}></Badge>
              {selectedType.label}
            </Button>
          </Popover>

          {/* Zoom Controls */}
          <Button.Group>
            <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
            <Button style={{ width: "60px", pointerEvents: "none" }}>
              {zoomLevel}%
            </Button>
            <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
            <Button icon={<UndoOutlined />} onClick={handleResetZoom} />
          </Button.Group>

          <Tooltip title="Preview Mode">
            <Switch
              checked={isPreviewMode}
              onChange={(checked) => setIsPreviewMode(checked)}
              checkedChildren={<EyeOutlined />}
              unCheckedChildren={<EditOutlined />}
            />
          </Tooltip>

          <Tooltip title="Show Hidden Seats">
            <Switch
              checked={showHiddenSeats}
              onChange={(checked) => setShowHiddenSeats(checked)}
              checkedChildren={<EyeOutlined />}
              unCheckedChildren={<EyeInvisibleOutlined />}
            />
          </Tooltip>
        </div>

        <div className="flex items-center space-x-2">
          {!isPreviewMode && (
            <>
              <Button
                onClick={handleToggleVisibility}
                disabled={selectedSeats.length === 0}
              >
                Toggle Visibility 
              </Button>

              <Button
                onClick={() => dispatch(clearSelection())}
                disabled={selectedSeats.length === 0}
              >
                Clear ({selectedSeats.length})
              </Button>

              <Button
                type="primary"
                onClick={handleApplyChanges}
                disabled={selectedSeats.length === 0}
                icon={<SaveOutlined />}
              >
                Apply Changes
              </Button>
            </>
          )}

          {isPreviewMode && (
            <Button
              icon={<SaveOutlined />}
              type="primary"
              onClick={handleSaveLayout}
            >
              Save Layout
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LayoutToolbar;