import React, { useState } from "react";
import { Card, Button, DatePicker, Tag, Tooltip, Checkbox, Space } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  CalendarOutlined,
  TagOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

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

const OfferCard = ({
  item,
  type,
  onRemove,
  onDateChange,
  onDaysChange,
  getDisabledDate,
}) => {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [isEditingDays, setIsEditingDays] = useState(false);
  const itemData = type === "offer" ? item.offer : item.coupons;

  const handleDateRangeChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      onDateChange(itemData.id, dates);
      setIsEditingDate(false);
    }
  };

  const handleDaysChange = (checkedValues) => {
    onDaysChange(itemData.id, checkedValues);
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
            <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
              <TagOutlined className="text-orange-600 text-xs" />
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
                onClick={() => onRemove(itemData.id)}
                className="hover:bg-red-50"
              />
            </Tooltip>
          </div>
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
        <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <ClockCircleOutlined className="text-blue-600 text-xs" />
              <span className="text-xs font-medium text-blue-800">
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
                    <Tag key={dayValue} color="blue" className="text-xs m-0">
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

export default OfferCard;
