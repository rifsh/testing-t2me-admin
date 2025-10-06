import React, { useState } from "react";
import { Card, Button, DatePicker, Tag, Tooltip, Badge } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  CalendarOutlined,
  PercentageOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { message } from "antd";

const { RangePicker } = DatePicker;

const CouponCard = ({ item, type, onRemove, onDateChange, getDisabledDate }) => {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const itemData = item.coupons;

  const handleDateRangeChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      onDateChange(item.id, dates);
      setIsEditingDate(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(itemData.code);
    message.success("Coupon code copied to clipboard!");
  };

  const getStatusColor = () => {
    if (itemData.wasAdjusted) return "orange";
    return "green";
  };

  const getStatusText = () => {
    if (itemData.wasAdjusted) return "Dates Adjusted";
    return "Valid";
  };

  const getRemainingUses = () => {
    const used = itemData.used_count || 0;
    const max = itemData.max_uses;
    return max - used;
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
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <PercentageOutlined className="text-green-600 text-sm" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm truncate">
                {itemData.name}
              </p>
              <p className="text-xs text-gray-500">Coupon</p>
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
                onClick={() => onRemove(item.id)}
                className="hover:bg-red-50"
              />
            </Tooltip>
          </div>
        </div>

        {/* Coupon Code */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Coupon Code</p>
              <p className="font-mono text-lg font-bold text-green-800 tracking-wider">
                {itemData.code}
              </p>
            </div>
            <Tooltip title="Copy code">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={handleCopyCode}
                className="hover:bg-white hover:text-green-600"
              />
            </Tooltip>
          </div>
        </div>

        {/* Status and Usage */}
        <div className="flex items-center justify-between">
          <Tag color={getStatusColor()} size="small" className="rounded">
            {itemData.wasAdjusted && (
              <ExclamationCircleOutlined className="mr-1" />
            )}
            {getStatusText()}
          </Tag>
          <div className="flex items-center space-x-2">
            <Badge
              count={getRemainingUses()}
              showZero
              color="blue"
              size="small"
            />
            <span className="text-xs text-gray-500">remaining</span>
          </div>
        </div>

        {/* Date Range */}
        {isEditingDate ? (
          <div className="space-y-2">
            <RangePicker
              size="small"
              value={[
                dayjs(itemData.start_date),
                dayjs(itemData.end_date)
              ]}
              onChange={handleDateRangeChange}
              disabledDate={getDisabledDate}
              className="w-full"
              format="MMM DD, YYYY"
            />
            <div className="flex justify-end space-x-2">
              <Button
                size="small"
                onClick={() => setIsEditingDate(false)}
              >
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

        {/* Usage Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-blue-50 rounded p-2 text-center">
            <p className="text-blue-600 font-medium">{itemData.max_uses}</p>
            <p className="text-blue-500">Max Uses</p>
          </div>
          <div className="bg-gray-50 rounded p-2 text-center">
            <p className="text-gray-600 font-medium">{itemData.used_count || 0}</p>
            <p className="text-gray-500">Used</p>
          </div>
        </div>

        {/* Warning for adjusted dates */}
        {itemData.wasAdjusted && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
            <div className="flex items-start space-x-2">
              <ExclamationCircleOutlined className="text-orange-500 text-xs mt-0.5" />
              <div className="text-xs">
                <p className="text-orange-800 font-medium">Dates Adjusted</p>
                <p className="text-orange-700">
                  Original: {dayjs(itemData.original_start_date).format("MMM DD")} - {dayjs(itemData.original_end_date).format("MMM DD")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Additional coupon info */}
        {itemData.description && (
          <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
            {itemData.description}
          </div>
        )}
      </div>
    </Card>
  );
};

export default CouponCard;
