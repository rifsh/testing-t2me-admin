import React from "react";
import { Form, Select, TimePicker, InputNumber, Typography } from "antd";
import dayjs from "dayjs";

const { Option } = Select;
const { Text } = Typography;

export default function ScheduleForm({
  movies,
  screens,
  selectedMovieId,
  selectedTime,
  selectedScreen,
  intervalTime,
  setSelectedMovieId,
  setSelectedTime,
  setSelectedScreen,
  setIntervalTime,
  selectedDate,
}) {
  const handleTimeChange = (time) => {
    setSelectedTime(time);
  };

  const format = "h:mm A";

  return (
    <Form layout="vertical">
      {selectedDate && (
        <div className="mb-4">
          <Text type="secondary">
            Scheduling for:{" "}
            <strong>{selectedDate.format("dddd, MMMM D, YYYY")}</strong>
          </Text>
        </div>
      )}

      <Form.Item label="Movie" required>
        <Select
          placeholder="Select a movie"
          value={selectedMovieId}
          onChange={setSelectedMovieId}
          style={{ width: "100%" }}
        >
          {movies.map((movie) => (
            <Option key={movie.id} value={movie.id}>
              {movie.title} ({movie.duration} min)
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="Screen" required>
        <Select
          placeholder="Select a screen"
          value={selectedScreen !== null ? selectedScreen : undefined}
          onChange={setSelectedScreen}
          style={{ width: "100%" }}
        >
          {screens.map((screen, index) => (
            <Option key={index} value={index}>
              {screen}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="Start Time" required>
        <TimePicker
          value={selectedTime}
          onChange={handleTimeChange}
          format={format}
          minuteStep={5}
          style={{ width: "100%" }}
          use12Hours
        />
      </Form.Item>

      <Form.Item
        label="Interval After Movie (minutes)"
        tooltip="Time reserved for cleaning and preparation between movies"
      >
        <InputNumber
          min={0}
          max={60}
          step={5}
          value={intervalTime}
          onChange={setIntervalTime}
          style={{ width: "100%" }}
        />
      </Form.Item>

      {selectedMovieId && (
        <Form.Item label="Selected Movie Details">
          <div>
            {movies
              .filter((movie) => movie.id === selectedMovieId)
              .map((movie) => (
                <div key={movie.id}>
                  <Text>Title: {movie.title}</Text>
                  <br />
                  <Text>Duration: {movie.duration} minutes</Text>
                  <br />
                  <Text>
                    Total Time: {movie.duration + intervalTime} minutes
                    (including {intervalTime} min interval)
                  </Text>
                </div>
              ))}
          </div>
        </Form.Item>
      )}
    </Form>
  );
}
