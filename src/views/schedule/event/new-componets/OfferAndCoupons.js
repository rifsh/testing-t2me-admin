import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Select,
  Button,
  message,
  DatePicker,
  Tag,
  Alert,
  Collapse,
} from "antd";
import {
  TagOutlined,
  GiftOutlined,
  SaveOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import OfferDateValidation from "./OfferDateValidation";
import { COUPON_STATUS } from "constants/CouponStatus";
dayjs.extend(isBetween);
const { Option } = Select;
const { RangePicker } = DatePicker;

const SELECTION_LEVELS = {
  SCHEDULE: "schedule",
  DATE: "date",
  TIME: "time",
};

const getTimeSlotsByDate = (showDates) => {
  const timeSlotMap = new Map();
  if (!showDates || !Array.isArray(showDates)) return timeSlotMap;
  showDates.forEach((showDate) => {
    if (!showDate.show_times || !Array.isArray(showDate.show_times)) return;
    const dateStr = showDate.start_date;
    const timeSlots = showDate.show_times.map((st) => ({
      id: st.show_time_id || st.id || `${st.show_time_id}_${dateStr}-${st.start_time}`,
      start_time: st.start_time,
      end_time: st.end_time,
      ticket_set: st.ticket_set,
      ticket_structure_id: st.ticket_structure_id,
      seat_structure_id: st.seat_structure_id,
      date: dateStr,
    }));
    timeSlotMap.set(dateStr, timeSlots);
  });
  return timeSlotMap;
};

const getValidAndActiveOffers = (
  eventOffers,
  scheduleStartDate,
  scheduleEndDate
) => {
  if (!eventOffers || !Array.isArray(eventOffers)) return [];
  const currentDate = new Date();
  const scheduleStart = scheduleStartDate ? dayjs(scheduleStartDate) : null;
  const scheduleEnd = scheduleEndDate ? dayjs(scheduleEndDate) : null;
  return eventOffers.filter((eo) => {
    if (!eo.offer) return false;
    const status = OfferDateValidation.getOfferStatus(
      eo.offer.start_date,
      eo.offer.end_date,
      eo.offer.date_required,
      currentDate
    );
    if (status.status === "expired") return false;
    if (!eo.offer.date_required || status.status === "always_active") {
      return true;
    }
    if (
      scheduleStart &&
      scheduleEnd &&
      eo.offer.start_date &&
      eo.offer.end_date
    ) {
      const offerStart = dayjs(eo.offer.start_date);
      const offerEnd = dayjs(eo.offer.end_date);
      const hasOverlap =
        offerStart.isSameOrBefore(scheduleEnd, "day") &&
        offerEnd.isSameOrAfter(scheduleStart, "day");
      return hasOverlap;
    }
    return status.status === "active";
  });
};

const getValidAndActiveCoupons = (
  eventCoupons,
  scheduleStartDate,
  scheduleEndDate
) => {
  if (!eventCoupons || !Array.isArray(eventCoupons)) return [];
  const currentDate = new Date();
  const scheduleStart = scheduleStartDate ? dayjs(scheduleStartDate) : null;
  const scheduleEnd = scheduleEndDate ? dayjs(scheduleEndDate) : null;
  return eventCoupons.filter((ec) => {
    if (!ec.coupons) return false;
    const status = OfferDateValidation.getOfferStatus(
      ec.coupons.start_date,
      ec.coupons.end_date,
      ec.coupons.date_required,
      currentDate
    );
    if (status.status === COUPON_STATUS.EXPIRED) return false;
    if (
      !ec.coupons.date_required ||
      status.status === COUPON_STATUS.ALWAYS_ACTIVE
    ) {
      return true;
    }
    if (
      scheduleStart &&
      scheduleEnd &&
      ec.coupons.start_date &&
      ec.coupons.end_date
    ) {
      const couponStart = dayjs(ec.coupons.start_date);
      const couponEnd = dayjs(ec.coupons.end_date);
      const hasOverlap =
        couponStart.isSameOrBefore(scheduleEnd, "day") &&
        couponEnd.isSameOrAfter(scheduleStart, "day");
      return hasOverlap;
    }
    return status.status === COUPON_STATUS.ACTIVE;
  });
};

const autoAdjustDateToSchedule = (
  offerStartDate,
  offerEndDate,
  scheduleStartDate,
  scheduleEndDate
) => {
  if (
    !offerStartDate ||
    !offerEndDate ||
    !scheduleStartDate ||
    !scheduleEndDate
  ) {
    return {
      start_date: offerStartDate,
      end_date: offerEndDate,
      adjusted: false,
    };
  }
  const offerStart = dayjs(offerStartDate);
  const offerEnd = dayjs(offerEndDate);
  const scheduleStart = dayjs(scheduleStartDate);
  const scheduleEnd = dayjs(scheduleEndDate);
  let adjustedStart = offerStart;
  let adjustedEnd = offerEnd;
  let wasAdjusted = false;
  if (offerStart.isBefore(scheduleStart)) {
    adjustedStart = scheduleStart;
    wasAdjusted = true;
  }
  if (offerEnd.isAfter(scheduleEnd)) {
    adjustedEnd = scheduleEnd;
    wasAdjusted = true;
  }
  if (adjustedStart.isAfter(scheduleEnd)) {
    adjustedStart = scheduleStart;
    adjustedEnd = scheduleEnd;
    wasAdjusted = true;
  }
  if (adjustedEnd.isBefore(scheduleStart)) {
    adjustedStart = scheduleStart;
    adjustedEnd = scheduleEnd;
    wasAdjusted = true;
  }
  return {
    start_date: adjustedStart.format("YYYY-MM-DD"),
    end_date: adjustedEnd.format("YYYY-MM-DD"),
    adjusted: wasAdjusted,
  };
};

const OfferCard = ({
  item,
  onRemove,
  onDateChange,
  onTimeSlotsChange,
  onShowDateToggle,
  scheduleStartDate,
  scheduleEndDate,
  existingShowDates,
}) => {
  const itemData = item.offer;
  const [level, setLevel] = useState(SELECTION_LEVELS.SCHEDULE);
  const offerStatus = useMemo(
    () =>
      OfferDateValidation.getOfferStatus(
        itemData.start_date,
        itemData.end_date,
        itemData.date_required,
        new Date()
      ),
    [itemData.start_date, itemData.end_date, itemData.date_required]
  );
  const timeSlotsByDate = useMemo(
    () => getTimeSlotsByDate(existingShowDates),
    [existingShowDates]
  );
  const availableDates = useMemo(() => {
    const dates = Array.from(timeSlotsByDate.keys());
    if (!itemData.start_date || !itemData.end_date) {
      return dates.map((dateStr) => ({
        date: dateStr,
        display: dayjs(dateStr).format("MMM DD"),
        dayName: dayjs(dateStr).format("ddd"),
      }));
    }
    const start = dayjs(itemData.start_date);
    const end = dayjs(itemData.end_date);
    return dates
      .filter((dateStr) => {
        const date = dayjs(dateStr);
        return date.isBetween(start, end, "day", "[]");
      })
      .map((dateStr) => ({
        date: dateStr,
        display: dayjs(dateStr).format("MMM DD"),
        dayName: dayjs(dateStr).format("ddd"),
      }));
  }, [itemData.start_date, itemData.end_date, timeSlotsByDate]);
  const selectedTimeSlotsCount = itemData.selected_time_slots?.length || 0;
  const selectedShowDatesCount = itemData.selected_show_dates?.length || 0;
  useEffect(() => {
    if (selectedTimeSlotsCount > 0) setLevel(SELECTION_LEVELS.TIME);
    else if (selectedShowDatesCount > 0) setLevel(SELECTION_LEVELS.DATE);
    else setLevel(SELECTION_LEVELS.SCHEDULE);
  }, [selectedTimeSlotsCount, selectedShowDatesCount]);
  const handleTimeSlotToggle = useCallback(
    (timeSlotId) => {
      const currentSlots = itemData.selected_time_slots || [];
      const newSlots = currentSlots.includes(timeSlotId)
        ? currentSlots.filter((id) => id !== timeSlotId)
        : [...currentSlots, timeSlotId];
      onTimeSlotsChange(itemData.id, newSlots);
    },
    [itemData, onTimeSlotsChange]
  );
  const handleShowDateToggle = useCallback(
    (showDateId) => {
      const currentDates = itemData.selected_show_dates || [];
      const newDates = currentDates.includes(showDateId)
        ? currentDates.filter((id) => id !== showDateId)
        : [...currentDates, showDateId];
      onShowDateToggle(itemData.id, newDates);
    },
    [itemData, onShowDateToggle]
  );
  const handleSelectAllTimeSlots = useCallback(() => {
    const allIds = availableDates.flatMap((date) => {
      const slots = timeSlotsByDate.get(date.date);
      return slots && Array.isArray(slots) ? slots.map((s) => s.id) : [];
    });
    onTimeSlotsChange(itemData.id, allIds);
  }, [availableDates, timeSlotsByDate, itemData.id, onTimeSlotsChange]);
  const handleClearAllTimeSlots = useCallback(() => {
    onTimeSlotsChange(itemData.id, []);
  }, [itemData.id, onTimeSlotsChange]);
  const handleSelectAllShowDates = useCallback(() => {
    onShowDateToggle(
      itemData.id,
      availableDates.map(({ date }) => date)
    );
  }, [availableDates, itemData.id, onShowDateToggle]);
  const handleClearAllShowDates = useCallback(() => {
    onShowDateToggle(itemData.id, []);
  }, [itemData.id, onShowDateToggle]);
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
    <div className="bg-white border border-blue-200 rounded-lg p-4 hover:shadow-sm transition-shadow hover:border-blue-300">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <TagOutlined className="text-blue-500 text-sm flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {itemData.name}
            </p>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <span className="text-xs text-blue-600 font-medium">
                {itemData.discount_percentage_amount}% OFF
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-600">{offerStatus.label}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onRemove(itemData.id)}
          className="text-gray-400 hover:text-red-500 flex-shrink-0 p-1 hover:bg-red-50 rounded transition-colors"
        >
          <CloseOutlined className="text-sm" />
        </button>
      </div>
      {itemData.date_required && (
        <div className="mb-3">
          <label className="text-xs font-medium text-gray-700 block mb-1.5">
            Valid Period
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
            format="MMM DD"
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
            style={{ fontSize: "12px" }}
          />
        </div>
      )}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        <button
          onClick={() => {
            setLevel(SELECTION_LEVELS.SCHEDULE);
            handleClearAllTimeSlots();
            handleClearAllShowDates();
          }}
          className={`text-xs font-medium py-2 px-2 rounded border transition-colors ${
            level === SELECTION_LEVELS.SCHEDULE
              ? "bg-blue-100 border-blue-400 text-blue-900"
              : "bg-white border-blue-200 text-blue-600 hover:bg-blue-50"
          }`}
        >
          All
        </button>
        <button
          onClick={() => {
            setLevel(SELECTION_LEVELS.DATE);
            handleClearAllTimeSlots();
          }}
          disabled={availableDates.length === 0}
          className={`text-xs font-medium py-2 px-2 rounded border transition-colors ${
            level === SELECTION_LEVELS.DATE
              ? "bg-blue-100 border-blue-400 text-blue-900"
              : availableDates.length === 0
              ? "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
              : "bg-white border-blue-200 text-blue-600 hover:bg-blue-50"
          }`}
        >
          Dates
        </button>
        <button
          onClick={() => {
            setLevel(SELECTION_LEVELS.TIME);
            handleClearAllShowDates();
          }}
          disabled={availableDates.length === 0}
          className={`text-xs font-medium py-2 px-2 rounded border transition-colors ${
            level === SELECTION_LEVELS.TIME
              ? "bg-blue-100 border-blue-400 text-blue-900"
              : availableDates.length === 0
              ? "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
              : "bg-white border-blue-200 text-blue-600 hover:bg-blue-50"
          }`}
        >
          Slots
        </button>
      </div>
      {level === SELECTION_LEVELS.SCHEDULE ? (
        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">
          Applied to all time slots
        </div>
      ) : level === SELECTION_LEVELS.DATE ? (
        <DateSelector
          dates={availableDates}
          selected={itemData.selected_show_dates || []}
          onToggle={handleShowDateToggle}
          onSelectAll={handleSelectAllShowDates}
          onClearAll={handleClearAllShowDates}
          timeSlotsByDate={timeSlotsByDate}
        />
      ) : (
        <TimeSlotSelector
          dates={availableDates}
          selected={itemData.selected_time_slots || []}
          onToggle={handleTimeSlotToggle}
          onSelectAll={handleSelectAllTimeSlots}
          onClearAll={handleClearAllTimeSlots}
          timeSlotsByDate={timeSlotsByDate}
        />
      )}
    </div>
  );
};

