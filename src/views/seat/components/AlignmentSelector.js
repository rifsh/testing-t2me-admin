import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Tooltip } from "antd";
import {
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
  BorderHorizontalOutlined,
} from "@ant-design/icons";

// Alignment action types
const alignmentTypes = [
  {
    type: "left",
    tooltip: "Align Left",
    icon: <AlignLeftOutlined />,
  },
  {
    type: "center",
    tooltip: "Align Center",
    icon: <AlignCenterOutlined />,
  },
  {
    type: "right",
    tooltip: "Align Right",
    icon: <AlignRightOutlined />,
  },
  {
    type: "top",
    tooltip: "Align Top",
    icon: <VerticalAlignTopOutlined />,
  },
  {
    type: "bottom",
    tooltip: "Align Bottom",
    icon: <VerticalAlignBottomOutlined />,
  },
  {
    type: "distribute",
    tooltip: "Distribute Evenly",
    icon: <BorderHorizontalOutlined />,
  },
];

// Alignment button component
const AlignmentButton = ({ alignment, onClick }) => (
  <Tooltip title={alignment.tooltip}>
    <button
      onClick={() => onClick(alignment.type)}
      style={{
        backgroundColor: "white",
        border: "1px solid #d9d9d9",
        padding: "4px 8px",
        cursor: "pointer",
      }}
    >
      {alignment.icon}
    </button>
  </Tooltip>
);

const AlignmentSelector = () => {
  const dispatch = useDispatch();
  const { selectedSeats } = useSelector((state) => state.seat);

  // Alignment action
  const alignSeats = (alignType) => {
    // Only allow alignment if at least 2 seats are selected
    if (selectedSeats.length < 2) return;

    // Dispatch the alignment action with the correct payload
    dispatch({
      type: "seat/alignSeats",
      payload: { alignType },
    });
  };

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      {alignmentTypes.map((alignment) => (
        <AlignmentButton
          key={alignment.type}
          alignment={alignment}
          onClick={alignSeats}
        />
      ))}
    </div>
  );
};

export default AlignmentSelector;
