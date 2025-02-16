import React, { useState, useEffect } from "react";
import { Row, Col } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";

const TimezoneClock = ({ timezone, eventDetails }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleString("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <Row align="middle" gutter={8}>
      <span
        style={{ fontSize: "15px", paddingLeft: "5px", fontWeight: "lighter" }}
      >
        {` (${
          eventDetails?.venue_events?.[0]?.venue?.place?.country?.name || ""
        } : ${timezone})`}
      </span>

      <Col>
        <ClockCircleOutlined />
      </Col>
      <Col>
        <span>{formatTime(currentTime)}</span>
      </Col>
    </Row>
  );
};

export default TimezoneClock;
