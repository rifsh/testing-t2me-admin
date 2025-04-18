import React, { useState } from "react";
import { Row, Col, Card, Form, DatePicker, Alert, Button, Space } from "antd";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import VenueListForm from "components/util-components/FormItems/VenueList";
import {
  getSingleVenues,
  getVenues,
  setSelectedPlace,
  setSelectedVenue,
  setSelectedVenueList,
} from "store/slices/locationSlice";
import { resetTicketSelection } from "store/slices/ticketSlice";
import { useDispatch, useSelector } from "react-redux";
import { fetchScreenData } from "store/slices/screenSlice";
import {
  setDateRange,
  setDateRangeLength,
  setSelectedDate,
  setShowLengthOptions,
} from "store/slices/movieScheduleSlice";
import TheaterListForm from "components/util-components/FormItems/TheaterListForm";
import dayjs from "dayjs";

function ScheduleDetailForm({ form, mode }) {
  const dispatch = useDispatch();

  const { dateRange, selectedDate, dateRangeLength, showLengthOptions } =
    useSelector((state) => state.movieScheduleSlice);
  const { response } = useSelector((state) => state.screen);
  const startDate = dateRange && dateRange[0] ? dayjs(dateRange[0]) : null;
  const endDate = dateRange && dateRange[1] ? dayjs(dateRange[1]) : null;
  const handlePlaceSelect = (id) => {
    dispatch(getVenues({ place_id: id, is_indoor: true }));
    form.setFieldValue("venue_id", undefined);
    form.setFieldValue("screen_id", undefined);
    dispatch(resetTicketSelection());
    dispatch(setSelectedPlace(id));
    dispatch(setSelectedVenueList("clear"));
    form.resetFields("venue_id");
  };

  const handleVenueSelect = (venue) => {
    form.setFieldValue("theatre_id", undefined);
    dispatch(setSelectedVenue(venue));
    dispatch(getSingleVenues(venue));
  };

  const handleTheatreSelect = (theatre) => {
    if (theatre && theatre.id) {
      dispatch(fetchScreenData({ theatre_id: theatre.id }));
    }
  };
  const handleStartDateChange = (date) => {
    if (!date) {
      dispatch(setDateRange([]));
      dispatch(setSelectedDate(null));
      dispatch(setShowLengthOptions(false));
      form.setFieldsValue({ end_date: null });
      return;
    }

    dispatch(setShowLengthOptions(true));

    const newEndDate = date.add(dateRangeLength - 1, "day");
    form.setFieldsValue({ end_date: newEndDate });

    dispatch(setDateRange([date, newEndDate]));
    dispatch(setSelectedDate(date));
  };

  const handleEndDateChange = (date) => {
    if (!date || !startDate) return;

    const maxAllowedEndDate = startDate.add(7, "day");

    if (date.isAfter(maxAllowedEndDate)) {
      form.setFieldsValue({ end_date: maxAllowedEndDate });
      dispatch(setDateRangeLength(7));
      dispatch(setDateRange([startDate, maxAllowedEndDate]));
      return;
    }

    if (date.isBefore(startDate)) {
      form.setFieldsValue({ end_date: startDate });
      dispatch(setDateRangeLength(1));
      dispatch(setDateRange([startDate, startDate]));
      return;
    }

    const newRangeLength = date.diff(startDate, "day") + 1;
    dispatch(setDateRangeLength(newRangeLength));
    dispatch(setDateRange([startDate, date]));
  };

  const handleDayLengthChange = (days) => {
    if (!startDate || days < 1 || days > 7) return;

    dispatch(setDateRangeLength(days));
    const newEndDate = startDate.add(days - 1, "day");
    form.setFieldsValue({ end_date: newEndDate });
    dispatch(setDateRange([startDate, newEndDate]));
  };

  const disabledStartDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  const disabledEndDate = (current) => {
    if (!startDate || !current) return true;

    return (
      current.isBefore(startDate) || current.isAfter(startDate.add(6, "day"))
    );
  };

  const rules = {
    place: [{ required: true, message: "Please select a place" }],
    venue: [{ required: true, message: "Please select a venue" }],
    startDate: [{ required: true, message: "Please select a start date" }],
    endDate: [{ required: true, message: "Please select an end date" }],
  };

  const renderDayOptions = () => {
    if (!showLengthOptions || !startDate) return null;

    return (
      <Form.Item label="Number of Days">
        <Space>
          {[1, 2, 3, 4, 5, 6, 7].map((days) => (
            <Button
              key={days}
              type={dateRangeLength === days ? "primary" : "default"}
              onClick={() => handleDayLengthChange(days)}
            >
              {days} {days === 1 ? "day" : "days"}
            </Button>
          ))}
        </Space>
      </Form.Item>
    );
  };

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17}>
        <Card title="Schedule Details">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <PlaceWithCountryForm
                form={form}
                label="Choose a Place"
                onSelect={handlePlaceSelect}
                rules={rules.place}
              />
            </Col>
            <Col xs={24} sm={12}>
              <VenueListForm
                form={form}
                mode={"single"}
                label="Venue"
                rules={rules.venue}
                onSelect={(value) => handleVenueSelect(value)}
              />
            </Col>
            <Col span={24}>
              <TheaterListForm
                rules={[{ required: true }]}
                form={form}
                onSelect={handleTheatreSelect}
              />
              {response && response.items.length <= 0 && (
                <Alert
                  message="No screens found for this theater"
                  description="Please select a different theater that has configured screens to continue with scheduling."
                  type="warning"
                  showIcon
                  className="mb-4"
                />
              )}
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Start Date"
                name="start_date"
                rules={rules.startDate}
                tooltip="Select the first day of your schedule"
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabledDate={disabledStartDate}
                  value={startDate}
                  onChange={handleStartDateChange}
                  placeholder="Select start date"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="End Date"
                name="end_date"
                rules={rules.endDate}
                tooltip="Maximum 7 days from start date"
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabledDate={disabledEndDate}
                  value={endDate}
                  onChange={handleEndDateChange}
                  placeholder="Select end date"
                  disabled={!startDate}
                />
              </Form.Item>
            </Col>
            <Col span={24}>{renderDayOptions()}</Col>
            <Col span={24}>
              {startDate &&
                endDate &&
                endDate.diff(startDate, "day") + 1 === 7 && (
                  <Alert
                    message="You've selected the maximum of 7 days"
                    type="info"
                    showIcon
                    className="mb-4"
                  />
                )}
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}

export default ScheduleDetailForm;
