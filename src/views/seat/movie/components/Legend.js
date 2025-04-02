import { SEAT_CATEGORIES, SEAT_TYPES } from "constants/SeatTypes";
import React from "react";
import { Space, Divider, Typography } from "antd";

const { Text } = Typography;

const Legend = () => {
  return (
    <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
      <Space wrap style={{ justifyContent: "center", width: "100%" }}>
        <Space>
          <Text strong>Seat Types:</Text>
          {SEAT_TYPES.map((type) => (
            <Space key={type.id} size={4}>
              <span
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  border: "1px solid #d9d9d9",
                  borderRadius: "2px",
                  opacity: type.id === "hidden" ? 0.3 : 1,
                }}
              />
              <Text>{type.label}</Text>
            </Space>
          ))}
        </Space>

        <Divider type="vertical" />

        <Space>
          <Text strong>Categories:</Text>
          {SEAT_CATEGORIES.map((cat) => (
            <Space key={cat.id} size={4}>
              <span
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  border: `2px solid ${cat.borderColor
                    .replace("border-", "")
                    .replace("-500", "")}`,
                  borderRadius: "2px",
                }}
              />
              <Text>{cat.label}</Text>
            </Space>
          ))}
        </Space>
      </Space>
    </div>
  );
};

export default Legend;
