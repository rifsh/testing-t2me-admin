import React, { useEffect, useMemo } from "react";
import { Card, Form, DatePicker } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { useDispatch, useSelector } from "react-redux";
import { resetSchedule } from "store/slices/scheduleSlice";
import { fetchEventDetails } from "store/slices/eventSlice";

// Extend dayjs with required plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const convertToTimeZone = (date, timeZone) => {
  if (!date) return null;
  try {
    return dayjs(date).tz(timeZone);
  } catch (error) {
    console.error("Error converting date to timezone:", error);
    return null;
  }
};

export function ScheduleTimeSlots({ form }) {
  const dispatch = useDispatch();
  const { eventDetails, selectedEvent } = useSelector((state) => state.event);

  // Fetch event details when selectedEvent changes
  useEffect(() => {
    if (selectedEvent) {
      dispatch(fetchEventDetails(selectedEvent));
    }
  }, [dispatch, selectedEvent]); // Added selectedEvent to dependency array

  const getTimeZone = useMemo(() => {
    const timeZone = eventDetails?.venue?.place?.country?.time_zone;
    return timeZone || dayjs.tz.guess();
  }, [eventDetails]);

  const currentDateInTimeZone = useMemo(() => 
    convertToTimeZone(dayjs(), getTimeZone),
  [getTimeZone]);

  // Initialize form with current time in correct timezone
  useEffect(() => {
    if (eventDetails && form) {
      const initialDate = convertToTimeZone(dayjs(), getTimeZone);
      if (initialDate) {
        form.setFieldsValue({
          start_date: initialDate,
          timezone:getTimeZone,
          end_date: initialDate.add(1, 'hour') // Set default end time to 1 hour after start
        });
      }
    }
  }, [eventDetails, form, getTimeZone]);

  const handleTimeChange = (field) => (value) => {
    dispatch(resetSchedule());
    
    // If changing start time, adjust end time if necessary
    if (field === 'start_date') {
      const endDate = form.getFieldValue('end_date');
      if (endDate && value && endDate.isBefore(value)) {
        form.setFieldsValue({
          end_date: dayjs(value).add(1, 'hour')
        });
      }
    }
  };

  const disabledMinutes = () => {
    // Disable past minutes for current hour
    if (dayjs().isSame(currentDateInTimeZone, 'hour')) {
      const currentMinute = currentDateInTimeZone.minute();
      return Array.from({ length: currentMinute }, (_, i) => i);
    }
    return [];
  };

  return (
    <Card title="Schedule Details">
      <Form.Item
        name="start_date"
        label="Start Time"
        rules={[
          { required: true, message: "Please select start time" },
          {
            validator(_, value) {
              if (!value) return Promise.resolve();

              const convertedValue = convertToTimeZone(value, getTimeZone);
              if (!convertedValue) {
                return Promise.reject(new Error("Invalid date format"));
              }

              if (convertedValue.isBefore(currentDateInTimeZone, "minute")) {
                return Promise.reject(new Error("Start time cannot be in the past"));
              }

              return Promise.resolve();
            },
          },
        ]}
      >
        <DatePicker
          showTime={{
            disabledMinutes,
            // minuteStep: 15,  // Round to nearest 15 minutes
            format: "HH:mm"
          }}
          onChange={handleTimeChange('start_date')}
          className="w-full"
          placeholder="Select start time"
          disabledDate={(current) => 
            current && current.isBefore(currentDateInTimeZone, 'day')
          }
          showNow={false}
        />
      </Form.Item>

      <Form.Item
        name="end_date"
        label="End Time"
        rules={[
          { required: true, message: "Please select end time" },
          {
            validator(_, value) {
              if (!value) return Promise.resolve();

              const convertedValue = convertToTimeZone(value, getTimeZone);
              if (!convertedValue) {
                return Promise.reject(new Error("Invalid date format"));
              }

              const startDate = form.getFieldValue("start_date");
              const convertedStartDate = startDate && convertToTimeZone(startDate, getTimeZone);

              if (convertedValue.isBefore(currentDateInTimeZone, "minute")) {
                return Promise.reject(new Error("End time cannot be in the past"));
              }

              if (convertedStartDate && convertedValue.isSameOrBefore(convertedStartDate)) {
                return Promise.reject(new Error("End time must be after start time"));
              }

              return Promise.resolve();
            },
          },
        ]}
      >
        <DatePicker
          showTime={{
            disabledMinutes,
            // minuteStep: 15, // Round to nearest 15 minutes
            format: "HH:mm"
          }}
          onChange={handleTimeChange('end_date')}
          className="w-full"
          placeholder="Select end time"
          disabledDate={(current) => {
            const startDate = form.getFieldValue("start_date");
            return current && (
              current.isBefore(currentDateInTimeZone, 'day') ||
              (startDate && current.isBefore(startDate, 'day'))
            );
          }}
          showNow={false}
        />
      </Form.Item>
    </Card>
  );
}