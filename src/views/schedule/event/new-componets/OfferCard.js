import React, { useState } from "react";
import { Card, Button, DatePicker, Tag, Tooltip } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  CalendarOutlined,
  TagOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const OfferCard = ({ item, type, onRemove, onDateChange, getDisabledDate }) => {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const itemData = type === "offer" ? item.offer : item.coupons;

  const handleDateRangeChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      onDateChange(itemData.id, dates);
      setIsEditingDate(false);
    }
  };

  const getStatusColor = () => {
    if (itemData.wasAdjusted) return "orange";
    return "green";
  };

  const getStatusText = () => {
    if (itemData.wasAdjusted) return "Dates Adjusted";
    return "Valid";
  };

  return (
    <Card
      size="small"
      className="hover:shadow-md transition-shadow duration-200 border border-gray-200 rounded-xl"
      bodyStyle={{ padding: "16px" }}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <TagOutlined className="text-orange-600 text-sm" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm truncate">
                {itemData.name}
              </p>
              <p className="text-xs text-gray-500">
                {type === "offer" ? "Offer" : "Coupon"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Tooltip title="Edit dates">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => setIsEditingDate(!isEditingDate)}
                className="hover:bg-blue-50 hover:text-blue-600"
              />
            </Tooltip>
            <Tooltip title="Remove">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onRemove(itemData.id)}
                className="hover:bg-red-50"
              />
            </Tooltip>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <Tag color={getStatusColor()} size="small" className="rounded">
            {itemData.wasAdjusted && (
              <ExclamationCircleOutlined className="mr-1" />
            )}
            {getStatusText()}
          </Tag>
          {type === "offer" && (
            <Tag color="green" size="small">
              {itemData.discount_type === "percentage"
                ? `${itemData.discount_value}% OFF`
                : `$${itemData.discount_value} OFF`}
            </Tag>
          )}
        </div>

        {/* Date Range */}
        {isEditingDate ? (
          <div className="space-y-2">
            <RangePicker
              size="small"
              value={[dayjs(itemData.start_date), dayjs(itemData.end_date)]}
              onChange={handleDateRangeChange}
              disabledDate={getDisabledDate}
              className="w-full"
              format="MMM DD, YYYY"
            />
            <div className="flex justify-end space-x-2">
              <Button size="small" onClick={() => setIsEditingDate(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <CalendarOutlined className="text-gray-500" />
                <span className="text-gray-600">Start:</span>
                <span className="font-medium">
                  {dayjs(itemData.start_date).format("MMM DD")}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-600">End:</span>
                <span className="font-medium">
                  {dayjs(itemData.end_date).format("MMM DD")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        {type === "offer" && itemData.description && (
          <p className="text-xs text-gray-500 truncate">
            {itemData.description}
          </p>
        )}

        {type === "coupon" && (
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">
              Code:{" "}
              <span className="font-mono bg-gray-100 px-1 rounded">
                {itemData.code}
              </span>
            </span>
            <span className="text-gray-600">Max: {itemData.max_uses}</span>
          </div>
        )}

        {/* Warning for adjusted dates */}
        {itemData.wasAdjusted && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
            <div className="flex items-start space-x-2">
              <ExclamationCircleOutlined className="text-orange-500 text-xs mt-0.5" />
              <div className="text-xs">
                <p className="text-orange-800 font-medium">Dates Adjusted</p>
                <p className="text-orange-700">
                  Original:{" "}
                  {dayjs(itemData.original_start_date).format("MMM DD")} -{" "}
                  {dayjs(itemData.original_end_date).format("MMM DD")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default OfferCard;
