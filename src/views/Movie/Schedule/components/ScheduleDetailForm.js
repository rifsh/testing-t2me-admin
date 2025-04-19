import React, { useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  DatePicker,
  Alert,
  Button,
  Space,
  Select,
} from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import PlaceWithCountryForm from "components/util-components/FormItems/PlaceWithCountryForm";
import VenueListForm from "components/util-components/FormItems/VenueList";
import { getVenues, setSelectedVenue } from "store/slices/locationSlice";
import { useDispatch, useSelector } from "react-redux";
import { fetchScreenData } from "store/slices/screenSlice";
import {
  setavailableMovies,
  setDateRange,
  setDateRangeLength,
  setSelectedDate,
  setShowLengthOptions,
} from "store/slices/movieScheduleSlice";
import TheaterListForm from "components/util-components/FormItems/TheaterListForm";
import dayjs from "dayjs";
import { fetchMoviesData } from "store/slices/movieSlice";
import { extractMovies, formatMinutes } from "./utils";

function ScheduleDetailForm({ form, mode }) {
  const dispatch = useDispatch();

  const { dateRange, dateRangeLength, showLengthOptions, availableMovies } =
    useSelector((state) => state.movieScheduleSlice);
  const { response } = useSelector((state) => state.screen);
  const startDate = dateRange && dateRange[0] ? dayjs(dateRange[0]) : null;
  const endDate = dateRange && dateRange[1] ? dayjs(dateRange[1]) : null;

  const handlePlaceSelect = (id) => {
    dispatch(getVenues({ place_id: id, is_indoor: true }));
    form.setFieldValue("venue_id", undefined);
    form.setFieldValue("theatre_id", undefined);
  };

  const handleVenueSelect = (venue) => {
    form.setFieldValue("theatre_id", undefined);
    dispatch(setSelectedVenue(venue));
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

  const handleMovieSelect = (selectedMovieIds) => {
    if (!allMovies) return;

    const selectedMovies = allMovies.filter((movie) =>
      selectedMovieIds.includes(movie.id)
    );
    dispatch(setavailableMovies(selectedMovies));
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
    movies: [{ required: true, message: "Please select at least one movie" }],
  };

  const { movieResponse } = useSelector((state) => state.movie);

  useEffect(() => {
    if (!movieResponse) {
      dispatch(fetchMoviesData({ page: 1, size: 100 }));
    }

    if (!form.getFieldValue("movies")) {
      form.setFieldsValue({ movies: [] });
    }
  }, [dispatch, movieResponse, form]);

  const allMovies = extractMovies(movieResponse);

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={17} style={{ minHeight: "70vh" }}>
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
            <Col xs={24} sm={12}>
              <TheaterListForm
                rules={[{ required: true }]}
                form={form}
                onSelect={handleTheatreSelect}
              />
              {response && response.items && response.items.length <= 0 && (
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
                name="movie"
                label="Movies"
                rules={rules.movies}
                // style={{ }}
              >
                <Select
                  style={{ minHeight: "40px", width: "100%", padding: "0px" }}
                  placeholder="Select movies"
                  onChange={handleMovieSelect}
                  mode="multiple"
                  allowClear
                  options={
                    allMovies?.map((movie) => ({
                      value: movie.id,
                      label: movie.title,
                    })) || []
                  }
                />
              </Form.Item>
              <Form.Item name="movies" hidden />
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
      <Col xs={24} sm={24} md={7}>
        <Card title="Selected Movies">
          <div
            className="space-y-2"
            style={{ overflow: "auto", maxHeight: "70vh" }}
          >
            {availableMovies.length > 0 ? (
              availableMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="p-3 rounded-xl border cursor-move flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {movie.image && (
                      <img
                        src={movie.image}
                        alt={movie.title}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div>
                      <div className="font-medium">{movie.title}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <ClockCircleOutlined />
                        {formatMinutes(movie.duration)}
                      </div>
                    </div>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: movie.color }}
                  ></div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 p-4">
                Select movies to display them here
              </div>
            )}
          </div>
        </Card>
      </Col>
    </Row>
  );
}

export default ScheduleDetailForm;