const CouponCard = ({
  item,
  onRemove,
  onDateChange,
  onTimeSlotsChange,
  onShowDateToggle,
  scheduleStartDate,
  scheduleEndDate,
  existingShowDates,
}) => {
  const itemData = item.coupons;
  const [level, setLevel] = useState(SELECTION_LEVELS.SCHEDULE);
  const couponStatus = useMemo(
    () =>
      OfferDateValidation.getOfferStatus(
        itemData.start_date,
        itemData.end_date,
        itemData.date_required,
        new Date()
      ),
    [itemData.start_date, itemData.end_date, itemData.date_required]
  );
  const timeSlotsByDate = useMemo(
    () => getTimeSlotsByDate(existingShowDates),
    [existingShowDates]
  );
  const availableDates = useMemo(() => {
    const dates = Array.from(timeSlotsByDate.keys());
    if (!itemData.start_date || !itemData.end_date) {
      return dates.map((dateStr) => ({
        date: dateStr,
        display: dayjs(dateStr).format("MMM DD"),
        dayName: dayjs(dateStr).format("ddd"),
      }));
    }
    const start = dayjs(itemData.start_date);
    const end = dayjs(itemData.end_date);
    return dates
      .filter((dateStr) => {
        const date = dayjs(dateStr);
        return date.isBetween(start, end, "day", "[]");
      })
      .map((dateStr) => ({
        date: dateStr,
        display: dayjs(dateStr).format("MMM DD"),
        dayName: dayjs(dateStr).format("ddd"),
      }));
  }, [itemData.start_date, itemData.end_date, timeSlotsByDate]);
  const selectedTimeSlotsCount = itemData.selected_time_slots?.length || 0;
  const selectedShowDatesCount = itemData.selected_show_dates?.length || 0;
  useEffect(() => {
    if (selectedTimeSlotsCount > 0) setLevel(SELECTION_LEVELS.TIME);
    else if (selectedShowDatesCount > 0) setLevel(SELECTION_LEVELS.DATE);
    else setLevel(SELECTION_LEVELS.SCHEDULE);
  }, [selectedTimeSlotsCount, selectedShowDatesCount]);
  const handleTimeSlotToggle = useCallback(
    (timeSlotId) => {
      const currentSlots = itemData.selected_time_slots || [];
      const newSlots = currentSlots.includes(timeSlotId)
        ? currentSlots.filter((id) => id !== timeSlotId)
        : [...currentSlots, timeSlotId];
      onTimeSlotsChange(itemData.id, newSlots);
    },
    [itemData, onTimeSlotsChange]
  );
  const handleShowDateToggle = useCallback(
    (showDateId) => {
      const currentDates = itemData.selected_show_dates || [];
      const newDates = currentDates.includes(showDateId)
        ? currentDates.filter((id) => id !== showDateId)
        : [...currentDates, showDateId];
      onShowDateToggle(itemData.id, newDates);
    },
    [itemData, onShowDateToggle]
  );
  const handleSelectAllTimeSlots = useCallback(() => {
    const allIds = availableDates.flatMap((date) => {
      const slots = timeSlotsByDate.get(date.date);
      return slots && Array.isArray(slots) ? slots.map((s) => s.id) : [];
    });
    onTimeSlotsChange(itemData.id, allIds);
  }, [availableDates, timeSlotsByDate, itemData.id, onTimeSlotsChange]);
  const handleClearAllTimeSlots = useCallback(() => {
    onTimeSlotsChange(itemData.id, []);
  }, [itemData.id, onTimeSlotsChange]);
  const handleSelectAllShowDates = useCallback(() => {
    onShowDateToggle(
      itemData.id,
      availableDates.map(({ date }) => date)
    );
  }, [availableDates, itemData.id, onShowDateToggle]);
  const handleClearAllShowDates = useCallback(() => {
    onShowDateToggle(itemData.id, []);
  }, [itemData.id, onShowDateToggle]);
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
    <div className="bg-white border border-blue-200 rounded-lg p-4 hover:shadow-sm transition-shadow hover:border-blue-300">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <GiftOutlined className="text-blue-500 text-sm flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {itemData.name}
            </p>
            <div className="flex items-center gap-1 mt-1 flex-wrap">
              <span className="text-xs text-blue-600 font-medium">
                {itemData.is_percentage
                  ? `${itemData.discount_percentage_amount}% OFF`
                  : `AED ${itemData.discount_percentage_amount} OFF`}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-600">
                {couponStatus.label}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onRemove(itemData.id)}
          className="text-gray-400 hover:text-red-500 flex-shrink-0 p-1 hover:bg-red-50 rounded transition-colors"
        >
          <CloseOutlined className="text-sm" />
        </button>
      </div>
      {itemData.date_required && (
        <div className="mb-3">
          <label className="text-xs font-medium text-gray-700 block mb-1.5">
            Valid Period
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
            format="MMM DD"
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
            style={{ fontSize: "12px" }}
          />
        </div>
      )}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        <button
          onClick={() => {
            setLevel(SELECTION_LEVELS.SCHEDULE);
            handleClearAllTimeSlots();
            handleClearAllShowDates();
          }}
          className={`text-xs font-medium py-2 px-2 rounded border transition-colors ${
            level === SELECTION_LEVELS.SCHEDULE
              ? "bg-blue-100 border-blue-400 text-blue-900"
              : "bg-white border-blue-200 text-blue-600 hover:bg-blue-50"
          }`}
        >
          All
        </button>
        <button
          onClick={() => {
            setLevel(SELECTION_LEVELS.DATE);
            handleClearAllTimeSlots();
          }}
          disabled={availableDates.length === 0}
          className={`text-xs font-medium py-2 px-2 rounded border transition-colors ${
            level === SELECTION_LEVELS.DATE
              ? "bg-blue-100 border-blue-400 text-blue-900"
              : availableDates.length === 0
              ? "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
              : "bg-white border-blue-200 text-blue-600 hover:bg-blue-50"
          }`}
        >
          Dates
        </button>
        <button
          onClick={() => {
            setLevel(SELECTION_LEVELS.TIME);
            handleClearAllShowDates();
          }}
          disabled={availableDates.length === 0}
          className={`text-xs font-medium py-2 px-2 rounded border transition-colors ${
            level === SELECTION_LEVELS.TIME
              ? "bg-blue-100 border-blue-400 text-blue-900"
              : availableDates.length === 0
              ? "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed"
              : "bg-white border-blue-200 text-blue-600 hover:bg-blue-50"
          }`}
        >
          Slots
        </button>
      </div>
      {level === SELECTION_LEVELS.SCHEDULE ? (
        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">
          Applied to all time slots
        </div>
      ) : level === SELECTION_LEVELS.DATE ? (
        <DateSelector
          dates={availableDates}
          selected={itemData.selected_show_dates || []}
          onToggle={handleShowDateToggle}
          onSelectAll={handleSelectAllShowDates}
          onClearAll={handleClearAllShowDates}
          timeSlotsByDate={timeSlotsByDate}
        />
      ) : (
        <TimeSlotSelector
          dates={availableDates}
          selected={itemData.selected_time_slots || []}
          onToggle={handleTimeSlotToggle}
          onSelectAll={handleSelectAllTimeSlots}
          onClearAll={handleClearAllTimeSlots}
          timeSlotsByDate={timeSlotsByDate}
        />
      )}
    </div>
  );
};

