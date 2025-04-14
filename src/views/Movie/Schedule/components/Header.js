import React from "react";
import { Typography, Card, Radio, Tag } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import { setSelectedDate } from "store/slices/movieScheduleSlice";

const { Text } = Typography;

export default function ScheduleHeader() {
  const dispatch = useDispatch();
  const { dateRange, selectedDate } = useSelector(
    (state) => state.movieScheduleSlice
  );

  const renderDateTabs = () => {
    if (!dateRange || dateRange.length !== 2) {
      return (
        <div>
          <Tag icon={<CalendarOutlined />} color="warning">
            Please select a date range in Schedule Details
          </Tag>
        </div>
      );
    }

    const dates = [];
    let currentDate = dayjs(dateRange[0]);
    const endDate = dayjs(dateRange[1]);

    while (currentDate.unix() <= endDate.unix()) {
      dates.push(dayjs(currentDate));
      currentDate = currentDate.add(1, "day");
    }

    const daysCount = dates.length;

    return (
      <div>
        <div className="flex items-center mb-2">
          <CalendarOutlined className="mr-2" />
          <Text type="secondary">
            {daysCount} {daysCount === 1 ? "day" : "days"} selected (
            {dateRange[0].format("MMM D")} -{" "}
            {dateRange[1].format("MMM D, YYYY")})
          </Text>
        </div>

        <Radio.Group
          value={selectedDate ? selectedDate.format("YYYY-MM-DD") : null}
          onChange={(e) => dispatch(setSelectedDate(dayjs(e.target.value)))}
          buttonStyle="solid"
          className="w-full flex"
        >
          {dates.map((date) => (
            <Radio.Button
              key={date.format("YYYY-MM-DD")}
              value={date.format("YYYY-MM-DD")}
              className="flex-1 text-center"
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {date.format("ddd, MMM D")}
            </Radio.Button>
          ))}
        </Radio.Group>
      </div>
    );
  };

  return (
    <header>
      <Card className="mb-4" title="Schedule Date">
        {renderDateTabs()}
      </Card>
    </header>
  );
}
