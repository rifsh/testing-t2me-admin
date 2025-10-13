import React, { useState } from "react";
import { Card, Button, DatePicker, Tag, Tooltip, Checkbox, Space } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  CalendarOutlined,
  PercentageOutlined,
  CopyOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { message } from "antd";

const { RangePicker } = DatePicker;

const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

const CouponCard = ({
  item,
  type,
  onRemove,
  onDateChange,
  onDaysChange,
  getDisabledDate,
}) => {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isEditingDays, setIsEditingDays] = useState(false);
  const itemData = item.coupons;

  const handleDateRangeChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      onDateChange(item.id, dates);
      setIsEditingDate(false);
    }
  };

  const handleDaysChange = (checkedValues) => {
    onDaysChange(item.id, checkedValues);
  };

  const handleCopyCode = () => {
    if (itemData.key_words && itemData.key_words.length > 0) {
      navigator.clipboard.writeText(itemData.key_words[0]);
      message.success("Coupon code copied!");
    }
  };

  return (
    <Card
      size="small"
      className="hover:shadow-md transition-shadow duration-200 border border-gray-200 rounded-xl"
      bodyStyle={{ padding: "12px" }}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
              <PercentageOutlined className="text-green-600 text-xs" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-xs truncate">
                {itemData.name}
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
                onClick={() => onRemove(item.id)}
                className="hover:bg-red-50"
              />
            </Tooltip>
          </div>
        </div>

        {/* Coupon Code */}
        {itemData.key_words && itemData.key_words.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-600">Code</p>
                <p className="font-mono text-sm font-bold text-green-800">
                  {itemData.key_words[0]}
                </p>
              </div>
              <Tooltip title="Copy code">
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={handleCopyCode}
                  className="hover:bg-white"
                />
              </Tooltip>
            </div>
          </div>
        )}

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
            <Button size="small" block onClick={() => setIsEditingDate(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <CalendarOutlined className="text-gray-500" />
                <span className="text-gray-600">
                  {dayjs(itemData.start_date).format("MMM DD")}
                </span>
              </div>
              <span className="text-gray-400">to</span>
              <span className="text-gray-600">
                {dayjs(itemData.end_date).format("MMM DD")}
              </span>
            </div>
          </div>
        )}

        {/* Day Selection Section */}
        <div className="bg-purple-50 rounded-lg p-2 border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <ClockCircleOutlined className="text-purple-600 text-xs" />
              <span className="text-xs font-medium text-purple-800">
                Active Days
              </span>
            </div>
            <Button
              type="link"
              size="small"
              onClick={() => setIsEditingDays(!isEditingDays)}
              className="text-xs h-auto p-0"
            >
              {isEditingDays ? "Done" : "Edit"}
            </Button>
          </div>

          {isEditingDays ? (
            <Checkbox.Group
              value={itemData.selected_days || []}
              onChange={handleDaysChange}
              className="w-full"
            >
              <Space direction="vertical" size="small" className="w-full">
                {DAYS_OF_WEEK.map((day) => (
                  <Checkbox key={day.value} value={day.value}>
                    <span className="text-xs">{day.label}</span>
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          ) : (
            <div className="flex flex-wrap gap-1">
              {itemData.selected_days && itemData.selected_days.length > 0 ? (
                itemData.selected_days.map((dayValue) => {
                  const day = DAYS_OF_WEEK.find((d) => d.value === dayValue);
                  return (
                    <Tag key={dayValue} color="purple" className="text-xs m-0">
                      {day?.label}
                    </Tag>
                  );
                })
              ) : (
                <span className="text-xs text-gray-500 italic">
                  All days (click Edit to select specific days)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-blue-50 rounded p-1.5 text-center">
            <p className="text-blue-600 font-medium">{itemData.max_uses}</p>
            <p className="text-blue-500 text-[10px]">Max Uses</p>
          </div>
          <div className="bg-gray-50 rounded p-1.5 text-center">
            <p className="text-gray-600 font-medium">
              {itemData.used_count || 0}
            </p>
            <p className="text-gray-500 text-[10px]">Used</p>
          </div>
        </div>

        {/* Discount Info */}
        {itemData.discount_percentage_amount && (
          <Tag color="green" className="w-full text-center">
            {itemData.discount_percentage_amount}% OFF
          </Tag>
        )}
      </div>
    </Card>
  );
};

export default CouponCard;
