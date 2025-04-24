import React from "react";
import { Card, Row, Button, Typography, Space, Tag } from "antd";
import { CloseCircleOutlined, CalendarOutlined } from "@ant-design/icons";

import dayjs from "dayjs";
import { OfferDateValidation } from "../utils/OfferDateValidation";

const { Text } = Typography;

export const OfferItemCard = ({
  item,
  type,
  onDelete,
  onDateChange,
  scheduleStartDate,
  scheduleEndDate,
}) => {
  const itemData = type === "offer" ? item.offer : item.coupons;
  console.log(itemData, "itemsdata");

  return (
    <Card
      size="small"
      hoverable
      style={{
        marginBottom: "12px",
        cursor: "pointer",
        position: "relative",
      }}
      onClick={() => onDateChange(item)}
    >
      <Button
        type="text"
        icon={<CloseCircleOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item);
        }}
        style={{
          position: "absolute",
          top: "12px",
          right: "-40px",
        }}
      />

      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        <Row justify="space-between" align="middle">
          <Text strong>{itemData.name}</Text>
          <Tag color="blue">Max Uses: {itemData.max_uses}</Tag>
        </Row>

        <Row justify="space-between" align="middle" style={{ width: "100%" }}>
          <Space>
            <CalendarOutlined />
            <Text type="secondary">
              Start:{" "}
              {itemData.start_date && dayjs(itemData.start_date).isValid()
                ? dayjs(itemData.start_date).format("YYYY-MM-DD")
                : "N/A"}
            </Text>
          </Space>
          <Space>
            <CalendarOutlined />
            <Text type="secondary">
              End:{" "}
              {itemData.end_date && dayjs(itemData.end_date).isValid()
                ? dayjs(itemData.end_date).format("YYYY-MM-DD")
                : "N/A"}
            </Text>
          </Space>
        </Row>

        {!OfferDateValidation.isDateValid(
          scheduleStartDate,
          scheduleEndDate,
          itemData.start_date,
          itemData.end_date
        ) && (
          <Text type="warning" style={{ fontSize: "12px" }}>
            The selected item has an invalid date. You can choose a different
            date; otherwise, the schedule date will be used by default.
          </Text>
        )}
      </Space>
    </Card>
  );
};
