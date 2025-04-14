import React from 'react';
import { Typography, Space, Select, TimePicker, InputNumber } from 'antd';
import dayjs from 'dayjs';
import ScreenSelector from './ScreenSelector';

const { Text } = Typography;
const { Option } = Select;

const ScheduleForm = ({
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
}) => {
  return (
    <Space direction="vertical" style={{ width: "100%" }} size="large">
      <div>
        <Text strong>Screen:</Text>
        <ScreenSelector 
          screens={screens}
          selectedScreen={selectedScreen}
          onScreenChange={setSelectedScreen}
        />
      </div>

      <div>
        <Text strong>Start Time:</Text>
        <TimePicker
          style={{ width: "100%", marginTop: 8 }}
          format="HH:mm"
          value={selectedTime}
          onChange={setSelectedTime}
          minuteStep={5}
          use12Hours={false}
        />
      </div>

      <div>
        <Text strong>Movie:</Text>
        <Select
          style={{ width: "100%", marginTop: 8 }}
          placeholder="Select a movie"
          value={selectedMovieId}
          onChange={setSelectedMovieId}
        >
          {movies.map((movie) => (
            <Option key={movie.id} value={movie.id}>
              {movie.title} ({movie.duration} min)
            </Option>
          ))}
        </Select>
      </div>

      <div>
        <Text strong>Interval Time (minutes):</Text>
        <InputNumber
          style={{ width: "100%", marginTop: 8 }}
          min={0}
          max={60}
          value={intervalTime}
          onChange={(value) => setIntervalTime(value)}
        />
        <Text type="secondary" className="mt-1 block">
          Time between movies for breaks and setup
        </Text>
      </div>

      {selectedMovieId && (
        <div>
          <Text type="secondary">
            Duration: {movies.find((m) => m.id === selectedMovieId)?.duration} minutes
          </Text>
          <Text type="secondary" className="block">
            Total Time: {movies.find((m) => m.id === selectedMovieId)?.duration + intervalTime} minutes
            (including {intervalTime} min interval)
          </Text>
        </div>
      )}
    </Space>
  );
};

export default ScheduleForm;