const DateSelector = ({
  dates,
  selected,
  onToggle,
  onSelectAll,
  onClearAll,
  timeSlotsByDate,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-gray-700">
          {selected.length} selected
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onSelectAll}
            className="text-xs text-blue-600 hover:text-blue-900 px-2 py-0.5 hover:bg-blue-100 rounded transition-colors"
          >
            All
          </button>
          <button
            onClick={onClearAll}
            className="text-xs text-blue-600 hover:text-blue-900 px-2 py-0.5 hover:bg-blue-100 rounded transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {dates.map(({ date, display, dayName }) => {
          const isSelected = selected.includes(date);
          const timeSlots = timeSlotsByDate.get(date) || [];
          return (
            <button
              key={date}
              onClick={() => onToggle(date)}
              className={`p-2 rounded border text-left transition-all text-xs ${
                isSelected
                  ? "border-blue-400 bg-blue-100 text-blue-900 font-medium"
                  : "border-blue-200 bg-white hover:bg-blue-50 text-gray-700"
              }`}
            >
              <p className="font-medium">{display}</p>
              <p
                className={`text-xs ${
                  isSelected ? "text-blue-700" : "text-gray-500"
                }`}
              >
                {dayName} · {timeSlots.length}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TimeSlotSelector = ({
  dates,
  selected,
  onToggle,
  onSelectAll,
  onClearAll,
  timeSlotsByDate,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-gray-700">
          {selected.length} selected
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onSelectAll}
            className="text-xs text-blue-600 hover:text-blue-900 px-2 py-0.5 hover:bg-blue-100 rounded transition-colors"
          >
            All
          </button>
          <button
            onClick={onClearAll}
            className="text-xs text-blue-600 hover:text-blue-900 px-2 py-0.5 hover:bg-blue-100 rounded transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      {dates.length > 0 ? (
        <Collapse
          accordion
          size="small"
          items={dates.map(({ date, display, dayName }) => {
            const timeSlots = timeSlotsByDate.get(date) || [];
            const selectedCount = timeSlots.filter((slot) =>
              selected.includes(slot.id)
            ).length;
            return {
              key: date,
              label: (
                <div className="flex items-center justify-between w-full text-xs gap-2">
                  <span className="font-medium text-gray-900">{display}</span>
                  <span className="text-gray-500">{dayName}</span>
                  <span className="text-blue-600 ml-auto">
                    {selectedCount}/{timeSlots.length}
                  </span>
                </div>
              ),
              children: (
                <div className="grid grid-cols-2 gap-1.5">
                  {timeSlots.map((slot) => {
                    const isSelected = selected.includes(slot.id);
                    return (
                      <button
                        key={slot.id}
                        onClick={() => onToggle(slot.id)}
                        className={`p-2 rounded border text-left transition-all text-xs ${
                          isSelected
                            ? "border-blue-400 bg-blue-100 text-blue-900 font-medium"
                            : "border-blue-200 bg-white hover:bg-blue-50 text-gray-700"
                        }`}
                      >
                        <p className="font-medium">{slot.start_time}</p>
                        {slot.ticket_set && (
                          <p
                            className={`text-xs ${
                              isSelected ? "text-blue-700" : "text-gray-500"
                            }`}
                          >
                            {slot.ticket_set}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              ),
            };
          })}
        />
      ) : (
        <Alert type="warning" message="No slots" className="text-xs" showIcon />
      )}
    </div>
  );
};

const OfferAndCoupons = ({ onSubmit, form, onBack, isEditMode }) => {
  const scheduleFormData = useSelector(
    (state) => state?.schedules?.scheduleFormData || null
  );
  const eventDetails = useSelector(
    (state) => state?.event?.eventDetails || null
  );
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [selectedCoupons, setSelectedCoupons] = useState([]);
  const existingShowDates = useMemo(
    () => scheduleFormData?.show_dates || [],
    [scheduleFormData]
  );
  const scheduleStartDate = scheduleFormData?.start_date || null;
  const scheduleEndDate = scheduleFormData?.end_date || null;

  const validAndActiveOffers = useMemo(() => {
    return getValidAndActiveOffers(
      eventDetails?.event_offers,
      scheduleStartDate,
      scheduleEndDate
    );
  }, [eventDetails?.event_offers, scheduleStartDate, scheduleEndDate]);
  
  const validAndActiveCoupons = useMemo(() => {
    return getValidAndActiveCoupons(
      eventDetails?.event_coupons,
      scheduleStartDate,
      scheduleEndDate
    );
  }, [eventDetails?.event_coupons, scheduleStartDate, scheduleEndDate]);

  // Load offers in edit mode from BOTH offer_ids AND offer_schedule
  useEffect(() => {
    if (isEditMode) {
      const assignedOffers = [];
      
      // First check offer_ids (original structure)
      if (scheduleFormData?.offer_ids && Array.isArray(scheduleFormData.offer_ids)) {
        const offersFromIds = scheduleFormData.offer_ids
          .map(({ offer_id, selected_show_dates, selected_time_slots, valid_from, valid_to }) => {
            const offerDetail = eventDetails?.event_offers?.find(
              (eo) => eo.offer.id === offer_id
            )?.offer;
            if (!offerDetail) return null;
            return {
              offer: {
                ...offerDetail,
                selected_show_dates: selected_show_dates || [],
                selected_time_slots: selected_time_slots || [],
                start_date: valid_from || offerDetail.start_date,
                end_date: valid_to || offerDetail.end_date,
              },
            };
          })
          .filter(Boolean);
        assignedOffers.push(...offersFromIds);
      }
      
      // Then check offer_schedule (API response structure)
      if (scheduleFormData?.offer_schedule && Array.isArray(scheduleFormData.offer_schedule)) {
        const offersFromSchedule = scheduleFormData.offer_schedule
          .map(({ offer, id, valid_from, valid_to, selected_show_dates, selected_time_slots }) => {
            if (!offer) return null;
            return {
              offer: {
                ...offer,
                selected_show_dates: selected_show_dates || [],
                selected_time_slots: selected_time_slots || [],
                start_date: valid_from || offer.start_date,
                end_date: valid_to || offer.end_date,
              },
            };
          })
          .filter(Boolean);
        assignedOffers.push(...offersFromSchedule);
      }
      
      // Remove duplicates based on offer id
      const uniqueOffers = assignedOffers.filter((offer, index, self) =>
        index === self.findIndex((o) => o.offer.id === offer.offer.id)
      );
      
      setSelectedOffers(uniqueOffers);
    } else {
      setSelectedOffers([]);
    }
  }, [isEditMode, scheduleFormData, eventDetails]);

  // Load coupons in edit mode from BOTH coupon_ids AND coupon_schedule
  useEffect(() => {
    if (isEditMode) {
      const assignedCoupons = [];
      
      // First check coupon_ids (original structure)
      if (scheduleFormData?.coupon_ids && Array.isArray(scheduleFormData.coupon_ids)) {
        const couponsFromIds = scheduleFormData.coupon_ids
          .map(({ coupon_id, selected_show_dates, selected_time_slots, valid_from, valid_to }) => {
            const couponDetail = eventDetails?.event_coupons?.find(
              (ec) => ec.coupons.id === coupon_id
            )?.coupons;
            if (!couponDetail) return null;
            return {
              coupons: {
                ...couponDetail,
                selected_show_dates: selected_show_dates || [],
                selected_time_slots: selected_time_slots || [],
                start_date: valid_from || couponDetail.start_date,
                end_date: valid_to || couponDetail.end_date,
              },
            };
          })
          .filter(Boolean);
        assignedCoupons.push(...couponsFromIds);
      }
      
      // Then check coupon_schedule (API response structure)
      if (scheduleFormData?.coupon_schedule && Array.isArray(scheduleFormData.coupon_schedule)) {
        const couponsFromSchedule = scheduleFormData.coupon_schedule
          .map(({ coupons, id, valid_from, valid_to, selected_show_dates, selected_time_slots }) => {
            if (!coupons) return null;
            return {
              coupons: {
                ...coupons,
                selected_show_dates: selected_show_dates || [],
                selected_time_slots: selected_time_slots || [],
                start_date: valid_from || coupons.start_date,
                end_date: valid_to || coupons.end_date,
              },
            };
          })
          .filter(Boolean);
        assignedCoupons.push(...couponsFromSchedule);
      }
      
      // Remove duplicates based on coupon id
      const uniqueCoupons = assignedCoupons.filter((coupon, index, self) =>
        index === self.findIndex((c) => c.coupons.id === coupon.coupons.id)
      );
      
      setSelectedCoupons(uniqueCoupons);
    } else {
      setSelectedCoupons([]);
    }
  }, [isEditMode, scheduleFormData, eventDetails]);

  const handleOfferAdd = useCallback(
    (offerId) => {
      if (
        selectedOffers.some((item) => item.offer.id === offerId) ||
        !validAndActiveOffers.find((eo) => eo.offer.id === offerId)
      ) {
        return;
      }
      const offerToAdd = validAndActiveOffers.find(
        (eo) => eo.offer.id === offerId
      );
      setSelectedOffers((prev) => [
        ...prev,
        {
          offer: {
            ...offerToAdd.offer,
            selected_show_dates: [],
            selected_time_slots: [],
            start_date: offerToAdd.offer.start_date,
            end_date: offerToAdd.offer.end_date,
          },
        },
      ]);
    },
    [selectedOffers, validAndActiveOffers]
  );

  const handleCouponAdd = useCallback(
    (couponId) => {
      if (
        selectedCoupons.some((item) => item.coupons.id === couponId) ||
        !validAndActiveCoupons.find((ec) => ec.coupons.id === couponId)
      ) {
        return;
      }
      const couponToAdd = validAndActiveCoupons.find(
        (ec) => ec.coupons.id === couponId
      );
      setSelectedCoupons((prev) => [
        ...prev,
        {
          coupons: {
            ...couponToAdd.coupons,
            selected_show_dates: [],
            selected_time_slots: [],
            start_date: couponToAdd.coupons.start_date,
            end_date: couponToAdd.coupons.end_date,
          },
        },
      ]);
    },
    [selectedCoupons, validAndActiveCoupons]
  );

  const handleOfferRemove = useCallback((offerId) => {
    setSelectedOffers((prev) =>
      prev.filter((item) => item.offer.id !== offerId)
    );
  }, []);

  const handleCouponRemove = useCallback((couponId) => {
    setSelectedCoupons((prev) =>
      prev.filter((item) => item.coupons.id !== couponId)
    );
  }, []);

  const handleOfferDateChange = useCallback(
    (offerId, dates) => {
      if (!dates || dates.length !== 2) return;
      const newStartDate = dates[0].format("YYYY-MM-DD");
      const newEndDate = dates[1].format("YYYY-MM-DD");
      const adjustedDates = autoAdjustDateToSchedule(
        newStartDate,
        newEndDate,
        scheduleStartDate,
        scheduleEndDate
      );
      setSelectedOffers((prev) =>
        prev.map((item) =>
          item.offer.id === offerId
            ? {
                ...item,
                offer: {
                  ...item.offer,
                  start_date: adjustedDates.start_date,
                  end_date: adjustedDates.end_date,
                  selected_time_slots: [],
                  selected_show_dates: [],
                },
              }
            : item
        )
      );
    },
    [scheduleStartDate, scheduleEndDate]
  );

  const handleCouponDateChange = useCallback(
    (couponId, dates) => {
      if (!dates || dates.length !== 2) return;
      const newStartDate = dates[0].format("YYYY-MM-DD");
      const newEndDate = dates[1].format("YYYY-MM-DD");
      const adjustedDates = autoAdjustDateToSchedule(
        newStartDate,
        newEndDate,
        scheduleStartDate,
        scheduleEndDate
      );
      setSelectedCoupons((prev) =>
        prev.map((item) =>
          item.coupons.id === couponId
            ? {
                ...item,
                coupons: {
                  ...item.coupons,
                  start_date: adjustedDates.start_date,
                  end_date: adjustedDates.end_date,
                  selected_time_slots: [],
                  selected_show_dates: [],
                },
              }
            : item
        )
      );
    },
    [scheduleStartDate, scheduleEndDate]
  );

  const handleOfferTimeSlotsChange = useCallback((offerId, selectedSlots) => {
    setSelectedOffers((prev) =>
      prev.map((item) =>
        item.offer.id === offerId
          ? {
              ...item,
              offer: {
                ...item.offer,
                selected_time_slots: selectedSlots,
                selected_show_dates: [],
              },
            }
          : item
      )
    );
  }, []);

  const handleCouponTimeSlotsChange = useCallback((couponId, selectedSlots) => {
    setSelectedCoupons((prev) =>
      prev.map((item) =>
        item.coupons.id === couponId
          ? {
              ...item,
              coupons: {
                ...item.coupons,
                selected_time_slots: selectedSlots,
                selected_show_dates: [],
              },
            }
          : item
      )
    );
  }, []);

  const handleOfferShowDateToggle = useCallback((offerId, selectedDates) => {
    setSelectedOffers((prev) =>
      prev.map((item) =>
        item.offer.id === offerId
          ? {
              ...item,
              offer: {
                ...item.offer,
                selected_show_dates: selectedDates,
                selected_time_slots: [],
              },
            }
          : item
      )
    );
  }, []);

  const handleCouponShowDateToggle = useCallback((couponId, selectedDates) => {
    setSelectedCoupons((prev) =>
      prev.map((item) =>
        item.coupons.id === couponId
          ? {
              ...item,
              coupons: {
                ...item.coupons,
                selected_show_dates: selectedDates,
                selected_time_slots: [],
              },
            }
          : item
      )
    );
  }, []);

  const handleSubmit = useCallback(() => {
    try {
      const finalData = {
        offer_ids: selectedOffers.map((item) => ({
          offer_id: item.offer.id,
          valid_from: item.offer.start_date || scheduleStartDate,
          valid_to: item.offer.end_date || scheduleEndDate,
          selected_time_slots: item.offer.selected_time_slots || [],
          selected_show_dates: item.offer.selected_show_dates || [],
        })),
        coupon_ids: selectedCoupons.map((item) => ({
          coupon_id: item.coupons.id,
          valid_from: item.coupons.start_date || scheduleStartDate,
          valid_to: item.coupons.end_date || scheduleEndDate,
          selected_time_slots: item.coupons.selected_time_slots || [],
          selected_show_dates: item.coupons.selected_show_dates || [],
        })),
      };
      message.success("Configured successfully!");
      onSubmit(finalData);
    } catch (error) {
      message.error("Failed to submit");
    }
  }, [
    selectedOffers,
    selectedCoupons,
    onSubmit,
    scheduleStartDate,
    scheduleEndDate,
  ]);

  if (!existingShowDates || existingShowDates.length === 0) {
    return (
      <div className="p-6 bg-white">
        <Alert
          type="warning"
          message="Schedule not configured"
          description="Please complete schedule setup first"
          showIcon
          className="mb-4"
        />
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded text-sm font-medium transition-colors"
        >
          <ArrowLeftOutlined />
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-semibold text-gray-900">
              Offers & Coupons
            </h1>
            <span className="text-xs text-gray-500">
              {dayjs(scheduleStartDate).format("MMM DD")} -{" "}
              {dayjs(scheduleEndDate).format("MMM DD")}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Configure {existingShowDates.length} show dates
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TagOutlined className="text-blue-500" />
              Offers
              <span className="text-xs font-normal text-gray-500 bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {selectedOffers.length}
              </span>
            </h2>
          </div>
          <div className="mb-4">
            {!isEditMode && validAndActiveOffers.length > 0 && (
              <Select
                showSearch
                placeholder="Add offer..."
                className="w-full"
                onSelect={handleOfferAdd}
                value={null}
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {validAndActiveOffers.map((eo) => (
                  <Option
                    key={eo.offer.id}
                    value={eo.offer.id}
                    disabled={selectedOffers.some(
                      (selected) => selected.offer.id === eo.offer.id
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm">{eo.offer.name}</span>
                      <Tag className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                        {eo.offer.discount_percentage_amount}%
                      </Tag>
                    </div>
                  </Option>
                ))}
              </Select>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedOffers.length > 0 ? (
              selectedOffers.map((item) => (
                <OfferCard
                  key={item.offer.id}
                  item={item}
                  onRemove={handleOfferRemove}
                  onDateChange={handleOfferDateChange}
                  onTimeSlotsChange={handleOfferTimeSlotsChange}
                  onShowDateToggle={handleOfferShowDateToggle}
                  scheduleStartDate={scheduleStartDate}
                  scheduleEndDate={scheduleEndDate}
                  existingShowDates={existingShowDates}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-sm text-gray-500">No offers added</p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <GiftOutlined className="text-blue-500" />
              Coupons
              <span className="text-xs font-normal text-gray-500 bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {selectedCoupons.length}
              </span>
            </h2>
          </div>
          <div className="mb-4">
            {!isEditMode && validAndActiveCoupons.length > 0 && (
              <Select
                showSearch
                placeholder="Add coupon..."
                className="w-full"
                onSelect={handleCouponAdd}
                value={null}
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {validAndActiveCoupons.map((ec) => (
                  <Option
                    key={ec.coupons.id}
                    value={ec.coupons.id}
                    disabled={selectedCoupons.some(
                      (selected) => selected.coupons.id === ec.coupons.id
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm">{ec.coupons.name}</span>
                      <Tag className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                        {ec.coupons.is_percentage
                          ? `${ec.coupons.discount_percentage_amount}%`
                          : `AED ${ec.coupons.discount_percentage_amount}`}
                      </Tag>
                    </div>
                  </Option>
                ))}
              </Select>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedCoupons.length > 0 ? (
              selectedCoupons.map((item) => (
                <CouponCard
                  key={item.coupons.id}
                  item={item}
                  onRemove={handleCouponRemove}
                  onDateChange={handleCouponDateChange}
                  onTimeSlotsChange={handleCouponTimeSlotsChange}
                  onShowDateToggle={handleCouponShowDateToggle}
                  scheduleStartDate={scheduleStartDate}
                  scheduleEndDate={scheduleEndDate}
                  existingShowDates={existingShowDates}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-sm text-gray-500">No coupons added</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 border-t border-gray-200 pt-6">
          <Button onClick={onBack} icon={<ArrowLeftOutlined />}>
            Back
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSubmit}
            className="ml-auto"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OfferAndCoupons;
