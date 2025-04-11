import React from "react";
import { Button, Typography, Space, Divider, Tag } from "antd";
import { DeleteOutlined, ClockCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const MovieDetails = ({ movie, formatTime, screens, onClose, onDelete }) => {
  if (!movie) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <div className="flex items-center justify-center mb-4">
          {movie.image ? (
            <img
              src={movie.image}
              alt={movie.title}
              className="w-32 h-auto rounded shadow-md"
            />
          ) : (
            <div className="w-32 h-48 bg-gray-200 rounded flex items-center justify-center">
              <Text type="secondary">No image</Text>
            </div>
          )}
        </div>

        <Title level={4} className="mt-2">
          {movie.title}
        </Title>

        <Space direction="vertical" className="w-full mb-4">
          <div className="flex justify-between items-center">
            <Text strong>Director:</Text>
            <Text>{movie.director}</Text>
          </div>
          <div className="flex justify-between items-center">
            <Text strong>Genre:</Text>
            <Tag color="blue">{movie.genre}</Tag>
          </div>
          <div className="flex justify-between items-center">
            <Text strong>Duration:</Text>
            <Text>{movie.duration} minutes</Text>
          </div>
        </Space>

        <Divider className="my-3" />

        <Title level={5} className="mb-2">
          <ClockCircleOutlined className="mr-2" />
          Scheduled Time
        </Title>

        <Space direction="vertical" className="w-full mb-4">
          <div className="flex justify-between items-center">
            <Text strong>Screen:</Text>
            <Text>{screens[movie.screen]}</Text>
          </div>
          <div className="flex justify-between items-center">
            <Text strong>Start Time:</Text>
            <Text>{formatTime(movie.startTime)}</Text>
          </div>
          <div className="flex justify-between items-center">
            <Text strong>End Time:</Text>
            <Text>{formatTime(movie.endTime)}</Text>
          </div>
        </Space>
      </div>

      <div className="mt-6">
        <Button
          danger
          type="primary"
          icon={<DeleteOutlined />}
          onClick={() => onDelete(movie.id)}
          block
        >
          Remove from Schedule
        </Button>
      </div>
    </div>
  );
};

export default MovieDetails;
