import React, { useState, useEffect, useMemo } from "react";
import {
  Form,
  Select,
  Button,
  message,
  DatePicker,
  Tag,
  Tooltip,
  Empty,
  Alert,
  Collapse,
} from "antd";
import {
  TagOutlined,
  GiftOutlined,
  SaveOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import OfferDateValidation from "./OfferDateValidation";

dayjs.extend(isBetween);

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

// Helper function to get time slots grouped by date
const getTimeSlotsByDate = (showDates) => {
  const timeSlotMap = new Map();

  showDates.forEach((showDate) => {
    const dateStr = showDate.start_date;
    const timeSlots = (showDate.show_times || []).map((st, index) => {
      // Use multiple ID sources, fallback to generated ID
      const id =
        st.id ||
        st.show_time_id ||
        st.showtimeid ||
        `${dateStr}-${st.start_time}`;

      return {
        id,
        start_time: st.start_time,
        end_time: st.end_time,
        ticket_set: st.ticket_set,
        ticket_structure_id: st.ticket_structure_id,
        date: dateStr,
      };
    });

    timeSlotMap.set(dateStr, timeSlots);
  });

  console.log("🗓️ Time slots by date:", {
    totalDates: timeSlotMap.size,
    dates: Array.from(timeSlotMap.keys()),
    sampleTimeSlots: Array.from(timeSlotMap.values())[0],
  });

  return timeSlotMap;
};

// Enhanced Offer Card Component
const EnhancedOfferCard = ({
  item,
  onRemove,
  onDateChange,
  onTimeSlotsChange,
  scheduleStartDate,
  scheduleEndDate,
  existingShowDates,
}) => {
  const itemData = item.offer;
  const [selectionLevel, setSelectionLevel] = useState("schedule");

  const offerStatus = useMemo(() => {
    return OfferDateValidation.getOfferStatus(
      itemData.start_date,
      itemData.end_date,
      itemData.date_required,
      new Date()
    );
  }, [itemData.start_date, itemData.end_date, itemData.date_required]);

  // Get time slots by date
  const timeSlotsByDate = useMemo(() => {
    return getTimeSlotsByDate(existingShowDates);
  }, [existingShowDates]);

  // Filter dates within offer range
  const availableDates = useMemo(() => {
    if (!itemData.start_date || !itemData.end_date) {
      return Array.from(timeSlotsByDate.keys()).map((dateStr) => ({
        date: dateStr,
        display: dayjs(dateStr).format("MMM DD, YYYY"),
        dayName: dayjs(dateStr).format("ddd"),
      }));
    }

    const start = dayjs(itemData.start_date);
    const end = dayjs(itemData.end_date);

    return Array.from(timeSlotsByDate.keys())
      .filter((dateStr) => {
        const date = dayjs(dateStr);
        return date.isBetween(start, end, "day", "[]");
      })
      .map((dateStr) => ({
        date: dateStr,
        display: dayjs(dateStr).format("MMM DD, YYYY"),
        dayName: dayjs(dateStr).format("ddd"),
      }));
  }, [itemData.start_date, itemData.end_date, timeSlotsByDate]);

  const selectedTimeSlotsCount = itemData.selected_time_slots?.length || 0;
  const totalTimeSlotsCount = Array.from(timeSlotsByDate.values()).reduce(
    (sum, slots) => sum + slots.length,
    0
  );

  // Determine level based on selection
  useEffect(() => {
    if (selectedTimeSlotsCount > 0) {
      setSelectionLevel("time");
    } else {
      setSelectionLevel("schedule");
    }
  }, [selectedTimeSlotsCount]);

  const handleTimeSlotToggle = (timeSlotId) => {
    const currentSlots = itemData.selected_time_slots || [];
    const newSlots = currentSlots.includes(timeSlotId)
      ? currentSlots.filter((id) => id !== timeSlotId)
      : [...currentSlots, timeSlotId];
    onTimeSlotsChange(itemData.id, newSlots);
  };

  const handleSelectAllTimeSlots = () => {
    const allTimeSlotIds = [];
    availableDates.forEach(({ date }) => {
      const slots = timeSlotsByDate.get(date) || [];
      slots.forEach((slot) => allTimeSlotIds.push(slot.id));
    });
    onTimeSlotsChange(itemData.id, allTimeSlotIds);
  };

  const handleClearAllTimeSlots = () => {
    onTimeSlotsChange(itemData.id, []);
  };

  const getDatePickerLimits = () => {
    const eventStart = scheduleStartDate ? dayjs(scheduleStartDate) : null;
    const eventEnd = scheduleEndDate ? dayjs(scheduleEndDate) : null;
    const offerStart = itemData.start_date ? dayjs(itemData.start_date) : null;
    const offerEnd = itemData.end_date ? dayjs(itemData.end_date) : null;

    let minDate = eventStart;
    if (offerStart && (!minDate || offerStart.isAfter(minDate))) {
      minDate = offerStart;
    }

    let maxDate = eventEnd;
    if (offerEnd && (!maxDate || offerEnd.isBefore(maxDate))) {
      maxDate = offerEnd;
    }

    return { minDate, maxDate };
  };

  const { minDate, maxDate } = getDatePickerLimits();

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-200 hover:border-orange-300 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <TagOutlined className="text-white text-sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900 text-sm">
                {itemData.name}
              </p>
              <Tag color={offerStatus.color} className="text-xs font-medium">
                {offerStatus.label}
              </Tag>
            </div>
            {itemData.discount_percentage_amount && (
              <p className="text-xs text-orange-600 font-medium">
                {itemData.discount_percentage_amount}% OFF
              </p>
            )}
            {itemData.start_date && itemData.end_date && (
              <p className="text-xs text-gray-500 mt-1">
                Valid: {dayjs(itemData.start_date).format("MMM DD")} -{" "}
                {dayjs(itemData.end_date).format("MMM DD, YYYY")}
              </p>
            )}
          </div>
        </div>
        <Tooltip title="Remove offer">
          <Button
            type="text"
            danger
            size="small"
            icon={<CloseCircleOutlined />}
            onClick={() => onRemove(itemData.id)}
            className="hover:bg-red-100"
          />
        </Tooltip>
      </div>

      {/* Level Indicator */}
      <div className="mb-3">
        {selectionLevel === "schedule" ? (
          <div className="bg-blue-100 border border-blue-300 rounded-lg px-3 py-1.5">
            <p className="text-xs text-blue-800 font-medium flex items-center">
              <CheckOutlined className="mr-1" />
              Schedule Level - Applies to all {totalTimeSlotsCount} time slots
            </p>
          </div>
        ) : (
          <div className="bg-purple-100 border border-purple-300 rounded-lg px-3 py-1.5">
            <p className="text-xs text-purple-800 font-medium flex items-center">
              <ClockCircleOutlined className="mr-1" />
              Time Slot Level - {selectedTimeSlotsCount} of{" "}
              {totalTimeSlotsCount} slots selected
            </p>
          </div>
        )}
      </div>

      {/* Date Range Picker */}
      {itemData.date_required && (
        <div className="mb-3">
          <label className="text-xs text-gray-600 mb-1 block flex items-center">
            <CalendarOutlined className="mr-1" />
            Valid Period (within event dates)
          </label>
          <RangePicker
            size="small"
            value={
              itemData.start_date && itemData.end_date
                ? [dayjs(itemData.start_date), dayjs(itemData.end_date)]
                : null
            }
            onChange={(dates) => onDateChange(itemData.id, dates)}
            className="w-full"
            format="MMM DD, YYYY"
            minDate={minDate}
            maxDate={maxDate}
            disabledDate={(current) => {
              if (!current) return false;

              if (
                scheduleStartDate &&
                current.isBefore(dayjs(scheduleStartDate), "day")
              ) {
                return true;
              }
              if (
                scheduleEndDate &&
                current.isAfter(dayjs(scheduleEndDate), "day")
              ) {
                return true;
              }

              return false;
            }}
          />
          {availableDates.length === 0 &&
            itemData.start_date &&
            itemData.end_date && (
              <Alert
                type="warning"
                message="No show dates available in this date range"
                className="text-xs mt-2"
                showIcon
              />
            )}
        </div>
      )}

      {/* Selection Level Tabs */}
      <div className="mb-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectionLevel("schedule");
              handleClearAllTimeSlots();
            }}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectionLevel === "schedule"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Schedule Level
          </button>
          <button
            type="button"
            onClick={() => setSelectionLevel("time")}
            disabled={availableDates.length === 0}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectionLevel === "time"
                ? "bg-purple-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            Time Slot Level
          </button>
        </div>
      </div>

      {/* Time Slot Selection */}
      {selectionLevel === "schedule" ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-800">
            This offer will apply to all time slots automatically
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-600 flex items-center">
              Select Time Slots
              <span className="ml-1 text-orange-600 font-medium">
                {selectedTimeSlotsCount}/{totalTimeSlotsCount}
              </span>
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handleSelectAllTimeSlots}
                className="text-xs px-2 py-0.5 text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
              >
                All
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={handleClearAllTimeSlots}
                className="text-xs px-2 py-0.5 text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {availableDates.length > 0 ? (
            <Collapse
              accordion
              className="bg-white border border-orange-200 rounded-lg"
            >
              {availableDates.map(({ date, display, dayName }) => {
                const timeSlots = timeSlotsByDate.get(date) || [];
                const selectedCount = timeSlots.filter((slot) =>
                  (itemData.selected_time_slots || []).includes(slot.id)
                ).length;

                return (
                  <Panel
                    header={
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{display}</span>
                          <span className="text-xs text-gray-500">
                            ({dayName})
                          </span>
                        </div>
                        <Tag
                          color={selectedCount > 0 ? "orange" : "default"}
                          className="text-xs"
                        >
                          {selectedCount}/{timeSlots.length}
                        </Tag>
                      </div>
                    }
                    key={date}
                  >
                    <div className="space-y-2 pt-2">
                      {timeSlots.map((slot) => {
                        const isSelected = (
                          itemData.selected_time_slots || []
                        ).includes(slot.id);
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => handleTimeSlotToggle(slot.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                              isSelected
                                ? "bg-orange-100 border-orange-400 shadow-sm"
                                : "bg-gray-50 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <ClockCircleOutlined
                                className={
                                  isSelected
                                    ? "text-orange-600"
                                    : "text-gray-400"
                                }
                              />
                              <span
                                className={`text-sm font-medium ${
                                  isSelected
                                    ? "text-orange-900"
                                    : "text-gray-700"
                                }`}
                              >
                                {slot.start_time} - {slot.end_time}
                              </span>
                            </div>
                            {slot.ticket_set && (
                              <Tag size="small" color="blue">
                                {slot.ticket_set}
                              </Tag>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </Panel>
                );
              })}
            </Collapse>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
              <p className="text-xs text-yellow-800">
                No time slots available in selected date range
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Enhanced Coupon Card Component
const EnhancedCouponCard = ({
  item,
  onRemove,
  onDateChange,
  onTimeSlotsChange,
  scheduleStartDate,
  scheduleEndDate,
  existingShowDates,
}) => {
  const itemData = item.coupons;
  const [selectionLevel, setSelectionLevel] = useState("schedule");

  const couponStatus = useMemo(() => {
    return OfferDateValidation.getOfferStatus(
      itemData.start_date,
      itemData.end_date,
      itemData.date_required,
      new Date()
    );
  }, [itemData.start_date, itemData.end_date, itemData.date_required]);

  const timeSlotsByDate = useMemo(() => {
    return getTimeSlotsByDate(existingShowDates);
  }, [existingShowDates]);

  const availableDates = useMemo(() => {
    if (!itemData.start_date || !itemData.end_date) {
      return Array.from(timeSlotsByDate.keys()).map((dateStr) => ({
        date: dateStr,
        display: dayjs(dateStr).format("MMM DD, YYYY"),
        dayName: dayjs(dateStr).format("ddd"),
      }));
    }

    const start = dayjs(itemData.start_date);
    const end = dayjs(itemData.end_date);

    return Array.from(timeSlotsByDate.keys())
      .filter((dateStr) => {
        const date = dayjs(dateStr);
        return date.isBetween(start, end, "day", "[]");
      })
      .map((dateStr) => ({
        date: dateStr,
        display: dayjs(dateStr).format("MMM DD, YYYY"),
        dayName: dayjs(dateStr).format("ddd"),
      }));
  }, [itemData.start_date, itemData.end_date, timeSlotsByDate]);

  const selectedTimeSlotsCount = itemData.selected_time_slots?.length || 0;
  const totalTimeSlotsCount = Array.from(timeSlotsByDate.values()).reduce(
    (sum, slots) => sum + slots.length,
    0
  );

  useEffect(() => {
    if (selectedTimeSlotsCount > 0) {
      setSelectionLevel("time");
    } else {
      setSelectionLevel("schedule");
    }
  }, [selectedTimeSlotsCount]);

  const handleTimeSlotToggle = (timeSlotId) => {
    const currentSlots = itemData.selected_time_slots || [];
    const newSlots = currentSlots.includes(timeSlotId)
      ? currentSlots.filter((id) => id !== timeSlotId)
      : [...currentSlots, timeSlotId];
    onTimeSlotsChange(itemData.id, newSlots);
  };

  const handleSelectAllTimeSlots = () => {
    const allTimeSlotIds = [];
    availableDates.forEach(({ date }) => {
      const slots = timeSlotsByDate.get(date) || [];
      slots.forEach((slot) => allTimeSlotIds.push(slot.id));
    });
    onTimeSlotsChange(itemData.id, allTimeSlotIds);
  };

  const handleClearAllTimeSlots = () => {
    onTimeSlotsChange(itemData.id, []);
  };

  const getDatePickerLimits = () => {
    const eventStart = scheduleStartDate ? dayjs(scheduleStartDate) : null;
    const eventEnd = scheduleEndDate ? dayjs(scheduleEndDate) : null;
    const couponStart = itemData.start_date ? dayjs(itemData.start_date) : null;
    const couponEnd = itemData.end_date ? dayjs(itemData.end_date) : null;

    let minDate = eventStart;
    if (couponStart && (!minDate || couponStart.isAfter(minDate))) {
      minDate = couponStart;
    }

    let maxDate = eventEnd;
    if (couponEnd && (!maxDate || couponEnd.isBefore(maxDate))) {
      maxDate = couponEnd;
    }

    return { minDate, maxDate };
  };

  const { minDate, maxDate } = getDatePickerLimits();

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 hover:border-purple-300 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
            <GiftOutlined className="text-white text-sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900 text-sm">
                {itemData.name}
              </p>
              <Tag color={couponStatus.color} className="text-xs font-medium">
                {couponStatus.label}
              </Tag>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {itemData.is_percentage ? (
                <p className="text-xs text-purple-600 font-medium">
                  {itemData.discount_percentage_amount}% OFF
                </p>
              ) : (
                <p className="text-xs text-purple-600 font-medium">
                  AED {itemData.discount_percentage_amount} OFF
                </p>
              )}
              {itemData.key_words && itemData.key_words.length > 0 && (
                <Tag className="text-[10px]">{itemData.key_words[0]}</Tag>
              )}
            </div>
            {itemData.start_date && itemData.end_date && (
              <p className="text-xs text-gray-500 mt-1">
                Valid: {dayjs(itemData.start_date).format("MMM DD")} -{" "}
                {dayjs(itemData.end_date).format("MMM DD, YYYY")}
              </p>
            )}
          </div>
        </div>
        <Tooltip title="Remove coupon">
          <Button
            type="text"
            danger
            size="small"
            icon={<CloseCircleOutlined />}
            onClick={() => onRemove(itemData.id)}
            className="hover:bg-red-100"
          />
        </Tooltip>
      </div>

      {/* Level Indicator */}
      <div className="mb-3">
        {selectionLevel === "schedule" ? (
          <div className="bg-blue-100 border border-blue-300 rounded-lg px-3 py-1.5">
            <p className="text-xs text-blue-800 font-medium flex items-center">
              <CheckOutlined className="mr-1" />
              Schedule Level - Applies to all {totalTimeSlotsCount} time slots
            </p>
          </div>
        ) : (
          <div className="bg-purple-100 border border-purple-300 rounded-lg px-3 py-1.5">
            <p className="text-xs text-purple-800 font-medium flex items-center">
              <ClockCircleOutlined className="mr-1" />
              Time Slot Level - {selectedTimeSlotsCount} of{" "}
              {totalTimeSlotsCount} slots selected
            </p>
          </div>
        )}
      </div>

      {/* Date Range Picker */}
      {itemData.date_required && (
        <div className="mb-3">
          <label className="text-xs text-gray-600 mb-1 block flex items-center">
            <CalendarOutlined className="mr-1" />
            Valid Period (within event dates)
          </label>
          <RangePicker
            size="small"
            value={
              itemData.start_date && itemData.end_date
                ? [dayjs(itemData.start_date), dayjs(itemData.end_date)]
                : null
            }
            onChange={(dates) => onDateChange(itemData.id, dates)}
            className="w-full"
            format="MMM DD, YYYY"
            minDate={minDate}
            maxDate={maxDate}
            disabledDate={(current) => {
              if (!current) return false;

              if (
                scheduleStartDate &&
                current.isBefore(dayjs(scheduleStartDate), "day")
              ) {
                return true;
              }
              if (
                scheduleEndDate &&
                current.isAfter(dayjs(scheduleEndDate), "day")
              ) {
                return true;
              }

              return false;
            }}
          />
          {availableDates.length === 0 &&
            itemData.start_date &&
            itemData.end_date && (
              <Alert
                type="warning"
                message="No show dates available in this date range"
                className="text-xs mt-2"
                showIcon
              />
            )}
        </div>
      )}

      {/* Selection Level Tabs */}
      <div className="mb-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectionLevel("schedule");
              handleClearAllTimeSlots();
            }}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectionLevel === "schedule"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Schedule Level
          </button>
          <button
            type="button"
            onClick={() => setSelectionLevel("time")}
            disabled={availableDates.length === 0}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectionLevel === "time"
                ? "bg-purple-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            Time Slot Level
          </button>
        </div>
      </div>

      {/* Time Slot Selection */}
      {selectionLevel === "schedule" ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-800">
            This coupon will apply to all time slots automatically
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-600 flex items-center">
              Select Time Slots
              <span className="ml-1 text-purple-600 font-medium">
                {selectedTimeSlotsCount}/{totalTimeSlotsCount}
              </span>
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handleSelectAllTimeSlots}
                className="text-xs px-2 py-0.5 text-purple-600 hover:text-purple-700 hover:underline cursor-pointer"
              >
                All
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={handleClearAllTimeSlots}
                className="text-xs px-2 py-0.5 text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {availableDates.length > 0 ? (
            <Collapse
              accordion
              className="bg-white border border-purple-200 rounded-lg"
            >
              {availableDates.map(({ date, display, dayName }) => {
                const timeSlots = timeSlotsByDate.get(date) || [];
                const selectedCount = timeSlots.filter((slot) =>
                  (itemData.selected_time_slots || []).includes(slot.id)
                ).length;

                return (
                  <Panel
                    header={
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{display}</span>
                          <span className="text-xs text-gray-500">
                            ({dayName})
                          </span>
                        </div>
                        <Tag
                          color={selectedCount > 0 ? "purple" : "default"}
                          className="text-xs"
                        >
                          {selectedCount}/{timeSlots.length}
                        </Tag>
                      </div>
                    }
                    key={date}
                  >
                    <div className="space-y-2 pt-2">
                      {timeSlots.map((slot) => {
                        const isSelected = (
                          itemData.selected_time_slots || []
                        ).includes(slot.id);
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => handleTimeSlotToggle(slot.id)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                              isSelected
                                ? "bg-purple-100 border-purple-400 shadow-sm"
                                : "bg-gray-50 border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <ClockCircleOutlined
                                className={
                                  isSelected
                                    ? "text-purple-600"
                                    : "text-gray-400"
                                }
                              />
                              <span
                                className={`text-sm font-medium ${
                                  isSelected
                                    ? "text-purple-900"
                                    : "text-gray-700"
                                }`}
                              >
                                {slot.start_time} - {slot.end_time}
                              </span>
                            </div>
                            {slot.ticket_set && (
                              <Tag size="small" color="blue">
                                {slot.ticket_set}
                              </Tag>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </Panel>
                );
              })}
            </Collapse>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
              <p className="text-xs text-yellow-800">
                No time slots available in selected date range
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Main Component
const OfferAndCoupons = ({ onSubmit, form, onBack }) => {
  const scheduleFormData = useSelector(
    (state) => state?.schedules?.scheduleFormData || null
  );

  const eventDetails = useSelector(
    (state) => state?.event?.eventDetails || null
  );

  const [selectedOfferItems, setSelectedOfferItems] = useState([]);
  const [selectedCouponItems, setSelectedCouponItems] = useState([]);
  const [offerSearchValue, setOfferSearchValue] = useState("");
  const [couponSearchValue, setCouponSearchValue] = useState("");

  const existingShowDates = useMemo(() => {
    return scheduleFormData?.show_dates || [];
  }, [scheduleFormData]);

  const scheduleStartDate = scheduleFormData?.start_date || null;
  const scheduleEndDate = scheduleFormData?.end_date || null;

  // Available offers (active and not expired)
  const availableOffers = useMemo(() => {
    if (!eventDetails?.offers) return [];

    const currentDate = new Date();
    return eventDetails.offers
      .filter((offer) => {
        if (!offer.is_active) return false;

        const status = OfferDateValidation.getOfferStatus(
          offer.start_date,
          offer.end_date,
          offer.date_required,
          currentDate
        );

        return status.status !== "expired";
      })
      .map((offer) => ({ offer }));
  }, [eventDetails]);

  // Available coupons (active and not expired)
  const availableCoupons = useMemo(() => {
    if (!eventDetails?.coupons) return [];

    const currentDate = new Date();
    return eventDetails.coupons
      .filter((coupon) => {
        if (!coupon.is_active) return false;

        const status = OfferDateValidation.getOfferStatus(
          coupon.start_date,
          coupon.end_date,
          coupon.date_required,
          currentDate
        );

        return status.status !== "expired";
      })
      .map((coupon) => ({ coupons: coupon }));
  }, [eventDetails]);

  // Load existing offers/coupons on mount
  useEffect(() => {
    if (eventDetails?.event_offers && eventDetails.event_offers.length > 0) {
      const mappedOffers = eventDetails.event_offers.map((eo) => ({
        offer: {
          ...eo.offer,
          start_date: eo.valid_from || eo.offer.start_date,
          end_date: eo.valid_to || eo.offer.end_date,
          selected_time_slots: [],
        },
      }));
      setSelectedOfferItems(mappedOffers);
    }

    if (eventDetails?.event_coupons && eventDetails.event_coupons.length > 0) {
      const mappedCoupons = eventDetails.event_coupons.map((ec) => ({
        coupons: {
          ...ec.coupons,
          start_date: ec.valid_from || ec.coupons.start_date,
          end_date: ec.valid_to || ec.coupons.end_date,
          selected_time_slots: [],
        },
      }));
      setSelectedCouponItems(mappedCoupons);
    }
  }, [eventDetails]);

  // Handlers
  const handleOfferAdd = (offerId) => {
    const offerToAdd = availableOffers.find((o) => o.offer.id === offerId);
    if (
      offerToAdd &&
      !selectedOfferItems.some((item) => item.offer.id === offerId)
    ) {
      setSelectedOfferItems([
        ...selectedOfferItems,
        {
          offer: {
            ...offerToAdd.offer,
            selected_time_slots: [],
          },
        },
      ]);
    }
  };

  const handleCouponAdd = (couponId) => {
    const couponToAdd = availableCoupons.find((c) => c.coupons.id === couponId);
    if (
      couponToAdd &&
      !selectedCouponItems.some((item) => item.coupons.id === couponId)
    ) {
      setSelectedCouponItems([
        ...selectedCouponItems,
        {
          coupons: {
            ...couponToAdd.coupons,
            selected_time_slots: [],
          },
        },
      ]);
    }
  };

  const handleOfferRemove = (offerId) => {
    setSelectedOfferItems(
      selectedOfferItems.filter((item) => item.offer.id !== offerId)
    );
  };

  const handleCouponRemove = (couponId) => {
    setSelectedCouponItems(
      selectedCouponItems.filter((item) => item.coupons.id !== couponId)
    );
  };

  const handleOfferDateChange = (offerId, dates) => {
    if (!dates || dates.length !== 2) return;

    setSelectedOfferItems((prevItems) =>
      prevItems.map((item) => {
        if (item.offer.id === offerId) {
          return {
            ...item,
            offer: {
              ...item.offer,
              start_date: dates[0].format("YYYY-MM-DD"),
              end_date: dates[1].format("YYYY-MM-DD"),
              selected_time_slots: [], // Reset time slots when date range changes
            },
          };
        }
        return item;
      })
    );
  };

  const handleCouponDateChange = (couponId, dates) => {
    if (!dates || dates.length !== 2) return;

    setSelectedCouponItems((prevItems) =>
      prevItems.map((item) => {
        if (item.coupons.id === couponId) {
          return {
            ...item,
            coupons: {
              ...item.coupons,
              start_date: dates[0].format("YYYY-MM-DD"),
              end_date: dates[1].format("YYYY-MM-DD"),
              selected_time_slots: [],
            },
          };
        }
        return item;
      })
    );
  };

  const handleOfferTimeSlotsChange = (offerId, selectedTimeSlots) => {
    setSelectedOfferItems((prevItems) =>
      prevItems.map((item) => {
        if (item.offer.id === offerId) {
          return {
            ...item,
            offer: {
              ...item.offer,
              selected_time_slots: selectedTimeSlots,
            },
          };
        }
        return item;
      })
    );
  };

  const handleCouponTimeSlotsChange = (couponId, selectedTimeSlots) => {
    setSelectedCouponItems((prevItems) =>
      prevItems.map((item) => {
        if (item.coupons.id === couponId) {
          return {
            ...item,
            coupons: {
              ...item.coupons,
              selected_time_slots: selectedTimeSlots,
            },
          };
        }
        return item;
      })
    );
  };

  const filteredOffers = useMemo(() => {
    return availableOffers.filter((offer) =>
      offer.offer.name.toLowerCase().includes(offerSearchValue.toLowerCase())
    );
  }, [availableOffers, offerSearchValue]);

  const filteredCoupons = useMemo(() => {
    return availableCoupons.filter((coupon) =>
      coupon.coupons.name
        .toLowerCase()
        .includes(couponSearchValue.toLowerCase())
    );
  }, [availableCoupons, couponSearchValue]);

  const handleSubmit = () => {
    try {
      const finalData = {
        offer_ids: selectedOfferItems.map((item) => ({
          offer_id: item.offer.id,
          valid_from: item.offer.start_date,
          valid_to: item.offer.end_date,
          selected_time_slots: item.offer.selected_time_slots || [],
        })),
        coupon_ids: selectedCouponItems.map((item) => ({
          coupon_id: item.coupons.id,
          valid_from: item.coupons.start_date,
          valid_to: item.coupons.end_date,
          selected_time_slots: item.coupons.selected_time_slots || [],
        })),
      };

      console.log("📦 Submitting offer/coupon data:", {
        offers: finalData.offer_ids.map((o) => ({
          id: o.offer_id,
          timeSlots: o.selected_time_slots.length,
          level: o.selected_time_slots.length === 0 ? "schedule" : "time",
        })),
        coupons: finalData.coupon_ids.map((c) => ({
          id: c.coupon_id,
          timeSlots: c.selected_time_slots.length,
          level: c.selected_time_slots.length === 0 ? "schedule" : "time",
        })),
      });

      message.success("Offers and coupons configured successfully!");
      onSubmit(finalData);
    } catch (error) {
      console.error("❌ Submit error:", error);
      message.error("Failed to submit offers and coupons");
    }
  };

  if (!existingShowDates || existingShowDates.length === 0) {
    return (
      <div className="p-6">
        <Alert
          type="warning"
          message="Schedule data not available"
          description="Please complete the schedule configuration and add time slots first before adding offers and coupons."
          showIcon
        />
        <Button onClick={onBack} className="mt-4">
          Go Back to Time Slots
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert
        type="info"
        message={
          <div>
            <strong>Event Period:</strong>{" "}
            {dayjs(scheduleStartDate).format("MMM DD, YYYY")} -{" "}
            {dayjs(scheduleEndDate).format("MMM DD, YYYY")}
            <span className="ml-4">
              <strong>{existingShowDates.length}</strong> show dates configured
            </span>
          </div>
        }
        className="mb-4"
      />

      {/* Offers Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TagOutlined className="mr-2 text-orange-500" />
          Offers
        </h3>

        <div className="mb-4">
          <Select
            showSearch
            placeholder="Select an offer to add"
            className="w-full"
            onSearch={setOfferSearchValue}
            onSelect={handleOfferAdd}
            value={null}
            filterOption={false}
            notFoundContent={
              filteredOffers.length === 0 ? (
                <Empty description="No active offers available" />
              ) : null
            }
          >
            {filteredOffers.map((item) => (
              <Option
                key={item.offer.id}
                value={item.offer.id}
                disabled={selectedOfferItems.some(
                  (selected) => selected.offer.id === item.offer.id
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{item.offer.name}</span>
                  <Tag color="orange">
                    {item.offer.discount_percentage_amount}% OFF
                  </Tag>
                </div>
              </Option>
            ))}
          </Select>
        </div>

        <div className="space-y-3">
          {selectedOfferItems.length > 0 ? (
            selectedOfferItems.map((item) => (
              <EnhancedOfferCard
                key={item.offer.id}
                item={item}
                onRemove={handleOfferRemove}
                onDateChange={handleOfferDateChange}
                onTimeSlotsChange={handleOfferTimeSlotsChange}
                scheduleStartDate={scheduleStartDate}
                scheduleEndDate={scheduleEndDate}
                existingShowDates={existingShowDates}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <TagOutlined className="text-4xl mb-2" />
              <p className="text-sm">No offers added yet</p>
              <p className="text-xs mt-1">
                Select an offer from the dropdown above
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Coupons Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <GiftOutlined className="mr-2 text-purple-500" />
          Coupons
        </h3>

        <div className="mb-4">
          <Select
            showSearch
            placeholder="Select a coupon to add"
            className="w-full"
            onSearch={setCouponSearchValue}
            onSelect={handleCouponAdd}
            value={null}
            filterOption={false}
            notFoundContent={
              filteredCoupons.length === 0 ? (
                <Empty description="No active coupons available" />
              ) : null
            }
          >
            {filteredCoupons.map((item) => (
              <Option
                key={item.coupons.id}
                value={item.coupons.id}
                disabled={selectedCouponItems.some(
                  (selected) => selected.coupons.id === item.coupons.id
                )}
              >
                <div className="flex items-center justify-between">
                  <span>{item.coupons.name}</span>
                  <Tag color="purple">
                    {item.coupons.is_percentage
                      ? `${item.coupons.discount_percentage_amount}% OFF`
                      : `AED ${item.coupons.discount_percentage_amount} OFF`}
                  </Tag>
                </div>
              </Option>
            ))}
          </Select>
        </div>

        <div className="space-y-3">
          {selectedCouponItems.length > 0 ? (
            selectedCouponItems.map((item) => (
              <EnhancedCouponCard
                key={item.coupons.id}
                item={item}
                onRemove={handleCouponRemove}
                onDateChange={handleCouponDateChange}
                onTimeSlotsChange={handleCouponTimeSlotsChange}
                scheduleStartDate={scheduleStartDate}
                scheduleEndDate={scheduleEndDate}
                existingShowDates={existingShowDates}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <GiftOutlined className="text-4xl mb-2" />
              <p className="text-sm">No coupons added yet</p>
              <p className="text-xs mt-1">
                Select a coupon from the dropdown above
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button size="large" onClick={onBack}>
          Back
        </Button>
        <Button
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          onClick={handleSubmit}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default OfferAndCoupons;
